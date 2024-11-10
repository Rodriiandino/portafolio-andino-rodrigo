export default function nav() {
  const handleHomeClick = event => {
    event.preventDefault()
    const isEnglish = window.location.pathname.includes('/en')
    const section = document.getElementById('home')

    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
      window.history.pushState({}, '', isEnglish ? '/en' : '/')
    }
  }

  const handleNavLogic = () => {
    const nav = document.getElementById('nav')
    if (!nav) return
    const $home = nav.querySelector('[data-section="home"]')
    if (!$home) return
    $home.removeEventListener('click', handleHomeClick)
    $home.addEventListener('click', handleHomeClick)
  }

  const cleanup = () => {
    const nav = document.getElementById('nav')
    if (!nav) return

    const $home = nav.querySelector('[data-section="home"]')
    if (!$home) return

    $home.removeEventListener('click', handleHomeClick)
  }

  document.addEventListener('DOMContentLoaded', handleNavLogic)
  document.addEventListener('astro:page-load', handleNavLogic)
  document.addEventListener('astro:before-preparation', cleanup)
}
