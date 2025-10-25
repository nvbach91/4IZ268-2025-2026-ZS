const appContainer = document.querySelector('#app');

const form = document.createElement('form');

const emailInput = document.createElement('input');
emailInput.placeholder = 'Your email';
emailInput.name = 'email';

const passwordInput = document.createElement('input');
passwordInput.placeholder = 'Your password';
passwordInput.name = 'password';
passwordInput.type = 'password';

const button = document.createElement('button');
button.innerText = 'Submit';

form.append(emailInput, passwordInput, button);
/*
<form>
    <input>
    <button>
</form>
*/
const resultContainer = document.createElement('div');
appContainer.append(form, resultContainer);

form.addEventListener(
    'submit',
    (event) => {
        event.preventDefault();
        // read input values ...
        // console.log('Form submitted');
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        // console.log({ email, password });
        resultContainer.innerText = `Your email is: ${email} Your password is: ${password}`;
    },
);

