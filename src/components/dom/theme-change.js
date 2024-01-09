export default function themeChange() {
  const btnSwitchTheme = document.querySelectorAll('[btn-switch-theme]')
  const html = document.querySelector('html')
  const header = document.querySelector('#header')
  const nav = document.querySelector('#nav')
  const ls = localStorage
  const d = document

  const setThemeDark = () => {
    html.setAttribute('data-theme', 'dark')
    html.classList.add('dark')
    header.setAttribute('data-theme', 'dark')
    nav.setAttribute('data-theme', 'dark')
  }

  const setThemeLight = () => {
    html.setAttribute('data-theme', 'light')
    html.classList.remove('dark')
    header.setAttribute('data-theme', 'light')
    nav.setAttribute('data-theme', 'light')
  }

  const changeColor = () => {
    if (html.getAttribute('data-theme') === 'light') {
      setThemeDark()
    } else {
      setThemeLight()
    }
  }

  const lsLoader = () => {
    if (ls.getItem('darkMode-portafolio-andino') == 'true') {
      setThemeDark()
    } else {
      setThemeLight()
    }
  }

  btnSwitchTheme.forEach(btn => {
    btn.addEventListener('click', () => {
      changeColor()
      ls.setItem(
        'darkMode-portafolio-andino',
        html.classList.contains('dark') ? 'true' : 'false'
      )
    })
  })

  d.addEventListener('DOMContentLoaded', () => {
    lsLoader()
  })
}
