<template>
  <div class="questions-map">
    <div class="dots-container">
      <button
        v-for="(question, index) in questions"
        :key="question.id"
        class="question-dot"
        :class="getDotClass(index)"
        :title="`Otázka ${index + 1}`"
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
 * - answeredIds: ids, které už uživatel aspoň jednou zodpověděl
 */
const props = defineProps({
  questions: { type: Array, required: true },
  selectedQuestion: { type: Object, default: null },
  wrongIds: { type: Array, default: () => [] },
  answeredIds: { type: Array, default: () => [] },
  correctIds: { type: Array, default: () => [] },
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
 * - selected: current
 * - incorrect: answered & in wrongIds
 * - correct: answered & NOT in wrongIds
 * - unanswered: not answered yet
 */
const getDotClass = (index) => {
  if (index === selectedIndex.value) return "selected";

  const q = props.questions[index];
  if (!q) return "unanswered";

  const isAnswered = props.answeredIds.includes(q.id);
  if (!isAnswered) return "unanswered";

  // If we tracked per-question correctness, prefer that (allows showing a
  // green "correct" dot even while the question is kept in the wrong-list
  // for review). Otherwise fallback to previous behaviour.
  if (props.correctIds.includes(q.id)) return "correct";

  return props.wrongIds.includes(q.id) ? "incorrect" : "correct";
};

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

/* Answered & correct = green */
.question-dot.correct {
  background-color: #28a745;
}

/* Answered & wrong = red */
.question-dot.incorrect {
  background-color: #dc3545;
}

/* Not answered yet = grey */
.question-dot.unanswered {
  background-color: #6c757d;
}
</style>
