import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  BarChart3,
  UserCheck,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export const sidebarMenuItems = [
  { id: '02 Vendor Dashboard', label: 'Vendor Dashboard', icon: LayoutDashboard },
  {
    id: 'products_group',
    label: 'My Products',
    icon: Package,
    subItems: [
      { id: '03 My Products', label: 'All Products', icon: Package },
      { id: '04 Add Product', label: 'Add Product', icon: PlusCircle },
      { id: 'categories_screen', label: 'Categories', icon: FolderTree }
    ]
  },
  { id: '05 Orders', label: 'Orders', icon: ShoppingBag },
  { id: '06 Customers', label: 'Customer Database', icon: Users },
  { id: '07 Inventory', label: 'Vendor Database', icon: Boxes },
  { id: '08 Sales Reports', label: 'Sales Reports', icon: BarChart3 },
  { id: '09 Profile & Settings', label: 'Profile & Settings', icon: UserCheck },
  { id: '10 Notifications', label: 'Notifications', icon: Bell },
  { id: '11 Help & Support', label: 'Help & Support', icon: HelpCircle },
  { id: '12 Logout', label: 'Logout', icon: LogOut }
];

export const VendorSidebar = ({ activeFlowItem, setActiveFlowItem }) => {
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <aside className="w-64 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-fit sticky top-20 flex-shrink-0 font-sans">
      {/* Sidebar Header Badge matching Netlify reference screenshot */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 px-1">
        <span className="text-[11px] font-extrabold text-[#F97316] uppercase tracking-wider">
          NAVIGATION SUITE
        </span>
        <span className="bg-[#FFF7ED] text-[#EA580C] font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase border border-orange-200/60">
          VENDOR
        </span>
      </div>

      {/* Menu Navigation List */}
      <nav className="space-y-1">
        {sidebarMenuItems.map((item) => {
          const Icon = item.icon;

          if (item.subItems) {
            const isSubActive = item.subItems.some((sub) => sub.id === activeFlowItem);
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => setProductsOpen(!productsOpen)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isSubActive
                      ? 'bg-[#FFF7ED] text-[#F97316] font-bold shadow-xs border-l-4 border-[#F97316]'
                      : 'text-[#64748B] hover:bg-slate-50 hover:text-[#172033]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSubActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {productsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {productsOpen && (
                  <div className="pl-6 space-y-1 border-l-2 border-slate-100 ml-3">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isChildActive = activeFlowItem === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveFlowItem(sub.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                            isChildActive
                              ? 'bg-orange-50 text-[#F97316] font-bold'
                              : 'text-[#64748B] hover:bg-slate-50 hover:text-[#172033]'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isChildActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {isChildActive && <ChevronRight className="w-3 h-3 text-[#F97316]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = activeFlowItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveFlowItem(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all relative ${
                isActive
                  ? 'bg-[#FFF7ED] text-[#F97316] font-bold shadow-xs border-l-4 border-[#F97316]'
                  : 'text-[#64748B] hover:bg-slate-50 hover:text-[#172033]'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom System Status Badge matching screenshot */}
      <div className="mt-6 pt-3 border-t border-slate-100 px-1">
        <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-500 font-medium space-y-1">
          <div className="flex items-center justify-between font-bold text-[#172033]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SYSTEM STATUS</span>
            </div>
            <span className="bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5 rounded font-extrabold">v2.4</span>
          </div>
          <p className="text-[9px] text-[#64748B]">All Servers Operational</p>
        </div>
      </div>
    </aside>
  );
};
