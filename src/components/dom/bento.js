import { skillsData } from '../../data/skills'

export default function bento() {
  let timeInterval

  const handleBenToLogic = () => {
    const $html = document.querySelector('html')
    const $hour = document.getElementById('hour')
    const $day = document.getElementById('day')
    const $date = document.getElementById('date')
    const $bento_6_list = document.querySelector('.bento__6-list')

    if (!$html || !$hour || !$day || !$date || !$bento_6_list) return

    const language = $html.getAttribute('lang')
    let locales = language == 'es' ? 'es-AR' : 'en-US'

    const getTime = () => {
      const time = new Date().toLocaleTimeString(locales, {
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h12'
      })

      const dayName = new Date().toLocaleDateString(locales, {
        weekday: 'long'
      })

      const dateName = new Date().toLocaleDateString(locales, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      $hour.textContent = time
      $day.textContent = dayName
      $date.textContent = dateName
    }

    if (timeInterval) {
      clearInterval(timeInterval)
    }

    getTime()
    timeInterval = setInterval(getTime, 10000)

    if ($bento_6_list.children.length === 0) {
      const mySkills = ['TS', 'React', 'Next js', 'Convex', 'RAG', 'MCP']
      let allSkills = []
      Object.values(skillsData).forEach(skillGroup => {
        allSkills = [...allSkills, ...skillGroup]
      })

      const skillsFilter = allSkills.filter(skill =>
        mySkills.includes(skill.name)
      )

      $bento_6_list.innerHTML = skillsFilter
        .map(skill => {
          // The icon is decorative; the name is announced by screen readers only
          const icon = skill.icon.replace(
            '<svg',
            '<svg aria-hidden="true" focusable="false"'
          )
          return `<li class="icon__svg" style="width: 58px">${icon}<span class="sr-only">${skill.name}</span></li>`
        })
        .join('')
    }
  }

  document.addEventListener('astro:page-load', handleBenToLogic)
  // The clock only exists on the home page: stop it before ClientRouter
  // swaps in another page (handleBenToLogic restarts it on return)
  document.addEventListener('astro:before-swap', () => {
    clearInterval(timeInterval)
    timeInterval = undefined
  })
}
