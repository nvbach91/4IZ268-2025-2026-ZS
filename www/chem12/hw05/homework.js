/* HOMEWORK */
/**
 * 0) Pre-preparacion.
 * - Vytvořte HTML stránku s nadpisem h1 "JavaScript is awesome!" 
 * - Na stránce vytvořte místo pro umístění jednotlivých spouštěčů úkolů - tlačítek (tj. div, který má id s hodnotou "tasks" - <div id="tasks"></div>). 
 * - Na stránce vytvořte místo pro výpis výsledků úkolů (div, který má id s hodnotou "result" - <div id="results"></div>).
 * 
 * - Připojte tento homework.js soubor k vytvořené HTML stránce pomocí tagu <script> (viz LAB) a vyzkoušejte
 * console.log('Ahoj světe');
 * 
 */

console.log('Ahoj světe');





/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here

const birthYear = 2000;
const currentYear = new Date().getFullYear();
const age = currentYear - birthYear;
console.log(`Pepe is ${age} years old.`);


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const celsius = 20;
const fahrenheit = (celsius * 9) / 5 + 32;
console.log(`${celsius}°C = ${fahrenheit}°F`);

const fahrenheitValue = 68;
const celsiusValue = ((fahrenheitValue - 32) * 5) / 9;
console.log(`${fahrenheitValue}°F = ${celsiusValue}°C`);


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

const tasks = document.querySelector('#tasks');
const results = document.querySelector('#results');

function createButton(id, text, callback) {
  const btn = document.createElement('button');
  btn.id = id;
  btn.innerText = text;
  btn.addEventListener('click', callback);
  tasks.appendChild(btn);
}

const pepesAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old.`);
};
createButton('task-1', "Úloha 1 (Pepe's age)", () => pepesAge(2000));

const cToF = (c) => `${c}°C = ${(c * 9) / 5 + 32}°F`;
const fToC = (f) => `${f}°F = ${((f - 32) * 5) / 9}°C`;
createButton('task-2', "Úloha 2 (C↔F)", () => {
  console.log(cToF(20));
  console.log(fToC(68));
});


/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const percentOf = (a, b) => {
  results.innerText = b === 0 ? 'Ne 0!' : `${a} je ${(a / b * 100).toFixed(2)}% z ${b}`;
};
createButton('task-4', 'Úloha 4 (%CENSORED%)', () => percentOf(21, 42));




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
  results.innerText = a > b ? `${a} > ${b}` : a < b ? `${a} < ${b}` : `${a} = ${b}`;
};
createButton('task-5', 'Úloha 5 (Kdo s koho)', () => compareNumbers(3.5, 3.5));



/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here


const multiplesOf13 = () => {
  let text = '';
  for (let i = 0; i <= 730; i += 13) text += i + ' ';
  results.innerText = text.trim();
};
createButton('task-6', 'Úloha 6 (Násobky 13)', multiplesOf13);


/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here


const circleArea = (r) => {
  results.innerText = `Obsah kruhu s r=${r} je ${(Math.PI * r * r).toFixed(2)}`;
};
createButton('task-7', 'Úloha 7 (Obsah kruhu)', () => circleArea(5));


/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const coneVolume = (r, h) => {
  const v = (Math.PI * r * r * h) / 3;
  results.innerText = `Objem kuželu r=${r}, h=${h} je ${v.toFixed(2)}`;
};
createButton('task-8', 'Úloha 8 (Objem kuželu)', () => coneVolume(3, 10));




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
  results.innerText = `Strany ${a}, ${b}, ${c} → ${valid ? 'ANO' : 'NE'}`;
  return valid;
};
createButton('task-9', 'Úloha 9 (Je trojúhelník?)', () => isTriangle(3, 4, 5));

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
  if (!isTriangle(a, b, c)) {
    results.innerText = 'Nelze vytvořit trojúhelník!';
    return;
  }
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  results.innerText = `Obsah trojúhelníku: ${area.toFixed(2)}`;
};
createButton('task-10', 'Úloha 10 (Heronův vzorec)', () => heronArea(3, 4, 5));


