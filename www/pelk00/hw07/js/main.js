"use strict";

/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

const baseCities = ['Prague', 'London', 'Paris', 'Madrid', 'Helsinki', 'Hamburg', 'Sydney', 'Vancouver', 'Tokyo', 'New York'];


let cities = baseCities.concat(baseCities);
cities.sort(() => 0.5 - Math.random());

const gameField = document.getElementById('game-field');
const pointsEl = document.getElementById('points');  

let score = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;

function updateScore() {
  pointsEl.textContent = score;
}

function createCard(city) {
  const card = document.createElement('button');
  card.type = 'button';
  card.classList.add('card');
  card.dataset.city = city;
  card.textContent = city; 
  card.addEventListener('click', onCardClick);
  return card;
}

function onCardClick(event) {
  const card = event.currentTarget;

  if (lockBoard) return;                               
  if (card.classList.contains('revealed')) return;     
  if (card === firstCard) return;                      

  card.classList.add('revealed');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;

  const isMatch = firstCard.dataset.city === secondCard.dataset.city;

  if (isMatch) {
    score++;
    matchedPairs++;
    updateScore();

    resetTurn();

    if (matchedPairs === cities.length / 2) {
      setTimeout(() => {
        alert(`Konec hry! Získal jsi ${score} bodů.`);
      }, 400);
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove('revealed');
      secondCard.classList.remove('revealed');

      if (score > 0) {
        score--;                 
        updateScore();
      }

      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function initGame() {
  const fragment = document.createDocumentFragment();

  cities.forEach(city => {
    const card = createCard(city);
    fragment.appendChild(card);
  });

  gameField.appendChild(fragment);
  updateScore();
}

document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());

initGame();