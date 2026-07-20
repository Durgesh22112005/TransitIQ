import client from './client';

export const driversAPI = {
  getAll: async (params = {}) => {
    const res = await client.get('/drivers', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await client.get(`/drivers/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/drivers', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/drivers/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await client.delete(`/drivers/${id}`);
    return res.data;
  },
};
