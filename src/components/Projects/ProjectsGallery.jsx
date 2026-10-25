import './styles/projects-gallery.css'
import ProjectsGalleryCard from './ProjectsGalleryCard'
import convertTitleToURL from '../utils/convert_title_to_url'
import { useTranslations } from '../../i18n/utils'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

// Also read by Projects.astro to pick the larger `sizes` for the cover
export const highlightedProjects = ['Vivero Irupe - Frontend']

const ALL = 'All'
const INITIAL_LIMIT = 6
// Chips shown before "+N more": the most used technologies
const TOP_CHIPS = 8

export default function ProjectsGallery({ projects, locale }) {
  const t = useTranslations(locale)
  const [filter, setFilter] = useState(ALL)
  const [showPractice, setShowPractice] = useState(false)
  const [showAllChips, setShowAllChips] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const galleryRef = useRef(null)
  // Index of the card that should receive focus after "See all" reveals more
  const focusIndexRef = useRef(null)

  // Practice/old projects stay hidden unless the switch is on
  const pool = useMemo(
    () => (showPractice ? projects : projects.filter(p => !p.archived)),
    [projects, showPractice]
  )

  // Technologies of the visible pool, most used first
  const technologies = useMemo(() => {
    const counts = new Map()
    pool.forEach(project =>
      project.technologies.forEach(tech =>
        counts.set(tech, (counts.get(tech) ?? 0) + 1)
      )
    )
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }))
  }, [pool])

  // Hiding practice projects can remove the selected technology
  useEffect(() => {
    if (filter !== ALL && !technologies.some(tech => tech.name === filter)) {
      setFilter(ALL)
    }
  }, [technologies, filter])

  const filtered = useMemo(
    () =>
      filter === ALL
        ? pool
        : pool.filter(project => project.technologies.includes(filter)),
    [pool, filter]
  )

  const ordered = useMemo(() => {
    const highlighted = filtered.filter(p =>
      highlightedProjects.includes(p.title)
    )
    const rest = filtered.filter(p => !highlightedProjects.includes(p.title))
    return [...highlighted, ...rest]
  }, [filtered])

  const showEverything = expanded || filter !== ALL
  const visible = showEverything ? ordered : ordered.slice(0, INITIAL_LIMIT)

  useEffect(() => {
    if (focusIndexRef.current === null || !galleryRef.current) return
    const links = galleryRef.current.querySelectorAll('.item__title a')
    links[focusIndexRef.current]?.focus()
    focusIndexRef.current = null
  }, [visible.length])

  const selectedIndex = technologies.findIndex(tech => tech.name === filter)
  let chips = showAllChips ? technologies : technologies.slice(0, TOP_CHIPS)
  // Keep the selected chip visible even when the list is collapsed
  if (!showAllChips && selectedIndex >= TOP_CHIPS) {
    chips = [...chips, technologies[selectedIndex]]
  }
  const hiddenChips = technologies.length - chips.length

  const selectTechnology = name => {
    setFilter(current => (current === name ? ALL : name))
  }

  const handleLoadMore = () => {
    // The button disappears: move focus to the first newly revealed project
    focusIndexRef.current = INITIAL_LIMIT
    setExpanded(true)
  }

  return (
    <>
      <div className='projects__toolbar' data-reveal='up'>
        <div className='projects__toolbar-top'>
          <p className='projects__count' aria-live='polite' aria-atomic='true'>
            <strong>{visible.length}</strong> {t('projects.countOf')}{' '}
            {filtered.length}{' '}
            {t(
              filtered.length === 1
                ? 'projects.countLabelOne'
                : 'projects.countLabel'
            )}
          </p>

          <button
            type='button'
            role='switch'
            aria-checked={showPractice ? 'true' : 'false'}
            className='projects__switch'
            onClick={() => setShowPractice(value => !value)}
          >
            <span className='projects__switch-track' aria-hidden='true'>
              <span className='projects__switch-thumb'></span>
            </span>
            {t('projects.practiceToggle')}
          </button>
        </div>

        <div
          className='projects__chips'
          role='group'
          aria-label={t('projects.filterList')}
        >
          <button
            type='button'
            className='projects__chip'
            aria-pressed={filter === ALL ? 'true' : 'false'}
            onClick={() => setFilter(ALL)}
          >
            {t('projects.all')}
            <span className='projects__chip-count'>{pool.length}</span>
          </button>
          {chips.map(tech => (
            <button
              type='button'
              key={tech.name}
              className='projects__chip'
              aria-pressed={filter === tech.name ? 'true' : 'false'}
              onClick={() => selectTechnology(tech.name)}
            >
              {tech.name}
              <span className='projects__chip-count'>{tech.count}</span>
            </button>
          ))}
          {(hiddenChips > 0 || showAllChips) && (
            <button
              type='button'
              className='projects__chip projects__chip--more'
              aria-expanded={showAllChips ? 'true' : 'false'}
              onClick={() => setShowAllChips(value => !value)}
            >
              {showAllChips
                ? t('projects.lessTech')
                : `+${hiddenChips} ${t('projects.moreTech')}`}
            </button>
          )}
        </div>
      </div>

      <div className='projects__gallery' ref={galleryRef}>
        {visible.map(project => (
          <ProjectsGalleryCard
            key={project.title}
            title={project.title}
            description={project.description}
            image={project.cover?.src ?? project.images[0].src}
            image_srcset={project.cover?.srcset}
            image_sizes={project.cover?.sizes}
            image_width={project.cover?.width}
            image_height={project.cover?.height}
            vertical={project.cover?.vertical}
            image_alt={project.images[0].alt}
            title_url={
              locale === 'es'
                ? `/projects/${convertTitleToURL(project.title)}`
                : `/en/projects/${convertTitleToURL(project.title)}`
            }
            link_code={project.github}
            link_demo={project.deploy.demo}
            highlight={highlightedProjects.includes(project.title)}
            archived={project.archived}
            currentLocale={locale}
          />
        ))}
      </div>

      {visible.length < ordered.length && (
        <button
          type='button'
          className='projects__btn'
          onClick={handleLoadMore}
        >
          {t('projects.btn')}
        </button>
      )}
    </>
  )
}
