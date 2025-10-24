const answers = document.getElementById("answers");

/* HOMEWORK */
/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu ohledně věku Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů. Pro názvy proměnných používejte smysluplnou 
 * angličtinu.
 */
// Solution here

const pepesAge = 1991;
const thisYear = new Date().getFullYear();

document.getElementById("1").addEventListener("click", () => {
    const age = getAge(pepesAge);
    answers.innerHTML = `Pepe má ${age} let.`;
});

console.log(`Pepe ma ${thisYear - pepesAge} let`);





/**
 * 2) WTF (wow, that's fun). Vypište teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Výpočet probíhá takto:
 *     z C na F: vynásobit devíti, vydělit pěti a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit pěti a vydělit devítkou. 
 */
// Solution here

const celsiusValue = 33;
const fahrenheitValue = 99;

const convertCToF = (celsius) => (celsius * 9) / 5 + 32;
const convertFToC = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

document.getElementById("2").addEventListener("click", () => {
    const cToFValue = convertCToF(celsiusValue);
    const fToCValue = convertFToC(fahrenheitValue);

    const resultText = `
        ${celsiusValue}°C = ${cToFValue.toFixed(2)}°F<br>
        ${fahrenheitValue}°F = ${fToCValue.toFixed(2)}°C
    `;

    answers.innerHTML = resultText;
});

console.log(`${celsiusValue}°C = ${convertCToF(celsiusValue).toFixed(2)}°F`);
console.log(`${fahrenheitValue}°F = ${convertFToC(fahrenheitValue).toFixed(2)}°C`);




/**
 * 3) Funkce function fonction funktio. Vemte předchozí úlohy a udělejte z nich funkce. Tj. vytvořte funkce, 
 * které přijímají argumenty, a na základě argumentů po zavolání vypíše výsledek na konzoli. 
 * Párkrát zavolejte tyto funkce s různými argumenty. V konzoli také vyzkoušejte, zda fungují vaše funkce. 
 */
// Solution here

const getAge = (birthYear) => {
    return new Date().getFullYear() - birthYear;
};

const convertCelsiusToFahrenheit = (celsiusValue) => {
    return celsiusValue * 9 / 5 + 32;
};
const convertFahrenheitToCelsius = (fahrenheihtValue) => {
    return (fahrenheihtValue - 32) * 5 / 9;
};





/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla 
 * v procentech. Výsledek vypište do konzole, např. 21 je 50% z 42. Pro zkrácení / zaokrouhlování desetinných 
 * míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); Pozor na dělení nulou! 
 */
// Solution here

const getPercentage = (a, b) => {
    if (b === 0) {
        return 'Nelze delit nulou';
    }
    return `Podil cisla ${a} z cisla ${b} je ${(a / b * 100).toFixed(2)}%`;
};

document.getElementById("4").addEventListener("click", () => {
    const result = getPercentage(21, 42);
    answers.innerHTML = result;
});





/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí ten větší z nich. Pokud se čísla 
 * rovnají, vypište, že se rovnají. Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky. Zkuste 
 * je párkrát zavolat v kódu a výsledky uložit do proměnných. 
 */
// Solution here

const compare = (a, b) => {
    if (a < b) {
        return b;
    }
    if (a > b) {
        return a;
    }
    return 'Cisla se rovnaji';
};

const result1 = compare(10, 10);
const result2 = compare(10, 12);
const result3 = compare(100, 12);

document.getElementById("5").addEventListener("click", () => {
    const result = compare(10, 12);
    answers.innerHTML = `Větší číslo je: ${result}`;
});





/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for loop. 
 */
// Solution here

for (let i = 0; i < 730; i += 13)

document.getElementById("6").addEventListener("click", () => {
    let output = "";
    for (let i = 0; i <= 730; i += 13) {
        output += `${i}, `;
    }
    answers.innerHTML = output.slice(0, -2);
});





/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 */
// Solution here

const getCircleArea = (radius) => {
    return Math.PI * radius ** 2;
};

document.getElementById("7").addEventListener("click", () => {
    const area = getCircleArea(5);
    answers.innerHTML = `Obsah kružnice o poloměru 5 je ${area.toFixed(2)}`;
});





/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 */
// Solution here

const getConeVolume = (height, radius) => {
    return Math.PI * radius ** 2 * height / 3;
};

document.getElementById("8").addEventListener("click", () => {
    const volume = getConeVolume(10, 5);
    answers.innerHTML = `Objem kuželu: ${volume.toFixed(2)}`;
});





/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek dá postavit trojúhelník, tj. vypíše buď true/yes nebo false/no. 
 */
// Solution here
const isTriangle = (a, b, c) => {
    return (a + b > c && a + c > b && b + c > a);
};

document.getElementById("9").addEventListener("click", () => {
    const result = isTriangle(3, 4, 5);
    answers.innerHTML = `${result ? "Ano, trojúhelník lze setrojit." : "Ne, trojúhelník nelze sestrojit."}`;
});





/**
 * 10) Heroic performance. Vytvořte funkci, která vypočte obsah trojúhelníka podle Heronova vzorce, 
 * tj. funkce dostane délky všech 3 stran. Použijte přitom předchozí validaci, tj. počítejte pouze, 
 * když to má smysl. Hint: funkce pro odmocninu je Math.sqrt() 
 */
// Solution here

const getTriangleArea = (a, b, c) => {
    if (!isTriangle(a, b, c)) {
        return `To není validní trojúhelník`;
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    return area;
};

document.getElementById("10").addEventListener("click", () => {
    const area = getTriangleArea(3, 4, 5);
    answers.innerHTML = `Obsah trojúhelníku je ${area.toFixed(2)}`;
});