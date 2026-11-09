import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAdminUsers, 
  fetchAdminFeatures, 
  updateAdminFeatures, 
  toggleLocalFeature 
} from '../redux/slices/featureControlSlice';
import { SlidersHorizontal, Check, RefreshCw, UserCheck } from 'lucide-react';

function FeatureControl({ compact = false }) {
  const dispatch = useDispatch();
  const { adminUsers: apiAdmins, selectedAdminFeatures, loading, isSaving } = useSelector((state) => state.featureControl);

  const [selectedAdminId, setSelectedAdminId] = useState('ADM001');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // Sync selectedAdminId to the first admin when the list resolves
  useEffect(() => {
    if (Array.isArray(apiAdmins) && apiAdmins.length > 0 && selectedAdminId === 'ADM001' && !apiAdmins.some(a => a?.user?.userId === 'ADM001')) {
      setSelectedAdminId(apiAdmins[0]?.user?.userId);
    }
  }, [apiAdmins, selectedAdminId]);

  useEffect(() => {
    if (selectedAdminId) {
      dispatch(fetchAdminFeatures(selectedAdminId));
    }
  }, [selectedAdminId, dispatch]);

  // Map backend admin users to match legacy selector UI
  const adminUsers = Array.isArray(apiAdmins) ? apiAdmins.map((adm) => ({
    id: adm?.user?.userId,
    name: adm?.user?.fullName,
    role: adm?.user?.role === 'ADMIN' ? 'Admin' : 'Telecaller'
  })) : [];

  const selectedAdmin = adminUsers.find((u) => u.id === selectedAdminId) || { id: selectedAdminId, name: 'Loading...' };

  const featureList = [
    { id: 'customerManagement', name: 'Customer Management' },
    { id: 'vendorManagement', name: 'Vendor Management' },
    { id: 'reports', name: 'Reports' },
    { id: 'exportData', name: 'Export Data' },
    { id: 'bulkUpload', name: 'Bulk Upload' },
    { id: 'telecallerAssignment', name: 'Telecaller Assignment' },
  ];

  const currentFeatures = featureList.map((f) => ({
    id: f.id,
    name: f.name,
    enabled: Boolean(selectedAdminFeatures[f.id])
  }));

  const handleToggle = (featureId) => {
    dispatch(toggleLocalFeature(featureId));
  };

  const handleApplyChanges = () => {
    dispatch(updateAdminFeatures({ userId: selectedAdminId, features: selectedAdminFeatures }))
      .unwrap()
      .then(() => {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
      });
  };

  if (loading && (!Array.isArray(apiAdmins) || apiAdmins.length === 0)) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col items-center justify-center min-h-[300px] font-sans">
        <div className="w-8 h-8 border-4 border-[#f26522] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading admin feature settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between h-full space-y-4 animate-in fade-in duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f26522] flex items-center justify-center font-bold">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Admin Feature Control</h2>
              <p className="text-[11px] text-slate-400 font-medium">Granular feature access toggles per Admin user</p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {currentFeatures.filter((f) => f.enabled).length} / {currentFeatures.length} Active
          </span>
        </div>

        {/* Admin Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <UserCheck size={13} className="text-[#f26522]" />
            <span>Select Admin User</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {adminUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedAdminId(user.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between border cursor-pointer ${
                  selectedAdminId === user.id
                    ? 'bg-orange-50/80 text-[#f26522] border-[#f26522] shadow-2xs font-extrabold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <span className="truncate">{user.name}</span>
                <span className="text-[9px] font-mono opacity-80">{user.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Features Toggle List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentFeatures.map((f) => (
            <div
              key={f.id}
              onClick={() => handleToggle(f.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                f.enabled
                  ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-800'
                  : 'bg-slate-50/60 border-slate-200/60 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                    f.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-transparent'
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold">{f.name}</span>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  f.enabled
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {f.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save / Apply Changes Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {savedMessage ? (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
            <Check size={14} />
            <span>Feature privileges updated for {selectedAdmin.name}!</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            Changes will take effect instantly for {selectedAdmin.id}.
          </span>
        )}

        <button
          type="button"
          onClick={handleApplyChanges}
          disabled={isSaving}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={isSaving ? "animate-spin" : ""} />
          <span>{isSaving ? "Applying..." : "Apply Feature Settings"}</span>
        </button>
      </div>
    </div>
  );
}

export default FeatureControl;
