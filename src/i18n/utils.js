import { ui, defaultLang } from './ui'

export function useTranslations(lang) {
  return function t(key) {
    return ui[lang][key] || ui[defaultLang][key]
  }
}
