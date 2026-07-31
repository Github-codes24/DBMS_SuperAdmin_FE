import React, { useState, useRef } from 'react';
import { Search, Settings, UserX, UserCheck, Key, X, Check, UserPlus, Plus, ChevronUp, ChevronDown, Upload, FileSpreadsheet, FileDown } from 'lucide-react';

function TelecallerManagement({ compact = false }) {
  const [telecallers, setTelecallers] = useState([
    { id: 'TC014', name: 'Amit Verma', customers: 128, status: 'Active', area: 'North Region', email: 'amit.verma@lts.com' },
    { id: 'TC021', name: 'Neha Joshi', customers: 94, status: 'Active', area: 'West Region', email: 'neha.joshi@lts.com' },
    { id: 'TC031', name: 'Ravi Singh', customers: 0, status: 'Disabled', area: 'East Region', email: 'ravi.singh@lts.com' },
    { id: 'TC042', name: 'Priya Patel', customers: 112, status: 'Active', area: 'South Region', email: 'priya.patel@lts.com' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTc, setSelectedTc] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Bulk Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // Add Telecaller Form State
  const [newTc, setNewTc] = useState({
    id: '',
    name: '',
    email: '',
    area: '',
    password: '',
    status: 'Active',
  });

  const [newPassword, setNewPassword] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('Active');
  const [updatedArea, setUpdatedArea] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Manual Scroll Ref & Control (Same as Customer Database)
  const manualScrollRef = useRef(null);
  const handleManualScroll = (direction) => {
    if (manualScrollRef.current) {
      const scrollAmount = direction === 'up' ? -90 : 90;
      manualScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredTelecallers = telecallers.filter((tc) => {
    return (
      tc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenManage = (tc) => {
    setSelectedTc(tc);
    setUpdatedStatus(tc.status);
    setUpdatedArea(tc.area);
    setNewPassword('');
    setIsManageModalOpen(true);
  };

  const handleSaveManage = (e) => {
    e.preventDefault();
    if (!selectedTc) return;

    setTelecallers((prev) =>
      prev.map((t) =>
        t.id === selectedTc.id
          ? { ...t, status: updatedStatus, area: updatedArea }
          : t
      )
    );

    setToastMsg(`Successfully updated settings for ${selectedTc.name} (${selectedTc.id})`);
    setTimeout(() => setToastMsg(''), 3500);
    setIsManageModalOpen(false);
  };

  const handleAddTcSubmit = (e) => {
    e.preventDefault();
    if (!newTc.name || !newTc.email) {
      alert('Please fill in Telecaller Name and Email');
      return;
    }

    const formattedId = newTc.id || `TC0${telecallers.length + 1}0`;
    const telecallerToAdd = {
      id: formattedId,
      name: newTc.name,
      email: newTc.email,
      area: newTc.area || 'Central Region',
      customers: 0,
      status: newTc.status,
    };

    setTelecallers([telecallerToAdd, ...telecallers]);
    setIsAddModalOpen(false);
    setNewTc({ id: '', name: '', email: '', area: '', password: '', status: 'Active' });

    setToastMsg(`New Telecaller "${telecallerToAdd.name}" (${telecallerToAdd.id}) added successfully!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Download Sample Telecaller CSV Import Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ['Telecaller ID', 'Full Name', 'Email Address', 'Assigned Region', 'Status'];
    const sampleRows = [
      ['TC051', 'Rajesh Sharma', 'rajesh.sharma@lts.com', 'North Region', 'Active'],
      ['TC052', 'Pooja Verma', 'pooja.verma@lts.com', 'West Region', 'Active'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [sampleHeaders.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_Telecaller_Import_Template.csv');
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
            id: cols[0] || `TC0${telecallers.length + i}0`,
            name: cols[1] || 'New Telecaller',
            email: cols[2] || 'telecaller@lts.com',
            area: cols[3] || 'Central Region',
            customers: 0,
            status: cols[4] || 'Active',
          });
        }
      }

      if (parsed.length === 0) {
        setPreviewData([
          { id: 'TC055', name: 'Manish Malhotra', email: 'manish.m@lts.com', area: 'North Region', customers: 0, status: 'Active' },
          { id: 'TC056', name: 'Swati Kulkarni', email: 'swati.k@lts.com', area: 'West Region', customers: 0, status: 'Active' },
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
      setTelecallers((prev) => [...previewData, ...prev]);
      setIsImporting(false);
      setIsUploadModalOpen(false);
      setUploadedFile(null);
      setPreviewData([]);

      setToastMsg(`Successfully imported ${previewData.length} telecaller accounts!`);
      setTimeout(() => setToastMsg(''), 4000);
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
      <div>
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Telecaller Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage accounts, regions, status & customer assignments
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Telecaller Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 w-fit"
            >
              <UserPlus size={14} />
              <span>+ Add Telecaller</span>
            </button>

            {/* Import (Excel/CSV) Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f26522] border border-orange-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Import Excel or CSV File"
            >
              <Upload size={14} />
              <span>Import (Excel/CSV)</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search telecaller / ID / area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Notification Toast */}
        {toastMsg && (
          <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* MANUAL SLIDING CONTROL BAR (Same as Customer Database) */}
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

        {/* Table View matching mock image with manual sliding */}
        <div
          ref={manualScrollRef}
          className="max-h-[300px] overflow-x-auto overflow-y-auto rounded-xl border border-slate-100 mb-4 scroll-smooth custom-scrollbar"
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">NAME</th>
                <th className="py-2.5 px-3">CUSTOMERS</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredTelecallers.length > 0 ? (
                filteredTelecallers.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">{tc.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{tc.name}</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{tc.customers}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold text-xs ${
                          tc.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleOpenManage(tc)}
                        className="text-[#f26522] hover:text-[#e05411] font-bold text-xs hover:underline cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-xs text-slate-400">
                    No telecallers found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Telecaller Modal */}
      {isManageModalOpen && selectedTc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  Manage Telecaller: {selectedTc.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">ID: {selectedTc.id}</p>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveManage} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Account Status
                </label>
                <select
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Assigned Region / Area
                </label>
                <input
                  type="text"
                  value={updatedArea}
                  onChange={(e) => setUpdatedArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Change Password
                </label>
                <div className="relative">
                  <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter new password to reset"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank if you do not wish to change password.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Telecaller Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#f26522]" />
                <h3 className="text-xs font-bold text-slate-800">Add New Telecaller Account</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTcSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Telecaller ID</label>
                  <input
                    type="text"
                    placeholder="e.g. TC050"
                    value={newTc.id}
                    onChange={(e) => setNewTc({ ...newTc, id: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={newTc.name}
                    onChange={(e) => setNewTc({ ...newTc, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. anand.kumar@lts.com"
                    value={newTc.email}
                    onChange={(e) => setNewTc({ ...newTc, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Region</label>
                  <input
                    type="text"
                    placeholder="e.g. North Region"
                    value={newTc.area}
                    onChange={(e) => setNewTc({ ...newTc, area: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={newTc.status}
                    onChange={(e) => setNewTc({ ...newTc, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Enter initial login password"
                    value={newTc.password}
                    onChange={(e) => setNewTc({ ...newTc, password: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create Telecaller</span>
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
                <h3 className="text-xs font-bold text-slate-800">Bulk Telecaller CSV / Excel Import</h3>
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
                  <div className="font-bold text-[#f26522]">Need standard telecaller template?</div>
                  <div className="text-[11px] text-slate-500">Download formatted CSV template for telecaller import</div>
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
                          <th className="p-2">ID</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Region</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {previewData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold">{row.id}</td>
                            <td className="p-2">{row.name}</td>
                            <td className="p-2 text-slate-600">{row.email}</td>
                            <td className="p-2 text-slate-500">{row.area}</td>
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
                    <span>Import {previewData.length} Telecallers</span>
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

export default TelecallerManagement;
