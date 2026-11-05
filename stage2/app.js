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
  checkBackend();
  loadInsights();
  loadClusters();
});