
    console.log('Ahoj světe');

    /**
    * 1)
    */
    const birthYear = 1990;
    const currentYear = 2024;
    const pepesAge = currentYear - birthYear;
    console.log(`Pepe is ${pepesAge} years old. He was born in ${birthYear}.`);

    /**
    * 2)
    */
    const tempCelsius = 20;
    const tempFahrenheit = 68;

    const celsiusToFahrenheit = (tempCelsius * 9 / 5) + 32;
    const fahrenheitToCelsius = (tempFahrenheit - 32) * 5 / 9;

    console.log(`${tempCelsius}°C = ${celsiusToFahrenheit}°F`);
    console.log(`${tempFahrenheit}°F = ${fahrenheitToCelsius}°C`);

    /**
    * 3)
    */
    const calculateAge = (birthYear) => {
    const currentYear = 2024;
    const age = currentYear - birthYear;
    console.log(`Person is ${age} years old (born in ${birthYear}).`);
};

    const convertCelsiusToFahrenheit = (celsius) => {
    const fahrenheit = (celsius * 9 / 5) + 32;
    console.log(`${celsius}°C = ${fahrenheit}°F`);
};

    const convertFahrenheitToCelsius = (fahrenheit) => {
    const celsius = (fahrenheit - 32) * 5 / 9;
    console.log(`${fahrenheit}°F = ${celsius}°C`);
};

    // Test functions
    calculateAge(1995);
    convertCelsiusToFahrenheit(25);
    convertFahrenheitToCelsius(77);

    // button for task 1
    const buttonTask1 = document.createElement('button');
    buttonTask1.innerText = 'Task 1 (Calculate Age)';
    buttonTask1.setAttribute('id', 'task-1');
    buttonTask1.addEventListener('click', () => {
    calculateAge(1990);
});

    const tasks = document.querySelector('#tasks');
    tasks.appendChild(buttonTask1);

    // Create button for task 2a
    const buttonTask2a = document.createElement('button');
    buttonTask2a.innerText = 'Task 2a (Celsius to Fahrenheit)';
    buttonTask2a.setAttribute('id', 'task-2a');
    buttonTask2a.addEventListener('click', () => {
    convertCelsiusToFahrenheit(20);
});
    tasks.appendChild(buttonTask2a);

    // button for task 2b
    const buttonTask2b = document.createElement('button');
    buttonTask2b.innerText = 'Task 2b (Fahrenheit to Celsius)';
    buttonTask2b.setAttribute('id', 'task-2b');
    buttonTask2b.addEventListener('click', () => {
    convertFahrenheitToCelsius(68);
});
    tasks.appendChild(buttonTask2b);

    /**
    * 4)
    */
    const calculatePercentage = (part, whole) => {
    const results = document.querySelector('#results');

    if (whole === 0) {
    results.innerHTML += '<div class="result-item">Error: Cannot divide by zero!</div>';
    return;
}

    const percentage = ((part / whole) * 100).toFixed(2);
    results.innerHTML += `<div class="result-item">${part} is ${percentage}% of ${whole}</div>`;
};

    const buttonTask4 = document.createElement('button');
    buttonTask4.innerText = 'Task 4 (Calculate Percentage)';
    buttonTask4.setAttribute('id', 'task-4');
    buttonTask4.addEventListener('click', () => {
    calculatePercentage(21, 42);
});
    tasks.appendChild(buttonTask4);

    /**
    * 5)
    */
    const compareNumbers = (num1, num2) => {
    const results = document.querySelector('#results');
    let message;

    if (num1 > num2) {
    message = `${num1} is greater than ${num2}`;
} else if (num1 < num2) {
    message = `${num2} is greater than ${num1}`;
} else {
    message = `${num1} and ${num2} are equal`;
}

    results.innerHTML += `<div class="result-item">${message}</div>`;
};

    const buttonTask5a = document.createElement('button');
    buttonTask5a.innerText = 'Task 5a (Compare 10 and 5)';
    buttonTask5a.setAttribute('id', 'task-5a');
    buttonTask5a.addEventListener('click', () => {
    compareNumbers(10, 5);
});
    tasks.appendChild(buttonTask5a);

    const buttonTask5b = document.createElement('button');
    buttonTask5b.innerText = 'Task 5b (Compare 3.14 and 3.14159)';
    buttonTask5b.setAttribute('id', 'task-5b');
    buttonTask5b.addEventListener('click', () => {
    compareNumbers(3.14, 3.14159);
});
    tasks.appendChild(buttonTask5b);

    const buttonTask5c = document.createElement('button');
    buttonTask5c.innerText = 'Task 5c (Compare 7 and 7)';
    buttonTask5c.setAttribute('id', 'task-5c');
    buttonTask5c.addEventListener('click', () => {
    compareNumbers(7, 7);
});
    tasks.appendChild(buttonTask5c);

    /**
    * 6)
    */
    const printMultiplesOf13 = () => {
    const results = document.querySelector('#results');
    let output = '<div class="result-item">Multiples of 13 up to 730: ';

    for (let i = 0; i <= 730; i += 13) {
    output += i + ' ';
}

    output += '</div>';
    results.innerHTML += output;
};

    const buttonTask6 = document.createElement('button');
    buttonTask6.innerText = 'Task 6 (Multiples of 13)';
    buttonTask6.setAttribute('id', 'task-6');
    buttonTask6.addEventListener('click', () => {
    printMultiplesOf13();
});
    tasks.appendChild(buttonTask6);

    /**
    * 7)
    */
    const calculateCircleArea = (radius) => {
    const results = document.querySelector('#results');
    const area = (Math.PI * radius * radius).toFixed(2);
    results.innerHTML += `<div class="result-item">Circle with radius ${radius} has area: ${area}</div>`;
};

    const buttonTask7 = document.createElement('button');
    buttonTask7.innerText = 'Task 7 (Circle Area with radius 5)';
    buttonTask7.setAttribute('id', 'task-7');
    buttonTask7.addEventListener('click', () => {
    calculateCircleArea(5);
});
    tasks.appendChild(buttonTask7);

    /**
    * 8)
    */
    const calculateConeVolume = (height, radius) => {
    const results = document.querySelector('#results');
    const volume = ((1/3) * Math.PI * radius * radius * height).toFixed(2);
    results.innerHTML += `<div class="result-item">Cone with height ${height} and radius ${radius} has volume: ${volume}</div>`;
};

    const buttonTask8 = document.createElement('button');
    buttonTask8.innerText = 'Task 8 (Cone Volume h=10, r=3)';
    buttonTask8.setAttribute('id', 'task-8');
    buttonTask8.addEventListener('click', () => {
    calculateConeVolume(10, 3);
});
    tasks.appendChild(buttonTask8);

    /**
    * 9)
    */
    const isValidTriangle = (a, b, c) => {
    const results = document.querySelector('#results');
    const isValid = (a + b > c) && (a + c > b) && (b + c > a);
    const result = isValid ? 'YES' : 'NO';
    results.innerHTML += `<div class="result-item">Triangle with sides ${a}, ${b}, ${c}: ${result}</div>`;
    return isValid;
};

    const buttonTask9a = document.createElement('button');
    buttonTask9a.innerText = 'Task 9a (Triangle 3, 4, 5)';
    buttonTask9a.setAttribute('id', 'task-9a');
    buttonTask9a.addEventListener('click', () => {
    isValidTriangle(3, 4, 5);
});
    tasks.appendChild(buttonTask9a);

    const buttonTask9b = document.createElement('button');
    buttonTask9b.innerText = 'Task 9b (Triangle 1, 2, 10)';
    buttonTask9b.setAttribute('id', 'task-9b');
    buttonTask9b.addEventListener('click', () => {
    isValidTriangle(1, 2, 10);
});
    tasks.appendChild(buttonTask9b);

    /**
    * 10)
    */
    const calculateTriangleArea = (a, b, c) => {
    const results = document.querySelector('#results');

    // Validate triangle
    if (!((a + b > c) && (a + c > b) && (b + c > a))) {
    results.innerHTML += `<div class="result-item">Error: Sides ${a}, ${b}, ${c} do not form a valid triangle!</div>`;
    return;
}

    //  Herons formula
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    results.innerHTML += `<div class="result-item">Triangle with sides ${a}, ${b}, ${c} has area: ${area.toFixed(2)}</div>`;
};

    const buttonTask10a = document.createElement('button');
    buttonTask10a.innerText = 'Task 10a (Triangle Area 3, 4, 5)';
    buttonTask10a.setAttribute('id', 'task-10a');
    buttonTask10a.addEventListener('click', () => {
    calculateTriangleArea(3, 4, 5);
});
    tasks.appendChild(buttonTask10a);

    const buttonTask10b = document.createElement('button');
    buttonTask10b.innerText = 'Task 10b (Triangle Area 1, 2, 10 - Invalid)';
    buttonTask10b.setAttribute('id', 'task-10b');
    buttonTask10b.addEventListener('click', () => {
    calculateTriangleArea(1, 2, 10);
});
    tasks.appendChild(buttonTask10b);

