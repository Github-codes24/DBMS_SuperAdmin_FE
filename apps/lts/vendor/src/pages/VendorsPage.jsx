import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { Plus, Search, Filter, MoreVertical, Eye, Edit2, Trash2, Store } from 'lucide-react';

export function VendorsPage({ vendors, setVendors, globalSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    contact: '',
    category: 'Grocery',
    status: 'Active'
  });

  const query = searchTerm || globalSearch;

  const filteredVendors = vendors.filter((v) => {
    const matchesQuery =
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.shopName.toLowerCase().includes(query.toLowerCase()) ||
      v.email.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleAddVendor = (e) => {
    e.preventDefault();
    const newVendor = {
      id: `VEN-${Date.now().toString().slice(-3)}`,
      ...formData,
      productsCount: 0,
      rating: 5.0,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setVendors([newVendor, ...vendors]);
    setIsAddModalOpen(false);
    setFormData({ name: '', shopName: '', email: '', contact: '', category: 'Grocery', status: 'Active' });
  };

  const handleEditVendor = (e) => {
    e.preventDefault();
    setVendors(vendors.map(v => v.id === selectedVendor.id ? { ...v, ...formData } : v));
    setIsEditModalOpen(false);
  };

  const handleDeleteVendor = (id) => {
    if (window.confirm('Are you sure you want to remove this vendor?')) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="success">Active</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'Suspended': return <Badge variant="danger">Suspended</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Vendor Management" subtitle="Manage registered vendors, store profiles, and onboarding status">
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Vendor
        </Button>
      </Header>

      {/* Filter & Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search vendor name, shop, email..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            options={['All', 'Active', 'Pending', 'Suspended']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </Card>

      {/* Vendors Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Vendor & Shop</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Products</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 font-medium">
                    No vendors found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{vendor.shopName}</p>
                          <p className="text-slate-500">{vendor.name} • ID: {vendor.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{vendor.email}</p>
                      <p className="text-slate-500">{vendor.contact}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">{vendor.category}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{vendor.productsCount} items</td>
                    <td className="px-5 py-4 font-bold text-amber-600">★ {vendor.rating}</td>
                    <td className="px-5 py-4">{getStatusBadge(vendor.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <Dropdown
                        trigger={
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      >
                        <Dropdown.Item
                          onSelect={() => {
                            setSelectedVendor(vendor);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> View Profile
                        </Dropdown.Item>
                        <Dropdown.Item
                          onSelect={() => {
                            setSelectedVendor(vendor);
                            setFormData({
                              name: vendor.name,
                              shopName: vendor.shopName,
                              email: vendor.email,
                              contact: vendor.contact,
                              category: vendor.category,
                              status: vendor.status
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" /> Edit Vendor
                        </Dropdown.Item>
                        <Dropdown.Item onSelect={() => handleDeleteVendor(vendor.id)} destructive>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Dropdown.Item>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Vendor Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Vendor">
        <form onSubmit={handleAddVendor} className="space-y-4">
          <Input label="Owner Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Shop / Business Name" required value={formData.shopName} onChange={(e) => setFormData({ ...formData, shopName: e.target.value })} />
          <Input label="Email Address" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Contact Phone" required value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
          <Select label="Primary Category" options={['Grocery', 'Organic', 'Fashion', 'Electronics', 'Spices', 'Hardware']} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          <Select label="Status" options={['Active', 'Pending', 'Suspended']} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Register Vendor</Button>
          </div>
        </form>
      </Modal>

      {/* View Vendor Modal */}
      {selectedVendor && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Vendor Profile Details">
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedVendor.shopName}</h4>
                <p className="text-slate-500">Owned by {selectedVendor.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-400">Email</p><p className="font-semibold text-slate-800">{selectedVendor.email}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-400">Phone</p><p className="font-semibold text-slate-800">{selectedVendor.contact}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-400">Category</p><p className="font-semibold text-slate-800">{selectedVendor.category}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-400">Rating</p><p className="font-semibold text-amber-600">★ {selectedVendor.rating}</p></div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Vendor Modal */}
      {selectedVendor && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Vendor Details">
          <form onSubmit={handleEditVendor} className="space-y-4">
            <Input label="Owner Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Shop / Business Name" value={formData.shopName} onChange={(e) => setFormData({ ...formData, shopName: e.target.value })} />
            <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Contact Phone" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
            <Select label="Status" options={['Active', 'Pending', 'Suspended']} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
            <div className="pt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
