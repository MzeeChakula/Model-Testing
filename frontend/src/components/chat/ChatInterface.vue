<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '../../store/chatStore'
import { useVoice } from '../../composables/useVoice'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  autoFocus: {
    type: Boolean,
    default: true
  },
  showVoiceControls: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['complete', 'close'])

const { t, locale } = useI18n()
const chatStore = useChatStore()
const { isListening, isSpeaking, isSupported: voiceSupported, startListening, stopListening, speak, stopSpeaking } = useVoice()

const userInput = ref('')
const messagesContainer = ref(null)
const inputField = ref(null)
const isTyping = ref(false)
const voiceEnabled = ref(false)

// Computed
const messages = computed(() => chatStore.messages)
const hasMessages = computed(() => chatStore.hasMessages)

// Auto-scroll to bottom when new messages arrive
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

// Scroll to bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Send message
const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text) return

  // Add user message
  chatStore.addUserMessage(text)
  userInput.value = ''

  // Process message
  await processUserMessage(text)
}

// Process user message and generate bot response
const processUserMessage = async (text) => {
  isTyping.value = true

  // Simulate bot "thinking" delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const stage = chatStore.conversationState.stage
  const parsed = chatStore.parseUserInput(text)

  // Handle different conversation stages
  if (stage === 'greeting') {
    await handleGreeting(text, parsed)
  } else if (stage === 'demographics') {
    await handleDemographics(text, parsed)
  } else if (stage === 'nutrition') {
    await handleNutrition(text, parsed)
  } else if (stage === 'lifestyle') {
    await handleLifestyle(text)
  } else if (stage === 'confirm') {
    await handleConfirmation(text)
  }

  isTyping.value = false
}

// Handle greeting stage
const handleGreeting = async (text, parsed) => {
  let response = t('chat.welcome')

  // If user provided some info in greeting, extract it
  if (parsed.age_group !== null || parsed.region !== null || parsed.condition !== null) {
    const updates = {}
    if (parsed.age_group !== null) updates.age_group = parsed.age_group
    if (parsed.region !== null) updates.region = parsed.region
    if (parsed.condition !== null) updates.condition = parsed.condition
    chatStore.updateCollectedData(updates)

    response = t('chat.greetingWithInfo')
  }

  chatStore.addBotMessage(response)

  // Move to demographics
  chatStore.setStage('demographics')
  await new Promise(resolve => setTimeout(resolve, 500))

  // Ask first demographic question
  askNextDemographicQuestion()
}

// Ask next demographic question
const askNextDemographicQuestion = async () => {
  const data = chatStore.conversationState.collectedData

  if (data.age_group === null) {
    const question = t('chat.askAge')
    chatStore.addBotMessage(question)
    if (voiceEnabled.value) await speak(question, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  } else if (data.region === null) {
    const question = t('chat.askRegion')
    chatStore.addBotMessage(question)
    if (voiceEnabled.value) await speak(question, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  } else if (data.condition === null) {
    const question = t('chat.askCondition')
    chatStore.addBotMessage(question)
    if (voiceEnabled.value) await speak(question, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  } else if (data.season === null) {
    const question = t('chat.askSeason')
    chatStore.addBotMessage(question)
    if (voiceEnabled.value) await speak(question, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  } else {
    // Demographics complete, move to nutrition
    chatStore.setStage('nutrition')
    const transition = t('chat.demographicsComplete')
    chatStore.addBotMessage(transition)
    if (voiceEnabled.value) await speak(transition, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })

    await new Promise(resolve => setTimeout(resolve, 1000))
    askNutritionQuestion()
  }
}

// Handle demographics responses
const handleDemographics = async (text, parsed) => {
  const data = chatStore.conversationState.collectedData
  let updated = false

  // Update missing demographics
  if (data.age_group === null && parsed.age_group !== null) {
    chatStore.updateCollectedData({ age_group: parsed.age_group })
    updated = true
  } else if (data.region === null && parsed.region !== null) {
    chatStore.updateCollectedData({ region: parsed.region })
    updated = true
  } else if (data.condition === null && parsed.condition !== null) {
    chatStore.updateCollectedData({ condition: parsed.condition })
    updated = true
  } else if (data.season === null && parsed.season !== null) {
    chatStore.updateCollectedData({ season: parsed.season })
    updated = true
  }

  if (updated) {
    const ack = t('chat.understood')
    chatStore.addBotMessage(ack)
    if (voiceEnabled.value) await speak(ack, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
    await new Promise(resolve => setTimeout(resolve, 300))
  } else {
    const clarify = t('chat.didNotUnderstand')
    chatStore.addBotMessage(clarify)
    if (voiceEnabled.value) await speak(clarify, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  }

  // Ask next question
  await askNextDemographicQuestion()
}

// Ask nutrition question - now food preferences
const askNutritionQuestion = async () => {
  const question = "Great! Now let's talk about food. What foods do you like or have access to? You can mention foods like Matooke, Beans, Fish, Posho, Sweet Potatoes, Groundnuts, Sukuma Wiki, etc. Just list a few you enjoy!"
  chatStore.addBotMessage(question)
  if (voiceEnabled.value) await speak(question, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
}

// Handle nutrition responses - now food preferences
const handleNutrition = async (text, parsed) => {
  const data = chatStore.conversationState.collectedData
  const lowerText = text.toLowerCase()

  // Parse mentioned foods and calculate average nutrition
  const foodDatabase = {
    matooke: { Energy_kcal_per_serving: 122, Protein_g_per_serving: 1.3, Fat_g_per_serving: 0.4, Carbohydrates_g_per_serving: 31.9, Fiber_g_per_serving: 2.3, Calcium_mg_per_serving: 3, Iron_mg_per_serving: 0.6, Zinc_mg_per_serving: 0.2, VitaminA_ug_per_serving: 56, VitaminC_mg_per_serving: 18.4, Potassium_mg_per_serving: 499, Magnesium_mg_per_serving: 37 },
    posho: { Energy_kcal_per_serving: 357, Protein_g_per_serving: 9.4, Fat_g_per_serving: 3.9, Carbohydrates_g_per_serving: 74.3, Fiber_g_per_serving: 7.3, Calcium_mg_per_serving: 7, Iron_mg_per_serving: 2.7, Zinc_mg_per_serving: 2.2, VitaminA_ug_per_serving: 11, VitaminC_mg_per_serving: 0, Potassium_mg_per_serving: 287, Magnesium_mg_per_serving: 127 },
    beans: { Energy_kcal_per_serving: 333, Protein_g_per_serving: 21, Fat_g_per_serving: 1.2, Carbohydrates_g_per_serving: 60, Fiber_g_per_serving: 15, Calcium_mg_per_serving: 143, Iron_mg_per_serving: 7.5, Zinc_mg_per_serving: 3.5, VitaminA_ug_per_serving: 0, VitaminC_mg_per_serving: 4.5, Potassium_mg_per_serving: 1406, Magnesium_mg_per_serving: 171 },
    groundnuts: { Energy_kcal_per_serving: 567, Protein_g_per_serving: 25.8, Fat_g_per_serving: 49.2, Carbohydrates_g_per_serving: 16.1, Fiber_g_per_serving: 8.5, Calcium_mg_per_serving: 92, Iron_mg_per_serving: 4.6, Zinc_mg_per_serving: 3.3, VitaminA_ug_per_serving: 0, VitaminC_mg_per_serving: 0, Potassium_mg_per_serving: 705, Magnesium_mg_per_serving: 168 },
    fish: { Energy_kcal_per_serving: 128, Protein_g_per_serving: 26, Fat_g_per_serving: 2.7, Carbohydrates_g_per_serving: 0, Fiber_g_per_serving: 0, Calcium_mg_per_serving: 14, Iron_mg_per_serving: 0.6, Zinc_mg_per_serving: 0.4, VitaminA_ug_per_serving: 30, VitaminC_mg_per_serving: 0, Potassium_mg_per_serving: 380, Magnesium_mg_per_serving: 27 },
    sukuma: { Energy_kcal_per_serving: 32, Protein_g_per_serving: 3, Fat_g_per_serving: 0.6, Carbohydrates_g_per_serving: 5.4, Fiber_g_per_serving: 3.6, Calcium_mg_per_serving: 232, Iron_mg_per_serving: 0.9, Zinc_mg_per_serving: 0.2, VitaminA_ug_per_serving: 380, VitaminC_mg_per_serving: 35, Potassium_mg_per_serving: 213, Magnesium_mg_per_serving: 33 },
    sweet: { Energy_kcal_per_serving: 86, Protein_g_per_serving: 1.6, Fat_g_per_serving: 0.1, Carbohydrates_g_per_serving: 20.1, Fiber_g_per_serving: 3, Calcium_mg_per_serving: 30, Iron_mg_per_serving: 0.6, Zinc_mg_per_serving: 0.3, VitaminA_ug_per_serving: 709, VitaminC_mg_per_serving: 2.4, Potassium_mg_per_serving: 337, Magnesium_mg_per_serving: 25 },
    cassava: { Energy_kcal_per_serving: 160, Protein_g_per_serving: 1.4, Fat_g_per_serving: 0.3, Carbohydrates_g_per_serving: 38.1, Fiber_g_per_serving: 1.8, Calcium_mg_per_serving: 16, Iron_mg_per_serving: 0.3, Zinc_mg_per_serving: 0.3, VitaminA_ug_per_serving: 1, VitaminC_mg_per_serving: 20.6, Potassium_mg_per_serving: 271, Magnesium_mg_per_serving: 21 }
  }

  const selectedFoods = []
  Object.keys(foodDatabase).forEach(food => {
    if (lowerText.includes(food)) {
      selectedFoods.push(foodDatabase[food])
    }
  })

  // If no foods matched, use default
  if (selectedFoods.length === 0) {
    selectedFoods.push(foodDatabase.matooke)
    selectedFoods.push(foodDatabase.beans)
    selectedFoods.push(foodDatabase.sukuma)
  }

  // Calculate average nutrition
  const nutritionData = {}
  const keys = Object.keys(selectedFoods[0])
  keys.forEach(key => {
    const sum = selectedFoods.reduce((acc, food) => acc + food[key], 0)
    nutritionData[key] = Math.round(sum / selectedFoods.length)
  })

  chatStore.updateCollectedData(nutritionData)

  const response = `Perfect! I noted you like ${selectedFoods.length} food(s). Now, how many meals do you usually eat per day? (2, 3, or 4)`
  chatStore.addBotMessage(response)
  if (voiceEnabled.value) await speak(response, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })

  // Move to lifestyle questions
  chatStore.setStage('lifestyle')
}

// Handle lifestyle questions
const handleLifestyle = async (text) => {
  const data = chatStore.conversationState.collectedData
  const lowerText = text.toLowerCase()

  if (!data.mealsPerDay) {
    // Parse meals per day
    const meals = parseInt(text) || 3
    chatStore.updateCollectedData({ mealsPerDay: meals })

    const response = `Got it, ${meals} meals per day. What's your activity level? (low, moderate, or active)`
    chatStore.addBotMessage(response)
    if (voiceEnabled.value) await speak(response, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  } else if (!data.activityLevel) {
    // Parse activity level
    let activityLevel = 'moderate'
    if (lowerText.includes('low') || lowerText.includes('sitting')) {
      activityLevel = 'low'
    } else if (lowerText.includes('active') || lowerText.includes('exercise')) {
      activityLevel = 'active'
    }
    chatStore.updateCollectedData({ activityLevel })

    const response = `Understood, ${activityLevel} activity. What's your daily food budget? (low, moderate, or high)`
    chatStore.addBotMessage(response)
    if (voiceEnabled.value) await speak(response, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  } else if (!data.budget) {
    // Parse budget
    let budget = 'moderate'
    if (lowerText.includes('low') || lowerText.includes('small')) {
      budget = 'low'
    } else if (lowerText.includes('high') || lowerText.includes('large')) {
      budget = 'high'
    }
    chatStore.updateCollectedData({ budget })

    const response = "Almost done! Do you have any dietary restrictions? (vegetarian, low-salt, low-sugar, soft-foods, or just say 'none')"
    chatStore.addBotMessage(response)
    if (voiceEnabled.value) await speak(response, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  } else {
    // Parse dietary restrictions
    const restrictions = []
    if (lowerText.includes('vegetarian')) restrictions.push('vegetarian')
    if (lowerText.includes('salt') || lowerText.includes('hypertension')) restrictions.push('low-salt')
    if (lowerText.includes('sugar') || lowerText.includes('diabetes')) restrictions.push('low-sugar')
    if (lowerText.includes('soft')) restrictions.push('soft-foods')

    chatStore.updateCollectedData({ dietaryRestrictions: restrictions })

    const response = "Perfect! I have all the information I need. Let me confirm everything is correct..."
    chatStore.addBotMessage(response)
    if (voiceEnabled.value) await speak(response, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })

    // Move to confirmation
    chatStore.setStage('confirm')
    await new Promise(resolve => setTimeout(resolve, 500))

    const confirmMsg = "Is all this information correct? Say 'yes' to generate your personalized meal plan, or 'no' to start over."
    chatStore.addBotMessage(confirmMsg)
    if (voiceEnabled.value) await speak(confirmMsg, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  }
}

// Handle confirmation
const handleConfirmation = async (text) => {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('yes') || lowerText.includes('correct') || lowerText.includes('right') || lowerText.includes('okay') || lowerText.includes('ok')) {
    chatStore.setStage('complete')

    const finalMsg = "Great! Generating your personalized meal plan now..."
    chatStore.addBotMessage(finalMsg)
    if (voiceEnabled.value) await speak(finalMsg, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })

    // Emit complete event with collected data
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('complete', chatStore.conversationState.collectedData)
  } else {
    const restart = t('chat.restartConversation')
    chatStore.addBotMessage(restart)
    if (voiceEnabled.value) await speak(restart, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })

    await new Promise(resolve => setTimeout(resolve, 500))
    chatStore.resetConversation()
    startConversation()
  }
}

// Start conversation
const startConversation = async () => {
  const greeting = t('chat.greeting')
  chatStore.addBotMessage(greeting)
  if (voiceEnabled.value) {
    await speak(greeting, { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  }
}

// Voice input
const toggleVoiceInput = () => {
  console.log('Toggle voice input clicked. Currently listening:', isListening.value)
  console.log('Voice supported:', voiceSupported.value)
  
  if (!voiceSupported.value) {
    alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.')
    return
  }
  
  if (isListening.value) {
    console.log('Stopping voice input...')
    stopListening()
  } else {
    const lang = locale.value === 'lg' ? 'lg-UG' : 'en-US'
    console.log('Starting voice input with language:', lang)
    startListening(
      lang,
      (result) => {
        console.log('Voice input result:', result)
        userInput.value = result
        // Auto-send after a brief delay to show the text
        setTimeout(() => {
          sendMessage()
        }, 500)
      },
      (error) => {
        console.error('Voice input error:', error)
        alert('Voice input error: ' + error + '. Please check microphone permissions.')
      }
    )
  }
}

// Toggle voice output
const toggleVoiceOutput = () => {
  console.log('Toggle voice output clicked. Currently enabled:', voiceEnabled.value)
  console.log('Voice supported:', voiceSupported.value)
  
  if (!voiceSupported.value) {
    alert('Voice output is not supported in your browser. Please use Chrome, Edge, or Safari.')
    return
  }
  
  voiceEnabled.value = !voiceEnabled.value
  console.log('Voice output now:', voiceEnabled.value ? 'ENABLED' : 'DISABLED')
  
  if (!voiceEnabled.value && isSpeaking.value) {
    stopSpeaking()
  }
  
  // Give user feedback
  if (voiceEnabled.value) {
    speak('Voice output enabled', { lang: locale.value === 'lg' ? 'lg-UG' : 'en-US' })
  }
}

// Initialize
onMounted(() => {
  if (props.autoFocus && inputField.value) {
    inputField.value.focus()
  }

  // Start conversation if no messages
  if (!hasMessages.value) {
    startConversation()
  }

  scrollToBottom()
})
</script>

<template>
  <div class="chat-interface">
    <!-- Messages Container -->
    <div ref="messagesContainer" class="messages-container">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="[message.type]"
      >
        <div class="message-avatar">
          <i v-if="message.type === 'user'" class="pi pi-user"></i>
          <i v-else-if="message.type === 'bot'" class="pi pi-comments"></i>
          <i v-else class="pi pi-info-circle"></i>
        </div>

        <div class="message-content">
          <div class="message-text">{{ message.text }}</div>
          <div class="message-time">
            {{ new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="message bot typing-indicator">
        <div class="message-avatar">
          <i class="pi pi-comments"></i>
        </div>
        <div class="message-content">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Container -->
    <div class="input-container">
      <!-- Voice Not Supported Warning -->
      <div v-if="showVoiceControls && !voiceSupported" class="voice-warning">
        <i class="pi pi-exclamation-triangle"></i>
        <span>Voice features not supported in this browser. Use Chrome, Edge, or Safari for voice input/output.</span>
      </div>

      <!-- Text Input -->
      <div class="input-wrapper">
        <div v-if="isListening" class="listening-indicator">
          <i class="pi pi-microphone"></i>
          <span>Listening...</span>
          <div class="sound-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <div class="input-row">
          <input
            ref="inputField"
            v-model="userInput"
            type="text"
            :placeholder="isListening ? t('chat.listening') : t('chat.typeMessage')"
            :disabled="isListening"
            @keypress.enter="sendMessage"
            class="chat-input"
            :class="{ listening: isListening }"
          />

          <!-- Voice Controls Next to Send Button -->
          <button
            v-if="showVoiceControls && voiceSupported"
            @click="toggleVoiceOutput"
            class="voice-btn-inline"
            :class="{ active: voiceEnabled }"
            :title="voiceEnabled ? t('chat.disableVoice') : t('chat.enableVoice')"
          >
            <i :class="voiceEnabled ? 'pi pi-volume-up' : 'pi pi-volume-off'"></i>
          </button>

          <button
            v-if="showVoiceControls && voiceSupported"
            @click="toggleVoiceInput"
            class="voice-btn-inline mic-btn"
            :class="{ active: isListening }"
            :title="t('chat.voiceInput')"
          >
            <i class="pi pi-microphone"></i>
            <span v-if="isListening" class="pulse-ring"></span>
          </button>

          <button
            @click="sendMessage"
            :disabled="!userInput.trim()"
            class="send-btn"
          >
            <i class="pi pi-send"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  scroll-behavior: smooth;
}

/* Message Styles */
.message {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
  animation: slideIn 0.3s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--font-size-lg);
}

.message.user .message-avatar {
  background: var(--primary-color);
  color: white;
}

.message.bot .message-avatar {
  background: var(--accent-color);
  color: white;
}

.message.system .message-avatar {
  background: var(--info-color);
  color: white;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.message.user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-text {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot .message-text {
  background: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
}

.message.system .message-text {
  background: rgba(23, 162, 184, 0.1);
  color: var(--info-color);
  text-align: center;
  font-size: var(--font-size-sm);
  font-style: italic;
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  padding: 0 var(--spacing-xs);
}

/* Typing Indicator */
.typing-indicator .message-content {
  background: white;
  border: 1px solid var(--border-color);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border-bottom-left-radius: 4px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: typingDot 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

/* Input Container */
.input-container {
  padding: var(--spacing-md);
  background: white;
  border-top: 2px solid var(--border-color);
}

.voice-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: #856404;
}

.voice-warning i {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.voice-btn-inline {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: white;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  position: relative;
}

.voice-btn-inline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: scale(1.05);
}

.voice-btn-inline.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.voice-btn-inline.mic-btn {
  position: relative;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  animation: pulse 1.5s infinite;
  pointer-events: none;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  position: relative;
}

.listening-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, #d90000 0%, #ff4444 100%);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  animation: slideDown 0.3s ease-out;
}

.listening-indicator i {
  font-size: var(--font-size-lg);
  animation: pulse 1s infinite;
}

.sound-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
}

.sound-wave span {
  width: 3px;
  height: 12px;
  background: white;
  border-radius: 3px;
  animation: soundWave 1s infinite ease-in-out;
}

.sound-wave span:nth-child(1) {
  animation-delay: 0s;
}

.sound-wave span:nth-child(2) {
  animation-delay: 0.1s;
}

.sound-wave span:nth-child(3) {
  animation-delay: 0.2s;
}

.sound-wave span:nth-child(4) {
  animation-delay: 0.3s;
}

.input-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: 50px;
  font-size: var(--font-size-base);
  transition: border-color 0.2s;
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.chat-input:disabled {
  background: var(--surface-color);
  cursor: not-allowed;
}

.chat-input.listening {
  border-color: var(--primary-color);
  background: #fff5f5;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: var(--font-size-lg);
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes soundWave {
  0%, 100% {
    height: 12px;
  }
  50% {
    height: 24px;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .messages-container {
    padding: var(--spacing-md);
  }
}
</style>
