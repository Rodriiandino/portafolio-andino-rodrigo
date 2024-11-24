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
    $home.addEventListener('click', handleHomeClick)
  }

  document.addEventListener('astro:page-load', handleNavLogic)
}
