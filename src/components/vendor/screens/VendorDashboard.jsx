import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDashboardStats,
  fetchCascadeData,
  addState,
  addCategory,
  addSubcategory,
  clearDashboardError
} from '@/redux/slices/dashboardSlice.js';
import { fetchRecentOrders } from '@/redux/slices/ordersSlice.js';
import {
  MapPin,
  FolderTree,
  Tags,
  Plus,
  ChevronDown,
  Filter,
  Layers,
  Search,
  X,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const VendorDashboard = ({ onNavigate , fiscalYear }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    stats,
    states,
    categories,
    subcategories,
    statsLoading,
    cascadeLoading,
    saving,
    saveError
  } = useSelector((state) => state.dashboard);
  const { recentOrders, recentLoading } = useSelector((state) => state.orders);

  // Active Filter Selection matching reference screenshot
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  // Search filter inputs inside card columns
  const [stateSearch, setStateSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');

  // Modal State: null | 'state' | 'category' | 'subcategory'
  const [activeModal, setActiveModal] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCount, setNewItemCount] = useState('');
  const [selectedParentCat, setSelectedParentCat] = useState('');

  // 1. Fetch Dashboard Stats, Cascade Data, & Recent Orders on mount
  useEffect(() => {
    dispatch(fetchDashboardStats(fiscalYear ));
    // dispatch(fetchCascadeData());
    dispatch(fetchRecentOrders(fiscalYear ));
  }, [dispatch,fiscalYear ]);

  

  // Sync initial selection once data arrives
  useEffect(() => {
    if (states.length > 0 && selectedState === 'All') {
      setSelectedState(states[0].name);
    }
  }, [states, selectedState]);

  useEffect(() => {
    if (categories.length > 0 && selectedCategory === 'All') {
      setSelectedCategory(categories[0].name);
      setSelectedParentCat(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Sub categories dynamically filtered by selected parent category
  const availableSubCategories = (selectedCategory && selectedCategory !== 'All')
    ? subcategories.filter(sub => sub.parentCategory === selectedCategory)
    : subcategories;

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const count = Number(newItemCount) || 0;
    try {
      if (activeModal === 'state') {
        await dispatch(addState({ name: newItemName.trim(), vendorCount: count })).unwrap();
        setToastMessage(`State "${newItemName}" added successfully!`);
      } else if (activeModal === 'category') {
        await dispatch(addCategory({ name: newItemName.trim(), vendorCount: count })).unwrap();
        setToastMessage(`Category "${newItemName}" added successfully!`);
      } else if (activeModal === 'subcategory') {
        const parentCategory = selectedParentCat || (selectedCategory !== 'All' ? selectedCategory : (categories[0]?.name || 'Grocery & FMCG'));
        await dispatch(addSubcategory({
          name: newItemName.trim(),
          parentCategory,
          vendorCount: count
        })).unwrap();
        setToastMessage(`Subcategory "${newItemName}" added under "${parentCategory}"!`);
      }

      setNewItemName('');
      setNewItemCount('');
      setActiveModal(null);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleResetFilters = () => {
    setSelectedState(states[0]?.name || 'All');
    setSelectedCategory(categories[0]?.name || 'All');
    setSelectedSubCategory('All');
    setStateSearch('');
    setCategorySearch('');
    setSubCategorySearch('');
  };

  // Filtered lists for columns
  const filteredStates = states.filter(s => s.name?.toLowerCase().includes(stateSearch.toLowerCase()));
  const filteredCategories = categories.filter(c => c.name?.toLowerCase().includes(categorySearch.toLowerCase()));
  const filteredSubCategories = availableSubCategories.filter(s => s.name?.toLowerCase().includes(subCategorySearch.toLowerCase()));

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dark Master Control Header Banner Card matching Super Admin reference screenshot */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Vendor Master Control Dashboard
            </h2>
            <span className="bg-[#F97316] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              VENDOR ACCESS
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            LTS Enterprise Real Company Database Management System • Full Merchant Control & Store Privilege Mode Active
          </p>
        </div>

        {/* Live Status Pill Badge matching screenshot */}
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{user?.storeStatus || 'Store Active & Verified'}</span>
        </div>
      </div>

      {/* 6 KPI Metric Cards Row matching Super Admin screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Total Products</span>
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">Live</span>
          </div>
          <p className="text-2xl font-black text-[#172033] flex items-center">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-orange-500" /> : (stats?.totalProducts ?? 0)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-orange-500 h-1 rounded-full w-[80%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Total Catalog : {stats?.totalProducts ?? 0} items
          </span>
        </div>

        {/* Card 2: Active Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Active Products</span>
            <span className="bg-cyan-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">Active</span>
          </div>
          <p className="text-2xl font-black text-[#172033] flex items-center">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-cyan-500" /> : (stats?.activeProducts ?? 0)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-cyan-500 h-1 rounded-full w-[90%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Live Store : {stats?.activeProducts ?? 0} items
          </span>
        </div>
        {/* Card 3: Orders Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Orders Today</span>
            <span className="bg-blue-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">Today</span>
          </div>
          <p className="text-2xl font-black text-[#172033] flex items-center">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : (stats?.ordersToday ?? 0)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full w-[60%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Pending Dispatch : {stats?.ordersToday ?? 0}
          </span>
        </div>

        {/* Card 4: Pending Queries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Pending Queries</span>
            <span className="bg-amber-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">Inquiry</span>
          </div>
          <p className="text-2xl font-black text-[#172033] flex items-center">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : (stats?.pendingQueries ?? 0)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-amber-500 h-1 rounded-full w-[30%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Action Required : {stats?.pendingQueries ?? 0}
          </span>
        </div>

        {/* Card 5: Vendor Activity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Vendor Activity</span>
            <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">Live</span>
          </div>
          <p className="text-2xl font-black text-[#172033] flex items-center">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" /> : (stats?.vendorActivity ?? 0)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full w-[95%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Total Activity Logs : {stats?.vendorActivity ?? 0}
          </span>
        </div>

        {/* Card 6: Online Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Online Users</span>
            <span className="bg-pink-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">Online</span>
          </div>
          <p className="text-2xl font-black text-[#172033] flex items-center">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-pink-500" /> : (stats?.onlineUsers ?? 0)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-pink-500 h-1 rounded-full w-[85%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Active Sessions : {stats?.onlineUsers ?? 0}
          </span>
        </div>
      </div>

      {/* Dark Interactive Cascade Filter Bar matching screenshot */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-3.5 px-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs font-extrabold uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#F97316]" />
          <span className="text-[#F97316]">CASCADE FILTER:</span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold overflow-x-auto w-full md:w-auto">
          <div className="bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-2">
            <span className="text-slate-400">State:</span>
            <span className="text-[#F97316] font-extrabold">{selectedState}</span>
          </div>
          <span className="text-slate-600 font-bold">→</span>
          <div className="bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-2">
            <span className="text-slate-400">Category:</span>
            <span className="text-[#F97316] font-extrabold">{selectedCategory}</span>
          </div>
          <span className="text-slate-600 font-bold">→</span>
          <div className="bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-2">
            <span className="text-slate-400">Sub Category:</span>
            <span className="text-[#F97316] font-extrabold">{selectedSubCategory}</span>
          </div>

          <button
            onClick={handleResetFilters}
            className="bg-rose-600/40 hover:bg-rose-600 text-rose-200 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer ml-2 border border-rose-500/30"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 4 Column Filter Cards Grid matching Super Admin screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: State Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs font-extrabold text-[#172033]">States</span>
                <span className="bg-[#FFF7ED] text-[#EA580C] font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-orange-200">
                  {states.length} Total
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={() => {
                  setNewItemName('');
                  setNewItemCount('');
                  setActiveModal('state');
                }}
                className="bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs px-3 py-1 rounded-lg flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-bold">Active: <span className="text-[#F97316]">{selectedState}</span></p>

            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              <span>STATE (CLICK TO FILTER)</span>
              <span>VENDORS</span>
            </div>

            <div className="space-y-1.5 text-xs font-bold text-[#172033] max-h-52 overflow-y-auto pr-1">
              {cascadeLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
                </div>
              ) : filteredStates.length === 0 ? (
                <p className="text-center py-4 text-slate-400 text-xs font-medium">No states found</p>
              ) : (
                filteredStates.map((st) => {
                  const isSelected = selectedState === st.name;
                  return (
                    <div
                      key={st._id || st.name}
                      onClick={() => setSelectedState(st.name)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-50 text-[#F97316] font-extrabold border border-orange-400 shadow-xs'
                          : 'hover:bg-slate-50 text-[#172033]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className={isSelected ? 'text-[#F97316]' : 'text-slate-400'}>•</span>
                        <span className="truncate">{st.name}</span>
                      </div>
                      <span className={`font-extrabold ${isSelected ? 'text-[#F97316]' : 'text-slate-600'}`}>
                        {typeof st.vendorCount === 'number' ? st.vendorCount.toLocaleString() : (st.vendorCount || 0)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Category Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs font-extrabold text-[#172033]">Category</span>
                <span className="bg-[#FFF7ED] text-[#EA580C] font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-orange-200">
                  {categories.length} Total
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={() => {
                  setNewItemName('');
                  setNewItemCount('');
                  setActiveModal('category');
                }}
                className="bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs px-3 py-1 rounded-lg flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-bold">Active: <span className="text-[#F97316]">{selectedCategory}</span></p>

            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              <span>CATEGORY (CLICK TO FILTER)</span>
              <span>VENDORS</span>
            </div>

            <div className="space-y-1.5 text-xs font-bold text-[#172033] max-h-52 overflow-y-auto pr-1">
              {cascadeLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <p className="text-center py-4 text-slate-400 text-xs font-medium">No categories found</p>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <div
                      key={cat._id || cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSelectedParentCat(cat.name);
                        setSelectedSubCategory('All');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-50 text-[#F97316] font-extrabold border border-orange-400 shadow-xs'
                          : 'hover:bg-slate-50 text-[#172033]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className={isSelected ? 'text-[#F97316]' : 'text-slate-400'}>•</span>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className={`font-extrabold ${isSelected ? 'text-[#F97316]' : 'text-slate-600'}`}>
                        {typeof cat.vendorCount === 'number' ? cat.vendorCount.toLocaleString() : (cat.vendorCount || 0)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Sub Category Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tags className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs font-extrabold text-[#172033]">Sub Category</span>
                <span className="bg-[#FFF7ED] text-[#EA580C] font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-orange-200">
                  {availableSubCategories.length} Total
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={() => {
                  setNewItemName('');
                  setNewItemCount('');
                  setSelectedParentCat(selectedCategory !== 'All' ? selectedCategory : (categories[0]?.name || ''));
                  setActiveModal('subcategory');
                }}
                className="bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs px-3 py-1 rounded-lg flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-bold">For: <span className="text-[#F97316]">{selectedCategory}</span></p>

            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              <span>SUB CATEGORY (CLICK TO FILTER)</span>
              <span>VENDORS</span>
            </div>

            <div className="space-y-1.5 text-xs font-bold text-[#172033] max-h-52 overflow-y-auto pr-1">
              {cascadeLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
                </div>
              ) : filteredSubCategories.length === 0 ? (
                <p className="text-center py-4 text-slate-400 text-xs font-medium">No subcategories found</p>
              ) : (
                filteredSubCategories.map((sub) => {
                  const isSelected = selectedSubCategory === sub.name;
                  return (
                    <div
                      key={sub._id || sub.name}
                      onClick={() => setSelectedSubCategory(sub.name)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-50 text-[#F97316] font-extrabold border border-orange-400 shadow-xs'
                          : 'hover:bg-slate-50 text-[#172033]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className={isSelected ? 'text-[#F97316]' : 'text-slate-400'}>•</span>
                        <span className="truncate">{sub.name}</span>
                      </div>
                      <span className={`font-extrabold ${isSelected ? 'text-[#F97316]' : 'text-slate-600'}`}>
                        {typeof sub.vendorCount === 'number' ? sub.vendorCount.toLocaleString() : (sub.vendorCount || 0)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Pending Vendor Payment Card matching screenshot */}
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#172033] tracking-wide">
              PENDING VENDOR PAYMENT
            </span>
            {statsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            ) : (stats?.pendingVendorPayment?.count ?? 0) === 0 ? (
              <span className="bg-[#E6F4EA] text-[#137333] font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-200/80">
                Up to date
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-200">
                Action Needed
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto py-8">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
              <Layers className="w-8 h-8 text-slate-400 opacity-80" />
            </div>

            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            ) : (stats?.pendingVendorPayment?.count ?? 0) === 0 ? (
              <>
                <h4 className="text-sm font-extrabold text-[#172033]">No Pending Payments</h4>
                <p className="text-xs text-slate-400 font-medium max-w-[200px] leading-relaxed">
                  All vendor payouts & invoices are cleared.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-2xl font-black text-[#172033]">
                  ₹{Number(stats.pendingVendorPayment.totalAmount || 0).toLocaleString('en-IN')}
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  Owed to {stats.pendingVendorPayment.count} vendor{stats.pendingVendorPayment.count === 1 ? '' : 's'}
                </p>
                <p className="text-xs text-slate-400 font-medium max-w-[200px] leading-relaxed">
                  Review and clear payouts to keep vendors active.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#172033]">Recent Orders</h3>
          <button
            onClick={() => onNavigate && onNavigate('05 Orders')}
            className="text-xs font-bold text-[#F97316] hover:underline cursor-pointer"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2">ORDER ID</th>
                <th className="pb-2">CUSTOMER</th>
                <th className="pb-2">PRODUCTS</th>
                <th className="pb-2">AMOUNT</th>
                <th className="pb-2">STATUS</th>
                <th className="pb-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {recentLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#F97316]" />
                      <span className="text-xs">Loading recent orders...</span>
                    </div>
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-xs font-medium">
                    No recent orders found
                  </td>
                </tr>
              ) : (
                recentOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.orderId || ord.id || ord._id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold font-mono text-[#172033]">{ord.orderId || ord.id}</td>
                    <td className="py-3 font-semibold text-[#172033]">{ord.customerName || ord.customer}</td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">{ord.products}</td>
                    <td className="py-3 font-bold text-[#172033]">₹{ord.amount}</td>
                    <td className="py-3 font-bold">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ord.paymentStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigate && onNavigate('05 Orders')}
                        className="text-[#F97316] font-bold hover:underline cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal Dialog for "+ Add" Action */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#172033]">
                Add New {activeModal === 'state' ? 'State' : activeModal === 'category' ? 'Category' : 'Sub Category'}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  dispatch(clearDashboardError());
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>{saveError}</span>
                <button
                  type="button"
                  onClick={() => dispatch(clearDashboardError())}
                  className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Parent Category Selector (When adding subcategory) */}
              {activeModal === 'subcategory' && (
                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
                    Parent Category *
                  </label>
                  <select
                    value={selectedParentCat}
                    onChange={(e) => setSelectedParentCat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                    required
                  >
                    {categories.length === 0 ? (
                      <option value="Grocery & FMCG">Grocery & FMCG</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Enter ${activeModal === 'state' ? 'state' : activeModal === 'category' ? 'category' : 'subcategory'} name...`}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
                  Estimated Vendor / Item Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={newItemCount}
                  onChange={(e) => setNewItemCount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    dispatch(clearDashboardError());
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Entry</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
