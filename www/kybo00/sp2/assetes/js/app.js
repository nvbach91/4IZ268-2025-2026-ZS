const resultDiv = document.querySelector('#test-result');
const buttonTest = document.querySelector('#button-test');
const wordInput = document.querySelector('#word-input');
const addButton = document.querySelector('#add-button');

const fetchRandomWord = async () => {
    resultDiv.textContent = 'Načítám...';

    try {

        const response = await fetch('http://localhost:3000/api/words/random');
        const data = await response.json();

        resultDiv.textContent = data.word;

    } catch (error) {
        console.error(error);
        resultDiv.textContent = 'Chyba při načítání dat';
    }
};

buttonTest.addEventListener('click', () => {
    fetchRandomWord();
});

