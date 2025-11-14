const fetchUsers = async () => {
    resultsElement.innerHTML = '';
    resultsElement.append(spinner);
    try {
        const resp = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await resp.json();
        spinner.remove();
        const userElements = [];
        for (const user of users) {
            const userElement = createUserElement(user);
            userElements.push(userElement);
        }
        resultsElement.append(...userElements);
    } catch (error) {
        console.error(error);
    }
};
const createUserElement = (user) => {
    const userElement = document.createElement('div');
    const userNameElement = document.createElement('div');
    userNameElement.textContent = `Name: ${user.name}, (userId: ${user.id})`;
    userElement.append(userNameElement);
    const userPostsButton = document.createElement('button');
    userPostsButton.textContent = 'Show posts';
    userElement.append(userPostsButton);
    userPostsButton.addEventListener('click', () => {
        fetchPosts(user.id);
    });
    return userElement;
};
const fetchPosts = async (userId) => {
    resultsElement.innerHTML = '';
    resultsElement.append(spinner);
    try {
        const url = `https://jsonplaceholder.typicode.com/posts${userId ? `?userId=${userId}` : ''}`;
        const resp = await fetch(url);
        const posts = await resp.json();
        spinner.remove();
        const postElements = [];
        for (const post of posts) {
            const postElement = createPostElement(post);
            postElements.push(postElement);
        }
        resultsElement.append(...postElements);
    } catch (error) {
        console.error(error);
    }
};
const createPostElement = (post) => {
    const postElement = document.createElement('div');
    const postUserIdElement = document.createElement('div');
    postUserIdElement.textContent = `userId: ${post.userId}`;
    const postTitleElement = document.createElement('div');
    postTitleElement.textContent = `post title: ${post.title}`;
    const postBodyElement = document.createElement('div');
    postBodyElement.textContent = `post body: ${post.body}`;
    postElement.append(postUserIdElement, postTitleElement, postBodyElement);
    return postElement;
};
const resultsElement = document.querySelector('#results');

const fetchUsersButton = document.querySelector('#fetch-users');
fetchUsersButton.addEventListener('click', () => {
    fetchUsers();
});

const fetchPostsButton = document.querySelector('#fetch-posts');
fetchPostsButton.addEventListener('click', () => {
    fetchPosts();
});

const spinner = document.createElement('div');
spinner.classList.add('spinner');
