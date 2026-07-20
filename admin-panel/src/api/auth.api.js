import client from './client';

export const authAPI = {
  login: async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data) => {
    const res = await client.post('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },
};
