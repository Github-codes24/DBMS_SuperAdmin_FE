import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchOrders,
  fetchOrderById,
  updateOrderDeliveryStatus,
  exportOrdersCsv,
  clearOrdersError
} from '@/redux/slices/ordersSlice.js';
import {
  X,
  CheckCircle2,
  ShoppingBag,
  Download,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  Settings2,
  Eye,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  PackageCheck
} from 'lucide-react';

export const Orders = () => {
  const dispatch = useDispatch();
  const {
    orders,
    pagination,
    loading,
    detailLoading,
    updateStatusLoading,
    exportLoading,
    error,
    selectedOrder
  } = useSelector((state) => state.orders);

  // Filter & Pagination State
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals & Toast State
  const [managingOrder, setManagingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const filters = ['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'];

  // Initial and reactive load on filter/pagination changes (API 15)
  useEffect(() => {
    dispatch(
      fetchOrders({
        page,
        limit,
        search,
        deliveryStatus: activeFilter
      })
    );
  }, [dispatch, page, limit, search, activeFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setActiveFilter('All');
    setPage(1);
  };

  const handleOpenManage = (order) => {
    setManagingOrder(order);
    setNewStatus(order.deliveryStatus || 'Pending');
  };

  // Open View Details Modal (API 17)
  const handleOpenView = async (order) => {
    setViewingOrder(order);
    try {
      const res = await dispatch(fetchOrderById(order.orderId)).unwrap();
      setViewingOrder(res);
    } catch (err) {
      console.error('Fetch order detail error:', err);
    }
  };

  // Update Order Delivery Status (API 18)
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!managingOrder) return;

    try {
      await dispatch(
        updateOrderDeliveryStatus({
          orderId: managingOrder.orderId,
          deliveryStatus: newStatus
        })
      ).unwrap();

      setToastMessage(`Order ${managingOrder.orderId} status updated to "${newStatus}"!`);
      setManagingOrder(null);
      dispatch(fetchOrders({ page, limit, search, deliveryStatus: activeFilter }));
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Update delivery status error:', err);
    }
  };

  // Export Orders CSV (API 19)
  const handleExportCSV = async () => {
    try {
      const res = await dispatch(exportOrdersCsv()).unwrap();
      setToastMessage(`Exported "${res.filename}" successfully!`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      setToastMessage(typeof err === 'string' ? err : 'Failed to export orders CSV');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  // Format Date utility
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch(fetchOrders({ page, limit, search, deliveryStatus: activeFilter }))}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => dispatch(clearOrdersError())}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Filter Pill Tabs & Export CSV Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'bg-[#FFF7ED] text-[#EA580C] hover:bg-orange-100'
              }`}
            >
              {f}
            </button>
          ))}
          {(search || activeFilter !== 'All') && (
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exportLoading}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-70 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-colors self-start sm:self-auto"
          title="Export Orders CSV File"
        >
          {exportLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
          ) : (
            <Download className="w-3.5 h-3.5 text-slate-600" />
          )}
          <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search order ID (e.g. ORD-9401), customer name, products..."
          className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
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
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                    <span className="text-xs font-semibold">Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <PackageCheck className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No orders found</p>
                    <p className="text-[11px] text-slate-400">
                      {search || activeFilter !== 'All'
                        ? 'Try clearing search or filter parameters.'
                        : 'New customer orders will appear here in real-time.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.orderId || o._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-extrabold text-[#172033] font-mono">{o.orderId}</td>
                  <td className="py-3 font-semibold text-[#172033]">{o.customerName}</td>
                  <td className="py-3 text-slate-500 max-w-[220px] truncate" title={o.products}>
                    {o.products}
                  </td>
                  <td className="py-3 font-bold text-[#172033]">₹{o.amount}</td>
                  <td className="py-3 font-bold">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        o.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : o.paymentStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 font-bold">
                    {(o.deliveryStatus === 'Delivered' || o.deliveryStatus === 'Delivered Successfully') && (
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        {o.deliveryStatus}
                      </span>
                    )}
                    {o.deliveryStatus === 'Confirmed' && (
                      <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Confirmed
                      </span>
                    )}
                    {o.deliveryStatus === 'Shipped' && (
                      <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Shipped
                      </span>
                    )}
                    {o.deliveryStatus === 'Pending' && (
                      <span className="bg-orange-100 text-[#EA580C] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Pending
                      </span>
                    )}
                    {o.deliveryStatus === 'Cancelled' && (
                      <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Cancelled
                      </span>
                    )}
                    {![
                      'Delivered',
                      'Delivered Successfully',
                      'Confirmed',
                      'Shipped',
                      'Pending',
                      'Cancelled'
                    ].includes(o.deliveryStatus) && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {o.deliveryStatus}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5 ml-auto">
                      <button
                        onClick={() => handleOpenView(o)}
                        title="View Order Details"
                        className="p-1.5 text-slate-500 hover:text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenManage(o)}
                        title="Manage Order Status"
                        className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-orange-50"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination & Counts Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-medium">
          Showing <span className="font-bold text-[#172033]">{orders.length}</span> of{' '}
          <span className="font-bold text-[#172033]">{pagination.totalOrders || orders.length}</span> orders
          {pagination.pages > 1 && (
            <span className="text-slate-400 ml-1">
              (Page {pagination.page} of {pagination.pages})
            </span>
          )}
        </span>

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {Array.from({ length: Math.min(5, pagination.pages || 1) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === page;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage((prev) => Math.min(pagination.pages || 1, prev + 1))}
            disabled={page >= (pagination.pages || 1) || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Manage Order Modal (API 18) */}
      {managingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Manage Order — <span className="font-mono text-[#F97316]">{managingOrder.orderId}</span>
                </h3>
              </div>
              <button
                onClick={() => setManagingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Details Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#172033]">
                  <span>Customer Name</span>
                  <span>{managingOrder.customerName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Order Date</span>
                  <span>{formatDate(managingOrder.orderDate)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Current Payment Status</span>
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
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                  >
                    <option value="Pending">Pending Dispatch</option>
                    <option value="Confirmed">Confirmed & Packed</option>
                    <option value="Shipped">Out for Delivery (Shipped)</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Delivered Successfully">Delivered Successfully</option>
                    <option value="Cancelled">Cancelled Order</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Note: Backend automatically sets Payment Status to 'Paid' when Delivery Status is 'Delivered' or 'Delivered Successfully'.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setManagingOrder(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateStatusLoading}
                    className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {updateStatusLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Status</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Order Details Modal (API 17) */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">Order Details</h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                <span className="text-xs text-slate-400">Loading order details...</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Order ID</span>
                    <span className="font-mono font-extrabold text-[#F97316] text-sm">{viewingOrder.orderId}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Date Placed</span>
                    <span>{formatDate(viewingOrder.orderDate)}</span>
                  </div>
                  {viewingOrder.vendorId && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Vendor ID</span>
                      <span>{viewingOrder.vendorId}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Customer</span>
                    <span className="font-bold text-[#172033]">{viewingOrder.customerName}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Payment</span>
                    <span className="font-extrabold text-emerald-700">{viewingOrder.paymentStatus}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Amount</span>
                    <span className="font-black text-sm text-[#172033]">₹{viewingOrder.amount}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Delivery Status</span>
                    <span className="font-extrabold text-[#172033]">{viewingOrder.deliveryStatus}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Products</span>
                  <p className="font-semibold text-[#172033] leading-relaxed">{viewingOrder.products}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
