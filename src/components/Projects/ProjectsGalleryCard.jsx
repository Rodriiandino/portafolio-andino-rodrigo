import './styles/projects-gallery-card.css'
import { useEffect } from 'preact/hooks'
import { IconCode, IconDemo } from '../icons/icons'

export default function ProjectsGalleryCard({
  image,
  image_alt,
  title,
  title_url,
  description,
  link_code,
  link_demo,
  icons
}) {
  useEffect(() => {
    const galleryInfo = document.querySelectorAll('.gallery__item-info')
    const isMobile = window.matchMedia('(max-width: 768px)')

    const handleMediaChange = e => {
      if (e.matches) {
        galleryInfo.forEach(item => {
          item.classList.add('opacity')
        })
      } else {
        galleryInfo.forEach(item => {
          item.classList.remove('opacity')
        })
      }
    }

    handleMediaChange(isMobile)

    isMobile.addEventListener('change', handleMediaChange)

    return () => {
      isMobile.removeEventListener('change', handleMediaChange)
    }
  }, [])

  return (
    <>
      <article class='projects__gallery-item'>
        <img src={image} alt={image_alt} class='gallery__img' loading='lazy' />
        <div class='gallery__item-info'>
          <h4 class='item__title'>
            <a href={title_url}>
              {title}
              <svg
                class='item__title-icon'
                viewBox='0 0 18 18'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  opacity='0.5'
                  d='M5.67514 15.6194L5.32158 15.2659L16.097 4.49043L16.4506 4.84399L5.67514 15.6194Z'
                  stroke='currentColor'
                  stroke-width='1.5'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                ></path>
                <path
                  d='M16.5641 12.8623L16.6274 4.31369L8.0788 4.37701'
                  stroke='currentColor'
                  stroke-width='2'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                ></path>
              </svg>
            </a>
          </h4>
          <p class='item__description'>{description}</p>
          <footer class='item__footer'>
            <div class='footer__links'>
              <a href={link_code} target='_blank' rel='noopener noreferrer'>
                <IconCode /> Code
              </a>
              {link_demo && (
                <a href={link_demo} target='_blank' rel='noopener noreferrer'>
                  <IconDemo /> Demo
                </a>
              )}
            </div>
            <p class='footer__icons'>{icons}</p>
          </footer>
        </div>
      </article>
    </>
  )
}
