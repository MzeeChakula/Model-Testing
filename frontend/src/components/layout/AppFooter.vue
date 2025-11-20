<script setup>
// Use uploaded SVG logo for footer branding
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-logo">
            <div class="footer-logo-icon">
              <img src="/icons/logotransparent.svg" alt="MzeeChakula" style="height:40px; width:auto;" />
            </div>
            <h3>MzeeChakula Model Testing</h3>
          </div>
          <p>Repository and testing environment for trained GNN models, embeddings and the production ensemble.</p>
        </div>

        <div class="footer-section">
          <h4>About</h4>
          <p class="footer-text">
            Model testing and evaluation for MzeeChakula: Graph Neural Networks, knowledge-graph reasoning and ensemble
            recommendations tailored for elderly nutrition in Uganda.
          </p>
          <p class="footer-text" style="margin-top:0.6rem;">
            Production ensemble: <a class="hf-link" href="https://huggingface.co/Shakiran/MzeeChakulaNutritionEnsembleModel" target="_blank" rel="noopener">Shakiran/MzeeChakulaNutritionEnsembleModel</a>
          </p>
        </div>

        <div class="footer-section">
          <h4>Technology</h4>
          <ul class="footer-links">
            <li>Graph Neural Networks (CRGN, HetGNN, GAT)</li>
            <li>Ensemble deployment (Hugging Face)</li>
            <li>Embeddings &amp; Git LFS</li>
            <li>Offline-First Design</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} MzeeChakula — Model Testing</p>
        <p class="footer-tagline">Models &amp; ensemble testing · Version 2.1.0</p>
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

/* Make footer links (external) use white so they are readable on the gradient */
.footer-text a, .hf-link {
  color: #ffffff;
  text-decoration: underline;
}

.footer-text a:hover, .hf-link:hover {
  opacity: 0.9;
}
</style>
