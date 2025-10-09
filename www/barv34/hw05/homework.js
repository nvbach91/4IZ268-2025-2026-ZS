console.log('Ahoj světe');

const resultsEl = document.querySelector('#results');
const tasksEl = document.querySelector('#tasks');

const printResult = (text) => {
    resultsEl.textContent = String(text);
};

const ensureGroup = (groupId, title) => {
    let g = tasksEl.querySelector(`[data-group="${groupId}"]`);
    if (!g) {
        g = document.createElement('section');
        g.dataset.group = groupId;

        Object.assign(g.style, {
            border: '1px solid #eee',
            borderRadius: '12px',
            background: '#fff',
            padding: '12px',
            display: 'grid',
            gap: '12px',
        });

        if (title) {
            const h2 = document.createElement('h2');
            h2.textContent = title;
            Object.assign(h2.style, { margin: '0', fontSize: '18px' });
            g.appendChild(h2);
        }

        const buttons = document.createElement('div');
        buttons.className = 'group-buttons';
        Object.assign(buttons.style, {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
        });

        const items = document.createElement('div');
        items.className = 'group-items';
        Object.assign(items.style, {
            display: 'grid',
            gap: '10px',
        });

        g.appendChild(buttons);
        g.appendChild(items);
        tasksEl.appendChild(g);
    }
    return g;
};

const addTaskButton = (id, label, onClick, groupId = null, groupTitle = null) => {
    const btn = document.createElement('button');
    btn.id = id;
    btn.textContent = label;
    btn.addEventListener('click', onClick);

    if (groupId) {
        const g = ensureGroup(groupId, groupTitle);
        g.querySelector('.group-buttons').appendChild(btn);
    } else {
        tasksEl.appendChild(btn);
    }
};

const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
};

const addTaskUI = ({ id, title, inputs = [], run, groupId = null, groupTitle = null }) => {
    const card = document.createElement('div');
    card.className = 'task';

    const h = document.createElement('h3');
    h.textContent = title;
    card.appendChild(h);

    const rows = document.createElement('div');
    rows.className = 'row';
    const refs = {};
    inputs.forEach((inp) => {
        const el = document.createElement('input');
        el.type = inp.type || 'text';
        el.placeholder = inp.placeholder || inp.name;
        if (typeof inp.value !== 'undefined') el.value = inp.value;
        el.id = `${id}-${inp.name}`;
        refs[inp.name] = el;
        rows.appendChild(el);
    });
    if (inputs.length) card.appendChild(rows);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const btn = document.createElement('button');
    btn.id = id;
    btn.textContent = 'Spustit';
    btn.addEventListener('click', () => {
        try {
            const args = inputs.map((i) => {
                if (i.type === 'number') {
                    const n = toNumber(refs[i.name].value);
                    if (Number.isNaN(n)) throw new Error(`Argument "${i.name}" musí být číslo.`);
                    return n;
                }
                return refs[i.name].value;
            });
            const out = run(...args);
            if (typeof out !== 'undefined') printResult(out);
        } catch (e) {
            printResult(e.message || String(e));
        }
    });
    actions.appendChild(btn);
    card.appendChild(actions);

    if (groupId) {
        const g = ensureGroup(groupId, groupTitle);
        g.querySelector('.group-items').appendChild(card);
    } else {
        tasksEl.appendChild(card);
    }
};

/* 1) Pepe's age */
const getAge = (birthYear) => new Date().getFullYear() - birthYear;
const task1 = () => {
    const birthYear = 2000;
    const age = getAge(birthYear);
    const sentence = `Pepa se narodil v roce ${birthYear} a je mu ${age} let.`;
    console.log(sentence);
    printResult(sentence);
};
addTaskButton('task-1', "Demo (2000)", task1, '1', "Pepe's age");
addTaskUI({
    id: 'task-1-ui',
    title: "(rok)",
    inputs: [{ name: 'birthYear', type: 'number', value: 2000 }],
    run: (birthYear) => {
        const age = getAge(birthYear);
        const s = `Pepa se narodil v roce ${birthYear} a je mu ${age} let.`;
        console.log(s);
        return s;
    },
    groupId: '1'
});

/* 2) WTF (C ↔ F) */
const cToF = (c) => (c * 9) / 5 + 32;
const fToC = (f) => ((f - 32) * 5) / 9;
const task2 = () => {
    const c = 20; const f = 68;
    const left = `${c}°C = ${cToF(c).toFixed(2)}°F`;
    const right = `${f}°F = ${fToC(f).toFixed(2)}°C`;
    console.log(left, '|', right);
    printResult(left + ' | ' + right);
};
addTaskButton('task-2', 'Demo (20 ; 68)', task2, '2', 'WTF (C ↔ F)');
addTaskUI({
    id: 'task-2-ui',
    title: '(C ; F)',
    inputs: [
        { name: 'c', type: 'number', value: 20 },
        { name: 'f', type: 'number', value: 68 },
    ],
    run: (c, f) => `${c}°C = ${cToF(c).toFixed(2)}°F | ${f}°F = ${fToC(f).toFixed(2)}°C`,
    groupId: '2'
});

/* 4) %CENSORED% */
const percentOf = (a, b) => {
    if (typeof a !== 'number' || typeof b !== 'number' || Number.isNaN(a) || Number.isNaN(b)) {
        return 'Chyba: argumenty musí být čísla';
    }
    if (b === 0) return 'Chyba: nelze dělit nulou (b = 0)';
    return `${a} je ${(a / b * 100).toFixed(2)}% z ${b}`;
};
const task4 = () => printResult(percentOf(21, 42));
addTaskButton('task-4', 'Demo (21 ; 42)', task4, '4', '%CENSORED%');
addTaskUI({
    id: 'task-4-ui',
    title: '(no. kolik ; no. z kolika)',
    inputs: [
        { name: 'a', type: 'number', value: 21 },
        { name: 'b', type: 'number', value: 42 },
    ],
    run: (a, b) => percentOf(a, b),
    groupId: '4'
});

/* 5) Kdo s koho */
const greaterOf = (a, b) => {
    if (a > b) return `${a} > ${b}`;
    if (a < b) return `${b} > ${a}`;
    return `${a} = ${b}`;
};
const task5a = () => printResult(greaterOf(10, 10));
const task5b = () => printResult(greaterOf(10.5, 10.49));
const task5c = () => printResult(greaterOf(1/3, 0.3));
addTaskButton('task-5a', 'Demo 10 vs 10', task5a, '5', 'Kdo s koho');
addTaskButton('task-5b', 'Demo 10.5 vs 10.49', task5b, '5');
addTaskButton('task-5c', 'Demo 1/3 vs 0.3', task5c, '5');
addTaskUI({
    id: 'task-5-ui',
    title: '(no. 1 ; no. 2)',
    inputs: [
        { name: 'a', type: 'number', value: 10 },
        { name: 'b', type: 'number', value: 12 },
    ],
    run: (a, b) => greaterOf(a, b),
    groupId: '5'
});

/* 6) I can cleary see the pattern */
const multiplesOf13 = () => {
    const arr = [];
    for (let i = 0; i <= 730; i += 13) arr.push(i);
    return arr;
};
const task6 = () => {
    const list = multiplesOf13();
    console.log('Násobky 13:', list);
    printResult(list.join(', '));
};
addTaskButton('task-6', 'Demo (13 ; 730)', task6, '6', 'I can cleary see the pattern');
addTaskUI({
    id: 'task-6-ui',
    title: '(násobky ; max)',
    inputs: [
        { name: 'step', type: 'number', value: 13 },
        { name: 'max', type: 'number', value: 730 },
    ],
    run: (step, max) => {
        if (step <= 0) throw new Error('Krok musí být kladné číslo.');
        const out = [];
        for (let i = 0; i <= max; i += step) out.push(i);
        console.log('Sekvence:', out);
        return out.join(', ');
    },
    groupId: '6'
});

/* 7) Around and about */
const circleArea = (r) => {
    if (r < 0) return 'Chyba: poloměr musí být nezáporný';
    return Math.PI * r * r;
};
const task7 = () => printResult(`S (r=10) = ${circleArea(10).toFixed(2)}`);
addTaskButton('task-7', 'Demo (10)', task7, '7', 'Around and about');
addTaskUI({
    id: 'task-7-ui',
    title: '(r)',
    inputs: [{ name: 'r', type: 'number', value: 10 }],
    run: (r) => {
        const v = circleArea(r);
        if (typeof v === 'string') return v;
        return `S (r=${r}) = ${v.toFixed(2)}`;
    },
    groupId: '7'
});

/* 8) Another dimension */
const coneVolume = (h, r) => {
    if (h < 0 || r < 0) return 'Chyba: výška i poloměr musí být nezáporné';
    return (Math.PI * r * r * h) / 3;
};
const task8 = () => printResult(`V (h=12, r=5) = ${coneVolume(12, 5).toFixed(2)}`);
addTaskButton('task-8', 'Demo (12 ; 5)', task8, '8', 'Another dimension');
addTaskUI({
    id: 'task-8-ui',
    title: '(h ; r)',
    inputs: [{ name: 'h', type: 'number', value: 12 }, { name: 'r', type: 'number', value: 5 }],
    run: (h, r) => {
        const v = coneVolume(h, r);
        if (typeof v === 'string') return v;
        return `V (h=${h}, r=${r}) = ${v.toFixed(2)}`;
    },
    groupId: '8'
});

/* 9) Not sure if triangle */
const isTriangle = (a, b, c) => (a + b > c && a + c > b && b + c > a);
const task9 = () => {
    const a = 3, b = 4, c = 5; // demo
    const valid = isTriangle(a, b, c);
    const msg = `a=${a}, b=${b}, c=${c} → ${valid ? 'ANO' : 'NE'}`;
    console.log(msg);
    printResult(msg);
};
addTaskButton('task-9', 'Demo (3 ; 4 ; 5)', task9, '9', 'Not sure if triangle');
addTaskUI({
    id: 'task-9-ui',
    title: '(a ; b ; c)',
    inputs: [
        { name: 'a', type: 'number', value: 3 },
        { name: 'b', type: 'number', value: 4 },
        { name: 'c', type: 'number', value: 5 },
    ],
    run: (a, b, c) => `a=${a}, b=${b}, c=${c} → ${isTriangle(a, b, c) ? 'ANO' : 'NE'}`,
    groupId: '9'
});

/* 10) Heroic performance */
const heronArea = (a, b, c) => {
    if (!isTriangle(a, b, c)) {
        return { ok: false, message: 'Chyba: hodnoty netvoří platný trojúhelník.' };
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    return { ok: true, area };
};
const task10 = () => {
    const a = 3, b = 4, c = 5; // demo
    const res = heronArea(a, b, c);
    if (!res.ok) {
        printResult(res.message);
        return;
    }
    printResult(`a=${a}, b=${b}, c=${c} → S = ${res.area.toFixed(2)}`);
};
addTaskButton('task-10', 'Demo (3 ; 4 ; 5)', task10, '10', 'Heroic performance');
addTaskUI({
    id: 'task-10-ui',
    title: '(a ; b ; c)',
    inputs: [
        { name: 'a', type: 'number', value: 3 },
        { name: 'b', type: 'number', value: 4 },
        { name: 'c', type: 'number', value: 5 },
    ],
    run: (a, b, c) => {
        const res = heronArea(a, b, c);
        if (!res.ok) return res.message;
        return `a=${a}, b=${b}, c=${c} → S = ${res.area.toFixed(2)}`;
    },
    groupId: '10'
});
