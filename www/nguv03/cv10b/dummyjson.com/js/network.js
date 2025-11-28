
// fetching data from server
export const fetchUsers = async () => {
    const usersResp = await axios.get('https://dummyjson.com/users');
    return usersResp.data;
};

export const addUser = async (data) => {
    const { firstName, lastName, email } = data;
    const payload = { firstName, lastName, email };
    const resp = await axios.post('https://dummyjson.com/users/add', payload);
    return resp;
};

export const updateUser = async (data) => {
    const { firstName, lastName, email, id } = data;
    const payload = { firstName, lastName, email };
    const url = `https://dummyjson.com/users/${id}`;
    const resp = await axios.put(url, payload);
    return resp;
};

export const deleteUser = async (id) => {
    const url = `https://dummyjson.com/users/${id}`;
    const resp = await axios.delete(url);
    return resp;
};
