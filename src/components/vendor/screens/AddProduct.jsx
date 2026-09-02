import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, clearProductError } from '@/redux/slices/productsSlice.js';
import { Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const AddProduct = ({ onCancel, onSaveSuccess }) => {
  const dispatch = useDispatch();
  const { createLoading, error } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: 'Organic Honey 500g',
    category: 'Grocery',
    price: '599',
    originalPrice: '699',
    stock: '50',
    sku: 'LTS-GRO-009',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150'
  });

  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearProductError());
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.price) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    try {
      await dispatch(
        createProduct({
          name: formData.name.trim(),
          category: formData.category,
          sku: formData.sku.trim(),
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice || formData.price),
          stock: Number(formData.stock),
          image: formData.image?.trim()
        })
      ).unwrap();

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error('Create product failed:', err);
    }
  };

  return (
    <div className="space-y-4 font-sans max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-extrabold text-[#172033]">Add New Product Listing</h3>
        <p className="text-xs text-slate-400 font-medium">Publish a new item to the LTS merchant marketplace.</p>
      </div>

      {/* Error Banners */}
      {(error || localError) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error || localError}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalError('');
              dispatch(clearProductError());
            }}
            className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Organic Honey 500g"
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            required
          />
        </div>

        {/* Category & SKU Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
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
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
              SKU (Stock Keeping Unit) *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. LTS-GRO-009"
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              required
            />
          </div>
        </div>

        {/* Price, Original Price & Stock Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="599"
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
              Original / MRP (₹)
            </label>
            <input
              type="number"
              min="0"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="699"
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
              Initial Stock *
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="50"
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              required
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1">
            Product Image URL
          </label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={createLoading}
            className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
          >
            {createLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Save & Publish Product</span>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
