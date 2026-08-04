import React, { useState } from 'react';
import { VendorHeader } from './VendorHeader';
import { VendorCanvasView } from './VendorCanvasView';
import { VendorLiveView } from './VendorLiveView';
import { VendorLogin } from './screens/VendorLogin';

export const VendorPanel = () => {
  // Initial Landing State: unauthenticated (shows exact Vendor Login card first!)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeFlowItem, setActiveFlowItem] = useState('02 Vendor Dashboard');
  const [viewMode, setViewMode] = useState('live');

  // Initial Screen: Clean Vendor Login screen matching user screenshot
  if (!isAuthenticated) {
    return (
      <VendorLogin
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setActiveFlowItem('02 Vendor Dashboard');
        }}
        onBackToHome={() => {
          setIsAuthenticated(true);
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
            onLogout={() => setIsAuthenticated(false)}
          />
        )}
      </main>
    </div>
  );
};
