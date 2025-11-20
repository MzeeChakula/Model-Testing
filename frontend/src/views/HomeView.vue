<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../store/appStore'
import { usePredictionStore } from '../store/predictionStore'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const predictionStore = usePredictionStore()

// Make totalPredictions reactive to predictionStore
const totalPredictions = computed(() => predictionStore.predictionHistory.length || 0)

const stats = ref({
  totalPredictions: 0,
  modelsAvailable: 5, // Default to 5 models (XGBoost, LightGBM, HistGradient, GNN, MLP)
  avgAccuracy: 67 // XGBoost test R² score of 67.1% (best model)
})

const animatedStats = ref({
  totalPredictions: 0,
  modelsAvailable: 0,
  avgAccuracy: 0
})

const features = computed(() => [
  {
    icon: 'pi pi-sparkles',
    title: t('home.features.aiPowered'),
    description: t('home.features.aiPoweredDesc'),
    color: 'var(--primary-color)'
  },
  {
    icon: 'pi pi-shopping-bag',
    title: t('home.features.localFoods'),
    description: t('home.features.localFoodsDesc'),
    color: 'var(--accent-color)'
  },
  {
    icon: 'pi pi-ban',
    title: t('home.features.offline'),
    description: t('home.features.offlineDesc'),
    color: 'var(--info-color)'
  },
  {
    icon: 'pi pi-user',
    title: t('home.features.personalized'),
    description: t('home.features.personalizedDesc'),
    color: 'var(--secondary-color)'
  }
])

// Animate numbers from 0 to target value
const animateValue = (key, target, duration = 2000) => {
  const increment = target / (duration / 16)
  let current = 0

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      animatedStats.value[key] = target
      clearInterval(timer)
    } else {
      animatedStats.value[key] = Math.floor(current)
    }
  }, 16)
}

onMounted(() => {
  // Calculate stats
  stats.value.totalPredictions = totalPredictions.value

  // Update from store if available, otherwise use defaults
  if (appStore.availableModels && appStore.availableModels.length > 0) {
    stats.value.modelsAvailable = appStore.availableModels.length
  }

  if (appStore.modelStatus && Object.keys(appStore.modelStatus).length > 0) {
    const models = Object.values(appStore.modelStatus)
    const avgR2 = models.reduce((sum, model) => {
      return sum + (model.test_r2 || 0)
    }, 0) / models.length
    if (avgR2 > 0) {
      stats.value.avgAccuracy = Math.round(avgR2 * 100)
    }
  }

  // Always animate stats (use defaults if not updated from store)
  setTimeout(() => {
    animateValue('avgAccuracy', stats.value.avgAccuracy, 2000)
    animateValue('modelsAvailable', stats.value.modelsAvailable, 1500)
    animateValue('totalPredictions', stats.value.totalPredictions, 1800)
  }, 300)
})

// Watch for changes in prediction count and update animated value
watch(totalPredictions, (newCount) => {
  stats.value.totalPredictions = newCount
  animatedStats.value.totalPredictions = newCount
})

const goToPredict = () => {
  router.push('/predict')
}

const goToFoods = () => {
  router.push('/foods')
}
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <i class="pi pi-heart-fill"></i>
            <span>{{ t('app.name') }}</span>
          </div>

          <h1 class="hero-title">{{ t('home.welcome') }}</h1>

          <p class="hero-description">
            {{ t('home.description') }}
          </p>

          <div class="hero-actions">
            <button @click="goToPredict" class="btn btn-primary btn-large">
              <i class="pi pi-plus-circle"></i>
              {{ t('home.getStarted') }}
            </button>
            <button @click="goToFoods" class="btn btn-secondary btn-large">
              <i class="pi pi-book"></i>
              {{ t('nav.foods') }}
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-item animate-fade-in" style="animation-delay: 0.2s;">
              <i class="pi pi-chart-line"></i>
              <div class="stat-content">
                <div class="stat-value">{{ animatedStats.avgAccuracy }}%</div>
                <div class="stat-label">Model Accuracy (R²)</div>
              </div>
            </div>
            <div class="stat-item animate-fade-in" style="animation-delay: 0.4s;">
              <i class="pi pi-server"></i>
              <div class="stat-content">
                <div class="stat-value">{{ animatedStats.modelsAvailable }}</div>
                <div class="stat-label">Models Available</div>
              </div>
            </div>
            <div class="stat-item animate-fade-in" style="animation-delay: 0.6s;">
              <i class="pi pi-history"></i>
              <div class="stat-content">
                <div class="stat-value">{{ animatedStats.totalPredictions }}</div>
                <div class="stat-label">Your Predictions</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-illustration">
          <div class="illustration-card">
            <i class="pi pi-heart" style="font-size: 8rem; color: var(--primary-color);"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- System Overview Section -->
    <section class="overview-section">
      <div class="container">
        <div class="overview-content">
          <h2 class="section-title">About MzeeChakula</h2>
          <p class="overview-text">
            MzeeChakula is an innovative AI-powered nutrition planning system specifically designed for elderly care in Uganda.
            Our platform combines advanced machine learning with graph-enhanced language models to deliver personalized,
            culturally-appropriate meal recommendations using locally sourced foods.
          </p>
          <p class="overview-text">
            Built on cutting-edge XGBoost algorithms and knowledge graph reasoning, the system analyzes individual health profiles,
            regional food availability, and seasonal variations to provide accurate daily caloric needs predictions and tailored
            nutrition plans. Whether you're a caregiver, healthcare professional, or family member, MzeeChakula helps ensure
            optimal nutrition for Uganda's elderly population.
          </p>
          <div class="overview-features">
            <div class="overview-badge">
              <i class="pi pi-check-circle"></i>
              <span>67% Model Accuracy (R²)</span>
            </div>
            <div class="overview-badge">
              <i class="pi pi-check-circle"></i>
              <span>5 ML Models</span>
            </div>
            <div class="overview-badge">
              <i class="pi pi-check-circle"></i>
              <span>Offline-First Design</span>
            </div>
            <div class="overview-badge">
              <i class="pi pi-check-circle"></i>
              <span>Local Foods Database</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">{{ t('home.features.title') }}</h2>

        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
            :style="{ backgroundColor: feature.color }"
          >
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">How It Works</h2>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Enter Demographics</h3>
            <p>Provide age, region, health condition, and season information</p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <h3>Input Nutrition Data</h3>
            <p>Enter meal nutritional content or select from local foods</p>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <h3>Get AI Prediction</h3>
            <p>Receive daily caloric needs prediction from our ML models</p>
          </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <h3>View Meal Plan</h3>
            <p>Get personalized weekly meal plans with local foods</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <h2>Ready to Get Started?</h2>
          <p>Create your first nutrition prediction and meal plan today</p>
          <button @click="goToPredict" class="btn btn-primary btn-large">
            <i class="pi pi-arrow-right"></i>
            Start Now
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: var(--spacing-xl) 0;
}

.hero-section .container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  align-items: center;
}

@media (min-width: 768px) {
  .hero-section .container {
    grid-template-columns: 1fr 1fr;
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 50px;
  margin-bottom: var(--spacing-lg);
  font-weight: 600;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  line-height: 1.1;
}

.hero-description {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.1);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.stat-item i {
  font-size: 2rem;
  color: var(--secondary-color);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.stat-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.hero-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.illustration-card {
  background: white;
  width: 300px;
  height: 300px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
}

/* Overview Section */
.overview-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--surface-color);
}

.overview-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.overview-text {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  line-height: 1.8;
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.overview-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.overview-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
  border: 2px solid var(--primary-color);
  font-weight: 600;
  color: var(--text-color);
  transition: transform 0.2s;
}

.overview-badge:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.overview-badge i {
  color: var(--accent-color);
  font-size: var(--font-size-lg);
}

/* Features Section */
.features-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--bg-color);
}

.section-title {
  text-align: center;
  font-size: var(--font-size-2xl);
  color: var(--text-color);
  margin-bottom: var(--spacing-xl);
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 640px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.feature-card {
  text-align: center;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  color: white;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  color: white;
}

.feature-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: white;
}

.feature-description {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
}

/* How It Works Section */
.how-it-works-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--surface-color);
}

.steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.step-card {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0 auto var(--spacing-md);
}

.step-card h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.step-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-xl) 0;
}

.cta-card {
  background: linear-gradient(135deg, var(--accent-color) 0%, #056020 100%);
  color: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.cta-card h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
}

.cta-card p {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  margin-bottom: var(--spacing-xl);
}

.cta-card .btn {
  background-color: white;
  color: var(--accent-color);
}

.cta-card .btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
  opacity: 0;
}

.hero-content {
  animation: fadeInUp 1s ease-out;
}

.hero-illustration {
  animation: scaleIn 1s ease-out;
}

.illustration-card {
  animation: pulse 3s ease-in-out infinite;
}

.feature-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.feature-card:nth-child(1) {
  animation-delay: 0.1s;
}

.feature-card:nth-child(2) {
  animation-delay: 0.2s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.3s;
}

.feature-card:nth-child(4) {
  animation-delay: 0.4s;
}

.step-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.step-card:nth-child(1) {
  animation-delay: 0.2s;
}

.step-card:nth-child(2) {
  animation-delay: 0.3s;
}

.step-card:nth-child(3) {
  animation-delay: 0.4s;
}

.step-card:nth-child(4) {
  animation-delay: 0.5s;
}

.cta-card {
  animation: fadeInUp 0.8s ease-out;
}
</style>
