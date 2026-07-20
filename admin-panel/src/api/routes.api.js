import client from './client';

export const routesAPI = {
  getAll: async (params = {}) => {
    const res = await client.get('/routes', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await client.get(`/routes/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/routes', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/routes/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await client.delete(`/routes/${id}`);
    return res.data;
  },
};
