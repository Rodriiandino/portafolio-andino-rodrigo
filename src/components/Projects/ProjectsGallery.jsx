import './styles/projects-gallery.css'
import ProjectsGalleryCard from './ProjectsGalleryCard'
import convertTitleToURL from '../utils/convert_title_to_url'
import { useTranslations } from '../../i18n/utils'
import { useState } from 'preact/hooks'

export default function ProjectsGallery({ projects, locale }) {
  const t = useTranslations(locale)
  const [limit, setLimit] = useState(6)
  const [filteredProjects, setFilteredProjects] = useState(
    projects.slice(0, limit)
  )
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('')

  const handleShowFilter = () => {
    setShowFilter(!showFilter)
  }

  const allTechnologies = projects.flatMap(project => project.technologies)
  const uniqueTechnologies = [...new Set(allTechnologies)].sort()

  const handleFilter = technology => {
    setFilter(technology)
    if (technology === 'All') {
      setFilteredProjects(projects)
      setLimit(projects.length)
    } else {
      const filteredProjects = projects.filter(project =>
        project.technologies.includes(technology)
      )
      setFilteredProjects(filteredProjects)
      setLimit(filteredProjects.length)
    }
  }

  const handleFilterClick = event => {
    const technology = event.currentTarget.dataset.technology

    handleFilter(technology)
    handleShowFilter()
  }

  const handleLoadMore = () => {
    handleFilter('All')
  }

  return (
    <>
      <header className='projects__filter'>
        <p className='projects__load-more'>
          {t('projects.loadMore')}
          <span className='projects__load-more-span'>
            {filteredProjects.length} / {projects.length}
          </span>
        </p>

        <div className='projects__filter-container'>
          {
            <p className='projects__filter-text'>
              {t('projects.filter')}{' '}
              <span className={'projects__filter-text-span'}>{filter}</span>
            </p>
          }

          <button
            className='projects__filter-button'
            onClick={handleShowFilter}
            aria-label='Filter projects'
          >
            <svg
              width='45'
              height='45'
              viewBox='0 0 45 45'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect width='45' height='45' rx='22.5' fill='#C7EEFF'></rect>
              <path
                d='M19.2353 30.0252C19.2353 29.6575 19.3438 29.3048 19.5368 29.0448C19.7299 28.7847 19.9917 28.6387 20.2647 28.6387H26.4412C26.7142 28.6387 26.976 28.7847 27.1691 29.0448C27.3621 29.3048 27.4706 29.6575 27.4706 30.0252C27.4706 30.3929 27.3621 30.7456 27.1691 31.0057C26.976 31.2657 26.7142 31.4118 26.4412 31.4118H20.2647C19.9917 31.4118 19.7299 31.2657 19.5368 31.0057C19.3438 30.7456 19.2353 30.3929 19.2353 30.0252ZM15.1176 21.7059C15.1176 21.3381 15.2261 20.9855 15.4192 20.7254C15.6122 20.4654 15.874 20.3193 16.1471 20.3193H30.5588C30.8318 20.3193 31.0937 20.4654 31.2867 20.7254C31.4798 20.9855 31.5882 21.3381 31.5882 21.7059C31.5882 22.0736 31.4798 22.4263 31.2867 22.6863C31.0937 22.9464 30.8318 23.0924 30.5588 23.0924H16.1471C15.874 23.0924 15.6122 22.9464 15.4192 22.6863C15.2261 22.4263 15.1176 22.0736 15.1176 21.7059ZM11 13.3866C11 13.0188 11.1085 12.6661 11.3015 12.4061C11.4946 12.1461 11.7564 12 12.0294 12H34.6765C34.9495 12 35.2113 12.1461 35.4044 12.4061C35.5974 12.6661 35.7059 13.0188 35.7059 13.3866C35.7059 13.7543 35.5974 14.107 35.4044 14.367C35.2113 14.627 34.9495 14.7731 34.6765 14.7731H12.0294C11.7564 14.7731 11.4946 14.627 11.3015 14.367C11.1085 14.107 11 13.7543 11 13.3866Z'
                fill='currentColor'
              ></path>
            </svg>
          </button>
        </div>

        {showFilter && (
          <div className='projects__filter-list'>
            <button
              className='projects__filter-list-item'
              onClick={handleFilterClick}
              data-technology='All'
            >
              All
            </button>
            {uniqueTechnologies.map(technology => (
              <button
                key={technology}
                data-technology={technology}
                className='projects__filter-list-item'
                onClick={handleFilterClick}
              >
                {technology}
              </button>
            ))}
          </div>
        )}
      </header>
      <div className='projects__gallery'>
        {filteredProjects.slice(0, limit).map(project => (
          <ProjectsGalleryCard
            title={project.title}
            description={project.description}
            image={project.images[0].src}
            image_alt={project.images[0].alt}
            title_url={
              locale === 'es'
                ? `/projects/${convertTitleToURL(project.title)}`
                : `/en/projects/${convertTitleToURL(project.title)}`
            }
            link_code={project.github}
            link_demo={project.deploy.demo}
          />
        ))}
      </div>

      {limit !== projects.length && (
        <button className='projects__btn' onClick={handleLoadMore}>
          {t('projects.btn')}
        </button>
      )}
    </>
  )
}
