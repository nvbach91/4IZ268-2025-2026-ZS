// Klíče používané v localStorage
const BEST_KEY = "bestScore";
const ATTEMPTS_KEY = "attempts";

// Vrátí nejlepší dosažené skóre
export function getBestScore() {
  return Number(localStorage.getItem(BEST_KEY) || 0);
}

// Uloží nové nejlepší skóre
export function saveBestScore(score) {
  localStorage.setItem(BEST_KEY, String(score));
}

// Načte historii všech pokusů (převede JSON řetězec zpět na pole)
export function getAttempts() {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || [];
  } catch {
    // Pokud je JSON poškozený, vrátí se prázdné pole
    return [];
  }
}

// Přidá nový pokus do historie
// Historie je omezená na posledních 20 her
export function addAttempt(attempt) {
  const attempts = getAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, 20)));
}

// Smaže veškerou historii
export function clearAttempts() {
  localStorage.removeItem(ATTEMPTS_KEY);
}
