document.addEventListener('DOMContentLoaded', () => {

    const keys = document.querySelectorAll('.key');
    const rows = document.querySelectorAll('#game-board .row');

    const played = document.getElementById('played');
    const wins = document.getElementById('wins');
    const streak = document.getElementById('streak');

    const newWord = document.getElementById('word-input');
    const newWordButton = document.getElementById('add-button');

    const timer = document.getElementById('timer');

    const resetButton = document.getElementById('reset-button');

    let currentRowIndex = 0;
    let currentTileIndex = 0;
    const wordLength = 5;

    let secretWord = "";
    let isLoading = true;

    let timerInterval = null;
    let startTime = null;
    let isGameStarted = false;
    let isGameOver = false;

    resetButton.addEventListener('click', () => {
        if (!isGameOver && (isGameStarted || currentTileIndex > 0)) {

            if (!confirm("Hra je rozehraná. Opravdu chceš začít znovu?")) {
                return;
            }
        }
        window.location.reload();
    });



    newWordButton.addEventListener('click', async () => {
        const text = newWord.value.trim().toUpperCase();

        if (text.length !== 5) {
            alert("Slovo musí mít přesně 5 písmen!");
            return;
        }

        newWordButton.disabled = true;
        newWordButton.textContent = "Ověřuji...";

        try {
            const getResponse = await fetch('https://lab.betalix.cz/api/words');

            if (!getResponse.ok) {
                throw new Error("Nepodařilo se stáhnout seznam slov.");
            }

            const allWords = await getResponse.json();

            const wordExists = allWords.some(item => item.word.toUpperCase() === text);

            if (wordExists) {
                alert(`Slovo "${text}" už v databázi je! Zkus jiné.`);
                newWordButton.disabled = false;
                newWordButton.textContent = "Přidat";
                return;
            }

            newWordButton.textContent = "Odesílám...";

            const postResponse = await fetch('https://lab.betalix.cz/api/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: text })
            });

            if (postResponse.status === 201) {
                alert(`Super! Slovo "${text}" bylo úspěšně přidáno.`);
                newWord.value = '';
            } else {
                alert("Něco se pokazilo při ukládání slova.");
            }

        } catch (error) {
            console.error("Chyba:", error);
            alert("Chyba komunikace se serverem.");
        } finally {
            newWordButton.disabled = false;
            newWordButton.textContent = "Přidat";
        }
    });

    const defaultStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        wordHistory: []
    };

    let stats = JSON.parse(localStorage.getItem('wordleStats')) || defaultStats;

    function renderStats() {
        if (played) played.textContent = stats.gamesPlayed;
        if (wins) wins.textContent = stats.gamesWon;
        if (streak) streak.textContent = stats.currentStreak;
    }

    renderStats();

    function saveStats() {
        localStorage.setItem('wordleStats', JSON.stringify(stats));
    }

    const initGame = async () => {
        try {
            const response = await fetch('https://lab.betalix.cz/api/words/random');
            const data = await response.json();
            const candidateWord = data.word.toUpperCase();

            if (stats.wordHistory.includes(candidateWord) && stats.wordHistory.length < 100) {
                console.log(`Slovo ${candidateWord} už bylo, hledám nové...`);
                initGame();
                return;
            }

            secretWord = candidateWord;
            isLoading = false;
            console.log("Tajné slovo (nápověda):", secretWord);

        } catch (error) {
            console.error("Chyba:", error);
            alert("Nepodařilo se načíst slovo.");
        }
        stopTimer();
        timer.textContent = "00:00";
        isGameStarted = false;

    };

    initGame();


    function startTimer() {
        if (isGameStarted) return;

        isGameStarted = true;
        startTime = moment();

        timerInterval = setInterval(() => {
            const now = moment();
            const diff = now.diff(startTime);

            timer.textContent = moment.utc(diff).format("mm:ss");
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    keys.forEach(key => {
        key.addEventListener('click', () => {
            handleInput(key.textContent);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.target === newWord) {
            return;
        }

        const key = e.key.toUpperCase();
        if (key === 'ENTER') handleInput('ENTER');
        else if (key === 'BACKSPACE') handleInput('⌫');
        else if (key.length === 1 && /^[A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŇŤ]$/.test(key)) handleInput(key);
    });

    function handleInput(letter) {
        if (isLoading) return;

        if (!isGameStarted && letter !== 'ENTER' && letter !== '⌫' && letter !== 'BACKSPACE') {
            startTimer();
        }

        if (letter === 'ENTER') {
            submitRow();
            return;
        }
        if (letter === '⌫' || letter === 'BACKSPACE') {
            deleteLetter();
            return;
        }
        addLetter(letter);
    }

    function addLetter(letter) {
        if (currentTileIndex >= wordLength) return;

        const currentRow = rows[currentRowIndex];
        const currentTile = currentRow.children[currentTileIndex];
        currentTile.textContent = letter;
        currentTile.setAttribute('data-letter', letter);
        currentTileIndex++;
    }

    function deleteLetter() {
        if (currentTileIndex === 0) return;

        currentTileIndex--;
        const currentRow = rows[currentRowIndex];
        const currentTile = currentRow.children[currentTileIndex];
        currentTile.textContent = '';
        currentTile.removeAttribute('data-letter');
    }

    function updateGameStats(isWin) {
        stats.gamesPlayed++;

        stats.wordHistory.push(secretWord);
        if (stats.wordHistory.length > 100) stats.wordHistory.shift();

        if (isWin) {
            stats.gamesWon++;
            stats.currentStreak++;
        } else {
            stats.currentStreak = 0;
        }

        saveStats();
        renderStats();
    }

    function submitRow() {
        if (currentTileIndex !== wordLength) {
            alert("Slovo je příliš krátké!");
            return;
        }

        let guessedWord = '';
        const currentRow = rows[currentRowIndex];

        for (let i = 0; i < wordLength; i++) {
            guessedWord += currentRow.children[i].textContent;
        }

        const guessedArray = guessedWord.split('');
        const secretArray = secretWord.split('');
        const resultColor = new Array(wordLength).fill('absent');

        for (let i = 0; i < wordLength; i++) {
            if (guessedArray[i] === secretArray[i]) {
                resultColor[i] = 'correct';
                guessedArray[i] = null;
                secretArray[i] = null;
            }
        }

        for (let i = 0; i < wordLength; i++) {
            if (guessedArray[i] === null) continue;
            const letter = guessedArray[i];
            const indexInSecret = secretArray.indexOf(letter);

            if (indexInSecret !== -1) {
                resultColor[i] = 'present';
                secretArray[indexInSecret] = null;
            }
        }

        for (let i = 0; i < wordLength; i++) {
            const tile = currentRow.children[i];
            const colorClass = resultColor[i];
            const letter = tile.textContent;

            setTimeout(() => {
                tile.classList.add(colorClass);
                colorKey(letter, colorClass);
            }, i * 300);
        }

        console.log("Hráč:", guessedWord, "| Tajné:", secretWord);

        setTimeout(() => {
            if (guessedWord === secretWord) {
                stopTimer();
                const finalTime = timer.textContent;

                updateGameStats(true);

                isGameOver = true;
                setTimeout(() => alert("Gratuluji! Vyhrál jsi!"), 100);
                isLoading = true;
                return;
            }

            if (currentRowIndex < rows.length - 1) {
                currentRowIndex++;
                currentTileIndex = 0;
            } else {
                if (guessedWord !== secretWord) {
                    stopTimer();

                    updateGameStats(false);

                    isGameOver = true;
                    alert(`Konec hry! Tajné slovo bylo: ${secretWord}`);
                    isLoading = true;
                }
            }
        }, wordLength * 300 + 100);
    }

    function colorKey(letter, color) {
        keys.forEach(key => {
            if (key.textContent === letter) {
                const oldColor = key.classList.contains('correct') ? 'correct' :
                    key.classList.contains('present') ? 'present' : null;

                if (oldColor === 'correct') return;
                if (oldColor === 'present' && color === 'absent') return;

                key.classList.remove('present', 'absent')
                key.classList.add(color);
            }
        });
    }

});