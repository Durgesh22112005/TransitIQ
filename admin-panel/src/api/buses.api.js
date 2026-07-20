import client from './client';

export const busesAPI = {
  getAll: async (params = {}) => {
    const res = await client.get('/buses', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await client.get(`/buses/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/buses', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/buses/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await client.delete(`/buses/${id}`);
    return res.data;
  },
};
