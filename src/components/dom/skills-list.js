import { skillsData } from '../../data/skills'

export default function skillsList() {
  const d = document,
    $btns = d.querySelectorAll('.skills__btn'),
    $list = d.querySelector('.skills__list')

  const renderList = skills => {
    $list.innerHTML = ''
    skills.forEach(skill => {
      $list.innerHTML += `<li class="icon__svg">${skill.icon} ${skill.name}</li>`
    })
  }

  $btns.forEach(btn => {
    btn.addEventListener('click', e => {
      d.querySelector('.active').classList.remove('active')
      btn.classList.toggle('active')

      if (btn.id === 'all') {
        let allSkills = []
        Object.values(skillsData).forEach(skillGroup => {
          allSkills = [...allSkills, ...skillGroup]
        })
        renderList(allSkills)
      } else {
        renderList(skillsData[btn.id])
      }
    })
  })

  d.addEventListener('DOMContentLoaded', e => {
    renderList(skillsData.frontEnd)
  })
}
