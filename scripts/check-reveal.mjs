// Checks the scroll animations against the built site in a real headless
// Chrome, driven over the DevTools protocol with Node's built-in WebSocket (no
// Playwright, nothing to install). What it guards only shows up by scrolling:
// - every [data-reveal] block ends visible, and none stays hidden in view
//   (desktop es/en, mobile, after "See all" and after a ClientRouter round trip)
// - ClientRouter keeps `html.js` and the theme across a swap
// - reduced motion and no-JS never hide content
// - keyboard focus shows a hidden block at once, without animating it
// - the header hides and the bottom nav shows on scroll (issue fixed in #15)
//
// Usage: npm run build && npm run preview, then in another terminal
//   npm run check:reveal [-- http://localhost:4321]
// CHROME_PATH overrides the browser binary. Exit code 1 when something fails.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '')
const PORT = 9333
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean)

const chromePath = CHROME_CANDIDATES.find(path => existsSync(path))
if (!chromePath) {
  console.error('check-reveal: no Chrome found. Set CHROME_PATH.')
  process.exit(1)
}

try {
  await fetch(BASE)
} catch {
  console.error(`check-reveal: ${BASE} is not up. Run npm run preview first.`)
  process.exit(1)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const profile = mkdtempSync(join(tmpdir(), 'check-reveal-'))
const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--hide-scrollbars',
  'about:blank'
])

let ws
let lastId = 0
const pending = new Map()
const pageErrors = []

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++lastId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })

const evaluate = async expression => {
  const { result, exceptionDetails } = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  })
  if (exceptionDetails)
    throw new Error(
      exceptionDetails.exception?.description || exceptionDetails.text
    )
  return result.value
}

const goto = async path => {
  await send('Page.navigate', { url: `${BASE}${path}` })
  await sleep(2500)
}

const scrollTo = y =>
  evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`)

const viewport = (width, height, mobile = false) =>
  send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile
  })

// Reveal blocks inside the viewport that are still not fully visible
const GAPS = `[...document.querySelectorAll('[data-reveal]')]
  .filter(e => {
    const r = e.getBoundingClientRect()
    return r.top < innerHeight - 40 && r.bottom > 40 && r.height > 0
  })
  .filter(e => Number(getComputedStyle(e).opacity) < 0.99)
  .map(e => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0])`

const UNREVEALED = `document.querySelectorAll('[data-reveal]:not([data-revealed])').length`

const ROOT_STATE = `({
  js: document.documentElement.classList.contains('js'),
  dark: document.documentElement.classList.contains('dark'),
  theme: document.documentElement.dataset.theme
})`

const failures = []
const check = (ok, message) => {
  console.log(`${ok ? '✓' : '✗'} ${message}`)
  if (!ok) failures.push(message)
}

// Scrolls the whole page in steps of 60% of the viewport, waiting longer than
// the max stagger (210 ms) plus the animation (600 ms) at each one
async function walk(label) {
  const height = await evaluate('document.documentElement.scrollHeight')
  const step = Math.round((await evaluate('innerHeight')) * 0.6)
  const gaps = []
  for (let y = 0; y <= height; y += step) {
    await scrollTo(y)
    await sleep(900)
    const found = await evaluate(GAPS)
    if (found.length) gaps.push(`y=${y}: ${found.join(', ')}`)
  }
  const left = await evaluate(UNREVEALED)
  check(
    gaps.length === 0 && left === 0,
    `${label}: no hidden block in view, all revealed` +
      (gaps.length ? `\n    ${gaps.join('\n    ')}` : '') +
      (left ? `\n    ${left} never revealed` : '')
  )
}

try {
  for (let attempt = 0; attempt < 40 && !ws; attempt++) {
    try {
      const targets = await (
        await fetch(`http://127.0.0.1:${PORT}/json/list`)
      ).json()
      const page = targets.find(target => target.type === 'page')
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl)
    } catch {
      await sleep(250)
    }
  }
  if (!ws) throw new Error('could not connect to Chrome')
  await new Promise(resolve => ws.addEventListener('open', resolve))

  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown')
      pageErrors.push(message.params.exceptionDetails.text)
  })

  await send('Page.enable')
  await send('Runtime.enable')
  // Headless Chrome fires no focus events unless the page believes it is
  // focused
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })

  // 1. Desktop, both languages
  await viewport(1280, 800)
  await goto('/')
  await walk('desktop /')
  await goto('/en')
  await walk('desktop /en')

  // 2. "See all" adds cards after load: they must join the system
  await goto('/')
  await evaluate(
    `document.getElementById('projects').scrollIntoView({ behavior: 'instant' })`
  )
  await sleep(1200)
  const before = await evaluate(
    `document.querySelectorAll('.projects__gallery-item').length`
  )
  await evaluate(`document.querySelector('.projects__btn')?.click()`)
  await sleep(300)
  const after = await evaluate(
    `document.querySelectorAll('.projects__gallery-item').length`
  )
  check(after > before, `"See all" renders more cards (${before} → ${after})`)
  await walk('after "See all"')

  // 3. ClientRouter round trip: `js` and the theme survive both swaps
  await evaluate(`localStorage.setItem('darkMode-portafolio-andino', 'true')`)
  await goto('/')
  await evaluate(`document.querySelector('.item__title a').click()`)
  await sleep(2500)
  const onProject = await evaluate(ROOT_STATE)
  await evaluate('history.back()')
  await sleep(2500)
  const back = await evaluate(ROOT_STATE)
  check(
    onProject.js && onProject.dark && onProject.theme === 'dark',
    'navigating to a project keeps html.js and the dark theme'
  )
  check(
    back.js && back.dark && back.theme === 'dark',
    'navigating back keeps html.js and the dark theme'
  )
  await walk('after a ClientRouter round trip')
  await evaluate(`localStorage.removeItem('darkMode-portafolio-andino')`)

  // 4. Mobile: no stagger, no horizontal overflow from the slide-ins
  await viewport(390, 844, true)
  await goto('/')
  await walk('mobile /')
  const delays = await evaluate(
    `[...document.querySelectorAll('[data-revealed]')].filter(e => e.style.getPropertyValue('--reveal-delay')).length`
  )
  check(delays === 0, 'mobile reveals without stagger')
  check(
    !(await evaluate('document.documentElement.scrollWidth > innerWidth')),
    'mobile has no horizontal overflow'
  )

  // 5. Reduced motion and no JS never hide content
  await viewport(1280, 800)
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
  })
  await goto('/')
  const hiddenReduced = await evaluate(
    `[...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity !== '1').length`
  )
  check(hiddenReduced === 0, 'reduced motion: nothing hidden')
  await send('Emulation.setEmulatedMedia', { features: [] })

  await send('Emulation.setScriptExecutionDisabled', { value: true })
  await goto('/')
  const hiddenNoJs = await evaluate(
    `[...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity !== '1').length`
  )
  check(hiddenNoJs === 0, 'without JS: nothing hidden')
  await send('Emulation.setScriptExecutionDisabled', { value: false })

  // 6. Keyboard focus on a block that is still hidden. A URL not loaded
  // before: reloading the same one restores its scroll, already revealed
  await goto('/?focus-check')
  const focus = await evaluate(`(() => {
    const link = document.querySelector('.contact__link-btn')
    const box = link.closest('[data-reveal]')
    const wasHidden = !box.hasAttribute('data-revealed')
    link.focus({ preventScroll: true })
    const style = getComputedStyle(box)
    return { wasHidden, opacity: style.opacity, animation: style.animationName }
  })()`)
  check(
    focus.wasHidden && focus.opacity === '1' && focus.animation === 'none',
    'focus on a hidden block shows it at once, without animation'
  )

  // 7. Scroll-driven header and bottom nav
  await scrollTo(900)
  await sleep(600)
  const scrolled = await evaluate(`({
    header: getComputedStyle(document.getElementById('header')).opacity,
    nav: new DOMMatrix(getComputedStyle(document.getElementById('nav')).transform).m42
  })`)
  check(
    scrolled.header === '0' && scrolled.nav === 0,
    'scrolled: header hidden, bottom nav in place'
  )

  check(
    pageErrors.length === 0,
    'no uncaught errors in the page' +
      (pageErrors.length ? `\n    ${pageErrors.join('\n    ')}` : '')
  )
} catch (error) {
  failures.push(String(error))
  console.error(error)
} finally {
  ws?.close()
  chrome.kill()
  await sleep(300)
  rmSync(profile, { recursive: true, force: true })
}

console.log(
  failures.length
    ? `\ncheck-reveal: ${failures.length} failing`
    : '\ncheck-reveal: all good'
)
process.exit(failures.length ? 1 : 0)
