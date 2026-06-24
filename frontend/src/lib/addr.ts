// addr = sha256(utf8(strkey)) reduced mod r — matches the contract's caller binding.
const R = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

export async function addressToField(gAddress: string): Promise<bigint> {
  const data = new TextEncoder().encode(gAddress);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt("0x" + hex) % R;
}
