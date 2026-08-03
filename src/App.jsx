import React, { useState } from 'react';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    id: '2547',
    name: 'Shivam',
    email: 'shivam.lts@localtradestreet.com',
    phone: '+91 98765 43210',
    role: 'CRM Telecaller Executive',
    financialYear: '2026-2027',
    avatar: 'S'
  });

  const [activeNav, setActiveNav] = useState('vendor_mgmt');
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalState, setModalState] = useState('none'); // 'none' | 'edit' | 'paymentOrder' | 'paymentHistory' | 'packageSuccess' | 'addVendor'
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Login
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Update Profile details
  const handleUpdateUser = (updatedProfile) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedProfile,
      avatar: updatedProfile.name ? updatedProfile.name.charAt(0).toUpperCase() : prev.avatar
    }));
  };

  // Open Edit Vendor Modal
  const handleOpenEdit = (vendor) => {
    setSelectedVendor(vendor);
    setModalState('edit');
  };

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
            <VendorSearch
              vendors={vendors}
              onOpenEdit={handleOpenEdit}
              onOpenPaymentOrder={handleOpenPaymentOrder}
              onSendPackageDetails={handleSendPackageDetails}
              onOpenPaymentHistory={handleOpenPaymentHistory}
              onOpenAddVendor={() => setModalState('addVendor')}
            />
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
