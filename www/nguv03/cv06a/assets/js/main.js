const formHTML = `
    <form id="registration-form">
        <div class="form-row">
            <label>E-mail</label>
            <input type="email" name="email" placeholder="Your email">
        </div>
        <div class="form-row">
            <label>Name</label>
            <input name="name" placeholder="Your name">
        </div>
        <div class="form-row">
            <label>Password</label>
            <input type="password" name="password" placeholder="Your password">
        </div>
        <button>Submit</button>
    </form>
`;

const appContainer = document.querySelector('#app');

appContainer.innerHTML = formHTML;

const resultContainer = document.createElement('div');

appContainer.append(resultContainer);

const form = document.querySelector('#registration-form');

form.addEventListener(
    'submit',
    (event) => {
        event.preventDefault();
        // read input values
        const formData = new FormData(form);
        const email = formData.get('email');
        const name = formData.get('name');
        const password = formData.get('password');

        resultContainer.innerText = `
            Welcome ${name}!. Your email is: ${email}. Your password is ${password}
        `;
    },
);