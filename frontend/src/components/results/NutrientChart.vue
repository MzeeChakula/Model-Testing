<script setup>
import { computed } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  nutritionData: {
    type: Object,
    required: true
  },
  chartType: {
    type: String,
    default: 'doughnut' // 'doughnut' or 'bar'
  }
})

// Macronutrients chart data
const macroData = computed(() => ({
  labels: ['Protein', 'Fat', 'Carbohydrates', 'Fiber'],
  datasets: [{
    label: 'Macronutrients (g)',
    data: [
      props.nutritionData.Protein_g_per_serving || 0,
      props.nutritionData.Fat_g_per_serving || 0,
      props.nutritionData.Carbohydrates_g_per_serving || 0,
      props.nutritionData.Fiber_g_per_serving || 0
    ],
    backgroundColor: [
      'rgba(217, 0, 0, 0.8)',      // Primary red
      'rgba(252, 220, 4, 0.8)',    // Secondary yellow
      'rgba(7, 137, 48, 0.8)',     // Accent green
      'rgba(23, 162, 184, 0.8)'    // Info blue
    ],
    borderColor: [
      'rgba(217, 0, 0, 1)',
      'rgba(252, 220, 4, 1)',
      'rgba(7, 137, 48, 1)',
      'rgba(23, 162, 184, 1)'
    ],
    borderWidth: 2
  }]
}))

// Micronutrients chart data
const microData = computed(() => ({
  labels: ['Calcium', 'Iron', 'Zinc', 'Vit A', 'Vit C', 'Potassium', 'Magnesium'],
  datasets: [{
    label: 'Micronutrients',
    data: [
      props.nutritionData.Calcium_mg_per_serving || 0,
      (props.nutritionData.Iron_mg_per_serving || 0) * 10, // Scale for visibility
      (props.nutritionData.Zinc_mg_per_serving || 0) * 10,
      (props.nutritionData.VitaminA_ug_per_serving || 0) / 10,
      (props.nutritionData.VitaminC_mg_per_serving || 0) * 2,
      props.nutritionData.Potassium_mg_per_serving || 0,
      props.nutritionData.Magnesium_mg_per_serving || 0
    ],
    backgroundColor: 'rgba(7, 137, 48, 0.6)',
    borderColor: 'rgba(7, 137, 48, 1)',
    borderWidth: 2
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.5,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 10,
        font: {
          size: window.innerWidth < 768 ? 10 : 12
        },
        boxWidth: window.innerWidth < 768 ? 12 : 15
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      }
    }
  }
}

const barOptions = {
  ...chartOptions,
  aspectRatio: window.innerWidth < 768 ? 1 : 1.5,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          size: window.innerWidth < 768 ? 10 : 12
        }
      }
    },
    x: {
      ticks: {
        font: {
          size: window.innerWidth < 768 ? 9 : 11
        }
      }
    }
  }
}
</script>

<template>
  <div class="nutrient-chart">
    <div class="chart-section">
      <h3>Macronutrients Distribution</h3>
      <div class="chart-container">
        <Doughnut :data="macroData" :options="chartOptions" />
      </div>
    </div>

    <div class="chart-section">
      <h3>Micronutrients Profile</h3>
      <div class="chart-container">
        <Bar :data="microData" :options="barOptions" />
      </div>
      <p class="chart-note">
        <i class="pi pi-info-circle"></i>
        Values scaled for visualization. Iron & Zinc ×10, Vit A ÷10, Vit C ×2
      </p>
    </div>
  </div>
</template>

<style scoped>
.nutrient-chart {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 1024px) {
  .nutrient-chart {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-section {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.chart-section h3 {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.chart-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

@media (max-width: 768px) {
  .chart-container {
    max-width: 100%;
    padding: var(--spacing-sm);
  }
  
  .chart-section {
    padding: var(--spacing-md);
  }
}

.chart-note {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--surface-color);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.chart-note i {
  color: var(--info-color);
}
</style>
