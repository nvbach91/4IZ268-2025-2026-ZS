function saveBestScore(score) {
  localStorage.setItem('bestScore', score);
}

function getBestScore() {
  return localStorage.getItem('bestScore') || 0;
}
