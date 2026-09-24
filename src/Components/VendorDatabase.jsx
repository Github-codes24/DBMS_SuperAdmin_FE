import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { State, City } from 'country-state-city';
import api from '../services/api';
import {
  fetchVendors,
  fetchVendorDetail,
  createVendor,
  updateVendor,
  deleteVendor,
  bulkImportVendors,
  clearSelectedVendor
} from '../redux/slices/vendorSlice';
import {
  Search, Download, Lock, FileSpreadsheet, FileText, Upload, X, Check,
  FileDown, UserPlus, Plus, ChevronUp, ChevronDown, Building2, MapPin,
  Eye, EyeOff, Phone, Mail, Edit2, Trash2, Ban, UserCheck, AlertTriangle,
  ChevronLeft, ChevronRight
} from 'lucide-react';

function VendorDatabase({ compact = false }) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { vendors: apiVendors = [], selectedVendor = null, loading = false, isSaving = false } = useSelector((state) => state.vendor || {});

  const allStates = (State && typeof State.getStatesOfCountry === 'function') ? State.getStatesOfCountry('IN') : [];

  // Read initial filter values from URL search params
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialUrlState = searchParams.get('state') || 'All';
  const initialUrlCity = searchParams.get('city') || 'All';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedState, setSelectedState] = useState(initialUrlState);
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialUrlCity);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(isNaN(initialPage) || initialPage < 1 ? 1 : initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Initialize availableCities based on initial state from URL
  useEffect(() => {
    if (initialUrlState && initialUrlState !== 'All') {
      const stObj = allStates.find((s) => s.name.toLowerCase() === initialUrlState.toLowerCase());
      if (stObj) {
        setSelectedStateCode(stObj.isoCode);
        const stateCities = City.getCitiesOfState('IN', stObj.isoCode) || [];
        setAvailableCities(stateCities);
      }
    }
  }, []);

  // Update URL helper function
  const updateUrlParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'All') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    updateUrlParams({ search: val, state: selectedState, city: selectedCity });
  };

  const handleStateFilterChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedCity('All');
    if (stateName === 'All') {
      setSelectedStateCode('');
      setAvailableCities([]);
      updateUrlParams({ search: searchTerm, state: 'All', city: 'All' });
    } else {
      const stObj = allStates.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
      if (stObj) {
        setSelectedStateCode(stObj.isoCode);
        const stateCities = City.getCitiesOfState('IN', stObj.isoCode) || [];
        setAvailableCities(stateCities);
      } else {
        setAvailableCities([]);
      }
      updateUrlParams({ search: searchTerm, state: stateName, city: 'All' });
    }
  };

  const handleCityFilterChange = (cityName) => {
    setSelectedCity(cityName);
    updateUrlParams({ search: searchTerm, state: selectedState, city: cityName });
  };


  // View Mode State: 'table' | 'add-vendor'
  const [viewMode, setViewMode] = useState('table');

  // Custom Fields State
  const [customFields, setCustomFields] = useState([
    { id: 'field-1', label: 'GSTIN / Tax ID', type: 'text', placeholder: 'e.g. 27AAAAA0000A1Z5', required: false },
    { id: 'field-2', label: 'Complete Business Address', type: 'text', placeholder: 'e.g. 102 Commerce Hub, MG Road', required: false },
    { id: 'field-3', label: 'Pincode', type: 'text', placeholder: 'e.g. 400001', required: false }
  ]);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
  const [newCustomField, setNewCustomField] = useState({ label: '', type: 'text', placeholder: '', required: false });

  // Add Vendor Form State
  const [showAddPassword, setShowAddPassword] = useState(false);
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
    password: '',
    gstNo: '',
    address: '',
    pincode: '',
    state: '',
    city: '',
    status: 'Active',
    customData: {}
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

  // Edit Vendor Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Confirmation Popup Modal State (for Block / Delete)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'block' | 'delete'
    vendor: null,
  });

  // Role Access Check: Only Super Admin and Admin have access
  const userRole = (localStorage.getItem('userRole') || 'Super Admin').trim();
  const normalizedRole = userRole.toLowerCase();
  const hasAccessPermission = normalizedRole === 'super admin' || normalizedRole === 'admin';

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const vendors = Array.isArray(apiVendors) ? apiVendors.map((v, idx) => {
    let dateOnly = '-';
    if (v.verificationDateTime) {
      const d = new Date(v.verificationDateTime);
      dateOnly = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(v.verificationDateTime).split(' ')[0];
    }

    const mobileNum = v.contactNo || v.mobile || v.phone || v.phoneNumber || v.mobileNumber || '-';

    return {
      _id: v._id,
      srNo: v.srNo || String(idx + 1).padStart(2, '0'),
      transNo: v.transNo || `TRX${Math.floor(90000 + Math.random() * 9999)}`,
      vendorCode: v.vendorCode || v.vendorId || v.transNo || `VND${Math.floor(1000 + Math.random() * 9000)}`,
      id: v.vendorId || v.vendorCode || v._id,
      name: v.companyName || v.shopName || v.vendorName || '-',
      companyName: v.companyName || v.shopName || v.vendorName || '-',
      ownerName: v.ownerName || '-',
      category: v.category || '-',
      verificationDate: dateOnly,
      contactNo: mobileNum,
      mobile: mobileNum,
      email: v.email || '-',
      gstNo: v.gstin || '-',
      address: v.completeAddress || '-',
      pincode: v.pincode || '-',
      status: v.status,
      state: v.state || '-',
      city: v.city || '-',
      referId: v.referId || v.referralId || v.referrerId || '-',
      referCode: v.referCode || v.referralCode || v.refCode || '-',
      agentName: v.agentName || v.assignedAgent || v.agent || '-',
      mappedCustomers: v.mappedCustomers ?? 0
    };
  }) : [];

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

  // Calculate pagination boundaries
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = validCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    const pageNum = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(pageNum);
    updateUrlParams({ search: searchTerm, state: selectedState, city: selectedCity, page: pageNum === 1 ? null : pageNum });
  };

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
      email: newVendor.email,
      password: newVendor.password,
      state: newVendor.state,
      city: newVendor.city,
      status: newVendor.status
    })).unwrap().then((res) => {
      setShowAddPassword(false);
      setViewMode('table');
      setNewVendor({
        srNo: '',
        transNo: '',
        id: '',
        name: '',
        ownerName: '',
        category: '',
        verificationDateTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contactNo: '',
        email: '',
        password: '',
        gstNo: '',
        address: '',
        pincode: '',
        state: '',
        city: '',
        status: 'Active',
        customData: {}
      });
      const emailSent = res?.data?.emailSent;
      const vendorName = res?.data?.vendor?.vendorName || newVendor.name;
      if (emailSent === true) {
        setToastMsg(`Vendor "${vendorName}" created successfully. Login credentials have been sent to the registered email address.`);
      } else if (emailSent === false) {
        setToastMsg(`Vendor "${vendorName}" created successfully, but the credentials email could not be sent.`);
      } else {
        setToastMsg(`Vendor "${vendorName}" added successfully!`);
      }
      setTimeout(() => setToastMsg(''), 6000);
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
      if (selectedVendorDetail && (selectedVendorDetail._id === ven._id || selectedVendorDetail.id === ven.id)) {
        setSelectedVendorDetail({ ...selectedVendorDetail, status: newStatus });
      }
    });
  };

  // Open Edit Vendor Modal
  const handleOpenEditModal = (ven) => {
    if (!hasAccessPermission) return;
    setEditingVendor({
      _id: ven._id,
      id: ven.id,
      name: ven.name || '',
      ownerName: ven.ownerName !== '-' ? ven.ownerName : '',
      category: ven.category || '',
      transNo: ven.transNo || '',
      contactNo: ven.contactNo !== '-' ? ven.contactNo : '',
      email: ven.email !== '-' ? ven.email : '',
      state: ven.state !== '-' ? ven.state : '',
      city: ven.city !== '-' ? ven.city : '',
      status: ven.status || 'Active',
      gstNo: ven.gstNo !== '-' ? ven.gstNo : '',
      address: ven.address !== '-' ? ven.address : '',
      pincode: ven.pincode !== '-' ? ven.pincode : '',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Vendor Form
  const handleEditVendorSubmit = (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    if (!editingVendor.name || !editingVendor.category) {
      alert('Please fill in Vendor Name and Category');
      return;
    }

    const targetId = editingVendor._id || editingVendor.id;
    const updatePayload = {
      vendorName: editingVendor.name,
      ownerName: editingVendor.ownerName,
      category: editingVendor.category,
      transNo: editingVendor.transNo,
      contactNo: editingVendor.contactNo,
      email: editingVendor.email,
      state: editingVendor.state,
      city: editingVendor.city,
      status: editingVendor.status,
      gstin: editingVendor.gstNo,
      completeAddress: editingVendor.address,
      pincode: editingVendor.pincode,
    };

    dispatch(updateVendor({
      vendorId: targetId,
      updateData: updatePayload,
    })).unwrap().then(() => {
      setIsEditModalOpen(false);
      setToastMsg(`Vendor "${editingVendor.name}" updated successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
      if (selectedVendorDetail && (selectedVendorDetail._id === targetId || selectedVendorDetail.id === targetId)) {
        setSelectedVendorDetail({
          ...selectedVendorDetail,
          ...editingVendor,
        });
      }
      setEditingVendor(null);
    });
  };

  // Prompt Confirmation for Block Action
  const handlePromptBlock = (ven) => {
    if (!hasAccessPermission) return;
    setConfirmModal({
      isOpen: true,
      type: 'block',
      vendor: ven,
    });
  };

  // Prompt Confirmation for Delete Action
  const handlePromptDelete = (ven) => {
    if (!hasAccessPermission) return;
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      vendor: ven,
    });
  };

  // Close Confirmation Modal
  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      vendor: null,
    });
  };

  // Execute Confirmed Block or Delete Action
  const handleConfirmAction = () => {
    if (!confirmModal.vendor) return;
    const ven = confirmModal.vendor;
    const targetId = ven._id || ven.id;

    if (confirmModal.type === 'block') {
      const newStatus = ven.status === 'Blocked' ? 'Active' : 'Blocked';
      dispatch(updateVendor({
        vendorId: targetId,
        updateData: { status: newStatus },
      })).unwrap().then(() => {
        setToastMsg(`Vendor "${ven.name}" has been ${newStatus === 'Blocked' ? 'blocked' : 'unblocked'}.`);
        setTimeout(() => setToastMsg(''), 4000);
        if (selectedVendorDetail && (selectedVendorDetail._id === targetId || selectedVendorDetail.id === targetId)) {
          setSelectedVendorDetail({ ...selectedVendorDetail, status: newStatus });
        }
        handleCloseConfirmModal();
      }).catch(() => {
        handleCloseConfirmModal();
      });
    } else if (confirmModal.type === 'delete') {
      dispatch(deleteVendor(targetId))
        .unwrap()
        .then(() => {
          setToastMsg(`Vendor "${ven.name}" deleted successfully.`);
          setTimeout(() => setToastMsg(''), 4000);
          if (selectedVendorDetail && (selectedVendorDetail._id === targetId || selectedVendorDetail.id === targetId)) {
            setSelectedVendorDetail(null);
          }
          handleCloseConfirmModal();
        }).catch(() => {
          handleCloseConfirmModal();
        });
    }
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

  // Dedicated Full-Page Add Vendor Screen
  if (viewMode === 'add-vendor') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('table')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>← Back to Vendor Directory</span>
            </button>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UserPlus size={18} className="text-[#f26522]" />
              <span>Add New Vendor Record</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomFieldModalOpen(true)}
              className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f26522] border border-orange-200/80 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={15} />
              <span>+ Add Custom Field</span>
            </button>
          </div>
        </div>

        {/* Full Page Add Vendor Form */}
        <form onSubmit={handleAddVendorSubmit} className="space-y-6">
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Primary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Traders Pvt Ltd"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronics / Medical / Grocery"
                  value={newVendor.category}
                  onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trans No.</label>
                <input
                  type="text"
                  placeholder="e.g. TRX90106"
                  value={newVendor.transNo}
                  onChange={(e) => setNewVendor({ ...newVendor, transNo: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact No.</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newVendor.contactNo}
                  onChange={(e) => setNewVendor({ ...newVendor, contactNo: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. vendor@example.com"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <select
                  value={newVendor.state}
                  onChange={(e) => setNewVendor({ ...newVendor, state: e.target.value, city: '' })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
                >
                  <option value="">-- Select State --</option>
                  {allStates.map((st) => (
                    <option key={st.isoCode} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <select
                  value={newVendor.city}
                  onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
                >
                  <option value="">-- Select City --</option>
                  {(() => {
                    const stObj = allStates.find((s) => s.name === newVendor.state);
                    const cityList = stObj ? (City.getCitiesOfState('IN', stObj.isoCode) || []) : [];
                    return cityList.map((ct) => (
                      <option key={ct.name} value={ct.name}>{ct.name}</option>
                    ));
                  })()}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={newVendor.status}
                  onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    placeholder="Enter vendor login password"
                    value={newVendor.password}
                    onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                    className="w-full px-3.5 py-2 pr-8 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Verification Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-07-31 10:30 AM"
                  value={newVendor.verificationDateTime}
                  onChange={(e) => setNewVendor({ ...newVendor, verificationDateTime: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>
            </div>
          </div>

          {/* Custom Form Fields Section */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#f26522] uppercase tracking-wider">Custom Dynamic Form Fields</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">User configured input fields created dynamically</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomFieldModalOpen(true)}
                className="px-3 py-1.5 bg-orange-100 hover:bg-[#f26522] text-[#f26522] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} />
                <span>+ Add Field</span>
              </button>
            </div>

            {customFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((cf) => (
                  <div key={cf.id} className={cf.type === 'textarea' ? 'md:col-span-2' : 'col-span-1'}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {cf.label} {cf.required && <span className="text-rose-500">*</span>}
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomFields(customFields.filter(f => f.id !== cf.id))}
                        className="text-[11px] text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                      >
                        ✕ Remove Field
                      </button>
                    </div>
                    {cf.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        required={cf.required}
                        placeholder={cf.placeholder || `Enter ${cf.label}`}
                        value={newVendor.customData?.[cf.id] || ''}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          customData: { ...newVendor.customData, [cf.id]: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 resize-none"
                      />
                    ) : cf.type === 'dropdown' ? (
                      <select
                        required={cf.required}
                        value={newVendor.customData?.[cf.id] || ''}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          customData: { ...newVendor.customData, [cf.id]: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      >
                        <option value="">-- Select {cf.label} --</option>
                        {cf.options && cf.options.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : cf.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 py-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!newVendor.customData?.[cf.id]}
                          onChange={(e) => setNewVendor({
                            ...newVendor,
                            customData: { ...newVendor.customData, [cf.id]: e.target.checked }
                          })}
                          className="rounded border-slate-300 text-[#f26522] focus:ring-[#f26522]"
                        />
                        <span>Enable {cf.label}</span>
                      </label>
                    ) : (
                      <input
                        type={cf.type || 'text'}
                        required={cf.required}
                        placeholder={cf.placeholder || `Enter ${cf.label}`}
                        value={newVendor.customData?.[cf.id] || ''}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          customData: { ...newVendor.customData, [cf.id]: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <p className="text-xs text-slate-500 font-medium">No custom fields created yet.</p>
                <button
                  type="button"
                  onClick={() => setIsCustomFieldModalOpen(true)}
                  className="mt-2 text-xs font-extrabold text-[#f26522] hover:underline cursor-pointer"
                >
                  Click here to create a custom field
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Vendor Record'}</span>
            </button>
          </div>
        </form>

        {/* CREATE CUSTOM FIELD BUILDER MODAL */}
        {isCustomFieldModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-[#f26522]" />
                  <h3 className="text-xs font-bold text-white">Create Custom Form Input Field</h3>
                </div>
                <button
                  onClick={() => setIsCustomFieldModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCustomField.label.trim()) return;
                  const fieldId = 'custom_' + Date.now();
                  const parsedOptions = newCustomField.options
                    ? newCustomField.options.split(',').map(o => o.trim()).filter(Boolean)
                    : [];
                  setCustomFields([
                    ...customFields,
                    {
                      id: fieldId,
                      label: newCustomField.label.trim(),
                      type: newCustomField.type || 'text',
                      placeholder: newCustomField.placeholder ? newCustomField.placeholder.trim() : '',
                      options: parsedOptions,
                      required: newCustomField.required
                    }
                  ]);
                  setNewCustomField({ label: '', type: 'text', placeholder: '', options: '', required: false });
                  setIsCustomFieldModalOpen(false);
                  setToastMsg(`Custom field "${newCustomField.label}" added to Vendor form!`);
                  setTimeout(() => setToastMsg(''), 4000);
                }}
                className="p-5 space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Label Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trade License Number / Bank Account No"
                    value={newCustomField.label}
                    onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Input Field Type</label>
                    <select
                      value={newCustomField.type}
                      onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                    >
                      <option value="text">Short Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="date">Date</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="checkbox">Checkbox Toggle</option>
                      <option value="textarea">Long Text Area</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Constraint</label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={newCustomField.required}
                        onChange={(e) => setNewCustomField({ ...newCustomField, required: e.target.checked })}
                        className="rounded border-slate-300 text-[#f26522] focus:ring-[#f26522]"
                      />
                      <span>Required Field</span>
                    </label>
                  </div>
                </div>

                {newCustomField.type === 'dropdown' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Dropdown Options (comma separated) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Category A, Category B, Category C"
                      value={newCustomField.options || ''}
                      onChange={(e) => setNewCustomField({ ...newCustomField, options: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Placeholder Guidance Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Enter registered trade license..."
                      value={newCustomField.placeholder}
                      onChange={(e) => setNewCustomField({ ...newCustomField, placeholder: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCustomFieldModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Custom Field</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

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

          {/* Action Buttons: Add Vendor */}
          {hasAccessPermission ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add Vendor Button */}
              <button
                onClick={() => setViewMode('add-vendor')}
                className="px-3.5 py-1.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Add New Vendor Record"
              >
                <UserPlus size={14} />
                <span>+ Add Vendor</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
              <Lock size={13} className="text-slate-400 shrink-0" />
              <span>Full Access restricted to Super Admin & Admin</span>
            </div>
          )}
        </div>

        {/* Search & State/City Filter Bar ⭐ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="relative sm:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor, sr no, trans no, category, verification date, city..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* State Filter Dropdown using country-state-city ⭐ */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => handleStateFilterChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="All">State: All States (India)</option>
              {allStates.map((st) => (
                <option key={st.isoCode} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter Dropdown ⭐ */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => handleCityFilterChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="All">City: All Cities</option>
              {availableCities.map((ct) => (
                <option key={ct.name} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="mb-3 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* TABLE VIEW */}
        <div
          className={`${
            itemsPerPage === 5 ? 'h-[300px]' : 'h-[520px]'
          } overflow-x-auto overflow-y-auto rounded-xl border border-slate-100 mb-4 scroll-smooth custom-scrollbar transition-all duration-200`}
        >
          <table className="w-full min-w-[1250px] text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">SR. NO.</th>
                <th className="py-2.5 px-3">VENDOR CODE</th>
                <th className="py-2.5 px-3">COMPANY NAME</th>
                <th className="py-2.5 px-3">MOBILE NUMBER</th>
                <th className="py-2.5 px-3">VERIFICATION DATE</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3">CITY</th>
                <th className="py-2.5 px-3">REFER. ID</th>
                <th className="py-2.5 px-3">REFER CODE</th>
                <th className="py-2.5 px-3">AGENT NAME</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {currentDisplayedVendors.length > 0 ? (
                currentDisplayedVendors.map((ven, idx) => {
                  const globalIdx = indexOfFirstItem + idx + 1;
                  return (
                  <tr key={ven.id || ven._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">{String(globalIdx).padStart(2, '0')}</td>
                    <td className="py-3 px-3 font-bold text-[#f26522] font-mono text-[11px]">{ven.vendorCode || ven.id || ven.transNo}</td>
                    
                    {/* Clickable Company Name ⭐ */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedVendorDetail(ven)}
                        className="text-[#f26522] hover:text-[#e05411] font-black text-xs hover:underline flex items-center gap-1.5 cursor-pointer bg-orange-50/70 px-2 py-1 rounded-lg border border-orange-200/60 shadow-2xs"
                      >
                        <Building2 size={13} className="shrink-0 text-[#f26522]" />
                        <span>{ven.companyName || ven.name}</span>
                      </button>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-semibold">{ven.contactNo || ven.mobile || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] font-medium">{ven.verificationDate || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{ven.state}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{ven.city}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{ven.referId || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{ven.referCode || '-'}</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{ven.agentName || '-'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold text-xs px-2.5 py-0.5 rounded-full border inline-block ${
                          ven.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : ven.status === 'Blocked'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                      >
                        {ven.status}
                      </span>
                    </td>

                    {/* Actions Column: View, Edit, Block, Delete */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Action */}
                        <button
                          type="button"
                          onClick={() => setSelectedVendorDetail(ven)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Action */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(ven)}
                          title="Edit Vendor"
                          className="p-1.5 rounded-lg text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Block / Unblock Action */}
                        <button
                          type="button"
                          onClick={() => handlePromptBlock(ven)}
                          title={ven.status === 'Blocked' ? 'Unblock Vendor' : 'Block Vendor'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            ven.status === 'Blocked'
                              ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                              : 'text-amber-600 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          {ven.status === 'Blocked' ? <UserCheck size={13} /> : <Ban size={13} />}
                        </button>

                        {/* Delete Action */}
                        <button
                          type="button"
                          onClick={() => handlePromptDelete(ven)}
                          title="Delete Vendor"
                          className="p-1.5 rounded-lg text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12" className="py-6 text-center text-xs text-slate-400">
                    No vendor records found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Interactive Pagination & Footer Bar */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-100">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-800">{filteredVendors.length > 0 ? indexOfFirstItem + 1 : 0}</strong> to <strong className="text-slate-800">{Math.min(indexOfLastItem, filteredVendors.length)}</strong> of <strong className="text-slate-800">{filteredVendors.length}</strong> vendors
          </span>
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                handlePageChange(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={validCurrentPage === 1}
            onClick={() => handlePageChange(validCurrentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pageNum === validCurrentPage
                    ? 'bg-[#f26522] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={validCurrentPage >= totalPages}
            onClick={() => handlePageChange(validCurrentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>



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
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                      selectedVendorDetail.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : selectedVendorDetail.status === 'Blocked'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
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

      {/* EDIT VENDOR MODAL ⭐ */}
      {isEditModalOpen && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-[#f26522]" />
                <h3 className="text-xs font-bold text-slate-800">Edit Vendor Record</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingVendor(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditVendorSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {/* Vendor Name */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Traders Pvt Ltd"
                    value={editingVendor.name}
                    onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Owner Name */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Patel"
                    value={editingVendor.ownerName}
                    onChange={(e) => setEditingVendor({ ...editingVendor, ownerName: e.target.value })}
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
                    value={editingVendor.category}
                    onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Trans No. */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Trans No.</label>
                  <input
                    type="text"
                    placeholder="e.g. TRX90106"
                    value={editingVendor.transNo}
                    onChange={(e) => setEditingVendor({ ...editingVendor, transNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Contact No. */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact No.</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={editingVendor.contactNo}
                    onChange={(e) => setEditingVendor({ ...editingVendor, contactNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. vendor@example.com"
                    value={editingVendor.email}
                    onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                  <select
                    value={editingVendor.state}
                    onChange={(e) => setEditingVendor({ ...editingVendor, state: e.target.value, city: '' })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
                  >
                    <option value="">-- Select State --</option>
                    {allStates.map((st) => (
                      <option key={st.isoCode} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <select
                    value={editingVendor.city}
                    onChange={(e) => setEditingVendor({ ...editingVendor, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
                  >
                    <option value="">-- Select City --</option>
                    {(() => {
                      const stObj = allStates.find((s) => s.name === editingVendor.state);
                      const cityList = stObj ? (City.getCitiesOfState('IN', stObj.isoCode) || []) : [];
                      return cityList.map((ct) => (
                        <option key={ct.name} value={ct.name}>{ct.name}</option>
                      ));
                    })()}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingVendor.status}
                    onChange={(e) => setEditingVendor({ ...editingVendor, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* GSTIN No */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">GSTIN / Tax No</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={editingVendor.gstNo}
                    onChange={(e) => setEditingVendor({ ...editingVendor, gstNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 440001"
                    value={editingVendor.pincode}
                    onChange={(e) => setEditingVendor({ ...editingVendor, pincode: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                {/* Complete Address */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Complete Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop No. 12, Main Commercial Complex, MG Road"
                    value={editingVendor.address}
                    onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingVendor(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{isSaving ? 'Updating...' : 'Update Vendor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL (FOR BLOCK & DELETE) ⭐ */}
      {confirmModal.isOpen && confirmModal.vendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
                confirmModal.type === 'delete'
                  ? 'bg-rose-100 text-rose-600'
                  : confirmModal.vendor.status === 'Blocked'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {confirmModal.type === 'delete' ? (
                  <Trash2 size={24} />
                ) : confirmModal.vendor.status === 'Blocked' ? (
                  <UserCheck size={24} />
                ) : (
                  <Ban size={24} />
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {confirmModal.type === 'delete'
                  ? 'Delete Vendor Record'
                  : confirmModal.vendor.status === 'Blocked'
                  ? 'Unblock Vendor'
                  : 'Block Vendor'}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-500 mb-4 px-2">
                {confirmModal.type === 'delete' ? (
                  <>
                    Are you sure you want to delete vendor <strong className="text-slate-800 font-semibold">{confirmModal.vendor.name}</strong>? This action cannot be undone and will permanently remove this record.
                  </>
                ) : confirmModal.vendor.status === 'Blocked' ? (
                  <>
                    Are you sure you want to unblock vendor <strong className="text-slate-800 font-semibold">{confirmModal.vendor.name}</strong>? This vendor will regain full access to the portal.
                  </>
                ) : (
                  <>
                    Are you sure you want to block vendor <strong className="text-slate-800 font-semibold">{confirmModal.vendor.name}</strong>? This vendor will be restricted from accessing the portal.
                  </>
                )}
              </p>

              {/* Vendor Info Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left text-xs mb-5 space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Vendor ID:</span>
                  <span className="font-mono font-bold text-slate-700">{confirmModal.vendor.transNo || confirmModal.vendor.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="font-semibold text-slate-700">{confirmModal.vendor.category}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">Current Status:</span>
                  <span className="font-bold text-slate-800">{confirmModal.vendor.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseConfirmModal}
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isSaving}
                  className={`w-full py-2.5 px-4 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5 ${
                    confirmModal.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : confirmModal.vendor.status === 'Blocked'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isSaving ? (
                    <span>Processing...</span>
                  ) : confirmModal.type === 'delete' ? (
                    <>
                      <Trash2 size={14} />
                      <span>Yes, Delete</span>
                    </>
                  ) : confirmModal.vendor.status === 'Blocked' ? (
                    <>
                      <UserCheck size={14} />
                      <span>Yes, Unblock</span>
                    </>
                  ) : (
                    <>
                      <Ban size={14} />
                      <span>Yes, Block</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default VendorDatabase;
