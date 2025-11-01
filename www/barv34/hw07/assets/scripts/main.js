document.addEventListener('DOMContentLoaded', () => {
    const pokemonNames = [
        'Pikachu', 'Charmander', 'Squirtle', 'Bulbasaur', 'Jigglypuff',
        'Meowth', 'Psyduck', 'Snorlax', 'Eevee', 'Gengar'
    ];
    let gameGrid = pokemonNames.concat(pokemonNames);
    gameGrid.sort(() => 0.5 - Math.random());

    const mainContainer = document.createElement('div');
    mainContainer.classList.add('main-container');

    const scoreDisplay = document.createElement('h1');
    scoreDisplay.id = 'score';

    const gameBoard = document.createElement('section');
    gameBoard.classList.add('game-board');

    mainContainer.appendChild(scoreDisplay);
    mainContainer.appendChild(gameBoard);
    document.body.appendChild(mainContainer);

    let score = 0;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    const totalPairs = pokemonNames.length;

    updateScore();

    function createBoard() {
        const fragment = document.createDocumentFragment();

        gameGrid.forEach((name, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = index;

            card.addEventListener('click', flipCard);
            fragment.appendChild(card);
        });

        gameBoard.appendChild(fragment);
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        const cardIndex = this.dataset.index;
        const cardName = gameGrid[cardIndex];
        this.textContent = cardName;

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        lockBoard = true;

        checkForMatch();
    }

    function checkForMatch() {
        const firstIndex = firstCard.dataset.index;
        const secondIndex = secondCard.dataset.index;

        const isMatch = gameGrid[firstIndex] === gameGrid[secondIndex];

        if (isMatch) {
            handleMatch();
        } else {
            handleMismatch();
        }
    }

    function handleMatch() {
        score++;
        matchedPairs++;

        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        updateScore();
        resetTurn();
        checkGameEnd();
    }

    function handleMismatch() {
        score = Math.max(0, score - 1);
        updateScore();

        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            firstCard.textContent = '';
            secondCard.textContent = '';

            resetTurn();
        }, 1500);
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function resetTurn() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    function checkGameEnd() {
        if (matchedPairs === totalPairs) {
            setTimeout(() => {
                alert(`Gratuluji! Hra skončila.\nTvé finální skóre: ${score}`);
            }, 500);
        }
    }

    createBoard();
});