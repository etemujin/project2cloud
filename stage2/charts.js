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