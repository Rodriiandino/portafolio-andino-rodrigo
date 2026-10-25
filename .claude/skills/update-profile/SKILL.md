---
name: update-profile
description: Actualiza el perfil profesional de Rodrigo en el portafolio, de forma consistente en es y en y en todos los lugares donde se repite. Cubre cargo/título, años de experiencia, bio, trabajos, estudios, cursos, stack de tecnologías, links de contacto/CV y metadatos SEO. Usala cuando el usuario diga que cambió de trabajo, de rol, terminó una carrera o un curso, quiere sumar una tecnología, actualizar el CV o "refrescar" su perfil, aunque no nombre archivos.
---

# Actualizar el perfil profesional

El perfil está repartido en varios archivos y cada texto existe en dos idiomas. El error típico es actualizar un lugar y dejar otro con el cargo o los años viejos.

## Dónde vive cada cosa

| Dato | Archivos |
| --- | --- |
| Nombre, cargo, bio corta | `src/i18n/ui.js` → `bento.title`, `bento.subtitle`, `bento.description` |
| Bio larga de Experiencia | `src/i18n/ui.js` → `experience.description` |
| Texto de Contacto | `src/i18n/ui.js` → `contact.paragraph.1..4`, `contact.btn` |
| Trabajos y estudios | `src/data/experience_{es,en}.json` → `[0].workExperience`, `[0].education` |
| Cursos | `src/data/experience_{es,en}.json` → `[1].professionalCourses` |
| Tecnologías (sección Skills) | `src/data/skills.js` → `frontEnd`, `backEnd`, `databases`, `else` (`{ name, icon }`, SVG inline con `stroke="CurrentColor"`) |
| `<title>` y description de la home | `src/components/page/Page.astro` → `locales.es` / `locales.en` |
| Keywords, og:site_name, alt de OG | `src/components/SEO.astro` |
| Redes, CV (Google Drive), email | `src/components/Bento.astro`, `Contact.astro`, `Footer.astro` (hardcodeados, repetidos) |
| README | `README.md` |

## Proceso

1. **Inventario antes de editar.** Buscá el valor viejo en todo el repo para no dejar restos:
   ```bash
   grep -rn "Full Stack Developer\|años de experiencia\|years of experience" src README.md
   ```
   (adaptá la búsqueda al dato que cambia: cargo anterior, empresa, cantidad de años, URL vieja).
2. **Editá es y en juntos.** Para cada texto en español, escribí la versión en inglés en el mismo cambio, con el mismo significado. No una traducción literal: inglés profesional y natural.
3. **Experiencia**: ítems `{date, title, complementary, description, link}`. `complementary` = empresa o institución. Lo más reciente primero. Fechas como en los ítems existentes: `"02/2026 - Actualidad"` ↔ `"02/2026 - Present"` (o solo año: `"2021 - 2025"`). Al cambiar de rol en la misma empresa, cerrá el ítem anterior (`"05/2025 - 02/2026"`) y agregá uno nuevo arriba, como ya se hizo con NotChatbot. Mismo largo y orden en es y en.
4. **SEO coherente**: si cambia el cargo o los años, actualizá también `Page.astro` (title de ~60 caracteres como máximo, description de ~155) y las keywords de `SEO.astro`. El title sigue el patrón `Rodrigo Andino | <Cargo> | <3 tecnologías clave>`.
5. **Tecnología nueva en Skills**: agregá `{ name, icon }` en la categoría correcta de `skills.js`, con un SVG 24x24 de trazo (`stroke="CurrentColor"`, `stroke-width="1.7"`, `class="responsive-svg"`), para que respete el tema. Si también aparece en el stack del bento, revisá `Bento.astro`.
6. **Links repetidos** (CV, LinkedIn, GitHub, email): cambialos en todos los componentes que los usan; buscá con `grep -rn "<url vieja>" src`.

## Tono

Primera persona, profesional y concreta: logros y responsabilidades con tecnologías, sin relleno ("apasionado", "proactivo") salvo que el usuario lo pida. Respetá el estilo de los textos existentes. No inventes métricas ni logros: si el usuario no los dio, preguntá.

## Verificar

```bash
npm run check:content
npm run build
```

Revisá `/` y `/en` en el preview: el bento (que no desborde con textos largos en mobile), la línea de tiempo de Experiencia y el `<title>` de la pestaña.
