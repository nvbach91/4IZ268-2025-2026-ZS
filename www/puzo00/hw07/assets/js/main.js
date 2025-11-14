const game = document.getElementById("game-field");
const points = document.getElementById("points");
let pokemons = [
    "Rayquaza", "Kyogre", "Sudowoodo", "Salamence", "Groudon", "Chandelure", "Krokorok", "Swampert", "Sableye", "Metagross"
]
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;
pokemons = pokemons.concat(pokemons);
pokemons.sort(() => 0.5 - Math.random());

const createCard = (name) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerText = name;

    const img = document.createElement("img");
    img.src = `https://img.pokemondb.net/sprites/home/normal/${name.toLowerCase()}.png`;
    img.alt = name;
    img.style.display = "none";

    card.appendChild(img);
    game.appendChild(card);

    card.addEventListener("click", () => {
        if (lockBoard || card.classList.contains("flipped")) return;

        card.classList.add("flipped");
        img.style.display = "block";

        if (!firstCard) {
            firstCard = card;
            return;
        }

        secondCard = card;
        lockBoard = true;

        checkMatch();
    });
};

const checkMatch = () => {
    const match = firstCard.innerText === secondCard.innerText;
  
    if (match) {
      score++;
      updatePoints();
      resetTurn();
      checkForEnd();
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard.querySelector("img").style.display = "none";
        secondCard.querySelector("img").style.display = "none";
  
        score = Math.max(0, score - 1);
        updatePoints();
        resetTurn();
      }, 2000);
    }
  };

const resetTurn = () => {
    [firstCard, secondCard, lockBoard] = [null, null, false];
};
const updatePoints = () => {
    points.textContent = score;
}
const checkForEnd = () => {
    const allCards = document.querySelectorAll(".card");
    const flippedCards = document.querySelectorAll(".card.flipped");

    if (flippedCards.length === allCards.length) {
        setTimeout(() => {
            alert(`Tvůj konečný počet bodů: ${score}`);
            resetGame();
        }, 500);

    }
};

const resetGame = () => {
    game.innerHTML = "";

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    score = 0;
    updatePoints();

    pokemons.sort(() => 0.5 - Math.random());

    pokemons.forEach(name => createCard(name));
};
pokemons.forEach(name => createCard(name));