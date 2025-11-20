<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedRegion = ref('all')

// Local Ugandan foods database with pricing (UGX per kg)
const foodsDatabase = ref([
  // Staples
  { name: 'Matooke (Plantain)', category: 'staples', region: 'central', energy: 122, protein: 1.3, carbs: 31.9, fat: 0.4, fiber: 2.3, calcium: 3, iron: 0.6, pricePerKg: 2500, available: true },
  { name: 'Sweet Potatoes', category: 'staples', region: 'all', energy: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0, calcium: 30, iron: 0.6, pricePerKg: 1500, available: true },
  { name: 'Cassava', category: 'staples', region: 'all', energy: 160, protein: 1.4, carbs: 38.1, fat: 0.3, fiber: 1.8, calcium: 16, iron: 0.3, pricePerKg: 1200, available: true },
  { name: 'Millet', category: 'staples', region: 'northern', energy: 378, protein: 11.0, carbs: 73.0, fat: 4.2, fiber: 8.5, calcium: 8, iron: 3.0, pricePerKg: 3500, available: true },
  { name: 'Sorghum', category: 'staples', region: 'northern', energy: 329, protein: 10.6, carbs: 72.1, fat: 3.3, fiber: 6.7, calcium: 13, iron: 3.4, pricePerKg: 3200, available: true },

  // Proteins
  { name: 'Beans (Red)', category: 'proteins', region: 'all', energy: 333, protein: 21.3, carbs: 60.0, fat: 1.0, fiber: 15.0, calcium: 143, iron: 6.7, pricePerKg: 4000, available: true },
  { name: 'Groundnuts', category: 'proteins', region: 'all', energy: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5, calcium: 92, iron: 4.6, pricePerKg: 6000, available: true },
  { name: 'Small Fish (Mukene)', category: 'proteins', region: 'central', energy: 196, protein: 24.0, carbs: 0, fat: 11.4, fiber: 0, calcium: 400, iron: 3.5, pricePerKg: 8000, available: true },
  { name: 'Tilapia', category: 'proteins', region: 'all', energy: 96, protein: 20.1, carbs: 0, fat: 1.7, fiber: 0, calcium: 14, iron: 0.6, pricePerKg: 12000, available: true },
  { name: 'Eggs', category: 'proteins', region: 'all', energy: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0, calcium: 56, iron: 1.8, pricePerKg: 15000, available: true },
  { name: 'Milk', category: 'proteins', region: 'western', energy: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, calcium: 113, iron: 0.0, pricePerKg: 2800, available: true },

  // Vegetables
  { name: 'Nakati (Greens)', category: 'vegetables', region: 'all', energy: 23, protein: 2.9, carbs: 3.6, fat: 0.3, fiber: 2.1, calcium: 232, iron: 3.2, pricePerKg: 2000, available: true },
  { name: 'Dodo (Amaranth)', category: 'vegetables', region: 'all', energy: 23, protein: 2.5, carbs: 4.0, fat: 0.3, fiber: 2.8, calcium: 215, iron: 2.3, pricePerKg: 2000, available: true },
  { name: 'Cabbage', category: 'vegetables', region: 'all', energy: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, calcium: 40, iron: 0.5, pricePerKg: 1800, available: true },
  { name: 'Tomatoes', category: 'vegetables', region: 'all', energy: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, calcium: 10, iron: 0.3, pricePerKg: 2500, available: true },
  { name: 'Onions', category: 'vegetables', region: 'all', energy: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, calcium: 23, iron: 0.2, pricePerKg: 3000, available: true },

  // Fruits
  { name: 'Bananas (Sweet)', category: 'fruits', region: 'all', energy: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, calcium: 5, iron: 0.3, pricePerKg: 1500, available: true },
  { name: 'Papaya', category: 'fruits', region: 'all', energy: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7, calcium: 20, iron: 0.3, pricePerKg: 2000, available: true },
  { name: 'Mango', category: 'fruits', region: 'all', energy: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, calcium: 11, iron: 0.2, pricePerKg: 2500, available: true },
  { name: 'Pineapple', category: 'fruits', region: 'all', energy: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, calcium: 13, iron: 0.3, pricePerKg: 3000, available: true },
  { name: 'Avocado', category: 'fruits', region: 'western', energy: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, calcium: 12, iron: 0.6, pricePerKg: 4000, available: true }
])

const categories = [
  { value: 'all', label: 'All Foods', icon: 'pi pi-th-large' },
  { value: 'staples', label: 'Staples', icon: 'pi pi-circle-fill' },
  { value: 'proteins', label: 'Proteins', icon: 'pi pi-heart' },
  { value: 'vegetables', label: 'Vegetables', icon: 'pi pi-sun' },
  { value: 'fruits', label: 'Fruits', icon: 'pi pi-star' }
]

const regions = [
  { value: 'all', label: 'All Regions' },
  { value: 'central', label: 'Central Uganda' },
  { value: 'western', label: 'Western Uganda' },
  { value: 'eastern', label: 'Eastern Uganda' },
  { value: 'northern', label: 'Northern Uganda' }
]

// Filtered foods
const filteredFoods = computed(() => {
  let foods = foodsDatabase.value

  // Filter by search query
  if (searchQuery.value) {
    foods = foods.filter(food =>
      food.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    foods = foods.filter(food => food.category === selectedCategory.value)
  }

  // Filter by region
  if (selectedRegion.value !== 'all') {
    foods = foods.filter(food =>
      food.region === selectedRegion.value || food.region === 'all'
    )
  }

  return foods
})

const selectedFood = ref(null)

const viewFoodDetails = (food) => {
  selectedFood.value = food
}

const closeFoodDetails = () => {
  selectedFood.value = null
}
</script>

<template>
  <div class="foods-view">
    <div class="container">
      <!-- Header -->
      <div class="foods-header">
        <div class="header-content">
          <h1><i class="pi pi-book"></i> Local Foods Database</h1>
          <p>Discover nutritious locally-sourced Ugandan foods for elderly nutrition</p>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section card">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search foods..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <label>Category:</label>
          <div class="filter-buttons">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="selectedCategory = cat.value"
              class="filter-btn"
              :class="{ active: selectedCategory === cat.value }"
            >
              <i :class="cat.icon"></i>
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>Region:</label>
          <select v-model="selectedRegion" class="form-control">
            <option v-for="region in regions" :key="region.value" :value="region.value">
              {{ region.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Results Count -->
      <div class="results-info">
        <p>Showing <strong>{{ filteredFoods.length }}</strong> food{{ filteredFoods.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Foods Grid -->
      <div class="foods-grid">
        <div
          v-for="food in filteredFoods"
          :key="food.name"
          class="food-card"
        >
          <div class="food-header">
            <div class="food-category" :class="food.category">
              {{ food.category }}
            </div>
            <div v-if="food.available" class="availability-badge">
              <i class="pi pi-check-circle"></i>
              Available
            </div>
          </div>

          <h3>{{ food.name }}</h3>

          <div class="food-nutrients">
            <div class="nutrient-item">
              <i class="pi pi-bolt"></i>
              <span>{{ food.energy }} kcal</span>
            </div>
            <div class="nutrient-item">
              <i class="pi pi-heart"></i>
              <span>{{ food.protein }}g protein</span>
            </div>
            <div class="nutrient-item">
              <i class="pi pi-chart-line"></i>
              <span>{{ food.carbs }}g carbs</span>
            </div>
            <div class="nutrient-item">
              <i class="pi pi-circle"></i>
              <span>{{ food.fiber }}g fiber</span>
            </div>
          </div>

          <div class="food-price">
            <i class="pi pi-money-bill"></i>
            <span class="price-value">{{ food.pricePerKg.toLocaleString() }} UGX</span>
            <span class="price-unit">per kg</span>
          </div>

          <button @click="viewFoodDetails(food)" class="view-details-btn">
            <i class="pi pi-eye"></i>
            View Details
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredFoods.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <h3>No Foods Found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    </div>

    <!-- Food Details Modal -->
    <div v-if="selectedFood" class="modal-overlay" @click="closeFoodDetails">
      <div class="modal-card food-details-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedFood.name }}</h2>
          <button @click="closeFoodDetails" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <h4>Nutritional Information (per 100g)</h4>
            <div class="nutrients-detail-grid">
              <div class="nutrient-detail">
                <strong>Energy</strong>
                <span>{{ selectedFood.energy }} kcal</span>
              </div>
              <div class="nutrient-detail">
                <strong>Protein</strong>
                <span>{{ selectedFood.protein }} g</span>
              </div>
              <div class="nutrient-detail">
                <strong>Carbohydrates</strong>
                <span>{{ selectedFood.carbs }} g</span>
              </div>
              <div class="nutrient-detail">
                <strong>Fat</strong>
                <span>{{ selectedFood.fat }} g</span>
              </div>
              <div class="nutrient-detail">
                <strong>Fiber</strong>
                <span>{{ selectedFood.fiber }} g</span>
              </div>
              <div class="nutrient-detail">
                <strong>Calcium</strong>
                <span>{{ selectedFood.calcium }} mg</span>
              </div>
              <div class="nutrient-detail">
                <strong>Iron</strong>
                <span>{{ selectedFood.iron }} mg</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Information</h4>
            <div class="info-items">
              <div class="info-item">
                <i class="pi pi-tag"></i>
                <span><strong>Category:</strong> {{ selectedFood.category }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-map-marker"></i>
                <span><strong>Region:</strong> {{ selectedFood.region === 'all' ? 'All regions' : selectedFood.region }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-check-circle"></i>
                <span><strong>Availability:</strong> {{ selectedFood.available ? 'Currently available' : 'Seasonal' }}</span>
              </div>
              <div class="info-item price-item">
                <i class="pi pi-money-bill"></i>
                <span><strong>Price:</strong> {{ selectedFood.pricePerKg.toLocaleString() }} UGX per kg</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Cost Analysis</h4>
            <div class="cost-analysis-grid">
              <div class="cost-item">
                <span class="cost-label">Cost per 100g</span>
                <span class="cost-value">{{ Math.round(selectedFood.pricePerKg / 10).toLocaleString() }} UGX</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">Cost per serving (250g)</span>
                <span class="cost-value">{{ Math.round(selectedFood.pricePerKg * 0.25).toLocaleString() }} UGX</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">Protein cost efficiency</span>
                <span class="cost-value">{{ Math.round(selectedFood.pricePerKg / (selectedFood.protein * 10)).toLocaleString() }} UGX/g</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">Energy cost efficiency</span>
                <span class="cost-value">{{ Math.round(selectedFood.pricePerKg / (selectedFood.energy * 10)).toLocaleString() }} UGX/kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.foods-view {
  padding: var(--spacing-xl) 0;
  min-height: calc(100vh - 200px);
}

.foods-header {
  margin-bottom: var(--spacing-xl);
}

.foods-header h1 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.foods-header p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

/* Filters */
.filters-section {
  margin-bottom: var(--spacing-xl);
}

.search-box {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.search-box i {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-group {
  margin-bottom: var(--spacing-md);
}

.filter-group label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.filter-btn:hover {
  border-color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: white;
  color: var(--text-color);
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-control:hover {
  border-color: var(--primary-color);
}

/* Results Info */
.results-info {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
}

.results-info strong {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
}

/* Foods Grid */
.foods-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 640px) {
  .foods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .foods-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.food-card {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.2s;
}

.food-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.food-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.food-category {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 50px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: capitalize;
}

.food-category.staples {
  background: rgba(217, 0, 0, 0.1);
  color: var(--primary-color);
}

.food-category.proteins {
  background: rgba(7, 137, 48, 0.1);
  color: var(--accent-color);
}

.food-category.vegetables {
  background: rgba(252, 220, 4, 0.2);
  color: #856404;
}

.food-category.fruits {
  background: rgba(23, 162, 184, 0.1);
  color: var(--info-color);
}

.availability-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--accent-color);
  font-weight: 500;
}

.food-card h3 {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.food-nutrients {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.nutrient-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.nutrient-item i {
  color: var(--primary-color);
}

.view-details-btn {
  width: 100%;
  padding: var(--spacing-sm);
  background: var(--surface-color);
  border: none;
  border-radius: var(--radius-md);
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.view-details-btn:hover {
  background: var(--primary-color);
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
}

.empty-state i {
  font-size: 4rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--text-secondary);
}

/* Food Details Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-lg);
  animation: fadeIn 0.3s ease-out;
}

.modal-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  width: 100%;
}

.food-details-modal {
  max-width: 700px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 2px solid var(--border-color);
}

.modal-header h2 {
  color: var(--primary-color);
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-xl);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--error-color);
}

.modal-body {
  padding: var(--spacing-xl);
}

.detail-section {
  margin-bottom: var(--spacing-xl);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
}

.nutrients-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.nutrient-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--surface-color);
  border-radius: var(--radius-sm);
}

.nutrient-detail strong {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.nutrient-detail span {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  font-weight: 600;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-color);
  border-radius: var(--radius-sm);
}

.info-item i {
  font-size: var(--font-size-lg);
  color: var(--primary-color);
}

.info-item span {
  color: var(--text-color);
}

/* Price Display */
.food-price {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, rgba(7, 137, 48, 0.1), rgba(7, 137, 48, 0.05));
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
  border-left: 3px solid var(--accent-color);
}

.food-price i {
  color: var(--accent-color);
  font-size: var(--font-size-lg);
}

.price-value {
  font-weight: 700;
  color: var(--accent-color);
  font-size: var(--font-size-base);
}

.price-unit {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Cost Analysis */
.cost-analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.cost-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--surface-color);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent-color);
}

.cost-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.cost-value {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  font-weight: 700;
}

.price-item {
  background: linear-gradient(135deg, rgba(7, 137, 48, 0.1), rgba(7, 137, 48, 0.05));
  border-left: 3px solid var(--accent-color);
}

.price-item i {
  color: var(--accent-color);
}
</style>
