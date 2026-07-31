import React, { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Plus, X, Layers, MapPin } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import Role from './Role';
import FeatureControl from './FeatureControl';
import CustomerDatabase from './CustomerDatabase';
import VendorDatabase from './VendorDatabase';
import TelecallerManagement from './TelecallerManagement';
import AuditLogs from './AuditLogs';

// Table Component for States and Sub Category
function TableSection({ 
  title, 
  icon: IconComponent, 
  labelHeader, 
  valueHeader, 
  data, 
  onAddData 
}) {
  const containerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState('');

  // Manual scroll controls
  const handleManualScroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === 'up' ? -84 : 84;
      containerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Handle adding new data
  const handleSaveData = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCount.trim()) return;

    const isState = labelHeader.toLowerCase().includes('state');
    onAddData({
      [isState ? 'state' : 'category']: newName.trim(),
      count: newCount.trim(),
    });

    setNewName('');
    setNewCount('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
      
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent size={16} className="text-[#f26522]" />}
          <span className="text-xs font-bold text-slate-800">{title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#f26522] border border-orange-200/60">
            {data.length} Total
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Up Control */}
          <button
            onClick={() => handleManualScroll('up')}
            title="Scroll Up"
            className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <ChevronUp size={14} />
          </button>

          {/* Down Control */}
          <button
            onClick={() => handleManualScroll('down')}
            title="Scroll Down"
            className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <ChevronDown size={14} />
          </button>

          {/* Add Data Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            title={`Add ${title}`}
            className="ml-1 px-2.5 py-1 rounded-lg bg-[#f26522] hover:bg-[#e05411] text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Table Sub-Header */}
      <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 px-2">
        <span>{labelHeader}</span>
        <span>{valueHeader}</span>
      </div>

      {/* List Container */}
      <div
        ref={containerRef}
        className="h-[260px] overflow-y-auto space-y-1 pt-1 pr-1 custom-scrollbar scroll-smooth"
      >
        {data.map((row, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 px-2.5 text-xs rounded-xl transition-all border border-transparent hover:border-slate-200 hover:bg-slate-50/80 group"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#f26522] transition-colors" />
              <span className="text-slate-700 font-medium truncate">
                {row.state || row.category}
              </span>
            </div>
            <span className="font-bold text-slate-800 bg-slate-100/70 px-2 py-0.5 rounded-lg text-[11px]">
              {row.count}
            </span>
          </div>
        ))}
      </div>

      {/* Add Data Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xs overflow-hidden">
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800">Add New {title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveData} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {labelHeader} Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Enter ${labelHeader}`}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {valueHeader} Count <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500000"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer"
                >
                  Add Entry
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

function Dashboard({ initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Metrics Data
  const metrics = [
    {
      title: 'New Vendors',
      value: '48',
      badge: '10%',
      progress: 'w-[10%]',
      progressBg: 'bg-[#f26522]',
      subText: 'Total Vendors : 12356688/0',
    },
    {
      title: 'New Customers',
      value: '373',
      badge: '10%',
      progress: 'w-[10%]',
      progressBg: 'bg-sky-500',
      subText: 'Total Customers : 56975',
    },
    {
      title: 'New Vendor Request',
      value: '17',
      progress: 'w-[40%]',
      progressBg: 'bg-slate-300',
      subText: 'Total FY Requests : 5363',
    },
    {
      title: 'New Customer Queries',
      value: '0',
      progress: 'w-[5%]',
      progressBg: 'bg-slate-300',
      subText: 'Total Queries : 6',
    },
    {
      title: "Today's Vendor Audit Count",
      value: '1006',
      progress: 'w-[60%]',
      progressBg: 'bg-slate-300',
      subText: 'Pending Quality : 2290575',
    },
    {
      title: 'Online user in DMS',
      value: '149',
      badge: '101%',
      progress: 'w-full',
      progressBg: 'bg-rose-500',
      subText: 'Total User Count : 147',
    },
  ];

  // Dynamic States Table Data
  const [statesData, setStatesData] = useState([
    { state: 'Maharashtra', count: '1950958' },
    { state: 'Uttar Pradesh', count: '1280656' },
    { state: 'Tamil Nadu', count: '1175749' },
    { state: 'Gujarat', count: '1014905' },
    { state: 'Karnataka', count: '914058' },
    { state: 'Rajasthan', count: '737685' },
    { state: 'Telangana', count: '632468' },
    { state: 'West Bengal', count: '597062' },
    { state: 'Madhya Pradesh', count: '542190' },
    { state: 'Bihar', count: '498230' },
    { state: 'Punjab', count: '412090' },
    { state: 'Haryana', count: '389120' },
    { state: 'Delhi', count: '365400' },
    { state: 'Kerala', count: '341200' },
  ]);

  // Dynamic Sub Category Table Data
  const [categoryData, setCategoryData] = useState([
    { category: 'Home Appliances', count: '4207936' },
    { category: 'Architecture', count: '1190209' },
    { category: 'Medical Sector', count: '964467' },
    { category: 'Grocery', count: '872028' },
    { category: 'Education', count: '843749' },
    { category: 'Fashion Accessories', count: '834068' },
    { category: 'Home Products', count: '675391' },
    { category: 'Accommodations', count: '626849' },
    { category: 'Electronics', count: '542100' },
    { category: 'Automotive', count: '489300' },
    { category: 'Real Estate', count: '412800' },
    { category: 'Logistics & Transport', count: '378900' },
  ]);

  const handleAddState = (newItem) => {
    setStatesData((prev) => [newItem, ...prev]);
  };

  const handleAddCategory = (newItem) => {
    setCategoryData((prev) => [newItem, ...prev]);
  };

  return (
    <div className="h-screen bg-[#f4f6f9] flex flex-col font-sans text-slate-800 overflow-hidden">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row p-4 md:px-6 md:py-4 gap-6 w-full max-w-full overflow-hidden">
        
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Content */}
        <main className="flex-1 space-y-4 min-w-0 overflow-y-auto pr-1 custom-scrollbar">
          
          {activeTab === 'usermanagement' ? (
            <UserManagement />
          ) : activeTab === 'role' ? (
            <Role />
          ) : activeTab === 'feature' ? (
            <div className="space-y-4">
              <FeatureControl />
            </div>
          ) : activeTab === 'customer-db' ? (
            <div className="space-y-4">
              <CustomerDatabase />
            </div>
          ) : activeTab === 'vendor-db' ? (
            <div className="space-y-4">
              <VendorDatabase />
            </div>
          ) : activeTab === 'telecaller-mgmt' ? (
            <div className="space-y-4">
              <TelecallerManagement />
            </div>
          ) : activeTab === 'audit-logs' ? (
            <div className="space-y-4">
              <AuditLogs />
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              {/* Dashboard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Super Admin DashBoard
                  </h1>
                  <p className="text-xs text-slate-500">
                    LTS - Local Trade Street Data Management System (30/07/26)
                  </p>
                </div>
                <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 bg-orange-100 text-[#f26522] rounded-full border border-orange-200">
                  Super Admin Panel Active
                </span>
              </div>

              {/* 1. TOP METRICS GRID (6 CARDS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {metrics.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-[160px]"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block truncate">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-slate-900">
                          {item.value}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold text-white bg-rose-500 px-1 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Subtitle */}
                    <div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${item.progressBg} ${item.progress}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        {item.subText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. STATES & SUB CATEGORY TABLES & PENDING PAYMENT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* STATES TABLE */}
                <TableSection
                  title="States"
                  icon={MapPin}
                  labelHeader="State"
                  valueHeader="Vendors"
                  data={statesData}
                  onAddData={handleAddState}
                />

                {/* SUB CATEGORY TABLE */}
                <TableSection
                  title="Sub Category"
                  icon={Layers}
                  labelHeader="Sub Category"
                  valueHeader="Vendors"
                  data={categoryData}
                  onAddData={handleAddCategory}
                />

                {/* RIGHT CONTAINER: Pending Vendor Payment */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col min-h-[350px]">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pending Vendor Payment
                    </h2>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <span className="text-sm font-semibold text-slate-500 mb-1">No Pending Payments</span>
                    <span>All vendor payments are up to date.</span>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-2xs text-center my-auto">
              <h2 className="text-base font-bold text-slate-800 capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                This module is ready for integration.
              </p>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}

export default Dashboard;