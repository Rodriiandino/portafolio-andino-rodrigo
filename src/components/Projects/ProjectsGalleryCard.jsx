import './styles/projects-gallery-card.css'
import { useEffect, useRef } from 'preact/hooks'
import { IconCode, IconDemo } from '../icons/icons'
import { useImageDimensions } from '../hooks/useImageDimensions'
import { useTranslations } from '../../i18n/utils'

export default function ProjectsGalleryCard({
  image,
  image_alt,
  title,
  title_url,
  description,
  link_code,
  link_demo,
  icons,
  highlight,
  currentLocale = 'es'
}) {
  const t = useTranslations(currentLocale)
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
        <img
          src={image}
          alt={image_alt}
          class='gallery__img'
          loading='lazy'
          decoding={'async'}
        />
        <div class='gallery__item-info'>
          <h4 class='item__title'>
            <a href={title_url} aria-label={title} title={title}>
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
              {link_code && (
                <a
                  href={link_code}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={`${currentLocale === 'es' ? 'Ir a GitHub de' : 'Go to GitHub of'} ${title}`}
                  title={`${currentLocale === 'es' ? 'Ir a GitHub de' : 'Go to GitHub of'} ${title}`}
                >
                  <IconCode /> {t('link.code')}
                </a>
              )}
              {link_demo && (
                <a
                  href={link_demo}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={`${currentLocale === 'es' ? 'Ir a la demo de' : 'Go to demo of'} ${title}`}
                  title={`${currentLocale === 'es' ? 'Ir a la demo de' : 'Go to demo of'} ${title}`}
                >
                  <IconDemo /> {t('link.demo')}
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
