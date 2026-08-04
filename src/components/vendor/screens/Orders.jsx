import React, { useState } from 'react';
import { vendorOrders as initialOrders } from '@/data/vendorMockData';
import { X, CheckCircle2, ShoppingBag, Download, Clock, Truck, CheckCircle, AlertCircle, Settings2 } from 'lucide-react';

export const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [managingOrder, setManagingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const filters = ['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'];

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || o.deliveryStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleOpenManage = (order) => {
    setManagingOrder(order);
    setNewStatus(order.deliveryStatus);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!managingOrder) return;

    const updated = orders.map((o) => {
      if (o.id === managingOrder.id) {
        return {
          ...o,
          deliveryStatus: newStatus
        };
      }
      return o;
    });

    setOrders(updated);
    setManagingOrder(null);
    setToastMessage(`Order ${managingOrder.id} status updated to "${newStatus}"!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Products', 'Amount (INR)', 'Payment Status', 'Delivery Status', 'Date'];
    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${o.products.replace(/"/g, '""')}"`,
      o.amount,
      `"${o.paymentStatus}"`,
      `"${o.deliveryStatus}"`,
      `"${o.date}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lts_vendor_orders_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Exported orders list CSV successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Horizontal Filter Pill Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'bg-[#FFF7ED] text-[#EA580C] hover:bg-orange-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-colors self-start sm:self-auto"
          title="Export Orders CSV File"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search Input */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order ID, customer name, products..."
          className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">ORDER ID</th>
              <th className="pb-2.5">CUSTOMER</th>
              <th className="pb-2.5">PRODUCTS</th>
              <th className="pb-2.5">AMOUNT</th>
              <th className="pb-2.5">PAYMENT</th>
              <th className="pb-2.5">DELIVERY STATUS</th>
              <th className="pb-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 font-extrabold text-[#172033]">{o.id}</td>
                <td className="py-3 font-semibold text-[#172033]">{o.customer}</td>
                <td className="py-3 text-slate-500 max-w-[220px] truncate">{o.products}</td>
                <td className="py-3 font-bold text-[#172033]">₹{o.amount}</td>
                <td className="py-3 font-bold">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="py-3 font-bold">
                  {o.deliveryStatus === 'Delivered' && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">Delivered</span>
                  )}
                  {o.deliveryStatus === 'Confirmed' && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px]">Confirmed</span>
                  )}
                  {o.deliveryStatus === 'Pending' && (
                    <span className="bg-orange-100 text-[#EA580C] px-2 py-0.5 rounded text-[10px]">Pending</span>
                  )}
                  {o.deliveryStatus === 'Cancelled' && (
                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px]">Cancelled</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleOpenManage(o)}
                    className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center space-x-1 ml-auto"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Display */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Showing {filtered.length} orders</span>
      </div>

      {/* Interactive Manage Order Modal */}
      {managingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Manage Order — <span className="text-[#F97316]">{managingOrder.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setManagingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Details Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-[#172033]">
                  <span>Customer Name</span>
                  <span>{managingOrder.customer}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Order Date</span>
                  <span>{managingOrder.date}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Payment Status</span>
                  <span className="font-bold text-emerald-600">{managingOrder.paymentStatus}</span>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">ORDERED PRODUCTS</span>
                <p className="font-bold text-[#172033]">{managingOrder.products}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-extrabold text-sm text-[#172033]">
                  <span>Total Amount</span>
                  <span className="text-[#F97316]">₹{managingOrder.amount}</span>
                </div>
              </div>

              {/* Delivery Status Selector Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                    Update Delivery Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="Pending">Pending Dispatch</option>
                    <option value="Confirmed">Confirmed & Packed</option>
                    <option value="Shipped">Out for Delivery (Shipped)</option>
                    <option value="Delivered">Delivered Successfully</option>
                    <option value="Cancelled">Cancelled Order</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setManagingOrder(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
