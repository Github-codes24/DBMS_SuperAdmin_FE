import { type LucideIcon } from 'lucide-react'

export interface TabItem {
  id: string
  label: string
  icon?: LucideIcon
  count?: number
  disabled?: boolean
}

interface TabNavigationProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function TabNavigation({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabNavigationProps) {
  return (
    <div className={`app-tabs ${className}`} role="tablist" aria-label="Sections">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            className={`app-tab-button ${isActive ? 'app-tab-button--active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="app-tab-badge">{tab.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default TabNavigation

