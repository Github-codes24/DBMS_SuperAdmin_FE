import { useState } from 'react'
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Layers,
} from 'lucide-react'
import ResponsiveLayout from '../../components/layout/ResponsiveLayout'
import { useTheme } from '../../context'
import { useToast } from '../../context'
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  LoadingButton,
} from '../../components/ui/buttons'
import {
  TextInput,
  Checkbox,
  RadioButton,
  ToggleSwitch,
} from '../../components/ui/forms'
import { StatusBadge, StatisticsCard } from '../../components/data-display'
import { type ThemeMode } from '../../context/theme.types'
import './themeSettings.css'

export function ThemeSettingsPage() {
  const {
    mode,
    effectiveMode,
    colorId,
    customColor,
    primaryColor,
    isDirty,
    presets,
    setMode,
    setColorId,
    setCustomColor,
    applyTheme,
    resetToDefault,
    cancelPreview,
  } = useTheme()

  const { toast } = useToast()

  // Local state for interactive preview elements
  const [previewTab, setPreviewTab] = useState<'overview' | 'components' | 'tables'>('overview')
  const [previewCheckbox, setPreviewCheckbox] = useState(true)
  const [previewRadio, setPreviewRadio] = useState('option1')
  const [previewSwitch, setPreviewSwitch] = useState(true)
  const [customHex, setCustomHex] = useState(customColor)

  const handleApply = () => {
    applyTheme()
    toast.success('Theme preferences applied and saved to your device.')
  }

  const handleReset = () => {
    resetToDefault()
    setCustomHex('#f96321')
    toast.info('Theme preferences reset to default DBMS Orange light mode.')
  }

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex)
    setCustomColor(hex)
  }

  const modeOptions: { id: ThemeMode; title: string; desc: string; icon: typeof Sun }[] = [
    {
      id: 'light',
      title: 'Light Mode',
      desc: 'Clean, high-clarity day appearance',
      icon: Sun,
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      desc: 'Restful, contrast-optimized night mode',
      icon: Moon,
    },
    {
      id: 'system',
      title: 'System Default',
      desc: 'Syncs automatically with device OS',
      icon: Monitor,
    },
  ]

  const headerActions = (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <SecondaryButton
        icon={<RotateCcw size={15} />}
        onClick={handleReset}
      >
        Reset Default
      </SecondaryButton>
      {isDirty && (
        <SecondaryButton
          icon={<X size={15} />}
          onClick={cancelPreview}
        >
          Cancel
        </SecondaryButton>
      )}
      <PrimaryButton
        icon={<Save size={15} />}
        onClick={handleApply}
        disabled={!isDirty}
      >
        Apply Theme
      </PrimaryButton>
    </div>
  )

  return (
    <ResponsiveLayout
      title="Appearance & Theme Settings"
      description="Personalize the application mode, primary brand colors, and component accents across the entire platform in real-time."
      icon={<Palette size={24} />}
      headerActions={headerActions}
    >
      <div className="theme-settings-container">
        <div className="theme-settings-grid">
          {/* ════ LEFT COLUMN: SETTINGS CONTROLS ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Mode selection card */}
            <section className="theme-card" aria-label="Theme mode selection">
              <div className="theme-card-header">
                <div>
                  <h2>
                    <Sun size={18} /> Application Mode
                  </h2>
                  <p>Choose between light, dark, or system-matching appearances.</p>
                </div>
                <StatusBadge
                  status={effectiveMode === 'dark' ? 'Dark Active' : 'Light Active'}
                  variant="primary"
                  size="sm"
                />
              </div>

              <div className="theme-mode-options">
                {modeOptions.map((opt) => {
                  const Icon = opt.icon
                  const isActive = mode === opt.id
                  return (
                    <div
                      key={opt.id}
                      role="button"
                      tabIndex={0}
                      className={`theme-mode-card${isActive ? ' theme-mode-card--active' : ''}`}
                      onClick={() => setMode(opt.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setMode(opt.id)
                      }}
                      aria-pressed={isActive}
                    >
                      <div className="theme-mode-icon">
                        <Icon size={20} />
                      </div>
                      <span className="theme-mode-title">{opt.title}</span>
                      <span className="theme-mode-desc">{opt.desc}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Primary color selection card */}
            <section className="theme-card" aria-label="Primary theme color palette">
              <div className="theme-card-header">
                <div>
                  <h2>
                    <Sparkles size={18} /> Primary Theme Accent
                  </h2>
                  <p>
                    Select a curated brand palette or pick a custom hex color. Updates
                    navigation, buttons, badges, and focus rings.
                  </p>
                </div>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: primaryColor,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  }}
                  title={`Active primary: ${primaryColor}`}
                />
              </div>

              <div className="theme-palette-grid">
                {presets.map((preset) => {
                  const isActive = colorId === preset.id
                  return (
                    <div
                      key={preset.id}
                      role="button"
                      tabIndex={0}
                      className={`theme-swatch-card${isActive ? ' theme-swatch-card--active' : ''}`}
                      onClick={() => setColorId(preset.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setColorId(preset.id)
                      }}
                      aria-pressed={isActive}
                    >
                      <div
                        className="theme-swatch-circle"
                        style={{ background: preset.previewGradient }}
                      >
                        {isActive && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="theme-swatch-info">
                        <span className="theme-swatch-name">{preset.name}</span>
                        <span className="theme-swatch-hex">{preset.hex}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Custom Color Picker */}
              <div className="theme-custom-picker">
                <div className="theme-color-input-wrap">
                  <input
                    type="color"
                    className="theme-color-native-input"
                    value={customHex}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    aria-label="Pick custom color"
                  />
                </div>
                <div className="theme-custom-details">
                  <label htmlFor="custom-hex-field">Custom Accent Color</label>
                  <div className="theme-custom-hex-input">
                    <input
                      id="custom-hex-field"
                      type="text"
                      maxLength={7}
                      value={customHex}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      placeholder="#f96321"
                    />
                    <SecondaryButton
                      size="sm"
                      onClick={() => handleCustomColorChange(customHex)}
                    >
                      Set Custom
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ════ RIGHT COLUMN: REAL-TIME COMPONENT PREVIEW ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section className="theme-card theme-preview-card" aria-label="Theme live preview">
              <div className="theme-card-header">
                <div>
                  <h2>
                    <SlidersHorizontal size={18} /> Live Component Preview
                  </h2>
                  <p>
                    Inspect how buttons, inputs, tabs, and cards render under the selected
                    theme in real-time.
                  </p>
                </div>
                <span className="theme-preview-badge">
                  <Sparkles size={12} /> Instant Dynamic Reflection
                </span>
              </div>

              {/* Snippet: Tabs */}
              <div className="theme-preview-snippet">
                <span className="theme-preview-snippet-title">Navigation Tabs</span>
                <div className="theme-preview-tabs">
                  <button
                    type="button"
                    className={`theme-preview-tab${previewTab === 'overview' ? ' theme-preview-tab--active' : ''}`}
                    onClick={() => setPreviewTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    className={`theme-preview-tab${previewTab === 'components' ? ' theme-preview-tab--active' : ''}`}
                    onClick={() => setPreviewTab('components')}
                  >
                    Components
                  </button>
                  <button
                    type="button"
                    className={`theme-preview-tab${previewTab === 'tables' ? ' theme-preview-tab--active' : ''}`}
                    onClick={() => setPreviewTab('tables')}
                  >
                    Tables & Data
                  </button>
                </div>
              </div>

              {/* Snippet: Buttons */}
              <div className="theme-preview-snippet">
                <span className="theme-preview-snippet-title">Buttons & Action Elements</span>
                <div className="theme-preview-buttons-row">
                  <PrimaryButton size="sm">Primary Action</PrimaryButton>
                  <SecondaryButton size="sm">Secondary</SecondaryButton>
                  <DangerButton size="sm">Destructive</DangerButton>
                  <LoadingButton size="sm" isLoading={false}>
                    Button
                  </LoadingButton>
                </div>
              </div>

              {/* Snippet: Inputs & Form Controls */}
              <div className="theme-preview-snippet">
                <span className="theme-preview-snippet-title">Form Controls & Focus States</span>
                <div className="theme-preview-inputs-row">
                  <TextInput
                    size="sm"
                    label="Sample Input"
                    placeholder="Focus to see themed border..."
                    defaultValue="Platform User Account"
                  />
                  <TextInput
                    size="sm"
                    label="Themed Dropdown / Select"
                    readOnly
                    value="Selected Organization Option"
                  />
                </div>

                <div className="theme-preview-controls-row">
                  <Checkbox
                    id="theme-preview-checkbox"
                    label="Active Checkbox"
                    checked={previewCheckbox}
                    onChange={(e) => setPreviewCheckbox(e.target.checked)}
                  />
                  <RadioButton
                    id="theme-preview-radio1"
                    name="theme-preview-radio"
                    value="option1"
                    label="Radio Option"
                    checked={previewRadio === 'option1'}
                    onChange={() => setPreviewRadio('option1')}
                  />
                  <ToggleSwitch
                    id="theme-preview-switch"
                    label="Feature Toggle"
                    checked={previewSwitch}
                    onChange={setPreviewSwitch}
                  />
                </div>
              </div>

              {/* Snippet: Cards & Badges */}
              <div className="theme-preview-snippet">
                <span className="theme-preview-snippet-title">KPI Metric & Status Cards</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <StatisticsCard
                    title="Active Sessions"
                    value="1,428"
                    icon={<Layers size={18} />}
                    trend={{ value: '+12.5%', direction: 'up', label: 'vs last week' }}
                  />
                  <StatisticsCard
                    title="System Health"
                    value="99.98%"
                    icon={<CheckCircle2 size={18} />}
                    tone="green"
                  />
                </div>
              </div>

              {/* Snippet: Table row & pagination */}
              <div className="theme-preview-snippet">
                <span className="theme-preview-snippet-title">Table Row & Pagination</span>
                <div
                  style={{
                    border: '1px solid var(--border-color-default, #e2e8f0)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: 'var(--color-bg-surface-subtle, #f1f5f9)',
                          textAlign: 'left',
                        }}
                      >
                        <th style={{ padding: '8px 12px', fontWeight: 600 }}>Module</th>
                        <th style={{ padding: '8px 12px', fontWeight: 600 }}>Role</th>
                        <th style={{ padding: '8px 12px', fontWeight: 600 }}>Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        style={{
                          borderTop: '1px solid var(--border-color-default, #e2e8f0)',
                          background: 'var(--color-bg-surface, #ffffff)',
                        }}
                      >
                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>User Management</td>
                        <td style={{ padding: '8px 12px' }}>Super Admin</td>
                        <td style={{ padding: '8px 12px' }}>
                          <StatusBadge status="Full Access" variant="primary" size="sm" />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Mini pagination indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--card-bg, #ffffff)',
                      borderTop: '1px solid var(--border-color-default, #e2e8f0)',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      Showing 1 of 12 records
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          background: 'var(--color-primary)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        1
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color-default)',
                          color: 'var(--color-text-secondary)',
                          fontSize: '11px',
                        }}
                      >
                        2
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}

export default ThemeSettingsPage

