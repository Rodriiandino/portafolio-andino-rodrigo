import type { APIRoute } from 'astro'
import { llmsFullTxt, textResponse } from '../lib/markdown.js'

export const prerender = true

export const GET: APIRoute = () => textResponse(llmsFullTxt())
