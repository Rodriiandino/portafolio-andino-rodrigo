import type { APIRoute } from 'astro'
import { llmsTxt, textResponse } from '../lib/markdown.js'

export const prerender = true

export const GET: APIRoute = () => textResponse(llmsTxt())
