console.log('Ahoj světe');


const showResult = (text) => {
  const result = document.querySelector('#results');
  result.innerHTML = text;
};


const createButton = (id, text, callback) => {
  const btn = document.createElement('button');
  btn.id = id;
  btn.innerText = text;
  btn.addEventListener('click', callback);
  document.querySelector('#tasks').appendChild(btn);
};


const pepesAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old.`);
  showResult(`Pepe is ${age} years old.`);
};
createButton('task-1', 'Úloha 1 (Pepe\'s age)', () => pepesAge(2000));


const convertTemperature = (celsius) => {
  const fahrenheit = (celsius * 9) / 5 + 32;
  console.log(`${celsius}°C = ${fahrenheit.toFixed(1)}°F`);
  showResult(`${celsius}°C = ${fahrenheit.toFixed(1)}°F`);
};
createButton('task-2', 'Úloha 2 (C ⇄ F)', () => convertTemperature(20));


const percentage = (part, total) => {
  if (total === 0) {
    showResult('Chyba: dělení nulou!');
    return;
  }
  const percent = ((part / total) * 100).toFixed(2);
  const resultText = `${part} je ${percent}% z ${total}`;
  console.log(resultText);
  showResult(resultText);
};
createButton('task-4', 'Úloha 4 (%CENSORED%)', () => percentage(21, 42));


const compareNumbers = (a, b) => {
  let text = '';
  if (a > b) text = `${a} je větší než ${b}`;
  else if (a < b) text = `${b} je větší než ${a}`;
  else text = `${a} a ${b} se rovnají`;
  console.log(text);
  showResult(text);
};
createButton('task-5', 'Úloha 5 (Kdo s koho)', () => compareNumbers(5, 9));

const multiplesOf13 = () => {
  const arr = [];
  for (let i = 0; i <= 730; i += 13) arr.push(i);
  console.log(arr.join(', '));
  showResult(arr.join(', '));
};
createButton('task-6', 'Úloha 6 (Násobky 13)', multiplesOf13);

const circleArea = (radius) => {
  const area = Math.PI * radius * radius;
  const text = `Obsah kružnice s poloměrem ${radius} je ${area.toFixed(2)}`;
  console.log(text);
  showResult(text);
};
createButton('task-7', 'Úloha 7 (Obsah kružnice)', () => circleArea(5));

const coneVolume = (radius, height) => {
  const volume = (1 / 3) * Math.PI * radius * radius * height;
  const text = `Objem kuželu s r=${radius} a h=${height} je ${volume.toFixed(2)}`;
  console.log(text);
  showResult(text);
};
createButton('task-8', 'Úloha 8 (Objem kuželu)', () => coneVolume(3, 10));

const isTriangle = (a, b, c) => {
  const possible = a + b > c && a + c > b && b + c > a;
  const text = `Strany: a=${a}, b=${b}, c=${c} → ${possible ? 'ANO' : 'NE'}`;
  console.log(text);
  showResult(text);
  return possible;
};
createButton('task-9', 'Úloha 9 (Trojúhelník?)', () => isTriangle(3, 4, 5));

const heronTriangleArea = (a, b, c) => {
  const results = document.querySelector('#results');
  if (!isTriangle(a, b, c)) {
    results.innerHTML = 'Z těchto délek trojúhelník nesestrojíš!';
    return;
  }

  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const text = `Obsah trojúhelníku se stranami ${a}, ${b}, ${c} je ${area.toFixed(2)}`;
  console.log(text);
  showResult(text);
};
createButton('task-10', 'Úloha 10 (Heronův vzorec)', () => heronTriangleArea(3, 4, 5));
