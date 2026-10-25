import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import vercelAdapter from '@astrojs/vercel'

import sitemap from '@astrojs/sitemap'
import { getSitemapAlternates } from './src/lib/site.js'

const sitemapAlternates = getSitemapAlternates()

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Astro 7 defaults to 'jsx', which drops whitespace between inline elements
  compressHTML: true,
  adapter: vercelAdapter(),
  site: 'https://portafolio-andino-rodrigo.vercel.app',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    preact(),
    sitemap({
      // .md/.txt endpoints are for LLMs (linked from llms.txt), not for the sitemap
      filter: page => !/\.(md|txt)$/.test(page),
      // hreflang es/en/x-default for every page; projects are paired by
      // array index because their slugs differ per language
      serialize(item) {
        const links = sitemapAlternates.get(item.url)
        return links ? { ...item, links } : item
      }
    })
  ]
})
