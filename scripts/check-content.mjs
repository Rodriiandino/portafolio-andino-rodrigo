// Validates the portfolio content that lives outside the type system:
// es/en parity of projects, experience and UI strings, and that every
// referenced image exists where the cards and the detail pages look for it.
// Usage: npm run check:content  (exit code 1 when something is wrong)
import { readFileSync, existsSync } from 'node:fs'
import { ui } from '../src/i18n/ui.js'
import convertTitleToURL from '../src/components/utils/convert_title_to_url.js'

const root = new URL('../', import.meta.url)
const readJSON = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'))
const exists = path => existsSync(new URL(path, root))

const errors = []
const warnings = []

// Same function the pages use, so the check cannot drift from the real URLs
const slug = convertTitleToURL

// `status` is shown as-is in the UI, the JSON-LD and the Markdown versions:
// one spelling per state, and es[i] must be the translation of en[i]
const allowedStatus = {
  es: ['Completo', 'En Progreso'],
  en: ['Complete', 'In Progress']
}

// UI strings
const esKeys = Object.keys(ui.es)
const enKeys = Object.keys(ui.en)
for (const key of esKeys)
  if (!enKeys.includes(key)) errors.push(`ui.js: "${key}" missing in en`)
for (const key of enKeys)
  if (!esKeys.includes(key)) errors.push(`ui.js: "${key}" missing in es`)

// Projects
const projects = {
  es: readJSON('src/data/projects_es.json'),
  en: readJSON('src/data/projects_en.json')
}
const required = [
  'title',
  'description',
  'what_i_learned',
  'features',
  'date',
  'technologies',
  'status',
  'deploy',
  'github',
  'images'
]

if (projects.es.length !== projects.en.length)
  errors.push(
    `projects: es has ${projects.es.length} entries, en has ${projects.en.length}`
  )

for (const lang of ['es', 'en']) {
  const seen = new Set()
  projects[lang].forEach((project, i) => {
    const where = `projects_${lang}.json[${i}] "${project.title}"`
    for (const field of required)
      if (!(field in project)) errors.push(`${where}: missing field "${field}"`)

    if ('status' in project && !allowedStatus[lang].includes(project.status))
      errors.push(
        `${where}: status "${project.status}" must be one of ${allowedStatus[lang].join(' | ')}`
      )

    const s = slug(project.title ?? '')
    if (!s) errors.push(`${where}: title produces an empty slug`)
    if (seen.has(s)) errors.push(`${where}: duplicated slug "${s}"`)
    seen.add(s)

    if (!project.images?.length) {
      errors.push(`${where}: needs at least one image`)
      return
    }
    project.images.forEach((image, j) => {
      if (!image.src?.startsWith('/projects/'))
        errors.push(`${where}: images[${j}].src must start with /projects/`)
      if (!image.alt) warnings.push(`${where}: images[${j}] has no alt text`)
      const rel = image.src.slice('/projects/'.length)
      // Detail page resolves every image through import.meta.glob on src/assets
      if (!exists(`src/assets/projects/${rel}`))
        errors.push(`${where}: src/assets/projects/${rel} not found`)
    })
    // Gallery card loads the first image straight from public/
    const cover = project.images[0].src
    if (!exists(`public${cover}`))
      errors.push(`${where}: cover public${cover} not found`)
  })
}

projects.es.forEach((es, i) => {
  const en = projects.en[i]
  if (!en) return
  const pair = `projects[${i}] "${es.title}"`
  if (es.images.length !== en.images.length)
    warnings.push(
      `${pair}: es has ${es.images.length} images, en has ${en.images.length}`
    )
  es.images.forEach((image, j) => {
    if (en.images[j] && en.images[j].src !== image.src)
      errors.push(
        `${pair}: images[${j}].src differs between es and en (order mismatch?)`
      )
  })
  if (
    allowedStatus.es.indexOf(es.status) !== allowedStatus.en.indexOf(en.status)
  )
    errors.push(
      `${pair}: status "${es.status}" (es) does not match "${en.status}" (en)`
    )
  // Optional flag: hides old/practice projects behind the gallery switch
  for (const [lang, project] of [
    ['es', es],
    ['en', en]
  ])
    if ('archived' in project && typeof project.archived !== 'boolean')
      errors.push(`${pair}: "archived" must be true or false (${lang})`)
  if (Boolean(es.archived) !== Boolean(en.archived))
    errors.push(`${pair}: "archived" differs between es and en`)
  if (es.github !== en.github)
    warnings.push(`${pair}: github link differs between es and en`)
  if (es.deploy?.demo !== en.deploy?.demo)
    warnings.push(`${pair}: demo link differs between es and en`)
})

// Experience
const experience = {
  es: readJSON('src/data/experience_es.json'),
  en: readJSON('src/data/experience_en.json')
}
const sections = [
  ['education', 0],
  ['workExperience', 0],
  ['professionalCourses', 1]
]
for (const [name, index] of sections) {
  const es = experience.es[index]?.[name]
  const en = experience.en[index]?.[name]
  if (!Array.isArray(es) || !Array.isArray(en)) {
    errors.push(
      `experience: section "${name}" missing at index ${index} in es or en`
    )
    continue
  }
  if (es.length !== en.length)
    errors.push(
      `experience.${name}: es has ${es.length} items, en has ${en.length}`
    )
}

for (const w of warnings) console.warn(`warn  ${w}`)
for (const e of errors) console.error(`error ${e}`)
console.log(
  `\ncheck-content: ${projects.es.length} projects, ${esKeys.length} ui keys, ${errors.length} errors, ${warnings.length} warnings`
)
process.exit(errors.length ? 1 : 0)
