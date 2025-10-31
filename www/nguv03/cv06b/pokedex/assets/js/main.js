const pokemonForm = document.querySelector('#pokemon-form');
const pokemonList = document.querySelector('#pokemon-list');
const existingPokemons = {};

pokemonForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(pokemonForm);
    const value = formData.get('value');
    const pokemonNames = value.split(',');
    const pokemons = [];
    for (const pokemonName of pokemonNames) {
        if (!existingPokemons[pokemonName.trim()]) {
            const pokemon = await createPokemon(pokemonName.trim());
            pokemons.push(pokemon);
            existingPokemons[pokemonName.trim()] = true;
        }
    }
    pokemonList.append(...pokemons);
});

const createPokemon = async (name) => {
    const pokemon = document.createElement('li');

    const pokemonNameElement = document.createElement('div');
    pokemonNameElement.innerText = `${name.slice(0, 1).toUpperCase()}${name.slice(1).toLowerCase()}`;
    // pikachu
    // 0123456

    const pokemonImageElement = document.createElement('img');
    pokemonImageElement.src = `https://img.pokemondb.net/sprites/scarlet-violet/icon/${name.toLowerCase()}.png`;
    pokemonImageElement.alt = `The image of ${name}`;

    const pokemonRemoveButton = document.createElement('button');
    pokemonRemoveButton.innerText = 'Remove';
    pokemonRemoveButton.addEventListener('click', () => {
        pokemon.remove();
    });

    pokemon.append(pokemonNameElement, pokemonImageElement, pokemonRemoveButton);

    const pokemonData = await fetchPokemon(name);
    const pokemonTypeElement = document.createElement('div');
    pokemonTypeElement.textContent = pokemonData.types[0].type.name;

    pokemonNameElement.append(pokemonTypeElement);
    return pokemon;
};

const fetchPokemon = async (name) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error(error);
    }
};