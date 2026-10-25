// Single source for SEO/GEO: URLs, hreflang alternates, JSON-LD and the
// profile facts used by llms.txt and the Markdown endpoints. Everything is
// derived from src/data/*.json and src/i18n/ui.js, so there is no copy to
// keep in sync by hand.
import projectsEs from '../data/projects_es.json'
import projectsEn from '../data/projects_en.json'
import experienceEs from '../data/experience_es.json'
import experienceEn from '../data/experience_en.json'
import { skillsData } from '../data/skills.js'
import { ui } from '../i18n/ui.js'
import convertTitleToURL from '../components/utils/convert_title_to_url.js'

export const SITE_URL = 'https://portafolio-andino-rodrigo.vercel.app'
export const LOCALES = ['es', 'en']
export const DEFAULT_LOCALE = 'es'
export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const PERSON_NAME = 'Rodrigo Agustín Andino'
export const PERSON_SHORT_NAME = 'Rodrigo Andino'
export const EMAIL = 'andinorodrigo.job@gmail.com'
export const CV_URL =
  'https://drive.google.com/drive/folders/1ubdQQywhXjspH7phjBvDsFDLFQEtBPiU?usp=sharing'
export const SOCIAL = {
  github: 'https://github.com/Rodriiandino',
  linkedin: 'https://www.linkedin.com/in/rodrigoandino03/',
  twitter: 'https://twitter.com/Rodriiandino1',
  instagram: 'https://www.instagram.com/rodriiandino/'
}

export const OG_LOCALE = { es: 'es_AR', en: 'en_US' }

const projects = { es: projectsEs, en: projectsEn }
const experience = { es: experienceEs, en: experienceEn }

export const getProjects = locale => projects[locale]
export const t = (locale, key) => ui[locale][key] ?? ui[DEFAULT_LOCALE][key]

export function getExperience(locale) {
  const [{ education, workExperience }, { professionalCourses }] =
    experience[locale]
  return { education, workExperience, professionalCourses }
}

/** University degrees already earned (an open date range means still studying). */
export const getDegrees = locale =>
  getExperience(locale).education.filter(
    item =>
      /universidad/i.test(item.complementary) &&
      !/cursando|actualidad|present/i.test(item.date)
  )

/** Current job = first item of workExperience (the JSON is newest first). */
export const getCurrentJob = locale => getExperience(locale).workExperience[0]

// ---------- URLs ----------

export const absoluteUrl = path => new URL(path, SITE_URL).href

export const homePath = locale => (locale === DEFAULT_LOCALE ? '/' : '/en/')

export const projectSlug = project => convertTitleToURL(project.title)

/** HTML page path, with trailing slash (same form as the sitemap). */
export const projectPath = (locale, index) =>
  `${locale === DEFAULT_LOCALE ? '' : '/en'}/projects/${projectSlug(projects[locale][index])}/`

export const homeMarkdownPath = locale =>
  locale === DEFAULT_LOCALE ? '/index.md' : '/en/index.md'

export const projectMarkdownPath = (locale, index) =>
  projectPath(locale, index).replace(/\/$/, '.md')

/**
 * Identify a rendered page from its pathname. Projects are matched by index
 * because the es and en slugs differ (titles are translated).
 * @returns {{ type: 'home' | 'project' | 'other', locale: string, index?: number }}
 */
export function resolvePage(pathname) {
  const clean = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '')
  const locale = clean === '/en' || clean.startsWith('/en/') ? 'en' : 'es'
  const rest = locale === 'en' ? clean.slice(3) : clean

  if (rest === '') return { type: 'home', locale }

  const match = rest.match(/^\/projects\/([^/]+)$/)
  if (match) {
    const index = projects[locale].findIndex(
      project => projectSlug(project) === match[1]
    )
    if (index !== -1) return { type: 'project', locale, index }
  }
  return { type: 'other', locale }
}

/** Canonical + alternates (absolute) for a resolved page. */
export function getPageUrls(page, pathname) {
  if (page.type === 'home' || page.type === 'project') {
    const pathFor = locale =>
      page.type === 'home' ? homePath(locale) : projectPath(locale, page.index)
    const markdown =
      page.type === 'home'
        ? homeMarkdownPath(page.locale)
        : projectMarkdownPath(page.locale, page.index)
    return {
      canonical: absoluteUrl(pathFor(page.locale)),
      alternates: {
        es: absoluteUrl(pathFor('es')),
        en: absoluteUrl(pathFor('en')),
        'x-default': absoluteUrl(pathFor(DEFAULT_LOCALE))
      },
      markdown: absoluteUrl(markdown)
    }
  }
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`
  return { canonical: absoluteUrl(path), alternates: null, markdown: null }
}

/** Every HTML page URL -> its hreflang links, for @astrojs/sitemap. */
export function getSitemapAlternates() {
  const map = new Map()
  const add = pathFor => {
    const links = [
      ...LOCALES.map(lang => ({ lang, url: absoluteUrl(pathFor(lang)) })),
      { lang: 'x-default', url: absoluteUrl(pathFor(DEFAULT_LOCALE)) }
    ]
    for (const lang of LOCALES) map.set(absoluteUrl(pathFor(lang)), links)
  }
  add(homePath)
  projectsEs.forEach((_, index) => add(locale => projectPath(locale, index)))
  return map
}

// ---------- Text helpers ----------

/** Cut at a word boundary so meta descriptions stay under ~155 chars. */
export function truncate(text, max = 155) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  // No space to cut at (one very long word): hard cut instead of slice(0, -1)
  const head = space > 0 ? cut.slice(0, space) : cut
  return `${head.replace(/[,.;:]$/, '')}…`
}

/** First year found in a project date like "2023 - 2024". */
export const firstYear = date => date.match(/\d{4}/)?.[0]

const SKILL_ALIASES = {
  JS: 'JavaScript',
  TS: 'TypeScript',
  'Next js': 'Next.js',
  RAG: 'Retrieval-Augmented Generation (RAG)',
  MCP: 'Model Context Protocol (MCP)'
}

/** Skills section + every project technology, deduplicated. */
export function getKnowsAbout() {
  const seen = new Map()
  const add = name => {
    const key = name.toLowerCase().replace(/[\s.]/g, '')
    if (!seen.has(key)) seen.set(key, name)
  }
  Object.values(skillsData)
    .flat()
    .forEach(skill => add(SKILL_ALIASES[skill.name] ?? skill.name))
  projectsEs.forEach(project => project.technologies.forEach(add))
  return [...seen.values()]
}

/** Skill names grouped by the categories shown in the Skills section. */
export function getSkillGroups(locale) {
  const labels = {
    aiAgents: t(locale, 'skills.ai'),
    frontEnd: t(locale, 'skills.frontend'),
    backEnd: t(locale, 'skills.backend'),
    databases: t(locale, 'skills.database'),
    else: t(locale, 'skills.other')
  }
  return Object.entries(skillsData).map(([key, skills]) => ({
    label: labels[key] ?? key,
    skills: skills.map(skill => SKILL_ALIASES[skill.name] ?? skill.name)
  }))
}

// ---------- JSON-LD ----------

function personNode(locale) {
  const job = getCurrentJob(locale)
  const { education } = getExperience(locale)
  const schools = [...new Set(education.map(item => item.complementary))]

  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON_NAME,
    alternateName: [PERSON_SHORT_NAME, 'Rodriiandino'],
    givenName: 'Rodrigo Agustín',
    familyName: 'Andino',
    url: `${SITE_URL}/`,
    email: `mailto:${EMAIL}`,
    jobTitle: job.title,
    description: t(locale, 'bento.description'),
    worksFor: {
      '@type': 'Organization',
      name: job.complementary,
      ...(job.link && { url: job.link })
    },
    hasCredential: getDegrees(locale).map(item => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: item.title,
      recognizedBy: { '@type': 'CollegeOrUniversity', name: item.complementary }
    })),
    alumniOf: schools.map(name => ({
      '@type': /universidad/i.test(name)
        ? 'CollegeOrUniversity'
        : 'EducationalOrganization',
      name
    })),
    address: { '@type': 'PostalAddress', addressCountry: 'AR' },
    knowsAbout: getKnowsAbout(),
    sameAs: Object.values(SOCIAL)
  }
}

const personRef = { '@id': PERSON_ID }

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: PERSON_SHORT_NAME,
    alternateName: `Portfolio ${PERSON_SHORT_NAME}`,
    inLanguage: LOCALES,
    author: personRef,
    publisher: personRef
  }
}

export function homeSchema(locale, { title, description }) {
  const url = absoluteUrl(homePath(locale))
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#profilepage`,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: personRef,
        about: personRef
      },
      personNode(locale),
      websiteNode()
    ]
  }
}

export function projectSchema(locale, index, { title, description }) {
  const project = projects[locale][index]
  const pageUrl = absoluteUrl(projectPath(locale, index))
  const homeUrl = absoluteUrl(homePath(locale))
  const year = firstYear(project.date)
  const work = {
    '@type': project.github ? 'SoftwareSourceCode' : 'CreativeWork',
    '@id': `${pageUrl}#work`,
    name: project.title,
    description: project.description,
    url: project.deploy.demo || pageUrl,
    mainEntityOfPage: pageUrl,
    inLanguage: locale,
    image: project.images.map(image => absoluteUrl(image.src)),
    keywords: project.technologies.join(', '),
    genre: project.features,
    creativeWorkStatus: project.status,
    ...(year && { dateCreated: year }),
    ...(project.github && { codeRepository: project.github }),
    author: personRef,
    creator: personRef
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': work['@id'] },
        author: personRef,
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
      },
      work,
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: PERSON_SHORT_NAME,
            item: homeUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: project.title,
            item: pageUrl
          }
        ]
      },
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: PERSON_NAME,
        url: homeUrl,
        jobTitle: getCurrentJob(locale).title,
        sameAs: Object.values(SOCIAL)
      },
      websiteNode()
    ]
  }
}

/**
 * Safe for <script type="application/ld+json" set:html>: escapes the
 * characters that could close the script element or start an HTML comment
 * (`</script>`, `<!--`) plus U+2028/U+2029. The output is still valid JSON.
 */
const JSON_LD_ESCAPES = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
}
export const serializeJsonLd = data =>
  JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    char => JSON_LD_ESCAPES[char]
  )
