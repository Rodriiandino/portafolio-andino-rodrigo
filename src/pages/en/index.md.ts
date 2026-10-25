import type { APIRoute } from 'astro'
import { homeMarkdown, markdownResponse } from '../../lib/markdown.js'

export const prerender = true

export const GET: APIRoute = () => markdownResponse(homeMarkdown('en'))
