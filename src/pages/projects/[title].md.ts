import type { APIRoute, GetStaticPaths } from 'astro'
import { markdownResponse, projectMarkdown } from '../../lib/markdown.js'
import { getProjects, projectSlug } from '../../lib/site.js'

export const prerender = true

export const getStaticPaths = (() =>
  getProjects('es').map((project, index) => ({
    params: { title: projectSlug(project) },
    props: { index }
  }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) =>
  markdownResponse(projectMarkdown('es', props.index))
