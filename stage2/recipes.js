// Recipes table: search, diet filter and pagination, all from /recipes.

const PAGE_LIMIT = 20;

let currentPage = 1;
let totalPages = 1;

async function loadRecipes(page = 1) {
  const search = document.getElementById("searchInput").value.trim();
  const diet = document.getElementById("dietSelect").value;
  const info = document.getElementById("recipesInfo");

  try {
    const data = await apiGet("/recipes", {
      diet_type: diet,
      search: search,
      page: page,
      limit: PAGE_LIMIT
    });

    currentPage = data.page;
    totalPages = data.total_pages;

    renderRecipeRows(data.recipes);
    renderPagination();
    info.textContent = describeResults(data);
  } catch (error) {
    info.textContent = "Could not load recipes: " + error.message;
    showError(error.message);
    console.error(error);
  }
}

function describeResults(data) {
  if (data.total === 0) {
    return "No recipes match your search.";
  }
  const first = (data.page - 1) * data.limit + 1;
  const last = first + data.count - 1;
  return "Showing " + first.toLocaleString() + "–" + last.toLocaleString() +
    " of " + data.total.toLocaleString() + " recipes";
}

function renderRecipeRows(recipes) {
  const body = document.getElementById("recipesBody");
  body.innerHTML = "";

  for (const recipe of recipes) {
    const row = document.createElement("tr");
    const values = [
      recipe["Recipe_name"],
      capitalize(recipe["Diet_type"]),
      capitalize(recipe["Cuisine_type"]),
      recipe["Protein(g)"].toFixed(1),
      recipe["Carbs(g)"].toFixed(1),
      recipe["Fat(g)"].toFixed(1)
    ];

    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    }

    body.appendChild(row);
  }
}

function renderPagination() {
  const container = document.getElementById("pageNumbers");
  container.innerHTML = "";

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page++) {
    const button = document.createElement("button");
    button.textContent = page;
    button.className = page === currentPage ? "page-btn active" : "page-btn";
    button.addEventListener("click", () => loadRecipes(page));
    container.appendChild(button);
  }

  document.getElementById("prevBtn").disabled = currentPage <= 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}