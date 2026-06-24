#![no_std]
//! Halo verifier (Day-3 MVP).
//!
//! Verifies a BN254 Groth16 proof from `halo.circom` on-chain against an embedded
//! verification key, binds the proof to the calling Stellar address, enforces a
//! per-scope nullifier (one-person-one-action / Sybil resistance), records an
//! attestation, and exposes `is_verified`.
//!
//! Public-signal layout (Vec<U256>, length 7), matching the circuit:
//!   [0] nullifier  [1] root  [2] scope  [3] minBirthYear
//!   [4] requireAccredited  [5] bannedCountry  [6] addr

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bn254::{Bn254G1Affine, Bn254G2Affine, Fr},
    symbol_short, vec, Address, Bytes, Env, U256, Vec,
};

mod vk;
#[cfg(test)]
mod test;

#[derive(Clone)]
#[contracttype]
pub struct VerificationKey {
    pub alpha: Bn254G1Affine,
    pub beta: Bn254G2Affine,
    pub gamma: Bn254G2Affine,
    pub delta: Bn254G2Affine,
    pub ic: Vec<Bn254G1Affine>,
}

#[derive(Clone)]
#[contracttype]
pub struct Proof {
    pub a: Bn254G1Affine,
    pub b: Bn254G2Affine,
    pub c: Bn254G1Affine,
}

#[contracttype]
pub enum DataKey {
    Admin,
    IssuerRoot,
    Nullifier(U256, U256), // (scope, nullifier)
    Attestation(Address, U256), // (caller, scope) -> ledger sequence
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    BadSignals = 3,
    AddrMismatch = 4,
    RootMismatch = 5,
    NullifierUsed = 6,
    InvalidProof = 7,
}

const BUMP_THRESHOLD: u32 = 100_000;
const BUMP_EXTEND: u32 = 1_000_000;

#[contract]
pub struct HaloVerifier;

#[contractimpl]
impl HaloVerifier {
    /// One-time init: store the admin (who may set the trusted issuer root).
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        let store = env.storage().instance();
        if store.has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        store.set(&DataKey::Admin, &admin);
        store.extend_ttl(BUMP_THRESHOLD, BUMP_EXTEND);
        Ok(())
    }

    /// Admin-only: register/replace the trusted issuer Merkle root (the trust anchor).
    pub fn set_issuer_root(env: Env, root: U256) -> Result<(), Error> {
        let store = env.storage().instance();
        let admin: Address = store.get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        store.set(&DataKey::IssuerRoot, &root);
        store.extend_ttl(BUMP_THRESHOLD, BUMP_EXTEND);
        Ok(())
    }

    /// Verify a Halo proof and record an attestation bound to `caller`.
    /// Reverts on: wrong addr binding, wrong root, reused nullifier, or invalid proof.
    pub fn verify(
        env: Env,
        caller: Address,
        proof: Proof,
        public_signals: Vec<U256>,
    ) -> Result<(), Error> {
        caller.require_auth();
        if public_signals.len() != 7 {
            return Err(Error::BadSignals);
        }
        let nullifier = public_signals.get(0).unwrap();
        let root = public_signals.get(1).unwrap();
        let scope = public_signals.get(2).unwrap();
        let addr = public_signals.get(6).unwrap();

        // 1) Anti-replay: the proof's bound address must match the caller.
        let expected = addr_field(&env, &caller);
        if Fr::from_u256(addr) != Fr::from_u256(expected) {
            return Err(Error::AddrMismatch);
        }

        // 2) Trust anchor: the proof's root must be the registered issuer root.
        let store = env.storage().instance();
        let stored_root: U256 = store.get(&DataKey::IssuerRoot).ok_or(Error::NotInitialized)?;
        if root != stored_root {
            return Err(Error::RootMismatch);
        }

        // 3) Sybil resistance: reject a reused (scope, nullifier).
        let nk = DataKey::Nullifier(scope.clone(), nullifier);
        let persistent = env.storage().persistent();
        if persistent.has(&nk) {
            return Err(Error::NullifierUsed);
        }

        // 4) Cryptographic check against the embedded verification key.
        let mut pub_fr: Vec<Fr> = Vec::new(&env);
        for s in public_signals.iter() {
            pub_fr.push_back(Fr::from_u256(s));
        }
        if !groth16_verify(&env, &vk::verification_key(&env), &proof, &pub_fr) {
            return Err(Error::InvalidProof);
        }

        // 5) Commit: mark nullifier used, store attestation, emit event.
        persistent.set(&nk, &true);
        persistent.extend_ttl(&nk, BUMP_THRESHOLD, BUMP_EXTEND);
        let ak = DataKey::Attestation(caller.clone(), scope.clone());
        persistent.set(&ak, &env.ledger().sequence());
        persistent.extend_ttl(&ak, BUMP_THRESHOLD, BUMP_EXTEND);
        env.events()
            .publish((symbol_short!("halo"), symbol_short!("verified")), (caller, scope));
        Ok(())
    }

    /// True if `who` holds an attestation for `scope` (used by gating dApps).
    pub fn is_verified(env: Env, who: Address, scope: U256) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Attestation(who, scope))
    }

    /// The ledger at which `who` was attested for `scope`, if any.
    pub fn attested_at(env: Env, who: Address, scope: U256) -> Option<u32> {
        env.storage()
            .persistent()
            .get(&DataKey::Attestation(who, scope))
    }
}

/// addr = U256(sha256(utf8(caller's G-strkey))). Compared mod r against the
/// circuit's public `addr` signal via `Fr::from_u256`.
fn addr_field(env: &Env, caller: &Address) -> U256 {
    let s = caller.to_string();
    let len = s.len() as usize;
    let mut buf = [0u8; 56];
    s.copy_into_slice(&mut buf[..len]);
    let bytes = Bytes::from_slice(env, &buf[..len]);
    let mut hb = [0u8; 32];
    env.crypto().sha256(&bytes).to_bytes().copy_into_slice(&mut hb);
    U256::from_be_bytes(env, &Bytes::from_array(env, &hb))
}

/// Generic Groth16 verify over BN254 (reused from the Day-1 verifier):
/// vk_x = ic[0] + Σ pubᵢ·ic[i+1];  accept ⇔ e(-A,B)·e(α,β)·e(vk_x,γ)·e(C,δ) == 1.
fn groth16_verify(env: &Env, vk: &VerificationKey, proof: &Proof, pub_signals: &Vec<Fr>) -> bool {
    if pub_signals.len() + 1 != vk.ic.len() {
        return false;
    }
    let bn = env.crypto().bn254();
    let mut vk_x = vk.ic.get(0).unwrap();
    for (s, v) in pub_signals.iter().zip(vk.ic.iter().skip(1)) {
        let prod = bn.g1_mul(&v, &s);
        vk_x = bn.g1_add(&vk_x, &prod);
    }
    let neg_a = -proof.a.clone();
    let vp1 = vec![env, neg_a, vk.alpha.clone(), vk_x, proof.c.clone()];
    let vp2 = vec![env, proof.b.clone(), vk.beta.clone(), vk.gamma.clone(), vk.delta.clone()];
    bn.pairing_check(vp1, vp2)
}
