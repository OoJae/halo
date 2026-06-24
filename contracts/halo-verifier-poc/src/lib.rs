#![no_std]
//! Day-1 de-risk: a generic Groth16 verifier over **BN254**.
//!
//! Hand-ported from the merged on-main `stellar/soroban-examples/groth16_verifier`
//! (which is BLS12-381) by swapping the curve module `crypto::bls12_381` ->
//! `crypto::bn254` and the point types `G1Affine`/`G2Affine`/`Fr` -> their `Bn254*`
//! equivalents. The structs, the `vk_x = ic[0] + Σ pubᵢ·ic[i+1]` input folding, and
//! the pairing arrangement `e(-A,B)·e(α,β)·e(vk_x,γ)·e(C,δ) == 1` are unchanged.
//! Cross-checked byte-for-byte against PR #399 (jayz22 add-bn254-groth16).
//!
//! For Task 1 the VK + proof + public signals are passed as call arguments (lowest
//! risk, matches the proven example). The real Halo verifier (Day 3) embeds the VK
//! and adds the nullifier set + attestation logic on top of this same verify core.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bn254::{Bn254G1Affine, Bn254G2Affine, Fr},
    vec, Env, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Groth16Error {
    MalformedVerifyingKey = 0,
}

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

#[contract]
pub struct Groth16Verifier;

#[contractimpl]
impl Groth16Verifier {
    pub fn verify_proof(
        env: Env,
        vk: VerificationKey,
        proof: Proof,
        pub_signals: Vec<Fr>,
    ) -> Result<bool, Groth16Error> {
        let bn = env.crypto().bn254();

        // Fold public signals into vk_x = ic[0] + Σ pub_signals[i] * ic[i+1].
        if pub_signals.len() + 1 != vk.ic.len() {
            return Err(Groth16Error::MalformedVerifyingKey);
        }
        let mut vk_x = vk.ic.get(0).unwrap();
        for (s, v) in pub_signals.iter().zip(vk.ic.iter().skip(1)) {
            let prod = bn.g1_mul(&v, &s);
            vk_x = bn.g1_add(&vk_x, &prod);
        }

        // Groth16 check: e(-A, B) * e(alpha, beta) * e(vk_x, gamma) * e(C, delta) == 1
        let neg_a = -proof.a;
        let vp1 = vec![&env, neg_a, vk.alpha, vk_x, proof.c];
        let vp2 = vec![&env, proof.b, vk.beta, vk.gamma, vk.delta];

        Ok(bn.pairing_check(vp1, vp2))
    }
}

mod test;
