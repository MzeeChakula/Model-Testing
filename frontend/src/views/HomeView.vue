<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePredictionStore } from '../store/predictionStore'

const router = useRouter()
const { t } = useI18n()
const predictionStore = usePredictionStore()

const modelAccuracies = [
  { name: 'CRGN', value: 63.36 },
  { name: 'HetGNN', value: 56.64 },
  { name: 'GAT', value: 63.73 }
]

const currentModelIndex = ref(0)
const currentAccuracy = ref(63)
const modelsAvailable = ref(5)
const totalPredictions = computed(() => predictionStore.predictionHistory.length)
const currentModelName = computed(() => modelAccuracies[currentModelIndex.value].name)

let intervalId = null

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

onMounted(() => {
  intervalId = setInterval(() => {
    currentModelIndex.value = (currentModelIndex.value + 1) % modelAccuracies.length
    currentAccuracy.value = Math.round(modelAccuracies[currentModelIndex.value].value)
  }, 3000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
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

          <h1 class="hero-title">Welcome to MzeeChakula Model Testing</h1>

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
            <div class="stat-item" style="animation: fadeIn 0.8s ease-out 0.2s both;">
              <i class="pi pi-chart-line"></i>
              <div class="stat-content">
                <div class="stat-value">{{ currentAccuracy }}%</div>
                <div class="stat-label">Model Accuracy — <small style="opacity:0.9">{{ currentModelName }}</small></div>
              </div>
            </div>
            <div class="stat-item" style="animation: fadeIn 0.8s ease-out 0.4s both;">
              <i class="pi pi-server"></i>
              <div class="stat-content">
                <div class="stat-value">{{ modelsAvailable }}</div>
                <div class="stat-label">Models Available</div>
              </div>
            </div>
            <div class="stat-item" style="animation: fadeIn 0.8s ease-out 0.6s both;">
              <i class="pi pi-history"></i>
              <div class="stat-content">
                <div class="stat-value">{{ totalPredictions }}</div>
                <div class="stat-label">Your Predictions</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-illustration">
            <div class="illustration-card">
              <img src="/icons/logotransparent.svg" alt="illustration" style="height:8rem; width:auto; filter: none;" />
            </div>
        </div>
      </div>
    </section>

    <!-- System Overview / Models Section (two-column layout) -->
    <section class="overview-section">
      <div class="container">
        <h2 class="section-title">MzeeChakula Models</h2>

        <div class="models-grid">
          <div class="model-card models-left">
            <h3>Overview</h3>
            <p class="overview-text">
              <strong>Graph Neural Network Models for Elderly Nutrition Planning in Uganda</strong>
            </p>
            <p class="overview-text">
              The project contains trained GNN models, embeddings and a production ensemble used to provide personalized,
              culturally-appropriate meal recommendations for elderly populations across Uganda.
            </p>

            <h4>Repository</h4>
            <ul class="repo-list">
              <li><strong>models/</strong> — Trained GNNs, checkpoints and embeddings (Git LFS)</li>
              <li><strong>scripts/</strong> — Ensemble utilities & deployment helpers</li>
              <li><strong>notebooks/</strong> — Training and evaluation notebooks</li>
            </ul>

            <h4>Ensemble</h4>
            <p class="overview-text">Weighted combination of: <strong>CRGN (40%)</strong>, <strong>HetGNN (35%)</strong>, <strong>GAT (25%)</strong>.</p>

            <div class="card small">
              <strong>Quick Facts</strong>
              <div class="overview-features" style="margin-top:0.5rem;">
                <div class="overview-badge"><span>~5.36M params</span></div>
                <div class="overview-badge"><span>~15 ms CPU (top-10)</span></div>
                <div class="overview-badge"><span>English &amp; Luganda</span></div>
              </div>
            </div>

            <div class="card deployment-card">
              <strong>Deployment</strong>
              <pre class="deployment-code">
from huggingface_hub import snapshot_download
model_path = snapshot_download(
  "Shakiran/MzeeChakulaNutritionEnsembleModel"
)
# load the ensemble
              </pre>
            </div>
          </div>

          <div class="model-card models-right">
            <h3>Models &amp; Performance</h3>
            <div style="overflow:auto; max-height:420px;">
              <table class="models-table" style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="text-align:left; padding:8px; border-bottom:1px solid var(--muted)">Model</th>
                    <th style="text-align:left; padding:8px; border-bottom:1px solid var(--muted)">Task</th>
                    <th style="text-align:right; padding:8px; border-bottom:1px solid var(--muted)">Loss</th>
                    <th style="text-align:right; padding:8px; border-bottom:1px solid var(--muted)">Params</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:8px">CRGN ⭐</td><td style="padding:8px">Link Prediction</td><td style="padding:8px; text-align:right">0.6336</td><td style="padding:8px; text-align:right">326K</td></tr>
                  <tr><td style="padding:8px">HetGNN ⭐</td><td style="padding:8px">Link Prediction</td><td style="padding:8px; text-align:right">0.5664</td><td style="padding:8px; text-align:right">4.66M</td></tr>
                  <tr><td style="padding:8px">GAT ⭐</td><td style="padding:8px">Link Prediction</td><td style="padding:8px; text-align:right">0.6373</td><td style="padding:8px; text-align:right">375K</td></tr>
                  <tr><td style="padding:8px">R-GCN</td><td style="padding:8px">Link Prediction</td><td style="padding:8px; text-align:right">0.6416</td><td style="padding:8px; text-align:right">2.29M</td></tr>
                  <tr><td style="padding:8px">Graph-RAG</td><td style="padding:8px">Link Prediction</td><td style="padding:8px; text-align:right">0.6712</td><td style="padding:8px; text-align:right">3.02M</td></tr>
                  <tr><td style="padding:8px">KGNN</td><td style="padding:8px">Link Prediction</td><td style="padding:8px; text-align:right">0.7359</td><td style="padding:8px; text-align:right">339K</td></tr>
                  <tr><td style="padding:8px">G-GPT</td><td style="padding:8px">Sequence Gen</td><td style="padding:8px; text-align:right">0.6853</td><td style="padding:8px; text-align:right">22.3M</td></tr>
                  <tr><td style="padding:8px">GRN</td><td style="padding:8px">Temporal</td><td style="padding:8px; text-align:right">0.0029</td><td style="padding:8px; text-align:right">3.8K</td></tr>
                  <tr><td style="padding:8px">TCN</td><td style="padding:8px">Temporal</td><td style="padding:8px; text-align:right">0.0150</td><td style="padding:8px; text-align:right">29K</td></tr>
                </tbody>
              </table>
            </div>

            <div class="card" style="margin-top:1rem;">
              <strong>Research</strong>
              <p class="overview-text" style="margin:0.5rem 0 0 0;">Notebooks and data processing pipelines are available under <code>notebooks/</code> and the companion <code>MzeeChakula/data</code> repository.</p>
            </div>
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
  overflow-x: hidden;
}

.home-view * {
  max-width: 100%;
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

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.75rem;
  }
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
.stat-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.hero-badge-logo {
  height: 28px;
  width: auto;
}
.btn-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: middle;
}
.overview-icon, .feature-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  margin-right: 8px;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  transition: all 0.3s ease;
}

/* Ensure stat numbers are visible on the hero background */
.hero-section .stat-value {
  color: white;
}

.hero-section .stat-label {
  color: rgba(255,255,255,0.9);
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

@media (max-width: 768px) {
  .illustration-card {
    width: 200px;
    height: 200px;
  }
  
  .hero-illustration {
    display: none;
  }
}

/* Overview Section */
.overview-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--surface-color);
  overflow-x: hidden;
}

.overview-section .container {
  max-width: 1200px;
  width: 100%;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .overview-section .container {
    max-width: 100vw;
  }
}

.overview-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.models-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 992px) {
  .models-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    align-items: start;
  }
}

.model-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow-x: hidden;
  word-wrap: break-word;
}

.model-card.small {
  padding: var(--spacing-sm);
}

.models-left .overview-text {
  margin-bottom: 0.6rem;
}

.models-right table tr:nth-child(odd) { background: #fafafa; }

@media (max-width: 768px) {
  .model-card {
    padding: var(--spacing-sm);
  }
  
  .model-card ul {
    padding-left: var(--spacing-md);
  }
  
  .model-card ul li {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .model-card h3 {
    font-size: var(--font-size-lg);
  }
  
  .model-card h4 {
    font-size: var(--font-size-base);
  }
  
  .models-right table {
    font-size: 0.7rem;
    display: block;
    overflow-x: auto;
    width: 100%;
  }
  
  .models-right > div {
    overflow-x: auto;
    max-width: 100%;
  }
  
  .models-right table th,
  .models-right table td {
    padding: 6px !important;
    white-space: nowrap;
  }
  
  .model-card pre {
    font-size: 0.65rem;
    padding: 0.4rem !important;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  .overview-section .container {
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }
  
  .models-grid {
    gap: var(--spacing-md);
  }
  
  .overview-text {
    font-size: var(--font-size-base);
  }
  
  .card {
    overflow-x: hidden;
  }
  
  .deployment-card {
    max-width: 100%;
  }
  
  .deployment-code {
    max-width: 100%;
    overflow-x: auto !important;
    font-size: 0.6rem !important;
    line-height: 1.4;
  }
  
  .repo-list li {
    font-size: var(--font-size-sm);
  }
}


.overview-text {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  line-height: 1.8;
  margin-bottom: var(--spacing-lg);
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.overview-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .overview-features {
    grid-template-columns: 1fr;
  }
}

.overview-badge {
  display: flex;
  align-items: center;
  justify-content: center;
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

@media (max-width: 768px) {
  .section-title {
    font-size: var(--font-size-xl);
  }
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
  overflow-x: hidden;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

@media (min-width: 1024px) {
  .steps-grid {
    gap: var(--spacing-lg);
  }
}

.step-card {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

@media (min-width: 1024px) {
  .step-card {
    padding: var(--spacing-lg);
  }
}

.step-number {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0 auto var(--spacing-sm);
}

@media (min-width: 1024px) {
  .step-number {
    width: 60px;
    height: 60px;
    font-size: var(--font-size-xl);
    margin: 0 auto var(--spacing-md);
  }
}

.step-card h3 {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

@media (min-width: 1024px) {
  .step-card h3 {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
  }
}

.step-card p {
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: var(--font-size-sm);
}

@media (min-width: 1024px) {
  .step-card p {
    font-size: var(--font-size-base);
    line-height: 1.6;
  }
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-xl) 0;
  overflow-x: hidden;
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

@media (max-width: 768px) {
  .cta-card h2 {
    font-size: var(--font-size-xl);
  }
  
  .cta-card {
    padding: var(--spacing-lg);
  }
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

.hero-content {
  animation: fadeInUp 1s ease-out;
}

.hero-illustration {
  animation: scaleIn 1s ease-out;
}

.illustration-card {
  animation: pulse 3s ease-in-out infinite;
}
</style>
