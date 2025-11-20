import { ref, onUnmounted } from 'vue'

export function useVoice() {
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const error = ref(null)

  let recognition = null
  let synthesis = null

  // Check browser support
  const checkSupport = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis

    isSupported.value = !!(SpeechRecognition && speechSynthesis)

    return isSupported.value
  }

  // Initialize support check
  checkSupport()

  // Initialize speech recognition
  const initRecognition = (language = 'en-US') => {
    if (!checkSupport()) {
      error.value = 'Speech recognition not supported in this browser'
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = language
    recognition.maxAlternatives = 1

    return recognition
  }

  // Start listening
  const startListening = (language = 'en-US', onResult, onError) => {
    if (!recognition) {
      initRecognition(language)
    }

    if (!recognition) {
      error.value = 'Could not initialize speech recognition'
      if (onError) onError(error.value)
      return
    }

    recognition.lang = language

    recognition.onstart = () => {
      isListening.value = true
      transcript.value = ''
      error.value = null
    }

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      transcript.value = result

      if (onResult) {
        onResult(result)
      }
    }

    recognition.onerror = (event) => {
      error.value = event.error
      isListening.value = false

      if (onError) {
        onError(event.error)
      }
    }

    recognition.onend = () => {
      isListening.value = false
    }

    try {
      recognition.start()
    } catch (err) {
      error.value = 'Failed to start recognition: ' + err.message
      isListening.value = false
      if (onError) onError(error.value)
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognition && isListening.value) {
      recognition.stop()
      isListening.value = false
    }
  }

  // Speak text (Text-to-Speech)
  const speak = (text, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!checkSupport()) {
        const err = 'Speech synthesis not supported in this browser'
        error.value = err
        reject(err)
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Set options
      utterance.lang = options.lang || 'en-US'
      utterance.rate = options.rate || 0.9 // Slightly slower for elderly
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1

      utterance.onstart = () => {
        isSpeaking.value = true
      }

      utterance.onend = () => {
        isSpeaking.value = false
        resolve()
      }

      utterance.onerror = (event) => {
        isSpeaking.value = false
        error.value = event.error
        reject(event.error)
      }

      try {
        window.speechSynthesis.speak(utterance)
      } catch (err) {
        error.value = 'Failed to speak: ' + err.message
        isSpeaking.value = false
        reject(err)
      }
    })
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis && isSpeaking.value) {
      window.speechSynthesis.cancel()
      isSpeaking.value = false
    }
  }

  // Get available voices
  const getVoices = () => {
    if (!window.speechSynthesis) {
      return []
    }
    return window.speechSynthesis.getVoices()
  }

  // Cleanup
  onUnmounted(() => {
    stopListening()
    stopSpeaking()
  })

  return {
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    error,
    checkSupport,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    getVoices
  }
}
