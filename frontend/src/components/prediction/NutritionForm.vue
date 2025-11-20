<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'valid'])

// Form data with default values
const formData = ref({
  // Macronutrients
  Energy_kcal_per_serving: props.modelValue.Energy_kcal_per_serving || 350,
  Protein_g_per_serving: props.modelValue.Protein_g_per_serving || 15,
  Fat_g_per_serving: props.modelValue.Fat_g_per_serving || 10,
  Carbohydrates_g_per_serving: props.modelValue.Carbohydrates_g_per_serving || 45,
  Fiber_g_per_serving: props.modelValue.Fiber_g_per_serving || 5,

  // Micronutrients
  Calcium_mg_per_serving: props.modelValue.Calcium_mg_per_serving || 200,
  Iron_mg_per_serving: props.modelValue.Iron_mg_per_serving || 3,
  Zinc_mg_per_serving: props.modelValue.Zinc_mg_per_serving || 2,
  VitaminA_ug_per_serving: props.modelValue.VitaminA_ug_per_serving || 500,
  VitaminC_mg_per_serving: props.modelValue.VitaminC_mg_per_serving || 20,
  Potassium_mg_per_serving: props.modelValue.Potassium_mg_per_serving || 400,
  Magnesium_mg_per_serving: props.modelValue.Magnesium_mg_per_serving || 50
})

// Nutrient field definitions with validation ranges
const macronutrients = [
  { key: 'Energy_kcal_per_serving', label: t('nutrients.energy'), min: 0, max: 3000, step: 10, unit: 'kcal', icon: 'pi pi-bolt' },
  { key: 'Protein_g_per_serving', label: t('nutrients.protein'), min: 0, max: 200, step: 1, unit: 'g', icon: 'pi pi-heart' },
  { key: 'Fat_g_per_serving', label: t('nutrients.fat'), min: 0, max: 200, step: 1, unit: 'g', icon: 'pi pi-circle' },
  { key: 'Carbohydrates_g_per_serving', label: t('nutrients.carbs'), min: 0, max: 500, step: 1, unit: 'g', icon: 'pi pi-chart-line' },
  { key: 'Fiber_g_per_serving', label: t('nutrients.fiber'), min: 0, max: 100, step: 1, unit: 'g', icon: 'pi pi-briefcase' }
]

const micronutrients = [
  { key: 'Calcium_mg_per_serving', label: t('nutrients.calcium'), min: 0, max: 3000, step: 10, unit: 'mg', icon: 'pi pi-star' },
  { key: 'Iron_mg_per_serving', label: t('nutrients.iron'), min: 0, max: 100, step: 0.1, unit: 'mg', icon: 'pi pi-shield' },
  { key: 'Zinc_mg_per_serving', label: t('nutrients.zinc'), min: 0, max: 50, step: 0.1, unit: 'mg', icon: 'pi pi-shield' },
  { key: 'VitaminA_ug_per_serving', label: t('nutrients.vitaminA'), min: 0, max: 5000, step: 10, unit: 'µg', icon: 'pi pi-eye' },
  { key: 'VitaminC_mg_per_serving', label: t('nutrients.vitaminC'), min: 0, max: 500, step: 1, unit: 'mg', icon: 'pi pi-sun' },
  { key: 'Potassium_mg_per_serving', label: t('nutrients.potassium'), min: 0, max: 10000, step: 10, unit: 'mg', icon: 'pi pi-heart-fill' },
  { key: 'Magnesium_mg_per_serving', label: t('nutrients.magnesium'), min: 0, max: 1000, step: 5, unit: 'mg', icon: 'pi pi-bolt' }
]

// Validation
const isValid = computed(() => {
  return Object.entries(formData.value).every(([key, value]) => {
    const field = [...macronutrients, ...micronutrients].find(f => f.key === key)
    if (!field) return true
    return value >= field.min && value <= field.max
  })
})

// Common food presets
const foodPresets = [
  {
    name: 'Matooke (Plantain)',
    Energy_kcal_per_serving: 122,
    Protein_g_per_serving: 1.3,
    Fat_g_per_serving: 0.4,
    Carbohydrates_g_per_serving: 31.9,
    Fiber_g_per_serving: 2.3,
    Calcium_mg_per_serving: 3,
    Iron_mg_per_serving: 0.6,
    Zinc_mg_per_serving: 0.2,
    VitaminA_ug_per_serving: 56,
    VitaminC_mg_per_serving: 18.4,
    Potassium_mg_per_serving: 499,
    Magnesium_mg_per_serving: 37
  },
  {
    name: 'Beans & Groundnuts',
    Energy_kcal_per_serving: 350,
    Protein_g_per_serving: 18,
    Fat_g_per_serving: 12,
    Carbohydrates_g_per_serving: 45,
    Fiber_g_per_serving: 12,
    Calcium_mg_per_serving: 150,
    Iron_mg_per_serving: 4.5,
    Zinc_mg_per_serving: 3.2,
    VitaminA_ug_per_serving: 20,
    VitaminC_mg_per_serving: 5,
    Potassium_mg_per_serving: 600,
    Magnesium_mg_per_serving: 80
  },
  {
    name: 'Fish & Greens',
    Energy_kcal_per_serving: 280,
    Protein_g_per_serving: 25,
    Fat_g_per_serving: 8,
    Carbohydrates_g_per_serving: 20,
    Fiber_g_per_serving: 4,
    Calcium_mg_per_serving: 350,
    Iron_mg_per_serving: 5.2,
    Zinc_mg_per_serving: 2.5,
    VitaminA_ug_per_serving: 850,
    VitaminC_mg_per_serving: 45,
    Potassium_mg_per_serving: 700,
    Magnesium_mg_per_serving: 65
  }
]

const applyPreset = (preset) => {
  Object.keys(formData.value).forEach(key => {
    if (preset[key] !== undefined) {
      formData.value[key] = preset[key]
    }
  })
}

// Watch for changes and emit
watch(formData, (newVal) => {
  emit('update:modelValue', { ...newVal })
  emit('valid', isValid.value)
}, { deep: true })
</script>

<template>
  <div class="nutrition-form">
    <h2>{{ t('predict.nutrition') }}</h2>
    <p class="form-description">
      Enter nutritional information per serving or select a food preset
    </p>

    <!-- Food Presets -->
    <div class="preset-section">
      <h3>Quick Presets</h3>
      <div class="preset-buttons">
        <button
          v-for="preset in foodPresets"
          :key="preset.name"
          @click="applyPreset(preset)"
          class="btn btn-preset"
        >
          <i class="pi pi-check"></i>
          {{ preset.name }}
        </button>
      </div>
    </div>

    <!-- Macronutrients -->
    <div class="nutrient-section">
      <h3 class="section-title">
        <i class="pi pi-chart-bar"></i>
        Macronutrients
      </h3>
      <div class="form-grid">
        <div
          v-for="nutrient in macronutrients"
          :key="nutrient.key"
          class="form-group"
        >
          <label class="form-label" :for="nutrient.key">
            <i :class="nutrient.icon"></i>
            {{ nutrient.label }}
          </label>
          <div class="input-group">
            <input
              :id="nutrient.key"
              v-model.number="formData[nutrient.key]"
              type="number"
              class="form-control"
              :min="nutrient.min"
              :max="nutrient.max"
              :step="nutrient.step"
              required
            />
            <span class="input-unit">{{ nutrient.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Micronutrients -->
    <div class="nutrient-section">
      <h3 class="section-title">
        <i class="pi pi-star"></i>
        Micronutrients
      </h3>
      <div class="form-grid">
        <div
          v-for="nutrient in micronutrients"
          :key="nutrient.key"
          class="form-group"
        >
          <label class="form-label" :for="nutrient.key">
            <i :class="nutrient.icon"></i>
            {{ nutrient.label }}
          </label>
          <div class="input-group">
            <input
              :id="nutrient.key"
              v-model.number="formData[nutrient.key]"
              type="number"
              class="form-control"
              :min="nutrient.min"
              :max="nutrient.max"
              :step="nutrient.step"
              required
            />
            <span class="input-unit">{{ nutrient.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Validation Status -->
    <div v-if="isValid" class="validation-success">
      <i class="pi pi-check-circle"></i>
      All nutrition values are valid
    </div>
  </div>
</template>

<style scoped>
.nutrition-form {
  width: 100%;
}

.nutrition-form h2 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.form-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

/* Presets */
.preset-section {
  background: var(--surface-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xl);
}

.preset-section h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.btn-preset {
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-preset:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Nutrient Sections */
.nutrient-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
}

.section-title i {
  color: var(--accent-color);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.form-label i {
  color: var(--primary-color);
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group .form-control {
  flex: 1;
  padding-right: 3rem;
}

.input-unit {
  position: absolute;
  right: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  pointer-events: none;
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
