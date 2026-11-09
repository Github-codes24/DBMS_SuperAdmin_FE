import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
  exportProductsCsv,
  clearProductError
} from '@/redux/slices/productsSlice.js';
import {
  X,
  CheckCircle2,
  Edit3,
  Download,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Package
} from 'lucide-react';

export const MyProducts = ({ onAddProductClick }) => {
  const dispatch = useDispatch();
  const {
    products,
    pagination,
    loading,
    detailLoading,
    updateLoading,
    deleteLoading,
    exportLoading,
    error,
    selectedProduct
  } = useSelector((state) => state.products);

  // Filters and Pagination State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals and Toasts State
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('Grocery');
  const [editStatus, setEditStatus] = useState('In Stock');
  const [editImage, setEditImage] = useState('');

  // Initial and reactive load when filters/pagination change
  useEffect(() => {
    dispatch(fetchProducts({ page, limit, search, category, status }));
  }, [dispatch, page, limit, search, category, status]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle Category Filter Change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  // Handle Status Filter Change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  // Handle Reset All Filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('All');
    setPage(1);
  };

  // Open Edit Modal with product data
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditName(product.name || '');
    setEditPrice(product.price ?? '');
    setEditOriginalPrice(product.originalPrice ?? product.price ?? '');
    setEditStock(product.stock ?? '');
    setEditCategory(product.category || 'Grocery');
    setEditStatus(product.status || 'In Stock');
    setEditImage(product.image || '');
  };

  // Save Edit (API 12)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await dispatch(
        updateProduct({
          id: editingProduct._id,
          updateData: {
            price: Number(editPrice),
            stock: Number(editStock),
            name: editName.trim(),
            category: editCategory,
            originalPrice: Number(editOriginalPrice || editPrice),
            image: editImage.trim()
          }
        })
      ).unwrap();

      setToastMessage(`Product "${editName || editingProduct.sku}" updated successfully!`);
      setEditingProduct(null);
      dispatch(fetchProducts({ page, limit, search, category, status }));
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // Open View Details Modal (API 10)
  const handleOpenView = async (product) => {
    setViewingProduct(product);
    try {
      const res = await dispatch(fetchProductById(product._id)).unwrap();
      setViewingProduct(res);
    } catch (err) {
      console.error('Fetch details error:', err);
    }
  };

  // Confirm and Execute Delete (API 13)
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const res = await dispatch(deleteProduct(deletingProduct._id)).unwrap();
      setToastMessage(res.message || 'Product removed successfully');
      setDeletingProduct(null);

      // Handle pagination if last item on page deleted
      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        dispatch(fetchProducts({ page, limit, search, category, status }));
      }
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Export CSV (API 14)
  const handleExportCSV = async () => {
    try {
      const res = await dispatch(exportProductsCsv()).unwrap();
      setToastMessage(`Exported "${res.filename}" successfully!`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      setToastMessage(typeof err === 'string' ? err : 'Failed to export CSV');
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
              onClick={() => dispatch(fetchProducts({ page, limit, search, category, status }))}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => dispatch(clearProductError())}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Controls Toolbar: Search + Category Filter + Status Filter + Export CSV + Add Product */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search products by SKU, name, or category..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
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

        {/* Filter Dropdowns & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400">Category:</span>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="bg-transparent text-xs font-bold text-[#172033] focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Grocery">Grocery</option>
              <option value="Organic">Organic</option>
              <option value="Medical & Pharma">Medical & Pharma</option>
              <option value="Spices">Spices</option>
              <option value="Dairy">Dairy</option>
              <option value="Beverages">Beverages</option>
              <option value="Fashion & Apparel">Fashion & Apparel</option>
              <option value="Electronics & IT">Electronics & IT</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400">Status:</span>
            <select
              value={status}
              onChange={handleStatusChange}
              className="bg-transparent text-xs font-bold text-[#172033] focus:outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {(search || category !== 'All' || status !== 'All') && (
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Export CSV Button (API 14) */}
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-70 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            title="Export CSV File"
          >
            {exportLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={onAddProductClick}
            className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs whitespace-nowrap flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">SKU</th>
              <th className="pb-2.5">PRODUCT NAME</th>
              <th className="pb-2.5">CATEGORY</th>
              <th className="pb-2.5">PRICE</th>
              <th className="pb-2.5">STOCK</th>
              <th className="pb-2.5">STATUS</th>
              <th className="pb-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                    <span className="text-xs font-semibold">Loading products catalog...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No products found</p>
                    <p className="text-[11px] text-slate-400">
                      {search || category !== 'All' || status !== 'All'
                        ? 'Try clearing your filters or search keyword.'
                        : 'Click "+ Add Product" to create your first catalog item.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id || p.sku} className="hover:bg-slate-50/70 transition-colors">
                  {/* SKU */}
                  <td className="py-3 font-mono font-bold text-[#172033]">{p.sku}</td>

                  {/* Product Name & Image */}
                  <td className="py-3 font-semibold text-[#172033]">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150'}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150';
                        }}
                      />
                      <span className="truncate max-w-[200px]" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 text-[#64748B] font-semibold">{p.category}</td>

                  {/* Price */}
                  <td className="py-3 font-bold text-[#172033]">
                    ₹{p.price}
                    {p.originalPrice > p.price && (
                      <span className="text-[10px] text-slate-400 font-normal line-through ml-1.5">
                        ₹{p.originalPrice}
                      </span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3 font-extrabold text-[#172033]">{p.stock} units</td>

                  {/* Status Badge */}
                  <td className="py-3 font-bold">
                    {p.status === 'In Stock' && (
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        In Stock
                      </span>
                    )}
                    {p.status === 'Low Stock' && (
                      <span className="bg-orange-100 text-[#EA580C] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Low Stock
                      </span>
                    )}
                    {p.status === 'Out of Stock' && (
                      <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Out of Stock
                      </span>
                    )}
                    {!['In Stock', 'Low Stock', 'Out of Stock'].includes(p.status) && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {p.status || 'Active'}
                      </span>
                    )}
                  </td>

                  {/* Actions: View / Edit / Delete */}
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenView(p)}
                        title="View Details"
                        className="p-1.5 text-slate-500 hover:text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        title="Edit Product"
                        className="p-1.5 text-slate-500 hover:text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        title="Delete Product"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          Showing <span className="font-bold text-[#172033]">{products.length}</span> of{' '}
          <span className="font-bold text-[#172033]">{pagination.totalProducts || products.length}</span> products
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

          {/* Page Indicators */}
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

      {/* Interactive Edit Product Modal Dialog (API 12) */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Edit Product — <span className="font-mono text-[#F97316]">{editingProduct.sku}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>

              {/* Category & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Organic">Organic</option>
                    <option value="Medical & Pharma">Medical & Pharma</option>
                    <option value="Spices">Spices</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Electronics & IT">Electronics & IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Stock Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Price, Original Price & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Details Modal (API 10) */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">Product Details</h3>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                <span className="text-xs text-slate-400">Loading product details...</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Product Image & Name Header */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <img
                    src={viewingProduct.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150'}
                    alt={viewingProduct.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150';
                    }}
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-[#172033] leading-snug">{viewingProduct.name}</h4>
                    <span className="font-mono text-slate-400 font-bold text-[11px] block mt-0.5">{viewingProduct.sku}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Category</span>
                    <span className="font-bold text-[#172033]">{viewingProduct.category}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Status</span>
                    <span className="font-extrabold text-emerald-700">{viewingProduct.status}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Price</span>
                    <span className="font-black text-sm text-[#172033]">₹{viewingProduct.price}</span>
                    {viewingProduct.originalPrice > viewingProduct.price && (
                      <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{viewingProduct.originalPrice}</span>
                    )}
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Stock</span>
                    <span className="font-extrabold text-[#172033]">{viewingProduct.stock} units</span>
                  </div>
                  {viewingProduct.vendorId && (
                    <div className="col-span-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Vendor Account</span>
                      <span className="font-semibold text-slate-700">{viewingProduct.vendorId}</span>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setViewingProduct(null)}
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

      {/* Delete Product Confirmation Modal (API 13) */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#172033]">Confirm Product Deletion</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#172033]">{deletingProduct.name}</p>
              <p className="font-mono text-slate-500 font-semibold">{deletingProduct.sku} • ₹{deletingProduct.price}</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently remove this product from your vendor store catalog?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center space-x-1.5 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
