const API_KEY = '1762f536df804c969589567dfc13fc5c';
const API_BASE = 'https://api.spoonacular.com';

let ingredients = [];

window.addEventListener('DOMContentLoaded', () => {
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
        recipesContainer.innerHTML = '<div class="error-message">API error, free API kterou pouzivam pro aplikaci ma limit jen 50 outputu denne, try again tomorrow</div>';
    }
}

function renderRecipes(recipes) {
    const container = document.getElementById('recipesContainer');
    container.innerHTML = '';
    
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        const usedIngredients = recipe.usedIngredients.map(i => i.name).join(', ');
        const missedIngredients = recipe.missedIngredients.map(i => i.name).join(', ');
        
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
                    <div><strong>You're missing:</strong> ${missedIngredients}</div>
                </div>
            ` : ''}
            <a href="https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}" 
               target="_blank" 
               class="btn btn-primary">
                Show Full Recipe
            </a>
        `;
        
        container.appendChild(card);
    });
}

function goBack() {
    window.location.href = '../index.html';
}