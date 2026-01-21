// Mapuje ID kategorií z API na lidsky čitelné názvy
// Používá se ve statistikách a souhrnu hry
export const categoryMap = {
  9: "General Knowledge",
  21: "Sports",
  23: "History",
  17: "Science & Nature",
  22: "Geography",
  11: "Entertainment: Film",
};

// Vytvoří počáteční stav aplikace
// Tento objekt reprezentuje jednu herní relaci
export function createInitialState() {
  return {
    selectedCategory: "9", // výchozí kategorie
    selectedDifficulty: "easy", // výchozí obtížnost

    questions: [], // pole načtených otázek
    currentQuestion: 0, // index aktuální otázky
    score: 0, // počet správných odpovědí
    answered: false, // ochrana proti vícenásobnému kliknutí

    correctCount: 0, // počet správných odpovědí
    wrongCount: 0, // počet chybných odpovědí
    quizStartTime: null, // čas spuštění kvízu (pro výpočet délky)
  };
}

// Inicializuje nový pokus (nová hra)
export function startNewAttempt(state, questions) {
  state.questions = questions;
  state.currentQuestion = 0;
  state.score = 0;
  state.answered = false;

  state.correctCount = 0;
  state.wrongCount = 0;
  state.quizStartTime = Date.now(); // uložení času startu
}

// Vrátí aktuální otázku podle indexu
export function getCurrentQuestion(state) {
  return state.questions[state.currentQuestion];
}

// Vyhodnotí odpověď uživatele
// Aktualizuje skóre a zabrání opakovanému kliknutí
export function evaluateAnswer(state, selectedAnswer) {
  // Pokud už uživatel odpověděl, další klik ignoruje
  if (state.answered) return { ignored: true };

  state.answered = true;
  const q = getCurrentQuestion(state);
  const correct = q.correct_answer;

  const isCorrect = selectedAnswer === correct;
  if (isCorrect) {
    state.score += 1;
    state.correctCount += 1;
  } else {
    state.wrongCount += 1;
  }

  return { ignored: false, isCorrect, correctAnswer: correct };
}

// Posune hru na další otázku
// Vrací true, pokud další otázka existuje
export function goNext(state) {
  state.currentQuestion += 1;
  state.answered = false;
  return state.currentQuestion < state.questions.length; // Vrátí true, pokud jsou další otázky
}

// Spočítá souhrnné statistiky pokusu
export function getAttemptStats(state) {
  const total = state.questions.length;
  const durationSec = state.quizStartTime
    ? Math.round((Date.now() - state.quizStartTime) / 1000)
    : null;

  const accuracy = total ? Math.round((state.correctCount / total) * 100) : 0;

  return { total, durationSec, accuracy };
}
