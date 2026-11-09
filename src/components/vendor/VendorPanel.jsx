import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVendorProfile, logoutVendor } from '@/redux/slices/authSlice';
import { VendorHeader } from './VendorHeader';
import { VendorCanvasView } from './VendorCanvasView';
import { VendorLiveView } from './VendorLiveView';
import { VendorLogin } from './screens/VendorLogin';
import { VendorSsoCallback } from './screens/VendorSsoCallback';

export const VendorPanel = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [activeFlowItem, setActiveFlowItem] = useState('02 Vendor Dashboard');
  const [viewMode, setViewMode] = useState('live');

  const searchParams = new URLSearchParams(window.location.search);
  const [ssoActive, setSsoActive] = useState(Boolean(searchParams.get("ticket")));

  // Application Startup Authentication: Fetch profile if token exists
  useEffect(() => {
    if (token) {
      dispatch(fetchVendorProfile());
    }
  }, [dispatch, token]);

  const handleLogout = () => {
    dispatch(logoutVendor());
  };

  // SSO Authentication Flow
  if (!isAuthenticated && ssoActive) {
    return (
      <VendorSsoCallback
        onLoginSuccess={() => {
          setSsoActive(false);
          setActiveFlowItem('02 Vendor Dashboard');
        }}
        onCancel={() => setSsoActive(false)}
      />
    );
  }

  // Unauthenticated Screen: Vendor Login screen
  if (!isAuthenticated) {
    return (
      <VendorLogin
        onLoginSuccess={() => {
          setActiveFlowItem('02 Vendor Dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {viewMode === 'canvas' && (
        <VendorHeader
          activeFlowItem={activeFlowItem}
          setActiveFlowItem={setActiveFlowItem}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      <main className="flex-1">
        {viewMode === 'canvas' ? (
          <VendorCanvasView
            activeFlowItem={activeFlowItem}
            setActiveFlowItem={setActiveFlowItem}
            onNavigateToLive={(screenId) => {
              setActiveFlowItem(screenId);
              setViewMode('live');
            }}
          />
        ) : (
          <VendorLiveView
            activeFlowItem={activeFlowItem}
            setActiveFlowItem={setActiveFlowItem}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
};
