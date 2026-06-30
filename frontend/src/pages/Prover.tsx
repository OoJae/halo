import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  connectWallet, connectDemo, hasDemo, submitVerify, attestedAt, saleIsOpen, buy,
  SALE_SCOPE, EXPLORER_TX,
} from "../lib/stellar";
import { proveHalo, type Credential, type Gate } from "../lib/prover";
import { encryptToAuditor, auditorDecrypt, AUDITOR_SECRET, type Sealed } from "../lib/viewkey";
import demoCredential from "../demo-credential.json";
import HaloCanvas from "../components/HaloCanvas";
import Footer from "../components/Footer";

// ---------- helpers (logic preserved from the original dApp) ----------
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

const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="mono">{children}</span>;
const Spinner = () => <span className="spinner" aria-label="working" />;

export default function Prover() {
  const [address, setAddress] = useState<string>("");
  const [mode, setMode] = useState<"wallet" | "demo" | "">("");
  const [cred, setCred] = useState<Credential | null>(null);
  const [credMeta, setCredMeta] = useState<any>(null);
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [scope] = useState<string>(freshScope());
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
    <div className="prover">
      <HaloCanvas ringN={900} tunnelN={700} cx={0.72} cy={0.4} />
      <div className="halo-vignette" />
      <header className="console-nav">
        <Link to="/" className="nav-brand">
          <span className="halo-dot" />
          <span className="wordmark">HALO</span>
          <span className="nav-tag">live demo</span>
        </Link>
        <div className="wallet">
          {address ? (
            <span className="pill pill-ok">● {short(address)}{mode === "demo" ? " · demo" : ""}</span>
          ) : (
            <>
              <button className="btn btn-primary" onClick={onConnect}>Connect wallet</button>
              {hasDemo() && <button className="btn btn-tertiary" onClick={onDemo}>Use demo wallet</button>}
            </>
          )}
          <Link to="/" className="btn-arrow" style={{ marginLeft: 6 }}>← Home</Link>
        </div>
      </header>

      <div className="container prover-body page">
        <div className="prover-hero">
          <div className="eyebrow">Live demo</div>
          <h1 className="h1" style={{ fontSize: "clamp(2.2rem,5vw,4.6rem)" }}>Prove eligibility. Watch the chain learn nothing.</h1>
          <p className="lead" style={{ maxWidth: 620 }}>A guided walkthrough that mirrors the testnet app — proof generated in your browser, verified on Stellar, revealing only that your address is eligible.</p>
        </div>

        {error && <div className="banner err">{error}</div>}
        {busy && <div className="banner work"><Spinner /> {busy}</div>}

        <div className="console">
          <section className="card console-left">
            <div className="console-head"><span className="mono-label">PROVE ELIGIBILITY</span></div>

            <div className="step">
              <span className="step-num">1</span>
              <div className="step-body">
                <h3 className="h3">Get a credential</h3>
                <p className="body">A trusted issuer vouches for your attributes once. Birth year, country, and accreditation never leave your device.</p>
                {!cred ? (
                  <button className="btn btn-tertiary" disabled={!!busy} onClick={getCredential}>Get credential</button>
                ) : (
                  <div className="kv">
                    <div className="data-row"><span style={{ color: "var(--muted)" }}>birth year</span><Mono>{credMeta.birthYear}</Mono></div>
                    <div className="data-row"><span style={{ color: "var(--muted)" }}>country</span><Mono>{COUNTRY_NAMES[credMeta.country] ?? credMeta.country}</Mono></div>
                    <div className="data-row"><span style={{ color: "var(--muted)" }}>accredited</span><Mono>{credMeta.accredited === "1" ? "yes" : "no"}</Mono></div>
                    <span className="pill pill-ok" style={{ marginTop: 12 }}>held privately on your device</span>
                  </div>
                )}
              </div>
            </div>

            <div className="step">
              <span className="step-num">2</span>
              <div className="step-body">
                <h3 className="h3">Prove &amp; verify on-chain</h3>
                <p className="body">A Groth16 proof — <strong className="ink">18+, accredited, not in a banned country</strong>, bound to your wallet. No attributes are revealed.</p>
                <button className="btn btn-primary" disabled={!address || !cred || !!busy} onClick={() => proveAndVerify(scope)}>Prove &amp; verify ↗</button>
                {!address && <p className="hint">Connect a wallet first.</p>}
                {address && !cred && <p className="hint">Get a credential first.</p>}
              </div>
            </div>
          </section>

          <section className="console-right">
            <div className="mono-label" style={{ marginBottom: 14 }}>WHAT THE CHAIN SEES</div>
            {!att ? (
              <div className="chain-card pre">
                <p className="body" style={{ marginTop: 0 }}>Before you prove, the ledger knows nothing. After, it records only a boolean and your address.</p>
                <div className="data-row"><span style={{ color: "var(--muted)" }}>birth year</span><span style={{ color: "var(--faint)" }}>—</span></div>
                <div className="data-row"><span style={{ color: "var(--muted)" }}>country</span><span style={{ color: "var(--faint)" }}>—</span></div>
                <div className="data-row"><span style={{ color: "var(--muted)" }}>accredited</span><span style={{ color: "var(--faint)" }}>—</span></div>
              </div>
            ) : (
              <div className="chain-card verified">
                <div className="big-ok">✓ Verified</div>
                <div className="data-row"><span style={{ color: "var(--muted)" }}>bound to</span><Mono>{short(address, 8)}</Mono></div>
                <div className="data-row"><span style={{ color: "var(--muted)" }}>at ledger</span><Mono>{att.ledger ?? "—"}</Mono></div>
                <div className="data-row"><span style={{ color: "var(--muted)" }}>scope</span><Mono>{short(scope, 8)}</Mono></div>
                <div className="data-row"><span style={{ color: "var(--muted)" }}>nullifier</span><span className="mono ink-indigo">{short(att.nullifier, 10)}</span></div>
                <div className="data-row" style={{ borderBottom: "none" }}><span style={{ color: "var(--muted)" }}>birth year</span><span style={{ color: "var(--faint)" }}>never disclosed</span></div>
                {att.hash && <a className="btn-arrow ink-green" style={{ borderColor: "#0f3b30", marginTop: 14 }} href={EXPLORER_TX(att.hash)} target="_blank" rel="noreferrer">View transaction ↗</a>}
              </div>
            )}
          </section>
        </div>

        <section className="demos">
          <div className="mono-label" style={{ marginBottom: 18 }}>MORE DEMOS</div>
          <div className="demos-grid">
            <SaleCard address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} proveAndVerify={proveAndVerify} />
            <SybilCard address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} />
            <UnlinkCard address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} />
            <AuditorCard cred={cred} />
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

function SaleCard(p: any) {
  const { address, cred, busy, setBusy, setError, proveAndVerify } = p;
  const [open, setOpen] = useState<boolean | null>(null);
  const [boughtHash, setBoughtHash] = useState<string>("");
  async function refresh() { if (!address) return; try { setOpen(await saleIsOpen()); } catch { setOpen(false); } }
  useEffect(() => { refresh(); }, [address]);
  async function unlock() { try { await proveAndVerify(SALE_SCOPE); await refresh(); } catch {} }
  async function doBuy() {
    setError(""); setBusy("Buying — signing…");
    try { const { hash } = await buy(100n); setBoughtHash(hash); }
    catch (e: any) { setError(e?.message ?? "Buy failed"); } finally { setBusy(""); }
  }
  return (
    <div className="card">
      <div className="mono-label" style={{ color: "var(--indigo)", marginBottom: 14 }}>GATED SALE</div>
      <h3 className="h3" style={{ marginBottom: 10 }}>Regulated token sale</h3>
      <p className="body">Opens only to wallets that hold a Halo attestation for the sale policy — checked on-chain via <Mono>is_verified_for</Mono>.</p>
      <div style={{ margin: "12px 0" }}>
        {open === null ? <span className="pill">connect a wallet</span> : open ? <span className="pill pill-ok">● unlocked</span> : <span className="pill pill-lock">🔒 locked</span>}
      </div>
      {!open ? (
        <button className="btn btn-primary" disabled={!address || !cred || busy} onClick={unlock}>Prove to unlock</button>
      ) : (
        <button className="btn btn-primary" disabled={busy} onClick={doBuy}>Buy 100 tokens</button>
      )}
      {boughtHash && <a className="btn-arrow" style={{ display: "block", marginTop: 12 }} href={EXPLORER_TX(boughtHash)} target="_blank" rel="noreferrer">Purchase tx ↗</a>}
    </div>
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
      catch (e) { setSybil((x) => ({ ...x, second: isNullifierUsed(e) ? "reverted: nullifier already used 🔒" : `reverted: ${String((e as any)?.message).slice(0, 60)}` })); }
    } catch (e: any) { setError(e?.message ?? "demo failed"); } finally { setBusy(""); }
  }
  return (
    <div className="card">
      <div className="mono-label" style={{ color: "var(--indigo)", marginBottom: 14 }}>SYBIL RESISTANCE</div>
      <h3 className="h3" style={{ marginBottom: 10 }}>One person, one action</h3>
      <p className="body">Claiming twice with the same identity + scope reverts on-chain.</p>
      <button className="btn btn-primary" style={{ marginTop: 6 }} disabled={!address || !cred || busy} onClick={runSybil}>Run double-claim</button>
      {sybil.first && <div className="result"><div>① {sybil.first}</div><div>② {sybil.second ?? "…"}</div></div>}
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
    <div className="card">
      <div className="mono-label" style={{ color: "var(--indigo)", marginBottom: 14 }}>UNLINKABILITY</div>
      <h3 className="h3" style={{ marginBottom: 10 }}>Two apps, two nullifiers</h3>
      <p className="body">The same person proving for two apps produces <strong className="ink">unlinkable</strong> nullifiers.</p>
      <button className="btn btn-primary" style={{ marginTop: 6 }} disabled={!address || !cred || busy} onClick={runUnlink}>Prove for two apps</button>
      {links.a && (
        <div className="result">
          <div>app A → <Mono>{short(links.a, 12)}</Mono></div>
          <div>app B → <Mono>{short(links.b!, 12)}</Mono></div>
          <span className="pill pill-ok" style={{ marginTop: 8 }}>different &amp; unlinkable</span>
        </div>
      )}
    </div>
  );
}

function AuditorCard({ cred }: any) {
  const [sealed, setSealed] = useState<Sealed | null>(null);
  const [revealed, setRevealed] = useState<string>("");
  function publish() { if (!cred) return; setRevealed(""); setSealed(encryptToAuditor(cred.country)); }
  function decrypt() { if (!sealed) return; setRevealed(auditorDecrypt(sealed, AUDITOR_SECRET) ?? "(could not decrypt)"); }
  return (
    <div className="card">
      <div className="mono-label" style={{ color: "var(--indigo)", marginBottom: 14 }}>AUDITOR VIEW-KEY</div>
      <h3 className="h3" style={{ marginBottom: 10 }}>Selective disclosure</h3>
      <p className="body">Encrypt one attribute to the auditor's key. The public sees only ciphertext; only the auditor can read it.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
        <button className="btn btn-primary" disabled={!cred} onClick={publish}>Publish</button>
        <button className="btn btn-tertiary" disabled={!sealed} onClick={decrypt}>Decrypt as auditor</button>
      </div>
      {sealed && <div className="result"><div className="mono" style={{ color: "var(--muted)" }}>public sees: {sealed.box.slice(0, 32)}…</div></div>}
      {revealed && <div className="result ink-green" style={{ fontWeight: 700 }}>country = {COUNTRY_NAMES[revealed] ?? revealed}</div>}
    </div>
  );
}
