---
name: diseno-portafolio
description: Cómo escribir UI en el portafolio de Rodrigo sin romper sus convenciones — los tokens del tema invertido de Layout.astro, el sistema de animaciones de entrada por scroll (data-reveal + IntersectionObserver), las animaciones ligadas al scroll del header y del nav inferior, los scripts compatibles con ClientRouter, la isla de Preact de la galería y cómo verificar todo en un navegador real. Usala SIEMPRE que haya que crear o modificar una sección, un componente, un estilo, una animación, un color o el layout responsive, y también cuando algo "anda en dev pero no en producción", un script deja de funcionar al navegar entre páginas, o un contenido no aparece al hacer scroll.
---

# Escribir interfaz en el portafolio

Astro 7 estático + CSS plano (sin Tailwind) + una sola isla de Preact (la
galería de proyectos). El sitio tiene cinco mecanismos propios que no se
deducen leyendo un componente suelto. Esta skill trata de esos cinco.

## 1. Los colores son tokens semánticos, y el tema está invertido

Los tokens viven en `src/layouts/Layout.astro` (`:root` y `[data-theme='light']`).
En el tema claro **intercambian valores**: `--white` pasa a ser oscuro,
`--light-background` también, etc. Por eso un componente escribe
`color: var(--white)` y queda legible en los dos temas.

- Usá siempre las variables (`--white`, `--black`, `--light-blue`, `--sky-blue`,
  `--grey`…), nunca colores literales.
- No "arregles" los nombres: habría que migrar todos los componentes juntos.
- Tamaños de texto: la escala fluida `--step--2` … `--step-5` (`clamp()`), ya
  responsive. Sombras: `--shadow-elevation-low | medium | high`.

Todo cambio visual se revisa en **los dos temas y los dos idiomas** (`/` y `/en`),
en desktop y en mobile.

## 2. Las entradas por scroll son un atributo: `data-reveal`

Para que un bloque aparezca al hacer scroll alcanza con marcarlo:

```astro
<h2 data-reveal='up'>…</h2>
<li class='timeline__item' data-reveal='up'>…</li>
<div class='contact__img' data-reveal='left'>…</div>
```

Valores: `up`, `down`, `left`, `right` (dirección del **movimiento**: `left`
entra desde la derecha), `fade` y `zoom`.

El contrato tiene dos mitades y no hace falta tocar ninguna para usarlo:

- **CSS** (`Layout.astro`, bloque "Scroll reveal"): oculta
  `[data-reveal]:not([data-revealed])` **solo** bajo `html.js` y con
  `prefers-reduced-motion: no-preference`, y corre el keyframe cuando el
  elemento recibe `data-revealed`. Sin JS, con movimiento reducido o al
  imprimir, el contenido simplemente está.
- **JS** (`src/components/dom/reveal.js`): un `IntersectionObserver`
  (`threshold: 0.1`, `rootMargin` de 100 px por abajo, para que al verse ya
  esté a mitad de camino) pone `data-revealed` una sola vez por elemento.

Reglas que se rompen en silencio:

- **El escalonado es por tanda, no por posición en la página.** Los elementos
  que el observador ve entrar juntos cascadean en orden del DOM, 70 ms por
  paso, con tope de 3 pasos. Uno que entra solo aparece sin espera. Atar el
  retardo a la posición global hace que la espera crezca con el scroll
  (pasó en `Rodriiandino/rsdesign`, de donde sale este sistema: la tarjeta 27
  de `/proyectos` tardaba 2,5 s en aparecer). En mobile (≤ 768 px) no hay
  escalonado.
- **El estado vive en atributos, nunca en clases.** Preact maneja el `class` de
  las cards y borraría una clase agregada desde afuera en el próximo render.
- **Contenido que se renderiza después de la carga entra solo**: un
  `MutationObserver` observa los `[data-reveal]` nuevos (cards de "Ver todos",
  filtros, la lista de tecnologías que arma `skills-list.js` con `innerHTML`).
  No hace falta cablear nada.
- **Los keyframes animan `translate`/`scale`, no `transform`, y solo tienen
  `from`.** Con `animation-fill-mode: backwards`, al terminar el elemento vuelve
  a sus propios estilos: los `transform` de hover siguen funcionando. Si
  agregás un keyframe nuevo, respetá las tres cosas. La excepción es un
  elemento que en hover anima la **misma** propiedad individual: durante la
  entrada, la animación la pisa. Por eso los íconos de tecnologías
  (`.icon__svg`, que escalan en hover) usan `up` y no `zoom`.
- **El foco de teclado revela al instante** (`data-revealed='instant'`, sin
  animación). Esa regla tiene la misma especificidad que las de animación y va
  después: si la movés arriba, pierde y el foco anima de nuevo (ya pasó).
- **No marques contenido de arriba del todo** (el bento): ocultarlo atrasa el
  LCP y ya tiene su propia animación de carga.
- **No anides `data-reveal`**: el hijo esperaría al padre y animaría dos veces
  la misma zona.

## 3. Header y nav inferior: animaciones ligadas al scroll

`Header.astro` y `Nav.astro` usan `animation-timeline: scroll()`: el header se
desvanece y el nav inferior sube en los primeros 300 px de scroll (el nav, en
200 px por debajo de 850 px de ancho).

**Escribí siempre los longhands** (`animation-name`, `animation-timing-function`,
`animation-fill-mode`, `animation-timeline`), nunca el shorthand `animation`
junto a `animation-timeline`. Vite 8 minifica con lightningcss, que fusiona
ambos en `animation: linear both fadeOut scroll()`, un valor inválido que el
navegador descarta entero: en dev funciona y en producción el header no se
esconde nunca (fue el bug del PR #15). Para un `view()` vale lo mismo.

Si tocás esto, revisá el CSS **compilado**, no el fuente:

```bash
npm run build
grep -rhoE 'animation[^;}]*scroll\(\)[^;}]*' .vercel/output/static | sort -u
```

## 4. Todo script del cliente escucha `astro:page-load`

El sitio usa `<ClientRouter />`: al navegar no se recarga el documento y
`DOMContentLoaded` corre una sola vez en toda la sesión. Listeners, observers e
intervalos se enganchan en `astro:page-load`, y lo que quede corriendo se corta
en `astro:before-swap` (como el reloj de `bento.js` o el observador de
`reveal.js`). Ojo con duplicar listeners sobre elementos que persisten.

**Lo que el JS deja en `<html>` no sobrevive al swap.** ClientRouter copia los
atributos del `<html>` entrante, que llega tal cual lo mandó el servidor. Por
eso el script inline del `<head>` de `Layout.astro` repone en
`astro:before-swap` la clase `js` (sin ella el contenido revelado parpadea) y el
tema (`dark` + `data-theme`, si no la página vuelve a claro hasta el
`page-load`). Si agregás otra marca en `<html>`, reponela ahí mismo.

Un estilo que dependa de algo que pone el JS se prueba **navegando por un
link**, nunca recargando: recargar siempre funciona y esconde el bug.

## 5. La galería es la única isla, y es Preact 10

`ProjectsGallery.jsx` (+ `ProjectsGalleryCard.jsx`) se hidrata con
`client:visible`. No subas a Preact 11: con `@astrojs/preact` 6.1 la isla no
hidrata y no da error. `Projects.astro` calcula en build el `srcset`, el
`width`/`height` y la clase `vertical` de cada portada y solo pasa a la isla los
campos que usa; mantené ese recorte. Para hooks y renders, la skill
`vercel-react-best-practices` aplica casi entera a Preact.

## Verificar

```bash
npm run check:content && npm run lint && npm run build
npm run preview                 # en otra terminal
npm run check:reveal            # -- http://localhost:4322 si cambió el puerto
```

`check:reveal` (`scripts/check-reveal.mjs`) maneja un Chrome headless por el
protocolo de DevTools, sin instalar nada: recorre la home en es/en, desktop y
mobile, prueba "Ver todos", una ida y vuelta con ClientRouter, movimiento
reducido, sin JS, el foco de teclado y el header/nav. Correlo después de
cualquier cambio en `data-reveal`, `reveal.js`, el bloque de CSS o las
animaciones del header y el nav.

Para mirar a ojo, el preview del navegador (`.claude/launch.json`). Ojo: si el
panel del navegador está oculto, la pestaña casi no pinta frames (≈3 fps, sin
`requestAnimationFrame`) y el observador no dispara: un "no aparece" visto ahí
no prueba nada. Confirmalo con `check:reveal`.
