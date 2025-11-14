const fetchUsersData = async () => {
    resultsContainer.innerHTML = '';
    resultsContainer.append(spinner);
    const resp = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await resp.json();
    spinner.remove();
    const userElements = [];
    for (const user of data) {
        const userElement = createUserElement(user);
        userElements.push(userElement);
    }
    resultsContainer.append(...userElements);
};
const createUserElement = (user) => {
    const userElement = document.createElement('div');
    const userNameElement = document.createElement('div');
    userNameElement.textContent = `${user.id} - ${user.name}`;
    const fetchUserPostsButton = document.createElement('button');
    fetchUserPostsButton.textContent = 'Show posts';
    fetchUserPostsButton.addEventListener('click', () => {
        fetchPostsData(user.id);
    });
    userElement.append(userNameElement, fetchUserPostsButton);
    return userElement;
};
const fetchPostsData = async (userId) => {
    resultsContainer.innerHTML = '';
    resultsContainer.append(spinner);
    const url = `https://jsonplaceholder.typicode.com/posts${userId ? `?userId=${userId}` : ''}`;
    const resp = await fetch(url);
    const data = await resp.json();
    spinner.remove();
    const postElements = [];
    for (const post of data) {
        const postElement = createPostElement(post);
        postElements.push(postElement);
    }
    resultsContainer.append(...postElements);
};
const createPostElement = (post) => {
    const postElement = document.createElement('div');
    const postTitleElement = document.createElement('div');
    const postBodyElement = document.createElement('div');
    const postUserIdElement = document.createElement('div');
    postTitleElement.textContent = post.title;
    postBodyElement.textContent = post.body;
    postUserIdElement.textContent = post.userId;
    postElement.append(postUserIdElement, postTitleElement, postBodyElement);
    return postElement;
};
const resultsContainer = document.querySelector('#results');
const fetchUsersButton = document.querySelector('#fetch-users');
const fetchPostsButton = document.querySelector('#fetch-posts');
fetchUsersButton.addEventListener('click', () => {
    fetchUsersData();
});
fetchPostsButton.addEventListener('click', () => {
    fetchPostsData();
});
const spinner = document.createElement('div');
spinner.classList.add('spinner');