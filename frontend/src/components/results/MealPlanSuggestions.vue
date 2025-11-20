<script setup>
import { computed } from 'vue'

const props = defineProps({
  caloricNeeds: {
    type: Number,
    required: true
  },
  region: {
    type: Number,
    required: true
  },
  condition: {
    type: Number,
    required: true
  }
})

// Region names
const regionNames = ['Central', 'Western', 'Eastern', 'Northern']

// Regional food databases
const regionalFoods = {
  0: { // Central Uganda (Buganda)
    breakfast: ['Matooke with groundnut sauce', 'Sweet potatoes', 'Tea with milk', 'Cassava', 'Banana pancakes'],
    lunch: ['Matooke with beans', 'Fish with vegetables', 'Chicken with sweet potatoes', 'Beef stew with matooke'],
    dinner: ['Matooke', 'Steamed cassava', 'Bean stew', 'Fish curry', 'Vegetable soup'],
    snacks: ['Roasted groundnuts', 'Bananas', 'Sweet potatoes', 'Cassava chips']
  },
  1: { // Western Uganda
    breakfast: ['Millet porridge', 'Sweet potatoes', 'Milk tea', 'Cassava', 'Kalo (millet bread)'],
    lunch: ['Kalo with beans', 'Beef with vegetables', 'Fish with greens', 'Chicken stew'],
    dinner: ['Kalo', 'Matooke', 'Bean soup', 'Vegetable stew', 'Fish with sauce'],
    snacks: ['Roasted groundnuts', 'Milk', 'Sweet bananas', 'Roasted maize']
  },
  2: { // Eastern Uganda
    breakfast: ['Atap (millet bread)', 'Sweet potatoes', 'Tea', 'Cassava', 'Rice porridge'],
    lunch: ['Atap with beans', 'Fish with vegetables', 'Chicken with rice', 'Groundnut sauce'],
    dinner: ['Atap', 'Bean stew', 'Fish curry', 'Vegetable soup', 'Cassava'],
    snacks: ['Simsim (sesame) balls', 'Groundnuts', 'Bananas', 'Roasted maize']
  },
  3: { // Northern Uganda
    breakfast: ['Kwon (millet bread)', 'Sweet potatoes', 'Tea', 'Cassava', 'Sorghum porridge'],
    lunch: ['Kwon with beans', 'Fish with greens', 'Chicken stew', 'Groundnut sauce'],
    dinner: ['Kwon', 'Bean soup', 'Fish stew', 'Vegetable soup', 'Cassava'],
    snacks: ['Simsim paste', 'Groundnuts', 'Sweet potatoes', 'Wild fruits']
  }
}

// Generate weekly meal plan
const weeklyPlan = computed(() => {
  const foods = regionalFoods[props.region] || regionalFoods[0]
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return days.map((day, index) => ({
    day,
    breakfast: foods.breakfast[index % foods.breakfast.length],
    lunch: foods.lunch[index % foods.lunch.length],
    dinner: foods.dinner[index % foods.dinner.length],
    snack: foods.snacks[index % foods.snacks.length]
  }))
})

// Portion guidelines based on caloric needs
const portionGuidelines = computed(() => {
  const needs = props.caloricNeeds

  if (needs < 1600) {
    return {
      level: 'Light',
      color: '#ffc107',
      staples: '200-250g per meal',
      protein: '60-80g per meal',
      vegetables: '100-150g per meal',
      fruits: '100g, 2-3 times daily'
    }
  } else if (needs < 2000) {
    return {
      level: 'Moderate',
      color: '#28a745',
      staples: '250-300g per meal',
      protein: '80-100g per meal',
      vegetables: '150-200g per meal',
      fruits: '150g, 2-3 times daily'
    }
  } else {
    return {
      level: 'Generous',
      color: '#17a2b8',
      staples: '300-350g per meal',
      protein: '100-120g per meal',
      vegetables: '200-250g per meal',
      fruits: '200g, 3-4 times daily'
    }
  }
})
</script>

<template>
  <div class="meal-plan-suggestions">
    <div class="plan-header">
      <h3><i class="pi pi-calendar"></i> Weekly Meal Plan - {{ regionNames[region] }} Region</h3>
      <p class="plan-description">
        Culturally appropriate meal suggestions based on locally available foods
      </p>
    </div>

    <!-- Portion Guidelines -->
    <div class="portion-card">
      <h4>
        <i class="pi pi-chart-pie"></i>
        Portion Guidelines
        <span class="portion-badge" :style="{ backgroundColor: portionGuidelines.color }">
          {{ portionGuidelines.level }}
        </span>
      </h4>
      <div class="portions-grid">
        <div class="portion-item">
          <i class="pi pi-circle-fill"></i>
          <div>
            <strong>Staples (Matooke, Rice, etc.)</strong>
            <span>{{ portionGuidelines.staples }}</span>
          </div>
        </div>
        <div class="portion-item">
          <i class="pi pi-heart"></i>
          <div>
            <strong>Protein (Beans, Fish, Meat)</strong>
            <span>{{ portionGuidelines.protein }}</span>
          </div>
        </div>
        <div class="portion-item">
          <i class="pi pi-sun"></i>
          <div>
            <strong>Vegetables</strong>
            <span>{{ portionGuidelines.vegetables }}</span>
          </div>
        </div>
        <div class="portion-item">
          <i class="pi pi-star"></i>
          <div>
            <strong>Fruits</strong>
            <span>{{ portionGuidelines.fruits }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Schedule -->
    <div class="weekly-schedule">
      <h4><i class="pi pi-table"></i> 7-Day Meal Schedule</h4>

      <div class="schedule-grid">
        <div
          v-for="(plan, index) in weeklyPlan"
          :key="plan.day"
          class="day-card"
        >
          <div class="day-header">
            <strong>{{ plan.day }}</strong>
          </div>
          <div class="meals-list">
            <div class="meal-item">
              <i class="pi pi-sun"></i>
              <div>
                <span class="meal-label">Breakfast</span>
                <span class="meal-name">{{ plan.breakfast }}</span>
              </div>
            </div>
            <div class="meal-item">
              <i class="pi pi-clock"></i>
              <div>
                <span class="meal-label">Lunch</span>
                <span class="meal-name">{{ plan.lunch }}</span>
              </div>
            </div>
            <div class="meal-item">
              <i class="pi pi-moon"></i>
              <div>
                <span class="meal-label">Dinner</span>
                <span class="meal-name">{{ plan.dinner }}</span>
              </div>
            </div>
            <div class="meal-item snack">
              <i class="pi pi-star"></i>
              <div>
                <span class="meal-label">Snack</span>
                <span class="meal-name">{{ plan.snack }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Caregiver Notes -->
    <div class="caregiver-notes">
      <h4><i class="pi pi-info-circle"></i> Notes for Caregivers</h4>
      <ul>
        <li>Adjust portion sizes based on appetite and activity level</li>
        <li>Ensure adequate hydration (6-8 glasses of water daily)</li>
        <li>Prepare foods in soft, easy-to-chew forms if needed</li>
        <li>Include variety to ensure balanced nutrition</li>
        <li>Consider seasonal availability when shopping</li>
        <li>Consult healthcare provider for specific dietary restrictions</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.meal-plan-suggestions {
  width: 100%;
}

.plan-header {
  margin-bottom: var(--spacing-xl);
}

.plan-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
}

.plan-description {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

/* Portion Guidelines */
.portion-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  margin-bottom: var(--spacing-xl);
}

.portion-card h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
}

.portion-badge {
  margin-left: auto;
  padding: var(--spacing-xs) var(--spacing-md);
  color: white;
  border-radius: 50px;
  font-size: var(--font-size-sm);
}

.portions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 640px) {
  .portions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.portion-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-color);
  border-radius: var(--radius-sm);
}

.portion-item i {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  margin-top: 2px;
}

.portion-item div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.portion-item strong {
  color: var(--text-color);
  font-size: var(--font-size-base);
}

.portion-item span {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* Weekly Schedule */
.weekly-schedule {
  margin-bottom: var(--spacing-xl);
}

.weekly-schedule h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
}

.schedule-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .schedule-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .schedule-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.day-card {
  background: white;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.day-header {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  font-weight: 600;
}

.meals-list {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.meal-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--surface-color);
  border-radius: var(--radius-sm);
}

.meal-item.snack {
  background: rgba(252, 220, 4, 0.1);
}

.meal-item i {
  color: var(--primary-color);
  font-size: var(--font-size-base);
  margin-top: 2px;
}

.meal-item div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.meal-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.meal-name {
  font-size: var(--font-size-sm);
  color: var(--text-color);
}

/* Caregiver Notes */
.caregiver-notes {
  background: #e7f3ff;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--info-color);
}

.caregiver-notes h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--info-color);
  margin-bottom: var(--spacing-md);
}

.caregiver-notes ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.caregiver-notes li {
  padding: var(--spacing-xs) 0 var(--spacing-xs) var(--spacing-lg);
  color: var(--text-color);
  position: relative;
  line-height: 1.6;
}

.caregiver-notes li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--info-color);
  font-weight: bold;
}
</style>
