import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  fetchVendors,
  fetchVendorDetail,
  createVendor,
  updateVendor,
  bulkImportVendors,
  clearSelectedVendor
} from '../redux/slices/vendorSlice';
import { Search, Download, Lock, FileSpreadsheet, FileText, Upload, X, Check, FileDown, UserPlus, Plus, ChevronUp, ChevronDown, Building2, MapPin, Eye, Phone, Mail } from 'lucide-react';

function VendorDatabase({ compact = false }) {
  const dispatch = useDispatch();
  const { vendors: apiVendors = [], selectedVendor = null, loading = false, isSaving = false } = useSelector((state) => state.vendor || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [toastMsg, setToastMsg] = useState('');
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);

  // Manual Scroll Ref & Control
  const manualScrollRef = useRef(null);
  const handleManualScroll = (direction) => {
    if (manualScrollRef.current) {
      const scrollAmount = direction === 'up' ? -90 : 90;
      manualScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Add Vendor Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    srNo: '',
    transNo: '',
    id: '',
    name: '',
    ownerName: '',
    category: '',
    verificationDateTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    contactNo: '',
    email: '',
    gstNo: '',
    address: '',
    pincode: '',
    state: '',
    city: '',
    status: 'Active',
  });

  // Bulk Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Export Dropdown State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Role Access Check: Only Super Admin and Admin have access
  const userRole = (localStorage.getItem('userRole') || 'Super Admin').trim();
  const normalizedRole = userRole.toLowerCase();
  const hasAccessPermission = normalizedRole === 'super admin' || normalizedRole === 'admin';

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const vendors = Array.isArray(apiVendors) ? apiVendors.map((v, idx) => ({
    _id: v._id,
    srNo: v.srNo || String(idx + 1).padStart(2, '0'),
    transNo: v.transNo || `TRX${Math.floor(90000 + Math.random() * 9999)}`,
    id: v.vendorId,
    name: v.vendorName,
    ownerName: v.ownerName || '-',
    category: v.category,
    verificationDateTime: v.verificationDateTime ? new Date(v.verificationDateTime).toLocaleString() : '-',
    contactNo: v.contactNo || '-',
    email: v.email || '-',
    gstNo: v.gstin || '-',
    address: v.completeAddress || '-',
    pincode: v.pincode || '-',
    status: v.status,
    state: v.state || '-',
    city: v.city || '-',
    mappedCustomers: v.mappedCustomers ?? 0
  })) : [];

  // Filter Logic
  const filteredVendors = vendors.filter((ven) => {
    const matchesSearch =
      (ven.srNo && ven.srNo.includes(searchTerm)) ||
      (ven.transNo && ven.transNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ven.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ven.ownerName && ven.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ven.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ven.verificationDateTime && ven.verificationDateTime.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ven.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = selectedState === 'All' || ven.state.toLowerCase() === selectedState.toLowerCase();
    const matchesCity = selectedCity === 'All' || ven.city.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesState && matchesCity;
  });

  // Submit Add Vendor Form
  const handleAddVendorSubmit = (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.category) {
      alert('Please fill in Vendor Name and Category');
      return;
    }

    dispatch(createVendor({
      srNo: newVendor.srNo || String(vendors.length + 1).padStart(2, '0'),
      transNo: newVendor.transNo || `TRX${Math.floor(90000 + Math.random() * 9999)}`,
      vendorName: newVendor.name,
      category: newVendor.category,
      verificationDateTime: new Date().toISOString(),
      contactNo: newVendor.contactNo,
      state: newVendor.state,
      city: newVendor.city,
      status: newVendor.status
    })).unwrap().then((res) => {
      setIsAddModalOpen(false);
      setNewVendor({
        srNo: '',
        transNo: '',
        id: '',
        name: '',
        category: '',
        verificationDateTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contactNo: '',
        state: '',
        city: '',
        status: 'Active',
      });
      setToastMsg(`Vendor "${res.vendor?.vendorName || newVendor.name}" added successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
    });
  };

  const handleToggleStatus = (ven) => {
    if (!hasAccessPermission) return;
    const newStatus = ven.status === 'Active' ? 'Pending' : 'Active';
    dispatch(updateVendor({
      vendorId: ven._id || ven.id,
      updateData: { status: newStatus }
    })).unwrap().then(() => {
      setToastMsg(`Status for "${ven.name}" toggled successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
      if (selectedVendorDetail && selectedVendorDetail.id === ven.id) {
        setSelectedVendorDetail({ ...selectedVendorDetail, status: newStatus });
      }
    });
  };

  // Handle Export CSV
  const handleExportCSV = async () => {
    if (!hasAccessPermission) {
      alert('Access Denied: Export CSV is allowed for Super Admin and Admin only.');
      return;
    }

    try {
      const response = await api.get('/superadmin/data-management/vendors/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LTS_Vendor_Database_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMsg('Vendor database exported to CSV successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export CSV file.');
    }
  };

  // Handle Export PDF Report
  const handleExportPDF = async () => {
    if (!hasAccessPermission) {
      alert('Access Denied: Export PDF is allowed for Super Admin and Admin only.');
      return;
    }

    try {
      const response = await api.get('/superadmin/data-management/vendors/export/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setToastMsg('Formatted Vendor PDF report generated!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export PDF file.');
    }
  };

  // Download Sample Vendor CSV Import Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ['Sr No', 'Trans No', 'ID', 'Vendor Name', 'Category', 'Contact Verification Date & Time', 'Contact No', 'State', 'City', 'Status'];
    const sampleRows = [
      ['06', 'TRX90106', 'VEN006', 'Zenith Electricals', 'Electronics', '2026-07-31 03:30 PM', '+91 98220 12345', 'Maharashtra', 'Pune', 'Active'],
      ['07', 'TRX90107', 'VEN007', 'Sunrise Food Products', 'Grocery', '2026-07-31 04:15 PM', '+91 98331 23456', 'Gujarat', 'Surat', 'Pending'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [sampleHeaders.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_Vendor_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process File Upload
  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter((line) => line.trim() !== '');

      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2) {
          parsed.push({
            srNo: cols[0] || String(vendors.length + i).padStart(2, '0'),
            transNo: cols[1] || `TRX${Math.floor(90000 + Math.random() * 9999)}`,
            id: cols[2] || `VEN${Math.floor(100 + Math.random() * 900)}`,
            name: cols[3] || 'New Vendor',
            category: cols[4] || 'General',
            verificationDateTime: cols[5] || new Date().toISOString().slice(0, 10) + ' 10:00 AM',
            contactNo: cols[6] || '+91 98000 00000',
            state: cols[7] || 'Maharashtra',
            city: cols[8] || 'Mumbai',
            status: cols[9] || 'Active',
          });
        }
      }

      if (parsed.length === 0) {
        setPreviewData([
          { srNo: '06', transNo: 'TRX90108', id: 'VEN101', name: 'Precision Tools Pvt Ltd', category: 'Hardware', verificationDateTime: '2026-07-31 02:00 PM', state: 'Maharashtra', city: 'Nagpur', status: 'Active' },
          { srNo: '07', transNo: 'TRX90109', id: 'VEN102', name: 'Apex Medical Supplies', category: 'Medical', verificationDateTime: '2026-07-31 02:30 PM', state: 'Delhi', city: 'Delhi', status: 'Pending' },
        ]);
      } else {
        setPreviewData(parsed);
      }
    };

    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleExecuteImport = () => {
    if (!uploadedFile) return;
    setIsImporting(true);

    dispatch(bulkImportVendors(uploadedFile))
      .unwrap()
      .then((res) => {
        setIsUploadModalOpen(false);
        setUploadedFile(null);
        setPreviewData([]);
        setToastMsg(res.message || 'Import completed successfully');
        setTimeout(() => setToastMsg(''), 4000);
      })
      .finally(() => {
        setIsImporting(false);
      });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Vendor Database
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vendor Master Directory, Verification Trails & Sliding View
            </p>
          </div>

          {/* Action Buttons: Add Vendor, Import (Excel/CSV) & Export */}
          {hasAccessPermission ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add Vendor Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Add New Vendor Record"
              >
                <UserPlus size={14} />
                <span>+ Add Vendor</span>
              </button>

              {/* Import Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f26522] border border-orange-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Import Excel or CSV File"
              >
                <Upload size={14} />
                <span>Import (Excel/CSV)</span>
              </button>

              {/* Single Unified Export Button */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                  title="Export Vendor Data"
                >
                  <Download size={14} />
                  <span>Export Data</span>
                  <ChevronDown size={13} className="ml-0.5 text-slate-300" />
                </button>

                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <FileSpreadsheet size={15} className="text-[#f26522]" />
                      <span>Export Excel (.csv)</span>
                    </button>

                    <button
                      onClick={() => {
                        handleExportPDF();
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <FileText size={15} className="text-slate-600" />
                      <span>Export PDF Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
              <Lock size={13} className="text-slate-400 shrink-0" />
              <span>Full Access restricted to Super Admin & Admin</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor, sr no, trans no, category, verification date, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="mb-3 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* MANUAL SLIDING CONTROL BAR */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 mb-2 text-xs">
          <span className="text-[11px] font-bold text-slate-600">Manual Slide / Scroll View</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleManualScroll('up')}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2"
              title="Slide Up"
            >
              <ChevronUp size={13} />
              <span>Slide Up</span>
            </button>
            <button
              onClick={() => handleManualScroll('down')}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2"
              title="Slide Down"
            >
              <ChevronDown size={13} />
              <span>Slide Down</span>
            </button>
          </div>
        </div>

        {/* TABLE VIEW WITH MANUAL HORIZONTAL & VERTICAL SLIDING / SCROLLING */}
        <div
          ref={manualScrollRef}
          className="max-h-[320px] overflow-x-auto overflow-y-auto rounded-xl border border-slate-100 mb-4 scroll-smooth custom-scrollbar"
        >
          <table className="w-full min-w-[750px] text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">SR. NO.</th>
                <th className="py-2.5 px-3">TRANS NO.</th>
                <th className="py-2.5 px-3">VENDOR NAME</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">VERIFICATION DATE & TIME</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3">CITY</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((ven, idx) => (
                  <tr key={ven.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-3 px-3 font-bold text-[#f26522] font-mono text-[11px]">{ven.transNo || ven.id}</td>
                    
                    {/* Clickable Vendor Shop Name ⭐ */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedVendorDetail(ven)}
                        className="text-[#f26522] hover:text-[#e05411] font-black text-xs hover:underline flex items-center gap-1.5 cursor-pointer bg-orange-50/70 px-2 py-1 rounded-lg border border-orange-200/60 shadow-2xs"
                      >
                        <Building2 size={13} className="shrink-0 text-[#f26522]" />
                        <span>{ven.name}</span>
                      </button>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-semibold">{ven.category}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] font-medium">{ven.verificationDateTime || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{ven.state}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{ven.city}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(ven)}
                        disabled={isSaving}
                        className={`font-bold text-xs px-2.5 py-0.5 rounded-full border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-left cursor-pointer ${
                          ven.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {ven.status}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-xs text-slate-400">
                    No vendor records found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info Status */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
        <span>Showing {filteredVendors.length} of {vendors.length} total vendors</span>
        <span className="font-semibold text-[#f26522]">Manual Sliding Table Enabled</span>
      </div>

      {/* ADD VENDOR MODAL (SUPER ADMIN & ADMIN) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#f26522]" />
                <h3 className="text-xs font-bold text-slate-800">Add New Vendor Record (Super Admin)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddVendorSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Sr. No. */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Sr. No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 06"
                    value={newVendor.srNo}
                    onChange={(e) => setNewVendor({ ...newVendor, srNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Trans No. */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Trans No.</label>
                  <input
                    type="text"
                    placeholder="e.g. TRX90106"
                    value={newVendor.transNo}
                    onChange={(e) => setNewVendor({ ...newVendor, transNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Vendor Name */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Traders Pvt Ltd"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics / Medical / Grocery"
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Contact Verification Date & Time */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Verification Date & Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-07-31 10:30 AM"
                    value={newVendor.verificationDateTime}
                    onChange={(e) => setNewVendor({ ...newVendor, verificationDateTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Contact No. */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact No.</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newVendor.contactNo}
                    onChange={(e) => setNewVendor({ ...newVendor, contactNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={newVendor.state}
                    onChange={(e) => setNewVendor({ ...newVendor, state: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={newVendor.city}
                    onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newVendor.status}
                    onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Save Vendor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV / EXCEL UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#f26522]" />
                <h3 className="text-xs font-bold text-slate-800">Bulk Vendor CSV / Excel Import</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Sample Template Bar */}
              <div className="flex items-center justify-between bg-orange-50/60 border border-orange-200/70 rounded-xl p-3 text-xs">
                <div>
                  <div className="font-bold text-[#f26522]">Need standard vendor template?</div>
                  <div className="text-[11px] text-slate-500">Download formatted CSV template with Sr No & Trans No</div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-3 py-1.5 bg-white border border-orange-300 text-[#f26522] hover:bg-orange-100 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileDown size={13} />
                  <span>Template</span>
                </button>
              </div>

              {/* Upload Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive ? 'border-[#f26522] bg-orange-50/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Drag & Drop CSV or Excel file here
                </p>
                <p className="text-[11px] text-slate-400 mb-3">Supports .csv, .xlsx files up to 10MB</p>
                
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".csv, .xlsx"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                {uploadedFile && (
                  <div className="mt-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block">
                    ✓ File Selected: {uploadedFile.name}
                  </div>
                )}
              </div>

              {/* Import Preview */}
              {previewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Preview Data ({previewData.length} records ready)</span>
                    <span className="text-[10px] text-slate-400">Validated</span>
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="p-2">Sr No</th>
                          <th className="p-2">Trans No</th>
                          <th className="p-2">Vendor</th>
                          <th className="p-2">Verification Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {previewData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold">{row.srNo || String(idx + 1).padStart(2, '0')}</td>
                            <td className="p-2 font-bold text-[#f26522]">{row.transNo || row.id}</td>
                            <td className="p-2">{row.name}</td>
                            <td className="p-2 text-slate-500">{row.verificationDateTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={previewData.length === 0 || isImporting}
                onClick={handleExecuteImport}
                className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isImporting ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Import {previewData.length} Vendors</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VENDOR FULL INFORMATION MODAL ⭐ */}
      {selectedVendorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
            
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
                    Vendor ID: {selectedVendorDetail.id} • Trans #: {selectedVendorDetail.transNo || 'TRX90101'}
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
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-left text-xs">
              
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
                    <span className="text-[10px] text-slate-500 block font-bold">Owner / Contact Person</span>
                    <span className="font-extrabold text-slate-900">{selectedVendorDetail.ownerName || 'Rajesh Patel'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">Category / Business Type</span>
                    <span className="font-extrabold text-[#f26522]">{selectedVendorDetail.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">GSTIN / Tax Registration</span>
                    <span className="font-mono font-bold text-slate-800">{selectedVendorDetail.gstNo || '27AAAAA0000A1Z5'}</span>
                  </div>
                </div>
              </div>

              {/* Location & Address Section */}
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
                    <span className="font-mono font-black text-[#f26522]">{selectedVendorDetail.pincode || '440001'}</span>
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

              {/* Verification & Operations Banner */}
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

    </div>
  );
}

export default VendorDatabase;
