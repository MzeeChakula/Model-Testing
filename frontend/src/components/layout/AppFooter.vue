<script setup>
import { useI18n } from 'vue-i18n'
import { Utensils } from 'lucide-vue-next'

const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-logo">
            <div class="footer-logo-icon">
              <Utensils :size="32" :stroke-width="2.5" />
            </div>
            <h3>{{ t('app.name') }}</h3>
          </div>
          <p>{{ t('app.subtitle') }}</p>
        </div>

        <div class="footer-section">
          <h4>About</h4>
          <p class="footer-text">
            AI-powered nutrition planning for elderly care using graph-enhanced LLMs
            and locally sourced Ugandan foods.
          </p>
        </div>

        <div class="footer-section">
          <h4>Technology</h4>
          <ul class="footer-links">
            <li>XGBoost ML Model</li>
            <li>Knowledge Graph Reasoning</li>
            <li>Offline-First Design</li>
            <li>Mobile Optimized</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} MzeeChakula. Research Project - Uganda</p>
        <p class="footer-tagline">{{ t('app.tagline') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border-top: none;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

@media (min-width: 768px) {
  .footer-content {
    grid-template-columns: repeat(3, 1fr);
  }
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.footer-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
}

.footer-section h3 {
  color: white;
  font-size: var(--font-size-lg);
  margin-bottom: 0;
}

.footer-section h4 {
  color: white;
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.footer-section p {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  margin: 0;
}

.footer-text {
  margin-bottom: var(--spacing-sm);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) 0;
}

.footer-links li::before {
  content: "✓ ";
  color: var(--secondary-color);
  margin-right: var(--spacing-xs);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--spacing-md);
  text-align: center;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
  margin: var(--spacing-xs) 0;
}

.footer-tagline {
  font-style: italic;
  color: var(--secondary-color);
  font-weight: 500;
}
</style>
