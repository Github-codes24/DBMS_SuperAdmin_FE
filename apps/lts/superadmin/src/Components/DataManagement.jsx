import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { State, City } from 'country-state-city';
import api from '../services/api';
import {
  lookupVendors,
  lookupVendorDetail,
  clearSelectedVendor
} from '../redux/slices/dataManagementSlice';
import { Search, MapPin, Building2, Filter, Database, Check, ChevronUp, ChevronDown, Download, FileSpreadsheet, FileText, X, Plus, Phone, Mail, Eye, ShieldCheck, Tag, ChevronLeft, User } from 'lucide-react';

function DataManagement({ compact = false }) {
  const dispatch = useDispatch();
  const { vendors: apiVendors = [], availableStates = [], availableCities = [], selectedVendor, loading } = useSelector((state) => state.dataManagement || {});

  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCodeFilter, setVendorCodeFilter] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'view-vendor'

  // Selected Vendor Detail State
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const exportDropdownRef = useRef(null);

  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  const allIndianStates = (State && typeof State.getStatesOfCountry === 'function') ? State.getStatesOfCountry('IN') : [];
  const stateList = ['All', ...allIndianStates.map(s => s.name)];

  const filteredStates = stateList.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedCity('All');
    setStateSearch('');
    setIsStateOpen(false);
  };

  const getDynamicCities = () => {
    if (selectedState === 'All') {
      return ['All'];
    }
    const stObj = allIndianStates.find(s => s.name.toLowerCase() === selectedState.toLowerCase());
    if (stObj) {
      const libCities = (City.getCitiesOfState('IN', stObj.isoCode) || []).map(c => c.name);
      return ['All', ...libCities];
    }
    return ['All'];
  };

  const cityList = getDynamicCities();
  const filteredCities = cityList.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setCitySearch('');
    setIsCityOpen(false);
  };

  // Debounced search / filter query dispatch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(lookupVendors({
        search: vendorCodeFilter || vendorSearch,
        state: selectedState,
        city: selectedCity
      }));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, vendorCodeFilter, vendorSearch, selectedState, selectedCity]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target)) {
        setIsStateOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      setSelectedVendorDetail(selectedVendor);
    }
  }, [selectedVendor]);

  // Clean up selected vendor detail state when exiting full page view
  const handleCloseDetail = () => {
    setSelectedVendorDetail(null);
    setViewMode('table');
    dispatch(clearSelectedVendor());
  };

  const handleViewDetails = (v) => {
    setSelectedVendorDetail(v);
    setViewMode('view-vendor');
    dispatch(lookupVendorDetail(v.id));
  };

  const masterVendorList = Array.isArray(apiVendors) ? apiVendors.map((v, idx) => ({
    id: v.vendorId || v.vendorCode || '',
    transNo: v.transNo || '',
    name: v.vendorName || v.shopVendorName || '',
    ownerName: v.ownerName || '-',
    category: v.category || '-',
    contactNo: v.contactNo || '-',
    email: v.email || '-',
    gstNo: v.gstin || '-',
    address: v.completeAddress || '-',
    pincode: v.pincode || '-',
    city: v.city || '-',
    state: v.state || '-',
    verificationDateTime: v.verificationDateTime ? new Date(v.verificationDateTime).toLocaleString() : '-',
    status: v.status || 'Active',
    mappedCustomers: v.mappedCustomers ?? 0
  })) : [];

  // Check if any filter or search is active ⭐
  const hasActiveFilter = Boolean(
    vendorSearch.trim() !== '' ||
    vendorCodeFilter.trim() !== '' ||
    selectedCity !== 'All' ||
    selectedState !== 'All'
  );

  const filteredVendors = masterVendorList;


  // Export CSV Report
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/superadmin/vendors/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LTS_Vendor_Code_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMsg('Vendor Code Data exported to CSV successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export CSV.');
    }
  };

  // Export PDF Report
  const handleExportPDF = async () => {
    try {
      const response = await api.get('/superadmin/vendors/export/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setToastMsg('Vendor Directory PDF report generated!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export PDF.');
    }
  };

  // Full-Page View Vendor Screen
  if (viewMode === 'view-vendor') {
    const v = selectedVendorDetail || {};
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-150 text-left">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseDetail}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <ChevronLeft size={14} />
              <span>Back to Vendor Lookup</span>
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-[#f26522]" />
                <span>Vendor Details: {v.name || 'Vendor Profile'}</span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                  {v.status || 'Active'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Vendor Code: <strong className="font-mono text-[#f26522]">{v.id || '-'}</strong> • Trans #: <strong className="font-mono text-slate-700">{v.transNo || 'TRX90101'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business & Owner Info Card */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={15} className="text-[#f26522]" />
              Business & Owner Profile
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200/50">
                <span className="font-semibold text-slate-500">Shop / Company Name:</span>
                <span className="font-extrabold text-slate-900">{v.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/50">
                <span className="font-semibold text-slate-500">Vendor Code:</span>
                <span className="font-mono font-extrabold text-[#f26522]">{v.id || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/50">
                <span className="font-semibold text-slate-500">Owner / Contact Person:</span>
                <span className="font-extrabold text-slate-900">{v.ownerName || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-500">GSTIN / Tax Registration:</span>
                <span className="font-mono font-bold text-slate-800">{v.gstNo || '27AAAAA0000A1Z5'}</span>
              </div>
            </div>
          </div>

          {/* Location & Address Section */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={15} className="text-[#f26522]" />
              Location & Address Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200/50">
                <span className="font-semibold text-slate-500">State:</span>
                <span className="font-bold text-slate-900">{v.state || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/50">
                <span className="font-semibold text-slate-500">City:</span>
                <span className="font-bold text-slate-900">{v.city || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/50">
                <span className="font-semibold text-slate-500">Pincode Area:</span>
                <span className="font-mono font-black text-slate-700">{v.pincode || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-500">Complete Address:</span>
                <span className="font-bold text-slate-800 max-w-xs text-right">{v.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Phone size={15} className="text-[#f26522]" />
              Contact Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200/50">
                <span className="font-semibold text-slate-500">Contact Number:</span>
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                  <Phone size={13} className="text-[#f26522]" />
                  <span>{v.contactNo || '-'}</span>
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-500">Email Address:</span>
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                  <Mail size={13} className="text-[#f26522]" />
                  <span>{v.email || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verification Date & Time</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">
                {v.verificationDateTime || '-'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mapped Customers</div>
              <div className="text-sm font-black text-[#f26522] mt-0.5">
                {v.mappedCustomers || 0} Customers
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCloseDetail}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Back to Vendor Lookup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database size={18} className="text-[#f26522]" />
            <span>Data Management - Vendor Code Lookup System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search vendors by Vendor Code (e.g. VEN001, VEN002), State & City (e.g. Maharashtra). Click any Shop Name to view complete vendor details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export Vendors</span>
              <ChevronDown size={13} className="ml-0.5 text-slate-300" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150 text-left">
                <button
                  onClick={() => { handleExportCSV(); setIsExportDropdownOpen(false); }}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="text-[#f26522]" />
                  <span>Export Excel (.csv)</span>
                </button>

                <button
                  onClick={() => { handleExportPDF(); setIsExportDropdownOpen(false); }}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText size={15} className="text-slate-600" />
                  <span>Export PDF Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VENDOR CODE, CITY & STATE SEARCH FILTER BAR ⭐ */}
      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={14} className="text-[#f26522]" />
            <span>Search Vendors by Vendor Code, State & City</span>
          </span>
          <button
            onClick={() => {
              setVendorSearch('');
              setVendorCodeFilter('');
              setSelectedState('All');
              setSelectedCity('All');
            }}
            className="text-[11px] font-bold text-[#f26522] hover:underline cursor-pointer"
          >
            Reset Search
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Vendor Code Search ⭐ */}
          <div className="relative">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f26522]" />
            <input
              type="text"
              placeholder="Vendor Code (e.g. VEN001, VEN002)"
              value={vendorCodeFilter}
              onChange={(e) => setVendorCodeFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-extrabold text-[#f26522] placeholder:font-normal placeholder:text-slate-400 font-mono"
            />
          </div>

          {/* Vendor / Shop Name Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Vendor / Shop Name..."
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Searchable State Dropdown ⭐ */}
          <div className="relative" ref={stateDropdownRef}>
            <div
              onClick={() => { setIsStateOpen(!isStateOpen); setIsCityOpen(false); }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-slate-700 cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">{selectedState === 'All' ? 'State: All States' : selectedState}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isStateOpen ? 'rotate-180' : ''}`} />
            </div>

            {isStateOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in duration-150">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5 text-left">
                  {filteredStates.length > 0 ? (
                    filteredStates.map((s) => (
                      <div
                        key={s}
                        onClick={() => handleStateChange(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                          selectedState === s ? 'bg-orange-50 text-[#f26522] font-bold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {s === 'All' ? 'All States' : s}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400 text-center">No state found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Searchable City Dropdown ⭐ */}
          <div className="relative" ref={cityDropdownRef}>
            <div
              onClick={() => { setIsCityOpen(!isCityOpen); setIsStateOpen(false); }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-slate-700 cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">{selectedCity === 'All' ? 'City: All Cities' : selectedCity}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
            </div>

            {isCityOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in duration-150">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5 text-left">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((c) => (
                      <div
                        key={c}
                        onClick={() => handleCityChange(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                          selectedCity === c ? 'bg-orange-50 text-[#f26522] font-bold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {c === 'All' ? 'All Cities' : c}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400 text-center">No city found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
          <Check size={14} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC VENDOR DISPLAY (ONLY SHOWN WHEN SEARCHED / FILTERED) ⭐ */}
      {hasActiveFilter ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* VENDOR DATABASE TABLE VIEW BY STATE, CITY & VENDOR CODE ⭐ */}
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#f26522]" />
                <span className="font-extrabold text-slate-800">
                  Filtered Vendors List Table ({filteredVendors.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  • Click any Vendor to view complete profile & details
                </span>
              </div>
            </div>

            <div
              className="max-h-[350px] overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200/80 scroll-smooth custom-scrollbar shadow-2xs"
            >
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs z-10">
                  <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                    <th className="py-3 px-4">SR. NO.</th>
                    <th className="py-3 px-4">VENDOR CODE</th>
                    <th className="py-3 px-4">SHOP / VENDOR NAME</th>
                    <th className="py-3 px-4">OWNER NAME</th>
                    <th className="py-3 px-4">STATE & CITY</th>
                    <th className="py-3 px-4">CONTACT NO</th>
                    <th className="py-3 px-4">EMAIL</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium bg-white">
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map((v, idx) => (
                      <tr
                        key={v.id}
                        onClick={() => handleViewDetails(v)}
                        className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-bold text-slate-500">{idx + 1}</td>
                        
                        {/* Vendor Code ⭐ */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-black text-xs text-[#f26522] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/80 shadow-2xs">
                            {v.id}
                          </span>
                        </td>

                        {/* Clickable Shop Name ⭐ */}
                        <td className="py-3 px-4">
                          <div className="text-[#f26522] group-hover:underline font-black text-xs flex items-center gap-1.5">
                            <Building2 size={14} className="shrink-0 text-[#f26522]" />
                            <span>{v.name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-extrabold text-slate-900">{v.ownerName}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#f26522] shrink-0" />
                            <span>{v.state}, {v.city}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 font-bold">{v.contactNo}</td>
                        <td className="py-3 px-4 font-medium text-slate-600 truncate max-w-[150px]">{v.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-full font-bold text-[11px]">
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(v);
                            }}
                            title="View Info"
                            className="p-1.5 rounded-lg text-slate-600 border border-slate-200 hover:bg-orange-50 hover:text-[#f26522] hover:border-orange-200 transition-colors cursor-pointer inline-flex items-center justify-center"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-10 text-center text-xs text-slate-400 font-medium">
                        <Building2 size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600 text-sm">No vendors found matching your filter criteria.</p>
                        <p className="mt-1">Try selecting another State, City, or entering a different Vendor Code (e.g. VEN001, Maharashtra, Nagpur).</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* DATA HIDDEN BY DEFAULT UNTIL SEARCHED / FILTERED ⭐ */
        <div className="bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-3 animate-in fade-in duration-150">
          <div className="w-14 h-14 bg-orange-100/80 text-[#f26522] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <Search size={28} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">Vendor Data Hidden By Default</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Search by <strong className="text-[#f26522]">Vendor Code</strong> (e.g. VEN001), <strong className="text-slate-800">Shop Name</strong>, or select a <strong className="text-slate-800">State / City</strong> filter above to reveal matching vendor shops and full details.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-[#f26522] font-mono shadow-2xs">e.g. VEN001</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-2xs">e.g. Maharashtra</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-2xs">e.g. Nagpur</span>
          </div>
        </div>
      )}



      {/* Footer Info Status */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
        <span>Showing {filteredVendors.length} registered vendor shops</span>
        <span className="font-semibold text-[#f26522]">LTS Vendor Code Lookup Active</span>
      </div>
    </div>
  );
}

export default DataManagement;
