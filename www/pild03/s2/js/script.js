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
        mealPlan: {},
        recipeCache: {}
    },

    init() {
        this.loadFromStorage();
        this.renderGrid();
        this.attachEventListeners();
    },

   async searchRecipes(query) {
        if (!query || query.trim() === "") return;
        
        const $results = $('#search-results');
        this.toggleLoader(true);
        $results.empty();

        const q = query.trim().toLowerCase();

        try {
            const [nameRes, catRes, areaRes] = await Promise.all([
                fetch(`${this.API_BASE}search.php?s=${encodeURIComponent(q)}`),
                fetch(`${this.API_BASE}filter.php?c=${encodeURIComponent(q)}`),
                fetch(`${this.API_BASE}filter.php?a=${encodeURIComponent(q)}`)
            ]);

            const nameData = await nameRes.json();
            const catData = await catRes.json();
            const areaData = await areaRes.json();

            const combinedMeals = new Map();

            if (nameData.meals) {
                nameData.meals.forEach(meal => combinedMeals.set(meal.idMeal, meal));
            }

            if (catData.meals) {
                catData.meals.forEach(meal => {
                    if (!combinedMeals.has(meal.idMeal)) combinedMeals.set(meal.idMeal, meal);
                });
            }

            if (areaData.meals) {
                areaData.meals.forEach(meal => {
                    if (!combinedMeals.has(meal.idMeal)) combinedMeals.set(meal.idMeal, meal);
                });
            }

            const finalMeals = Array.from(combinedMeals.values());

            if (finalMeals.length > 0) {
                this.renderSearchResults(finalMeals);
            } else {
                const ingRes = await fetch(`${this.API_BASE}filter.php?i=${encodeURIComponent(q)}`);
                const ingData = await ingRes.json();
                
                if (ingData.meals) {
                    this.renderSearchResults(ingData.meals);
                } else {
                    $results.html('<p>No recipes found. Try searching for "Chicken", "Italian", or "Seafood".</p>');
                }
            }
        } catch (error) {
            this.showNotification("Search failed. Please check your connection.", "error");
        } finally {
            this.toggleLoader(false);
        }
    },

    getNormalizedName(name) {
        if (!name) return "";
        const lower = name.toLowerCase().trim();
        if (lower.includes('egg')) return 'Eggs';
        if (lower.includes('onion')) return 'Onion';
        if (lower.includes('garlic')) return 'Garlic';
        if (lower.includes('chicken')) return 'Chicken';
        if (lower.includes('flour')) return 'Flour';
        if (lower.includes('sugar')) return 'Sugar';
        return name.charAt(0).toUpperCase() + name.slice(1);
    },

    renderSearchResults(meals) {
        const $results = $('#search-results');
        $results.empty();
        meals.slice(0, 10).forEach(meal => {
            const $card = $(`
                <div class="recipe-card" draggable="true" data-id="${meal.idMeal}" data-name="${meal.strMeal}">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <h4>${meal.strMeal}</h4>
                </div>
            `);
            $card.on('dragstart', (e) => this.handleDragStart(e));
            $card.on('click', () => this.showRecipeDetail(meal.idMeal));
            $results.append($card);
        });
    },

async showRecipeDetail(id) {
        $('.recipe-detail-overlay').remove();

        this.toggleLoader(true);
        const recipe = await this.getRecipeDetails(id);
        this.toggleLoader(false);

        if (!recipe) return;

        let ingredientsHtml = '';
        for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            const msr = recipe[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredientsHtml += `
                    <div style="background: white; padding: 15px; margin-bottom: 12px; border-radius: 10px; border-left: 5px solid #00CC99; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-weight: bold; color: #333; font-size: 17px; margin-bottom: 4px;">${ing.charAt(0).toUpperCase() + ing.slice(1)}</div>
                        <div style="color: #0088A8; font-size: 15px; font-weight: 600;">${msr}</div>
                    </div>`;
            }
        }

        const formattedInstructions = recipe.strInstructions
            .split('\n')
            .filter(para => para.trim() !== '') 
            .map(para => `<p style="margin-bottom: 20px;">${para.trim()}</p>`)
            .join('');

        const detailContainer = document.createElement('div');
        detailContainer.className = 'recipe-detail-overlay';
        detailContainer.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.8); z-index: 2500; display: flex; 
            justify-content: center; align-items: center; padding: 20px; backdrop-filter: blur(8px);
        `;

        detailContainer.innerHTML = `
            <div style="background: white; border-radius: 25px; max-width: 1200px; width: 95%; height: 90vh; display: flex; overflow: hidden; position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.6); animation: fadeIn 0.3s ease;">
                <button class="close-detail-btn" style="position: absolute; top: 20px; right: 25px; font-size: 35px; background: white; width: 50px; height: 50px; border-radius: 50%; border: none; cursor: pointer; z-index: 20; color: #444; box-shadow: 0 4px 15px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: 0.2s;">&times;</button>
                
                <div style="width: 30%; background: #f4f7f9; padding: 45px 30px; border-right: 1px solid #e1e8ed; overflow-y: auto;">
                    <h3 style="color: #0088A8; font-size: 24px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #00CC99; padding-bottom: 10px;">
                        Ingredients
                    </h3>
                    <div style="display: flex; flex-direction: column;">
                        ${ingredientsHtml}
                    </div>
                </div>

                <div style="width: 70%; padding: 50px 60px; overflow-y: auto; scroll-behavior: smooth;">
                    <h2 style="margin-top: 0; color: #222; font-size: 38px; font-weight: 700; line-height: 1.2; margin-bottom: 25px;">${recipe.strMeal}</h2>
                    
                    <div style="margin-bottom: 40px;">
                        <img src="${recipe.strMealThumb}" style="width: 100%; height: 450px; object-fit: cover; border-radius: 20px; box-shadow: 0 12px 30px rgba(0,0,0,0.2);">
                    </div>

                    <h3 style="color: #0088A8; font-size: 26px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                         Preparation Method
                    </h3>
                    
                    <div style="line-height: 1.9; color: #333; font-size: 18px; text-align: justify; background: #fff; border-radius: 15px;">
                        ${formattedInstructions}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailContainer);

        const close = () => {
            $(detailContainer).fadeOut(200, function() { 
                $(this).remove(); 
            });
        };

        $(detailContainer).find('.close-detail-btn').on('click', close);
        $(detailContainer).on('click', (e) => { if (e.target === detailContainer) close(); });
    },

    renderGrid() {
        const $grid = $('#meal-planner-grid');
        $grid.empty();
        $grid.append('<div class="grid-header">Time</div>');
        this.DAYS.forEach(day => $grid.append(`<div class="grid-header">${day}</div>`));

        this.MEAL_TYPES.forEach(type => {
            $grid.append(`<div class="type-cell">${type}</div>`);
            this.DAYS.forEach(day => {
                const slotKey = `${day}-${type}`;
                const $slot = $(`<div class="meal-slot" data-slot="${slotKey}"></div>`);
                $slot.on('dragover', (e) => e.preventDefault());
                $slot.on('drop', (e) => this.handleDrop(e));
                if (this.state.mealPlan[slotKey]) this.renderPlannedItem($slot, this.state.mealPlan[slotKey]);
                $grid.append($slot);
            });
        });
    },

    renderPlannedItem($slot, item) {
        const $el = $(`
            <div class="planned-recipe" style="cursor: pointer;">
                <span class="recipe-name-click">${item.name}</span>
                <button class="remove-btn">×</button>
            </div>
        `);
        
    
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


    async generateList() {
        const recipeIds = [...new Set(Object.values(this.state.mealPlan).map(item => item.id))];
        if (recipeIds.length === 0) return;

        this.toggleLoader(true);
        const totals = {}; 

        for (const id of recipeIds) {
            const recipe = await this.getRecipeDetails(id);
            if (!recipe) continue;

            let recipeIngredients = [];

            for (let i = 1; i <= 20; i++) {
                const name = recipe[`strIngredient${i}`];
                const msr = recipe[`strMeasure${i}`];

                if (name && name.trim()) {
                    const unifiedName = this.getNormalizedName(name);
                    const parsed = this.parseMeasure(msr);
                    recipeIngredients.push({ name: unifiedName, value: parsed.value, unit: parsed.unit });
                }
            }

            let whites = recipeIngredients.find(ing => ing.name === 'Egg Whites' && ing.unit === 'pcs');
            let yolks = recipeIngredients.find(ing => ing.name === 'Egg Yolks' && ing.unit === 'pcs');

            if (whites && yolks) {
                let wholeEggsCount = Math.max(whites.value, yolks.value);
                
                recipeIngredients.push({ name: 'Eggs', value: wholeEggsCount, unit: 'pcs' });
                
                whites.value -= wholeEggsCount;
                yolks.value -= wholeEggsCount;
            }

            recipeIngredients.forEach(ing => {
                if (ing.value <= 0) return; 
                
                if (!totals[ing.name]) totals[ing.name] = {};
                if (!totals[ing.name][ing.unit]) totals[ing.name][ing.unit] = 0;
                totals[ing.name][ing.unit] += ing.value;
            });
        }

        this.renderShoppingList(totals);
        this.toggleLoader(false);
    },

    getNormalizedName(name) {
        if (!name) return "";
        let lower = name.toLowerCase().trim();
        const stopWords = ['melted', 'softened', 'cold', 'unsalted', 'salted', 'frozen', 'fresh', 'chopped', 'minced', 'large', 'small', 'tinned', 'canned'];
        stopWords.forEach(word => {
            lower = lower.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });

        lower = lower.replace(/(\w+)(es|s)\b/g, '$1').trim();

        if (lower.includes('passata') || lower.includes('puree') || (lower.includes('tomato') && lower.includes('sauce'))) {
            return 'Tomato Puree/Passata';
        }


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
        const $content = $('#shopping-list-content');
        let listHtml = '<ul style="list-style:none; padding:0;">';
        
        Object.entries(totals).sort().forEach(([name, units]) => {
            const measureStrings = Object.entries(units).map(([unit, amount]) => {
                if (amount <= 0) return null;
                let displayAmount = amount;
                let displayUnit = unit;

                if (unit === 'g' && amount >= 1000) {
                    displayAmount = (amount / 1000).toFixed(2).replace(/\.?0+$/, '');
                    displayUnit = 'kg';
                } else if (unit === 'ml' && amount >= 1000) {
                    displayAmount = (amount / 1000).toFixed(2).replace(/\.?0+$/, '');
                    displayUnit = 'l';
                } else if (unit === 'pcs') {
                    displayAmount = Math.ceil(amount);
                } else {
                    displayAmount = Math.round(amount * 100) / 100;
                }
                return `${displayAmount} ${displayUnit}`;
            }).filter(s => s !== null);

            if (measureStrings.length > 0) {
                listHtml += `
                    <li style="padding:12px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; font-size:18px;">
                        <span style="font-weight:bold;">${name}</span>
                        <span style="color:#0088A8;">${measureStrings.join(', ')}</span>
                    </li>`;
            }
        });

        listHtml += '</ul>';
        $content.html(listHtml);
        $('#shopping-list-section').fadeIn().removeClass('hidden');
    },

   
    async getRecipeDetails(id) {
        if (this.state.recipeCache[id]) return this.state.recipeCache[id];
        const response = await fetch(`${this.API_BASE}lookup.php?i=${id}`);
        const data = await response.json();
        if (data.meals) {
            this.state.recipeCache[id] = data.meals[0];
            this.saveToStorage();
            return data.meals[0];
        }
        return null;
    },

    attachEventListeners() {
        $('#search-button').on('click', () => this.searchRecipes($('#recipe-search-input').val()));
        $('#recipe-search-input').on('keypress', (e) => { if(e.key === 'Enter') this.searchRecipes($(e.target).val()); });
        $('#generate-list-btn').on('click', () => this.generateList());
        $('#hide-list-btn').on('click', () => $('#shopping-list-section').hide());
        $('#clear-plan-btn').on('click', () => { if(confirm("Clear plan?")) { this.state.mealPlan = {}; this.saveToStorage(); this.renderGrid(); } });
    },

    handleDragStart(e) {
        const $target = $(e.currentTarget);
        e.originalEvent.dataTransfer.setData('application/json', JSON.stringify({id: $target.data('id'), name: $target.data('name')}));
    },

    handleDrop(e) {
        e.preventDefault();
        const data = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
        const slotKey = $(e.currentTarget).data('slot');
        this.state.mealPlan[slotKey] = data;
        this.saveToStorage();
        this.renderPlannedItem($(e.currentTarget), data);
    },

    toggleLoader(show) { $('#loader').toggleClass('hidden', !show); },
    saveToStorage() { localStorage.setItem('mealPlanner_v2', JSON.stringify(this.state)); },
    loadFromStorage() { const saved = localStorage.getItem('mealPlanner_v2'); if (saved) this.state = JSON.parse(saved); },
    showNotification(msg, type) {
        const $toast = $(`<div class="toast toast-${type}">${msg}</div>`);
        $('body').append($toast);
        setTimeout(() => $toast.fadeOut(() => $toast.remove()), 3000);
    }
};

$(document).ready(() => MealApp.init());