let currentQuestion = 0;
let score = 0;
let questions = [];

$(document).ready(function () {
  showStartScreen();
});

function showStartScreen() {
  $('#app').html(`
    <h2>Start Quiz</h2>
    <button id="startBtn">Start</button>
  `);

  $('#startBtn').on('click', startQuiz);
}

function startQuiz() {
  fetchQuestions().done(data => {
    questions = data.results;
    currentQuestion = 0;
    score = 0;
    showQuestion();
  });
}

function showQuestion() {
  const q = questions[currentQuestion];

  const answers = [
    q.correct_answer,
    ...q.incorrect_answers
  ];

  answers.sort(() => Math.random() - 0.5);

  let answersHtml = '';
  answers.forEach(answer => {
    answersHtml += `
      <button class="answer-btn" data-answer="${answer}">
        ${answer}
      </button>
    `;
  });

  $('#app').html(`
    <p>Question ${currentQuestion + 1} / ${questions.length}</p>
    <h3>${q.question}</h3>
    <div id="answers">
      ${answersHtml}
    </div>
  `);
}
