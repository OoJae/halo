import { Link } from "react-router-dom";
import RingCanvas from "../components/RingCanvas";

// Faithful port of brand/Halo - Manifesto.dc.html. Inline styles mirror the source
// verbatim; scroll reveals use the [data-reveal] rule in brand.css. Nav and Footer
// are provided by the shared Layout, so they are not rendered here.

const TENETS: { n: string; nc: string; title: string; body: string; last?: boolean }[] = [
  {
    n: "01",
    nc: "#8B8CF8",
    title: "The credential is yours, and it stays with you.",
    body: "An issuer vouches for you once. After that, your birth year, country, and accreditation live on your device — not in a database waiting to be breached.",
  },
  {
    n: "02",
    nc: "#8B8CF8",
    title: "You prove the claim, you don't hand over the data.",
    body: "A zero-knowledge proof settles the question — eligible or not — while every underlying value stays hidden. The math, not a middleman, carries the trust.",
  },
  {
    n: "03",
    nc: "#34D399",
    title: "The ledger learns a boolean, never a biography.",
    body: "What the public record keeps is one fact bound to one address: verified, as of ledger N. A nullifier makes it one-person-one-action — without making it traceable.",
  },
  {
    n: "04",
    nc: "#7B8499",
    title: "Oversight by permission, not by default.",
    body: "Privacy isn't the enemy of compliance. An authorized auditor can recover a single disclosed attribute with a view-key — and no one else can. Selective disclosure, not zero disclosure.",
    last: true,
  },
];

export default function Manifesto() {
  return (
    <>
      <RingCanvas R={270} rt={16} ringN={1600} tilt={0.46} cxDesktop={0.5} cyBase={0.42} cyFactor={0.1} cyMax={0.4} />

      {/* HERO STATEMENT */}
      <header style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "96px clamp(22px,5vw,60px) clamp(50px,8vh,100px)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1.05vw,13px)", letterSpacing: ".3em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(28px,4vh,44px)" }}>Manifesto</div>
        <h1 style={{ margin: 0, maxWidth: 1100, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "125%", letterSpacing: "-.03em", lineHeight: ".92", fontSize: "clamp(2.8rem,9vw,8.5rem)", color: "#E9ECF4" }}>Prove the predicate.<br />Not the person.</h1>
        <p style={{ margin: "clamp(28px,4vh,40px) auto 0", maxWidth: 560, fontFamily: "var(--sans)", fontWeight: 400, fontSize: "clamp(1.1rem,1.6vw,1.4rem)", lineHeight: 1.5, color: "#A7AFC4" }}>Eligibility is a yes or a no. It should travel as a yes or a no — and nothing more.</p>
      </header>

      {/* THE TRAP */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "clamp(70px,12vh,150px) clamp(22px,5vw,60px)" }}>
          <p data-reveal style={{ margin: 0, fontFamily: "var(--sans)", fontWeight: 600, fontStretch: "106%", letterSpacing: "-.018em", lineHeight: 1.22, fontSize: "clamp(1.6rem,3.6vw,2.9rem)", color: "#E9ECF4" }}>For thirty years, digital identity has offered the same bargain: <span style={{ color: "#7B8499" }}>reveal everything, or participate in nothing.</span> Blockchains made it worse — now the disclosure is permanent, global, and impossible to take back.</p>
          <p data-reveal style={{ margin: "clamp(30px,5vh,48px) 0 0", maxWidth: 640, fontSize: "clamp(1.05rem,1.4vw,1.22rem)", lineHeight: 1.65, color: "#A7AFC4" }}>An app rarely needs your identity. It needs to know you <em>qualify</em>: old enough, accredited, in an allowed place. Those are predicates — and a predicate can be proven without surrendering the facts beneath it.</p>
        </div>
      </section>

      {/* TENETS */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F,#0a0c18)", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(40px,6vh,64px)" }}>Four tenets</div>

          {TENETS.map((t) => (
            <div key={t.n} data-reveal style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(20px,4vw,52px)", padding: "clamp(28px,4vh,42px) 0", borderTop: "1px solid #1A1D2E", ...(t.last ? { borderBottom: "1px solid #1A1D2E" } : {}), alignItems: "start" }}>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: "clamp(28px,4vw,52px)", color: t.nc, lineHeight: ".9" }}>{t.n}</span>
              <div>
                <h2 style={{ margin: "0 0 12px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "108%", letterSpacing: "-.015em", lineHeight: 1.08, fontSize: "clamp(1.4rem,3vw,2.2rem)", color: "#E9ECF4" }}>{t.title}</h2>
                <p style={{ margin: 0, maxWidth: 620, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.6, color: "#9aa2b8" }}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSE */}
      <section style={{ position: "relative", zIndex: 2, background: "#06070D", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(100px,16vh,210px) clamp(22px,5vw,60px)", textAlign: "center" }}>
          <h2 data-reveal style={{ margin: 0, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "124%", letterSpacing: "-.03em", lineHeight: ".94", fontSize: "clamp(2.4rem,7vw,6rem)", color: "#E9ECF4" }}>Prove who you're<br />allowed to be.</h2>
          <p data-reveal style={{ margin: "clamp(24px,3vh,34px) 0 0", fontFamily: "var(--sans)", fontWeight: 400, fontSize: "clamp(1.2rem,2vw,1.7rem)", color: "#8B8CF8" }}>Reveal nothing about who you are.</p>
          <div data-reveal style={{ marginTop: "clamp(40px,6vh,60px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
            <Link to="/app" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#0A0B12", background: "#B7B8FF", padding: "15px 26px", borderRadius: 2, transition: "background .2s ease" }}>Launch the prover ↗</Link>
            <Link to="/how-it-works" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#E9ECF4", background: "transparent", border: "1px solid #2a3048", padding: "15px 26px", borderRadius: 2, transition: "border-color .2s,background .2s" }}>How it works →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
