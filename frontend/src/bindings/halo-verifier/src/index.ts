import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBXEUMNLBWQEGQDEVFTFD5ZCBZYWVJ2WAW2LLOIVF3Z7YCMPKG2ZNYY6",
  }
} as const

export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"BadSignals"},
  4: {message:"AddrMismatch"},
  5: {message:"RootMismatch"},
  6: {message:"NullifierUsed"},
  7: {message:"InvalidProof"}
}


export interface Proof {
  a: Buffer;
  b: Buffer;
  c: Buffer;
}

export type DataKey = {tag: "Admin", values: void} | {tag: "IssuerRoot", values: void} | {tag: "Nullifier", values: readonly [u256, u256]} | {tag: "Attestation", values: readonly [string, u256]};


export interface VerificationKey {
  alpha: Buffer;
  beta: Buffer;
  delta: Buffer;
  gamma: Buffer;
  ic: Array<Buffer>;
}

export interface Client {
  /**
   * Construct and simulate a verify transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Verify a Halo proof and record an attestation bound to `caller`.
   * Reverts on: wrong addr binding, wrong root, reused nullifier, or invalid proof.
   */
  verify: ({caller, proof, public_signals}: {caller: string, proof: Proof, public_signals: Array<u256>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * One-time init: store the admin (who may set the trusted issuer root).
   */
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a attested_at transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The ledger at which `who` was attested for `scope`, if any.
   */
  attested_at: ({who, scope}: {who: string, scope: u256}, options?: MethodOptions) => Promise<AssembledTransaction<Option<u32>>>

  /**
   * Construct and simulate a is_verified transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * True if `who` holds an attestation for `scope` (used by gating dApps).
   */
  is_verified: ({who, scope}: {who: string, scope: u256}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a set_issuer_root transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin-only: register/replace the trusted issuer Merkle root (the trust anchor).
   */
  set_issuer_root: ({root}: {root: u256}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAKQmFkU2lnbmFscwAAAAAAAwAAAAAAAAAMQWRkck1pc21hdGNoAAAABAAAAAAAAAAMUm9vdE1pc21hdGNoAAAABQAAAAAAAAANTnVsbGlmaWVyVXNlZAAAAAAAAAYAAAAAAAAADEludmFsaWRQcm9vZgAAAAc=",
        "AAAAAQAAAAAAAAAAAAAABVByb29mAAAAAAAAAwAAAAAAAAABYQAAAAAAA+4AAABAAAAAAAAAAAFiAAAAAAAD7gAAAIAAAAAAAAAAAWMAAAAAAAPuAAAAQA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAKSXNzdWVyUm9vdAAAAAAAAQAAAAAAAAAJTnVsbGlmaWVyAAAAAAAAAgAAAAwAAAAMAAAAAQAAAAAAAAALQXR0ZXN0YXRpb24AAAAAAgAAABMAAAAM",
        "AAAAAAAAAJBWZXJpZnkgYSBIYWxvIHByb29mIGFuZCByZWNvcmQgYW4gYXR0ZXN0YXRpb24gYm91bmQgdG8gYGNhbGxlcmAuClJldmVydHMgb246IHdyb25nIGFkZHIgYmluZGluZywgd3Jvbmcgcm9vdCwgcmV1c2VkIG51bGxpZmllciwgb3IgaW52YWxpZCBwcm9vZi4AAAAGdmVyaWZ5AAAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABXByb29mAAAAAAAH0AAAAAVQcm9vZgAAAAAAAAAAAAAOcHVibGljX3NpZ25hbHMAAAAAA+oAAAAMAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAQAAAAAAAAAAAAAAD1ZlcmlmaWNhdGlvbktleQAAAAAFAAAAAAAAAAVhbHBoYQAAAAAAA+4AAABAAAAAAAAAAARiZXRhAAAD7gAAAIAAAAAAAAAABWRlbHRhAAAAAAAD7gAAAIAAAAAAAAAABWdhbW1hAAAAAAAD7gAAAIAAAAAAAAAAAmljAAAAAAPqAAAD7gAAAEA=",
        "AAAAAAAAAEVPbmUtdGltZSBpbml0OiBzdG9yZSB0aGUgYWRtaW4gKHdobyBtYXkgc2V0IHRoZSB0cnVzdGVkIGlzc3VlciByb290KS4AAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAADtUaGUgbGVkZ2VyIGF0IHdoaWNoIGB3aG9gIHdhcyBhdHRlc3RlZCBmb3IgYHNjb3BlYCwgaWYgYW55LgAAAAALYXR0ZXN0ZWRfYXQAAAAAAgAAAAAAAAADd2hvAAAAABMAAAAAAAAABXNjb3BlAAAAAAAADAAAAAEAAAPoAAAABA==",
        "AAAAAAAAAEZUcnVlIGlmIGB3aG9gIGhvbGRzIGFuIGF0dGVzdGF0aW9uIGZvciBgc2NvcGVgICh1c2VkIGJ5IGdhdGluZyBkQXBwcykuAAAAAAALaXNfdmVyaWZpZWQAAAAAAgAAAAAAAAADd2hvAAAAABMAAAAAAAAABXNjb3BlAAAAAAAADAAAAAEAAAAB",
        "AAAAAAAAAE9BZG1pbi1vbmx5OiByZWdpc3Rlci9yZXBsYWNlIHRoZSB0cnVzdGVkIGlzc3VlciBNZXJrbGUgcm9vdCAodGhlIHRydXN0IGFuY2hvcikuAAAAAA9zZXRfaXNzdWVyX3Jvb3QAAAAAAQAAAAAAAAAEcm9vdAAAAAwAAAABAAAD6QAAAAIAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    verify: this.txFromJSON<Result<void>>,
        initialize: this.txFromJSON<Result<void>>,
        attested_at: this.txFromJSON<Option<u32>>,
        is_verified: this.txFromJSON<boolean>,
        set_issuer_root: this.txFromJSON<Result<void>>
  }
}