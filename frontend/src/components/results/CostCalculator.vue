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
  }
})

// Regional average food costs per day (estimated based on typical meal composition)
const regionalCosts = {
  0: { // Central Uganda
    breakfast: 3000,  // Matooke + tea
    lunch: 5500,      // Matooke + beans/fish
    dinner: 4500,     // Matooke + stew
    snacks: 1500      // Groundnuts/bananas
  },
  1: { // Western Uganda
    breakfast: 3200,  // Millet porridge + milk
    lunch: 5800,      // Kalo + beef/beans
    dinner: 4700,     // Kalo + vegetables
    snacks: 1800      // Milk/groundnuts
  },
  2: { // Eastern Uganda
    breakfast: 2800,  // Atap + tea
    lunch: 5200,      // Atap + beans/fish
    dinner: 4300,     // Atap + vegetables
    snacks: 1600      // Simsim/groundnuts
  },
  3: { // Northern Uganda
    breakfast: 2900,  // Kwon + tea
    lunch: 5400,      // Kwon + beans/fish
    dinner: 4400,     // Kwon + vegetables
    snacks: 1700      // Simsim/groundnuts
  }
}

// Get the regional cost structure
const regionalCost = computed(() => regionalCosts[props.region] || regionalCosts[0])

// Calculate daily cost
const dailyCost = computed(() => {
  const baseCost = regionalCost.value.breakfast + regionalCost.value.lunch +
                   regionalCost.value.dinner + regionalCost.value.snacks

  // Adjust based on caloric needs (baseline is 1800 kcal)
  const adjustment = props.caloricNeeds / 1800
  return Math.round(baseCost * adjustment)
})

// Calculate weekly cost
const weeklyCost = computed(() => dailyCost.value * 7)

// Calculate monthly cost (30 days)
const monthlyCost = computed(() => dailyCost.value * 30)

// Cost per calorie
const costPerCalorie = computed(() => {
  return (dailyCost.value / props.caloricNeeds).toFixed(2)
})

// Budget recommendations
const budgetLevel = computed(() => {
  if (dailyCost.value < 10000) {
    return { level: 'Budget-Friendly', color: '#078930', icon: 'pi pi-check-circle' }
  } else if (dailyCost.value < 15000) {
    return { level: 'Moderate', color: '#ffc107', icon: 'pi pi-info-circle' }
  } else {
    return { level: 'Premium', color: '#17a2b8', icon: 'pi pi-star' }
  }
})

// Meal breakdown
const mealBreakdown = computed(() => {
  const adjustment = props.caloricNeeds / 1800
  return [
    {
      name: 'Breakfast',
      cost: Math.round(regionalCost.value.breakfast * adjustment),
      percentage: Math.round((regionalCost.value.breakfast / (regionalCost.value.breakfast + regionalCost.value.lunch + regionalCost.value.dinner + regionalCost.value.snacks)) * 100)
    },
    {
      name: 'Lunch',
      cost: Math.round(regionalCost.value.lunch * adjustment),
      percentage: Math.round((regionalCost.value.lunch / (regionalCost.value.breakfast + regionalCost.value.lunch + regionalCost.value.dinner + regionalCost.value.snacks)) * 100)
    },
    {
      name: 'Dinner',
      cost: Math.round(regionalCost.value.dinner * adjustment),
      percentage: Math.round((regionalCost.value.dinner / (regionalCost.value.breakfast + regionalCost.value.lunch + regionalCost.value.dinner + regionalCost.value.snacks)) * 100)
    },
    {
      name: 'Snacks',
      cost: Math.round(regionalCost.value.snacks * adjustment),
      percentage: Math.round((regionalCost.value.snacks / (regionalCost.value.breakfast + regionalCost.value.lunch + regionalCost.value.dinner + regionalCost.value.snacks)) * 100)
    }
  ]
})
</script>

<template>
  <div class="cost-calculator">
    <div class="cost-header">
      <h3><i class="pi pi-wallet"></i> Estimated Meal Plan Cost</h3>
      <div class="budget-badge" :style="{ backgroundColor: budgetLevel.color }">
        <i :class="budgetLevel.icon"></i>
        {{ budgetLevel.level }}
      </div>
    </div>

    <!-- Main Cost Display -->
    <div class="cost-cards">
      <div class="cost-card primary">
        <div class="cost-icon">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="cost-content">
          <span class="cost-label">Daily Cost</span>
          <span class="cost-amount">{{ dailyCost.toLocaleString() }} UGX</span>
          <span class="cost-detail">{{ costPerCalorie }} UGX per calorie</span>
        </div>
      </div>

      <div class="cost-card">
        <div class="cost-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="cost-content">
          <span class="cost-label">Weekly Cost</span>
          <span class="cost-amount">{{ weeklyCost.toLocaleString() }} UGX</span>
          <span class="cost-detail">7 days of meals</span>
        </div>
      </div>

      <div class="cost-card">
        <div class="cost-icon">
          <i class="pi pi-money-bill"></i>
        </div>
        <div class="cost-content">
          <span class="cost-label">Monthly Cost</span>
          <span class="cost-amount">{{ monthlyCost.toLocaleString() }} UGX</span>
          <span class="cost-detail">30 days of meals</span>
        </div>
      </div>
    </div>

    <!-- Meal Breakdown -->
    <div class="meal-breakdown">
      <h4><i class="pi pi-chart-pie"></i> Daily Cost Breakdown</h4>
      <div class="breakdown-list">
        <div
          v-for="meal in mealBreakdown"
          :key="meal.name"
          class="breakdown-item"
        >
          <div class="breakdown-info">
            <span class="meal-name">{{ meal.name }}</span>
            <span class="meal-cost">{{ meal.cost.toLocaleString() }} UGX</span>
          </div>
          <div class="breakdown-bar">
            <div
              class="breakdown-fill"
              :style="{ width: meal.percentage + '%' }"
            ></div>
          </div>
          <span class="breakdown-percentage">{{ meal.percentage }}%</span>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="cost-tips">
      <h4><i class="pi pi-lightbulb"></i> Cost-Saving Tips</h4>
      <ul>
        <li>Buy seasonal vegetables for better prices</li>
        <li>Purchase staples (matooke, cassava, sweet potatoes) in bulk</li>
        <li>Use dried beans instead of fresh meat for protein</li>
        <li>Shop at local markets rather than supermarkets</li>
        <li>Grow your own vegetables if space allows</li>
        <li>Plan meals ahead to reduce food waste</li>
      </ul>
    </div>

    <!-- Affordability Note -->
    <div class="affordability-note">
      <i class="pi pi-info-circle"></i>
      <div>
        <strong>Note:</strong> These are estimated costs based on typical market prices in Uganda.
        Actual costs may vary by location, season, and vendor. Costs are calculated for nutritionally
        balanced meals meeting the recommended {{ caloricNeeds }} kcal/day requirement.
      </div>
    </div>
  </div>
</template>

<style scoped>
.cost-calculator {
  width: 100%;
}

.cost-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.cost-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  font-size: var(--font-size-xl);
  margin: 0;
}

.budget-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  color: white;
  border-radius: 50px;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

/* Cost Cards */
.cost-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

@media (min-width: 768px) {
  .cost-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.cost-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.cost-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cost-card.primary {
  background: linear-gradient(135deg, var(--accent-color), #059630);
  color: white;
  border: none;
}

.cost-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.cost-card.primary .cost-icon {
  background: rgba(255, 255, 255, 0.2);
}

.cost-icon i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.cost-card.primary .cost-icon i {
  color: white;
}

.cost-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.cost-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.cost-card.primary .cost-label {
  color: rgba(255, 255, 255, 0.9);
}

.cost-amount {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-color);
}

.cost-card.primary .cost-amount {
  color: white;
  font-size: 1.75rem;
}

.cost-detail {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cost-card.primary .cost-detail {
  color: rgba(255, 255, 255, 0.85);
}

/* Meal Breakdown */
.meal-breakdown {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  margin-bottom: var(--spacing-xl);
}

.meal-breakdown h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.breakdown-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meal-name {
  font-weight: 600;
  color: var(--text-color);
}

.meal-cost {
  color: var(--accent-color);
  font-weight: 700;
}

.breakdown-bar {
  height: 8px;
  background: var(--surface-color);
  border-radius: 4px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #059630);
  transition: width 0.3s ease;
}

.breakdown-percentage {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  align-self: flex-end;
}

/* Tips */
.cost-tips {
  background: #e7f3ff;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--info-color);
  margin-bottom: var(--spacing-xl);
}

.cost-tips h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--info-color);
  margin-bottom: var(--spacing-md);
}

.cost-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cost-tips li {
  padding: var(--spacing-xs) 0 var(--spacing-xs) var(--spacing-lg);
  color: var(--text-color);
  position: relative;
  line-height: 1.6;
}

.cost-tips li::before {
  content: "💡";
  position: absolute;
  left: 0;
}

/* Affordability Note */
.affordability-note {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(252, 220, 4, 0.1);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--secondary-color);
}

.affordability-note i {
  color: var(--secondary-color);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  margin-top: 2px;
}

.affordability-note div {
  color: var(--text-color);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.affordability-note strong {
  color: var(--text-color);
}
</style>
