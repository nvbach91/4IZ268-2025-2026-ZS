// Klíče používané v localStorage
const BEST_KEY = "bestScore";
const ATTEMPTS_KEY = "attempts";
const CONFIG_KEY = "lastConfig";
const ACTIVE_QUIZ_KEY = "activeQuizState";

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
  attempts.push(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(- 20)));
}

// Smaže veškerou historii
export function clearAttempts() {
  localStorage.removeItem(ATTEMPTS_KEY);
}


export function saveLastConfig(category, difficulty, type) {
  const config = { category, difficulty, type };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getLastConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY));
    return config || { category: "9", difficulty: "easy", type: "" };
  } catch {
    return { category: "9", difficulty: "easy", type: "" };
  }
}

export function saveActiveQuiz(gameState) {
  localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(gameState));
}

export function getActiveQuiz() {
  const data = localStorage.getItem(ACTIVE_QUIZ_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearActiveQuiz() {
  localStorage.removeItem(ACTIVE_QUIZ_KEY);
}