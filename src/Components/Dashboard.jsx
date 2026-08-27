import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  fetchDashboardOverview, 
  addDashboardState, 
  addDashboardCategory, 
  addDashboardSubcategory 
} from '../redux/slices/dashboardSlice';
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
  subTextInfo,
  categories = []
}) {
  const containerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState('');

  const isSubcategory = title.toLowerCase().includes('sub category');
  const [selectedCatId, setSelectedCatId] = useState('');

  useEffect(() => {
    if (isModalOpen && isSubcategory && categories.length > 0) {
      const preselect = categories.find(c => (c.name || c.category) === selectedItem);
      if (preselect) {
        setSelectedCatId(preselect._id || preselect.id || '');
      } else {
        setSelectedCatId(categories[0]._id || categories[0].id || '');
      }
    }
  }, [isModalOpen, isSubcategory, categories, selectedItem]);

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
    if (isSubcategory && !selectedCatId) {
      toast.error('Parent category is required.');
      return;
    }

    const isState = labelHeader.toLowerCase().includes('state');
    onAddData({
      [isState ? 'state' : 'category']: newName.trim(),
      count: newCount.trim(),
      categoryId: selectedCatId
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
              {isSubcategory && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Parent Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-800"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.name || cat.category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
  const dispatch = useDispatch();

  const { stats, cascadeData, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardOverview());
  }, [dispatch]);

  // Default Stats fallback
  const dStats = stats || {
    newVendors: { count: 0, badgePercentage: '0%', totalVendors: '0/0' },
    newCustomers: { count: 0, badgePercentage: '0%', totalCustomers: 0 },
    newVendorRequests: { count: 0, totalFYRequests: 0 },
    newCustomerQueries: { count: 0, totalQueries: 0 },
    todaysVendorAudit: { count: 0, pendingQuality: 0 },
    onlineUsersDMS: { count: 0, badgePercentage: '0%', totalUserCount: 0 }
  };

  // Metrics Data
  const metrics = [
    {
      title: 'New Vendors',
      value: String(dStats.newVendors?.count ?? 0),
      badge: dStats.newVendors?.badgePercentage || '0%',
      progress: 'w-[10%]',
      progressBg: 'bg-[#f26522]',
      subText: `Total Vendors : ${dStats.newVendors?.totalVendors ?? '0/0'}`,
    },
    {
      title: 'New Customers',
      value: String(dStats.newCustomers?.count ?? 0),
      badge: dStats.newCustomers?.badgePercentage || '0%',
      progress: 'w-[10%]',
      progressBg: 'bg-sky-500',
      subText: `Total Customers : ${dStats.newCustomers?.totalCustomers ?? 0}`,
    },
    {
      title: 'New Vendor Request',
      value: String(dStats.newVendorRequests?.count ?? 0),
      progress: 'w-[40%]',
      progressBg: 'bg-slate-300',
      subText: `Total FY Requests : ${dStats.newVendorRequests?.totalFYRequests ?? 0}`,
    },
    {
      title: 'New Customer Queries',
      value: String(dStats.newCustomerQueries?.count ?? 0),
      progress: 'w-[5%]',
      progressBg: 'bg-slate-300',
      subText: `Total Queries : ${dStats.newCustomerQueries?.totalQueries ?? 0}`,
    },
    {
      title: "Today's Vendor Audit Count",
      value: String(dStats.todaysVendorAudit?.count ?? 0),
      progress: 'w-[60%]',
      progressBg: 'bg-slate-300',
      subText: `Pending Quality : ${dStats.todaysVendorAudit?.pendingQuality ?? 0}`,
    },
    {
      title: 'Online user in DMS',
      value: String(dStats.onlineUsersDMS?.count ?? 0),
      badge: dStats.onlineUsersDMS?.badgePercentage || '0%',
      progress: 'w-full',
      progressBg: 'bg-rose-500',
      subText: `Total User Count : ${dStats.onlineUsersDMS?.totalUserCount ?? 0}`,
    },
  ];

  // Dynamic States Table Data mapped from Redux
  const statesData = (cascadeData?.states || []).map((s) => ({
    state: s.name || s.state,
    count: s.vendorCount ?? s.count ?? 0
  }));

  // Active Selection Filters ⭐
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  // Dynamic Main Category Table Data mapped from Redux ⭐
  const mainCategoryData = (cascadeData?.categories || []).map((c) => ({
    category: c.name || c.category,
    count: c.vendorCount ?? c.count ?? 0
  }));

  // Filter Sub Categories dynamically based on selectedCategory ⭐
  const activeSubCategoryData = (() => {
    const rawSubcats = cascadeData?.subcategories || [];
    const mappedSubcats = rawSubcats.map((sc) => ({
      category: sc.name || sc.category,
      count: sc.vendorCount ?? sc.count ?? 0,
      categoryId: sc.categoryId,
      parentCategory: sc.parentCategory
    }));

    if (selectedCategory === 'All') {
      return mappedSubcats;
    }

    // Find current category object
    const activeCatObj = (cascadeData?.categories || []).find(
      (c) => (c.name || c.category) === selectedCategory
    );
    const catId = activeCatObj?._id || activeCatObj?.id;

    return mappedSubcats.filter((sc) => {
      if (catId && sc.categoryId === catId) return true;
      if (sc.parentCategory && sc.parentCategory === selectedCategory) return true;
      return false;
    });
  })();

  const handleAddState = (newItem) => {
    dispatch(addDashboardState({
      name: newItem.state,
      vendorCount: parseInt(newItem.count) || 0
    }));
  };

  const handleAddMainCategory = (newItem) => {
    dispatch(addDashboardCategory({
      name: newItem.category,
      vendorCount: parseInt(newItem.count) || 0
    }));
  };

  const handleAddSubCategory = (newItem) => {
    const categoryId = newItem.categoryId;
    if (!categoryId) {
      toast.error('Please select a category to add a sub category.');
      return;
    }
    dispatch(addDashboardSubcategory({
      name: newItem.category || newItem.name,
      categoryId,
      vendorCount: parseInt(newItem.count) || 0
    }));
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
            loading && !stats ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#f26522] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-600">Loading control dashboard data...</p>
              </div>
            ) : error && !stats ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 max-w-md shadow-sm">
                  <h2 className="text-base font-bold mb-2">Failed to Load Dashboard</h2>
                  <p className="text-xs mb-4">{error}</p>
                  <button
                    onClick={() => dispatch(fetchDashboardOverview())}
                    className="px-4 py-2 bg-[#f26522] text-white text-xs font-bold rounded-xl hover:bg-[#e05411] transition-colors cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            ) : (
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
                    categories={cascadeData?.categories || []}
                  />

                  {/* RIGHT CONTAINER: Pending Vendor Payment */}
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col min-h-[350px]">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Pending Vendor Payment
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        (cascadeData?.pendingPayments?.hasPending)
                          ? 'bg-rose-50 text-rose-600 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {cascadeData?.pendingPayments?.status || 'Up to date'}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-8">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                        <Layers size={22} className="text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 mb-1">
                        {cascadeData?.pendingPayments?.message || 'No Pending Payments'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {cascadeData?.pendingPayments?.hasPending 
                          ? 'Action required for pending vendor payouts.' 
                          : 'All vendor payouts & invoices are cleared.'}
                      </span>
                    </div>
                  </div>

                </div>
              </>
            )
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