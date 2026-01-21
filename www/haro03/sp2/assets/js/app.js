import { fetchQuestions } from "./api.js";
import {
  getBestScore,
  saveBestScore,
  addAttempt,
  getAttempts,
  clearAttempts,
} from "./storage.js";
import { readParams, writeParams, clearParams } from "./router.js";
import {
  createInitialState,
  startNewAttempt,
  getCurrentQuestion,
  evaluateAnswer,
  goNext,
  getAttemptStats,
  categoryMap,
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
} from "./ui.js";

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
 *   když je v URL category & difficulty -> rovnou spustí kvíz (funguje i po refreshi)
 *   když ne -> ukáže menu
 */
function init() {
  const { category, difficulty } = readParams();

  if (category && difficulty) {
    // Uživatel přišel přes link nebo refreshnul stránku ve hře
    state.selectedCategory = category;
    state.selectedDifficulty = difficulty;
    startQuizFromUrl();
  } else {
    // Normální start bez parametrů -> menu
    showMenu();
  }
}

/**
 * Vykreslí menu a napojí eventy.
 * Protože renderStartScreen používá root.innerHTML, tak se DOM kompletně přepíše
 * listenery je potřeba po každém renderu připojit znovu
 */
function showMenu() {
  renderStartScreen(root, state);

  // Kategorie: select změna -> uloží se do state
  root.querySelector("#categorySelect").addEventListener("change", (e) => {
    state.selectedCategory = e.target.value;
  });

  // Obtížnost: tlačítka easy/medium/hard
  root.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedDifficulty = btn.dataset.diff;

      // Jen vizuální highlight, ať je jasné co je vybrané
      setActiveDiff(root, state.selectedDifficulty);
    });
  });

  /**
   * Start:
   * uloží volbu do URL (bez reloadu stránky)
   * tím pádem jde udělat refresh a aplikace ví, co spustit
   * pak rovnou načte otázky
   */
  root.querySelector("#startBtn").addEventListener("click", () => {
    writeParams({
      category: state.selectedCategory,
      difficulty: state.selectedDifficulty,
    });
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
  const { category, difficulty } = readParams();

  // Když jsou parametry, přepíše state (ať je to konzistentní)
  if (category) state.selectedCategory = category;
  if (difficulty) state.selectedDifficulty = difficulty;

  const amount = 10; // počet otázek na jeden kvíz

  // Složení API URL
  const url =
    `https://opentdb.com/api.php?amount=${amount}` +
    `&type=multiple` +
    `&category=${state.selectedCategory}` +
    `&difficulty=${state.selectedDifficulty}`;

  // UI ukáže “Loading…”
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

    // Zobrazení první otázku
    showQuestion();
  } catch (e) {
    // Síť / API error
    renderError(root, "Failed to load questions from the API.");

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
  const q = getCurrentQuestion(state);
  renderQuestionScreen(root, state, q);

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
   * Kliknutí na odpověď:
   * evaluateAnswer řeší logiku (správně/špatně + update state)
   * UI jen ukáže feedback (barvy + text)
   */
  root.querySelectorAll(".answer-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const result = evaluateAnswer(state, btn.dataset.answer);

      // Ochrana proti doubleclick / změně odpovědi
      if (result.ignored) return;

      // Vždy se ukáže správná odpověď
      highlightCorrect(root, result.correctAnswer);

      if (result.isCorrect) {
        showFeedback(root, "✅ Correct!");
      } else {
        highlightWrong(btn);
        showFeedback(root, "❌ Wrong.");
      }

      // Zamknou se odpovědi, ať nejde odpověď překliknout
      disableAnswers(root);

      // NEXT se ukáže až po odpovědi
      showNextButton(root);
    });
  });

  /**
   * NEXT:
   * posune otázku
   * pokud existuje další -> render další
   * pokud ne -> souhrn + uložení do historie
   */
  root.querySelector("#nextBtn").addEventListener("click", () => {
    const hasNext = goNext(state);
    if (hasNext) showQuestion();
    else showSummaryScreen();
  });
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

  // Best score se aktualizuje jen když je nové skóre lepší
  const best = getBestScore();
  if (state.score > best) saveBestScore(state.score);

  // Uloží se pokus do historie
  addAttempt({
    timestamp: new Date().toISOString(),
    categoryId: state.selectedCategory,
    categoryName: categoryMap[state.selectedCategory] || "Unknown",
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
        .slice(0, 3)
        .map(
          (a) => `
        <div class="summary-line">
          ${escapeHtml(a.categoryName)} | ${escapeHtml(a.difficulty)} |
          ${a.score}/${a.total} | ${a.accuracy}% | ${a.durationSec ?? "-"} s
        </div>
      `,
        )
        .join("")
    : `<p class="center" style="font-weight:700;">No attempts yet.</p>`;

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

  if (panel.style.display === "block") {
    panel.style.display = "none";
    btn.textContent = "VIEW STATS";
    return;
  }

  renderStats();
  panel.style.display = "block";
  btn.textContent = "HIDE STATS";
}

/**
 * Vykreslí statistiky do panelu v menu:
 * počet her
 * průměrné skóre a přesnost
 * nejlepší pokus
 * posledních 5 pokusů
 * možnost vymazat historii
 */
function renderStats() {
  const attempts = getAttempts();
  const panel = root.querySelector("#statsPanel");

  // Když nic není uložené, ukáže "No attempts yet."
  if (!attempts.length) {
    panel.innerHTML = `
      <div class="title-box">STATS</div>
      <p class="center" style="font-weight:700;">No attempts yet.</p>
    `;
    return;
  }

  const games = attempts.length;

  // Nalezen9 nejlepšího pokusu podle score
  const bestAttempt = attempts.reduce(
    (best, a) => (a.score > best.score ? a : best),
    attempts[0],
  );

  // Průměry
  const avgAccuracy = Math.round(
    attempts.reduce((sum, a) => sum + (Number(a.accuracy) || 0), 0) / games,
  );
  const avgScore = Math.round(
    attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / games,
  );

  // Posledních 5 pokusů (nejnovější jsou na začátku díky unshift)
  const last5Html = attempts
    .slice(0, 5)
    .map(
      (a) => `
    <div class="summary-line">
      ${escapeHtml(a.categoryName)} | ${escapeHtml(a.difficulty)} |
      ${a.score}/${a.total} | ${a.accuracy}% | ${a.durationSec ?? "-"} s
    </div>
  `,
    )
    .join("");

  panel.innerHTML = `
    <div class="title-box">STATS</div>

    <div class="summary-line">Games played: ${games}</div>
    <div class="summary-line">Average score: ${avgScore}</div>
    <div class="summary-line">Average accuracy: ${avgAccuracy}%</div>
    <div class="summary-line">
      Best attempt: ${escapeHtml(bestAttempt.categoryName)} (${escapeHtml(bestAttempt.difficulty)})
      — ${bestAttempt.score}/${bestAttempt.total}
    </div>

    <div style="height:14px;"></div>
    <div class="title-box">RECENT ATTEMPTS</div>
    ${last5Html}

    <div class="actions">
      <button id="clearHistoryBtn" class="btn">CLEAR HISTORY</button>
    </div>
  `;

  // Clear history s potvrzením
  panel.querySelector("#clearHistoryBtn").addEventListener("click", () => {
    if (!confirm("Clear all saved attempts?")) return;
    clearAttempts();
    renderStats(); // po smazání se překreslí panel
  });
}
