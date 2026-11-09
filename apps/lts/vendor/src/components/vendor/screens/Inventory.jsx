import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchInventory,
  updateInventoryStock,
  exportInventoryCsv,
  clearInventoryError
} from '@/redux/slices/inventorySlice.js';
import {
  X,
  CheckCircle2,
  Boxes,
  Download,
  Settings2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  PackageCheck
} from 'lucide-react';

export const Inventory = () => {
  const dispatch = useDispatch();
  const {
    inventory,
    page,
    pages,
    totalRecords,
    loading,
    updateLoading,
    exportLoading,
    error
  } = useSelector((state) => state.inventory);

  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Manage Stock Modal & Toast State
  const [managingItem, setManagingItem] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Initial and reactive load on search / page change (API 23)
  useEffect(() => {
    dispatch(fetchInventory({ page: currentPage, search }));
  }, [dispatch, currentPage, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenManage = (item) => {
    setManagingItem(item);
    setEditStock(item.stock ?? 0);
  };

  // Update Stock Level (API 24)
  const handleSaveInventory = async (e) => {
    e.preventDefault();
    if (!managingItem) return;

    try {
      // Send ONLY stock as required by backend (backend calculates status automatically)
      const res = await dispatch(
        updateInventoryStock({
          sku: managingItem.sku,
          stock: Number(editStock)
        })
      ).unwrap();

      setToastMessage(
        `Stock for "${managingItem.name || managingItem.sku}" updated to ${editStock} units! (${res.status || 'Updated'})`
      );
      setManagingItem(null);
      dispatch(fetchInventory({ page: currentPage, search }));
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Update inventory stock error:', err);
    }
  };

  // Export Inventory CSV (API 25)
  const handleExportCSV = async () => {
    try {
      const res = await dispatch(exportInventoryCsv()).unwrap();
      setToastMessage(`Exported "${res.filename}" successfully!`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      setToastMessage(typeof err === 'string' ? err : 'Failed to export inventory CSV');
      setTimeout(() => setToastMessage(''), 4000);
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
              onClick={() => dispatch(fetchInventory({ page: currentPage, search }))}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => dispatch(clearInventoryError())}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search inventory by product name, SKU (e.g. LTS-GRO-001)..."
            className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exportLoading}
          className="px-3.5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl text-xs shadow-xs whitespace-nowrap flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto transition-colors"
          title="Export Inventory CSV File"
        >
          {exportLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">SKU</th>
              <th className="pb-2.5">PRODUCT NAME</th>
              <th className="pb-2.5">CATEGORY</th>
              <th className="pb-2.5">STOCK</th>
              <th className="pb-2.5">STATUS</th>
              <th className="pb-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                    <span className="text-xs font-semibold">Loading inventory catalog...</span>
                  </div>
                </td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <PackageCheck className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No inventory records found</p>
                    <p className="text-[11px] text-slate-400">
                      {search
                        ? 'Try adjusting your search query.'
                        : 'Products added to your catalog will appear here with live stock levels.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.sku || item._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-extrabold text-[#172033] font-mono">{item.sku}</td>
                  <td className="py-3 font-semibold text-[#172033]">{item.name || item.product}</td>
                  <td className="py-3 text-slate-500 font-semibold">{item.category || 'Grocery'}</td>
                  <td className="py-3 font-extrabold text-[#172033]">{item.stock} units</td>
                  <td className="py-3 font-bold">
                    {item.status === 'In Stock' && (
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        In Stock
                      </span>
                    )}
                    {item.status === 'Low Stock' && (
                      <span className="bg-orange-100 text-[#EA580C] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Low Stock
                      </span>
                    )}
                    {item.status === 'Out of Stock' && (
                      <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Out of Stock
                      </span>
                    )}
                    {!['In Stock', 'Low Stock', 'Out of Stock'].includes(item.status) && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {item.status || 'Active'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleOpenManage(item)}
                      className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center space-x-1 ml-auto px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
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
          Showing <span className="font-bold text-[#172033]">{inventory.length}</span> of{' '}
          <span className="font-bold text-[#172033]">{totalRecords || inventory.length}</span> inventory records
          {pages > 1 && (
            <span className="text-slate-400 ml-1">
              (Page {page} of {pages})
            </span>
          )}
        </span>

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {Array.from({ length: Math.min(5, pages || 1) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
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
            onClick={() => setCurrentPage((prev) => Math.min(pages || 1, prev + 1))}
            disabled={currentPage >= (pages || 1) || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Manage Stock Modal (API 24) */}
      {managingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Boxes className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Manage Stock — <span className="font-mono text-[#F97316]">{managingItem.sku}</span>
                </h3>
              </div>
              <button
                onClick={() => setManagingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-[#172033]">
                  <span>Product Name</span>
                  <span className="text-right max-w-[200px] truncate">{managingItem.name || managingItem.product}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Category</span>
                  <span>{managingItem.category || 'Grocery'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Current Status</span>
                  <span className="font-bold text-emerald-600">{managingItem.status}</span>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Stock Level (Units) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  placeholder="e.g. 40"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Note: Backend automatically calculates status (0 = Out of Stock, 1–9 = Low Stock, 10+ = In Stock).
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManagingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Stock</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
