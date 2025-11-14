/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */


const cars = ["BMW", "Mercedes", "Audi", "Volkswagen", "Škoda", "Toyota", "Honda", "Ford", "Chevrolet", "Nissan"];
cards = cars.concat(cars);


cards.sort(() => {
  return 0.5 - Math.random();
});

const gameField = document.getElementById("game-field");
const pointsDisplay = document.getElementById("points");

let flippedCards = [];
let points = 0;
let matchedCount = 0;

cards.forEach(car => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.car = car;
  card.textContent = "";

  card.addEventListener("click", () => {
    if (card.classList.contains("flipped") || card.classList.contains("matched") || flippedCards.length >= 2) return;

    card.classList.add("flipped");
    card.textContent = card.dataset.car;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      checkMatch();
    }
  });

  gameField.appendChild(card);
});



function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.car === card2.dataset.car) {
    card1.classList.add("matched");
    card2.classList.add("matched");
    flippedCards = [];
    points++;
    matchedCount += 2;
    updatePoints();

    if (matchedCount === cards.length) {
      setTimeout(() => alert(`Konec hry! Získal jsi ${points} bodů.`), 300);
    }
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      card1.textContent = "";
      card2.textContent = ""; 
      flippedCards = [];
    }, 800);

    if (points > 0) points--;
    updatePoints();
  }
}

function updatePoints() {
  pointsDisplay.textContent = points;
}