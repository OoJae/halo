// Poseidon hashing for the issuer, using circomlibjs (same iden3 implementation
// as circomlib's poseidon.circom — verified to match the in-circuit hash).
import { buildPoseidon } from "circomlibjs";
import { createHash } from "node:crypto";

// BN254 scalar field order.
const R = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

type Hashable = bigint | number | string;

let _poseidon: any = null;
async function getPoseidon() {
  if (!_poseidon) _poseidon = await buildPoseidon();
  return _poseidon;
}

/** Poseidon hash of an array of field elements -> bigint. */
export async function hash(inputs: Hashable[]): Promise<bigint> {
  const p = await getPoseidon();
  const out = p(inputs.map((x) => BigInt(x)));
  return BigInt(p.F.toString(out));
}

/**
 * Map a Stellar G... address to a single BN254 field element as
 * sha256(utf8(strkey)) reduced mod r. The contract reproduces this from
 * `caller.to_string()` (same G-strkey) via sha256 + Fr::from_u256. Hashing the
 * ASCII strkey avoids XDR-format ambiguity between JS and the contract.
 * (Kept async for call-site compatibility.)
 */
export async function addressToField(gAddress: string): Promise<bigint> {
  const digest = createHash("sha256").update(Buffer.from(gAddress, "utf8")).digest();
  return BigInt("0x" + digest.toString("hex")) % R;
}
