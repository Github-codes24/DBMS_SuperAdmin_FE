import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout as reduxLogout, fetchProfile, updateProfile } from './redux/slices/authSlice';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import VendorSearch from './components/VendorSearch';
import EditVendorModal from './components/EditVendorModal';
import CreatePaymentOrderModal from './components/CreatePaymentOrderModal';
import PaymentHistoryModal from './components/PaymentHistoryModal';
import PackageSuccessModal from './components/PackageSuccessModal';
import AddVendorModal from './components/AddVendorModal';
import NotificationReport from './components/NotificationReport';
import ProfileSection from './components/ProfileSection';
import { INITIAL_VENDORS } from './mockData';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user: currentUser } = useSelector((state) => state.auth);

  const [activeNav, setActiveNav] = useState('vendor_mgmt');
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorsError, setVendorsError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [modalState, setModalState] = useState('none'); // 'none' | 'edit' | 'paymentOrder' | 'paymentHistory' | 'packageSuccess' | 'addVendor'
  const [successMessage, setSuccessMessage] = useState('');

  const fetchVendors = async () => {
    const activeToken = token || localStorage.getItem('lts_telecaller_token');

    if (!activeToken || activeToken === 'mock-token') {
      // In mock/demo mode, use INITIAL_VENDORS and skip API call
      setVendors(INITIAL_VENDORS);
      return;
    }

    setLoadingVendors(true);
    setVendorsError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const headers = {
        'Authorization': `Bearer ${activeToken}`,
      };
      const response = await fetch(`${baseUrl}/api/telecaller/vendors`, {
        method: 'GET',
        headers,
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to fetch vendors');
      }

      let apiVendors = [];
      if (resData.data) {
        if (Array.isArray(resData.data)) {
          apiVendors = resData.data;
        } else if (Array.isArray(resData.data.data)) {
          apiVendors = resData.data.data;
        }
      }

      const mappedVendors = apiVendors.map((createdVendor) => ({
        id: createdVendor._id,
        vendorCode: createdVendor.vendorId,
        company: createdVendor.storeName || '',
        vendorName: createdVendor.fullName || '',
        phone: createdVendor.phone || '',
        alternatePhone: createdVendor.alternatePhone || '',
        whatsappNo: createdVendor.whatsapp || createdVendor.phone || '',
        email: createdVendor.email || '',
        state: createdVendor.state || 'Uttar Pradesh',
        city: createdVendor.city || 'Noida',
        locality: createdVendor.locality || '',
        address: createdVendor.address || createdVendor.fullAddress || '',
        paid: createdVendor.isPaidVendor ? 'Yes' : 'No',
        gstNo: createdVendor.gstNo || '',
        systemRegisterDate: createdVendor.createdAt
          ? new Date(createdVendor.createdAt).toLocaleDateString('en-GB')
          : new Date().toLocaleDateString('en-GB'),
        activePackageList: ['TP-Free'],
        createdBy: '2547',
        paymentHistory: [],
        images: (createdVendor.images || []).map((img, idx) => {
          const rawUrl = img.url || img.image || (typeof img === 'string' ? img : '');
          return {
            id: img._id || idx,
            url: resolveImageUrl(rawUrl),
            isPrimary: img.isPrimary || false,
            name: img.name || `Image ${idx + 1}`
          };
        })
      }));
      setVendors(mappedVendors);
    } catch (err) {
      console.error(err);
      setVendorsError(err.message || 'Server error occurred');
      // If API fails and we have no vendors, fallback to INITIAL_VENDORS
      if (vendors.length === 0) {
        setVendors(INITIAL_VENDORS);
      }
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch latest profile from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, dispatch]);

  // Fetch vendors from backend when authenticated and navigating to Vendor Management
  useEffect(() => {
    if (isAuthenticated && activeNav === 'vendor_mgmt') {
      fetchVendors();
    }
  }, [isAuthenticated, activeNav, token]);

  // Handle Login
  const handleLogin = (user) => {
    dispatch(loginSuccess({ user, token: 'mock-token' }));
  };

  // Handle Logout
  const handleLogout = () => {
    dispatch(reduxLogout());
  };

  // Update Profile details via API
  const handleUpdateUser = (updatedProfile) => {
    dispatch(updateProfile(updatedProfile));
  };


  // Open Vendor Modal (Edit or View Details)
  const handleOpenVendorModal = async (vendor, isView = false) => {
    setSelectedVendor(vendor);
    setIsViewOnly(isView);
    setModalState('edit');

    const activeToken = token || localStorage.getItem('lts_telecaller_token');
    if (!activeToken || activeToken === 'mock-token') {
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const headers = {
        'Authorization': `Bearer ${activeToken}`,
      };
      const response = await fetch(`${baseUrl}/api/telecaller/vendors/${vendor.id}`, {
        method: 'GET',
        headers,
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to fetch vendor details');
      }

      const createdVendor = resData.data;
      if (createdVendor) {
        const mappedVendor = {
          id: createdVendor._id,
          vendorCode: createdVendor.vendorId,
          company: createdVendor.storeName || '',
          vendorName: createdVendor.fullName || '',
          phone: createdVendor.phone || '',
          alternatePhone: createdVendor.alternatePhone || '',
          whatsappNo: createdVendor.whatsapp || createdVendor.phone || '',
          email: createdVendor.email || '',
          state: createdVendor.state || 'Uttar Pradesh',
          city: createdVendor.city || 'Noida',
          locality: createdVendor.locality || '',
          address: createdVendor.address || createdVendor.fullAddress || '',
          paid: createdVendor.isPaidVendor ? 'Yes' : 'No',
          gstNo: createdVendor.gstNo || '',
          systemRegisterDate: createdVendor.createdAt
            ? new Date(createdVendor.createdAt).toLocaleDateString('en-GB')
            : new Date().toLocaleDateString('en-GB'),
          activePackageList: ['TP-Free'],
          createdBy: '2547',
          paymentHistory: [],
          images: (createdVendor.images || []).map((img, idx) => {
            const rawUrl = img.url || img.image || (typeof img === 'string' ? img : '');
            return {
              id: img._id || idx,
              url: resolveImageUrl(rawUrl),
              isPrimary: img.isPrimary || false,
              name: img.name || `Image ${idx + 1}`
            };
          })
        };
        setSelectedVendor(mappedVendor);
        setVendors((prev) => prev.map((v) => (v.id === mappedVendor.id ? mappedVendor : v)));
      }
    } catch (err) {
      console.error('Failed to fetch individual vendor details:', err);
    }
  };

  const handleOpenEdit = (vendor) => handleOpenVendorModal(vendor, false);
  const handleOpenView = (vendor) => handleOpenVendorModal(vendor, true);

  // Save Edit Vendor Modal
  const handleSaveVendor = (updatedVendor, shouldFollowUp) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    );
    setModalState('none');
    if (shouldFollowUp) {
      alert(`Vendor details updated! Added to Telecaller Follow-up List for ${updatedVendor.vendorName}.`);
    }
  };

  // Open Create Payment Order Modal
  const handleOpenPaymentOrder = (vendor) => {
    setSelectedVendor(vendor);
    setModalState('paymentOrder');
  };

  // Dispatch Payment Link
  const handleSendPaymentLink = ({ vendor, gateway, totalAmount, targetPhone }) => {
    setModalState('none');
    setSuccessMessage(`Payment link of ₹${totalAmount.toFixed(2)} (${gateway}) sent successfully to ${vendor.company} on ${targetPhone}!`);
    setModalState('packageSuccess');
  };

  // Open Payment History Modal
  const handleOpenPaymentHistory = (vendor) => {
    setSelectedVendor(vendor);
    setModalState('paymentHistory');
  };

  // Send Package Details Action (Arrow icon ↗️)
  const handleSendPackageDetails = (vendor) => {
    setSelectedVendor(vendor);
    setSuccessMessage("Package Details send to vendor sucessfully!!");
    setModalState('packageSuccess');
  };

  // Add New Vendor
  const handleAddVendor = (newVendor) => {
    setVendors([newVendor, ...vendors]);
    setModalState('none');
    setSuccessMessage(`New vendor ${newVendor.company} (${newVendor.vendorCode}) created successfully!`);
    setModalState('packageSuccess');
  };

  // If user is not logged in, render Login Page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="crm-app">
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveNav('profile')}
      />

      {/* Main Layout Body (Sidebar + Content) */}
      <div className="crm-body">
        {/* Sidebar Navigation */}
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="main-content">
          {activeNav === 'vendor_mgmt' && (
            <>
              {loadingVendors && (
                <div style={{
                  padding: '12px 20px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  Loading vendors from server...
                </div>
              )}
              {vendorsError && (
                <div style={{
                  padding: '12px 20px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  Error loading vendors: {vendorsError}
                </div>
              )}
              <VendorSearch
                vendors={vendors}
                onOpenEdit={handleOpenEdit}
                onOpenView={handleOpenView}
                onOpenPaymentOrder={handleOpenPaymentOrder}
                onSendPackageDetails={handleSendPackageDetails}
                onOpenPaymentHistory={handleOpenPaymentHistory}
                onOpenAddVendor={() => setModalState('addVendor')}
                onRefresh={fetchVendors}
              />
            </>
          )}

          {activeNav === 'reports' && (
            <NotificationReport vendors={vendors} />
          )}

          {activeNav === 'profile' && (
            <ProfileSection currentUser={currentUser} onUpdateUser={handleUpdateUser} />
          )}

          {activeNav !== 'vendor_mgmt' && activeNav !== 'reports' && activeNav !== 'profile' && (
            <div className="card-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 style={{ fontSize: '20px', color: '#ff5500', marginBottom: '10px' }}>
                {activeNav.toUpperCase().replace('_', ' ')}
              </h2>
              <p style={{ color: '#64748b' }}>
                Select <strong>Vendor Management</strong>, <strong>Report</strong>, or <strong>My Profile</strong> from sidebar.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modals Orchestration */}
      {modalState === 'edit' && selectedVendor && (
        <EditVendorModal
          vendor={selectedVendor}
          isViewOnly={isViewOnly}
          onClose={() => setModalState('none')}
          onSave={handleSaveVendor}
        />
      )}

      {modalState === 'paymentOrder' && selectedVendor && (
        <CreatePaymentOrderModal
          vendor={selectedVendor}
          onClose={() => setModalState('none')}
          onSendPaymentLink={handleSendPaymentLink}
        />
      )}

      {modalState === 'paymentHistory' && selectedVendor && (
        <PaymentHistoryModal
          vendor={selectedVendor}
          onClose={() => setModalState('none')}
        />
      )}

      {modalState === 'packageSuccess' && (
        <PackageSuccessModal
          message={successMessage}
          onClose={() => setModalState('none')}
        />
      )}

      {modalState === 'addVendor' && (
        <AddVendorModal
          onClose={() => setModalState('none')}
          onAdd={handleAddVendor}
        />
      )}
    </div>
  );
}
