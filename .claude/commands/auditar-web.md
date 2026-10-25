---
description: Auditoría completa del portafolio — contenido, SEO, accesibilidad y performance en paralelo
argument-hint: '[alcance opcional: una sección, un proyecto, o vacío para todo el sitio]'
allowed-tools: Agent, Read, Grep, Glob, Bash
---

Corré una auditoría del portafolio sobre este alcance: **$ARGUMENTS**
(si está vacío, auditá el sitio entero, en los dos idiomas).

Lanzá los cuatro auditores **en un solo mensaje** para que corran en paralelo:
son independientes y cada uno carga sus propias skills.

1. `auditor-contenido` — paridad es/en, imágenes, slugs, perfil coherente. Es
   el único que corre `npm run check:content`.
2. `auditor-seo` — meta tags, canonical, hreflang, JSON-LD, sitemap, llms.txt.
3. `auditor-accesibilidad` — WCAG 2.2: teclado, foco, contraste en los dos
   temas, movimiento.
4. `auditor-performance` — LCP, imágenes, fuente, isla de Preact, JS de la home.

A cada uno pasale el alcance y dos instrucciones: que **no edite archivos**
(solo reporta) y que **no levante servidores** sin pedirlo.

Cuando vuelvan los cuatro, no pegues los informes uno detrás del otro.
Sintetizá:

- **Una causa raíz, un ítem**, aunque la hayan visto varios auditores.
- **Ordenado por impacto sobre esfuerzo**, no por auditor.
- Separá lo que se arregla en minutos de lo que es un proyecto.
- Marcá en una línea lo que ya está bien resuelto.

Cerrá preguntando qué se aplica. No apliques cambios sin confirmación.
