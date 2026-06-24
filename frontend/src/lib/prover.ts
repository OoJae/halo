// In-browser Groth16 proving + encoding to the contract's Proof/Vec<U256> args.
// Mirrors circuits/scripts/export-soroban.mjs (G1=64B x‖y, G2=128B c1‖c0).
import * as snarkjs from "snarkjs";
import { Buffer } from "buffer";
import { addressToField } from "./addr";
import type { Proof } from "../bindings/halo-verifier/src";

export interface Credential {
  birthYear: string;
  country: string;
  accredited: string;
  secret: string;
  pathElements: string[];
  pathIndices: number[];
  root: string;
}

export interface Gate {
  scope: string;
  minBirthYear: string;
  requireAccredited: string;
  bannedCountry: string;
}

export interface ProveResult {
  proof: Proof; // { a, b, c } as Buffers, ready for the bindings
  publicSignals: string[]; // decimal strings [nullifier, root, scope, ...]
  nullifier: string;
  publicSignalsBig: bigint[];
}

const be32 = (dec: string): string => {
  const h = BigInt(dec).toString(16);
  if (h.length > 64) throw new Error("field element exceeds 32 bytes");
  return h.padStart(64, "0");
};
const g1hex = (p: string[]): string => be32(p[0]) + be32(p[1]); // x ‖ y
const g2hex = (p: string[][]): string =>
  be32(p[0][1]) + be32(p[0][0]) + be32(p[1][1]) + be32(p[1][0]); // x.c1 ‖ x.c0 ‖ y.c1 ‖ y.c0
const buf = (hex: string): Buffer => Buffer.from(hex, "hex");

export async function proveHalo(
  cred: Credential,
  gate: Gate,
  walletAddress: string,
): Promise<ProveResult> {
  const addr = (await addressToField(walletAddress)).toString();
  const input = {
    birthYear: cred.birthYear,
    country: cred.country,
    accredited: cred.accredited,
    secret: cred.secret,
    pathElements: cred.pathElements,
    pathIndices: cred.pathIndices,
    root: cred.root,
    scope: gate.scope,
    minBirthYear: gate.minBirthYear,
    requireAccredited: gate.requireAccredited,
    bannedCountry: gate.bannedCountry,
    addr,
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "/halo.wasm",
    "/halo_final.zkey",
  );

  return {
    proof: {
      a: buf(g1hex(proof.pi_a)),
      b: buf(g2hex(proof.pi_b)),
      c: buf(g1hex(proof.pi_c)),
    },
    publicSignals,
    nullifier: publicSignals[0],
    publicSignalsBig: publicSignals.map((s: string) => BigInt(s)),
  };
}
