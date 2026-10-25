export default function themeChange() {
  const handleThemeLogic = () => {
    const $html = document.querySelector('html')
    const ls = localStorage
    const $btnsSwitchTheme = document.querySelectorAll('[btn-switch-theme]')

    // The toggles are labelled "Dark mode": pressed means the dark theme is on
    const syncPressed = isDark => {
      $btnsSwitchTheme.forEach(btn =>
        btn.setAttribute('aria-pressed', String(isDark))
      )
    }

    const setThemeDark = () => {
      $html?.classList.add('dark')
      $html?.setAttribute('data-theme', 'dark')
      ls.setItem('darkMode-portafolio-andino', 'true')
      syncPressed(true)
    }

    const setThemeLight = () => {
      $html?.classList.remove('dark')
      $html?.setAttribute('data-theme', 'light')
      ls.setItem('darkMode-portafolio-andino', 'false')
      syncPressed(false)
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
      $btnsSwitchTheme.forEach(btn => {
        btn.addEventListener('click', changeColor)
      })
    }

    setupEventListeners()
    initializeTheme()
  }

  document.addEventListener('astro:page-load', handleThemeLogic)
}
