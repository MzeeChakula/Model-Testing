import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '../services/api'

export const usePredictionStore = defineStore('prediction', () => {
  // State
  const currentInput = ref(null)
  const currentPrediction = ref(null)
  const predictionHistory = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function predict(inputData, modelPreference = 'auto') {
    try {
      loading.value = true
      error.value = null

      const result = await apiService.predict(inputData, modelPreference)

      if (result.success) {
        currentInput.value = inputData
        currentPrediction.value = result

        // Add to history (limit to last 10)
        predictionHistory.value.unshift({
          input: inputData,
          result,
          timestamp: new Date().toISOString()
        })
        if (predictionHistory.value.length > 10) {
          predictionHistory.value.pop()
        }

        // Save to localStorage
        saveToLocalStorage()
      }

      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function batchPredict(inputs, preferOnline = true) {
    try {
      loading.value = true
      error.value = null

      const result = await apiService.batchPredict(inputs, preferOnline)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearCurrent() {
    currentInput.value = null
    currentPrediction.value = null
  }

  function clearHistory() {
    predictionHistory.value = []
    localStorage.removeItem('mzeechakula_history')
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('mzeechakula_history', JSON.stringify(predictionHistory.value))
    } catch (err) {
      console.error('Failed to save to localStorage:', err)
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('mzeechakula_history')
      if (saved) {
        predictionHistory.value = JSON.parse(saved)
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err)
    }
  }

  // Initialize
  loadFromLocalStorage()

  return {
    // State
    currentInput,
    currentPrediction,
    predictionHistory,
    loading,
    error,
    // Actions
    predict,
    batchPredict,
    clearCurrent,
    clearHistory,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
