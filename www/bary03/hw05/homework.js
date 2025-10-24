console.log('Ahoj světe');

// ========== Úloha 1 ==========
const pepesAge = (birthYear) => {
  resultsDiv.innerHTML = '';
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  resultsDiv.innerText = `Pepe is ${age} years old.`;
  console.log(`Pepe is ${age} years old.`);

};

// ========== Úloha 2 ==========
const convertTemperature = (temp, scale) => {
  if (scale === 'C') {
    const f = (temp * 9) / 5 + 32;
    resultsDiv.innerHTML += `<p>${temp}°C = ${f.toFixed(1)}°F</p>`;
    console.log(`${temp}°C = ${f.toFixed(1)}°F`);
  } else if (scale === 'F') {
    const c = ((temp - 32) * 5) / 9;
    resultsDiv.innerHTML += `<p>${temp}°F = ${c.toFixed(1)}°C</p>`;
    console.log(`${temp}°F = ${c.toFixed(1)}°C`);
  } else {
    resultsDiv.innerHTML += `<p>Invalid scale. Use "C" or "F".</p>`;
    console.log(`Invalid scale. Use "C" or "F".`);
  }
};

// ========== Úloha 3 ==========
const tasksDiv = document.querySelector('#tasks');
const resultsDiv = document.querySelector('#results');

const createButton = (id, text, callback) => {
  const btn = document.createElement('button');
  btn.id = `task-${id}`;
  btn.innerText = text;
  btn.addEventListener('click', callback);
  tasksDiv.appendChild(btn);
};

// Úloha 1 button
createButton(1, "Úloha 1 (Pepe's age)", () => pepesAge(2005));
// Úloha 2 button
createButton(2, "Úloha 2 (C ↔ F)", () => {
  resultsDiv.innerHTML = '';       
  convertTemperature(68, 'F');
  convertTemperature(20, 'C');
});

// ========== Úloha 4 ==========
const calculatePercentage = (a, b) => {
  resultsDiv.innerHTML = ''; 
  if (b === 0) {
    resultsDiv.innerText = 'Error: Division by zero!';
    return;
  }
  const percent = ((a / b) * 100).toFixed(2);
  resultsDiv.innerText = `${a} is ${percent}% of ${b}`;
};
createButton(4, "Úloha 4 (%CENSORED%)", () => calculatePercentage(21, 42));

// ========== Úloha 5 ==========
const compareNumbers = (a, b) => {
  resultsDiv.innerHTML = '';
  if (a > b) resultsDiv.innerText = `${a} is greater than ${b}`;
  else if (a < b) resultsDiv.innerText = `${a} is smaller than ${b}`;
  else resultsDiv.innerText = `${a} and ${b} are equal`;
};
createButton(5, "Úloha 5 (Kdo s koho)", () => compareNumbers(10, 7));

// ========== Úloha 6 ==========
const multiplesOf13 = () => {
  resultsDiv.innerHTML = '<h3>Multiples of 13 (≤ 730):</h3>';
  for (let i = 0; i <= 730; i++) {
    if (i % 13 === 0) {
      resultsDiv.innerHTML += `${i}<br>`;
    }
  }
};
createButton(6, "Úloha 6 (Multiples of 13)", multiplesOf13);

// ========== Úloha 7 ==========
const circleArea = (radius) => {
  const area = Math.PI * radius * radius;
  resultsDiv.innerHTML = `Circle area with radius ${radius} is ${area.toFixed(2)}`;
};
createButton(7, "Úloha 7 (Circle area)", () => circleArea(5));

// ========== Úloha 8 ==========
const coneVolume = (radius, height) => {
  const volume = (1 / 3) * Math.PI * radius * radius * height;
  resultsDiv.innerHTML = `Cone volume (r=${radius}, h=${height}) = ${volume.toFixed(2)}`;
};
createButton(8, "Úloha 8 (Cone volume)", () => coneVolume(3, 10));

// ========== Úloha 9 ==========
const isTriangle = (a, b, c) => {
  resultsDiv.innerHTML = '';
  const valid = a + b > c && a + c > b && b + c > a;
  resultsDiv.innerText = `a=${a}, b=${b}, c=${c} → ${valid ? "YES" : "NO"}`;
  return valid;
};
createButton(9, "Úloha 9 (Triangle check)", () => isTriangle(3, 4, 5));

// ========== Úloha 10 ==========
const heronArea = (a, b, c) => {
  resultsDiv.innerHTML = '';
  if (!isTriangle(a, b, c)) {
    resultsDiv.innerText = 'Invalid triangle sides!';
    return;
  }
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  resultsDiv.innerText = `Triangle area (a=${a}, b=${b}, c=${c}) = ${area.toFixed(2)}`;
};
createButton(10, "Úloha 10 (Heron formula)", () => heronArea(3, 4, 5));
