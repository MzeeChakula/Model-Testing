<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const selectedPeriod = ref('monthly')

const pricingPlans = [
  {
    id: 'free',
    name: 'Community',
    nameKey: 'pricing.plans.free.name',
    description: 'For individuals and small families',
    descriptionKey: 'pricing.plans.free.description',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: '#078930',
    icon: 'pi-heart',
    features: [
      { text: '5 meal predictions/month', key: 'pricing.plans.free.feature1', included: true },
      { text: 'Basic nutrition recommendations', key: 'pricing.plans.free.feature2', included: true },
      { text: 'Access to local foods database', key: 'pricing.plans.free.feature3', included: true },
      { text: 'Offline access to saved data', key: 'pricing.plans.free.feature4', included: true },
      { text: 'Community support forum', key: 'pricing.plans.free.feature5', included: true },
      { text: 'Basic meal planning templates', key: 'pricing.plans.free.feature6', included: true },
      { text: 'Voice input & batch processing', key: 'pricing.plans.free.feature7', included: false },
      { text: 'Priority support', key: 'pricing.plans.free.feature8', included: false }
    ],
    cta: 'Get Started',
    ctaKey: 'pricing.getStarted',
    popular: false
  },
  {
    id: 'basic',
    name: 'Individual',
    nameKey: 'pricing.plans.basic.name',
    description: 'Perfect for personal use',
    descriptionKey: 'pricing.plans.basic.description',
    monthlyPrice: 10000,
    yearlyPrice: 100000,
    color: '#d90000',
    icon: 'pi-user',
    features: [
      { text: 'Unlimited meal predictions', key: 'pricing.plans.basic.feature1', included: true },
      { text: 'Advanced nutrition analysis', key: 'pricing.plans.basic.feature2', included: true },
      { text: 'Personalized diet recommendations', key: 'pricing.plans.basic.feature3', included: true },
      { text: 'AI chat & voice assistant', key: 'pricing.plans.basic.feature4', included: true },
      { text: 'Batch processing (up to 10 meals)', key: 'pricing.plans.basic.feature5', included: true },
      { text: 'Weekly meal plan generator', key: 'pricing.plans.basic.feature6', included: true },
      { text: 'Grocery shopping lists', key: 'pricing.plans.basic.feature7', included: true },
      { text: 'Email support (24h response)', key: 'pricing.plans.basic.feature8', included: true }
    ],
    cta: 'Choose Individual',
    ctaKey: 'pricing.chooseBasic',
    popular: true
  },
  {
    id: 'professional',
    name: 'Professional',
    nameKey: 'pricing.plans.pro.name',
    description: 'For caregivers and small clinics',
    descriptionKey: 'pricing.plans.pro.description',
    monthlyPrice: 50000,
    yearlyPrice: 500000,
    color: '#fcdc04',
    icon: 'pi-briefcase',
    features: [
      { text: 'Everything in Individual plan', key: 'pricing.plans.pro.feature1', included: true },
      { text: 'Unlimited batch processing', key: 'pricing.plans.pro.feature2', included: true },
      { text: 'Multi-patient management (5 users)', key: 'pricing.plans.pro.feature3', included: true },
      { text: 'Export reports & meal plans (PDF/Excel)', key: 'pricing.plans.pro.feature4', included: true },
      { text: 'Custom meal plan templates', key: 'pricing.plans.pro.feature5', included: true },
      { text: 'Nutritional tracking & analytics', key: 'pricing.plans.pro.feature6', included: true },
      { text: 'Priority email support (4h response)', key: 'pricing.plans.pro.feature7', included: true },
      { text: 'Monthly training webinars', key: 'pricing.plans.pro.feature8', included: true }
    ],
    cta: 'Choose Professional',
    ctaKey: 'pricing.choosePro',
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Healthcare',
    nameKey: 'pricing.plans.enterprise.name',
    description: 'For hospitals and large organizations',
    descriptionKey: 'pricing.plans.enterprise.description',
    monthlyPrice: 200000,
    yearlyPrice: 2000000,
    color: '#17a2b8',
    icon: 'pi-building',
    features: [
      { text: 'Everything in Professional plan', key: 'pricing.plans.enterprise.feature1', included: true },
      { text: 'Unlimited users & API access', key: 'pricing.plans.enterprise.feature2', included: true },
      { text: 'White-label branding options', key: 'pricing.plans.enterprise.feature3', included: true },
      { text: 'Advanced analytics & reporting', key: 'pricing.plans.enterprise.feature4', included: true },
      { text: 'Custom integrations (EMR/EHR)', key: 'pricing.plans.enterprise.feature5', included: true },
      { text: 'Dedicated account manager', key: 'pricing.plans.enterprise.feature6', included: true },
      { text: '24/7 priority support', key: 'pricing.plans.enterprise.feature7', included: true },
      { text: 'On-site training & workshops', key: 'pricing.plans.enterprise.feature8', included: true }
    ],
    cta: 'Contact Sales',
    ctaKey: 'pricing.contactSales',
    popular: false
  }
]

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price).replace('UGX', '').trim()
}

const getPrice = (plan) => {
  return selectedPeriod.value === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
}

const getSavings = (plan) => {
  const yearlyTotal = plan.monthlyPrice * 12
  const yearlySavings = yearlyTotal - plan.yearlyPrice
  return yearlySavings
}

const selectPlan = (planId) => {
  if (planId === 'free') {
    router.push('/predict')
  } else if (planId === 'enterprise') {
    // Contact sales
    window.location.href = 'mailto:sales@mzeechakula.com?subject=Enterprise Plan Inquiry'
  } else {
    // Redirect to checkout/payment page (to be implemented)
    alert(`Selected ${planId} plan. Payment integration coming soon!`)
  }
}
</script>

<template>
  <div class="pricing-view">
    <div class="container">
      <!-- Header -->
      <div class="pricing-header">
        <h1><i class="pi pi-tag"></i> {{ t('pricing.title') || 'Pricing Plans' }}</h1>
        <p class="pricing-subtitle">
          {{ t('pricing.subtitle') || 'Choose the perfect plan for your nutrition planning needs' }}
        </p>

        <!-- Period Toggle -->
        <div class="period-toggle">
          <button
            @click="selectedPeriod = 'monthly'"
            :class="{ active: selectedPeriod === 'monthly' }"
            class="period-btn"
          >
            {{ t('pricing.monthly') || 'Monthly' }}
          </button>
          <button
            @click="selectedPeriod = 'yearly'"
            :class="{ active: selectedPeriod === 'yearly' }"
            class="period-btn"
          >
            {{ t('pricing.yearly') || 'Yearly' }}
            <span class="savings-badge">{{ t('pricing.save') || 'Save 17%' }}</span>
          </button>
        </div>
      </div>

      <!-- Pricing Cards -->
      <div class="pricing-grid">
        <div
          v-for="plan in pricingPlans"
          :key="plan.id"
          class="pricing-card"
          :class="{ popular: plan.popular }"
        >
          <!-- Popular Badge -->
          <div v-if="plan.popular" class="popular-badge">
            <i class="pi pi-star-fill"></i>
            {{ t('pricing.mostPopular') || 'Most Popular' }}
          </div>

          <!-- Plan Header -->
          <div class="plan-header">
            <div class="plan-icon" :style="{ backgroundColor: plan.color }">
              <i :class="'pi ' + plan.icon"></i>
            </div>
            <h3>{{ t(plan.nameKey) || plan.name }}</h3>
            <p class="plan-description">{{ t(plan.descriptionKey) || plan.description }}</p>
          </div>

          <!-- Price -->
          <div class="plan-price">
            <div class="price-amount">
              <span v-if="getPrice(plan) === 0" class="free-text">
                {{ t('pricing.free') || 'Free' }}
              </span>
              <template v-else>
                <span class="currency">UGX</span>
                <span class="amount">{{ formatPrice(getPrice(plan)) }}</span>
              </template>
            </div>
            <div class="price-period">
              {{ selectedPeriod === 'monthly' ? (t('pricing.perMonth') || 'per month') : (t('pricing.perYear') || 'per year') }}
            </div>
            <div v-if="selectedPeriod === 'yearly' && getSavings(plan) > 0" class="savings-text">
              {{ t('pricing.youSave') || 'You save' }} UGX {{ formatPrice(getSavings(plan)) }}
            </div>
          </div>

          <!-- Features -->
          <ul class="plan-features">
            <li
              v-for="(feature, index) in plan.features"
              :key="index"
              :class="{ disabled: !feature.included }"
            >
              <i :class="feature.included ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
              <span>{{ t(feature.key) || feature.text }}</span>
            </li>
          </ul>

          <!-- CTA Button -->
          <button
            @click="selectPlan(plan.id)"
            class="plan-cta"
            :class="{ primary: plan.popular }"
            :style="{ borderColor: plan.color, color: plan.popular ? '#ffffff' : plan.color }"
          >
            {{ t(plan.ctaKey) || plan.cta }}
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section">
        <h2><i class="pi pi-question-circle"></i> {{ t('pricing.faq') || 'Frequently Asked Questions' }}</h2>

        <div class="faq-grid">
          <div class="faq-item">
            <h4>{{ t('pricing.faq1.question') || 'What payment methods do you accept?' }}</h4>
            <p>{{ t('pricing.faq1.answer') || 'We accept Mobile Money (MTN, Airtel), bank transfers, and credit/debit cards.' }}</p>
          </div>

          <div class="faq-item">
            <h4>{{ t('pricing.faq2.question') || 'Can I change my plan later?' }}</h4>
            <p>{{ t('pricing.faq2.answer') || 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' }}</p>
          </div>

          <div class="faq-item">
            <h4>{{ t('pricing.faq3.question') || 'Is there a free trial?' }}</h4>
            <p>{{ t('pricing.faq3.answer') || 'Yes! The Community plan is free forever. Paid plans offer a 14-day money-back guarantee.' }}</p>
          </div>

          <div class="faq-item">
            <h4>{{ t('pricing.faq4.question') || 'Do you offer discounts for NGOs?' }}</h4>
            <p>{{ t('pricing.faq4.answer') || 'Yes, we offer special pricing for non-profits and NGOs. Contact us for details.' }}</p>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="contact-section">
        <div class="contact-card">
          <i class="pi pi-comments"></i>
          <h3>{{ t('pricing.needHelp') || 'Need help choosing?' }}</h3>
          <p>{{ t('pricing.contactUs') || 'Our team is here to help you find the perfect plan for your needs.' }}</p>
          <button @click="router.push('/contact')" class="contact-btn">
            <i class="pi pi-send"></i>
            {{ t('pricing.talkToUs') || 'Contact Us' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pricing-view {
  padding: var(--spacing-xl) var(--spacing-md);
  min-height: calc(100vh - 200px);
  background: var(--bg-color);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Header */
.pricing-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.pricing-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.pricing-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
}

/* Period Toggle */
.period-toggle {
  display: inline-flex;
  gap: var(--spacing-sm);
  padding: 4px;
  background: var(--surface-color);
  border-radius: 50px;
  border: 2px solid var(--border-color);
}

.period-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: transparent;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.period-btn.active {
  background: var(--primary-color);
  color: white;
}

.savings-badge {
  padding: 2px 8px;
  background: var(--accent-color);
  color: white;
  border-radius: 12px;
  font-size: var(--font-size-xs);
}

.period-btn.active .savings-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* Pricing Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-md) 0;
}

@media (min-width: 768px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
  }
}

@media (min-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
  }
}

/* Pricing Card */
.pricing-card {
  position: relative;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 350px;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.pricing-card.popular {
  border-color: var(--primary-color);
  border-width: 3px;
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border-radius: 50px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

/* Plan Header */
.plan-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.plan-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-sm);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.plan-header h3 {
  color: var(--text-color);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}

.plan-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* Plan Price */
.plan-price {
  text-align: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);
}

.price-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.free-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-color);
}

.currency {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-secondary);
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.price-period {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.savings-text {
  margin-top: var(--spacing-xs);
  color: var(--accent-color);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

/* Plan Features */
.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-md) 0;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
  color: var(--text-color);
  font-size: var(--font-size-sm);
}

.plan-features li i {
  font-size: var(--font-size-base);
  margin-top: 2px;
  flex-shrink: 0;
}

.plan-features li:not(.disabled) i {
  color: var(--accent-color);
}

.plan-features li.disabled {
  color: var(--text-secondary);
  opacity: 0.5;
}

.plan-features li.disabled i {
  color: var(--text-secondary);
}

/* CTA Button */
.plan-cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: white;
  border: 2px solid;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s;
}

.plan-cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.plan-cta.primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white !important;
}

.plan-cta.primary:hover {
  background: var(--primary-dark);
}

/* FAQ Section */
.faq-section {
  margin-top: calc(var(--spacing-xl) * 2);
  margin-bottom: var(--spacing-xl);
}

.faq-section h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.faq-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .faq-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.faq-item {
  padding: var(--spacing-lg);
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
}

.faq-item h4 {
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.faq-item p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Contact Section */
.contact-section {
  margin-top: calc(var(--spacing-xl) * 2);
}

.contact-card {
  text-align: center;
  padding: calc(var(--spacing-xl) * 2);
  background: linear-gradient(135deg, var(--primary-color), #c10000);
  color: white;
  border-radius: var(--radius-lg);
}

.contact-card i {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.9;
}

.contact-card h3 {
  color: white;
  margin-bottom: var(--spacing-md);
}

.contact-card p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: white;
  color: var(--primary-color);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .pricing-view {
    padding: var(--spacing-md);
  }

  .pricing-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .pricing-card {
    min-height: auto;
  }

  .amount {
    font-size: 2.5rem;
  }

  .plan-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }

  .contact-card {
    padding: var(--spacing-xl);
  }
}
</style>
