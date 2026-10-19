import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Layers, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import api, { getDashboardApiUrl } from '../services/api';
import {
  addDashboardCategory,
  addDashboardSubcategory,
} from '../redux/slices/dashboardSlice';

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

const fetchProjectCategoryData = async (projectId) => {
  const response = await api.get(
    getDashboardApiUrl(
      `/dashboard/${encodeURIComponent(projectId)}/categories`
    ),
    { params: { limit: 100 } }
  );
  const payload = response.data;
  const categories =
    payload?.categories || payload?.data?.categories || payload?.data;
  if (!Array.isArray(categories)) {
    throw new Error('The project categories API returned an invalid response.');
  }

  const subcategoryLists = await Promise.all(
    categories.map(async (category) => {
      const categoryId = getCategoryId(category);
      if (!categoryId) {
        throw new Error(
          `Category "${getCategoryName(category) || 'Unknown'}" is missing its ID.`
        );
      }
      const subcategoryResponse = await api.get(
        getDashboardApiUrl(
          `/dashboard/categories/${encodeURIComponent(categoryId)}/subcategories`
        ),
        { params: { limit: 100 } }
      );
      const subcategoryPayload = subcategoryResponse.data;
      const list =
        subcategoryPayload?.subcategories ||
        subcategoryPayload?.data?.subcategories ||
        subcategoryPayload?.data;
      if (!Array.isArray(list)) {
        throw new Error(
          `The sub-categories API returned invalid data for "${getCategoryName(category)}".`
        );
      }
      return list.map((subcategory) => ({
        ...subcategory,
        parentCategory:
          getSubcategoryParentName(subcategory, [category]) === 'Unassigned'
            ? getCategoryName(category)
            : getSubcategoryParentName(subcategory, [category]),
      }));
    })
  );

  return { categories, subcategories: subcategoryLists.flat() };
};

function CategorySubcategory() {
  const dispatch = useDispatch();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState(NEW_CATEGORY);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryNames, setNewSubcategoryNames] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError('');
      try {
        const response = await api.get(getDashboardApiUrl('/dashboard/projects'));
        const payload = response.data;
        const projectList = payload?.projects || payload?.data?.projects || payload?.data;
        if (!Array.isArray(projectList)) {
          throw new Error('The projects API returned an invalid response.');
        }
        if (isCurrentRequest) setProjects(projectList);
      } catch (requestError) {
        if (isCurrentRequest) {
          setProjects([]);
          setProjectsError(
            requestError.response?.data?.message ||
              requestError.message ||
              'Failed to load projects.'
          );
        }
      } finally {
        if (isCurrentRequest) setProjectsLoading(false);
      }
    };

    loadProjects();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;
    const loadProjectCategories = async () => {
      if (!selectedProjectId) {
        setCategories([]);
        setSubcategories([]);
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      setCategories([]);
      setSubcategories([]);

      try {
        const result = await fetchProjectCategoryData(selectedProjectId);
        if (isCurrentRequest) {
          setCategories(result.categories);
          setSubcategories(result.subcategories);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              'Failed to load this project’s categories.'
          );
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    loadProjectCategories();
    return () => {
      isCurrentRequest = false;
    };
  }, [selectedProjectId]);

  const selectedProject = projects.find(
    (project) =>
      String(project.projectId || project._id || project.id || '') ===
      String(selectedProjectId)
  );
  const selectedProjectName =
    selectedProject?.name || selectedProject?.projectName || selectedProject?.title || '';

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategoryName(NEW_CATEGORY);
    setNewCategoryName('');
    setNewSubcategoryNames('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const categoryName = newCategoryName.trim();
    const subcategories = newSubcategoryNames
      .split(/[\n,]/)
      .map((name) => name.trim())
      .filter(Boolean);
    const isCreatingCategory = selectedCategoryName === NEW_CATEGORY;

    if (isCreatingCategory && !categoryName) {
      toast.error('Please enter a category name.');
      return;
    }
    if (!isCreatingCategory && subcategories.length === 0) {
      toast.error('Please enter a sub-category name.');
      return;
    }

    setIsSaving(true);
    try {
      let parentCategory = categories.find(
        (category) => getCategoryName(category) === selectedCategoryName
      );

      if (isCreatingCategory) {
        await dispatch(
          addDashboardCategory({
            name: categoryName,
            projectId: selectedProjectId,
            projectName: selectedProjectName,
          })
        ).unwrap();
        parentCategory = { name: categoryName };
        if (subcategories.length > 0) {
          setSelectedCategoryName(categoryName);
        }
      }

      if (subcategories.length > 0) {
        const parentCategoryName = getCategoryName(parentCategory);
        if (!parentCategoryName) {
          toast.error('Please select a category for the sub-category.');
          return;
        }
        await dispatch(
          addDashboardSubcategory({
            parentCategory: parentCategoryName,
            subcategories,
            projectId: selectedProjectId,
            projectName: selectedProjectName,
          })
        ).unwrap();
      }

      await refreshProjectCategories();
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

  const refreshProjectCategories = async () => {
    if (!selectedProjectId) return;
    try {
      const result = await fetchProjectCategoryData(selectedProjectId);
      setCategories(result.categories);
      setSubcategories(result.subcategories);
      setError('');
    } catch (refreshError) {
      const message =
        refreshError.response?.data?.message ||
        refreshError.message ||
        'Failed to refresh this project’s categories.';
      setError(message);
      toast.error(message);
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
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                aria-label="Select project"
                value={selectedProjectId}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setSelectedCategoryName(NEW_CATEGORY);
                }}
                disabled={projectsLoading || Boolean(projectsError) || isModalOpen}
                className="min-w-52 px-3 py-2.5 bg-white text-slate-800 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 disabled:opacity-60"
              >
                <option value="">
                  {projectsLoading ? 'Loading projects...' : 'Select project'}
                </option>
                {projects.map((project, index) => {
                  const projectId =
                    project.projectId || project._id || project.id || '';
                  const projectName =
                    project.name || project.projectName || project.title || '';
                  return (
                    <option
                      key={projectId || projectName || index}
                      value={projectId}
                    >
                      {projectName || 'Unnamed project'}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedProjectId}
                className="px-4 py-2.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={15} />
                Add Category &amp; Sub-category
              </button>
            </div>
          </section>

          {projectsError ? (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold">Unable to load projects</h2>
              <p className="text-xs mt-1">{projectsError}</p>
            </div>
          ) : !selectedProjectId ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm font-semibold text-slate-500">
              Select a project to view and manage its categories.
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold">Unable to load project categories</h2>
                <p className="text-xs mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={refreshProjectCategories}
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
                  value={selectedCategoryName}
                  onChange={(event) => setSelectedCategoryName(event.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                >
                  <option value={NEW_CATEGORY}>Create a new category</option>
                  {categories.map((category, index) => (
                    <option
                      key={getCategoryId(category) || getCategoryName(category) || index}
                      value={getCategoryName(category)}
                    >
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryName === NEW_CATEGORY && (
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
                  htmlFor="new-subcategory-names"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Sub-category name
                  {selectedCategoryName !== NEW_CATEGORY && (
                    <span className="text-rose-500"> *</span>
                  )}
                </label>
                <textarea
                  id="new-subcategory-names"
                  value={newSubcategoryNames}
                  onChange={(event) => setNewSubcategoryNames(event.target.value)}
                  placeholder="Enter sub-category names separated by commas or new lines"
                  required={selectedCategoryName !== NEW_CATEGORY}
                  rows={3}
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
