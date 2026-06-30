import { Link } from "react-router-dom";
import { VERIFIER_ID, SALE_ID, EXPLORER_CONTRACT, EXPLORER_TX } from "../lib/stellar";

const EXAMPLE_TX = "3272ef373980c564912e037ec5ca0e0ecc2bd591ac6dc8e21f669271dbcff1bb";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="nav-brand" style={{ marginBottom: 16 }}>
            <span className="halo-dot" style={{ animation: "none" }} />
            <span className="wordmark" style={{ fontSize: 16 }}>HALO</span>
          </div>
          <p style={{ margin: 0, maxWidth: 300, fontSize: 13.5, lineHeight: 1.65, color: "var(--muted)" }}>
            Selective-disclosure identity credentials on Stellar. Prove who you're allowed to be — reveal
            nothing about who you are.
          </p>
        </div>

        <div className="footer-col">
          <h4>PAGES</h4>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/developers">For developers</Link>
          <Link to="/use-cases">Use cases</Link>
          <Link to="/manifesto">Manifesto</Link>
          <Link to="/app">Live demo</Link>
        </div>

        <div className="footer-col mono">
          <h4>ON-CHAIN · TESTNET</h4>
          <a href={EXPLORER_CONTRACT(VERIFIER_ID)} target="_blank" rel="noreferrer">verifier contract ↗</a>
          <a href={EXPLORER_CONTRACT(SALE_ID)} target="_blank" rel="noreferrer">gated-sale contract ↗</a>
          <a href={EXPLORER_TX(EXAMPLE_TX)} target="_blank" rel="noreferrer">example verify tx ↗</a>
          <a href="https://github.com/OoJae/halo" target="_blank" rel="noreferrer">github / OoJae / halo ↗</a>
        </div>
      </div>
      <div className="container">
        <p className="footer-disclaimer">
          Hackathon prototype on testnet — not audited. The mock issuer stands in for a real KYC provider;
          the auditor view-key is demo-tier. “Halo” is a product name, not the Halo2 proving system — under
          the hood it's Groth16 over BN254.
        </p>
      </div>
    </footer>
  );
}
