const API_KEY = '1762f536df804c969589567dfc13fc5c';
const API_BASE = 'https://api.spoonacular.com';

let ingredients = [];
let shoppingList = {}; 
let favorites = [];

const lookupBtn = document.getElementById('lookupBtn');
const ingredientsContainer = document.getElementById('ingredientsContainer');
const shoppingBadge = document.getElementById('shoppingBadge');
const favoritesBadge = document.getElementById('favoritesBadge');
const ingredientInput = document.getElementById('ingredientInput');
const searchSection = document.getElementById('searchSection');
const resultsSection = document.getElementById('resultsSection');
const recipesContainer = document.getElementById('recipesContainer');
const addIngredientBtn = document.getElementById('addIngredientBtn');
const backBtn = document.getElementById('backBtn');
const shoppingListBtn = document.getElementById('shoppingListBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const shoppingListModal = document.getElementById('shoppingListModal');
const favoritesModal = document.getElementById('favoritesModal');
const closeShoppingListBtn = document.getElementById('closeShoppingList');
const closeFavoritesBtn = document.getElementById('closeFavorites');
const clearShoppingBtn = document.getElementById('clearShoppingBtn');
const printShoppingBtn = document.getElementById('printShoppingBtn');
const shoppingListContent = document.getElementById('shoppingListContent');
const favoritesContent = document.getElementById('favoritesContent');


window.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    loadShoppingList();
    loadFavorites();
    
    renderIngredients();
    updateLookupButton();
    updateBadges();
    
    ingredientInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addIngredient();
        }
    });
    
    addIngredientBtn.addEventListener('click', addIngredient);
    lookupBtn.addEventListener('click', findRecipes);
    backBtn.addEventListener('click', goBackToSearch);
    shoppingListBtn.addEventListener('click', showShoppingList);
    favoritesBtn.addEventListener('click', showFavorites);
    closeShoppingListBtn.addEventListener('click', hideShoppingList);
    closeFavoritesBtn.addEventListener('click', hideFavorites);
    clearShoppingBtn.addEventListener('click', clearShoppingListAction);
    printShoppingBtn.addEventListener('click', printShoppingList);
    
    window.addEventListener('click', (e) => {
        if (e.target === shoppingListModal) {
            hideShoppingList();
        }
        if (e.target === favoritesModal) {
            hideFavorites();
        }
    });
});

function loadIngredients() {
    const saved = localStorage.getItem('ingredients');
    if (saved) {
        ingredients = JSON.parse(saved);
    }
}

function saveIngredients() {
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
}

function loadShoppingList() {
    const saved = localStorage.getItem('shoppingList');
    if (saved) {
        shoppingList = JSON.parse(saved);
    }
}

function saveShoppingList() {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    updateBadges();
}

function loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
        favorites = JSON.parse(saved);
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateBadges();
}


function updateBadges() {
    const shoppingCount = Object.keys(shoppingList).length;
    const favoritesCount = favorites.length;
    
    shoppingBadge.textContent = shoppingCount;
    shoppingBadge.style.display = shoppingCount > 0 ? 'block' : 'none';
    
    favoritesBadge.textContent = favoritesCount;
    favoritesBadge.style.display = favoritesCount > 0 ? 'block' : 'none';
}



function addIngredient() {
    const value = ingredientInput.value.trim().toLowerCase();
    if (!value) return;
    if (ingredients.includes(value)) {
        alert('Already added');
        return;
    }
    
    ingredients.push(value);
    updateUI();
    ingredientInput.value = '';
}

function removeIngredient(ingredient) {
    ingredients = ingredients.filter(i => i !== ingredient);
    updateUI();
}

function renderIngredients() {
    const fragment = document.createDocumentFragment();
    
    ingredients.forEach(ingredient => {
        const bubble = document.createElement('div');
        bubble.className = 'ingredient-bubble';
        bubble.textContent = ingredient;
        bubble.addEventListener('click', () => removeIngredient(ingredient));
        fragment.appendChild(bubble);
    });
    
    ingredientsContainer.innerHTML = '';
    ingredientsContainer.appendChild(fragment);
}

function updateLookupButton() {
    lookupBtn.disabled = ingredients.length === 0;
}

function updateUI() {
    saveIngredients();
    renderIngredients();
    updateLookupButton();
}

function findRecipes() {
    if (ingredients.length === 0) return;
    
    searchSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    resultsSection.classList.add('active');
    
    loadAndDisplayRecipes();
}

async function loadAndDisplayRecipes() {
    recipesContainer.innerHTML = '<div class="loading">Looking up recipes....</div>';
    
    try {
        const ingredientsList = ingredients.join(',');
        const response = await axios.get(`${API_BASE}/recipes/findByIngredients`, {
            params: {
                apiKey: API_KEY,
                ingredients: ingredientsList,
                number: 20,
                ranking: 2,
                ignorePantry: true
            }
        });
        
        if (response.data.length === 0) {
            recipesContainer.innerHTML = '<div class="error-message">No recipes with your ingredients were found. Make sure your spelling is correct</div>';
            return;
        }
        
        const sortedRecipes = response.data.sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);
        renderRecipes(sortedRecipes);
        
    } catch (error) {
        console.error('API error:', error);
        recipesContainer.innerHTML = '<div class="error-message">API error, api které používám má limit jen 50 outputů denně ve free verzi, zítra to bude fungovat</div>';
    }
}

function renderRecipes(recipes) {
    recipesContainer.innerHTML = '';
    
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        const usedIngredients = recipe.usedIngredients;
        const missedIngredients = recipe.missedIngredients.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            image: `${ing.image}`
        }));
        
        const recipeUrl = `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`;
        const isFav = isFavorite(recipe.id);
        
        let html = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-title">${recipe.title}</div>
            <div class="matched-ingredients">
                <span class="matched-count">✓ ${recipe.usedIngredientCount} matching ingredients</span>
            </div>
        `;
        
        if (usedIngredients.length > 0) {
            html += '<div><strong>You have:</strong></div><div class="ingredient-images">';
            usedIngredients.forEach(ing => {
                const imgUrl = `${ing.image}`;
                html += `
                    <div class="ingredient-item">
                        <img src="${imgUrl}" alt="${ing.name}">
                        <div class="ingredient-item-name">${ing.name}</div>
                        <div class="ingredient-item-amount">${ing.amount} ${ing.unit}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (missedIngredients.length > 0) {
            html += '<div><strong>You\'re missing:</strong></div><div class="ingredient-images">';
            missedIngredients.forEach(ing => {
                html += `
                    <div class="ingredient-item">
                        <img src="${ing.image}" alt="${ing.name}">
                        <div class="ingredient-item-name">${ing.name}</div>
                        <div class="ingredient-item-amount">${ing.amount} ${ing.unit}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += `
            <div class="recipe-actions">
                <a href="${recipeUrl}" target="_blank" class="btn btn-primary">Show Full Recipe</a>
                <button class="btn-favorite ${isFav ? 'active' : ''}" data-recipe-id="${recipe.id}">⭐</button>
                <button class="btn-shopping" data-shopping-id="${recipe.id}">🛒</button>
            </div>
        `;
        
        card.innerHTML = html;
        
        const favBtn = card.querySelector('.btn-favorite');
        const cartBtn = card.querySelector('.btn-shopping');
        
        favBtn.addEventListener('click', () => {
            addToFavorites({
                id: recipe.id,
                title: recipe.title,
                url: recipeUrl
            });
        });
        
        cartBtn.addEventListener('click', () => {
            addToShoppingListWithAmount(missedIngredients, recipe.id, cartBtn);
        });
        
        recipesContainer.appendChild(card);
    });
}

function goBackToSearch() {
    resultsSection.classList.remove('active');
    resultsSection.classList.add('hidden');
    searchSection.classList.remove('hidden');
}

function showShoppingList() {
    shoppingListModal.classList.add('active');
    renderShoppingList();
}

function hideShoppingList() {
    shoppingListModal.classList.remove('active');
}

function renderShoppingList() {
    if (Object.keys(shoppingList).length === 0) {
        shoppingListContent.innerHTML = '<div class="empty-message">Your shopping list is empty. Add items from recipe results!</div>';
        return;
    }
    
    shoppingListContent.innerHTML = '';
    
    Object.entries(shoppingList).forEach(([name, data]) => {
        const item = document.createElement('div');
        item.className = 'shopping-item';
        item.innerHTML = `
            <span class="shopping-item-name">• ${name}</span>
            <span class="shopping-item-amount">${data.amount} ${data.unit}</span>
        `;
        shoppingListContent.appendChild(item);
    });
}

function addToShoppingListWithAmount(items, recipeId, buttonElement) {
    items.forEach(item => {
        if (!shoppingList[item.name]) {
            shoppingList[item.name] = {
                amount: item.amount,
                unit: item.unit
            };
        }
    });
    
    saveShoppingList();
    alert('Added to shopping list!');
    buttonElement.classList.add('active');
}

function clearShoppingListAction() {
    if (confirm('Are you sure you want to clear the shopping list?')) {
        shoppingList = {};
        saveShoppingList();
        renderShoppingList();
    }
}

function printShoppingList() {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Shopping List</title>');
    printWindow.document.write('<style>body{font-family:Arial;padding:20px;}h1{border-bottom:2px solid #333;}ul{list-style:none;padding:0;}li{padding:8px 0;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;}.amount{color:#666;font-weight:bold;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Shopping List</h1>');
    printWindow.document.write('<ul>');
    
    Object.entries(shoppingList).forEach(([name, data]) => {
        printWindow.document.write(`<li><span>☐ ${name}</span><span class="amount">${data.amount} ${data.unit}</span></li>`);
    });
    
    printWindow.document.write('</ul>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function showFavorites() {
    favoritesModal.classList.add('active');
    renderFavorites();
}

function hideFavorites() {
    favoritesModal.classList.remove('active');
}

function renderFavorites() {
    if (favorites.length === 0) {
        favoritesContent.innerHTML = '<div class="empty-message">No favorites yet. Add recipes from the results page!</div>';
        return;
    }
    
    favoritesContent.innerHTML = '';
    
    favorites.forEach(recipe => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        
        item.innerHTML = `
            <div class="favorite-item-info">
                <div class="favorite-item-title">${recipe.title}</div>
                <a href="${recipe.url}" target="_blank" class="favorite-item-link">View Recipe</a>
            </div>
            <button class="btn-remove-favorite" data-recipe-id="${recipe.id}">Remove</button>
        `;
        
        const removeBtn = item.querySelector('.btn-remove-favorite');
        removeBtn.addEventListener('click', () => removeFavorite(recipe.id));
        
        favoritesContent.appendChild(item);
    });
}

function addToFavorites(recipe) {
    if (favorites.some(fav => fav.id === recipe.id)) {
        alert('Already in favorites!');
        return;
    }
    
    favorites.push(recipe);
    saveFavorites();
    alert('Added to favorites!');
    
    const btn = document.querySelector(`[data-recipe-id="${recipe.id}"]`);
    if (btn) btn.classList.add('active');
}

function removeFavorite(recipeId) {
    favorites = favorites.filter(fav => fav.id !== recipeId);
    saveFavorites();
    renderFavorites();
}

function isFavorite(recipeId) {
    return favorites.some(fav => fav.id === recipeId);
}
