import React from 'react';
import { Store, Layers, PlayCircle } from 'lucide-react';

export const flowItems = [
  '02 Vendor Dashboard',
  '03 My Products',
  '04 Add Product',
  '05 Orders',
  '06 Customers',
  '07 Inventory',
  '08 Sales Reports',
  '09 Profile & Settings',
  '10 Notifications',
  '11 Help & Support',
  '12 Logout'
];

export const VendorHeader = ({
  activeFlowItem,
  setActiveFlowItem,
  viewMode,
  setViewMode
}) => {
  return (
    <header className="bg-[#F8FAFC] border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-6 pb-2">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
              <span className="text-[#F97316]">LTS — </span>Local Trade Street
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1">
              Vendor Management System — Complete Product Flow
            </p>
          </div>

          {/* View Mode Switcher Toggle */}
          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'canvas'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Figma Canvas View</span>
            </button>

            <button
              onClick={() => setViewMode('live')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'live'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Interactive Live App</span>
            </button>
          </div>
        </div>

        {/* Primary Flow Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider mb-2.5 block">
            PRIMARY FLOW
          </span>

          <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 no-scrollbar">
            {flowItems.map((item) => {
              const isActive = activeFlowItem === item;
              const shortLabel = item.replace(/^\d+\s*•?\s*/, '');

              return (
                <button
                  key={item}
                  onClick={() => setActiveFlowItem(item)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#F97316] text-white font-bold shadow-xs'
                      : 'bg-[#FFF7ED] text-[#EA580C] hover:bg-orange-100'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
