import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle offline errors
    if (!navigator.onLine) {
      error.offline = true
      error.message = 'No internet connection. Using offline mode.'
    }
    return Promise.reject(error)
  }
)

// API Service
export const apiService = {
  // Health & Status
  async healthCheck() {
    const response = await api.get('/health/')
    return response.data
  },

  async getModelStatus() {
    const response = await api.get('/health/models')
    return response.data
  },

  async getEncodingReference() {
    const response = await api.get('/health/encoding')
    return response.data
  },

  async getMetrics() {
    const response = await api.get('/health/metrics')
    return response.data
  },

  async getApiInfo() {
    const response = await api.get('/api/info')
    return response.data
  },

  // Predictions
  async predict(inputData, model = 'auto') {
    const response = await api.post('/predict/', inputData, {
      params: { model }
    })
    return response.data
  },

  async batchPredict(inputs, preferOnline = true) {
    const response = await api.post('/predict/batch', {
      inputs,
      prefer_online: preferOnline
    })
    return response.data
  },

  async getExampleInput() {
    const response = await api.get('/predict/example')
    return response.data
  },

  async getRecommendations({ byId = null, vector = null, top_k = 5 } = {}) {
    const params = { top_k }
    if (byId) params.by_id = byId
    if (vector && Array.isArray(vector)) {
      // join vector as comma-separated string expected by backend
      params.vector = vector.join(',')
    }

    const response = await api.get('/predict/recommend', { params })
    return response.data
  },

  // Foods dataset (served by backend)
  async getLocalFoods(params = {}) {
    const response = await api.get('/foods/local', { params })
    return response.data
  },

  // Monitoring
  async getSystemMetrics() {
    const response = await api.get('/metrics')
    return response.data
  }
}

export default api
