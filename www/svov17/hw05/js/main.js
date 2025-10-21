console.log('Ahoj světe');
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


const tasks = document.querySelector('#tasks');
const results = document.querySelector('#results');

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here

const pepesAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old`);
};

// tlačítko
const btn1 = document.createElement('button');
btn1.innerText = "Uloha 1 (Pepe's age)";
btn1.id = "task-1";
btn1.addEventListener('click', () => pepesAge(1999));
tasks.appendChild(btn1);

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const convertTemp = (celsius) => {
  const fahrenheit = celsius * 9 / 5 + 32;
  console.log(`${celsius}°C = ${fahrenheit}°F`);
  console.log(`${fahrenheit}°F = ${(fahrenheit - 32) * 5 / 9}°C`);
};

// tlačítko
const btn2 = document.createElement('button');
btn2.innerText = "Uloha 2 (C/F)";
btn2.id = "task-2";
btn2.addEventListener('click', () => convertTemp(20));
tasks.appendChild(btn2);
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
// Solution - pod kazdym bodem



/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const percentage = (a, b) => {
  results.innerText = '';
  if (b === 0) {
    results.innerText = 'Error: division by zero';
    return;
  }
  const percent = ((a / b) * 100).toFixed(2);
  results.innerText = `${a} je ${percent}% z ${b}`;
};

// tlačítko
const btn4 = document.createElement('button');
btn4.innerText = "Uloha 4 (%)";
btn4.id = "task-4";
btn4.addEventListener('click', () => percentage(21, 42));
tasks.appendChild(btn4);

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
  results.innerText = '';
  if (a > b) results.innerText = `${a} je větší než ${b}`;
  else if (a < b) results.innerText = `${b} je větší než ${a}`;
  else results.innerText = `${a} a ${b} se rovnají`;
};

// různé kombinace argumentů
const combinations = [
  { a: 3, b: 7, label: '3 vs 7 (celá čísla)' },
  { a: 4.5, b: 4.5, label: '4.5 vs 4.5 (desetinná)' },
  { a: 2.75, b: 2.5, label: '2.75 vs 2.5 (desetinná)' },
  { a: 1/2, b: 2/3, label: '1/2 vs 2/3 (zlomky)' },
  { a: -5, b: -10, label: '-5 vs -10 (záporná)' },
  { a: 100, b: 99.9, label: '100 vs 99.9 (blízká)' },
];

// vytvoření tlačítek pro všechny kombinace
combinations.forEach((combo, i) => {
  const btn = document.createElement('button');
  btn.innerText = `Uloha 5 – ${combo.label}`;
  btn.id = `task-5-${i}`;
  btn.addEventListener('click', () => compareNumbers(combo.a, combo.b));
  tasks.appendChild(btn);
});
/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const multiplesOf13 = () => {
  console.clear();
  for (let i = 0; i <= 730; i += 13) {
    console.log(i);
  }
};

// tlačítko
const btn6 = document.createElement('button');
btn6.innerText = "Uloha 6 (násobky 13)";
btn6.id = "task-6";
btn6.addEventListener('click', multiplesOf13);
tasks.appendChild(btn6);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const circleArea = (radius) => {
  const area = Math.PI * radius * radius;
  results.innerText = `Obsah kruhu s r=${radius} je ${area.toFixed(2)}`;
};

// tlačítko
const btn7 = document.createElement('button');
btn7.innerText = "Uloha 7 (obsah kruhu)";
btn7.id = "task-7";
btn7.addEventListener('click', () => circleArea(10));
tasks.appendChild(btn7);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const coneVolume = (r, h) => {
  const volume = (Math.PI * r * r * h) / 3;
  results.innerText = `Objem kuželu s r=${r} a h=${h} je ${volume.toFixed(2)}`;
};

// tlačítko
const btn8 = document.createElement('button');
btn8.innerText = "Uloha 8 (objem kuželu)";
btn8.id = "task-8";
btn8.addEventListener('click', () => coneVolume(5, 12));
tasks.appendChild(btn8);
/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const isTriangle = (a, b, c) => {
  const valid = a + b > c && a + c > b && b + c > a;
  results.innerText = `a=${a}, b=${b}, c=${c} → ${valid ? 'ANO' : 'NE'}`;
  return valid;
};

// tlačítko
const btn9 = document.createElement('button');
btn9.innerText = "Uloha 9 (trojúhelník)";
btn9.id = "task-9";
btn9.addEventListener('click', () => isTriangle(3, 4, 5));
tasks.appendChild(btn9);

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
  results.innerText = '';
  if (!isTriangle(a, b, c)) {
    results.innerText = 'Nelze vytvořit trojúhelník';
    return;
  }
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  results.innerText = `Obsah trojúhelníka se stranami ${a}, ${b}, ${c} je ${area.toFixed(2)}`;
};

// tlačítko
const btn10 = document.createElement('button');
btn10.innerText = "Uloha 10 (Heron)";
btn10.id = "task-10";
btn10.addEventListener('click', () => heronArea(3, 4, 5));
tasks.appendChild(btn10);
