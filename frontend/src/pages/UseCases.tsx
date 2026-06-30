import { Link } from "react-router-dom";
import HaloCanvas from "../components/HaloCanvas";

const CASES = [
  {
    n: "01", tag: "REGULATED SALE", title: "Token sales that open only to the eligible.",
    body: "A compliant raise needs buyers who are of-age, accredited, and outside sanctioned regions. Today that means handing a spreadsheet of identities to whoever runs the sale. With Halo, the contract checks a proof — and the cap table never learns a birthdate.",
    grid: { label: "ON-CHAIN GATE", rows: [["checks", "is_verified_for"], ["policy", "18+ · accredited · region"], ["trivial policy", "reverts"], ["cap table learns", "— nothing"]] },
  },
  {
    n: "02", tag: "DAO GOVERNANCE", title: "One person, one vote — provably.",
    body: "Token-weighted voting rewards whoever has the most wallets. Scope the nullifier to a proposal and a second ballot from the same human reverts on-chain — without ever tying a vote to a name.",
    grid: { label: "PER-PROPOSAL NULLIFIER", rows: [["scope", "proposal id"], ["first vote", "accepted ✓"], ["second vote", "reverts #6"], ["links to identity", "— none"]] },
  },
  {
    n: "03", tag: "AIRDROP", title: "Reach real humans, not wallet farms.",
    body: "Distributions get drained by scripts spinning up thousands of addresses. Gate the claim on a Sybil-resistant proof and each eligible person claims exactly once — without doxxing a single attribute to qualify.",
    grid: { label: "CLAIM", rows: [["one human", "one nullifier"], ["10,000 wallets", "still one claim"], ["attributes shown", "— none"]] },
  },
  {
    n: "04", tag: "COMPLIANCE", title: "A regulator can look — and only the regulator.",
    body: "Selective disclosure isn't zero disclosure. Encrypt one attribute to an authorized auditor's key; the ledger carries only ciphertext, and only the auditor can recover it. Privacy for the public, a window for oversight.",
    grid: { label: "VIEW-KEY DISCLOSURE", rows: [["public sees", "ciphertext"], ["auditor sees", "one attribute"], ["everyone else", "— nothing"]] },
  },
];

export default function UseCases() {
  return (
    <>
      <HaloCanvas cx={0.22} cy={0.32} />
      <header className="section section-pad container">
        <div className="eyebrow" data-reveal>Use cases</div>
        <h1 className="h1" style={{ marginTop: 20, fontSize: "clamp(2.3rem,5.5vw,4.8rem)", maxWidth: 900 }} data-reveal>
          One credential. Every gate that should ask less.
        </h1>
        <p className="lead" style={{ marginTop: 24, maxWidth: 640 }} data-reveal>
          Anywhere an app needs to know you <em className="ink">qualify</em> — not who you are — Halo turns the question into a proof.
        </p>
      </header>

      {CASES.map((c, idx) => (
        <section className="section section-pad container" key={c.n}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px,4vw,56px)", alignItems: "center" }} className="hiw-row">
            <div data-reveal style={{ order: idx % 2 === 1 ? 2 : 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span className="numcard-n" style={{ color: "var(--faint)" }}>{c.n}</span>
                <span className="numcard-tag">{c.tag}</span>
              </div>
              <h2 className="h2" style={{ marginTop: 16, fontSize: "clamp(1.7rem,3vw,2.6rem)" }}>{c.title}</h2>
              <p className="body" style={{ marginTop: 16, maxWidth: 480 }}>{c.body}</p>
            </div>
            <div className="card" data-reveal style={{ order: idx % 2 === 1 ? 1 : 2 }}>
              <div className="numcard-tag" style={{ color: "var(--indigo)" }}>{c.grid.label}</div>
              <div style={{ marginTop: 14 }}>
                {c.grid.rows.map(([k, v], i) => (
                  <div className="data-row" style={i === c.grid.rows.length - 1 ? { borderBottom: "none" } : undefined} key={k}>
                    <span style={{ color: "var(--muted)" }}>{k}</span>
                    <span className={v.startsWith("—") ? "" : "ink"} style={v.startsWith("—") ? { color: "var(--faint)" } : undefined}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section section-pad container" style={{ textAlign: "center" }}>
        <h2 className="h2" data-reveal>Gate yours the same way.</h2>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }} data-reveal>
          <Link to="/app" className="btn btn-primary">Launch the prover ↗</Link>
          <Link to="/developers" className="btn btn-tertiary">Read the spec →</Link>
        </div>
      </section>
    </>
  );
}
