import { getImage } from 'astro:assets'

/**
 * Build-time responsive image: resized webp variants for every width smaller
 * than the original, and the original file itself (never re-encoded or
 * upscaled) as the largest candidate. `width` picks the variant used as `src`.
 */
export async function getResponsiveImage(meta, { widths, width, quality }) {
  const smaller = widths.filter(w => w < meta.width)
  const candidates = await Promise.all(
    smaller.map(async w => {
      const image = await getImage({ src: meta, width: w, quality })
      return { src: image.src, width: w }
    })
  )
  candidates.push({ src: meta.src, width: meta.width })

  const fallback =
    candidates.find(candidate => candidate.width >= width) ??
    candidates[candidates.length - 1]

  return {
    src: fallback.src,
    srcset: candidates.map(c => `${c.src} ${c.width}w`).join(', '),
    width: meta.width,
    height: meta.height
  }
}
