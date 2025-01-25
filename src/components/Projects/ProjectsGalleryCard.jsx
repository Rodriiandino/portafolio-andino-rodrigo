import './styles/projects-gallery-card.css'
import { useEffect, useRef } from 'preact/hooks'
import { IconCode, IconDemo } from '../icons/icons'
import { useImageDimensions } from '../hooks/useImageDimensions'

export default function ProjectsGalleryCard({
  image,
  image_alt,
  title,
  title_url,
  description,
  link_code,
  link_demo,
  icons,
  highlight
}) {
  const cardRef = useRef(null)

  useEffect(() => {
    const calculateSize = async () => {
      const aspectRatio = await useImageDimensions(image)
      const card = cardRef.current

      if (card && aspectRatio > 1.5) {
        card.classList.add('vertical')
      }
    }

    calculateSize()
  }, [image])

  return (
    <>
      <article
        ref={cardRef}
        class={`projects__gallery-item ${highlight ? 'highlight' : ''}`}
      >
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
