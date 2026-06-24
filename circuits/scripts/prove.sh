#!/usr/bin/env bash
# Generate a witness + Groth16 proof for a sample input, then verify locally.
# Usage: ./scripts/prove.sh [circuit_name] [input.json]   (defaults: mul input.json)
set -euo pipefail
cd "$(dirname "$0")/.."   # -> circuits/

CIRCUIT="${1:-mul}"
INPUT="${2:-input.json}"

echo "==> Computing witness ..."
node "build/${CIRCUIT}_js/generate_witness.js" \
  "build/${CIRCUIT}_js/${CIRCUIT}.wasm" "${INPUT}" build/witness.wtns

echo "==> Generating proof ..."
snarkjs groth16 prove "build/${CIRCUIT}_final.zkey" build/witness.wtns \
  build/proof.json build/public.json

echo "==> Verifying locally ..."
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
