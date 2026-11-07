#!/usr/bin/env bash
# Deletes everything deploy.sh created (the whole resource group).
set -euo pipefail
RG=diet-analysis-rg
read -r -p "Delete resource group '$RG' and ALL resources in it? (yes/no) " ans
[ "$ans" = "yes" ] || { echo "Cancelled."; exit 0; }
az group delete -n $RG --yes --no-wait
rm -f .deploy.env
echo "Deletion started (runs in background, takes a few minutes)."
