import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { VendorLogin } from './screens/VendorLogin';
import { VendorDashboard } from './screens/VendorDashboard';
import { MyProducts } from './screens/MyProducts';
import { AddProduct } from './screens/AddProduct';
import { Orders } from './screens/Orders';
import { Customers } from './screens/Customers';
import { Inventory } from './screens/Inventory';
import { SalesReports } from './screens/SalesReports';
import { ProfileSettings } from './screens/ProfileSettings';
import { Notifications } from './screens/Notifications';
import { HelpSupport } from './screens/HelpSupport';
import { VendorLogout } from './screens/VendorLogout';

export const screensList = [
  { id: '01 Vendor Login', code: '01', title: '01 • Vendor Login', subtitle: 'Secure merchant authentication', component: VendorLogin },
  { id: '02 Vendor Dashboard', code: '02', title: '02 • Vendor Dashboard', subtitle: 'Complete store performance overview', component: VendorDashboard },
  { id: '03 My Products', code: '03', title: '03 • My Products', subtitle: 'Manage active catalog and listings', component: MyProducts },
  { id: '04 Add Product', code: '04', title: '04 • Add Product', subtitle: 'Create new product listing', component: AddProduct },
  { id: '05 Orders', code: '05', title: '05 • Orders', subtitle: 'Track and fulfill customer orders', component: Orders },
  { id: '06 Customers', code: '06', title: '06 • Customers', subtitle: 'Customer database and order history', component: Customers },
  { id: '07 Inventory', code: '07', title: '07 • Inventory', subtitle: 'Stock control and reorder thresholds', component: Inventory },
  { id: '08 Sales Reports', code: '08', title: '08 • Sales Reports', subtitle: 'Revenue analytics and export reports', component: SalesReports },
  { id: '09 Profile & Settings', code: '09', title: '09 • Profile & Settings', subtitle: 'Store information and GST details', component: ProfileSettings },
  { id: '10 Notifications', code: '10', title: '10 • Notifications', subtitle: 'System alerts and order updates', component: Notifications },
  { id: '11 Help & Support', code: '11', title: '11 • Help & Support', subtitle: 'Merchant help desk and live chat', component: HelpSupport },
  { id: '12 Logout', code: '12', title: '12 • Logout', subtitle: 'Sign out and session security', component: VendorLogout }
];

export const VendorCanvasView = ({ activeFlowItem, setActiveFlowItem, onNavigateToLive }) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  // Auto-scroll to selected flow card on canvas
  useEffect(() => {
    if (activeFlowItem) {
      const sanitizedId = 'card-' + activeFlowItem.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const targetElement = document.getElementById(sanitizedId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeFlowItem]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 sm:p-6 lg:p-8 pb-20">
      {/* Floating Canvas Controls */}
      <div className="sticky top-24 z-30 mb-6 max-w-max mx-auto bg-[#172033] text-white px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-4 border border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <Layers className="w-4 h-4 text-[#F97316]" />
          <span>Figma Design System Canvas</span>
          <span className="bg-[#F97316]/20 text-[#F97316] px-2 py-0.5 rounded-full text-[10px] font-bold">12 Cards</span>
        </div>

        <div className="h-4 w-px bg-slate-700"></div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-10 text-center font-bold text-[#F97316]">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(120, zoomLevel + 10))}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Column Figma Canvas Cards Grid (Matching Reference Screenshot) */}
      <div
        className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-300 origin-top"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        {screensList.map((screen) => {
          const ScreenComp = screen.component;
          const cardId = 'card-' + screen.id.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const isActive = activeFlowItem === screen.id;

          return (
            <div
              key={screen.id}
              id={cardId}
              onClick={() => setActiveFlowItem(screen.id)}
              className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between overflow-hidden cursor-pointer ${
                isActive
                  ? 'border-[#F97316] ring-4 ring-[#F97316]/20 shadow-lg'
                  : 'border-slate-200/90 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Card Header matching Reference Image */}
              <div className="mb-4 pb-3 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#172033]">{screen.title}</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">{screen.subtitle}</p>
                </div>
                {isActive && (
                  <span className="bg-[#F97316] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {/* Card Inner Content */}
              <div className="flex-1">
                <ScreenComp
                  onNavigate={(targetScreen) => setActiveFlowItem(targetScreen)}
                  onAddProductClick={() => setActiveFlowItem('04 Add Product')}
                  onCancel={() => setActiveFlowItem('03 My Products')}
                  onSaveSuccess={() => setActiveFlowItem('03 My Products')}
                  onLoginSuccess={() => setActiveFlowItem('02 Vendor Dashboard')}
                  onRelogin={() => setActiveFlowItem('01 Vendor Login')}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom LTS DESIGN SYSTEM Orange Banner (Matching Reference Image 1 & 2) */}
      <div className="max-w-[1700px] mx-auto mt-12 bg-[#F97316] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-md uppercase tracking-wider mb-2">
            LTS DESIGN SYSTEM
          </span>
          <p className="text-xs sm:text-sm text-white/95 font-medium">
            Primary #F97316 • White / #F8FAFC backgrounds • Text #172033 • Muted #64748B • Inter • 8–16px radius • Enterprise SaaS
          </p>
        </div>
      </div>
    </div>
  );
};
