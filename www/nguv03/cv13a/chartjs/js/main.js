const data = [
    { mark: 1, count: 50 },
    { mark: 2, count: 45 },
    { mark: 3, count: 30 },
    { mark: 4, count: 60 },
    { mark: 5, count: 10 },
];
const canvas1 = document.querySelector('#chart-1');
const chartTypes = [
    'bar', 'pie', 'radar', 'doughnut', 'scatter', 'line',
];
const chartTypeButtonsContainer = document.querySelector('#chart-type-buttons');
const chartTypeButtons = chartTypes.map((type) => {
    const btn = document.createElement('button');
    btn.textContent = type;
    btn.addEventListener('click', () => {
        generateChartByType(type);
    });
    return btn;
});
chartTypeButtonsContainer.append(...chartTypeButtons);

const chartContainer = document.querySelector('#chart-container');

const generateChartByType = (type) => {
    const canvas = document.createElement('canvas');
    chartContainer.innerHTML = '';
    chartContainer.append(canvas);
    new Chart(
        canvas,
        {
            type,
            data: {
                labels: data.map(({ mark }) => mark),
                datasets: [
                    {
                        label: 'Hodnoceni semestralnich praci',
                        data: data.map(({ count }) => count)
                    }
                ],
            },
        },
    );
};
