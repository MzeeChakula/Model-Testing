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

// Form data
const formData = ref({
  selectedFoods: props.modelValue.selectedFoods || [],
  mealsPerDay: props.modelValue.mealsPerDay || 3,
  activityLevel: props.modelValue.activityLevel || 'moderate',
  dietaryRestrictions: props.modelValue.dietaryRestrictions || [],
  budget: props.modelValue.budget || 'moderate'
})

// Ugandan Foods Database with nutritional values
const ugandanFoods = [
  {
    id: 'matooke',
    name: 'Matooke (Plantain)',
    category: 'Staples',
    icon: 'pi pi-circle-fill',
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
    id: 'posho',
    name: 'Posho (Maize Meal)',
    category: 'Staples',
    icon: 'pi pi-circle-fill',
    Energy_kcal_per_serving: 357,
    Protein_g_per_serving: 9.4,
    Fat_g_per_serving: 3.9,
    Carbohydrates_g_per_serving: 74.3,
    Fiber_g_per_serving: 7.3,
    Calcium_mg_per_serving: 7,
    Iron_mg_per_serving: 2.7,
    Zinc_mg_per_serving: 2.2,
    VitaminA_ug_per_serving: 11,
    VitaminC_mg_per_serving: 0,
    Potassium_mg_per_serving: 287,
    Magnesium_mg_per_serving: 127
  },
  {
    id: 'beans',
    name: 'Beans',
    category: 'Proteins',
    icon: 'pi pi-heart-fill',
    Energy_kcal_per_serving: 333,
    Protein_g_per_serving: 21,
    Fat_g_per_serving: 1.2,
    Carbohydrates_g_per_serving: 60,
    Fiber_g_per_serving: 15,
    Calcium_mg_per_serving: 143,
    Iron_mg_per_serving: 7.5,
    Zinc_mg_per_serving: 3.5,
    VitaminA_ug_per_serving: 0,
    VitaminC_mg_per_serving: 4.5,
    Potassium_mg_per_serving: 1406,
    Magnesium_mg_per_serving: 171
  },
  {
    id: 'groundnuts',
    name: 'Groundnuts (Peanuts)',
    category: 'Proteins',
    icon: 'pi pi-heart-fill',
    Energy_kcal_per_serving: 567,
    Protein_g_per_serving: 25.8,
    Fat_g_per_serving: 49.2,
    Carbohydrates_g_per_serving: 16.1,
    Fiber_g_per_serving: 8.5,
    Calcium_mg_per_serving: 92,
    Iron_mg_per_serving: 4.6,
    Zinc_mg_per_serving: 3.3,
    VitaminA_ug_per_serving: 0,
    VitaminC_mg_per_serving: 0,
    Potassium_mg_per_serving: 705,
    Magnesium_mg_per_serving: 168
  },
  {
    id: 'fish',
    name: 'Fish (Tilapia/Nile Perch)',
    category: 'Proteins',
    icon: 'pi pi-heart-fill',
    Energy_kcal_per_serving: 128,
    Protein_g_per_serving: 26,
    Fat_g_per_serving: 2.7,
    Carbohydrates_g_per_serving: 0,
    Fiber_g_per_serving: 0,
    Calcium_mg_per_serving: 14,
    Iron_mg_per_serving: 0.6,
    Zinc_mg_per_serving: 0.4,
    VitaminA_ug_per_serving: 30,
    VitaminC_mg_per_serving: 0,
    Potassium_mg_per_serving: 380,
    Magnesium_mg_per_serving: 27
  },
  {
    id: 'sukuma',
    name: 'Sukuma Wiki (Collard Greens)',
    category: 'Vegetables',
    icon: 'pi pi-sun',
    Energy_kcal_per_serving: 32,
    Protein_g_per_serving: 3,
    Fat_g_per_serving: 0.6,
    Carbohydrates_g_per_serving: 5.4,
    Fiber_g_per_serving: 3.6,
    Calcium_mg_per_serving: 232,
    Iron_mg_per_serving: 0.9,
    Zinc_mg_per_serving: 0.2,
    VitaminA_ug_per_serving: 380,
    VitaminC_mg_per_serving: 35,
    Potassium_mg_per_serving: 213,
    Magnesium_mg_per_serving: 33
  },
  {
    id: 'nakati',
    name: 'Nakati (African Eggplant Leaves)',
    category: 'Vegetables',
    icon: 'pi pi-sun',
    Energy_kcal_per_serving: 35,
    Protein_g_per_serving: 2.8,
    Fat_g_per_serving: 0.8,
    Carbohydrates_g_per_serving: 6.2,
    Fiber_g_per_serving: 4.2,
    Calcium_mg_per_serving: 280,
    Iron_mg_per_serving: 3.5,
    Zinc_mg_per_serving: 0.5,
    VitaminA_ug_per_serving: 420,
    VitaminC_mg_per_serving: 42,
    Potassium_mg_per_serving: 350,
    Magnesium_mg_per_serving: 45
  },
  {
    id: 'sweetpotato',
    name: 'Sweet Potato (Orange)',
    category: 'Staples',
    icon: 'pi pi-circle-fill',
    Energy_kcal_per_serving: 86,
    Protein_g_per_serving: 1.6,
    Fat_g_per_serving: 0.1,
    Carbohydrates_g_per_serving: 20.1,
    Fiber_g_per_serving: 3,
    Calcium_mg_per_serving: 30,
    Iron_mg_per_serving: 0.6,
    Zinc_mg_per_serving: 0.3,
    VitaminA_ug_per_serving: 709,
    VitaminC_mg_per_serving: 2.4,
    Potassium_mg_per_serving: 337,
    Magnesium_mg_per_serving: 25
  },
  {
    id: 'cassava',
    name: 'Cassava',
    category: 'Staples',
    icon: 'pi pi-circle-fill',
    Energy_kcal_per_serving: 160,
    Protein_g_per_serving: 1.4,
    Fat_g_per_serving: 0.3,
    Carbohydrates_g_per_serving: 38.1,
    Fiber_g_per_serving: 1.8,
    Calcium_mg_per_serving: 16,
    Iron_mg_per_serving: 0.3,
    Zinc_mg_per_serving: 0.3,
    VitaminA_ug_per_serving: 1,
    VitaminC_mg_per_serving: 20.6,
    Potassium_mg_per_serving: 271,
    Magnesium_mg_per_serving: 21
  },
  {
    id: 'milk',
    name: 'Milk (Fresh)',
    category: 'Proteins',
    icon: 'pi pi-heart-fill',
    Energy_kcal_per_serving: 61,
    Protein_g_per_serving: 3.2,
    Fat_g_per_serving: 3.3,
    Carbohydrates_g_per_serving: 4.7,
    Fiber_g_per_serving: 0,
    Calcium_mg_per_serving: 113,
    Iron_mg_per_serving: 0,
    Zinc_mg_per_serving: 0.4,
    VitaminA_ug_per_serving: 46,
    VitaminC_mg_per_serving: 0,
    Potassium_mg_per_serving: 143,
    Magnesium_mg_per_serving: 10
  },
  {
    id: 'eggs',
    name: 'Eggs',
    category: 'Proteins',
    icon: 'pi pi-heart-fill',
    Energy_kcal_per_serving: 155,
    Protein_g_per_serving: 13,
    Fat_g_per_serving: 11,
    Carbohydrates_g_per_serving: 1.1,
    Fiber_g_per_serving: 0,
    Calcium_mg_per_serving: 56,
    Iron_mg_per_serving: 1.8,
    Zinc_mg_per_serving: 1.3,
    VitaminA_ug_per_serving: 160,
    VitaminC_mg_per_serving: 0,
    Potassium_mg_per_serving: 138,
    Magnesium_mg_per_serving: 12
  },
  {
    id: 'tomato',
    name: 'Tomatoes',
    category: 'Vegetables',
    icon: 'pi pi-sun',
    Energy_kcal_per_serving: 18,
    Protein_g_per_serving: 0.9,
    Fat_g_per_serving: 0.2,
    Carbohydrates_g_per_serving: 3.9,
    Fiber_g_per_serving: 1.2,
    Calcium_mg_per_serving: 10,
    Iron_mg_per_serving: 0.3,
    Zinc_mg_per_serving: 0.2,
    VitaminA_ug_per_serving: 42,
    VitaminC_mg_per_serving: 14,
    Potassium_mg_per_serving: 237,
    Magnesium_mg_per_serving: 11
  }
]

// Categories for grouping
const foodCategories = [
  { name: 'Staples', icon: 'pi pi-circle-fill', color: '#d90000' },
  { name: 'Proteins', icon: 'pi pi-heart-fill', color: '#078930' },
  { name: 'Vegetables', icon: 'pi pi-sun', color: '#fcdc04' }
]

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

// Get foods by category
const getFoodsByCategory = (category) => {
  return ugandanFoods.filter(f => f.category === category)
}

// Validation
const isValid = computed(() => {
  return (
    formData.value.selectedFoods.length >= 3 && // At least 3 foods
    formData.value.mealsPerDay > 0 &&
    formData.value.activityLevel !== ''
  )
})

// Calculate aggregate nutrition from selected foods
const calculateNutrition = () => {
  const selectedFoodObjects = ugandanFoods.filter(f =>
    formData.value.selectedFoods.includes(f.id)
  )

  if (selectedFoodObjects.length === 0) {
    return null
  }

  // Average the nutritional values
  const avg = {}
  const nutritionKeys = [
    'Energy_kcal_per_serving', 'Protein_g_per_serving', 'Fat_g_per_serving',
    'Carbohydrates_g_per_serving', 'Fiber_g_per_serving', 'Calcium_mg_per_serving',
    'Iron_mg_per_serving', 'Zinc_mg_per_serving', 'VitaminA_ug_per_serving',
    'VitaminC_mg_per_serving', 'Potassium_mg_per_serving', 'Magnesium_mg_per_serving'
  ]

  nutritionKeys.forEach(key => {
    const sum = selectedFoodObjects.reduce((acc, food) => acc + food[key], 0)
    avg[key] = Math.round(sum / selectedFoodObjects.length)
  })

  return avg
}

// Watch for changes and emit
watch(formData, (newVal) => {
  const nutrition = calculateNutrition()
  const output = {
    ...nutrition,
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

      <div v-for="category in foodCategories" :key="category.name" class="food-category">
        <h4 class="category-title">
          <i :class="category.icon" :style="{ color: category.color }"></i>
          {{ category.name }}
        </h4>
        <div class="food-grid">
          <button
            v-for="food in getFoodsByCategory(category.name)"
            :key="food.id"
            @click="toggleFood(food.id)"
            class="food-card"
            :class="{ selected: isFoodSelected(food.id) }"
          >
            <i v-if="isFoodSelected(food.id)" class="pi pi-check-circle check-icon"></i>
            <div class="food-name">{{ food.name }}</div>
          </button>
        </div>
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
