import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layers, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import {
  addDashboardCategory,
  addDashboardSubcategory,
} from '../redux/slices/dashboardSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const NEW_CATEGORY = 'new';

const getCategoryId = (category) =>
  category?.categoryId || category?._id || category?.id || '';

const getCategoryName = (category) =>
  category?.name || category?.categoryName || category?.category || '';

const getSubcategoryName = (subcategory) =>
  subcategory?.name ||
  subcategory?.subCategoryName ||
  subcategory?.subcategoryName ||
  subcategory?.subCategory ||
  '';

const getSubcategoryParentName = (subcategory, categories) => {
  const parent =
    subcategory?.parentCategory ||
    subcategory?.category ||
    subcategory?.categoryName ||
    subcategory?.parentCategoryName;
  if (typeof parent === 'string') return parent;
  if (parent && typeof parent === 'object') return getCategoryName(parent);

  const parentId =
    subcategory?.categoryId ||
    subcategory?.parentCategoryId ||
    subcategory?.category?._id ||
    subcategory?.category?.id;
  const matchingCategory = categories.find(
    (category) => String(getCategoryId(category)) === String(parentId)
  );
  return matchingCategory ? getCategoryName(matchingCategory) : 'Unassigned';
};

function CategorySubcategory() {
  const dispatch = useDispatch();
  const { categories, subcategories, loading, error } = useSelector(
    (state) => state.category
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(NEW_CATEGORY);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategoryId(NEW_CATEGORY);
    setNewCategoryName('');
    setNewSubcategoryName('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const categoryName = newCategoryName.trim();
    const subcategoryName = newSubcategoryName.trim();
    const isCreatingCategory = selectedCategoryId === NEW_CATEGORY;

    if (isCreatingCategory && !categoryName) {
      toast.error('Please enter a category name.');
      return;
    }
    if (!isCreatingCategory && !subcategoryName) {
      toast.error('Please enter a sub-category name.');
      return;
    }

    setIsSaving(true);
    try {
      let categoryId = selectedCategoryId;

      if (isCreatingCategory) {
        await dispatch(
          addDashboardCategory({ name: categoryName, vendorCount: 0 })
        ).unwrap();

        if (subcategoryName) {
          const refreshedCategories = await dispatch(fetchCategories()).unwrap();
          const createdCategory = refreshedCategories.categories.find(
            (category) =>
              getCategoryName(category).trim().toLowerCase() ===
              categoryName.toLowerCase()
          );
          categoryId = createdCategory ? getCategoryId(createdCategory) : '';

          if (!categoryId) {
            throw new Error(
              'The category was added, but its ID could not be loaded. Refresh and add the sub-category separately.'
            );
          }
        }
      }

      if (subcategoryName) {
        if (!categoryId || categoryId === NEW_CATEGORY) {
          toast.error('Please select a category for the sub-category.');
          return;
        }
        await dispatch(
          addDashboardSubcategory({
            name: subcategoryName,
            categoryId,
            vendorCount: 0,
          })
        ).unwrap();
      }

      await dispatch(fetchCategories()).unwrap();
      closeModal();
    } catch (saveError) {
      if (typeof saveError === 'string') {
        toast.error(saveError);
      } else {
        toast.error(saveError.message || 'Unable to save category data.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#f4f6f9] flex flex-col font-sans text-slate-800 overflow-x-hidden md:overflow-hidden">
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col md:flex-row p-3 md:p-4 md:px-6 md:py-4 gap-4 md:gap-6 w-full max-w-full overflow-x-hidden md:overflow-hidden relative">
        <Sidebar
          activeTab="category-subcategory"
          setActiveTab={() => {}}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="flex-1 min-w-0 w-full overflow-y-auto pr-0 md:pr-1 custom-scrollbar space-y-4">
          <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e293b] text-white rounded-2xl p-5 shadow-lg border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-[#f26522]" />
                <h1 className="text-xl md:text-2xl font-black tracking-tight">
                  Category &amp; Sub-category
                </h1>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Manage categories and their sub-categories in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              Add Category &amp; Sub-category
            </button>
          </section>

          {error ? (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold">Unable to load categories</h2>
                <p className="text-xs mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(fetchCategories())}
                className="px-3 py-2 bg-white border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 size={18} className="animate-spin text-[#f26522]" />
              Loading categories...
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-800">Categories</h2>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#f26522]">
                    {categories.length}
                  </span>
                </div>
                {categories.length ? (
                  <ul className="divide-y divide-slate-100">
                    {categories.map((category, index) => (
                      <li
                        key={getCategoryId(category) || getCategoryName(category) || index}
                        className="px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        {getCategoryName(category) || 'Unnamed category'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-center text-xs text-slate-400">
                    No categories found.
                  </p>
                )}
              </section>

              <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-800">Sub-categories</h2>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#f26522]">
                    {subcategories.length}
                  </span>
                </div>
                {subcategories.length ? (
                  <ul className="divide-y divide-slate-100">
                    {subcategories.map((subcategory, index) => (
                      <li
                        key={subcategory?._id || subcategory?.id || getSubcategoryName(subcategory) || index}
                        className="px-5 py-3 flex items-center justify-between gap-4"
                      >
                        <span className="text-sm font-semibold text-slate-700">
                          {getSubcategoryName(subcategory) || 'Unnamed sub-category'}
                        </span>
                        <span className="text-xs text-slate-400 text-right">
                          {getSubcategoryParentName(subcategory, categories)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-center text-xs text-slate-400">
                    No sub-categories found.
                  </p>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-sm font-black text-slate-800">
                  Add Category &amp; Sub-category
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add a category, a sub-category, or both together.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="category-target"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="category-target"
                  value={selectedCategoryId}
                  onChange={(event) => setSelectedCategoryId(event.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                >
                  <option value={NEW_CATEGORY}>Create a new category</option>
                  {categories.map((category, index) => (
                    <option
                      key={getCategoryId(category) || getCategoryName(category) || index}
                      value={getCategoryId(category)}
                    >
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryId === NEW_CATEGORY && (
                <div>
                  <label
                    htmlFor="new-category-name"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    New category name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="new-category-name"
                    type="text"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="Enter category name"
                    required
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="new-subcategory-name"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Sub-category name
                  {selectedCategoryId !== NEW_CATEGORY && (
                    <span className="text-rose-500"> *</span>
                  )}
                </label>
                <input
                  id="new-subcategory-name"
                  type="text"
                  value={newSubcategoryName}
                  onChange={(event) => setNewSubcategoryName(event.target.value)}
                  placeholder="Enter sub-category name (optional for a new category)"
                  required={selectedCategoryId !== NEW_CATEGORY}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySubcategory;
