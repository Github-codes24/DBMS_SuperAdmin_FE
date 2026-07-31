import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, FileText, Database, Clock, PhoneCall } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    navigate('/' + tabKey);
  };

  return (
    <>
      <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 shrink-0 flex flex-col justify-between min-h-[calc(100vh-6rem)] h-full">
        <div>
          {/* Header Badge */}
          <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between px-2">
            <span className="text-[11px] font-extrabold uppercase text-[#f26522] tracking-wider">
              Super Admin Navigation
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[#f26522]">
              LTS DMS
            </span>
          </div>

          {/* Navigation Buttons */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={17} />
              <span>Super Admin Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('usermanagement')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'usermanagement'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={17} />
              <span>User Management</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('role')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'role'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={17} />
                <span>Roles & Permissions</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('feature')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'feature'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText size={17} />
              <span>Feature Control</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('customer-db')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'customer-db'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Database size={17} />
              <span>Customer Database</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('vendor-db')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vendor-db'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Database size={17} />
              <span>Vendor Database</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('telecaller-mgmt')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'telecaller-mgmt'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <PhoneCall size={17} />
              <span>Telecaller Management</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('audit-logs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audit-logs'
                  ? 'bg-orange-50 text-[#f26522] border-r-4 border-[#f26522]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock size={17} />
              <span>Audit Logs</span>
            </button>
          </nav>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;