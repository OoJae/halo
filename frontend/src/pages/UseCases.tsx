import { Link } from "react-router-dom";
import RingCanvas from "../components/RingCanvas";

// Faithful port of brand/Halo - Use Cases.dc.html. Inline styles mirror the source
// verbatim; scroll reveals use the [data-reveal] rule in brand.css (animation-timeline: view()).

export default function UseCases() {
  return (
    <>
      <RingCanvas R={250} rt={15} ringN={1400} tilt={0.5} cxDesktop={0.26} cyBase={0.34} cyFactor={0.12} cyMax={0.4} />

      <header style={{ position: "relative", zIndex: 2, minHeight: "clamp(480px,72vh,760px)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "104px clamp(22px,5vw,60px) clamp(40px,6vh,80px)", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1.05vw,13px)", letterSpacing: ".28em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(22px,3vh,34px)" }}>Use cases</div>
        <h1 style={{ margin: 0, maxWidth: 1000, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "122%", letterSpacing: "-.028em", lineHeight: ".94", fontSize: "clamp(2.5rem,6.6vw,6rem)", color: "#E9ECF4" }}>One credential. Every gate that should ask less.</h1>
        <p style={{ margin: "clamp(26px,4vh,38px) 0 0", maxWidth: 620, fontFamily: "var(--sans)", fontWeight: 400, fontSize: "clamp(1.05rem,1.5vw,1.32rem)", lineHeight: 1.5, color: "#A7AFC4" }}>Anywhere an app needs to know you <em>qualify</em> — not who you are — Halo turns the question into a proof.</p>
      </header>

      {/* 01 SALE */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(30px,5vw,72px)", alignItems: "center" }}>
          <div data-reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(30px,3.6vw,46px)", color: "#2a2f52", lineHeight: 1 }}>01</span><span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".2em", color: "#8B8CF8" }}>REGULATED SALE</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.05, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>Token sales that open only to the eligible.</h2>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>A compliant raise needs buyers who are of-age, accredited, and outside sanctioned regions. Today that means handing a spreadsheet of identities to whoever runs the sale. With Halo, the contract checks a proof — and the cap table never learns a birthdate.</p>
          </div>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 26, fontFamily: "var(--mono)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#646b80", marginBottom: 16 }}>ON-CHAIN GATE</div>
            <div style={{ display: "grid", gap: 11, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>checks</span><span style={{ color: "#cdd3e4" }}>is_verified_for</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>policy</span><span style={{ color: "#cdd3e4" }}>18+ · accredited · region</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>trivial policy</span><span style={{ color: "#f87171" }}>reverts</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, borderTop: "1px dashed #1A1D2E", paddingTop: 11 }}><span style={{ color: "#6b7288" }}>cap table learns</span><span style={{ color: "#3a4055" }}>— nothing</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 DAO */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F,#0a0c18)", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(30px,5vw,72px)", alignItems: "center" }}>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 26, fontFamily: "var(--mono)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#646b80", marginBottom: 16 }}>PER-PROPOSAL NULLIFIER</div>
            <div style={{ display: "grid", gap: 11, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>scope</span><span style={{ color: "#cdd3e4" }}>proposal id</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>first vote</span><span style={{ color: "#34D399" }}>accepted ✓</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>second vote</span><span style={{ color: "#f87171" }}>reverts #6</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, borderTop: "1px dashed #1A1D2E", paddingTop: 11 }}><span style={{ color: "#6b7288" }}>links to identity</span><span style={{ color: "#3a4055" }}>— none</span></div>
            </div>
          </div>
          <div data-reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(30px,3.6vw,46px)", color: "#2a2f52", lineHeight: 1 }}>02</span><span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".2em", color: "#B7B8FF" }}>DAO GOVERNANCE</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.05, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>One person, one vote — provably.</h2>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>Token-weighted voting rewards whoever has the most wallets. Scope the nullifier to a proposal and a second ballot from the same human reverts on-chain — without ever tying a vote to a name.</p>
          </div>
        </div>
      </section>

      {/* 03 AIRDROP */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(30px,5vw,72px)", alignItems: "center" }}>
          <div data-reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(30px,3.6vw,46px)", color: "#2a2f52", lineHeight: 1 }}>03</span><span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".2em", color: "#34D399" }}>AIRDROP</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.05, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>Reach real humans, not wallet farms.</h2>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>Distributions get drained by scripts spinning up thousands of addresses. Gate the claim on a Sybil-resistant proof and each eligible person claims exactly once — without doxxing a single attribute to qualify.</p>
          </div>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 26, fontFamily: "var(--mono)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#646b80", marginBottom: 16 }}>CLAIM</div>
            <div style={{ display: "grid", gap: 11, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>one human</span><span style={{ color: "#cdd3e4" }}>one nullifier</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>10,000 wallets</span><span style={{ color: "#cdd3e4" }}>still one claim</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>attributes shown</span><span style={{ color: "#3a4055" }}>— none</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 AUDITOR */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F,#0a0c18)", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(30px,5vw,72px)", alignItems: "center" }}>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 26, fontFamily: "var(--mono)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#646b80", marginBottom: 16 }}>VIEW-KEY DISCLOSURE</div>
            <div style={{ display: "grid", gap: 11, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>public sees</span><span style={{ color: "#cdd3e4" }}>ciphertext</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>auditor sees</span><span style={{ color: "#34D399" }}>one attribute</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ color: "#6b7288" }}>everyone else</span><span style={{ color: "#3a4055" }}>— nothing</span></div>
            </div>
          </div>
          <div data-reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(30px,3.6vw,46px)", color: "#2a2f52", lineHeight: 1 }}>04</span><span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".2em", color: "#7B8499" }}>COMPLIANCE</span></div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.05, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>A regulator can look — and only the regulator.</h2>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>Selective disclosure isn't zero disclosure. Encrypt one attribute to an authorized auditor's key; the ledger carries only ciphertext, and only the auditor can recover it. Privacy for the public, a window for oversight.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(80px,12vh,150px) clamp(22px,5vw,60px)", textAlign: "center" }}>
          <h2 data-reveal style={{ margin: "0 0 clamp(30px,4vh,44px)", fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", letterSpacing: "-.028em", lineHeight: ".98", fontSize: "clamp(2rem,5.5vw,4.2rem)", color: "#E9ECF4" }}>Gate yours the same way.</h2>
          <div data-reveal style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
            <Link to="/app" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#0A0B12", background: "#B7B8FF", padding: "15px 26px", borderRadius: 2 }}>Launch the prover ↗</Link>
            <Link to="/developers" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#E9ECF4", background: "transparent", border: "1px solid #2a3048", padding: "15px 26px", borderRadius: 2 }}>Read the spec →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
