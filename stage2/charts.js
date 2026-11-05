// Draws the dashboard charts with Chart.js.

const MACRO_COLORS = {
  protein: "#2563eb",
  carbs: "#16a34a",
  fat: "#f59e0b"
};

let barChart = null;

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderBarChart(averageMacros) {
  const labels = averageMacros.map(row => capitalize(row["Diet_type"]));

  const datasets = [
    {
      label: "Protein (g)",
      data: averageMacros.map(row => row["Protein(g)"]),
      backgroundColor: MACRO_COLORS.protein
    },
    {
      label: "Carbs (g)",
      data: averageMacros.map(row => row["Carbs(g)"]),
      backgroundColor: MACRO_COLORS.carbs
    },
    {
      label: "Fat (g)",
      data: averageMacros.map(row => row["Fat(g)"]),
      backgroundColor: MACRO_COLORS.fat
    }
  ];

  if (barChart) {
    barChart.destroy();
  }

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 12 } }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Average grams" } }
      }
    }
  });
}
const DIET_COLORS = ["#0d9488", "#db2777", "#4f46e5", "#ea580c", "#65a30d"];

let pieChart = null;

function renderPieChart(dietCounts) {
  const diets = Object.keys(dietCounts).sort();
  const labels = diets.map(diet => capitalize(diet));
  const counts = diets.map(diet => dietCounts[diet]);
  const total = counts.reduce((sum, count) => sum + count, 0);

  if (pieChart) {
    pieChart.destroy();
  }

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{ data: counts, backgroundColor: DIET_COLORS }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { boxWidth: 12 } },
        tooltip: {
          callbacks: {
            label: context => {
              const percent = (context.parsed / total * 100).toFixed(1);
              return " " + context.parsed + " recipes (" + percent + "%)";
            }
          }
        }
      }
    }
  });
}
const MACRO_NAMES = ["Protein(g)", "Carbs(g)", "Fat(g)"];

function shortName(column) {
  return column.replace("(g)", "");
}

function correlationColor(value) {
  if (value === null) {
    return "#e5e7eb";
  }
  const strength = Math.abs(value);
  if (value >= 0) {
    return "rgba(37, 99, 235, " + strength + ")";
  }
  return "rgba(220, 38, 38, " + strength + ")";
}

function makeCell(text, className) {
  const cell = document.createElement("div");
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function renderHeatmap(correlation) {
  const container = document.getElementById("heatmap");
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "heatmap-grid";

  grid.appendChild(makeCell("", "heatmap-label"));
  for (const column of MACRO_NAMES) {
    grid.appendChild(makeCell(shortName(column), "heatmap-label"));
  }

  for (const row of MACRO_NAMES) {
    grid.appendChild(makeCell(shortName(row), "heatmap-label"));

    for (const column of MACRO_NAMES) {
      const value = correlation[row][column];
      const text = value === null ? "n/a" : value.toFixed(2);
      const cell = makeCell(text, "heatmap-cell");

      cell.style.backgroundColor = correlationColor(value);
      if (value !== null && Math.abs(value) > 0.5) {
        cell.style.color = "white";
      }
      cell.title = shortName(row) + " vs " + shortName(column) + ": " + text;

      grid.appendChild(cell);
    }
  }

  container.appendChild(grid);
}