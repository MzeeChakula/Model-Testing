import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import lg from './locales/lg.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    lg
  }
})

export default i18n
