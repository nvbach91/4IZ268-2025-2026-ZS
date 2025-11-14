document.addEventListener('DOMContentLoaded', () => {

    const gameField = document.getElementById('game-field');
    const pointsDisplay = document.getElementById('points');

    let items = [
        'Google', 'Apple', 'Meta', 'Amazon', 'Netflix',
        'Tesla', 'TikTok', 'Spotify', 'X', 'Intel'
    ];
    
    let fullDeck = items.concat(items);
    fullDeck.sort(() => 0.5 - Math.random());

    let score = 0;
    let matchedPairs = 0;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;

    function createBoard() {
        fullDeck.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            card.dataset.item = item; 
            card.innerText = item;

            card.addEventListener('click', flipCard);
            gameField.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains('matched')) {
            return;
        }

        this.classList.add('revealed');

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        lockBoard = true;

        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.item === secondCard.dataset.item;

        if (isMatch) {
            score++;
            matchedPairs++;
            disableCards();
        } else {
            score = Math.max(0, score - 1); 
            unflipCards();
        }

        pointsDisplay.textContent = score;
    }

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        resetBoard();
        checkWin();
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('revealed');
            secondCard.classList.remove('revealed');
            resetBoard();
        }, 1200);
    }

    function resetBoard() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    function checkWin() {
        if (matchedPairs === items.length) {
            setTimeout(() => {
                alert(`Game over! Your final score: ${score}`);
            }, 500);
        }
    }

    createBoard();
});