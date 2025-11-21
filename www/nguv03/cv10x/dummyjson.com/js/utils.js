import { mainContainer, spinner } from './elements.js';

export const createUserForm = ({ email, firstName, lastName }, onSubmit) => {
    const form = $(`
        <form>
            <div class="form-row">
                <label>Email</label>
                <input name="email" value="${email}" required>
            </div>
            <div class="form-row">
                <label>First name</label>
                <input name="firstName" value="${firstName}" required>
            </div>
            <div class="form-row">
                <label>Last name</label>
                <input name="lastName" value="${lastName}" required>
            </div>
            <div class="form-row">
                <button>Submit</button>
            </div>
        </form>
    `);
    form.on('submit', async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(form.get(0)));
        onSubmit(formData);
    });
    return form;
};

export const showLoading = () => {
    mainContainer.empty();
    mainContainer.append(spinner);
};
