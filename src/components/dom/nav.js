export default function nav() {
  const handleHomeClick = event => {
    event.preventDefault()
    const isEnglish = window.location.pathname.includes('/en')
    const section = document.getElementById('home')

    if (section) {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
      window.history.pushState({}, '', isEnglish ? '/en' : '/')
    }
  }

  // Skip link: move keyboard focus (not only the scroll position) to the
  // main content, so the next Tab continues from there
  const handleSkipLinkClick = event => {
    const target = document.getElementById('main-content')
    if (!target) return
    event.preventDefault()
    target.focus()
    target.scrollIntoView()
  }

  const handleNavLogic = () => {
    const $skipLink = document.querySelector('.skip-link')
    $skipLink?.addEventListener('click', handleSkipLinkClick)

    const nav = document.getElementById('nav')
    if (!nav) return
    const $home = nav.querySelector('[data-section="home"]')
    if (!$home) return
    $home.addEventListener('click', handleHomeClick)
  }

  document.addEventListener('astro:page-load', handleNavLogic)
}
