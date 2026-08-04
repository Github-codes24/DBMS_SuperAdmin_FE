import React, { useState } from 'react';
import { vendorProducts as initialProducts } from '@/data/vendorMockData';
import { X, CheckCircle2, Edit3, Download } from 'lucide-react';

export const MyProducts = ({ onAddProductClick }) => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState('In Stock');
  const [editDescription, setEditDescription] = useState('');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditDiscount(product.discount || 0);
    setEditStock(product.stock);
    setEditCategory(product.category);
    setEditStatus(product.status);
    setEditDescription(product.description || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editPrice) || 0;
    const discNum = parseFloat(editDiscount) || 0;
    const effectivePrice = Math.round(priceNum * (1 - discNum / 100));

    const updated = products.map((p) => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: editName,
          price: priceNum,
          discount: discNum,
          effectivePrice: effectivePrice,
          stock: parseInt(editStock, 10) || 0,
          category: editCategory,
          status: editStatus,
          description: editDescription
        };
      }
      return p;
    });

    setProducts(updated);
    setEditingProduct(null);
    setToastMessage(`Product "${editName}" updated successfully!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Price (INR)', 'Stock', 'Status'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.effectivePrice,
      p.stock,
      `"${p.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lts_vendor_products_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Exported product catalog CSV successfully!');
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

      {/* Top Horizontal Toolbar: Search Input + Export CSV + Add Product Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product name, SKU, category..."
          className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            title="Export CSV File"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddProductClick}
            className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs whitespace-nowrap flex items-center space-x-1.5 cursor-pointer"
          >
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table matching Reference Cards */}
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
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 font-bold text-[#172033]">{p.sku}</td>
                <td className="py-3 font-semibold text-[#172033]">
                  <div className="flex items-center space-x-2.5">
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 text-[#64748B] font-semibold">{p.category}</td>
                <td className="py-3 font-bold text-[#172033]">
                  ₹{p.effectivePrice}
                  {p.discount > 0 && <span className="text-[10px] text-slate-400 font-normal line-through ml-1">₹{p.price}</span>}
                </td>
                <td className="py-3 font-extrabold text-[#172033]">{p.stock} units</td>
                <td className="py-3 font-bold">
                  {p.status === 'In Stock' && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">In Stock</span>}
                  {p.status === 'Low Stock' && <span className="bg-orange-100 text-[#EA580C] px-2 py-0.5 rounded text-[10px]">Low Stock</span>}
                  {p.status === 'Out of Stock' && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px]">Out of Stock</span>}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center justify-end space-x-1 ml-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Bar - Single Count Display */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Showing {filtered.length} products</span>
      </div>

      {/* Interactive Edit Product Modal Dialog */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Edit Product — <span className="text-[#F97316]">{editingProduct.sku}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
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
                  className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
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
                    className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Organic">Organic</option>
                    <option value="Spices">Spices</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Stock Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Price, Discount & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Product Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
