

const gameField = document.getElementById("game-field");
const pointsDisplay = document.getElementById("points");

let points = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCards = 0;

// 🐈 Zoznam plemien mačiek
let cats = [
  "Siamese", "Maine Coon", "Persian", "Bengal", "Sphynx",
  "British Shorthair", "Ragdoll", "Abyssinian", "Scottish Fold", "Norwegian Forest"
];

// Duplikácia a zamiešanie
cats = cats.concat(cats);
cats.sort(() => 0.5 - Math.random());

// Vytvorenie jednej karty
function createCard(name) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.cat = name;
  card.innerText = ""; // skrytý text

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

// Vloženie kariet na hracie pole
function setupGame() {
  const fragment = document.createDocumentFragment();
  cats.forEach((cat) => {
    const card = createCard(cat);
    fragment.appendChild(card);
  });
  gameField.appendChild(fragment);
}

// Kontrola zhody
function checkMatch() {
  if (firstCard.dataset.cat === secondCard.dataset.cat) {
    // zhoda
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
    // nezhoda
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

// Resetovanie ťahu
function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Aktualizácia skóre
function updatePoints() {
  pointsDisplay.innerText = points;
}

// Inicializácia hry
setupGame();
