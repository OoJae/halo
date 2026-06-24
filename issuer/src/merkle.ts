// Fixed-depth binary Merkle tree with Poseidon(2) nodes, matching the circuit's
// MerkleInclusion template. Empty subtrees collapse to precomputed per-level zero
// hashes, so a sparse tree (a few real leaves) is cheap to build and prove.
//
// Convention (must match halo.circom):
//   pathIndices[i] == 0  => the current node is the LEFT child at level i
//   pathIndices[i] == 1  => the current node is the RIGHT child at level i
import { hash } from "./poseidon.js";

export interface MerkleProof {
  root: bigint;
  leaf: bigint;
  pathElements: bigint[];
  pathIndices: number[];
}

export class FixedMerkleTree {
  readonly depth: number;
  private zeros: bigint[] = [];
  private leaves: bigint[] = [];
  private readyPromise: Promise<void>;

  constructor(depth: number) {
    this.depth = depth;
    this.readyPromise = this.initZeros();
  }

  private async initZeros() {
    let z = 0n;
    this.zeros = [z];
    for (let i = 0; i < this.depth; i++) {
      z = await hash([z, z]);
      this.zeros.push(z);
    }
  }

  async ready() {
    await this.readyPromise;
  }

  async insert(leaf: bigint): Promise<number> {
    await this.ready();
    this.leaves.push(leaf);
    return this.leaves.length - 1;
  }

  // Node value at (level, index). Subtrees with no real leaves collapse to zeros[level].
  private async nodeAt(level: number, index: number): Promise<bigint> {
    const subtreeStart = index * 2 ** level;
    if (subtreeStart >= this.leaves.length) return this.zeros[level];
    if (level === 0) return this.leaves[index];
    const left = await this.nodeAt(level - 1, 2 * index);
    const right = await this.nodeAt(level - 1, 2 * index + 1);
    return hash([left, right]);
  }

  async root(): Promise<bigint> {
    await this.ready();
    return this.nodeAt(this.depth, 0);
  }

  async proof(index: number): Promise<MerkleProof> {
    await this.ready();
    const pathElements: bigint[] = [];
    const pathIndices: number[] = [];
    let idx = index;
    for (let level = 0; level < this.depth; level++) {
      const isRight = idx & 1; // 1 => current node is the right child
      const siblingIndex = isRight ? idx - 1 : idx + 1;
      pathElements.push(await this.nodeAt(level, siblingIndex));
      pathIndices.push(isRight);
      idx = Math.floor(idx / 2);
    }
    return { root: await this.root(), leaf: this.leaves[index], pathElements, pathIndices };
  }
}
