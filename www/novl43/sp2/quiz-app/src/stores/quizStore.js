// src/stores/quizStore.js
import { defineStore } from 'pinia'

const LS_KEY = 'quiz_wrong_questions'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    // tady místo fetch ze sets.json:
    sets: [
      { id: 'Linux', name: 'Linux' },
      { id: 'Code', name: 'Programování (Code)' },
      { id: 'SQL', name: 'SQL' },
      { id: 'Docker', name: 'Docker' }
    ],
    currentSetId: null,
    questions: [],
    currentIndex: 0,
    mode: 'all',
    wrongBySet: {},
    lastAnswerCorrect: null
  }),

  getters: {
    currentQuestion(state) {
      const list = this.filteredQuestions
      if (!list.length) return null
      return list[state.currentIndex] || null
    },

    filteredQuestions(state) {
      if (state.mode === 'all') return state.questions
      const wrongIds = state.wrongBySet[state.currentSetId] || []
      return state.questions.filter(q => wrongIds.includes(q.id))
    }
  },

  actions: {
    loadWrongFromStorage() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        this.wrongBySet = raw ? JSON.parse(raw) : {}
      } catch {
        this.wrongBySet = {}
      }
    },

    saveWrongToStorage() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.wrongBySet))
    },

    // Hlavní akce: načtení otázek z quizapi.io
    async selectSet(setId) {
      this.currentSetId = setId
      this.currentIndex = 0
      this.mode = 'all'
      this.lastAnswerCorrect = null

      const apiKey = import.meta.env.VITE_QUIZ_API_KEY

      try {
        const url = `https://quizapi.io/api/v1/questions?limit=10&category=${encodeURIComponent(setId)}&difficulty=Medium`

        const res = await fetch(url, {
          headers: {
            'X-Api-Key': apiKey
          }
        })

        if (!res.ok) {
          throw new Error('HTTP ' + res.status)
        }

        const apiQuestions = await res.json()

        // Přemapujeme data z API na náš interní formát
        this.questions = apiQuestions.map((q, index) => {
          // answers: { answer_a, answer_b, ... }
          const entries = Object.entries(q.answers).filter(
            ([, value]) => value !== null
          ) // vyhodíme null odpovědi

          const answers = entries.map(([, value]) => value) // jen texty
          const answerKeys = entries.map(([key]) => key) // answer_a, answer_b, ...

          // correct_answers: { answer_a_correct: "false"/"true", ... }
          const correctIndex = answerKeys.findIndex(key => {
            const correctFlag = q.correct_answers[`${key}_correct`]
            return correctFlag === 'true'
          })

          return {
            id: index,
            question: q.question,
            answers,
            correctIndex: correctIndex === -1 ? 0 : correctIndex
          }
        })

        console.log('Načteno', this.questions.length, 'otázek')
      } catch (e) {
        console.error('Chyba při načítání z API:', e)
        this.questions = []
      }
    },

    answerQuestion(answerIndex) {
      const q = this.currentQuestion
      if (!q) return

      const correct = q.correctIndex === answerIndex
      this.lastAnswerCorrect = correct

      const setId = this.currentSetId
      if (!this.wrongBySet[setId]) {
        this.wrongBySet[setId] = []
      }

      if (!correct) {
        if (!this.wrongBySet[setId].includes(q.id)) {
          this.wrongBySet[setId].push(q.id)
        }
      } else {
        this.wrongBySet[setId] = this.wrongBySet[setId].filter(id => id !== q.id)
      }

      this.saveWrongToStorage()
    },

    nextQuestion() {
      const list = this.filteredQuestions
      if (!list.length) return
      if (this.currentIndex < list.length - 1) {
        this.currentIndex++
        this.lastAnswerCorrect = null
      }
    },

    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.lastAnswerCorrect = null
      }
    },

    setMode(mode) {
      this.mode = mode
      this.currentIndex = 0
      this.lastAnswerCorrect = null
    }
  }
})
