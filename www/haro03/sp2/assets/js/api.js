// Načte otázky z externího Trivia API
export async function fetchQuestions(url) {
  // Odeslání HTTP požadavku na API
  const res = await fetch(url);

  // Kontrola, zda server odpověděl úspěšně (status 200–299)
  // Pokud ne, vyhodí chybu, kterou zachytí volající funkce
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  // Převod odpovědi ze serveru do JSON objektu
  const data = await res.json();

  // Vrácení kompletní odpovědi (obsahuje otázky i response_code)
  return data;
}

export async function fetchCategories() {
  const res = await fetch("https://opentdb.com/api_category.php");
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.trivia_categories;
}
