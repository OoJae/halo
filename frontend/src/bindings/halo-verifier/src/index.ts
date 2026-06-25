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
    contractId: "CCPNP4O6LOVYTDWX3MWXJRFI74A6ORMS3WHW6OIX2OQM2ZFIFRNEDNSV",
  }
} as const

export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"BadSignals"},
  4: {message:"AddrMismatch"},
  5: {message:"RootMismatch"},
  6: {message:"NullifierUsed"},
  7: {message:"InvalidProof"},
  8: {message:"PolicyMismatch"}
}


export interface Proof {
  a: Buffer;
  b: Buffer;
  c: Buffer;
}


/**
 * Required eligibility policy a scope's proofs must satisfy (public signals 3..5).
 */
export interface Policy {
  banned_country: u256;
  min_birth_year: u256;
  require_accredited: u256;
}

export type DataKey = {tag: "Admin", values: void} | {tag: "IssuerRoot", values: void} | {tag: "Policy", values: readonly [u256]} | {tag: "Nullifier", values: readonly [u256, u256]} | {tag: "Attestation", values: readonly [string, u256]};


/**
 * An attestation records the ledger AND the exact policy the proof satisfied, so a gating
 * dApp can verify *what* was proven (via `is_verified_for`), not merely *that* something was.
 */
export interface Attestation {
  banned_country: u256;
  ledger: u32;
  min_birth_year: u256;
  require_accredited: u256;
}


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
   * Construct and simulate a get_policy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The policy bound to a scope, if any.
   */
  get_policy: ({scope}: {scope: u256}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Policy>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * One-time init: store the admin (who may set the trusted issuer root).
   */
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_policy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin-only: bind a required eligibility policy to a `scope`. Once set, `verify`
   * enforces that proofs for this scope carry exactly these public policy params, so a
   * prover cannot satisfy a gate with a self-chosen trivial policy. Scopes with no
   * registered policy accept any policy (free-form attestation).
   */
  set_policy: ({scope, min_birth_year, require_accredited, banned_country}: {scope: u256, min_birth_year: u256, require_accredited: u256, banned_country: u256}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a attested_at transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The ledger at which `who` was attested for `scope`, if any.
   */
  attested_at: ({who, scope}: {who: string, scope: u256}, options?: MethodOptions) => Promise<AssembledTransaction<Option<u32>>>

  /**
   * Construct and simulate a is_verified transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * True if `who` holds any attestation for `scope`.
   */
  is_verified: ({who, scope}: {who: string, scope: u256}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a is_verified_for transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * True if `who` holds an attestation for `scope` that satisfied EXACTLY this policy. Gating
   * dApps should use this (not `is_verified`) so a gate can't be satisfied with a trivial,
   * prover-chosen policy — even on scopes with no registered policy.
   */
  is_verified_for: ({who, scope, min_birth_year, require_accredited, banned_country}: {who: string, scope: u256, min_birth_year: u256, require_accredited: u256, banned_country: u256}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

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
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAKQmFkU2lnbmFscwAAAAAAAwAAAAAAAAAMQWRkck1pc21hdGNoAAAABAAAAAAAAAAMUm9vdE1pc21hdGNoAAAABQAAAAAAAAANTnVsbGlmaWVyVXNlZAAAAAAAAAYAAAAAAAAADEludmFsaWRQcm9vZgAAAAcAAAAAAAAADlBvbGljeU1pc21hdGNoAAAAAAAI",
        "AAAAAQAAAAAAAAAAAAAABVByb29mAAAAAAAAAwAAAAAAAAABYQAAAAAAA+4AAABAAAAAAAAAAAFiAAAAAAAD7gAAAIAAAAAAAAAAAWMAAAAAAAPuAAAAQA==",
        "AAAAAQAAAFBSZXF1aXJlZCBlbGlnaWJpbGl0eSBwb2xpY3kgYSBzY29wZSdzIHByb29mcyBtdXN0IHNhdGlzZnkgKHB1YmxpYyBzaWduYWxzIDMuLjUpLgAAAAAAAAAGUG9saWN5AAAAAAADAAAAAAAAAA5iYW5uZWRfY291bnRyeQAAAAAADAAAAAAAAAAObWluX2JpcnRoX3llYXIAAAAAAAwAAAAAAAAAEnJlcXVpcmVfYWNjcmVkaXRlZAAAAAAADA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAKSXNzdWVyUm9vdAAAAAAAAQAAAAAAAAAGUG9saWN5AAAAAAABAAAADAAAAAEAAAAAAAAACU51bGxpZmllcgAAAAAAAAIAAAAMAAAADAAAAAEAAAAAAAAAC0F0dGVzdGF0aW9uAAAAAAIAAAATAAAADA==",
        "AAAAAQAAALNBbiBhdHRlc3RhdGlvbiByZWNvcmRzIHRoZSBsZWRnZXIgQU5EIHRoZSBleGFjdCBwb2xpY3kgdGhlIHByb29mIHNhdGlzZmllZCwgc28gYSBnYXRpbmcKZEFwcCBjYW4gdmVyaWZ5ICp3aGF0KiB3YXMgcHJvdmVuICh2aWEgYGlzX3ZlcmlmaWVkX2ZvcmApLCBub3QgbWVyZWx5ICp0aGF0KiBzb21ldGhpbmcgd2FzLgAAAAAAAAAAC0F0dGVzdGF0aW9uAAAAAAQAAAAAAAAADmJhbm5lZF9jb3VudHJ5AAAAAAAMAAAAAAAAAAZsZWRnZXIAAAAAAAQAAAAAAAAADm1pbl9iaXJ0aF95ZWFyAAAAAAAMAAAAAAAAABJyZXF1aXJlX2FjY3JlZGl0ZWQAAAAAAAw=",
        "AAAAAAAAAJBWZXJpZnkgYSBIYWxvIHByb29mIGFuZCByZWNvcmQgYW4gYXR0ZXN0YXRpb24gYm91bmQgdG8gYGNhbGxlcmAuClJldmVydHMgb246IHdyb25nIGFkZHIgYmluZGluZywgd3Jvbmcgcm9vdCwgcmV1c2VkIG51bGxpZmllciwgb3IgaW52YWxpZCBwcm9vZi4AAAAGdmVyaWZ5AAAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABXByb29mAAAAAAAH0AAAAAVQcm9vZgAAAAAAAAAAAAAOcHVibGljX3NpZ25hbHMAAAAAA+oAAAAMAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAQAAAAAAAAAAAAAAD1ZlcmlmaWNhdGlvbktleQAAAAAFAAAAAAAAAAVhbHBoYQAAAAAAA+4AAABAAAAAAAAAAARiZXRhAAAD7gAAAIAAAAAAAAAABWRlbHRhAAAAAAAD7gAAAIAAAAAAAAAABWdhbW1hAAAAAAAD7gAAAIAAAAAAAAAAAmljAAAAAAPqAAAD7gAAAEA=",
        "AAAAAAAAACRUaGUgcG9saWN5IGJvdW5kIHRvIGEgc2NvcGUsIGlmIGFueS4AAAAKZ2V0X3BvbGljeQAAAAAAAQAAAAAAAAAFc2NvcGUAAAAAAAAMAAAAAQAAA+gAAAfQAAAABlBvbGljeQAA",
        "AAAAAAAAAEVPbmUtdGltZSBpbml0OiBzdG9yZSB0aGUgYWRtaW4gKHdobyBtYXkgc2V0IHRoZSB0cnVzdGVkIGlzc3VlciByb290KS4AAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAS5BZG1pbi1vbmx5OiBiaW5kIGEgcmVxdWlyZWQgZWxpZ2liaWxpdHkgcG9saWN5IHRvIGEgYHNjb3BlYC4gT25jZSBzZXQsIGB2ZXJpZnlgCmVuZm9yY2VzIHRoYXQgcHJvb2ZzIGZvciB0aGlzIHNjb3BlIGNhcnJ5IGV4YWN0bHkgdGhlc2UgcHVibGljIHBvbGljeSBwYXJhbXMsIHNvIGEKcHJvdmVyIGNhbm5vdCBzYXRpc2Z5IGEgZ2F0ZSB3aXRoIGEgc2VsZi1jaG9zZW4gdHJpdmlhbCBwb2xpY3kuIFNjb3BlcyB3aXRoIG5vCnJlZ2lzdGVyZWQgcG9saWN5IGFjY2VwdCBhbnkgcG9saWN5IChmcmVlLWZvcm0gYXR0ZXN0YXRpb24pLgAAAAAACnNldF9wb2xpY3kAAAAAAAQAAAAAAAAABXNjb3BlAAAAAAAADAAAAAAAAAAObWluX2JpcnRoX3llYXIAAAAAAAwAAAAAAAAAEnJlcXVpcmVfYWNjcmVkaXRlZAAAAAAADAAAAAAAAAAOYmFubmVkX2NvdW50cnkAAAAAAAwAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAADtUaGUgbGVkZ2VyIGF0IHdoaWNoIGB3aG9gIHdhcyBhdHRlc3RlZCBmb3IgYHNjb3BlYCwgaWYgYW55LgAAAAALYXR0ZXN0ZWRfYXQAAAAAAgAAAAAAAAADd2hvAAAAABMAAAAAAAAABXNjb3BlAAAAAAAADAAAAAEAAAPoAAAABA==",
        "AAAAAAAAADBUcnVlIGlmIGB3aG9gIGhvbGRzIGFueSBhdHRlc3RhdGlvbiBmb3IgYHNjb3BlYC4AAAALaXNfdmVyaWZpZWQAAAAAAgAAAAAAAAADd2hvAAAAABMAAAAAAAAABXNjb3BlAAAAAAAADAAAAAEAAAAB",
        "AAAAAAAAAPNUcnVlIGlmIGB3aG9gIGhvbGRzIGFuIGF0dGVzdGF0aW9uIGZvciBgc2NvcGVgIHRoYXQgc2F0aXNmaWVkIEVYQUNUTFkgdGhpcyBwb2xpY3kuIEdhdGluZwpkQXBwcyBzaG91bGQgdXNlIHRoaXMgKG5vdCBgaXNfdmVyaWZpZWRgKSBzbyBhIGdhdGUgY2FuJ3QgYmUgc2F0aXNmaWVkIHdpdGggYSB0cml2aWFsLApwcm92ZXItY2hvc2VuIHBvbGljeSDigJQgZXZlbiBvbiBzY29wZXMgd2l0aCBubyByZWdpc3RlcmVkIHBvbGljeS4AAAAAD2lzX3ZlcmlmaWVkX2ZvcgAAAAAFAAAAAAAAAAN3aG8AAAAAEwAAAAAAAAAFc2NvcGUAAAAAAAAMAAAAAAAAAA5taW5fYmlydGhfeWVhcgAAAAAADAAAAAAAAAAScmVxdWlyZV9hY2NyZWRpdGVkAAAAAAAMAAAAAAAAAA5iYW5uZWRfY291bnRyeQAAAAAADAAAAAEAAAAB",
        "AAAAAAAAAE9BZG1pbi1vbmx5OiByZWdpc3Rlci9yZXBsYWNlIHRoZSB0cnVzdGVkIGlzc3VlciBNZXJrbGUgcm9vdCAodGhlIHRydXN0IGFuY2hvcikuAAAAAA9zZXRfaXNzdWVyX3Jvb3QAAAAAAQAAAAAAAAAEcm9vdAAAAAwAAAABAAAD6QAAAAIAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    verify: this.txFromJSON<Result<void>>,
        get_policy: this.txFromJSON<Option<Policy>>,
        initialize: this.txFromJSON<Result<void>>,
        set_policy: this.txFromJSON<Result<void>>,
        attested_at: this.txFromJSON<Option<u32>>,
        is_verified: this.txFromJSON<boolean>,
        is_verified_for: this.txFromJSON<boolean>,
        set_issuer_root: this.txFromJSON<Result<void>>
  }
}