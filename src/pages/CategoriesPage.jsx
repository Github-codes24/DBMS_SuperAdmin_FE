import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Layers, ShoppingBag, Leaf, Shirt, Smartphone, Flame, Wrench } from 'lucide-react';

export function CategoriesPage({ categories, setCategories }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '' });

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6 text-blue-600" />;
      case 'Leaf': return <Leaf className="w-6 h-6 text-emerald-600" />;
      case 'Shirt': return <Shirt className="w-6 h-6 text-purple-600" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6 text-indigo-600" />;
      case 'Flame': return <Flame className="w-6 h-6 text-amber-600" />;
      case 'Wrench': return <Wrench className="w-6 h-6 text-rose-600" />;
      default: return <Layers className="w-6 h-6 text-blue-600" />;
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const newCat = {
      id: `CAT-${Date.now().toString().slice(-3)}`,
      name: formData.name,
      description: formData.description,
      productCount: 0,
      icon: 'Layers',
      status: 'Active'
    };
    setCategories([...categories, newCat]);
    setIsAddModalOpen(false);
    setFormData({ name: '', description: '' });
  };

  const handleEditCategory = (e) => {
    e.preventDefault();
    setCategories(
      categories.map((c) => (c.id === selectedCategory.id ? { ...c, ...formData } : c))
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Delete this product category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Category Management" subtitle="Organize inventory taxonomies and department channels">
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </Header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="flex flex-col justify-between">
            <CardHeader
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">{getCategoryIcon(cat.icon)}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    <span className="text-[11px] text-blue-600 font-semibold">{cat.productCount} Products cataloged</span>
                  </div>
                </div>
              }
            />
            <CardContent className="space-y-4 flex-1">
              <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setFormData({ name: cat.name, description: cat.description });
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)} className="text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Product Category">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <Input label="Category Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Category</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      {selectedCategory && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Category">
          <form onSubmit={handleEditCategory} className="space-y-4">
            <Input label="Category Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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
