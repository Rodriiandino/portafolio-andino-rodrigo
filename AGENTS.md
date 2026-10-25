# AGENTS.md

Portafolio personal de **Rodrigo Agustín Andino** (Tech Lead & Full Stack Developer, Argentina).
Sitio estático bilingüe (es/en) hecho con Astro 5 + islas de Preact, desplegado en Vercel.

- Producción: https://portafolio-andino-rodrigo.vercel.app
- Repo: https://github.com/Rodriiandino/portafolio-andino-rodrigo (push a `main` = deploy en Vercel)
- El contenido (textos, proyectos, experiencia) es **dato**, no código: casi todo cambio cae en `src/data/*.json` o `src/i18n/ui.js`.

## Comandos

```bash
npm install            # node_modules no está versionado; instalar antes de build/dev
npm run dev            # http://localhost:4321  (es en /, en en /en)
npm run build          # astro build -> dist/ (estático, adapter Vercel)
npm run preview        # sirve el build
npm run check:content  # valida paridad es/en, slugs e imágenes. Correrlo tras CUALQUIER cambio de contenido
npm run lint           # ESLint 10 (flat config: eslint.config.js) con reglas de Astro
npm run format         # prettier (comillas simples, sin punto y coma, sin trailing commas)
```

No hay tests. La verificación mínima es `npm run check:content && npm run lint && npm run build`, y para cambios de UI, probar la galería en el navegador (ver "Trampas").

Node: `engines.node` = `24.x` (Astro 7 pide >= 22.23.4; Vercel toma esta versión del `package.json`).

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Astro 7 (`output: 'static'`, `@astrojs/vercel`), `ClientRouter` (view transitions) |
| Islas | Preact 10 (`.jsx`). Solo `ProjectsGallery` se hidrata (`client:visible`). **No subir a Preact 11**: con `@astrojs/preact` 6.1 la isla no hidrata y no da ningún error |
| Estilos | CSS plano: `<style>` scoped en cada `.astro` + tokens globales en `src/layouts/Layout.astro`. **Sin Tailwind** |
| Fuente | `@fontsource-variable/onest` |
| Galería | PhotoSwipe 5 (`src/load-gallery.js`, `#my-gallery` en la página de proyecto) |
| SEO | `src/components/SEO.astro`, `@astrojs/sitemap` con i18n, `public/robots.txt` |
| Lenguaje | JS + TS en el frontmatter de `.astro` (`astro/tsconfigs/base`, `jsxImportSource: preact`) |

## Mapa

```
src/
  pages/
    index.astro, en/index.astro           -> ambos renderizan components/page/Page.astro
    projects/[title].astro                -> detalle es (getStaticPaths sobre projects_es.json)
    en/projects/[title].astro             -> detalle en (getStaticPaths sobre projects_en.json)
  components/
    page/Page.astro                       -> home + <title>/<meta description> por idioma (hardcodeados)
    page/Project.astro                    -> página de detalle de proyecto + su lógica cliente
    Bento, Experience, Skills, Contact, Nav, Header, Footer (.astro)
    Projects/ProjectsGallery.jsx, ProjectsGalleryCard.jsx (Preact) + styles/*.css
    dom/*.js                              -> JS vanilla de cada sección (tema, nav, bento, skills)
    icons/icons.jsx, hooks/, utils/convert_title_to_url.js
  data/
    projects_es.json / projects_en.json   -> proyectos (mismo orden en ambos)
    experience_es.json / experience_en.json
    skills.js                             -> sección Tecnologías (frontEnd/backEnd/databases/else, SVG inline)
  i18n/ui.js, i18n/utils.js               -> strings de UI + useTranslations(lang)
  assets/                                 -> imágenes optimizadas (bento, contacto, projects/*)
public/                                   -> favicons, og-image, portadas de proyectos, manifest, robots
scripts/check-content.mjs                 -> validador de contenido
```

## Reglas de contenido (lo que se rompe si no las seguís)

**Proyectos** (`src/data/projects_{es,en}.json`)
- Ambos archivos tienen los mismos proyectos **en el mismo orden**: el índice `i` en es es la traducción del índice `i` en en. La galería muestra primero los destacados y después el orden del array (lo más nuevo primero), 6 por defecto. Ojo: `sortAndFilterProjects` ordena por `images[0].height/width`, campos que no existen en el JSON, así que todos valen 1 y el sort estable conserva el orden del array.
- Campos: `title, description, what_i_learned[], features, date, technologies[], status, deploy{page, demo}, github, images[{src, alt}]`. Sin `github`/`demo` → `""`, nunca `null`.
- El slug de la URL sale del `title` vía `convert_title_to_url.js` (minúsculas, espacios → `-`, se descarta todo lo que no sea `[a-z0-9-]`). **Renombrar un título cambia su URL** y rompe links/SEO. El slug es y en son distintos porque los títulos están traducidos.
- Imágenes en **dos lugares** con la misma ruta relativa:
  - `src/assets/projects/<dir>/<dir>_N.webp`: todas. La página de detalle las resuelve con `import.meta.glob`.
  - `public/projects/<dir>/<dir>_1.webp`: **solo la portada** (primera imagen). La card de la galería la carga desde `public/`.
  - En el JSON, `src` siempre es `/projects/<dir>/<archivo>.webp`.
- Formato `.webp`. La galería lee la proporción de la portada (>1.5 agrega la clase `vertical`).
- El proyecto destacado está hardcodeado por título en `ProjectsGallery.jsx` (`highlightedProjects`). Si lo renombrás, actualizalo ahí.

**Experiencia** (`src/data/experience_{es,en}.json`): `[ {education[], workExperience[]}, {professionalCourses[]} ]`, ítems `{date, title, complementary, description, link}`. Mismo largo y orden en es y en.

**Strings de UI** (`src/i18n/ui.js`): toda key existe en `es` y en `en`. `t(key)` hace fallback silencioso al español, así que una key que falta en en muestra texto en español en el sitio en inglés sin dar ningún error.

**Perfil y SEO**: el cargo y los años de experiencia se repiten en varios lugares. Cuando cambia el perfil, revisarlos todos juntos: `ui.js` (`bento.*`, `experience.description`, `contact.*`), `components/page/Page.astro` (title/description por idioma), `components/SEO.astro` (keywords, og:site_name, alt de imagen), `README.md`.

## Trampas

- **`compressHTML: true`** en `astro.config.mjs` es a propósito: el default de Astro 7 (`'jsx'`) borra los espacios entre elementos en línea (ícono + texto, links) y cambia el texto renderizado.
- **La galería puede romperse sin dar error.** Tras actualizar Astro, Preact o `@astrojs/preact`, verificá en el navegador que en `#projects` el botón "Ver Todos" pase de 6 a 16 proyectos y que el filtro por tecnología funcione. Si `<astro-island>` sigue con el atributo `ssr`, no hidrató.

- **Tema invertido**: en `Layout.astro`, los tokens bajo `[data-theme='light']` intercambian valores (`--white` es oscuro, `--light-background` es oscuro, etc.). Usá las variables semánticas (`--white`, `--black`, `--light-blue`…) tal como ya se usan; no inventes colores literales ni "arregles" los nombres sin migrar todos los componentes.
- El tema se aplica antes del paint con un script inline (localStorage `darkMode-portafolio-andino` + `prefers-color-scheme`) y se repite en cada `astro:page-load`. Todo JS vanilla nuevo debe engancharse a `astro:page-load` (el sitio usa `ClientRouter`), no solo a `DOMContentLoaded`.
- Idioma: los componentes leen `Astro.currentLocale` (es por defecto, sin prefijo). Toda ruta nueva necesita su gemela en `src/pages/en/`.
- `site` en `astro.config.mjs`, `robots.txt` y el canonical de `SEO.astro` apuntan al dominio `vercel.app`. Si se suma un dominio propio, actualizar los tres.
- `.astro/` y `dist/` son generados; no editarlos.

## Estilo de código

- Prettier: 2 espacios, `singleQuote`, `jsxSingleQuote`, sin `;`, `trailingComma: none`, `arrowParens: avoid`, ancho 80.
- Clases en BEM (`project__aside`, `aside__title`). El CSS vive junto a su componente.
- Código e identificadores en inglés; el contenido visible es bilingüe (es/en). Commits con Conventional Commits (`feat:`, `fix:`, `chore:`…).
- Accesibilidad: links externos con `target='_blank' rel='noopener noreferrer'` y `aria-label` localizado; `alt` descriptivo en toda imagen.

## Deploy

Integración Git con Vercel (cuenta personal): push a `main` = deploy de producción. No hay CI. Antes de pushear: `npm run check:content && npm run build`. Los deploys a producción y los cambios de dominio o DNS requieren pedido explícito del dueño.
