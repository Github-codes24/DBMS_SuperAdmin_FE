import React from 'react';
import { Header } from '@/components/ui/Header';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentOrdersWidget } from '@/components/dashboard/RecentOrdersWidget';
import { TopVendorsWidget } from '@/components/dashboard/TopVendorsWidget';
import { LowStockWidget } from '@/components/dashboard/LowStockWidget';
import { RecentActivitiesWidget } from '@/components/dashboard/RecentActivitiesWidget';
import { Store, Users, Package, ShoppingBag, IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function DashboardPage({ setActiveTab, vendorsCount, customersCount, productsCount, ordersCount, totalRevenue }) {
  return (
    <div className="space-y-6">
      <Header
        title="Dashboard Overview"
        subtitle="Real-time analytics and platform performance metrics for Local Trade Street"
      />

      {/* 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Vendors"
          value={vendorsCount}
          change="+12%"
          isPositive={true}
          icon={Store}
          color="blue"
        />
        <KpiCard
          title="Total Customers"
          value={customersCount}
          change="+18%"
          isPositive={true}
          icon={Users}
          color="green"
        />
        <KpiCard
          title="Total Products"
          value={productsCount}
          change="+8%"
          isPositive={true}
          icon={Package}
          color="purple"
        />
        <KpiCard
          title="Total Orders"
          value={ordersCount}
          change="+24%"
          isPositive={true}
          icon={ShoppingBag}
          color="indigo"
        />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change="+15%"
          isPositive={true}
          icon={IndianRupee}
          color="amber"
        />
      </div>

      {/* Analytics Chart & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart />
        <TopVendorsWidget />
      </div>

      {/* Orders Table, Low Stock, & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentOrdersWidget onViewAll={() => setActiveTab('orders')} />
        <div className="space-y-6">
          <LowStockWidget onRestock={(item) => alert(`Initiated stock request for ${item}`)} />
          <RecentActivitiesWidget />
        </div>
      </div>
    </div>
  );
}
