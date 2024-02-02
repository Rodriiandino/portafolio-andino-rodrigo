import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import vercel from '@astrojs/vercel/static'

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [preact()]
})
