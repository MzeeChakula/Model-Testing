<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiService } from '../../services/api'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'valid'])

// Form data
const formData = ref({
  selectedFoods: props.modelValue.selectedFoods || [],
  mealsPerDay: props.modelValue.mealsPerDay || 3,
  activityLevel: props.modelValue.activityLevel || 'moderate',
  dietaryRestrictions: props.modelValue.dietaryRestrictions || [],
  budget: props.modelValue.budget || 'moderate'
})
// Dynamic local foods loaded from backend
const localFoods = ref([])

// UI filters in the food preferences modal
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedRegion = ref('all')
const showOnlyAvailable = ref(false)
const maxPricePerKg = ref(null)

// load local foods from backend and map to canonical fields used by the form
const loadLocalFoods = async () => {
  try {
    const data = await apiService.getLocalFoods()
    if (Array.isArray(data)) {
      // Remove duplicates by name
      const uniqueNames = new Set()
      const uniqueData = data.filter(f => {
        const name = f.name || f.title || ''
        if (uniqueNames.has(name)) return false
        uniqueNames.add(name)
        return true
      })
      
      localFoods.value = uniqueData.map((f, idx) => {
        // Map CSV/backend fields to the canonical nutrition keys used in this form
        return {
          // prefer an explicit id if provided by backend; otherwise use generated index
          id: f.id != null ? String(f.id) : `food_${idx}`,
          name: f.name || f.title || `Food ${idx}`,
          category: (f.category || 'other').toString(),
          region: (f.region || 'all').toString(),
          available: !!f.available,
          pricePerKg: Number(f.pricePerKg || f.price_per_kg || f.price || 0),
          // nutrition keys expected by prediction form
          Energy_kcal_per_serving: Number(f.energy || f.Energy_kcal_per_serving || 0),
          Protein_g_per_serving: Number(f.protein || f.Protein_g_per_serving || 0),
          Fat_g_per_serving: Number(f.fat || f.Fat_g_per_serving || 0),
          Carbohydrates_g_per_serving: Number(f.carbs || f.Carbohydrates_g_per_serving || 0),
          Fiber_g_per_serving: Number(f.fiber || f.Fiber_g_per_serving || 0),
          Calcium_mg_per_serving: Number(f.calcium || f.Calcium_mg_per_serving || 0),
          Iron_mg_per_serving: Number(f.iron || f.Iron_mg_per_serving || 0),
          Zinc_mg_per_serving: Number(f.zinc || f.Zinc_mg_per_serving || 0),
          VitaminA_ug_per_serving: Number(f.vitaminA || f.VitaminA_ug_per_serving || 0),
          VitaminC_mg_per_serving: Number(f.vitaminC || f.VitaminC_mg_per_serving || 0),
          Potassium_mg_per_serving: Number(f.potassium || f.Potassium_mg_per_serving || 0),
          Magnesium_mg_per_serving: Number(f.magnesium || f.Magnesium_mg_per_serving || 0)
        }
      })
    }
  } catch (err) {
    console.error('Failed to load local foods for preferences form', err)
  }
}

onMounted(() => {
  loadLocalFoods()
})

// Categories for grouping (derive from data when available)
const foodCategories = computed(() => {
  const cats = new Set(localFoods.value.map(f => (f.category || 'Other')))
  return Array.from(cats).map(name => ({ name, icon: 'pi pi-circle-fill' }))
})

// Activity levels
const activityLevels = [
  { value: 'low', label: 'Low (Mostly sitting/resting)' },
  { value: 'moderate', label: 'Moderate (Light daily activities)' },
  { value: 'active', label: 'Active (Regular exercise/work)' }
]

// Budget options
const budgetOptions = [
  { value: 'low', label: 'Low (< 10,000 UGX/day)' },
  { value: 'moderate', label: 'Moderate (10,000 - 20,000 UGX/day)' },
  { value: 'high', label: 'High (> 20,000 UGX/day)' }
]

// Dietary restrictions
const dietaryRestrictionOptions = [
  { value: 'vegetarian', label: 'Vegetarian (No meat/fish)' },
  { value: 'low-salt', label: 'Low Salt (Hypertension)' },
  { value: 'low-sugar', label: 'Low Sugar (Diabetes)' },
  { value: 'soft-foods', label: 'Soft Foods (Digestive issues)' }
]

// Toggle food selection
const toggleFood = (foodId) => {
  const index = formData.value.selectedFoods.indexOf(foodId)
  if (index > -1) {
    formData.value.selectedFoods.splice(index, 1)
  } else {
    formData.value.selectedFoods.push(foodId)
  }
}

const isFoodSelected = (foodId) => {
  return formData.value.selectedFoods.includes(foodId)
}

// Filtered foods for UI selections (max 20)
const filteredFoods = computed(() => {
  let items = localFoods.value || []
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(f => f.name.toLowerCase().includes(q))
  }
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    items = items.filter(f => (f.category || '').toLowerCase() === selectedCategory.value.toLowerCase())
  }
  if (selectedRegion.value && selectedRegion.value !== 'all') {
    items = items.filter(f => (f.region || '').toLowerCase() === selectedRegion.value.toLowerCase())
  }
  if (showOnlyAvailable.value) {
    items = items.filter(f => f.available)
  }
  if (maxPricePerKg.value != null) {
    items = items.filter(f => (f.pricePerKg || 0) <= Number(maxPricePerKg.value))
  }
  return items.slice(0, 20)
})

// Validation
const isValid = computed(() => {
  return (
    formData.value.selectedFoods.length >= 3 && // At least 3 foods
    formData.value.mealsPerDay > 0 &&
    formData.value.activityLevel !== ''
  )
})

// Food preferences are for meal plan generation only, not for prediction input
// Return empty nutrition data - the model will use demographics only

// Watch for changes and emit
watch(formData, (newVal) => {
  // Only emit food preferences, not nutrition data
  // The model uses demographics only for prediction
  const output = {
    selectedFoods: newVal.selectedFoods,
    mealsPerDay: newVal.mealsPerDay,
    activityLevel: newVal.activityLevel,
    dietaryRestrictions: newVal.dietaryRestrictions,
    budget: newVal.budget
  }

  emit('update:modelValue', output)
  emit('valid', isValid.value)
}, { deep: true })

// Initialize
if (formData.value.selectedFoods.length === 0) {
  emit('valid', false)
}
</script>

<template>
  <div class="food-preferences-form">
    <h2>Food Preferences</h2>
    <p class="form-description">
      Select foods you like or have access to, and we'll create a personalized meal plan for you
    </p>

    <!-- Select Foods -->
    <div class="food-selection-section">
      <h3><i class="pi pi-shopping-cart"></i> Select Your Preferred Foods</h3>
      <p class="section-hint">Choose at least 3 foods you enjoy or can access easily</p>

      <!-- Inline filters for selection -->
      <div class="selection-filters">
        <input v-model="searchQuery" class="form-control" placeholder="Search foods..." />
        <select v-model="selectedCategory" class="form-control">
          <option value="all">All Categories</option>
          <option v-for="c in foodCategories" :key="c.name" :value="c.name">{{ c.name }}</option>
        </select>
        <select v-model="selectedRegion" class="form-control">
          <option value="all">All Regions</option>
          <option value="central">Central</option>
          <option value="western">Western</option>
          <option value="eastern">Eastern</option>
          <option value="northern">Northern</option>
        </select>
        <label class="filter-availability">
          <input type="checkbox" v-model="showOnlyAvailable" /> Only show available
        </label>
        <input v-model.number="maxPricePerKg" type="number" placeholder="Max price UGX/kg" class="form-control" />
      </div>

      <div class="food-grid">
        <button
          v-for="food in filteredFoods"
          :key="food.id"
          @click="toggleFood(food.id)"
          class="food-card"
          :class="{ selected: isFoodSelected(food.id) }"
        >
          <i v-if="isFoodSelected(food.id)" class="pi pi-check-circle check-icon"></i>
          <div class="food-name">{{ food.name }}</div>
          <div class="food-meta">{{ food.category }} • {{ food.region }}</div>
          <div class="food-price-small">{{ (food.pricePerKg || 0).toLocaleString() }} UGX/kg</div>
        </button>
      </div>
    </div>

    <!-- Meals Per Day -->
    <div class="form-section">
      <label class="form-label" for="meals-per-day">
        <i class="pi pi-clock"></i>
        How many meals per day?
      </label>
      <select
        id="meals-per-day"
        v-model.number="formData.mealsPerDay"
        class="form-control"
      >
        <option :value="2">2 meals (Breakfast + Dinner)</option>
        <option :value="3">3 meals (Breakfast + Lunch + Dinner)</option>
        <option :value="4">4 meals (Breakfast + Lunch + Dinner + Snack)</option>
      </select>
    </div>

    <!-- Activity Level -->
    <div class="form-section">
      <label class="form-label" for="activity-level">
        <i class="pi pi-bolt"></i>
        Activity Level
      </label>
      <select
        id="activity-level"
        v-model="formData.activityLevel"
        class="form-control"
      >
        <option
          v-for="level in activityLevels"
          :key="level.value"
          :value="level.value"
        >
          {{ level.label }}
        </option>
      </select>
    </div>

    <!-- Budget -->
    <div class="form-section">
      <label class="form-label" for="budget">
        <i class="pi pi-money-bill"></i>
        Daily Food Budget
      </label>
      <select
        id="budget"
        v-model="formData.budget"
        class="form-control"
      >
        <option
          v-for="option in budgetOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Dietary Restrictions -->
    <div class="form-section">
      <label class="form-label">
        <i class="pi pi-exclamation-triangle"></i>
        Dietary Restrictions (Optional)
      </label>
      <div class="checkbox-grid">
        <label
          v-for="restriction in dietaryRestrictionOptions"
          :key="restriction.value"
          class="checkbox-label"
        >
          <input
            type="checkbox"
            :value="restriction.value"
            v-model="formData.dietaryRestrictions"
          />
          <span>{{ restriction.label }}</span>
        </label>
      </div>
    </div>

    <!-- Validation Status -->
    <div v-if="isValid" class="validation-success">
      <i class="pi pi-check-circle"></i>
      Selected {{ formData.selectedFoods.length }} foods - Ready to generate meal plan!
    </div>
    <div v-else class="validation-warning">
      <i class="pi pi-info-circle"></i>
      Please select at least 3 foods to continue
    </div>
  </div>
</template>

<style scoped>
.food-preferences-form {
  width: 100%;
}

.food-preferences-form h2 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.form-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

/* Food Selection */
.food-selection-section {
  background: var(--surface-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xl);
}

.food-selection-section h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.section-hint {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.food-category {
  margin-bottom: var(--spacing-xl);
}

.category-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.selection-filters {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.filter-availability {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.food-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 6px;
}

@media (max-width: 768px) {
  .food-meta {
    display: none;
  }
}

.food-price-small {
  font-size: 0.85rem;
  color: var(--accent-color);
  margin-top: 4px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .food-price-small {
    display: none;
  }
}

.food-card {
  position: relative;
  padding: var(--spacing-lg);
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

@media (max-width: 768px) {
  .food-card {
    padding: var(--spacing-sm);
  }
}

.food-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.food-card.selected {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
}

.check-icon {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  color: var(--accent-color);
  font-size: 1.25rem;
}

.food-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .food-name {
    font-size: 0.75rem;
  }
}

/* Form Sections */
.form-section {
  margin-bottom: var(--spacing-xl);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.form-label i {
  color: var(--primary-color);
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: var(--font-size-sm);
}

/* Validation Messages */
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

.validation-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: #fff3cd;
  color: #856404;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
}

.validation-success i,
.validation-warning i {
  font-size: var(--font-size-lg);
}
</style>
