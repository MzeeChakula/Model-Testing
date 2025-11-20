import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref([])
  const conversationHistory = ref([]) // Array of past conversations
  const conversationState = ref({
    stage: 'greeting', // greeting, demographics, nutrition, confirm, complete
    collectedData: {
      age_group: null,
      region: null,
      condition: null,
      season: null,
      portion_size: null,
      cost_preference: null,
      // Nutrition data
      Energy_kcal_per_serving: null,
      Protein_g_per_serving: null,
      Fat_g_per_serving: null,
      Carbohydrates_g_per_serving: null,
      Fiber_g_per_serving: null,
      Calcium_mg_per_serving: null,
      Iron_mg_per_serving: null,
      Magnesium_mg_per_serving: null,
      Phosphorus_mg_per_serving: null,
      Potassium_mg_per_serving: null,
      Sodium_mg_per_serving: null,
      Zinc_mg_per_serving: null
    },
    pendingQuestion: null
  })

  const isListening = ref(false)
  const isSpeaking = ref(false)

  // Getters
  const hasMessages = computed(() => messages.value.length > 0)

  const isDataComplete = computed(() => {
    const data = conversationState.value.collectedData
    return (
      data.age_group !== null &&
      data.region !== null &&
      data.condition !== null &&
      data.season !== null &&
      data.Energy_kcal_per_serving !== null &&
      data.Protein_g_per_serving !== null
    )
  })

  // Actions
  function addMessage(message) {
    messages.value.push({
      id: Date.now(),
      text: message.text,
      type: message.type, // 'user', 'bot', 'system'
      timestamp: new Date().toISOString(),
      data: message.data || null
    })

    // Save to localStorage
    saveToLocalStorage()
  }

  function addUserMessage(text) {
    addMessage({
      text,
      type: 'user'
    })
  }

  function addBotMessage(text, data = null) {
    addMessage({
      text,
      type: 'bot',
      data
    })
  }

  function addSystemMessage(text) {
    addMessage({
      text,
      type: 'system'
    })
  }

  function updateCollectedData(updates) {
    conversationState.value.collectedData = {
      ...conversationState.value.collectedData,
      ...updates
    }
    saveToLocalStorage()
  }

  function setStage(stage) {
    conversationState.value.stage = stage
    saveToLocalStorage()
  }

  function setPendingQuestion(question) {
    conversationState.value.pendingQuestion = question
  }

  function clearMessages() {
    messages.value = []
    saveToLocalStorage()
  }

  function resetConversation() {
    messages.value = []
    conversationState.value = {
      stage: 'greeting',
      collectedData: {
        age_group: null,
        region: null,
        condition: null,
        season: null,
        portion_size: null,
        cost_preference: null,
        Energy_kcal_per_serving: null,
        Protein_g_per_serving: null,
        Fat_g_per_serving: null,
        Carbohydrates_g_per_serving: null,
        Fiber_g_per_serving: null,
        Calcium_mg_per_serving: null,
        Iron_mg_per_serving: null,
        Magnesium_mg_per_serving: null,
        Phosphorus_mg_per_serving: null,
        Potassium_mg_per_serving: null,
        Sodium_mg_per_serving: null,
        Zinc_mg_per_serving: null
      },
      pendingQuestion: null
    }
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('mzeechakula_chat_messages', JSON.stringify(messages.value))
      localStorage.setItem('mzeechakula_chat_state', JSON.stringify(conversationState.value))
    } catch (error) {
      console.error('Error saving chat to localStorage:', error)
    }
  }

  function loadFromLocalStorage() {
    try {
      const savedMessages = localStorage.getItem('mzeechakula_chat_messages')
      const savedState = localStorage.getItem('mzeechakula_chat_state')
      const savedHistory = localStorage.getItem('mzeechakula_chat_history')

      if (savedMessages) {
        messages.value = JSON.parse(savedMessages)
      }

      if (savedState) {
        conversationState.value = JSON.parse(savedState)
      }

      if (savedHistory) {
        conversationHistory.value = JSON.parse(savedHistory)
      }
    } catch (error) {
      console.error('Error loading chat from localStorage:', error)
    }
  }

  function saveConversationToHistory() {
    try {
      if (messages.value.length === 0) return

      const conversation = {
        id: Date.now(),
        messages: [...messages.value],
        collectedData: { ...conversationState.value.collectedData },
        timestamp: new Date().toISOString(),
        stage: conversationState.value.stage
      }

      conversationHistory.value.unshift(conversation)

      // Keep only last 20 conversations
      if (conversationHistory.value.length > 20) {
        conversationHistory.value = conversationHistory.value.slice(0, 20)
      }

      localStorage.setItem('mzeechakula_chat_history', JSON.stringify(conversationHistory.value))
    } catch (error) {
      console.error('Error saving conversation to history:', error)
    }
  }

  function clearHistory() {
    conversationHistory.value = []
    localStorage.removeItem('mzeechakula_chat_history')
  }

  function loadConversationFromHistory(conversationId) {
    const conversation = conversationHistory.value.find(c => c.id === conversationId)
    if (conversation) {
      messages.value = [...conversation.messages]
      conversationState.value.collectedData = { ...conversation.collectedData }
      conversationState.value.stage = conversation.stage
      saveToLocalStorage()
    }
  }

  // Natural Language Processing helpers
  function parseUserInput(text) {
    const parsed = {
      age_group: null,
      region: null,
      condition: null,
      season: null,
      nutrition: {}
    }

    const lowerText = text.toLowerCase()

    // Age parsing
    if (lowerText.includes('60') || lowerText.includes('sixty') || lowerText.includes('sixties')) {
      parsed.age_group = 0
    } else if (lowerText.includes('70') || lowerText.includes('seventy') || lowerText.includes('seventies')) {
      parsed.age_group = 1
    } else if (lowerText.includes('80') || lowerText.includes('eighty') || lowerText.includes('eighties') || lowerText.includes('90')) {
      parsed.age_group = 2
    }

    // Region parsing
    if (lowerText.includes('central') || lowerText.includes('kampala') || lowerText.includes('buganda')) {
      parsed.region = 0
    } else if (lowerText.includes('western') || lowerText.includes('mbarara') || lowerText.includes('ankole')) {
      parsed.region = 1
    } else if (lowerText.includes('eastern') || lowerText.includes('mbale') || lowerText.includes('busoga')) {
      parsed.region = 2
    } else if (lowerText.includes('northern') || lowerText.includes('gulu') || lowerText.includes('acholi')) {
      parsed.region = 3
    }

    // Condition parsing
    if (lowerText.includes('hypertension') || lowerText.includes('high blood pressure') || lowerText.includes('bp')) {
      parsed.condition = 0
    } else if (lowerText.includes('diabetes') || lowerText.includes('sugar')) {
      parsed.condition = 1
    } else if (lowerText.includes('anemia') || lowerText.includes('anaemia') || lowerText.includes('low blood')) {
      parsed.condition = 2
    } else if (lowerText.includes('osteoporosis') || lowerText.includes('bone')) {
      parsed.condition = 3
    } else if (lowerText.includes('heart') || lowerText.includes('cardiovascular')) {
      parsed.condition = 4
    } else if (lowerText.includes('kidney') || lowerText.includes('renal')) {
      parsed.condition = 5
    } else if (lowerText.includes('arthritis') || lowerText.includes('joint')) {
      parsed.condition = 6
    } else if (lowerText.includes('healthy') || lowerText.includes('no condition') || lowerText.includes('none')) {
      parsed.condition = 7
    }

    // Season parsing
    if (lowerText.includes('dry') || lowerText.includes('hot')) {
      parsed.season = 0
    } else if (lowerText.includes('wet') || lowerText.includes('rain') || lowerText.includes('rainy')) {
      parsed.season = 1
    }

    return parsed
  }

  // Initialize
  loadFromLocalStorage()

  return {
    // State
    messages,
    conversationHistory,
    conversationState,
    isListening,
    isSpeaking,

    // Getters
    hasMessages,
    isDataComplete,

    // Actions
    addMessage,
    addUserMessage,
    addBotMessage,
    addSystemMessage,
    updateCollectedData,
    setStage,
    setPendingQuestion,
    clearMessages,
    resetConversation,
    parseUserInput,
    saveToLocalStorage,
    loadFromLocalStorage,
    saveConversationToHistory,
    clearHistory,
    loadConversationFromHistory
  }
})
