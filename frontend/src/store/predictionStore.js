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
  async function predict(inputData, modelPreference = 'auto') {
    try {
      loading.value = true
      error.value = null

      const result = await apiService.predict(inputData, modelPreference)

      if (result.success) {
        currentInput.value = inputData
        currentPrediction.value = result

        // Automatically fetch food recommendations based on the input data
        try {
          // fetchRecommendations will populate `recommendations` in this store
          await fetchRecommendations(inputData, 6)
          // Attach recommendations to the prediction result for easy access in the UI
          currentPrediction.value.recommendedFoods = recommendations.value || []
        } catch (recErr) {
          // Non-fatal: log and continue
          console.warn('Failed to fetch recommendations:', recErr)
        }

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

      // Try ensemble-based recommendations first
      let recResult = null
      try {
        recResult = await apiService.getRecommendations({ vector, top_k: Math.max(top_k, 20) })
      } catch (e) {
        // Continue to fallback logic below
        recResult = null
      }

      // Fetch local foods to enrich metadata and enable region/price filtering
      let localFoods = []
      try {
        const lf = await apiService.getLocalFoods()
        if (Array.isArray(lf)) localFoods = lf
      } catch (e) {
        // Non-fatal; we can proceed without local enrichment
        console.warn('Could not fetch local foods for enrichment:', e)
      }

      const regionMap = ['central', 'western', 'eastern', 'northern']
      const preferredRegion = (inputData && typeof inputData.region_encoded === 'number') ? regionMap[inputData.region_encoded] : null
      const budget = inputData && (inputData.estimated_cost_ugx || inputData.budget)

      // Helper to match recommended item to a local food entry
      const buildLocalMap = (arr) => {
        const byName = {}
        const byId = {}
        arr.forEach((f) => {
          if (!f) return
          const name = (f.name || f.title || '').toString().toLowerCase()
          if (name) byName[name] = f
          if (f.id != null) byId[String(f.id)] = f
        })
        return { byName, byId }
      }

      const { byName, byId } = buildLocalMap(localFoods)

      const enrichItem = (item) => {
        const meta = (item && item.meta) || {}
        // try match by meta name or id
        const nameKey = (meta.name || meta.title || item.id || '').toString().toLowerCase()
        const localMatch = byId[String(item.id)] || byName[nameKey]
        const mergedMeta = Object.assign({}, meta, (localMatch || {}))
        return Object.assign({}, item, { meta: mergedMeta })
      }

      let items = []
      if (recResult && recResult.success && Array.isArray(recResult.items) && recResult.items.length) {
        // Enrich recommendations
        items = recResult.items.map(enrichItem)

        // Filter out unavailable items if we have available flags
        const hasAvailability = items.some((it) => it.meta && typeof it.meta.available !== 'undefined')
        if (hasAvailability) {
          const filtered = items.filter((it) => it.meta && it.meta.available !== false)
          if (filtered.length) items = filtered
        }

        // Sort: prefer same region, then by score desc, then by price asc
        items.sort((a, b) => {
          const aRegion = (a.meta && (a.meta.region || a.meta.region_name || a.meta.region_str) || '').toString().toLowerCase()
          const bRegion = (b.meta && (b.meta.region || b.meta.region_name || b.meta.region_str) || '').toString().toLowerCase()
          const aSame = preferredRegion && aRegion === preferredRegion ? 1 : 0
          const bSame = preferredRegion && bRegion === preferredRegion ? 1 : 0
          if (bSame !== aSame) return bSame - aSame
          const scoreDiff = (b.score || 0) - (a.score || 0)
          if (scoreDiff !== 0) return scoreDiff
          const aPrice = (a.meta && (a.meta.pricePerKg || a.meta.price_per_kg || a.meta.price)) || Number.MAX_SAFE_INTEGER
          const bPrice = (b.meta && (b.meta.pricePerKg || b.meta.price_per_kg || b.meta.price)) || Number.MAX_SAFE_INTEGER
          return aPrice - bPrice
        })

        // If budget provided, prefer items with price <= budget (heuristic)
        if (budget) {
          const affordable = items.filter((it) => {
            const price = (it.meta && (it.meta.pricePerKg || it.meta.price_per_kg || it.meta.price)) || null
            if (price == null) return true
            // Treat budget as daily budget in UGX; fall back to allowing items cheaper than budget*2
            return Number(price) <= Number(budget) * 2
          })
          if (affordable.length) items = affordable
        }

        // Limit to requested top_k
        items = items.slice(0, top_k)
        recommendations.value = items
        return recommendations.value
      }

      // Fallback: if ensemble recommendations are unavailable, score local foods
      // by cosine similarity against the constructed `vector`. This provides
      // useful scores instead of defaulting to zero.
      if (localFoods && localFoods.length) {
        const q = vector && Array.isArray(vector) ? vector.map((v) => Number(v) || 0) : null

        // helper to build a numeric vector from a local food entry matching `keys`
        const buildFoodVector = (f) => {
          // local foods expose fields: energy, protein, fat, carbs, fiber, calcium, iron
          // map them to the canonical keys used for query vector; missing entries -> 0
          const map = {
            Energy_kcal_per_serving: Number(f.energy) || 0,
            Protein_g_per_serving: Number(f.protein) || 0,
            Fat_g_per_serving: Number(f.fat) || 0,
            Carbohydrates_g_per_serving: Number(f.carbs) || 0,
            Fiber_g_per_serving: Number(f.fiber) || 0,
            Calcium_mg_per_serving: Number(f.calcium) || 0,
            Iron_mg_per_serving: Number(f.iron) || 0,
            Magnesium_mg_per_serving: 0,
            Phosphorus_mg_per_serving: 0,
            Potassium_mg_per_serving: 0,
            Sodium_mg_per_serving: 0,
            Zinc_mg_per_serving: 0,
            VitaminA_ug_per_serving: 0,
            VitaminC_mg_per_serving: 0
          }
          return keys.map((k) => Number(map[k] || 0))
        }

        const scored = []

        if (q && q.length) {
          // compute query norm
          const qNorm = Math.sqrt(q.reduce((s, v) => s + v * v, 0)) || 1

          for (const f of localFoods) {
            try {
              if (typeof f.available !== 'undefined' && f.available === false) continue
              if (preferredRegion && (f.region || '').toString().toLowerCase() !== preferredRegion) {
                // allow region filtering but still consider if nothing matches later
              }

              const fv = buildFoodVector(f)
              const fNorm = Math.sqrt(fv.reduce((s, v) => s + v * v, 0)) || 1
              const dot = fv.reduce((s, v, i) => s + (v * (q[i] || 0)), 0)
              let score = dot / (qNorm * fNorm)
              if (!isFinite(score)) score = 0
              // Keep score in 0..1 range (vectors non-negative so typically >=0)
              score = Math.max(0, Math.min(1, score))
              scored.push({ id: f.id || f.name, score, meta: f })
            } catch (e) {
              // skip problematic entries
              continue
            }
          }

          // If we have scored items, sort and pick top_k
          if (scored.length) {
            scored.sort((a, b) => (b.score || 0) - (a.score || 0))
            let itemsPicked = scored.slice(0, top_k)

            // If budget provided, prefer affordable
            if (budget) {
              const affordable = itemsPicked.filter((it) => {
                const price = (it.meta && (it.meta.pricePerKg || it.meta.price_per_kg || it.meta.price)) || null
                if (price == null) return true
                return Number(price) <= Number(budget) * 2
              })
              if (affordable.length) itemsPicked = affordable
            }

            recommendations.value = itemsPicked
            return recommendations.value
          }
        }

        // final fallback: region/availability/price selection (no scoring possible)
        let picks = [...localFoods]
        if (picks.some((f) => typeof f.available !== 'undefined')) {
          picks = picks.filter((f) => f.available !== false)
        }
        if (preferredRegion) {
          const inRegion = picks.filter((f) => (f.region || '').toString().toLowerCase() === preferredRegion)
          if (inRegion.length) picks = inRegion
        }
        picks.sort((a, b) => ((a.pricePerKg || Number.MAX_SAFE_INTEGER) - (b.pricePerKg || Number.MAX_SAFE_INTEGER)))
        recommendations.value = picks.slice(0, top_k).map((f) => ({ id: f.name || f.id, score: 0, meta: f }))
        return recommendations.value
      }

      recError.value = 'No recommendations available'
      return []
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
