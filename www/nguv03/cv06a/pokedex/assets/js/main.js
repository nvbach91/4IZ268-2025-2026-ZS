const pokemonForm = document.querySelector('#pokemon-form');
const pokemonList = document.querySelector('#pokemon-list');


pokemonForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(pokemonForm);
    const names = formData.get('name').split(',');
    // console.log(names);
    const pokemons = [];
    for (const name of names) {
        // console.log({ name });
        const pokemon = createPokemon(name.trim());
        pokemons.push(pokemon);
    }
    // console.log(pokemons);
    pokemonList.append(...pokemons);
});

const createPokemon = (name) => {
    const pokemon = document.createElement('li');

    // pokemon name
    const pokemonNameElement = document.createElement('div');
    pokemonNameElement.innerText = `${name.slice(0, 1).toUpperCase()}${name.slice(1).toLowerCase()}`;
    // pikachu
    // 0123456

    // pokemon image
    const pokemonImage = document.createElement('img');
    pokemonImage.src = `https://img.pokemondb.net/sprites/scarlet-violet/icon/${name.toLowerCase()}.png`;
    pokemonImage.alt = `The image of ${name}`;

    // pokemon remove button
    const pokemonRemoveButton = document.createElement('button');
    pokemonRemoveButton.innerText = 'Remove';
    pokemonRemoveButton.addEventListener('click', () => {
        pokemon.remove();
    });

    pokemon.append(pokemonNameElement, pokemonImage, pokemonRemoveButton);
    return pokemon;
};