import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const LINKS = [
  { to: "/how-it-works", label: "HOW IT WORKS" },
  { to: "/developers", label: "DEVELOPERS" },
  { to: "/use-cases", label: "USE CASES" },
  { to: "/manifesto", label: "MANIFESTO" },
];

// appMode: the /app (prover) chrome — solid bar, "← Home" instead of "Launch the prover".
export default function Nav({ appMode = false }: { appMode?: boolean }) {
  const [scrolled, setScrolled] = useState(appMode);
  useEffect(() => {
    if (appMode) return;
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [appMode]);
  return (
    <nav className={`nav${scrolled || appMode ? " scrolled" : ""}`}>
      <Link to="/" className="nav-brand">
        <span className="halo-dot" />
        <span className="wordmark">HALO</span>
        <span className="nav-tag">v0 · testnet</span>
      </Link>
      <div className="nav-links">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
            {l.label}
          </NavLink>
        ))}
      </div>
      {appMode ? (
        <Link to="/" style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".04em", color: "#9aa2b8", border: "1px solid #2a3048", padding: "9px 16px", borderRadius: 2 }}>← Home</Link>
      ) : (
        <Link to="/app" className="btn btn-primary">Launch the prover ↗</Link>
      )}
    </nav>
  );
}
