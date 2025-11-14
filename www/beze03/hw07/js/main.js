document.addEventListener('DOMContentLoaded', () => {
    let capitals = [
        "London",
        "Paris",
        "Tokyo",
        "Washington, D.C.",
        "Ottawa",
        "Canberra",
        "Brasilia",
        "Cairo",
        "Beijing",
        "Berlin"
    ];

    let cards = capitals.concat(capitals);

    cards.sort(() => 0.5 - Math.random());

    const gameDiv = document.createElement("div");
    gameDiv.classList.add("game-div");

    const scoreLine = document.createElement("h1");
    scoreLine.id = "scoreline";

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card-div");

    gameDiv.appendChild(scoreLine);
    gameDiv.appendChild(cardDiv);
    document.body.appendChild(gameDiv);

    let score = 0;
    let firstCard = null;
    let secondCard = null;
    let freezeBoard = false;
    let matchedCards = 0;
    let pairCount = capitals.length;

    function updateScore() {
        if (score < 0) {
            score = 0;
        }
        scoreLine.textContent = "Score: " + score;
    }

    function createGame() {
        cardDiv.innerHTML = "";
        scoreLine.textContent = "Score:" + score;
        cards.forEach((value) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.dataset.value = value;
            card.textContent = "";

            card.addEventListener("click", flipCard);

            cardDiv.appendChild(card);
        });
    }

    function resetGame() {
        score = 0;
        firstCard = null;
        secondCard = null;
        freezeBoard = false;
        matchedCards = 0;

        updateScore();
        createGame();
    }

    function flipCard(e) {
        const card = e.currentTarget;
        if (freezeBoard || card.classList.contains("flipped")) return;

        revealCard(card);

        if (!firstCard) {
            firstCard = card;
        } else {
            secondCard = card;
            freezeBoard = true;
            checkForMatch();
        }
    }

    function revealCard(card) {
        card.textContent = card.dataset.value;
        card.classList.add("flipped");
    }

    function hideCard(card) {
        card.textContent = "";
        card.classList.remove("flipped");
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;
        isMatch ? handleMatch() : handleMismatch();
    }

    function handleMatch() {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        matchedCards += 2;
        score++;
        updateScore();
        resetTurn();

        if (matchedCards === pairCount * 2) {

            setTimeout(() => {
                alert(`🎉 Congratulations! Your score is ${score}`);
                resetGame();
            }, 500);
        }
    }

    function handleMismatch() {
        setTimeout(() => {
            hideCard(firstCard);
            hideCard(secondCard);
            score = score - 1;
            updateScore();
            resetTurn();
        }, 800);
    }

    function resetTurn() {
        [firstCard, secondCard] = [null, null];
        freezeBoard = false;
    }

    createGame();
});