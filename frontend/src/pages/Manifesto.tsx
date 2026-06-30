import { Link } from "react-router-dom";
import HaloCanvas from "../components/HaloCanvas";

const TENETS = [
  { n: "01", title: "The credential is yours, and it stays with you.", body: "An issuer vouches for you once. After that, your birth year, country, and accreditation live on your device — not in a database waiting to be breached." },
  { n: "02", title: "You prove the claim, you don't hand over the data.", body: "A zero-knowledge proof settles the question — eligible or not — while every underlying value stays hidden. The math, not a middleman, carries the trust." },
  { n: "03", title: "The ledger learns a boolean, never a biography.", body: "What the public record keeps is one fact bound to one address: verified, as of ledger N. A nullifier makes it one-person-one-action — without making it traceable." },
  { n: "04", title: "Oversight by permission, not by default.", body: "Privacy isn't the enemy of compliance. An authorized auditor can recover a single disclosed attribute with a view-key — and no one else can. Selective disclosure, not zero disclosure." },
];

export default function Manifesto() {
  return (
    <>
      <HaloCanvas cy={0.42} tilt={0.7} />

      {/* HERO */}
      <header className="section section-pad container" style={{ minHeight: "82vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="eyebrow" data-reveal>Manifesto</div>
        <h1 className="h1" style={{ marginTop: 22, fontSize: "clamp(2.6rem,7vw,6rem)", maxWidth: 1000 }} data-reveal>
          Prove the predicate.<br /><span style={{ color: "var(--muted)" }}>Not the person.</span>
        </h1>
        <p className="lead" style={{ marginTop: 26, maxWidth: 600 }} data-reveal>
          Eligibility is a yes or a no. It should travel as a yes or a no — and nothing more.
        </p>
      </header>

      {/* THE TRAP */}
      <section className="section section-pad container">
        <div style={{ maxWidth: 760 }}>
          <p className="lead" data-reveal>
            For thirty years, digital identity has offered the same bargain: reveal everything, or participate
            in nothing. Blockchains made it worse — now the disclosure is permanent, global, and impossible to
            take back.
          </p>
          <p className="lead" style={{ marginTop: 24 }} data-reveal>
            An app rarely needs your identity. It needs to know you qualify: old enough, accredited, in an
            allowed place. Those are predicates — and a predicate can be proven without surrendering the facts
            beneath it.
          </p>
        </div>
      </section>

      {/* FOUR TENETS */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>Four tenets</div>
        <div style={{ display: "grid", gap: 1, marginTop: 32, borderTop: "1px solid var(--border)" }}>
          {TENETS.map((t) => (
            <div key={t.n} data-reveal style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(20px,4vw,56px)", padding: "clamp(28px,4vh,44px) 0", borderBottom: "1px solid var(--border)" }} className="tenet-row">
              <span className="numcard-n" style={{ color: "var(--indigo)", fontSize: "clamp(34px,5vw,56px)" }}>{t.n}</span>
              <div>
                <h2 className="h2" style={{ fontSize: "clamp(1.5rem,2.6vw,2.3rem)", maxWidth: 640 }}>{t.title}</h2>
                <p className="lead" style={{ marginTop: 16, maxWidth: 640, color: "var(--text-3)" }}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSE */}
      <section className="section section-pad container" style={{ textAlign: "center" }}>
        <h2 className="h1" style={{ fontSize: "clamp(2.4rem,6.5vw,5.4rem)" }} data-reveal>
          Prove who you're allowed to be.<br /><span style={{ color: "var(--muted)" }}>Reveal nothing about who you are.</span>
        </h2>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }} data-reveal>
          <Link to="/app" className="btn btn-primary">Launch the prover ↗</Link>
          <Link to="/how-it-works" className="btn btn-tertiary">How it works →</Link>
        </div>
      </section>
    </>
  );
}
