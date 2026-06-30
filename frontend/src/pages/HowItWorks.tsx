import { Link } from "react-router-dom";
import RingCanvas from "../components/RingCanvas";

// Faithful port of brand/Halo - How It Works.dc.html. Inline styles mirror the
// source verbatim; scroll reveals use the [data-reveal] rule in brand.css.
export default function HowItWorks() {
  return (
    <>
      <RingCanvas R={250} rt={15} ringN={1500} tilt={0.52} cxDesktop={0.5} cyBase={0.4} cyFactor={0.15} cyMax={0.5} />

      {/* HEADER */}
      <header style={{ position: "relative", zIndex: 2, minHeight: "clamp(540px,84vh,880px)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "96px clamp(22px,5vw,60px) clamp(40px,7vh,90px)", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1.05vw,13px)", letterSpacing: ".28em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(22px,3vh,34px)" }}>How it works</div>
        <h1 style={{ margin: 0, maxWidth: 1000, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "122%", letterSpacing: "-.028em", lineHeight: ".94", fontSize: "clamp(2.6rem,7vw,6.4rem)", color: "#E9ECF4" }}>Issue once. Prove in your browser. Verify on-chain.</h1>
        <p style={{ margin: "clamp(26px,4vh,38px) 0 0", maxWidth: 620, fontFamily: "var(--sans)", fontWeight: 400, fontSize: "clamp(1.05rem,1.5vw,1.32rem)", lineHeight: 1.5, color: "#A7AFC4" }}>A credential never leaves your device. What touches the chain is a proof — and an attestation that says only that your address is eligible.</p>
        <div style={{ marginTop: "clamp(34px,5vh,48px)", display: "flex", alignItems: "center", gap: 22, fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".14em", color: "#646b80", flexWrap: "wrap" }}>
          <span style={{ color: "#8B8CF8" }}>ISSUE</span><span>→</span><span style={{ color: "#B7B8FF" }}>PROVE</span><span>→</span><span style={{ color: "#34D399" }}>VERIFY</span><span>→</span><span>GATE</span>
        </div>
      </header>

      {/* STEP 01 — ISSUE */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(64px,10vh,120px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "start" }}>
          <div data-reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 22 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(40px,5vw,64px)", color: "#8B8CF8", lineHeight: 1 }}>01</span><span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".2em", color: "#646b80" }}>ISSUE</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.4vw,2.7rem)", color: "#E9ECF4" }}>A trusted issuer vouches for you, exactly once.</h2>
            <p style={{ margin: "0 0 16px", fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>The issuer runs KYC a single time and commits a hash of your attributes into a Merkle tree. Only the tree's <span style={{ color: "#cdd3e4" }}>root</span> is published on Stellar. You walk away with the credential — attributes, a secret, and your Merkle path — held privately on your device.</p>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#7B8499" }}>From here on, the issuer is never contacted again. Privacy holds against everyone downstream of this moment.</p>
          </div>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 24, fontFamily: "var(--mono)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#646b80", marginBottom: 16 }}>THE COMMITMENT</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: "#cdd3e4", wordBreak: "break-word" }}>leaf = <span style={{ color: "#B7B8FF" }}>Poseidon</span>(<span style={{ color: "#9aa2b8" }}>birthYear, country,<br />accredited, secret</span>)</div>
            <div style={{ height: 1, background: "#1A1D2E", margin: "18px 0" }}></div>
            <div style={{ display: "grid", gap: 11, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>tree</span><span style={{ color: "#cdd3e4" }}>depth 16 · Poseidon</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>on-chain call</span><span style={{ color: "#cdd3e4" }}>set_issuer_root</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>you keep</span><span style={{ color: "#cdd3e4" }}>attrs · secret · path</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>issuer keeps</span><span style={{ color: "#3a4055" }}>— nothing about you</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 02 — PROVE */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F 0%,#0a0c18 50%,#07080F 100%)", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(64px,10vh,120px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "start" }}>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #232653", borderRadius: 6, padding: 24, fontFamily: "var(--mono)", boxShadow: "0 0 0 1px rgba(139,140,248,.08),0 30px 70px -50px rgba(139,140,248,.5)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#8089a0", marginBottom: 16 }}>CIRCUIT · Halo(depth = 16)</div>
            <div style={{ display: "grid", gap: 9, fontSize: 12, color: "#9aa2b8" }}>
              <div style={{ color: "#6b7288" }}>// proves, revealing nothing:</div>
              <div>· Merkle inclusion under <span style={{ color: "#cdd3e4" }}>root</span></div>
              <div>· birthYear ≤ minBirthYear <span style={{ color: "#3a4055" }}>(18+)</span></div>
              <div>· accredited ≥ required</div>
              <div>· country ≠ bannedCountry</div>
              <div style={{ color: "#B7B8FF" }}>· nullifier = Poseidon(secret, scope)</div>
              <div>· addr bound to your wallet</div>
            </div>
            <div style={{ height: 1, background: "#1A1D2E", margin: "18px 0" }}></div>
            <div style={{ display: "grid", gap: 11, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>system</span><span style={{ color: "#cdd3e4" }}>Groth16 · BN254</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>prover</span><span style={{ color: "#cdd3e4" }}>snarkjs · WASM</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>constraints</span><span style={{ color: "#cdd3e4" }}>~4,525</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>leaves device</span><span style={{ color: "#34D399" }}>nothing</span></div>
            </div>
          </div>
          <div data-reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 22 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(40px,5vw,64px)", color: "#B7B8FF", lineHeight: 1 }}>02</span><span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".2em", color: "#8089a0" }}>PROVE</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.4vw,2.7rem)", color: "#E9ECF4" }}>The proof is generated in your browser.</h2>
            <p style={{ margin: "0 0 16px", fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>snarkjs compiles a zero-knowledge proof that your hidden attributes are in the issuer's tree <em>and</em> satisfy the gate — 18+, accredited, allowed region — all without revealing a single value.</p>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#7B8499" }}>The proof is cryptographically bound to your wallet address, so a stolen proof can't be replayed from another account.</p>
          </div>
        </div>
      </section>

      {/* STEP 03 — VERIFY */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(64px,10vh,120px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "start" }}>
          <div data-reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 22 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(40px,5vw,64px)", color: "#34D399", lineHeight: 1 }}>03</span><span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".2em", color: "#646b80" }}>VERIFY</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.4vw,2.7rem)", color: "#E9ECF4" }}>A Soroban contract checks the proof on-chain.</h2>
            <p style={{ margin: "0 0 16px", fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>The verifier re-derives your address, confirms the issuer root, enforces the gate's policy, and runs the BN254 pairing check using Stellar's native host functions. A re-used <span style={{ color: "#cdd3e4" }}>nullifier</span> is rejected — one person, one action.</p>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#7B8499" }}>On success it records a single attestation and emits an event. The ledger learns that your address is verified for this scope — and nothing else.</p>
          </div>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 24, fontFamily: "var(--mono)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#646b80", marginBottom: 16 }}>verify(caller, proof, signals)</div>
            <div style={{ display: "grid", gap: 10, fontSize: 12.5, color: "#9aa2b8" }}>
              <div><span style={{ color: "#34D399" }}>✓</span> caller.require_auth()</div>
              <div><span style={{ color: "#34D399" }}>✓</span> addr == sha256(caller)</div>
              <div><span style={{ color: "#34D399" }}>✓</span> root == stored issuer root</div>
              <div><span style={{ color: "#34D399" }}>✓</span> policy matches the gate</div>
              <div><span style={{ color: "#34D399" }}>✓</span> (scope, nullifier) unused</div>
              <div><span style={{ color: "#34D399" }}>✓</span> groth16_verify(VK, π, signals)</div>
            </div>
            <div style={{ height: 1, background: "#1A1D2E", margin: "18px 0" }}></div>
            <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 10 }}>REVERTS</div>
            <div style={{ display: "grid", gap: 7, fontSize: 11.5, color: "#8089a0" }}>
              <div><span style={{ color: "#f87171" }}>#6</span> NullifierUsed <span style={{ color: "#3a4055" }}>· already claimed</span></div>
              <div><span style={{ color: "#f87171" }}>#8</span> PolicyMismatch <span style={{ color: "#3a4055" }}>· wrong gate</span></div>
              <div><span style={{ color: "#f87171" }}>#7</span> InvalidProof</div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 04 — GATE */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F 0%,#0a0c18 100%)", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(64px,10vh,120px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ maxWidth: 760, marginBottom: "clamp(40px,6vh,64px)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 22 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(40px,5vw,64px)", color: "#7B8499", lineHeight: 1 }}>04</span><span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".2em", color: "#646b80" }}>GATE</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.4vw,2.7rem)", color: "#E9ECF4" }}>Any dApp gates an action on the attestation.</h2>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>A gating contract makes one cross-contract call — <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#B7B8FF" }}>is_verified_for</span> — before it lets the action through. The demo ships a regulated token sale that stays locked until a genuine 18+ / accredited / allowed-region proof lands.</p>
          </div>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "clamp(14px,1.6vw,18px)" }}>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 22, fontFamily: "var(--mono)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 14 }}>SCOPE</div>
              <div style={{ fontSize: 18, color: "#E9ECF4", fontWeight: 500 }}>424242</div>
              <div style={{ fontSize: 12, color: "#6b7288", marginTop: 8 }}>the sale's context id</div>
            </div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 22, fontFamily: "var(--mono)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 14 }}>POLICY</div>
              <div style={{ fontSize: 18, color: "#E9ECF4", fontWeight: 500 }}>2008 · 1 · 643</div>
              <div style={{ fontSize: 12, color: "#6b7288", marginTop: 8 }}>18+ · accredited · not banned</div>
            </div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 22, fontFamily: "var(--mono)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 14 }}>TRIVIAL POLICY</div>
              <div style={{ fontSize: 18, color: "#f87171", fontWeight: 500 }}>reverts</div>
              <div style={{ fontSize: 12, color: "#6b7288", marginTop: 8 }}>enforced on-chain, not in UI</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST MODEL */}
      <section style={{ position: "relative", zIndex: 2, background: "#06070D", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(64px,10vh,120px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1vw,12.5px)", letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 24 }}>The trust model</div>
          <h2 data-reveal style={{ margin: "0 0 clamp(40px,6vh,64px)", maxWidth: 780, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.04, fontSize: "clamp(1.8rem,4.4vw,3.2rem)", color: "#E9ECF4" }}>Four roles. One of them is trusted, and only once.</h2>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(14px,1.6vw,18px)" }}>
            <div style={{ border: "1px solid #1b1e34", borderRadius: 5, padding: 24, background: "rgba(10,12,22,.4)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".16em", color: "#8B8CF8", marginBottom: 14 }}>ISSUER</div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#9aa2b8" }}>KYCs you once, commits the leaf, publishes the root. Trusted for attribute correctness — and never contacted again.</p>
            </div>
            <div style={{ border: "1px solid #1b1e34", borderRadius: 5, padding: 24, background: "rgba(10,12,22,.4)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".16em", color: "#B7B8FF", marginBottom: 14 }}>HOLDER</div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#9aa2b8" }}>You. Holds the credential client-side and generates proofs in the browser. PII never leaves the device.</p>
            </div>
            <div style={{ border: "1px solid #1b1e34", borderRadius: 5, padding: 24, background: "rgba(10,12,22,.4)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".16em", color: "#34D399", marginBottom: 14 }}>VERIFIER dAPP</div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#9aa2b8" }}>Gates an action on a Halo proof — a regulated sale, a vote, an airdrop. Trusts only the math.</p>
            </div>
            <div style={{ border: "1px solid #1b1e34", borderRadius: 5, padding: 24, background: "rgba(10,12,22,.4)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".16em", color: "#7B8499", marginBottom: 14 }}>AUDITOR</div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#9aa2b8" }}>Optional. Can recover one disclosed attribute with a view-key — and only the auditor can.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(80px,12vh,150px) clamp(22px,5vw,60px)", textAlign: "center" }}>
          <h2 data-reveal style={{ margin: "0 0 clamp(30px,4vh,44px)", fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", letterSpacing: "-.028em", lineHeight: ".98", fontSize: "clamp(2rem,5.5vw,4.2rem)", color: "#E9ECF4" }}>See it run, end to end.</h2>
          <div data-reveal style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
            <Link to="/app" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#0A0B12", background: "#B7B8FF", padding: "15px 26px", borderRadius: 2 }}>Launch the prover ↗</Link>
            <Link to="/developers" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#E9ECF4", background: "transparent", border: "1px solid #2a3048", padding: "15px 26px", borderRadius: 2 }}>Read the spec →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
