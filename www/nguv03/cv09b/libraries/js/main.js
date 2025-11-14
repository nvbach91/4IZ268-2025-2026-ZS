// moment.locale('cs');
// const date = moment('2026-11-11');

// console.log(date.format('YYYY MMMM DD HH:mm:ss'));
// console.log(date.fromNow());
// date.add(10, 'days');
// console.log(date.format('YYYY MMMM DD HH:mm:ss'));

// vyber element
// manupilace s elementy
// vytvareni elementu
// udalosti
// formulare
// document.querySelector('#app');
const appContainer = $('#app');
console.log(appContainer);
// appContainer.textContent = '...';
appContainer.text('modified by jQuery');
appContainer.css({ backgroundColor: 'red', fontWeight: 'bold' });
appContainer.addClass('some-class');
appContainer.attr('title', 'Some title');

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
// addEventListener
form.on('submit', async (e) => {
    e.preventDefault();
    const data = form.serializeArray();
    const formData = {};
    for (const { name, value } of data) {
        formData[name] = value;
    }
    const userId = formData.userId;
    const url = `https://jsonplaceholder.typicode.com/posts?userId=${userId}`;
    // GET, POST, PUT, DELETE
    const resp = await axios.get(url);
    appContainer.append(`
        <ul>
            ${resp.data.map(({ title, body }) => {
                return `
                    <li>
                        <h2>${title}</h2>
                        <p>${body}</p>
                    <li>
                `;
            }).join('')}
        </ul>
    `);
});

// button.on('click', () => {
//     // ...
// });
