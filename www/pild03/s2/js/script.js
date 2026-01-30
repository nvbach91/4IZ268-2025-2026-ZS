/**
 * 4IZ268 - MealPlanner Application
 * Namespace: MealApp 
 */

const MealApp = {
    API_BASE: 'https://www.themealdb.com/api/json/v1/1/',
    DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    MEAL_TYPES: ['Breakfast', 'Lunch', 'Dinner'],
    UNIT_MAP: {
        'g': 'g', 'gram': 'g', 'grams': 'g',
        'kg': 'kg', 'kilogram': 'kg',
        'ml': 'ml', 'l': 'l', 'liter': 'l',
        'cup': 'cup', 'cups': 'cup',
        'tbsp': 'tbsp', 'tbs': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
        'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
        'pcs': 'pcs', 'piece': 'pcs', 'unit': 'pcs', 'egg': 'pcs', 'eggs': 'pcs'
    },

    state: {
        mealPlan: {}
    },

    ui: {},

    init() {
        this.cacheElements();
        this.loadFromStorage();
        this.renderGrid();
        this.attachEventListeners();
    },

    cacheElements() {
        this.ui.$results = $('#search-results');
        this.ui.$loader = $('#loader');
        this.ui.$searchInput = $('#recipe-search-input');
        this.ui.$grid = $('#meal-planner-grid');
        this.ui.$shoppingListSection = $('#shopping-list-section');
        this.ui.$shoppingListContent = $('#shopping-list-content');
    },


    getRecipeDetails(id) {
        return $.getJSON(`${this.API_BASE}lookup.php?i=${id}`)
            .then(data => (data.meals ? data.meals[0] : null));
    },

    searchRecipes(query) {
        if (!query || query.trim() === "") return;

        this.toggleLoader(true);
        this.ui.$results.empty();

        const q = encodeURIComponent(query.trim().toLowerCase());


        $.when(
            $.getJSON(`${this.API_BASE}search.php?s=${q}`),
            $.getJSON(`${this.API_BASE}filter.php?c=${q}`),
            $.getJSON(`${this.API_BASE}filter.php?a=${q}`)
        ).done((resName, resCat, resArea) => {
            const combinedMeals = new Map();


            [resName[0].meals, resCat[0].meals, resArea[0].meals].forEach(mealArray => {
                if (mealArray) {
                    mealArray.forEach(meal => {
                        if (!combinedMeals.has(meal.idMeal)) combinedMeals.set(meal.idMeal, meal);
                    });
                }
            });

            const finalMeals = Array.from(combinedMeals.values());

            if (finalMeals.length > 0) {
                this.renderSearchResults(finalMeals);
                this.toggleLoader(false);
            } else {
                $.getJSON(`${this.API_BASE}filter.php?i=${q}`).done(ingData => {
                    if (ingData.meals) {
                        this.renderSearchResults(ingData.meals);
                    } else {
                        this.ui.$results.html('<p>No recipes found.</p>');
                    }
                    this.toggleLoader(false);
                });
            }
        }).fail(() => {
            this.showNotification("Search failed.", "error");
            this.toggleLoader(false);
        });
    },

    renderSearchResults(meals) {
        let html = '';


        meals.forEach(meal => {
            html += `
            <div class="recipe-card" draggable="true" data-id="${meal.idMeal}" data-name="${meal.strMeal}">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h4>${meal.strMeal}</h4>
            </div>
        `;
        });

        this.ui.$results.html(html);


        this.ui.$results.find('.recipe-card').each((index, el) => {
            const $card = $(el);
            $card.on('dragstart', (e) => this.handleDragStart(e));
            $card.on('click', () => this.showRecipeDetail($card.data('id')));
        });
    },

    showRecipeDetail(id) {
        $('.recipe-detail-overlay').remove();
        this.toggleLoader(true);

        this.getRecipeDetails(id).then(recipe => {
            this.toggleLoader(false);
            if (!recipe) return;

            let ingredientsHtml = '';
            for (let i = 1; i <= 20; i++) {
                const ing = recipe[`strIngredient${i}`];
                const msr = recipe[`strMeasure${i}`];
                if (ing && ing.trim()) {
                    ingredientsHtml += `
                    <div class="ingredient-item">
                        <div class="ing-name">${ing.charAt(0).toUpperCase() + ing.slice(1)}</div>
                        <div class="ing-measure">${msr}</div>
                    </div>`;
                }
            }

            const formattedInstructions = recipe.strInstructions
                .split('\n')
                .filter(para => para.trim() !== '')
                .map(para => `<p>${para.trim()}</p>`)
                .join('');


            let dayOptions = this.DAYS.map(d => `<option value="${d}">${d}</option>`).join('');
            let typeOptions = this.MEAL_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');


            const detailHtml = `
            <div class="recipe-detail-overlay">
                <div class="recipe-detail-modal">
                    <button class="close-detail-btn">&times;</button>
                    
                    <div class="recipe-detail-sidebar">
                        <h3>Ingredients</h3>
                        <div class="ingredients-list">${ingredientsHtml}</div>
                    </div>

                    <div class="recipe-detail-main">
                        <div class="recipe-meta">
                            <span class="badge">${recipe.strCategory}</span>
                            <span class="badge">${recipe.strArea}</span>
                        </div>
                        <h2>${recipe.strMeal}</h2>
                        <div class="recipe-image-container">
                            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                        </div>
                        <h3>Preparation Method</h3>
                        <div class="instructions-content">${formattedInstructions}</div>

                        <div class="add-to-plan-footer">
                            <h4>Add this recipe to your Weekly Plan</h4>
                            <div class="plan-controls-row">
                                <label for="select-day">Day:</label>
                                <select id="select-day">${dayOptions}</select>
                                
                                <label for="select-type">Meal:</label>
                                <select id="select-type">${typeOptions}</select>
                                
                                <button id="add-from-detail-btn">Add to Calendar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

            const $detail = $(detailHtml).hide().appendTo('body').fadeIn(300);


            $detail.find('#add-from-detail-btn').on('click', () => {
                const day = $detail.find('#select-day').val();
                const type = $detail.find('#select-type').val();
                const slotKey = `${day}-${type}`;


                const performSave = () => {
                    this.state.mealPlan[slotKey] = {
                        id: recipe.idMeal,
                        name: recipe.strMeal
                    };

                    this.saveToStorage();
                    this.renderGrid();
                    this.showNotification(`Added to ${day} ${type}`, "success");


                    $detail.fadeOut(200, () => $detail.remove());
                };


                if (this.state.mealPlan[slotKey]) {
                    Swal.fire({
                        title: 'Slot occupied!',
                        text: `You already have "${this.state.mealPlan[slotKey].name}" planned. Replace it?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#00CC99',
                        cancelButtonColor: '#FF5733',
                        confirmButtonText: 'Yes, replace',
                        target: $detail[0]
                    }).then((result) => {
                        if (result.isConfirmed) {
                            performSave();
                        }
                    });
                } else {
                    performSave();
                }
            });

            const close = () => { $detail.fadeOut(200, () => $detail.remove()); };
            $detail.find('.close-detail-btn').on('click', close);
            $detail.on('click', (e) => { if (e.target === $detail[0]) close(); });
        });
    },

    renderGrid() {
        let html = '<div class="grid-header">Time</div>';
        this.DAYS.forEach(day => { html += `<div class="grid-header">${day}</div>`; });

        this.MEAL_TYPES.forEach(type => {
            html += `<div class="type-cell">${type}</div>`;
            this.DAYS.forEach(day => {
                const slotKey = `${day}-${type}`;
                html += `<div class="meal-slot" data-slot="${slotKey}"></div>`;
            });
        });

        this.ui.$grid.html(html);

        this.ui.$grid.find('.meal-slot').each((index, el) => {
            const $slot = $(el);
            const slotKey = $slot.data('slot');
            $slot.on('dragover', (e) => e.preventDefault());
            $slot.on('drop', (e) => this.handleDrop(e));

            if (this.state.mealPlan[slotKey]) {
                this.renderPlannedItem($slot, this.state.mealPlan[slotKey]);
            }
        });
    },

    renderPlannedItem($slot, item) {
        const $el = $(`
        <div class="planned-recipe" draggable="true">
            <span class="recipe-name-click">${item.name}</span>
            <button class="remove-btn">×</button>
        </div>
    `);
        $el.on('dragstart', (e) => {
            const transferData = {
                id: item.id,
                name: item.name,
                fromSlot: $slot.data('slot')
            };

            e.originalEvent.dataTransfer.setData('application/json', JSON.stringify(transferData));
        });

        $el.find('.recipe-name-click').on('click', (e) => {
            e.stopPropagation();
            this.showRecipeDetail(item.id);
        });

        $el.find('.remove-btn').on('click', (e) => {
            e.stopPropagation();
            delete this.state.mealPlan[$slot.data('slot')];
            this.saveToStorage();
            $slot.empty();
        });

        $slot.html($el);
    },

    generateList() {
    const plannedItems = Object.values(this.state.mealPlan);

    if (plannedItems.length === 0) {
        Swal.fire({
            title: 'Empty Calendar',
            text: "Please add some meals to your plan first!",
            icon: 'info',
            confirmButtonColor: '#00CC99'
        });
        return;
    }

    this.toggleLoader(true);
    const totals = {};
    let completedRequests = 0;

    plannedItems.forEach(item => {
        $.getJSON(`${this.API_BASE}lookup.php?i=${item.id}`)
            .done(data => {
                const recipe = data.meals ? data.meals[0] : null;

                if (recipe) {
                    for (let i = 1; i <= 20; i++) {
                        const name = recipe[`strIngredient${i}`];
                        const msr = recipe[`strMeasure${i}`];

                        if (name && name.trim()) {
                            const unifiedName = this.getNormalizedName(name);
                            const parsed = this.parseMeasure(msr);

                            if (!totals[unifiedName]) totals[unifiedName] = {};
                            if (!totals[unifiedName][parsed.unit]) totals[unifiedName][parsed.unit] = 0;
                            totals[unifiedName][parsed.unit] += parsed.value;
                        }
                    }
                }
            })
            .always(() => {
                completedRequests++;
                if (completedRequests === plannedItems.length) {
                    this.renderShoppingList(totals);
                    this.toggleLoader(false);
                }
            });
    });
},

    getNormalizedName(name) {
        if (!name) return "";
        let lower = name.toLowerCase().trim();
        const stopWords = ['melted', 'softened', 'cold', 'unsalted', 'salted', 'frozen', 'fresh', 'chopped', 'minced', 'large', 'small'];
        stopWords.forEach(word => {
            lower = lower.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        lower = lower.replace(/(\w+)(es|s)\b/g, '$1').trim();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    },

    parseMeasure(text) {
        if (!text) return { value: 0, unit: 'pcs' };
        const lower = text.toLowerCase().trim();
        let value = 0;
        const numMatch = lower.match(/(\d+[\/\.]?\d*)/);
        if (numMatch) {
            if (numMatch[1].includes('/')) {
                const p = numMatch[1].split('/');
                value = parseFloat(p[0]) / parseFloat(p[1]);
            } else {
                value = parseFloat(numMatch[1]);
            }
        } else { value = 1; }

        let normalizedUnit = 'untracked';
        for (const [key, val] of Object.entries(this.UNIT_MAP)) {
            if (new RegExp(`\\b${key}\\b`).test(lower)) {
                normalizedUnit = val;
                break;
            }
        }
        if (normalizedUnit === 'untracked') {
            normalizedUnit = lower.replace(/[0-9\/\.\s]/g, '') || 'pcs';
        }
        return { value: value, unit: normalizedUnit };
    },

    renderShoppingList(totals) {
        let listHtml = '<ul class="shopping-list-ul">';
        Object.entries(totals).sort().forEach(([name, units]) => {
            const measureStrings = Object.entries(units).map(([unit, amount]) => {
                if (amount <= 0) return null;
                let displayAmount = amount;
                let displayUnit = unit;

                if (unit === 'g' && amount >= 1000) {
                    displayAmount = (amount / 1000).toFixed(2).replace(/\.?0+$/, '');
                    displayUnit = 'kg';
                } else {
                    displayAmount = Math.round(amount * 100) / 100;
                }
                return `${displayAmount} ${displayUnit}`;
            }).filter(s => s !== null);

            if (measureStrings.length > 0) {
                listHtml += `
                    <li class="shopping-item-li">
                        <span class="shopping-item-name">${name}</span>
                        <span class="shopping-item-val">${measureStrings.join(', ')}</span>
                    </li>`;
            }
        });
        listHtml += '</ul>';
        this.ui.$shoppingListContent.html(listHtml);
        this.ui.$shoppingListSection.fadeIn().removeClass('hidden');
    },

    attachEventListeners() {
        $('#search-button').on('click', () => this.searchRecipes(this.ui.$searchInput.val()));
        this.ui.$searchInput.on('keypress', (e) => { if (e.key === 'Enter') this.searchRecipes($(e.target).val()); });
        $('#generate-list-btn').on('click', () => this.generateList());
        $('#hide-list-btn').on('click', () => this.ui.$shoppingListSection.hide());

        $('#clear-plan-btn').on('click', () => {
            Swal.fire({
                title: 'Clear full plan?',
                text: "This will remove all scheduled meals!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#00CC99',
                cancelButtonColor: '#FF5733',
                confirmButtonText: 'Yes, clear it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.state.mealPlan = {};
                    this.saveToStorage();
                    this.renderGrid();
                }
            });
        });
    },

    handleDragStart(e) {
        const $target = $(e.currentTarget);
        e.originalEvent.dataTransfer.setData('application/json', JSON.stringify({ id: $target.data('id'), name: $target.data('name') }));
    },

    handleDrop(e) {
        e.preventDefault();
        const data = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
        const $targetSlot = $(e.currentTarget);
        const targetSlotKey = $targetSlot.data('slot');

        if (this.state.mealPlan[targetSlotKey]) {
            this.showNotification("This slot is already occupied!", "warning");
            return;
        }
        if (data.fromSlot) {
            delete this.state.mealPlan[data.fromSlot];
            $(`[data-slot="${data.fromSlot}"]`).empty();
        }
        this.state.mealPlan[targetSlotKey] = { id: data.id, name: data.name };
        this.saveToStorage();
        this.renderPlannedItem($targetSlot, this.state.mealPlan[targetSlotKey]);
    },

    toggleLoader(show) { this.ui.$loader.toggleClass('hidden', !show); },
    saveToStorage() { localStorage.setItem('mealPlanner_v2', JSON.stringify(this.state)); },
    loadFromStorage() { const saved = localStorage.getItem('mealPlanner_v2'); if (saved) this.state = JSON.parse(saved); },
    showNotification(msg, type) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: msg,
            showConfirmButton: false,
            timer: 3000
        });
    }
};

$(document).ready(() => MealApp.init());