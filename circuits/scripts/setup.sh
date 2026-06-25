#!/usr/bin/env bash
# Compile a circuit and run Groth16 setup using a prebuilt Hermez (BN254) ptau.
# Usage: ./scripts/setup.sh [circuit_name]   (default: mul)
set -euo pipefail
cd "$(dirname "$0")/.."   # -> circuits/

CIRCUIT="${1:-halo}"
PTAU="powersOfTau28_hez_final_14.ptau"
PTAU_URL="https://storage.googleapis.com/zkevm/ptau/${PTAU}"

mkdir -p build
if [ ! -f "${PTAU}" ]; then
  echo "==> Downloading prebuilt ptau (${PTAU}) ..."
  curl -fL -o "${PTAU}" "${PTAU_URL}"
fi

echo "==> Compiling ${CIRCUIT}.circom (BN254 / bn128) ..."
circom "${CIRCUIT}.circom" --r1cs --wasm --sym -l node_modules -o build

echo "==> Groth16 setup (phase 2 from prebuilt ptau) ..."
snarkjs groth16 setup "build/${CIRCUIT}.r1cs" "${PTAU}" "build/${CIRCUIT}_0000.zkey"

echo "==> Phase-2 contribution ..."
snarkjs zkey contribute "build/${CIRCUIT}_0000.zkey" "build/${CIRCUIT}_final.zkey" \
  --name="halo-day1" -e="$(head -c 64 /dev/urandom | base64)"

echo "==> Exporting verification_key.json ..."
snarkjs zkey export verificationkey "build/${CIRCUIT}_final.zkey" build/verification_key.json

echo "==> Setup complete. Artifacts in circuits/build/"
