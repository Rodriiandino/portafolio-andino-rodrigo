import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import vercelAdapter from '@astrojs/vercel'

import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercelAdapter(),
  site: 'https://portafolio-andino-rodrigo.vercel.app/',
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
      i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en']
      }
    })
  ]
})
