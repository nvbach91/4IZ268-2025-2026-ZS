import { fetchQuestions, fetchCategories } from "./api.js";
import {
  getBestScore,
  saveBestScore,
  addAttempt,
  getAttempts,
  clearAttempts,
  saveLastConfig,
  getActiveQuiz,
  saveActiveQuiz,
  clearActiveQuiz,
} from "./storage.js";
import { readParams, writeParams, clearParams } from "./router.js";
import {
  createInitialState,
  startNewAttempt,
  getCurrentQuestion,
  evaluateAnswer,
  goNext,
  getAttemptStats,
} from "./game.js";
import {
  renderStartScreen,
  setActiveDiff,
  renderLoading,
  renderError,
  renderQuestionScreen,
  showFeedback,
  highlightCorrect,
  highlightWrong,
  disableAnswers,
  showNextButton,
  renderSummary,
  escapeHtml,
  renderStatsPanel,
} from "./ui.js";

let autoNextTimeout = null;
let autoNextInterval = null;

/**
 * root = jediný “container”, do kterého vždycky vykresluje celá obrazovka.
 * (menu / otázku / error / souhrn). Díky tomu je to jednoduchá single-page app.
 */
const root = document.getElementById("app");

/**
 * state = centrální stav hry.
 * Drží info o výběru (kategorie, obtížnost), otázkách, skóre, indexu otázky, čase atd.
 */
const state = createInitialState();

// Start aplikace
init();

/**
 * Základní start:
 * Načte parametry, nastaví state a ukáže menu s předvybranými hodnotami.
 */
async function init() {
  const params = readParams();

  try {
    renderLoading(root);
    const cats = await fetchCategories();
    state.categories = cats;

    if (params.category) state.selectedCategory = params.category;
    if (params.difficulty) state.selectedDifficulty = params.difficulty;

    state.selectedType = params.type || state.selectedType || "";

    saveLastConfig(state.selectedCategory, state.selectedDifficulty, state.selectedType);

    showMenu();
  } catch (e) {
    renderError(root, "Could not load categories.");
  }
}

/**
 * Vykreslí menu a napojí eventy.
 * Protože renderStartScreen používá root.innerHTML, tak se DOM kompletně přepíše
 * listenery je potřeba po každém renderu připojit znovu
 */
function showMenu() {
  const activeQuiz = getActiveQuiz();
  renderStartScreen(root, state, activeQuiz);

  if (activeQuiz) {
    const resumeBtn = root.querySelector("#resumeBtn");
    if (resumeBtn) {
      resumeBtn.addEventListener("click", () => {
        Object.assign(state, activeQuiz); 
        showQuestion();
      });
    }
  }

  const diffContainer = root.querySelector(".row");
  if (diffContainer) {
    diffContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".diff-btn");
      if (btn) {
        state.selectedDifficulty = btn.dataset.diff;
        setActiveDiff(root, state.selectedDifficulty);
        saveLastConfig(state.selectedCategory, state.selectedDifficulty, state.selectedType);
        writeParams(state);
      }
    });
  }

  root.querySelector("#typeSelect").addEventListener("change", (e) => {
    state.selectedType = e.target.value;
    saveLastConfig(state.selectedCategory, state.selectedDifficulty, state.selectedType);
    writeParams(state);
  });

  // Kategorie: select změna -> uloží se do state
  root.querySelector("#categorySelect").addEventListener("change", (e) => {
    state.selectedCategory = e.target.value;

    saveLastConfig(state.selectedCategory, state.selectedDifficulty, state.selectedType);
    writeParams(state);
  });

  /**
   * Start:
   * uloží volbu do URL (bez reloadu stránky)
   * tím pádem jde udělat refresh a aplikace ví, co spustit
   * pak rovnou načte otázky
   */
  root.querySelector("#startBtn").addEventListener("click", () => {
    startQuizFromUrl();
  });

  // Tlačítko “VIEW STATS / HIDE STATS”
  root.querySelector("#statsBtn").addEventListener("click", () => {
    toggleStatsPanel();
  });
}

/**
 * Načte otázky z OpenTDB podle toho, co je zrovna v URL.
 * Čte URL znovu:
 * je to “zdroj pravdy” (když někdo změní URL ručně / jde zpět v historii)
 */
async function startQuizFromUrl() {
  const params = readParams();

  const selectedDiff = params.difficulty || state.selectedDifficulty || "easy";
  const selectedCat = params.category || state.selectedCategory || "9";
  const selectedType = params.type || state.selectedType || "";

  const categoryExists = state.categories.some(c => String(c.id) === String(selectedCat));
  const validDiffs = ["easy", "medium", "hard"];
  const validTypes = ["multiple", "boolean", ""];

  console.log("Validating:", { selectedCat, categoryExists, selectedDiff, selectedType });

  if (!categoryExists || !validDiffs.includes(selectedDiff) || !validTypes.includes(selectedType)) {
    renderError(root, "Invalid quiz parameters. Please check your selection.");
    
    const homeBtn = root.querySelector("#homeBtn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        clearParams(); 
        location.reload(); 
      });
    }
    return;
  }

  // aktualizace stavu parametru
  state.selectedCategory = selectedCat;
  state.selectedDifficulty = selectedDiff;
  state.selectedType = selectedType;

  // zapis url
  writeParams({
    category: state.selectedCategory,
    difficulty: state.selectedDifficulty,
    type: state.selectedType,
  });

  // nacitani otazek
  const amount = 3; 
  let url = `https://opentdb.com/api.php?amount=${amount}&category=${state.selectedCategory}&difficulty=${state.selectedDifficulty}`;
  if (state.selectedType) {
    url += `&type=${state.selectedType}`;
  }

  renderLoading(root);

  try {
    const data = await fetchQuestions(url);
    const qs = data.results || [];

    /**
     * Někdy API vrátí response_code != 0 nebo prázdné results.
     * V tom případě ukáže hlášku a dám možnost návratu domů.
     */
    if (!qs.length) {
      renderError(
        root,
        `No questions available (response_code: ${data.response_code}).`,
      );

      // Po renderError znovu napojí HOME
      root.querySelector("#homeBtn").addEventListener("click", () => {
        clearParams();
        showMenu();
      });

      return;
    }

    // Start nového pokusu: uloží otázky + vynuluje skóre + nastaví start time
    startNewAttempt(state, qs);
    saveActiveQuiz(state); 

    // Zobrazení první otázku
    showQuestion();
  } catch (e) {
    console.error("API Error:", e);
    
    let errorMsg = "Failed to load questions from the API.";
    if (e.message.includes("429")) {
      errorMsg = "Too many requests. Please wait 5 seconds before starting again.";
    }

    renderError(root, errorMsg);

    root.querySelector("#homeBtn").addEventListener("click", () => {
      clearParams();
      showMenu();
    });
  }
}

/**
 * Zobrazí aktuální otázku + nastaví klikání na odpovědi a tlačítka.
 */
function showQuestion() {
  if (autoNextTimeout) clearTimeout(autoNextTimeout);
  if (autoNextInterval) clearInterval(autoNextInterval);

  const q = getCurrentQuestion(state);
  renderQuestionScreen(root, state, q);

  if (state.answered) {
    highlightCorrect(root, q.correct_answer);
    disableAnswers(root);
    showNextButton(root);
    startAutoNext(); 
  }

  const answersContainer = root.querySelector(".answers");
  
  if (answersContainer) {
    answersContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".answer-btn");
      
      if (!btn || btn.disabled || state.answered) return;

      const result = evaluateAnswer(state, btn.dataset.answer);
      if (result.ignored) return;

      highlightCorrect(root, result.correctAnswer);

      if (result.isCorrect) {
        showFeedback(root, "Correct");
      } else {
        highlightWrong(btn);
        showFeedback(root, "Wrong");
      }

      saveActiveQuiz(state); 
      disableAnswers(root);
      showNextButton(root);
      startAutoNext();
    });
  }

  /**
   * MENU během hry:
   * vyčistí URL parametry
   * vrátí uživatele do menu
   */
  root.querySelector("#homeBtnInGame").addEventListener("click", () => {
    clearParams();
    showMenu();
  });

  /**
   * NEXT:
   * posune otázku
   * pokud existuje další -> render další
   * pokud ne -> souhrn + uložení do historie
   */
  root.querySelector("#nextBtn").addEventListener("click", () => {
    if (autoNextTimeout) clearTimeout(autoNextTimeout);
    if (autoNextInterval) clearInterval(autoNextInterval);
    const hasNext = goNext(state);
    saveActiveQuiz(state);  
    if (hasNext) showQuestion();
    else showSummaryScreen();
  });

  const stopBtn = root.querySelector("#stopAutoBtn");
  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
      clearTimeout(autoNextTimeout);
      clearInterval(autoNextInterval);
      stopBtn.remove();
      showFeedback(root, "Auto-advance stopped.");
    });
  }
}

function startAutoNext() {
  let secondsLeft = 5;
  const feedback = root.querySelector("#feedback");

  const updateText = (s) => {
    if (feedback) {
      const statusText = state.answered && state.score > state.correctCount - 1 ? "Correct" : "Wrong";
      feedback.innerHTML = `${statusText}<br><small>Next question in <strong>${s}s</strong>...</small>`;
    }
  };
  updateText(secondsLeft);

  autoNextInterval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft > 0) {
      updateText(secondsLeft);
    } else {
      clearInterval(autoNextInterval);
    }
  }, 1000);

  autoNextTimeout = setTimeout(() => {
    const hasNext = goNext(state);
    if (hasNext) showQuestion();
    else showSummaryScreen();
  }, 5000);
}

/**
 * Souhrn po dokončení kvízu:
 * spočítají se statistiky (accuracy, duration)
 * uloží se best score
 * uloží se attempt do historie (localStorage)
 * vykreslí se “PLAY AGAIN / HOME”
 */
function showSummaryScreen() {
  const { total, durationSec, accuracy } = getAttemptStats(state);

  clearActiveQuiz();

  // Best score se aktualizuje jen když je nové skóre lepší
  const best = getBestScore();
  if (state.score > best) saveBestScore(state.score);

  // Získání názvu kategorie z načteného pole
  const currentCat = state.categories.find(c => String(c.id) === String(state.selectedCategory));
  const categoryName = currentCat ? currentCat.name : "Unknown Category";

  // Uloží se pokus do historie
  addAttempt({
    timestamp: new Date().toISOString(),
    categoryId: state.selectedCategory,
    categoryName: categoryName,
    difficulty: state.selectedDifficulty,
    total,
    score: state.score,
    wrong: state.wrongCount,
    accuracy,
    durationSec,
  });

  /**
   * Připraví se poslední 3 pokusy.
   * escapeHtml proti XSS, jenom pro jistotu (používá se localStorage)
   */
  const attempts = getAttempts();
  const attemptsHtml = attempts.length
    ? attempts
        .slice()
        .reverse()
        .slice(0, 3)
        .map((a) => {
        const date = a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "Unknown date";
        return `
          <div class="summary-line">
            ${date} | ${escapeHtml(a.categoryName)} | ${a.score}/${a.total} | ${a.accuracy}%
          </div>
        `;
      })
      .join("")
  : `<p class="center">No attempts yet.</p>`;

  // Render finálního souhrnu
  renderSummary(root, {
    score: state.score,
    total,
    wrong: state.wrongCount,
    accuracy,
    durationSec,
    bestScore: getBestScore(),
    attemptsHtml,
  });

  // PLAY AGAIN: načte nové otázky se stejným nastavením
  root.querySelector("#playAgainBtn").addEventListener("click", () => {
    startQuizFromUrl();
  });

  // HOME: zpátky do menu + vyčištění URL
  root.querySelector("#homeBtn").addEventListener("click", () => {
    clearParams();
    showMenu();
  });
}

/**
 * Přepne panel statistik v menu (show/hide).
 * Když se panel zapíná, tak vykreslí aktuální statistiky.
 */
function toggleStatsPanel() {
  const panel = root.querySelector("#statsPanel");
  const btn = root.querySelector("#statsBtn");

  const isHidden = panel.classList.contains("hidden");

  if (!isHidden) {
    panel.classList.add("hidden");
    btn.textContent = "VIEW STATS";
  } else {
    updateStatsUI();
    panel.classList.remove("hidden");
    btn.textContent = "HIDE STATS";
  }
}

/**
 * Vykreslí statistiky do panelu v menu:
 * počet her
 * průměrné skóre a přesnost
 * nejlepší pokus
 * posledních 5 pokusů
 * možnost vymazat historii
 */
function updateStatsUI() {
  const attempts = getAttempts();
  const panel = root.querySelector("#statsPanel");
  
  // Zavoláme UI funkci pro vykreslení
  renderStatsPanel(panel, attempts);

  // Napojíme event listener na tlačítko, které se právě vytvořilo
  const clearBtn = panel.querySelector("#clearHistoryBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      const result = await Swal.fire({
        title: "Clear all saved attempts?",
        showCancelButton: true,
      }) 
      if (result.isConfirmed) {
        clearAttempts();
        updateStatsUI();
      }
    });
  }
}