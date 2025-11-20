<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../store/settingsStore'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'valid'])

// Form data
const formData = ref({
  age_group: props.modelValue.age_group || '',
  region: props.modelValue.region || settingsStore.defaultRegion || '',
  condition: props.modelValue.condition || '',
  season: props.modelValue.season || settingsStore.defaultSeason || '',
  portion_size_g: props.modelValue.portion_size_g || 250,
  estimated_cost_ugx: props.modelValue.estimated_cost_ugx || 5000
})

// Options from backend encoding
const ageGroups = [
  { label: t('ageGroups.60-70'), value: 0 },
  { label: t('ageGroups.70-80'), value: 1 },
  { label: t('ageGroups.80+'), value: 2 }
]

const regions = [
  { label: t('regions.central'), value: 0 },
  { label: t('regions.western'), value: 1 },
  { label: t('regions.eastern'), value: 2 },
  { label: t('regions.northern'), value: 3 }
]

const conditions = [
  { label: t('conditions.hypertension'), value: 0 },
  { label: t('conditions.undernutrition'), value: 1 },
  { label: t('conditions.anemia'), value: 2 },
  { label: t('conditions.frailty'), value: 3 },
  { label: t('conditions.digestive'), value: 4 },
  { label: t('conditions.arthritis'), value: 5 },
  { label: t('conditions.osteoporosis'), value: 6 },
  { label: t('conditions.diabetes'), value: 7 }
]

const seasons = [
  { label: t('seasons.dry'), value: 0 },
  { label: t('seasons.wet'), value: 1 }
]

// Validation
const isValid = computed(() => {
  return (
    formData.value.age_group !== '' &&
    formData.value.region !== '' &&
    formData.value.condition !== '' &&
    formData.value.season !== '' &&
    formData.value.portion_size_g > 0 &&
    formData.value.portion_size_g <= 5000 &&
    formData.value.estimated_cost_ugx >= 0 &&
    formData.value.estimated_cost_ugx <= 100000
  )
})

// Watch for changes and emit
watch(formData, (newVal) => {
  const encoded = {
    age_group_encoded: newVal.age_group,
    region_encoded: newVal.region,
    condition_encoded: newVal.condition,
    season_encoded: newVal.season,
    portion_size_g: newVal.portion_size_g,
    estimated_cost_ugx: newVal.estimated_cost_ugx
  }
  emit('update:modelValue', encoded)
  emit('valid', isValid.value)
}, { deep: true })
</script>

<template>
  <div class="demographics-form">
    <h2>{{ t('predict.demographics') }}</h2>
    <p class="form-description">
      Provide demographic and contextual information for accurate predictions
    </p>

    <div class="form-grid">
      <!-- Age Group -->
      <div class="form-group">
        <label class="form-label" for="age-group">
          <i class="pi pi-calendar"></i>
          {{ t('predict.ageGroup') }}
        </label>
        <select
          id="age-group"
          v-model="formData.age_group"
          class="form-control"
          required
        >
          <option value="" disabled>Select age group</option>
          <option
            v-for="group in ageGroups"
            :key="group.value"
            :value="group.value"
          >
            {{ group.label }}
          </option>
        </select>
      </div>

      <!-- Region -->
      <div class="form-group">
        <label class="form-label" for="region">
          <i class="pi pi-map-marker"></i>
          {{ t('predict.region') }}
        </label>
        <select
          id="region"
          v-model="formData.region"
          class="form-control"
          required
        >
          <option value="" disabled>Select region</option>
          <option
            v-for="region in regions"
            :key="region.value"
            :value="region.value"
          >
            {{ region.label }}
          </option>
        </select>
      </div>

      <!-- Health Condition -->
      <div class="form-group">
        <label class="form-label" for="condition">
          <i class="pi pi-heart"></i>
          {{ t('predict.healthCondition') }}
        </label>
        <select
          id="condition"
          v-model="formData.condition"
          class="form-control"
          required
        >
          <option value="" disabled>Select health condition</option>
          <option
            v-for="condition in conditions"
            :key="condition.value"
            :value="condition.value"
          >
            {{ condition.label }}
          </option>
        </select>
      </div>

      <!-- Season -->
      <div class="form-group">
        <label class="form-label" for="season">
          <i class="pi pi-sun"></i>
          {{ t('predict.season') }}
        </label>
        <select
          id="season"
          v-model="formData.season"
          class="form-control"
          required
        >
          <option value="" disabled>Select season</option>
          <option
            v-for="season in seasons"
            :key="season.value"
            :value="season.value"
          >
            {{ season.label }}
          </option>
        </select>
      </div>

      <!-- Portion Size -->
      <div class="form-group">
        <label class="form-label" for="portion-size">
          <i class="pi pi-chart-pie"></i>
          {{ t('predict.portionSize') }}
        </label>
        <input
          id="portion-size"
          v-model.number="formData.portion_size_g"
          type="number"
          class="form-control"
          min="0"
          max="5000"
          step="10"
          required
        />
        <small class="form-hint">Typical serving: 200-300g</small>
      </div>

      <!-- Estimated Cost -->
      <div class="form-group">
        <label class="form-label" for="cost">
          <i class="pi pi-money-bill"></i>
          {{ t('predict.estimatedCost') }}
        </label>
        <input
          id="cost"
          v-model.number="formData.estimated_cost_ugx"
          type="number"
          class="form-control"
          min="0"
          max="100000"
          step="100"
          required
        />
        <small class="form-hint">Cost per serving in UGX</small>
      </div>
    </div>

    <!-- Validation Status -->
    <div v-if="isValid" class="validation-success">
      <i class="pi pi-check-circle"></i>
      All required fields completed
    </div>
  </div>
</template>

<style scoped>
.demographics-form {
  width: 100%;
}

.demographics-form h2 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.form-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
}

.form-label i {
  color: var(--primary-color);
}

.form-hint {
  display: block;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.validation-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: #d4edda;
  color: #155724;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
}

.validation-success i {
  font-size: var(--font-size-lg);
}
</style>
