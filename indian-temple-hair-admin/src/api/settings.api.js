import api from './axiosInstance';

// Both endpoints return {success, data}; unwrap so Settings.jsx gets flat fields directly.
export const getSettings = () => api.get('/admin/settings').then((r) => r.data.data);
export const updateSettings = (payload) => api.put('/admin/settings', payload).then((r) => r.data.data);

// Payments (PayPal). Secrets are write-only: the response only says whether a secret is stored.
export const getPaymentSettings = () => api.get('/admin/settings/payments').then((r) => r.data.data);
export const updatePaymentSettings = (payload) => api.put('/admin/settings/payments', payload).then((r) => r.data.data);
