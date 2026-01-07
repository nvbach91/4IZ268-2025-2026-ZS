<template>
  <div class="questions-map">
    <div class="dots-container">
      <button
        v-for="(question, index) in questions"
        :key="question.id"
        class="question-dot"
        :class="getDotClass(index)"
        :title="`Otázka ${index + 1}`"
        :aria-label="`Otázka ${index + 1}`"

        @click="onSelect(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

/**
 * Props:
 * - questions: list currently displayed (all / wrong filtered)
 * - selectedQuestion: currently opened question
 * - wrongIds: ids marked as wrong for current set
 */
const props = defineProps({
  questions: { type: Array, required: true },
  selectedQuestion: { type: Object, default: null },
  wrongIds: { type: Array, default: () => [] },
});

const emit = defineEmits(["select"]);

/**
 * Index of currently selected question in the provided list
 */
const selectedIndex = computed(() =>
  props.questions.findIndex((q) => q.id === props.selectedQuestion?.id)
);

/**
 * Dot class by state:
 * - selected: currently opened question
 * - incorrect: question marked as wrong
 * - correct: question not marked as wrong
 */
const getDotClass = (index) => {
  if (index === selectedIndex.value) return "selected";

  const q = props.questions[index];
  if (!q) return "unanswered";

  return props.wrongIds.includes(q.id) ? "incorrect" : "correct";
};

/**
 * Emit selection to parent (App.vue)
 */
const onSelect = (index) => {
  emit("select", index);
};
</script>

<style scoped>
.questions-map {
  padding: 20px;
}

.dots-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.question-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  cursor: pointer;

  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  /* not used visually (no text), but harmless */
  font-size: 12px;
  font-weight: bold;
  color: white;
}

/* Selected dot */
.question-dot.selected {
  background-color: #007bff;
  transform: scale(1.15);
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.65);
}

/* Not wrong = green */
.question-dot.correct {
  background-color: #28a745;
}

/* Wrong = red */
.question-dot.incorrect {
  background-color: #dc3545;
}

/* Fallback state */
.question-dot.unanswered {
  background-color: #6c757d;
}
</style>
