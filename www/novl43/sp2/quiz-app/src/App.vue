<script setup>
import { onMounted } from 'vue'
import { useQuizStore } from './stores/quizStore'
import QuestionsMap from './components/QuestionsMap.vue'

const quiz = useQuizStore()

onMounted(() => {
  quiz.loadWrongFromStorage()

})

const onSetChange = (event) => {
  const id = event.target.value
  if (id) quiz.selectSet(id)
}

const onSelectQuestion = (index) => {
  quiz.selectQuestion(index)
}

const help = () => {
  console.log(quiz.currentQuestion.id);
}
</script>

<template>
  <main class="app">

    <h1>Quiz – učení testových otázek</h1>

    <!-- Výběr sady / kategorie -->
    <section>
      <label for="set-select">Vyber kategorii:</label>
      <select id="set-select" @change="onSetChange">
        <option value="">-- vyber --</option>
        <option
          v-for="set in quiz.sets"
          :key="set.id"
          :value="set.id"
        >
          {{ set.name }}
        </option>
      </select>
    </section>

    <section v-if="quiz.currentSetId">
      <div class="modes">
        <button
          :class="{ active: quiz.mode === 'all' }"
          @click="quiz.setMode('all')"
        >
          Všechny otázky
        </button>
        <button
          :class="{ active: quiz.mode === 'wrong' }"
          @click="quiz.setMode('wrong')"
        >
          Jen chybné
        </button>
      </div>

      <!-- Questions Map Component -->
      <QuestionsMap
        :questions="quiz.questions"
        :selectedQuestion="quiz.currentQuestion"
        @select="onSelectQuestion"
      />

      <div v-if="quiz.currentQuestion">
        <p class="question">
          {{ quiz.currentQuestion.question }}
        </p>

        <ul class="answers">
          <li
            v-for="(ans, i) in quiz.currentQuestion.answers"
            :key="i"
          >
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
          <button @click="quiz.prevQuestion, help()">Předchozí</button>
          <button @click="quiz.nextQuestion">Další</button>
        </div>
      </div>

      <p v-else>
        V tomto režimu nejsou k dispozici žádné otázky (např. žádné chybné).
      </p>
    </section>
  </main>
</template>