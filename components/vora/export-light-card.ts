import { domToBlob } from 'modern-screenshot'

const EXPORT_WIDTH = 1080
const EXPORT_HEIGHT = 1920

/** Card tokens that must travel with the offscreen export clone. */
const LC_TOKEN_PROPS = [
  '--lc-bg-0',
  '--lc-bg-1',
  '--lc-bg-mid',
  '--lc-bg-2',
  '--lc-bg-3',
  '--lc-accent',
  '--lc-text',
  '--lc-muted',
  '--lc-glow',
] as const

function slugify(sentence: string) {
  return (
    sentence
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'light'
  )
}

function waitFrames(count = 2) {
  return new Promise<void>((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve()
        return
      }
      requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function waitImages(root: HTMLElement) {
  const imgs = [...root.querySelectorAll('img')]
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>((resolve) => {
        const done = () => resolve()
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
      })
    }),
  )
}

/**
 * Resolve a CSS color (including var(--token)) against an element’s cascade.
 * getPropertyValue returns authored `var(...)` — canvas needs a real color.
 */
function resolveCssColor(against: HTMLElement, cssColor: string): string {
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = [
    'position: fixed',
    'left: -99999px',
    'top: 0',
    'width: 1px',
    'height: 1px',
    'pointer-events: none',
    `background: ${cssColor}`,
  ].join(';')
  against.appendChild(probe)
  const resolved = getComputedStyle(probe).backgroundColor.trim()
  probe.remove()
  return resolved && resolved !== 'rgba(0, 0, 0, 0)' && resolved !== 'transparent'
    ? resolved
    : cssColor
}

function readThemeId(el: HTMLElement): string {
  return (
    el.getAttribute('data-theme') ||
    el.closest('[data-sky-theme]')?.getAttribute('data-sky-theme') ||
    'default'
  )
}

/** Computed border-radius in CSS px (getComputedStyle → px). */
function readBorderRadiusPx(el: HTMLElement): number {
  const raw = getComputedStyle(el).borderTopLeftRadius || getComputedStyle(el).borderRadius
  const n = parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : 20
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, radius)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/** Bake --lc-* onto the clone so screenshot never re-inherits Default from body. */
function bakeLightCardTokens(live: HTMLElement, clone: HTMLElement) {
  const liveStyle = getComputedStyle(live)
  for (const prop of LC_TOKEN_PROPS) {
    const authored = liveStyle.getPropertyValue(prop).trim()
    if (!authored) continue
    const value = authored.includes('var(')
      ? resolveCssColor(live, authored)
      : authored
    clone.style.setProperty(prop, value)
  }
}

/**
 * Capture the on-screen card WYSIWYG, then scale the bitmap to 1080×1920.
 *
 * Never screenshot the live 3D reveal tree (preserve-3d / backface / filters) —
 * modern-screenshot returns an empty sliver. Clone into a flat offscreen host
 * at the same pixel size so typography does not reflow.
 *
 * Theme: clone leaves AppShell, so re-attach theme attrs, bake --lc-* tokens,
 * and fill canvas with a resolved color (never a hardcoded Default navy).
 */
export async function captureLightCardPng(el: HTMLElement): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }

  const rect = el.getBoundingClientRect()
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))

  const themeId = readThemeId(el)
  const fillBg = resolveCssColor(el, 'var(--lc-bg-1)')
  const radiusPx = readBorderRadiusPx(el)
  const exportRadius = radiusPx * (EXPORT_WIDTH / width)

  const host = document.createElement('div')
  host.setAttribute('data-vora-capture-host', 'true')
  host.setAttribute('data-sky-theme', themeId)
  host.style.cssText = [
    'position: fixed',
    'left: -10000px',
    'top: 0',
    `width: ${width}px`,
    `height: ${height}px`,
    'margin: 0',
    'padding: 0',
    'overflow: hidden',
    `border-radius: ${radiusPx}px`,
    'pointer-events: none',
    'z-index: 0',
    'opacity: 1',
    'transform: none',
    'filter: none',
    'isolation: auto',
    'background: transparent',
  ].join(';')

  const clone = el.cloneNode(true) as HTMLElement
  clone.setAttribute('data-theme', themeId)
  clone.setAttribute('data-sky-theme', themeId)
  clone.style.cssText = [
    clone.style.cssText,
    `width: ${width}px`,
    `height: ${height}px`,
    'max-width: none',
    'transform: none',
    'filter: none',
    'opacity: 1',
    'position: relative',
    'left: auto',
    'top: auto',
    'inset: auto',
    `border-radius: ${radiusPx}px`,
    'overflow: hidden',
    `background: ${fillBg}`,
  ].join(';')
  // After cssText — setProperty tokens (cssText alone can drop custom props)
  bakeLightCardTokens(el, clone)
  clone.dataset.capturing = 'true'

  host.appendChild(clone)
  document.body.appendChild(host)

  try {
    await waitImages(clone)
    await waitFrames(2)

    const raw = await domToBlob(clone, {
      scale: 3,
      quality: 1,
      // Transparent outside the card radius — solid fill made corners look sharp
      backgroundColor: null,
      // Same box as screen — do not invent a new layout size
      width,
      height,
    })
    if (!raw) throw new Error('Could not capture card')

    const probe = await createImageBitmap(raw)
    const looksEmpty = probe.width < width || probe.height < height * 0.75
    probe.close()
    if (looksEmpty) throw new Error('Card capture was empty')

    return await scaleBlobToExportFrame(raw, fillBg, exportRadius)
  } finally {
    host.remove()
  }
}

async function scaleBlobToExportFrame(
  blob: Blob,
  fillBg: string,
  cornerRadius: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = EXPORT_WIDTH
    canvas.height = EXPORT_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not create canvas')

    // Transparent outside — same soft corners as on-screen card
    ctx.clearRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)
    ctx.save()
    roundRectPath(ctx, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT, cornerRadius)
    ctx.clip()

    ctx.fillStyle = fillBg
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)

    // Cover 9:16 frame from a 9:16 (or near) source without letterboxing
    const srcRatio = bitmap.width / bitmap.height
    const dstRatio = EXPORT_WIDTH / EXPORT_HEIGHT
    let sx = 0
    let sy = 0
    let sw = bitmap.width
    let sh = bitmap.height
    if (Math.abs(srcRatio - dstRatio) > 0.02) {
      if (srcRatio > dstRatio) {
        sw = bitmap.height * dstRatio
        sx = (bitmap.width - sw) / 2
      } else {
        sh = bitmap.width / dstRatio
        sy = (bitmap.height - sh) / 2
      }
    }

    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)
    ctx.restore()

    const out = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png')
    })
    if (!out) throw new Error('Could not encode card')
    return out
  } finally {
    bitmap.close()
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function shareOrSaveLightCard(blob: Blob, sentence: string) {
  const filename = `vora-${slugify(sentence)}.png`
  const file = new File([blob], filename, { type: 'image/png' })

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })

  if (canShareFiles) {
    try {
      await navigator.share({
        files: [file],
        title: 'VORA',
        text: sentence,
      })
      return 'shared' as const
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled' as const
      }
      // Fall through to download
    }
  }

  downloadBlob(blob, filename)
  return 'saved' as const
}
