#![cfg(test)]
//! Soundness smoke test for the BN254 Groth16 verifier, driven directly by the
//! snarkjs artifacts in `data/` (our trivial a*b=c circuit: a=3, b=11, c=33 public).
//!
//! This encodes the exact snarkjs JSON -> Soroban BN254 byte recipe we will reuse:
//!   * G1 (64B): x_be(32) || y_be(32)
//!   * G2 (128B): x.c1(32) || x.c0(32) || y.c1(32) || y.c0(32)   <-- imaginary part first
//!   * snarkjs JSON gives G2 Fp2 as [c0, c1], so we read [0]=c0, [1]=c1 and emit c1 first
//!   * public signal: Fr value
extern crate std;

use ark_bn254::{Fq, Fq2};
use ark_ff::{BigInteger, PrimeField};
use core::str::FromStr;
use soroban_sdk::{
    crypto::bn254::{
        Bn254G1Affine, Bn254G2Affine, Fr, BN254_G1_SERIALIZED_SIZE, BN254_G2_SERIALIZED_SIZE,
    },
    Env, Vec, U256,
};

use crate::{Groth16Verifier, Groth16VerifierClient, Proof, VerificationKey};

const VK_JSON: &str = include_str!("../data/verification_key.json");
const PROOF_JSON: &str = include_str!("../data/proof.json");
const PUBLIC_JSON: &str = include_str!("../data/public.json");

fn fq_be(fq: &Fq) -> [u8; 32] {
    let bytes = fq.into_bigint().to_bytes_be();
    let mut out = [0u8; 32];
    out[32 - bytes.len()..].copy_from_slice(&bytes);
    out
}

fn g1(env: &Env, x: &str, y: &str) -> Bn254G1Affine {
    let p = ark_bn254::G1Affine::new(Fq::from_str(x).unwrap(), Fq::from_str(y).unwrap());
    let mut buf = [0u8; BN254_G1_SERIALIZED_SIZE];
    buf[..32].copy_from_slice(&fq_be(&p.x));
    buf[32..].copy_from_slice(&fq_be(&p.y));
    Bn254G1Affine::from_array(env, &buf)
}

// snarkjs G2 JSON layout is [[x_c0, x_c1], [y_c0, y_c1]].
fn g2(env: &Env, x_c0: &str, x_c1: &str, y_c0: &str, y_c1: &str) -> Bn254G2Affine {
    let x = Fq2::new(Fq::from_str(x_c0).unwrap(), Fq::from_str(x_c1).unwrap());
    let y = Fq2::new(Fq::from_str(y_c0).unwrap(), Fq::from_str(y_c1).unwrap());
    let p = ark_bn254::G2Affine::new(x, y);
    let mut buf = [0u8; BN254_G2_SERIALIZED_SIZE];
    buf[0..32].copy_from_slice(&fq_be(&p.x.c1)); // imaginary part first
    buf[32..64].copy_from_slice(&fq_be(&p.x.c0));
    buf[64..96].copy_from_slice(&fq_be(&p.y.c1));
    buf[96..128].copy_from_slice(&fq_be(&p.y.c0));
    Bn254G2Affine::from_array(env, &buf)
}

fn s(v: &serde_json::Value) -> &str {
    v.as_str().unwrap()
}

fn build_vk(env: &Env) -> VerificationKey {
    let v: serde_json::Value = serde_json::from_str(VK_JSON).unwrap();
    let a = &v["vk_alpha_1"];
    let b = &v["vk_beta_2"];
    let g = &v["vk_gamma_2"];
    let d = &v["vk_delta_2"];
    let mut ic = Vec::new(env);
    for p in v["IC"].as_array().unwrap() {
        ic.push_back(g1(env, s(&p[0]), s(&p[1])));
    }
    VerificationKey {
        alpha: g1(env, s(&a[0]), s(&a[1])),
        beta: g2(env, s(&b[0][0]), s(&b[0][1]), s(&b[1][0]), s(&b[1][1])),
        gamma: g2(env, s(&g[0][0]), s(&g[0][1]), s(&g[1][0]), s(&g[1][1])),
        delta: g2(env, s(&d[0][0]), s(&d[0][1]), s(&d[1][0]), s(&d[1][1])),
        ic,
    }
}

fn build_proof(env: &Env) -> Proof {
    let p: serde_json::Value = serde_json::from_str(PROOF_JSON).unwrap();
    let a = &p["pi_a"];
    let b = &p["pi_b"];
    let c = &p["pi_c"];
    Proof {
        a: g1(env, s(&a[0]), s(&a[1])),
        b: g2(env, s(&b[0][0]), s(&b[0][1]), s(&b[1][0]), s(&b[1][1])),
        c: g1(env, s(&c[0]), s(&c[1])),
    }
}

// Trivial circuit: public signals fit in u32. (General large-Fr encoding lives in
// circuits/scripts/export-soroban.mjs and is documented in docs/architecture.md.)
fn fr_u32(env: &Env, v: u32) -> Fr {
    Fr::from_u256(U256::from_u32(env, v))
}

fn public_from_json(env: &Env) -> Vec<Fr> {
    let arr: serde_json::Value = serde_json::from_str(PUBLIC_JSON).unwrap();
    let mut out = Vec::new(env);
    for sig in arr.as_array().unwrap() {
        out.push_back(fr_u32(env, s(sig).parse::<u32>().unwrap()));
    }
    out
}

fn client(env: &Env) -> Groth16VerifierClient<'_> {
    Groth16VerifierClient::new(env, &env.register(Groth16Verifier {}, ()))
}

#[test]
fn valid_proof_verifies() {
    let env = Env::default();
    let c = client(&env);
    let res = c.verify_proof(&build_vk(&env), &build_proof(&env), &public_from_json(&env));
    assert_eq!(res, true, "valid proof must verify");
}

#[test]
fn tampered_public_signal_rejected() {
    let env = Env::default();
    let c = client(&env);
    // Our real public output is 33; claim 34 instead -> must fail.
    let mut bad = Vec::new(&env);
    bad.push_back(fr_u32(&env, 34));
    let res = c.verify_proof(&build_vk(&env), &build_proof(&env), &bad);
    assert_eq!(res, false, "wrong public signal must be rejected");
}
