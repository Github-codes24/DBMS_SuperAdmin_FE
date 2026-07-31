import React, { useState } from 'react';
import { SlidersHorizontal, Check, RefreshCw, Shield, UserCheck } from 'lucide-react';

function FeatureControl({ compact = false }) {
  const adminUsers = [
    { id: 'ADM001', name: 'Rahul Sharma', role: 'Admin' },
    { id: 'ADM002', name: 'Neha Singh', role: 'Admin' },
    { id: 'ADM003', name: 'Vikram Mehta', role: 'Admin' },
  ];

  const [selectedAdminId, setSelectedAdminId] = useState('ADM001');

  const [featuresState, setFeaturesState] = useState({
    ADM001: [
      { id: 'cust_mgmt', name: 'Customer Management', enabled: true },
      { id: 'ven_mgmt', name: 'Vendor Management', enabled: true },
      { id: 'reports', name: 'Reports', enabled: false },
      { id: 'export_data', name: 'Export Data', enabled: true },
      { id: 'bulk_upload', name: 'Bulk Upload', enabled: false },
      { id: 'telecaller_assign', name: 'Telecaller Assignment', enabled: true },
    ],
    ADM002: [
      { id: 'cust_mgmt', name: 'Customer Management', enabled: true },
      { id: 'ven_mgmt', name: 'Vendor Management', enabled: false },
      { id: 'reports', name: 'Reports', enabled: true },
      { id: 'export_data', name: 'Export Data', enabled: true },
      { id: 'bulk_upload', name: 'Bulk Upload', enabled: true },
      { id: 'telecaller_assign', name: 'Telecaller Assignment', enabled: false },
    ],
    ADM003: [
      { id: 'cust_mgmt', name: 'Customer Management', enabled: false },
      { id: 'ven_mgmt', name: 'Vendor Management', enabled: true },
      { id: 'reports', name: 'Reports', enabled: false },
      { id: 'export_data', name: 'Export Data', enabled: false },
      { id: 'bulk_upload', name: 'Bulk Upload', enabled: false },
      { id: 'telecaller_assign', name: 'Telecaller Assignment', enabled: false },
    ],
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const selectedAdmin = adminUsers.find((u) => u.id === selectedAdminId) || adminUsers[0];
  const currentFeatures = featuresState[selectedAdminId] || [];

  const handleToggle = (featureId) => {
    setFeaturesState((prev) => ({
      ...prev,
      [selectedAdminId]: prev[selectedAdminId].map((f) =>
        f.id === featureId ? { ...f, enabled: !f.enabled } : f
      ),
    }));
  };

  const handleApplyChanges = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* Title Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Feature Control
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Enable / disable modules for selected users
          </p>
        </div>

        {/* Selected Admin Pill & Dropdown */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f26522] text-white rounded-full text-xs font-bold shadow-xs">
            <span>{selectedAdmin.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer"
            >
              {adminUsers.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} • {admin.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature List Box matching mock image */}
        <div className="bg-slate-50/60 rounded-xl border border-slate-200/60 p-4 mb-4">
          <div className="grid grid-cols-2 text-[11px] font-bold uppercase text-slate-400 pb-3 border-b border-slate-200/60 tracking-wider">
            <span>FEATURE</span>
            <span className="text-right pr-2">STATUS</span>
          </div>

          <div className="divide-y divide-slate-100/80">
            {currentFeatures.map((feat) => (
              <div
                key={feat.id}
                className="grid grid-cols-2 items-center py-3 text-xs font-medium hover:bg-white/60 px-1 rounded-lg transition-colors cursor-pointer"
                onClick={() => handleToggle(feat.id)}
              >
                <span className="text-slate-800 font-semibold">{feat.name}</span>
                <div className="flex items-center justify-end gap-2 pr-2">
                  <span
                    className={`font-extrabold text-[11px] tracking-wide ${
                      feat.enabled ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {feat.enabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(feat.id);
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      feat.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 bg-white rounded-full transition-transform absolute top-0.75 ${
                        feat.enabled ? 'translate-x-4.5' : 'translate-x-0.75'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Apply Button */}
      <div className="pt-2">
        {savedMessage && (
          <div className="mb-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <Check size={14} />
            <span>Feature control changes applied successfully!</span>
          </div>
        )}

        <button
          onClick={handleApplyChanges}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}

export default FeatureControl;
