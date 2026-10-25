# CLAUDE.md

@AGENTS.md

Todo lo de arriba (stack, mapa, reglas de contenido, trampas) aplica. Esta sección agrega solo lo específico de Claude Code.

## Cómo trabajar acá

- Hablale al usuario en español. El contenido del sitio siempre se edita en **es y en a la vez**; nunca dejes un idioma para "después".
- Ante un pedido de contenido ("agregá este proyecto", "actualizá mi experiencia", "cambiá mi cargo"), usá las skills del proyecto antes de tocar archivos a mano:
  - `/add-project`: alta, edición o reorden de proyectos (JSON es/en + imágenes en `src/assets` y `public`).
  - `/update-profile`: cargo, años de experiencia, trabajos, estudios, cursos, stack y textos SEO.
- Cerrá todo cambio con `npm run check:content` y, si tocaste código o rutas, `npm run build`. Si `node_modules` no existe, pedile al usuario que corra `! npm install` (no instales nada sin permiso).
- Para cambios visuales, levantá el sitio con el preview del navegador (`.claude/launch.json`, config `astro-dev`) y revisá **los dos temas y los dos idiomas** (`/` y `/en`), en desktop y en mobile (la página de proyecto cambia de layout por debajo de 1100px).
- No hagas push a `main` sin pedido explícito: eso dispara el deploy de producción en Vercel.

## Skills útiles ya disponibles (globales)

| Para | Skill |
| --- | --- |
| Pulido de UI, animaciones, microinteracciones | `emil-design-eng` |
| Auditoría de accesibilidad WCAG | `design:accessibility-review` |
| Performance / Core Web Vitals | `cloudflare:web-perf` |
| Textos de UI (CTAs, microcopy) | `design:ux-copy` |
| Deploy / previews en Vercel (cuenta personal: MCP `vercel-personal`) | `deploy-to-vercel` |
| Revisión de cambios antes de commitear | `code-review`, `simplify` |
| Auditoría de seguridad (headers, dependencias) | `security-audit` |

## Skills del ecosistema instaladas en el proyecto

Instaladas en `.claude/skills/` con `npx skills` (fuentes y hashes en `skills-lock.json`; actualizar con `npx skills update -p`). Usá la que corresponda según la tarea:

| Tema | Skill | Cuándo |
| --- | --- | --- |
| Astro | `astro` | Antes de tocar rutas, islas, `astro:assets`, i18n o la config de Astro 5 |
| Accesibilidad | `accessibility`, `better-accessibility` | Al crear o modificar UI: contraste, foco, teclado, ARIA, `alt`, movimiento reducido |
| SEO técnico | `seo`, `seo-audit` | Meta tags, canonical, hreflang es/en, sitemap, robots, auditorías |
| Datos estructurados | `schema` | JSON-LD (`Person`, `ProfilePage`, `CreativeWork`/`SoftwareApplication` por proyecto) |
| Visibilidad en IA (GEO) | `ai-seo`, `seo-geo` | Que ChatGPT, Claude, Gemini y Perplexity entiendan y citen el sitio: `llms.txt`, robots para bots de IA, contenido citable |
| Arquitectura del sitio | `site-architecture` | Estructura de URLs, enlazado interno, páginas nuevas |
| Performance | `core-web-vitals`, `performance` | LCP/CLS/INP, imágenes, fuentes, JS de las islas |
| Calidad general | `best-practices`, `web-quality-audit` | Auditoría integral antes de un release (`web-quality-audit/scripts/analyze.sh` es de solo lectura y requiere `jq`) |
| Diseño | `frontend-design`, `web-design-guidelines` | Secciones nuevas, rediseños, revisión de UI |

Notas:
- Los scripts de `seo-geo` usan la API paga de DataForSEO (`DATAFORSEO_LOGIN`/`DATAFORSEO_PASSWORD`). Sin credenciales, usá solo sus guías y referencias. No los corras sin que el usuario lo pida.
- No se instaló ninguna skill de Preact: las disponibles tienen muy poca adopción, y acá Preact se usa solo en la galería.

## Visibilidad para crawlers de IA

El sitio está en `*.vercel.app`, **no detrás de Cloudflare**, así que hoy no aplican AI Crawl Control, Markdown for Agents ni el robots.txt administrado con Content Signals: todos necesitan el dominio proxiado por Cloudflare (dominio propio con DNS en Cloudflare). Mientras tanto, la visibilidad se resuelve en el repo: `public/robots.txt` con bots de IA explícitos y la línea `Content-Signal`, `llms.txt`/`llms-full.txt` generados desde los JSON, versiones Markdown de las páginas y JSON-LD. Para la parte de Cloudflare, usá el plugin global `cloudflare` (skills `cloudflare`, `cf-cli`, `web-perf`).

## MCP

- `.mcp.json` registra el MCP oficial de la documentación de Astro (`astro-docs`). Consultalo antes de usar APIs de Astro que no conozcas bien: el proyecto está en Astro 7 y la API cambió mucho entre versiones (por ejemplo, `ViewTransitions` pasó a `ClientRouter`).
- Vercel: usá solo `vercel-personal` (este es un proyecto personal). Nunca la cuenta de trabajo.
