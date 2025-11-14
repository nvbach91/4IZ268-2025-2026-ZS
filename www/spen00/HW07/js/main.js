
document.addEventListener('DOMContentLoaded', () => {
    initMemoryGame();
});

function initMemoryGame() {
    
    const wrapper = document.createElement('div');
    wrapper.classList.add('memory-game-wrapper');

    const header = document.createElement('div');
    header.classList.add('memory-header');

    const title = document.createElement('div');
    title.classList.add('memory-title');
    title.innerText = 'Pexeso – Cities';

    const scoreBox = document.createElement('div');
    scoreBox.classList.add('memory-score');
    scoreBox.innerHTML = 'Score: <span id="memory-score">0</span>';

    header.appendChild(title);
    header.appendChild(scoreBox);

    const board = document.createElement('div');
    board.classList.add('memory-board');

    const message = document.createElement('div');
    message.classList.add('memory-message');
    message.id = 'memory-message';

    wrapper.appendChild(header);
    wrapper.appendChild(board);
    wrapper.appendChild(message);

    document.body.appendChild(wrapper);

    let cities = [
        'Prague',
        'London',
        'Paris',
        'Moscow',
        'Sydney',
        'Vancouver',
        'Tokyo',
        'Madrid',
        'Berlin',
        'Rome'
    ];

    cities = cities.concat(cities);

    cities.sort(() => 0.5 - Math.random());

    let score = 0;
    const scoreElement = document.getElementById('memory-score');

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    const totalPairs = cities.length / 2;

    function createCard(cityName) {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.city = cityName;

        const text = document.createElement('span');
        text.innerText = cityName;
        card.appendChild(text);

        card.addEventListener('click', () => handleCardClick(card));

        return card;
    }

    function handleCardClick(card) {
        if (lockBoard || card.classList.contains('revealed') || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('revealed');

        if (!firstCard) {
            
            firstCard = card;
            return;
        }

       
        secondCard = card;
        lockBoard = true;

        const firstCity = firstCard.dataset.city;
        const secondCity = secondCard.dataset.city;

        if (firstCity === secondCity) {
            
            score++;
            updateScore();

            firstCard.classList.remove('revealed');
            secondCard.classList.remove('revealed');
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');

            matchedPairs++;
            resetTurn();

            if (matchedPairs === totalPairs) {
                endGame();
            }
        } else {
            
            if (score > 0) {
                score--;
                updateScore();
            }

            
            setTimeout(() => {
                firstCard.classList.remove('revealed');
                secondCard.classList.remove('revealed');
                resetTurn();
            }, 1200); 
        }
    }

    function updateScore() {
        scoreElement.innerText = score;
    }

    function resetTurn() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }

    function endGame() {
        const msg = document.getElementById('memory-message');
        msg.innerText = `Konec hry! Vaše konečné skóre: ${score} bodů.`;
        lockBoard = true;
    }

    
    const fragment = document.createDocumentFragment();

    cities.forEach(city => {
        const card = createCard(city);
        fragment.appendChild(card);
    });

    board.appendChild(fragment);
}
