console.log('Ahoj světe');

const resultsEl = document.querySelector('#results');
const writeResult = (text, { append = false } = {}) => {
    resultsEl.textContent = append ? resultsEl.textContent + (resultsEl.textContent ? '\n' : '') + text : text;
};
const addTaskButton = (id, label, onClick) => {
    const btn = document.createElement('button');
    btn.id = `task-${id}`;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    document.querySelector('#tasks').appendChild(btn);
    return btn;
};

// 1) Pepe's age
const pepesAge = (birthYear) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const msg = `Pepe was born in ${birthYear} and is ${age} years old in ${currentYear}.`;
    console.log(msg);
    writeResult(msg);
    return age;
};

addTaskButton(1, "Úloha 1 - Pepe's age", () => pepesAge(2004));

// 2) WTF – převody C <-> F
const cToF = (c) => (c * 9) / 5 + 32;
const fToC = (f) => ((f - 32) * 5) / 9;

const showCtoF = (c) => {
    const f = cToF(c);
    const msg = `${c}°C = ${f.toFixed(2)}°F`;
    console.log(msg); writeResult(msg);
    return f;
};

const showFtoC = (f) => {
    const c = fToC(f);
    const msg = `${f}°F = ${c.toFixed(2)}°C`;
    console.log(msg); writeResult(msg);
    return c;
};

addTaskButton(2, 'Úloha 2.1 - 20°C → °F', () => showCtoF(20));
addTaskButton(2.1, 'Úloha 2.2 - 68°F → °C', () => showFtoC(68));

// 4) %CENSORED%
const percentOf = (part, whole) => {
    if (whole === 0) {
        const msg = 'Nelze dělit nulou (second argument = 0).';
        console.error(msg); writeResult(msg); return null;
    }
    const pct = (part / whole) * 100;
    const msg = `${part} je ${pct.toFixed(2)}% z ${whole}.`;
    console.log(msg); writeResult(msg); return pct;
};

addTaskButton(4, 'Úloha 4 - 21 je ? % z 42', () => percentOf(21, 42));

// 5) Kdo s koho
const compareNumbers = (a, b) => {
    const msg = a === b
        ? `${a} a ${b} se rovnají.`
        : `${a > b ? a : b} je větší než ${a > b ? b : a}.`;
    console.log(msg); writeResult(msg); return a === b ? 0 : (a > b ? 1 : -1);
};

addTaskButton(5, 'Úloha 5.1 - porovnej 3.14 a 22/7', () => compareNumbers(3.14, 22 / 7));
addTaskButton(5.1, 'Úloha 5.2 - porovnej 10 a 10', () => compareNumbers(10, 10));

// 6) Násobky 13
const listMultiplesOf13 = () => {
    const out = [];
    for (let i = 0; i <= 730; i += 13) out.push(i);
    const msg = `Násobky 13 (0..730):\n${out.join(', ')}`;
    console.log(msg); writeResult(msg); return out;
};

addTaskButton(6, 'Úloha 6 - násobky 13', listMultiplesOf13);

// 7) Obsah kružnice
const circleArea = (r) => {
    if (r < 0) { writeResult('Poloměr nesmí být záporný.'); return null; }
    const area = Math.PI * r * r;
    const msg = `Obsah kružnice o r=${r} je ${area.toFixed(2)}.`;
    console.log(msg); writeResult(msg); return area;
};

addTaskButton(7, 'Úloha 7 - obsah kružnice r=10', () => circleArea(10));

// 8) Objem kuželu
const coneVolume = (r, h) => {
    if (r < 0 || h < 0) { writeResult('r a h musí být nezáporné.'); return null; }
    const V = (Math.PI * r * r * h) / 3;
    const msg = `Objem kuželu r=${r}, h=${h} je ${V.toFixed(2)}.`;
    console.log(msg); writeResult(msg); return V;
};

addTaskButton(8, 'Úloha 8 - objem kuželu r=5, h=12', () => coneVolume(5, 12));

// 9) Je to trojúhelník?
const isTriangle = (a, b, c) => {
    const valid = a + b > c && a + c > b && b + c > a && a > 0 && b > 0 && c > 0;
    const msg = `Strany a=${a}, b=${b}, c=${c} → ${valid ? 'ANO' : 'NE'}, lze sestrojit trojúhelník.`;
    console.log(msg); writeResult(msg); return valid;
};

addTaskButton(9, 'Úloha 9.1 - je to trojúhelník? (3,4,5)', () => isTriangle(3, 4, 5));
addTaskButton(9.1, 'Úloha 9.2 - je to trojúhelník? (1,2,3)', () => isTriangle(1, 2, 3));

// 10) Heronův vzorec
const heronArea = (a, b, c) => {
    if (!isTriangle(a, b, c)) { return null; }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const msg = `Obsah trojúhelníka se stranami a=${a}, b=${b}, c=${c} je ${area.toFixed(2)}.`;
    console.log(msg); writeResult(msg); return area;
};

addTaskButton(10, 'Úloha 10.1 - Heron (3,4,5)', () => heronArea(3, 4, 5));
addTaskButton(10.1, 'Úloha 10.2 - Heron (7,8,9)', () => heronArea(7, 8, 9));