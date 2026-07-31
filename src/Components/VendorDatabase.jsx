import React, { useState, useRef } from 'react';
import { Search, Download, Lock, FileSpreadsheet, FileText, Upload, X, Check, FileDown, UserPlus, Plus, ChevronUp, ChevronDown } from 'lucide-react';

function VendorDatabase({ compact = false }) {
  const [vendors, setVendors] = useState([
    {
      srNo: '01',
      transNo: 'TRX90101',
      id: 'VEN001',
      name: 'ABC Pvt Ltd',
      category: 'Grocery',
      verificationDateTime: '2026-07-30 10:30 AM',
      contactNo: '+91 98920 11223',
      status: 'Active',
      state: 'Maharashtra',
      city: 'Mumbai',
    },
    {
      srNo: '02',
      transNo: 'TRX90102',
      id: 'VEN002',
      name: 'Metro Supplies',
      category: 'Medical',
      verificationDateTime: '2026-07-30 02:15 PM',
      contactNo: '+91 98771 22334',
      status: 'Pending',
      state: 'Delhi',
      city: 'New Delhi',
    },
    {
      srNo: '03',
      transNo: 'TRX90103',
      id: 'VEN003',
      name: 'Global Electronics',
      category: 'Electronics',
      verificationDateTime: '2026-07-31 09:45 AM',
      contactNo: '+91 98882 33445',
      status: 'Active',
      state: 'Karnataka',
      city: 'Bengaluru',
    },
    {
      srNo: '04',
      transNo: 'TRX90104',
      id: 'VEN004',
      name: 'Apex Hardware',
      category: 'Hardware',
      verificationDateTime: '2026-07-31 11:20 AM',
      contactNo: '+91 98993 44556',
      status: 'Active',
      state: 'Gujarat',
      city: 'Ahmedabad',
    },
    {
      srNo: '05',
      transNo: 'TRX90105',
      id: 'VEN005',
      name: 'Royal Furnishings',
      category: 'Home Products',
      verificationDateTime: '2026-07-31 01:10 PM',
      contactNo: '+91 98114 55667',
      status: 'Pending',
      state: 'Rajasthan',
      city: 'Jaipur',
    },
    {
      srNo: '06',
      transNo: 'TRX90106',
      id: 'VEN006',
      name: 'Zenith Electricals',
      category: 'Electronics',
      verificationDateTime: '2026-07-31 03:30 PM',
      contactNo: '+91 98220 12345',
      status: 'Active',
      state: 'Maharashtra',
      city: 'Pune',
    },
    {
      srNo: '07',
      transNo: 'TRX90107',
      id: 'VEN007',
      name: 'Sunrise Food Products',
      category: 'Grocery',
      verificationDateTime: '2026-07-31 04:15 PM',
      contactNo: '+91 98331 23456',
      status: 'Pending',
      state: 'Gujarat',
      city: 'Surat',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Manual Scroll Ref & Control (No Automatic Timer)
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
    category: '',
    verificationDateTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    contactNo: '',
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

  const filteredVendors = vendors.filter((ven) => {
    return (
      (ven.srNo && ven.srNo.includes(searchTerm)) ||
      (ven.transNo && ven.transNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ven.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ven.verificationDateTime && ven.verificationDateTime.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ven.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Submit Add Vendor Form
  const handleAddVendorSubmit = (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.category) {
      alert('Please fill in Vendor Name and Category');
      return;
    }

    const formattedSrNo = newVendor.srNo || String(vendors.length + 1).padStart(2, '0');
    const formattedTransNo = newVendor.transNo || `TRX${Math.floor(90000 + Math.random() * 9999)}`;
    const formattedId = newVendor.id || `VEN${String(vendors.length + 1).padStart(3, '0')}`;

    const vendorToAdd = {
      ...newVendor,
      srNo: formattedSrNo,
      transNo: formattedTransNo,
      id: formattedId,
    };

    setVendors([vendorToAdd, ...vendors]);
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

    setToastMsg(`Vendor "${vendorToAdd.name}" added successfully!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!hasAccessPermission) {
      alert('Access Denied: Export CSV is allowed for Super Admin and Admin only.');
      return;
    }

    const headers = ['Sr No.', 'Trans No.', 'ID', 'Vendor Name', 'Category', 'Contact Verification Date & Time', 'Status', 'State', 'City'];
    const rows = filteredVendors.map((v, idx) => [
      v.srNo || String(idx + 1).padStart(2, '0'),
      v.transNo || v.id,
      v.id,
      v.name,
      v.category,
      v.verificationDateTime || '-',
      v.status,
      v.state,
      v.city,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LTS_Vendor_Database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('Vendor database exported to CSV successfully!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Handle Export PDF Report
  const handleExportPDF = () => {
    if (!hasAccessPermission) {
      alert('Access Denied: Export PDF is allowed for Super Admin and Admin only.');
      return;
    }

    const printWindow = window.open('', '_blank');
    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LTS Vendor Database Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #f26522; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 800; color: #f26522; margin: 0; }
            .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background-color: #f8fafc; color: #475569; text-align: left; padding: 8px; border: 1px solid #e2e8f0; font-size: 9px; text-transform: uppercase; }
            td { padding: 8px; border: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; border-t: 1px solid #e2e8f0; padding-top: 10px; }
            .badge { display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; border-radius: 4px; background: #ecfdf5; color: #047857; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">LTS - Local Trade Street</h1>
              <div class="subtitle">Official Vendor Directory & Verification Report • Total Vendors: ${filteredVendors.length}</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              Generated On: ${new Date().toLocaleString()}<br/>
              Generated By: ${userRole}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Trans No</th>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>Contact Verification Date & Time</th>
                <th>State</th>
                <th>City</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredVendors
                .map(
                  (v, idx) => `
                <tr>
                  <td><strong>${v.srNo || String(idx + 1).padStart(2, '0')}</strong></td>
                  <td><strong>${v.transNo || v.id}</strong></td>
                  <td>${v.name}</td>
                  <td>${v.category}</td>
                  <td>${v.verificationDateTime || '-'}</td>
                  <td>${v.state}</td>
                  <td>${v.city}</td>
                  <td><span class="badge">${v.status}</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <span>Local Trade Street Management System</span>
            <span>Confidential Vendor Directory Report</span>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();

    setToastMsg('Formatted Vendor PDF report generated!');
    setTimeout(() => setToastMsg(''), 3500);
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
    if (previewData.length === 0) return;
    setIsImporting(true);

    setTimeout(() => {
      setVendors((prev) => [...previewData, ...prev]);
      setIsImporting(false);
      setIsUploadModalOpen(false);
      setUploadedFile(null);
      setPreviewData([]);

      setToastMsg(`Successfully imported ${previewData.length} vendor records!`);
      setTimeout(() => setToastMsg(''), 4000);
    }, 800);
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
                    <td className="py-3 px-3 font-bold text-slate-800">{ven.srNo || String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-3 px-3 font-bold text-[#f26522] font-mono text-[11px]">{ven.transNo || ven.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{ven.name}</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{ven.category}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] font-medium">{ven.verificationDateTime || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{ven.state}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{ven.city}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold text-xs ${
                          ven.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ven.status}
                      </span>
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

    </div>
  );
}

export default VendorDatabase;
