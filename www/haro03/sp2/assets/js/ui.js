/**
 * UI modul = jenom vykreslování a práce s DOM.
 * UI dostane data a udělá z nich HTML + pár malých DOM akcí (highlight, disable…).
 */

import { categoryMap } from "./game.js";

/**
 * escapeAttr:
 * PoužíváJjí se hlavně pro atributy v HTML (např. data-answer="...").
 * Stačí tady řešit uvozovky ", protože ty by rozbily atribut.
 */
export function escapeAttr(str) {
  return String(str).replaceAll('"', "&quot;");
}

/**
 * escapeHtml:
 * aby se do stránky omylem nevložili HTML tagy
 * používat kam se vkládá text do innerHTML
 */
export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * renderStartScreen:
 * Vykreslí menu (výběr kategorie, obtížnosti, start, statistiky).
 * rootEl - Root Element - zastupuje hlavní kontejner aplikace v HTML
 * protože se používá rootEl.innerHTML, tak se celý DOM v #app přepíše.
 * Proto se event listenery řeší až v app.js po tomhle renderu.
 */
export function renderStartScreen(rootEl, state) {
  rootEl.innerHTML = `
    <div class="card">
      <div class="title-box">Trivia Game</div>

      <div class="center">
        <div class="section-label">Select category</div>

        <select id="categorySelect" class="select">
          ${Object.entries(categoryMap)
            .map(
              ([id, name]) =>
                `<option value="${id}">${escapeHtml(name)}</option>`,
            )
            .join("")}
        </select>

        <div style="height:16px;"></div>

        <div class="section-label">Select difficulty</div>

        <div class="row" style="margin-top:14px;">
          <button class="btn diff-btn" data-diff="easy">Easy</button>
          <button class="btn diff-btn" data-diff="medium">Medium</button>
          <button class="btn diff-btn" data-diff="hard">Hard</button>
        </div>

        <div style="height:22px;"></div>

        <button id="startBtn" class="btn" style="min-width:260px;">START QUIZ</button>

        <button id="statsBtn" class="btn" style="min-width:260px; margin-top:12px;">
          VIEW STATS
        </button>

        <div id="statsPanel" style="display:none; margin-top:22px;"></div>
      </div>
    </div>
  `;

  // Nastaví se select na aktuální hodnotu ze state (aby to “neposkočilo” na default)
  const categorySelect = rootEl.querySelector("#categorySelect");
  categorySelect.value = state.selectedCategory;

  // Vizuálně se zvýrazní vybranná obtížnost
  setActiveDiff(rootEl, state.selectedDifficulty);
}

/**
 * setActiveDiff:
 * Jenom UI věc – tlačítko vybrané obtížnosti dostane class "active".
 * (Konkrétní vzhled je pak v CSS.)
 */
export function setActiveDiff(rootEl, difficulty) {
  rootEl
    .querySelectorAll(".diff-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const active = rootEl.querySelector(`.diff-btn[data-diff="${difficulty}"]`);
  if (active) active.classList.add("active");
}

/**
 * renderLoading:
 * loading spinner
 */
export function renderLoading(rootEl) {
  rootEl.innerHTML = `
    <div class="card">
      <div class="title-box">Trivia Game</div>

      <div class="center" style="margin-top:32px;">
        <div class="spinner"></div>

        <div style="height:16px;"></div>

        <div style="font-weight:700;">
          Loading questions…
        </div>
      </div>
    </div>
  `;
}

/**
 * renderError:
 * Obrazovka pro chyby (např. API nejede / žádné otázky).
 * message escape – kdyby se tam omylem dostaly HTML znaky, nerozbije to stránku.
 */
export function renderError(rootEl, message) {
  rootEl.innerHTML = `
    <div class="card">
      <div class="title-box">Trivia Game</div>
      <p class="center" style="font-weight:700;">${escapeHtml(message)}</p>
      <div class="actions">
        <button id="homeBtn" class="btn">HOME</button>
      </div>
    </div>
  `;
}

/**
 * renderQuestionScreen:
 * Vykreslí jednu otázku + odpovědi + horní lištu se skóre a progress.
 *
 * odpovědi se zamíchají
 * pak jsou z toho vygenerované HTML tlačítka
 *
 * .sort(() => Math.random() - 0.5) je jednoducjá metoda míchání.
 * Není to 100% perfektní shuffle
 */
export function renderQuestionScreen(rootEl, state, questionObj) {
  // Namíchají se odpovědi: správná + špatné, pak shuffle
  const answers = [
    questionObj.correct_answer,
    ...questionObj.incorrect_answers,
  ].sort(() => Math.random() - 0.5);

  /**
   * data-answer:
   * Ukládá si “skutečnou hodnotu odpovědi” do datasetu
   * escapeAttr pro uvozovky v textu odpovědi.
   */
  const answersHtml = answers
    .map(
      (a) => `
    <button class="answer-btn" data-answer="${escapeAttr(a)}">${a}</button>
  `,
    )
    .join("");

  rootEl.innerHTML = `
    <div class="card">
      <div class="topbar">
        <div class="pill">Question ${state.currentQuestion + 1}/${state.questions.length}</div>

        <button id="homeBtnInGame" class="btn" style="min-width:120px;">MENU</button>

        <div class="pill">Score: ${state.score}</div>
      </div>

      <div class="question-box">${questionObj.question}</div>

      <div class="answers">${answersHtml}</div>

      <div id="feedback" class="center" style="margin-top:18px; font-weight:700;"></div>

      <div class="actions">
        <button id="nextBtn" class="btn" style="display:none;">NEXT</button>
      </div>
    </div>
  `;
}

/**
 * showFeedback:
 * Jenom přepíše text ve feedback boxu.
 */
export function showFeedback(rootEl, text) {
  const el = rootEl.querySelector("#feedback");
  if (el) el.textContent = text;
}

/**
 * highlightCorrect:
 * Projde všechna answer tlačítka a tomu správnému dá class "correct".
 * CSS pak udělá barvu/efekt.
 */
export function highlightCorrect(rootEl, correctAnswer) {
  rootEl.querySelectorAll(".answer-btn").forEach((btn) => {
    if (btn.dataset.answer === correctAnswer) btn.classList.add("correct");
  });
}

/**
 * highlightWrong:
 * Špatně kliknuté tlačítko se označí class "wrong".
 */
export function highlightWrong(btnEl) {
  btnEl.classList.add("wrong");
}

/**
 * disableAnswers:
 * Jakmile uživatel odpoví, všechna tlačítka odpovědí (disabled = true).
 */
export function disableAnswers(rootEl) {
  rootEl
    .querySelectorAll(".answer-btn")
    .forEach((btn) => (btn.disabled = true));
}

/**
 * showNextButton:
 * NEXT tlačítko existuje, ale je skryté.
 * Až po odpovědi se ukáže
 */
export function showNextButton(rootEl) {
  const btn = rootEl.querySelector("#nextBtn");
  if (btn) btn.style.display = "inline-block";
}

/**
 * renderSummary:
 * Finální obrazovka po dokončení kvízu.
 * app.js sem pošle summaryData (score, accuracy, duration + “poslední pokusy” HTML).
 *
 * Tady se jenom vykreslí obsah + tlačítka.
 * Listenery na tlačítka řeší app.js po renderu.
 */
export function renderSummary(rootEl, summaryData) {
  const {
    score,
    total,
    wrong,
    accuracy,
    durationSec,
    bestScore,
    attemptsHtml,
  } = summaryData;

  rootEl.innerHTML = `
    <div class="card">
      <div class="title-box">QUIZ COMPLETE</div>

      <div class="summary-line">Your Score: ${score} / ${total}</div>
      <div class="summary-line">Wrong Answers: ${wrong}</div>
      <div class="summary-line">Accuracy: ${accuracy}%</div>
      <div class="summary-line">Duration: ${durationSec ?? "-"} s</div>

      <div class="summary-line">Best Score (localStorage): ${bestScore} / ${total}</div>

      <div style="height:18px;"></div>
      <div class="title-box">LAST ATTEMPTS</div>

      ${attemptsHtml}

      <div class="actions">
        <button id="playAgainBtn" class="btn">PLAY AGAIN</button>
        <button id="homeBtn" class="btn">HOME</button>
      </div>
    </div>
  `;
}
