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
  const recommendations = ref([])
  const recLoading = ref(false)
  const recError = ref(null)

  // Actions
  async function predict(inputData, modelPreference = 'huggingface') {
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

  async function fetchRecommendations(inputData, top_k = 5) {
    try {
      recLoading.value = true
      recError.value = null

      // Build a simple vector from available nutrition fields in a canonical order
      const keys = [
        'Energy_kcal_per_serving',
        'Protein_g_per_serving',
        'Fat_g_per_serving',
        'Carbohydrates_g_per_serving',
        'Fiber_g_per_serving',
        'Calcium_mg_per_serving',
        'Iron_mg_per_serving',
        'Magnesium_mg_per_serving',
        'Phosphorus_mg_per_serving',
        'Potassium_mg_per_serving',
        'Sodium_mg_per_serving',
        'Zinc_mg_per_serving',
        'VitaminA_ug_per_serving',
        'VitaminC_mg_per_serving'
      ]

      const vector = keys.map((k) => (inputData && inputData[k] != null ? Number(inputData[k]) : 0))

      const result = await apiService.getRecommendations({ vector, top_k })
      if (result && result.success) {
        recommendations.value = result.items || []
        return recommendations.value
      } else {
        recError.value = (result && result.error) || 'Recommendation failed'
        return []
      }
    } catch (err) {
      recError.value = err.message || String(err)
      throw err
    } finally {
      recLoading.value = false
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
    recommendations,
    loading,
    error,
    recLoading,
    recError,
    // Actions
    predict,
    batchPredict,
    fetchRecommendations,
    clearCurrent,
    clearHistory,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
