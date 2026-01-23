

//HOTOVE OPRAVY
// timestamp - datum a cas odevzdani v historii - v html tabulce, nova promenna submittedAt - uchovava cas + datum pomoci now (ve finish quiz)
//formatovani kodu
//string interpolation - uprava napriklad v update timer
//vybirani opakovane elementu - App.els + uprava v kodu
//viewport - v css
//zobrazeni historie - nove tlacitko, bindEvents - finishquiz, v finishquiz doplnen if else (kdyby kviz nebyl jeste spuszen)+ v else jeste osetreni kdyby nebyly zadne zaznamy 
//scrollovani - upravy v css, margin, padding atd, historie - zmenseni mezer, doleva a doprava - v css dole
//automaticky prechod na dalsi otazku - setTimeout
//strankovani vysledku - do state, v html tlaticka, nextbutton, finishquiz -indexy, slice
//smazani historie - pridani sloupce do tabulky (+button), bindevents, pres splice, upravy v css
//konfigurace - state, na start screen moznost navolit, upravy ve fci startquiz


const App= {
    state: { //object state
        quizLength:10,
        optionsCount:4, //defaultne 4 moznosti odpovedi
        
        currentQuestion:0,
        score:0,
        quizStartTime:null,
        timerInterval:null,
        correctBreed:"",
        allBreeds:[], //seznam plement
        history:[], //vysledky z minulych her

        //PRIDANI STRANKOVANI
        currentPage:1,
        rowsPerPage: 5

    },
    //API
    api: {
        listAllBreeds: "https://dog.ceo/api/breeds/list/all",
        randomImage: "https://dog.ceo/api/breeds/image/random"
    },
    //po nacteni stranky
    init:function () { 

        //PROMENNE - ABYCHOM NEPOUZIVALI OPAKOVANE
        App.els = {
            feedback: $('#feedback-message'),
            options: $('#options-container'),
            timer: $('#time-indicator'),
            confirmBtn: $('#confirm-answer-btn'),
            progress: $('#progress-indicator'),
            dogImg: $('#dog-image'),
            nextSlot: $('#next-action-slot'),
            bestScore: $('#best-score-display'),
            finalScore: $('#final-score'),
            timeTaken: $('#time-taken')

        };

        App.bindEvents(); 
        App.showScreen('#loading-screen');
        App.loadData();
    },
    //fce showScreen - zobrazeni aktivni stranky
    showScreen: function (selector) {
        $('.screen').removeClass('active');
        $(selector).addClass('active');
    },
    // fce loadData - nacitani historie + skore (updateBestScoreDislay) + psi (fetchBreeds)
    loadData: function () {
        const historyString = localStorage.getItem('dogQuizHistory');
        if (historyString !== null) {
            try { //mame
                App.state.history = JSON.parse(historyString);
            } catch (e) { //in case of error
                App.state.history = [];
            }
        } else { //nemame
            App.state.history = [];
        }
        App.updateBestScoreDisplay();
        App.fetchBreeds();
    },
    //fce fetchBreeds
    fetchBreeds: function () {
        $.ajax({ 
            url:App.api.listAllBreeds, //tahame psi
            method:'GET',
            dataType:'json'
        })
            .done(function(response) {
                if (response.status==='success') {
                    App.state.allBreeds=Object.keys(response.message); //vytahujeme to dulezite z psu (klice jsou plemena) a ukladame do allBreeds
                    App.showScreen('#start-screen');
                }
                else {
                    $('#loading-screen').html('<h2>Chyba při stahování dat.</h2>');
                }
            })
            .fail(function () { //pro jistotu kdybychom se ani nepripojili
                $('#loading-screen').html('<h2>Chyba připojení k Dog API. Zkuste obnovit stránku.</h2>');
            });
    },
    //fce startQuiz
    startQuiz: function () {
        //nemame nactene zadne psy
        if (App.state.allBreeds.length === 0) {
             return;
        }
        //NACTENI KONFIGURACE PODLE UZIVATELE
        App.state.quizLength = parseInt($('#set-quiz-length').val()) || 10;
        App.state.optionsCount = parseInt($('#set-options-count').val()) || 4;
        

        App.state.currentQuestion = 0;
        App.state.score = 0;
        App.state.quizStartTime = new Date(); //zacatek kvizu
        //STRANKOVANI
        App.state.currentPage = 1;
        
        clearInterval(App.state.timerInterval); //mazeme ostatni casovace
        App.state.timerInterval = setInterval(App.updateTimer, 1000); //pres updateTimer - pocitame cas kvizu 

        App.loadQuestion();
    },
    //fce updateTimer
    updateTimer:function() {
        const now = new Date();
        const elapsed = Math.floor((now-App.state.quizStartTime)/1000);
        //PRIKLAD pouziti App.els.
        App.els.timer.text(`Čas: ${App.formatTime(elapsed)}`); //STRING INTERPOLATION
    },
    //fce loadQuestion
    loadQuestion:function () {
        //pojistka pro 5 sekund na dalsi otazku
        $('#next-question-btn').off('click');
        App.state.currentQuestion++;
        //posledni otazka
        if (App.state.currentQuestion > App.state.quizLength) {
            App.finishQuiz();
            return;
        }

        App.showScreen('#loading-screen'); 
        //nulovani
        App.els.options.empty();
        App.els.feedback.empty();
        App.els.confirmBtn.prop('disabled', true).text("Potvrdit odpověď").show(); //aby nebyla odeslana prazdna odpoved
        App.els.nextSlot.empty(); 
        App.els.dogImg.hide();

    

        App.els.progress.text(`Otázka ${App.state.currentQuestion}/${App.state.quizLength}`);
        
        $.ajax({ 
            //fotka psa
            url: App.api.randomImage,
            method:'GET',
            dataType:'json'
        })
        .done(function(response) { //response - atributy message a status
            if (response.status === 'success') {
                const imageUrl = response.message;

                console.log(`Načítání obrázku: ${imageUrl}`); //kontrola v konzoli
                //ZDE PUVODNE: console.log("Načítání obrázku:" + imageUrl);
            
                const parts = imageUrl.split('/'); 
                 //nazev psa z adresy - napr https://images.dog.ceo/breeds/shiba/n02110806_331.jpg
                App.state.correctBreed = parts[parts.length - 2]; //shiba
                
                const wrongBreeds = _.sampleSize(_.without(App.state.allBreeds, App.state.correctBreed), App.state.optionsCount - 1);
            
                let options = wrongBreeds;
                options.push(App.state.correctBreed);
                options = _.shuffle(options);
                //vyroba tlacitek - value pracuje s aktualnim prvkem
                const optionElements = options.map(function(value) { 
                    return $(`<button class="option-btn" data-answer="${value}">${value}</button>`); //data answer je pro ten system, aby vedel, co je tam napsano
                });
                //vlozeni na stranku - pouziti  option elements
                App.els.options.append(optionElements); 
                App.els.dogImg.attr('src', imageUrl).on('load', function() { //menim artibut src na imageUrl, on load, tedy az se nacte
                    $(this).show(); 
                    App.showScreen('#quiz-screen');
                });

            } //kdyby se nenacetl se pes
            else {
                App.loadQuestion(); 
            }
        }) 
        .fail(function() {
            $('#loading-screen').html('<h2>Chyba při stahování obrázku. Zkuste obnovit stránku.</h2>');
        });
    },
    //fce selectAnswer
    selectAnswer: function(e) {
        $('.option-btn').removeClass('selected');
        $(e.target).addClass('selected');
        App.els.confirmBtn.prop('disabled', false); //at muzeme odeslat odpoved
    },
    //fce submitAnswer
    submitAnswer:function () {
        const selectedButton = $('.option-btn.selected');
        if (selectedButton.length === 0) { //kdyby nebylo vybrano nic
            return;
        }
        //vyhodnoceni odpovedi
        const selectedAnswer = selectedButton.data('answer');
        const isCorrect=selectedAnswer === App.state.correctBreed;
        
        $('.option-btn').prop('disabled',true);
        App.els.confirmBtn.prop('disabled',true).hide();
        //spravna odpoved
        if (isCorrect) {
            selectedButton.addClass('correct');
            App.state.score++;
            App.els.feedback.text("Správně!");
        }  //spatna odpoved
        else {
            selectedButton.addClass('wrong');
            $(`.option-btn[data-answer="${App.state.correctBreed}"]`).addClass('correct');
            App.els.feedback.text(`Špatně! Správná odpověď je ${App.state.correctBreed}`); //STRING INTERPOLATION
        }
        
        const isLastQuestion = App.state.currentQuestion === App.state.quizLength;
        let buttonText;
            if(isLastQuestion) {
                buttonText = "Vyhodnotit kvíz a zobrazit výsledky";
            }
            else {
                buttonText = "Pokračovat na další otázku";
            }           
          
            //UPRAVA AUTOMATICKEHO PREPOJENI PO 5 S
        const nextButton = $(`<button id="next-question-btn">${buttonText}</button>`);
        App.els.nextSlot.append(nextButton); 
            //novy text
        App.els.feedback.append(`<p>(Další otázka za 5 sekund...)</p>`)
        //casovac - pouziti set timeout
        const autoTimer = setTimeout(function(){
            nextButton.click(); //simulace kliknuti po 4000 milisekund
        }, 4000);
        
        nextButton.on('click', function () {
            //zastaveni odpoctu - kdyz uzivatel klikne sam
            clearTimeout(autoTimer);

            App.els.nextSlot.empty();
            if (isLastQuestion) {
                App.finishQuiz();
            } else {
                App.loadQuestion();
            }
        });
    },
    //konec
    finishQuiz:function () {
        clearInterval(App.state.timerInterval);
        const now= new Date(); //pridame si promennou now - kvuli timestamp
        //POKUD BYL KVIZ SPUSTEN
        if (App.state.quizStartTime !== null) {
            const timeInSeconds = Math.floor((new Date() - App.state.quizStartTime) / 1000);
            const finalTimeFormatted = App.formatTime(timeInSeconds);
            const newResult = {
                score: App.state.score,
                //nova promenna kvuli ukladani vysledku
                quizLength: App.state.quizLength, 
                timeInSeconds: timeInSeconds,
                time: finalTimeFormatted,
                date: new Date().toLocaleDateString('cs-CZ'),
                //PRIDANI TIMESTAMP VYSLEDKU
                submittedAt: `${now.toLocaleDateString('cs-CZ')} ${now.toLocaleTimeString('cs-CZ')}`
            };
            App.state.history.push(newResult);
            localStorage.setItem('dogQuizHistory', JSON.stringify(App.state.history));
            
            App.state.quizStartTime = null;

            App.els.finalScore.text(`Vaše skóre: ${App.state.score}/${App.state.quizLength}`).show();
            App.els.timeTaken.text(`Celkový čas: ${finalTimeFormatted}`).show();
            $('#results-screen h2').show();
        }
        //POKUD NEBYL SPUSTEN
        else {
            $('#results-screen h2').hide(); //smazani nadpisu vysledky
            if (App.state.history.length > 0) {
                App.els.finalScore.hide();
                App.els.timeTaken.hide();
            } 
            else {
                App.els.finalScore.text("Zatím jsi nehrál/a.").show();
            }
        }

        App.updateBestScoreDisplay();

        const $tbody = $('#history-table tbody');
        $tbody.empty();
        const sortedHistory=App.state.history.slice().reverse();

        //STRANKOVANI
        const startIndex = (App.state.currentPage - 1) * App.state.rowsPerPage; //kde zacina aktualni stranka (-1 = index) * kolik je tam zaznamu = index pro prvni zaznam na te strance
        const endIndex = startIndex + App.state.rowsPerPage; //kde konci
        const paginatedItems = sortedHistory.slice(startIndex, endIndex); //cast vysledku kterou chceme zobrazovat


        if (sortedHistory.length === 0) {
             $tbody.append('<tr><td colspan="4">Zatím nebyly zaznamenány žádné výsledky.</td></tr>');
             $('#pagination-controls').hide(); //nemusime videt strankovani - tlacitka
        }

        else {

            $('#pagination-controls').show(); //chceme videt strankovani

            const rowElements=paginatedItems.map(function(result, index) {

                //INDEX ZAZNAMU KVULI MAZANI
                const realIndex = App.state.history.length - 1 - (startIndex + index); //kvuli obracenemu poradi - index je opacny od poradi

                //SEM BUDEME PRIDAVAZ BUTTON
                //PRIDANI TIMESTAMP DO TABULKY + do html tabulky novy sloupec - submittedAt
                //button - priradime realny index do data-indexu = propojenu se zaznamem
                 return $(`
                    <tr>

                        <td style="text-align: center;">
                            <button class="delete-row-btn" data-index="${realIndex}" title="Smazat"> &times;
                            </button>
                        </td>

                        <td>${result.score}/${result.quizLength}</td>
                        <td>${result.time}</td>
                        <td>${result.date}</td>
                        
                        <td>${result.submittedAt}</td>
                    </tr>
                `);
            });
            $tbody.append(rowElements);

            //STRANKOVANI-AKTUALIZACE - funkcnost
            const totalPages = Math.ceil(sortedHistory.length / App.state.rowsPerPage); //vypocet poctu stranek, ceil zaokrouhluje nahoru -  x vysledku/ 5 na stranu =>zaokrouhlit nahoru = na kolik to bude stran
            $('#page-info').text(`Strana ${App.state.currentPage} z ${totalPages}`);

            //TLACITKA DALSI A PREDCHOZI-KLIKATELNA NEBO NE
            $('#prev-page-btn').prop('disabled', App.state.currentPage === 1); //pokud jsme na strane 1, tlacitko se vypne (=== 1 funguje jako T/F)
            $('#next-page-btn').prop('disabled', App.state.currentPage === totalPages || totalPages === 0); //kdyz jsme na posledni strance nebo tam nejsou zadne stranky, nechceme moznost dalsi
        
        }
        
        App.showScreen('#results-screen');
    },
    
    //fce formatTime
    formatTime:function(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    
    if(seconds < 10) {
        seconds = "0" + seconds;
    }
    //UPRAVA FORMATU - PUVODNI: return minutes+ ":"+ seconds;
    return `${minutes}:${seconds}`;
},
    //fce updateBestScoreDisplay
    updateBestScoreDisplay:function() {
        if (App.state.history.length === 0) {
            App.els.bestScore.text("Zatím bez výsledků.");
            return;
        }
        const bestResult = _.maxBy(App.state.history, 'score');
        const bestTime = App.formatTime(bestResult.timeInSeconds);
        
        App.els.bestScore.text(`Nejlepší skóre: ${bestResult.score}/${App.state.quizLength} (čas: ${bestTime})`);
    },

    bindEvents:function() {
        $('#start-quiz-btn').on('click', App.startQuiz);
        App.els.confirmBtn.on('click', App.submitAnswer);
        $('#restart-quiz-btn').on('click', App.startQuiz);
        
        App.els.options.on('click', '.option-btn', App.selectAnswer);
        //ZOBRAZENI HISTORIE VYSLEDKU
        $('#view-history-btn').on('click', App.finishQuiz);

        //TLACITKA TAM A ZPEt V HISTORII
        $('#prev-page-btn').on('click', function() {
            if (App.state.currentPage > 1) { //prejdeme na predeslou stranku
                App.state.currentPage--;
                App.finishQuiz(); 
            }
        });

        $('#next-page-btn').on('click', function() {
            const totalPages = Math.ceil(App.state.history.length / App.state.rowsPerPage);
            if (App.state.currentPage < totalPages) {
                App.state.currentPage++; //prejdeme na dalsi stranku
                App.finishQuiz();
            }


        });

        //TLACITKO NA MAZANI ZAZNAMU
        $('#history-table').on('click', '.delete-row-btn', App.deleteResult); //fce delete result nize


    },

    //FCE DELETE RESULT
    deleteResult: function(e) {
        const indexToDelete = $(e.currentTarget).data('index'); //current target = na co jsme klikli - priradi index
        
        App.state.history.splice(indexToDelete, 1); //splice - vymaze jeden prvek pod tim indexem
        localStorage.setItem('dogQuizHistory', JSON.stringify(App.state.history)); //znovu ulozit tuto updatovanou historii
        
        //jediny zaznam na strance - aby nas to preplo na predchozi stranu
        const totalPages = Math.ceil(App.state.history.length / App.state.rowsPerPage);
        if (App.state.currentPage > totalPages && totalPages > 0) {
            App.state.currentPage = totalPages;
        }
        //aktualizace statistik
        App.updateBestScoreDisplay();
        App.finishQuiz();
    },

};

$(document).ready(function() {
    if(typeof $ === 'undefined' || typeof _ === 'undefined') {
        alert("CHYBA: Knihovny jQuery nebo Lodash nebyly správně načteny.");
        return;
    }
    App.init();
});