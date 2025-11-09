/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

let cities = [
  "Prague",
  "London",
  "New York",
  "Tokyo",
  "Berlin",
  "Madrid",
  "Rome",
  "Cairo",
  "Sydney",
  "Budapest",
];
cities = cities.concat(cities);
cities.sort(() => {
  return 0.5 - Math.random();
});

let flippedOne = null;
let flippedTwo = null;

const gameField = document.getElementById("game-field");
const points = document.getElementById("points");

// FLIP CARD
function flipCard() {
  // Already flipped
  if (this.classList.contains("revealed")) return;

  // Two cards are already flipped
  if (flippedOne && flippedTwo) return;

  this.classList.add("revealed");
  if (!flippedOne) {
    flippedOne = this;
  } else if (!flippedTwo) {
    flippedTwo = this;
  }

  // Need two flipped cards to compare
  if (!(flippedOne && flippedTwo)) return;

  // No match
  if (flippedOne.innerText !== flippedTwo.innerText) {
    setTimeout(() => {
      flippedOne.classList.remove("revealed");
      flippedTwo.classList.remove("revealed");
      flippedOne = null;
      flippedTwo = null;
      points.innerText =
        parseInt(points.innerText) > 0 ? parseInt(points.innerText) - 1 : 0;
    }, 1000);
    return;
  }

  // Match
  flippedOne = null;
  flippedTwo = null;
  points.innerText = parseInt(points.innerText) + 1;
}

function checkWin() {
  const revealedCards = document.querySelectorAll(".card.revealed");
  if (revealedCards.length === cities.length) {
    setTimeout(() => {
      alert("Dohráli jste hru s " + points.innerText + " body!");
    }, 500);
    revealedCards.forEach((card) => {
      card.removeEventListener("click", flipCard);
      card.removeEventListener("click", checkWin);
    });
  }
}

// Create a card
function createCard(city) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerText = city;
  card.addEventListener("click", flipCard);
  card.addEventListener("click", checkWin);
  return card;
}

// Generate field
cities.forEach((city) => {
  console.log("executed");
  const card = createCard(city);
  gameField.appendChild(card);
});
