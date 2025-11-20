<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../store/settingsStore'
import { usePredictionStore } from '../store/predictionStore'

// i18n language switching removed; keep static/default language
const { t } = useI18n()
const locale = ref('en')
const settingsStore = useSettingsStore()
const predictionStore = usePredictionStore()

const showClearConfirm = ref(false)



const changeModelPreference = (pref) => {
  settingsStore.setModelPreference(pref)
}

const clearAllData = () => {
  predictionStore.clearHistory()
  showClearConfirm.value = false
}
</script>

<template>
  <div class="settings-view">
    <div class="container">
      <div class="settings-header">
        <h1>{{ t('settings.title') }}</h1>
        <p>Customize your MzeeChakula experience</p>
      </div>

      <!-- Language settings removed; app runs in single default language -->

      <!-- Model Preference -->
      <div class="settings-section card">
        <h2><i class="pi pi-cog"></i> {{ t('settings.modelPreference') }}</h2>
        <p class="section-description">
          Choose which model to use for predictions
        </p>

        <div class="setting-group">
          <button
            @click="changeModelPreference('auto')"
            class="setting-option"
            :class="{ active: settingsStore.modelPreference === 'auto' }"
          >
            <div class="option-content">
              <i class="pi pi-check-circle"></i>
              <div>
                <strong>{{ t('settings.auto') }}</strong>
                <span>Automatically select the best available model</span>
              </div>
            </div>
            <span class="badge recommended">Recommended</span>
          </button>

          <button
            @click="changeModelPreference('online')"
            class="setting-option"
            :class="{ active: settingsStore.modelPreference === 'online' }"
          >
            <div class="option-content">
              <i class="pi pi-check-circle"></i>
              <div>
                <strong>{{ t('settings.online') }}</strong>
                <span>Use online models for best accuracy (requires internet)</span>
              </div>
            </div>
          </button>

          <button
            @click="changeModelPreference('offline')"
            class="setting-option"
            :class="{ active: settingsStore.modelPreference === 'offline' }"
          >
            <div class="option-content">
              <i class="pi pi-check-circle"></i>
              <div>
                <strong>{{ t('settings.offline') }}</strong>
                <span>Use offline models only (works without internet)</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Accessibility -->
      <div class="settings-section card">
        <h2><i class="pi pi-eye"></i> {{ t('settings.accessibility') }}</h2>
        <p class="section-description">
          Adjust display settings for better visibility
        </p>

        <div class="toggle-group">
          <div class="toggle-item">
            <div class="toggle-info">
              <strong>{{ t('settings.highContrast') }}</strong>
              <span>Increase contrast for better readability</span>
            </div>
            <button
              @click="settingsStore.toggleHighContrast()"
              class="toggle-switch"
              :class="{ active: settingsStore.highContrastMode }"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <strong>{{ t('settings.largeFont') }}</strong>
              <span>Increase text size throughout the app</span>
            </div>
            <button
              @click="settingsStore.toggleLargeFont()"
              class="toggle-switch"
              :class="{ active: settingsStore.largeFontMode }"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <strong>Offline Mode</strong>
              <span>Force offline mode even when online</span>
            </div>
            <button
              @click="settingsStore.toggleOfflineMode()"
              class="toggle-switch"
              :class="{ active: settingsStore.offlineMode }"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="settings-section card">
        <h2><i class="pi pi-database"></i> Data Management</h2>
        <p class="section-description">
          Manage your stored predictions and settings
        </p>

        <div class="data-stats">
          <div class="stat">
            <i class="pi pi-history"></i>
            <div>
              <strong>{{ predictionStore.predictionHistory.length }}</strong>
              <span>Saved Predictions</span>
            </div>
          </div>
        </div>

        <button
          @click="showClearConfirm = true"
          class="btn btn-danger"
          :disabled="predictionStore.predictionHistory.length === 0"
        >
          <i class="pi pi-trash"></i>
          {{ t('settings.clearData') }}
        </button>
      </div>

      <!-- About -->
      <div class="settings-section card about-section">
        <h2><i class="pi pi-info-circle"></i> About MzeeChakula</h2>
        <div class="about-content">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Purpose:</strong> AI-powered nutrition planning for elderly care in Uganda</p>
          <p><strong>Technology:</strong> Vue.js, XGBoost ML, Graph-Enhanced LLMs</p>
          <p><strong>Research Project:</strong> Locally-sourced elderly nutrition planning</p>
        </div>
      </div>
    </div>

    <!-- Clear Confirmation Modal -->
    <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <i class="pi pi-exclamation-triangle"></i>
          <h3>{{ t('settings.clearData') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ t('settings.clearDataConfirm') }}</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showClearConfirm = false" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button @click="clearAllData" class="btn btn-danger">
            {{ t('common.yes') }}, Clear Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: var(--spacing-xl) 0;
  min-height: calc(100vh - 200px);
}

.settings-header {
  margin-bottom: var(--spacing-xl);
}

.settings-header h1 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.settings-header p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.settings-section {
  margin-bottom: var(--spacing-xl);
}

.settings-section h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-md);
}

.settings-section h2 i {
  color: var(--primary-color);
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

/* Setting Options */
.setting-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.setting-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.setting-option:hover {
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.setting-option.active {
  border-color: var(--primary-color);
  background: rgba(217, 0, 0, 0.05);
}

.option-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.option-content i {
  font-size: var(--font-size-xl);
  color: var(--border-color);
}

.setting-option.active .option-content i {
  color: var(--primary-color);
}

.option-content div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.option-content strong {
  font-size: var(--font-size-base);
  color: var(--text-color);
}

.option-content span {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 50px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.badge.recommended {
  background: var(--accent-color);
  color: white;
}

/* Toggle Switches */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--surface-color);
  border-radius: var(--radius-md);
  gap: var(--spacing-lg);
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.toggle-info strong {
  font-size: var(--font-size-base);
  color: var(--text-color);
}

.toggle-info span {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.toggle-switch {
  position: relative;
  width: 60px;
  height: 32px;
  background: var(--border-color);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: var(--primary-color);
}

.toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(28px);
}

/* Data Stats */
.data-stats {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-color);
  border-radius: var(--radius-md);
  flex: 1;
}

.stat i {
  font-size: var(--font-size-xl);
  color: var(--primary-color);
}

.stat div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat strong {
  font-size: var(--font-size-lg);
  color: var(--text-color);
}

.stat span {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* About Section */
.about-section {
  background: var(--surface-color);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.about-content p {
  margin: 0;
  color: var(--text-color);
  line-height: 1.6;
}

.about-content strong {
  color: var(--primary-color);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
}

.modal-card {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 2px solid var(--border-color);
}

.modal-header i {
  font-size: 2rem;
  color: var(--warning-color);
}

.modal-header h3 {
  font-size: var(--font-size-xl);
  color: var(--text-color);
  margin: 0;
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-body p {
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.warning-text {
  color: var(--error-color);
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 2px solid var(--border-color);
  justify-content: flex-end;
}
</style>
