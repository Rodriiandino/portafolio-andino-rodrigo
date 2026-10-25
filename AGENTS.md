# AGENTS.md

Portafolio personal de **Rodrigo Agustín Andino** (Licenciado en Informática, Tech Lead, Argentina).
Sitio estático bilingüe (es/en) hecho con Astro 7 + islas de Preact, desplegado en Vercel.

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
npm run check:reveal   # con `npm run preview` levantado: animaciones por scroll en Chrome headless (ver Trampas)
npm run lint           # ESLint 10 (flat config: eslint.config.js) con reglas de Astro
npm run format         # prettier (comillas simples, sin punto y coma, sin trailing commas)
```

No hay tests unitarios. La verificación mínima es `npm run check:content && npm run lint && npm run build`; para cambios de UI, probar la galería en el navegador (ver "Trampas"), y si tocás animaciones, `npm run check:reveal` contra el preview.

Node: `engines.node` = `24.x` (Astro 7 pide >= 22.23.4; Vercel toma esta versión del `package.json`).

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Astro 7 (`output: 'static'`, `@astrojs/vercel`), `ClientRouter` (view transitions) |
| Islas | Preact 10 (`.jsx`). Solo `ProjectsGallery` se hidrata (`client:visible`). **No subir a Preact 11**: con `@astrojs/preact` 6.1 la isla no hidrata y no da ningún error |
| Estilos | CSS plano: `<style>` scoped en cada `.astro` + tokens globales en `src/layouts/Layout.astro`. **Sin Tailwind** |
| Fuente | `@fontsource-variable/onest`, solo subset latin: `@font-face` inline + `preload` en `Layout.astro` (no reimportar el paquete completo) |
| Galería | PhotoSwipe 5 (`src/load-gallery.js`, importado solo desde `Project.astro`; se inicializa en `astro:page-load`) |
| SEO | `src/components/SEO.astro`, `@astrojs/sitemap` con i18n, `public/robots.txt` |
| Lenguaje | JS + TS en el frontmatter de `.astro` (`astro/tsconfigs/base`, `jsxImportSource: preact`) |

## Mapa

```
src/
  pages/
    index.astro, en/index.astro           -> ambos renderizan components/page/Page.astro
    projects/[title].astro                -> detalle es (getStaticPaths sobre projects_es.json)
    en/projects/[title].astro             -> detalle en (getStaticPaths sobre projects_en.json)
    llms.txt.ts, llms-full.txt.ts         -> /llms.txt y /llms-full.txt (GEO, generados de los JSON)
    index.md.ts, en/index.md.ts           -> /index.md y /en/index.md (perfil completo en Markdown)
    projects/[title].md.ts (+ en/)        -> /projects/<slug>.md por proyecto e idioma
  lib/
    site.js                               -> URLs, canonical/hreflang, JSON-LD (Person, ProfilePage, WebSite, proyectos) y datos de contacto/redes
    markdown.js                           -> generadores de llms.txt, llms-full.txt y las versiones .md
  components/
    SEO.astro                             -> <head>: meta, OG, hreflang, link text/markdown y JSON-LD (usa lib/site.js)
    page/Page.astro                       -> home + <title>/<meta description> por idioma (hardcodeados)
    page/Project.astro                    -> página de detalle de proyecto + su lógica cliente
    Bento, Experience, Skills, Contact, Nav, Header, Footer (.astro)
    Projects/ProjectsGallery.jsx, ProjectsGalleryCard.jsx (Preact) + styles/*.css
    dom/*.js                              -> JS vanilla de cada sección (tema, nav, bento, skills) + reveal.js (entradas por scroll)
    icons/icons.jsx, utils/convert_title_to_url.js, utils/responsive_image.js (srcset en build)
  data/
    projects_es.json / projects_en.json   -> proyectos (mismo orden en ambos)
    experience_es.json / experience_en.json
    skills.js                             -> sección Tecnologías (frontEnd/backEnd/databases/else, SVG inline)
  i18n/ui.js, i18n/utils.js               -> strings de UI + useTranslations(lang)
  assets/                                 -> imágenes optimizadas (bento, contacto, projects/*)
public/                                   -> favicons, og-image, portadas de proyectos, manifest, robots
scripts/check-content.mjs                 -> validador de contenido
scripts/check-reveal.mjs                  -> verificación de las animaciones en Chrome headless (CDP, sin dependencias)
```

## Reglas de contenido (lo que se rompe si no las seguís)

**Proyectos** (`src/data/projects_{es,en}.json`)
- Ambos archivos tienen los mismos proyectos **en el mismo orden**: el índice `i` en es es la traducción del índice `i` en en. La galería muestra primero los destacados y después el orden del array (lo más nuevo primero), 6 por defecto. Ojo: `sortAndFilterProjects` ordena por `images[0].height/width`, campos que no existen en el JSON, así que todos valen 1 y el sort estable conserva el orden del array.
- Campos: `title, description, what_i_learned[], features, date, technologies[], status, deploy{page, demo}, github, images[{src, alt}]`. Sin `github`/`demo` → `""`, nunca `null`.
- El slug de la URL sale del `title` vía `convert_title_to_url.js` (minúsculas, espacios → `-`, se descarta todo lo que no sea `[a-z0-9-]`). **Renombrar un título cambia su URL** y rompe links/SEO. El slug es y en son distintos porque los títulos están traducidos.
- Imágenes en **dos lugares** con la misma ruta relativa:
  - `src/assets/projects/<dir>/<dir>_N.webp`: todas. La página de detalle las resuelve con `import.meta.glob`.
  - `public/projects/<dir>/<dir>_1.webp`: **solo la portada** (primera imagen). Se usa como `og:image` del proyecto (vista previa al compartir). La card de la galería usa la versión optimizada que `Projects.astro` genera desde `src/assets` en el build.
  - En el JSON, `src` siempre es `/projects/<dir>/<archivo>.webp`.
- Formato `.webp`. `Projects.astro` calcula en build el srcset, el width/height y la clase `vertical` (alto/ancho > 1.5) de cada portada; a la isla solo le pasa los campos que usa.
- El proyecto destacado está hardcodeado por título en `ProjectsGallery.jsx` (`highlightedProjects`). Si lo renombrás, actualizalo ahí.
- `archived: true` (opcional, igual en es y en) oculta un proyecto viejo o de práctica: solo aparece al activar "Ver prácticas" en la galería, con la etiqueta "Práctica". Su página de detalle sigue existiendo. Hoy: Inmobiliaria, Pokedex, Conversor y Encriptador.
- Nombres de tecnologías: el filtro agrupa por string exacto, así que reutilizá los existentes (`Tailwind CSS`, `Next.js`…).

**Experiencia** (`src/data/experience_{es,en}.json`): `[ {education[], workExperience[]}, {professionalCourses[]} ]`, ítems `{date, title, complementary, description, link}`. Mismo largo y orden en es y en.

**Strings de UI** (`src/i18n/ui.js`): toda key existe en `es` y en `en`. `t(key)` hace fallback silencioso al español, así que una key que falta en en muestra texto en español en el sitio en inglés sin dar ningún error.

**Perfil y SEO**: el cargo y los años de experiencia se repiten en varios lugares. Cuando cambia el perfil, revisarlos todos juntos: `ui.js` (`bento.*`, `experience.description`, `contact.*`), `components/page/Page.astro` (title/description por idioma), `components/SEO.astro` (keywords, og:site_name, alt de imagen), `README.md`.

**SEO/GEO generado** (`src/lib/site.js` + `src/lib/markdown.js`): no hay texto duplicado a mano; todo sale de los JSON y de `ui.js` en build.
- JSON-LD: en la home, `ProfilePage` + `Person` (`@id` `/#person`) + `WebSite`; en cada proyecto, `WebPage` + `SoftwareSourceCode` (si tiene `github`) o `CreativeWork` + `BreadcrumbList`, con `author` apuntando a `/#person`. `jobTitle`/`description` = `bento.subtitle`/`bento.description`; `worksFor` = **primer ítem** de `workExperience` (mantener el trabajo actual primero); `alumniOf` = instituciones de `education`; `knowsAbout` = `skills.js` + tecnologías de los proyectos. Redes, email y link del CV viven en `SOCIAL`/`EMAIL`/`CV_URL` de `site.js` (si cambian en Bento/Contact/Footer, cambiarlos ahí también).
- hreflang (head y sitemap): es/en/x-default; los proyectos se emparejan **por índice** entre `projects_es` y `projects_en`, por eso el orden tiene que coincidir. Canonical absoluto con barra final (igual que el sitemap).
- Endpoints estáticos: `/llms.txt`, `/llms-full.txt`, `/index.md`, `/en/index.md`, `/projects/<slug>.md`, `/en/projects/<slug>.md`. Cada página HTML enlaza su `.md` con `<link rel="alternate" type="text/markdown">`. Están excluidos del sitemap (`filter` en `astro.config.mjs`).
- `public/robots.txt`: permite todo, con grupos explícitos para bots de búsqueda/IA y `Content-Signal: search=yes, ai-input=yes, ai-train=yes`.

## Trampas

- **Animaciones ligadas al scroll: longhands, nunca el shorthand.** Vite 8 minifica con lightningcss, que fusiona `animation` + `animation-timeline: scroll()` en `animation: … scroll()`, un valor inválido que el navegador descarta: en dev anda y en producción el header no se esconde ni aparece el nav de abajo. Header y Nav usan `animation-name`/`-timing-function`/`-fill-mode`/`-timeline` por separado.
- **Entradas por scroll = `data-reveal='up|down|left|right|fade|zoom'`.** El CSS (`Layout.astro`) oculta solo con `html.js` y sin movimiento reducido; `dom/reveal.js` pone `data-revealed` con un IntersectionObserver, escalona por tanda (70 ms, tope 3 pasos, sin escalonado en mobile) y toma solo los nodos nuevos (galería, lista de tecnologías). Estado en atributos, no en clases (Preact las pisa). No marcar el bento (LCP) ni anidar `data-reveal`. Detalle en la skill `diseno-portafolio`.
- **`<html>` se reescribe en cada navegación.** ClientRouter copia los atributos del documento entrante: el script inline del `<head>` repone `js`, `dark` y `data-theme` en `astro:before-swap`. Toda marca nueva en `<html>` va ahí.
- **`compressHTML: true`** en `astro.config.mjs` es a propósito: el default de Astro 7 (`'jsx'`) borra los espacios entre elementos en línea (ícono + texto, links) y cambia el texto renderizado.
- **La galería puede romperse sin dar error.** Tras actualizar Astro, Preact o `@astrojs/preact`, verificá en el navegador que en `#projects` el botón "Ver Todos" muestre más proyectos y que el filtro por tecnología funcione (`check:reveal` lo prueba). Si `<astro-island>` sigue con el atributo `ssr`, no hidrató.
- **El panel del navegador oculto no pinta frames** (≈3 fps, sin `requestAnimationFrame`): lo animado puede verse vacío ahí sin que haya bug. Confirmá con `npm run check:reveal`.

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
