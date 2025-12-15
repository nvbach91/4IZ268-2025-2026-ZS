
const API_BASE = 'https://www.themealdb.com/api/json/v1/1/'; 
const DAYS = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
const MEAL_TYPES = ['Snídaně', 'Oběd', 'Večeře'];


const searchInput = document.getElementById('recipe-search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const plannerGrid = document.getElementById('meal-planner-grid');
const generateListButton = document.getElementById('generate-list-button');
const shoppingListSection = document.getElementById('shopping-list-section');
const shoppingListContent = document.getElementById('shopping-list-content');

const clearListDisplayButton = document.getElementById('clear-list-display-button');
const clearFullPlanButton = document.getElementById('clear-full-plan-button');

let mealPlan = {}; 
let recipeCache = {}; 



const FRACTION_MAP = {
    '1/2': 0.5, '1/4': 0.25, '3/4': 0.75, '1/3': 0.3333, '2/3': 0.6667
};

const UNIT_MAP = {
    'g': { base_unit: 'g', factor: 1 }, 'grams': { base_unit: 'g', factor: 1 },
    'kg': { base_unit: 'g', factor: 1000 }, 'kilograms': { base_unit: 'g', factor: 1000 }, 'oz': { base_unit: 'g', factor: 28.35 }, 

    'ml': { base_unit: 'ml', factor: 1 }, 'mls': { base_unit: 'ml', factor: 1 },
    'l': { base_unit: 'ml', factor: 1000 }, 'litre': { base_unit: 'ml', factor: 1000 },
    'cup': { base_unit: 'ml', factor: 237 }, 'cups': { base_unit: 'ml', factor: 237 },
    'tbsp': { base_unit: 'ml', factor: 15 }, 'tsp': { base_unit: 'ml', factor: 5 }, 'fl oz': { base_unit: 'ml', factor: 30 },

    'piece': { base_unit: 'ks', factor: 1 }, 'unit': { base_unit: 'ks', factor: 1 },
    'pinch': { base_unit: 'nesčítatelná', factor: 0 }, 
    'dash': { base_unit: 'nesčítatelná', factor: 0 }, 
    'sprig': { base_unit: 'nesčítatelná', factor: 0 }, 
};

const CATEGORIES = {
    'chicken': 'Maso a Ryby', 'beef': 'Maso a Ryby', 'fish': 'Maso a Ryby', 'pork': 'Maso a Ryby',
    'milk': 'Mléčné výrobky', 'cheese': 'Mléčné výrobky', 'butter': 'Mléčné výrobky', 'cream': 'Mléčné výrobky', 'yoghurt': 'Mléčné výrobky',
    'onion': 'Ovoce a Zelenina', 'tomato': 'Ovoce a Zelenina', 'potato': 'Ovoce a Zelenina', 'apple': 'Ovoce a Zelenina', 'garlic': 'Ovoce a Zelenina', 'carrot': 'Ovoce a Zelenina',
    'flour': 'Pečivo a Obiloviny', 'sugar': 'Pečivo a Obiloviny', 'rice': 'Pečivo a Obiloviny', 'pasta': 'Pečivo a Obiloviny', 'bread': 'Pečivo a Obiloviny',
    'salt': 'Koření a Dochucovadla', 'pepper': 'Koření a Dochucovadla', 'oil': 'Koření a Dochucovadla', 'vinegar': 'Koření a Dochucovadla', 'sauce': 'Koření a Dochucovadla',
    'egg': 'Různé/Ostatní',
    'default': 'Různé/Ostatní'
};



function parseIngredientAmount(measure) {
    if (!measure) return { quantity: 0, unit: '' };

    measure = measure.toLowerCase().trim();
    let quantity = 0;
    let unit = '';

    const parts = measure.split(/\s+/).filter(p => p.trim() !== '');

    let quantityStr = '';
    let unitIndex = -1;
    
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        
        if (i < parts.length - 1 && /^\d+$/.test(part) && FRACTION_MAP[parts[i+1]]) {
            quantity = parseFloat(part) + FRACTION_MAP[parts[i+1]];
            unitIndex = i + 2;
            break;
        } 
        else if (/^\d+[\/\.]?\d*$/.test(part) || FRACTION_MAP[part]) {
            quantityStr += part;
            unitIndex = i + 1;
        } 
        else if (!/^\d+[\/\.]?\d*$/.test(part)) {
            unitIndex = i;
            break;
        }
    }

    if (quantity === 0 && quantityStr) {
        if (FRACTION_MAP[quantityStr]) {
            quantity = FRACTION_MAP[quantityStr];
        } else {
            quantity = parseFloat(quantityStr);
        }
    }

    if (unitIndex !== -1) {
        unit = parts.slice(unitIndex).join(' ').replace(/[^a-z]/g, '');
    }
    
    if (quantity === 0 && unit) {
        let unitMapping = UNIT_MAP[unit.replace(/s$/, '')];
        if (unitMapping && unitMapping.factor > 0) {
             quantity = 1;
        }
    }
    
    if (unit) {
        let unitMapping = UNIT_MAP[unit.replace(/s$/, '')];
        if (unitMapping && unitMapping.factor === 0) {
            return { quantity: 0, unit: 'nesčítatelná' };
        }
    }

    return { quantity: quantity || 0, unit: unit.replace(/[^a-z]/g, '') }; 
}

function normalizeAmount(quantity, unit) {
    const unitLower = unit.toLowerCase();
    
    let unitMapping = UNIT_MAP[unitLower];
    if (!unitMapping) {
        unitMapping = UNIT_MAP[unitLower.replace(/s$/, '')];
    }

    if (unitMapping && unitMapping.factor > 0) {
        return {
            normalizedQuantity: quantity * unitMapping.factor,
            baseUnit: unitMapping.base_unit
        };
    }

    return {
        normalizedQuantity: quantity,
        baseUnit: unitLower || 'ks' 
    };
}

function formatNormalizedQuantity(amount, baseUnit) {
    if (baseUnit === 'g' && amount >= 1000) {
        return `${(amount / 1000).toFixed(2).replace(/\.00$/, '')} kg`;
    }
    if (baseUnit === 'ml' && amount >= 1000) {
        return `${(amount / 1000).toFixed(2).replace(/\.00$/, '')} l`;
    }
    if (baseUnit === 'ks') {
        return `${Math.round(amount)} ks`;
    }
    
    if (amount % 1 !== 0) {
        amount = amount.toFixed(2).replace(/\.00$/, '');
    }

    return `${amount} ${baseUnit}`;
}

function categorizeIngredient(ingredientName) {
    const lowerName = ingredientName.toLowerCase();
    for (const keyword in CATEGORIES) {
        if (lowerName.includes(keyword)) {
            return CATEGORIES[keyword];
        }
    }
    return CATEGORIES['default'];
}



async function searchRecipes(query) {
    if (!query) return;

    searchResults.innerHTML = 'Načítám...';
    try {
        const url = `${API_BASE}search.php?s=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP chyba, status: ${response.status}`);
        }

        const data = await response.json();
        
        searchResults.innerHTML = ''; 

        if (data.meals) {
            data.meals.slice(0, 10).forEach(meal => { 
                renderRecipeCard(meal);
            });
        } else {
            searchResults.innerHTML = '<p>Žádné recepty nenalezeny.</p>';
        }
    } catch (error) {
        console.error('Chyba při vyhledávání receptů:', error);
        searchResults.innerHTML = `<p>Chyba při komunikaci s API. Zkuste prosím jiné slovo nebo zkontrolujte síťové připojení. (Technický detail: ${error.message || 'Chyba sítě'})</p>`;
    }
}

async function fetchRecipeDetails(id) {
    if (recipeCache[id]) {
        return recipeCache[id];
    }

    try {
        const response = await fetch(`${API_BASE}lookup.php?i=${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP chyba při načítání detailů, status: ${response.status}`);
        }
        
        const data = await response.json();
        const meal = data.meals ? data.meals[0] : null;

        if (meal) {
            recipeCache[id] = meal;
            saveRecipeCache();
            return meal;
        }
        return null;
    } catch (error) {
        console.error(`Chyba při načítání detailů receptu ${id}:`, error);
        return null;
    }
}



function renderRecipeCard(meal) {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.setAttribute('data-recipe-id', meal.idMeal);
    card.setAttribute('data-recipe-name', meal.strMeal);
    card.setAttribute('draggable', true); 

    card.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h4>${meal.strMeal}</h4>
    `;
    
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('click', () => {
        showRecipeDetail(meal.idMeal);
    });

    fetchRecipeDetails(meal.idMeal); 
    searchResults.appendChild(card);
}

function renderPlannerGrid() {
    plannerGrid.innerHTML = '';

    const headers = ['', ...MEAL_TYPES];
    headers.forEach(text => {
        const header = document.createElement('div');
        header.classList.add('grid-header');
        header.textContent = text;
        plannerGrid.appendChild(header);
    });

    DAYS.forEach(day => {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = day;
        plannerGrid.appendChild(dayCell);

        MEAL_TYPES.forEach(mealType => {
            const slotKey = `${day}-${mealType}`;
            const slot = document.createElement('div');
            slot.classList.add('meal-slot');
            slot.setAttribute('data-slot-key', slotKey);
            
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('dragleave', handleDragLeave);
            slot.addEventListener('drop', handleDrop);

            if (mealPlan[slotKey]) {
                renderPlannedRecipe(slot, mealPlan[slotKey].id, mealPlan[slotKey].name);
            }

            plannerGrid.appendChild(slot);
        });
    });
}

function renderPlannedRecipe(slot, id, name) {
    slot.innerHTML = '';
    
    const recipeDiv = document.createElement('div');
    recipeDiv.classList.add('planned-recipe');
    recipeDiv.setAttribute('data-recipe-id', id);
    recipeDiv.setAttribute('data-recipe-name', name);
    recipeDiv.textContent = name;
    
    recipeDiv.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') { 
             showRecipeDetail(id);
        }
        e.stopPropagation(); 
    });
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.style.cssText = 'background:none; border:none; color:red; margin-left:5px; cursor:pointer; float:right;';
    removeBtn.addEventListener('click', (e) => {
        const slotKey = slot.getAttribute('data-slot-key');
        delete mealPlan[slotKey];
        saveMealPlan();
        slot.innerHTML = '';
        e.stopPropagation(); 
    });
    
    recipeDiv.appendChild(removeBtn);
    slot.appendChild(recipeDiv);
}




function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', JSON.stringify({
        id: e.target.getAttribute('data-recipe-id'),
        name: e.target.getAttribute('data-recipe-name')
    }));
    e.target.style.opacity = '0.5';
    e.stopPropagation();
}

function handleDragOver(e) {
    e.preventDefault(); 
    e.currentTarget.style.backgroundColor = '#e0f7fa';
}

function handleDragLeave(e) {
    e.currentTarget.style.backgroundColor = '#f0f0f0';
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '#f0f0f0';

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const slotKey = e.currentTarget.getAttribute('data-slot-key');

    mealPlan[slotKey] = { id: data.id, name: data.name };
    saveMealPlan();

    renderPlannedRecipe(e.currentTarget, data.id, data.name);
}



async function showRecipeDetail(id) {
    const recipe = await fetchRecipeDetails(id);
    if (!recipe) {
        alert('Detaily receptu se nepodařilo načíst.');
        return;
    }

    let ingredientsList = '<ul>';
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
            ingredientsList += `<li>${measure.trim()} ${ingredient.trim()}</li>`;
        }
    }
    ingredientsList += '</ul>';

    const detailContainer = document.createElement('div');
    detailContainer.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0, 0, 0, 0.8); z-index: 1000; overflow-y: auto;
        display: flex; justify-content: center; align-items: flex-start;
        padding: 50px 20px;
    `;

    const contentBox = document.createElement('div');
    contentBox.style.cssText = `
        background: white; padding: 30px; border-radius: 10px; max-width: 900px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); position: relative;
    `;
    
    contentBox.innerHTML = `
        <button id="close-detail-btn" style="position: absolute; top: 10px; right: 10px; font-size: 20px; background: none; border: none; cursor: pointer;">✖</button>
        <h2>${recipe.strMeal}</h2>
        <div style="display:flex; gap: 20px; margin-bottom: 20px;">
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px;">
            <div>
                <h3>Ingredience:</h3>
                ${ingredientsList}
            </div>
        </div>
        <h3>Instrukce:</h3>
        <p>${recipe.strInstructions}</p>
        ${recipe.strYoutube ? `<p><a href="${recipe.strYoutube}" target="_blank">Video recept</a></p>` : ''}
    `;

    detailContainer.appendChild(contentBox);
    document.body.appendChild(detailContainer);

    document.getElementById('close-detail-btn').addEventListener('click', () => {
        document.body.removeChild(detailContainer);
    });
    
    detailContainer.addEventListener('click', (e) => {
        if (e.target === detailContainer) {
            document.body.removeChild(detailContainer);
        }
    });
}




function saveMealPlan() {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
}

function loadMealPlan() {
    const savedPlan = localStorage.getItem('mealPlan');
    if (savedPlan) {
        mealPlan = JSON.parse(savedPlan);
    }
    const savedCache = localStorage.getItem('recipeCache');
    if (savedCache) {
        recipeCache = JSON.parse(savedCache);
    }
}

function saveRecipeCache() {
    localStorage.setItem('recipeCache', JSON.stringify(recipeCache));
}



async function generateShoppingList() {
    const activeRecipeIds = Object.values(mealPlan).map(item => item.id);
    const uniqueRecipeIds = [...new Set(activeRecipeIds)];
    
    if (uniqueRecipeIds.length === 0) {
        shoppingListContent.innerHTML = '<p>Nejprve přetáhněte recepty do plánu.</p>';
        shoppingListSection.style.display = 'block';
        return;
    }

    shoppingListContent.innerHTML = '<p>Generuji seznam (probíhá normalizace jednotek)...</p>';
    
    const consolidatedList = {}; 

    for (const id of uniqueRecipeIds) {
        const details = await fetchRecipeDetails(id); 

        if (details) {
            for (let i = 1; i <= 20; i++) {
                const ingredient = details[`strIngredient${i}`];
                const measure = details[`strMeasure${i}`];

                if (ingredient && ingredient.trim() !== '') {
                    const cleanName = ingredient.trim();
                    const { quantity, unit } = parseIngredientAmount(measure);
                    const { normalizedQuantity, baseUnit } = normalizeAmount(quantity, unit);
                    
                    if (baseUnit === 'nesčítatelná') continue; 

                    if (!consolidatedList[cleanName]) {
                        consolidatedList[cleanName] = {};
                    }
                    
                    consolidatedList[cleanName][baseUnit] = 
                        (consolidatedList[cleanName][baseUnit] || 0) + normalizedQuantity;
                }
            }
        }
    }

    const categorizedList = {};

    for (const name in consolidatedList) {
        const category = categorizeIngredient(name);
        
        const amounts = [];
        for (const baseUnit in consolidatedList[name]) {
            const totalAmount = consolidatedList[name][baseUnit];
            if (totalAmount > 0.001 || baseUnit === 'ks') {
                 amounts.push(formatNormalizedQuantity(totalAmount, baseUnit));
            }
        }
        
        if (amounts.length === 0) continue; 

        if (!categorizedList[category]) {
            categorizedList[category] = [];
        }
        
        categorizedList[category].push(`<li>${name} <strong>(${amounts.join(', ')})</strong></li>`);
    }

    shoppingListContent.innerHTML = '';
    for (const category in categorizedList) {
        const ul = document.createElement('ul');
        ul.innerHTML = categorizedList[category].join('');
        
        const h3 = document.createElement('h3');
        h3.textContent = category;
        
        shoppingListContent.appendChild(h3);
        shoppingListContent.appendChild(ul);
    }

    shoppingListSection.style.display = 'block';
}



function setupEventListeners() {
    searchButton.addEventListener('click', () => {
        searchRecipes(searchInput.value.trim());
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchRecipes(searchInput.value.trim());
        }
    });


    generateListButton.addEventListener('click', generateShoppingList);
    
    if (clearListDisplayButton) {
        clearListDisplayButton.addEventListener('click', () => {
            shoppingListContent.innerHTML = '';
            shoppingListSection.style.display = 'none';
        });
    }

    if (clearFullPlanButton) {
        clearFullPlanButton.addEventListener('click', () => {
            if (confirm('Opravdu chcete vymazat celý plán a uložené recepty? Tato akce je nevratná.')) {
                localStorage.removeItem('mealPlan');
                localStorage.removeItem('recipeCache');
                mealPlan = {};
                recipeCache = {};
                renderPlannerGrid();
                shoppingListContent.innerHTML = '';
                shoppingListSection.style.display = 'none';
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadMealPlan();
    renderPlannerGrid();
    setupEventListeners();
});