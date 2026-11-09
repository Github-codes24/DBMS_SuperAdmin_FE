import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { Plus, Search, MoreVertical, Edit2, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function ProductsPage({ products, setProducts, globalSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery',
    vendor: 'Rajesh Fresh Mart',
    price: '',
    stock: '',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'
  });

  const query = searchTerm || globalSearch;

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.vendor.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    const stockNum = parseInt(formData.stock) || 0;
    let status = 'In Stock';
    if (stockNum === 0) status = 'Out of Stock';
    else if (stockNum <= 10) status = 'Low Stock';

    const newProd = {
      id: `PROD-${Date.now().toString().slice(-3)}`,
      name: formData.name,
      category: formData.category,
      vendor: formData.vendor,
      price: parseFloat(formData.price) || 0,
      stock: stockNum,
      status: status,
      image: formData.image
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    setFormData({ name: '', category: 'Grocery', vendor: 'Rajesh Fresh Mart', price: '', stock: '', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' });
  };

  const handleEditProduct = (e) => {
    e.preventDefault();
    const stockNum = parseInt(formData.stock) || 0;
    let status = 'In Stock';
    if (stockNum === 0) status = 'Out of Stock';
    else if (stockNum <= 10) status = 'Low Stock';

    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              price: parseFloat(formData.price) || p.price,
              stock: stockNum,
              status
            }
          : p
      )
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Delete this product from catalog?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const getStockBadge = (status) => {
    switch (status) {
      case 'In Stock': return <Badge variant="success">In Stock</Badge>;
      case 'Low Stock': return <Badge variant="warning">Low Stock</Badge>;
      case 'Out of Stock': return <Badge variant="danger">Out of Stock</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Product Catalog" subtitle="Manage item listings, inventory levels, prices, and vendor tags">
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </Header>

      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search product name, vendor..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          options={['All', 'Grocery', 'Organic', 'Fashion', 'Electronics', 'Spices', 'Hardware']}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-48"
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Vendor</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Stock Level</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                        <p className="text-slate-400">ID: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{p.category}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.vendor}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{p.stock} units</td>
                  <td className="px-5 py-3.5">{getStockBadge(p.status)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Dropdown
                      trigger={
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    >
                      <Dropdown.Item
                        onSelect={() => {
                          setSelectedProduct(p);
                          setFormData({
                            name: p.name,
                            category: p.category,
                            vendor: p.vendor,
                            price: p.price,
                            stock: p.stock,
                            image: p.image
                          });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-500" /> Edit Product
                      </Dropdown.Item>
                      <Dropdown.Item onSelect={() => handleDeleteProduct(p.id)} destructive>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Dropdown.Item>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Product to Catalog">
        <form onSubmit={handleAddProduct} className="space-y-4">
          <Input label="Product Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Select label="Category" options={['Grocery', 'Organic', 'Fashion', 'Electronics', 'Spices', 'Hardware']} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          <Input label="Price (₹)" type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          <Input label="Stock Quantity" type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
          <Input label="Image URL" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Product</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      {selectedProduct && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Product Info">
          <form onSubmit={handleEditProduct} className="space-y-4">
            <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Select label="Category" options={['Grocery', 'Organic', 'Fashion', 'Electronics', 'Spices', 'Hardware']} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <Input label="Price (₹)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            <Input label="Stock Quantity" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
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
