# Halo — Selective-Disclosure Identity Credentials on Stellar

**Prove who you're allowed to be — reveal nothing about who you are.**

Halo is a zero-knowledge eligibility credential for Stellar. A trusted issuer verifies a person's
real-world attributes **once**; the holder keeps that credential privately on their device. When a
Stellar dApp needs to gate an action — a regulated token sale, a DAO vote, an airdrop — the user
generates a **Groth16 proof in their browser** that they satisfy the gate's policy (e.g. *18+ AND
accredited AND in an allowed region*) **without revealing any underlying data**. A Soroban contract
verifies the proof on-chain, enforces one-person-one-action with a Sybil-resistant **nullifier**, and
records an attestation bound to the user's Stellar address. The public ledger shows only
*"address G… is verified for this context as of ledger N"* — never the person's birthdate, country,
or identity.

> Built for **Stellar Hacks: Real-World ZK**. Live on testnet. **The zero-knowledge proof is what
> makes this possible.**

**▶ Try it live: https://halo-zk.vercel.app** — connect Freighter (testnet) or click
**Use demo wallet**, then prove eligibility and watch a real on-chain attestation appear. Proving runs
entirely in your browser; no attributes ever leave the device.

## What the ZK does (and why it's load-bearing)

The Circom/Groth16 circuit (`circuits/halo.circom`, BN254, ~4,500 constraints) proves, **without
revealing any private input**, that:

1. **Membership** — `leaf = Poseidon(birthYear, country, accredited, secret)` is in the trusted
   issuer's Merkle tree under a published `root`. *(The issuer vouched for exactly these attributes.)*
2. **Policy** — the attributes satisfy the gate: `birthYear ≤ minBirthYear` (18+),
   `accredited ≥ requireAccredited`, and `country ≠ bannedCountry`.
3. **Sybil resistance** — a per-context `nullifier = Poseidon(secret, scope)` is correctly derived;
   the contract rejects a re-used `(scope, nullifier)`, so one person can act once per context.
4. **Anti-replay** — the proof is bound to the caller's Stellar address (a public `addr` input the
   contract re-derives from `caller`), so a stolen proof can't be submitted from another wallet.

Remove the ZK and the entire privacy + Sybil-resistance guarantee collapses — it is not decorative.

## Architecture

```
  ┌──────────┐  1. verify identity once,         ┌────────────────────────┐
  │  ISSUER  │──── insert leaf, publish root ────▶│  halo-verifier (Soroban)│
  │  (mock)  │                                    │  set_issuer_root (admin)│
  └────┬─────┘                                    └────────────────────────┘
       │ 2. issue credential {dob,country,accredited,secret, merkle path}
       ▼
  ┌──────────┐  3. choose gate (18+ & accredited & allowed region)
  │  HOLDER  │     generate Groth16 proof IN BROWSER (snarkjs WASM)
  │ (browser)│     reveals: nothing about the private inputs
  └────┬─────┘
       │ 4. submit (proof, public signals) — wallet-signed
       ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  halo-verifier:  caller.require_auth()                                 │
  │   · assert addr == sha256(caller)         (anti-replay binding)        │
  │   · assert root == stored issuer root      (trust anchor)              │
  │   · groth16_verify(VK, proof, signals)     (BN254 host functions)      │
  │   · (scope,nullifier) unused? → store, else REVERT  (Sybil resistance) │
  │   · record attestation[(caller, scope)] = ledger; emit event          │
  └────┬─────────────────────────────────────────────────────────────────┘
       │ 5. is_verified(caller, scope) == true
       ▼
  ┌────────────────────┐
  │  gated-sale (dApp) │  cross-contract is_verified → unlock the sale
  └────────────────────┘
```

**Actors:** Issuer (trusted to KYC once) · Holder (proves in-browser; PII never leaves the device) ·
Verifier dApp (gates on a Halo proof) · Auditor (optional view-key recipient).

## Stack

Circom 2 + circomlib + snarkjs (**Groth16 over BN254**) · Soroban (Rust, soroban-sdk 25.3, Protocol
25/26 **BN254 host functions**) verifier + gated-sale · React + Vite + `@stellar/stellar-sdk` +
Stellar Wallets Kit · **in-browser proving** (snarkjs WASM) · tweetnacl for the auditor view-key.

## Live on testnet

| | |
|---|---|
| **halo-verifier** | [`CBXEUMNLBWQEGQDEVFTFD5ZCBZYWVJ2WAW2LLOIVF3Z7YCMPKG2ZNYY6`](https://stellar.expert/explorer/testnet/contract/CBXEUMNLBWQEGQDEVFTFD5ZCBZYWVJ2WAW2LLOIVF3Z7YCMPKG2ZNYY6) |
| **gated-sale** | [`CAZXMBOBMI2YY5IRR5VVELUFHNK6NBGQEA2Z4L7LOZXIZLO23H7QBXA2`](https://stellar.expert/explorer/testnet/contract/CAZXMBOBMI2YY5IRR5VVELUFHNK6NBGQEA2Z4L7LOZXIZLO23H7QBXA2) |
| **Example verification tx** (browser-submitted proof) | [`88f8a2e6…574d`](https://stellar.expert/explorer/testnet/tx/88f8a2e6924d9fbd9979ee0c440c75e8e23f83bb4b6fd698a4330bec8f14574d) |
| Earlier CLI verification tx | [`518cc81f…ea1a4`](https://stellar.expert/explorer/testnet/tx/518cc81f7f6a76fe4d3f2b72d48d7e30c4b8d618557bd5e3774d74c78e9ea1a4) |

Submitting the same proof again reverts with `Error(Contract, #6)` = `NullifierUsed` — Sybil
resistance, enforced on-chain.

## Run it

```bash
# 1. Circuit: compile + trusted setup (prebuilt Hermez ptau) + prove a sample holder
cd circuits && npm install
bash scripts/setup.sh halo        # compile + groth16 setup + export verification_key.json
cd ../issuer && npm install && npx tsx src/issue.ts   # build tree, issue demo credentials

# 2. Contracts: test + deploy to testnet (needs a funded `halo-deployer` identity)
cd ../contracts/halo-verifier && cargo test && stellar contract build
#   deploy + initialize + set_issuer_root — see scripts/deploy-testnet.sh

# 3. Frontend + issuer API (the demo)
cd ../../frontend && npm install
cp ../circuits/build/halo_js/halo.wasm public/halo.wasm
cp ../circuits/build/halo_final.zkey public/halo_final.zkey
bash ../scripts/dev.sh             # issuer :8787 + frontend :5173
```

Connect Freighter (testnet), or click **Use demo wallet** (set `VITE_DEMO_SECRET` in
`frontend/.env.local`) for a wallet-free run. See [docs/architecture.md](docs/architecture.md) for the
full design and the exact proof/VK byte-encoding spec.

## Honest status

Hackathon prototype on **testnet — not audited**. The BN254 Groth16 verifier core was hand-ported from
the merged on-main [`stellar/soroban-examples/groth16_verifier`](https://github.com/stellar/soroban-examples/tree/main/groth16_verifier)
(BLS12-381) to BN254, cross-checked against the open BN254 PR. The **mock issuer** stands in for a real
KYC provider. The **auditor view-key is demo-tier**: one attribute is encrypted to the auditor's key
off-chain, but the ciphertext is not yet bound in-circuit to the proven attribute. The browser submit
uses Stellar Wallets Kit (Freighter) with a funded-keypair fallback for reliable demos.

## How Halo is differentiated

Most ZK submissions are private-payment mixers. Halo is a **selective-disclosure identity** credential:
the combination of an on-chain issuer trust-anchor, a Sybil-resistant per-scope nullifier, in-circuit
**address binding**, and an auditor **view-key** — tightly bound to a Stellar address — is a distinct,
compliance-forward story (vs. zkPassport or ring-signature KYC demos).

## A note on the name

**Halo** is a product name, not a reference to the Halo2 proving system — under the hood it's
**Groth16 over BN254**.

## License

MIT — see [LICENSE](LICENSE).
