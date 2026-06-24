#!/usr/bin/env bash
# Export the verification key (and, if a proof exists, the Soroban-formatted VK).
# Usage: ./scripts/export-vk.sh [circuit_name]   (default: halo)
set -euo pipefail
cd "$(dirname "$0")/.."   # -> circuits/

CIRCUIT="${1:-halo}"

echo "==> Exporting verification_key.json ..."
snarkjs zkey export verificationkey "build/${CIRCUIT}_final.zkey" build/verification_key.json

# Also emit the Soroban byte-format VK (reused from Day 1) for the Day-3 contract,
# if a proof/public pair is present.
if [ -f build/proof.json ] && [ -f build/public.json ]; then
  node scripts/export-soroban.mjs build
  echo "==> Emitted build/soroban/{vk,proof,public}.json"
fi
echo "==> Done."
