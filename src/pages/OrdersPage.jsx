import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Search, Eye, ShoppingBag, Truck, CreditCard, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function OrdersPage({ orders, setOrders, globalSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const query = searchTerm || globalSearch;

  const filteredOrders = orders.filter((o) => {
    const matchesQuery =
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.customer.toLowerCase().includes(query.toLowerCase()) ||
      o.vendor.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.deliveryStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleDeliveryStatusChange = (orderId, newStatus) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, deliveryStatus: newStatus } : o)));
  };

  const getDeliveryBadge = (status) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success">Delivered</Badge>;
      case 'Shipped': return <Badge variant="info">Shipped</Badge>;
      case 'Processing': return <Badge variant="warning">Processing</Badge>;
      case 'Pending': return <Badge variant="neutral">Pending</Badge>;
      case 'Cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'Refunded': return <Badge variant="danger">Refunded</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Orders & Fulfillment" subtitle="Monitor customer purchases, shipping dispatch, and payment statuses" />

      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search Order ID, customer, vendor..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          options={['All', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled']}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Vendor</th>
                <th className="px-5 py-3.5">Products Summary</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">{ord.id}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{ord.customer}</td>
                  <td className="px-5 py-4 text-slate-600">{ord.vendor}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{ord.products}</td>
                  <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(ord.totalAmount)}</td>
                  <td className="px-5 py-4">{getPaymentBadge(ord.paymentStatus)}</td>
                  <td className="px-5 py-4">
                    <Select
                      options={['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']}
                      value={ord.deliveryStatus}
                      onChange={(e) => handleDeliveryStatusChange(ord.id, e.target.value)}
                      className="py-1 text-xs w-32"
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(ord);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Invoice Modal */}
      {selectedOrder && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Invoice Summary — ${selectedOrder.id}`}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-slate-400">Order Placed On</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5"><Calendar className="w-3.5 h-3.5 text-blue-600" /> {selectedOrder.date}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Total Payable</p>
                <p className="font-bold text-blue-600 text-base">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Customer Name</span><span className="font-semibold text-slate-800">{selectedOrder.customer}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Vendor Store</span><span className="font-semibold text-slate-800">{selectedOrder.vendor}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Payment Status</span><span>{getPaymentBadge(selectedOrder.paymentStatus)}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Delivery Status</span><span>{getDeliveryBadge(selectedOrder.deliveryStatus)}</span></div>
              <div><span className="text-slate-500 block mb-1">Purchased Products</span><p className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">{selectedOrder.products}</p></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
