console.log("Ahoj");

const tasksDiv = document.getElementById("tasks");
const resultsDiv = document.getElementById("results");

// Pepík

function pepe(birthYear) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const message = "Pepe is " + age + " years old.";
    console.log(message);

    if (resultsDiv) {
        const div = document.createElement("div");
        div.innerText = message;
        resultsDiv.prepend(div);
    }
}

// Převody teploty
 
function temperatureCtoF(celsius) {
    const fahrenheit = (celsius * 9) / 5 + 32;
    const message = celsius + " °C = " + fahrenheit + " °F";
    console.log(message);

    if (resultsDiv) {
        const div = document.createElement("div");
        div.innerText = message;
        resultsDiv.prepend(div);
    }
}

function temperatureFtoC(fahrenheit) {
    const celsius = ((fahrenheit - 32) * 5) / 9;
    const message = fahrenheit + " °F = " + celsius + " °C";
    console.log(message);

    if (resultsDiv) {
        const div = document.createElement("div");
        div.innerText = message;
        resultsDiv.prepend(div);
    }
}

// Tlacitka 1,2

if (tasksDiv) {
   
    const button1 = document.createElement("button");
    button1.innerText = "Pepík věk";
    button1.setAttribute("id", "task-1");
    button1.addEventListener("click", () => {
        pepe(2002);
    });
    tasksDiv.appendChild(button1);

    const button2 = document.createElement("button");
    button2.innerText = "Převod teploty";
    button2.setAttribute("id", "task-2");
    button2.addEventListener("click", () => {
        temperatureCtoF(20);
        temperatureFtoC(68);
    });
    tasksDiv.appendChild(button2);
}

// procenta

function calculate(num1, num2) {
  if (num2 === 0) {
    const msg = "Nejde dělit nulou.";
    if (resultsDiv) {
      const div = document.createElement("div");
      div.innerText = msg;
      resultsDiv.prepend(div);
    }
    console.log(msg);
    return;
  }
  const percentage = (num1 / num2) * 100;
  const rounded = percentage.toFixed(2);
  const message = num1 + " je " + rounded + " % z " + num2;
  if (resultsDiv) {
    const div = document.createElement("div");
    div.innerText = message;
    resultsDiv.prepend(div);
  }
  console.log(message);
  return rounded;
}
if (tasksDiv) {
  const button = document.createElement("button");
  button.innerText = "Procenta";
  button.setAttribute("id", "task-4");
  button.addEventListener("click", function() {
    calculate(21, 42);
  });
  tasksDiv.appendChild(button);
}

// Kdo s koho
 
function compare(a, b) {
  let message = "";
  if (a > b) {
    message = a + " je větší než " + b;
  } else if (b > a) {
    message = b + " je větší než " + a;
  } else {
    message = a + " a " + b + " jsou si rovna";
  }
  if (resultsDiv) {
    const div = document.createElement("div");
    div.innerText = message;
    resultsDiv.prepend(div);
  }
  console.log(message);
  return message;
}
if (tasksDiv) {
  const testCases = [
    [5, 6],
    [10, 5],
    [2.2, 2.2],
    [1/2, 1/4]
  ];
  testCases.forEach(function(pair, index) {
    const button = document.createElement("button");
    button.innerText = "Úloha 5 - porovnat " + pair[0] + " a " + pair[1];
    button.setAttribute("id", "task-5-" + (index + 1));
    button.addEventListener("click", function() {
      compare(pair[0], pair[1]);
    });
    tasksDiv.appendChild(button);
  });
}

// Násobky 13

function multiples(max = 730) {
  for (let i = 0; i <= max; i += 13) {
    if (resultsDiv) {
      const div = document.createElement("div");
      div.innerText = i;
      resultsDiv.appendChild(div);
    }
    console.log(i);
  }
}
if (tasksDiv) {
  const button = document.createElement("button");
  button.innerText = "Násobky 13";
  button.setAttribute("id", "task-6");
  button.addEventListener("click", function() {
    multiples();
  });
  tasksDiv.appendChild(button);
}

// Kružnice

function circle(radius) {
  if (radius < 0) {
    console.log("Poloměr nesmí být záporný.");
    return;
  }
  const area = Math.PI * radius ** 2;
  const rounded = area.toFixed(2);
  const message = "Kružnice s poloměrem " + radius + " má obsah " + rounded;
  if (resultsDiv) {
    const div = document.createElement("div");
    div.innerText = message;
    resultsDiv.prepend(div);
  }
  console.log(message);
  return rounded;
}
if (tasksDiv) {
  const button = document.createElement("button");
  button.innerText = "Kružnice";
  button.setAttribute("id", "task-7");
  button.addEventListener("click", function() {
    circle(3);
  });
  tasksDiv.appendChild(button);
}

// Kuzel

function cone(radius, height) {
  if (radius < 0 || height < 0) {
    console.log("Poloměr ani výška nesmí být záporné.");
    return;
  }
  const volume = (1/3) * Math.PI * radius ** 2 * height;
  const rounded = volume.toFixed(2);
  const message = "Kužel s poloměrem " + radius + " a výškou " + height + " má objem " + rounded;
  if (resultsDiv) {
    const div = document.createElement("div");
    div.innerText = message;
    resultsDiv.prepend(div);
  }
  console.log(message);
  return rounded;
}
if (tasksDiv) {
  const button = document.createElement("button");
  button.innerText = "Kuzel";
  button.setAttribute("id", "task-8");
  button.addEventListener("click", function() {
    cone(3, 9);
  });
  tasksDiv.appendChild(button);
}

// Trojuhelniky
 
function triangle(a, b, c) {
  const canForm = a + b > c && a + c > b && b + c > a;
  const message = "Strany: a=" + a + ", b=" + b + ", c=" + c + " → " + (canForm ? "Ano" : "Ne");
  if (resultsDiv) {
    const div = document.createElement("div");
    div.innerText = message;
    resultsDiv.prepend(div);
  }
  console.log(message);
  return canForm;
}
if (tasksDiv) {
  const testCases = [
    [3, 5, 5],
    [1, 2, 3],
    [0, 1, 1]
  ];
  testCases.forEach(function(sides, index) {
    const button = document.createElement("button");
    button.innerText = "Uloha 9 – strany " + sides[0] + ", " + sides[1] + ", " + sides[2];
    button.setAttribute("id", "task-9-" + (index + 1));
    button.addEventListener("click", function() {
      triangle(sides[0], sides[1], sides[2]);
    });
    tasksDiv.appendChild(button);
  });
}

// Heronův vzorec
 
function heron(a, b, c) {
  if (!(a + b > c && a + c > b && b + c > a)) {
    const msg = "Nelze vytvořit trojúhelník se stranami a=" + a + ", b=" + b + ", c=" + c;
    if (resultsDiv) {
      const div = document.createElement("div");
      div.innerText = msg;
      resultsDiv.prepend(div);
    }
    console.log(msg);
    return false;
  }
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const rounded = area.toFixed(2);
  const message = "Trojúhelník se stranami a=" + a + ", b=" + b + ", c=" + c + " má obsah " + rounded;
  if (resultsDiv) {
    const div = document.createElement("div");
    div.innerText = message;
    resultsDiv.prepend(div);
  }
  console.log(message);
  return rounded;
}
if (tasksDiv) {
  const button = document.createElement("button");
  button.innerText = "Heronuv trojuhelnik";
  button.setAttribute("id", "task-10");
  button.addEventListener("click", function() {
    heron(3, 4, 5);
    heron(1, 2, 3); 
  });
  tasksDiv.appendChild(button);
}
