
// fetching data from server
export const fetchUsers = async () => {
    const usersResp = await axios.get('https://dummyjson.com/users');
    return usersResp.data;
};

