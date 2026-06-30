import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import {
  connectWallet, connectDemo, hasDemo, submitVerify, attestedAt, saleIsOpen, buy,
  SALE_SCOPE, EXPLORER_TX,
} from "../lib/stellar";
import { proveHalo, type Credential, type Gate } from "../lib/prover";
import { encryptToAuditor, auditorDecrypt, AUDITOR_SECRET, type Sealed } from "../lib/viewkey";
import demoCredential from "../demo-credential.json";

// ---------- logic (preserved verbatim from the working dApp) ----------
const short = (s: string, n = 6) => (s ? `${s.slice(0, n)}…${s.slice(-4)}` : "");
const freshScope = () => {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return (BigInt(a[0]) * 4294967296n + BigInt(a[1])).toString();
};
const isNullifierUsed = (e: any) => /#6\b|NullifierUsed/i.test(String(e?.message ?? e));
const decodeError = (e: any) => {
  const m = String(e?.message ?? e);
  if (isNullifierUsed(e)) return "Already verified for this scope — the nullifier is spent (one person, one action).";
  if (/#8\b|PolicyMismatch/i.test(m)) return "This gate requires a specific eligibility policy; your proof's policy doesn't match it.";
  if (/#4\b|AddrMismatch/i.test(m)) return "The proof isn't bound to the connected wallet.";
  if (/#5\b|RootMismatch/i.test(m)) return "The proof's issuer root doesn't match the on-chain root.";
  return m.length > 160 ? m.slice(0, 160) + "…" : m;
};
const POLICY: Omit<Gate, "scope"> = { minBirthYear: "2008", requireAccredited: "1", bannedCountry: "643" };
const COUNTRY_NAMES: Record<string, string> = { "840": "United States", "643": "Russia", "364": "Iran" };

// ---------- shared style tokens (mirrors brand/Halo - Demo.dc.html) ----------
const S: Record<string, React.CSSProperties> = {
  mono: { fontFamily: "var(--mono)" },
  stepRow: { display: "flex", alignItems: "center", gap: 11, marginBottom: 14 },
  stepNum: { width: 22, height: 22, borderRadius: "50%", background: "rgba(139,140,248,.14)", color: "#B7B8FF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600 },
  stepTitle: { fontFamily: "var(--sans)", fontWeight: 600, fontSize: 17, color: "#E9ECF4" },
  stepBody: { margin: "0 0 16px", fontSize: 14, lineHeight: 1.6, color: "#8893a7" },
  btnPrimary: { fontFamily: "var(--mono)", fontSize: 13, color: "#0A0B12", background: "#B7B8FF", border: "none", padding: "11px 18px", borderRadius: 7, cursor: "pointer" },
  btnGhost: { fontFamily: "var(--mono)", fontSize: 13, color: "#E9ECF4", background: "#131a2b", border: "1px solid #2a3048", padding: "11px 18px", borderRadius: 7, cursor: "pointer" },
  pillOk: { display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)", fontSize: 12, color: "#34D399", border: "1px solid #0f3b30", background: "rgba(52,211,153,.08)", padding: "7px 13px", borderRadius: 999 },
  pillLock: { display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)", fontSize: 12, color: "#fbbf24", border: "1px solid #3a2f10", background: "rgba(251,191,36,.08)", padding: "6px 12px", borderRadius: 999 },
  kvRow: { display: "flex", justifyContent: "space-between", gap: 14, fontFamily: "var(--mono)", fontSize: 12.5 },
  demoCard: { background: "#0A0C16", border: "1px solid #1b1e34", borderRadius: 8, padding: 26 },
  demoH3: { margin: "0 0 8px", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 18, color: "#E9ECF4" },
  demoP: { margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.6, color: "#8893a7" },
  demoBtn: { fontFamily: "var(--mono)", fontSize: 12.5, color: "#E9ECF4", background: "#131a2b", border: "1px solid #2a3048", padding: "10px 16px", borderRadius: 6, cursor: "pointer" },
  resultBox: { marginTop: 16, display: "grid", gap: 8, fontFamily: "var(--mono)", fontSize: 12.5, background: "#0d1320", border: "1px solid #1b1e34", borderRadius: 7, padding: "13px 15px" },
};
const Spinner = () => <span style={{ width: 14, height: 14, minWidth: 14, marginTop: 2, border: "2px solid #2b3450", borderTopColor: "#B7B8FF", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
const dim = (d: boolean): React.CSSProperties => (d ? { opacity: 0.45, cursor: "not-allowed" } : {});

export default function Prover() {
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState<"wallet" | "demo" | "">("");
  const [cred, setCred] = useState<Credential | null>(null);
  const [credMeta, setCredMeta] = useState<any>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [scope] = useState(freshScope());
  const [att, setAtt] = useState<{ ledger?: number; nullifier: string; hash: string } | null>(null);

  async function onConnect() {
    setError("");
    try { setAddress(await connectWallet()); setMode("wallet"); }
    catch (e: any) { setError(e?.message ?? "Failed to connect"); }
  }
  function onDemo() {
    setError("");
    try { setAddress(connectDemo()); setMode("demo"); }
    catch (e: any) { setError(e?.message ?? "Demo wallet unavailable"); }
  }
  async function getCredential() {
    setError(""); setBusy("Requesting a credential from the issuer…");
    try {
      let c: any = demoCredential;
      try { const r = await fetch("/api/credential?holder=holderA"); if (r.ok) c = await r.json(); } catch {}
      setCred(c);
      setCredMeta({ birthYear: c.birthYear, country: c.country, accredited: c.accredited });
    } finally { setBusy(""); }
  }
  async function proveAndVerify(useScope: string) {
    if (!cred || !address) return;
    setError(""); setAtt(null);
    setBusy("Generating a zero-knowledge proof in your browser — no data leaves your device…");
    try {
      const res = await proveHalo(cred, { ...POLICY, scope: useScope }, address);
      setBusy("Submitting the proof to Stellar — signing…");
      const { hash } = await submitVerify(res.proof, res.publicSignalsBig);
      const ledger = await attestedAt(useScope).catch(() => undefined);
      setAtt({ ledger, nullifier: res.nullifier, hash });
      return res;
    } catch (e: any) { setError(decodeError(e)); throw e; }
    finally { setBusy(""); }
  }

  return (
    <>
      <Nav appMode />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "clamp(110px,16vh,180px) clamp(22px,5vw,60px) clamp(36px,5vh,60px)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(11px,1.05vw,13px)", letterSpacing: ".28em", textTransform: "uppercase", color: "#7B8499", marginBottom: 22 }}>Live demo</div>
        <h1 style={{ margin: 0, maxWidth: 880, fontFamily: "var(--sans)", fontWeight: 800, fontStretch: "120%", letterSpacing: "-.028em", lineHeight: ".96", fontSize: "clamp(2.2rem,5.4vw,4.6rem)", color: "#E9ECF4" }}>Prove eligibility. Watch the chain learn nothing.</h1>
        <p style={{ margin: "24px 0 0", maxWidth: 600, fontSize: "clamp(1rem,1.3vw,1.18rem)", lineHeight: 1.55, color: "#A7AFC4" }}>The real testnet app. Your proof is generated by snarkjs in your browser and submitted to Stellar — the ledger records only that your address is eligible, never an attribute.</p>
      </div>

      {/* MAIN CONSOLE */}
      <section style={{ position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(22px,5vw,60px) clamp(40px,6vh,72px)" }}>
          <div style={{ border: "1px solid #1b1e34", borderRadius: 10, background: "linear-gradient(180deg,#0b0e1a,#08090f)", overflow: "hidden" }}>
            {/* console bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 22px", borderBottom: "1px solid #14162a", background: "#0A0C16", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".2em", color: "#8089a0" }}>PROVE ELIGIBILITY</span>
              {address ? (
                <span style={S.pillOk}>● {short(address)} · {mode === "demo" ? "demo" : "wallet"}</span>
              ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button style={{ ...S.btnPrimary, padding: "9px 16px", borderRadius: 3 }} onClick={onConnect}>Connect wallet</button>
                  {hasDemo() && <button style={{ ...S.btnGhost, padding: "9px 16px", borderRadius: 3, fontSize: 12.5 }} onClick={onDemo}>Use demo wallet</button>}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 0 }}>
              {/* LEFT: actions */}
              <div style={{ padding: "clamp(24px,3vw,38px)", borderRight: "1px solid #14162a" }}>
                <div style={S.stepRow}><span style={S.stepNum}>1</span><span style={S.stepTitle}>Get a credential</span></div>
                <p style={S.stepBody}>A trusted issuer vouches for your attributes once. They never leave the device.</p>
                {!cred ? (
                  <button style={{ ...S.btnGhost, ...dim(!!busy) }} disabled={!!busy} onClick={getCredential}>Get credential</button>
                ) : (
                  <div style={{ display: "grid", gap: 9, marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #1A1D2E", paddingBottom: 8 }}><span style={{ color: "#7B8499", fontSize: 12.5 }}>Birth year</span><span style={{ ...S.mono, fontSize: 12.5, color: "#cdd6e6" }}>{credMeta.birthYear}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #1A1D2E", paddingBottom: 8 }}><span style={{ color: "#7B8499", fontSize: 12.5 }}>Country</span><span style={{ ...S.mono, fontSize: 12.5, color: "#cdd6e6" }}>{COUNTRY_NAMES[credMeta.country] ?? credMeta.country}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4 }}><span style={{ color: "#7B8499", fontSize: 12.5 }}>Accredited</span><span style={{ ...S.mono, fontSize: 12.5, color: "#cdd6e6" }}>{credMeta.accredited === "1" ? "yes" : "no"}</span></div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#34D399", border: "1px solid #0f3b30", background: "rgba(52,211,153,.07)", padding: "5px 11px", borderRadius: 999, width: "fit-content", marginTop: 4 }}>held privately on your device</span>
                  </div>
                )}

                <div style={{ height: 1, background: "#14162a", margin: "24px 0" }} />

                <div style={S.stepRow}><span style={S.stepNum}>2</span><span style={S.stepTitle}>Prove &amp; verify on-chain</span></div>
                <p style={S.stepBody}>Generate a proof that you are <strong style={{ color: "#cdd6e6" }}>18+, accredited, and not in a banned region</strong> — bound to your wallet. No attributes are revealed.</p>
                <button style={{ ...S.btnPrimary, ...dim(!address || !cred || !!busy) }} disabled={!address || !cred || !!busy} onClick={() => proveAndVerify(scope)}>Prove &amp; verify ↗</button>
                <p style={{ margin: "12px 0 0", fontSize: 12, color: "#5d6478" }}>{!address ? "Connect a wallet to begin." : !cred ? "Get a credential first." : "Generates a Groth16 proof, then submits to the verifier contract."}</p>

                {busy && (
                  <div style={{ marginTop: 18, display: "flex", alignItems: "flex-start", gap: 11, background: "rgba(129,140,248,.07)", border: "1px solid #232a48", borderRadius: 8, padding: "13px 15px" }}>
                    <Spinner /><span style={{ fontSize: 13, lineHeight: 1.5, color: "#c3cafe" }}>{busy}</span>
                  </div>
                )}
                {error && (
                  <div style={{ marginTop: 18, display: "flex", alignItems: "flex-start", gap: 11, background: "rgba(248,113,113,.08)", border: "1px solid #3a1f23", borderRadius: 8, padding: "13px 15px" }}>
                    <span style={{ fontSize: 13, lineHeight: 1.5, color: "#fca5a5" }}>{error}</span>
                  </div>
                )}
              </div>

              {/* RIGHT: what the chain sees */}
              <div style={{ padding: "clamp(24px,3vw,38px)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".2em", color: "#646b80", marginBottom: 18 }}>WHAT THE CHAIN SEES</div>
                {!att ? (
                  <div style={{ border: "1px dashed #1f2740", borderRadius: 8, padding: 22 }}>
                    <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.6, color: "#8893a7" }}>No attestation yet. After you prove, the ledger records only that your address is eligible — these stay blank.</p>
                    <div style={{ display: "grid", gap: 10, fontFamily: "var(--mono)", fontSize: 12.5 }}>
                      {["birth year", "country", "accredited"].map((k) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#6b7288" }}>{k}</span><span style={{ color: "#3a4055" }}>—</span></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ border: "1px solid #0f3b30", borderRadius: 8, padding: 22, background: "rgba(52,211,153,.04)", animation: "pulseGlow 3s ease-in-out infinite" }}>
                    <div style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 24, color: "#34D399", letterSpacing: ".2px", marginBottom: 16 }}>✓ Verified</div>
                    <div style={{ display: "grid", gap: 10, fontFamily: "var(--mono)", fontSize: 12.5 }}>
                      <div style={S.kvRow}><span style={{ color: "#6b7288" }}>bound to</span><span style={{ color: "#cdd6e6" }}>{short(address, 8)}</span></div>
                      <div style={S.kvRow}><span style={{ color: "#6b7288" }}>at ledger</span><span style={{ color: "#cdd6e6" }}>{att.ledger ?? "—"}</span></div>
                      <div style={S.kvRow}><span style={{ color: "#6b7288" }}>scope</span><span style={{ color: "#cdd6e6" }}>{short(scope, 8)}</span></div>
                      <div style={S.kvRow}><span style={{ color: "#6b7288" }}>nullifier</span><span style={{ color: "#B7B8FF" }}>{short(att.nullifier, 10)}</span></div>
                      <div style={{ ...S.kvRow, borderTop: "1px dashed #16352b", paddingTop: 10 }}><span style={{ color: "#6b7288" }}>birth year</span><span style={{ color: "#3a4055" }}>— never disclosed</span></div>
                    </div>
                    {att.hash && <a href={EXPLORER_TX(att.hash)} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 18, fontFamily: "var(--mono)", fontSize: 12.5, color: "#34D399", borderBottom: "1px solid #16352b", paddingBottom: 3 }}>View transaction ↗</a>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECONDARY DEMOS */}
      <section style={{ position: "relative", zIndex: 2, background: "#07080F", borderTop: "1px solid #12141f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(56px,8vh,100px) clamp(22px,5vw,60px)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#7B8499", marginBottom: "clamp(30px,4vh,48px)" }}>Go deeper</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(14px,1.8vw,20px)" }}>
            <SybilCard address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} />
            <UnlinkCard address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} />
            <SaleCard address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} proveAndVerify={proveAndVerify} />
            <AuditorCard cred={cred} />
          </div>
          <p style={{ margin: "clamp(28px,4vh,40px) 0 0", fontSize: 12.5, lineHeight: 1.6, color: "#4f566a", maxWidth: 680 }}>
            Live on testnet — the proof is generated by snarkjs in your browser and submitted to the halo-verifier contract; duplicate submissions revert with <span style={S.mono}>#6 NullifierUsed</span>.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}

function SybilCard(p: any) {
  const { address, cred, busy, setBusy, setError } = p;
  const [sybil, setSybil] = useState<{ first?: string; second?: string }>({});
  async function runSybil() {
    if (!cred || !address) return;
    setError(""); setSybil({});
    const s = freshScope();
    try {
      setBusy("Proving (first claim)…");
      let res = await proveHalo(cred, { ...POLICY, scope: s }, address);
      const { hash } = await submitVerify(res.proof, res.publicSignalsBig);
      setSybil({ first: `claimed ✓ (${short(hash)})` });
      setBusy("Proving the same identity again…");
      res = await proveHalo(cred, { ...POLICY, scope: s }, address);
      try { await submitVerify(res.proof, res.publicSignalsBig); setSybil((x) => ({ ...x, second: "unexpectedly succeeded" })); }
      catch (e) { setSybil((x) => ({ ...x, second: isNullifierUsed(e) ? "reverted — nullifier already used 🔒" : `reverted: ${String((e as any)?.message).slice(0, 60)}` })); }
    } catch (e: any) { setError(e?.message ?? "demo failed"); } finally { setBusy(""); }
  }
  return (
    <div style={S.demoCard}>
      <h3 style={S.demoH3}>Sybil resistance</h3>
      <p style={S.demoP}>Claim twice with the same identity and scope. The second reverts — one person, one action.</p>
      <button style={{ ...S.demoBtn, ...dim(!address || !cred || busy) }} disabled={!address || !cred || busy} onClick={runSybil}>Run double-claim</button>
      {sybil.first && (
        <div style={S.resultBox}>
          <div style={{ color: "#9aa2b8" }}><span style={{ color: "#34D399" }}>①</span> {sybil.first}</div>
          <div style={{ color: sybil.second ? "#fca5a5" : "#646b80" }}><span style={{ color: sybil.second ? "#f87171" : "#646b80" }}>②</span> {sybil.second ?? "proving the same identity again…"}</div>
        </div>
      )}
    </div>
  );
}

function UnlinkCard(p: any) {
  const { address, cred, busy, setBusy, setError } = p;
  const [links, setLinks] = useState<{ a?: string; b?: string }>({});
  async function runUnlink() {
    if (!cred || !address) return;
    setError(""); setLinks({});
    try {
      setBusy("Proving for app A…");
      const a = await proveHalo(cred, { ...POLICY, scope: freshScope() }, address);
      setBusy("Proving for app B…");
      const b = await proveHalo(cred, { ...POLICY, scope: freshScope() }, address);
      setLinks({ a: a.nullifier, b: b.nullifier });
    } catch (e: any) { setError(e?.message ?? "demo failed"); } finally { setBusy(""); }
  }
  return (
    <div style={S.demoCard}>
      <h3 style={S.demoH3}>Unlinkability</h3>
      <p style={S.demoP}>Prove for two different apps. The two nullifiers can't be correlated to each other.</p>
      <button style={{ ...S.demoBtn, ...dim(!address || !cred || busy) }} disabled={!address || !cred || busy} onClick={runUnlink}>Prove for two apps</button>
      {links.a && (
        <div style={S.resultBox}>
          <div style={{ color: "#9aa2b8" }}>app A → <span style={{ color: "#B7B8FF" }}>{short(links.a, 12)}</span></div>
          <div style={{ color: "#9aa2b8" }}>app B → <span style={{ color: "#B7B8FF" }}>{short(links.b!, 12)}</span></div>
          <span style={{ color: "#34D399", fontSize: 11.5 }}>different &amp; unlinkable</span>
        </div>
      )}
    </div>
  );
}

function SaleCard(p: any) {
  const { address, cred, busy, setBusy, setError, proveAndVerify } = p;
  const [open, setOpen] = useState<boolean | null>(null);
  const [boughtHash, setBoughtHash] = useState("");
  async function refresh() { if (!address) return; try { setOpen(await saleIsOpen()); } catch { setOpen(false); } }
  useEffect(() => { refresh(); }, [address]);
  async function unlock() { try { await proveAndVerify(SALE_SCOPE); await refresh(); } catch {} }
  async function doBuy() {
    setError(""); setBusy("Buying — signing…");
    try { const { hash } = await buy(100n); setBoughtHash(hash); }
    catch (e: any) { setError(e?.message ?? "Buy failed"); } finally { setBusy(""); }
  }
  return (
    <div style={S.demoCard}>
      <h3 style={S.demoH3}>Gated sale</h3>
      <p style={S.demoP}>A regulated sale that only opens to wallets holding a Halo attestation for its scope.</p>
      <div style={{ marginBottom: 14 }}>
        {open === null ? <span style={{ ...S.pillLock, color: "#646b80", borderColor: "#2a3048", background: "transparent" }}>connect a wallet</span>
          : open ? <span style={S.pillOk}>● unlocked</span>
            : <span style={S.pillLock}>🔒 locked</span>}
      </div>
      {!open ? (
        <button style={{ ...S.btnPrimary, padding: "10px 16px", borderRadius: 6, fontSize: 12.5, ...dim(!address || !cred || busy) }} disabled={!address || !cred || busy} onClick={unlock}>Prove to unlock</button>
      ) : (
        <button style={{ ...S.btnPrimary, background: "#34D399", padding: "10px 16px", borderRadius: 6, fontSize: 12.5, ...dim(busy) }} disabled={busy} onClick={doBuy}>Buy 100 tokens</button>
      )}
      {boughtHash && <a href={EXPLORER_TX(boughtHash)} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 12, fontFamily: "var(--mono)", fontSize: 12, color: "#34D399" }}>purchase tx ↗</a>}
    </div>
  );
}

function AuditorCard({ cred }: any) {
  const [sealed, setSealed] = useState<Sealed | null>(null);
  const [revealed, setRevealed] = useState("");
  function publish() { if (!cred) return; setRevealed(""); setSealed(encryptToAuditor(cred.country)); }
  function decrypt() { if (!sealed) return; setRevealed(auditorDecrypt(sealed, AUDITOR_SECRET) ?? "(could not decrypt)"); }
  return (
    <div style={S.demoCard}>
      <h3 style={S.demoH3}>Auditor view-key</h3>
      <p style={S.demoP}>Encrypt one attribute to the auditor's key. The public sees only ciphertext; only the auditor can read it.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={{ ...S.btnPrimary, padding: "10px 16px", borderRadius: 6, fontSize: 12.5, ...dim(!cred) }} disabled={!cred} onClick={publish}>Publish</button>
        <button style={{ ...S.demoBtn, ...dim(!sealed) }} disabled={!sealed} onClick={decrypt}>Decrypt as auditor</button>
      </div>
      {sealed && (
        <div style={S.resultBox}>
          <div style={{ color: "#646b80" }}>public sees: {sealed.box.slice(0, 30)}…</div>
          {revealed && <div style={{ color: "#34D399" }}>auditor reads: country = {COUNTRY_NAMES[revealed] ?? revealed}</div>}
        </div>
      )}
    </div>
  );
}
