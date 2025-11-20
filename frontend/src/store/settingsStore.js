import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const language = ref('en')
  const modelPreference = ref('auto') // 'auto', 'online', 'offline'
  const offlineMode = ref(false)
  const highContrastMode = ref(false)
  const largeFontMode = ref(false)
  const defaultRegion = ref(null)
  const defaultSeason = ref(null)

  // Actions
  function setLanguage(lang) {
    language.value = lang
    saveToLocalStorage()
  }

  function setModelPreference(pref) {
    modelPreference.value = pref
    saveToLocalStorage()
  }

  function toggleOfflineMode() {
    offlineMode.value = !offlineMode.value
    saveToLocalStorage()
  }

  function toggleHighContrast() {
    highContrastMode.value = !highContrastMode.value
    updateAccessibilityClasses()
    saveToLocalStorage()
  }

  function toggleLargeFont() {
    largeFontMode.value = !largeFontMode.value
    updateAccessibilityClasses()
    saveToLocalStorage()
  }

  function setDefaults(region, season) {
    defaultRegion.value = region
    defaultSeason.value = season
    saveToLocalStorage()
  }

  function updateAccessibilityClasses() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('high-contrast', highContrastMode.value)
      document.body.classList.toggle('large-font', largeFontMode.value)
    }
  }

  function saveToLocalStorage() {
    try {
      const settings = {
        language: language.value,
        modelPreference: modelPreference.value,
        offlineMode: offlineMode.value,
        highContrastMode: highContrastMode.value,
        largeFontMode: largeFontMode.value,
        defaultRegion: defaultRegion.value,
        defaultSeason: defaultSeason.value
      }
      localStorage.setItem('mzeechakula_settings', JSON.stringify(settings))
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('mzeechakula_settings')
      if (saved) {
        const settings = JSON.parse(saved)
        language.value = settings.language || 'en'
        modelPreference.value = settings.modelPreference || 'auto'
        offlineMode.value = settings.offlineMode || false
        highContrastMode.value = settings.highContrastMode || false
        largeFontMode.value = settings.largeFontMode || false
        defaultRegion.value = settings.defaultRegion || null
        defaultSeason.value = settings.defaultSeason || null

        updateAccessibilityClasses()
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  function reset() {
    language.value = 'en'
    modelPreference.value = 'auto'
    offlineMode.value = false
    highContrastMode.value = false
    largeFontMode.value = false
    defaultRegion.value = null
    defaultSeason.value = null
    updateAccessibilityClasses()
    saveToLocalStorage()
  }

  // Initialize
  loadFromLocalStorage()

  return {
    // State
    language,
    modelPreference,
    offlineMode,
    highContrastMode,
    largeFontMode,
    defaultRegion,
    defaultSeason,
    // Actions
    setLanguage,
    setModelPreference,
    toggleOfflineMode,
    toggleHighContrast,
    toggleLargeFont,
    setDefaults,
    reset,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
