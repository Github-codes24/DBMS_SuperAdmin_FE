/**
 * Color Utilities for Dynamic Theme Generation
 */

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface HslColor {
  h: number
  s: number
  l: number
}

export function parseHex(hex: string): RgbColor {
  let cleaned = hex.trim().replace(/^#/, '')
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(cleaned, 16)
  if (isNaN(num) || cleaned.length !== 6) {
    // Fallback to default DBMS orange if invalid
    return { r: 249, g: 99, b: 33 }
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / d + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

export function adjustLightness(hex: string, deltaPercent: number): string {
  const rgb = parseHex(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const nextL = Math.max(0, Math.min(100, hsl.l + deltaPercent))
  return hslToHex(hsl.h, hsl.s, nextL)
}

export interface GeneratedThemeShades {
  primary: string
  primaryHover: string
  primaryActive: string
  primary50: string
  primary100: string
  primary200: string
  primary300: string
  primary400: string
  primary700: string
  primary800: string
  primary900: string
  primaryAlpha10: string
  primaryAlpha20: string
  primaryAlpha30: string
  shadowBrand: string
  shadowBrandHover: string
  focusRing: string
}

export function generateThemeShades(
  primaryHex: string,
  mode: 'light' | 'dark'
): GeneratedThemeShades {
  const rgb = parseHex(primaryHex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // In light mode hover is slightly darker; in dark mode hover is slightly brighter
  const hoverDelta = mode === 'dark' ? 8 : -8
  const activeDelta = mode === 'dark' ? 14 : -14

  return {
    primary: primaryHex,
    primaryHover: adjustLightness(primaryHex, hoverDelta),
    primaryActive: adjustLightness(primaryHex, activeDelta),
    primary50: hslToHex(hsl.h, Math.min(hsl.s, 95), mode === 'dark' ? 14 : 97),
    primary100: hslToHex(hsl.h, Math.min(hsl.s, 90), mode === 'dark' ? 20 : 92),
    primary200: hslToHex(hsl.h, hsl.s, mode === 'dark' ? 28 : 83),
    primary300: hslToHex(hsl.h, hsl.s, mode === 'dark' ? 38 : 72),
    primary400: hslToHex(hsl.h, hsl.s, mode === 'dark' ? 48 : 60),
    primary700: hslToHex(hsl.h, hsl.s, mode === 'dark' ? 70 : 36),
    primary800: hslToHex(hsl.h, hsl.s, mode === 'dark' ? 80 : 28),
    primary900: hslToHex(hsl.h, hsl.s, mode === 'dark' ? 90 : 18),
    primaryAlpha10: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    primaryAlpha20: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
    primaryAlpha30: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    shadowBrand: `0 4px 14px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
    shadowBrandHover: `0 6px 20px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
    focusRing: `0 0 0 2px var(--color-bg-surface), 0 0 0 4px ${primaryHex}`,
  }
}

