import HaloCanvas from "../components/HaloCanvas";
import { VERIFIER_ID, SALE_ID, EXPLORER_CONTRACT, EXPLORER_TX } from "../lib/stellar";

const EXAMPLE_TX = "3272ef373980c564912e037ec5ca0e0ecc2bd591ac6dc8e21f669271dbcff1bb";
const short = (s: string) => `${s.slice(0, 5)}…${s.slice(-3)}`;

export default function Developers() {
  return (
    <>
      <HaloCanvas cx={0.8} cy={0.28} tunnelN={900} />

      <header className="section section-pad container">
        <div className="eyebrow" data-reveal>For developers</div>
        <h1 className="h1" style={{ marginTop: 20, fontSize: "clamp(2.2rem,5.5vw,4.6rem)", maxWidth: 940 }} data-reveal>
          Groth16 over BN254, verified by Soroban host functions.
        </h1>
        <p className="lead" style={{ marginTop: 24, maxWidth: 700 }} data-reveal>
          The circuit, the encoding spec, and the contracts — exactly as they run on testnet today.
          Hand-ported BN254 pairing verifier; in-browser proving; one attestation per scope.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }} data-reveal>
          {["circom 2.2.3", "snarkjs 0.7.6", "soroban-sdk 25.3", "rust 1.92 · wasm32v1"].map((t) => (
            <span className="pill" key={t}>{t}</span>
          ))}
        </div>
      </header>

      {/* THE CIRCUIT */}
      <section className="section section-pad container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px,4vw,56px)", alignItems: "start" }} className="hiw-row">
          <div data-reveal>
            <div className="eyebrow">The circuit</div>
            <h2 className="h2" style={{ marginTop: 16, fontSize: "clamp(1.7rem,3vw,2.6rem)" }}>Halo(depth = 16)</h2>
            <p className="body" style={{ marginTop: 16 }}>
              ~4,525 non-linear constraints over BN254, set up against the Hermez <code className="mono ink-indigo">ptau 14</code> (16,384).
              Range and boolean constraints bind the comparator inputs, so the gates are sound independent of
              issuer well-formedness.
            </p>
            <p className="body" style={{ marginTop: 14 }}>
              A predicate violation throws at witness generation — the intended "this proof can't exist" behavior.
            </p>
          </div>
          <div className="card-spec" data-reveal>
            <div className="numcard-tag">SIGNALS</div>
            <div className="mono" style={{ fontSize: 12.5, marginTop: 14, lineHeight: 1.9, color: "var(--text-3)" }}>
              <div style={{ color: "var(--muted-2)" }}>private</div>
              <div>birthYear, country, accredited, secret,</div>
              <div>pathElements[16], pathIndices[16]</div>
              <div style={{ color: "var(--muted-2)", marginTop: 12 }}>public</div>
              <div>root, scope, minBirthYear,</div>
              <div>requireAccredited, bannedCountry, addr</div>
              <div style={{ color: "var(--muted-2)", marginTop: 12 }}>output</div>
              <div className="ink-green">nullifier</div>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC-SIGNALS ORDER */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>Public-signals order</div>
        <p className="lead" style={{ marginTop: 16, maxWidth: 680 }} data-reveal>
          snarkjs writes outputs first, then declared public inputs. The contract re-reads them in exactly this order.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 32 }}>
          {[
            ["[0]", "nullifier"], ["[1]", "root"], ["[2]", "scope"], ["[3]", "minBirthYear"],
            ["[4]", "requireAccredited"], ["[5]", "bannedCountry"], ["[6]", "addr"],
          ].map(([i, name]) => (
            <div className="card-spec" key={i} style={{ padding: 18 }} data-reveal>
              <div className="mono ink-indigo" style={{ fontSize: 13 }}>{i}</div>
              <div className="mono" style={{ fontSize: 13, marginTop: 8, color: "var(--text-2)" }}>{name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ENCODING SPEC */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>The encoding spec</div>
        <h2 className="h2" style={{ marginTop: 16, maxWidth: 760 }} data-reveal>32-byte big-endian, EIP-196/197 compatible.</h2>
        <p className="lead" style={{ marginTop: 18, maxWidth: 660 }} data-reveal>
          Field elements encode uncompressed. The one integration risk worth memorizing is the G2 Fp2 ordering.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginTop: 36 }}>
          <EncCard label="G1 · BytesN<64>" size="64 bytes" fmt="x_be(32) ‖ y_be(32)" use="pi_a, pi_c, vk_alpha, each IC" />
          <EncCard label="G2 · BytesN<128>" size="128 bytes" fmt="x.c1 ‖ x.c0 ‖ y.c1 ‖ y.c0" use="pi_b, vk_beta / gamma / delta" />
          <EncCard label="SCALAR · U256" size="32 bytes" fmt="big-endian" use="each public signal" />
          <div className="card-spec" style={{ borderColor: "#3a2f10", background: "rgba(251,191,107,.04)" }} data-reveal>
            <div className="numcard-tag" style={{ color: "var(--warn)" }}>⚠ THE FP2 GOTCHA</div>
            <p className="body" style={{ marginTop: 12 }}>
              snarkjs emits Fp2 as <code className="mono">[c0, c1]</code>. The BN254 host wants the <strong className="ink">imaginary part first</strong> —
              encode <code className="mono">c1 ‖ c0</code>. Get it wrong and a valid proof fails on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* CONTRACTS */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>The contracts</div>
        <h2 className="h2" style={{ marginTop: 16, maxWidth: 720 }} data-reveal>Two Soroban contracts, live on testnet.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 36 }}>
          <div className="card" data-reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="numcard-tag" style={{ color: "var(--indigo)" }}>halo-verifier</span>
              <a className="btn-arrow" style={{ fontSize: 12 }} href={EXPLORER_CONTRACT(VERIFIER_ID)} target="_blank" rel="noreferrer">{short(VERIFIER_ID)} ↗</a>
            </div>
            <ul className="mono" style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 9, fontSize: 12.5, color: "var(--text-3)" }}>
              <li>set_issuer_root(root)</li><li>set_policy(scope, …)</li><li>verify(caller, proof, signals)</li>
              <li>is_verified_for(who, scope, …)</li><li>attested_at(who, scope)</li>
            </ul>
          </div>
          <div className="card" data-reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="numcard-tag" style={{ color: "var(--indigo)" }}>gated-sale</span>
              <a className="btn-arrow" style={{ fontSize: 12 }} href={EXPLORER_CONTRACT(SALE_ID)} target="_blank" rel="noreferrer">{short(SALE_ID)} ↗</a>
            </div>
            <ul className="mono" style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 9, fontSize: 12.5, color: "var(--text-3)" }}>
              <li>initialize(admin, verifier, scope)</li><li>is_open(who)</li><li>buy(buyer, amount)</li>
              <li className="ink-green">→ cross-contract is_verified_for</li><li>SALE_SCOPE = 424242</li>
            </ul>
          </div>
          <div className="card-spec" data-reveal>
            <div className="numcard-tag" style={{ color: "var(--danger)" }}>ERROR CODES</div>
            <div className="mono" style={{ fontSize: 12.5, marginTop: 14, display: "grid", gap: 9, color: "var(--text-3)" }}>
              {[["#3", "BadSignals"], ["#4", "AddrMismatch"], ["#5", "RootMismatch"], ["#6", "NullifierUsed"], ["#7", "InvalidProof"], ["#8", "PolicyMismatch"]].map(([c, m]) => (
                <div key={c} style={{ display: "flex", gap: 12 }}><span className="ink-indigo" style={{ width: 28 }}>{c}</span><span>{m}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RUN IT */}
      <section className="section section-pad container">
        <div className="eyebrow" data-reveal>Run it</div>
        <h2 className="h2" style={{ marginTop: 16 }} data-reveal>From a clean checkout.</h2>
        <pre className="codeblock" style={{ marginTop: 28, whiteSpace: "pre-wrap" }} data-reveal>
          <span className="c"># 1 — circuit: compile + trusted setup + sample proof</span>{"\n"}
          <span className="g">cd</span> circuits &amp;&amp; npm install{"\n"}
          <span className="g">bash</span> scripts/setup.sh halo{"\n\n"}
          <span className="c"># 2 — contracts: test + deploy to testnet</span>{"\n"}
          <span className="g">cd</span> ../contracts/halo-verifier &amp;&amp; cargo test{"\n"}
          <span className="g">stellar</span> contract build{"\n\n"}
          <span className="c"># 3 — frontend + issuer api (the demo)</span>{"\n"}
          <span className="g">cd</span> ../../frontend &amp;&amp; npm install{"\n"}
          <span className="g">bash</span> ../scripts/dev.sh <span className="c"># issuer :8787 · web :5173</span>
        </pre>
        <div style={{ display: "flex", gap: 16, marginTop: 30, flexWrap: "wrap" }} data-reveal>
          <a href="https://github.com/OoJae/halo" target="_blank" rel="noreferrer" className="btn btn-primary">View the repo ↗</a>
          <a href={EXPLORER_TX(EXAMPLE_TX)} target="_blank" rel="noreferrer" className="btn btn-tertiary">Example verify tx ↗</a>
        </div>
      </section>
    </>
  );
}

function EncCard({ label, size, fmt, use }: { label: string; size: string; fmt: string; use: string }) {
  return (
    <div className="card-spec" data-reveal>
      <div className="numcard-tag">{label}</div>
      <div className="mono" style={{ fontSize: 12.5, marginTop: 14, display: "grid", gap: 8, color: "var(--text-3)" }}>
        <div><span style={{ color: "var(--muted-2)" }}>size </span>{size}</div>
        <div><span style={{ color: "var(--muted-2)" }}>fmt </span><span className="ink-indigo">{fmt}</span></div>
        <div><span style={{ color: "var(--muted-2)" }}>use </span>{use}</div>
      </div>
    </div>
  );
}
