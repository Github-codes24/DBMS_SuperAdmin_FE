/**
 * Theme Context Types & Color Preset Definitions
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export type ThemeColorId =
  | 'orange'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'green'
  | 'teal'
  | 'red'
  | 'custom'

export interface ThemePreset {
  id: ThemeColorId
  name: string
  hex: string
  description: string
  previewGradient: string
}

export interface ThemeSettings {
  mode: ThemeMode
  colorId: ThemeColorId
  customColor: string
}

export interface ThemeContextValue {
  mode: ThemeMode
  effectiveMode: 'light' | 'dark'
  colorId: ThemeColorId
  customColor: string
  primaryColor: string
  activeSettings: ThemeSettings
  previewSettings: ThemeSettings | null
  isDirty: boolean
  presets: ThemePreset[]
  setMode: (mode: ThemeMode) => void
  setColorId: (colorId: ThemeColorId) => void
  setCustomColor: (hex: string) => void
  previewTheme: (settings: ThemeSettings) => void
  cancelPreview: () => void
  applyTheme: (settings?: ThemeSettings) => void
  resetToDefault: () => void
}

export const THEME_COLOR_PRESETS: ThemePreset[] = [
  {
    id: 'orange',
    name: 'DBMS Orange (Default)',
    hex: '#f96321',
    description: 'Energetic brand accent with warm contrast',
    previewGradient: 'linear-gradient(135deg, #f96321, #ea580c)',
  },
  {
    id: 'blue',
    name: 'Royal Blue',
    hex: '#2563eb',
    description: 'Professional, trustworthy corporate blue',
    previewGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  {
    id: 'indigo',
    name: 'Modern Indigo',
    hex: '#4f46e5',
    description: 'Deep and balanced modern digital tech accent',
    previewGradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
  },
  {
    id: 'purple',
    name: 'Vibrant Purple',
    hex: '#7c3aed',
    description: 'Creative and premium distinctive violet',
    previewGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  {
    id: 'green',
    name: 'Emerald Green',
    hex: '#16a34a',
    description: 'Fresh, balanced and organic productivity tint',
    previewGradient: 'linear-gradient(135deg, #22c55e, #15803d)',
  },
  {
    id: 'teal',
    name: 'Ocean Teal',
    hex: '#0d9488',
    description: 'Calm, crisp cyan-teal for analytics and focus',
    previewGradient: 'linear-gradient(135deg, #14b8a6, #0f766e)',
  },
  {
    id: 'red',
    name: 'Crimson Red',
    hex: '#dc2626',
    description: 'Bold, high-impact vivid ruby accent',
    previewGradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
  },
]

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'light',
  colorId: 'orange',
  customColor: '#f96321',
}

