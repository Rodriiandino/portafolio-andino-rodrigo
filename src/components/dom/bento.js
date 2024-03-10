import { skillsData } from '../../data/skills'
export default function bento() {
  const $html = document.querySelector('html')
  const $hour = document.getElementById('hour')
  const $day = document.getElementById('day')
  const $date = document.getElementById('date')
  const $bento_6_list = document.querySelector('.bento__6-list')

  const language = $html.getAttribute('lang')
  let locales

  language == 'es' ? (locales = 'es-AR') : (locales = 'en-US')

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

  getTime()

  setInterval(() => {
    getTime()
  }, 10000)

  const mySkills = [
    'JS',
    'React',
    'Next js',
    'Astro',
    'Java',
    'Spring Boot',
    'MySQL'
  ]

  let allSkills = []
  Object.values(skillsData).forEach(skillGroup => {
    allSkills = [...allSkills, ...skillGroup]
  })

  const skillsFilter = allSkills.filter(skill => mySkills.includes(skill.name))

  skillsFilter.forEach(skill => {
    $bento_6_list.innerHTML += `<li class="icon__svg" style="width: 58px"
    >${skill.icon}</li>`
  })
}
