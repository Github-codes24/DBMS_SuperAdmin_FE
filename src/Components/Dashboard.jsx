import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  fetchDashboardOverview, 
  addDashboardState, 
  addDashboardCategory, 
  addDashboardSubcategory 
} from '../redux/slices/dashboardSlice';
import { fetchVendors } from '../redux/slices/vendorSlice';
import { fetchCustomers } from '../redux/slices/customerSlice';
import { ChevronUp, ChevronDown, Plus, X, Layers, MapPin, Filter, Check, Building2, Users, FileText, HelpCircle, ShieldCheck, Activity, Search, Ban, UserCheck, AlertTriangle } from 'lucide-react';
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
import { State } from 'country-state-city';
// import api from '../services/api';
import api, { getDashboardApiUrl } from "../services/api";



// Unified Master Data Table Component ⭐
function MasterDataTable({
  statesData = [],
  mainCategoryData = [],
  activeSubCategoryData = [],
  pendingPaymentsData = null,
  selectedState,
  selectedCategory,
  selectedSubCategory,
  onStateSelect,
  onCategorySelect,
  onSubCategorySelect,
  onAddCategory,
  onAddSubCategory
}) {
  const [dataTab, setDataTab] = useState('states'); // 'states' | 'categories' | 'subcategories' | 'payments'
  const [searchQuery, setSearchQuery] = useState('');

  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');

  const isSubcategory = dataTab === 'subcategories';

  const [sortField, setSortField] = useState('count'); // 'name' | 'count'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination state ⭐
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 5 | 10 | 25 | 50

  const searchInputRef = useRef(null);

  // Auto-switch table tab when cascade filters change ⭐
  useEffect(() => {
    if (selectedState !== 'All' && selectedCategory === 'All' && selectedSubCategory === 'All') {
      setDataTab('categories');
    } else if (selectedCategory !== 'All') {
      setDataTab('subcategories');
    }
  }, [selectedState, selectedCategory, selectedSubCategory]);

  // Keyboard shortcut listener (/ or Ctrl+K to focus search) ⭐
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clear search and reset pagination on tab or filter change ⭐
  const handleTabChange = (tab) => {
    setDataTab(tab);
    setSearchQuery('');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedState, selectedCategory, selectedSubCategory, pageSize]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'count' ? 'desc' : 'asc');
    }
  };

  useEffect(() => {
    if (isModalOpen && isSubcategory && mainCategoryData.length > 0) {
      if (selectedCategory !== 'All') {
        const activeCat = mainCategoryData.find(
          c => c.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (activeCat) {
          setSelectedCatId(activeCat.id || activeCat._id || '');
          return;
        }
      }
      setSelectedCatId(mainCategoryData[0].id || mainCategoryData[0]._id || '');
    }
  }, [isModalOpen, isSubcategory, mainCategoryData, selectedCategory]);

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCount.trim()) return;

    if (dataTab === 'categories') {
      onAddCategory && onAddCategory({ category: newName.trim(), count: newCount.trim() });
    } else if (dataTab === 'subcategories') {
      if (!selectedCatId) {
        toast.error('Parent category is required.');
        return;
      }
      onAddSubCategory && onAddSubCategory({ category: newName.trim(), count: newCount.trim(), categoryId: selectedCatId });
    }

    setNewName('');
    setNewCount('');
    setIsModalOpen(false);
  };

  const filteredStates = statesData.filter(s => {
    return !searchQuery || s.state.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredCategories = mainCategoryData.filter(c => {
    return !searchQuery || c.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredSubCategories = activeSubCategoryData.filter(sc => {
    return !searchQuery || sc.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortData = (list, nameKey = 'category', countKey = 'count') => {
    return [...list].sort((a, b) => {
      let valA = sortField === 'name' ? String(a[nameKey] || '').toLowerCase() : Number(a[countKey]) || 0;
      let valB = sortField === 'name' ? String(b[nameKey] || '').toLowerCase() : Number(b[countKey]) || 0;

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedStates = sortData(filteredStates, 'state', 'count');
  const sortedCategories = sortData(filteredCategories, 'category', 'count');
  const sortedSubCategories = sortData(filteredSubCategories, 'category', 'count');

  // Total filtered vendors calculation ⭐
  const totalFilteredVendors = (() => {
    const currentList = dataTab === 'states' ? filteredStates : dataTab === 'categories' ? filteredCategories : filteredSubCategories;
    return currentList.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
  })();

  // Pagination calculation ⭐
  const activeList = dataTab === 'states' ? sortedStates : dataTab === 'categories' ? sortedCategories : sortedSubCategories;
  const totalItems = activeList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedStates = sortedStates.slice(startIndex, startIndex + pageSize);
  const paginatedCategories = sortedCategories.slice(startIndex, startIndex + pageSize);
  const paginatedSubCategories = sortedSubCategories.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      
      {/* Top Header: Tabs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl flex-wrap">
          <button
            onClick={() => handleTabChange('states')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              dataTab === 'states'
                ? 'bg-gradient-to-r from-[#f26522] to-[#e05411] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MapPin size={15} />
            <span>States</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              dataTab === 'states' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredStates.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              dataTab === 'categories'
                ? 'bg-gradient-to-r from-[#f26522] to-[#e05411] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers size={15} />
            <span>Categories</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              dataTab === 'categories' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredCategories.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('subcategories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              dataTab === 'subcategories'
                ? 'bg-gradient-to-r from-[#f26522] to-[#e05411] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers size={15} />
            <span>Sub Categories</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              dataTab === 'subcategories' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredSubCategories.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              dataTab === 'payments'
                ? 'bg-gradient-to-r from-[#f26522] to-[#e05411] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 size={15} />
            <span>Pending Payments</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              dataTab === 'payments' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {pendingPaymentsData?.hasPending ? 1 : 0}
            </span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {dataTab !== 'payments' && (
            <div className="relative w-48 sm:w-64">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${dataTab}... (Press '/')`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="absolute right-2.5 top-2 text-[10px] font-black text-slate-400 bg-slate-200/70 px-1.5 py-0.5 rounded border border-slate-300 pointer-events-none">
                  /
                </span>
              )}
            </div>
          )}

          {(dataTab === 'categories' || dataTab === 'subcategories') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
            >
              <Plus size={14} />
              <span>Add {dataTab === 'categories' ? 'Category' : 'Sub Category'}</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTERED SUMMARY MINI CARDS STRIP ⭐ */}
      {dataTab !== 'payments' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Filtered Vendors</span>
            <span className="text-sm font-black text-[#f26522]">{totalFilteredVendors.toLocaleString()}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active State</span>
            <span className="text-xs font-black text-slate-800 truncate block">{selectedState}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Category</span>
            <span className="text-xs font-black text-slate-800 truncate block">{selectedCategory}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Sub Category</span>
            <span className="text-xs font-black text-slate-800 truncate block">{selectedSubCategory}</span>
          </div>
        </div>
      )}

      {/* Active Filter Context Banner */}
      {(selectedState !== 'All' || selectedCategory !== 'All' || selectedSubCategory !== 'All') && (
        <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-[#f26522] uppercase tracking-wider text-[11px]">Active Filter Context:</span>
            {selectedState !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-orange-200 font-black flex items-center gap-1.5 shadow-2xs">
                <span>State: <strong className="text-[#f26522]">{selectedState}</strong></span>
                <button title="Clear State Filter" onClick={() => onStateSelect('All')} className="text-slate-400 hover:text-rose-600 cursor-pointer font-bold">✕</button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-orange-200 font-black flex items-center gap-1.5 shadow-2xs">
                <span>Category: <strong className="text-[#f26522]">{selectedCategory}</strong></span>
                <button title="Clear Category Filter" onClick={() => onCategorySelect('All')} className="text-slate-400 hover:text-rose-600 cursor-pointer font-bold">✕</button>
              </span>
            )}
            {selectedSubCategory !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-orange-200 font-black flex items-center gap-1.5 shadow-2xs">
                <span>Sub Category: <strong className="text-[#f26522]">{selectedSubCategory}</strong></span>
                <button title="Clear Sub Category Filter" onClick={() => onSubCategorySelect('All')} className="text-slate-400 hover:text-rose-600 cursor-pointer font-bold">✕</button>
              </span>
            )}
          </div>
          <button
            onClick={() => onStateSelect('All')}
            className="text-[11px] font-black text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Spacious Full-Width Table View */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        {dataTab === 'states' && (
          sortedStates.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th 
                    onClick={() => toggleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>State Name</span>
                      {sortField === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#f26522]" /> : <ChevronDown size={14} className="text-[#f26522]" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('count')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Vendor Count</span>
                      {sortField === 'count' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#f26522]" /> : <ChevronDown size={14} className="text-[#f26522]" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center w-60">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedStates.map((row, idx) => {
                  const isSelected = selectedState.toLowerCase() === row.state.toLowerCase();
                  return (
                    <tr
                      key={idx}
                      onClick={() => onStateSelect(row.state)}
                      className={`transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/90 font-bold text-[#f26522] border-l-4 border-l-[#f26522] shadow-2xs'
                          : 'hover:bg-slate-50/80 odd:bg-slate-50/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-extrabold text-slate-400">{startIndex + idx + 1}</td>
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#f26522] animate-pulse' : 'bg-slate-300'}`} />
                        <span className={isSelected ? 'text-[#f26522] font-black' : 'text-slate-800'}>
                          {row.state}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          isSelected ? 'bg-[#f26522] text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {(Number(row.count) || 0).toLocaleString()} Vendors
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStateSelect(row.state);
                            }}
                            className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#f26522] text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Filter State'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStateSelect(row.state);
                              handleTabChange('categories');
                            }}
                            className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-orange-100 hover:bg-[#f26522] text-[#f26522] hover:text-white transition-all cursor-pointer whitespace-nowrap"
                          >
                            Explore Categories →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-500 font-medium">No states matching "<strong className="text-slate-700">{searchQuery}</strong>"</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs font-bold text-[#f26522] hover:underline cursor-pointer">Clear Search</button>
            </div>
          )
        )}

        {dataTab === 'categories' && (
          sortedCategories.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th 
                    onClick={() => toggleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category Name</span>
                      {sortField === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#f26522]" /> : <ChevronDown size={14} className="text-[#f26522]" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('count')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Vendor Count</span>
                      {sortField === 'count' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#f26522]" /> : <ChevronDown size={14} className="text-[#f26522]" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center w-64">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedCategories.map((row, idx) => {
                  const isSelected = selectedCategory.toLowerCase() === row.category.toLowerCase();
                  return (
                    <tr
                      key={idx}
                      onClick={() => onCategorySelect(row.category)}
                      className={`transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/90 font-bold text-[#f26522] border-l-4 border-l-[#f26522] shadow-2xs'
                          : 'hover:bg-slate-50/80 odd:bg-slate-50/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-extrabold text-slate-400">{startIndex + idx + 1}</td>
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#f26522] animate-pulse' : 'bg-slate-300'}`} />
                        <span className={isSelected ? 'text-[#f26522] font-black' : 'text-slate-800'}>
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          isSelected ? 'bg-[#f26522] text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {(Number(row.count) || 0).toLocaleString()} Vendors
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCategorySelect(row.category);
                            }}
                            className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#f26522] text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Filter Category'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCategorySelect(row.category);
                              handleTabChange('subcategories');
                            }}
                            className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-orange-100 hover:bg-[#f26522] text-[#f26522] hover:text-white transition-all cursor-pointer whitespace-nowrap"
                          >
                            Explore Sub Categories →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-500 font-medium">No categories matching "<strong className="text-slate-700">{searchQuery}</strong>"</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs font-bold text-[#f26522] hover:underline cursor-pointer">Clear Search</button>
            </div>
          )
        )}

        {dataTab === 'subcategories' && (
          sortedSubCategories.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th 
                    onClick={() => toggleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Sub Category Name</span>
                      {sortField === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#f26522]" /> : <ChevronDown size={14} className="text-[#f26522]" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4">Parent Category</th>
                  <th 
                    onClick={() => toggleSort('count')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Vendor Count</span>
                      {sortField === 'count' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#f26522]" /> : <ChevronDown size={14} className="text-[#f26522]" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center w-44">Filter Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedSubCategories.map((row, idx) => {
                  const isSelected = selectedSubCategory.toLowerCase() === row.category.toLowerCase();
                  const parentCat = row.parentCategory || selectedCategory || 'All';
                  return (
                    <tr
                      key={idx}
                      onClick={() => onSubCategorySelect(row.category)}
                      className={`transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/90 font-bold text-[#f26522] border-l-4 border-l-[#f26522] shadow-2xs'
                          : 'hover:bg-slate-50/80 odd:bg-slate-50/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-extrabold text-slate-400">{startIndex + idx + 1}</td>
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#f26522] animate-pulse' : 'bg-slate-300'}`} />
                        <span className={isSelected ? 'text-[#f26522] font-black' : 'text-slate-800'}>
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (parentCat !== 'All') onCategorySelect(parentCat);
                          }}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-[#f26522] font-semibold text-[11px] transition-colors border border-slate-200/80 cursor-pointer"
                        >
                          {parentCat}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          isSelected ? 'bg-[#f26522] text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {(Number(row.count) || 0).toLocaleString()} Vendors
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold border ${
                          isSelected 
                            ? 'bg-[#f26522] text-white border-[#f26522]' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}>
                          {isSelected ? '✓ ACTIVE FILTER' : 'Filter Sub Category'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-500 font-medium">No sub categories matching "<strong className="text-slate-700">{searchQuery}</strong>"</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs font-bold text-[#f26522] hover:underline cursor-pointer">Clear Search</button>
            </div>
          )
        )}

        {dataTab === 'payments' && (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
              <Layers size={26} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {pendingPaymentsData?.message || 'No Pending Vendor Payments'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {pendingPaymentsData?.hasPending 
                ? 'Action required for pending vendor payouts.' 
                : 'All vendor payouts & invoices are cleared.'}
            </p>
          </div>
        )}
      </div>

      {/* Table Footer Summary & Pagination Controls Bar ⭐ */}
      {dataTab !== 'payments' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span>Showing <strong className="text-slate-900 font-bold">{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of <strong className="text-slate-900 font-bold">{totalItems}</strong> entries</span>
            {searchQuery && <span className="text-slate-400">(Filtered by "{searchQuery}")</span>}
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-between sm:justify-end">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 font-medium">Per Page:</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-100 text-slate-800 font-bold px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#f26522] cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Prev/Next Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 rounded-lg font-extrabold transition-all border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              <span className="px-2 py-1 font-black text-slate-800">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 rounded-lg font-extrabold transition-all border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xs overflow-hidden">
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800">
                Add New {dataTab === 'categories' ? 'Category' : 'Sub Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

             <form onSubmit={handleSaveModal} className="p-4 space-y-3">
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
                    {mainCategoryData.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.category || cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Vendor Count <span className="text-rose-500">*</span>
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
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  const [apiCategories, setApiCategories] = useState([]);
const [apiSubCategories, setApiSubCategories] = useState([]);
const [categoriesLoading, setCategoriesLoading] = useState(false);
const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

useEffect(() => {
  const fetchCategories = async () => {
    setCategoriesLoading(true);

    try {
      const response = await api.get(
        getDashboardApiUrl(
          `/dashboard/${encodeURIComponent("PID-005")}/categories`
        ),
        { params: { limit: 100 } }
      );

      const payload = response.data;

      const categoryList =
        payload?.categories ||
        payload?.data?.categories ||
        payload?.data ||
        [];

      setApiCategories(
        Array.isArray(categoryList) ? categoryList : []
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  fetchCategories();
}, []);


useEffect(() => {
  const fetchSubCategories = async () => {
    if (selectedCategory === "All") {
      setApiSubCategories([]);
      return;
    }

    const selectedCat = apiCategories.find(
      (cat) =>
        (cat.name || cat.category || "").toLowerCase() ===
        selectedCategory.toLowerCase()
    );

    const selectedCatId = selectedCat?.categoryId;

    if (!selectedCatId) {
      setApiSubCategories([]);
      return;
    }

    setSubCategoriesLoading(true);

    try {
      const response = await api.get(
        getDashboardApiUrl(
          `/dashboard/categories/${encodeURIComponent(selectedCatId)}/subcategories`
        ),
        { params: { limit: 100 } }
      );

      const payload = response.data;

      const subCategoryList =
        payload?.subcategories ||
        payload?.data?.subcategories ||
        payload?.data ||
        [];

      setApiSubCategories(
        Array.isArray(subCategoryList) ? subCategoryList : []
      );
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      toast.error("Failed to load subcategories");
    } finally {
      setSubCategoriesLoading(false);
    }
  };

  fetchSubCategories();
}, [selectedCategory, apiCategories]);

  const dispatch = useDispatch();
  const { stats, cascadeData, loading, error } = useSelector((state) => state.dashboard);
  const { vendors = [] } = useSelector((state) => state.vendor || {});
  const { customers = [] } = useSelector((state) => state.customer || {});

  useEffect(() => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchVendors());
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Default Stats fallback
  const dStats = stats || {
    newVendors: { count: 0, badgePercentage: '0%', totalVendors: 0 },
    newCustomers: { count: 0, badgePercentage: '0%', totalCustomers: 0 },
    newVendorRequests: { count: 0, totalFYRequests: 0 },
    newCustomerQueries: { count: 0, totalQueries: 0 },
    todaysVendorAudit: { count: 0, pendingQuality: 0 },
    onlineUsersDMS: { count: 0, badgePercentage: '0%', totalUserCount: 0 }
  };

  // Live Database Counts computed from actual records
  const liveTotalVendors = vendors.length > 0 ? vendors.length : Number(dStats.newVendors?.totalVendors) || 0;
  const liveActiveVendors = vendors.length > 0 ? vendors.filter(v => (v.status || '').toLowerCase() === 'active').length : Number(dStats.newCustomers?.totalCustomers) || 0;
  const liveRejectedVendors = vendors.length > 0 ? vendors.filter(v => (v.status || '').toLowerCase() === 'pending' || (v.status || '').toLowerCase() === 'rejected').length : Number(dStats.newVendorRequests?.totalFYRequests) || 0;
  const liveBlockedVendors = vendors.length > 0 ? vendors.filter(v => (v.status || '').toLowerCase() === 'blocked' || (v.status || '').toLowerCase() === 'inactive' || v.isBlocked === true).length : Number(dStats.newCustomerQueries?.totalQueries) || 0;



  // Rich master relational dataset for Category & Subcategory cascade filtering ⭐
  const MASTER_CATEGORIES_WITH_SUBCATS = [
    {
      id: 'cat-1',
      name: 'Grocery & FMCG',
      totalCount: 5420100,
      subcategories: [
        { id: 'sub-101', name: 'Supermarkets & Kirana', totalCount: 2200500 },
        { id: 'sub-102', name: 'Staples & Grains', totalCount: 1150400 },
        { id: 'sub-103', name: 'Dairy & Fresh Produce', totalCount: 890200 },
        { id: 'sub-104', name: 'Personal Care & Hygiene', totalCount: 640100 },
        { id: 'sub-105', name: 'Beverages & Packaged Food', totalCount: 538900 },
      ]
    },
    {
      id: 'cat-2',
      name: 'Electronics & IT',
      totalCount: 4850400,
      subcategories: [
        { id: 'sub-201', name: 'Mobile & Accessories', totalCount: 1840200 },
        { id: 'sub-202', name: 'Computer Hardware & Laptops', totalCount: 1250100 },
        { id: 'sub-203', name: 'Consumer Electronics', totalCount: 920000 },
        { id: 'sub-204', name: 'IT Services & Software', totalCount: 510100 },
        { id: 'sub-205', name: 'Education & EdTech', totalCount: 330000 },
      ]
    },
    {
      id: 'cat-3',
      name: 'Medical & Pharma',
      totalCount: 3910550,
      subcategories: [
        { id: 'sub-301', name: 'Medical Sector & Hospitals', totalCount: 1420500 },
        { id: 'sub-302', name: 'Retail Pharmacy & Chemists', totalCount: 1180050 },
        { id: 'sub-303', name: 'Surgical & Lab Supplies', totalCount: 710000 },
        { id: 'sub-304', name: 'Ayurvedic & Healthcare', totalCount: 600000 },
      ]
    },
    {
      id: 'cat-4',
      name: 'Home Products & Kitchenware',
      totalCount: 3420900,
      subcategories: [
        { id: 'sub-401', name: 'Home Appliances', totalCount: 1650400 },
        { id: 'sub-402', name: 'Kitchen Utilities & Cookware', totalCount: 980200 },
        { id: 'sub-403', name: 'Furniture & Home Decor', totalCount: 790300 },
      ]
    },
    {
      id: 'cat-5',
      name: 'Hardware & Tools',
      totalCount: 2890120,
      subcategories: [
        { id: 'sub-501', name: 'Architecture & Building Material', totalCount: 1190209 },
        { id: 'sub-502', name: 'Electrical Fittings & Wires', totalCount: 850000 },
        { id: 'sub-503', name: 'Plumbing & Sanitaryware', totalCount: 520000 },
        { id: 'sub-504', name: 'Power Tools & Fasteners', totalCount: 329911 },
      ]
    },
    {
      id: 'cat-6',
      name: 'Fashion & Apparel',
      totalCount: 2410800,
      subcategories: [
        { id: 'sub-601', name: 'Fashion Accessories', totalCount: 950800 },
        { id: 'sub-602', name: 'Readymade Garments', totalCount: 820000 },
        { id: 'sub-603', name: 'Footwear & Leather', totalCount: 640000 },
      ]
    }
  ];

  // Live State & Category count aggregation from actual vendors database ⭐
  const liveVendorStateCounts = React.useMemo(() => {
    const counts = {};
    if (Array.isArray(vendors)) {
      vendors.forEach((v) => {
        if (!v.isDeleted && v.status !== 'Deleted') {
          const st = String(v.state || v.rawVendor?.state || '').trim();
          if (st) {
            const lower = st.toLowerCase();
            counts[lower] = (counts[lower] || 0) + 1;
          }
        }
      });
    }
    return counts;
  }, [vendors]);

  const liveVendorCategoryCounts = React.useMemo(() => {
    const counts = {};
    if (Array.isArray(vendors)) {
      vendors.forEach((v) => {
        if (!v.isDeleted && v.status !== 'Deleted') {
          const cat = String(v.category || v.rawVendor?.category || '').trim();
          if (cat) {
            const lower = cat.toLowerCase();
            counts[lower] = (counts[lower] || 0) + 1;
          }
        }
      });
    }
    return counts;
  }, [vendors]);

  // Load all 36 Indian States and Union Territories dynamically using country-state-city library ⭐
  const rawStates = (State && typeof State.getStatesOfCountry === 'function')
    ? State.getStatesOfCountry('IN')
    : [];

  const allIndianStatesFromLibrary = (rawStates && rawStates.length > 0 ? rawStates : [
    { name: 'Maharashtra', isoCode: 'MH' },
    { name: 'Uttar Pradesh', isoCode: 'UP' },
    { name: 'Tamil Nadu', isoCode: 'TN' },
    { name: 'Gujarat', isoCode: 'GJ' },
    { name: 'Karnataka', isoCode: 'KA' },
    { name: 'Rajasthan', isoCode: 'RJ' },
    { name: 'West Bengal', isoCode: 'WB' },
    { name: 'Telangana', isoCode: 'TG' },
    { name: 'Madhya Pradesh', isoCode: 'MP' },
    { name: 'Delhi', isoCode: 'DL' },
    { name: 'Kerala', isoCode: 'KL' },
    { name: 'Bihar', isoCode: 'BR' },
    { name: 'Punjab', isoCode: 'PB' },
    { name: 'Haryana', isoCode: 'HR' },
    { name: 'Andhra Pradesh', isoCode: 'AP' },
    { name: 'Odisha', isoCode: 'OR' },
    { name: 'Jharkhand', isoCode: 'JH' },
    { name: 'Assam', isoCode: 'AS' },
    { name: 'Chhattisgarh', isoCode: 'CT' },
    { name: 'Jammu and Kashmir', isoCode: 'JK' },
    { name: 'Uttarakhand', isoCode: 'UK' },
    { name: 'Himachal Pradesh', isoCode: 'HP' },
    { name: 'Goa', isoCode: 'GA' },
    { name: 'Puducherry', isoCode: 'PY' },
    { name: 'Chandigarh', isoCode: 'CH' },
    { name: 'Tripura', isoCode: 'TR' },
    { name: 'Meghalaya', isoCode: 'ML' },
    { name: 'Manipur', isoCode: 'MN' },
    { name: 'Nagaland', isoCode: 'NL' },
    { name: 'Arunachal Pradesh', isoCode: 'AR' },
    { name: 'Mizoram', isoCode: 'MZ' },
    { name: 'Sikkim', isoCode: 'SK' },
    { name: 'Ladakh', isoCode: 'LA' },
    { name: 'Andaman and Nicobar Islands', isoCode: 'AN' },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', isoCode: 'DH' },
    { name: 'Lakshadweep', isoCode: 'LD' },
  ]).map((st) => {
    const name = st.name;
    const realCount = liveVendorStateCounts[name.toLowerCase()] || 0;
    return {
      state: name,
      code: st.isoCode,
      count: realCount
    };
  });

  // Dynamic States Table Data computed strictly from real live vendors database ⭐
  const statesData = allIndianStatesFromLibrary;

  // Calculate State Multiplier based on selected state's vendor share
  const totalStatesVendors = statesData.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0) || 1;
  const activeStateObj = statesData.find(s => s.state.toLowerCase() === selectedState.toLowerCase());
  const stateMultiplier = selectedState === 'All' 
    ? 1 
    : (activeStateObj ? (Number(activeStateObj.count) || 0) / totalStatesVendors : 0.2);

  // Metrics Data - dynamically scaled by active State Filter ⭐
  const metrics = [
    {
      title: 'Total Vendors',
      value: String(Math.round(liveTotalVendors * stateMultiplier)),
      badge: dStats.newVendors?.badgePercentage || '+10%',
      progress: 'w-[65%]',
      progressBg: 'bg-[#f26522]',
      subText: selectedState !== 'All' ? `Filtered for ${selectedState}` : `Total Vendors : ${liveTotalVendors}`,
      icon: Building2,
      bgGlow: 'from-orange-500/10 to-transparent',
      iconBg: 'bg-orange-50 text-[#f26522] border-orange-200/60',
      badgeBg: 'bg-orange-50 text-[#f26522] border-orange-200',
    },
    {
      title: 'Active Vendor',
      value: String(Math.round(liveActiveVendors * stateMultiplier)),
      badge: dStats.newCustomers?.badgePercentage || '+10%',
      progress: 'w-[80%]',
      progressBg: 'bg-emerald-500',
      subText: selectedState !== 'All' ? `Active Vendors in ${selectedState}` : `Total Active Vendors : ${liveActiveVendors}`,
      icon: UserCheck,
      bgGlow: 'from-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Rejected Vendor',
      value: String(Math.round(liveRejectedVendors * stateMultiplier)),
      progress: 'w-[45%]',
      progressBg: 'bg-rose-500',
      subText: selectedState !== 'All' ? `Rejected Vendors in ${selectedState}` : `Total Rejected Vendors : ${liveRejectedVendors}`,
      icon: AlertTriangle,
      bgGlow: 'from-rose-500/10 to-transparent',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200/60',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Blocked Vendor',
      value: String(Math.round(liveBlockedVendors * stateMultiplier)),
      progress: 'w-[30%]',
      progressBg: 'bg-amber-500',
      subText: selectedState !== 'All' ? `Blocked Vendors in ${selectedState}` : `Total Blocked Vendors : ${liveBlockedVendors}`,
      icon: Ban,
      bgGlow: 'from-amber-500/10 to-transparent',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: "Today's Vendor Audit",
      value: String(Math.round((Number(dStats.todaysVendorAudit?.count) || 0) * stateMultiplier)),
      progress: 'w-[60%]',
      progressBg: 'bg-indigo-500',
      subText: `Pending Quality : ${Math.round((Number(dStats.todaysVendorAudit?.pendingQuality) || 0) * stateMultiplier)}`,
      icon: ShieldCheck,
      bgGlow: 'from-indigo-500/10 to-transparent',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Online User in DMS',
      value: String(Math.round((Number(dStats.onlineUsersDMS?.count) || 0) * stateMultiplier)),
      badge: dStats.onlineUsersDMS?.badgePercentage || '+100%',
      progress: 'w-full',
      progressBg: 'bg-sky-500',
      subText: selectedState !== 'All' ? `Online Users in ${selectedState}` : `Total User Count : ${dStats.onlineUsersDMS?.totalUserCount ?? 0}`,
      icon: Activity,
      bgGlow: 'from-sky-500/10 to-transparent',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200/60',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    },
  ];

  // Dynamic Main Category Table Data mapped from real live vendor database ⭐
  const mainCategoryData = apiCategories.map((c) => {
  const categoryName = c.name || c.category || "";

  const realCatCount =
    liveVendorCategoryCounts[categoryName.toLowerCase()] || 0;

  return {
    category: categoryName,
    count:
      selectedState === "All"
        ? realCatCount
        : Math.round(realCatCount * stateMultiplier),
    id: c.categoryId || c._id,
    categoryId: c.categoryId,
  };
});
  // Filter Sub Categories dynamically based on selectedCategory & selectedState ⭐
  const activeSubCategoryData = apiSubCategories.map((sc) => {
  const subCategoryName = sc.name || sc.subcategory || sc.category || "";

  const selectedCat = apiCategories.find(
    (cat) =>
      (cat.name || cat.category || "").toLowerCase() ===
      selectedCategory.toLowerCase()
  );

  const parentCategoryName =
    selectedCat?.name || selectedCat?.category || selectedCategory;

  const realCatCount =
    liveVendorCategoryCounts[parentCategoryName.toLowerCase()] || 0;

  return {
    category: subCategoryName,
    count:
      selectedState === "All"
        ? realCatCount
        : Math.round(realCatCount * stateMultiplier),
    parentCategory: parentCategoryName,
    id: sc.subcategoryId || sc._id,
  };
});
  const handleAddState = (newItem) => {
    dispatch(addDashboardState({
      name: newItem.state,
      vendorCount: parseInt(newItem.count) || 0
    }));
  };

  const handleAddMainCategory = (newItem) => {
    dispatch(addDashboardCategory({
      name: newItem.category,
    }));
  };

  const handleAddSubCategory = (newItem) => {
    const parentCategory = MASTER_CATEGORIES_WITH_SUBCATS.find(
      (category) => category.id === newItem.categoryId
    )?.name;
    if (!parentCategory) {
      toast.error('Please select a category to add a sub category.');
      return;
    }
    dispatch(addDashboardSubcategory({
      parentCategory,
      subcategories: [newItem.category || newItem.name],
    }));
  };

  const handleStateSelect = (st, isToggle = true) => {
    if (st === 'All') {
      setSelectedState('All');
      setSelectedCategory('All');
      setSelectedSubCategory('All');
      return;
    }
    const nextState = (isToggle && st === selectedState) ? 'All' : st;
    setSelectedState(nextState);
    if (nextState === 'All') {
      setSelectedCategory('All');
      setSelectedSubCategory('All');
    }
  };

  const handleCategorySelect = (cat, isToggle = true) => {
    if (cat === 'All') {
      setSelectedCategory('All');
      setSelectedSubCategory('All');
      return;
    }
    const nextCat = (isToggle && cat === selectedCategory) ? 'All' : cat;
    setSelectedCategory(nextCat);
    setSelectedSubCategory('All');
  };

  const handleSubCategorySelect = (subCat, isToggle = true) => {
    if (subCat === 'All') {
      setSelectedSubCategory('All');
      return;
    }
    const nextSub = (isToggle && subCat === selectedSubCategory) ? 'All' : subCat;
    setSelectedSubCategory(nextSub);

    if (nextSub !== 'All') {
      // Find parent category for this subcategory automatically ⭐
      let parentCatName = null;

      if (cascadeData?.subcategories && cascadeData.subcategories.length > 0) {
        const found = cascadeData.subcategories.find(
          sc => (sc.name || sc.subCategory || sc.category || '').toLowerCase() === nextSub.toLowerCase()
        );
        if (found) {
          parentCatName = found.parentCategory || found.categoryName || (typeof found.category === 'object' ? found.category?.name : found.category);
        }
      }

      if (!parentCatName) {
        for (const cat of MASTER_CATEGORIES_WITH_SUBCATS) {
          const foundSub = cat.subcategories.find(sub => sub.name.toLowerCase() === nextSub.toLowerCase());
          if (foundSub) {
            parentCatName = cat.name;
            break;
          }
        }
      }

      if (parentCatName) {
        setSelectedCategory(parentCatName);
      }
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen md:h-screen bg-[#f4f6f9] flex flex-col font-sans text-slate-800 overflow-x-hidden md:overflow-hidden">
      
      {/* Top Navbar */}
      <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row p-3 md:p-4 md:px-6 md:py-4 gap-4 md:gap-6 w-full max-w-full overflow-x-hidden md:overflow-hidden relative">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Main Content */}
        <main className="flex-1 space-y-4 min-w-0 w-full overflow-y-auto pr-0 md:pr-1 custom-scrollbar">
          
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

                {/* 1. TOP METRICS GRID (6 CARDS IN 2 ROWS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {metrics.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="relative bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between min-h-[180px] overflow-hidden group cursor-default"
                      >
                        {/* Top Accent Line & Subtle Glow */}
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${item.progressBg}`} />
                        <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${item.bgGlow} rounded-bl-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />

                        <div>
                          {/* Header Row: Icon & Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className={`p-2 rounded-xl border ${item.iconBg} shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                              <Icon size={24} className="shrink-0" />
                            </div>
                            {item.badge && (
                              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap ${item.badgeBg}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <span className="text-base md:text-lg font-black text-slate-800 block truncate group-hover:text-slate-900 transition-colors">
                            {item.title}
                          </span>

                          {/* Stat Value */}
                          <div className="mt-1">
                            <span className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                              {item.value}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar & Subtitle */}
                        <div className="mt-2 pt-2 border-t border-slate-100/80">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5 p-0.5 border border-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${item.progressBg} ${item.progress}`}
                            />
                          </div>
                          <span className="text-xs md:text-sm text-slate-700 font-extrabold block truncate">
                            {item.subText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ACTIVE CASCADE FILTER STATUS BAR WITH DROPDOWNS ⭐ */}
                <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md border border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap text-xs flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[#f26522] font-black uppercase tracking-wider text-[11px] shrink-0">
                      <Filter size={15} />
                      <span>CASCADE FILTER:</span>
                    </div>

                    {/* State Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-[#f26522]">
                      <label className="text-slate-400 font-bold text-[11px] whitespace-nowrap">State:</label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateSelect(e.target.value, false)}
                        className="bg-transparent text-[#f26522] font-black text-xs border-none outline-none cursor-pointer pr-1"
                      >
                        <option value="All" className="bg-slate-900 text-white">All States</option>
                        {statesData.map((s, idx) => (
                          <option key={idx} value={s.state} className="bg-slate-900 text-white">
                            {s.state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-600 font-bold hidden sm:inline">→</span>

                    {/* Category Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-[#f26522]">
                      <label className="text-slate-400 font-bold text-[11px] whitespace-nowrap">Category:</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategorySelect(e.target.value, false)}
                        className="bg-transparent text-[#f26522] font-black text-xs border-none outline-none cursor-pointer pr-1"
                      >
                        <option value="All" className="bg-slate-900 text-white">All Categories</option>
                        {mainCategoryData.map((c, idx) => (
                          <option key={idx} value={c.category} className="bg-slate-900 text-white">
                            {c.category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-600 font-bold hidden sm:inline">→</span>

                    {/* Sub Category Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-[#f26522]">
                      <label className="text-slate-400 font-bold text-[11px] whitespace-nowrap">Sub Category:</label>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => handleSubCategorySelect(e.target.value, false)}
                        className="bg-transparent text-[#f26522] font-black text-xs border-none outline-none cursor-pointer pr-1"
                      >
                        <option value="All" className="bg-slate-900 text-white">All Sub Categories</option>
                        {activeSubCategoryData.map((sc, idx) => (
                          <option key={idx} value={sc.category} className="bg-slate-900 text-white">
                            {sc.category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(selectedState !== 'All' || selectedCategory !== 'All' || selectedSubCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedState('All');
                        setSelectedCategory('All');
                        setSelectedSubCategory('All');
                      }}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-[11px] font-bold border border-rose-500/40 transition-all cursor-pointer shrink-0 shadow-xs"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* UNIFIED FULL-WIDTH MASTER DATA TABLE ⭐ */}
                <MasterDataTable
                  statesData={statesData}
                  mainCategoryData={mainCategoryData}
                  activeSubCategoryData={activeSubCategoryData}
                  pendingPaymentsData={cascadeData?.pendingPayments}
                  selectedState={selectedState}
                  selectedCategory={selectedCategory}
                  selectedSubCategory={selectedSubCategory}
                  onStateSelect={handleStateSelect}
                  onCategorySelect={handleCategorySelect}
                  onSubCategorySelect={handleSubCategorySelect}
                  onAddCategory={handleAddMainCategory}
                  onAddSubCategory={handleAddSubCategory}
                />
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