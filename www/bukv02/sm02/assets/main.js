const API_KEY = '1762f536df804c969589567dfc13fc5c';
const API_BASE = 'https://api.spoonacular.com';

let ingredients = [];
let shoppingList = [];
let favorites = [];

window.addEventListener('DOMContentLoaded', () => {
    loadShoppingList();
    loadFavorites();
    
    if (document.getElementById('ingredientInput')) {
        loadIngredients();
        renderIngredients();
        updateLookupButton();
        document.getElementById('ingredientInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addIngredient();
            }
        });
    }
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
}

function loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
        favorites = JSON.parse(saved);
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function addIngredient() {
    const input = document.getElementById('ingredientInput');
    const value = input.value.trim().toLowerCase();
    
    if (!value) return;
    if (ingredients.includes(value)) {
        alert('Already added');
        return;
    }
    
    ingredients.push(value);
    updateUI();
    input.value = '';
}

function removeIngredient(ingredient) {
    ingredients = ingredients.filter(i => i !== ingredient);
    updateUI();
}

function renderIngredients() {
    const container = document.getElementById('ingredientsContainer');
    container.innerHTML = '';
    
    ingredients.forEach(ingredient => {
        const bubble = document.createElement('div');
        bubble.className = 'ingredient-bubble';
        bubble.textContent = ingredient;
        bubble.onclick = () => removeIngredient(ingredient);
        container.appendChild(bubble);
    });
}

function updateLookupButton() {
    const btn = document.getElementById('lookupBtn');
    btn.disabled = ingredients.length === 0;
}

function updateUI() {
    saveIngredients();
    renderIngredients();
    updateLookupButton();
}

function findRecipes() {
    if (ingredients.length === 0) return;
    saveIngredients();
    window.location.href = 'results/index.html';
}

function showShoppingList() {
    const modal = document.getElementById('shoppingListModal');
    modal.classList.add('active');
    renderShoppingList();
}

function closeShoppingList() {
    const modal = document.getElementById('shoppingListModal');
    modal.classList.remove('active');
}

function renderShoppingList() {
    const container = document.getElementById('shoppingListContent');
    
    if (shoppingList.length === 0) {
        container.innerHTML = '<div class="empty-message">Your shopping list is empty.</div>';
        return;
    }
    
    container.innerHTML = shoppingList.map(item => 
        `<div class="shopping-item">• ${item}</div>`
    ).join('');
}

function addToShoppingList(items, recipeId) {
    items.forEach(item => {
        if (!shoppingList.includes(item)) {
            shoppingList.push(item);
        }
    });
    saveShoppingList();
    alert('Added to shopping list!');
    const btn = document.querySelector(`[data-shopping-id="${recipeId}"]`);
    if (btn) btn.classList.add('active');
}

function clearShoppingList() {
    if (confirm('Are you sure you want to clear the shopping list?')) {
        shoppingList = [];
        saveShoppingList();
        renderShoppingList();
    }
}

function printShoppingList() {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Shopping List</title>');
    printWindow.document.write('<style>body{font-family:Arial;padding:20px;}h1{border-bottom:2px solid #333;}ul{list-style:none;padding:0;}li{padding:8px 0;border-bottom:1px solid #ddd;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Shopping List</h1>');
    printWindow.document.write('<ul>');
    shoppingList.forEach(item => {
        printWindow.document.write(`<li>☐ ${item}</li>`);
    });
    printWindow.document.write('</ul>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function showFavorites() {
    const modal = document.getElementById('favoritesModal');
    modal.classList.add('active');
    renderFavorites();
}

function closeFavorites() {
    const modal = document.getElementById('favoritesModal');
    modal.classList.remove('active');
}

function renderFavorites() {
    const container = document.getElementById('favoritesContent');
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-message">No favorites yet.</div>';
        return;
    }
    
    container.innerHTML = favorites.map(recipe => `
        <div class="favorite-item">
            <div class="favorite-item-info">
                <div class="favorite-item-title">${recipe.title}</div>
                <a href="${recipe.url}" target="_blank" class="favorite-item-link">View Recipe</a>
            </div>
            <button class="btn-remove-favorite" onclick="removeFavorite(${recipe.id})">Remove</button>
        </div>
    `).join('');
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

async function loadAndDisplayRecipes() {
    loadIngredients();
    
    if (ingredients.length === 0) {
        window.location.href = '../index.html';
        return;
    }
    
    const recipesContainer = document.getElementById('recipesContainer');
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
    const container = document.getElementById('recipesContainer');
    container.innerHTML = '';
    
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        const usedIngredients = recipe.usedIngredients.map(i => i.name).join(', ');
        const missedIngredients = recipe.missedIngredients.map(i => i.name);
        const missedIngredientsText = missedIngredients.join(', ');
        
        const recipeUrl = `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`;
        const isFav = isFavorite(recipe.id);
        
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-title">${recipe.title}</div>
            <div class="matched-ingredients">
                <span class="matched-count">✓ You have ${recipe.usedIngredientCount} of ${ingredients.length} ingredients:</span>
            </div>
            <div class="recipe-stats">
                <div><strong>You have:</strong> ${usedIngredients}</div>
            </div>
            ${recipe.missedIngredientCount > 0 ? `
                <div class="recipe-stats">
                    <div><strong>You're missing:</strong> ${missedIngredientsText}</div>
                </div>
            ` : ''}
            <div class="recipe-actions">
                <a href="${recipeUrl}" target="_blank" class="btn btn-primary">Show Full Recipe</a>
                <button class="btn-favorite ${isFav ? 'active' : ''}" 
                        data-recipe-id="${recipe.id}"
                        onclick='addToFavorites(${JSON.stringify({id: recipe.id, title: recipe.title, url: recipeUrl})})'>
                    ⭐
                </button>
                <button class="btn-shopping" 
                        data-shopping-id="${recipe.id}"
                        onclick='addToShoppingList(${JSON.stringify(missedIngredients)}, ${recipe.id})'>
                    🛒          
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function goBack() {
    window.location.href = '../index.html';
}
