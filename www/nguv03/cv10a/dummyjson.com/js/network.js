
// fetch data
export const fetchUsers = async () => {
    const resp = await axios.get('https://dummyjson.com/users');
    return resp.data;
};
// add user
export const addUser = async (data) => {
    const url = 'https://dummyjson.com/users/add';
    const { firstName, lastName, email } = data;
    const payload = {
        firstName,
        lastName,
        email,
    };
    const resp = await axios.post(url, payload);
    return resp;
};

export const updateUser = async (data) => {
    const { firstName, lastName, email, id } = data;
    const url = `https://dummyjson.com/users/${id}`;
    const payload = {
        firstName,
        lastName,
        email,
    };
    const resp = await axios.put(url, payload);
    return resp;
};

export const deleteUser = async (id) => {
    const url = `https://dummyjson.com/users/${id}`;
    const resp = await axios.delete(url);
    return resp;
};
