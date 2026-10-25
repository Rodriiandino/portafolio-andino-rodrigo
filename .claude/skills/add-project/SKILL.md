---
name: add-project
description: Agrega, edita, reordena o quita un proyecto del portafolio de Rodrigo (src/data/projects_es.json + projects_en.json + imágenes en src/assets/projects y public/projects). Usala siempre que el usuario pida sumar un proyecto nuevo, actualizar la descripción, las tecnologías, los links, el estado o las capturas de un proyecto existente, destacar uno o cambiar el orden de la galería, aunque no nombre los archivos.
---

# Agregar o editar un proyecto del portafolio

Un proyecto vive en 4 lugares que tienen que quedar coherentes. Si falta uno, la card o la página de detalle se rompen en build o muestran contenido vacío.

| Qué | Dónde |
| --- | --- |
| Datos en español | `src/data/projects_es.json` |
| Datos en inglés | `src/data/projects_en.json` (mismo índice que es) |
| Todas las capturas | `src/assets/projects/<dir>/<dir>_N.webp` |
| Portada (solo la 1ª), para `og:image` | `public/projects/<dir>/<dir>_1.webp` |

## 1. Juntar la información

Pedí lo que falte, sin inventar. Lo mínimo: nombre, qué problema resuelve, para quién, stack, año, estado, links (repo y demo) y capturas. Si el usuario da un repo o una URL, leelos para sacar el stack real y lo aprendido. Si no hay capturas, pedilas: no se puede publicar un proyecto sin al menos una imagen.

## 2. Imágenes

- `<dir>`: snake_case corto y estable (`bp_importados`, `omni_resto`). No depende del título.
- Convertí a `.webp` si hace falta (`cwebp -q 80 in.png -o out.webp`, o `sharp`). Si la herramienta no está instalada, pedile al usuario que convierta o que autorice instalarla. Ancho razonable: ~1600px como máximo.
- La primera imagen es la portada: elegí la más representativa (home, vista principal). Copiala también a `public/projects/<dir>/`.
- La galería detecta en build las capturas verticales (alto/ancho > 1.5) y les cambia el layout de la card; también genera solas las versiones responsive (srcset). Subí la imagen original en buena resolución, sin achicarla a mano.

## 3. Entrada en el JSON (es y en)

```json
{
  "title": "Nombre | Subtítulo que explica qué es",
  "description": "1 o 2 oraciones: qué es, para quién, qué resuelve.",
  "what_i_learned": ["Logro técnico concreto con la tecnología usada", "..."],
  "features": "Características principales en una frase o lista separada por comas",
  "date": "2025",
  "technologies": ["Next.js", "TypeScript", "PostgreSQL"],
  "status": "Completo",
  "deploy": { "page": "Vercel", "demo": "https://..." },
  "github": "",
  "images": [
    { "src": "/projects/<dir>/<dir>_1.webp", "alt": "Nombre - Vista principal" }
  ]
}
```

Reglas:
- Insertá en **el mismo índice** en ambos archivos. Lo más nuevo o relevante va primero. La galería muestra primero los destacados y después el resto en el orden del array; arranca mostrando 6, así que el índice 0-5 es lo que se ve sin hacer clic en "Ver todos".
- `title` define la URL (`/projects/<slug>` y `/en/projects/<slug>`). Al **editar** un proyecto existente, no cambies el título salvo pedido explícito: rompe links y SEO. Avisá si el usuario lo pide igual.
- `technologies` usa los mismos nombres que ya existen en otros proyectos (`Next.js`, no `NextJS`): el filtro de la galería agrupa por string exacto. Revisá los existentes con `node -e 'console.log([...new Set(require("./src/data/projects_es.json").flatMap(p=>p.technologies))].sort())'`.
- `status` en el idioma de cada archivo: `Completo` ↔ `Complete`, `En Progreso` ↔ `In Progress` (en en hay proyectos viejos con `Completed`; para los nuevos usá `Complete`). `deploy.page`: `Vercel`, `Netlify`, `No Deploy` ↔ `Not Deployed`, `Aplicación de Escritorio` ↔ `Desktop Application`.
- `github` y `deploy.demo` vacíos van como `""`, idénticos en es y en.
- `src` de las imágenes idénticos en es y en; los `alt` sí se traducen.
- `what_i_learned`: 4 a 10 ítems, en tono de logro técnico (qué y con qué), igual que los existentes. Proyectos de clientes reales: sin datos sensibles.

## 4. Archivar un proyecto viejo o de práctica (opcional)

Agregá `"archived": true` en el mismo índice de es y en. Queda oculto por defecto y solo se ve con el interruptor "Ver prácticas", con la etiqueta "Práctica". Es preferible a borrarlo, porque no rompe su URL.

## 5. Destacar un proyecto (opcional)

`src/components/Projects/ProjectsGallery.jsx` → `highlightedProjects` contiene **títulos exactos** (los de es y los de en, si difieren). Si renombrás un proyecto destacado, actualizalo ahí.

## 6. Verificar

```bash
npm run check:content   # paridad, slugs, imágenes en ambos lugares
npm run build           # getStaticPaths + import.meta.glob resuelven todo
```

Si es posible, abrí el preview (`astro-dev`) y revisá la card en `/` y `/en` y la página `/projects/<slug>`, en tema claro y oscuro.

## Quitar un proyecto

Borralo del mismo índice en ambos JSON, sacalo de `highlightedProjects` si estaba, y borrá `src/assets/projects/<dir>/` y `public/projects/<dir>/` (mostrá al usuario qué se borra antes de hacerlo). Corré `check:content` y el build.
