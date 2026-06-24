// Generate an embedded verification key as Rust const byte arrays for the
// halo-verifier contract, from the Soroban-formatted VK (build/soroban/vk.json).
// Usage: node gen-vk-rust.mjs [buildDir] [outFile]
import fs from "node:fs";
import path from "node:path";

const buildDir = process.argv[2] || "build";
const outFile = process.argv[3] || path.resolve("../contracts/halo-verifier/src/vk.rs");
const vk = JSON.parse(fs.readFileSync(path.join(buildDir, "soroban", "vk.json"), "utf8"));

const toArr = (hex) => {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push("0x" + hex.slice(i, i + 2));
  return "[" + bytes.join(", ") + "]";
};

const ic = vk.ic.map(toArr);
const out = `// AUTO-GENERATED from circuits/build/soroban/vk.json by gen-vk-rust.mjs.
// Do not edit by hand; re-run the generator after changing the circuit.
#![allow(clippy::all)]
use soroban_sdk::{
    crypto::bn254::{Bn254G1Affine, Bn254G2Affine},
    Env, Vec,
};

use crate::VerificationKey;

const ALPHA: [u8; 64] = ${toArr(vk.alpha)};
const BETA: [u8; 128] = ${toArr(vk.beta)};
const GAMMA: [u8; 128] = ${toArr(vk.gamma)};
const DELTA: [u8; 128] = ${toArr(vk.delta)};
const IC: [[u8; 64]; ${vk.ic.length}] = [
    ${ic.join(",\n    ")},
];

/// The circuit's verification key, embedded at build time.
pub fn verification_key(env: &Env) -> VerificationKey {
    let mut ic = Vec::new(env);
    for p in IC.iter() {
        ic.push_back(Bn254G1Affine::from_array(env, p));
    }
    VerificationKey {
        alpha: Bn254G1Affine::from_array(env, &ALPHA),
        beta: Bn254G2Affine::from_array(env, &BETA),
        gamma: Bn254G2Affine::from_array(env, &GAMMA),
        delta: Bn254G2Affine::from_array(env, &DELTA),
        ic,
    }
}
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`wrote ${outFile} (IC points: ${vk.ic.length})`);
