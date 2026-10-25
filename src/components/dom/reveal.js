// Scroll reveal: an element marked with data-reveal='up|down|left|right|fade|zoom'
// starts hidden and animates in once, when it approaches the viewport.
//
// The contract has two halves:
// - CSS (Layout.astro) hides `[data-reveal]:not([data-revealed])` only under
//   `html.js` and without reduced motion, and runs the keyframe once the
//   element gets `data-revealed`. No JS or reduced motion: content just shows.
// - This script decides when to set `data-revealed` and with which delay.
//
// State lives in attributes, never in classes: Preact owns the `class` of the
// gallery cards and would wipe a class added from here on its next render.

const SELECTOR = '[data-reveal]:not([data-revealed])'

// The stagger is measured per batch (the elements the observer reports
// together), in DOM order, and capped. It must never depend on an element's
// position in the whole page: that makes the wait grow the further down you
// scroll. An element that enters alone appears with no wait.
const STEP_MS = 70
const MAX_STEPS = 3

// The extra 100px below the viewport start the animation just before the
// element is visible: by the time it is on screen it is halfway through, so a
// fast scroll never shows empty gaps
const OBSERVER_OPTIONS = { threshold: 0.1, rootMargin: '0px 0px 100px 0px' }

// On small screens the cascade only feels slow
const NO_STAGGER_QUERY = '(max-width: 768px)'

const byDocumentOrder = (a, b) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1

const show = (element, delay = 0, instant = false) => {
  if (delay) element.style.setProperty('--reveal-delay', `${delay}ms`)
  element.setAttribute('data-revealed', instant ? 'instant' : '')
}

export default function reveal() {
  let intersection
  let mutations

  const disconnect = () => {
    intersection?.disconnect()
    mutations?.disconnect()
  }

  const handleEntries = entries => {
    const entering = entries
      .filter(entry => entry.isIntersecting)
      .map(entry => entry.target)
      .sort(byDocumentOrder)

    if (entering.length === 0) return

    const stagger = !window.matchMedia(NO_STAGGER_QUERY).matches

    entering.forEach((element, index) => {
      intersection.unobserve(element)
      show(element, stagger ? Math.min(index, MAX_STEPS) * STEP_MS : 0)
    })
  }

  const observeTree = root => {
    if (root.matches?.(SELECTOR)) intersection.observe(root)
    root.querySelectorAll?.(SELECTOR).forEach(element => {
      intersection.observe(element)
    })
  }

  const init = () => {
    disconnect()

    // Without IntersectionObserver nothing would ever be revealed, including
    // what renders later: drop `js` so the CSS hides nothing at all
    if (!('IntersectionObserver' in window)) {
      document.documentElement.classList.remove('js')
      return
    }

    intersection = new IntersectionObserver(handleEntries, OBSERVER_OPTIONS)
    observeTree(document.body)

    // Content rendered after load (gallery cards from "See all" or a filter,
    // the skills list) enters the same system without any wiring of its own
    mutations = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) observeTree(node)
        })
      })
    })
    mutations.observe(document.body, { childList: true, subtree: true })
  }

  // Keyboard focus can land on an element that is still hidden (Tab, or a
  // skip link): show it right away, without animating what is being read
  const handleFocus = event => {
    const element = event.target.closest?.(SELECTOR)
    if (!element) return
    intersection?.unobserve(element)
    show(element, 0, true)
  }

  document.addEventListener('astro:page-load', init)
  document.addEventListener('astro:before-swap', disconnect)
  document.addEventListener('focusin', handleFocus)
}
