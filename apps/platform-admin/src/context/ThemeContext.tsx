import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  type ThemeMode,
  type ThemeColorId,
  type ThemeSettings,
  type ThemeContextValue,
  THEME_COLOR_PRESETS,
  DEFAULT_THEME_SETTINGS,
} from './theme.types'
import { ThemeContext } from './ThemeContextDef'
import { generateThemeShades } from '../utils/colorUtils'

const STORAGE_KEY = 'dbms_theme_preferences'

function resolveHex(colorId: ThemeColorId, customColor: string): string {
  if (colorId === 'custom') {
    return customColor || DEFAULT_THEME_SETTINGS.customColor
  }
  const preset = THEME_COLOR_PRESETS.find((p) => p.id === colorId)
  return preset ? preset.hex : DEFAULT_THEME_SETTINGS.customColor
}

function getStoredSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ThemeSettings>
      return {
        mode: parsed.mode || DEFAULT_THEME_SETTINGS.mode,
        colorId: parsed.colorId || DEFAULT_THEME_SETTINGS.colorId,
        customColor: parsed.customColor || DEFAULT_THEME_SETTINGS.customColor,
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return DEFAULT_THEME_SETTINGS
}

function saveStoredSettings(settings: ThemeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage write errors
  }
}

function applyDomTheme(settings: ThemeSettings, effectiveMode: 'light' | 'dark'): void {
  const root = document.documentElement
  const isDark = effectiveMode === 'dark'

  // Update HTML classes and attributes
  if (isDark) {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }

  // Resolve primary hex and calculate shade scale
  const primaryHex = resolveHex(settings.colorId, settings.customColor)
  const shades = generateThemeShades(primaryHex, effectiveMode)

  // Primary color tokens
  root.style.setProperty('--color-primary', shades.primary)
  root.style.setProperty('--color-primary-hover', shades.primaryHover)
  root.style.setProperty('--color-primary-active', shades.primaryActive)
  root.style.setProperty('--color-primary-50', shades.primary50)
  root.style.setProperty('--color-primary-100', shades.primary100)
  root.style.setProperty('--color-primary-200', shades.primary200)
  root.style.setProperty('--color-primary-300', shades.primary300)
  root.style.setProperty('--color-primary-400', shades.primary400)
  root.style.setProperty('--color-primary-700', shades.primary700)
  root.style.setProperty('--color-primary-800', shades.primary800)
  root.style.setProperty('--color-primary-900', shades.primary900)
  root.style.setProperty('--color-primary-alpha-10', shades.primaryAlpha10)
  root.style.setProperty('--color-primary-alpha-20', shades.primaryAlpha20)
  root.style.setProperty('--color-primary-alpha-30', shades.primaryAlpha30)
  root.style.setProperty('--shadow-brand', shades.shadowBrand)
  root.style.setProperty('--shadow-brand-hover', shades.shadowBrandHover)
  root.style.setProperty('--focus-ring', shades.focusRing)

  // Standard requested variable aliases
  root.style.setProperty('--primary-color', shades.primary)
  root.style.setProperty('--primary-hover', shades.primaryHover)
  root.style.setProperty('--primary-light', shades.primary50)

  if (isDark) {
    root.style.setProperty('--sidebar-bg', '#101726')
    root.style.setProperty('--navbar-bg', '#131b2e')
    root.style.setProperty('--page-bg', '#0b0f19')
    root.style.setProperty('--card-bg', '#131b2e')
    root.style.setProperty('--text-primary', '#f8fafc')
    root.style.setProperty('--border-color', '#28354f')
  } else {
    root.style.setProperty('--sidebar-bg', '#ffffff')
    root.style.setProperty('--navbar-bg', '#ffffff')
    root.style.setProperty('--page-bg', '#f8fafc')
    root.style.setProperty('--card-bg', '#ffffff')
    root.style.setProperty('--text-primary', '#0f172a')
    root.style.setProperty('--border-color', '#e2e8f0')
  }
}

export interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [activeSettings, setActiveSettings] = useState<ThemeSettings>(getStoredSettings)
  const [previewSettings, setPreviewSettings] = useState<ThemeSettings | null>(null)
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Listen to OS prefers-color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Current effective settings (preview takes precedence if active)
  const currentSettings = previewSettings || activeSettings

  const effectiveMode: 'light' | 'dark' = useMemo(() => {
    if (currentSettings.mode === 'system') {
      return systemIsDark ? 'dark' : 'light'
    }
    return currentSettings.mode
  }, [currentSettings.mode, systemIsDark])

  // Apply theme to DOM whenever effective settings change
  useEffect(() => {
    applyDomTheme(currentSettings, effectiveMode)
  }, [currentSettings, effectiveMode])

  const setMode = useCallback((mode: ThemeMode) => {
    setPreviewSettings((curr) => {
      const base = curr || activeSettings
      return { ...base, mode }
    })
  }, [activeSettings])

  const setColorId = useCallback((colorId: ThemeColorId) => {
    setPreviewSettings((curr) => {
      const base = curr || activeSettings
      return { ...base, colorId }
    })
  }, [activeSettings])

  const setCustomColor = useCallback((customColor: string) => {
    setPreviewSettings((curr) => {
      const base = curr || activeSettings
      return { ...base, colorId: 'custom', customColor }
    })
  }, [activeSettings])

  const previewTheme = useCallback((settings: ThemeSettings) => {
    setPreviewSettings(settings)
  }, [])

  const cancelPreview = useCallback(() => {
    setPreviewSettings(null)
  }, [])

  const applyTheme = useCallback((settingsToApply?: ThemeSettings) => {
    const nextSettings = settingsToApply || previewSettings || activeSettings
    setActiveSettings(nextSettings)
    setPreviewSettings(null)
    saveStoredSettings(nextSettings)
  }, [previewSettings, activeSettings])

  const resetToDefault = useCallback(() => {
    setActiveSettings(DEFAULT_THEME_SETTINGS)
    setPreviewSettings(null)
    saveStoredSettings(DEFAULT_THEME_SETTINGS)
  }, [])

  const isDirty = useMemo(() => {
    if (!previewSettings) return false
    return (
      previewSettings.mode !== activeSettings.mode ||
      previewSettings.colorId !== activeSettings.colorId ||
      (previewSettings.colorId === 'custom' &&
        previewSettings.customColor !== activeSettings.customColor)
    )
  }, [previewSettings, activeSettings])

  const primaryColor = useMemo(() => {
    return resolveHex(currentSettings.colorId, currentSettings.customColor)
  }, [currentSettings.colorId, currentSettings.customColor])

  const value: ThemeContextValue = {
    mode: currentSettings.mode,
    effectiveMode,
    colorId: currentSettings.colorId,
    customColor: currentSettings.customColor,
    primaryColor,
    activeSettings,
    previewSettings,
    isDirty,
    presets: THEME_COLOR_PRESETS,
    setMode,
    setColorId,
    setCustomColor,
    previewTheme,
    cancelPreview,
    applyTheme,
    resetToDefault,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider

