function generateCards(cards) {
    const gameField = document.querySelector(".game-field");

    cards.forEach((cardData, index) => {
        const cardElement = document.createElement("div");
        cardElement.id = `card${index + 1}`;
        cardElement.className = "card";

        cardElement.dataset.index = index;

        gameField.append(cardElement);
        console.log(`DBG: generateCards: ${cardElement.id} generated.`);
    });

    gameField.addEventListener("click", (event) => {
        if (event.target.classList.contains("card")) {
            cardAction(event.target);
        }
    });
}

let cards = [
    { name: "Hamburg" }, { name: "Berlin" },
    { name: "Paris" }, { name: "London" },
    { name: "Tokyo" }, { name: "Prague" },
    { name: "Vienna" }, { name: "Madrid" },
    { name: "Rome" }, { name: "Budapest" },
    { name: "Prague" }, { name: "Vienna" },
    { name: "Madrid" }, { name: "Rome" },
    { name: "Budapest" }, { name: "Hamburg" },
    { name: "Berlin" }, { name: "Paris" },
    { name: "London" }, { name: "Tokyo" },
];

let points = document.querySelector("#points");

cards.sort(() => 0.5 - Math.random());

generateCards(cards);

let firstCard = null;
let secondCard = null;

function cardAction(cardElement) {
    const index = cardElement.dataset.index;
    const cardData = cards[index];
    
    if (cardData.name) {
        cardElement.textContent = cardData.name;
        console.log(`DBG: cardAction: Card ${cardElement.id} with name "${cardData.name}" revealed`);
    } else {
        console.log(`ERR: cardAction: No name found for ${cardElement.id}.`);
    }

    if (!firstCard) {
        // First card revealed
        firstCard = { cardElement, name: cardData.name };
        firstCard.cardElement.style.pointerEvents = "none";
        console.log("DBG: cardAction: This is first card in a sequence, waiting for second card ...");
        return;
    } else {
        // Second card revealed
        secondCard = { cardElement, name: cardData.name };
        secondCard.cardElement.style.pointerEvents = "none";
        console.log("DBG: cardAction: This is a second card, awaiting comparison ...");
    }
    
    if (firstCard.name === secondCard.name) {
        console.log("DBG: cardAction: Comparison completed: True");
        firstCard.cardElement.className = "card-correct";
        secondCard.cardElement.className = "card-correct";
        points.textContent = parseInt(points.textContent) + 1;
        console.log(`DBG: cardAction: Points increased to ${points.textContent}`);
        console.log(`DBG: cardAction: Controls disabled for ${firstCard.cardElement.id} and ${secondCard.cardElement.id}.`);
        firstCard = null;
        secondCard = null;
    } else {
        console.log("DBG: cardAction: Comparison completed: False");
        const firstCardStored = firstCard;
        const secondCardStored = secondCard;
        firstCard = null;
        secondCard = null;
        setTimeout(() => {
            firstCardStored.cardElement.style.pointerEvents = "auto";
            secondCardStored.cardElement.style.pointerEvents = "auto";
            firstCardStored.cardElement.textContent= "";
            secondCardStored.cardElement.textContent = "";
        }, 1000);
    }
}