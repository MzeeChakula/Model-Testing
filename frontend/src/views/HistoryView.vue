<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '../store/chatStore'
import { usePredictionStore } from '../store/predictionStore'

const router = useRouter()
const { t } = useI18n()
const chatStore = useChatStore()
const predictionStore = usePredictionStore()

const chatHistory = computed(() => chatStore.conversationHistory || [])
const predictionHistory = computed(() => predictionStore.predictionHistory || [])

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatAge = (ageGroup) => {
  const ages = ['60-70 years', '70-80 years', '80+ years']
  return ages[ageGroup] || 'Unknown'
}

const formatRegion = (region) => {
  const regions = ['Central', 'Western', 'Eastern', 'Northern']
  return regions[region] || 'Unknown'
}

const formatCondition = (condition) => {
  const conditions = ['Hypertension', 'Diabetes', 'Anemia', 'Osteoporosis', 'Heart Disease', 'Kidney Disease', 'Arthritis', 'Healthy']
  return conditions[condition] || 'Unknown'
}

const viewChatConversation = (conversationId) => {
  chatStore.loadConversationFromHistory(conversationId)
  router.push('/chat')
}

const viewPredictionResult = (prediction) => {
  // Set as current prediction and navigate to results
  predictionStore.currentInput = prediction.input
  predictionStore.currentPrediction = prediction.result
  router.push('/results')
}

const clearAllChatHistory = () => {
  if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
    chatStore.clearHistory()
  }
}

const clearAllPredictionHistory = () => {
  if (confirm('Are you sure you want to clear all prediction history? This cannot be undone.')) {
    predictionStore.clearHistory()
  }
}
</script>

<template>
  <div class="history-view">
    <div class="container">
      <!-- Header -->
      <div class="view-header">
        <h1><i class="pi pi-history"></i> History</h1>
        <p class="view-description">
          View your past conversations and meal plan predictions
        </p>
      </div>

      <!-- Chat History Section -->
      <div class="history-section">
        <div class="section-header">
          <h2><i class="pi pi-comments"></i> Chat Conversations</h2>
          <button 
            v-if="chatHistory.length > 0" 
            @click="clearAllChatHistory" 
            class="btn btn-secondary btn-sm"
          >
            <i class="pi pi-trash"></i>
            Clear All
          </button>
        </div>

        <div v-if="chatHistory.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No Chat History</h3>
          <p>Your chat conversations will appear here</p>
          <button @click="router.push('/chat')" class="btn btn-primary">
            <i class="pi pi-comments"></i>
            Start a Chat
          </button>
        </div>

        <div v-else class="history-grid">
          <div 
            v-for="conversation in chatHistory" 
            :key="conversation.id"
            class="history-card chat-card"
            @click="viewChatConversation(conversation.id)"
          >
            <div class="card-header">
              <div class="card-icon">
                <i class="pi pi-comments"></i>
              </div>
              <div class="card-info">
                <h3>Chat Conversation</h3>
                <p class="timestamp">{{ formatDate(conversation.timestamp) }}</p>
              </div>
            </div>

            <div class="card-content">
              <div class="info-row">
                <span class="label">Messages:</span>
                <span class="value">{{ conversation.messages.length }}</span>
              </div>
              <div class="info-row">
                <span class="label">Stage:</span>
                <span class="value">{{ conversation.stage }}</span>
              </div>
              <div v-if="conversation.collectedData.age_group !== null" class="info-row">
                <span class="label">Age:</span>
                <span class="value">{{ formatAge(conversation.collectedData.age_group) }}</span>
              </div>
              <div v-if="conversation.collectedData.region !== null" class="info-row">
                <span class="label">Region:</span>
                <span class="value">{{ formatRegion(conversation.collectedData.region) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button class="view-btn">
                <i class="pi pi-eye"></i>
                View Conversation
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Prediction History Section -->
      <div class="history-section">
        <div class="section-header">
          <h2><i class="pi pi-chart-line"></i> Meal Plan Predictions</h2>
          <button 
            v-if="predictionHistory.length > 0" 
            @click="clearAllPredictionHistory" 
            class="btn btn-secondary btn-sm"
          >
            <i class="pi pi-trash"></i>
            Clear All
          </button>
        </div>

        <div v-if="predictionHistory.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No Prediction History</h3>
          <p>Your meal plan predictions will appear here</p>
          <button @click="router.push('/predict')" class="btn btn-primary">
            <i class="pi pi-plus-circle"></i>
            New Prediction
          </button>
        </div>

        <div v-else class="history-grid">
          <div 
            v-for="(prediction, index) in predictionHistory" 
            :key="index"
            class="history-card prediction-card"
            @click="viewPredictionResult(prediction)"
          >
            <div class="card-header">
              <div class="card-icon prediction-icon">
                <i class="pi pi-chart-line"></i>
              </div>
              <div class="card-info">
                <h3>Meal Plan</h3>
                <p class="timestamp">{{ formatDate(prediction.timestamp) }}</p>
              </div>
            </div>

            <div class="card-content">
              <div class="caloric-display">
                <span class="caloric-value">{{ Math.round(prediction.result.prediction.caloric_needs) }}</span>
                <span class="caloric-unit">kcal/day</span>
              </div>
              
              <div class="info-row">
                <span class="label">Model:</span>
                <span class="value">{{ prediction.result.prediction.model }}</span>
              </div>
              <div class="info-row">
                <span class="label">Source:</span>
                <span class="value status-badge" :class="prediction.result.status">
                  {{ prediction.result.status === 'online' ? 'Hugging Face' :
                     prediction.result.status === 'local' ? 'Local Model' :
                     prediction.result.status === 'offline' ? 'Offline Model' :
                     prediction.result.status }}
                </span>
              </div>
              <div v-if="prediction.input.region_encoded !== undefined" class="info-row">
                <span class="label">Region:</span>
                <span class="value">{{ formatRegion(prediction.input.region_encoded) }}</span>
              </div>
              <div v-if="prediction.input.condition_encoded !== undefined" class="info-row">
                <span class="label">Condition:</span>
                <span class="value">{{ formatCondition(prediction.input.condition_encoded) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button class="view-btn">
                <i class="pi pi-eye"></i>
                View Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  padding: var(--spacing-xl) 0;
  min-height: calc(100vh - 200px);
}

.view-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.view-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.view-description {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

/* History Section */
.history-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin: 0;
}

.section-header h2 i {
  color: var(--primary-color);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-color);
}

.empty-state i {
  font-size: 4rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

/* History Grid */
.history-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .history-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .history-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* History Card */
.history-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.history-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.chat-card .card-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.prediction-card .card-header {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.prediction-icon {
  background: var(--accent-color);
}

.card-info h3 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-color);
  font-size: var(--font-size-lg);
}

.timestamp {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.card-content {
  padding: var(--spacing-lg);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.info-row .value {
  color: var(--text-color);
  font-weight: 500;
}

.caloric-display {
  text-align: center;
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(135deg, #d90000 0%, #ff4444 100%);
  color: white;
  border-radius: var(--radius-md);
}

.caloric-value {
  font-size: 2.5rem;
  font-weight: 700;
  display: block;
}

.caloric-unit {
  font-size: var(--font-size-base);
  opacity: 0.9;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 50px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.online {
  background: var(--accent-color);
  color: white;
}

.status-badge.local {
  background: var(--primary-color);
  color: white;
}

.status-badge.offline {
  background: #9c27b0;
  color: white;
}

.card-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
}

.view-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.view-btn:hover {
  background: var(--primary-dark);
}

/* Button Styles */
.btn-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}
</style>
