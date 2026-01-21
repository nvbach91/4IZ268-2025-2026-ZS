// Načte parametry z URL (např. ?category=9&difficulty=easy)
// Díky tomu lze hru obnovit nebo sdílet odkaz
export function readParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get("category"),
    difficulty: params.get("difficulty"),
  };
}

// Zapíše aktuální nastavení do URL bez reloadu stránky
export function writeParams({ category, difficulty }) {
  const params = new URLSearchParams();
  params.set("category", category);
  params.set("difficulty", difficulty);
  history.pushState({}, "", `?${params.toString()}`);
}

// Odstraní parametry z URL (návrat do hlavního menu)
export function clearParams() {
  history.pushState({}, "", window.location.pathname);
}
