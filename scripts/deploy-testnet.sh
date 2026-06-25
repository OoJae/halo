#!/usr/bin/env bash
# Build, deploy, and initialize the halo-verifier on Stellar testnet.
# Prereqs: `stellar keys generate halo-deployer --network testnet --fund` already done;
#          the issuer has produced issuer/out/root.json (the trusted Merkle root).
# Usage: ./scripts/deploy-testnet.sh [source_identity]   (default: halo-deployer)
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="${1:-halo-deployer}"
NETWORK="testnet"

ADMIN="$(stellar keys address "$SOURCE")"
ROOT="$(node -e "console.log(require('$ROOT_DIR/issuer/out/root.json').root)")"

echo "==> Building halo-verifier ..."
( cd "$ROOT_DIR/contracts/halo-verifier" && stellar contract build >/dev/null )
WASM="$ROOT_DIR/contracts/halo-verifier/target/wasm32v1-none/release/halo_verifier.wasm"

echo "==> Deploying to $NETWORK ..."
CID="$(stellar contract deploy --wasm "$WASM" --source "$SOURCE" --network "$NETWORK")"
echo "    contract id: $CID"

echo "==> initialize(admin=$ADMIN) ..."
stellar contract invoke --id "$CID" --source "$SOURCE" --network "$NETWORK" \
  -- initialize --admin "$ADMIN" >/dev/null

echo "==> set_issuer_root($ROOT) ..."
stellar contract invoke --id "$CID" --source "$SOURCE" --network "$NETWORK" \
  -- set_issuer_root --root "$ROOT" >/dev/null

# Register the eligibility policy for the gated-sale scope so the gate is actually enforced
# on-chain (otherwise an unregistered scope accepts any prover-chosen policy).
SALE_SCOPE="${SALE_SCOPE:-424242}"
echo "==> set_policy(scope=$SALE_SCOPE, minBirthYear=2008, requireAccredited=1, bannedCountry=643) ..."
stellar contract invoke --id "$CID" --source "$SOURCE" --network "$NETWORK" \
  -- set_policy --scope "$SALE_SCOPE" --min_birth_year 2008 --require_accredited 1 --banned_country 643 >/dev/null
echo "==> get_policy($SALE_SCOPE) readback:"
stellar contract invoke --id "$CID" --source "$SOURCE" --network "$NETWORK" -- get_policy --scope "$SALE_SCOPE"

echo "==> Done. Verifier deployed + initialized + policy registered."
echo "    Next: ./scripts/deploy-gated-sale.sh $CID   (deploys + wires the gated-sale demo)"
echo "    HALO_VERIFIER_ID=$CID"
echo
echo "To verify a holder proof (after circuits/scripts/prove.sh + export-vk.sh):"
echo "  stellar contract invoke --id $CID --source $SOURCE --network $NETWORK --send=yes \\"
echo "    -- verify --caller \$($SOURCE addr) \\"
echo "    --proof \"\$(cat circuits/build/soroban/proof.json)\" \\"
echo "    --public_signals \"\$(cat circuits/build/soroban/public.json)\""
