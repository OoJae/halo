import RingCanvas from "../components/RingCanvas";

// Faithful port of brand/Halo - Developers.dc.html. Inline styles mirror the source verbatim;
// scroll reveals use the [data-reveal] rule in brand.css. Nav + Footer come from Layout.
export default function Developers() {
  return (
    <>
      <RingCanvas R={250} rt={15} ringN={1400} tilt={0.5} cxDesktop={0.74} cyBase={0.32} cyFactor={0.12} cyMax={0.4} />

      {/* HEADER */}
      <header style={{ position: "relative", zIndex: 2, minHeight: "clamp(480px,72vh,760px)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "104px clamp(22px,5vw,60px) clamp(40px,6vh,80px)", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1.05vw,13px)", letterSpacing: ".28em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(22px,3vh,34px)" }}>For developers</div>
        <h1 style={{ margin: 0, maxWidth: 980, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", letterSpacing: "-.028em", lineHeight: ".96", fontSize: "clamp(2.4rem,6vw,5.6rem)", color: "#E9ECF4" }}>Groth16 over BN254, verified by Soroban host functions.</h1>
        <p style={{ margin: "clamp(26px,4vh,38px) 0 0", maxWidth: 640, fontFamily: "var(--sans)", fontWeight: 400, fontSize: "clamp(1.05rem,1.5vw,1.32rem)", lineHeight: 1.5, color: "#A7AFC4" }}>The circuit, the encoding spec, and the contracts — exactly as they run on testnet today. Hand-ported BN254 pairing verifier; in-browser proving; one attestation per scope.</p>
        <div style={{ marginTop: "clamp(30px,4vh,44px)", display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: ".06em" }}>
          <span style={{ border: "1px solid #1b1e34", borderRadius: 2, padding: "7px 12px", color: "#9aa2b8" }}>circom 2.2.3</span>
          <span style={{ border: "1px solid #1b1e34", borderRadius: 2, padding: "7px 12px", color: "#9aa2b8" }}>snarkjs 0.7.6</span>
          <span style={{ border: "1px solid #1b1e34", borderRadius: 2, padding: "7px 12px", color: "#9aa2b8" }}>soroban-sdk 25.3</span>
          <span style={{ border: "1px solid #1b1e34", borderRadius: 2, padding: "7px 12px", color: "#9aa2b8" }}>rust 1.92 · wasm32v1</span>
        </div>
      </header>

      {/* CIRCUIT */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(28px,4vw,60px)", alignItems: "start" }}>
          <div data-reveal>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 20 }}>The circuit</div>
            <h2 style={{ margin: "0 0 18px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>Halo(depth = 16)</h2>
            <p style={{ margin: "0 0 16px", fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#A7AFC4" }}>~4,525 non-linear constraints over BN254, set up against the Hermez <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#B7B8FF" }}>ptau&nbsp;14</span> (16,384). Range and boolean constraints bind the comparator inputs, so the gates are sound independent of issuer well-formedness.</p>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.65, color: "#7B8499" }}>A predicate violation throws at witness generation — the intended "this proof can't exist" behavior.</p>
          </div>
          <div data-reveal style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 24, fontFamily: "var(--mono)", fontSize: 12.5, lineHeight: 1.7 }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#646b80", marginBottom: 14 }}>SIGNALS</div>
            <div style={{ color: "#6b7288" }}>private</div>
            <div style={{ color: "#cdd3e4", marginBottom: 12 }}>birthYear, country, accredited,<br />secret, pathElements[16], pathIndices[16]</div>
            <div style={{ color: "#6b7288" }}>public</div>
            <div style={{ color: "#cdd3e4", marginBottom: 12 }}>root, scope, minBirthYear,<br />requireAccredited, bannedCountry, addr</div>
            <div style={{ color: "#6b7288" }}>output</div>
            <div style={{ color: "#B7B8FF" }}>nullifier</div>
          </div>
        </div>
      </section>

      {/* PUBLIC SIGNALS ORDER */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F,#0a0c18)", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 18 }}>Public-signals order</div>
          <p data-reveal style={{ margin: "0 0 clamp(32px,5vh,52px)", maxWidth: 680, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.6, color: "#A7AFC4" }}>snarkjs writes outputs first, then declared public inputs. The contract re-reads them in exactly this order.</p>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, fontFamily: "var(--mono)" }}>
            <div style={{ background: "#0A0C16", border: "1px solid #232653", borderRadius: 5, padding: 18 }}><div style={{ color: "#646b80", fontSize: 11 }}>[0]</div><div style={{ color: "#B7B8FF", fontSize: 14, marginTop: 6 }}>nullifier</div></div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 18 }}><div style={{ color: "#646b80", fontSize: 11 }}>[1]</div><div style={{ color: "#cdd3e4", fontSize: 14, marginTop: 6 }}>root</div></div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 18 }}><div style={{ color: "#646b80", fontSize: 11 }}>[2]</div><div style={{ color: "#cdd3e4", fontSize: 14, marginTop: 6 }}>scope</div></div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 18 }}><div style={{ color: "#646b80", fontSize: 11 }}>[3]</div><div style={{ color: "#cdd3e4", fontSize: 14, marginTop: 6 }}>minBirthYear</div></div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 18 }}><div style={{ color: "#646b80", fontSize: 11 }}>[4]</div><div style={{ color: "#cdd3e4", fontSize: 14, marginTop: 6 }}>requireAccredited</div></div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 18 }}><div style={{ color: "#646b80", fontSize: 11 }}>[5]</div><div style={{ color: "#cdd3e4", fontSize: 14, marginTop: 6 }}>bannedCountry</div></div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 18 }}><div style={{ color: "#646b80", fontSize: 11 }}>[6]</div><div style={{ color: "#cdd3e4", fontSize: 14, marginTop: 6 }}>addr</div></div>
          </div>
        </div>
      </section>

      {/* ENCODING SPEC */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ maxWidth: 760, marginBottom: "clamp(36px,5vh,56px)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 18 }}>The encoding spec</div>
            <h2 style={{ margin: "0 0 16px", fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>32-byte big-endian, EIP-196/197 compatible.</h2>
            <p style={{ margin: 0, fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.6, color: "#A7AFC4" }}>Field elements encode uncompressed. The one integration risk worth memorizing is the G2 Fp2 ordering.</p>
          </div>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(14px,1.6vw,18px)" }}>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 24, fontFamily: "var(--mono)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 14 }}>G1 · BytesN&lt;64&gt;</div>
              <div style={{ fontSize: 18, color: "#E9ECF4", marginBottom: 10 }}>64 bytes</div>
              <div style={{ fontSize: 12.5, color: "#9aa2b8" }}>x_be(32) ‖ y_be(32)</div>
              <div style={{ fontSize: 12, color: "#6b7288", marginTop: 8 }}>pi_a, pi_c, vk_alpha, each IC</div>
            </div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 24, fontFamily: "var(--mono)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 14 }}>G2 · BytesN&lt;128&gt;</div>
              <div style={{ fontSize: 18, color: "#E9ECF4", marginBottom: 10 }}>128 bytes</div>
              <div style={{ fontSize: 12.5, color: "#9aa2b8" }}>x.c1 ‖ x.c0 ‖ y.c1 ‖ y.c0</div>
              <div style={{ fontSize: 12, color: "#6b7288", marginTop: 8 }}>pi_b, vk_beta / gamma / delta</div>
            </div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 5, padding: 24, fontFamily: "var(--mono)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 14 }}>SCALAR · U256</div>
              <div style={{ fontSize: 18, color: "#E9ECF4", marginBottom: 10 }}>32 bytes</div>
              <div style={{ fontSize: 12.5, color: "#9aa2b8" }}>big-endian</div>
              <div style={{ fontSize: 12, color: "#6b7288", marginTop: 8 }}>each public signal</div>
            </div>
            <div style={{ background: "rgba(251,191,107,.05)", border: "1px solid #3a2f10", borderRadius: 5, padding: 24, fontFamily: "var(--mono)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#fbbf6b", marginBottom: 14 }}>⚠ THE FP2 GOTCHA</div>
              <div style={{ fontSize: 13, color: "#e7d3a8", lineHeight: 1.6 }}>snarkjs emits Fp2 as [c0, c1]. The BN254 host wants the <strong>imaginary part first</strong> — encode c1 ‖ c0. Get it wrong and a valid proof fails on-chain.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTRACTS */}
      <section style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#07080F,#0a0c18)", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 18 }}>The contracts</div>
          <h2 data-reveal style={{ margin: "0 0 clamp(36px,5vh,56px)", maxWidth: 780, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>Two Soroban contracts, live on testnet.</h2>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(14px,1.8vw,20px)" }}>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 19, color: "#E9ECF4" }}>halo-verifier</span><a href="https://stellar.expert/explorer/testnet/contract/CCPNP4O6LOVYTDWX3MWXJRFI74A6ORMS3WHW6OIX2OQM2ZFIFRNEDNSV" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#B7B8FF" }}>CCPNP…NSV ↗</a></div>
              <div style={{ display: "grid", gap: 8, fontFamily: "var(--mono)", fontSize: 12.5, color: "#9aa2b8" }}>
                <div>set_issuer_root(root)</div>
                <div>set_policy(scope, …)</div>
                <div style={{ color: "#cdd3e4" }}>verify(caller, proof, signals)</div>
                <div style={{ color: "#cdd3e4" }}>is_verified_for(who, scope, …)</div>
                <div>attested_at(who, scope)</div>
              </div>
            </div>
            <div style={{ background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}><span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 19, color: "#E9ECF4" }}>gated-sale</span><a href="https://stellar.expert/explorer/testnet/contract/CAHEKPK57DXY3SGQGYA5KQBHSWW4IUMJQEYEZMBXA3G6SYHBVVWUUELJ" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#B7B8FF" }}>CAHEK…ELJ ↗</a></div>
              <div style={{ display: "grid", gap: 8, fontFamily: "var(--mono)", fontSize: 12.5, color: "#9aa2b8" }}>
                <div>initialize(admin, verifier, scope)</div>
                <div>is_open(who)</div>
                <div style={{ color: "#cdd3e4" }}>buy(buyer, amount)</div>
                <div style={{ color: "#6b7288" }}>→ cross-contract is_verified_for</div>
                <div style={{ color: "#6b7288" }}>SALE_SCOPE = 424242</div>
              </div>
            </div>
          </div>
          <div data-reveal style={{ marginTop: 18, background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 6, padding: "22px 26px", fontFamily: "var(--mono)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#646b80", marginBottom: 14 }}>ERROR CODES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "10px 22px", fontSize: 12.5, color: "#9aa2b8" }}>
              <div><span style={{ color: "#f87171" }}>#3</span> BadSignals</div>
              <div><span style={{ color: "#f87171" }}>#4</span> AddrMismatch</div>
              <div><span style={{ color: "#f87171" }}>#5</span> RootMismatch</div>
              <div><span style={{ color: "#f87171" }}>#6</span> NullifierUsed</div>
              <div><span style={{ color: "#f87171" }}>#7</span> InvalidProof</div>
              <div><span style={{ color: "#f87171" }}>#8</span> PolicyMismatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* RUN IT */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(60px,9vh,110px) clamp(22px,5vw,60px)" }}>
          <div data-reveal style={{ maxWidth: 760, marginBottom: "clamp(32px,4vh,48px)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: 18 }}>Run it</div>
            <h2 style={{ margin: 0, fontFamily: "var(--sans)", fontWeight: 700, fontStretch: "112%", letterSpacing: "-.022em", lineHeight: 1.04, fontSize: "clamp(1.7rem,3.6vw,2.8rem)", color: "#E9ECF4" }}>From a clean checkout.</h2>
          </div>
          <div data-reveal style={{ background: "#06070D", border: "1px solid #1b1e34", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", borderBottom: "1px solid #14162400", background: "#0A0C16" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#2a3048" }}></span>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#2a3048" }}></span>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#2a3048" }}></span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#646b80", marginLeft: 10 }}>scripts/dev.sh</span>
            </div>
            <div style={{ padding: "24px clamp(18px,3vw,30px)", fontFamily: "var(--mono)", fontSize: "clamp(12px,1.2vw,13.5px)", lineHeight: 2, color: "#cdd3e4", overflowX: "auto" }}>
              <div><span style={{ color: "#646b80" }}># 1 — circuit: compile + trusted setup + sample proof</span></div>
              <div><span style={{ color: "#34D399" }}>cd</span> circuits &amp;&amp; npm install</div>
              <div><span style={{ color: "#34D399" }}>bash</span> scripts/setup.sh halo</div>
              <div style={{ height: 10 }}></div>
              <div><span style={{ color: "#646b80" }}># 2 — contracts: test + deploy to testnet</span></div>
              <div><span style={{ color: "#34D399" }}>cd</span> ../contracts/halo-verifier &amp;&amp; cargo test</div>
              <div><span style={{ color: "#34D399" }}>stellar</span> contract build</div>
              <div style={{ height: 10 }}></div>
              <div><span style={{ color: "#646b80" }}># 3 — frontend + issuer api (the demo)</span></div>
              <div><span style={{ color: "#34D399" }}>cd</span> ../../frontend &amp;&amp; npm install</div>
              <div><span style={{ color: "#34D399" }}>bash</span> ../scripts/dev.sh <span style={{ color: "#646b80" }}># issuer :8787 · web :5173</span></div>
            </div>
          </div>
          <div data-reveal style={{ marginTop: "clamp(36px,5vh,52px)", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <a href="https://github.com/OoJae/halo" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 13.5, letterSpacing: ".04em", color: "#0A0B12", background: "#B7B8FF", padding: "15px 26px", borderRadius: 2 }}>View the repo ↗</a>
            <a href="https://stellar.expert/explorer/testnet/tx/3272ef373980c564912e037ec5ca0e0ecc2bd591ac6dc8e21f669271dbcff1bb" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: ".04em", color: "#cdd3e4", borderBottom: "1px solid #2a3048", paddingBottom: 4 }}>Example verify tx ↗</a>
          </div>
        </div>
      </section>
    </>
  );
}
