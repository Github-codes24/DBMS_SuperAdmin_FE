import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../services/api';
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  bulkImportCustomers 
} from '../redux/slices/customerSlice';
import { Search, Download, Lock, FileSpreadsheet, FileText, Upload, X, Check, FileDown, UserPlus, Plus, ChevronUp, ChevronDown } from 'lucide-react';

function CustomerDatabase({ compact = false }) {
  const dispatch = useDispatch();
  const { customers: apiCustomers = [], loading = false, isSaving = false } = useSelector((state) => state.customer || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState('');

  // Manual Scroll Ref & Control (No Automatic Timer)
  const manualScrollRef = useRef(null);
  const handleManualScroll = (direction) => {
    if (manualScrollRef.current) {
      const scrollAmount = direction === 'up' ? -90 : 90;
      manualScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Add Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    srNo: '',
    id: '',
    name: '',
    companyName: '',
    state: '',
    city: '',
    pincode: '',
    regDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    telecaller: 'TC014',
    email: '',
    mobile: '',
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
    dispatch(fetchCustomers());
  }, [dispatch]);

  const customers = Array.isArray(apiCustomers) ? apiCustomers.map((cust, idx) => ({
    _id: cust._id,
    srNo: cust.srNo || String(idx + 1).padStart(2, '0'),
    id: cust.customerId,
    name: cust.name,
    companyName: cust.companyName,
    state: cust.state,
    city: cust.city,
    pincode: cust.pincode,
    regDate: cust.registrationDate ? new Date(cust.registrationDate).toISOString().slice(0, 10) : '-',
    status: cust.status,
    telecaller: cust.assignedTelecaller || 'Unassigned',
    email: cust.email || '-',
    mobile: cust.mobile || '-',
  })) : [];

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.companyName && cust.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cust.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.state && cust.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.city && cust.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.pincode && cust.pincode.includes(searchTerm)) ||
      cust.telecaller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Submit New Customer Form (Super Admin Access)
  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.companyName) {
      alert('Please fill in Customer Name and Company Name');
      return;
    }

    dispatch(createCustomer({
      name: newCustomer.name,
      companyName: newCustomer.companyName,
      state: newCustomer.state,
      city: newCustomer.city,
      pincode: newCustomer.pincode,
      status: newCustomer.status,
      assignedTelecaller: newCustomer.telecaller
    })).unwrap().then((res) => {
      setIsAddModalOpen(false);
      setNewCustomer({
        srNo: '',
        id: '',
        name: '',
        companyName: '',
        state: '',
        city: '',
        pincode: '',
        regDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
        telecaller: 'TC014',
        email: '',
        mobile: '',
      });
      setToastMsg(`Customer "${res.customer?.name || newCustomer.name}" added successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
    });
  };

  const handleToggleStatus = (cust) => {
    if (!hasAccessPermission) return;
    const newStatus = cust.status === 'Active' ? 'Pending' : 'Active';
    dispatch(updateCustomer({
      customerId: cust._id || cust.id,
      updateData: { status: newStatus }
    })).unwrap().then(() => {
      setToastMsg(`Status for "${cust.name}" toggled successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
    });
  };

  // Handle Export CSV
  const handleExportCSV = async () => {
    if (!hasAccessPermission) {
      alert('Access Denied: Export CSV is allowed for Super Admin and Admin only.');
      return;
    }

    try {
      const response = await api.get('/superadmin/customers/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LTS_Customer_Database_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMsg('Customer CSV exported successfully!');
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
      const response = await api.get('/superadmin/customers/export/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setToastMsg('Formatted Customer PDF report generated!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export PDF file.');
    }
  };

  // Download Sample CSV Import Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ['Sr No', 'ID', 'Name', 'Company Name', 'State', 'City', 'Pincode', 'Registration Date', 'Status', 'Telecaller'];
    const sampleRows = [
      ['06', 'CUST006', 'Global Logistics', 'Global Logistics Ltd', 'Maharashtra', 'Pune', '411001', '2026-06-15', 'Active', 'TC014'],
      ['07', 'CUST007', 'Prime Pharma', 'Prime Pharma Pvt Ltd', 'Gujarat', 'Surat', '395001', '2026-07-01', 'Pending', 'TC021'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [sampleHeaders.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_Customer_Import_Template.csv');
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
            srNo: cols[0] || String(customers.length + i).padStart(2, '0'),
            id: cols[1] || `CUST${Math.floor(100 + Math.random() * 900)}`,
            name: cols[2] || 'New Customer',
            companyName: cols[3] || 'Trading Co.',
            state: cols[4] || 'Maharashtra',
            city: cols[5] || 'Mumbai',
            pincode: cols[6] || '400001',
            regDate: cols[7] || new Date().toISOString().slice(0, 10),
            status: cols[8] || 'Active',
            telecaller: cols[9] || 'TC014',
          });
        }
      }

      if (parsed.length === 0) {
        setPreviewData([
          { srNo: '06', id: 'CUST101', name: 'Star Retailers', companyName: 'Star Retail Pvt Ltd', state: 'Maharashtra', city: 'Nagpur', pincode: '440001', regDate: '2026-07-28', status: 'Active', telecaller: 'TC014' },
          { srNo: '07', id: 'CUST102', name: 'Velocity Tech', companyName: 'Velocity Solutions', state: 'Delhi', city: 'Delhi', pincode: '110002', regDate: '2026-07-29', status: 'Pending', telecaller: 'TC021' },
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

    dispatch(bulkImportCustomers(uploadedFile))
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
              Customer Database
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin Master Customer Directory & Sliding View
            </p>
          </div>

          {/* Action Buttons: Add Customer, Import (Excel/CSV) & Export */}
          {hasAccessPermission ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add Customer Button (Super Admin Access) */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Add New Customer Record"
              >
                <UserPlus size={14} />
                <span>+ Add Customer</span>
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
                  title="Export Customer Data"
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

        {/* Search Bar & Filters */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, state, city, pincode..."
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
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">SR. NO.</th>
                <th className="py-2.5 px-3">NAME</th>
                <th className="py-2.5 px-3">COMPANY NAME</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3">CITY</th>
                <th className="py-2.5 px-3">PINCODE</th>
                <th className="py-2.5 px-3">REG. DATE</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust, idx) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{cust.name}</td>
                    <td className="py-3 px-3 font-bold text-[#f26522]">{cust.companyName || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{cust.state || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{cust.city || '-'}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] font-semibold">{cust.pincode || '-'}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{cust.regDate || '-'}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cust)}
                        disabled={isSaving}
                        className={`font-semibold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                          cust.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                        title="Click to toggle status"
                      >
                        {cust.status}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-xs text-slate-400">
                    No customer records found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info Status */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
        <span>Showing {filteredCustomers.length} of {customers.length} total customer records</span>
        <span className="font-semibold text-[#f26522]">Manual Sliding Table Enabled</span>
      </div>

      {/* ADD CUSTOMER MODAL (SUPER ADMIN ACCESS) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#f26522]" />
                <h3 className="text-xs font-bold text-slate-800">Add New Customer Record (Super Admin)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCustomerSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Sr. No. */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Sr. No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 06"
                    value={newCustomer.srNo}
                    onChange={(e) => setNewCustomer({ ...newCustomer, srNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Company Name */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Global Trade Enterprises Pvt Ltd"
                    value={newCustomer.companyName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Nagpur"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 440001"
                    value={newCustomer.pincode}
                    onChange={(e) => setNewCustomer({ ...newCustomer, pincode: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={newCustomer.regDate}
                    onChange={(e) => setNewCustomer({ ...newCustomer, regDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Telecaller */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Telecaller</label>
                  <input
                    type="text"
                    placeholder="e.g. TC014"
                    value={newCustomer.telecaller}
                    onChange={(e) => setNewCustomer({ ...newCustomer, telecaller: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
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
                  <span>Save Customer</span>
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
                <h3 className="text-xs font-bold text-slate-800">Bulk Customer CSV / Excel Import</h3>
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
                  <div className="font-bold text-[#f26522]">Need standard customer template?</div>
                  <div className="text-[11px] text-slate-500">Download formatted CSV template with all fields</div>
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
                          <th className="p-2">Name</th>
                          <th className="p-2">Company</th>
                          <th className="p-2">Pincode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {previewData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold">{row.srNo || row.id}</td>
                            <td className="p-2">{row.name}</td>
                            <td className="p-2 text-slate-700 font-bold">{row.companyName}</td>
                            <td className="p-2 text-slate-500">{row.pincode}</td>
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
                    <span>Import {previewData.length} Customers</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CustomerDatabase;
