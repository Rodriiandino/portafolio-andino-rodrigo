import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import netlify from '@astrojs/netlify'

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: netlify(),
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [preact()]
})
