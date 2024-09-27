export const overrides = [
  {
    extends: [
      'eslint:recommended',
      'plugin:prettier/recommended',
      'plugin:astro/recommended'
    ],
    files: ['*.astro'],
    plugins: ['astro'],
    env: {
      node: true,
      'astro/astro': true,
      es2020: true
    },
    parser: 'astro-eslint-parser',
    parserOptions: {
      parser: '@typescript-eslint/parser',
      extraFileExtensions: ['.astro'],
      sourceType: 'module'
    },
    rules: {
      'astro/no-conflict-set-directives': 'error',
      'astro/no-unused-define-vars-in-style': 'error'
    }
  },
  {
    files: ['**/*.astro/*.js', '*.astro/*.js'],
    env: {
      browser: true,
      es2020: true
    },
    parserOptions: {
      sourceType: 'module'
    },
    rules: {
      'prettier/prettier': 'error',
      'astro/known-attributes': 'warn',
      'astro/no-raw-text': 'warn',
      'astro/require-lang': 'warn',
      'astro/sort-attributes': 'warn'
    }
  }
]
