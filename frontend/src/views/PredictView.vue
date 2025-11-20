<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePredictionStore } from '../store/predictionStore'
import { useSettingsStore } from '../store/settingsStore'
import DemographicsForm from '../components/prediction/DemographicsForm.vue'
import FoodPreferencesForm from '../components/prediction/FoodPreferencesForm.vue'

const router = useRouter()
const { t } = useI18n()
const predictionStore = usePredictionStore()
const settingsStore = useSettingsStore()

// Wizard state
const currentStep = ref(1)
const totalSteps = 3

// Form data
const demographicsData = ref({})
const nutritionData = ref({})
const demographicsValid = ref(false)
const nutritionValid = ref(false)

// Combined input data
const combinedData = computed(() => ({
  ...nutritionData.value,
  ...demographicsData.value
}))

const canProceed = computed(() => {
  if (currentStep.value === 1) return demographicsValid.value
  if (currentStep.value === 2) return nutritionValid.value
  return false
})

const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitPrediction = async () => {
  try {
    const modelPref = settingsStore.offlineMode ? 'offline' : settingsStore.modelPreference

    await predictionStore.predict(combinedData.value, modelPref)

    // Navigate to results
    router.push('/results')
  } catch (error) {
    console.error('Prediction failed:', error)
    // Error handling will be shown by the prediction store
  }
}

const stepTitle = computed(() => {
  const titles = {
    1: t('predict.demographics'),
    2: 'Food Preferences & Lifestyle',
    3: 'Review & Generate Meal Plan'
  }
  return titles[currentStep.value]
})
</script>

<template>
  <div class="predict-view">
    <div class="container">
      <!-- Mode Toggle Banner -->
      <div class="mode-toggle-banner">
        <div class="banner-content">
          <div class="banner-icon">
            <i class="pi pi-comments"></i>
          </div>
          <div class="banner-text">
            <strong>{{ t('predict.tryChat') || 'Prefer to chat?' }}</strong>
            <span>{{ t('predict.chatDescription') || 'Use our conversational AI assistant with voice support' }}</span>
          </div>
          <button @click="router.push('/chat')" class="chat-btn">
            <i class="pi pi-arrow-right"></i>
            {{ t('predict.switchToChat') || 'Switch to Chat' }}
          </button>
        </div>
      </div>

      <!-- Header -->
      <div class="view-header">
        <h1>{{ t('predict.title') }}</h1>
        <p class="view-description">
          Complete the following steps to generate a personalized meal plan with local Ugandan foods
        </p>
      </div>

      <!-- Progress Indicator -->
      <div class="progress-wrapper">
        <div class="progress-steps">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="progress-step"
            :class="{
              active: step === currentStep,
              completed: step < currentStep
            }"
          >
            <div class="step-circle">
              <i v-if="step < currentStep" class="pi pi-check"></i>
              <span v-else>{{ step }}</span>
            </div>
            <div class="step-label">
              {{ step === 1 ? 'Demographics' : step === 2 ? 'Food Preferences' : 'Review' }}
            </div>
          </div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: ((currentStep - 1) / (totalSteps - 1)) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <!-- Wizard Content -->
      <div class="wizard-content card">
        <h2 class="step-title">{{ stepTitle }}</h2>

        <!-- Step 1: Demographics -->
        <div v-show="currentStep === 1">
          <DemographicsForm
            v-model="demographicsData"
            @valid="demographicsValid = $event"
          />
        </div>

        <!-- Step 2: Food Preferences -->
        <div v-show="currentStep === 2">
          <FoodPreferencesForm
            v-model="nutritionData"
            @valid="nutritionValid = $event"
          />
        </div>

        <!-- Step 3: Review -->
        <div v-show="currentStep === 3" class="review-section">
          <h3>Review Your Input</h3>

          <div class="review-grid">
            <div class="review-card">
              <h4><i class="pi pi-user"></i> Demographics</h4>
              <dl class="review-list">
                <dt>Age Group:</dt>
                <dd>{{ demographicsData.age_group_encoded !== undefined ? ['60-70', '70-80', '80+'][demographicsData.age_group_encoded] : 'Not set' }}</dd>

                <dt>Region:</dt>
                <dd>{{ demographicsData.region_encoded !== undefined ? ['Central', 'Western', 'Eastern', 'Northern'][demographicsData.region_encoded] : 'Not set' }}</dd>

                <dt>Health Condition:</dt>
                <dd>{{ demographicsData.condition_encoded !== undefined ? ['Hypertension', 'Undernutrition', 'Anemia', 'Frailty', 'Digestive', 'Arthritis', 'Osteoporosis', 'Diabetes'][demographicsData.condition_encoded] : 'Not set' }}</dd>

                <dt>Season:</dt>
                <dd>{{ demographicsData.season_encoded !== undefined ? ['Dry', 'Wet'][demographicsData.season_encoded] : 'Not set' }}</dd>

                <dt>Portion Size:</dt>
                <dd>{{ demographicsData.portion_size_g || 'Not set' }}g</dd>

                <dt>Estimated Cost:</dt>
                <dd>{{ demographicsData.estimated_cost_ugx || 'Not set' }} UGX</dd>
              </dl>
            </div>

            <div class="review-card">
              <h4><i class="pi pi-shopping-cart"></i> Food Preferences</h4>
              <dl class="review-list">
                <dt>Selected Foods:</dt>
                <dd>{{ nutritionData.selectedFoods?.length || 0 }} foods</dd>

                <dt>Meals Per Day:</dt>
                <dd>{{ nutritionData.mealsPerDay || 3 }} meals</dd>

                <dt>Activity Level:</dt>
                <dd>{{ nutritionData.activityLevel || 'Moderate' }}</dd>

                <dt>Budget:</dt>
                <dd>{{ nutritionData.budget || 'Moderate' }}</dd>

                <dt>Restrictions:</dt>
                <dd>{{ nutritionData.dietaryRestrictions?.length || 0 }} restrictions</dd>
              </dl>
            </div>
          </div>

          <div class="submit-info">
            <i class="pi pi-info-circle"></i>
            <p>Click "Generate Meal Plan" to receive a personalized nutrition plan with Ugandan foods</p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="wizard-navigation">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="btn btn-secondary"
        >
          <i class="pi pi-arrow-left"></i>
          {{ t('common.back') }}
        </button>

        <div class="spacer"></div>

        <button
          v-if="currentStep < totalSteps"
          @click="nextStep"
          :disabled="!canProceed"
          class="btn btn-primary"
        >
          {{ t('common.next') }}
          <i class="pi pi-arrow-right"></i>
        </button>

        <button
          v-else
          @click="submitPrediction"
          :disabled="predictionStore.loading"
          class="btn btn-primary btn-large"
        >
          <span v-if="predictionStore.loading" class="loading-spinner"></span>
          <i v-else class="pi pi-sparkles"></i>
          {{ predictionStore.loading ? 'Generating...' : 'Generate Meal Plan' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="predictionStore.error" class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        {{ predictionStore.error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.predict-view {
  padding: var(--spacing-xl) 0;
  min-height: calc(100vh - 200px);
}

/* Mode Toggle Banner */
.mode-toggle-banner {
  margin-bottom: var(--spacing-xl);
  animation: slideDown 0.5s ease-out;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #ffe5e5, #ffd0d0);
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-lg);
}

.banner-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 1.75rem;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.banner-text strong {
  font-size: var(--font-size-lg);
  color: var(--text-color);
}

.banner-text span {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.chat-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.chat-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .banner-content {
    flex-wrap: wrap;
  }

  .banner-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .chat-btn {
    width: 100%;
    justify-content: center;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.view-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.view-header h1 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.view-description {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

/* Progress Indicator */
.progress-wrapper {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--border-color);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
  transition: all 0.3s;
  position: relative;
  z-index: 2;
}

.progress-step.active .step-circle {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 0 0 4px rgba(217, 0, 0, 0.2);
}

.progress-step.completed .step-circle {
  background-color: var(--accent-color);
  color: white;
}

.step-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
  text-align: center;
}

.progress-step.active .step-label {
  color: var(--primary-color);
  font-weight: 600;
}

.progress-bar {
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  position: absolute;
  top: 24px;
  left: 10%;
  right: 10%;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Wizard Content */
.wizard-content {
  margin-bottom: var(--spacing-xl);
  clear: both;
}

.step-title {
  color: var(--text-color);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);
}

/* Review Section */
.review-section h3 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

@media (min-width: 768px) {
  .review-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.review-card {
  background: var(--surface-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
}

.review-card h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.review-card h4 i {
  color: var(--primary-color);
}

.review-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-sm) var(--spacing-md);
}

.review-list dt {
  font-weight: 600;
  color: var(--text-secondary);
}

.review-list dd {
  color: var(--text-color);
  margin: 0;
}

.submit-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: #e7f3ff;
  border-radius: var(--radius-md);
}

.submit-info i {
  font-size: var(--font-size-xl);
  color: var(--info-color);
}

.submit-info p {
  margin: 0;
  color: var(--text-color);
}

/* Navigation */
.wizard-navigation {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.spacer {
  flex: 1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: #f8d7da;
  color: #721c24;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
}

.error-message i {
  font-size: var(--font-size-xl);
}
</style>
