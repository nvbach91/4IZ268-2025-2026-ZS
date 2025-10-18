const clickMeButton = document.querySelector('#click-me-button');

let count = 0;

clickMeButton.addEventListener(
    'click',
    () => {
        const heading = document.querySelector('h1');
        // heading.innerText = count;
        // count = count + 1;
        heading.innerText = '';
        for (const country of countries) {
            heading.innerHTML += country + '<br>';
        }
    },
);



/*
multiline
 comment
*/

// one line comment


// booleans
const isGraduated = false;
const isAdult = true;
const age = 50; // numbers
const name = 'This is some text.'; // string
const person = { // object
    firstName: 'David',
    lastName: 'Beckham',
    birthYear: 1980,
};
console.log(person.firstName);
console.log(person.lastName);
console.log(person.birthYear);
const countries = [ // array
    'Czech republic', // index 0
    'United Kingdom', // index 1
    'Poland',         // index 2
    'Uganda',
    'Egypt'
];
console.log(countries[1]);

// functions
const add = (a, b, c, d, e) => {
    const numbers = [a, b, c, d, e];
    let result = 0;
    for (const number of numbers) {
        if (typeof number === 'number') {
            result = result + number;
        }
    }
    // const result = a + b + c;
    return result;
};

const result = add(6, '15', 6.5, 'one two', 7.5, 'pikachu');
console.log(result);

console.log(typeof name);
console.log(typeof age);
console.log(typeof isGraduated);
console.log(typeof person);

for (const country of countries) {
    console.log(country);
}

for (let i = 0; i < countries.length; i += 1) {
    const country = countries[i];
    console.log(i, country);
}

countries.forEach((country, i) => {
    console.log(i, country);
});



// operators
// assignment     =
// comparison     === >= <= > <
// aritmethic     + - * / %
// incremental    ++ += -- -=
// logical        && || !














