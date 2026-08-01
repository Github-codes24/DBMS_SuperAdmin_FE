import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, FileText, Database, Clock, PhoneCall, FolderGit2, Building2, ChevronRight, Sparkles } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

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
    <aside className="w-full md:w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 p-3.5 shrink-0 flex flex-col justify-between min-h-[calc(100vh-6rem)] h-full transition-all">
      <div>
        {/* Header Badge */}
        <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between px-2.5">
          <span className="text-[11px] font-black uppercase text-[#f26522] tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#f26522] animate-pulse" />
            Navigation Suite
          </span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-100/80 text-[#f26522] border border-orange-200/60 shadow-2xs">
            SUPER ADMIN
          </span>
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group ${
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
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
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
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="pt-3 border-t border-slate-100 px-2.5">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">System Status</div>
              <div className="text-[9px] font-semibold text-slate-400">All Servers Operational</div>
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            v2.4
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;