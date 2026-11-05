// Runs when the page opens, and (in later steps) wires up the buttons.

async function checkBackend() {
  const status = document.getElementById("connectionStatus");
  try {
    const data = await apiGet("/health");
    status.textContent = "Backend: " + data.status;
    status.className = "badge badge-ok";
  } catch (error) {
    status.textContent = "Backend: offline";
    status.className = "badge badge-error";
    console.error(error);
  }
}

async function loadInsights() {
  try {
    const data = await apiGet("/insights");
    renderBarChart(data.average_macros);
    renderPieChart(data.summary.diet_counts);
    renderHeatmap(data.correlation);
  } catch (error) {
    console.error(error);
  }
}

const CLUSTER_K = 3;

async function loadClusters() {
  try {
    const data = await apiGet("/clusters", { k: CLUSTER_K });
    renderScatterChart(data);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("insightsBtn").addEventListener("click", loadInsights);
  document.getElementById("clustersBtn").addEventListener("click", loadClusters);
  document.getElementById("recipesBtn").addEventListener("click", () => loadRecipes(1));
  document.getElementById("prevBtn").addEventListener("click", () => loadRecipes(currentPage - 1));
  document.getElementById("nextBtn").addEventListener("click", () => loadRecipes(currentPage + 1));
  document.getElementById("dietSelect").addEventListener("change", () => loadRecipes(1));
  document.getElementById("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      loadRecipes(1);
    }
  });

  checkBackend();
  loadInsights();
  loadClusters();
  loadRecipes(1);
});