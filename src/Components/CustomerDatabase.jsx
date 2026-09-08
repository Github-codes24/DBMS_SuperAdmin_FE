import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { State, City } from 'country-state-city';
import api from '../services/api';
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  bulkImportCustomers 
} from '../redux/slices/customerSlice';
import { 
  Search, 
  Download, 
  Lock, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  X, 
  Check, 
  FileDown, 
  UserPlus, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

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

  // Step 1: Import Customers Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1: Dependent Dropdown States (Category, Sub-Category, State, City)
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [subCatsLoading, setSubCatsLoading] = useState(false);

  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedCatName, setSelectedCatName] = useState('');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');

  const [selectedSubCatId, setSelectedSubCatId] = useState('');
  const [selectedSubCatName, setSelectedSubCatName] = useState('');
  const [isSubCatDropdownOpen, setIsSubCatDropdownOpen] = useState(false);
  const [subCatSearch, setSubCatSearch] = useState('');

  const [allStates] = useState(() => State.getStatesOfCountry('IN') || []);
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const catDropdownRef = useRef(null);
  const subCatDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  // Step 2: Import Review & Preview Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState({ total: 0, newCount: 0, duplicateCount: 0, invalidCount: 0 });
  const [reviewRecords, setReviewRecords] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Export Dropdown State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Load categories and subcategories when upload modal opens
  useEffect(() => {
    if (isUploadModalOpen && categories.length === 0) {
      setCatsLoading(true);
      setSubCatsLoading(true);
      Promise.all([
        axios.get('https://local-trade-street-be-2.onrender.com/api/admin/category/getAllCategories?limit=1000')
          .then((res) => {
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setCategories(list);
          })
          .catch((err) => {
            console.error('Failed to load categories:', err);
          })
          .finally(() => setCatsLoading(false)),
        axios.get('https://local-trade-street-be-2.onrender.com/api/admin/subCategory/getAllSubCategories?limit=1000')
          .then((res) => {
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setAllSubCategories(list);
          })
          .catch((err) => {
            console.error('Failed to load subcategories:', err);
          })
          .finally(() => setSubCatsLoading(false)),
      ]);
    }
  }, [isUploadModalOpen, categories.length]);

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setIsCatDropdownOpen(false);
      }
      if (subCatDropdownRef.current && !subCatDropdownRef.current.contains(e.target)) {
        setIsSubCatDropdownOpen(false);
      }
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target)) {
        setIsStateDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setIsCityDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Download Sample CSV Import Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ['Sr No', 'ID', 'Name', 'Company Name', 'Email', 'Mobile', 'State', 'City', 'Pincode', 'Registration Date', 'Status', 'Telecaller'];
    const sampleRows = [
      ['01', 'CUST001', 'Global Logistics', 'Global Logistics Ltd', 'info@globallogistics.com', '9876543210', 'Maharashtra', 'Pune', '411001', '2026-06-15', 'Active', 'TC014'],
      ['02', 'CUST002', 'Prime Pharma', 'Prime Pharma Pvt Ltd', 'contact@primepharma.com', '9876543211', 'Gujarat', 'Surat', '395001', '2026-07-01', 'Pending', 'TC021'],
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

  // Handle Category selection
  const handleSelectCategory = (cat) => {
    const catId = cat._id || cat.id || '';
    const catName = cat.name || cat.categoryName || cat.category || '';
    setSelectedCatId(catId);
    setSelectedCatName(catName);
    setIsCatDropdownOpen(false);
    setCatSearch('');

    // Reset Sub-Category
    setSelectedSubCatId('');
    setSelectedSubCatName('');
    setSubCatSearch('');
    setFileError('');

    // Filter subcategories belonging to this category
    const filtered = allSubCategories.filter((sc) => {
      const parentId = sc.categoryId || sc.categoryName?._id || sc.categoryName;
      const parentName = sc.categoryName?.name || sc.parentCategory || sc.category;
      if (catId && parentId && String(parentId) === String(catId)) return true;
      if (catName && parentName && String(parentName).trim().toLowerCase() === catName.trim().toLowerCase()) return true;
      return false;
    });
    setSubCategories(filtered);
  };

  // Handle Sub-Category selection
  const handleSelectSubCategory = (sc) => {
    const subId = sc._id || sc.id || '';
    const subName = sc.name || sc.subCategoryName || '';
    setSelectedSubCatId(subId);
    setSelectedSubCatName(subName);
    setIsSubCatDropdownOpen(false);
    setSubCatSearch('');
    setFileError('');
  };

  // Handle State selection
  const handleSelectState = (st) => {
    setSelectedState(st.name);
    setSelectedStateCode(st.isoCode);
    setIsStateDropdownOpen(false);
    setStateSearch('');

    // Reset City
    setSelectedCity('');
    setCitySearch('');
    setFileError('');

    // Populate cities for this state
    try {
      const stateCities = City.getCitiesOfState('IN', st.isoCode) || [];
      setCities(stateCities);
    } catch (err) {
      console.error('Error getting cities:', err);
      setCities([]);
    }
  };

  // Handle City selection
  const handleSelectCity = (ct) => {
    setSelectedCity(ct.name);
    setIsCityDropdownOpen(false);
    setCitySearch('');
    setFileError('');
  };

  // Reset all import modal inputs and dropdowns
  const resetImportStates = () => {
    setSelectedCatId('');
    setSelectedCatName('');
    setIsCatDropdownOpen(false);
    setCatSearch('');

    setSelectedSubCatId('');
    setSelectedSubCatName('');
    setIsSubCatDropdownOpen(false);
    setSubCatSearch('');
    setSubCategories([]);

    setSelectedState('');
    setSelectedStateCode('');
    setIsStateDropdownOpen(false);
    setStateSearch('');

    setSelectedCity('');
    setIsCityDropdownOpen(false);
    setCitySearch('');
    setCities([]);

    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 1: Process and validate file without importing into database
  const handleProcessUploadFile = () => {
    if (!selectedCatName) {
      setFileError('Please select a category.');
      return;
    }
    if (!selectedSubCatName) {
      setFileError('Please select a sub-category.');
      return;
    }
    if (!selectedState) {
      setFileError('Please select a state.');
      return;
    }
    if (!selectedCity) {
      setFileError('Please select a city.');
      return;
    }
    if (!selectedFile) {
      setFileError('Please select an Excel or CSV file.');
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

        // Existing customer uniqueness sets
        const existingIds = new Set(
          customers.map((c) => String(c.id || '').trim().toLowerCase()).filter(Boolean)
        );
        const existingEmails = new Set(
          customers.map((c) => String(c.email || '').trim().toLowerCase()).filter((e) => e && e !== '-')
        );
        const existingPhones = new Set(
          customers.map((c) => String(c.mobile || '').replace(/\D/g, '').slice(-10)).filter((p) => p.length === 10)
        );

        // Sets to detect duplicates within the file itself
        const seenFileIds = new Set();
        const seenFileEmails = new Set();
        const seenFilePhones = new Set();

        const parsed = [];

        for (let idx = 0; idx < json.length; idx++) {
          const row = json[idx];
          const name = getField(row, [/^customer\s*name$/i, /^name$/i, /^client\s*name$/i, /name/i]);
          const companyName = getField(row, [/^company\s*name$/i, /^company$/i, /^business\s*name$/i, /^business$/i, /company/i]);
          const email = getField(row, [/^email\s*(address|id)?$/i, /^mail$/i, /email/i]);
          const mobile = getField(row, [/^phone\s*(number)?$/i, /^mobile\s*(number)?$/i, /^contact\s*(number)?$/i, /mobile/i, /phone/i, /contact/i]);
          const state = getField(row, [/^state$/i]);
          const city = getField(row, [/^city$/i]);
          const pincode = getField(row, [/^pin\s*code$/i, /^pincode$/i, /^zip\s*(code)?$/i]);
          const customerId = getField(row, [/^customer\s*id$/i, /^cust\s*id$/i, /^id$/i]);
          const status = getField(row, [/^status$/i]) || 'Active';
          const telecaller = getField(row, [/^assigned\s*telecaller$/i, /^telecaller$/i, /^caller$/i]) || 'TC014';

          const cleanPhone = mobile.replace(/\D/g, '');
          const cleanPhone10 = cleanPhone.slice(-10);
          const lowerEmail = email.toLowerCase();
          const lowerId = customerId.toLowerCase();

          let recordStatus = 'NEW';
          let reason = 'Ready to import';

          // 1. Check for INVALID: required fields & format
          if (!name && !companyName) {
            recordStatus = 'INVALID';
            reason = 'Missing Customer Name and Company Name';
          } else if (!name) {
            recordStatus = 'INVALID';
            reason = 'Missing required Customer Name';
          } else if (!companyName) {
            recordStatus = 'INVALID';
            reason = 'Missing required Company Name';
          } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            recordStatus = 'INVALID';
            reason = 'Invalid email address format';
          } else if (mobile && cleanPhone10.length > 0 && cleanPhone10.length < 10) {
            recordStatus = 'INVALID';
            reason = 'Invalid phone number (must be at least 10 digits)';
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
              reason = 'Customer already exists in database';
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
            name: name || '—',
            companyName: companyName || '—',
            email: email || '—',
            mobile: mobile || '—',
            state: state || selectedState || 'Maharashtra',
            city: city || selectedCity || 'Mumbai',
            pincode: pincode || '400001',
            customerId: customerId || `CUST${Math.floor(100 + Math.random() * 900)}`,
            status: status,
            telecaller: telecaller,
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
    resetImportStates();
  };

  // Cancel Step 2 Modal
  const handleCancelReview = () => {
    setIsReviewModalOpen(false);
    resetImportStates();
    setReviewRecords([]);
    setReviewStats({ total: 0, newCount: 0, duplicateCount: 0, invalidCount: 0 });
  };

  // Step 2: Confirm and Import ONLY "NEW" records into database
  const handleConfirmImport = async () => {
    const validNewRecords = reviewRecords.filter((r) => r.importStatus === 'NEW');
    if (validNewRecords.length === 0 || isImporting) return;

    setIsImporting(true);

    try {
      // Build a clean CSV file containing ONLY the valid NEW records
      const headers = ['Sr No', 'ID', 'Name', 'Company Name', 'State', 'City', 'Pincode', 'Registration Date', 'Status', 'Telecaller', 'Email', 'Mobile'];
      const csvRows = validNewRecords.map((r, i) => [
        String(customers.length + i + 1).padStart(2, '0'),
        r.customerId,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.companyName || '').replace(/"/g, '""')}"`,
        `"${(r.state || selectedState || 'Maharashtra').replace(/"/g, '""')}"`,
        `"${(r.city || selectedCity || 'Mumbai').replace(/"/g, '""')}"`,
        `"${(r.pincode || '400001').replace(/"/g, '""')}"`,
        new Date().toISOString().slice(0, 10),
        r.status || 'Active',
        r.telecaller || 'TC014',
        `"${(r.email !== '—' ? r.email : '').replace(/"/g, '""')}"`,
        `"${(r.mobile !== '—' ? r.mobile : '').replace(/"/g, '""')}"`
      ]);

      const csvString = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const baseName = (selectedFile?.name || 'customers').replace(/\.[^/.]+$/, '');
      const cleanFile = new File([blob], `${baseName}_new_imported.csv`, { type: 'text/csv' });

      await dispatch(bulkImportCustomers({
        file: cleanFile,
        category: selectedCatName,
        subCategory: selectedSubCatName,
        state: selectedState,
        city: selectedCity
      })).unwrap();

      // Show dynamic breakdown toast
      toast.success(
        `${reviewStats.total} records processed: ${reviewStats.newCount} New → Imported, ${reviewStats.duplicateCount} Duplicate → Skipped, ${reviewStats.invalidCount} Invalid → Skipped`
      );

      // Re-fetch customer list to guarantee immediate update
      dispatch(fetchCustomers());

      // Close review modal and reset all temporary states
      setIsReviewModalOpen(false);
      resetImportStates();
      setReviewRecords([]);
      setReviewStats({ total: 0, newCount: 0, duplicateCount: 0, invalidCount: 0 });
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
    }
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

        {/* Search Bar & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="relative w-full sm:max-w-md md:max-w-lg">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, state, city, pincode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
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

      {/* STEP 1: IMPORT CUSTOMERS MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f26522]">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Import Customers</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload an Excel or CSV file to bulk add customers to the Customer Database.
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
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Category Dropdown */}
              <div className="space-y-1.5" ref={catDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCatDropdownOpen(!isCatDropdownOpen);
                      setIsSubCatDropdownOpen(false);
                      setIsStateDropdownOpen(false);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl transition-all font-medium text-left cursor-pointer hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 ${
                      isCatDropdownOpen ? 'border-[#f26522] ring-2 ring-[#f26522]/20 bg-white' : 'border-slate-200'
                    }`}
                  >
                    <span className={selectedCatName ? 'text-slate-800 font-semibold truncate' : 'text-slate-400'}>
                      {selectedCatName || 'Select Category'}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCatDropdownOpen ? 'rotate-180 text-[#f26522]' : ''}`} />
                  </button>

                  {isCatDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search category..."
                            value={catSearch}
                            onChange={(e) => setCatSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {catsLoading ? (
                          <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <Loader2 size={13} className="animate-spin text-[#f26522]" />
                            <span>Loading categories...</span>
                          </div>
                        ) : (
                          (() => {
                            const filtered = categories.filter((c) =>
                              (c.name || c.categoryName || c.category || '').toLowerCase().includes(catSearch.toLowerCase())
                            );
                            if (filtered.length === 0) {
                              return (
                                <div className="py-3 text-center text-xs text-slate-400">
                                  No categories found
                                </div>
                              );
                            }
                            return filtered.map((c) => {
                              const name = c.name || c.categoryName || c.category;
                              const isSelected = selectedCatName === name;
                              return (
                                <button
                                  key={c._id || name}
                                  type="button"
                                  onClick={() => handleSelectCategory(c)}
                                  className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-orange-50 font-bold text-[#f26522]'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#f26522]'
                                  }`}
                                >
                                  <span className="truncate">{name}</span>
                                  {isSelected && <Check size={13} className="text-[#f26522] shrink-0" />}
                                </button>
                              );
                            });
                          })()
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Category Dropdown */}
              <div className="space-y-1.5" ref={subCatDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={!selectedCatName || subCatsLoading}
                    onClick={() => {
                      if (!selectedCatName) return;
                      setIsSubCatDropdownOpen(!isSubCatDropdownOpen);
                      setIsCatDropdownOpen(false);
                      setIsStateDropdownOpen(false);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs border rounded-xl transition-all font-medium text-left ${
                      !selectedCatName
                        ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 cursor-pointer'
                    } ${isSubCatDropdownOpen ? 'border-[#f26522] ring-2 ring-[#f26522]/20 bg-white' : ''}`}
                  >
                    <span className={selectedSubCatName ? 'text-slate-800 font-semibold truncate' : 'text-slate-400'}>
                      {!selectedCatName ? 'Select category first' : (selectedSubCatName || 'Select Sub-Category')}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isSubCatDropdownOpen ? 'rotate-180 text-[#f26522]' : ''}`} />
                  </button>

                  {isSubCatDropdownOpen && selectedCatName && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search sub-category..."
                            value={subCatSearch}
                            onChange={(e) => setSubCatSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {subCatsLoading ? (
                          <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <Loader2 size={13} className="animate-spin text-[#f26522]" />
                            <span>Loading sub-categories...</span>
                          </div>
                        ) : (
                          (() => {
                            const filtered = subCategories.filter((sc) =>
                              (sc.name || sc.subCategoryName || '').toLowerCase().includes(subCatSearch.toLowerCase())
                            );
                            if (filtered.length === 0) {
                              return (
                                <div className="py-3 text-center text-xs text-slate-400">
                                  No sub-categories found for {selectedCatName}
                                </div>
                              );
                            }
                            return filtered.map((sc) => {
                              const name = sc.name || sc.subCategoryName;
                              const isSelected = selectedSubCatName === name;
                              return (
                                <button
                                  key={sc._id || name}
                                  type="button"
                                  onClick={() => handleSelectSubCategory(sc)}
                                  className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-orange-50 font-bold text-[#f26522]'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#f26522]'
                                  }`}
                                >
                                  <span className="truncate">{name}</span>
                                  {isSelected && <Check size={13} className="text-[#f26522] shrink-0" />}
                                </button>
                              );
                            });
                          })()
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* State Dropdown */}
              <div className="space-y-1.5" ref={stateDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStateDropdownOpen(!isStateDropdownOpen);
                      setIsCatDropdownOpen(false);
                      setIsSubCatDropdownOpen(false);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl transition-all font-medium text-left cursor-pointer hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 ${
                      isStateDropdownOpen ? 'border-[#f26522] ring-2 ring-[#f26522]/20 bg-white' : 'border-slate-200'
                    }`}
                  >
                    <span className={selectedState ? 'text-slate-800 font-semibold truncate' : 'text-slate-400'}>
                      {selectedState || 'Select State'}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isStateDropdownOpen ? 'rotate-180 text-[#f26522]' : ''}`} />
                  </button>

                  {isStateDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search state..."
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {(() => {
                          const filtered = allStates.filter((s) =>
                            s.name.toLowerCase().includes(stateSearch.toLowerCase())
                          );
                          if (filtered.length === 0) {
                            return (
                              <div className="py-3 text-center text-xs text-slate-400">
                                No states found
                              </div>
                            );
                          }
                          return filtered.map((s) => {
                            const isSelected = selectedState === s.name;
                            return (
                              <button
                                key={s.isoCode}
                                type="button"
                                onClick={() => handleSelectState(s)}
                                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-orange-50 font-bold text-[#f26522]'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#f26522]'
                                }`}
                              >
                                <span className="truncate">{s.name}</span>
                                {isSelected && <Check size={13} className="text-[#f26522] shrink-0" />}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* City Dropdown */}
              <div className="space-y-1.5" ref={cityDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={!selectedState}
                    onClick={() => {
                      if (!selectedState) return;
                      setIsCityDropdownOpen(!isCityDropdownOpen);
                      setIsCatDropdownOpen(false);
                      setIsSubCatDropdownOpen(false);
                      setIsStateDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs border rounded-xl transition-all font-medium text-left ${
                      !selectedState
                        ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 cursor-pointer'
                    } ${isCityDropdownOpen ? 'border-[#f26522] ring-2 ring-[#f26522]/20 bg-white' : ''}`}
                  >
                    <span className={selectedCity ? 'text-slate-800 font-semibold truncate' : 'text-slate-400'}>
                      {!selectedState ? 'Select state first' : (selectedCity || 'Select City')}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCityDropdownOpen ? 'rotate-180 text-[#f26522]' : ''}`} />
                  </button>

                  {isCityDropdownOpen && selectedState && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search city..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {(() => {
                          const filtered = cities.filter((c) =>
                            c.name.toLowerCase().includes(citySearch.toLowerCase())
                          );
                          if (filtered.length === 0) {
                            return (
                              <div className="py-3 text-center text-xs text-slate-400">
                                No cities found for {selectedState}
                              </div>
                            );
                          }
                          return filtered.map((c) => {
                            const isSelected = selectedCity === c.name;
                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => handleSelectCity(c)}
                                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-orange-50 font-bold text-[#f26522]'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#f26522]'
                                }`}
                              >
                                <span className="truncate">{c.name}</span>
                                {isSelected && <Check size={13} className="text-[#f26522] shrink-0" />}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                  <span>Verifying structure and validating records...</span>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
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
                disabled={isProcessingFile}
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
                    Review and verify classified records before importing into Customer Database
                  </p>
                  {selectedCatName && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                      <span className="bg-orange-50 text-[#f26522] font-bold px-2 py-0.5 rounded-md border border-orange-200/80">
                        {selectedCatName} &gt; {selectedSubCatName}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                        {selectedCity}, {selectedState}
                      </span>
                    </div>
                  )}
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
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Customer Name</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Company Name</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Email</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Phone / Mobile</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Reason / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reviewRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
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
                            <td className="p-3 text-slate-600">{item.companyName}</td>
                            <td className="p-3 text-slate-600">{item.email}</td>
                            <td className="p-3 text-slate-600">{item.mobile}</td>
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

export default CustomerDatabase;
