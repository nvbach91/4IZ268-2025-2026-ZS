const DigitalJournal = {
    giphyKey: 'p9YyjKfe2qOIOcCsodFX0RWFWtIPUXeJ',
    quotesKey: 'J4o2qlvndMx94OgjJ7Yuap8YGShT5eUFeDbNksGA',

    currentPageId: 'default',
    pages: { 'default': { name: 'Hlavní stránka', elements: [] } },

    // NASTAVENÍ ZOOMU A POSUNU
    zoom: 1,
    panX: 0,
    panY: 0,

    init() {
        this.cacheDOM();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.initCanvasInteractions(); // Inicializace hýbání s plátnem
    },

    cacheDOM() {
        this.$canvas = $('#canvas');
        this.$viewport = $('#canvas-viewport');
        this.$pageList = $('#pagelist');
        this.$zoomVal = $('#zoomVal');
    },

    setupEventListeners() {
        $('#addtextbtn').on('click', () => this.addTextElement());
        $('#savebtn').on('click', () => this.saveToLocalStorage());
        $('#clearbtn').on('click', () => this.clearCanvas());
        $('#newpagebtn').on('click', () => this.createNewPage());
        $('#qotdbtn').on('click', () => this.addQuote());

        $('#search-form').on('submit', (e) => {
            e.preventDefault();
            this.searchGiphy();
        });

        // ZOOM KOLEČKEM MYŠI
        this.$viewport.on('wheel', (e) => {
            e.preventDefault();
            const delta = e.originalEvent.deltaY;
            if (delta > 0) this.zoom = Math.max(0.2, this.zoom - 0.1);
            else this.zoom = Math.min(3, this.zoom + 0.1);
            this.updateCanvasTransform();
        });
    },

    // --- LOGIKA PLÁTNA (ZOOM & PAN) ---
    initCanvasInteractions() {
        // Hýbání celým plátnem (Panning)
        interact('#canvas-viewport').draggable({
            listeners: {
                move: (event) => {
                    // Měníme souřadnice panX a panY podle pohybu myši
                    this.panX += event.dx;
                    this.panY += event.dy;
                    this.updateCanvasTransform();
                }
            },
            cursorChecker: () => 'grab'
        });
    },

    updateCanvasTransform() {
        // Aplikujeme transformaci na plátno
        this.$canvas.css({
            'transform': `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`
        });
        // Aktualizace textu v UI
        this.$zoomVal.text(Math.round(this.zoom * 100) + '%');
    },

    // --- SPRÁVA STRÁNEK ---
    createNewPage() {
        const name = prompt("Název stránky:");
        if (name) {
            this.saveCurrentToState();
            const id = 'page_' + Date.now();
            this.pages[id] = { name: name, elements: [] };
            this.switchPage(id);
        }
    },

    switchPage(id) {
        this.saveCurrentToState();
        this.currentPageId = id;
        this.$canvas.empty();

        const pageData = this.pages[id];
        if (pageData && pageData.elements) {
            pageData.elements.forEach(data => this.recreateFromData(data));
        }
        this.renderPageList();
    },

    renderPageList() {
        this.$pageList.empty();
        Object.keys(this.pages).forEach(id => {
            const isActive = id === this.currentPageId ? 'active' : '';
            const li = $(`<li class="page-item ${isActive}" data-id="${id}">${this.pages[id].name}</li>`);
            li.on('click', () => this.switchPage(id));
            this.$pageList.append(li);
        });
    },

    saveCurrentToState() {
        const elements = [];
        $('.canvas-element').each(function () {
            const $el = $(this);
            elements.push({
                type: $el.hasClass('text-element') ? 'text' : 'sticker',
                content: $el.hasClass('text-element') ? $el.find('.content').text() : $el.find('img').attr('src'),
                x: parseFloat($el.attr('data-x')) || 0,
                y: parseFloat($el.attr('data-y')) || 0,
                w: $el.width(),
                h: $el.height()
            });
        });
        if (this.pages[this.currentPageId]) {
            this.pages[this.currentPageId].elements = elements;
        }
    },

    // --- PRVKY NA PLÁTNĚ ---
    addTextElement(text = "Klikni a piš...") {
        const $el = $(`
            <div class="canvas-element text-element" style="left:100px; top:100px;">
                <div class="delete-btn">×</div>
                <div class="content" contenteditable="true">${text}</div>
                <div class="resizer"></div>
            </div>
        `);
        this.$canvas.append($el);
        this.makeInteractable($el);
    },

    addSticker(url) {
        const $el = $(`
            <div class="canvas-element sticker-element" style="left:50px; top:50px;">
                <div class="delete-btn">×</div>
                <img src="${url}">
                <div class="resizer"></div>
            </div>
        `);
        this.$canvas.append($el);
        this.makeInteractable($el);
    },

    recreateFromData(data) {
        let $el;
        if (data.type === 'text') {
            $el = $(`
                <div class="canvas-element text-element" style="width:${data.w}px; height:${data.h}px;">
                    <div class="delete-btn">×</div>
                    <div class="content" contenteditable="true">${data.content}</div>
                    <div class="resizer"></div>
                </div>
            `);
        } else {
            $el = $(`
                <div class="canvas-element sticker-element" style="width:${data.w}px; height:${data.h}px;">
                    <div class="delete-btn">×</div>
                    <img src="${data.content}">
                    <div class="resizer"></div>
                </div>
            `);
        }
        $el.attr('data-x', data.x).attr('data-y', data.y);
        $el.css('transform', `translate(${data.x}px, ${data.y}px)`);
        this.$canvas.append($el);
        this.makeInteractable($el);
    },

    makeInteractable($el) {
        $el.find('.delete-btn').on('click', () => $el.remove());

        interact($el[0])
            .draggable({
                listeners: {
                    move: (event) => {
                        // Pohyb prvků musí brát v úvahu aktuální zoom, aby "neutíkaly" od myši
                        let x = (parseFloat($el.attr('data-x')) || 0) + (event.dx / this.zoom);
                        let y = (parseFloat($el.attr('data-y')) || 0) + (event.dy / this.zoom);
                        $el.css('transform', `translate(${x}px, ${y}px)`);
                        $el.attr('data-x', x).attr('data-y', y);
                    }
                }
            })
            .resizable({
                edges: { right: true, bottom: true },
                listeners: {
                    move: (event) => {
                        $el.css({
                            width: (event.rect.width / this.zoom) + 'px',
                            height: (event.rect.height / this.zoom) + 'px'
                        });
                    }
                }
            });
    },

    // --- GIPHY ---
    searchGiphy() {
        const query = $('#searchinpt').val();
        if (!query) return;
        fetch(`https://api.giphy.com/v1/stickers/search?api_key=${this.giphyKey}&q=${query}&limit=15`)
            .then(res => res.json())
            .then(json => {
                const html = json.data.map(img => `
                    <img src="${img.images.fixed_height_small.url}" class="giphy-res">
                `).join('');
                $('#searchresults').html(html);
                $('.giphy-res').on('click', (e) => this.addSticker($(e.target).attr('src')));
            });
    },

    addQuote() {
        const $btn = $('#qotdbtn');
        const originalText = $btn.text();

        // Změníme text tlačítka, aby uživatel věděl, že se něco děje
        $btn.text('Načítám... ⏳').prop('disabled', true);

        fetch('https://api.api-ninjas.com/v1/quotes?category=inspirational', {
            method: 'GET',
            headers: {
                'X-Api-Key': this.quotesKey,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const quoteText = `${data[0].quote}\n\n— ${data[0].author}`;
                    this.addTextElement(quoteText);
                }
            })
            .catch(error => {
                console.error('Chyba API:', error);
                // Pokud API selže (např. špatný klíč nebo limit), přidáme aspoň motivační text ručně
                this.addTextElement("„Chyba je jen příležitost začít znovu, tentokrát o něco chytřeji.“\n— Henry Ford");
            })
            .finally(() => {
                // Vrátíme tlačítko do původního stavu
                $btn.text(originalText).prop('disabled', false);
            });
    },

    // --- UKLÁDÁNÍ ---
    saveToLocalStorage() {
        this.saveCurrentToState();
        localStorage.setItem('journalPages', JSON.stringify(this.pages));
        this.showToast();
    },

    loadFromLocalStorage() {
        const saved = localStorage.getItem('journalPages');
        if (saved) {
            this.pages = JSON.parse(saved);
            this.renderPageList();
            this.switchPage(Object.keys(this.pages)[0]);
        } else {
            this.renderPageList();
        }
    },

    showToast() {
        const x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(() => { x.className = x.className.replace("show", ""); }, 2000);
    },

    clearCanvas() {
        if (confirm("Smazat celou stránku?")) {
            this.$canvas.empty();
        }
    }
};

$(document).ready(() => DigitalJournal.init());