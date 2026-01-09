<script setup>
import { onMounted, ref, computed } from "vue";
import { useQuizStore } from "./stores/quizStore";

import QuestionsMap from "./components/QuestionsMap.vue";
import ResetDataModal from "./components/ResetDataModal.vue";

const quiz = useQuizStore();

// Local selection controls — apply with the button
const selectedSet = ref(quiz.currentSetId || "");
const selectedDifficulty = ref(quiz.currentDifficulty);

/**
 * Reset modal state
 */
const resetModalOpen = ref(false);

const openResetModal = () => {
  resetModalOpen.value = true;
};

const closeResetModal = () => {
  resetModalOpen.value = false;
};

/**
 * Modal actions
 * - "all": clears progress + cached questions
 * - "progress": clears only progress (wrong/stats/answered), keeps cached questions
 */
const onResetAll = () => {
  quiz.clearAllData(); // nebo clearAllStorage() – podle toho, jak se jmenuje akce ve storu
  closeResetModal();
};

const onResetProgress = () => {
  quiz.clearProgressOnly();
  closeResetModal();
};

/**
 * Load persisted data on startup
 */
onMounted(() => {
  quiz.loadWrongFromStorage();
  quiz.loadStatsFromStorage();
  quiz.loadAnsweredFromStorage();
  quiz.loadCorrectFromStorage();

  // restore last selected set and difficulty (if present)
  const last = quiz.loadLastSelectedFromStorage();
  if (last?.difficulty) quiz.currentDifficulty = last.difficulty;
  if (last?.setId) quiz.selectSet(last.setId);

  // initialize local controls to current (or restored) values
  selectedDifficulty.value = quiz.currentDifficulty;
  selectedSet.value = quiz.currentSetId || "";
});

const difficulties = ["Easy", "Medium", "Hard"];

const onDifficultyChange = (event) => {
  const level = event.target.value;
  selectedDifficulty.value = level;
};



/**
 * UI handlers
 */
const onSetChange = (event) => {
  selectedSet.value = event.target.value;
};

const onSelectQuestion = (index) => {
  quiz.selectQuestion(index);
};

const applySelection = () => {
  if (!selectedSet.value) return;



  // commit difficulty then select set (selectSet persists the last selection)
  quiz.currentDifficulty = selectedDifficulty.value;
  quiz.selectSet(selectedSet.value);
};
//hanler for answer classes
const getAnswerClass = (index) => {
  const question = quiz.currentQuestion;
  if (!question) return "";

  const selected = quiz.lastSelectedAnswerIndex;

  // ještě nic nebylo zodpovězeno
  if (selected === null) return "";

  const isCorrectIndex = index === question.correctIndex;
  const isSelected = index === selected;

  // správná odpověď vždy zelená, když už se odpovědělo
  if (isCorrectIndex) {
    return "answer--correct";
  }

  // špatně zvolená odpověď označit červeně
  if (isSelected && !quiz.lastAnswerCorrect) {
    return "answer--wrong";
  }

  // ostatní jen lehce „utlumit“
  return "answer--neutral";
};


</script>

<template>
  <main class="app">
    <h1>Quiz – učení testových otázek</h1>

    <!-- Set selector -->
    <section>
      <div class="field">
        <label for="set-select">Vyber kategorii:</label>
        <select id="set-select" v-model="selectedSet" @change="onSetChange">
          <option value="">-- vyber --</option>
          <option v-for="set in quiz.sets" :key="set.id" :value="set.id">
            {{ set.name }}
          </option>
        </select>
      </div>

      <div class="field choices-row">
        <div class="field choices-row2">
        <label for="difficulty-select">Obtížnost:</label>
        <select id="difficulty-select" v-model="selectedDifficulty" @change="onDifficultyChange">
          <option v-for="d in difficulties" :key="d" :value="d">
            {{ d }}
          </option>
        </select>
        </div>
        <button class="btn btn--primary" @click="applySelection" :disabled="!selectedSet">Potvrdit</button>
      </div>
    </section>

    <section v-if="quiz.currentSetId">
      <!-- Modes + actions -->
      <div class="modes">
        <button :class="{ active: quiz.mode === 'all' }" @click="quiz.setMode('all')" :disabled="quiz.loading">
          Všechny otázky
        </button>

        <button :class="{ active: quiz.mode === 'wrong' }" @click="quiz.setMode('wrong')" :disabled="quiz.loading">
          Jen chybné
        </button>

        <button @click="quiz.refreshQuestions()" :disabled="quiz.loading">
          Nové otázky
        </button>

        <button class="btn--danger" @click="openResetModal" :disabled="quiz.loading">
          Reset dat
        </button>
      </div>

      <!-- Stats -->
      <p class="stats">
        Správně: <strong>{{ quiz.currentStats.correct }}</strong> /
        <strong>{{ quiz.currentStats.answered }}</strong>
        ({{ quiz.currentAccuracy }} %)
      </p>
      <p class="SET-pill">
        SET otázek: <strong>{{ quiz.currentSetId }}</strong>
      </p>
      <p class="difficulty-pill">
        Obtížnost otázek: <strong>{{ quiz.currentDifficulty }}</strong>
      </p>

      <!-- Map of questions (click to navigate) -->
      <QuestionsMap :questions="quiz.filteredQuestions" :selectedQuestion="quiz.currentQuestion"
        :wrongIds="quiz.currentWrongIds" :answeredIds="quiz.currentAnsweredIds" :correctIds="quiz.currentCorrectIds" @select="onSelectQuestion" />

      <!-- Loading / error states -->
      <div v-if="quiz.loading" class="loading">
        <div class="spinner" aria-label="Načítám…"></div>
        <p>Načítám otázky…</p>
      </div>

      <p v-else-if="quiz.error" class="error">
        {{ quiz.error }}
      </p>

      <!-- Main quiz -->
      <div v-else>
        <div v-if="quiz.currentQuestion">
          <div class="question" v-html="quiz.currentQuestion.question"></div>

          <ul class="answers">
            <li v-for="(ans, i) in quiz.currentQuestion.answers" :key="i">
              <button @click="quiz.answerQuestion(i)" :class="getAnswerClass(i)">
                {{ ans }}
              </button>
            </li>
          </ul>

          <p v-if="quiz.lastAnswerCorrect === true" class="result ok">
            Správně! ✅
          </p>
          <p v-else-if="quiz.lastAnswerCorrect === false" class="result bad">
            Špatně ❌
          </p>

          <div class="navigation">
            <button @click="quiz.prevQuestion()">Předchozí</button>
            <button @click="quiz.nextQuestion()">Další</button>
          </div>
        </div>

        <p v-else>
          V tomto režimu nejsou k dispozici žádné otázky (např. žádné chybné).
        </p>
      </div>
    </section>

    <!-- Reset modal (teleported to body inside component) -->
    <ResetDataModal :open="resetModalOpen" @close="closeResetModal" @reset-all="onResetAll"
      @reset-progress="onResetProgress" />
  </main>
</template>
