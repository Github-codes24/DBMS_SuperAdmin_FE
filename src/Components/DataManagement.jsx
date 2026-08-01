import React, { useState, useRef } from 'react';
import { Search, MapPin, Building2, Filter, Database, Check, ChevronUp, ChevronDown, Download, FileSpreadsheet, FileText, X, Plus, Phone, Mail, Eye, ShieldCheck, Tag } from 'lucide-react';

function DataManagement({ compact = false }) {
  // Master Vendor & Shop Database per Vendor Code, City & State
  const [masterVendorList, setMasterVendorList] = useState([
    {
      id: 'VEN001',
      transNo: 'TRX90101',
      name: 'ABC Traders Pvt Ltd',
      ownerName: 'Rajesh Patel',
      category: 'Grocery & FMCG Supplies',
      contactNo: '+91 98920 11223',
      email: 'contact@abctraders.com',
      gstNo: '27AAAAA0000A1Z5',
      address: 'Shop #12, Commercial Hub, Central Ave, Wardha Road',
      pincode: '440001',
      city: 'Nagpur',
      state: 'Maharashtra',
      verificationDateTime: '2026-07-30 10:30 AM',
      status: 'Active',
      mappedCustomers: 520,
    },
    {
      id: 'VEN002',
      transNo: 'TRX90102',
      name: 'Metro Supplies & Logistics',
      ownerName: 'Sanjay Deshmukh',
      category: 'Medical & Pharma Essentials',
      contactNo: '+91 98771 22334',
      email: 'sales@metrosupplies.in',
      gstNo: '27BBBBB1111B2Z6',
      address: 'Plot 45, MIDC Industrial Area, Hingna Road',
      pincode: '440012',
      city: 'Nagpur',
      state: 'Maharashtra',
      verificationDateTime: '2026-07-30 02:15 PM',
      status: 'Active',
      mappedCustomers: 420,
    },
    {
      id: 'VEN003',
      transNo: 'TRX90103',
      name: 'Priya Supermarket & Stores',
      ownerName: 'Priya Sharma',
      category: 'Home Products & Kitchenware',
      contactNo: '+91 98112 33445',
      email: 'priya@sharmatech.com',
      gstNo: '27CCCCC2222C3Z7',
      address: 'Sector 21, Hinjewadi Phase 1, Near IT Park',
      pincode: '411057',
      city: 'Pune',
      state: 'Maharashtra',
      verificationDateTime: '2026-07-31 09:45 AM',
      status: 'Active',
      mappedCustomers: 820,
    },
    {
      id: 'VEN004',
      transNo: 'TRX90104',
      name: 'XYZ Enterprise & Hardware',
      ownerName: 'Vikram Mehta',
      category: 'Electronics & Hardware Tools',
      contactNo: '+91 98334 55667',
      email: 'contact@xyzent.com',
      gstNo: '27DDDDD3333D4Z8',
      address: 'Shop #8, Linking Road, Bandra West',
      pincode: '400051',
      city: 'Mumbai',
      state: 'Maharashtra',
      verificationDateTime: '2026-07-31 11:20 AM',
      status: 'Active',
      mappedCustomers: 1450,
    },
    {
      id: 'VEN005',
      transNo: 'TRX90105',
      name: 'Delhi Retail World',
      ownerName: 'Rajesh Gupta',
      category: 'Grocery & Fashion Accessories',
      contactNo: '+91 98556 77889',
      email: 'info@delhiretail.com',
      gstNo: '07EEEEE4444E5Z9',
      address: 'Block A, Connaught Place Main Market',
      pincode: '110001',
      city: 'Delhi',
      state: 'Delhi',
      verificationDateTime: '2026-07-31 01:10 PM',
      status: 'Active',
      mappedCustomers: 910,
    },
    {
      id: 'VEN006',
      transNo: 'TRX90106',
      name: 'Hyderabad Tech Mart',
      ownerName: 'Sunita Reddy',
      category: 'Electronics & Mobile Accessories',
      contactNo: '+91 98667 88990',
      email: 'sunita@techmart.in',
      gstNo: '36FFFFF5555F6Z0',
      address: 'HITEC City Phase 2, Madhapur',
      pincode: '500081',
      city: 'Hyderabad',
      state: 'Telangana',
      verificationDateTime: '2026-07-31 03:30 PM',
      status: 'Active',
      mappedCustomers: 1100,
    },
    {
      id: 'VEN007',
      transNo: 'TRX90107',
      name: 'Apex Hardware & Tools',
      ownerName: 'Amit Patel',
      category: 'Hardware & Construction',
      contactNo: '+91 98993 44556',
      email: 'sales@apexhardware.in',
      gstNo: '24GGGGG6666G7Z1',
      address: 'CG Road, Navrangpura',
      pincode: '380001',
      city: 'Ahmedabad',
      state: 'Gujarat',
      verificationDateTime: '2026-07-31 11:20 AM',
      status: 'Active',
      mappedCustomers: 650,
    },
  ]);

  // Filter States: Vendor Code, City, State & Vendor Name Search ⭐
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCodeFilter, setVendorCodeFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  // Selected Vendor Detail Modal State
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const exportDropdownRef = useRef(null);
  const manualScrollRef = useRef(null);

  const cityList = ['All', 'Nagpur', 'Pune', 'Mumbai', 'Delhi', 'Hyderabad', 'Ahmedabad'];
  const stateList = ['All', 'Maharashtra', 'Delhi', 'Gujarat', 'Telangana'];

  // Check if any filter or search is active ⭐
  const hasActiveFilter = Boolean(
    vendorSearch.trim() !== '' ||
    vendorCodeFilter.trim() !== '' ||
    selectedCity !== 'All' ||
    selectedState !== 'All'
  );
  const filteredVendors = masterVendorList.filter((v) => {
    const matchesVendorSearch =
      !vendorSearch ||
      v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(vendorSearch.toLowerCase());

    const matchesVendorCode = !vendorCodeFilter || v.id.toLowerCase().includes(vendorCodeFilter.toLowerCase());
    const matchesCity = selectedCity === 'All' || v.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesState = selectedState === 'All' || v.state.toLowerCase() === selectedState.toLowerCase();

    return matchesVendorSearch && matchesVendorCode && matchesCity && matchesState;
  });

  // Manual Scroll
  const handleManualScroll = (direction) => {
    if (manualScrollRef.current) {
      const scrollAmount = direction === 'up' ? -90 : 90;
      manualScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['Sr. No.', 'Vendor Code', 'Shop Name', 'Owner Name', 'Category', 'Contact No', 'Email', 'City', 'State', 'Pincode', 'GSTIN', 'Status'];
    const rows = filteredVendors.map((v, idx) => [idx + 1, v.id, v.name, v.ownerName, v.category, v.contactNo, v.email, v.city, v.state, v.pincode, v.gstNo, v.status]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LTS_Vendor_Code_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('Vendor Code Data exported to CSV successfully!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LTS Vendor Directory Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 25px; color: #1e293b; }
            .header { border-b: 2px solid #f26522; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: 800; color: #f26522; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background-color: #f8fafc; color: #475569; padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; }
            td { padding: 8px 10px; border: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">LTS - Local Trade Street</h1>
              <div style="font-size: 11px; color: #64748b;">Vendor Directory by Vendor Code, City & State</div>
            </div>
            <div style="font-size: 11px; color: #64748b;">Total Vendors: ${filteredVendors.length}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Vendor Code</th>
                <th>Shop Name</th>
                <th>Owner Name</th>
                <th>Contact</th>
                <th>City & State</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredVendors
                .map(
                  (v, idx) => `
                <tr>
                  <td><strong>${idx + 1}</strong></td>
                  <td><strong>${v.id}</strong></td>
                  <td><strong>${v.name}</strong></td>
                  <td>${v.ownerName}</td>
                  <td>${v.contactNo}</td>
                  <td>${v.city}, ${v.state}</td>
                  <td>${v.status}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    setToastMsg('Vendor Directory PDF report generated!');
    setTimeout(() => setToastMsg(''), 3500);
  };

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
            Search vendors by Vendor Code (e.g. VEN001, VEN002), City & State (e.g. Maharashtra). Click any Shop Name to view complete vendor details.
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
            <span>Search Vendors by Vendor Code, City & State</span>
          </span>
          <button
            onClick={() => {
              setVendorSearch('');
              setVendorCodeFilter('');
              setSelectedCity('All');
              setSelectedState('All');
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

          {/* Select City Dropdown ⭐ */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-slate-700 cursor-pointer"
            >
              <option value="All">City: All Cities</option>
              {cityList.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Select State Dropdown (e.g. Maharashtra) ⭐ */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-slate-700 cursor-pointer"
            >
              <option value="All">State: All States</option>
              {stateList.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
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
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleManualScroll('up')}
                  className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2"
                >
                  <ChevronUp size={13} />
                  <span>Slide Up</span>
                </button>
                <button
                  onClick={() => handleManualScroll('down')}
                  className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2"
                >
                  <ChevronDown size={13} />
                  <span>Slide Down</span>
                </button>
              </div>
            </div>

            <div
              ref={manualScrollRef}
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
                        onClick={() => setSelectedVendorDetail(v)}
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
                            <span>{v.city}, {v.state}</span>
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
                              setSelectedVendorDetail(v);
                            }}
                            className="px-3 py-1 bg-orange-50 group-hover:bg-[#f26522] text-[#f26522] group-hover:text-white border border-orange-200 group-hover:border-[#f26522] font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>View Info</span>
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

      {/* VENDOR SHOP FULL INFORMATION MODAL ⭐ */}
      {selectedVendorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f26522] text-white flex items-center justify-center font-bold shadow-md">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black tracking-tight">{selectedVendorDetail.name}</h3>
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase">
                      {selectedVendorDetail.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Vendor Code: {selectedVendorDetail.id} • Trans #: {selectedVendorDetail.transNo || 'TRX90101'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
              
              {/* Business & Owner Info Card */}
              <div className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-[11px] font-black uppercase text-[#f26522] tracking-wider flex items-center gap-1.5">
                  <Building2 size={13} />
                  <span>Business & Owner Profile</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-800 font-medium">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Shop / Company Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{selectedVendorDetail.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Vendor Code</span>
                    <span className="font-mono font-extrabold text-[#f26522] text-sm">{selectedVendorDetail.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Owner / Contact Person</span>
                    <span className="font-extrabold text-slate-900">{selectedVendorDetail.ownerName || 'Rajesh Patel'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">GSTIN / Tax Registration</span>
                    <span className="font-mono font-bold text-slate-800">{selectedVendorDetail.gstNo || '27AAAAA0000A1Z5'}</span>
                  </div>
                </div>
              </div>

              {/* Location & Address Section ⭐ */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#f26522]" />
                  <span>Location & Address Details</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">State</span>
                    <span className="font-extrabold text-slate-900">{selectedVendorDetail.state}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">City</span>
                    <span className="font-extrabold text-slate-900">{selectedVendorDetail.city}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Pincode Area</span>
                    <span className="font-mono font-black text-slate-700">{selectedVendorDetail.pincode || '440001'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-[10px] text-slate-500 block font-bold">Complete Shop Address</span>
                    <span className="font-bold text-slate-800">
                      {selectedVendorDetail.address || 'Shop No. 12, Main Commercial Complex, MG Road'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-bold">Vendor Contact Number</span>
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                    <Phone size={13} className="text-[#f26522]" />
                    <span>{selectedVendorDetail.contactNo || '+91 98920 11223'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-bold">Vendor Email Address</span>
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-900 truncate">
                    <Mail size={13} className="text-[#f26522]" />
                    <span className="truncate">{selectedVendorDetail.email || 'contact@vendor.com'}</span>
                  </div>
                </div>
              </div>

              {/* Verification Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verification Date & Time</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {selectedVendorDetail.verificationDateTime || '2026-07-30 10:30 AM'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mapped Customers</div>
                  <div className="text-sm font-black text-[#f26522] mt-0.5">
                    {selectedVendorDetail.mappedCustomers || 520} Customers
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">LTS Verified Enterprise Vendor Profile</span>
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Close Profile
              </button>
            </div>

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
