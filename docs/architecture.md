# Halo — Architecture

Selective-disclosure identity credentials on Stellar: a holder proves, in zero knowledge, that an
issuer-vouched credential satisfies a gate's policy — verified on-chain by a Soroban contract with a
Sybil-resistant nullifier and an attestation bound to the caller's address.

## End-to-end flow

```
Circom 2 circuit (BN254)
  → snarkjs Groth16 (prebuilt Hermez ptau, phase-2 contribution)
  → proof.json / verification_key.json / public.json  (decimal field elements)
  → encode to bytes (G1 64B, G2 128B, Fr 32B)
  → halo-verifier (Soroban): env.crypto().bn254().pairing_check + nullifier + attestation
  → Stellar testnet
```

Issue once → hold privately → prove in-browser → verify on-chain → gate a dApp action.

## Actors & trust model

- **Issuer** (trusted to KYC once): commits `leaf = Poseidon(birthYear, country, accredited, secret)`
  into a Merkle tree and publishes the `root` on-chain via `set_issuer_root`. Trusted to check identity
  and maintain its tree; privacy holds against everyone *downstream* of issuance.
- **Holder**: receives the credential bundle (attributes + secret + Merkle path), stores it client-side,
  and generates proofs in the browser. PII never leaves the device.
- **Verifier dApp**: gates an action on a Halo proof (the demo ships a regulated token sale).
- **Auditor** (optional): can recover a chosen attribute via a view-key (demo tier).
- **Revocation**: issuer removes the leaf and republishes the root; old proofs stop verifying.

## The circuit — `circuits/halo.circom`, `Halo(depth = 16)`

- **Private:** `birthYear, country, accredited, secret, pathElements[16], pathIndices[16]`
- **Public:** `root, scope, minBirthYear, requireAccredited, bannedCountry, addr`
- **Public output:** `nullifier`
- **Proves:** (1) `Poseidon(birthYear,country,accredited,secret)` ∈ tree under `root` (own
  `MerkleInclusion(16)` template); (2) `birthYear ≤ minBirthYear` (`LessEqThan(16)`); (3)
  `accredited ≥ requireAccredited` (`GreaterEqThan(8)`); (4) `country ≠ bannedCountry` (`IsEqual`);
  (5) `nullifier = Poseidon(secret, scope)`; (6) `addrSq = addr·addr` (keeps the public `addr` constrained).
- **Soundness hardening:** `Num2Bits(16)` range-binds `birthYear`/`minBirthYear` (so `LessEqThan(16)` is
  sound) and `accredited`/`requireAccredited` are constrained boolean — the gates are correct independent
  of issuer well-formedness.
- **~4,525 non-linear constraints** → `powersOfTau28_hez_final_14.ptau` (16,384) is ample.
- Predicate violations make **witness generation throw** (an `=== 1`/`=== 0` assert fails) — the
  intended "fails" behavior.

**Public-signals order** (snarkjs writes outputs first, then declared public inputs), reused by the contract:
```
[0] nullifier  [1] root  [2] scope  [3] minBirthYear  [4] requireAccredited  [5] bannedCountry  [6] addr
```

**Merkle convention** (circuit and issuer agree): `pathIndices[i] == 0` ⇒ current node is the LEFT child
at level i; `== 1` ⇒ RIGHT. Per level: `hl = (sibling − cur)·idx; left = cur + hl; right = sibling − hl;
cur' = Poseidon(2)(left, right)`. The issuer (`issuer/`) builds the same tree with **circomlibjs**
Poseidon (verified equal to circomlib via the `poseidon([1,2])` vector).

## The contracts

### `halo-verifier` (`contracts/halo-verifier`)
```rust
initialize(admin)                                  // store admin (instance)
set_issuer_root(root: U256)                        // admin.require_auth(); store trusted root
set_policy(scope, minBirthYear, requireAccredited, bannedCountry)  // admin; bind a required policy to a scope
get_policy(scope) -> Option<Policy>
verify(caller, proof, public_signals: Vec<U256>)   // the core (below)
is_verified(who, scope) -> bool                    // attestation lookup (used by gating dApps)
attested_at(who, scope) -> Option<u32>             // ledger of the attestation
```
`verify` runs: `caller.require_auth()` → `addr` binding check → `root == stored` → **policy check (if a
policy is registered for `scope`, public signals 3–5 must equal it, else `PolicyMismatch`)** →
`(scope,nullifier)` unused → `groth16_verify(embedded VK, proof, signals)` → store nullifier +
attestation + emit `(halo, verified) = (caller, scope)`. Errors: `3 BadSignals, 4 AddrMismatch,
5 RootMismatch, 6 NullifierUsed, 7 InvalidProof, 8 PolicyMismatch`.

**Policy enforcement (H1):** without a registered policy a scope accepts any (prover-chosen) policy —
fine for the free-form "prove eligibility" demo (random scopes). The gated sale's `SALE_SCOPE` has a
registered policy `(2008, 1, 643)`, so unlocking it requires a proof that genuinely satisfies 18+ /
accredited / not-in-banned-region — a trivial policy reverts `PolicyMismatch`.

- **Embedded VK:** `circuits/scripts/gen-vk-rust.mjs` turns `verification_key.json` into `src/vk.rs`
  (const byte arrays); re-run after any circuit change.
- **Verify core:** `vk_x = ic[0] + Σ pubᵢ·ic[i+1]`; accept ⇔ `e(-A,B)·e(α,β)·e(vk_x,γ)·e(C,δ) == 1`
  via `env.crypto().bn254().pairing_check`. Hand-ported from the merged on-main `groth16_verifier`
  (BLS12-381 → BN254), cross-checked vs PR #399.
- **Storage:** `instance` for `Admin`, `IssuerRoot`, `Policy(scope)`; `persistent` keyed for
  `Nullifier(scope, nullifier)` and `Attestation(caller, scope)`, TTL-bumped ~2M ledgers (~115 days)
  per write. Indefinite nullifier persistence requires periodic re-bumping (a Soroban state-archival
  constraint); if a nullifier entry archives, the Sybil guarantee for that `(scope, nullifier)` lapses.

### `gated-sale` (`contracts/gated-sale`)
`initialize(admin, verifier, scope)`, `set_verifier(admin)`, `is_open(who)`, `buy(buyer, amount)` →
`buyer.require_auth()` + cross-contract `env.invoke_contract::<bool>(verifier, "is_verified", [who, SALE_SCOPE])`
else revert. `SALE_SCOPE = 424242`.

## The addr ↔ caller binding (anti-replay)

`addr = sha256(utf8(caller's G-strkey)) reduced mod r`. Off-chain (`circuits/scripts/addr-field.mjs`,
and `frontend/src/lib/addr.ts`): `BigInt(sha256(strkey)) % r`. On-chain: `caller.to_string()` → `sha256`
→ `U256::from_be_bytes` → compared to `public_signals[6]` via `Fr::from_u256` (both reduce mod r).
Hashing the ASCII strkey avoids XDR ambiguity; validated by `cargo test addr_binding_matches_offchain`
and by a browser-submitted tx whose `addr` signal matches the caller.

## The encoding spec (load-bearing — reuse verbatim)

All field elements are 32-byte **big-endian**, uncompressed, EIP-196/197 compatible.

| Element | Soroban type | Bytes | Layout |
|---|---|---|---|
| G1 (pi_a, pi_c, vk_alpha_1, each IC) | `BytesN<64>` | 64 | `x_be(32) ‖ y_be(32)` |
| G2 (pi_b, vk_beta/gamma/delta) | `BytesN<128>` | 128 | `x.c1(32) ‖ x.c0(32) ‖ y.c1(32) ‖ y.c0(32)` |
| scalar / public signal | `U256` | 32 | big-endian |

**⚠️ The G2 Fp2 ordering gotcha (the #1 integration risk):** snarkjs emits an Fp2 coordinate as
`[c0, c1]`, but the BN254 host wants the **imaginary part first** (`c1 ‖ c0`). So a snarkjs G2 point
`[[x_c0, x_c1],[y_c0, y_c1]]` encodes as `x_c1 ‖ x_c0 ‖ y_c1 ‖ y_c0`. Getting this wrong = "valid proof
fails on-chain." Canonical encoders: `circuits/scripts/export-soroban.mjs` (CLI) and
`frontend/src/lib/prover.ts` (browser) — both produce identical bytes; validated by `cargo test` (host
`pairing_check`) and by live testnet txs.

snarkjs JSON → contract mapping: `pi_a→a, pi_b→b, pi_c→c`; `vk_alpha_1→alpha`, `vk_beta_2/gamma_2/delta_2
→beta/gamma/delta`, `IC[]→ic[]` (`IC.length == nPublic + 1 == 8`); `public.json → Vec<U256>`.

## Toolchain

circom 2.2.3 · snarkjs 0.7.6 · default curve `bn128 = BN254` · stellar-cli 27 · React 19 / Vite 8 /
`@stellar/stellar-sdk` 16 / `@creit.tech/stellar-wallets-kit` 2.4 · contracts: **Rust 1.92.0** + target
`wasm32v1-none`, **soroban-sdk 25.3.x**. Toolchain gotcha: soroban-sdk 25.3.x needs rustc ≥ 1.91, but
`stellar contract build` rejects 1.81/1.82/1.83/1.91 — so **1.92.0** (pinned per-crate via `rust-toolchain.toml`).

## Testnet deployment

| What | Value |
|---|---|
| Deployer / admin | `GC3ATO6LRJY7T5TN2AE6DJLAMT2JCVLMGI6IXAVPMD5OVGH5ODBQWYLQ` |
| halo-verifier (policy-enforcing) | `CBLHW3IAGUJZ7XCJEAX2XJ3HXBSPATAP747MHTFUPMTITVOXGI2WMQPU` |
| gated-sale (SALE_SCOPE 424242) | `CAZXMBOBMI2YY5IRR5VVELUFHNK6NBGQEA2Z4L7LOZXIZLO23H7QBXA2` |
| verify tx (browser-submitted) | `62bbc7c845377ddf8e9ae40ea8ff5d96aa401c481a77494d6e431aa80f1b4845` (ledger 3265726) |
| duplicate submit | reverts `Error(Contract, #6)` = NullifierUsed |
| trivial policy on a policy-bound scope | reverts `Error(Contract, #8)` = PolicyMismatch |

## Honest status / known gaps

Testnet, not audited. **Issuer trust:** the mock issuer is trusted for attribute correctness — it
controls leaf contents — so the strongest guarantees sit downstream of a trusted party (the circuit now
range/boolean-constrains the gates, but a malicious issuer could still commit false attributes).
**Policy binding (H1):** gate policy is now enforced on-chain per scope via `set_policy`; scopes without
a registered policy remain free-form. **Nullifiers** persist ~115 days per write (TTL-bumped);
indefinite persistence needs periodic re-bumping. The **view-key is demo-tier** (ciphertext not yet
bound in-circuit; the sound tier would prove `ciphertext = Encrypt(auditorPubkey, attribute)` in-circuit
via ElGamal over BabyJubJub). **Revocation** (drop a leaf + republish root) is designed, not implemented.
Demo wallet + auditor keys are throwaway **testnet-only** keys. Residual `npm audit` advisories live in
the optional wallet-connector dep tree (Freighter + local keypair signer are what's used). The demo
reuses one issuer tree (holderA/holderB); the sale demo is one-shot per `(secret, SALE_SCOPE)`.
