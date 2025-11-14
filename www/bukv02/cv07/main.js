let cities = ["Prague", "Bratislava", "Paris", "Moscow", "Porto", "Tokyo", "Naples", "Berlin", "Rome", "Brno"];

cities = cities.concat(cities);
cities.sort(() => 0.5 - Math.random());

const gameField = document.getElementById("game-field");
const pointsDisplay = document.getElementById("points");
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let points = 0;
let matchedCards = 0;

function createCards() {
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerText = city;
    card.dataset.city = city;

    card.addEventListener("click", function () {
      cardClick(card);
    });

    gameField.appendChild(card);
  }
}

function cardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;

  checkMatch();
}

function checkMatch() {
  if (firstCard.dataset.city === secondCard.dataset.city) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    points+= 5;
    matchedCards += 2;
    resetTurn();
  } else {
    points = Math.max(0, points - 1); //nejde do - hodnot
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 1000);
  }

  updatePoints();

  if (matchedCards === cities.length) {
    setTimeout(() => {
      alert(`Gratulace! Hra dokončena. Tvé skóre: ${points}`);
    }, 500);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function updatePoints() {
  pointsDisplay.innerText = points;
}

createCards();