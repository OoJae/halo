import React, { useEffect, useState } from "react";
import {
  connectWallet, connectDemo, hasDemo, submitVerify, attestedAt, saleIsOpen, buy,
  SALE_SCOPE, VERIFIER_ID, SALE_ID, EXPLORER_TX, EXPLORER_CONTRACT,
} from "./lib/stellar";
import { proveHalo, type Credential, type Gate } from "./lib/prover";
import { encryptToAuditor, auditorDecrypt, AUDITOR_SECRET, type Sealed } from "./lib/viewkey";
import demoCredential from "./demo-credential.json";

// ---------- helpers ----------
const short = (s: string, n = 6) => (s ? `${s.slice(0, n)}…${s.slice(-4)}` : "");
const freshScope = () => {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return (BigInt(a[0]) * 4294967296n + BigInt(a[1])).toString();
};
const isNullifierUsed = (e: any) => /#6\b|NullifierUsed/i.test(String(e?.message ?? e));
const POLICY: Omit<Gate, "scope"> = { minBirthYear: "2008", requireAccredited: "1", bannedCountry: "643" };
const COUNTRY_NAMES: Record<string, string> = { "840": "United States", "643": "Russia", "364": "Iran" };

type Tab = "identity" | "sale" | "demos" | "auditor";

const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="mono">{children}</span>;
const Pill: React.FC<{ kind?: string; children: React.ReactNode }> = ({ kind = "", children }) => (
  <span className={`pill ${kind}`}>{children}</span>
);
const Spinner = () => <span className="spinner" aria-label="working" />;

export default function App() {
  const [tab, setTab] = useState<Tab>("identity");
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
      let c: any = demoCredential; // deployed fallback (no issuer server on the static host)
      try {
        const r = await fetch("/api/credential?holder=holderA");
        if (r.ok) c = await r.json();
      } catch { /* fall back to the bundled credential */ }
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
    } catch (e: any) {
      setError(e?.message ?? "Proof submission failed");
      throw e;
    } finally { setBusy(""); }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="halo" />
          <div>
            <div className="brand-name">Halo</div>
            <div className="brand-sub">Prove who you're allowed to be — reveal nothing about who you are.</div>
          </div>
        </div>
        <div className="wallet">
          {address ? (
            <Pill kind="ok">● {short(address)}{mode === "demo" ? " · demo" : ""}</Pill>
          ) : (
            <>
              <button className="btn primary" onClick={onConnect}>Connect wallet</button>
              {hasDemo() && <button className="btn" onClick={onDemo}>Use demo wallet</button>}
            </>
          )}
        </div>
      </header>

      <nav className="tabs">
        {(["identity", "sale", "demos", "auditor"] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {{ identity: "Prove eligibility", sale: "Gated sale", demos: "Demos", auditor: "Auditor view-key" }[t]}
          </button>
        ))}
      </nav>

      {error && <div className="banner err">{error}</div>}
      {busy && <div className="banner work"><Spinner /> {busy}</div>}

      <main>
        {tab === "identity" && (
          <IdentityTab address={address} cred={cred} credMeta={credMeta} scope={scope} att={att}
            busy={!!busy} getCredential={getCredential} run={() => proveAndVerify(scope)} />
        )}
        {tab === "sale" && <SaleTab address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} proveAndVerify={proveAndVerify} />}
        {tab === "demos" && <DemosTab address={address} cred={cred} busy={!!busy} setBusy={setBusy} setError={setError} />}
        {tab === "auditor" && <AuditorTab cred={cred} />}
      </main>

      <footer className="foot">
        <p>Groth16 over BN254 · verified on Stellar testnet · <strong>the zero-knowledge proof is what makes this possible.</strong></p>
        <p className="foot-links">
          <a href={EXPLORER_CONTRACT(VERIFIER_ID)} target="_blank" rel="noreferrer">verifier contract ↗</a>
          <a href={EXPLORER_CONTRACT(SALE_ID)} target="_blank" rel="noreferrer">gated-sale contract ↗</a>
        </p>
        <p className="disclaimer">
          Hackathon prototype on testnet — not audited. The mock issuer stands in for a real KYC provider; the
          auditor view-key is demo-tier (ciphertext not yet bound in-circuit). “Halo” is a product name, not the
          Halo2 proving system — under the hood it's Groth16 over BN254.
        </p>
      </footer>
    </div>
  );
}

function IdentityTab(p: any) {
  const { address, cred, credMeta, scope, att, busy, getCredential, run } = p;
  return (
    <div className="grid">
      <section className="card">
        <h2><span className="step">1</span> Get a credential</h2>
        <p className="muted">A trusted issuer vouches for your attributes once. Your birth year, country, and accreditation never leave your device.</p>
        {!cred ? (
          <button className="btn" disabled={busy} onClick={getCredential}>Get credential</button>
        ) : (
          <div className="kv">
            <div><span>Birth year</span><Mono>{credMeta.birthYear}</Mono></div>
            <div><span>Country</span><Mono>{COUNTRY_NAMES[credMeta.country] ?? credMeta.country}</Mono></div>
            <div><span>Accredited</span><Mono>{credMeta.accredited === "1" ? "yes" : "no"}</Mono></div>
            <Pill kind="ok">credential held privately on your device</Pill>
          </div>
        )}
      </section>

      <section className="card">
        <h2><span className="step">2</span> Prove eligibility</h2>
        <p className="muted">Generate a proof <em>in your browser</em> that you are <strong>18+, accredited, and in an allowed region</strong> — bound to your wallet. No attributes are revealed.</p>
        <button className="btn primary" disabled={!address || !cred || busy} onClick={run}>Prove &amp; verify on-chain</button>
        {!address && <p className="hint">Connect a wallet first.</p>}
      </section>

      <section className={`card dashboard ${att ? "lit" : ""}`}>
        <h2>Attestation</h2>
        {!att ? (
          <p className="muted">No attestation yet. After proving, the chain records only that your address is verified — nothing about you.</p>
        ) : (
          <div className="verified">
            <div className="big-ok">✓ Verified</div>
            <div className="kv">
              <div><span>Bound to</span><Mono>{short(address, 8)}</Mono></div>
              <div><span>At ledger</span><Mono>{att.ledger ?? "—"}</Mono></div>
              <div><span>Scope</span><Mono>{short(scope, 8)}</Mono></div>
              <div><span>Nullifier</span><Mono>{short(att.nullifier, 10)}</Mono></div>
            </div>
            {att.hash && <a className="btn link" href={EXPLORER_TX(att.hash)} target="_blank" rel="noreferrer">View transaction ↗</a>}
          </div>
        )}
      </section>
    </div>
  );
}

function SaleTab(p: any) {
  const { address, cred, busy, setBusy, setError, proveAndVerify } = p;
  const [open, setOpen] = useState<boolean | null>(null);
  const [boughtHash, setBoughtHash] = useState<string>("");

  async function refresh() {
    if (!address) return;
    try { setOpen(await saleIsOpen()); } catch { setOpen(false); }
  }
  useEffect(() => { refresh(); }, [address]);

  async function unlock() { try { await proveAndVerify(SALE_SCOPE); await refresh(); } catch {} }
  async function doBuy() {
    setError(""); setBusy("Buying — signing…");
    try { const { hash } = await buy(100n); setBoughtHash(hash); }
    catch (e: any) { setError(e?.message ?? "Buy failed"); }
    finally { setBusy(""); }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Regulated token sale</h2>
        <p className="muted">This sale only opens to wallets that hold a Halo attestation for the sale scope. The contract checks <Mono>is_verified</Mono> on-chain before allowing a purchase.</p>
        <div className="lockrow">
          {open === null ? <Pill>connect a wallet</Pill> : open ? <Pill kind="ok">● unlocked</Pill> : <Pill kind="lock">🔒 locked</Pill>}
        </div>
        {!open ? (
          <button className="btn primary" disabled={!address || !cred || busy} onClick={unlock}>Prove eligibility to unlock</button>
        ) : (
          <button className="btn primary" disabled={busy} onClick={doBuy}>Buy 100 tokens</button>
        )}
        {!cred && <p className="hint">Get a credential on the “Prove eligibility” tab first.</p>}
        {boughtHash && <a className="btn link" href={EXPLORER_TX(boughtHash)} target="_blank" rel="noreferrer">Purchase tx ↗</a>}
      </section>
      <section className="card">
        <h2>Why it's load-bearing</h2>
        <p className="muted">Remove the proof and anyone could buy. The gate enforces eligibility (18+, accredited, allowed region) without the sale contract — or the public ledger — ever learning the buyer's attributes.</p>
      </section>
    </div>
  );
}

function DemosTab(p: any) {
  const { address, cred, busy, setBusy, setError } = p;
  const [sybil, setSybil] = useState<{ first?: string; second?: string }>({});
  const [links, setLinks] = useState<{ a?: string; b?: string }>({});

  async function runSybil() {
    if (!cred || !address) return;
    setError(""); setSybil({});
    const s = freshScope();
    try {
      setBusy("Proving (first claim)…");
      let res = await proveHalo(cred, { ...POLICY, scope: s }, address);
      const { hash } = await submitVerify(res.proof, res.publicSignalsBig);
      setSybil({ first: `claimed ✓ (${short(hash)})` });
      setBusy("Proving the same identity again (second claim)…");
      res = await proveHalo(cred, { ...POLICY, scope: s }, address);
      try {
        await submitVerify(res.proof, res.publicSignalsBig);
        setSybil((x) => ({ ...x, second: "unexpectedly succeeded" }));
      } catch (e) {
        setSybil((x) => ({ ...x, second: isNullifierUsed(e) ? "reverted: nullifier already used 🔒" : `reverted: ${String((e as any)?.message).slice(0, 60)}` }));
      }
    } catch (e: any) { setError(e?.message ?? "demo failed"); }
    finally { setBusy(""); }
  }

  async function runUnlink() {
    if (!cred || !address) return;
    setError(""); setLinks({});
    try {
      setBusy("Proving for app A…");
      const a = await proveHalo(cred, { ...POLICY, scope: freshScope() }, address);
      setBusy("Proving for app B…");
      const b = await proveHalo(cred, { ...POLICY, scope: freshScope() }, address);
      setLinks({ a: a.nullifier, b: b.nullifier });
    } catch (e: any) { setError(e?.message ?? "demo failed"); }
    finally { setBusy(""); }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Sybil resistance</h2>
        <p className="muted">One person, one action — enforced on-chain. Claiming twice with the same identity + scope reverts.</p>
        <button className="btn primary" disabled={!address || !cred || busy} onClick={runSybil}>Run double-claim</button>
        {sybil.first && <div className="result"><div>① {sybil.first}</div><div>② {sybil.second ?? "…"}</div></div>}
      </section>
      <section className="card">
        <h2>Unlinkability</h2>
        <p className="muted">The same person proving for two different apps produces two <strong>unlinkable</strong> nullifiers — they can't be correlated.</p>
        <button className="btn primary" disabled={!address || !cred || busy} onClick={runUnlink}>Prove for two apps</button>
        {links.a && (
          <div className="result">
            <div>app A → <Mono>{short(links.a, 12)}</Mono></div>
            <div>app B → <Mono>{short(links.b!, 12)}</Mono></div>
            <Pill kind="ok">different &amp; unlinkable</Pill>
          </div>
        )}
      </section>
    </div>
  );
}

function AuditorTab({ cred }: any) {
  const [sealed, setSealed] = useState<Sealed | null>(null);
  const [revealed, setRevealed] = useState<string>("");

  function publish() { if (!cred) return; setRevealed(""); setSealed(encryptToAuditor(cred.country)); }
  function decrypt() { if (!sealed) return; setRevealed(auditorDecrypt(sealed, AUDITOR_SECRET) ?? "(could not decrypt)"); }

  return (
    <div className="grid">
      <section className="card">
        <h2>Selective disclosure to an auditor</h2>
        <p className="muted">Encrypt one attribute (country) to an authorized auditor's key. The public sees only ciphertext; only the auditor can recover it.</p>
        <button className="btn primary" disabled={!cred} onClick={publish}>Publish encrypted disclosure</button>
        {!cred && <p className="hint">Get a credential first.</p>}
        {sealed && (
          <div className="result">
            <div className="muted">What the public / ledger sees:</div>
            <Mono>{sealed.box.slice(0, 44)}…</Mono>
          </div>
        )}
      </section>
      <section className="card">
        <h2>Auditor view</h2>
        <p className="muted">Only the holder of the auditor secret key can decrypt the disclosure.</p>
        <button className="btn" disabled={!sealed} onClick={decrypt}>Decrypt as auditor</button>
        {revealed && <div className="result big-ok-sm">country = {COUNTRY_NAMES[revealed] ?? revealed}</div>}
        <p className="hint">Demo tier: the ciphertext is not yet bound in-circuit to the proven attribute.</p>
      </section>
    </div>
  );
}
