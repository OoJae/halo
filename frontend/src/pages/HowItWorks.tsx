import { Link } from "react-router-dom";
import HaloCanvas from "../components/HaloCanvas";

const STEPS = [
  {
    n: "01", tag: "ISSUE", title: "A trusted issuer vouches for you, exactly once.",
    body: [
      "The issuer runs KYC a single time and commits a hash of your attributes into a Merkle tree. Only the tree's root is published on Stellar. You walk away with the credential — attributes, a secret, and your Merkle path — held privately on your device.",
      "From here on, the issuer is never contacted again. Privacy holds against everyone downstream of this moment.",
    ],
    codeLabel: "THE COMMITMENT",
    code: <><span className="g">leaf</span> = Poseidon(birthYear, country,{"\n"}{"            "}accredited, secret)</>,
    rows: [["tree", "depth 16 · Poseidon"], ["on-chain call", "set_issuer_root"], ["you keep", "attrs · secret · path"], ["issuer keeps", "— nothing about you"]],
  },
  {
    n: "02", tag: "PROVE", title: "The proof is generated in your browser.",
    body: [
      "snarkjs compiles a zero-knowledge proof that your hidden attributes are in the issuer's tree and satisfy the gate — 18+, accredited, allowed region — all without revealing a single value.",
      "The proof is cryptographically bound to your wallet address, so a stolen proof can't be replayed from another account.",
    ],
    codeLabel: "CIRCUIT · Halo(depth = 16)",
    code: <><span className="c">// proves, revealing nothing:</span>{"\n"}· Merkle inclusion under root{"\n"}· birthYear ≤ minBirthYear (18+){"\n"}· accredited ≥ required{"\n"}· country ≠ bannedCountry{"\n"}· <span className="g">nullifier = Poseidon(secret, scope)</span>{"\n"}· addr bound to your wallet</>,
    rows: [["system", "Groth16 · BN254"], ["prover", "snarkjs · WASM"], ["constraints", "~4,525"], ["leaves device", "nothing"]],
  },
  {
    n: "03", tag: "VERIFY", title: "A Soroban contract checks the proof on-chain.",
    body: [
      "The verifier re-derives your address, confirms the issuer root, enforces the gate's policy, and runs the BN254 pairing check using Stellar's native host functions. A re-used nullifier is rejected — one person, one action.",
      "On success it records a single attestation and emits an event. The ledger learns that your address is verified for this scope — and nothing else.",
    ],
    codeLabel: "verify(caller, proof, signals)",
    code: <><span className="g">✓</span> caller.require_auth(){"\n"}<span className="g">✓</span> addr == sha256(caller){"\n"}<span className="g">✓</span> root == stored issuer root{"\n"}<span className="g">✓</span> policy matches the gate{"\n"}<span className="g">✓</span> (scope, nullifier) unused{"\n"}<span className="g">✓</span> groth16_verify(VK, π, signals)</>,
    rows: [],
    reverts: <><span className="k">#6</span> NullifierUsed <span className="c">· already claimed</span>{"\n"}<span className="k">#8</span> PolicyMismatch <span className="c">· wrong gate</span>{"\n"}<span className="k">#7</span> InvalidProof</>,
  },
];

export default function HowItWorks() {
  return (
    <>
      <HaloCanvas cx={0.78} cy={0.3} />
      <header className="section section-pad container">
        <div className="eyebrow" data-reveal>How it works</div>
        <h1 className="h1" style={{ marginTop: 20, fontSize: "clamp(2.4rem,6vw,5rem)", maxWidth: 920 }} data-reveal>
          Issue once. Prove in your browser. Verify on-chain.
        </h1>
        <p className="lead" style={{ marginTop: 24, maxWidth: 660 }} data-reveal>
          A credential never leaves your device. What touches the chain is a proof — and an attestation that
          says only that your address is eligible.
        </p>
        <div className="mono" style={{ marginTop: 28, fontSize: 13, letterSpacing: ".1em", color: "var(--muted-2)" }} data-reveal>
          <span style={{ color: "var(--indigo)" }}>ISSUE</span> → <span style={{ color: "var(--indigo-bright)" }}>PROVE</span> → <span style={{ color: "var(--green)" }}>VERIFY</span> → GATE
        </div>
      </header>

      {STEPS.map((s) => (
        <section className="section section-pad container" key={s.n}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px,4vw,56px)", alignItems: "start" }} className="hiw-row">
            <div data-reveal>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span className="numcard-n" style={{ color: "var(--faint)" }}>{s.n}</span>
                <span className="numcard-tag">{s.tag}</span>
              </div>
              <h2 className="h2" style={{ marginTop: 16, fontSize: "clamp(1.7rem,3vw,2.6rem)" }}>{s.title}</h2>
              {s.body.map((p, i) => <p className="body" style={{ marginTop: 16 }} key={i}>{p}</p>)}
            </div>
            <div data-reveal>
              <div className="numcard-tag" style={{ marginBottom: 10 }}>{s.codeLabel}</div>
              <pre className="codeblock" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{s.code}</pre>
              {s.reverts && (
                <>
                  <div className="numcard-tag" style={{ margin: "20px 0 10px", color: "var(--danger)" }}>REVERTS</div>
                  <pre className="codeblock" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{s.reverts}</pre>
                </>
              )}
              {s.rows.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  {s.rows.map(([k, v], i) => (
                    <div className="data-row" style={i === s.rows.length - 1 ? { borderBottom: "none" } : undefined} key={k}>
                      <span style={{ color: "var(--muted)" }}>{k}</span><span className="ink">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* 04 — GATE */}
      <section className="section section-pad container">
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }} data-reveal>
          <span className="numcard-n" style={{ color: "var(--faint)" }}>04</span>
          <span className="numcard-tag">GATE</span>
        </div>
        <h2 className="h2" style={{ marginTop: 16, maxWidth: 760 }} data-reveal>Any dApp gates an action on the attestation.</h2>
        <p className="lead" style={{ marginTop: 20, maxWidth: 680 }} data-reveal>
          A gating contract makes one cross-contract call — <code className="mono ink-indigo">is_verified_for</code> — before it lets the
          action through. The demo ships a regulated token sale that stays locked until a genuine 18+ /
          accredited / allowed-region proof lands.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 36 }}>
          {[
            { tag: "SCOPE", v: "424242", sub: "the sale's context id" },
            { tag: "POLICY", v: "2008 · 1 · 643", sub: "18+ · accredited · not banned" },
            { tag: "TRIVIAL POLICY", v: "reverts", sub: "enforced on-chain, not in UI" },
          ].map((c) => (
            <div className="card-spec" key={c.tag} data-reveal>
              <div className="numcard-tag">{c.tag}</div>
              <div className="mono ink-indigo" style={{ fontSize: 22, margin: "12px 0 8px" }}>{c.v}</div>
              <div className="body" style={{ fontSize: 13 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST MODEL */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>The trust model</div>
        <h2 className="h2" style={{ marginTop: 18, maxWidth: 720 }} data-reveal>Four roles. One of them is trusted, and only once.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginTop: 40 }}>
          {[
            { t: "ISSUER", b: "KYCs you once, commits the leaf, publishes the root. Trusted for attribute correctness — and never contacted again." },
            { t: "HOLDER", b: "You. Holds the credential client-side and generates proofs in the browser. PII never leaves the device." },
            { t: "VERIFIER dAPP", b: "Gates an action on a Halo proof — a regulated sale, a vote, an airdrop. Trusts only the math." },
            { t: "AUDITOR", b: "Optional. Can recover one disclosed attribute with a view-key — and only the auditor can." },
          ].map((c) => (
            <div className="card" key={c.t} data-reveal>
              <div className="numcard-tag" style={{ color: "var(--indigo)" }}>{c.t}</div>
              <p className="body" style={{ marginTop: 12 }}>{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section section-pad container" style={{ textAlign: "center" }}>
        <h2 className="h2" data-reveal>See it run, end to end.</h2>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }} data-reveal>
          <Link to="/app" className="btn btn-primary">Launch the prover ↗</Link>
          <Link to="/developers" className="btn btn-tertiary">Read the spec →</Link>
        </div>
      </section>
    </>
  );
}
