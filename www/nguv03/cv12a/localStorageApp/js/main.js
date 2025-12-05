const counterButton = $('#counter');
const resetButton = $('#reset');
const countContainer = $('#count');

let count = 0;
counterButton.on('click', () => {
    count += 1;
    countContainer.text(count);
    localStorage.setItem('count', count);
});

resetButton.on('click', () => {
    // ?
    count = 0;
    countContainer.text(count);
    localStorage.setItem('count', count);
});

const loadFromLocalStorage = () => {
    count = parseFloat(localStorage.getItem('count') || '0');
    countContainer.text(count);
};
loadFromLocalStorage();