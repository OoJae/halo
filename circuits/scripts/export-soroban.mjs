// Convert snarkjs Groth16 artifacts (BN254) into the byte/JSON form the Soroban
// BN254 verifier expects. This is the single canonical encoder — reused by the
// on-chain invoker and documented in docs/architecture.md.
//
//   G1  (BytesN<64>)  = x_be(32) || y_be(32)
//   G2  (BytesN<128>) = x.c1_be(32) || x.c0_be(32) || y.c1_be(32) || y.c0_be(32)
//                       (imaginary part c1 first — EIP-197 ordering)
//   snarkjs JSON gives an Fp2 element as [c0, c1], so we read [1]=c1 then [0]=c0.
//   public signal -> U256 decimal string.
//
// Usage: node export-soroban.mjs [buildDir]   (default: build)
import fs from "node:fs";

const dir = process.argv[2] || "build";
const vkj = JSON.parse(fs.readFileSync(`${dir}/verification_key.json`, "utf8"));
const pj = JSON.parse(fs.readFileSync(`${dir}/proof.json`, "utf8"));
const pubj = JSON.parse(fs.readFileSync(`${dir}/public.json`, "utf8"));

const be32 = (dec) => {
  const h = BigInt(dec).toString(16);
  if (h.length > 64) throw new Error(`field element exceeds 32 bytes: ${dec}`);
  return h.padStart(64, "0");
};
const g1 = (p) => be32(p[0]) + be32(p[1]); // x || y
const g2 = (p) => be32(p[0][1]) + be32(p[0][0]) + be32(p[1][1]) + be32(p[1][0]); // xc1 xc0 yc1 yc0

const vk = {
  alpha: g1(vkj.vk_alpha_1),
  beta: g2(vkj.vk_beta_2),
  gamma: g2(vkj.vk_gamma_2),
  delta: g2(vkj.vk_delta_2),
  ic: vkj.IC.map(g1),
};
const proof = { a: g1(pj.pi_a), b: g2(pj.pi_b), c: g1(pj.pi_c) };
const pub_signals = pubj.map((x) => x.toString());

fs.mkdirSync(`${dir}/soroban`, { recursive: true });
fs.writeFileSync(`${dir}/soroban/vk.json`, JSON.stringify(vk));
fs.writeFileSync(`${dir}/soroban/proof.json`, JSON.stringify(proof));
fs.writeFileSync(`${dir}/soroban/public.json`, JSON.stringify(pub_signals));

console.log("wrote", `${dir}/soroban/{vk,proof,public}.json`);
console.log("nPublic:", pub_signals.length, "| IC points:", vk.ic.length);
