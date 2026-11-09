import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockOrders } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function RecentOrdersWidget({ onViewAll }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success">Delivered</Badge>;
      case 'Shipped': return <Badge variant="info">Shipped</Badge>;
      case 'Processing': return <Badge variant="warning">Processing</Badge>;
      case 'Cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader
        title="Recent Orders"
        subtitle="Latest transactions processed on Local Trade Street"
        action={
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        }
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{order.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{order.customer}</td>
                  <td className="px-5 py-3.5 text-slate-600">{order.vendor}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-3.5">{getStatusBadge(order.deliveryStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
