import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { salesChartData } from '@/data/mockData';
import { Download, TrendingUp, Users, ShoppingBag, BarChart2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState('7m');

  const vendorPerformanceData = [
    { name: 'Rajesh Fresh Mart', revenue: 420000 },
    { name: 'Ethnic Threads', revenue: 310000 },
    { name: 'Green Leaf', revenue: 280000 },
    { name: 'Tech Hub', revenue: 210000 },
    { name: 'Flavor Street', revenue: 150000 }
  ];

  const categoryShareData = [
    { name: 'Grocery', value: 40, color: '#2563eb' },
    { name: 'Fashion', value: 25, color: '#10b981' },
    { name: 'Organic', value: 18, color: '#8b5cf6' },
    { name: 'Electronics', value: 12, color: '#f59e0b' },
    { name: 'Others', value: 5, color: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      <Header title="Analytics & Executive Reports" subtitle="Detailed breakdown of sales, growth curves, category metrics, and vendor KPIs">
        <Select options={['Last 7 Days', 'Last 30 Days', 'Last 7 Months']} value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="w-40" />
        <Button variant="outline" onClick={() => alert('Generating CSV report export...')}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </Header>

      {/* Revenue & Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Sales & Revenue Growth" subtitle="Monthly total sales volume in INR" />
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Vendor Revenue Distribution" subtitle="Top 5 vendor revenue contributions" />
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Growth & Product Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Customer Growth Trend" subtitle="New buyer registrations over time" />
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip formatter={(value) => [value, 'New Customers']} />
                  <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Product Category Breakdown" subtitle="Share of sales across product categories" />
          <CardContent className="flex items-center justify-center">
            <div className="h-[260px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {categoryShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 pl-4 text-xs">
                {categoryShareData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700">{item.name}:</span>
                    <span className="text-slate-500">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
