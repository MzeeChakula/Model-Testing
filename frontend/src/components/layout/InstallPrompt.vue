<script setup>
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
const deferredPrompt = ref(null)
const isInstalled = ref(false)

onMounted(() => {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    isInstalled.value = true
    return
  }

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showInstallPrompt.value = true
  })

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true
    showInstallPrompt.value = false
    deferredPrompt.value = null
  })
})

const installApp = async () => {
  if (!deferredPrompt.value) {
    return
  }

  // Show the install prompt
  deferredPrompt.value.prompt()

  // Wait for user response
  const { outcome } = await deferredPrompt.value.userChoice

  if (outcome === 'accepted') {
    console.log('User accepted the install prompt')
  } else {
    console.log('User dismissed the install prompt')
  }

  // Clear the deferred prompt
  deferredPrompt.value = null
  showInstallPrompt.value = false
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  // Store dismissal in localStorage to not show again for 7 days
  localStorage.setItem('installPromptDismissed', Date.now().toString())
}

// Check if prompt was dismissed recently
onMounted(() => {
  const dismissed = localStorage.getItem('installPromptDismissed')
  if (dismissed) {
    const dismissedTime = parseInt(dismissed)
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - dismissedTime < sevenDaysInMs) {
      showInstallPrompt.value = false
    }
  }
})
</script>

<template>
  <!-- Install Banner (Bottom of screen) -->
  <transition name="slide-up">
    <div v-if="showInstallPrompt && !isInstalled" class="install-prompt">
      <div class="install-content">
        <div class="install-icon">
          <i class="pi pi-download"></i>
        </div>
        <div class="install-text">
          <strong>Install MzeeChakula</strong>
          <span>Add to your home screen for quick access and offline use</span>
        </div>
        <div class="install-actions">
          <button @click="installApp" class="btn-install">
            <i class="pi pi-plus-circle"></i>
            Install
          </button>
          <button @click="dismissPrompt" class="btn-dismiss">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Installed Indicator (Optional) -->
  <div v-if="isInstalled" class="installed-indicator">
    <i class="pi pi-check-circle"></i>
    <span>App Installed</span>
  </div>
</template>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-md);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@media (min-width: 768px) {
  .install-prompt {
    bottom: var(--spacing-lg);
    left: var(--spacing-lg);
    right: auto;
    max-width: 400px;
    border-radius: var(--radius-lg);
  }
}

.install-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.install-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  flex-shrink: 0;
}

.install-icon i {
  font-size: 1.5rem;
  color: white;
}

.install-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.install-text strong {
  font-size: var(--font-size-base);
  color: white;
}

.install-text span {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.install-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.btn-install {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  color: var(--primary-color);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: var(--font-size-sm);
}

.btn-install:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-dismiss {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Installed Indicator */
.installed-indicator {
  position: fixed;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--accent-color);
  color: white;
  border-radius: 50px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  box-shadow: var(--shadow-md);
  z-index: 100;
  opacity: 0;
  animation: fadeInOut 3s ease-in-out;
}

.installed-indicator i {
  font-size: var(--font-size-base);
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Mobile specific */
@media (max-width: 767px) {
  .install-content {
    flex-wrap: wrap;
  }

  .install-text {
    flex-basis: 100%;
    order: 1;
  }

  .install-icon {
    order: 0;
  }

  .install-actions {
    order: 2;
    margin-left: auto;
  }
}
</style>
