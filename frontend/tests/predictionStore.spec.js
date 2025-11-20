import { vi, describe, it, expect } from 'vitest'
import { usePredictionStore } from '../src/store/predictionStore'
import * as api from '../src/services/api'

vi.mock('../src/services/api')

describe('predictionStore recommendations', () => {
  it('fetchRecommendations updates recommendations state when api returns items', async () => {
    const mockItems = [
      { id: 'rice', score: 0.95, meta: { name: 'Local Rice' } },
      { id: 'beans', score: 0.87, meta: { name: 'Beans' } }
    ]

    api.apiService.getRecommendations.mockResolvedValue({ success: true, items: mockItems })

    const store = usePredictionStore()

    const input = {
      Energy_kcal_per_serving: 300,
      Protein_g_per_serving: 12,
      Fat_g_per_serving: 8
    }

    const result = await store.fetchRecommendations(input, 5)
    expect(store.recommendations.length).toBe(2)
    expect(store.recommendations[0].id).toBe('rice')
    expect(result[0].id).toBe('rice')
  })

  it('fetchRecommendations handles API errors gracefully', async () => {
    api.apiService.getRecommendations.mockResolvedValue({ success: false, error: 'No ensemble' })
    const store = usePredictionStore()
    const input = { Energy_kcal_per_serving: 1 }
    const res = await store.fetchRecommendations(input, 3)
    expect(store.recommendations.length).toBe(0)
    expect(store.recError).not.toBeNull()
  })
})
