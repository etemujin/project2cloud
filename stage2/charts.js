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