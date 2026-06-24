#!/usr/bin/env bash
# Run the Halo demo locally: the mock issuer API + the Vite frontend.
# Prereqs: issuer/out/*.json exist (run `cd issuer && npx tsx src/issue.ts`),
#          and frontend/public/{halo.wasm,halo_final.zkey} exist
#          (cp from circuits/build/halo_js/halo.wasm and circuits/build/halo_final.zkey).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Ensuring circuit artifacts are served..."
cp -f "$ROOT/circuits/build/halo_js/halo.wasm" "$ROOT/frontend/public/halo.wasm"
cp -f "$ROOT/circuits/build/halo_final.zkey" "$ROOT/frontend/public/halo_final.zkey"

echo "==> Starting mock issuer (http://localhost:8787)..."
( cd "$ROOT/issuer" && npm run serve ) &
ISSUER_PID=$!
trap 'kill $ISSUER_PID 2>/dev/null || true' EXIT

echo "==> Starting frontend (http://localhost:5173)..."
cd "$ROOT/frontend" && npm run dev
