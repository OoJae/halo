import { Link } from "react-router-dom";
import HaloCanvas from "../components/HaloCanvas";
import { VERIFIER_ID, SALE_ID } from "../lib/stellar";

const short = (s: string) => `${s.slice(0, 5)}…${s.slice(-3)}`;

export default function Landing() {
  return (
    <>
      <HaloCanvas scrollDriven cy={0.46} />

      {/* HERO */}
      <header className="section section-pad container" style={{ minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="eyebrow" data-reveal>Selective-disclosure identity — Stellar</div>
        <h1 className="h1" style={{ marginTop: 22, maxWidth: 980 }} data-reveal>
          Prove who you're allowed to be.<br />
          <span style={{ color: "var(--muted)" }}>Reveal nothing about who you are.</span>
        </h1>
        <p className="lead" style={{ marginTop: 26, maxWidth: 560 }} data-reveal>
          A trusted issuer vouches once. You prove eligibility in your browser. The chain learns only that
          your address qualifies — never a birth year, a country, or a name.
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 38, flexWrap: "wrap" }} data-reveal>
          <Link to="/app" className="btn btn-primary">Launch the prover ↗</Link>
          <Link to="/how-it-works" className="btn btn-tertiary">How it works</Link>
        </div>
        <div className="mono" style={{ marginTop: 70, fontSize: 12, letterSpacing: ".14em", color: "var(--muted-2)", animation: "cueBob 2.4s ease-in-out infinite", width: "fit-content" }}>
          scroll to enter ↓
        </div>
      </header>

      {/* 01 — THE PROBLEM */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>01 / The problem</div>
        <h2 className="h2" style={{ marginTop: 18, maxWidth: 880 }} data-reveal>
          Regulated apps need to know you're eligible. A public ledger is the worst possible place to prove it.
        </h2>
        <p className="lead" style={{ marginTop: 22, maxWidth: 680 }} data-reveal>
          18+, accredited, in an allowed region — the checks are reasonable. Writing the identity behind them
          to a chain that everyone can read, forever, is not. That's the compliance-versus-privacy trap.
        </p>
        <div className="card" style={{ marginTop: 40, maxWidth: 560 }} data-reveal>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>what they need to know</span><span className="ink-green">eligible ✓</span></div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>birth year</span><span style={{ color: "var(--faint)" }}>— withheld</span></div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>country</span><span style={{ color: "var(--faint)" }}>— withheld</span></div>
          <div className="data-row" style={{ borderBottom: "none" }}><span style={{ color: "var(--muted)" }}>name / address</span><span style={{ color: "var(--faint)" }}>— never collected</span></div>
        </div>
      </section>

      {/* 02 — THE FLOW */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>02 / The flow</div>
        <h2 className="h2" style={{ marginTop: 18, maxWidth: 760 }} data-reveal>
          Issue once. Prove in your browser. Verify on-chain.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, marginTop: 44 }}>
          {[
            { tag: "ISSUE", n: "01", title: "A trusted issuer vouches, once.", body: <>It KYCs you a single time and commits <code className="mono ink-indigo">leaf = Poseidon(birthYear, country, accredited, secret)</code> into a Merkle tree — publishing only the root to Stellar.</> },
            { tag: "PROVE", n: "02", title: "Generate the proof on your device.", body: <>In the browser, snarkjs builds a Groth16 proof that your hidden attributes satisfy the gate — 18+ · accredited · allowed region — and sit in the issuer's tree, bound to your wallet. ~4,525 constraints. Nothing leaves.</> },
            { tag: "VERIFY", n: "03", title: "Soroban checks it, on-chain.", body: <>The contract verifies the proof, rejects a re-used nullifier (one person, one action) and records: <span className="ink">G… is verified for this scope at ledger N.</span> Nothing about you.</> },
          ].map((c) => (
            <div className="card" key={c.n} data-reveal>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="numcard-tag">{c.tag}</span>
                <span className="numcard-n" style={{ color: "var(--faint)" }}>{c.n}</span>
              </div>
              <h3 className="h3" style={{ marginTop: 16 }}>{c.title}</h3>
              <p className="body" style={{ marginTop: 10 }}>{c.body}</p>
            </div>
          ))}
        </div>
        <Link to="/how-it-works" className="btn-arrow" style={{ marginTop: 32 }}>Read the full flow →</Link>
      </section>

      {/* WHAT THE CHAIN SEES */}
      <section className="section section-pad container" style={{ textAlign: "center" }}>
        <div className="eyebrow" data-reveal>What the chain sees</div>
        <div data-reveal style={{ position: "relative", margin: "26px 0 8px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(closest-side, rgba(52,211,153,.22), transparent 72%)", filter: "blur(8px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "125%", letterSpacing: "-.04em", fontSize: "clamp(3.4rem,12vw,9rem)", color: "var(--green)", lineHeight: 1 }}>
            VERIFIED
          </div>
        </div>
        <h2 className="h2" style={{ marginTop: 20 }} data-reveal>One boolean and an address. Nothing else.</h2>
        <p className="lead" style={{ margin: "20px auto 0", maxWidth: 620 }} data-reveal>
          Your birth year, country, and accreditation never appear — not on the ledger, not with the dApp,
          not anywhere off your device.
        </p>
        <div className="card card-glow" style={{ margin: "40px auto 0", maxWidth: 460, textAlign: "left" }} data-reveal>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="numcard-tag">STELLAR.EXPERT · TESTNET</span>
            <span className="pill pill-ok">● attestation</span>
          </div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>address</span><span className="mono">G…ODBQWYLQ</span></div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>status</span><span className="ink-green mono">verified ✓</span></div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>scope</span><span className="mono">0x…424242</span></div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>ledger</span><span className="mono">6,341,902</span></div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>birth year</span><span style={{ color: "var(--faint)" }}>—</span></div>
          <div className="data-row"><span style={{ color: "var(--muted)" }}>country</span><span style={{ color: "var(--faint)" }}>—</span></div>
          <div className="data-row" style={{ borderBottom: "none" }}><span style={{ color: "var(--muted)" }}>accredited</span><span style={{ color: "var(--faint)" }}>—</span></div>
        </div>
      </section>

      {/* 03 — UNDER THE HOOD */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>03 / Under the hood</div>
        <h2 className="h2" style={{ marginTop: 18, maxWidth: 820 }} data-reveal>
          Groth16 over BN254, verified by Soroban host functions.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16, marginTop: 44 }}>
          <SpecCard label="CIRCUIT" title="Halo(depth = 16)" rows={["Poseidon Merkle inclusion", "birthYear ≤ minBirthYear", "accredited ≥ required", "country ≠ banned"]} accent="nullifier = Poseidon(secret, scope)" />
          <SpecCard label="PUBLIC SIGNALS" title="7 field elements" rows={["[0] nullifier", "[1] root", "[2] scope", "[3-5] policy", "[6] addr (wallet-bound)"]} />
          <SpecCard label="ENCODING" title="EIP-196/197 bytes" rows={["G1 · 64B x‖y", "G2 · 128B c1‖c0", "U256 · 32B big-endian"]} accent="⚠ Fp2 imaginary-first" warn />
          <SpecCard label="LIVE · TESTNET" title="2 contracts" rows={[`verifier → ${short(VERIFIER_ID)}`, `sale → ${short(SALE_ID)}`, "tx → 3272ef…f1bb"]} />
        </div>
        <Link to="/developers" className="btn-arrow" style={{ marginTop: 32 }}>Read the spec &amp; encoding →</Link>
      </section>

      {/* 04 — WHERE IT GOES */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>04 / Where it goes</div>
        <h2 className="h2" style={{ marginTop: 18, maxWidth: 720 }} data-reveal>
          One credential. Every gate that should ask less.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 18, marginTop: 44 }}>
          {[
            { tag: "REGULATED SALE", title: "Token sales that open only to the eligible.", body: <>The gated-sale contract calls <code className="mono ink-indigo">is_verified_for</code> before any buy. A trivial policy reverts on-chain.</> },
            { tag: "DAO VOTE", title: "One person, one vote — provably.", body: <>A per-scope nullifier makes a second vote from the same identity revert. No wallet-farming the ballot.</> },
            { tag: "AIRDROP", title: "Sybil-resistant claims.", body: <>Distribute to real, eligible humans without asking any of them to dox a single attribute to claim.</> },
          ].map((c) => (
            <div className="card" key={c.tag} data-reveal>
              <span className="numcard-tag">{c.tag}</span>
              <h3 className="h3" style={{ marginTop: 14 }}>{c.title}</h3>
              <p className="body" style={{ marginTop: 10 }}>{c.body}</p>
            </div>
          ))}
        </div>
        <Link to="/use-cases" className="btn-arrow" style={{ marginTop: 32 }}>See all use cases →</Link>
      </section>

      {/* FINAL CTA */}
      <section className="section section-pad container" style={{ textAlign: "center" }}>
        <h2 className="h1" style={{ fontSize: "clamp(2.6rem,7vw,5.6rem)" }} data-reveal>
          Prove you're allowed.<br /><span style={{ color: "var(--muted)" }}>Reveal nothing.</span>
        </h2>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 38, flexWrap: "wrap" }} data-reveal>
          <Link to="/app" className="btn btn-primary">Launch the prover ↗</Link>
          <a href="https://github.com/OoJae/halo" target="_blank" rel="noreferrer" className="btn btn-tertiary">View the repo ↗</a>
        </div>
        <p className="mono" style={{ marginTop: 30, fontSize: 12, color: "var(--muted-2)", letterSpacing: ".06em" }} data-reveal>
          live on Stellar testnet · verify tx 3272ef37…f1bb · Groth16 / BN254
        </p>
      </section>
    </>
  );
}

function SpecCard({ label, title, rows, accent, warn }: { label: string; title: string; rows: string[]; accent?: string; warn?: boolean }) {
  return (
    <div className="card-spec" data-reveal>
      <div className="numcard-tag">{label}</div>
      <h3 className="h3" style={{ marginTop: 12, marginBottom: 14 }}>{title}</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
        {rows.map((r) => (
          <li key={r} className="mono" style={{ fontSize: 12.5, color: "var(--text-3)" }}>{r}</li>
        ))}
        {accent && <li className="mono" style={{ fontSize: 12.5, marginTop: 4, color: warn ? "var(--warn)" : "var(--green)" }}>{accent}</li>}
      </ul>
    </div>
  );
}
