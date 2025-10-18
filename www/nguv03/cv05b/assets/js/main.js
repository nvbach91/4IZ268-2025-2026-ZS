const clickMeButton = document.querySelector('#click-me-button');
const heading1 = document.querySelector('#heading-1');

let count = 0;

clickMeButton.addEventListener(
    'click',
    () => {
        // alert('You clicked the button');
        // heading1.textContent = 'Pikachu';
        heading1.textContent = count;
        count = count + 1;
    },
);





// oneline comment
/*
multiline comment
*/

// booleans
const isMarried = true; // statement
const isAdult = false; // statement

// numbers
const age = 18;
const PI = 3.14;

// strings
const name = 'Barrack Obama';
const lastName = 'Obama';
const firstName = 'Barrack';

// undefined
const something = undefined;
// null
const nothing = null;

// object
const person = {
    firstName: 'David',
    lastName: 'Beckham',
    birthYear: 1980,
};

console.log(person.firstName);

// array
const countries = [
    'Czech Republic',   // index 0
    'Poland',           // index 1
    'Korea',            // index 2
    'Canada',           // index 3
    'Turkey',           // index 4
    'Uganda',           // index 5
    'Egypt',            // index 6
];

console.log(countries[1]);
console.log(countries[4]);


console.log(typeof isMarried);
console.log(typeof age);
console.log(typeof lastName); // camelCase
console.log(typeof person);


// operators
// assignment operator            =
// arithmetic operators           + - * / %
// incremental operators          += ++ -= --
// comparison operators           ===, >= <= > <
console.log(2 === '2');
// logical operators              ! && ||
const isHappy = false;
console.log(!isHappy);



const add = (a, b, c, d, e) => {
    const numbers = [a, b, c, d, e];
    let result = 0;
    for (const number of numbers) {
        if (typeof number === 'number') {
            result = result + number;
        }
    }
    return result;
};

const result = add(10, 20, 'David', 10, 'xxx');
console.log(result);


for (const country of countries) {
    console.log(country);
}
for (let i = 0; i < countries.length; i += 1) {
    const country = countries[i];
    console.log(i, country);
}
countries.forEach((country, index) => {
    console.log(index, country);
});
