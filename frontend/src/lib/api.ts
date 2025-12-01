import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// User API
export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  created_at?: string;
}

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { name?: string }) => api.put('/users/me', data),
  deleteAccount: () => api.delete('/users/me'),
  // Admin endpoints
  getAllUsers: () => api.get<User[]>('/users'),
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  updateUserRole: (id: number, role: 'user' | 'admin') => 
    api.put(`/users/${id}/role`, { role }),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

// Transaction API
export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export const transactionApi = {
  create: (data: Omit<Transaction, 'id'>) => api.post('/transactions', data),
  getAll: () => api.get('/transactions'),
  update: (id: number, data: Partial<Transaction>) =>
    api.put(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

// Investment API
export interface Investment {
  id?: number;
  asset_type: string;
  symbol: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  exchange: string;
}

export const investmentApi = {
  create: (data: Omit<Investment, 'id'>) => api.post('/investments', data),
  getAll: () => api.get('/investments'),
  update: (id: number, data: Partial<Investment>) =>
    api.put(`/investments/${id}`, data),
  delete: (id: number) => api.delete(`/investments/${id}`),
};

// Budget API
export interface Budget {
  id?: number;
  category: string;
  limit_amount: number;
  spent_amount?: number;
}

export const budgetApi = {
  create: (data: Omit<Budget, 'id' | 'spent_amount'>) =>
    api.post('/budgets', data),
  getAll: () => api.get('/budgets'),
  update: (id: number, data: Partial<Budget>) =>
    api.put(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
  checkStatus: () => api.get('/budgets/check/status'),
};

// Logs API
export const logsApi = {
  getAll: () => api.get('/logs'),
};

// Tokens API
export const tokensApi = {
  getActive: () => api.get('/tokens'),
};

export default api;
