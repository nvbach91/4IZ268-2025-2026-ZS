const els = {
  results: document.getElementById("results"),
  detail: document.getElementById("detail"),
  resultsInfo: document.getElementById("resultsInfo"),
};


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
  const resultsEl = els.results;
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
  const detailEl = els.detail;
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
  const resultsEl = els.results;
  if (!resultsEl) return;

  if (isLoading) {
    resultsEl.classList.add("d-flex", "flex-column", "align-items-center", "justify-content-center", "text-center");
    resultsEl.innerHTML = getSpinnerHtml("Loading results..."); // replace content with spinner
  }
}

// DETAIL loading state
// before detail fetch
export function setDetailLoading(isLoading) {
  const detailEl = els.detail;
  if (!detailEl) return;

  if (isLoading) {
    detailEl.classList.add("d-flex", "flex-column", "align-items-center", "justify-content-center", "text-center");
    detailEl.innerHTML = getSpinnerHtml("Loading detail...");
  }
}

// RESULTS header helper text
export function showResultsInfo(text) {
  const el = els.resultsInfo;
  if (!el) return;
  el.textContent = text;
}

// RESULTS header helper text clear
export function clearResultsInfo() {
  const el = els.resultsInfo;
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
export function renderDetail(drink, { isFavourite, onToggleFavourite, lang = "en", onChangeLang } = {}) {
  const detailEl = els.detail;
  detailEl.classList.remove("d-flex", "flex-column", "justify-content-center", "align-items-center", "text-center"); // remove centering for placeholder
  detailEl.innerHTML = ""; // clear panel

  const ingredients = extractIngredients(drink);
  const getInstructions = (d, l) => {
    const map = {
      en: d.strInstructions,
      es: d.strInstructionsES,
      de: d.strInstructionsDE,
      fr: d.strInstructionsFR,
      it: d.strInstructionsIT,
    };

    return map[l] || d.strInstructions || "No instructions available.";
  };

  const instructions = getInstructions(drink, lang);

  const fav = isFavourite ? isFavourite(drink.idDrink) : false;

  const header = document.createElement("div"); // header block
  header.className = "d-flex gap-3 align-items-start mb-3";
  header.innerHTML = `
    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" width="140" height="140"
         class="object-fit-cover border rounded">
    <div class="flex-grow-1">
      <h3 class="h5 mb-1 d-flex align-items-center gap-2">${drink.strDrink}
        <!-- <button type="button"
          class="btn btn-sm ${fav ? "btn-warning" : "btn-outline-warning"} fav-detail-btn">
          <i class="${fav ? "fa-solid" : "fa-regular"} fa-star"></i>
          ${fav ? "Remove from favourites" : "Add to favourites"}
        </button> -->
      </h3>
      <div class="text-muted small">
        ${drink.strAlcoholic || ""}${drink.strGlass ? " • " + drink.strGlass : ""}
      </div>
      ${drink.strCategory ? `<div class="text-muted small">${drink.strCategory}</div>` : ""}
    </div>
  `;

  const favBtn = header.querySelector(".fav-detail-btn");
  favBtn?.addEventListener("click", () => {
    onToggleFavourite?.(drink.idDrink);
  });



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
  instrBlock.className = "mb-3";
  instrBlock.innerHTML = `
    <h4 class="h6">Recipe</h4>
    <p class="mb-0">${instructions}</p>
  `;


  // language
  const langBlock = document.createElement("div");
  langBlock.className = "mb-2";
  langBlock.innerHTML = `
    <h4 class="h6">Language</h4>
    <div class="btn-group btn-group-sm" role="group" aria-label="Recipe language">
      <button type="button" class="btn ${lang === "en" ? "btn-danger" : "btn-outline-danger"} lang-btn" data-lang="en">EN</button>
      <button type="button" class="btn ${lang === "es" ? "btn-danger" : "btn-outline-danger"} lang-btn" data-lang="es">ES</button>
      <button type="button" class="btn ${lang === "de" ? "btn-danger" : "btn-outline-danger"} lang-btn" data-lang="de">DE</button>
      <button type="button" class="btn ${lang === "fr" ? "btn-danger" : "btn-outline-danger"} lang-btn" data-lang="fr">FR</button>
      <button type="button" class="btn ${lang === "it" ? "btn-danger" : "btn-outline-danger"} lang-btn" data-lang="it">IT</button>
    </div>
  `;

  langBlock.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.lang;
      onChangeLang?.(next);
    });
  });



  // DETAIL add blocks
  detailEl.appendChild(header);
  detailEl.appendChild(ingBlock);
  detailEl.appendChild(instrBlock);
  detailEl.appendChild(langBlock);
}
