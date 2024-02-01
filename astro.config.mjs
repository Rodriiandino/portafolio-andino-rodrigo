import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
import preact from '@astrojs/preact'

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
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
