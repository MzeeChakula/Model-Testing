<script setup>
import { computed } from 'vue'

const props = defineProps({
  condition: {
    type: Number,
    required: true
  },
  nutritionData: {
    type: Object,
    required: true
  }
})

// Condition names
const conditionNames = [
  'Hypertension',
  'Undernutrition',
  'Anemia',
  'Frailty',
  'Digestive Issues',
  'Arthritis',
  'Osteoporosis',
  'Diabetes'
]

// Health recommendations based on conditions
const recommendations = computed(() => {
  const conditionName = conditionNames[props.condition] || 'General'

  const allRecommendations = {
    'Hypertension': {
      icon: 'pi pi-heart',
      color: '#dc3545',
      tips: [
        'Limit sodium intake to less than 2,300mg per day',
        'Increase potassium-rich foods (bananas, sweet potatoes, beans)',
        'Include omega-3 rich foods like small fish',
        'Maintain healthy portion sizes',
        'Avoid processed and salty foods'
      ],
      foods: {
        encouraged: ['Beans', 'Leafy greens', 'Sweet potatoes', 'Small fish', 'Fresh fruits'],
        limit: ['Salt', 'Processed foods', 'Fatty meats']
      },
      alert: props.nutritionData.Potassium_mg_per_serving < 300 ?
        'Consider increasing potassium intake for blood pressure management' : null
    },
    'Undernutrition': {
      icon: 'pi pi-chart-line',
      color: '#ffc107',
      tips: [
        'Increase caloric intake with nutrient-dense foods',
        'Include protein-rich foods (groundnuts, beans, fish)',
        'Eat small, frequent meals throughout the day',
        'Add healthy fats (groundnut paste, avocado)',
        'Include fortified foods when available'
      ],
      foods: {
        encouraged: ['Groundnuts', 'Beans', 'Milk', 'Eggs', 'Matooke', 'Sweet potatoes'],
        limit: []
      },
      alert: props.nutritionData.Energy_kcal_per_serving < 300 ?
        'Meal may be too low in calories for recovery' : null
    },
    'Anemia': {
      icon: 'pi pi-shield',
      color: '#d90000',
      tips: [
        'Increase iron-rich foods (beans, leafy greens, small fish)',
        'Combine iron sources with vitamin C for better absorption',
        'Include folate-rich foods (green vegetables)',
        'Avoid tea/coffee with iron-rich meals',
        'Consider fortified foods when available'
      ],
      foods: {
        encouraged: ['Beans', 'Leafy greens', 'Small fish', 'Groundnuts', 'Eggs'],
        limit: ['Tea with meals', 'Coffee with meals']
      },
      alert: props.nutritionData.Iron_mg_per_serving < 3 || props.nutritionData.VitaminC_mg_per_serving < 10 ?
        'Consider increasing iron and vitamin C intake' : null
    },
    'Frailty': {
      icon: 'pi pi-user',
      color: '#6c757d',
      tips: [
        'Prioritize protein intake (15-20g per meal)',
        'Include calcium and vitamin D for bone health',
        'Eat small, frequent, nutrient-dense meals',
        'Stay hydrated throughout the day',
        'Include easy-to-chew, soft foods if needed'
      ],
      foods: {
        encouraged: ['Fish', 'Beans', 'Eggs', 'Milk', 'Soft matooke', 'Mashed sweet potatoes'],
        limit: []
      },
      alert: props.nutritionData.Protein_g_per_serving < 12 ?
        'Protein intake may be insufficient for muscle maintenance' : null
    },
    'Digestive Issues': {
      icon: 'pi pi-heart-fill',
      color: '#17a2b8',
      tips: [
        'Increase fiber gradually (target 25-30g per day)',
        'Drink plenty of water',
        'Include probiotic foods when available',
        'Eat smaller, more frequent meals',
        'Avoid spicy and fatty foods if they cause discomfort'
      ],
      foods: {
        encouraged: ['Beans', 'Sweet potatoes', 'Bananas', 'Papaya', 'Leafy greens'],
        limit: ['Spicy foods', 'Very fatty foods', 'Carbonated drinks']
      },
      alert: props.nutritionData.Fiber_g_per_serving < 3 ?
        'Consider increasing fiber intake gradually' : null
    },
    'Arthritis': {
      icon: 'pi pi-shield',
      color: '#28a745',
      tips: [
        'Include anti-inflammatory foods (fish, leafy greens)',
        'Limit red meat and processed foods',
        'Include omega-3 rich foods',
        'Maintain healthy weight through balanced nutrition',
        'Stay well hydrated'
      ],
      foods: {
        encouraged: ['Small fish', 'Leafy greens', 'Beans', 'Fresh fruits', 'Groundnuts'],
        limit: ['Processed foods', 'Excessive red meat', 'Sugary foods']
      },
      alert: null
    },
    'Osteoporosis': {
      icon: 'pi pi-star',
      color: '#fcdc04',
      tips: [
        'Increase calcium intake (target 1000-1200mg per day)',
        'Include vitamin D sources (fish, fortified foods)',
        'Ensure adequate protein for bone health',
        'Include magnesium-rich foods',
        'Limit caffeine and alcohol'
      ],
      foods: {
        encouraged: ['Small fish with bones', 'Milk', 'Leafy greens', 'Beans', 'Sesame seeds'],
        limit: ['Excessive caffeine', 'Alcohol', 'Very salty foods']
      },
      alert: props.nutritionData.Calcium_mg_per_serving < 200 ?
        'Calcium intake is low - consider calcium-rich foods' : null
    },
    'Diabetes': {
      icon: 'pi pi-chart-bar',
      color: '#078930',
      tips: [
        'Choose high-fiber, low-glycemic foods',
        'Control portion sizes carefully',
        'Balance carbohydrates throughout the day',
        'Include protein with each meal',
        'Limit added sugars and refined carbohydrates'
      ],
      foods: {
        encouraged: ['Beans', 'Leafy greens', 'Sweet potatoes', 'Fish', 'Whole grains'],
        limit: ['White bread', 'Sugary drinks', 'Sweets', 'Refined grains']
      },
      alert: props.nutritionData.Fiber_g_per_serving < 5 ?
        'Include more fiber to help manage blood sugar' : null
    }
  }

  return allRecommendations[conditionName] || {
    icon: 'pi pi-info-circle',
    color: '#17a2b8',
    tips: ['Eat a balanced, varied diet', 'Stay hydrated', 'Maintain regular meal times'],
    foods: { encouraged: [], limit: [] },
    alert: null
  }
})
</script>

<template>
  <div class="health-recommendations">
    <div class="recommendations-header">
      <i :class="recommendations.icon" :style="{ color: recommendations.color }"></i>
      <h3>Recommendations for {{ conditionNames[condition] }}</h3>
    </div>

    <!-- Alert if any -->
    <div v-if="recommendations.alert" class="recommendation-alert">
      <i class="pi pi-exclamation-triangle"></i>
      {{ recommendations.alert }}
    </div>

    <!-- Tips -->
    <div class="recommendations-section">
      <h4><i class="pi pi-lightbulb"></i> Key Tips</h4>
      <ul class="tips-list">
        <li v-for="(tip, index) in recommendations.tips" :key="index">
          {{ tip }}
        </li>
      </ul>
    </div>

    <!-- Foods Grid -->
    <div class="foods-grid">
      <div v-if="recommendations.foods.encouraged.length > 0" class="food-category encouraged">
        <h4><i class="pi pi-check-circle"></i> Encouraged Foods</h4>
        <div class="food-tags">
          <span v-for="food in recommendations.foods.encouraged" :key="food" class="food-tag">
            {{ food }}
          </span>
        </div>
      </div>

      <div v-if="recommendations.foods.limit.length > 0" class="food-category limit">
        <h4><i class="pi pi-times-circle"></i> Limit/Avoid</h4>
        <div class="food-tags">
          <span v-for="food in recommendations.foods.limit" :key="food" class="food-tag">
            {{ food }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-recommendations {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
}

.recommendations-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);
}

.recommendations-header i {
  font-size: 2rem;
}

.recommendations-header h3 {
  font-size: var(--font-size-xl);
  color: var(--text-color);
  margin: 0;
}

.recommendation-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #fff3cd;
  color: #856404;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  font-weight: 500;
}

.recommendation-alert i {
  font-size: var(--font-size-lg);
}

.recommendations-section {
  margin-bottom: var(--spacing-xl);
}

.recommendations-section h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--surface-color);
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--accent-color);
  line-height: 1.6;
}

.foods-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .foods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.food-category h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
}

.food-category.encouraged h4 {
  color: var(--accent-color);
}

.food-category.encouraged h4 i {
  color: var(--accent-color);
}

.food-category.limit h4 {
  color: var(--error-color);
}

.food-category.limit h4 i {
  color: var(--error-color);
}

.food-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.food-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--surface-color);
  border-radius: 50px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.food-category.encouraged .food-tag {
  background: rgba(7, 137, 48, 0.1);
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
}

.food-category.limit .food-tag {
  background: rgba(220, 53, 69, 0.1);
  color: var(--error-color);
  border: 1px solid var(--error-color);
}
</style>
