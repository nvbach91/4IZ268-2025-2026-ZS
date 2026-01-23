// Načte parametry z URL (např. ?category=9&difficulty=easy)
// Díky tomu lze hru obnovit nebo sdílet odkaz
export function readParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get("category"),
    difficulty: params.get("difficulty"),
    type: params.get("type"),
  };
}

// Zapíše aktuální nastavení do URL bez reloadu stránky
export function writeParams({ category, difficulty, type }) {
  const params = new URLSearchParams();
  
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  if (type) params.set("type", type);
  history.pushState({}, "", `?${params.toString()}`);
}

// Odstraní parametry z URL (návrat do hlavního menu)
export function clearParams() {
  history.pushState({}, "", window.location.pathname);
}
