# project2cloud — Nutritional Insights Dashboard (CPSY 300, Project 2)

A cloud nutrition dashboard: a Python Azure Functions API over an `All_Diets.csv`
dataset, a static Chart.js dashboard, and a full Azure deployment. The work follows
the team's three-stage division in `division.md`.

## Stages

| Stage | Folder | Owner | What it is |
|---|---|---|---|
| 1 | [stage1/](stage1/) | Person 1 | **Backend (local).** 4 GET endpoints, cleaning, k-means from scratch, tests. Reads a local CSV. [summary.html](stage1/summary.html) is the marking summary. |
| 2 | [stage2/](stage2/) | Person 2 | **Frontend dashboard.** HTML/CSS/JS + Chart.js: four visualizations, search, filters, pagination. No build step. |
| 3 | [stage3/](stage3/) | Person 3 | **Azure deployment + document.** Blob Storage, Function App, Static Web App, `deploy.sh`/`teardown.sh`, portal screenshots and the written documentation. |

## Report

Combined write-up for submission: [report/](report/)
— `Nutritional Insights Dashboard - Combined Report.docx` (Stage 1 backend summary +
Phase 2 screenshots).

## Live deployment

- Dashboard: https://salmon-ocean-0ce94150f.4.azurestaticapps.net/
- API: https://cpsy300-nutrition-api.azurewebsites.net/api

See each stage's own `README.md` for how to run or deploy it.
