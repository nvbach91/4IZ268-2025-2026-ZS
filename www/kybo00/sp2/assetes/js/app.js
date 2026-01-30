document.addEventListener('DOMContentLoaded', () => {

    

    const played = document.getElementById('played');
    const wins = document.getElementById('wins');
    const streak = document.getElementById('streak');

    const newWord = document.getElementById('word-input');
    const newWordButton = document.getElementById('add-button');

    const timer = document.getElementById('timer');

    const resetButton = document.getElementById('reset-button');

    const boardContainer = document.getElementById('game-board');


    let currentRowIndex = 0;
    let currentTileIndex = 0;
    const wordLength = 5;
    const maxGuesses = 6;

    let secretWord = '';
    let isLoading = true;

    let timerInterval = null;
    let startTime = null;
    let isGameStarted = false;
    let isGameOver = false;



    function createGameBoard() {
        boardContainer.innerHTML = '';

        for (let i = 0; i < maxGuesses; i++) {

            const row = document.createElement('div');
            row.className = 'row';

            for (let j = 0; j < wordLength; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                row.appendChild(cell);
            }

            boardContainer.appendChild(row);
        }
    }

    createGameBoard();


    const keys = document.querySelectorAll('.key');
    const rows = document.querySelectorAll('#game-board .row');

    resetButton.addEventListener('click', () => {
        if (!isGameOver && (isGameStarted || currentTileIndex > 0)) {

            Swal.fire({
                title: 'Začít znovu?',
                text: "Hra je rozehraná. Opravdu chceš resetovat hru?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Ano, resetovat',
                cancelButtonText: 'Ne, hrát dál',
                background: '#fff',
                color: '#333'
            }).then((result) => {

                if (result.isConfirmed) {
                    initGame();
                }
            });

        } else {
            initGame();
        }
    });


    newWordButton.addEventListener('click', async () => {
        const text = newWord.value.trim().toUpperCase(); 

        if (text.length !== 5) {
            Swal.fire({
                title: 'Chyba',
                text: 'Slovo musí mít přesně 5 písmen!',
                icon: 'error',
                confirmButtonText: 'OK'
            })
            return;
        }

        if (/^[a-zA-ZěščřžýáíéóúůďňťĚŠČŘŽÝÁÍÉÓÚŮĎŇŤ]+$/.test(text) === false){
            Swal.fire({
                title: 'Chyba',
                text: 'Slovo musí obsahovat pouze české znaky bez čísel',
                icon: 'error',
                confirmButtonText: 'OK'
            })
            return;
        }
        

        newWordButton.disabled = true;
        newWordButton.textContent = 'Ověřuji...';

        try {
           
            const getResponse = await fetch(`http://localhost:3000/api/words/test/${encodeURIComponent(text)}`);
            const wordExists = await getResponse.json();
            if (wordExists !== true) {
                console.log(`Slovo ${text} ve slovníku není - je možno přidat`);
            } else {
                console.log(`Slovo ${text} existuje`);
            }
    

            if (wordExists) {
           
                Swal.fire({
                    title: "Chyba",
                    text: `Slovo '${text}' už v databázi je! Zkus jiné.`,
                    icon: "error"
                });
                newWordButton.disabled = false;
                newWordButton.textContent = 'Přidat';
                return;
            }

            newWordButton.textContent = 'Odesílám...';

            const postResponse = await fetch('http://localhost:3000/api/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: text })
            });

            if (postResponse.status === 201) {
                Swal.fire({
                    title: "Super!",
                    text: `Slovo '${text}' bylo úspěšně přidáno.`,
                    icon: "success"
                });
                newWord.value = '';
            } else {
                Swal.fire({
                title: 'Chyba',
                text: 'Něco se pokazilo při ukládání slova.',
                icon: 'error',
                confirmButtonText: 'OK'
            })

            }

        } catch (error) {
            console.error('Chyba:', error);
            
            Swal.fire({
                title: 'Chyba',
                text: 'Chyba komunikace se serverem.',
                icon: 'error',
                confirmButtonText: 'OK'
            })

        } finally {
            newWordButton.disabled = false;
            newWordButton.textContent = 'Přidat';
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


    function resetBoard() {
        rows.forEach(row => {
            Array.from(row.children).forEach(cell => {
                cell.textContent = '';
                cell.className = 'cell'; 
            });
        });

        keys.forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });

        currentRowIndex = 0;
        currentTileIndex = 0;
        isGameOver = false;
        
        stopTimer();
        timer.textContent = '00:00';
        isGameStarted = false;
        
        isLoading = true;
    }



    const initGame = async () => {
        resetBoard();

        try {
            const response = await fetch('http://localhost:3000/api/words/random');
            const data = await response.json();
            const candidateWord = data.word.toUpperCase();

            if (stats.wordHistory.includes(candidateWord) && stats.wordHistory.length < 50) {
                console.log(`Slovo ${candidateWord} už bylo, hledám nové...`);
                initGame();
                return;
            }

            secretWord = candidateWord;
            isLoading = false;
            console.log('Tajné slovo (nápověda):', secretWord);

        } catch (error) {
            console.error('Chyba:', error);

            Swal.fire({
                title: 'Chyba',
                text: 'Nepodařilo se načíst slovo.',
                icon: 'error',
                confirmButtonText: 'OK'
            })
            
        }
        stopTimer();
        timer.textContent = '00:00';
        isGameStarted = false;

    };


    function startTimer() {
        if (isGameStarted) return;

        isGameStarted = true;
        startTime = moment();

        timerInterval = setInterval(() => {
            const now = moment();
            const diff = now.diff(startTime);

            timer.textContent = moment.utc(diff).format('mm:ss');
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
            const value = key.dataset.key; 
            handleInput(value);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.target === newWord) {
            return;
        }

        const key = e.key.toUpperCase();
        if (key === 'ENTER') handleInput('ENTER');
        else if (key === 'BACKSPACE') handleInput('BACKSPACE');
        else if (key.length === 1 && /^[A-ZĚŠČŘŽÝÁÍÉÓÚŮĎŇŤ]$/.test(key)) handleInput(key);
    });

    function handleInput(letter) {
        if (isLoading) return;

        if (!isGameStarted && letter !== 'ENTER' && letter !== 'BACKSPACE') {
            startTimer();
        }

        if (letter === 'ENTER') {
            submitRow();
            return;
        }
        if (letter === 'BACKSPACE') {
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
        currentTileIndex++;
    }

    function deleteLetter() {
        if (currentTileIndex === 0) return;

        currentTileIndex--;
        const currentRow = rows[currentRowIndex];
        const currentTile = currentRow.children[currentTileIndex];
        currentTile.textContent = '';
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
            
            setTimeout(() => Swal.fire({
                title: 'Pozor!',
                text: 'Slovo je příliš krátké!',
                icon: 'error',
                confirmButtonText: 'OK'
            }), 100);
            

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

        console.log('Hráč:', guessedWord, '| Tajné:', secretWord);

        setTimeout(() => {
            if (guessedWord === secretWord) {
                stopTimer();
                const finalTime = timer.textContent;

                updateGameStats(true);

                isGameOver = true;
                setTimeout(() => Swal.fire({
                title: '',
                text: 'Gratuluji! Vyhrál jsi!',
                icon: 'success',
                confirmButtonText: 'OK'
            }), 100);
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
                    Swal.fire({
                        title: '',
                        text: `Konec hry! Tajné slovo bylo: ${secretWord}`,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })
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