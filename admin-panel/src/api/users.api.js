import client from './client';

export const usersAPI = {
  getAll: async (params = {}) => {
    const res = await client.get('/auth/users', { params });
    return res.data;
  },
};
