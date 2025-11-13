/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

let cities = ['Prague', 'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Vienna', 'Tokyo', 'Sydney', 'New York'];
cities = cities.concat(cities);
cities.sort(() => 0.5 - Math.random());


const gameField = document.getElementById('game-field');
const pointsElement = document.getElementById('points');

let firstCard = null;
let secondCard = null;
let isChecking = false;
let points = 0;
let revealedPairs = 0;
const totalPairs = cities.length / 2;

function updatePoints() {
  pointsElement.textContent = points;
}

function createCard(cityName) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.city = cityName;
  card.textContent = cityName;

  card.addEventListener('click', () => cardClick(card));

  return card;
}

function cardClick(card) {
  if (card.classList.contains('revealed')) return;

  if (isChecking) {
    hideWrongCards();
    return;
  }

  card.classList.add('revealed');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.city === secondCard.dataset.city;

  if (isMatch) {
    points++;
    revealedPairs++;
    updatePoints();
    finishTurn(true);
  } else {
    if (points > 0) {
      points--;
      updatePoints();
    }
    isChecking = true;
  }
}

function hideWrongCards() {
  firstCard.classList.remove('revealed');
  secondCard.classList.remove('revealed');
  finishTurn(false);
}

function finishTurn(matched) {
  firstCard = null;
  secondCard = null;
  isChecking = false;

  if (matched && revealedPairs === totalPairs) {
    setTimeout(() => {
      alert(`You've got ${points} points`);
    }, 300);
  }
}


function initGame() {
  gameField.innerHTML = '';

  const fragment = document.createDocumentFragment();
  cities.forEach(city => {
    const card = createCard(city);
    fragment.appendChild(card);
  });

  gameField.appendChild(fragment);
  updatePoints();
}

initGame();