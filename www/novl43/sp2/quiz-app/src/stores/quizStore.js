// src/stores/quizStore.js
import { defineStore } from "pinia";

import MarkdownIt from "markdown-it";
const md = new MarkdownIt();
function formatQuestion(text) {
  return md.render(text);
}

/**
 * =========================================================
 * CONFIG (API + localStorage keys)
 * =========================================================
 */
const LS_WRONG_KEY = "quiz_wrong_questions";
const LS_STATS_KEY = "quiz_stats_by_set";
const LS_ANSWERED_KEY = "quiz_answered_questions";

const CACHE_PREFIX = "quiz_cache_v1";

const QUESTIONS_LIMIT = 20; // QuizAPI allows max 20
const DEFAULT_DIFFICULTY = "Medium";

// pomocná funkce - klíč pro per-set+difficulty struktury
const progressKey = (setId, difficulty) => `${setId}__${difficulty}`;

export const useQuizStore = defineStore("quiz", {
  /**
   * =========================================================
   * STATE
   * =========================================================
   */
  state: () => ({
    sets: [
      { id: "Linux", name: "Linux" },
      { id: "Code", name: "Programování (Code)" },
      { id: "SQL", name: "SQL" },
      { id: "Docker", name: "Docker" },
    ],

    // Current selection / navigation
    currentSetId: null,
    currentDifficulty: DEFAULT_DIFFICULTY,
    questions: [],
    currentIndex: 0,
    mode: "all", // "all" | "wrong"
    lastAnswerCorrect: null,

    // User progress (per set + difficulty)
    wrongBySet: {}, // { [setId__difficulty]: questionId[] }
    answeredQuestionIdsBySet: {}, // { [setId__difficulty]: questionId[] }
    statsBySet: {}, // { [setId__difficulty]: { answered: number, correct: number } }

    // Async state (used by UI)
    loading: false,
    error: null,

    lastAnswerCorrect: null,
lastSelectedAnswerIndex: null,
  }),

  /**
   * =========================================================
   * GETTERS
   * =========================================================
   */
  getters: {
    // wrong ids pro aktuální kombinaci set+difficulty
    currentWrongIds(state) {
      const key = progressKey(state.currentSetId, state.currentDifficulty);
      return state.wrongBySet[key] || [];
    },

    // answered ids pro aktuální kombinaci set+difficulty
    currentAnsweredIds(state) {
      const key = progressKey(state.currentSetId, state.currentDifficulty);
      return state.answeredQuestionIdsBySet[key] || [];
    },

    filteredQuestions(state) {
      if (state.mode === "all") return state.questions;

      const wrongIds = this.currentWrongIds;
      return state.questions.filter((q) => wrongIds.includes(q.id));
    },

    currentQuestion(state) {
      const list = this.filteredQuestions;
      if (!list.length) return null;
      return list[state.currentIndex] || null;
    },

    currentStats(state) {
      const key = progressKey(state.currentSetId, state.currentDifficulty);
      return state.statsBySet[key] || { answered: 0, correct: 0 };
    },

    currentAccuracy() {
      const s = this.currentStats;
      return s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
    },
  },

  /**
   * =========================================================
   * ACTIONS
   * =========================================================
   */
  actions: {
    /**
     * ---------------------------
     * STORAGE: WRONG
     * ---------------------------
     */
    loadWrongFromStorage() {
      try {
        const raw = localStorage.getItem(LS_WRONG_KEY);
        this.wrongBySet = raw ? JSON.parse(raw) : {};
      } catch {
        this.wrongBySet = {};
      }
    },

    saveWrongToStorage() {
      localStorage.setItem(LS_WRONG_KEY, JSON.stringify(this.wrongBySet));
    },

    /**
     * ---------------------------
     * STORAGE: STATS
     * ---------------------------
     */
    loadStatsFromStorage() {
      try {
        const raw = localStorage.getItem(LS_STATS_KEY);
        this.statsBySet = raw ? JSON.parse(raw) : {};
      } catch {
        this.statsBySet = {};
      }
    },

    saveStatsToStorage() {
      localStorage.setItem(LS_STATS_KEY, JSON.stringify(this.statsBySet));
    },

    /**
     * ---------------------------
     * STORAGE: ANSWERED IDS
     * ---------------------------
     */
    loadAnsweredFromStorage() {
      try {
        const raw = localStorage.getItem(LS_ANSWERED_KEY);
        this.answeredQuestionIdsBySet = raw ? JSON.parse(raw) : {};
      } catch {
        this.answeredQuestionIdsBySet = {};
      }
    },

    saveAnsweredToStorage() {
      localStorage.setItem(
        LS_ANSWERED_KEY,
        JSON.stringify(this.answeredQuestionIdsBySet)
      );
    },

    /**
     * ---------------------------
     * CACHE (Questions)
     * ---------------------------
     */
    getCacheKey(setId) {
      return `${CACHE_PREFIX}_${setId}_${this.currentDifficulty}_${QUESTIONS_LIMIT}`;
    },

    loadQuestionsFromCache(setId) {
      try {
        const raw = localStorage.getItem(this.getCacheKey(setId));
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },

    saveQuestionsToCache(setId, questions) {
      localStorage.setItem(this.getCacheKey(setId), JSON.stringify(questions));
    },

    clearQuestionsCache(setId) {
      localStorage.removeItem(this.getCacheKey(setId));
    },

    /**
     * ---------------------------
     * API: Load questions for a set
     * - Uses cache first (stable question set)
     * - Falls back to QuizAPI (random questions)
     * ---------------------------
     */
    async selectSet(setId) {
      // Reset view state
      this.currentSetId = setId;
      this.currentIndex = 0;
      this.mode = "all";
      this.lastAnswerCorrect = null;
      this.error = null;

      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;  

      const key = progressKey(setId, this.currentDifficulty);

      // Ensure per-set+difficulty progress containers exist
      if (!this.statsBySet[key]) {
        this.statsBySet[key] = { answered: 0, correct: 0 };
        this.saveStatsToStorage();
      }
      if (!this.answeredQuestionIdsBySet[key]) {
        this.answeredQuestionIdsBySet[key] = [];
        this.saveAnsweredToStorage();
      }
      if (!this.wrongBySet[key]) {
        this.wrongBySet[key] = [];
        this.saveWrongToStorage();
      }

      // 1) Cache first (prevents "different questions" after switching sets)
      const cached = this.loadQuestionsFromCache(setId);
      if (cached?.length) {
        this.questions = cached;
        return;
      }

      // 2) API fetch
      const apiKey = import.meta.env.VITE_QUIZ_API_KEY;
      if (!apiKey) {
        this.questions = [];
        this.error = "Chybí API key (VITE_QUIZ_API_KEY).";
        return;
      }

      this.loading = true;
      try {
        const url = `https://quizapi.io/api/v1/questions?limit=${QUESTIONS_LIMIT}&category=${encodeURIComponent(
          setId
        )}&difficulty=${this.currentDifficulty}`;

        const res = await fetch(url, { headers: { "X-Api-Key": apiKey } });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const apiQuestions = await res.json();

        // Map QuizAPI format => internal format
        this.questions = apiQuestions.map((q, index) => {
          // Filter out null answers
          const entries = Object.entries(q.answers).filter(
            ([, v]) => v !== null
          );
          const answers = entries.map(([, v]) => v);
          const answerKeys = entries.map(([k]) => k);

          const correctIndex = answerKeys.findIndex(
            (key) => q.correct_answers[`${key}_correct`] === "true"
          );

          return {
            // Prefer stable API question id; fallback just in case
            id: q.id ?? `${setId}-${index}`,
            question: formatQuestion(q.question ?? ""),
            answers,
            correctIndex: correctIndex === -1 ? 0 : correctIndex,
          };
        });

        // Save to cache so "Linux" + konkrétní obtížnost zůstane stejné
        this.saveQuestionsToCache(setId, this.questions);
      } catch (e) {
        console.error(e);
        this.questions = [];
        this.error = "Nepodařilo se načíst otázky. Zkus to prosím znovu.";
      } finally {
        this.loading = false;
      }
    },

    // clear only progress data for current set + difficulty
    clearCurrentSetProgress() {
      const setId = this.currentSetId;
      if (!setId) return;

      const key = progressKey(setId, this.currentDifficulty);

      delete this.wrongBySet[key];
      delete this.statsBySet[key];
      delete this.answeredQuestionIdsBySet[key];

      this.saveWrongToStorage();
      this.saveStatsToStorage();
      this.saveAnsweredToStorage();

      this.lastAnswerCorrect = null;

      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;  
    },

    async refreshQuestions() {
      if (!this.currentSetId) return;
      this.clearQuestionsCache(this.currentSetId);
      this.clearCurrentSetProgress();
      await this.selectSet(this.currentSetId);
    },

    /**
     * Změna obtížnosti z UI
     */
    setDifficulty(difficulty) {
      if (this.currentDifficulty === difficulty) return;

      this.currentDifficulty = difficulty;

      // pokud už je vybraný set, načti otázky pro novou obtížnost
      if (this.currentSetId) {
        this.clearQuestionsCache(this.currentSetId);
        this.clearCurrentSetProgress();
        this.selectSet(this.currentSetId);
      }
    },

    /**
     * ---------------------------
     * QUIZ: Answer + progress
     * ---------------------------
     */
    answerQuestion(answerIndex) {
      const q = this.currentQuestion;
      if (!q) return;

      this.lastSelectedAnswerIndex = answerIndex;

      const correct = q.correctIndex === answerIndex;
      this.lastAnswerCorrect = correct;

      const setId = this.currentSetId;
      const key = progressKey(setId, this.currentDifficulty);

      // WRONG tracking (for "wrong mode" filtering)
      if (!this.wrongBySet[key]) this.wrongBySet[key] = [];

      if (!correct) {
        if (!this.wrongBySet[key].includes(q.id)) {
          this.wrongBySet[key].push(q.id);
        }
      } else {
        this.wrongBySet[key] = this.wrongBySet[key].filter(
          (id) => id !== q.id
        );
      }
      this.saveWrongToStorage();

      // STATS: count only once per question id
      if (!this.answeredQuestionIdsBySet[key]) {
        this.answeredQuestionIdsBySet[key] = [];
      }

      const alreadyCounted = this.answeredQuestionIdsBySet[key].includes(q.id);
      if (!alreadyCounted) {
        this.answeredQuestionIdsBySet[key].push(q.id);
        this.saveAnsweredToStorage();

        if (!this.statsBySet[key]) {
          this.statsBySet[key] = { answered: 0, correct: 0 };
        }

        this.statsBySet[key].answered += 1;
        if (correct) this.statsBySet[key].correct += 1;

        this.saveStatsToStorage();
      }
    },

    /**
     * ---------------------------
     * QUIZ: Navigation / selection
     * ---------------------------
     */
    selectQuestion(index) {
      const list = this.filteredQuestions;
      if (!list.length) return;

      if (index >= 0 && index < list.length) {
        this.currentIndex = index;
        this.lastAnswerCorrect = null;
      }

      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;
      
    },

    nextQuestion() {
      const list = this.filteredQuestions;
      if (!list.length) return;

      if (this.currentIndex < list.length - 1) {
        this.currentIndex += 1;
        this.lastAnswerCorrect = null;
      }
      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;

    },

    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
        this.lastAnswerCorrect = null;
      }
      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;
    },

    setMode(mode) {
      this.mode = mode;
      this.currentIndex = 0;
      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;
    },

    /**
     * ---------------------------
     * RESET / CLEAR
     * ---------------------------
     */

    // Clears only "progress" (wrong + stats + answered), keeps cached questions
    clearProgressOnly() {
      localStorage.removeItem(LS_WRONG_KEY);
      localStorage.removeItem(LS_STATS_KEY);
      localStorage.removeItem(LS_ANSWERED_KEY);

      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;  

      this.wrongBySet = {};
      this.statsBySet = {};
      this.answeredQuestionIdsBySet = {};
      this.lastAnswerCorrect = null;
    },

    // Clears everything related to this app (progress + cached questions)
    clearAllData() {
      // progress
      localStorage.removeItem(LS_WRONG_KEY);
      localStorage.removeItem(LS_STATS_KEY);
      localStorage.removeItem(LS_ANSWERED_KEY);

      this.lastAnswerCorrect = null;
      this.lastSelectedAnswerIndex = null;  

      // cache (only our keys)
      Object.keys(localStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));

      // reset store state
      this.questions = [];
      this.currentIndex = 0;
      this.currentSetId = null;
      this.mode = "all";
      this.lastAnswerCorrect = null;

      this.wrongBySet = {};
      this.statsBySet = {};
      this.answeredQuestionIdsBySet = {};

      this.loading = false;
      this.error = null;
      this.currentDifficulty = DEFAULT_DIFFICULTY;
    },
  },
});
