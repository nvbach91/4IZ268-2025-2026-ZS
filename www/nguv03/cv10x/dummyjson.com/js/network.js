import { USERS_FETCH_LIMIT } from './config.js';

export const axiosInstance = axios.create({
    baseURL: 'https://dummyjson.com',
});

export const deleteUser = async (id) => {
    const resp = await axiosInstance.delete(`/users/${id}`);
    return resp.data;
};
export const fetchUsers = async (page) => {
    const resp = await axiosInstance.get('/users', { params: { limit: USERS_FETCH_LIMIT, skip: page ? (page - 1) * USERS_FETCH_LIMIT : 0 } });
    return resp.data;
};

export const searchUsers = async (searchValue) => {
    const resp = await axiosInstance.get('/users/search', { params: { limit: USERS_FETCH_LIMIT * 2, q: searchValue } });
    return resp.data;
};