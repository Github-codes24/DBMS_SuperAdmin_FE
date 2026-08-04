import React from 'react';
import { VendorTopNav } from './VendorTopNav';
import { VendorSidebar } from './VendorSidebar';
import { VendorLogin } from './screens/VendorLogin';
import { VendorDashboard } from './screens/VendorDashboard';
import { MyProducts } from './screens/MyProducts';
import { AddProduct } from './screens/AddProduct';
import { Orders } from './screens/Orders';
import { Customers } from './screens/Customers';
import { Inventory } from './screens/Inventory';
import { SalesReports } from './screens/SalesReports';
import { ProfileSettings } from './screens/ProfileSettings';
import { Notifications } from './screens/Notifications';
import { HelpSupport } from './screens/HelpSupport';
import { VendorLogout } from './screens/VendorLogout';

export const VendorLiveView = ({ activeFlowItem, setActiveFlowItem, onLogout }) => {
  const renderCurrentScreen = () => {
    switch (activeFlowItem) {
      case '01 Vendor Login':
        return <VendorLogin onLoginSuccess={() => setActiveFlowItem('02 Vendor Dashboard')} />;
      case '02 Vendor Dashboard':
        return <VendorDashboard onNavigate={(screen) => setActiveFlowItem(screen)} />;
      case '03 My Products':
        return <MyProducts onAddProductClick={() => setActiveFlowItem('04 Add Product')} />;
      case '04 Add Product':
        return (
          <AddProduct
            onCancel={() => setActiveFlowItem('03 My Products')}
            onSaveSuccess={() => setActiveFlowItem('03 My Products')}
          />
        );
      case '05 Orders':
        return <Orders />;
      case '06 Customers':
        return <Customers />;
      case '07 Inventory':
        return <Inventory />;
      case '08 Sales Reports':
        return <SalesReports />;
      case '09 Profile & Settings':
        return <ProfileSettings />;
      case '10 Notifications':
        return <Notifications />;
      case '11 Help & Support':
        return <HelpSupport />;
      case '12 Logout':
        return (
          <VendorLogout
            onRelogin={() => {
              if (onLogout) onLogout();
              else setActiveFlowItem('02 Vendor Dashboard');
            }}
          />
        );
      default:
        return <VendorDashboard onNavigate={(screen) => setActiveFlowItem(screen)} />;
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans">
      {/* Top Navbar Header */}
      <VendorTopNav
        onNotificationClick={() => setActiveFlowItem('10 Notifications')}
        onLoginClick={() => setActiveFlowItem('01 Vendor Login')}
        onLogoutClick={() => {
          if (onLogout) onLogout();
          else setActiveFlowItem('12 Logout');
        }}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="max-w-[1700px] mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Sidebar Navigation Suite */}
        <VendorSidebar
          activeFlowItem={activeFlowItem}
          setActiveFlowItem={setActiveFlowItem}
        />

        {/* Main Active Page Content */}
        <main className="flex-1 min-w-0">
          {renderCurrentScreen()}
        </main>
      </div>
    </div>
  );
};
