import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'
import { useTranslations } from './i18n/utils'

// Imported only by the project page (page/Project.astro), so PhotoSwipe's CSS
// and lightbox code are not shipped to the home page.
let lightbox = null

function initGallery() {
  // Drop the instance from the previous page so clicks never open two
  // lightboxes, and do nothing on pages without a gallery
  lightbox?.destroy()
  lightbox = null
  if (!document.querySelector('#my-gallery')) return

  // Localized titles/labels for the lightbox controls (PhotoSwipe defaults to English)
  const t = useTranslations(document.documentElement.lang || 'es')

  lightbox = new PhotoSwipeLightbox({
    gallery: '#my-gallery',
    children: 'a',
    pswpModule: () => import('photoswipe'),
    closeTitle: t('gallery.close'),
    zoomTitle: t('gallery.zoom'),
    arrowPrevTitle: t('gallery.prev'),
    arrowNextTitle: t('gallery.next'),
    errorMsg: t('gallery.error')
  })

  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'download-button',
      order: 8,
      isButton: true,
      tagName: 'a',
      title: t('gallery.download'),

      // SVG with outline
      html: {
        isCustomSVG: true,
        inner:
          '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
        outlineID: 'pswp__icn-download'
      },

      onInit: (el, pswp) => {
        el.setAttribute('download', '')
        el.setAttribute('target', '_blank')
        el.setAttribute('rel', 'noopener')

        pswp.on('change', () => {
          el.href = pswp.currSlide.data.src
        })
      }
    })
  })

  lightbox.init()
}

// astro:page-load also fires on the first load (after module scripts run), and
// ClientRouter awaits this module before dispatching it on navigations, so the
// listener alone covers every case
document.addEventListener('astro:page-load', initGallery)
