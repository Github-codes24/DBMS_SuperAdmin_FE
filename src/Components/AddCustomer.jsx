import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCustomer, fetchCustomers } from '../redux/slices/customerSlice';
import { UserPlus, ArrowLeft, Check } from 'lucide-react';
import { State, City } from 'country-state-city';

function AddCustomer({ onBack, onSuccess }) {
  const dispatch = useDispatch();
  const { isSaving = false, customers = [] } = useSelector((state) => state.customer || {});

  const allStates = State.getStatesOfCountry('IN') || [];

  const [newCustomer, setNewCustomer] = useState({
    id: '',
    mobileNumber: '',
    companyName: '',
    state: '',
    city: '',
    regDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    telecaller: 'TC014',
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const customerPayload = {
      _isLocal: true,
      srNo: String(customers.length + 1).padStart(2, '0'),
      id: newCustomer.id || `CUST${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: newCustomer.id || `CUST${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCustomer.companyName || 'Customer',
      companyName: newCustomer.companyName,
      mobileNumber: newCustomer.mobileNumber,
      state: newCustomer.state || 'Maharashtra',
      city: newCustomer.city || 'Nagpur',
      pincode: '440001',
      regDate: newCustomer.regDate || new Date().toISOString().slice(0, 10),
      status: newCustomer.status || 'Active',
      telecaller: newCustomer.telecaller || 'TC014',
      email: newCustomer.email || '',
    };

    dispatch(createCustomer(customerPayload))
      .unwrap()
      .then((res) => {
        if (onSuccess) {
          onSuccess(res?.customer?.mobileNumber || res?.customer?.mobile || newCustomer.mobileNumber || res?.customer?.name || newCustomer.companyName);
        } else if (onBack) {
          onBack();
        }
      })
      .catch((err) => {
        console.error('Failed to create customer:', err);
      });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Back to Customer Directory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus size={20} className="text-[#f26522]" />
              <span>Add New Customer Record</span>
            </h2>
            <p className="text-xs text-slate-500">Fill in the details below to add a new customer to the database</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98765 43210"
              value={newCustomer.mobileNumber}
              onChange={(e) => setNewCustomer({ ...newCustomer, mobileNumber: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Global Trade Enterprises Pvt Ltd"
              value={newCustomer.companyName}
              onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. customer@example.com"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
            />
          </div>

          {/* State Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
            <select
              value={newCustomer.state}
              onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value, city: '' })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
            >
              <option value="">-- Select State --</option>
              {allStates.map((st) => (
                <option key={st.isoCode} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
            <select
              value={newCustomer.city}
              onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
            >
              <option value="">-- Select City --</option>
              {(() => {
                const stObj = allStates.find((s) => s.name === newCustomer.state);
                const cityList = stObj ? (City.getCitiesOfState('IN', stObj.isoCode) || []) : [];
                return cityList.map((ct) => (
                  <option key={ct.name} value={ct.name}>
                    {ct.name}
                  </option>
                ));
              })()}
            </select>
          </div>

          {/* Registration Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registration Date</label>
            <input
              type="date"
              value={newCustomer.regDate}
              onChange={(e) => setNewCustomer({ ...newCustomer, regDate: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={newCustomer.status}
              onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Telecaller */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Telecaller</label>
            <input
              type="text"
              placeholder="e.g. TC014"
              value={newCustomer.telecaller}
              onChange={(e) => setNewCustomer({ ...newCustomer, telecaller: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Check size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Customer Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCustomer;
