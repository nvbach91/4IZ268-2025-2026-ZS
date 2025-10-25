const pokemonForm = document.querySelector('#pokemon-form');
const pokemonList = document.querySelector('#pokemon-list');
const existingPokemons = {};

pokemonForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(pokemonForm);
    const value = formData.get('value');
    const pokemonNames = value.split(',');
    const pokemons = [];
    for (const pokemonName of pokemonNames) {
        if (!existingPokemons[pokemonName.trim()]) {
            const pokemon = createPokemon(pokemonName.trim());
            pokemons.push(pokemon);
            existingPokemons[pokemonName.trim()] = true;
        }
    }
    pokemonList.append(...pokemons);
});

const createPokemon = (name) => {
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

    return pokemon;
};