/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

const gameField = document.querySelector("#game-field");
const points = document.querySelector("#points");

let cities = ['Prague', 'Berlin', 'Madrid', 'Lisbon', 'Moscow', 'Zagreb', 'London', 'Budapest', 'Paris', 'Rome'];
cities = cities.concat(cities);
cities.sort(() => {
  return 0.5 - Math.random();
});

let score = 0;
let firstCard = null;
let secondCard = null;
let matches = 0;

const createCard = (name) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerText = name;
    openCard(card);
    gameField.appendChild(card);
}

const openCard = (card) => {
    card.addEventListener('click', () => {

        if (card.classList.contains('opened')) {
            return false;
        }

        if (firstCard && secondCard) {
            return false;

        }

        card.classList.add('opened');
    

        if (!firstCard) {
            firstCard = card;
            return false;
        }

        secondCard = card;

        if (firstCard.innerText === secondCard.innerText) {
            score += 1;
            matches += 1;
            firstCard = null;
            secondCard = null;
            if (matches === 10) {
                alert(`Congrats! Your score is ${score}.`);
            }
        } else {
            score -= 1;
            if (score < 0) {
                score = 0;
            }
            setTimeout(hideCards, 2000);
            }
        points.innerText = score;

        
    });

};

function hideCards() {
    firstCard.classList.remove('opened');
    secondCard.classList.remove('opened');
    firstCard = null;
    secondCard = null;
};

cities.forEach(city => createCard(city));