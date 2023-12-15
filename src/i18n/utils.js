import { ui, defaultLang } from './ui'

export function useTranslations(lang) {
  return function t(key) {
    return ui[lang][key] || ui[defaultLang][key]
  }
}

export function getLangFromUrl(url) {
  const [, lang] = url.pathname.split('/')
  if (lang in ui) return lang
  return defaultLang
}
