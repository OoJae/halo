import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const LINKS = [
  { to: "/how-it-works", label: "HOW IT WORKS" },
  { to: "/developers", label: "DEVELOPERS" },
  { to: "/use-cases", label: "USE CASES" },
  { to: "/manifesto", label: "MANIFESTO" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
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
      <Link to="/app" className="btn btn-primary">Launch the prover ↗</Link>
    </nav>
  );
}
