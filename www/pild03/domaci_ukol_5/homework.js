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


/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here
const pepesAge = () => {
    const birthYear = 2005;
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    console.log(`Pepe is ${age} years old.`);
};

const btn1 = document.createElement('button');
btn1.innerText = "Úloha 1 (Pepe's age)";
btn1.id = "task-1";
btn1.addEventListener('click', pepesAge);
tasks.appendChild(btn1);




/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const wtf = () => {
    const input = prompt("Enter temperature (e.g. 20C or 68F):");
    if (!input) {
        console.log("No input provided.");
        return;
    }
    const value = parseFloat(input);
    const unit = input.trim().slice(-1).toUpperCase();
    if (isNaN(value) || (unit !== 'C' && unit !== 'F')) {
        console.log("Invalid input format. Use e.g. 20C or 68F.");
        return;
    }
    let convert;
    let message;
    if (unit === 'C') {
        convert = value * 9 / 5 + 32;
        message = `${value}°C = ${convert.toFixed(1)}°F`;
    } else {
        convert = (value - 32) * 5 / 9;
        message = `${value}°F = ${convert.toFixed(1)}°C`;
    }
    console.log(message);
};

const btn2 = document.createElement('button');
btn2.innerText = "Úloha 2 (WTF)";
btn2.id = "task-2";
btn2.addEventListener('click', wtf);
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
// Solution here



const pepesAge1 = (birthYear) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const message = `Pepe is ${age} years old.`;
    console.log(message);
};

const wtf1 = (input) => {
    if (typeof input !== 'string') {
        console.log("Use wtf1('20C') or wtf1('68F')");
        return;
    }
    const trimmed = input.trim();
    const value1 = parseFloat(trimmed);
    const unit = trimmed.slice(-1).toUpperCase();

    if (Number.isNaN(value1) || (unit !== 'C' && unit !== 'F')) {
        console.log("Invalid input. Use e.g., wtf1('20C') or wtf1('68F')");
        return;
    }

    if (unit === 'C') {
        const fahrenheit = value1 * 9 / 5 + 32;
        console.log(`${value1}°C = ${fahrenheit.toFixed(1)}°F`);
        console.log(`${fahrenheit.toFixed(1)}°F = ${value1.toFixed(1)}°C`);
    } else {
        const celsius = (value1 - 32) * 5 / 9;
        console.log(`${value1}°F = ${celsius.toFixed(1)}°C`);
        console.log(`${celsius.toFixed(1)}°C = ${value1.toFixed(1)}°F`);
    }
};

const btnPepe = document.createElement('button');
btnPepe.innerText = "Úloha 3 (Pepe's age)";
btnPepe.id = "task-3a";
btnPepe.addEventListener('click', () => pepesAge1(2000));
tasks.appendChild(btnPepe);

const btnWTF = document.createElement('button');
btnWTF.innerText = "Úloha 3 (WTF)";
btnWTF.id = "task-3b";
btnWTF.addEventListener('click', () => {
    results.innerText = "Call in console: wtf1('20C') or wtf1('68F')";
});
tasks.appendChild(btnWTF);





/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla.
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2);
 * Pozor na dělení nulou!
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const censored =  (num1, num2) => {
if (num2 == 0){
    results.innerText = "Pozor! dělení 0";
} if (num1 < 0 || num2 <0) {
    results.innerText = "Pozor záporná čísla";
} if (isNaN(num1) || isNaN(num2)){
    results.innerText = "Pozor není číslo";
}
else {
    const percent = (num1/num2)*100
    results.innerText =`${num1} je ${percent.toFixed(2)}% z ${num2}`;
} 
}
const censore = document.createElement('button');
censore.innerText = "Úloha 4 (%CENSORED%)";
censore.id = "task-4";
censore.addEventListener('click', () => {
    censored(24,72)
});
tasks.appendChild(censore);





/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají.
 *
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const compare = (n1,n2) =>{
    if(isNaN(n1)||isNaN(n2)){
        results.innerText = "Pozor není číslo";

    } if(n1 > n2){
        results.innerText = `${n1} je větší než ${n2}`;
    } if(n1<n2){
        results.innerText = `${n2} je větší než ${n1}`;
    } else{
        results.innerText = `${n1} se rovná ${n2}`;
    }

}
const comparation = document.createElement('button');
comparation.innerText = "Úloha 5 (Kdo z koho)";
comparation.id = "task-5";
comparation.addEventListener('click', () => {
    compare(24,72)
});
tasks.appendChild(comparation);




/**
 * 6) I can{} cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const pattern = ()=>{
    const arr = [];
    for (let index = 0; index <=56 ; index++) {
        const num = index*13;
        arr.push(num);    
    }
    results.innerText = arr;
}
const p = document.createElement('button');
p.innerText = "Úloha 6 (I can{} cleary see the pattern)";
p.id = "task-6";
p.addEventListener('click',pattern);
tasks.appendChild(p);



/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const circleArea = (r) => {
  const area = Math.PI * r * r;
  const message = `Circle with radius ${r} has area ${area.toFixed(2)}`;
  console.log(message);
  results.innerText = message;
};

const btn7 = document.createElement('button');
btn7.innerText = "Úloha 7 (Around and about)";
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
  const message = `Cone with radius ${r} and height ${h} has volume ${volume.toFixed(2)}`;
  console.log(message);
  results.innerText = message;
};

const btn8 = document.createElement('button');
btn8.innerText = "Úloha 8 (Another dimension)";
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
  const possible = a + b > c && a + c > b && b + c > a;
  const message = `Sides: ${a}, ${b}, ${c} → ${possible ? "Yes" : "No"}`;
  console.log(message);
  results.innerText = message;
  return possible;
};

const btn9 = document.createElement('button');
btn9.innerText = "Úloha 9 (Not sure if triangle)";
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
const triangleArea = (a, b, c) => {
  if (!isTriangle(a, b, c)) {
    const errorMsg = "Cannot form triangle with given sides!";
    console.error(errorMsg);
    results.innerText = errorMsg;
    return;
  }

  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const message = `Triangle with sides ${a}, ${b}, ${c} has area ${area.toFixed(2)}`;
  console.log(message);
  results.innerText = message;
};
const btn10 = document.createElement('button');
btn10.innerText = "Úloha 10 (Heroic performance)";
btn10.id = "task-10";
btn10.addEventListener('click', () => triangleArea(3, 4, 5));
tasks.appendChild(btn10);