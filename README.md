# Portafolio | Rodrigo Agustín Andino

Portafolio personal bilingüe (español / inglés) de **Rodrigo Agustín Andino**, Tech Lead & Full Stack Developer (Argentina).

- Sitio: https://portafolio-andino-rodrigo.vercel.app (español en `/`, inglés en `/en/`)
- Versión para LLMs: [`/llms.txt`](https://portafolio-andino-rodrigo.vercel.app/llms.txt)

![935shots_so](https://github.com/Rodriiandino/portafolio-andino-rodrigo/assets/106351323/e68238f9-a2e1-44fb-a015-e101541ff8b4)

## Stack

| Capa      | Tecnología                                                                             |
| --------- | -------------------------------------------------------------------------------------- |
| Framework | [Astro 7](https://astro.build) (salida estática, `ClientRouter` para view transitions) |
| Islas     | Preact 10 (solo la galería de proyectos se hidrata, con `client:visible`)              |
| Estilos   | CSS plano con estilos scoped por componente y tokens globales; tema claro y oscuro     |
| Galería   | PhotoSwipe 5 en la página de cada proyecto                                             |
| Fuente    | Onest (`@fontsource-variable/onest`, self-hosted)                                      |
| Deploy    | Vercel (`@astrojs/vercel`); headers de seguridad y caché en `vercel.json`              |

## Características

- **i18n** es/en con rutas `/` y `/en/`, strings de UI en `src/i18n/ui.js` y `hreflang` en el `<head>` y en el sitemap.
- **Contenido como datos**: proyectos y experiencia viven en `src/data/*.json` (un archivo por idioma, mismo orden), así que agregar o editar un proyecto no requiere tocar componentes.
- **Una página estática por proyecto** (`/projects/<slug>/` y `/en/projects/<slug>/`) con galería de imágenes.
- **SEO**: canonical, Open Graph, Twitter Cards, sitemap con alternates por idioma, `robots.txt` y JSON-LD (`Person`, `ProfilePage`, `WebSite`, `SoftwareSourceCode`/`CreativeWork`, `BreadcrumbList`) generado desde los mismos datos.
- **GEO (visibilidad en buscadores de IA)**: `/llms.txt`, `/llms-full.txt` y una versión Markdown de cada página (`/index.md`, `/en/index.md`, `/projects/<slug>.md`), enlazadas con `<link rel="alternate" type="text/markdown">`.
- **Accesibilidad** (WCAG 2.2): navegación por teclado, foco visible, textos alternativos, `aria-*` localizados y respeto por `prefers-reduced-motion`.
- **Modo oscuro y claro**, aplicado antes del primer paint para evitar parpadeos.

![828shots_so](https://github.com/Rodriiandino/portafolio-andino-rodrigo/assets/106351323/d727bb13-30cc-4902-9e9d-e94f0717074c)

## Desarrollo

Requiere Node 24 (ver `engines` en `package.json`).

```bash
npm install
npm run dev            # http://localhost:4321
```

| Script                                    | Qué hace                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`                             | Servidor de desarrollo                                                             |
| `npm run build`                           | Build estático (`dist/` + `.vercel/output/`)                                       |
| `npm run preview`                         | Sirve el build localmente                                                          |
| `npm run check:content`                   | Valida paridad es/en de proyectos, experiencia y textos, slugs, estados e imágenes |
| `npm run lint`                            | ESLint (flat config con reglas de Astro)                                           |
| `npm run format` / `npm run format:check` | Prettier (escribe / solo verifica)                                                 |
| `npm run check`                           | `check:content` + `lint` + `build`: la verificación completa antes de un push      |

## Estructura

```
src/
  pages/        rutas (es en la raíz, en bajo /en) + endpoints .md y llms*.txt
  components/   secciones del sitio (.astro) y la galería de proyectos (Preact)
  layouts/      layout base con tokens de tema
  lib/          site.js (URLs, hreflang, JSON-LD) y markdown.js (llms.txt y .md)
  data/         proyectos, experiencia y tecnologías
  i18n/         textos de la interfaz en es/en
scripts/        check-content.mjs
public/         favicons, imagen OG, portadas de proyectos, robots.txt
```

Las convenciones de contenido (cómo agregar un proyecto, dónde van las imágenes, qué se rompe si se renombra un título) están en [`AGENTS.md`](AGENTS.md).

![779shots_so](https://github.com/Rodriiandino/portafolio-andino-rodrigo/assets/106351323/8fcc6160-49d3-4c76-a67e-99a3a24063c0)

![854shots_so](https://github.com/Rodriiandino/portafolio-andino-rodrigo/assets/106351323/caf542a7-b2b7-49e1-b633-7432a365be22)
