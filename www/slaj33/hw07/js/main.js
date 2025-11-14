// seznam měst
let cities = ['Barcelona', 'Dortmund', 'Madrid', 'Turin', 'Prague', "Plana", "Paris", "Berlin", "New York", "Rome"];
// duplikovat seznam měst
cities = cities.concat(cities);
// zamíchat
cities.sort(() => 0.5 - Math.random());

var gameField = document.querySelector("#game-field");
var pointsContainer = document.querySelector("#points");

var firstCard = null;
var secondCard = null;
var points = 0;
var cardsRevealed = 0;


pointsContainer.innerHTML = `Points: ${points}`;




var bindCard = (card) => {
    card.addEventListener("click", () => {
        if (card.classList.contains("revealed")) {
            return false;
        }
        if (firstCard && secondCard) {
            return false;
        }
        card.classList.add("revealed");

        if (!firstCard) {
            firstCard = card;
            return false;
        }
        secondCard = card;
        compareCards();
    });
};

var compareCards = () => {
    if (firstCard.innerText === secondCard.innerText) {
        // Cards match!
        points++;
        cardsRevealed += 2;
        pointsContainer.innerText = `Points: ${points}`;
        firstCard = null;
        secondCard = null;
        if (cardsRevealed === cities.length) {
            setTimeout(() => {
                alert(`You WON! with ${points} points`);
            }, 500);
        }
    } else {
        // Cards don't match - flip them back after delay
        if (points > 0) {
            points--;
        }
        pointsContainer.innerText = `Points: ${points}`;
        
        setTimeout(() => {
            firstCard.classList.remove("revealed");
            secondCard.classList.remove("revealed");
            firstCard = null;
            secondCard = null;
        }, 1000);
    }
};




var addCard = (name) => {
    var card = document.createElement("div");
    card.classList.add("card");
    card.innerText = name;
    bindCard(card);
    gameField.appendChild(card);
}

cities.forEach((city) => {
    addCard(city);
});
