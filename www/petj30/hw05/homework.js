// úkol 0
console.log('Ahoj světe');


let tasks = document.getElementById('tasks');
let results = document.getElementById('results');


function writeResult(text) {
  results.innerText += text + "\n";
}

// úkol 1
function pepesAge() {
  let birthYear = 2003;
  let currentYear = new Date().getFullYear();
  let age = currentYear - birthYear;
  let text = "Pepe se narodil v roce " + birthYear + ", takže mu je " + age + " let.";
  console.log(text);
  writeResult(text);
}
let btn1 = document.createElement('button');
btn1.innerText = "Úkol 1 – Pepe's age";
btn1.onclick = pepesAge;
tasks.appendChild(btn1);


// úkol 2
function cToF() {
  let c = 20;
  let f = (c * 9) / 5 + 32;
  let text = c + "°C = " + f + "°F";
  console.log(text);
  writeResult(text);
}

function fToC() {
  let f = 68;
  let c = ((f - 32) * 5) / 9;
  let text = f + "°F = " + c.toFixed(2) + "°C";
  console.log(text);
  writeResult(text);
}

// úkol 2
let btn2a = document.createElement('button');
btn2a.innerText = "Úkol 2 – 20°C → °F";
btn2a.onclick = cToF;
tasks.appendChild(btn2a);

let btn2b = document.createElement('button');
btn2b.innerText = "Úkol 2 – 68°F → °C";
btn2b.onclick = fToC;
tasks.appendChild(btn2b);


// úkol 3
function demo() {
  pepesAge();
  cToF();
  fToC();
}

let btn3 = document.createElement('button');
btn3.innerText = "Úkol 3 – Demo";
btn3.onclick = demo;
tasks.appendChild(btn3);


// úkol 4
function percentResult() {
  let a = 21;
  let b = 42;

  if (b === 0) {
    writeResult("Nelze dělit nulou!");
    return;
  }

  let result = (a / b) * 100;
  let text = a + " je " + result.toFixed(2) + "% z " + b;
  console.log(text);
  writeResult(text);
}

let btn4 = document.createElement('button');
btn4.innerText = "Úkol 4 – %CENSORED%";
btn4.onclick = percentResult;
tasks.appendChild(btn4);


// úkol 5
function compareNumbers() {
  let a = 12;
  let b = 15;

  let text = "";

  if (a > b) {
    text = a + " je větší než " + b;
  } else if (a < b) {
    text = a + " je menší než " + b;
  } else {
    text = a + " a " + b + " se rovnají";
  }

  console.log(text);
  writeResult(text);
}

let btn5 = document.createElement('button');
btn5.innerText = "Úkol 5 – Kdo s koho";
btn5.onclick = compareNumbers;
tasks.appendChild(btn5);


// úkol 6
function multiplesOf13() {
  let text = "Násobky 13 do 730:\n";

  for (let i = 0; i <= 730; i += 13) {
    text += i + " ";
  }

  console.log(text);
  writeResult(text);
}

let btn6 = document.createElement('button');
btn6.innerText = "Úkol 6 – násobky 13";
btn6.onclick = multiplesOf13;
tasks.appendChild(btn6);


// úkol 7
function circleArea() {
  let r = 10; // poloměr kruhu
  let area = Math.PI * r * r;
  let text = "Kružnice s poloměrem " + r + " má obsah " + area.toFixed(2);
  console.log(text);
  writeResult(text);
}

let btn7 = document.createElement('button');
btn7.innerText = "Úkol 7 – obsah kruhu";
btn7.onclick = circleArea;
tasks.appendChild(btn7);


function coneVolume() {
  let r = 5;  // poloměr
  let h = 12; // výška

  let volume = (1 / 3) * Math.PI * r * r * h;
  let text = "Kužel s poloměrem " + r + " a výškou " + h + " má objem " + volume.toFixed(2);
  console.log(text);
  writeResult(text);
}

let btn8 = document.createElement('button');
btn8.innerText = "Úkol 8 – objem kuželu";
btn8.onclick = coneVolume;
tasks.appendChild(btn8);

// úkol 8
function isTriangle() {
  let a = 3;
  let b = 4;
  let c = 5;

  let text = "Strany: " + a + ", " + b + ", " + c + " → ";

  if (a + b > c && a + c > b && b + c > a) {
    text += "ANO, lze vytvořit trojúhelník.";
    console.log("true");
  } else {
    text += "NE, nelze vytvořit trojúhelník.";
    console.log("false");
  }

  writeResult(text);
}

// úkol 9
let btn9 = document.createElement('button');
btn9.innerText = "Úkol 9 – trojúhelník ano/ne";
btn9.onclick = isTriangle;
tasks.appendChild(btn9);

function triangleArea() {
  let a = 3;
  let b = 4;
  let c = 5;

  if (!(a + b > c && a + c > b && b + c > a)) {
    writeResult("Trojúhelník se stranami " + a + ", " + b + ", " + c + " nelze sestrojit!");
    return;
  }

  let s = (a + b + c) / 2;
  let area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  let text = "Trojúhelník se stranami " + a + ", " + b + ", " + c + 
             " má obsah " + area.toFixed(2);
  console.log(text);
  writeResult(text);
}

// úkol 10
let btn10 = document.createElement('button');
btn10.innerText = "Úkol 10 – Heronův vzorec";
btn10.onclick = triangleArea;
tasks.appendChild(btn10);


