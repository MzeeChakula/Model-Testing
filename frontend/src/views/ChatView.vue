<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '../store/chatStore'
import { usePredictionStore } from '../store/predictionStore'
import { useSettingsStore } from '../store/settingsStore'
import ChatInterface from '../components/chat/ChatInterface.vue'

const router = useRouter()
const { t } = useI18n()
const chatStore = useChatStore()
const predictionStore = usePredictionStore()
const settingsStore = useSettingsStore()

const isProcessing = ref(false)
const error = ref(null)

const pendingPredictionData = ref(null)
const showRetryOption = ref(false)

// Handle chat completion
const handleChatComplete = async (collectedData) => {
  isProcessing.value = true
  error.value = null
  showRetryOption.value = false

  try {
    // Prepare input data for prediction
    const inputData = {
      age_group_encoded: collectedData.age_group,
      region_encoded: collectedData.region,
      condition_encoded: collectedData.condition,
      season_encoded: collectedData.season,
      portion_size_g: collectedData.portion_size || 250,
      estimated_cost_ugx: collectedData.cost_preference || 5000,
      Energy_kcal_per_serving: collectedData.Energy_kcal_per_serving,
      Protein_g_per_serving: collectedData.Protein_g_per_serving,
      Fat_g_per_serving: collectedData.Fat_g_per_serving,
      Carbohydrates_g_per_serving: collectedData.Carbohydrates_g_per_serving,
      Fiber_g_per_serving: collectedData.Fiber_g_per_serving,
      Calcium_mg_per_serving: collectedData.Calcium_mg_per_serving,
      Iron_mg_per_serving: collectedData.Iron_mg_per_serving,
      Magnesium_mg_per_serving: collectedData.Magnesium_mg_per_serving,
      Potassium_mg_per_serving: collectedData.Potassium_mg_per_serving,
      Zinc_mg_per_serving: collectedData.Zinc_mg_per_serving,
      VitaminA_ug_per_serving: collectedData.VitaminA_ug_per_serving || 0,
      VitaminC_mg_per_serving: collectedData.VitaminC_mg_per_serving || 0
    }

    // Store for potential retry
    pendingPredictionData.value = inputData

    // Get prediction
    const modelPreference = settingsStore.offlineMode ? 'offline' : (settingsStore.modelPreference || 'auto')
    await predictionStore.predict(inputData, modelPreference)

    // Save chat history before navigating
    chatStore.saveConversationToHistory()

    // Navigate to results
    router.push('/results')
  } catch (err) {
    error.value = err.message || t('errors.predictionFailed')
    console.error('Prediction error:', err)

    // Show retry option
    showRetryOption.value = true

    // Add error message to chat with retry instruction
    chatStore.addSystemMessage(
      t('errors.predictionFailed') + ': ' + err.message + 
      '. Say "try again" or "retry" to attempt the prediction again.'
    )
  } finally {
    isProcessing.value = false
  }
}

// Retry prediction
const retryPrediction = async () => {
  if (!pendingPredictionData.value) {
    chatStore.addSystemMessage('No pending prediction to retry.')
    return
  }

  chatStore.addSystemMessage('Retrying prediction...')
  
  try {
    isProcessing.value = true
    error.value = null
    showRetryOption.value = false

    const modelPreference = settingsStore.offlineMode ? 'offline' : (settingsStore.modelPreference || 'auto')
    await predictionStore.predict(pendingPredictionData.value, modelPreference)

    // Save chat history
    chatStore.saveConversationToHistory()

    chatStore.addSystemMessage('Prediction successful! Redirecting to results...')
    
    setTimeout(() => {
      router.push('/results')
    }, 1000)
  } catch (err) {
    error.value = err.message || t('errors.predictionFailed')
    showRetryOption.value = true
    chatStore.addSystemMessage('Retry failed: ' + err.message + '. Say "try again" to retry.')
  } finally {
    isProcessing.value = false
  }
}

// Reset conversation
const resetConversation = () => {
  chatStore.resetConversation()
}

// Go back to form view
const switchToForm = () => {
  router.push('/predict')
}

onMounted(() => {
  // If there are no messages, the ChatInterface will start the conversation automatically
})
</script>

<template>
  <div class="chat-view">
    <div class="container">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-content">
          <div class="header-text">
            <h1><i class="pi pi-comments"></i> {{ t('chat.title') }}</h1>
            <p>{{ t('chat.subtitle') }}</p>
          </div>

          <div class="header-actions">
            <button @click="switchToForm" class="action-btn secondary">
              <i class="pi pi-list"></i>
              {{ t('chat.switchToForm') }}
            </button>

            <button @click="resetConversation" class="action-btn">
              <i class="pi pi-refresh"></i>
              {{ t('chat.reset') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="chat-container card">
        <ChatInterface
          :auto-focus="true"
          :show-voice-controls="true"
          @complete="handleChatComplete"
        />
      </div>

      <!-- Processing Overlay -->
      <div v-if="isProcessing" class="processing-overlay">
        <div class="processing-card">
          <div class="spinner"></div>
          <h3>{{ t('chat.processing') }}</h3>
          <p>{{ t('chat.processingDescription') }}</p>
        </div>
      </div>

      <!-- Error Message with Retry -->
      <div v-if="error" class="error-banner">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ error }}</span>
        <button v-if="showRetryOption" @click="retryPrediction" class="retry-btn">
          <i class="pi pi-refresh"></i>
          Retry
        </button>
        <button @click="error = null" class="close-btn">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Voice Features Banner -->
      <div class="voice-features-banner">
        <div class="banner-header">
          <i class="pi pi-microphone"></i>
          <h3>Voice-Enabled Chat Assistant</h3>
        </div>
        <div class="voice-features-grid">
          <div class="feature-item">
            <div class="feature-icon microphone">
              <i class="pi pi-microphone"></i>
            </div>
            <div class="feature-content">
              <h4>Voice Input</h4>
              <p>Click the microphone button to speak your answers instead of typing</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon speaker">
              <i class="pi pi-volume-up"></i>
            </div>
            <div class="feature-content">
              <h4>Voice Output</h4>
              <p>Enable the speaker button to hear responses read aloud</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon elderly">
              <i class="pi pi-heart"></i>
            </div>
            <div class="feature-content">
              <h4>Elderly-Friendly</h4>
              <p>Perfect for elderly users or those who prefer conversation over typing</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions-card card">
        <h3><i class="pi pi-info-circle"></i> {{ t('chat.howItWorks') }}</h3>
        <ul>
          <li>
            <i class="pi pi-check-circle"></i>
            {{ t('chat.instruction1') }}
          </li>
          <li>
            <i class="pi pi-microphone"></i>
            {{ t('chat.instruction2') }}
          </li>
          <li>
            <i class="pi pi-volume-up"></i>
            {{ t('chat.instruction3') }}
          </li>
          <li>
            <i class="pi pi-mobile"></i>
            {{ t('chat.instruction4') }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  padding: var(--spacing-xl) 0;
  min-height: calc(100vh - 200px);
}

.chat-header {
  margin-bottom: var(--spacing-xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.header-text h1 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.header-text p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.action-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.action-btn.secondary:hover {
  background: var(--primary-color);
  color: white;
}

/* Chat Container */
.chat-container {
  height: 600px;
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

/* Processing Overlay */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.processing-card {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  max-width: 400px;
  animation: slideUp 0.3s;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-lg);
  border: 4px solid var(--surface-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.processing-card h3 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.processing-card p {
  color: var(--text-secondary);
}

/* Error Banner */
.error-banner {
  position: fixed;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--error-color);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 999;
  max-width: 90%;
  animation: slideUp 0.3s;
}

.error-banner i {
  font-size: var(--font-size-xl);
}

.error-banner .close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: var(--font-size-lg);
  transition: opacity 0.2s;
}

.error-banner .close-btn:hover {
  opacity: 0.8;
}

.error-banner .retry-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  color: var(--error-color);
  border: 2px solid white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.error-banner .retry-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

/* Instructions Card */
.instructions-card {
  margin-top: var(--spacing-xl);
}

.instructions-card h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
}

.instructions-card ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .instructions-card ul {
    grid-template-columns: repeat(2, 1fr);
  }
}

.instructions-card li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--surface-color);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary-color);
}

.instructions-card li i {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  margin-top: 2px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Voice Features Banner */
.voice-features-banner {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.banner-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
}

.banner-header i {
  font-size: 2rem;
  animation: pulse-icon 2s infinite;
}

.banner-header h3 {
  font-size: var(--font-size-xl);
  margin: 0;
  color: var(--text-color);
}

.voice-features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .voice-features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
  }
}

.feature-item {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}

@media (min-width: 768px) {
  .feature-item {
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.5rem;
  color: white;
}

@media (min-width: 768px) {
  .feature-icon {
    width: 60px;
    height: 60px;
    font-size: 1.75rem;
  }
}

.feature-icon.microphone {
  background: linear-gradient(135deg, #d90000 0%, #ff4444 100%);
  animation: pulse-mic 2s infinite;
}

.feature-icon.speaker {
  background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
}

.feature-icon.elderly {
  background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
}

.feature-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-color);
  font-size: var(--font-size-base);
}

@media (min-width: 768px) {
  .feature-content h4 {
    font-size: var(--font-size-lg);
  }
}

.feature-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.4;
}

@media (min-width: 768px) {
  .feature-content p {
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }
}

@keyframes pulse-icon {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes pulse-mic {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(217, 0, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(217, 0, 0, 0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }

  .chat-container {
    height: 500px;
  }

  .voice-features-banner {
    padding: var(--spacing-lg);
  }

  .banner-header h3 {
    font-size: var(--font-size-lg);
  }

}
</style>
