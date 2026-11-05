# Stage 2 — Frontend Dashboard

The web dashboard for the Nutritional Insights project (CPSY 300 Phase 2). It calls the
Stage 1 Azure Function API and shows the results as four visualizations, a searchable
recipe table and pagination. Plain HTML, CSS and JavaScript with Chart.js from a CDN —
no build step, so this folder can be deployed to an Azure Static Web App as-is.

## Files

| File | Purpose |
|---|---|
| index.html | Page layout, following the course UI skeleton |
| styles.css | All styling (colours and sizes match the skeleton) |
| config.js | `API_BASE_URL` — the only line that changes between local and Azure |
| api.js | `apiGet()` fetch helper: errors, error banner, execution-time badge |
| charts.js | Bar chart, pie chart, clusters scatter plot (Chart.js) and the heatmap (HTML/CSS grid) |
| recipes.js | Recipe table, search, diet filter and pagination |
| app.js | Loads everything on page open and wires up the buttons |

## Running locally

1. Start the backend (see `../stage1/README.md`), in Git Bash:
   `cd stage1` → `source .venv311/Scripts/activate` → `func start --port 7071`
2. In a second terminal, serve this folder on port 5500:
   `cd stage2` → `py -3.11 -m http.server 5500`
3. Open http://localhost:5500

Port 5500 matters: the backend's local CORS setting only allows `http://localhost:5500`
and `http://127.0.0.1:5500`. Opening `index.html` directly as a file will not work.

## Which endpoint feeds which part of the page

| Page element | Endpoint | Data used |
|---|---|---|
| Header badge "Backend: healthy" | GET /api/health | `status` |
| Bar chart (average macros by diet) | GET /api/insights | `average_macros` |
| Pie chart (recipes per diet) | GET /api/insights | `summary.diet_counts` |
| Heatmap (nutrient correlations) | GET /api/insights | `correlation` |
| Scatter plot (k-means clusters) | GET /api/clusters?k=3 | `points`, `centroids`, `cluster_counts` |
| Recipe table, search, filter, pages | GET /api/recipes?diet_type=&search=&page=&limit=20 | `recipes`, `total`, `total_pages` |
| Execution-time badge | every data endpoint | `metadata.execution_time_seconds` |

One `/insights` request feeds three visualizations. The badge shows the Function's own
execution time and the browser-measured round trip, labelled with the endpoint.

## Design decisions

- **Scatter plot sampling:** `/clusters` returns all 7,806 points (about 1.2 MB). The chart
  draws every 4th point (about 1,950) so it stays readable; the legend still shows each
  cluster's full count. The whole response is still downloaded — sending fewer points would
  need a backend change.
- **Scatter axis limits:** fixed at 0–600 g protein and 0–1,000 g carbs. Only 65 recipes
  (0.8%) fall outside; without limits a few extreme recipes would squash all other points
  into one corner. The card's caption says so.
- **Heatmap:** Chart.js has no heatmap type, so it is a CSS grid; colour opacity = correlation
  strength (blue positive, red negative, grey when undefined).
- **Errors:** if the API cannot be reached, a red banner explains it; it hides again after the
  next successful request. Buttons show "Loading…" and are disabled while a request runs.
- **Security:** all API text is inserted with `textContent`, never `innerHTML`, so data from the
  dataset can never run as HTML.

## Hand-off to Stage 3 (Azure deployment)

1. In `config.js`, change `API_BASE_URL` to the live Function App URL, ending in `/api`
   with **no trailing slash**, e.g. `https://<function-app>.azurewebsites.net/api`.
2. In the Function App's **CORS** settings in the Azure portal, add the Static Web App's URL
   (e.g. `https://<name>.azurestaticapps.net`). Without this the browser blocks every request.
3. Deploy this `stage2/` folder to the Static Web App: app location `stage2`, no API location,
   no build command, no output location.
4. Check: open the Static Web App URL — the header badge should say "Backend: healthy" and all
   four charts should draw. If not, F12 → Console usually shows a CORS or URL error.