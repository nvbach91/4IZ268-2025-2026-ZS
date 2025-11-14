/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

const gameFieldDiv = document.getElementById("game-field");
const cards = ["JavaScript", "JavaScript", "Python", "Python", "PHP", "PHP", "C++", "C++", "Java", "Java", "HTML", "HTML", "CSS", "CSS", "TypeScript", "TypeScript", "Ruby", "Ruby", "Go", "Go"];
let matchedPairs = 0;

const shuffleCards = (cards) => {
    cards.sort(() => Math.random() - 0.5);
    return cards;
};

shuffledCards = shuffleCards(cards);

shuffledCards.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.dataset.index = index;
    cardDiv.addEventListener("click", () => setActiveCard(cardDiv));
    gameFieldDiv.append(cardDiv);
    console.log(cardDiv);
})

let card1 = null;
let card2 = null;

function setActiveCard(element) {
    if (!card1) {
        card1 = element;
        element.innerText = shuffledCards[element.dataset.index];
        element.classList.add("revealed");
    } else if (!card2) {
        card2 = element;
        element.innerText = shuffledCards[element.dataset.index];
        element.classList.add("revealed");
        setTimeout(() => play(), 1500);
    }
}

function play() {
    if (card1.innerText === card2.innerText) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        updatePoints();
        matchedPairs++;
    } else {
        card1.innerText = "";
        card2.innerText = "";
        card1.classList.remove("revealed");
        card2.classList.remove("revealed");
        updatePoints(-1);
    }
    card1 = null;
    card2 = null;

    if (matchedPairs === 10) gameEnd();

}

let points = 0;
const pointsText = document.getElementById("points");

function updatePoints(number = 1) {
    points = Math.max(0, points + number);
    pointsText.innerText = points.toString();
}

const gameEnd = () => {
    gameFieldDiv.innerHTML = "";
    gameFieldDiv.style.display = "inline-block";
    alert(`Vyhrál jsi! a tvoje skóre je:${points}`);
    const gif = document.createElement("img");
    gif.src = "tenor.gif";
    gameFieldDiv.append(gif);
}
