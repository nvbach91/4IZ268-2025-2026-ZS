const DigitalJournal = {
    // Tvoje API klíče
    giphyKey: 'p9YyjKfe2qOIOcCsodFX0RWFWtIPUXeJ',
    quotesKey: 'J4o2qlvndMx94OgjJ7Yuap8YGShT5eUFeDbNksGA',

    init: function () {
        console.log("Aplikace naběhla! 📔");
        this.setupEventListeners();
        this.loadFromLocalStorage();
    },

    setupEventListeners: function () {
        var self = this;

        $('#addtextbtn').off('click').click(function () {
            self.addTextElement();
        });
        $('#savebtn').off('click').click(function () {
            self.saveToLocalStorage();
        });
        $('#clearbtn').off('click').click(function () {
            self.clearCanvas();
        });
        $('#searchbtn').off('click').click(function () {
            self.searchGiphy();
        });
        $('#searchinpt').off('keypress').keypress(function (e) {
            if (e.which === 13) {
                self.searchGiphy();
            }
        });
        $('#qotdbtn').off('click').click(function () {
            self.addQuote();
        });
    },

    showToast: function (message) {
        var boxtext = document.getElementById("snackbar");
        if (boxtext) {
            boxtext.innerText = message;
            boxtext.className = "show";
            setTimeout(function () {
                boxtext.className = boxtext.className.replace("show", "");
            }, 3000);
        }
    },

    // Pomocná funkce pro náhodnou rotaci (aby to vypadalo jako scrapbook)
    getRandomRotation: function () {
        return Math.floor(Math.random() * 20) - 10; // -10 až 10 stupňů
    },

    addTextElement: function () {
        var rot = this.getRandomRotation();
        var textElement = $('<div>')
            .addClass('canvas-element text-element')
            .attr('contenteditable', 'true')
            .text('Klikni a piš...')
            .css({
                left: '100px',
                top: '100px',
                transform: 'rotate(' + rot + 'deg)' // Rotace při startu
            })
            // Uložíme rotaci do data atributu pro pozdější načtení
            .attr('data-rotation', rot);

        $('#canvas').append(textElement);
        this.makeDraggable(textElement[0]);
    },

    makeDraggable: function (element) {
        var self = this;
        interact(element)
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ],
                autoScroll: true,
                listeners: {
                    move: self.dragMoveListener
                }
            });
    },

    dragMoveListener: function (event) {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Musíme zachovat rotaci i při pohybu!
        var rotation = target.getAttribute('data-rotation') || 0;

        target.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + rotation + 'deg)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    },

    searchGiphy: function () {
        var self = this;
        var query = $('#searchinpt').val();
        if (query === '') {
            this.showToast("Napiš něco!");
            return;
        }
        var apiUrl = 'https://api.giphy.com/v1/stickers/search';
        $.ajax({
            url: apiUrl,
            method: 'GET',
            data: {
                api_key: this.giphyKey,
                q: query,
                limit: 20,
                rating: 'g',
                lang: 'cs'
            },
            success: function (response) {
                self.displayGiphyResults(response.data);
            },
            error: function () {
                self.showToast("GIPHY error :(");
            }
        });
    },

    displayGiphyResults: function (stickers) {
        var self = this;
        var resultsDiv = $('#searchresults');
        resultsDiv.empty();
        if (stickers.length === 0) {
            resultsDiv.html('<p>Nic :(</p>');
            return;
        }
        stickers.forEach(function (sticker) {
            $('<img>')
                .attr('src', sticker.images.fixed_height_small.url)
                .click(function () {
                    self.addStickerToCanvas(sticker.images.original.url);
                })
                .appendTo(resultsDiv);
        });
    },

    addStickerToCanvas: function (imageUrl) {
        var rot = this.getRandomRotation();
        var stickerElement = $('<div>')
            .addClass('canvas-element sticker-element')
            .html('<img src="' + imageUrl + '" alt="sticker">')
            .css({
                left: '200px',
                top: '200px',
                transform: 'rotate(' + rot + 'deg)'
            })
            .attr('data-rotation', rot);

        $('#canvas').append(stickerElement);
        this.makeDraggable(stickerElement[0]);
    },

    addQuote: function () {
        var self = this;
        var apiUrl = 'https://api.api-ninjas.com/v1/quotes';
        $.ajax({
            method: 'GET',
            url: apiUrl,
            headers: { 'X-Api-Key': this.quotesKey },
            contentType: 'application/json',
            success: function (result) {
                var quoteData = result[0];
                var quoteText = '"' + quoteData.quote + '"\n— ' + quoteData.author;
                if (confirm("Vložit tento citát?\n\n" + quoteText)) {
                    var rot = self.getRandomRotation();
                    var quoteElement = $('<div>')
                        .addClass('canvas-element text-element')
                        .text(quoteText)
                        .css({
                            left: '100px',
                            top: '150px',
                            fontStyle: 'italic',
                            fontSize: '22px',
                            maxWidth: '300px',
                            transform: 'rotate(' + rot + 'deg)'
                        })
                        .attr('data-rotation', rot);

                    $('#canvas').append(quoteElement);
                    self.makeDraggable(quoteElement[0]);
                }
            },
            error: function () {
                self.showToast("Quote error :(");
            }
        });
    },

    clearCanvas: function () {
        if (confirm('Smazat vše?')) {
            $('#canvas').empty();
        }
    },

    saveToLocalStorage: function () {
        var elementsData = [];
        $('.canvas-element').each(function () {
            var element = $(this);
            var isText = element.hasClass('text-element');
            var isSticker = element.hasClass('sticker-element');

            var elementData = {
                type: isText ? 'text' : 'sticker',
                x: parseFloat(element.attr('data-x')) || 0,
                y: parseFloat(element.attr('data-y')) || 0,
                left: element.css('left'),
                top: element.css('top'),
                rotation: element.attr('data-rotation') || 0 // Ukládáme i rotaci!
            };

            if (isText) {
                elementData.content = element.text();
            } else if (isSticker) {
                elementData.imageUrl = element.find('img').attr('src');
            }
            elementsData.push(elementData);
        });
        localStorage.setItem('journalData', JSON.stringify(elementsData));
        this.showToast("Uloženo ✅");
    },

    loadFromLocalStorage: function () {
        var self = this;
        var jsonString = localStorage.getItem('journalData');
        if (!jsonString) return;

        var elementsData = JSON.parse(jsonString);
        var batch = $();

        elementsData.forEach(function (data) {
            var element;
            if (data.type === 'text') {
                element = $('<div>')
                    .addClass('canvas-element text-element')
                    .attr('contenteditable', 'true')
                    .text(data.content)
                    .css({ left: data.left, top: data.top });
            } else if (data.type === 'sticker') {
                element = $('<div>')
                    .addClass('canvas-element sticker-element')
                    .html('<img src="' + data.imageUrl + '" alt="sticker">')
                    .css({ left: data.left, top: data.top });
            }

            element.attr('data-x', data.x);
            element.attr('data-y', data.y);
            element.attr('data-rotation', data.rotation || 0); // Načteme rotaci

            // Aplikujeme transformaci (pozice + rotace)
            element.css('transform', 'translate(' + data.x + 'px, ' + data.y + 'px) rotate(' + (data.rotation || 0) + 'deg)');

            batch = batch.add(element);
        });

        $('#canvas').append(batch);

        $('.canvas-element').each(function () {
            self.makeDraggable(this);
        });
    }
};

$(document).ready(function () {
    DigitalJournal.init();
});