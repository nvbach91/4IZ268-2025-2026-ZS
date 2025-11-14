/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

// Game state variables
const citiesOriginal = ['Prague', 'London', 'Paris', 'Moscow', 'Vancouver', 'Sydney', 'Tokyo', 'Berlin', 'Madrid', 'Rome', 'Vienna', 'Amsterdam'];
let cities = [];
let firstCard = null;
let secondCard = null;
let score = 0;
let matchedPairs = 0;
let isGameLocked = false;

// Initialize the game
function initGame() {
    // Duplicate cities array and shuffle
    cities = citiesOriginal.concat(citiesOriginal);
    cities.sort(() => {
        return 0.5 - Math.random();
    });
    
    // Create game board
    createGameBoard();
    updateScore();
}

// Create the game board DOM structure
function createGameBoard() {
    const body = document.body;
    
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.classList.add('game-container');
    
    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.classList.add('score-display');
    scoreDisplay.id = 'score';
    scoreDisplay.innerHTML = 'Score: <span id="score-value">0</span>';
    
    // Create game board
    const board = document.createElement('div');
    board.classList.add('game-board');
    board.id = 'game-board';
    
    // Create cards
    cities.forEach((city, index) => {
        const card = createCard(city, index);
        board.appendChild(card);
    });
    
    // Create restart button
    const restartBtn = document.createElement('button');
    restartBtn.classList.add('restart-btn');
    restartBtn.textContent = 'Restart Game';
    restartBtn.addEventListener('click', restartGame);
    
    // Append everything to game container
    gameContainer.appendChild(scoreDisplay);
    gameContainer.appendChild(board);
    gameContainer.appendChild(restartBtn);
    
    // Append to body
    body.appendChild(gameContainer);
}

// Create individual card
function createCard(city, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.city = city;
    card.dataset.index = index;
    card.textContent = '?';
    
    // Add click event listener
    card.addEventListener('click', () => handleCardClick(card));
    
    return card;
}

// Handle card click
function handleCardClick(card) {
    // Prevent clicks when game is locked or card is already revealed
    if (isGameLocked || card.classList.contains('revealed')) {
        return;
    }
    
    // Reveal the card
    card.textContent = card.dataset.city;
    card.classList.add('revealed');
    
    // Handle game logic
    if (firstCard === null) {
        firstCard = card;
    } else if (secondCard === null) {
        secondCard = card;
        isGameLocked = true;
        
        // Check for match after a short delay
        setTimeout(() => {
            checkForMatch();
        }, 1000);
    }
}

// Check if two cards match
function checkForMatch() {
    const isMatch = firstCard.dataset.city === secondCard.dataset.city;
    
    if (isMatch) {
        // Cards match
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        score += 1;
        matchedPairs += 1;
    } else {
        // Cards don't match - hide them again
        firstCard.textContent = '?';
        secondCard.textContent = '?';
        firstCard.classList.remove('revealed');
        secondCard.classList.remove('revealed');
        if (score > 0) {
            score -= 1;
        }
    }
    
    updateScore();
    
    // Reset turn
    firstCard = null;
    secondCard = null;
    isGameLocked = false;
    
    // Check if game is won
    if (matchedPairs === cities.length / 2) {
        setTimeout(() => {
            alert(`Congratulations! You won with a score of ${score}!`);
        }, 500);
    }
}

// Update score display
function updateScore() {
    const scoreElement = document.getElementById('score-value');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// Restart the game
function restartGame() {
    // Clear the game board
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.remove();
    }
    
    // Reset game state
    firstCard = null;
    secondCard = null;
    score = 0;
    matchedPairs = 0;
    isGameLocked = false;
    
    // Reinitialize
    initGame();
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);