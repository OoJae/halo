// Tiny mock-issuer HTTP API. In a real system the issuer performs KYC once and vouches
// for attributes; here it serves a pre-issued demo credential bundle (reusing the tree /
// root already published on-chain). Run: npm run serve  (port 8787)
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "out");
const PORT = 8787;

const read = (f: string) => JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8"));

const app = express();
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/root", (_req, res) => res.json(read("root.json")));

app.get("/credential", (req, res) => {
  const holder = String(req.query.holder || "holderA");
  // Allowlist the holder id to prevent path traversal into arbitrary files.
  if (!/^[a-z0-9_-]+$/i.test(holder)) {
    return res.status(400).json({ error: "invalid holder" });
  }
  const file = path.join(OUT, `${holder}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "unknown holder" });
  res.json(read(`${holder}.json`));
});

app.listen(PORT, () => console.log(`[issuer] http://localhost:${PORT}  (/root, /credential)`));
