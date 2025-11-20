import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'

export const useAppStore = defineStore('app', () => {
  // State
  const isOnline = ref(navigator.onLine)
  const loading = ref(false)
  const modelStatus = ref(null)
  const encodingReference = ref(null)
  const apiInfo = ref(null)
  const error = ref(null)

  // Computed
  const availableModels = computed(() => {
    if (!modelStatus.value) return []
    return Object.entries(modelStatus.value.offline_model || {})
      .filter(([_, info]) => info.available)
      .map(([name, info]) => ({ name, ...info }))
  })

  const isHealthy = computed(() => {
    return modelStatus.value && Object.keys(modelStatus.value).length > 0
  })

  // Actions
  async function fetchModelStatus() {
    try {
      loading.value = true
      error.value = null
      modelStatus.value = await apiService.getModelStatus()
    } catch (err) {
      error.value = err.message
      if (err.offline) {
        isOnline.value = false
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchEncodingReference() {
    try {
      encodingReference.value = await apiService.getEncodingReference()
    } catch (err) {
      console.error('Failed to fetch encoding reference:', err)
    }
  }

  async function fetchApiInfo() {
    try {
      apiInfo.value = await apiService.getApiInfo()
    } catch (err) {
      console.error('Failed to fetch API info:', err)
    }
  }

  async function healthCheck() {
    try {
      const health = await apiService.healthCheck()
      return health.status === 'healthy'
    } catch (err) {
      if (err.offline) {
        isOnline.value = false
      }
      return false
    }
  }

  function setOnlineStatus(status) {
    isOnline.value = status
  }

  function clearError() {
    error.value = null
  }

  // Initialize
  async function initialize() {
    await Promise.all([
      fetchModelStatus(),
      fetchEncodingReference(),
      fetchApiInfo(),
      healthCheck()
    ])
  }

  // Listen to online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOnlineStatus(true))
    window.addEventListener('offline', () => setOnlineStatus(false))
  }

  return {
    // State
    isOnline,
    loading,
    modelStatus,
    encodingReference,
    apiInfo,
    error,
    // Computed
    availableModels,
    isHealthy,
    // Actions
    fetchModelStatus,
    fetchEncodingReference,
    fetchApiInfo,
    healthCheck,
    setOnlineStatus,
    clearError,
    initialize
  }
})
