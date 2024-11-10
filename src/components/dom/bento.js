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

      $hour.innerHTML = time
      $day.innerHTML = dayName
      $date.innerHTML = dateName
    }

    if (timeInterval) {
      clearInterval(timeInterval)
    }

    getTime()
    timeInterval = setInterval(getTime, 10000)

    if ($bento_6_list.children.length === 0) {
      const mySkills = ['TS', 'React', 'Next js', 'Java', 'Spring Boot', 'SQL']
      let allSkills = []
      Object.values(skillsData).forEach(skillGroup => {
        allSkills = [...allSkills, ...skillGroup]
      })

      const skillsFilter = allSkills.filter(skill =>
        mySkills.includes(skill.name)
      )

      skillsFilter.forEach(skill => {
        $bento_6_list.innerHTML += `<li class="icon__svg" style="width: 58px">${skill.icon}</li>`
      })
    }
  }

  document.addEventListener('astro:before-preparation', () => {
    if (timeInterval) {
      clearInterval(timeInterval)
    }
  })
  document.addEventListener('DOMContentLoaded', handleBenToLogic)
  document.addEventListener('astro:page-load', handleBenToLogic)
}
