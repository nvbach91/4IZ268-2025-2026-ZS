/**
 * UI modul = jenom vykreslování a práce s DOM.
 */

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
export function renderStartScreen(rootEl, state, activeQuiz = null) {
  const resumeHtml = activeQuiz 
    ? `<button id="resumeBtn" class="btn w-260 mt-12 green-btn">RESUME QUIZ (${activeQuiz.currentQuestion + 1}/${activeQuiz.questions.length})</button>`
    : "";
  rootEl.innerHTML = `
    <div class="card">
      <div class="title-box">Trivia Game</div>

      <div class="center">
        <div class="section-label">Select category</div>

        <select id="categorySelect" class="select">
          ${state.categories
            .map(
              (cat) =>
                `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`,
            )
            .join("")}
        </select>

        <div class="section-label mt-14">Select type</div>
        <select id="typeSelect" class="select">
          <option value="">Any Type</option>
          <option value="multiple">Multiple Choice</option>
          <option value="boolean">True / False</option>
        </select>

        <div class="h-16"></div>

        <div class="section-label">Select difficulty</div>

        <div class="row mt-14">
          <button class="btn diff-btn" data-diff="easy">Easy</button>
          <button class="btn diff-btn" data-diff="medium">Medium</button>
          <button class="btn diff-btn" data-diff="hard">Hard</button>
        </div>

        <div class="h-22"></div>
        ${resumeHtml}
        <button id="startBtn" class="btn w-260">START QUIZ</button>

        <button id="statsBtn" class="btn w-260 mt-12">
          VIEW STATS
        </button>

        <div id="statsPanel" class="hidden mt-22"></div>
      </div>
    </div>
  `;

  // Nastaví se select na aktuální hodnotu ze state (aby to “neposkočilo” na default)
  rootEl.querySelector("#categorySelect").value = state.selectedCategory;
  rootEl.querySelector("#typeSelect").value = state.selectedType || "";

  const catSelect = rootEl.querySelector("#categorySelect");
  if (catSelect) {
    if (![...catSelect.options].some(opt => opt.value === String(state.selectedCategory))) {
        state.selectedCategory = catSelect.options[0]?.value || "9";
    }
    catSelect.value = state.selectedCategory;
  }

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

      <div class="center mt-32">
        <div class="spinner"></div>

        <div class="h-16"></div>

        <div class="bold-700">
          Loading…
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
      <p class="center bold-700">${escapeHtml(message)}</p>
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
  const allAnswers = [
    questionObj.correct_answer,
    ...questionObj.incorrect_answers,
  ];

  /**
   * data-answer:
   * Ukládá si “skutečnou hodnotu odpovědi” do datasetu
   * escapeAttr pro uvozovky v textu odpovědi.
   */

  let sortedAnswers;

  if (allAnswers.length === 2 && (allAnswers.includes("True") || allAnswers.includes("False"))) {
    sortedAnswers = allAnswers.sort().reverse();
  } else {
    sortedAnswers = allAnswers.sort(() => Math.random() - 0.5);
  }

  const answersHtml = sortedAnswers
    .map(
      (a) => `
    <button class="answer-btn" data-answer="${escapeAttr(a)}">${escapeHtml(a)}</button>
  `
    )
    .join("");

  rootEl.innerHTML = `
    <div class="card">
      <div class="topbar">
        <div class="pill">Question ${state.currentQuestion + 1}/${state.questions.length}</div>

        <button id="homeBtnInGame" class="btn w-120">MENU</button>

        <div class="pill">Score: ${state.score}</div>
      </div>

      <div class="question-box">${questionObj.question}</div>

      <div class="answers">${answersHtml}</div>

      <div id="feedback" class="center mt-18 bold-700"></div>

      <div class="actions">
        <button id="stopAutoBtn" class="btn hidden red-btn">STOP</button>
        <button id="nextBtn" class="btn hidden">NEXT</button>
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
  const btns = rootEl.querySelectorAll(".answer-btn");
  for (let i = 0; i < btns.length; i++) {
    btns[i].disabled = true;
  }
}

/**
 * showNextButton:
 * NEXT tlačítko existuje, ale je skryté.
 * Až po odpovědi se ukáže
 */
export function showNextButton(rootEl) {
  const nextBtn = rootEl.querySelector("#nextBtn");
  const stopBtn = rootEl.querySelector("#stopAutoBtn");

  if (nextBtn) {
    nextBtn.classList.remove("hidden");
    nextBtn.classList.add("inline-block");
  }
  
  if (stopBtn) {
    stopBtn.classList.remove("hidden");
    stopBtn.classList.add("inline-block");
  }
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

      <div class="h-18"></div>
      <div class="title-box">LAST ATTEMPTS</div>

      ${attemptsHtml}

      <div class="actions">
        <button id="playAgainBtn" class="btn">PLAY AGAIN</button>
        <button id="homeBtn" class="btn">HOME</button>
      </div>
    </div>
  `;
}


/**
 * renderStatsPanel:
 * Vykreslí vnitřek panelu statistik.
 * Data (attempts) dostává jako parametr z app.js.
 */
export function renderStatsPanel(container, attempts) {
  if (!attempts.length) {
    container.innerHTML = `
      <div class="title-box mt-22">STATS</div>
      <p class="center bold-700">No attempts yet.</p>
    `;
    return;
  }

  const games = attempts.length;
  const bestAttempt = attempts.reduce(
    (best, a) => (a.score > best.score ? a : best),
    attempts[0]
  );

  const avgAccuracy = Math.round(
    attempts.reduce((sum, a) => sum + (Number(a.accuracy) || 0), 0) / games
  );
  const avgScore = Math.round(
    attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / games
  );

  // Příprava historie
  const last5Html = attempts
    .slice()
    .reverse()
    .slice(0, 5)
    .map((a) => {
      const dateObj = new Date(a.timestamp);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="summary-line">
          ${date} ${time} | ${escapeHtml(a.categoryName)} | ${a.score}/${a.total} | ${a.durationSec ?? "-"} s
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="title-box mt-22">STATS</div>

    <div class="summary-line">Games played: ${games}</div>
    <div class="summary-line">Average score: ${avgScore}</div>
    <div class="summary-line">Average accuracy: ${avgAccuracy}%</div>
    <div class="summary-line">
      Best attempt: ${escapeHtml(bestAttempt.categoryName)} (${escapeHtml(bestAttempt.difficulty)})
      — ${bestAttempt.score}/${bestAttempt.total}
    </div>

    <div class="h-14"></div> 
    
    <div class="title-box">RECENT ATTEMPTS</div>
    ${last5Html}

    <div class="actions mt-22">
      <button id="clearHistoryBtn" class="btn">CLEAR HISTORY</button>
    </div>
  `;
}