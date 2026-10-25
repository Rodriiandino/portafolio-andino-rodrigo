import { skillsData } from '../../data/skills'

export default function skillsList() {
  const handleSkillsLogic = () => {
    const $btns = document.querySelectorAll('.skills__btn')
    const $list = document.querySelector('.skills__list')

    if (!$btns.length || !$list) return

    const renderList = skills => {
      $list.innerHTML = ''
      skills.forEach(skill => {
        const icon = skill.icon.replace(
          '<svg',
          '<svg aria-hidden="true" focusable="false"'
        )
        $list.innerHTML += `<li class="icon__svg">${icon} ${skill.name}</li>`
      })
    }

    // Toggle buttons: the selected category is exposed with aria-pressed
    const setActive = activeBtn => {
      $btns.forEach(btn => {
        const isActive = btn === activeBtn
        btn.classList.toggle('active', isActive)
        btn.setAttribute('aria-pressed', String(isActive))
      })
    }

    const setupEventListeners = () => {
      const updatedBtns = document.querySelectorAll('.skills__btn')

      updatedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          setActive(btn)

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
        setActive(frontEndBtn)
      }
      renderList(skillsData.frontEnd)
    }

    setupEventListeners()
    initializeList()
  }

  document.addEventListener('astro:page-load', handleSkillsLogic)
}
