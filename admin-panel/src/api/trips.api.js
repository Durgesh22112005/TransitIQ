import client from './client';

export const tripsAPI = {
  getAll: async (params = {}) => {
    const res = await client.get('/trips', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/trips', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/trips/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await client.delete(`/trips/${id}`);
    return res.data;
  },
};
