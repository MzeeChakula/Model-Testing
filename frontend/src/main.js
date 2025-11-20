import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Router
import router from './router'

// Pinia store
import pinia from './store'

// i18n
import i18n from './i18n'

// PrimeVue
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(i18n)
app.use(PrimeVue, {
  ripple: true,
  inputStyle: 'filled'
})

app.mount('#app')
