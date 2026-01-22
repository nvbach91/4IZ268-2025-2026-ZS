// SPINNER
// api response wait
export function getSpinnerHtml(text = "Loading...") {
  return `
    <div class="d-flex flex-column align-items-center justify-content-center text-center text-muted">
      <div class="spinner-border text-danger mb-3" role="status" aria-hidden="true"></div>
      <span>${text}</span>
    </div>
  `;
}

// RESULTS placeholder
// errors or no results
export function showResultsMessage(text, iconClass) {
  const resultsEl = document.getElementById("results");
  resultsEl.classList.add("d-flex", "flex-column", "align-items-center", "justify-content-center", "text-center"); // centers the message
  // replace results content
  resultsEl.innerHTML = `
    <div class="text-muted">
      <i class="fa-solid ${iconClass} fa-3x mb-3 opacity-25"></i>
      <p class="mb-0">${text}</p>
    </div>
  `;
}

// DETAIL placeholder
// nothing selected or error
export function showDetailMessage(text, iconClass) {
  const detailEl = document.getElementById("detail");
  detailEl.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center", "text-center");
  detailEl.innerHTML = `
    <div class="text-muted">
      <i class="fa-solid ${iconClass} fa-3x mb-3 opacity-25"></i>
      <p class="mb-0">${text}</p>
    </div>
  `;
}

// RESULTS loading state
// before search request, turns off when finished
export function setResultsLoading(isLoading) {
  const resultsEl = document.getElementById("results");
  if (!resultsEl) return;

  if (isLoading) {
    resultsEl.classList.add("d-flex", "flex-column", "align-items-center", "justify-content-center", "text-center");
    resultsEl.innerHTML = getSpinnerHtml("Loading results..."); // replace content with spinner
  }
}

// DETAIL loading state
// before detail fetch
export function setDetailLoading(isLoading) {
  const detailEl = document.getElementById("detail");
  if (!detailEl) return;

  if (isLoading) {
    detailEl.classList.add("d-flex", "flex-column", "align-items-center", "justify-content-center", "text-center");
    detailEl.innerHTML = getSpinnerHtml("Loading detail...");
  }
}

// RESULTS header helper text
export function showResultsInfo(text) {
  const el = document.getElementById("resultsInfo");
  if (!el) return;
  el.textContent = text;
}

// RESULTS header helper text clear
export function clearResultsInfo() {
  const el = document.getElementById("resultsInfo");
  if (!el) return;
  el.textContent = "";
}

// extracts ingredients&measures from "drink" object
export function extractIngredients(drink) {
  const out = [];
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const meas = drink[`strMeasure${i}`];

    // add ingredient if exists
    if (ing && ing.trim()) {
      const line = `${meas ? meas.trim() + " " : ""}${ing.trim()}`.trim(); // build one readable line
      out.push(line);
    }
  }
  return out.length ? out : ["No ingredients listed."]; // no ingredient data
}

// DETAIL render
export function renderDetail(drink) {
  const detailEl = document.getElementById("detail");
  detailEl.classList.remove("d-flex", "flex-column", "justify-content-center", "align-items-center", "text-center"); // remove centering for placeholder
  detailEl.innerHTML = ""; // clear panel

  const ingredients = extractIngredients(drink);

  const header = document.createElement("div"); // header block
  header.className = "d-flex gap-3 align-items-start mb-3";
  header.innerHTML = `
    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" width="140" height="140"
         class="rounded" style="object-fit: cover;">
    <div class="flex-grow-1">
      <h3 class="h5 mb-1">${drink.strDrink}</h3>
      <div class="text-muted small">
        ${drink.strAlcoholic || ""}${drink.strGlass ? " • " + drink.strGlass : ""}
      </div>
      ${drink.strCategory ? `<div class="text-muted small">${drink.strCategory}</div>` : ""}
    </div>
  `;

  // ingredients
  const ingBlock = document.createElement("div");
  ingBlock.className = "mb-3";
  ingBlock.innerHTML = `
    <h4 class="h6">Ingredients</h4>
    <ul class="mb-0">
      ${ingredients.map((x) => `<li>${x}</li>`).join("")}
    </ul>
  `;

  // instructions
  const instrBlock = document.createElement("div");
  instrBlock.innerHTML = `
    <h4 class="h6">Recipe</h4>
    <p class="mb-0">${drink.strInstructions || "No instructions available."}</p>
  `;

  // DETAIL add blocks
  detailEl.appendChild(header);
  detailEl.appendChild(ingBlock);
  detailEl.appendChild(instrBlock);
}
