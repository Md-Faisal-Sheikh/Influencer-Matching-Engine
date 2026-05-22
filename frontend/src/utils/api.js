import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

export const getInfluencers = (filters = {}) =>
  api.get('/influencers', { params: filters }).then(r => r.data);

export const getInfluencer = (id) =>
  api.get(`/influencers/${id}`).then(r => r.data);

export const matchInfluencers = (brandProfile) =>
  api.post('/match', brandProfile).then(r => r.data);

export const saveBrand = (brandProfile) =>
  api.post('/brands', brandProfile).then(r => r.data);

export const syncInfluencer = (id) =>
  api.post(`/influencers/${id}/sync`).then(r => r.data);

export const getTrustGraph = () =>
  api.get('/trust-graph').then(r => r.data);

export default api;
