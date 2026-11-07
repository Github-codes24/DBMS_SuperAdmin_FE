/**
 * DBMS SuperAdmin Design System Tokens
 * Typed TypeScript constants matching design-tokens.css
 */

export const colors = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    DEFAULT: '#f96321', // Core DBMS Orange
    hover: '#ea580c',
    active: '#c2410c',
    700: '#9a3412',
    800: '#7c2d12',
    900: '#431407',
    alpha10: 'rgba(249, 99, 33, 0.1)',
    alpha20: 'rgba(249, 99, 33, 0.2)',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  bg: {
    canvas: '#f8fafc',
    surface: '#ffffff',
    subtle: '#f1f5f9',
    hover: '#f8fafc',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
    subtle: '#94a3b8',
    inverse: '#ffffff',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    DEFAULT: '#16a34a',
    700: '#15803d',
    alpha10: 'rgba(22, 163, 74, 0.1)',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#f59e0b',
    DEFAULT: '#d97706',
    700: '#b45309',
    alpha10: 'rgba(217, 119, 6, 0.1)',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    DEFAULT: '#dc2626',
    700: '#b91c1c',
    alpha10: 'rgba(220, 38, 38, 0.1)',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    500: '#0ea5e9',
    DEFAULT: '#0284c7',
    700: '#0369a1',
    alpha10: 'rgba(2, 132, 199, 0.1)',
  },
} as const

export const typography = {
  fonts: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  sizes: {
    '2xs': { size: '10px', leading: '14px' },
    xs: { size: '12px', leading: '16px' },
    sm: { size: '13px', leading: '18px' },
    base: { size: '14px', leading: '20px' },
    md: { size: '15px', leading: '22px' },
    lg: { size: '16px', leading: '24px' },
    xl: { size: '18px', leading: '26px' },
    '2xl': { size: '20px', leading: '28px' },
    '3xl': { size: '24px', leading: '32px' },
    '4xl': { size: '28px', leading: '36px' },
    '5xl': { size: '32px', leading: '40px' },
  },
} as const

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const

export const radii = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
  sm: '0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
  md: '0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
  lg: '0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.04)',
  xl: '0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.06)',
  '2xl': '0 25px 50px -12px rgb(15 23 42 / 0.25)',
  brand: '0 4px 14px 0 rgba(249, 99, 33, 0.22)',
  brandHover: '0 6px 20px 0 rgba(249, 99, 33, 0.32)',
} as const

export const componentSizes = {
  button: {
    sm: { height: '32px', padding: '0 10px', fontSize: '12px', gap: '6px', radius: '6px' },
    md: { height: '38px', padding: '0 14px', fontSize: '13px', gap: '8px', radius: '8px' },
    lg: { height: '44px', padding: '0 18px', fontSize: '14px', gap: '10px', radius: '8px' },
  },
  input: {
    sm: { height: '32px', padding: '0 10px', fontSize: '12px', radius: '6px' },
    md: { height: '38px', padding: '0 12px', fontSize: '14px', radius: '8px' },
    lg: { height: '44px', padding: '0 14px', fontSize: '16px', radius: '8px' },
  },
  layout: {
    navbarHeight: '60px',
    sidebarWidth: '230px',
    sidebarCollapsedWidth: '72px',
  },
} as const

export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const designTokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  componentSizes,
  breakpoints,
  transitions,
}

export type DesignTokens = typeof designTokens

