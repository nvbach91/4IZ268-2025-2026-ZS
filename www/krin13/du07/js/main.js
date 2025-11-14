/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 

const cities = ['Prague', '...'];
cities = cities.concat(cities);
cities.sort(() => {
  return 0.5 - Math.random();
}) */

let cities = [
  "praha",
  "bratislava",
  "berlin",
  "brusel",
  "toronto",
  "tokyo",
  "bologna",
  "madrid",
  "oslo",
  "kodan",
];

cities = cities.concat(cities).sort(() => 0.5 - Math.random())

const points = document.getElementById("points");
const gameField = document.getElementById("game-field");

let gameOver = document.createElement("div");
gameOver.id = "game-over";
document.body.appendChild(gameOver);

const updateScore = () => {
    points.textContent = `${score}`;
};

const afterWin = () => {
  gameOver.textContent = `You won!`;
  const restart = document.createElement("button");
  restart.type = "button";
  restart.textContent = "Znovu";
  restart.addEventListener("click", () => location.reload());
  gameOver.appendChild(document.createElement("br"));
  gameOver.appendChild(restart);
};

const createCard = (cityName, idx) => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.city = cityName;
  card.dataset.index = idx;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", "pexeso karta");

  const front = document.createElement("div");
  front.classList.add("front");

  front.innerText = cityName;

  card.appendChild(front);

  card.addEventListener("click", () => {
    if (busy) return;
    if (
      card.classList.contains("revealed") ||
      card.classList.contains("matched")
    )
      return;

    revealCard(card);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    if (firstCard && !secondCard) {
      secondCard = card;
      busy = true;
      setTimeout(checkMatch, 350);
    }
  });

  return card;
};

const revealCard = (card) => {
  card.classList.add("revealed");
};

const hideCard = (card) => {
  card.classList.remove("revealed");
};

const markMatched = (card) => {
  card.classList.add("matched");
  card.classList.add("revealed");
  card.dataset.matched = "1";
  card.setAttribute("aria-disabled", "true");
};

const resetTurn = () => {
  firstCard = null;
  secondCard = null;
  busy = false;
};

const checkMatch = () => {
  if (!firstCard || !secondCard) {
    resetTurn();
    return;
  }

  const a = firstCard.dataset.city;
  const b = secondCard.dataset.city;

  if (a === b) {
    markMatched(firstCard);
    markMatched(secondCard);
    matches += 1;
    score += 1;
    updateScore();
    resetTurn();
    if (matches === cities.length / 2) onWin();
  } else {
    setTimeout(() => {
      hideCard(firstCard);
      hideCard(secondCard);
      resetTurn();
    }, 400);
  }
};

let firstCard = null;
let secondCard = null;
let busy = false;
let matches = 0;
let score = 0;

updateScore();


cities.forEach((city, i) => gameField.appendChild(createCard(city, i)));

