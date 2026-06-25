#![cfg(test)]
extern crate std;

use ark_ff::{BigInteger, PrimeField};
use core::str::FromStr;
use soroban_sdk::{
    crypto::bn254::{Bn254G1Affine, Bn254G2Affine},
    Address, Bytes, Env, String, U256, Vec,
};
use std::vec::Vec as StdVec;

use crate::{Error, HaloVerifier, HaloVerifierClient, Proof};

// The funded Day-1 testnet identity used as the bound caller in the proof.
const DEPLOYER: &str = "GC3ATO6LRJY7T5TN2AE6DJLAMT2JCVLMGI6IXAVPMD5OVGH5ODBQWYLQ";
// sha256(utf8(DEPLOYER)) — the un-reduced bytes the contract should hash to.
const DEPLOYER_SHA256: [u8; 32] = [
    0x66, 0x09, 0x08, 0x94, 0xde, 0x6e, 0xb6, 0x06, 0xfc, 0xfa, 0x38, 0x74, 0x50, 0x9d, 0x4f, 0xf3,
    0x05, 0xcb, 0xc0, 0x59, 0x91, 0xdb, 0xa0, 0xa6, 0x24, 0xfc, 0x19, 0x25, 0xae, 0x19, 0x21, 0x24,
];

const PROOF_JSON: &str = include_str!("../data/proof.json");
const PUBLIC_JSON: &str = include_str!("../data/public.json");

fn hex_to_vec(h: &str) -> StdVec<u8> {
    (0..h.len()).step_by(2).map(|i| u8::from_str_radix(&h[i..i + 2], 16).unwrap()).collect()
}
fn g1(env: &Env, h: &str) -> Bn254G1Affine {
    let mut a = [0u8; 64];
    a.copy_from_slice(&hex_to_vec(h));
    Bn254G1Affine::from_array(env, &a)
}
fn g2(env: &Env, h: &str) -> Bn254G2Affine {
    let mut a = [0u8; 128];
    a.copy_from_slice(&hex_to_vec(h));
    Bn254G2Affine::from_array(env, &a)
}
fn u256_dec(env: &Env, s: &str) -> U256 {
    let f = ark_bn254::Fr::from_str(s).unwrap();
    let be = f.into_bigint().to_bytes_be();
    let mut a = [0u8; 32];
    a[32 - be.len()..].copy_from_slice(&be);
    U256::from_be_bytes(env, &Bytes::from_array(env, &a))
}

fn load_proof(env: &Env) -> Proof {
    let v: serde_json::Value = serde_json::from_str(PROOF_JSON).unwrap();
    Proof {
        a: g1(env, v["a"].as_str().unwrap()),
        b: g2(env, v["b"].as_str().unwrap()),
        c: g1(env, v["c"].as_str().unwrap()),
    }
}
fn load_signals(env: &Env) -> Vec<U256> {
    let v: serde_json::Value = serde_json::from_str(PUBLIC_JSON).unwrap();
    let mut out = Vec::new(env);
    for s in v.as_array().unwrap() {
        out.push_back(u256_dec(env, s.as_str().unwrap()));
    }
    out
}
fn deployer(env: &Env) -> Address {
    Address::from_string(&String::from_str(env, DEPLOYER))
}

#[test]
fn addr_binding_matches_offchain() {
    // The contract must hash the same strkey bytes as the off-chain prover.
    let env = Env::default();
    let got = crate::addr_field(&env, &deployer(&env));
    let want = U256::from_be_bytes(&env, &Bytes::from_array(&env, &DEPLOYER_SHA256));
    assert_eq!(got, want, "contract sha256(strkey) must equal the off-chain value");
}

fn setup(env: &Env) -> (HaloVerifierClient<'_>, Address, Vec<U256>, Proof) {
    env.mock_all_auths();
    let admin = deployer(env);
    let client = HaloVerifierClient::new(env, &env.register(HaloVerifier {}, ()));
    let signals = load_signals(env);
    client.initialize(&admin);
    client.set_issuer_root(&signals.get(1).unwrap()); // root = public[1]
    (client, admin, signals, load_proof(env))
}

#[test]
fn valid_proof_verifies_and_stores_attestation() {
    let env = Env::default();
    let (client, caller, signals, proof) = setup(&env);
    let scope = signals.get(2).unwrap();

    client.verify(&caller, &proof, &signals); // panics on Err
    assert!(client.is_verified(&caller, &scope));
    assert!(client.attested_at(&caller, &scope).is_some());
}

#[test]
fn duplicate_nullifier_reverts() {
    let env = Env::default();
    let (client, caller, signals, proof) = setup(&env);

    client.verify(&caller, &proof, &signals); // first ok
    // Same proof again -> reused nullifier -> revert with NullifierUsed.
    assert_eq!(
        client.try_verify(&caller, &proof, &signals),
        Err(Ok(Error::NullifierUsed.into()))
    );
}

#[test]
fn tampered_signal_is_rejected() {
    let env = Env::default();
    let (client, caller, signals, proof) = setup(&env);
    // Flip minBirthYear (index 3): proof no longer satisfies the public input -> invalid.
    let mut bad = Vec::new(&env);
    for (i, s) in signals.iter().enumerate() {
        bad.push_back(if i == 3 { u256_dec(&env, "1990") } else { s });
    }
    match client.try_verify(&caller, &proof, &bad) {
        Ok(Ok(())) => panic!("tampered public signal must be rejected"),
        _ => {}
    }
}

#[test]
fn policy_match_ok() {
    let env = Env::default();
    let (client, caller, signals, proof) = setup(&env);
    let scope = signals.get(2).unwrap();
    // Register exactly the policy the proof carries (2008/1/643) -> verify passes.
    client.set_policy(&scope, &u256_dec(&env, "2008"), &u256_dec(&env, "1"), &u256_dec(&env, "643"));
    client.verify(&caller, &proof, &signals);
    assert!(client.is_verified(&caller, &scope));
}

#[test]
fn policy_mismatch_rejected() {
    let env = Env::default();
    let (client, caller, signals, proof) = setup(&env);
    let scope = signals.get(2).unwrap();
    // Register a DIFFERENT policy (minBirthYear 1990) -> the proof's 2008 is rejected.
    client.set_policy(&scope, &u256_dec(&env, "1990"), &u256_dec(&env, "1"), &u256_dec(&env, "643"));
    assert_eq!(
        client.try_verify(&caller, &proof, &signals),
        Err(Ok(Error::PolicyMismatch.into()))
    );
}

#[test]
fn is_verified_for_checks_proven_policy() {
    let env = Env::default();
    let (client, caller, signals, proof) = setup(&env);
    let scope = signals.get(2).unwrap();
    client.verify(&caller, &proof, &signals); // proves policy 2008/1/643 (scope unregistered → free-form)
    // a gate requiring exactly what was proven -> true
    assert!(client.is_verified_for(&caller, &scope, &u256_dec(&env, "2008"), &u256_dec(&env, "1"), &u256_dec(&env, "643")));
    // a gate requiring a DIFFERENT (stricter) policy than was proven -> false: a trivial-policy
    // attestation can't satisfy a real-policy gate, even on an unregistered scope.
    assert!(!client.is_verified_for(&caller, &scope, &u256_dec(&env, "1990"), &u256_dec(&env, "1"), &u256_dec(&env, "643")));
    assert!(client.is_verified(&caller, &scope)); // bare existence still true
}

#[test]
fn double_initialize_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let client = HaloVerifierClient::new(&env, &env.register(HaloVerifier {}, ()));
    client.initialize(&deployer(&env));
    assert_eq!(
        client.try_initialize(&deployer(&env)),
        Err(Ok(Error::AlreadyInitialized.into()))
    );
}
