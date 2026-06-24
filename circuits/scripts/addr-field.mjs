// Shared address -> BN254 field-element derivation for the addr<->caller binding.
//
//   addr = sha256(utf8(strkey "G...")) reduced mod r   (r = BN254 scalar field order)
//
// The contract reproduces this from `caller.to_string()` (the same G-strkey) via
// sha256 + Fr::from_u256 (which reduces mod r). Hashing the ASCII strkey avoids any
// XDR-format ambiguity between off-chain JS and on-chain Rust.
import { createHash } from "node:crypto";

export const R = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

/** @param {string} gAddress Stellar public strkey, e.g. "G..." */
export function addressToField(gAddress) {
  const digest = createHash("sha256").update(Buffer.from(gAddress, "utf8")).digest();
  return (BigInt("0x" + digest.toString("hex")) % R);
}

// CLI: node addr-field.mjs G...   -> prints the field element (decimal)
if (process.argv[2]) {
  console.log(addressToField(process.argv[2]).toString());
}
