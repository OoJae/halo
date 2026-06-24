import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { proveHalo } from "./lib/prover";
import * as stellar from "./lib/stellar";
import "./styles.css";

// Dev-only hook so automated tests can exercise the full prove→submit path headlessly.
if (import.meta.env.DEV) (window as any).__halo = { proveHalo, ...stellar };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
