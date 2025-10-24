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

console.log("Ahoj Svete");

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození,
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných
 * používejte smysluplnou angličtinu.
 */
// Solution here

const birthYear = 2000;
const age = new Date().getFullYear() - birthYear;

console.log("Pepa má " + age + " rokov.");
console.log(`Pepa má ${age} rokov.`);

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak.
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32.
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9.
 */
// Solution here

const c = 23;
const f = (c * 9) / 5 + 32;
console.log(f);

const ft = 98;
const ce = ft - (32 * 5) / 9;
console.log(ce);

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

const pepaAge = (birthYear) => {
  const age = new Date().getFullYear() - birthYear;
  return `Pepa ma ${age} rokov.`;
};

const temp = (cel, far) => {
  const tempfar = (cel * 9) / 5 + 32;
  const tempcel = far - (32 * 5) / 9;
  return `${cel} C = ${tempfar} F; \n ${far} F= ${tempcel} C`;
};

const results = document.querySelector("#results");
const tasks = document.querySelector("#tasks");

const buttonPepasAge = document.createElement("button");
buttonPepasAge.innerText = "Pepov vek";
buttonPepasAge.setAttribute("id", "task-01");
buttonPepasAge.addEventListener("click", () => {
  results.innerText = pepaAge(2005);
});
tasks.appendChild(buttonPepasAge);

const buttonTemperature = document.createElement("button");
buttonTemperature.innerText = "Teplota";
buttonTemperature.setAttribute("id", "task-02");
buttonTemperature.addEventListener("click", () => {
  results.innerText = temp(20, 70);
});
tasks.appendChild(buttonTemperature);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla.
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2);
 * Pozor na dělení nulou!
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const percent = (a, b) => {
  if (b === 0) {
    return "delenie nulou nie";
  }
  result = (a / b) * 100;
  return result.toFixed(2) + "%";
};

const buttonPercent = document.createElement("button");
buttonPercent.innerText = "Percenta";
buttonPercent.setAttribute("id", "task-03");
buttonPercent.addEventListener("click", () => {
  results.innerText = percent(2, 3);
});
tasks.appendChild(buttonPercent);

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají.
 *
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const comparison = (a, b) => {
  if (a > b) {
    return `${a} je vacsie ako ${b}`;
  } else if (a < b) {
    return `${b} je vacsie ako ${a}`;
  } else if (a === b) {
    return "Cisla sa rovnaju";
  }
};

const buttonComparison = document.createElement("button");
buttonComparison.innerText = "porovnanie cisel(cele)";
buttonComparison.setAttribute("id", "task-04");
buttonComparison.addEventListener("click", () => {
  results.innerText = comparison(4.15, 4.16);
});
tasks.appendChild(buttonComparison);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const multiplication = () => {
  let mult = "";
  for (let i = 0; i <= 730; i += 13) {
    mult += i + " ";
  }
  return mult;
};

const buttonMultiplication = document.createElement('button');
buttonMultiplication.innerText = 'nasobky';
buttonMultiplication.setAttribute('id', 'task-07');
buttonMultiplication.addEventListener('click',() => {
    results.innerText = multiplication();
}) 
tasks.appendChild(buttonMultiplication);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

const circle = (radius) => {
     let calculateVolume = 2*Math.PI*radius;
     return `${calculateVolume}`;
} 

const buttonCircle = document.createElement('button');
buttonCircle.innerText = 'obsah kruznice';
buttonCircle.setAttribute('id','task-08');
buttonCircle.addEventListener( 'click', () => {
    results.innerText = circle(6);
})
tasks.appendChild(buttonCircle);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

const cone = (height, radius) => {
    let calculateVolume = (1/3)*(Math.PI)*(radius**2)* height;
    return `${calculateVolume}`;
}

const buttonCone = document.createElement('button');
buttonCone.innerText = 'objem kuzela';
buttonCone.setAttribute('id', 'task-09');
buttonCone.addEventListener( 'click', () => {
    results.innerText = cone(20,5);
})
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

const triangle = (a,b,c) => {
    if (a+b>c && a+c>b && b+c>a){
        console.log('ano ');
        return true;
    } else {
        console.log('nie ');
        return false;
    }
}

const buttonTriangle = document.createElement('button');
buttonTriangle.innerText = 'je to trojuholnik?';
buttonTriangle.setAttribute('id','task-10');
buttonTriangle.addEventListener('click', () =>{
    results.innerText= triangle(2,3,4);
})
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


const calculateVolume = (a,b,c) => {
    if (triangle(a,b,c) != true){
        return `toto neni trojuholnik`;
    }
    const s = (a+b+c) / 2;
    const result = Math.sqrt(s*(s-a)*(s-b)*(s-c));
    return result;
}

const buttonCalculateVolume = document.createElement('button');
buttonCalculateVolume.innerText = 'Obsah trojuholnika';
buttonCalculateVolume.setAttribute('id','task-11');
buttonCalculateVolume.addEventListener('click', () =>{
    results.innerText = calculateVolume(4,2,3);
})
tasks.appendChild(buttonCalculateVolume);