<script setup>
import { ref, watch, onMounted } from 'vue'
import { usePredictionStore } from '../../store/predictionStore'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  inputData: { type: Object, required: true }
})

const { t } = useI18n()
const store = usePredictionStore()
const items = ref([])
const loading = ref(false)
const error = ref(null)

async function load() {
  try {
    loading.value = true
    error.value = null
    const res = await store.fetchRecommendations(props.inputData, 6)
    items.value = res || []
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.inputData) load()
})

watch(() => props.inputData, (n) => {
  if (n) load()
})
</script>

<template>
  <div class="section-card">
    <h2 class="section-title">
      <i class="pi pi-utensils"></i>
      {{ t('results.recommendations') || 'Recommended Local Foods' }}
    </h2>

    <div v-if="loading" class="loading">Loading recommendations...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="items && items.length">
      <ul class="recommend-list">
        <li v-for="it in items" :key="it.id" class="recommend-item">
          <div class="meta">
            <strong>{{ it.meta?.name || it.meta?.title || it.id }}</strong>
            <span class="score">Score: {{ it.score.toFixed(3) }}</span>
          </div>
          <div class="desc" v-if="it.meta && (it.meta.description || it.meta.remarks)">
            {{ it.meta.description || it.meta.remarks }}
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="no-data">No recommendations available.</div>
  </div>
</template>

<style scoped>
.recommend-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
}
.recommend-item {
  border: 1px solid var(--border-color);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: white;
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}
.score {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
.desc {
  margin-top: var(--spacing-xs);
  color: var(--text-secondary);
}
.loading, .no-data, .error {
  color: var(--text-secondary);
}
</style>
