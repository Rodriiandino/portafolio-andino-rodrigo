export default function themeChange() {
  const handleThemeLogic = () => {
    const $html = document.querySelector('html')
    const $header = document.querySelector('#header')
    const $nav = document.querySelector('#nav')
    const $bento_9_img_dark = document.querySelector('.bento__9-img-dark')
    const $bento_9_img_light = document.querySelector('.bento__9-img-light')
    const ls = localStorage

    const setThemeDark = () => {
      $html?.classList.add('dark')
      $html?.setAttribute('data-theme', 'dark')
      $header?.setAttribute('data-theme', 'dark')
      $nav?.setAttribute('data-theme', 'dark')
      $bento_9_img_dark?.classList.remove('hidden')
      $bento_9_img_light?.classList.add('hidden')
      ls.setItem('darkMode-portafolio-andino', 'true')
    }

    const setThemeLight = () => {
      $html?.classList.remove('dark')
      $html?.setAttribute('data-theme', 'light')
      $header?.setAttribute('data-theme', 'light')
      $nav?.setAttribute('data-theme', 'light')
      $bento_9_img_dark?.classList.add('hidden')
      $bento_9_img_light?.classList.remove('hidden')
      ls.setItem('darkMode-portafolio-andino', 'false')
    }

    const changeColor = () => {
      const isDark = $html?.classList.contains('dark')
      isDark ? setThemeLight() : setThemeDark()
    }

    const initializeTheme = () => {
      const storedMode = ls.getItem('darkMode-portafolio-andino')
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      if (storedMode === 'true') {
        setThemeDark()
      } else if (storedMode === 'false') {
        setThemeLight()
      } else if (prefersDarkMode) {
        setThemeDark()
      } else {
        setThemeLight()
      }
    }

    const setupEventListeners = () => {
      const $updateBtnSwitchTheme =
        document.querySelectorAll('[btn-switch-theme]')

      $updateBtnSwitchTheme.forEach(btn => {
        btn.addEventListener('click', changeColor)
      })
    }

    setupEventListeners()
    initializeTheme()
  }

  document.addEventListener('astro:page-load', handleThemeLogic)
}
