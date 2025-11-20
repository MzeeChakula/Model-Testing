<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref(false)

const contactMethods = [
  {
    icon: 'pi pi-envelope',
    title: 'Email',
    value: 'support@mzeechakula.com',
    link: 'mailto:support@mzeechakula.com',
    color: '#d90000'
  },
  {
    icon: 'pi pi-phone',
    title: 'Phone',
    value: '+256 700 123 456',
    link: 'tel:+256700123456',
    color: '#078930'
  },
  {
    icon: 'pi pi-whatsapp',
    title: 'WhatsApp',
    value: '+256 700 123 456',
    link: 'https://wa.me/256700123456',
    color: '#25D366'
  },
  {
    icon: 'pi pi-map-marker',
    title: 'Location',
    value: 'Kampala, Uganda',
    link: '#',
    color: '#fcdc04'
  }
]

const faqs = [
  {
    question: 'How quickly do you respond to inquiries?',
    answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.'
  },
  {
    question: 'Do you offer technical support?',
    answer: 'Yes! Our technical support team is available to help with any issues you encounter while using the platform.'
  },
  {
    question: 'Can I schedule a demo or training session?',
    answer: 'Absolutely! Contact us to schedule a personalized demo or training session for your team.'
  },
  {
    question: 'Do you have partnerships with healthcare organizations?',
    answer: 'Yes, we work with various healthcare organizations, NGOs, and clinics across Uganda. Contact us to discuss partnership opportunities.'
  }
]

const submitForm = async () => {
  // Basic validation
  if (!formData.value.name || !formData.value.email || !formData.value.message) {
    submitError.value = true
    setTimeout(() => {
      submitError.value = false
    }, 3000)
    return
  }

  isSubmitting.value = true
  submitError.value = false
  submitSuccess.value = false

  try {
    // Simulate API call - replace with actual API endpoint
    await new Promise(resolve => setTimeout(resolve, 1500))

    // For now, open email client
    const subject = encodeURIComponent(formData.value.subject || 'Contact Form Submission')
    const body = encodeURIComponent(
      `Name: ${formData.value.name}\nEmail: ${formData.value.email}\n\nMessage:\n${formData.value.message}`
    )
    window.location.href = `mailto:support@mzeechakula.com?subject=${subject}&body=${body}`

    submitSuccess.value = true

    // Reset form
    formData.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }

    setTimeout(() => {
      submitSuccess.value = false
    }, 5000)
  } catch (error) {
    submitError.value = true
    setTimeout(() => {
      submitError.value = false
    }, 3000)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="contact-view">
    <div class="container">
      <!-- Header -->
      <div class="contact-header">
        <h1><i class="pi pi-comments"></i> {{ t('contact.title') || 'Contact Us' }}</h1>
        <p class="contact-subtitle">
          {{ t('contact.subtitle') || 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.' }}
        </p>
      </div>

      <!-- Contact Methods -->
      <div class="contact-methods">
        <a
          v-for="(method, index) in contactMethods"
          :key="index"
          :href="method.link"
          class="contact-method-card"
          :class="{ 'no-link': method.link === '#' }"
        >
          <div class="method-icon" :style="{ backgroundColor: method.color }">
            <i :class="method.icon"></i>
          </div>
          <h3>{{ method.title }}</h3>
          <p>{{ method.value }}</p>
        </a>
      </div>

      <!-- Main Content -->
      <div class="contact-content">
        <!-- Contact Form -->
        <div class="contact-form-section">
          <h2>Send Us a Message</h2>
          <p class="form-description">Fill out the form below and we'll get back to you shortly.</p>

          <form @submit.prevent="submitForm" class="contact-form">
            <div class="form-group">
              <label for="name">
                <i class="pi pi-user"></i> Full Name *
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">
                <i class="pi pi-envelope"></i> Email Address *
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div class="form-group">
              <label for="subject">
                <i class="pi pi-tag"></i> Subject
              </label>
              <input
                id="subject"
                v-model="formData.subject"
                type="text"
                placeholder="What is this regarding?"
              />
            </div>

            <div class="form-group">
              <label for="message">
                <i class="pi pi-comment"></i> Message *
              </label>
              <textarea
                id="message"
                v-model="formData.message"
                rows="6"
                placeholder="Tell us how we can help you..."
                required
              ></textarea>
            </div>

            <!-- Success Message -->
            <div v-if="submitSuccess" class="alert alert-success">
              <i class="pi pi-check-circle"></i>
              Thank you for contacting us! We'll get back to you soon.
            </div>

            <!-- Error Message -->
            <div v-if="submitError" class="alert alert-error">
              <i class="pi pi-times-circle"></i>
              Please fill in all required fields.
            </div>

            <button type="submit" class="btn btn-primary btn-large" :disabled="isSubmitting">
              <i class="pi" :class="isSubmitting ? 'pi-spin pi-spinner' : 'pi-send'"></i>
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
        </div>

        <!-- Info & FAQ -->
        <div class="contact-info-section">
          <!-- Business Hours -->
          <div class="info-card">
            <h3><i class="pi pi-clock"></i> Business Hours</h3>
            <div class="hours-list">
              <div class="hour-item">
                <span class="day">Monday - Friday</span>
                <span class="time">8:00 AM - 6:00 PM</span>
              </div>
              <div class="hour-item">
                <span class="day">Saturday</span>
                <span class="time">9:00 AM - 2:00 PM</span>
              </div>
              <div class="hour-item">
                <span class="day">Sunday</span>
                <span class="time">Closed</span>
              </div>
            </div>
          </div>

          <!-- FAQ -->
          <div class="info-card">
            <h3><i class="pi pi-question-circle"></i> Quick Answers</h3>
            <div class="faq-list">
              <details v-for="(faq, index) in faqs" :key="index" class="faq-item">
                <summary>{{ faq.question }}</summary>
                <p>{{ faq.answer }}</p>
              </details>
            </div>
          </div>

          <!-- Social Media -->
          <div class="info-card social-card">
            <h3><i class="pi pi-share-alt"></i> Follow Us</h3>
            <div class="social-links">
              <a href="#" class="social-link" style="background-color: #1877f2;">
                <i class="pi pi-facebook"></i>
              </a>
              <a href="#" class="social-link" style="background-color: #1da1f2;">
                <i class="pi pi-twitter"></i>
              </a>
              <a href="#" class="social-link" style="background-color: #0077b5;">
                <i class="pi pi-linkedin"></i>
              </a>
              <a href="#" class="social-link" style="background-color: #e4405f;">
                <i class="pi pi-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-view {
  padding: var(--spacing-xl) var(--spacing-md);
  min-height: calc(100vh - 200px);
  background: var(--bg-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.contact-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.contact-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.contact-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Contact Methods */
.contact-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.contact-method-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  text-align: center;
  text-decoration: none;
  color: var(--text-color);
  border: 2px solid var(--border-color);
  transition: all 0.3s;
}

.contact-method-card:not(.no-link):hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.contact-method-card.no-link {
  cursor: default;
}

.method-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.contact-method-card h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.contact-method-card p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Main Content */
.contact-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 768px) {
  .contact-content {
    grid-template-columns: 2fr 1fr;
  }
}

/* Contact Form */
.contact-form-section {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
}

.contact-form-section h2 {
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.form-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
  color: var(--text-color);
  font-size: var(--font-size-sm);
}

.form-group input,
.form-group textarea {
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
  transition: all 0.2s;
  background: var(--bg-color);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(217, 0, 0, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.alert {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  width: 100%;
}

/* Info Section */
.contact-info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
}

.info-card h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.hours-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hour-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
}

.hour-item .day {
  font-weight: 600;
  color: var(--text-color);
}

.hour-item .time {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.faq-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.faq-item summary {
  padding: var(--spacing-md);
  cursor: pointer;
  font-weight: 600;
  color: var(--text-color);
  background: var(--bg-color);
  transition: background-color 0.2s;
  user-select: none;
}

.faq-item summary:hover {
  background: var(--border-color);
}

.faq-item p {
  padding: var(--spacing-md);
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
  background: white;
}

/* Social Media */
.social-card {
  text-align: center;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.social-link {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.social-link:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* Mobile */
@media (max-width: 768px) {
  .contact-view {
    padding: var(--spacing-md);
  }

  .contact-methods {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .contact-form-section,
  .info-card {
    padding: var(--spacing-md);
  }
}
</style>
