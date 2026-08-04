import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { vendorOrders } from '@/data/vendorMockData';

export const VendorDashboard = ({ onNavigate }) => {
  // Active Filter Selection matching reference screenshot
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedCategory, setSelectedCategory] = useState('Grocery & FMCG');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  // Search filter inputs inside card columns
  const [stateSearch, setStateSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // Initial Lists Data
  const [statesList, setStatesList] = useState([
    { name: 'Maharashtra', count: '1950958' },
    { name: 'Uttar Pradesh', count: '1280656' },
    { name: 'Tamil Nadu', count: '1175749' },
    { name: 'Gujarat', count: '1014905' },
    { name: 'Karnataka', count: '914058' },
    { name: 'Rajasthan', count: '737685' }
  ]);

  const [categoriesList, setCategoriesList] = useState([
    { name: 'Grocery & FMCG', count: '5420100' },
    { name: 'Electronics & IT', count: '4850400' },
    { name: 'Medical & Pharma', count: '3910550' },
    { name: 'Home Products & Kitchenware', count: '3420900' },
    { name: 'Hardware & Tools', count: '2890120' },
    { name: 'Fashion & Apparel', count: '2410800' }
  ]);

  // Sub categories dynamically updated based on active Category
  const grocerySubCategories = [
    { name: 'Supermarkets & Kirana', count: '510200' },
    { name: 'FMCG Wholesalers & Distributors', count: '320000' },
    { name: 'Dairy, Bakery & Frozen Foods', count: '210500' },
    { name: 'Organic & Health Foods', count: '150300' }
  ];

  const defaultSubCategories = [
    { name: 'Home Appliances', count: '4207936' },
    { name: 'Architecture', count: '1190209' },
    { name: 'Medical Sector', count: '964467' },
    { name: 'Grocery', count: '872028' },
    { name: 'Education', count: '843749' },
    { name: 'Fashion Accessories', count: '834068' }
  ];

  const subCategoriesList = selectedCategory === 'Grocery & FMCG' ? grocerySubCategories : defaultSubCategories;

  // Modal State: null | 'state' | 'category' | 'subCategory'
  const [activeModal, setActiveModal] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCount, setNewItemCount] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName) return;

    const count = newItemCount || '10000';
    if (activeModal === 'state') {
      setStatesList([...statesList, { name: newItemName, count }]);
    } else if (activeModal === 'category') {
      setCategoriesList([...categoriesList, { name: newItemName, count }]);
    }

    setNewItemName('');
    setNewItemCount('');
    setActiveModal(null);
  };

  const handleResetFilters = () => {
    setSelectedState('All');
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setStateSearch('');
    setCategorySearch('');
    setSubCategorySearch('');
  };

  // Filtered lists
  const filteredStates = statesList.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  const filteredCategories = categoriesList.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  const filteredSubCategories = subCategoriesList.filter(s => s.name.toLowerCase().includes(subCategorySearch.toLowerCase()));

  return (
    <div className="space-y-6 font-sans">
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
          <span>Store Active & Verified</span>
        </div>
      </div>

      {/* 6 KPI Metric Cards Row matching Super Admin screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: New Vendors / Total Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Total Products</span>
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">10%</span>
          </div>
          <p className="text-2xl font-black text-[#172033]">48</p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-orange-500 h-1 rounded-full w-[80%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Total Catalog : 48 items</span>
        </div>

        {/* Card 2: Active Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Active Products</span>
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">10%</span>
          </div>
          <p className="text-2xl font-black text-[#172033]">373</p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-cyan-500 h-1 rounded-full w-[90%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Live Store : 42 items</span>
        </div>

        {/* Card 3: Orders Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Orders Today</span>
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">15%</span>
          </div>
          <p className="text-2xl font-black text-[#172033]">17</p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full w-[60%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Pending Dispatch : 7</span>
        </div>

        {/* Card 4: Pending Queries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Pending Queries</span>
            <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">0%</span>
          </div>
          <p className="text-2xl font-black text-[#172033]">0</p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-amber-500 h-1 rounded-full w-[10%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Action Required : 0</span>
        </div>

        {/* Card 5: Vendor Activity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Vendor Activity</span>
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">98%</span>
          </div>
          <p className="text-2xl font-black text-[#172033]">1006</p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full w-[95%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Pending Quality : 229</span>
        </div>

        {/* Card 6: Online Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 truncate">Online Users</span>
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">101%</span>
          </div>
          <p className="text-2xl font-black text-[#172033]">149</p>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-pink-500 h-1 rounded-full w-[85%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Active Sessions : 149</span>
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
                  {statesList.length} Total
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={() => setActiveModal('state')}
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
              {filteredStates.map((st) => {
                const isSelected = selectedState === st.name;
                return (
                  <div
                    key={st.name}
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
                    <span className={`font-extrabold ${isSelected ? 'text-[#F97316]' : 'text-slate-600'}`}>{st.count}</span>
                  </div>
                );
              })}
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
                  {categoriesList.length} Total
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={() => setActiveModal('category')}
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
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <div
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
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
                    <span className={`font-extrabold ${isSelected ? 'text-[#F97316]' : 'text-slate-600'}`}>{cat.count}</span>
                  </div>
                );
              })}
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
                  {subCategoriesList.length} Total
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={() => setActiveModal('category')}
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
              {filteredSubCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub.name;
                return (
                  <div
                    key={sub.name}
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
                    <span className={`font-extrabold ${isSelected ? 'text-[#F97316]' : 'text-slate-600'}`}>{sub.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Pending Vendor Payment Card matching screenshot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#172033] tracking-wide">
              PENDING VENDOR PAYMENT
            </span>
            <span className="bg-[#E6F4EA] text-[#137333] font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-200/80">
              Up to date
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto py-8">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
              <Layers className="w-8 h-8 text-slate-400 opacity-80" />
            </div>
            <h4 className="text-sm font-extrabold text-[#172033]">No Pending Payments</h4>
            <p className="text-xs text-slate-400 font-medium max-w-[200px] leading-relaxed">
              All vendor payouts & invoices are cleared.
            </p>
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
              {vendorOrders.slice(0, 4).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-[#172033]">{ord.id}</td>
                  <td className="py-3 font-semibold text-[#172033]">{ord.customer}</td>
                  <td className="py-3 text-slate-500 max-w-xs truncate">{ord.products}</td>
                  <td className="py-3 font-bold text-[#172033]">₹{ord.amount}</td>
                  <td className="py-3 font-bold">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] ${
                      ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal Dialog for "+ Add" Action */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#172033]">
                Add New {activeModal === 'state' ? 'State' : 'Category'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Enter ${activeModal} name...`}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
                  Estimated Vendor / Item Count
                </label>
                <input
                  type="text"
                  value={newItemCount}
                  onChange={(e) => setNewItemCount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
