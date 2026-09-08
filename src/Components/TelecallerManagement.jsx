import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import api from '../services/api';
import {
  fetchTelecallers,
  createTelecaller,
  updateTelecaller,
  bulkImportTelecallers,
  clearTelecallers
} from '../redux/slices/telecallerSlice';
import { 
  Search, 
  Settings, 
  UserX, 
  UserCheck, 
  Key, 
  X, 
  Check, 
  UserPlus, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Upload, 
  FileSpreadsheet, 
  FileDown, 
  Phone, 
  Mail, 
  Globe, 
  Download, 
  FileText,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

function TelecallerManagement({ compact = false }) {
  const dispatch = useDispatch();
  const { telecallers: apiTelecallers = [], loading = false, isSaving = false } = useSelector((state) => state.telecaller || {});

  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [selectedTc, setSelectedTc] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Step 1: Import Telecallers Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Step 2: Import Review & Preview Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState({ total: 0, newCount: 0, duplicateCount: 0, invalidCount: 0 });
  const [reviewRecords, setReviewRecords] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Export Dropdown State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);
  
  // Add Telecaller Form State
  const [newTc, setNewTc] = useState({
    id: '',
    name: '',
    mobile: '',
    email: '',
    area: '',
    password: '',
    status: 'Active',
  });

  const [newPassword, setNewPassword] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('Active');
  const [updatedArea, setUpdatedArea] = useState('');
  const [updatedMobile, setUpdatedMobile] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Manual Scroll Ref & Control
  const manualScrollRef = useRef(null);
  const handleManualScroll = (direction) => {
    if (manualScrollRef.current) {
      const scrollAmount = direction === 'up' ? -90 : 90;
      manualScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Initial load: do NOT automatically fetch all telecallers
  useEffect(() => {
    dispatch(clearTelecallers());
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) {
      setValidationError('Please enter a search value.');
      toast.warning('Please enter a search value.');
      return;
    }
    setValidationError('');
    setSubmittedSearch(trimmed);
    setHasSearched(true);
    dispatch(fetchTelecallers({ search: trimmed }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setValidationError('');
    setSubmittedSearch('');
    setHasSearched(false);
    dispatch(clearTelecallers());
  };

  const telecallers = Array.isArray(apiTelecallers) ? apiTelecallers.map((tc, idx) => ({
    _id: tc._id,
    id: tc.userId,
    name: tc.fullName,
    mobile: tc.mobileNumber,
    email: tc.email,
    customers: tc.assignedCustomersCount ?? 0,
    status: tc.status || 'Active',
    area: tc.assignedRegion || 'Central Region',
  })) : [];

  const filteredTelecallers = hasSearched ? telecallers.filter((tc) => {
    const search = submittedSearch.toLowerCase();
    return (
      (tc.name && tc.name.toLowerCase().includes(search)) ||
      (tc.id && tc.id.toLowerCase().includes(search)) ||
      (tc.mobile && tc.mobile.includes(search)) ||
      (tc.email && tc.email.toLowerCase().includes(search)) ||
      (tc.area && tc.area.toLowerCase().includes(search))
    );
  }) : [];

  const handleOpenManage = (tc) => {
    setSelectedTc(tc);
    setUpdatedStatus(tc.status);
    setUpdatedArea(tc.area);
    setUpdatedMobile(tc.mobile || '');
    setUpdatedEmail(tc.email || '');
    setNewPassword('');
    setIsManageModalOpen(true);
  };

  const handleSaveManage = (e) => {
    e.preventDefault();
    if (!selectedTc) return;

    const updateData = {
      mobileNumber: updatedMobile,
      assignedRegion: updatedArea,
      status: updatedStatus
    };

    if (newPassword.trim()) {
      updateData.password = newPassword;
    }

    dispatch(updateTelecaller({
      userId: selectedTc.id,
      updateData
    })).unwrap().then((res) => {
      setToastMsg(res.message || `Successfully updated settings for ${selectedTc.name}`);
      setTimeout(() => setToastMsg(''), 3500);
      setIsManageModalOpen(false);
    });
  };

  const handleAddTcSubmit = (e) => {
    e.preventDefault();
    if (!newTc.name || !newTc.email || !newTc.mobile) {
      alert('Please fill in Telecaller Name, Mobile Number, and Email Address.');
      return;
    }

    dispatch(createTelecaller({
      fullName: newTc.name,
      mobileNumber: newTc.mobile,
      email: newTc.email,
      password: newTc.password || 'Telecaller@123',
      assignedRegion: newTc.area || 'Central Region',
      status: newTc.status
    })).unwrap().then((res) => {
      setIsAddModalOpen(false);
      setNewTc({ id: '', name: '', mobile: '', email: '', area: '', password: '', status: 'Active' });
      const emailSent = res?.data?.emailSent;
      const telecallerName = res?.data?.telecaller?.fullName || newTc.name;
      if (emailSent === true) {
        setToastMsg(`Telecaller account "${telecallerName}" created successfully. Login credentials have been sent to the registered email address.`);
      } else if (emailSent === false) {
        setToastMsg(`Telecaller account "${telecallerName}" created successfully, but credentials email could not be sent.`);
      } else {
        setToastMsg(`New Telecaller "${telecallerName}" added successfully!`);
      }
      setTimeout(() => setToastMsg(''), 6000);
    });
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/superadmin/telecallers/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LTS_Telecallers_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setToastMsg('Telecaller CSV exported successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export CSV.');
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    try {
      const response = await api.get('/superadmin/telecallers/export/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setToastMsg('Formatted Telecaller PDF report generated!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export PDF.');
    }
  };

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Download Sample Telecaller CSV Import Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ['Telecaller ID', 'Full Name', 'Mobile Number', 'Email Address', 'Assigned Region', 'Status'];
    const sampleRows = [
      ['TC051', 'Rajesh Sharma', '+91 98765 12345', 'rajesh.sharma@lts.com', 'North Region', 'Active'],
      ['TC052', 'Pooja Verma', '+91 98765 67890', 'pooja.verma@lts.com', 'West Region', 'Active'],
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

  // Validate and store selected file
  const validateAndSetFile = (file) => {
    if (!file) return;
    setFileError('');

    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    if (!validExtensions.includes(ext)) {
      setFileError('Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      setFileError('File size exceeds the 10MB limit.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  // Step 1: Process and validate file without directly creating telecallers
  const handleProcessUploadFile = () => {
    if (!selectedFile) {
      setFileError('Please select a valid Excel or CSV file first.');
      return;
    }

    setIsProcessingFile(true);
    setFileError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setFileError('The file does not contain any readable sheets.');
          setIsProcessingFile(false);
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          setFileError('The uploaded file contains no data rows.');
          setIsProcessingFile(false);
          return;
        }

        // Helper to extract fields using regex
        const getField = (row, patterns) => {
          const keys = Object.keys(row);
          for (const pat of patterns) {
            const found = keys.find((k) => pat.test(k.trim()));
            if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== '') {
              return String(row[found]).trim();
            }
          }
          return '';
        };

        // Existing telecaller uniqueness sets
        const existingIds = new Set(
          telecallers.map((tc) => String(tc.id || '').trim().toLowerCase()).filter(Boolean)
        );
        const existingEmails = new Set(
          telecallers.map((tc) => String(tc.email || '').trim().toLowerCase()).filter((e) => e && e !== '-')
        );
        const existingPhones = new Set(
          telecallers.map((tc) => String(tc.mobile || '').replace(/\D/g, '').slice(-10)).filter((p) => p.length === 10)
        );

        // Sets to detect duplicates within the file itself
        const seenFileIds = new Set();
        const seenFileEmails = new Set();
        const seenFilePhones = new Set();

        const parsed = [];

        for (let idx = 0; idx < json.length; idx++) {
          const row = json[idx];
          const name = getField(row, [/full\s*name/i, /^name$/i, /telecaller\s*name/i, /name/i]);
          const employeeId = getField(row, [/telecaller\s*id/i, /employee\s*id/i, /user\s*id/i, /^id$/i]);
          const mobile = getField(row, [/mobile\s*(number)?$/i, /phone\s*(number)?$/i, /contact\s*(number)?$/i, /mobile/i, /phone/i, /contact/i]);
          const email = getField(row, [/email\s*(address|id)?$/i, /^mail$/i, /email/i]);
          const area = getField(row, [/assigned\s*region/i, /region/i, /area/i, /assigned\s*area/i]) || 'Central Region';
          const status = getField(row, [/^status$/i]) || 'Active';

          const cleanPhone = mobile.replace(/\D/g, '');
          const cleanPhone10 = cleanPhone.slice(-10);
          const lowerEmail = email.toLowerCase();
          const lowerId = employeeId.toLowerCase();

          let recordStatus = 'NEW';
          let reason = 'Ready to import';

          // 1. Check for INVALID: required fields & format
          if (!name && !email && !mobile) {
            recordStatus = 'INVALID';
            reason = 'Missing required Telecaller details (Name, Email, Mobile)';
          } else if (!name) {
            recordStatus = 'INVALID';
            reason = 'Missing required Full Name';
          } else if (!email) {
            recordStatus = 'INVALID';
            reason = 'Missing required Email Address';
          } else if (!mobile) {
            recordStatus = 'INVALID';
            reason = 'Missing required Mobile Number';
          } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            recordStatus = 'INVALID';
            reason = 'Invalid email address format';
          } else if (mobile && cleanPhone10.length > 0 && cleanPhone10.length < 10) {
            recordStatus = 'INVALID';
            reason = 'Invalid mobile number (must be at least 10 digits)';
          }

          // 2. Check for DUPLICATE (if not invalid)
          if (recordStatus !== 'INVALID') {
            const isDbDuplicate =
              (lowerId && existingIds.has(lowerId)) ||
              (lowerEmail && existingEmails.has(lowerEmail)) ||
              (cleanPhone10.length === 10 && existingPhones.has(cleanPhone10));

            const isFileDuplicate =
              (lowerId && seenFileIds.has(lowerId)) ||
              (lowerEmail && seenFileEmails.has(lowerEmail)) ||
              (cleanPhone10.length === 10 && seenFilePhones.has(cleanPhone10));

            if (isDbDuplicate) {
              recordStatus = 'DUPLICATE';
              reason = 'Telecaller already exists in database';
            } else if (isFileDuplicate) {
              recordStatus = 'DUPLICATE';
              reason = 'Duplicate record found within the same file';
            }
          }

          if (lowerId) seenFileIds.add(lowerId);
          if (lowerEmail) seenFileEmails.add(lowerEmail);
          if (cleanPhone10.length === 10) seenFilePhones.add(cleanPhone10);

          parsed.push({
            rowNum: idx + 1,
            id: employeeId || `TC0${telecallers.length + idx + 1}0`,
            name: name || '—',
            mobile: mobile || '—',
            email: email || '—',
            area: area,
            customers: 0,
            status: status,
            importStatus: recordStatus,
            reason: reason,
          });
        }

        const total = parsed.length;
        const newCount = parsed.filter((r) => r.importStatus === 'NEW').length;
        const duplicateCount = parsed.filter((r) => r.importStatus === 'DUPLICATE').length;
        const invalidCount = parsed.filter((r) => r.importStatus === 'INVALID').length;

        setReviewStats({
          total,
          newCount,
          duplicateCount,
          invalidCount,
        });
        setReviewRecords(parsed);
        setIsProcessingFile(false);
        setIsUploadModalOpen(false);
        setIsReviewModalOpen(true);
      } catch (err) {
        console.error('Failed to parse file:', err);
        setFileError('Failed to parse file. Please verify it is a valid Excel or CSV file.');
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setFileError('Error reading the selected file. Please try again.');
      setIsProcessingFile(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Cancel Step 1 Modal
  const handleCancelUpload = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Cancel Step 2 Modal
  const handleCancelReview = () => {
    setIsReviewModalOpen(false);
    setSelectedFile(null);
    setReviewRecords([]);
    setReviewStats({ total: 0, newCount: 0, duplicateCount: 0, invalidCount: 0 });
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 2: Confirm and Import ONLY "NEW" records into database
  const handleConfirmImport = async () => {
    const validNewRecords = reviewRecords.filter((r) => r.importStatus === 'NEW');
    if (validNewRecords.length === 0 || isImporting) return;

    setIsImporting(true);

    try {
      // Build a clean CSV file containing ONLY the valid NEW telecallers
      const headers = ['Telecaller ID', 'Full Name', 'Mobile Number', 'Email Address', 'Assigned Region', 'Status'];
      const csvRows = validNewRecords.map((r, i) => [
        r.id || `TC0${telecallers.length + i + 1}0`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.mobile !== '—' ? r.mobile : '').replace(/"/g, '""')}"`,
        `"${(r.email !== '—' ? r.email : '').replace(/"/g, '""')}"`,
        `"${(r.area || 'Central Region').replace(/"/g, '""')}"`,
        r.status || 'Active'
      ]);

      const csvString = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const baseName = (selectedFile?.name || 'telecallers').replace(/\.[^/.]+$/, '');
      const cleanFile = new File([blob], `${baseName}_new_imported.csv`, { type: 'text/csv' });

      await dispatch(bulkImportTelecallers(cleanFile)).unwrap();

      // Show dynamic breakdown toast
      toast.success(
        `${reviewStats.total} records processed: ${reviewStats.newCount} New → Imported, ${reviewStats.duplicateCount} Duplicate → Skipped, ${reviewStats.invalidCount} Invalid → Skipped`
      );

      // Re-fetch telecaller list to guarantee immediate update
      dispatch(fetchTelecallers());

      // Close review modal and reset all temporary states
      setIsReviewModalOpen(false);
      setSelectedFile(null);
      setReviewRecords([]);
      setReviewStats({ total: 0, newCount: 0, duplicateCount: 0, invalidCount: 0 });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Telecaller import failed:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 animate-in fade-in duration-200">
      <div>
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Telecaller Management
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-[#f26522] border border-orange-200">
                {telecallers.length} Active Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage telecaller profiles, mobile numbers, email addresses, assigned regions & status
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Telecaller Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#f26522] to-[#e05411] hover:from-[#e05411] hover:to-[#c84302] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
            >
              <UserPlus size={15} />
              <span>+ Add Telecaller</span>
            </button>

             {/* Import (Excel/CSV) Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-[#f26522] border border-orange-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Import Excel or CSV File"
            >
              <Upload size={14} />
              <span>Import (Excel/CSV)</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Export Telecallers Data"
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
        </div>

        {/* Search Bar with Input and Search Button */}
        <div className="mb-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, mobile number, email, region..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-800 font-semibold placeholder:text-slate-400 transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#f26522] to-[#e05411] hover:from-[#e05411] hover:to-[#c84302] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
          {validationError && (
            <div className="mt-1.5 flex items-center gap-1.5 text-rose-500 text-xs font-semibold px-1">
              <AlertCircle size={13} />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Notification Toast */}
        {toastMsg && (
          <div className="mb-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in shadow-2xs">
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        {/* MANUAL SLIDING CONTROL BAR */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-700">Manual Slide Controls</span>
            <span className="text-[10px] text-slate-400 font-medium">Scroll table view vertically</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleManualScroll('up')}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 active:scale-95 shadow-2xs"
              title="Slide Up"
            >
              <ChevronUp size={13} />
              <span>Slide Up</span>
            </button>
            <button
              onClick={() => handleManualScroll('down')}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 active:scale-95 shadow-2xs"
              title="Slide Down"
            >
              <ChevronDown size={13} />
              <span>Slide Down</span>
            </button>
          </div>
        </div>

        {/* Table View with Mobile Number & Email Columns */}
        <div
          ref={manualScrollRef}
          className="max-h-[360px] overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200/80 mb-4 scroll-smooth custom-scrollbar"
        >
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10">
              <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">TC ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Customers</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {filteredTelecallers.length > 0 ? (
                filteredTelecallers.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-black text-xs tracking-wide">
                        {tc.id}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {tc.name}
                    </td>

                    {/* Mobile Number */}
                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Phone size={13} className="text-[#f26522] shrink-0" />
                        <span>{tc.mobile || '+91 98765 00000'}</span>
                      </div>
                    </td>

                    {/* Email Address */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span>{tc.email}</span>
                      </div>
                    </td>

                    {/* Region / Area */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Globe size={11} className="text-slate-400" />
                        {tc.area}
                      </span>
                    </td>

                    {/* Customers Count */}
                    <td className="py-3 px-4 text-slate-800 font-extrabold">
                      {tc.customers}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          tc.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tc.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {tc.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenManage(tc)}
                        className="px-3 py-1 bg-orange-50 text-[#f26522] hover:bg-[#f26522] hover:text-white rounded-lg border border-orange-200 transition-all font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-slate-400 font-medium">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 size={24} className="animate-spin text-[#f26522]" />
                        <span className="font-semibold">Searching for telecallers...</span>
                      </div>
                    ) : !hasSearched ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={28} className="text-slate-300" />
                        <span className="font-semibold text-slate-600 text-sm">Search for a telecaller to view results.</span>
                        <span className="text-[11px] text-slate-400">Enter a name, ID, mobile, email, or region above and click Search.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UserX size={28} className="text-slate-300" />
                        <span className="font-semibold text-slate-600 text-sm">No telecallers found matching your search.</span>
                        <span className="text-[11px] text-slate-400">No telecaller records matched "{submittedSearch}". Try a different search term.</span>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Telecaller Modal with Mobile Number & Email */}
      {isManageModalOpen && selectedTc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
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

            <form onSubmit={handleSaveManage} className="p-5 space-y-3.5 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={updatedMobile}
                    onChange={(e) => setUpdatedMobile(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={updatedEmail}
                    onChange={(e) => setUpdatedEmail(e.target.value)}
                    placeholder="e.g. telecaller@lts.com"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assigned Region / Area
                </label>
                <input
                  type="text"
                  value={updatedArea}
                  onChange={(e) => setUpdatedArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Account Status
                </label>
                <select
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reset Password
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
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Telecaller Modal with Mobile Number Field */}
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

            <form onSubmit={handleAddTcSubmit} className="p-5 space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Telecaller ID</label>
                  <input
                    type="text"
                    placeholder="e.g. TC050"
                    value={newTc.id}
                    onChange={(e) => setNewTc({ ...newTc, id: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={newTc.name}
                    onChange={(e) => setNewTc({ ...newTc, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={newTc.mobile}
                      onChange={(e) => setNewTc({ ...newTc, mobile: e.target.value })}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="anand.kumar@lts.com"
                      value={newTc.email}
                      onChange={(e) => setNewTc({ ...newTc, email: e.target.value })}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Region</label>
                  <input
                    type="text"
                    placeholder="e.g. North Region"
                    value={newTc.area}
                    onChange={(e) => setNewTc({ ...newTc, area: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newTc.status}
                    onChange={(e) => setNewTc({ ...newTc, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    placeholder="Enter initial login password"
                    value={newTc.password}
                    onChange={(e) => setNewTc({ ...newTc, password: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
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
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create Telecaller</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 1: IMPORT TELECALLERS MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f26522]">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Import Telecallers</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload an Excel or CSV file to bulk add telecallers to the Telecaller Management system.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelUpload}
                disabled={isProcessingFile}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-200/50 disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
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

              {/* Upload Drop Area or Selected File Preview */}
              {!selectedFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      validateAndSetFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    dragActive ? 'border-[#f26522] bg-orange-50/40' : 'border-slate-200 hover:border-[#f26522]/50 hover:bg-orange-50/20 bg-slate-50/40'
                  }`}
                >
                  <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Drag & Drop CSV or Excel file here
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">Supports .csv, .xlsx, .xls files up to 10MB</p>
                  
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs pointer-events-none"
                  >
                    <Upload size={13} />
                    <span>Browse File</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Excel/CSV File</label>
                  <div className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#f26522] shrink-0 border border-orange-100">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isProcessingFile}
                      onClick={() => {
                        setSelectedFile(null);
                        setFileError('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Change
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}

              {/* Error Message */}
              {fileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Processing Progress Status */}
              {isProcessingFile && (
                <div className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl flex items-center gap-2.5 text-xs text-orange-800 font-medium">
                  <Loader2 size={15} className="animate-spin text-[#f26522] shrink-0" />
                  <span>Verifying structure and validating telecaller records...</span>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                disabled={isProcessingFile}
                onClick={handleCancelUpload}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isProcessingFile}
                onClick={handleProcessUploadFile}
                className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isProcessingFile ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Upload File</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: IMPORT REVIEW & PREVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f26522]">
                  <Info size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Import Review & Preview</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Review and verify classified records before importing into Telecaller Management
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelReview}
                disabled={isImporting}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-200/50 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dynamic Summary Cards */}
            <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Records */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Records</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{reviewStats.total}</div>
                </div>

                {/* New */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">New (Eligible)</div>
                  <div className="text-xl font-bold text-emerald-800 mt-0.5">{reviewStats.newCount}</div>
                </div>

                {/* Duplicate */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 shadow-2xs">
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Duplicate (Skipped)</div>
                  <div className="text-xl font-bold text-amber-800 mt-0.5">{reviewStats.duplicateCount}</div>
                </div>

                {/* Invalid */}
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 shadow-2xs">
                  <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Invalid (Skipped)</div>
                  <div className="text-xl font-bold text-rose-800 mt-0.5">{reviewStats.invalidCount}</div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="p-6 overflow-hidden flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="text-xs font-bold text-slate-700">Record Preview ({reviewRecords.length} records)</span>
                <span className="text-[11px] text-slate-400">Only "New" records will be imported into the database</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-auto max-h-[46vh] bg-white shadow-2xs">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Row</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Full Name</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Employee ID</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Email Address</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Mobile Number</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Region</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Reason / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reviewRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          No records found to preview.
                        </td>
                      </tr>
                    ) : (
                      reviewRecords.map((item) => {
                        let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        let dotClass = "bg-emerald-500";

                        if (item.importStatus === 'DUPLICATE') {
                          badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                          dotClass = "bg-amber-500";
                        } else if (item.importStatus === 'INVALID') {
                          badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                          dotClass = "bg-rose-500";
                        }

                        return (
                          <tr key={item.rowNum} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 text-slate-500 font-medium">{item.rowNum}</td>
                            <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                            <td className="p-3 text-slate-600 font-medium">{item.id}</td>
                            <td className="p-3 text-slate-600">{item.email}</td>
                            <td className="p-3 text-slate-600">{item.mobile}</td>
                            <td className="p-3 text-slate-600">{item.area}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                                {item.importStatus}
                              </span>
                            </td>
                            <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate" title={item.reason}>
                              {item.reason}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                disabled={isImporting}
                onClick={handleCancelReview}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewStats.newCount === 0 || isImporting}
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Accept & Import ({reviewStats.newCount} New)</span>
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
