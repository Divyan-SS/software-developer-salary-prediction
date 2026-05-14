import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const predictSalary = (data) =>
  api.post('/predict', data);

export const convertSalary = (original_salary_usd, target_currency) =>
  api.post('/convert-salary', null, { params: { original_salary_usd, target_currency } });

export const getSupportedCurrencies = () =>
  api.get('/currencies');

export const uploadCSV = (formData) =>
  api.post('/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const fetchAnalytics = () =>
  api.get('/analytics');

// ✅ FIXED: only one version
export const fetchFilteredAnalytics = (countries) =>
  api.post('/analytics/filter', { countries });