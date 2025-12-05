const counterButton = $('#counter');
const resetButton = $('#reset');
const countContainer = $('#count');

let count = 0;
counterButton.on('click', () => {
    count += 1;
    updateCount();
});

resetButton.on('click', () => {
    count = 0;
    updateCount();
});

const updateCount = () => {
    countContainer.text(count);
    localStorage.setItem('count', count);
};

const init = () => {
    count = parseFloat(localStorage.getItem('count') || '0');
    countContainer.text(count);
};
init();