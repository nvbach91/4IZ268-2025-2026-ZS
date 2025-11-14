

const gameField = document.getElementById("game-field");
const pointsDisplay = document.getElementById("points");

let points = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCards = 0;


let cats = [
  "Siamese", "Maine Coon", "Persian", "Bengal", "Sphynx",
  "British Shorthair", "Ragdoll", "Abyssinian", "Scottish Fold", "Norwegian Forest"
];


cats = cats.concat(cats);
cats.sort(() => 0.5 - Math.random());


function createCard(name) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.cat = name;
  card.innerText = ""; 

  card.addEventListener("click", () => {
    if (lockBoard || card.classList.contains("revealed")) return;

    card.classList.add("revealed");
    card.innerText = name;

    if (!firstCard) {
      firstCard = card;
    } else {
      secondCard = card;
      lockBoard = true;
      checkMatch();
    }
  });

  return card;
}


function setupGame() {
  const fragment = document.createDocumentFragment();
  cats.forEach((cat) => {
    const card = createCard(cat);
    fragment.appendChild(card);
  });
  gameField.appendChild(fragment);
}


function checkMatch() {
  if (firstCard.dataset.cat === secondCard.dataset.cat) {

    points++;
    matchedCards += 2;
    updatePoints();
    resetTurn();

    if (matchedCards === cats.length) {
      setTimeout(() => {
        alert(`🎉 Hra dokončená! Tvoje skóre: ${points}`);
      }, 500);
    }
  } else {

    points = Math.max(0, points - 1);
    updatePoints();

    setTimeout(() => {
      firstCard.classList.remove("revealed");
      firstCard.innerText = "";
      secondCard.classList.remove("revealed");
      secondCard.innerText = "";
      resetTurn();
    }, 1000);
  }
}


function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}


function updatePoints() {
  pointsDisplay.innerText = points;
}


setupGame();
