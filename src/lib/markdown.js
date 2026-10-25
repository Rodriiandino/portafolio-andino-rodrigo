// Markdown/plain-text renderings of the site for LLMs and agents
// (llms.txt, llms-full.txt, /index.md, /projects/<slug>.md). Built at build
// time from the same data as the HTML pages.
import {
  CV_URL,
  EMAIL,
  LOCALES,
  PERSON_NAME,
  SITE_URL,
  SOCIAL,
  absoluteUrl,
  getCurrentJob,
  getExperience,
  getProjects,
  getSkillGroups,
  homeMarkdownPath,
  homePath,
  projectMarkdownPath,
  projectPath,
  t,
  truncate
} from './site.js'

// Template labels only; the content itself comes from the data files
const LABELS = {
  es: {
    language: 'Español',
    otherLanguage: 'English version',
    location: 'Ubicación',
    currentRole: 'Rol actual',
    links: 'Enlaces',
    web: 'Sitio web',
    cv: 'CV',
    email: 'Email',
    education: 'Educación',
    work: 'Experiencia laboral',
    courses: 'Cursos',
    skills: 'Tecnologías',
    projects: 'Proyectos',
    projectDetails: 'Detalle de proyectos',
    about: 'Sobre mí',
    author: 'Autor',
    type: 'Tipo',
    hosting: 'Deploy',
    demo: 'Sitio / demo',
    code: 'Código',
    page: 'Página',
    at: 'en',
    noDeploy: 'sin deploy público'
  },
  en: {
    language: 'English',
    otherLanguage: 'Versión en español',
    location: 'Location',
    currentRole: 'Current role',
    links: 'Links',
    web: 'Website',
    cv: 'Resume (CV)',
    email: 'Email',
    education: 'Education',
    work: 'Work experience',
    courses: 'Courses',
    skills: 'Skills',
    projects: 'Projects',
    projectDetails: 'Project details',
    about: 'About',
    author: 'Author',
    type: 'Type',
    hosting: 'Deploy',
    demo: 'Live site / demo',
    code: 'Source code',
    page: 'Page',
    at: 'at',
    noDeploy: 'no public deploy'
  }
}

const other = locale => (locale === 'es' ? 'en' : 'es')
const heading = (level, text) => `${'#'.repeat(level)} ${text}`
const clean = text => text.replace(/\s+/g, ' ').trim()
const link = (text, url) => `[${text}](${url})`

function timelineSection(level, title, items) {
  return [
    heading(level, title),
    '',
    ...items.flatMap(item => [
      heading(
        level + 1,
        `${item.title} | ${item.complementary} (${item.date})`
      ),
      '',
      clean(item.description),
      ...(item.link ? ['', item.link] : []),
      ''
    ])
  ]
}

/** Full profile (home page) as Markdown. */
export function homeMarkdown(locale, { level = 1 } = {}) {
  const L = LABELS[locale]
  const job = getCurrentJob(locale)
  const { education, workExperience, professionalCourses } =
    getExperience(locale)

  return [
    heading(level, `${PERSON_NAME} | ${t(locale, 'bento.subtitle')}`),
    '',
    `> ${clean(t(locale, 'bento.description'))}`,
    '',
    `- ${L.currentRole}: ${job.title} ${L.at} ${job.complementary} (${job.date})`,
    `- ${L.location}: Argentina`,
    `- ${L.web}: ${absoluteUrl(homePath(locale))}`,
    `- ${L.otherLanguage}: ${absoluteUrl(homeMarkdownPath(other(locale)))}`,
    `- GitHub: ${SOCIAL.github}`,
    `- LinkedIn: ${SOCIAL.linkedin}`,
    `- X (Twitter): ${SOCIAL.twitter}`,
    `- Instagram: ${SOCIAL.instagram}`,
    `- ${L.email}: ${EMAIL}`,
    `- ${L.cv}: ${CV_URL}`,
    '',
    heading(level + 1, L.about),
    '',
    clean(t(locale, 'experience.description')),
    '',
    ...timelineSection(level + 1, L.work, workExperience),
    ...timelineSection(level + 1, L.education, education),
    ...timelineSection(level + 1, L.courses, professionalCourses),
    heading(level + 1, L.skills),
    '',
    ...getSkillGroups(locale).map(
      group => `- ${group.label}: ${group.skills.join(', ')}`
    ),
    '',
    heading(level + 1, L.projects),
    '',
    ...getProjects(locale).map(
      (project, index) =>
        `- ${link(project.title, absoluteUrl(projectPath(locale, index)))} (${project.date}): ${truncate(project.description, 200)} ${project.technologies.join(', ')}. Markdown: ${absoluteUrl(projectMarkdownPath(locale, index))}`
    ),
    ''
  ].join('\n')
}

/** One project page as Markdown. */
export function projectMarkdown(locale, index, { level = 1 } = {}) {
  const L = LABELS[locale]
  const project = getProjects(locale)[index]
  const alt = getProjects(other(locale))[index]

  return [
    heading(level, project.title),
    '',
    `> ${clean(project.description)}`,
    '',
    `- ${L.author}: ${link(PERSON_NAME, absoluteUrl(homePath(locale)))} (${t(locale, 'bento.subtitle')})`,
    `- ${L.page}: ${absoluteUrl(projectPath(locale, index))}`,
    `- ${L.otherLanguage}: ${link(alt.title, absoluteUrl(projectPath(other(locale), index)))}`,
    `- ${L.type}: ${project.features}`,
    `- ${t(locale, 'project.date')}: ${project.date}`,
    `- ${t(locale, 'project.state')}: ${project.status}`,
    `- ${t(locale, 'project.technologies')}: ${project.technologies.join(', ')}`,
    `- ${L.hosting}: ${project.deploy.page || L.noDeploy}`,
    ...(project.deploy.demo ? [`- ${L.demo}: ${project.deploy.demo}`] : []),
    ...(project.github ? [`- ${L.code}: ${project.github}`] : []),
    '',
    heading(level + 1, t(locale, 'project.learn')),
    '',
    ...project.what_i_learned.map(item => `- ${clean(item)}`),
    ''
  ].join('\n')
}

/** /llms.txt following https://llmstxt.org (English, with es links). */
export function llmsTxt() {
  const job = getCurrentJob('en')
  const projectsEn = getProjects('en')
  const projectsEs = getProjects('es')

  return [
    `# ${PERSON_NAME}`,
    '',
    `> ${PERSON_NAME} (Rodrigo Andino) is a software professional from Argentina (${t('en', 'bento.subtitle')}), currently ${job.title} at ${job.complementary} (${job.date}). In his own words: "${clean(t('en', 'bento.description'))}"`,
    '',
    `This is his personal portfolio, bilingual: Spanish at ${SITE_URL}/ (default) and English at ${SITE_URL}/en/. Every page has a Markdown version (same URL ending in .md).`,
    '',
    '## Profile',
    '',
    ...LOCALES.flatMap(locale => [
      `- ${link(`Portfolio home (${LABELS[locale].language})`, absoluteUrl(homePath(locale)))}: bio, experience, education, skills and projects`,
      `- ${link(`Full profile in Markdown (${LABELS[locale].language})`, absoluteUrl(homeMarkdownPath(locale)))}: same content as plain Markdown`
    ]),
    `- ${link('Resume (CV)', CV_URL)}: downloadable CV (Google Drive folder)`,
    '',
    '## Projects',
    '',
    ...projectsEn.map(
      (project, index) =>
        `- ${link(project.title, absoluteUrl(projectPath('en', index)))}: ${truncate(project.description, 160)} Built with ${project.technologies.join(', ')}. Spanish: ${link(projectsEs[index].title, absoluteUrl(projectPath('es', index)))}`
    ),
    '',
    '## Contact and profiles',
    '',
    `- ${link('GitHub', SOCIAL.github)}: source code of most projects`,
    `- ${link('LinkedIn', SOCIAL.linkedin)}: professional profile`,
    `- ${link('X (Twitter)', SOCIAL.twitter)}`,
    `- ${link('Instagram', SOCIAL.instagram)}`,
    `- ${link('Email', `mailto:${EMAIL}`)}`,
    '',
    '## Optional',
    '',
    `- ${link('llms-full.txt', `${SITE_URL}/llms-full.txt`)}: full profile and every project, in English and Spanish, in a single file`,
    `- ${link('Sitemap', `${SITE_URL}/sitemap-index.xml`)}`,
    ''
  ].join('\n')
}

/** /llms-full.txt: every page of the site, both languages, one file. */
export function llmsFullTxt() {
  const sections = ['en', 'es'].flatMap(locale => [
    `# ${PERSON_NAME} (${LABELS[locale].language})`,
    '',
    homeMarkdown(locale, { level: 2 }),
    `## ${LABELS[locale].projectDetails}`,
    '',
    ...getProjects(locale).map((_, index) =>
      projectMarkdown(locale, index, { level: 3 })
    )
  ])

  return [
    `# ${PERSON_NAME}`,
    '',
    `> Full content of ${SITE_URL}/ (portfolio of ${PERSON_NAME}, ${t('en', 'bento.subtitle')}, Argentina), generated from the same data as the website. English first, then Spanish.`,
    '',
    ...sections
  ].join('\n')
}

export const markdownResponse = body =>
  new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })

export const textResponse = body =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
