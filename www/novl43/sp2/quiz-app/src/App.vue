<script setup>
import { onMounted, ref } from "vue";
import { useQuizStore } from "./stores/quizStore";

import QuestionsMap from "./components/QuestionsMap.vue";
import ResetDataModal from "./components/ResetDataModal.vue";

const quiz = useQuizStore();

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
});

/**
 * UI handlers
 */
const onSetChange = (event) => {
  const id = event.target.value;
  if (id) quiz.selectSet(id);
};

const onSelectQuestion = (index) => {
  quiz.selectQuestion(index);
};
</script>

<template>
  <main class="app">
    <h1>Quiz – učení testových otázek</h1>

    <!-- Set selector -->
    <section>
      <label for="set-select">Vyber kategorii:</label>
      <select id="set-select" @change="onSetChange">
        <option value="">-- vyber --</option>
        <option v-for="set in quiz.sets" :key="set.id" :value="set.id">
          {{ set.name }}
        </option>
      </select>
    </section>

    <section v-if="quiz.currentSetId">
      <!-- Modes + actions -->
      <div class="modes">
        <button
          :class="{ active: quiz.mode === 'all' }"
          @click="quiz.setMode('all')"
          :disabled="quiz.loading"
        >
          Všechny otázky
        </button>

        <button
          :class="{ active: quiz.mode === 'wrong' }"
          @click="quiz.setMode('wrong')"
          :disabled="quiz.loading"
        >
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

      <!-- Map of questions (click to navigate) -->
      <QuestionsMap
        :questions="quiz.filteredQuestions"
        :selectedQuestion="quiz.currentQuestion"
        :wrongIds="quiz.wrongBySet[quiz.currentSetId] || []"
        @select="onSelectQuestion"
      />

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
          <p class="question">{{ quiz.currentQuestion.question }}</p>

          <ul class="answers">
            <li v-for="(ans, i) in quiz.currentQuestion.answers" :key="i">
              <button @click="quiz.answerQuestion(i)">
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
    <ResetDataModal
      :open="resetModalOpen"
      @close="closeResetModal"
      @reset-all="onResetAll"
      @reset-progress="onResetProgress"
    />
  </main>
</template>
