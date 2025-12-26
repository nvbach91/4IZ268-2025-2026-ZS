"use strict"; 

const App = {
    state: {
        quizLength: 10,
        currentQuestion: 0,
        score: 0,
        quizStartTime: null,
        timerInterval: null,
        correctBreed: '',
        allBreeds: [],
        history: []
    },

    api: {
        listAllBreeds: 'https://dog.ceo/api/breeds/list/all',
        randomImage: 'https://dog.ceo/api/breeds/image/random'
    },

    init: function() {
        App.bindEvents();
        App.showScreen('#loading-screen');
        App.loadData();
    },

    showScreen: function(selector) {
        $('.screen').removeClass('active');
        $(selector).addClass('active');
    },

    loadData: function() {
        const historyString = localStorage.getItem('dogQuizHistory');
        if (historyString !== null) {
            try {
                App.state.history = JSON.parse(historyString);
            } catch (e) {
                App.state.history = [];
            }
        } else {
            App.state.history = [];
        }
        App.updateBestScoreDisplay();
        
        App.fetchBreeds();
    },
    
    fetchBreeds: function() {
        $.ajax({
            url: App.api.listAllBreeds,
            method: 'GET',
            dataType: 'json'
        })
        .done(function(response) {
            if (response.status === 'success') {
                App.state.allBreeds = Object.keys(response.message);
                App.showScreen('#start-screen');
            } else {
                $('#loading-screen').html('<h2>Chyba při stahování dat.</h2>');
            }
        })
        .fail(function() {
            $('#loading-screen').html('<h2>Chyba připojení k Dog API. Zkuste obnovit stránku.</h2>');
        });
    },
    
    startQuiz: function() {
        if (App.state.allBreeds.length === 0) {
             return;
        }

        App.state.currentQuestion = 0;
        App.state.score = 0;
        App.state.quizStartTime = new Date();
        
        clearInterval(App.state.timerInterval);
        App.state.timerInterval = setInterval(App.updateTimer, 1000);

        App.loadQuestion();
    },
    
    updateTimer: function() {
        const now = new Date();
        const elapsed = Math.floor((now - App.state.quizStartTime) / 1000);
        $('#time-indicator').text(`Čas: ${App.formatTime(elapsed)}`);
    },
    
    loadQuestion: function() {
        App.state.currentQuestion++;
        
        if (App.state.currentQuestion > App.state.quizLength) {
            App.finishQuiz();
            return;
        }

        App.showScreen('#loading-screen'); 
        
        $('#options-container').empty();
        $('#feedback-message').empty();
        $('#confirm-answer-btn').prop('disabled', true).text('Potvrdit odpověď').show();
        $('#next-action-slot').empty(); 
        $('#dog-image').hide();

        $('#progress-indicator').text(`Otázka ${App.state.currentQuestion}/${App.state.quizLength}`);
        
        $.ajax({
            url: App.api.randomImage,
            method: 'GET',
            dataType: 'json'
        })
        .done(function(response) {
            if (response.status === 'success') {
                const imageUrl = response.message;
                const parts = imageUrl.split('/');
                const breedNameRaw = parts[parts.length - 2]; 
                
                App.state.correctBreed = App.formatBreedName(breedNameRaw);
                
                const wrongBreedsRaw = _.sampleSize(App.state.allBreeds, 3);
                const wrongBreeds = wrongBreedsRaw.map(App.formatBreedName);

                let options = wrongBreeds;
                options.push(App.state.correctBreed);
                options = _.shuffle(options);
                
                const optionElements = options.map(function(value) {
                    return $(`<button class="option-btn" data-answer="${value}">${value}</button>`);
                });
                
                $('#options-container').append(optionElements);

                $('#dog-image').attr('src', imageUrl).on('load', function() {
                    $(this).show(); 
                    App.showScreen('#quiz-screen');
                });

            } else {
                App.loadQuestion();
            }
        })
        .fail(function() {
            $('#loading-screen').html('<h2>Chyba při stahování obrázku. Zkuste obnovit stránku.</h2>');
        });
    },
    
    selectAnswer: function(e) {
        $('.option-btn').removeClass('selected');
        $(e.target).addClass('selected');
        
        $('#confirm-answer-btn').prop('disabled', false);
    },

    submitAnswer: function() {
        const selectedButton = $('.option-btn.selected');
        if (selectedButton.length === 0) {
            return;
        }
        
        const selectedAnswer = selectedButton.data('answer');
        const isCorrect = selectedAnswer === App.state.correctBreed;
        
        $('.option-btn').prop('disabled', true);
        $('#confirm-answer-btn').prop('disabled', true).hide();
        
        if (isCorrect) {
            selectedButton.addClass('correct');
            App.state.score++;
            $('#feedback-message').text('Správně!').css('color', '#27ae60');
        } else {
            selectedButton.addClass('wrong');
            $(`.option-btn[data-answer="${App.state.correctBreed}"]`).addClass('correct');
            $('#feedback-message').text(`Špatně! Správná odpověď byla ${App.state.correctBreed}`).css('color', '#e74c3c');
        }
        
        const isLastQuestion = App.state.currentQuestion === App.state.quizLength;
        const buttonText = isLastQuestion 
            ? 'Vyhodnotit kvíz a zobrazit výsledky'
            : 'Pokračovat na další otázku';
            
        const nextButton = $(`<button id="next-question-btn">${buttonText}</button>`);
        $('#next-action-slot').append(nextButton); 
        
        nextButton.on('click', function() {
            $('#next-action-slot').empty();
            if (isLastQuestion) {
                App.finishQuiz();
            } else {
                App.loadQuestion();
            }
        });
    },
    
    finishQuiz: function() {
        clearInterval(App.state.timerInterval);
        
        const timeInSeconds = Math.floor((new Date() - App.state.quizStartTime) / 1000);
        const finalTimeFormatted = App.formatTime(timeInSeconds);
        
        const newResult = {
            score: App.state.score,
            timeInSeconds: timeInSeconds,
            time: finalTimeFormatted,
            date: new Date().toLocaleDateString('cs-CZ')
        };
        App.state.history.push(newResult);
        localStorage.setItem('dogQuizHistory', JSON.stringify(App.state.history));
        App.updateBestScoreDisplay();
        
        $('#final-score').text(`Vaše skóre: ${App.state.score}/${App.state.quizLength}`);
        $('#time-taken').text(`Celkový čas: ${finalTimeFormatted}`);
        
        const $tbody = $('#history-table tbody');
        $tbody.empty();
        const sortedHistory = App.state.history.slice().reverse();

        if (sortedHistory.length === 0) {
             $tbody.append('<tr><td colspan="3">Zatím nebyly zaznamenány žádné výsledky.</td></tr>');
        } else {
            const rowElements = sortedHistory.map(function(result) {
                 return $(`
                    <tr>
                        <td>${result.score}/${App.state.quizLength}</td>
                        <td>${result.time}</td>
                        <td>${result.date}</td>
                    </tr>
                `);
            });
            $tbody.append(rowElements);
        }
        
        App.showScreen('#results-screen');
    },
    
    formatBreedName: function(breedNameRaw) {
        return breedNameRaw
            .split('-')
            .reverse()
            .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); })
            .join(' ');
    },

    formatTime: function(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },

    updateBestScoreDisplay: function() {
        if (App.state.history.length === 0) {
            $('#best-score-display').text('Zatím bez výsledků.');
            return;
        }
        const bestResult = _.maxBy(App.state.history, 'score');
        const bestTime = App.formatTime(bestResult.timeInSeconds);
        
        $('#best-score-display').text(`Nejlepší skóre: ${bestResult.score}/10 (čas: ${bestTime})`);
    },

    bindEvents: function() {
        $('#start-quiz-btn').on('click', App.startQuiz);
        $('#confirm-answer-btn').on('click', App.submitAnswer);
        $('#restart-quiz-btn').on('click', App.startQuiz);
        
        $('#options-container').on('click', '.option-btn', App.selectAnswer);
    },
};

$(document).ready(function() {
    if (typeof $ === 'undefined' || typeof _ === 'undefined') {
        alert('CHYBA: Knihovny jQuery nebo Lodash nebyly správně načteny.');
        return;
    }
    App.init();
});