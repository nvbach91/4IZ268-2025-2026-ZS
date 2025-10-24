console.log('Ahoj světe');

const birthYear = 1995;
const currentYear = new Date().getFullYear();
const pepeAge = currentYear - birthYear;
console.log(`Pepe je ${pepeAge} let starý.`);

const celsius = 20;
const fahrenheit = 68;

const celsiusToFahrenheit = (celsius * 9 / 5) + 32;
const fahrenheitToCelsius = (fahrenheit - 32) * 5 / 9;

console.log(`${celsius}°C = ${celsiusToFahrenheit}°F`);
console.log(`${fahrenheit}°F = ${fahrenheitToCelsius}°C`);

const getPepeAge = (birthYear) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    console.log(`Pepe je ${age} let starý.`);
};

const convertCelsiusToFahrenheit = (celsius) => {
    const fahrenheit = (celsius * 9 / 5) + 32;
    console.log(`${celsius}°C = ${fahrenheit}°F`);
};

const convertFahrenheitToCelsius = (fahrenheit) => {
    const celsius = (fahrenheit - 32) * 5 / 9;
    console.log(`${fahrenheit}°F = ${celsius}°C`);
};

const buttonPepeAge = document.createElement('button');
buttonPepeAge.innerText = "Úloha 1 (Věk Pepy)";
buttonPepeAge.setAttribute('id', 'task-1');
buttonPepeAge.addEventListener('click', () => {
    getPepeAge(1995);
});
document.querySelector('#tasks').appendChild(buttonPepeAge);

getPepeAge(2000);
convertCelsiusToFahrenheit(25);
convertFahrenheitToCelsius(77);

const calculatePercentage = (num, total) => {
    const resultsDiv = document.querySelector('#results');
    if (total === 0) {
        resultsDiv.innerText = 'Chyba: Dělení nulou!';
        return;
    }
    const percentage = (num / total * 100).toFixed(2);
    resultsDiv.innerText = `${num} je ${percentage}% z ${total}`;
};

const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = 'Úloha 4 (Procenta)';
buttonPercentage.setAttribute('id', 'task-4');
buttonPercentage.addEventListener('click', () => {
    calculatePercentage(21, 42);
});
document.querySelector('#tasks').appendChild(buttonPercentage);

const compareNumbers = (a, b) => {
    const resultsDiv = document.querySelector('#results');
    if (a > b) {
        resultsDiv.innerText = `${a} je větší než ${b}`;
    } else if (a < b) {
        resultsDiv.innerText = `${b} je větší než ${a}`;
    } else {
        resultsDiv.innerText = `${a} a ${b} jsou rovny`;
    }
};

const testCases = [
    { a: 10, b: 5, label: 'Úloha 5 (Celá čísla: 10 vs 5)' },
    { a: 3.14, b: 2.71, label: 'Úloha 5 (Desetinná čísla: 3.14 vs 2.71)' },
    { a: 1/3, b: 1/2, label: 'Úloha 5 (Zlomky: 1/3 vs 1/2)' },
    { a: 7, b: 7, label: 'Úloha 5 (Rovnost: 7 vs 7)' }
];

testCases.forEach((test, index) => {
    const button = document.createElement('button');
    button.innerText = test.label;
    button.setAttribute('id', `task-5-${index + 1}`);
    button.addEventListener('click', () => {
        compareNumbers(test.a, test.b);
    });
    document.querySelector('#tasks').appendChild(button);
});

const printMultiplesOf13 = () => {
    const resultsDiv = document.querySelector('#results');
    let multiples = '';
    for (let i = 0; i <= 730; i += 13) {
        multiples += i + ' ';
    }
    resultsDiv.innerText = `Násobky 13 až 730: ${multiples.trim()}`;
};

const buttonMultiples = document.createElement('button');
buttonMultiples.innerText = 'Úloha 6 (Násobky 13)';
buttonMultiples.setAttribute('id', 'task-6');
buttonMultiples.addEventListener('click', () => {
    printMultiplesOf13();
});
document.querySelector('#tasks').appendChild(buttonMultiples);

const calculateCircleArea = (radius) => {
    const resultsDiv = document.querySelector('#results');
    const area = Math.PI * radius * radius;
    resultsDiv.innerText = `Obsah kružnice s poloměrem ${radius} je ${area.toFixed(2)}`;
};

const buttonCircleArea = document.createElement('button');
buttonCircleArea.innerText = 'Úloha 7 (Obsah kružnice)';
buttonCircleArea.setAttribute('id', 'task-7');
buttonCircleArea.addEventListener('click', () => {
    calculateCircleArea(5);
});
document.querySelector('#tasks').appendChild(buttonCircleArea);

const calculateConeVolume = (radius, height) => {
    const resultsDiv = document.querySelector('#results');
    const volume = (1 / 3) * Math.PI * radius * radius * height;
    resultsDiv.innerText = `Objem kužele s poloměrem ${radius} a výškou ${height} je ${volume.toFixed(2)}`;
};

const buttonConeVolume = document.createElement('button');
buttonConeVolume.innerText = 'Úloha 8 (Objem kužele)';
buttonConeVolume.setAttribute('id', 'task-8');
buttonConeVolume.addEventListener('click', () => {
    calculateConeVolume(3, 7);
});
document.querySelector('#tasks').appendChild(buttonConeVolume);

const isTriangle = (a, b, c) => {
    const resultsDiv = document.querySelector('#results');
    const isValid = a + b > c && b + c > a && a + c > b;
    resultsDiv.innerText = `Strany ${a}, ${b}, ${c}: ${isValid ? 'Ano, lze vytvořit trojúhelník' : 'Ne, nelze vytvořit trojúhelník'}`;
    return isValid;
};

const buttonTriangle = document.createElement('button');
buttonTriangle.innerText = 'Úloha 9 (Ověření trojúhelníku)';
buttonTriangle.setAttribute('id', 'task-9');
buttonTriangle.addEventListener('click', () => {
    isTriangle(3, 4, 5);
});
document.querySelector('#tasks').appendChild(buttonTriangle);

const calculateTriangleArea = (a, b, c) => {
    const resultsDiv = document.querySelector('#results');
    if (!isTriangle(a, b, c)) {
        resultsDiv.innerText = `Chyba: Strany ${a}, ${b}, ${c} nemohou vytvořit trojúhelník`;
        return;
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    resultsDiv.innerText = `Obsah trojúhelníku se stranami ${a}, ${b}, ${c} je ${area.toFixed(2)}`;
};

const buttonTriangleArea = document.createElement('button');
buttonTriangleArea.innerText = 'Úloha 10 (Obsah trojúhelníku)';
buttonTriangleArea.setAttribute('id', 'task-10');
buttonTriangleArea.addEventListener('click', () => {
    calculateTriangleArea(3, 4, 5);
});
document.querySelector('#tasks').appendChild(buttonTriangleArea);