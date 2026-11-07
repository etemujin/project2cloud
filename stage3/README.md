# Stage 3 — Azure Deployment & Documentation

This is Person 3's working folder from `../division.md`. It takes the Stage 1 backend
and the Stage 2 frontend to the cloud and produces the written deliverable. The dataset
moves from a local CSV to **Azure Blob Storage**, the API runs on an **Azure Function App**,
and the dashboard is served from an **Azure Static Web App** — all inside one resource group.

- Deployment script: [deploy.sh](deploy.sh) — idempotent, creates/updates every resource.
- Teardown script: [teardown.sh](teardown.sh) — deletes the whole resource group (stops billing).
- Full written document: [docs/phase2-documentation.md](docs/phase2-documentation.md).
- Requirements analysis: [docs/phase2-analysis.md](docs/phase2-analysis.md).
- Illustrated walkthrough: [docs/phase2-deployment-walkthrough.html](docs/phase2-deployment-walkthrough.html).
- Portal and live-site screenshots: [docs/screenshots/](docs/screenshots/), 16 images.
- Generated report outputs (PDF/HTML): [docs/reports/](docs/reports/).

## Files and Responsibilities

| Path | Purpose |
|---|---|
| deploy.sh | One-command deployment: resource group → storage + blob upload → Function App → backend publish → Static Web App → frontend deploy → CORS + smoke test |
| teardown.sh | Deletes the `cpsy300-nutritional-insights-rg` resource group (irreversible) |
| staticwebapp.config.json | Static Web App routing, security headers and MIME types |
| backend/ | The **cloud** backend (Blob Storage version), deployed to the Function App |
| backend/function_app.py | Same 4 GET routes as Stage 1, but loads the CSV from Blob Storage and caches on the blob ETag (`source: "Azure Blob Storage"`) |
| backend/nutrition.py | Cleaning, imputation and aggregation (shared logic) |
| backend/host.json / requirements.txt / local.settings.json.example / .funcignore | Functions host config, Python deps (incl. `azure-storage-blob`) and a key-free local template |
| docs/ | The written deliverable: requirements analysis, full documentation, walkthrough, screenshots and generated report outputs |

> **Local vs cloud backend:** Stage 1's `../stage1/backend` reads a local CSV
> (`source: "Local CSV"`); the `backend/` here downloads from Blob Storage
> (`source: "Azure Blob Storage"`). They expose the same API contract, so the
> frontend does not change between them — only the data source does.

## Live deployment

| Resource | Value |
|---|---|
| Resource group | `cpsy300-nutritional-insights-rg` (region `canadacentral`) |
| Function App (API) | https://cpsy300-nutrition-api.azurewebsites.net/api |
| Static Web App (dashboard) | https://salmon-ocean-0ce94150f.4.azurestaticapps.net/ |
| Storage container | `datasets` (private), blob `All_Diets.csv` |

API settings injected at deploy time: `AZURE_STORAGE_CONNECTION_STRING`,
`BLOB_CONTAINER_NAME`, `BLOB_NAME`. The connection string is written straight into
the Function App settings and never committed or printed. CORS is scoped at the host
level to the dashboard origin only; the function code sends no `Access-Control-Allow-*`
headers of its own.

## Deploying

```bash
# Prerequisites: Azure CLI (az login), Azure Functions Core Tools v4 (func),
#                Static Web Apps CLI (npm i -g @azure/static-web-apps-cli)
cd stage3
chmod +x deploy.sh teardown.sh
./deploy.sh         # creates/updates everything; prints the two live URLs
# ... capture evidence ...
./teardown.sh       # delete everything when done — Azure bills by the hour
```

### Important: the scripts assume the original `Project2/` layout

`deploy.sh` and `teardown.sh` are kept **verbatim** from Person 3's original
`Project2/` folder, so two paths do not line up with this restructured repo. Set them
before running, or edit the two defaults near the top of `deploy.sh`:

1. **Dataset path.** `CSV_FILE` defaults to `../Project1/data/All_Diets.csv`, which does
   not exist here. Point it at the dataset that ships with Stage 1:
   ```bash
   CSV_FILE=../stage1/data/All_Diets.csv ./deploy.sh
   ```
2. **Frontend folder.** `deploy.sh` copies a sibling `frontend/` folder and injects the
   API URL by replacing a `__FUNCTION_API_URL__` placeholder in `index.html`. The
   restructured frontend lives in `../stage2` and instead sets the API URL in
   [`../stage2/config.js`](../stage2/config.js) (`API_BASE_URL`). So to deploy `stage2`,
   either set `API_BASE_URL` to the live Function URL and deploy `../stage2` directly
   with the `swa` CLI, or adapt the Step 6 build block in `deploy.sh` to copy `../stage2`
   and edit `config.js` instead of `index.html`. The placeholder-replacement step will
   otherwise fail its own `grep` check and stop the script.

Everything else in the scripts (resource group, storage, Function App, CORS, smoke test,
teardown) is layout-independent and runs as written.

## Rubric coverage (where to point the marker)

| Rubric row | Evidence in this folder |
|---|---|
| Cloud deployment (RG, storage, Function App, Static Web App) | `deploy.sh`; `docs/screenshots/portal-*.png` |
| Dataset in Blob Storage | `backend/function_app.py` (blob loader); `docs/screenshots/portal-storage-container*.png` |
| Live API endpoints | `docs/screenshots/api-*.png`; URLs above |
| Live dashboard with ≥3 visualizations + controls | `docs/screenshots/dashboard-live.png`, `dashboard-full-page.png` |
| Execution timing | `metadata.execution_time_seconds` in every data response; `docs/screenshots/cli-cors-and-timing.png` |
| CORS scoped to the dashboard | `deploy.sh` Step 7; `docs/screenshots/cli-cors-and-timing.png` |
| Written document (architecture, findings, challenges) | `docs/phase2-documentation.md`, `docs/phase2-analysis.md` |
| Teardown / cost hygiene | `teardown.sh` |
