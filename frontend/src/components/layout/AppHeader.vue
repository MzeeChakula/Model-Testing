<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../store/appStore'
import { useSettingsStore } from '../../store/settingsStore'
import { Utensils } from 'lucide-vue-next'

const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const toggleLanguage = () => {
  const newLang = locale.value === 'en' ? 'lg' : 'en'
  locale.value = newLang
  settingsStore.setLanguage(newLang)
}

const navItems = computed(() => [
  { path: '/', name: 'home', icon: 'pi pi-home', label: t('nav.home') },
  { path: '/predict', name: 'predict', icon: 'pi pi-plus-circle', label: t('nav.predict') },
  { path: '/chat', name: 'chat', icon: 'pi pi-comments', label: t('nav.chat') || 'Chat' },
  { path: '/foods', name: 'foods', icon: 'pi pi-book', label: t('nav.foods') },
  { path: '/history', name: 'history', icon: 'pi pi-history', label: t('nav.history') || 'History' },
  { path: '/pricing', name: 'pricing', icon: 'pi pi-tag', label: t('nav.pricing') || 'Pricing' },
  { path: '/contact', name: 'contact', icon: 'pi pi-envelope', label: t('nav.contact') || 'Contact' },
  { path: '/settings', name: 'settings', icon: 'pi pi-cog', label: t('nav.settings') }
])
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-left">
        <RouterLink to="/" class="logo-link">
          <div class="logo-icon-container">
            <Utensils :size="24" :stroke-width="2.5" />
          </div>
          <span class="logo-text">{{ t('app.name') }}</span>
        </RouterLink>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="nav-link"
          :class="{ active: route.path === item.path }"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="header-right">
        <!-- Online/Offline Status -->
        <div class="status-indicator">
          <span
            class="status-badge"
            :class="appStore.isOnline ? 'status-online' : 'status-offline'"
          >
            <i :class="appStore.isOnline ? 'pi pi-wifi' : 'pi pi-ban'"></i>
            {{ appStore.isOnline ? t('common.online') : t('common.offline') }}
          </span>
        </div>

        <!-- Language Toggle -->
        <button
          @click="toggleLanguage"
          class="lang-toggle"
          :title="locale === 'en' ? 'Switch to Luganda' : 'Switch to English'"
        >
          <i class="pi pi-globe"></i>
          {{ locale === 'en' ? 'EN' : 'LG' }}
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="mobile-nav-overlay" @click="mobileMenuOpen = false">
        <nav class="mobile-nav" @click.stop>
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            class="mobile-nav-link"
            :class="{ active: route.path === item.path }"
            @click="mobileMenuOpen = false"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-sm);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 72px;
}

@media (min-width: 1100px) {
  .header-container {
    padding: var(--spacing-md) var(--spacing-lg);
    gap: var(--spacing-md);
  }
}

.header-left {
  flex-shrink: 0;
  justify-self: start;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: white;
  text-decoration: none;
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.logo-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  transition: transform 0.2s;
}

.logo-link:hover .logo-icon-container {
  transform: scale(1.1);
}

.logo-text {
  display: none;
}

@media (min-width: 480px) {
  .logo-text {
    display: inline;
  }
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  gap: var(--spacing-xs);
  align-items: center;
  justify-self: center;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 8px;
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
  font-weight: 500;
  font-size: 0.75rem;
  white-space: nowrap;
  min-height: 44px;
}

@media (min-width: 900px) {
  .nav-link {
    padding: 10px 10px;
    font-size: 0.8rem;
    gap: 6px;
  }
}

@media (min-width: 1100px) {
  .nav-link {
    padding: 10px 14px;
    font-size: 0.9rem;
    gap: var(--spacing-xs);
  }
}

@media (min-width: 1300px) {
  .nav-link {
    padding: 10px 16px;
    font-size: 0.95rem;
  }
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-link i {
  font-size: 0.9rem;
}

@media (min-width: 1100px) {
  .nav-link i {
    font-size: 1rem;
  }
}

/* Header Right */
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  justify-self: end;
}

.status-indicator {
  display: none;
}

@media (min-width: 768px) {
  .status-indicator {
    display: block;
  }
}

@media (min-width: 768px) {
  .status-indicator {
    display: block;
  }
}

.lang-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  min-height: 40px;
}

.lang-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.mobile-menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (min-width: 768px) {
  .mobile-menu-toggle {
    display: none;
  }
}

/* Mobile Navigation Overlay */
.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

@media (min-width: 768px) {
  .mobile-nav-overlay {
    display: none;
  }
}

.mobile-nav {
  background: var(--primary-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-lg);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.3s;
  font-weight: 500;
  font-size: var(--font-size-xl);
  background: rgba(255, 255, 255, 0.1);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(8px);
}

.mobile-nav-link i {
  font-size: 1.75rem;
  width: 40px;
}

/* Mobile Menu Transitions */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-enter-active .mobile-nav,
.mobile-menu-leave-active .mobile-nav {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-nav {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

.mobile-menu-leave-to .mobile-nav {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
