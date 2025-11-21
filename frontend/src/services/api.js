import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
}

// API Keys endpoints
export const apiKeysService = {
  getAll: () => api.get('/api-keys'),
  create: (data) => api.post('/api-keys', data),
  revoke: (id) => api.delete(`/api-keys/${id}`),
  update: (id, data) => api.put(`/api-keys/${id}`, data),
}

// Analytics endpoints
export const analyticsService = {
  getUsage: (params) => api.get('/analytics/usage', { params }),
  getStats: () => api.get('/analytics/stats'),
  getTimeSeries: (params) => api.get('/analytics/timeseries', { params }),
}

// Webhooks endpoints
export const webhooksService = {
  getAll: () => api.get('/webhooks'),
  create: (data) => api.post('/webhooks', data),
  update: (id, data) => api.put(`/webhooks/${id}`, data),
  delete: (id) => api.delete(`/webhooks/${id}`),
  test: (id) => api.post(`/webhooks/${id}/test`),
}

// Billing endpoints
export const billingService = {
  getSubscription: () => api.get('/billing/subscription'),
  getInvoices: () => api.get('/billing/invoices'),
  updatePayment: (data) => api.post('/billing/payment-method', data),
}

// API Playground endpoints
export const playgroundService = {
  claimRoot: (data) => api.post('/playground/claim-root', data),
  vaultMesh: (data) => api.post('/playground/vault-mesh', data),
  seedScrolls: (data) => api.post('/playground/seed-scrolls', data),
  pulseTrade: (data) => api.post('/playground/pulse-trade', data),
}

export default api
