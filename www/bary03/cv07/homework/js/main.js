const field = document.getElementById('game-field');
const pointsEl = document.getElementById('points');
const restartBtn = document.getElementById('restart');

let firstCard = null;
let secondCard = null;
let lock = false;
let points = 0;
let matchedPairs = 0;

let players = [
  'Messi', 'Ronaldo', 'Mbappe', 'Haaland', 'Neymar',
  'Lewandowski', 'Salah', 'Modric', 'De Bruyne', 'Kane'
];

players = players.concat(players);
players.sort(() => 0.5 - Math.random());

function createCard(name) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.name = name;

  const front = document.createElement('div');
  front.classList.add('front');
  front.innerText = name;

  const back = document.createElement('div'); 
  back.classList.add('back');
  back.innerText = 'Footballer ⚽'; 

  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener('click', () => {
    if (lock || card.classList.contains('revealed') || card.classList.contains('matched')) return;
    card.classList.add('revealed');
    if (!firstCard) {
      firstCard = card;
    } else {
      secondCard = card;
      checkMatch();
    }
  });

  return card;
}

function checkMatch() {
  lock = true;
  if (firstCard.dataset.name === secondCard.dataset.name) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    points++;
    matchedPairs += 2;
    resetTurn();
    if (matchedPairs === players.length) {
      setTimeout(() => alert(`Game finished! Your score: ${points}`), 300);
    }
  } else {
    points = Math.max(0, points - 1);
    setTimeout(() => {
      firstCard.classList.remove('revealed');
      secondCard.classList.remove('revealed');
      resetTurn();
    }, 1000);
  }
  pointsEl.textContent = points;
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lock = false;
}

function startGame() {
  field.innerHTML = '';
  points = 0;
  matchedPairs = 0;
  pointsEl.textContent = points;
  firstCard = null;
  secondCard = null;
  lock = false;

  players.sort(() => 0.5 - Math.random());
  players.forEach(name => {
    const card = createCard(name);
    field.appendChild(card);
  });
}

restartBtn.addEventListener('click', startGame);

startGame();
