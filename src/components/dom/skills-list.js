import { skillsData } from '../../data/skills'

export default function skillsList() {
  const handleSkillsLogic = () => {
    const $btns = document.querySelectorAll('.skills__btn')
    const $list = document.querySelector('.skills__list')

    if (!$btns.length || !$list) return

    const renderList = skills => {
      $list.innerHTML = ''
      skills.forEach(skill => {
        $list.innerHTML += `<li class="icon__svg">${skill.icon} ${skill.name}</li>`
      })
    }

    const cleanupEventListeners = () => {
      $btns.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true))
      })
    }

    const setupEventListeners = () => {
      const updatedBtns = document.querySelectorAll('.skills__btn')

      updatedBtns.forEach(btn => {
        btn.addEventListener('click', e => {
          const activeBtn = document.querySelector('.active')
          if (activeBtn) {
            activeBtn.classList.remove('active')
          }
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
    }

    const initializeList = () => {
      const frontEndBtn = document.querySelector('#frontEnd')
      if (frontEndBtn) {
        frontEndBtn.classList.add('active')
      }
      renderList(skillsData.frontEnd)
    }

    cleanupEventListeners()
    setupEventListeners()
    initializeList()
  }

  document.addEventListener('astro:before-preparation', () => {
    const $btns = document.querySelectorAll('.skills__btn')
    $btns.forEach(btn => {
      btn.replaceWith(btn.cloneNode(true))
    })
  })
  document.addEventListener('DOMContentLoaded', handleSkillsLogic)
  document.addEventListener('astro:page-load', handleSkillsLogic)
}
