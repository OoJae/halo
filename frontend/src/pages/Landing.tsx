import { Link } from "react-router-dom";
import HaloCanvas from "../components/HaloCanvas";

// Faithful port of brand/Halo.dc.html. Inline styles mirror the source verbatim;
// scroll reveals use the [data-reveal] rule in brand.css (animation-timeline: view()).
const REVEAL = "revUp .9s cubic-bezier(.16,1,.3,1) both";
const rise = (delay: number) => ({ animation: `${REVEAL}`, animationDelay: `${delay}s`, opacity: 0 } as React.CSSProperties);

export default function Landing() {
  return (
    <>
      <HaloCanvas scrollDriven />

      {/* HERO — fly-through scene */}
      <section style={{ position: "relative", zIndex: 2, height: "100vh" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 5, textAlign: "center", padding: "0 clamp(20px,6vw,40px)" }}>
          <div style={{ ...rise(0.1), fontFamily: "var(--mono)", fontSize: "clamp(11px,1.05vw,13px)", letterSpacing: ".28em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(20px,3vh,32px)" }}>Selective-disclosure identity — Stellar</div>
          <h1 style={{ margin: 0, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "125%", letterSpacing: "-.03em", lineHeight: ".9", fontSize: "clamp(2.9rem,8.4vw,8rem)", color: "#E9ECF4" }}>
            <span style={{ display: "block", overflow: "hidden", paddingBottom: ".04em" }}><span style={{ display: "block", ...rise(0.22) }}>Prove who you're</span></span>
            <span style={{ display: "block", overflow: "hidden", paddingBottom: ".04em" }}><span style={{ display: "block", ...rise(0.34) }}>allowed to be.</span></span>
          </h1>
          <p style={{ ...rise(0.46), margin: "clamp(20px,3vh,30px) auto 0", maxWidth: 540, fontFamily: "var(--sans)", fontWeight: 400, fontSize: "clamp(1.05rem,1.5vw,1.32rem)", lineHeight: 1.45, color: "#A7AFC4" }}>Reveal nothing about who you are.</p>
          <div style={{ ...rise(0.58), marginTop: "clamp(28px,4vh,40px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            <Link to="/app" style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: ".04em", color: "#0A0B12", background: "#B7B8FF", padding: "14px 24px", borderRadius: 2 }}>Launch the prover ↗</Link>
            <Link to="/how-it-works" style={{ fontFamily: "var(--mono)", fontSize: 12.5, letterSpacing: ".08em", color: "#cdd3e4", borderBottom: "1px solid #2a3048", paddingBottom: 3 }}>How it works</Link>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, zIndex: 5, textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#6b7288", animation: "cueBob 2.4s ease-in-out infinite" }}>scroll to enter ↓</div>
      </section>
      <div style={{ position: "relative", zIndex: 2, height: "60vh" }} />

      {/* A · THE PROBLEM */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(90px,15vh,180px) clamp(22px,5vw,60px) clamp(60px,9vh,110px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1vw,12.5px)", letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(26px,4vh,40px)" }}>01 / The problem</div>
          <h2 data-reveal style={{ margin: 0, maxWidth: 980, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.02, fontSize: "clamp(2rem,5.2vw,4rem)", color: "#E9ECF4" }}>Regulated apps need to know you're eligible. A public ledger is the worst possible place to prove it.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(20px,3vw,40px)", marginTop: "clamp(48px,7vh,80px)" }}>
            <p data-reveal style={{ margin: 0, fontSize: "clamp(1.05rem,1.4vw,1.22rem)", lineHeight: 1.6, color: "#A7AFC4" }}>18+, accredited, in an allowed region — the checks are reasonable. Writing the identity behind them to a chain that everyone can read, forever, is not. That's the compliance-versus-privacy trap.</p>
            <div data-reveal style={{ borderTop: "1px solid #1A1D2E", paddingTop: 22 }}>
              {[["what they need to know", "eligible ✓", "#34D399"], ["birth year", "— withheld", "#3a4055"], ["country", "— withheld", "#3a4055"], ["name / address", "— never collected", "#3a4055"]].map(([k, v, c], i, arr) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px dashed #1A1D2E" : "none", fontFamily: "var(--mono)", fontSize: 13 }}>
                  <span style={{ color: "#7B8499" }}>{k}</span><span style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* B · HOW IT WORKS */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F 0%,#090B15 50%,#07080F 100%)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(70px,11vh,130px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1vw,12.5px)", letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 24 }}>02 / The flow</div>
          <h2 data-reveal style={{ margin: "0 0 clamp(48px,7vh,80px)", maxWidth: 860, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.02, fontSize: "clamp(2rem,5vw,3.7rem)", color: "#E9ECF4" }}>Issue once. Prove in your browser. Verify on-chain.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: "clamp(16px,2vw,22px)" }}>
            {[
              { n: "01", tag: "ISSUE", nc: "#8B8CF8", tc: "#646b80", glow: false, title: "A trusted issuer vouches, once.", body: <>It KYCs you a single time and commits <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#B7B8FF" }}>leaf = Poseidon(birthYear, country, accredited, secret)</span> into a Merkle tree — publishing only the <span style={{ color: "#cdd3e4" }}>root</span> to Stellar.</> },
              { n: "02", tag: "PROVE", nc: "#B7B8FF", tc: "#8089a0", glow: true, title: "Generate the proof on your device.", body: <>In the browser, snarkjs builds a Groth16 proof that your hidden attributes satisfy the gate — <span style={{ color: "#cdd3e4" }}>18+ · accredited · allowed region</span> — and sit in the issuer's tree, bound to your wallet. <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#B7B8FF" }}>~4,525 constraints.</span> Nothing leaves.</> },
              { n: "03", tag: "VERIFY", nc: "#34D399", tc: "#646b80", glow: false, title: "Soroban checks it, on-chain.", body: <>The contract verifies the proof, rejects a re-used <span style={{ color: "#cdd3e4" }}>nullifier</span> (one person, one action) and records: <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#34D399" }}>G… is verified for this scope at ledger N.</span> Nothing about you.</> },
            ].map((c) => (
              <div key={c.n} data-reveal style={{ background: "rgba(12,14,24,.5)", border: `1px solid ${c.glow ? "#232653" : "#1b1e34"}`, borderRadius: 5, padding: "clamp(24px,2.4vw,32px)", boxShadow: c.glow ? "0 0 0 1px rgba(139,140,248,.08),0 30px 70px -50px rgba(139,140,248,.5)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                  <span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", fontSize: 34, color: c.nc }}>{c.n}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".18em", color: c.tc }}>{c.tag}</span>
                </div>
                <h3 style={{ margin: "0 0 12px", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 21, letterSpacing: "-.01em", color: "#E9ECF4" }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "#9aa2b8" }}>{c.body}</p>
              </div>
            ))}
          </div>
          <Link to="/how-it-works" data-reveal style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: "clamp(40px,6vh,64px)", fontFamily: "var(--mono)", fontSize: 13, letterSpacing: ".06em", color: "#B7B8FF", borderBottom: "1px solid #2a3048", paddingBottom: 4 }}>Read the full flow →</Link>
        </div>
      </section>

      {/* C · WHAT THE CHAIN SEES (ECLIPSE) */}
      <section style={{ position: "relative", zIndex: 2, background: "#06070D", borderTop: "1px solid #12141f", borderBottom: "1px solid #12141f", overflow: "hidden" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(90px,14vh,170px) clamp(22px,5vw,60px)" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "clamp(220px,34vh,360px)" }}>
            <span data-reveal style={{ fontFamily: "var(--sans)", fontWeight: 900, fontStretch: "125%", letterSpacing: "-.03em", lineHeight: ".9", fontSize: "clamp(3.4rem,15vw,12rem)", color: "#E9ECF4", whiteSpace: "nowrap" }}>VERIFIED</span>
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "clamp(180px,30vw,340px)", height: "clamp(180px,30vw,340px)", borderRadius: "50%", background: "#06070D", border: "1.5px solid rgba(139,140,248,.85)", boxShadow: "inset 0 0 80px rgba(0,0,0,.95),0 0 0 1px rgba(139,140,248,.5),0 0 34px rgba(139,140,248,.55),0 0 90px rgba(139,140,248,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "clamp(10px,1.1vw,12px)", letterSpacing: ".14em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.7, color: "#6a7290" }}>your data<br /><span style={{ color: "#3a4055" }}>— hidden —</span></span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(28px,5vw,72px)", alignItems: "center", marginTop: "clamp(40px,6vh,64px)" }}>
            <div data-reveal>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", color: "#7B8499", marginBottom: 18 }}>What the chain sees</div>
              <h2 style={{ margin: 0, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "110%", letterSpacing: "-.02em", lineHeight: 1.05, fontSize: "clamp(1.7rem,3.4vw,2.6rem)", color: "#E9ECF4" }}>One boolean and an address. Nothing else.</h2>
              <p style={{ margin: "18px 0 0", fontSize: "clamp(1rem,1.3vw,1.18rem)", lineHeight: 1.6, color: "#A7AFC4", maxWidth: 440 }}>Your birth year, country, and accreditation never appear — not on the ledger, not with the dApp, not anywhere off your device.</p>
            </div>
            <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: "22px 24px", fontFamily: "var(--mono)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid #1A1D2E", paddingBottom: 14 }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".2em", color: "#646b80" }}>STELLAR.EXPERT · TESTNET</span><span style={{ fontSize: 11, color: "#34D399" }}>● attestation</span>
              </div>
              <div style={{ display: "grid", gap: 11, fontSize: 12.5 }}>
                {[["address", "G…ODBQWYLQ", "#cdd3e4", false], ["status", "verified ✓", "#34D399", false], ["scope", "0x…424242", "#cdd3e4", false], ["ledger", "6,341,902", "#cdd3e4", false], ["birth year", "—", "#3a4055", true], ["country", "—", "#3a4055", false], ["accredited", "—", "#3a4055", false]].map(([k, v, c, top]) => (
                  <div key={k as string} style={{ display: "flex", justifyContent: "space-between", gap: 18, ...(top ? { borderTop: "1px dashed #1A1D2E", paddingTop: 11 } : {}) }}>
                    <span style={{ color: "#6b7288" }}>{k}</span><span style={{ color: c as string }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D · UNDER THE HOOD */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(70px,11vh,130px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1vw,12.5px)", letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 24 }}>03 / Under the hood</div>
          <h2 data-reveal style={{ margin: "0 0 clamp(40px,6vh,68px)", maxWidth: 820, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.02, fontSize: "clamp(2rem,5vw,3.7rem)", color: "#E9ECF4" }}>Groth16 over BN254, verified by Soroban host functions.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(14px,1.6vw,18px)" }}>
            <SpecCard label="CIRCUIT" title="Halo(depth = 16)">
              <div>Poseidon Merkle inclusion</div><div>birthYear ≤ minBirthYear</div><div>accredited ≥ required</div><div>country ≠ banned</div>
              <div style={{ color: "#B7B8FF" }}>nullifier = Poseidon(secret, scope)</div>
            </SpecCard>
            <SpecCard label="PUBLIC SIGNALS" title="7 field elements" sm>
              <div><span style={{ color: "#646b80" }}>[0]</span> nullifier</div><div><span style={{ color: "#646b80" }}>[1]</span> root</div><div><span style={{ color: "#646b80" }}>[2]</span> scope</div><div><span style={{ color: "#646b80" }}>[3-5]</span> policy</div><div><span style={{ color: "#646b80" }}>[6]</span> addr <span style={{ color: "#3a4055" }}>(wallet-bound)</span></div>
            </SpecCard>
            <SpecCard label="ENCODING" title="EIP-196/197 bytes">
              <div>G1 · 64B <span style={{ color: "#646b80" }}>x‖y</span></div><div>G2 · 128B <span style={{ color: "#646b80" }}>c1‖c0</span></div><div>U256 · 32B big-endian</div>
              <div style={{ color: "#fbbf6b" }}>⚠ Fp2 imaginary-first</div>
            </SpecCard>
            <SpecCard label="LIVE · TESTNET" title="2 contracts">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: "#6b7288" }}>verifier</span><span style={{ color: "#B7B8FF" }}>CCPNP…NSV</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: "#6b7288" }}>sale</span><span style={{ color: "#B7B8FF" }}>CAHEK…ELJ</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: "#6b7288" }}>tx</span><span style={{ color: "#34D399" }}>3272ef…f1bb</span></div>
            </SpecCard>
          </div>
          <Link to="/developers" data-reveal style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: "clamp(40px,6vh,64px)", fontFamily: "var(--mono)", fontSize: 13, letterSpacing: ".06em", color: "#B7B8FF", borderBottom: "1px solid #2a3048", paddingBottom: 4 }}>Read the spec &amp; encoding →</Link>
        </div>
      </section>

      {/* E · USE CASES */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F 0%,#090B15 100%)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(70px,11vh,130px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1vw,12.5px)", letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 24 }}>04 / Where it goes</div>
          <h2 data-reveal style={{ margin: "0 0 clamp(40px,6vh,68px)", maxWidth: 820, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.02, fontSize: "clamp(2rem,5vw,3.7rem)", color: "#E9ECF4" }}>One credential. Every gate that should ask less.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: "clamp(16px,2vw,20px)" }}>
            {[
              { tag: "REGULATED SALE", title: "Token sales that open only to the eligible.", body: <>The gated-sale contract calls <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "#B7B8FF" }}>is_verified_for</span> before any buy. A trivial policy reverts on-chain.</> },
              { tag: "DAO VOTE", title: "One person, one vote — provably.", body: <>A per-scope nullifier makes a second vote from the same identity revert. No wallet-farming the ballot.</> },
              { tag: "AIRDROP", title: "Sybil-resistant claims.", body: <>Distribute to real, eligible humans without asking any of them to dox a single attribute to claim.</> },
            ].map((c) => (
              <div key={c.tag} data-reveal style={{ border: "1px solid #1b1e34", borderRadius: 5, padding: "clamp(24px,2.4vw,30px)", background: "rgba(10,12,22,.4)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".16em", color: "#8B8CF8", marginBottom: 18 }}>{c.tag}</div>
                <h3 style={{ margin: "0 0 10px", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 20, color: "#E9ECF4" }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#9aa2b8" }}>{c.body}</p>
              </div>
            ))}
          </div>
          <Link to="/use-cases" data-reveal style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: "clamp(40px,6vh,64px)", fontFamily: "var(--mono)", fontSize: 13, letterSpacing: ".06em", color: "#B7B8FF", borderBottom: "1px solid #2a3048", paddingBottom: 4 }}>See all use cases →</Link>
        </div>
      </section>

      {/* F · CTA */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(100px,16vh,200px) clamp(22px,5vw,60px)", textAlign: "center" }}>
          <h2 data-reveal style={{ margin: 0, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "122%", letterSpacing: "-.03em", lineHeight: ".94", fontSize: "clamp(2.6rem,8vw,6.4rem)", color: "#E9ECF4" }}>Prove you're allowed.<br />Reveal nothing.</h2>
          <div data-reveal style={{ marginTop: "clamp(36px,5vh,52px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
            <Link to="/app" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#0A0B12", background: "#B7B8FF", padding: "15px 26px", borderRadius: 2 }}>Launch the prover ↗</Link>
            <a href="https://github.com/OoJae/halo" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#E9ECF4", background: "transparent", border: "1px solid #2a3048", padding: "15px 26px", borderRadius: 2 }}>View the repo ↗</a>
          </div>
          <div data-reveal style={{ marginTop: "clamp(40px,6vh,64px)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".06em", color: "#5d6478" }}>live on Stellar testnet · verify tx <span style={{ color: "#8089a0" }}>3272ef37…f1bb</span> · Groth16 / BN254</div>
        </div>
      </section>
    </>
  );
}

function SpecCard({ label, title, sm, children }: { label: string; title: string; sm?: boolean; children: React.ReactNode }) {
  return (
    <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 24 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 16 }}>{label}</div>
      <div style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 18, color: "#E9ECF4", marginBottom: 14 }}>{title}</div>
      <div style={{ display: "grid", gap: 8, fontFamily: "var(--mono)", fontSize: sm ? 11.5 : 12, color: "#9aa2b8" }}>{children}</div>
    </div>
  );
}
