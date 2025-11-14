/**

* Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs

*/
const gameField = document.querySelector('#game-field');
const points = document.querySelector('#points');
let timeout = null;

let cities = ['Prague', 'London', 'Paris', 'Moscow', 'California', 'Vancouver', 'Sydney', 'Tokyo', 'Beijing', 'Seoul'];
cities = cities.concat(cities);
cities.sort(() => {
    return 0.5 - Math.random();
});

const cardValues = [...cities];

let firstCard = null;
let secondCard = null;
let currentScore = 0;

const createCard = (index) => {
    const card = document.createElement('div');
    card.classList.add('card');

    card.id = 'card-' + index;

    card.addEventListener('click', () => {
        if (card.classList.contains('revealed')) return;
        if (timeout) return;

        revealCard(card);

        if (!firstCard) {
            firstCard = card;
        } else if (!secondCard && card !== firstCard) {
            secondCard = card;
        }
        checkForMatch();
        setTimeout(() => {
            checkGameOver();
        }, 800);
    });
    return card;
};

const getIndexFromCard = (card) => {
    return card.id.split('-')[1];
}

const revealCard = (card) => {
    card.classList.add('revealed');
    const cardIndex = getIndexFromCard(card);
    card.innerText = cardValues[cardIndex];
}

const hideCard = (card) => {
    card.classList.remove('revealed');
    card.innerText = '';
}

const checkForMatch = () => {
    if (firstCard && secondCard) {

        const firstIndex = getIndexFromCard(firstCard);
        const secondIndex = getIndexFromCard(secondCard);

        if (cardValues[firstIndex] === cardValues[secondIndex]) {
            currentScore += 1;
            points.innerText = currentScore;
            firstCard = null;
            secondCard = null;
        } else {
            timeout = true;
            if (currentScore > 0) {
                currentScore -= 1;
                points.innerText = currentScore;
            }
            setTimeout(() => {
                hideCard(firstCard);
                hideCard(secondCard);
                firstCard = null;
                secondCard = null;
                timeout = false;
            }, 800);
        }
    }
}

const startGame = () => {
    const fragment = document.createDocumentFragment();

    cardValues.forEach((city, index) => {
        let card = createCard(index);
        fragment.appendChild(card);
    });

    gameField.appendChild(fragment);
};

const checkGameOver = () => {
    const allCards = gameField.querySelectorAll('.card');
    const revealedCards = gameField.querySelectorAll('.card.revealed');

    if (allCards.length > 0 && allCards.length === revealedCards.length) {
        alert(`Congratulations you have won! Your score is: ${currentScore} points!`);
        restartGame();
    }
}

const restartGame = () => {
    gameField.innerHTML = '';
    firstCard = null;
    secondCard = null;
    currentScore = 0;
    points.innerText = currentScore;

    cities.sort(() => {
        return 0.5 - Math.random();
    });
    cardValues.splice(0, cardValues.length, ...cities);

    startGame();
}

startGame();