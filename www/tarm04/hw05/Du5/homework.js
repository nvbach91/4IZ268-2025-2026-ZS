console.log("Ahoj světe");

const tasks = document.querySelector("#tasks");
const results = document.querySelector("#results");

function addCard(title, inputs, action) {
    const card = document.createElement("div");
    card.className = "card";

    const h3 = document.createElement("h3");
    h3.textContent = title;
    card.appendChild(h3);

    const inputEls = inputs.map((i) => {
        const el = document.createElement("input");
        el.placeholder = i.label;
        el.value = i.default;
        card.appendChild(el);
        return el;
    });

    const btn = document.createElement("button");
    btn.textContent = "Spustit";
    btn.addEventListener("click", () => {
        const values = inputEls.map((el) => parseFloat(el.value));
        action(...values);
    });

    card.appendChild(btn);
    tasks.appendChild(card);
}

addCard("Pepe's age", [{ label: "(rok)", default: 1996 }], (year) => {
    const age = new Date().getFullYear() - year;
    results.textContent = `Pepe má ${age} let.`;
});

addCard(
    "WTF (C ↔ F)",
    [
        { label: "(C)", default: 20 },
        { label: "(F)", default: 68 },
    ],
    (c, f) => {
        const fRes = (c * 9) / 5 + 32;
        const cRes = ((f - 32) * 5) / 9;
        results.textContent = `${c}°C = ${fRes.toFixed(1)}°F, ${f}°F = ${cRes.toFixed(1)}°C`;
    }
);

addCard(
    "%CENSORED%",
    [
        { label: "(no. kolik)", default: 24 },
        { label: "(no. z kolika)", default: 48 },
    ],
    (a, b) => {
        if (b === 0) return (results.textContent = "Nelze dělit nulou!");
        const percent = ((a / b) * 100).toFixed(2);
        results.textContent = `${a} je ${percent}% z ${b}`;
    }
);

addCard(
    "Kdo s koho",
    [
        { label: "(no. 1)", default: 10 },
        { label: "(no. 2)", default: 12 },
    ],
    (a, b) => {
        if (a > b) results.textContent = `${a} je větší než ${b}`;
        else if (a < b) results.textContent = `${a} je menší než ${b}`;
        else results.textContent = `${a} a ${b} jsou si rovny.`;
    }
);

addCard(
    "I can cleary see the pattern",
    [
        { label: "(násobky)", default: 13 },
        { label: "(max)", default: 730 },
    ],
    (step, max) => {
        const arr = [];
        for (let i = 0; i <= max; i += step) arr.push(i);
        results.textContent = arr.join(", ");
    }
);

addCard("Around and about", [{ label: "(r)", default: 23 }], (r) => {
    const area = Math.PI * r * r;
    results.textContent = `Obsah kružnice: ${area.toFixed(2)}`;
});


addCard(
    "Another dimension",
    [
        { label: "(h)", default: 12 },
        { label: "(r)", default: 5 },
    ],
    (h, r) => {
        const v = (Math.PI * r * r * h) / 3;
        results.textContent = `Objem kuželu: ${v.toFixed(2)}`;
    }
);


const isTriangle = (a, b, c) => a + b > c && a + c > b && b + c > a;
addCard(
    "Not sure if triangle",
    [
        { label: "(a)", default: 3 },
        { label: "(b)", default: 4 },
        { label: "(c)", default: 5 },
    ],
    (a, b, c) => {
        results.textContent = isTriangle(a, b, c)
            ? `ANO, lze vytvořit trojúhelník (${a}, ${b}, ${c})`
            : "NE, nelze vytvořit trojúhelník.";
    }
);


addCard(
    "Heroic performance",
    [
        { label: "(a)", default: 3 },
        { label: "(b)", default: 4 },
        { label: "(c)", default: 5 },
    ],
    (a, b, c) => {
        if (!isTriangle(a, b, c))
            return (results.textContent = "Nelze vytvořit trojúhelník!");
        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        results.textContent = `Obsah trojúhelníku: ${area.toFixed(2)}`;
    }
);
