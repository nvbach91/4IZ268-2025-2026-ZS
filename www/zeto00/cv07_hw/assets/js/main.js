let carBrands = [
    'Ferrari', 'Lamborghini', 'Porsche', 'Maserati', 'Bentley',
    'Rolls-Royce', 'Aston Martin', 'McLaren', 'Bugatti', 'Pagani'
];

let gameBoard = [];
let firstCard = null;
let secondCard = null;
let points = 0;
let matchedPairs = 0;
let isGameLocked = false;

const gameField = document.getElementById('game-field');
const pointsElement = document.getElementById('points');

function initGame() {
    gameBoard = carBrands.concat(carBrands);
    gameBoard.sort(() => 0.5 - Math.random());
    
    points = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    isGameLocked = false;
    
    updatePointsDisplay();
    gameField.innerHTML = '';
    createCards();
}

function createCards() {
    gameBoard.forEach((brand, index) => {
        const card = createCard(brand, index);
        gameField.appendChild(card);
    });
}

function createCard(brand, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.brand = brand;
    card.dataset.index = index;
    
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    
    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.textContent = brand;
    
    card.appendChild(cardBack);
    card.appendChild(cardFront);
    
    card.addEventListener('click', () => handleCardClick(card));
    
    return card;
}

function handleCardClick(card) {
    if (isGameLocked || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    flipCard(card);
    
    if (!firstCard) {
        firstCard = card;
    } else if (!secondCard) {
        secondCard = card;
        isGameLocked = true;
        setTimeout(checkForMatch, 800);
    }
}

function flipCard(card) {
    card.classList.add('flipped');
}

function unflipCard(card) {
    card.classList.remove('flipped');
}

function checkForMatch() {
    const isMatch = firstCard.dataset.brand === secondCard.dataset.brand;
    
    if (isMatch) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        points++;
        matchedPairs++;
        updatePointsDisplay();
        
        if (matchedPairs === carBrands.length) {
            setTimeout(showGameOverMessage, 500);
        }
        
        resetTurn();
    } else {
        points = Math.max(0, points - 1);
        updatePointsDisplay();
        
        setTimeout(() => {
            unflipCard(firstCard);
            unflipCard(secondCard);
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    isGameLocked = false;
}

function updatePointsDisplay() {
    pointsElement.textContent = points;
}

function showGameOverMessage() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.classList.add('game-over');
    
    gameOverDiv.innerHTML = `
        <h3>Congratulations!</h3>
        <p>You completed the game!</p>
        <p>Final Score: <strong>${points}</strong> points</p>
        <button class="restart-btn" onclick="restartGame()">Play Again</button>
    `;
    
    document.body.appendChild(gameOverDiv);
}

function restartGame() {
    const gameOverMessage = document.querySelector('.game-over');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
    
    initGame();
}

document.addEventListener('DOMContentLoaded', initGame);