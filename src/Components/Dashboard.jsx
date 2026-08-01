import React, { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Plus, X, Layers, MapPin, Filter, Check, Building2 } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import Role from './Role';
import FeatureControl from './FeatureControl';
import CustomerDatabase from './CustomerDatabase';
import VendorDatabase from './VendorDatabase';
import TelecallerManagement from './TelecallerManagement';
import AuditLogs from './AuditLogs';
import DataManagement from './DataManagement';

// Table Component for States, Category and Sub Category ⭐
function TableSection({ 
  title, 
  icon: IconComponent, 
  labelHeader, 
  valueHeader, 
  data, 
  onAddData,
  selectedItem,
  onSelectItem,
  subTextInfo
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
    <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs">
      
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {IconComponent && <IconComponent size={15} className="text-[#f26522] shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">{title}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-50 text-[#f26522] border border-orange-200/60 shrink-0 whitespace-nowrap">
                {data.length} Total
              </span>
            </div>
            {subTextInfo && (
              <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[90px] xl:max-w-[110px]">
                {subTextInfo}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Up Control */}
          <button
            onClick={() => handleManualScroll('up')}
            title="Scroll Up"
            className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer shrink-0"
          >
            <ChevronUp size={13} />
          </button>

          {/* Down Control */}
          <button
            onClick={() => handleManualScroll('down')}
            title="Scroll Down"
            className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer shrink-0"
          >
            <ChevronDown size={13} />
          </button>

          {/* Add Data Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            title={`Add ${title}`}
            className="ml-0.5 px-2 py-1 rounded-lg bg-[#f26522] hover:bg-[#e05411] text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus size={12} className="shrink-0" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Table Sub-Header */}
      <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 px-2">
        <span>{labelHeader} (Click to Filter)</span>
        <span>{valueHeader}</span>
      </div>

      {/* List Container */}
      <div
        ref={containerRef}
        className="h-[260px] overflow-y-auto space-y-1 pt-1 pr-1 custom-scrollbar scroll-smooth"
      >
        {data.map((row, i) => {
          const itemVal = row.state || row.category;
          const isSelected = selectedItem && selectedItem.toLowerCase() === itemVal.toLowerCase();

          return (
            <div
              key={i}
              onClick={() => onSelectItem && onSelectItem(itemVal)}
              className={`flex justify-between items-center py-2 px-2.5 text-xs rounded-xl transition-all border cursor-pointer group ${
                isSelected
                  ? 'bg-orange-50/90 border-[#f26522] shadow-2xs font-extrabold text-[#f26522]'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isSelected ? 'bg-[#f26522]' : 'bg-slate-300 group-hover:bg-[#f26522]'
                  }`}
                />
                <span className={`truncate ${isSelected ? 'text-[#f26522] font-black' : 'text-slate-700 font-medium'}`}>
                  {itemVal}
                </span>
              </div>
              <span
                className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                  isSelected ? 'bg-[#f26522] text-white' : 'text-slate-800 bg-slate-100/70'
                }`}
              >
                {row.count}
              </span>
            </div>
          );
        })}
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

  // Active Selection Filters ⭐
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  // Dynamic Main Category Table Data ⭐
  const [mainCategoryData, setMainCategoryData] = useState([
    { category: 'Grocery & FMCG', count: '5420100' },
    { category: 'Electronics & IT', count: '4850400' },
    { category: 'Medical & Pharma', count: '3910550' },
    { category: 'Home Products & Kitchenware', count: '3420900' },
    { category: 'Hardware & Tools', count: '2890120' },
    { category: 'Fashion & Apparel', count: '2410800' },
    { category: 'Automotive & Spares', count: '1980450' },
    { category: 'Accommodations & Real Estate', count: '1450200' },
  ]);

  // Sub Category Mappings per Category ⭐
  const subCategoryMap = {
    'Medical & Pharma': [
      { category: 'Pharma Retail & Chemists', count: '420500' },
      { category: 'Medical & Surgical Equipment', count: '285100' },
      { category: 'Diagnostic & Pathology Labs', count: '180900' },
      { category: 'Hospitals & Health Clinics', count: '140200' },
      { category: 'Ayurvedic & Herbal Medicines', count: '98400' },
    ],
    'Grocery & FMCG': [
      { category: 'Supermarkets & Kirana', count: '510200' },
      { category: 'FMCG Wholesalers & Distributors', count: '320000' },
      { category: 'Dairy, Bakery & Frozen Foods', count: '210500' },
      { category: 'Organic & Health Foods', count: '150300' },
    ],
    'Electronics & IT': [
      { category: 'Mobile Phones & Accessories', count: '620100' },
      { category: 'Computers, Laptops & IT Hardware', count: '380400' },
      { category: 'Home Appliances & Consumer Electronics', count: '290000' },
      { category: 'CCTV, Security & Automation', count: '180500' },
    ],
    'Home Products & Kitchenware': [
      { category: 'Kitchenware & Utensils', count: '410000' },
      { category: 'Furniture & Woodwork', count: '290500' },
      { category: 'Interior Decor & Lighting', count: '180200' },
      { category: 'Architecture & Design', count: '119000' },
    ],
    'Hardware & Tools': [
      { category: 'Pipes & Sanitaryware', count: '380000' },
      { category: 'Electrical Tools & Cables', count: '290100' },
      { category: 'Paints & Construction Materials', count: '210400' },
      { category: 'Plywood & Glass Merchants', count: '150000' },
    ],
    'Fashion & Apparel': [
      { category: "Men's & Women's Clothing", count: '480200' },
      { category: 'Footwear & Shoes', count: '220100' },
      { category: 'Fashion Accessories & Jewelry', count: '180500' },
    ],
    'Automotive & Spares': [
      { category: 'Auto Spare Parts & Accessories', count: '310000' },
      { category: 'Car & Bike Repair Garages', count: '240500' },
      { category: 'Tyres, Batteries & Lubricants', count: '160200' },
    ],
    'Accommodations & Real Estate': [
      { category: 'Hotels, Resorts & Lodges', count: '310500' },
      { category: 'Commercial Real Estate Brokers', count: '220000' },
      { category: 'PG & Rental Housing', count: '180300' },
    ],
  };

  // Dynamic Sub Category Table Data (Default fallback)
  const [defaultSubCategories, setDefaultSubCategories] = useState([
    { category: 'Home Appliances', count: '4207936' },
    { category: 'Architecture', count: '1190209' },
    { category: 'Medical Sector', count: '964467' },
    { category: 'Grocery', count: '872028' },
    { category: 'Education', count: '843749' },
    { category: 'Fashion Accessories', count: '834068' },
    { category: 'Home Products', count: '675391' },
    { category: 'Accommodations', count: '626849' },
    { category: 'Electronics', count: '542100' },
  ]);

  // Dynamically resolve active Sub Category list ⭐
  const activeSubCategoryData = (selectedCategory !== 'All' && subCategoryMap[selectedCategory])
    ? subCategoryMap[selectedCategory]
    : defaultSubCategories;

  const handleAddState = (newItem) => {
    setStatesData((prev) => [newItem, ...prev]);
  };

  const handleAddMainCategory = (newItem) => {
    setMainCategoryData((prev) => [newItem, ...prev]);
  };

  const handleAddSubCategory = (newItem) => {
    setDefaultSubCategories((prev) => [newItem, ...prev]);
  };

  const handleStateSelect = (st) => {
    setSelectedState(st === selectedState ? 'All' : st);
  };

  const handleCategorySelect = (cat) => {
    const nextCat = cat === selectedCategory ? 'All' : cat;
    setSelectedCategory(nextCat);
    setSelectedSubCategory('All');
  };

  const handleSubCategorySelect = (subCat) => {
    setSelectedSubCategory(subCat === selectedSubCategory ? 'All' : subCat);
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
          ) : activeTab === 'data-management' ? (
            <div className="space-y-4">
              <DataManagement />
            </div>
          ) : activeTab === 'audit-logs' ? (
            <div className="space-y-4">
              <AuditLogs />
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              {/* Dashboard Header with Super Admin Master Access Privileges */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e293b] text-white rounded-2xl p-5 shadow-lg border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#f26522]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                      Super Admin Master Control Dashboard
                    </h1>
                    <span className="text-[10px] font-black bg-gradient-to-r from-[#f26522] to-[#e05411] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                      Master Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">
                    LTS Enterprise Real Company Database Management System • Full Admin Control & System Privilege Mode Active
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Unrestricted Master Privileges</span>
                  </span>
                </div>
              </div>

              {/* 1. TOP METRICS GRID (6 CARDS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {metrics.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between h-[160px] group cursor-default"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-400 block truncate group-hover:text-slate-600 transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold text-white bg-rose-500 px-1.5 py-0.5 rounded-md shadow-2xs">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                          {item.value}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Subtitle */}
                    <div className="mt-2">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2 p-0.5 border border-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.progressBg} ${item.progress}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold block truncate">
                        {item.subText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTIVE CASCADE FILTER STATUS BAR ⭐ */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-slate-800">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-extrabold text-[#f26522] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Filter size={14} />
                    <span>Cascade Filter:</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold flex items-center gap-1">
                    <span>State:</span>
                    <strong className="text-[#f26522]">{selectedState}</strong>
                  </span>

                  <span className="text-slate-600">→</span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold flex items-center gap-1">
                    <span>Category:</span>
                    <strong className="text-[#f26522]">{selectedCategory}</strong>
                  </span>

                  <span className="text-slate-600">→</span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold flex items-center gap-1">
                    <span>Sub Category:</span>
                    <strong className="text-[#f26522]">{selectedSubCategory}</strong>
                  </span>
                </div>

                {(selectedState !== 'All' || selectedCategory !== 'All' || selectedSubCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSelectedState('All');
                      setSelectedCategory('All');
                      setSelectedSubCategory('All');
                    }}
                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-[11px] font-bold border border-rose-500/40 transition-all cursor-pointer shrink-0"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* 2. STATES, CATEGORY, SUB CATEGORY TABLES & PENDING PAYMENT ⭐ */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* STATES TABLE */}
                <TableSection
                  title="States"
                  icon={MapPin}
                  labelHeader="State"
                  valueHeader="Vendors"
                  data={statesData}
                  onAddData={handleAddState}
                  selectedItem={selectedState}
                  onSelectItem={handleStateSelect}
                  subTextInfo={selectedState !== 'All' ? `Active: ${selectedState}` : 'All States'}
                />

                {/* CATEGORY TABLE ⭐ */}
                <TableSection
                  title="Category"
                  icon={Layers}
                  labelHeader="Category"
                  valueHeader="Vendors"
                  data={mainCategoryData}
                  onAddData={handleAddMainCategory}
                  selectedItem={selectedCategory}
                  onSelectItem={handleCategorySelect}
                  subTextInfo={selectedCategory !== 'All' ? `Active: ${selectedCategory}` : 'All Categories'}
                />

                {/* SUB CATEGORY TABLE (DYNAMICALLY FILTERED BY CATEGORY) ⭐ */}
                <TableSection
                  title="Sub Category"
                  icon={Layers}
                  labelHeader="Sub Category"
                  valueHeader="Vendors"
                  data={activeSubCategoryData}
                  onAddData={handleAddSubCategory}
                  selectedItem={selectedSubCategory}
                  onSelectItem={handleSubCategorySelect}
                  subTextInfo={selectedCategory !== 'All' ? `For: ${selectedCategory}` : 'All Sub Categories'}
                />

                {/* RIGHT CONTAINER: Pending Vendor Payment */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col min-h-[350px]">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Pending Vendor Payment
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                      Up to date
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-8">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                      <Layers size={22} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 mb-1">No Pending Payments</span>
                    <span className="text-[11px] text-slate-400">All vendor payouts & invoices are cleared.</span>
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