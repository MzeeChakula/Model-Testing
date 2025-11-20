<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePredictionStore } from '../store/predictionStore'
import NutrientChart from '../components/results/NutrientChart.vue'
import HealthRecommendations from '../components/results/HealthRecommendations.vue'
import MealPlanSuggestions from '../components/results/MealPlanSuggestions.vue'
import FoodRecommendations from '../components/results/FoodRecommendations.vue'
import CostCalculator from '../components/results/CostCalculator.vue'

const router = useRouter()
const { t } = useI18n()
const predictionStore = usePredictionStore()

// Check if we have prediction data
const hasPrediction = computed(() => {
  return predictionStore.currentPrediction && predictionStore.currentInput
})

const prediction = computed(() => predictionStore.currentPrediction)
const inputData = computed(() => predictionStore.currentInput)
const recommendedFoods = computed(() => {
  const pred = predictionStore.currentPrediction
  if (pred && pred.recommendedFoods && Array.isArray(pred.recommendedFoods) && pred.recommendedFoods.length) {
    return pred.recommendedFoods
  }
  return predictionStore.recommendations || []
})

// Redirect to predict if no data
onMounted(() => {
  if (!hasPrediction.value) {
    router.push('/predict')
  }
})

const startNewPrediction = () => {
  predictionStore.clearCurrent()
  router.push('/predict')
}

const printResults = () => {
  window.print()
}
</script>

<template>
  <div v-if="hasPrediction" class="results-view">
    <div class="container">
      <!-- Header Section -->
      <div class="results-header">
        <div class="header-content">
          <h1>{{ t('results.title') }}</h1>
          <p class="header-subtitle">
            Your personalized nutrition analysis and meal planning guide
          </p>
        </div>
        <div class="header-recommendations" v-if="recommendedFoods && recommendedFoods.length">
          <div class="rec-label">Top local foods:</div>
          <div class="rec-list">
            <span v-for="(f, idx) in recommendedFoods.slice(0,6)" :key="(f.id||f.meta?.name||idx)" class="rec-chip">
              {{ f.meta?.name || f.meta?.title || f.id }}
            </span>
          </div>
        </div>
        <div class="header-actions no-print">
          <button @click="printResults" class="btn btn-secondary">
            <i class="pi pi-print"></i>
            Print
          </button>
          <button @click="startNewPrediction" class="btn btn-primary">
            <i class="pi pi-plus"></i>
            New Prediction
          </button>
        </div>
      </div>

      <!-- Main Results Card -->
      <div class="prediction-result card">
        <div class="result-header">
          <div class="result-icon">
            <i class="pi pi-heart-fill"></i>
          </div>
          <div class="result-content">
            <h2>{{ t('results.caloricNeeds') }}</h2>
            <div class="caloric-value">
              {{ Math.round(prediction.prediction.caloric_needs) }}
              <span class="unit">kcal/day</span>
            </div>
            <p class="result-description">
              Recommended daily caloric intake based on your profile and meal composition
            </p>
          </div>
        </div>

        <!-- Model Info -->
        <div class="model-info">
          <div class="info-item">
            <i class="pi pi-cog"></i>
            <div>
              <strong>{{ t('results.modelUsed') }}</strong>
              <span>{{ prediction.prediction.model }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="pi pi-chart-line"></i>
            <div>
              <strong>{{ t('results.accuracy') }}</strong>
              <span>{{ prediction.prediction.accuracy }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="pi pi-server"></i>
            <div>
              <strong>Source</strong>
              <span class="status-badge" :class="prediction.status">
                {{ prediction.status === 'online' ? 'Hugging Face' :
                   prediction.status === 'local' ? 'Local Model' :
                   prediction.status === 'offline' ? 'Offline Model' :
                   prediction.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Meal Plan -->
      <div class="section-card">
        <h2 class="section-title">
          <i class="pi pi-calendar"></i>
          {{ t('results.mealPlan') }}
        </h2>
        <MealPlanSuggestions
          :caloric-needs="prediction.prediction.caloric_needs"
          :region="inputData.region_encoded"
          :condition="inputData.condition_encoded"
        />
      </div>

      <!-- Food Recommendations -->
      <FoodRecommendations :inputData="inputData" />

      <!-- Cost Calculator -->
      <div class="section-card">
        <CostCalculator
          :caloric-needs="prediction.prediction.caloric_needs"
          :region="inputData.region_encoded"
        />
      </div>

      <!-- Health Recommendations -->
      <div class="section-card">
        <h2 class="section-title">
          <i class="pi pi-heart"></i>
          Health-Specific Guidance
        </h2>
        <HealthRecommendations
          :condition="inputData.condition_encoded"
          :nutrition-data="inputData"
        />
      </div>

      <!-- Nutrition Charts -->
      <div class="section-card">
        <h2 class="section-title">
          <i class="pi pi-chart-pie"></i>
          Nutritional Analysis
        </h2>
        <NutrientChart :nutrition-data="inputData" />
      </div>

      <!-- Summary & Actions -->
      <div class="summary-card no-print">
        <div class="summary-content">
          <i class="pi pi-check-circle"></i>
          <div>
            <h3>Analysis Complete</h3>
            <p>Your personalized nutrition plan is ready. Consult with a healthcare provider for specific medical advice.</p>
          </div>
        </div>
        <div class="summary-actions">
          <button @click="printResults" class="btn btn-secondary">
            <i class="pi pi-print"></i>
            Print Plan
          </button>
          <button @click="startNewPrediction" class="btn btn-primary">
            <i class="pi pi-plus-circle"></i>
            Create Another
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading or No Data State -->
  <div v-else class="no-data-view">
    <div class="container">
      <div class="no-data-card">
        <i class="pi pi-inbox"></i>
        <h2>No Results Available</h2>
        <p>Please complete a prediction first to see results.</p>
        <button @click="router.push('/predict')" class="btn btn-primary">
          <i class="pi pi-arrow-right"></i>
          Go to Prediction
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-view {
  padding: var(--spacing-xl) 0;
  min-height: calc(100vh - 200px);
}

/* Header */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.header-content h1 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.header-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* Main Prediction Result */
.prediction-result {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  margin-bottom: var(--spacing-xl);
  border: none;
  box-shadow: var(--shadow-lg);
}

.result-header {
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.result-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-icon i {
  font-size: 2.5rem;
  color: var(--secondary-color);
}

.result-content {
  flex: 1;
}

.result-content h2 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
  opacity: 0.95;
}

.caloric-value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.caloric-value .unit {
  font-size: var(--font-size-xl);
  font-weight: 500;
  opacity: 0.9;
}

.result-description {
  opacity: 0.9;
  font-size: var(--font-size-base);
  margin: 0;
}

/* Model Info */
.model-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

@media (min-width: 640px) {
  .model-info {
    grid-template-columns: repeat(3, 1fr);
  }
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.info-item i {
  font-size: var(--font-size-xl);
  opacity: 0.9;
}

.info-item div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item strong {
  font-size: var(--font-size-sm);
  opacity: 0.85;
  font-weight: 600;
}

.info-item span {
  font-size: var(--font-size-base);
  font-weight: 500;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-size: var(--font-size-sm);
  display: inline-block;
}

.status-badge.online {
  background: var(--accent-color);
}

.status-badge.local {
  background: var(--primary-color);
}

.status-badge.offline {
  background: #9c27b0;
}

/* Sections */
.section-card {
  background: var(--surface-color);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);
}

.section-title i {
  color: var(--primary-color);
}

/* Summary Card */
.summary-card {
  background: var(--accent-color);
  color: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
}

.summary-content i {
  font-size: 3rem;
  opacity: 0.9;
}

.summary-content h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-xs);
}

.summary-content p {
  margin: 0;
  opacity: 0.95;
}

.summary-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.summary-card .btn {
  background: white;
  color: var(--accent-color);
  border: 2px solid white;
}

.summary-card .btn:hover {
  background: rgba(255, 255, 255, 0.9);
}

/* No Data State */
.no-data-view {
  padding: var(--spacing-xl) 0;
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.no-data-card {
  text-align: center;
  padding: var(--spacing-xl);
  max-width: 500px;
  margin: 0 auto;
}

.no-data-card i {
  font-size: 5rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.no-data-card h2 {
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.no-data-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.header-recommendations {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-left: auto;
}
.header-recommendations .rec-label {
  font-weight: 600;
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
}
.header-recommendations .rec-list {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.rec-chip {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.875rem;
  color: var(--text-color);
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }

  .results-view {
    padding: 0;
  }

  .prediction-result {
    background: white !important;
    color: black !important;
    border: 2px solid #000;
  }

  .result-content h2,
  .caloric-value,
  .result-description {
    color: black !important;
  }

  .section-card {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>
