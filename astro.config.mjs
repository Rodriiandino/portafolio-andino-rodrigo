import { defineConfig } from 'astro/config'
import vercelServerless from '@astrojs/vercel/serverless'
import preact from '@astrojs/preact'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercelServerless(),
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [preact()]
})
