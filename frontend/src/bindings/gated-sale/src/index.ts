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
    contractId: "CAHEKPK57DXY3SGQGYA5KQBHSWW4IUMJQEYEZMBXA3G6SYHBVVWUUELJ",
  }
} as const

export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"NotVerified"}
}

export type DataKey = {tag: "Admin", values: void} | {tag: "Verifier", values: void} | {tag: "Scope", values: void} | {tag: "MinBirthYear", values: void} | {tag: "RequireAccredited", values: void} | {tag: "BannedCountry", values: void};

export interface Client {
  /**
   * Construct and simulate a buy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The gated action. Reverts unless the buyer is verified for the sale scope.
   */
  buy: ({buyer, amount}: {buyer: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a is_open transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * True if `who` is Halo-verified for the sale scope (delegates to the verifier).
   */
  is_open: ({who}: {who: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * One-time init: admin, the halo-verifier address, the sale scope, and the REQUIRED
   * eligibility policy. The sale gates on `is_verified_for(scope, policy)`, so it stays closed
   * unless the buyer proved exactly this policy — robust even if the verifier's scope registry
   * is unset.
   */
  initialize: ({admin, verifier, scope, min_birth_year, require_accredited, banned_country}: {admin: string, verifier: string, scope: u256, min_birth_year: u256, require_accredited: u256, banned_country: u256}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_verifier transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin-only: update the verifier contract address.
   */
  set_verifier: ({verifier}: {verifier: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

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
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAALTm90VmVyaWZpZWQAAAAAAw==",
        "AAAAAAAAAEpUaGUgZ2F0ZWQgYWN0aW9uLiBSZXZlcnRzIHVubGVzcyB0aGUgYnV5ZXIgaXMgdmVyaWZpZWQgZm9yIHRoZSBzYWxlIHNjb3BlLgAAAAAAA2J1eQAAAAACAAAAAAAAAAVidXllcgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAIVmVyaWZpZXIAAAAAAAAAAAAAAAVTY29wZQAAAAAAAAAAAAAAAAAADE1pbkJpcnRoWWVhcgAAAAAAAAAAAAAAEVJlcXVpcmVBY2NyZWRpdGVkAAAAAAAAAAAAAAAAAAANQmFubmVkQ291bnRyeQAAAA==",
        "AAAAAAAAAE5UcnVlIGlmIGB3aG9gIGlzIEhhbG8tdmVyaWZpZWQgZm9yIHRoZSBzYWxlIHNjb3BlIChkZWxlZ2F0ZXMgdG8gdGhlIHZlcmlmaWVyKS4AAAAAAAdpc19vcGVuAAAAAAEAAAAAAAAAA3dobwAAAAATAAAAAQAAAAE=",
        "AAAAAAAAARNPbmUtdGltZSBpbml0OiBhZG1pbiwgdGhlIGhhbG8tdmVyaWZpZXIgYWRkcmVzcywgdGhlIHNhbGUgc2NvcGUsIGFuZCB0aGUgUkVRVUlSRUQKZWxpZ2liaWxpdHkgcG9saWN5LiBUaGUgc2FsZSBnYXRlcyBvbiBgaXNfdmVyaWZpZWRfZm9yKHNjb3BlLCBwb2xpY3kpYCwgc28gaXQgc3RheXMgY2xvc2VkCnVubGVzcyB0aGUgYnV5ZXIgcHJvdmVkIGV4YWN0bHkgdGhpcyBwb2xpY3kg4oCUIHJvYnVzdCBldmVuIGlmIHRoZSB2ZXJpZmllcidzIHNjb3BlIHJlZ2lzdHJ5CmlzIHVuc2V0LgAAAAAKaW5pdGlhbGl6ZQAAAAAABgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAh2ZXJpZmllcgAAABMAAAAAAAAABXNjb3BlAAAAAAAADAAAAAAAAAAObWluX2JpcnRoX3llYXIAAAAAAAwAAAAAAAAAEnJlcXVpcmVfYWNjcmVkaXRlZAAAAAAADAAAAAAAAAAOYmFubmVkX2NvdW50cnkAAAAAAAwAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAADFBZG1pbi1vbmx5OiB1cGRhdGUgdGhlIHZlcmlmaWVyIGNvbnRyYWN0IGFkZHJlc3MuAAAAAAAADHNldF92ZXJpZmllcgAAAAEAAAAAAAAACHZlcmlmaWVyAAAAEwAAAAEAAAPpAAAAAgAAAAM=" ]),
      options
    )
  }
  public readonly fromJSON = {
    buy: this.txFromJSON<Result<i128>>,
        is_open: this.txFromJSON<boolean>,
        initialize: this.txFromJSON<Result<void>>,
        set_verifier: this.txFromJSON<Result<void>>
  }
}