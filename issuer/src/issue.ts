// Mock issuer: build a fixed-depth-16 Poseidon Merkle tree over demo credentials,
// publish the root, and emit each holder's credential bundle (private attributes +
// Merkle path + bound address) for the prover. NOTHING here touches a real KYC
// provider — the issuer is the trusted party that vouches for attributes once.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hash, addressToField } from "./poseidon.js";
import { FixedMerkleTree } from "./merkle.js";

const DEPTH = 16;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "out");

// Demo holders. holderA is accredited; holderB is NOT (so the test harness can
// isolate the accreditation predicate from the membership check).
// NOTE: these `secret` values are FIXED (low-entropy) on purpose, so the published Merkle root
// is reproducible and the committed demo credential matches the deployed verifier. A real issuer
// MUST draw each holder's secret from a CSPRNG (256-bit, reduced mod r) — never hardcode or commit
// holder secrets. The demo credential is a deliberately-shared public artifact, not a real secret.
const HOLDERS = [
  { name: "holderA", birthYear: 2000n, country: 840n, accredited: 1n, secret: 8675309000000001n },
  { name: "holderB", birthYear: 1995n, country: 840n, accredited: 0n, secret: 8675309000000002n },
];

// Sample Stellar address bound into the proofs (our Day-1 deployer identity).
const SAMPLE_ADDR = "GC3ATO6LRJY7T5TN2AE6DJLAMT2JCVLMGI6IXAVPMD5OVGH5ODBQWYLQ";

async function main() {
  const tree = new FixedMerkleTree(DEPTH);

  const records: { name: string; birthYear: bigint; country: bigint; accredited: bigint; secret: bigint; index: number; leaf: bigint }[] = [];
  for (const h of HOLDERS) {
    const leaf = await hash([h.birthYear, h.country, h.accredited, h.secret]);
    const index = await tree.insert(leaf);
    records.push({ ...h, leaf, index });
  }

  const root = await tree.root();
  const addr = await addressToField(SAMPLE_ADDR);

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(
    path.join(OUT, "root.json"),
    JSON.stringify({ root: root.toString(), depth: DEPTH, addr: addr.toString() }, null, 2),
  );

  for (const r of records) {
    const pf = await tree.proof(r.index);
    if (pf.root !== root) throw new Error(`proof root mismatch for ${r.name}`);
    const bundle = {
      name: r.name,
      // private credential
      birthYear: r.birthYear.toString(),
      country: r.country.toString(),
      accredited: r.accredited.toString(),
      secret: r.secret.toString(),
      pathElements: pf.pathElements.map(String),
      pathIndices: pf.pathIndices,
      // public context
      root: root.toString(),
      addr: addr.toString(),
      leafIndex: r.index,
    };
    fs.writeFileSync(path.join(OUT, `${r.name}.json`), JSON.stringify(bundle, null, 2));
    console.log(`issued ${r.name}: leaf=${r.leaf} index=${r.index}`);
  }

  console.log("root:", root.toString());
  console.log("addr field:", addr.toString());
  console.log("wrote bundles to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
