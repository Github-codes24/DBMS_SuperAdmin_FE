import React, { useState } from 'react';

export const AddProduct = ({ onCancel, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: 'Organic Honey 500g',
    category: 'Grocery',
    price: '599',
    stock: '50',
    sku: 'LTS-GRO-009'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSaveSuccess) onSaveSuccess();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#172033]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#172033]"
            >
              <option value="Grocery">Grocery</option>
              <option value="Organic">Organic</option>
              <option value="Spices">Spices</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono text-[#172033]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-bold text-[#172033]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">Initial Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#172033]"
              required
            />
          </div>
        </div>

        {/* Bottom Action Pill Buttons matching Reference Design */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-full text-xs shadow-xs"
          >
            Save Product
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#FFF7ED] text-[#EA580C] hover:bg-orange-100 font-semibold rounded-full text-xs"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
