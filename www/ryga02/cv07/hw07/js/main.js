/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

let animal = ['Cat', 'Dog', 'Elephant', 'Giraffe', 'Lion', 'Monkey', 'Tiger', 'Penguin', 'Horse', 'Cow'];
animal = animal.concat(animal);
animal.sort(() => 0.5 - Math.random());

const gameField = document.querySelector('#game-field');
const pointsElement = document.querySelector('#points');

let points = 0;
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;
let canClick = true;

function createCard(animalName) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.dataset.animal = animalName;
  cardElement.addEventListener('click', handleCardClick);
  return cardElement;
}

function handleCardClick(event) {
  const clickedCard = event.target;

  if (!canClick) return;
  if (clickedCard.classList.contains('revealed')) return;
  if (clickedCard === firstCard) return;

  clickedCard.classList.add('revealed');
  clickedCard.textContent = clickedCard.dataset.animal;

  if (firstCard === null) {
    firstCard = clickedCard;
  } else {
    secondCard = clickedCard;
    checkMatch();
  }
}

function checkMatch() {
  canClick = false;
  const firstAnimal = firstCard.dataset.animal;
  const secondAnimal = secondCard.dataset.animal;

  if (firstAnimal === secondAnimal) {
    points++;
    pointsElement.textContent = points;
    matchedPairs++;
    firstCard = null;
    secondCard = null;
    canClick = true;

    if (matchedPairs === animal.length / 2) {
      setTimeout(() => {
        alert(`Final score: ${points} points`);
      }, 300);
    }
  } else {
    if (points > 0) points--;
    pointsElement.textContent = points;

    setTimeout(() => {
      firstCard.classList.remove('revealed');
      secondCard.classList.remove('revealed');
      firstCard.textContent = '';
      secondCard.textContent = '';
      firstCard = null;
      secondCard = null;
      canClick = true;
    }, 1000);
  }
}

animal.forEach(animalName => {
  const card = createCard(animalName);
  gameField.appendChild(card);
});
