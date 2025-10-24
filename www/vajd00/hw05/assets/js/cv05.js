/* HOMEWORK */
/**
 * 0) Pre-preparacion.
 * - Vytvořte HTML stránku s nadpisem h1 "JavaScript is awesome!" 
 * - Na stránce vytvořte místo pro umístění jednotlivých spouštěčů úkolů - tlačítek (tj. div, který má id s hodnotou "tasks" - <div id="tasks"></div>). 
 * - Na stránce vytvořte místo pro výpis výsledků úkolů (div, který má id s hodnotou "result" - <div id="results"></div>).
 * 
 * - Připojte tento homework.js soubor k vytvořené HTML stránce pomocí tagu <script> (viz LAB) a vyzkoušejte
 * console.log('Ahoj světe');
 */

console.log('Ahoj světe');


/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here

const birthYear = 1998; 
const currentYear = new Date().getFullYear();
const pepeAge = currentYear - birthYear;

// výpis interpolací
console.log(`Pepe is ${pepeAge} years old.`);
// výpis zřetězením
console.log('Pepe is ' + pepeAge + ' years old.');



/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const celsiusTemp = 25;
const fahrenheitFromCelsius = (celsiusTemp * 9) / 5 + 32;

console.log(`${celsiusTemp}°C = ${fahrenheitFromCelsius}°F`);

const fahrenheitTemp = 65;
const celsiusFromFahrenheit = ((fahrenheitTemp - 32) * 5) / 9;

console.log(`${fahrenheitTemp}°F = ${celsiusFromFahrenheit}°C`);


/**
 * 3) Funkce function fonction funktio. Vemte předchozí úlohy a udělejte z nich funkce. Tj. vytvoříte funkce, 
 * které přijímají argumenty, a na základě argumentů po zavolání vypíše výsledek na konzoli. 
 * Párkrát zavolejte tyto funkce s různými argumenty. V konzoli také vyzkoušejte, zda fungují vaše funkce. 
 * 
 * Pro testování funkce:
 * - Pouze pomocí JavaScriptu (bez knihoven) vytvořte HTML tlačítko s názvem této úlohy, resp. co funkce dělá, a 
 * id s číslem úlohy <button id="task-1">Uloha 1 (Pepe's age)</button>, umístěte ho na stránku do předem vytvořeného 
 * místa <div id="tasks"></div> a pomocí posluchače události "click" nabindujte implementovanou funkci na toto tlačítko.
 * 
 * Výsledkem má být tlačítko, na které když kliknete, tak se provede to, co je implementováno ve funkci.
 *
 * Příklad vytvoření tlačítka s funkcí:
 * 
 * // deklarace a implementace funkce
 * const sayHello = () => {
 *   console.log('Hello');
 * };
 * 
 * // vytvoření tlačítka
 * const buttonSayHello = document.createElement('button');
 * // nastavení textu tlačítka
 * buttonSayHello.innerText = 'Say Hello';
 * // nastavení atributu id tlačítka
 * buttonSayHello.setAttribute('id', 'task-0');
 * // nabindování funkce na událost click tlačítka
 * buttonSayHello.addEventListener('click', () => {
 *   sayHello();
 * });
 * 
 * // výběr existujícího elementu na stránce s id="tasks"
 * const tasks = document.querySelector('#tasks');
 * // vložení vytvořeného tlačítka do vybraného elementu na stránce
 * tasks.appendChild(buttonSayHello);
 */
// Solution here

// Funkce pro výpočet Pepova věku

const getAgeFromBirthYear = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old (born in ${birthYear}).`);
  return age;
};

getAgeFromBirthYear(1998);
getAgeFromBirthYear(2000);

// 2) Funkce pro převod teplot

const celsiusToFahrenheit = (celsius) => {
  const fahrenheit = (celsius * 9) / 5 + 32;
  console.log(`${celsius}°C = ${fahrenheit}°F`);
  return fahrenheit;
};

const fahrenheitToCelsius = (fahrenheit) => {
  const celsius = ((fahrenheit - 32) * 5) / 9;
  console.log(`${fahrenheit}°F = ${celsius}°C`);
  return celsius;
};

celsiusToFahrenheit(20);
fahrenheitToCelsius(32);


// vytvoření tlačítka pro úlohu 1
const buttonPepeAge = document.createElement('button');
buttonPepeAge.innerText = 'Task 3 (Pepe)';
buttonPepeAge.setAttribute('id', 'task-1');

buttonPepeAge.addEventListener('click', () => {
  const input = prompt('Enter the birth year of Pepe:');
  if (input && !isNaN(input)) {
    getAgeFromBirthYear(Number(input));
  } else {
    console.log('invalid input.');
  }
});

// vytvoření tlačítka pro převod C → F
const buttonCtoF = document.createElement('button');
buttonCtoF.innerText = 'Task 3 (C → F)';
buttonCtoF.setAttribute('id', 'task-2a');

buttonCtoF.addEventListener('click', () => {
  const input = prompt('Enter temperature in °C:');
  if (input && !isNaN(input)) {
    celsiusToFahrenheit(Number(input));
  } else {
    console.log('invalid input.');
  }
});

// vytvoření tlačítka pro převod F → C
const buttonFtoC = document.createElement('button');
buttonFtoC.innerText = 'Task 3 (F → C)';
buttonFtoC.setAttribute('id', 'task-2b');

buttonFtoC.addEventListener('click', () => {
  const input = prompt('Enter temperature in °F:');
  if (input && !isNaN(input)) {
    fahrenheitToCelsius(Number(input));
  } else {
    console.log('invalid input.');
  }
});


const tasks = document.querySelector('#tasks');
tasks.appendChild(buttonPepeAge);
tasks.appendChild(buttonCtoF);
tasks.appendChild(buttonFtoC);


/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const getPercentage = (a, b) => {
  if (b === 0) {
    console.log('Error: cannot divide by zero!');
    displayResult('Error: cannot divide by zero!');
    return;
  }

  const percentage = (a / b) * 100;
  const message = `${a} is ${percentage.toFixed(2)}% form ${b}`;
  console.log(message);
  displayResult(message);
  return percentage;
};

const displayResult = (text) => {
  const results = document.querySelector('#results');
  const p = document.createElement('p');
  p.textContent = text;
  results.appendChild(p);
};

const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = 'Task 4 Percentage';
buttonPercentage.setAttribute('id', 'task-4');

buttonPercentage.addEventListener('click', () => {
  const a = parseFloat(prompt('First number:'));
  const b = parseFloat(prompt('Second number:'));
  if (!isNaN(a) && !isNaN(b)) {
    getPercentage(a, b);
  } else {
    console.log('invalid input');
    displayResult('invalid input');
  }
});

tasks.appendChild(buttonPercentage);




/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const compareNumbers = (a, b) => {
  let message = '';

  if (a > b) {
    message = `${a} is bigger than ${b}`;
  } else if (a < b) {
    message = `${b} is bigger than ${a}`;
  } else {
    message = `${a} and ${b} are equal`;
  }

  console.log(message);
  displayResult(message);
};

// 5a
const b5a = document.createElement('button');
b5a.id = 'task-5a';
b5a.innerText = 'Task 5 (10 vs 5)';
b5a.addEventListener('click', () => compareNumbers(10, 5));
tasks.appendChild(b5a);

// 5b
const b5b = document.createElement('button');
b5b.id = 'task-5b';
b5b.innerText = 'Task 5 (3.14 vs 2.71)';
b5b.addEventListener('click', () => compareNumbers(3.14, 2.71));
tasks.appendChild(b5b);

// 5c
const b5c = document.createElement('button');
b5c.id = 'task-5c';
b5c.innerText = 'Task 5 (1/2 vs 3/4)';
b5c.addEventListener('click', () => compareNumbers(1/2, 3/4));
tasks.appendChild(b5c);

// 5d
const b5d = document.createElement('button');
b5d.id = 'task-5d';
b5d.innerText = 'Task 5 (7 vs 7)';
b5d.addEventListener('click', () => compareNumbers(7, 7));
tasks.appendChild(b5d);


/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const printMultiplesOf13 = () => {
  console.log('Multiples of 13');
  displayResult('Multiples of 13');

  for (let i = 13; i <= 730; i += 13) {
    console.log(i);
    displayResult(i);
  }
};

const buttonPattern = document.createElement('button');
buttonPattern.innerText = 'Task 6 Multiples of 13';
buttonPattern.setAttribute('id', 'task-6');

buttonPattern.addEventListener('click', () => {
  printMultiplesOf13();
});

tasks.appendChild(buttonPattern);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const circleArea = (radius) => {
  if (radius < 0) {
    console.log('Error: radius cannot be negative.');
    displayResult('Error: radius cannot be negative.');
    return;
  }

  const area = Math.PI * Math.pow(radius, 2);
  const message = `Area of ​​a circle with radius ${radius} is ${area.toFixed(2)}.`;
  console.log(message);
  displayResult(message);
  return area;
};

const buttonCircle = document.createElement('button');
buttonCircle.innerText = 'Task 7 Circle area';
buttonCircle.setAttribute('id', 'task-7');

buttonCircle.addEventListener('click', () => {
  circleArea(5);
  circleArea(10);
  circleArea(0);
});

tasks.appendChild(buttonCircle);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const coneVolume = (radius, height) => {
  if (radius < 0 || height < 0) {
    console.log('Error: Radius and height must be non-negative values.');
    displayResult('Error: Radius and height must be non-negative values.');
    return;
  }

  const volume = (1 / 3) * Math.PI * Math.pow(radius, 2) * height;
  const message = `The volume of a cone with radius ${radius} and height ${height} is ${volume.toFixed(2)}.`;
  console.log(message);
  displayResult(message);
  return volume;
};

const buttonCone = document.createElement('button');
buttonCone.innerText = 'Task 8 (Cone Volume)';
buttonCone.setAttribute('id', 'task-8');

buttonCone.addEventListener('click', () => {
  coneVolume(3, 5);
  coneVolume(10, 20);
  coneVolume(0, 10);
});

tasks.appendChild(buttonCone);


/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const canFormTriangle = (a, b, c) => {

  const isTriangle = a + b > c && a + c > b && b + c > a;

  const message = `(a=${a}, b=${b}, c=${c}) ${isTriangle ? 'true' : 'false'}`;
  console.log(message);
  displayResult(message);

  return isTriangle;
};

const buttonTriangle = document.createElement('button');
buttonTriangle.innerText = 'Task 9 (Triangle Check)';
buttonTriangle.setAttribute('id', 'task-9');


buttonTriangle.addEventListener('click', () => {
  canFormTriangle(3, 4, 5);     
  canFormTriangle(2, 2, 10);    
  canFormTriangle(5, 5, 5);    
  canFormTriangle(1, 2, 3);    
});

tasks.appendChild(buttonTriangle);



/**
 * 10) Heroic performance. Vytvořte funkci, která vypočte a vypíše obsah trojúhelníka podle Heronova vzorce, 
 * tj. funkce dostane délky všech 3 stran. Použijte přitom předchozí validaci v úloze č. 9, tj. počítejte pouze, 
 * když to má smysl. Hint: funkce pro odmocninu je Math.sqrt().
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here
// - krok 1 - vytvořte funkci
//   - krok 1.1 - pomocí selektoru vyberte container pro výpis výsledků a uložte ho do proměnné
//   - krok 1.2 - zvalidujte vstupní argumenty pomocí funkce z úlohy č. 9
//     - v případě nevalidních hodnot vypište chybovou hlášku na místo pro výpis výsledků a funkci ukončete
//     - v případě validních hodnot pokračujte s výpočtem
//   - krok 1.3 - spočítejte obsah trojúhelníku podle Heronovy vzorce a výsledek uložte do proměnné
//   - krok 1.4 - vypište výsledek na místo pro výpis výsledků
// - krok 2 - vytvořte tlačítko
// - krok 3 - nabindujte na toto tlačítko callback, ve kterém zavoláte implementovanou funkci pro výpočet a výpis výsledků
// - krok 4 - tlačítko umístěte na stránku
// - krok 5 - otestujte řešení klikáním na tlačítko

const heronArea = (a, b, c) => {
  const results = document.querySelector('#results');

  if (!canFormTriangle(a, b, c)) {
    const errorMsg = `Invalid triangle sides (a=${a}, b=${b}, c=${c}). Cannot calculate area.`;
    console.log(errorMsg);
    const p = document.createElement('p');
    p.textContent = errorMsg;
    results.appendChild(p);
    return;
  }

  const s = (a + b + c) / 2; 
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  const message = `Triangle (a=${a}, b=${b}, c=${c}) has area = ${area.toFixed(2)}.`;
  console.log(message);
  const p = document.createElement('p');
  p.textContent = message;
  results.appendChild(p);

  return area;
};

const buttonHeron = document.createElement('button');
buttonHeron.innerText = 'Task 10 (Heron’s Formula)';
buttonHeron.setAttribute('id', 'task-10');

buttonHeron.addEventListener('click', () => {

  heronArea(3, 4, 5);   
  heronArea(5, 5, 5);  
  heronArea(2, 2, 10);  
});

tasks.appendChild(buttonHeron);
