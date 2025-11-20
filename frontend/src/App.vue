<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAppStore } from './store/appStore'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import InstallPrompt from './components/layout/InstallPrompt.vue'

const appStore = useAppStore()

onMounted(async () => {
  // Initialize app
  await appStore.initialize()
})
</script>

<template>
  <div id="app">
    <AppHeader />

    <main class="main-content">
      <RouterView />
    </main>

    <AppFooter />

    <!-- PWA Install Prompt -->
    <InstallPrompt />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
}
</style>
