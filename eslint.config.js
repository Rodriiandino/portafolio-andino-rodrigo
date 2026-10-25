import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist/', '.astro/', '.vercel/', 'node_modules/', '.claude/'] },
  js.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'] ?? [],
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
      globals: { ...globals.browser, ...globals.node }
    },
    // Types like ImageMetadata are ambient (astro/client); TS already checks names
    rules: { 'no-undef': 'off' }
  },
  {
    files: ['**/*.astro/*.ts', '*.astro/*.ts'],
    languageOptions: { parser: tseslint.parser }
  },
  prettier
]
