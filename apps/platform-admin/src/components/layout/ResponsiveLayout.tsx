import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import TopNavbar from './TopNavbar'
import Sidebar, { type NavigationItem } from './Sidebar'
import PageHeader from './PageHeader'
import PageContainer from './PageContainer'
import Footer from './Footer'
import './layout.css'

export interface ResponsiveLayoutProps {
  children?: ReactNode
  title?: string
  description?: string
  icon?: ReactNode
  headerActions?: ReactNode
  breadcrumbs?: boolean
  containerVariant?: 'boxed' | 'fluid'
  navigationItems?: NavigationItem[]
  showFooter?: boolean
}

export function ResponsiveLayout({
  children,
  title,
  description,
  icon,
  headerActions,
  breadcrumbs = false,
  containerVariant = 'fluid',
  navigationItems,
  showFooter = true,
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="app-layout-workspace">
        {/* Responsive Sidebar (Desktop inline + Mobile/Tablet Drawer) */}
        <Sidebar
          items={navigationItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="app-layout-main" role="main">
          <PageContainer variant={containerVariant}>
            {title && (
              <PageHeader
                title={title}
                description={description}
                icon={icon}
                breadcrumbs={breadcrumbs}
                actions={headerActions}
              />
            )}

            {/* Render children or nested Router Outlet */}
            {children ?? <Outlet />}

            {/* Global Footer */}
            {showFooter && <Footer />}
          </PageContainer>
        </main>
      </div>
    </div>
  )
}

export const AppLayout = ResponsiveLayout
export default ResponsiveLayout

