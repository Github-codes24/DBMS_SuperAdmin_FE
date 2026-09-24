import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  FileText, 
  Database, 
  Clock, 
  PhoneCall, 
  FolderGit2, 
  Building2, 
  ChevronRight, 
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    navigate('/' + tabKey);
  };

  const navItems = [
    { key: 'dashboard', label: 'Super Admin Dashboard', icon: LayoutDashboard, badge: null },
    { key: 'usermanagement', label: 'User Management', icon: Users, badge: null },
    { key: 'role', label: 'Roles & Permissions', icon: ShieldCheck, badge: null },
    { key: 'feature', label: 'Feature Control', icon: FileText, badge: null },
    { key: 'customer-db', label: 'Customer Database', icon: Database, badge: null },
    { key: 'vendor-db', label: 'Vendor Database', icon: Building2, badge: null },
    { key: 'telecaller-mgmt', label: 'Telecaller Management', icon: PhoneCall, badge: null },
    { key: 'data-management', label: 'Data Management', icon: FolderGit2, badge: null },
    { key: 'audit-logs', label: 'Audit Logs', icon: Clock, badge: null },
  ];

  return (
    <aside className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 p-3.5 shrink-0 flex flex-col justify-between min-h-[calc(100vh-6rem)] h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-full md:w-20' : 'w-full md:w-64'}`}>
      <div>
        {/* Header & Close Button */}
        <div className="pb-3 mb-3 border-b border-slate-100 transition-all duration-300">
          {isCollapsed ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                title="Expand Sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#f26522] hover:bg-orange-50 transition-colors duration-200 cursor-pointer"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between px-1">
              <div className="flex flex-col gap-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#f26522] animate-pulse shrink-0" />
                  <span className="text-[11px] font-black uppercase text-[#f26522] tracking-wider truncate">
                    Navigation Suite
                  </span>
                </div>
                <div>
                  <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-100/80 text-[#f26522] border border-orange-200/60 shadow-2xs">
                    SUPER ADMIN
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                title="Close Sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#f26522] hover:bg-orange-50 transition-colors duration-200 cursor-pointer shrink-0"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabClick(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/10 via-orange-50 to-orange-100/50 text-[#f26522] border-l-4 border-[#f26522] shadow-2xs font-extrabold translate-x-0.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={17}
                    className={`transition-colors shrink-0 ${
                      isActive ? 'text-[#f26522]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className={`truncate transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 max-w-0 hidden' : 'opacity-100 max-w-full'}`}>
                    {item.label}
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0 transition-opacity duration-300">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          item.isHighlight
                            ? 'bg-[#f26522] text-white shadow-2xs'
                            : isActive
                            ? 'bg-orange-200/60 text-[#f26522]'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={13}
                      className={`transition-transform duration-200 ${
                        isActive
                          ? 'text-[#f26522] translate-x-0.5 opacity-100'
                          : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                      }`}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="pt-3 border-t border-slate-100 px-1 transition-all duration-300">
        <div className={`bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {!isCollapsed && (
              <div className="transition-opacity duration-300 whitespace-nowrap">
                <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">System Status</div>
                <div className="text-[9px] font-semibold text-slate-400">All Servers Operational</div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
              v2.4
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;