const clickMeButton = document.querySelector('#click-me-button');
const heading1 = document.querySelector('#heading-1')

let count = 0;

clickMeButton.addEventListener(
    'click',
    ()=>{
       // alert('You clicked me')
       //heading1.textContent = 'Pikachu'
        heading1.textContent = count;
        count++;
        
    }
);