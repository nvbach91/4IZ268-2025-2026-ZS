<template>
    <div class="questions-map">
        <div class="dots-container">
            <button
                v-for="(question, index) in questions"
                :key="index"
                class="question-dot"
                :class="getDotClass(index)"
                @click="selectQuestion(index)"
                :title="`Question ${index + 1}`"
            />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    questions: {
        type: Array,
        required: true
    },
    selectedQuestion: {
        type: Object,
    },
});
const emit = defineEmits(['select']);


const selectedIndex = computed(() => {
    return props.questions.findIndex(q => q.id === props.selectedQuestion?.id);
});


const getDotClass = (index) => {
    if (index === selectedIndex.value) {
        return 'selected';
    }

    return 'unanswered';
};

const selectQuestion = (index) => {
    emit('select', index);
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
    transition: all 0.3s ease;
    font-size: 12px;
    font-weight: bold;
    color: white;
}

.question-dot.selected {
    background-color: #007bff;
    transform: scale(1.2);
    box-shadow: 0 0 8px #007bff;
}

.question-dot.correct {
    background-color: #28a745;
}

.question-dot.incorrect {
    background-color: #dc3545;
}

.question-dot.unanswered {
    background-color: #6c757d;
}
</style>