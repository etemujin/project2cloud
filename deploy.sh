#!/usr/bin/env bash
# Deploys backend (Function App + private Blob container) and frontend (Static Web App).
# Run from the repo root:  bash deploy.sh
# Assumes: stage1/ (Function code), stage2/ (static site), stage1/data/All_Diets.csv,
# and that you've run `az login`. Needs: az CLI, Azure Functions Core Tools, Node (for npx).
set -euo pipefail

STATE=.deploy.env
if [ -f "$STATE" ]; then source "$STATE"; else
  SUFFIX=$RANDOM
  echo "SUFFIX=$SUFFIX" > "$STATE"
fi

RG=${RG:-diet-analysis-rg}
LOC=centralus
SWA_LOC=centralus
STORAGE=dietstore$SUFFIX
FUNC=diet-api-$SUFFIX
SWA=diet-dashboard-$SUFFIX
CONTAINER=datasets
CSV=${CSV:-stage1/data/All_Diets.csv}
BACKEND_DIR=${BACKEND_DIR:-stage1}
FRONTEND_DIR=${FRONTEND_DIR:-stage2}

echo "== Resource group"
az group create -n $RG -l $LOC -o none

echo "== Storage account + private container"
az storage account create -n $STORAGE -g $RG -l $LOC --sku Standard_LRS \
  --allow-blob-public-access false -o none
CONN=$(az storage account show-connection-string -n $STORAGE -g $RG -o tsv)
az storage container create -n $CONTAINER --connection-string "$CONN" --public-access off -o none
az storage blob upload -c $CONTAINER -n "$(basename "$CSV")" -f "$CSV" \
  --connection-string "$CONN" --overwrite -o none

echo "== Function App"
az functionapp create -n $FUNC -g $RG --storage-account $STORAGE \
  --consumption-plan-location $LOC --runtime python --runtime-version 3.11 \
  --functions-version 4 --os-type Linux -o none
az functionapp config appsettings set -n $FUNC -g $RG -o none --settings \
  STORAGE_CONNECTION_STRING="$CONN" BLOB_CONTAINER=$CONTAINER \
  BLOB_NAME="$(basename "$CSV")" USE_BLOB=true

echo "== Deploy backend"
(cd "$BACKEND_DIR" && func azure functionapp publish $FUNC --python --build remote)
API_URL="https://$FUNC.azurewebsites.net/api"
echo "Health check:"; curl -s "$API_URL/health" || true; echo

echo "== Static Web App"
az staticwebapp create -n $SWA -g $RG -l $SWA_LOC --sku Free -o none
SWA_HOST=$(az staticwebapp show -n $SWA -g $RG --query defaultHostname -o tsv)
TOKEN=$(az staticwebapp secrets list -n $SWA -g $RG --query properties.apiKey -o tsv)

echo "== Point frontend at live API (adjust if your frontend sets API_URL elsewhere)"
echo "const API_BASE_URL = \"$API_URL\";" > "$FRONTEND_DIR/config.js"

echo "== Deploy frontend"
npx --yes @azure/static-web-apps-cli deploy "./$FRONTEND_DIR" \
  --deployment-token "$TOKEN" --env production

echo "== CORS: only the dashboard may call the API"
az functionapp cors remove -n $FUNC -g $RG --allowed-origins -o none || true
az functionapp cors add -n $FUNC -g $RG --allowed-origins "https://$SWA_HOST" -o none

echo
echo "Function URL : $API_URL"
echo "Dashboard URL: https://$SWA_HOST"
