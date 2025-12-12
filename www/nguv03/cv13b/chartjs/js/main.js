const appContainer = document.querySelector('#app');
const chartTypeButtonsContainer = document.querySelector('#chart-type-buttons');
const data = [
    { day: 1, value: 20 },
    { day: 2, value: 21 },
    { day: 3, value: 25 },
    { day: 4, value: 19 },
    { day: 5, value: 16 },
    { day: 6, value: 29 },
    { day: 7, value: 22 },
];
const weekDays = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday',
};
const renderChart = (type) => {
    const canvas = document.createElement('canvas');
    appContainer.innerHTML = '';
    appContainer.append(canvas);
    new Chart(
        canvas, // where to draw
        {
            type,
            data: {
                labels: data.map(({ day }) => weekDays[day]),
                datasets: [
                    {
                        label: 'Teploty behem tydne',
                        data: data.map(({ value }) => value),
                    },
                    {
                        label: 'Teploty behem tydne',
                        data: data.reverse().map(({ value }) => value),
                    },
                    {
                        label: 'Teploty behem tydne',
                        data: data.map(({ value }) => value),
                    },
                ],
            },
            // options: {},
        },
    );
};
const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble'];
const chartTypeButtons = chartTypes.map((type) => {
    const btn = document.createElement('button');
    btn.textContent = type;
    btn.addEventListener('click', () => {
        renderChart(type);
    });
    return btn;
});
chartTypeButtonsContainer.append(...chartTypeButtons);