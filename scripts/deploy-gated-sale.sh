#!/usr/bin/env bash
# Deploy + initialize the gated-sale demo, wired to a halo-verifier and the required policy.
# Usage: ./scripts/deploy-gated-sale.sh <verifier_contract_id> [source_identity] [sale_scope]
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VERIFIER="${1:?usage: deploy-gated-sale.sh <verifier_id> [source] [scope]}"
SOURCE="${2:-halo-deployer}"
SALE_SCOPE="${3:-424242}"
NETWORK="testnet"
ADMIN="$(stellar keys address "$SOURCE")"

echo "==> Building gated-sale ..."
( cd "$ROOT_DIR/contracts/gated-sale" && stellar contract build >/dev/null )
WASM="$ROOT_DIR/contracts/gated-sale/target/wasm32v1-none/release/gated_sale.wasm"

echo "==> Deploying ..."
SID="$(stellar contract deploy --wasm "$WASM" --source "$SOURCE" --network "$NETWORK")"
echo "    gated-sale id: $SID"

# The sale gates on is_verified_for(scope, policy), so it stays closed unless the buyer
# proved exactly this eligibility policy — robust even if the verifier's scope registry is unset.
echo "==> initialize(admin, verifier=$VERIFIER, scope=$SALE_SCOPE, policy 2008/1/643) ..."
stellar contract invoke --id "$SID" --source "$SOURCE" --network "$NETWORK" \
  -- initialize --admin "$ADMIN" --verifier "$VERIFIER" --scope "$SALE_SCOPE" \
  --min_birth_year 2008 --require_accredited 1 --banned_country 643 >/dev/null

echo "==> Done. GATED_SALE_ID=$SID"
