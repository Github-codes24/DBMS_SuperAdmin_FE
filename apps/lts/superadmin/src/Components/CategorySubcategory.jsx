import { useEffect, useState, useRef } from "react";
import GenericImport from "./GenericImport";
import { useDispatch } from "react-redux";
import { Layers, Loader2, Plus, X, Upload } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import api, { getDashboardApiUrl } from "../services/api";
import {
  addDashboardCategory,
  addDashboardSubcategory,
} from "../redux/slices/dashboardSlice";

const NEW_CATEGORY = "new";

const getCategoryId = (category) =>
  category?.categoryId || category?._id || category?.id || "";

const getCategoryName = (category) =>
  category?.name || category?.categoryName || category?.category || "";

const getSubcategoryName = (subcategory) =>
  subcategory?.name ||
  subcategory?.subCategoryName ||
  subcategory?.subcategoryName ||
  subcategory?.subCategory ||
  "";

const getSubcategoryParentName = (subcategory, categories) => {
  const parent =
    subcategory?.parentCategory ||
    subcategory?.category ||
    subcategory?.categoryName ||
    subcategory?.parentCategoryName;
  if (typeof parent === "string") return parent;
  if (parent && typeof parent === "object") return getCategoryName(parent);

  const parentId =
    subcategory?.categoryId ||
    subcategory?.parentCategoryId ||
    subcategory?.category?._id ||
    subcategory?.category?.id;
  const matchingCategory = categories.find(
    (category) => String(getCategoryId(category)) === String(parentId),
  );
  return matchingCategory ? getCategoryName(matchingCategory) : "Unassigned";
};

const fetchProjectCategoryData = async (projectId) => {
  const response = await api.get(
    getDashboardApiUrl(
      `/dashboard/${encodeURIComponent(projectId)}/categories`,
    ),
    { params: { limit: 1000 } },
  );
  const payload = response.data;
  const categories =
    payload?.categories || payload?.data?.categories || payload?.data;
  if (!Array.isArray(categories)) {
    throw new Error("The project categories API returned an invalid response.");
  }

  const subcategoryLists = await Promise.all(
    categories.map(async (category) => {
      const categoryId = getCategoryId(category);
      if (!categoryId) {
        throw new Error(
          `Category "${getCategoryName(category) || "Unknown"}" is missing its ID.`,
        );
      }
      const subcategoryResponse = await api.get(
        getDashboardApiUrl(
          `/dashboard/categories/${encodeURIComponent(categoryId)}/subcategories`,
        ),
        { params: { limit: 100 } },
      );
      const subcategoryPayload = subcategoryResponse.data;
      const list =
        subcategoryPayload?.subcategories ||
        subcategoryPayload?.data?.subcategories ||
        subcategoryPayload?.data;
      if (!Array.isArray(list)) {
        throw new Error(
          `The sub-categories API returned invalid data for "${getCategoryName(category)}".`,
        );
      }
      return list.map((subcategory) => ({
        ...subcategory,
        parentCategory:
          getSubcategoryParentName(subcategory, [category]) === "Unassigned"
            ? getCategoryName(category)
            : getSubcategoryParentName(subcategory, [category]),
      }));
    }),
  );

  return { categories, subcategories: subcategoryLists.flat() };
};

function CategorySubcategory() {
  const dispatch = useDispatch();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRecords, setReviewRecords] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedCategoryName, setSelectedCategoryName] =
    useState(NEW_CATEGORY);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryNames, setNewSubcategoryNames] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewColumns, setPreviewColumns] = useState([]);
  const importProjectDataCache = useRef({});
  const importUploadedKeys = useRef(new Set());

  useEffect(() => {
    let isCurrentRequest = true;

    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError("");
      try {
        const response = await api.get(
          getDashboardApiUrl("/dashboard/projects"),
        );
        const payload = response.data;
        const projectList =
          payload?.projects || payload?.data?.projects || payload?.data;
        if (!Array.isArray(projectList)) {
          throw new Error("The projects API returned an invalid response.");
        }
        if (isCurrentRequest) setProjects(projectList);
      } catch (requestError) {
        if (isCurrentRequest) {
          setProjects([]);
          setProjectsError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Failed to load projects.",
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
        setError("");
        return;
      }

      setLoading(true);
      setError("");
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
              "Failed to load this project’s categories.",
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
      String(project.projectId || project._id || project.id || "") ===
      String(selectedProjectId),
  );
  const selectedProjectName =
    selectedProject?.name ||
    selectedProject?.projectName ||
    selectedProject?.title ||
    "";

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategoryName(NEW_CATEGORY);
    setNewCategoryName("");
    setNewSubcategoryNames("");
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
      toast.error("Please enter a category name.");
      return;
    }
    if (!isCreatingCategory && subcategories.length === 0) {
      toast.error("Please enter a sub-category name.");
      return;
    }

    setIsSaving(true);
    try {
      let parentCategory = categories.find(
        (category) => getCategoryName(category) === selectedCategoryName,
      );

      if (isCreatingCategory) {
        await dispatch(
          addDashboardCategory({
            name: categoryName,
            projectId: selectedProjectId,
            projectName: selectedProjectName,
          }),
        ).unwrap();
        parentCategory = { name: categoryName };
        if (subcategories.length > 0) {
          setSelectedCategoryName(categoryName);
        }
      }

      if (subcategories.length > 0) {
        const parentCategoryName = getCategoryName(parentCategory);
        if (!parentCategoryName) {
          toast.error("Please select a category for the sub-category.");
          return;
        }
        await dispatch(
          addDashboardSubcategory({
            parentCategory: parentCategoryName,
            subcategories,
            projectId: selectedProjectId,
            projectName: selectedProjectName,
          }),
        ).unwrap();
      }

      await refreshProjectCategories();
      closeModal();
    } catch (saveError) {
      if (typeof saveError === "string") {
        toast.error(saveError);
      } else {
        toast.error(saveError.message || "Unable to save category data.");
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
      setError("");
    } catch (refreshError) {
      const message =
        refreshError.response?.data?.message ||
        refreshError.message ||
        "Failed to refresh this project’s categories.";
      setError(message);
      toast.error(message);
    }
  };

  const validateImportRecord = (row) => {
    const projectName = String(row["Project Name"] ?? "").trim();

    const matchedProject = projects.find(
      (project) =>
        String(project.name || project.projectName || project.title || "")
          .trim()
          .toLowerCase() === projectName.toLowerCase(),
    );

    if (!matchedProject) {
      return `Project "${projectName}" not found.`;
    }

    const projectId =
      matchedProject.projectId || matchedProject._id || matchedProject.id;

    if (!projectId) {
      return "Project ID not found.";
    }

    if (!String(row["Category Name"] ?? "").trim()) {
      return "Category Name is required.";
    }

    if (!String(row["Subcategory Name"] ?? "").trim()) {
      return "Subcategory Name is required.";
    }

    return true;
  };

  const checkImportDuplicate = async (row, { rowNumber }) => {
    const projectName = String(row["Project Name"] ?? "").trim();
    const categoryName = String(row["Category Name"] ?? "").trim();
    const subcategoryName = String(row["Subcategory Name"] ?? "").trim();

    const matchedProject = projects.find(
      (project) =>
        String(project.name || project.projectName || project.title || "")
          .trim()
          .toLowerCase() === projectName.toLowerCase(),
    );

    if (!matchedProject) {
      return false;
    }

    const projectId =
      matchedProject.projectId || matchedProject._id || matchedProject.id;

    if (!projectId) {
      return false;
    }

    // Har naye upload ki duplicate-checking list reset karo.
    if (rowNumber === 1) {
      importUploadedKeys.current = new Set();
      importProjectDataCache.current = {};
    }

    const recordKey = [
      String(projectId).toLowerCase(),
      categoryName.toLowerCase(),
      subcategoryName.toLowerCase(),
    ].join("::");

    if (importUploadedKeys.current.has(recordKey)) {
      return true;
    }

    if (!importProjectDataCache.current[projectId]) {
      importProjectDataCache.current[projectId] =
        await fetchProjectCategoryData(projectId);
    }

    const projectData = importProjectDataCache.current[projectId];

    const matchingCategory = projectData.categories.some(
      (category) =>
        getCategoryName(category).trim().toLowerCase() ===
        categoryName.toLowerCase(),
    );

    const existsInDatabase =
      matchingCategory &&
      projectData.subcategories.some(
        (subcategory) =>
          String(subcategory.parentCategory || "")
            .trim()
            .toLowerCase() === categoryName.toLowerCase() &&
          getSubcategoryName(subcategory).trim().toLowerCase() ===
            subcategoryName.toLowerCase(),
      );

    importUploadedKeys.current.add(recordKey);

    return Boolean(existsInDatabase);
  };

  const formatFileSize = (size) => {
    return `${(size / 1024).toFixed(2)} KB`;
  };

  const validateAndSetFile = (file) => {
    const allowedExtensions = /\.(csv|xlsx|xls)$/i;

    if (!allowedExtensions.test(file.name)) {
      setFileError("Only CSV and Excel files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size must be less than 10MB.");
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const handleProcessUploadFile = async () => {
    if (!selectedFile) {
      setFileError("Please select a file first.");
      return;
    }

    setIsProcessingFile(true);
    setFileError("");

    try {
      const fileData = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(fileData, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("The uploaded file has no worksheets.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });

      if (rows.length === 0) {
        throw new Error("The uploaded file contains no data.");
      }

      const requiredColumns = [
        "Serial No",
        "Project Name",
        "Category Name",
        "Subcategory Name",
      ];

      const uploadedColumns = Object.keys(rows[0] || {});
      const missingColumns = requiredColumns.filter(
        (column) => !uploadedColumns.includes(column),
      );

      const hasInvalidFormat = missingColumns.length > 0;

      const records = rows.map((row, index) => ({
        id: `${index + 1}`,
        rawData: row,
        serialNo: row["Serial No"] || index + 1,
        projectName: String(row["Project Name"] ?? "").trim(),
        categoryName: String(row["Category Name"] ?? "").trim(),
        subcategoryName: String(row["Subcategory Name"] ?? "").trim(),
        status: hasInvalidFormat ? "Invalid" : "New",
        errors: hasInvalidFormat
          ? [`Invalid format. Missing columns: ${missingColumns.join(", ")}`]
          : [],
      }));

      // Invalid format: show uploaded columns and values in preview.
      if (hasInvalidFormat) {
        setPreviewColumns(uploadedColumns);
        setReviewRecords(records);
        setIsImportModalOpen(false);
        setIsReviewModalOpen(true);
        return;
      }

      // Cache existing categories/subcategories for each project.
      const projectDataCache = {};
      const uploadedRecordKeys = new Set();

      for (const record of records) {
        const matchedProject = projects.find(
          (project) =>
            String(project.name || project.projectName || project.title || "")
              .trim()
              .toLowerCase()
              .localeCompare(record.projectName.toLowerCase()) === 0,
        );

        if (!matchedProject) {
          record.status = "Invalid";
          record.errors.push(`Project "${record.projectName}" not found.`);
          continue;
        }

        const projectId =
          matchedProject.projectId || matchedProject._id || matchedProject.id;

        if (!projectId) {
          record.status = "Invalid";
          record.errors.push("Project ID not found.");
          continue;
        }

        if (!record.categoryName || !record.subcategoryName) {
          record.status = "Invalid";
          record.errors.push(
            "Category Name and Subcategory Name are required.",
          );
          continue;
        }

        if (!projectDataCache[projectId]) {
          projectDataCache[projectId] =
            await fetchProjectCategoryData(projectId);
        }

        const projectData = projectDataCache[projectId];

        const matchingCategory = projectData.categories.find(
          (category) =>
            getCategoryName(category).trim().toLowerCase() ===
            record.categoryName.toLowerCase(),
        );

        const recordKey = [
          String(projectId).toLowerCase(),
          record.categoryName.toLowerCase(),
          record.subcategoryName.toLowerCase(),
        ].join("::");

        const existsInDatabase =
          matchingCategory &&
          projectData.subcategories.some((subcategory) => {
            const parentName = String(subcategory.parentCategory || "")
              .trim()
              .toLowerCase();

            return (
              parentName === record.categoryName.toLowerCase() &&
              getSubcategoryName(subcategory).trim().toLowerCase() ===
                record.subcategoryName.toLowerCase()
            );
          });

        if (existsInDatabase || uploadedRecordKeys.has(recordKey)) {
          record.status = "Duplicate";
        } else {
          record.status = "New";
        }

        uploadedRecordKeys.add(recordKey);
      }

      setPreviewColumns(uploadedColumns);
      setReviewRecords(records);
      setIsImportModalOpen(false);
      setIsReviewModalOpen(true);
    } catch (processingError) {
      setFileError(
        processingError.message || "Unable to process the uploaded file.",
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      "Serial No,Project Name,Category Name,Subcategory Name",
      "1,CSR,Sample Category,Sample Subcategory",
      "2,CRM,Sample Category,Sample Subcategory",
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "Sample_Category_Subcategory_Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };
  const handleAcceptImport = async () => {
    const newRecords = reviewRecords.filter(
      (record) => record.errors.length === 0 && record.status === "New",
    );

    if (newRecords.length === 0) {
      toast.error("No valid records available to import.");
      return;
    }

    setIsImporting(true);

    try {
      const groupedRecords = {};

      newRecords.forEach((record) => {
        const matchedProject = projects.find(
          (project) =>
            (project.name || project.projectName || project.title || "")
              .trim()
              .toLowerCase() === record.projectName.trim().toLowerCase(),
        );

        if (!matchedProject) {
          record.errors.push(`Project "${record.projectName}" not found.`);
          return;
        }

        const projectId =
          matchedProject.projectId || matchedProject._id || matchedProject.id;

        const projectName =
          matchedProject.name ||
          matchedProject.projectName ||
          matchedProject.title;

        const categoryName = record.categoryName.trim();
        const subcategoryName = record.subcategoryName.trim();

        if (!categoryName || !subcategoryName) {
          record.errors.push(
            "Category Name and Subcategory Name are required.",
          );
          return;
        }

        const key = `${projectId}_${categoryName.toLowerCase()}`;

        if (!groupedRecords[key]) {
          groupedRecords[key] = {
            projectId,
            projectName,
            categoryName,
            subcategories: [],
          };
        }

        if (
          !groupedRecords[key].subcategories.some(
            (name) => name.toLowerCase() === subcategoryName.toLowerCase(),
          )
        ) {
          groupedRecords[key].subcategories.push(subcategoryName);
        }
      });

      if (Object.keys(groupedRecords).length === 0) {
        toast.error("No valid records available to import.");
        return;
      }

      const projectCategoryCache = {};

      for (const group of Object.values(groupedRecords)) {
        if (!projectCategoryCache[group.projectId]) {
          projectCategoryCache[group.projectId] =
            await fetchProjectCategoryData(group.projectId);
        }

        const existingCategoryNames = new Set(
          projectCategoryCache[group.projectId].categories.map((category) =>
            getCategoryName(category).trim().toLowerCase(),
          ),
        );

        if (!existingCategoryNames.has(group.categoryName.toLowerCase())) {
          await api.post(getDashboardApiUrl("/dashboard/categories"), {
            name: group.categoryName,
            projectId: group.projectId,
            projectName: group.projectName,
          });

          existingCategoryNames.add(group.categoryName.toLowerCase());
        }

        await api.post(getDashboardApiUrl("/dashboard/subcategories"), {
          parentCategory: group.categoryName,
          subcategories: group.subcategories,
          projectId: group.projectId,
          projectName: group.projectName,
        });
      }

      await refreshProjectCategories();

      toast.success("Categories and subcategories imported successfully.");

      setIsReviewModalOpen(false);
      setReviewRecords([]);
      setSelectedFile(null);
      setFileError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (importError) {
      toast.error(
        importError.response?.data?.message ||
          "Import failed. Please check the records and try again.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleGenericImport = async (newRecords) => {
    const groupedRecords = {};

    for (const record of newRecords) {
      const projectName = String(record["Project Name"] ?? "").trim();
      const categoryName = String(record["Category Name"] ?? "").trim();
      const subcategoryName = String(record["Subcategory Name"] ?? "").trim();

      const matchedProject = projects.find(
        (project) =>
          String(project.name || project.projectName || project.title || "")
            .trim()
            .toLowerCase() === projectName.toLowerCase(),
      );

      if (!matchedProject) {
        throw new Error(`Project "${projectName}" not found.`);
      }

      const projectId =
        matchedProject.projectId || matchedProject._id || matchedProject.id;

      if (!projectId) {
        throw new Error(`Project ID not found for "${projectName}".`);
      }

      const projectLabel =
        matchedProject.name ||
        matchedProject.projectName ||
        matchedProject.title ||
        projectName;

      const key = `${projectId}_${categoryName.toLowerCase()}`;

      if (!groupedRecords[key]) {
        groupedRecords[key] = {
          projectId,
          projectName: projectLabel,
          categoryName,
          subcategories: [],
        };
      }

      if (
        !groupedRecords[key].subcategories.some(
          (name) => name.toLowerCase() === subcategoryName.toLowerCase(),
        )
      ) {
        groupedRecords[key].subcategories.push(subcategoryName);
      }
    }

    const projectCategoryCache = {};

    for (const group of Object.values(groupedRecords)) {
      if (!projectCategoryCache[group.projectId]) {
        projectCategoryCache[group.projectId] = await fetchProjectCategoryData(
          group.projectId,
        );
      }

      const existingCategoryNames = new Set(
        projectCategoryCache[group.projectId].categories.map((category) =>
          getCategoryName(category).trim().toLowerCase(),
        ),
      );

      if (!existingCategoryNames.has(group.categoryName.toLowerCase())) {
        await api.post(getDashboardApiUrl("/dashboard/categories"), {
          name: group.categoryName,
          projectId: group.projectId,
          projectName: group.projectName,
        });
      }

      await api.post(getDashboardApiUrl("/dashboard/subcategories"), {
        parentCategory: group.categoryName,
        subcategories: group.subcategories,
        projectId: group.projectId,
        projectName: group.projectName,
      });
    }

    await refreshProjectCategories();

    toast.success("Categories and subcategories imported successfully.");
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
              <GenericImport
                buttonLabel="Import"
                title="Import Excel"
                description="Upload your Excel file to import category data."
                reviewTitle="Import Review & Preview"
                templateFileName="Sample_Category_Subcategory_Template.csv"
                validateRecord={validateImportRecord}
                isDuplicate={checkImportDuplicate}
                onImport={handleGenericImport}
                onComplete={() => {
                  importProjectDataCache.current = {};
                  importUploadedKeys.current = new Set();
                }}
                columns={[
                  { key: "Serial No", label: "Serial No" },
                  {
                    key: "Project Name",
                    label: "Project Name",
                    required: true,
                  },
                  {
                    key: "Category Name",
                    label: "Category Name",
                    required: true,
                  },
                  {
                    key: "Subcategory Name",
                    label: "Subcategory Name",
                    required: true,
                  },
                ]}
                templateRows={[
                  {
                    "Serial No": "1",
                    "Project Name": "CSR",
                    "Category Name": "Sample Category",
                    "Subcategory Name": "Sample Subcategory",
                  },
                ]}
              />
              <select
                aria-label="Select project"
                value={selectedProjectId}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setSelectedCategoryName(NEW_CATEGORY);
                }}
                disabled={
                  projectsLoading || Boolean(projectsError) || isModalOpen
                }
                className="min-w-52 px-3 py-2.5 bg-white text-slate-800 cursor-pointer text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 disabled:opacity-60"
              >
                <option value="">
                  {projectsLoading ? "Loading projects..." : "Select project"}
                </option>
                {projects.map((project, index) => {
                  const projectId =
                    project.projectId || project._id || project.id || "";
                  const projectName =
                    project.name || project.projectName || project.title || "";
                  return (
                    <option
                      key={projectId || projectName || index}
                      value={projectId}
                    >
                      {projectName || "Unnamed project"}
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
                <h2 className="text-sm font-bold">
                  Unable to load project categories
                </h2>
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
                  <h2 className="text-sm font-black text-slate-800">
                    Categories
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#f26522]">
                    {categories.length}
                  </span>
                </div>
                {categories.length ? (
                  <ul className="divide-y divide-slate-100">
                    {categories.map((category, index) => (
                      <li
                        key={
                          getCategoryId(category) ||
                          getCategoryName(category) ||
                          index
                        }
                        className="px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        {getCategoryName(category) || "Unnamed category"}
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
                  <h2 className="text-sm font-black text-slate-800">
                    Sub-categories
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#f26522]">
                    {subcategories.length}
                  </span>
                </div>
                {subcategories.length ? (
                  <ul className="divide-y divide-slate-100">
                    {subcategories.map((subcategory, index) => (
                      <li
                        key={
                          subcategory?._id ||
                          subcategory?.id ||
                          getSubcategoryName(subcategory) ||
                          index
                        }
                        className="px-5 py-3 flex items-center justify-between gap-4"
                      >
                        <span className="text-sm font-semibold text-slate-700">
                          {getSubcategoryName(subcategory) ||
                            "Unnamed sub-category"}
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
                  onChange={(event) =>
                    setSelectedCategoryName(event.target.value)
                  }
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                >
                  <option value={NEW_CATEGORY}>Create a new category</option>
                  {categories.map((category, index) => (
                    <option
                      key={
                        getCategoryId(category) ||
                        getCategoryName(category) ||
                        index
                      }
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
                  onChange={(event) =>
                    setNewSubcategoryNames(event.target.value)
                  }
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
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-sm font-black text-slate-800">
                  Import Excel
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload your Excel file to import category data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setSelectedFile(null);
                  setFileError("");
                  setDragActive(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aria-label="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <ImportExcel
                selectedFile={selectedFile}
                fileInputRef={fileInputRef}
                validateAndSetFile={validateAndSetFile}
                formatFileSize={formatFileSize}
                onDownloadTemplate={handleDownloadTemplate}
                setSelectedFile={setSelectedFile}
                setFileError={setFileError}
                dragActive={dragActive}
                setDragActive={setDragActive}
                isProcessingFile={isProcessingFile}
              />
              {fileError && (
                <p className="mt-2 text-sm text-red-600">{fileError}</p>
              )}
              <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setSelectedFile(null);
                    setFileError("");
                  }}
                  className="px-5 py-2 text-sm font-semibold cursor-pointer text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || isProcessingFile}
                  onClick={handleProcessUploadFile}
                  className="px-5 py-2 text-sm font-semibold cursor-pointer text-white bg-[#f26522] rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f26522]">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Import Review &amp; Preview
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Review and verify category and sub-category records before
                    importing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewRecords([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-200/50"
                aria-label="Close review"
              >
                <X size={18} />
              </button>
            </div>
            {/* Summary Cards */}
            <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Records
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {reviewRecords.length}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-sm">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    New (Eligible)
                  </div>
                  <div className="text-xl font-bold text-emerald-800 mt-0.5">
                    {
                      reviewRecords.filter((record) => record.status === "New")
                        .length
                    }
                  </div>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 shadow-sm">
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    Duplicate (Skipped)
                  </div>
                  <div className="text-xl font-bold text-amber-800 mt-0.5">
                    {
                      reviewRecords.filter(
                        (record) => record.status === "Duplicate",
                      ).length
                    }
                  </div>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 shadow-sm">
                  <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                    Invalid (Skipped)
                  </div>
                  <div className="text-xl font-bold text-rose-800 mt-0.5">
                    {
                      reviewRecords.filter((record) => record.errors.length > 0)
                        .length
                    }
                  </div>
                </div>
              </div>
            </div>
            {/* Preview Table */}
            <div className="p-6 overflow-hidden flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="text-xs font-bold text-slate-700">
                  Record Preview ({reviewRecords.length} records)
                </span>
                <span className="text-[11px] text-slate-400">
                  Review records before importing
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-auto max-h-[46vh] bg-white shadow-sm">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      {previewColumns.map((column) => (
                        <th
                          key={column}
                          className="p-3 text-left text-xs font-bold text-slate-600 uppercase"
                        >
                          {column}
                        </th>
                      ))}
                      {reviewRecords.some(
                        (record) => record.status === "New",
                      ) &&
                        reviewRecords.some(
                          (record) => record.status === "Duplicate",
                        ) && (
                          <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase">
                            Status
                          </th>
                        )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reviewRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        {previewColumns.map((column) => (
                          <td key={column} className="p-3 text-slate-600">
                            {item.rawData?.[column] ?? ""}
                          </td>
                        ))}
                        {reviewRecords.some(
                          (record) => record.status === "New",
                        ) &&
                          reviewRecords.some(
                            (record) => record.status === "Duplicate",
                          ) && (
                            <td className="p-3 text-sm">
                              {item.status === "Invalid" ? (
                                <span className="text-red-600">Invalid</span>
                              ) : item.status === "Duplicate" ? (
                                <span className="text-amber-600">
                                  Duplicate
                                </span>
                              ) : (
                                <span className="text-emerald-600">New</span>
                              )}
                            </td>
                          )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleAcceptImport}
                disabled={
                  isImporting ||
                  reviewRecords.length === 0 ||
                  !reviewRecords.some(
                    (record) =>
                      record.status === "New" && record.errors.length === 0,
                  )
                }
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin cursor-pointer" />
                    Importing...
                  </>
                ) : (
                  "Accept & Import"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySubcategory;
