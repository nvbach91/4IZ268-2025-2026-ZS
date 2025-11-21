
// fetch data
export const fetchUsers = async () => {
    const resp = await axios.get('https://dummyjson.com/users');
    return resp.data;
};
// ....