
moment.locale('cs');
const today = moment();

console.log(today.format('YYYY-MMM-DD HH:mm:ss'));

// vyber elementu
// vytvoreni elementu
// manupulace elementu
// const appContainer = document.querySelector('#app');
// appContainer.textContent = 'Created by DOM API';
const appContainer = $('#app');
appContainer.text('Created by jQuery');
appContainer.addClass('container');
// appContainer.css({ backgroundColor: 'red', fontWeight: 'bold' });

// document.createElement + append
const form = $(`
    <form>
        <div>
            <label>userId</label>
            <input name="userId">
        </div>
        <div>
            <button>Submit</button>
        </div>
    </form>
`);
appContainer.append(form);
form.on('submit', async (e) => { // addEventListener
    e.preventDefault();
    const formData = form.serializeArray();
    // console.log(formData);
    const data = {};
    for (const { name, value } of formData) {
        data[name] = value;
    }
    // console.log(data);
    const userId = data.userId;
    const resp = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    appContainer.empty(); // appContainer.innerHTML = '';
    appContainer.append(`
        <ul>
            ${resp.data.map((post) => {
                return `
                    <li>
                        <div>${post.userId}</div>
                        <h2>${post.title}</h2>
                        <p>${post.body}</p>
                    </li>
                `;
            }).join('')}
        </ul>
    `);
});