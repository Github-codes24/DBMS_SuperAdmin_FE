import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { State, City } from "country-state-city";
import api from "../services/api";
import AddCustomer from "./AddCustomer";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  bulkUpdateCustomers,
  deleteCustomer,
  bulkImportCustomers,
} from "../redux/slices/customerSlice";
import { getDashboardApiUrl } from "../services/api";
import {
  Search,
  Download,
  Lock,
  FileSpreadsheet,
  FileText,
  Upload,
  X,
  Check,
  FileDown,
  UserPlus,
  Plus,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Info,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Phone,
  Tag,
} from "lucide-react";

const runBulkActions = async (items, action, batchSize = 10) => {
  const results = [];
  for (let index = 0; index < items.length; index += batchSize) {
    const batchResults = await Promise.allSettled(
      items.slice(index, index + batchSize).map(action),
    );
    results.push(...batchResults);
  }
  return results;
};

const bulkCustomerFields = [
  "vendorCode",
  "vendorId",
  "srNo",
  "registrationDate",
  "vendorName",
  "name",
  "fullName",
  "companyName",
  "category",
  "subCategory",
  "country",
  "state",
  "city",
  "locality",
  "email",
  "gstNumber",
  "address",
  "image",
  "registeredPhoneNo",
  "mobileNumber",
  "whatsappNo",
  "whatsapp",
  "alternateContactNo",
  "website",
  "vendorListingType",
  "isPaidVendor",
  "packagePaidAmount",
  "lastPaymentDate",
  "paymentTerm",
  "lastPaymentInvoiceNo",
  "nextPaymentDueDate",
  "activePackageList",
  "createdByTelecaller",
  "primaryBusinessCategory",
  "serviceSpecialization",
  "keywordsTags",
  "assignedTelecaller",
  "status",
];

const getLocalDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildBulkCustomerPayload = (customer, status) => {
  const payload = {
    _id: customer._id || customer.id,
    customerId: customer.customerCode || customer.customerId || customer.id,
  };

  bulkCustomerFields.forEach((field) => {
    const value = customer[field];
    if (
      value !== undefined &&
      !(typeof value === "string" && ["-", "ΓÇö"].includes(value.trim()))
    ) {
      payload[field] = value;
    }
  });
  if (!payload.vendorCode && (customer.code || customer.customerCode)) {
    payload.vendorCode = customer.code || customer.customerCode;
  }

  const customerName =
    customer.vendorName ||
    (customer.name &&
    customer.name !== customer.number &&
    customer.name !== "-" &&
    customer.name !== "ΓÇö"
      ? customer.name
      : undefined);
  if (customerName) {
    payload.vendorName = customerName;
    payload.name = customerName;
  } else {
    delete payload.name;
  }

  const phoneNumber = [
    customer.registeredPhoneNo,
    customer.mobileNumber,
    customer.mobile,
    customer.number,
  ].find((value) => value && !["-", "ΓÇö"].includes(String(value).trim()));
  if (phoneNumber) {
    payload.registeredPhoneNo = phoneNumber;
    payload.mobileNumber = customer.mobileNumber || phoneNumber;
  }
  payload.status = status;
  return payload;
};

function CustomerDatabase({ compact = false }) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    customers: apiCustomers = [],
    loading = false,
    isSaving = false,
  } = useSelector((state) => state.customer || {});

  // Page View Mode: 'list' | 'add' | 'edit' | 'view'
  const [viewMode, setViewMode] = useState("list");

  const [searchTerm, setSearchTerm] = useState("");

  // Status Filter Sync with URL search params
  const validStatuses = ["All", "Active", "Pending", "Rejected", "Blocked"];
  const urlStatus = searchParams.get("status");
  const initialStatus =
    urlStatus &&
    validStatuses.map((s) => s.toLowerCase()).includes(urlStatus.toLowerCase())
      ? validStatuses.find((s) => s.toLowerCase() === urlStatus.toLowerCase())
      : "All";

  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    const currentUrlStatus = searchParams.get("status");
    if (
      currentUrlStatus &&
      validStatuses
        .map((s) => s.toLowerCase())
        .includes(currentUrlStatus.toLowerCase())
    ) {
      const matched = validStatuses.find(
        (s) => s.toLowerCase() === currentUrlStatus.toLowerCase(),
      );
      if (matched !== statusFilter) {
        setStatusFilter(matched);
      }
    } else if (!currentUrlStatus && statusFilter !== "All") {
      setStatusFilter("All");
    }
  }, [searchParams]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (newStatus === "All") {
      newParams.delete("status");
    } else {
      newParams.set("status", newStatus.toLowerCase());
    }
    setSearchParams(newParams);
  };
  const [toastMsg, setToastMsg] = useState("");

  // View, Edit & Delete Modal States
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    customer: null,
  });
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("Active");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(
    () => new Set(),
  );
  const selectAllCheckboxRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Manual Scroll Ref & Control (No Automatic Timer)
  const manualScrollRef = useRef(null);

  // Add Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTab, setEditTab] = useState("personal");
  const [newCustomer, setNewCustomer] = useState({
    srNo: "",
    id: "",
    name: "",
    companyName: "",
    state: "",
    city: "",
    pincode: "",
    regDate: new Date().toISOString().slice(0, 10),
    status: "Active",
    telecaller: "TC014",
    email: "",
    mobile: "",
  });

  // Step 1: Import Customers Modal State
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importRegistrationDate, setImportRegistrationDate] = useState(
    getLocalDateInputValue,
  );
  const fileInputRef = useRef(null);

  // Step 1: Dependent Dropdown States (Category, Sub-Category, State, City)
  const [importCategories, setImportCategories] = useState([]);
  const [importCategoriesLoading, setImportCategoriesLoading] = useState(false);
  const [importCategoriesError, setImportCategoriesError] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [subCategoriesError, setSubCategoriesError] = useState("");

  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedCatName, setSelectedCatName] = useState("");
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  const [selectedSubCatIds, setSelectedSubCatIds] = useState([]);
  const [selectedSubCatNames, setSelectedSubCatNames] = useState([]);
  const [isSubCatDropdownOpen, setIsSubCatDropdownOpen] = useState(false);
  const [subCatSearch, setSubCatSearch] = useState("");

  const [allStates] = useState(() => State.getStatesOfCountry("IN") || []);
  const [selectedState, setSelectedState] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const catDropdownRef = useRef(null);
  const subCatDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);

  // Step 2: Import Review & Preview Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    newCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
  });
  const [reviewRecords, setReviewRecords] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Export Dropdown State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Load project options and the dependent category lists for the import workflow.
  useEffect(() => {
    if (!isUploadModalOpen) return undefined;

    let isCurrentRequest = true;
    setProjectsLoading(true);
    setProjectsError("");
    api
      .get(getDashboardApiUrl("/dashboard/projects"))
      .then((response) => {
        const payload = response.data;
        const projectList =
          payload?.projects || payload?.data?.projects || payload?.data;
        if (!Array.isArray(projectList)) {
          throw new Error("The projects API returned an invalid response.");
        }
        if (isCurrentRequest) setProjects(projectList);
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setProjects([]);
          setProjectsError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load projects.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setProjectsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isUploadModalOpen]);

  useEffect(() => {
    if (!isUploadModalOpen || !selectedProjectId) {
      setImportCategories([]);
      setImportCategoriesLoading(false);
      setImportCategoriesError("");
      return undefined;
    }

    let isCurrentRequest = true;
    setImportCategoriesLoading(true);
    setImportCategoriesError("");
    api
      .get(
        getDashboardApiUrl(
          `/dashboard/${encodeURIComponent(selectedProjectId)}/categories`,
        ),
        {
          params: { limit: 100 },
        },
      )
      .then((response) => {
        const payload = response.data;
        const categoryList =
          payload?.categories || payload?.data?.categories || payload?.data;
        if (!Array.isArray(categoryList)) {
          throw new Error(
            "The project categories API returned an invalid response.",
          );
        }
        if (isCurrentRequest) setImportCategories(categoryList);
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setImportCategories([]);
          setImportCategoriesError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load project categories.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setImportCategoriesLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isUploadModalOpen, selectedProjectId]);

  useEffect(() => {
    if (!isUploadModalOpen || !selectedCatId) {
      setSubCategories([]);
      setSubCategoriesLoading(false);
      setSubCategoriesError("");
      return undefined;
    }

    let isCurrentRequest = true;
    setSubCategoriesLoading(true);
    setSubCategoriesError("");
    api
      .get(
        getDashboardApiUrl(
          `/dashboard/categories/${encodeURIComponent(selectedCatId)}/subcategories`,
        ),
        {
          params: { limit: 100 },
        },
      )
      .then((response) => {
        const payload = response.data;
        const subcategoryList =
          payload?.subcategories ||
          payload?.data?.subcategories ||
          payload?.data;
        if (!Array.isArray(subcategoryList)) {
          throw new Error(
            "The subcategories API returned an invalid response.",
          );
        }
        if (isCurrentRequest) setSubCategories(subcategoryList);
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setSubCategories([]);
          setSubCategoriesError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load subcategories.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setSubCategoriesLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isUploadModalOpen, selectedCatId]);

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        catDropdownRef.current &&
        !catDropdownRef.current.contains(e.target)
      ) {
        setIsCatDropdownOpen(false);
      }
      if (
        subCatDropdownRef.current &&
        !subCatDropdownRef.current.contains(e.target)
      ) {
        setIsSubCatDropdownOpen(false);
      }
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(e.target)
      ) {
        setIsStateDropdownOpen(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target)
      ) {
        setIsCityDropdownOpen(false);
      }
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target)
      ) {
        setIsExportDropdownOpen(false);
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Role Access Check: Only Super Admin and Admin have access
  const userRole = (localStorage.getItem("userRole") || "Super Admin").trim();
  const normalizedRole = userRole.toLowerCase();
  const hasAccessPermission =
    normalizedRole === "super admin" || normalizedRole === "admin";

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const getDisplayNumber = (cust) => {
    if (!cust) return "-";

    const candidates = [
      cust.mobileNumber,
      cust.mobile,
      cust.mobile_number,
      cust.mobileNo,
      cust.mobile_no,
      cust.phone,
      cust.phoneNumber,
      cust.phone_number,
      cust.phoneNo,
      cust.phone_no,
      cust.contact,
      cust.contactNumber,
      cust.contact_number,
      cust.contactNo,
      cust.contact_no,
      cust.number,
      cust.userMobile,
      cust.userPhone,
      cust.userContact,
      cust.primaryMobile,
      cust.cell,
      cust.phone1,
      cust.customerPhone,
      cust.customerMobile,
      cust.customerNumber,
    ];

    for (const value of candidates) {
      if (value !== undefined && value !== null) {
        const strVal = String(value).trim();
        const cleanDigits = strVal.replace(/\D/g, "");

        if (
          strVal &&
          strVal !== "-" &&
          strVal !== "ΓÇö" &&
          strVal !== "null" &&
          strVal !== "undefined" &&
          !strVal.toUpperCase().startsWith("CUST") &&
          cleanDigits.length >= 7
        ) {
          return strVal;
        }
      }
    }

    if (cust.name) {
      const cleanDigits = String(cust.name).replace(/\D/g, "");
      if (cleanDigits.length >= 7) {
        return String(cust.name).trim();
      }
    }

    return "-";
  };

  const getDisplayEmail = (cust) => {
    if (!cust) return "-";
    const emailVal =
      cust.email ||
      cust.emailAddress ||
      cust.emailId ||
      cust.email_id ||
      cust.mail ||
      cust.userEmail ||
      cust.contactEmail;
    if (
      emailVal &&
      emailVal !== "-" &&
      emailVal !== "ΓÇö" &&
      String(emailVal).includes("@")
    ) {
      return String(emailVal).trim();
    }
    if (cust.name && String(cust.name).includes("@")) {
      return String(cust.name).trim();
    }
    return "-";
  };

  const activeApiCustomers = Array.isArray(apiCustomers)
    ? apiCustomers.filter((c) => !c.isDeleted && c.status !== "Deleted")
    : [];

  const customers = activeApiCustomers.map((cust, idx) => {
    const mobileNum = getDisplayNumber(cust);
    const emailStr = getDisplayEmail(cust);

    return {
      ...cust,
      _id: cust._id,
      customerId:
        cust.customerId ||
        (typeof cust.id === "string" && cust.id.startsWith("CUST")
          ? cust.id
          : undefined) ||
        cust._id,
      srNo: cust.srNo || String(idx + 1).padStart(2, "0"),
      id: cust.customerId || cust._id,
      number: mobileNum,
      name: cust.name || mobileNum || "-",
      companyName: cust.companyName,
      state: cust.state,
      city: cust.city,
      pincode: cust.pincode,
      regDate: cust.registrationDate
        ? new Date(cust.registrationDate).toISOString().slice(0, 10)
        : "-",
      status: cust.status,
      telecaller: cust.assignedTelecaller || "Unassigned",
      email: emailStr,
      mobile: mobileNum,
    };
  });

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      (cust.name &&
        cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.number &&
        cust.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.companyName &&
        cust.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.id && cust.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.state &&
        cust.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.city &&
        cust.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.pincode && cust.pincode.includes(searchTerm)) ||
      (cust.telecaller &&
        cust.telecaller.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "All" || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCustomerSelectionId = (cust) => String(cust._id || cust.id || "");
  const selectedFilteredCount = filteredCustomers.reduce(
    (count, cust) =>
      count + (selectedCustomerIds.has(getCustomerSelectionId(cust)) ? 1 : 0),
    0,
  );
  const allFilteredCustomersSelected =
    filteredCustomers.length > 0 &&
    selectedFilteredCount === filteredCustomers.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedFilteredCount > 0 &&
        selectedFilteredCount < filteredCustomers.length;
    }
  }, [selectedFilteredCount, filteredCustomers.length]);

  const handleToggleCustomerSelection = (customer, isSelected) => {
    const customerId = getCustomerSelectionId(customer);
    if (!customerId) return;

    setSelectedCustomerIds((previous) => {
      const next = new Set(previous);
      if (isSelected) {
        next.add(customerId);
      } else {
        next.delete(customerId);
      }
      return next;
    });
  };

  const handleToggleFilteredSelection = (isSelected) => {
    setSelectedCustomerIds((previous) => {
      const next = new Set(previous);
      filteredCustomers.forEach((customer) => {
        const customerId = getCustomerSelectionId(customer);
        if (!customerId) return;
        if (isSelected) {
          next.add(customerId);
        } else {
          next.delete(customerId);
        }
      });
      return next;
    });
  };

  const getSelectedCustomers = () =>
    customers.filter((customer) =>
      selectedCustomerIds.has(getCustomerSelectionId(customer)),
    );

  const handleBulkUpdateStatus = async () => {
    if (!hasAccessPermission || isBulkProcessing) return;

    const selectedCustomers = getSelectedCustomers();
    if (selectedCustomers.length === 0) return;
    if (selectedCustomers.every((customer) => customer.status === bulkStatus)) {
      setSelectedCustomerIds(new Set());
      toast.info("All selected customers already have this status.");
      return;
    }
    if (selectedCustomers.length > 24) {
      toast.error("You can update a maximum of 24 customer records at a time.");
      return;
    }

    setIsBulkProcessing(true);
    try {
      const customersPayload = selectedCustomers.map((customer) =>
        buildBulkCustomerPayload(customer, bulkStatus),
      );
      const response = await dispatch(
        bulkUpdateCustomers(customersPayload),
      ).unwrap();
      const result = response.data || {};
      const failedIds = new Set(
        (result.failures || []).map((failure) => String(failure.customerId)),
      );
      const successfulCount =
        result.modifiedCount ?? customersPayload.length - failedIds.size;
      const failureCount = result.failures?.length || 0;

      setSelectedCustomerIds(failedIds);
      if (successfulCount > 0) {
        dispatch(fetchCustomers());
        console.log("Backend message:", response.message);
        toast.success(
          response.message ||
            `${successfulCount} customer${successfulCount === 1 ? "" : "s"} updated successfully`,
        );
      }
      if (failureCount > 0) {
        toast.error(
          `${failureCount} customer record${failureCount === 1 ? "" : "s"} failed to update. Failed records remain selected.`,
        );
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to update selected customer records.",
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!hasAccessPermission || isBulkProcessing) return;

    const selectedCustomers = getSelectedCustomers();
    if (selectedCustomers.length === 0) {
      setSelectedCustomerIds(new Set());
      setBulkDeleteConfirmOpen(false);
      return;
    }

    setIsBulkProcessing(true);
    try {
      const results = await runBulkActions(selectedCustomers, (customer) =>
        dispatch(
          deleteCustomer({
            customerId:
              customer.customerId ||
              customer.customerCode ||
              customer._id ||
              customer.id,
            primaryId:
              customer.customerId ||
              customer.customerCode ||
              customer._id ||
              customer.id,
            secondaryId: customer._id || customer.id,
            skipRefresh: true,
            suppressToast: true,
          }),
        ).unwrap(),
      );
      const successfulIds = new Set();
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulIds.add(getCustomerSelectionId(selectedCustomers[index]));
        }
      });
      const successCount = successfulIds.size;
      const failureCount = results.length - successCount;
      const failedIds = new Set(
        results.flatMap((result, index) =>
          result.status === "rejected"
            ? [getCustomerSelectionId(selectedCustomers[index])]
            : [],
        ),
      );

      setSelectedCustomerIds(failedIds);
      setBulkDeleteConfirmOpen(false);
      if (successCount > 0) {
        dispatch(fetchCustomers());
        setToastMsg(
          `Deleted ${successCount} customer${successCount === 1 ? "" : "s"}.`,
        );
        setTimeout(() => setToastMsg(""), 4000);
      }
      if (failureCount > 0) {
        const reason = results.find(
          (result) => result.status === "rejected",
        )?.reason;
        const detail = typeof reason === "string" ? reason : reason?.message;
        toast.error(
          `Delete failed for ${failureCount} customer${failureCount === 1 ? "" : "s"}.${detail ? ` ${detail}` : ""} Failed records remain selected.`,
        );
      }
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Calculate pagination boundaries
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / itemsPerPage),
  );
  const validCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = validCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedCustomers = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Submit New Customer Form (Super Admin Access)
  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.companyName && !newCustomer.name) {
      alert("Please fill in Company Name");
      return;
    }

    const mobVal =
      newCustomer.mobileNumber ||
      newCustomer.mobile ||
      newCustomer.number ||
      "";
    dispatch(
      createCustomer({
        _isLocal: true,
        name: newCustomer.companyName || newCustomer.name || "Customer",
        companyName: newCustomer.companyName,
        mobileNumber: mobVal,
        mobile: mobVal,
        contactNo: mobVal,
        phone: mobVal,
        state: newCustomer.state,
        city: newCustomer.city,
        pincode: newCustomer.pincode,
        status: newCustomer.status,
        assignedTelecaller: newCustomer.telecaller,
      }),
    )
      .unwrap()
      .then((res) => {
        setIsAddModalOpen(false);
        setNewCustomer({
          srNo: "",
          id: "",
          name: "",
          companyName: "",
          state: "",
          city: "",
          pincode: "",
          regDate: new Date().toISOString().slice(0, 10),
          status: "Active",
          telecaller: "TC014",
          email: "",
          mobile: "",
        });
        setToastMsg(
          `Customer "${res.customer?.name || newCustomer.name}" added successfully!`,
        );
        setTimeout(() => setToastMsg(""), 4000);
      });
  };

  const handleToggleStatus = (cust) => {
    if (!hasAccessPermission) return;
    const newStatus = cust.status === "Active" ? "Pending" : "Active";
    dispatch(
      updateCustomer({
        customerId: cust._id || cust.id,
        updateData: { status: newStatus },
      }),
    )
      .unwrap()
      .then(() => {
        setToastMsg(`Status for "${cust.name}" toggled successfully!`);
        setTimeout(() => setToastMsg(""), 4000);
      });
  };

  // View Customer Record
  const handleViewCustomer = (cust) => {
    setSelectedCustomerDetail(cust);
    setViewMode("view");
  };

  // Edit Customer Record
  const handleEditCustomer = (cust) => {
    if (!hasAccessPermission) return;
    setEditingCustomer({
      _id: cust._id,
      id: cust.id,
      srNo: cust.srNo,
      name: cust.name,
      companyName: cust.companyName,
      state: cust.state || "",
      city: cust.city || "",
      pincode: cust.pincode || "",
      regDate: cust.regDate || new Date().toISOString().slice(0, 10),
      status: cust.status || "Active",
      telecaller: cust.telecaller || "TC014",
      email: cust.email !== "-" ? cust.email : "",
      mobile: cust.mobile !== "-" ? cust.mobile : "",
    });
    setViewMode("edit");
  };

  // Save Edited Customer
  const handleEditCustomerSubmit = (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    dispatch(
      updateCustomer({
        customerId:
          editingCustomer._id ||
          editingCustomer.id ||
          editingCustomer.companyName,
        updateData: {
          name: editingCustomer.name,
          companyName: editingCustomer.companyName,
          state: editingCustomer.state,
          city: editingCustomer.city,
          pincode: editingCustomer.pincode,
          status: editingCustomer.status,
          assignedTelecaller: editingCustomer.telecaller,
          email: editingCustomer.email,
          mobile: editingCustomer.mobile,
          mobileNumber: editingCustomer.mobile,
          mobileNo: editingCustomer.mobile,
          mobile_number: editingCustomer.mobile,
          phone: editingCustomer.mobile,
          phoneNumber: editingCustomer.mobile,
          phoneNo: editingCustomer.mobile,
          contact: editingCustomer.mobile,
          contactNo: editingCustomer.mobile,
          contactNumber: editingCustomer.mobile,
          number: editingCustomer.mobile,
        },
      }),
    )
      .unwrap()
      .then(() => {
        setViewMode("list");
        setEditingCustomer(null);
        dispatch(fetchCustomers());
        setToastMsg(`Customer "${editingCustomer.name}" updated successfully!`);
        setTimeout(() => setToastMsg(""), 4000);
      })
      .catch((err) => {
        console.error("Failed to update customer:", err);
      });
  };

  // Open Block / Delete Confirmation Modal
  const handleOpenConfirmModal = (type, cust) => {
    setConfirmModal({ isOpen: true, type, customer: cust });
  };

  // Close Confirmation Modal
  const handleCloseConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null, customer: null });
  };

  // Execute Block / Delete Action
  const handleConfirmAction = () => {
    const { type, customer } = confirmModal;
    if (!customer) return;

    if (type === "delete") {
      const payload = {
        customerId:
          customer.customerId ||
          customer.customerCode ||
          customer._id ||
          customer.id,
        primaryId:
          customer.customerId ||
          customer.customerCode ||
          customer._id ||
          customer.id,
        secondaryId: customer._id || customer.id,
      };
      dispatch(deleteCustomer(payload))
        .unwrap()
        .then((res) => {
          handleCloseConfirmModal();
          setToastMsg(res?.message || `Customer deleted successfully!`);
          setTimeout(() => setToastMsg(""), 4000);
        })
        .catch((err) => {
          console.error("Delete failed:", err);
          handleCloseConfirmModal();
        });
    } else if (type === "block") {
      const newStatus = customer.status === "Blocked" ? "Active" : "Blocked";
      dispatch(
        updateCustomer({
          customerId: customer._id || customer.id,
          updateData: { status: newStatus },
        }),
      )
        .unwrap()
        .then((response) => {
          handleCloseConfirmModal();
          dispatch(fetchCustomers());
          toast.success(response?.message || "Customer updated successfully");
        });
    }
  };

  // Handle Export CSV
  const handleExportCSV = async () => {
    if (!hasAccessPermission) {
      alert(
        "Access Denied: Export CSV is allowed for Super Admin and Admin only.",
      );
      return;
    }

    try {
      const response = await api.get("/superadmin/customers/export/csv", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `LTS_Customer_Database_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMsg("Customer CSV exported successfully!");
      setTimeout(() => setToastMsg(""), 3500);
    } catch (error) {
      toast.error("Failed to export CSV file.");
    }
  };

  // Handle Export PDF Report
  const handleExportPDF = async () => {
    if (!hasAccessPermission) {
      alert(
        "Access Denied: Export PDF is allowed for Super Admin and Admin only.",
      );
      return;
    }

    try {
      const response = await api.get("/superadmin/customers/export/pdf", {
        responseType: "blob",
      });
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "application/pdf" });
      const signature = await blob.slice(0, 5).text();
      if (signature !== "%PDF-") {
        const contentType =
          blob.type ||
          response.headers?.["content-type"] ||
          "unknown content type";
        const preview = await blob.slice(0, 100).text();
        const isHtml =
          contentType.includes("text/html") ||
          /<!doctype html|<html/i.test(preview);
        throw new Error(
          isHtml
            ? "The server returned an HTML report instead of a PDF. Deploy the latest backend PDF export changes, then try again."
            : `The export endpoint returned an invalid PDF response (${contentType}).`,
        );
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `LTS_Customer_Database_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      setToastMsg("Customer PDF downloaded successfully!");
      setTimeout(() => setToastMsg(""), 3500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export PDF file.",
      );
    }
  };

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Download Sample CSV Import Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ["Sr No", "Company Name", "Mobile", "Pincode"];
    const sampleRows = [
      ["01", "Global Logistics Ltd", "9876543210", "411001"],
      ["02", "Prime Pharma Pvt Ltd", "9876543211", "395001"],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [sampleHeaders.join(","), ...sampleRows.map((r) => r.join(","))].join(
        "\n",
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Sample_Customer_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Validate and store selected file
  const validateAndSetFile = (file) => {
    if (!file) return;
    setFileError("");

    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const validExtensions = [".xlsx", ".xls", ".csv"];
    if (!validExtensions.includes(ext)) {
      setFileError(
        "Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.",
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      setFileError("File size exceeds the 10MB limit.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Handle Category selection
  const handleSelectCategory = (cat) => {
    const catId = cat.categoryId || cat._id || cat.id || "";
    const catName = cat.name || cat.categoryName || cat.category || "";
    setSelectedCatId(catId);
    setSelectedCatName(catName);
    setIsCatDropdownOpen(false);
    setCatSearch("");

    // Reset Sub-Category
    setSelectedSubCatIds([]);
    setSelectedSubCatNames([]);
    setSubCatSearch("");
    setFileError("");
    setSubCategories([]);
    setSubCategoriesError("");
  };

  // Handle Sub-Category multi-selection
  const handleSelectSubCategory = (sc) => {
    const subId = sc.subcategoryId || sc._id || sc.id || "";
    const subName = sc.name || sc.subCategoryName || sc.subcategoryName || "";

    setSelectedSubCatIds((prevIds) =>
      prevIds.includes(subId)
        ? prevIds.filter((id) => id !== subId)
        : [...prevIds, subId],
    );

    setSelectedSubCatNames((prevNames) =>
      prevNames.includes(subName)
        ? prevNames.filter((name) => name !== subName)
        : [...prevNames, subName],
    );

    setFileError("");
  };

  // Handle State selection
  const handleSelectState = (st) => {
    setSelectedState(st.name);
    setSelectedStateCode(st.isoCode);
    setIsStateDropdownOpen(false);
    setStateSearch("");

    // Reset City
    setSelectedCity([]);
    setCitySearch("");
    setFileError("");

    // Populate cities for this state
    try {
      const stateCities = City.getCitiesOfState("IN", st.isoCode) || [];
      setCities(stateCities);
    } catch (err) {
      console.error("Error getting cities:", err);
      setCities([]);
    }
  };

  // Handle City selection
  // Handle City multi-selection
  const handleSelectCity = (ct) => {
    setSelectedCity((prevCities) =>
      prevCities.includes(ct.name)
        ? prevCities.filter((city) => city !== ct.name)
        : [...prevCities, ct.name],
    );

    setFileError("");
  };

  // Reset all import modal inputs and dropdowns
  const resetImportStates = () => {
    setSelectedProject("");
    setSelectedProjectId("");
    setIsProjectDropdownOpen(false);
    setProjectSearch("");
    setProjectsError("");

    setImportCategories([]);
    setImportCategoriesError("");
    setIsCatDropdownOpen(false);
    setSelectedCatId("");
    setSelectedCatName("");
    setCatSearch("");

    setSelectedSubCatIds([]);
    setSelectedSubCatNames([]);
    setIsSubCatDropdownOpen(false);
    setSubCatSearch("");
    setSubCategories([]);
    setSubCategoriesError("");

    setSelectedState("");
    setSelectedStateCode("");
    setIsStateDropdownOpen(false);
    setStateSearch("");

    setSelectedCity([]);
    setIsCityDropdownOpen(false);
    setCitySearch("");
    setCities([]);

    setImportRegistrationDate(getLocalDateInputValue());
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Step 1: Process and validate file without importing into database
  const handleProcessUploadFile = () => {
    if (!selectedProjectId) {
      setFileError("Please select a project.");
      return;
    }
    if (!selectedCatId) {
      setFileError("Please select a category.");
      return;
    }
    if (!selectedSubCatIds.length) {
      setFileError("Please select at least one sub-category.");
      return;
    }
    if (!selectedState) {
      setFileError("Please select a state.");
      return;
    }
    if (!selectedCity.length) {
      setFileError("Please select at least one city.");
      return;
    }
    if (!selectedFile) {
      setFileError("Please select an Excel or CSV file.");
      return;
    }

    setIsProcessingFile(true);
    setFileError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setFileError("The file does not contain any readable sheets.");
          setIsProcessingFile(false);
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!json || json.length === 0) {
          setFileError("The uploaded file contains no data rows.");
          setIsProcessingFile(false);
          return;
        }

        // Helper to extract fields using regex
        const getField = (row, patterns) => {
          const keys = Object.keys(row);
          for (const pat of patterns) {
            const found = keys.find((k) => pat.test(k.trim()));
            if (
              found &&
              row[found] !== undefined &&
              row[found] !== null &&
              String(row[found]).trim() !== ""
            ) {
              return String(row[found]).trim();
            }
          }
          return "";
        };

        // Existing customer uniqueness sets
        const existingIds = new Set(
          customers
            .map((c) =>
              String(c.id || "")
                .trim()
                .toLowerCase(),
            )
            .filter(Boolean),
        );
        const existingEmails = new Set(
          customers
            .map((c) =>
              String(c.email || "")
                .trim()
                .toLowerCase(),
            )
            .filter((e) => e && e !== "-"),
        );
        const existingPhones = new Set(
          customers
            .map((c) =>
              String(c.mobile || "")
                .replace(/\D/g, "")
                .slice(-10),
            )
            .filter((p) => p.length === 10),
        );

        // Sets to detect duplicates within the file itself
        const seenFileIds = new Set();
        const seenFileEmails = new Set();
        const seenFilePhones = new Set();

        const parsed = [];

        for (let idx = 0; idx < json.length; idx++) {
          const row = json[idx];
          const name = getField(row, [
            /^customer\s*name$/i,
            /^name$/i,
            /^client\s*name$/i,
            /name/i,
          ]);
          const companyName = getField(row, [
            /^company\s*name$/i,
            /^company$/i,
            /^business\s*name$/i,
            /^business$/i,
            /company/i,
          ]);
          const email = getField(row, [
            /^email\s*(address|id)?$/i,
            /^mail$/i,
            /email/i,
          ]);
          const mobile = getField(row, [
            /^phone\s*(number)?$/i,
            /^mobile\s*(number)?$/i,
            /^contact\s*(number)?$/i,
            /mobile/i,
            /phone/i,
            /contact/i,
          ]);
          const state = getField(row, [/^state$/i]);
          const city = getField(row, [/^city$/i]);
          const pincode = getField(row, [
            /^pin\s*code$/i,
            /^pincode$/i,
            /^zip\s*(code)?$/i,
          ]);
          const customerId = getField(row, [
            /^customer\s*id$/i,
            /^cust\s*id$/i,
            /^id$/i,
          ]);
          const status = getField(row, [/^status$/i]) || "Active";
          const telecaller =
            getField(row, [
              /^assigned\s*telecaller$/i,
              /^telecaller$/i,
              /^caller$/i,
            ]) || "TC014";

          const cleanPhone = mobile.replace(/\D/g, "");
          const cleanPhone10 = cleanPhone.slice(-10);
          const lowerEmail = email.toLowerCase();
          const lowerId = customerId.toLowerCase();

          let recordStatus = "NEW";
          let reason = "Ready to import";

          // 1. Check for INVALID: required fields & format
          if (!name && !companyName) {
            recordStatus = "INVALID";
            reason = "Missing Customer Name and Company Name";
          } else if (!name) {
            recordStatus = "INVALID";
            reason = "Missing required Customer Name";
          } else if (!companyName) {
            recordStatus = "INVALID";
            reason = "Missing required Company Name";
          } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            recordStatus = "INVALID";
            reason = "Invalid email address format";
          } else if (
            mobile &&
            cleanPhone10.length > 0 &&
            cleanPhone10.length < 10
          ) {
            recordStatus = "INVALID";
            reason = "Invalid phone number (must be at least 10 digits)";
          }

          // 2. Check for DUPLICATE (if not invalid)
          if (recordStatus !== "INVALID") {
            const isDbDuplicate =
              (lowerId && existingIds.has(lowerId)) ||
              (lowerEmail && existingEmails.has(lowerEmail)) ||
              (cleanPhone10.length === 10 && existingPhones.has(cleanPhone10));

            const isFileDuplicate =
              (lowerId && seenFileIds.has(lowerId)) ||
              (lowerEmail && seenFileEmails.has(lowerEmail)) ||
              (cleanPhone10.length === 10 && seenFilePhones.has(cleanPhone10));

            if (isDbDuplicate) {
              recordStatus = "DUPLICATE";
              reason = "Customer already exists in database";
            } else if (isFileDuplicate) {
              recordStatus = "DUPLICATE";
              reason = "Duplicate record found within the same file";
            }
          }

          if (lowerId) seenFileIds.add(lowerId);
          if (lowerEmail) seenFileEmails.add(lowerEmail);
          if (cleanPhone10.length === 10) seenFilePhones.add(cleanPhone10);

          parsed.push({
            rowNum: idx + 1,
            name: name || "ΓÇö",
            companyName: companyName || "ΓÇö",
            email: email || "ΓÇö",
            mobile: mobile || "ΓÇö",
            state: state || selectedState || "Maharashtra",
            city: city || selectedCity.join(", ") || "Mumbai",
            pincode: pincode || "400001",
            customerId:
              customerId || `CUST${Math.floor(100 + Math.random() * 900)}`,
            status: status,
            telecaller: telecaller,
            importStatus: recordStatus,
            reason: reason,
          });
        }

        const total = parsed.length;
        const newCount = parsed.filter((r) => r.importStatus === "NEW").length;
        const duplicateCount = parsed.filter(
          (r) => r.importStatus === "DUPLICATE",
        ).length;
        const invalidCount = parsed.filter(
          (r) => r.importStatus === "INVALID",
        ).length;

        setReviewStats({
          total,
          newCount,
          duplicateCount,
          invalidCount,
        });
        setReviewRecords(parsed);
        setIsProcessingFile(false);
        setIsUploadModalOpen(false);
        setIsReviewModalOpen(true);
      } catch (err) {
        console.error("Failed to parse file:", err);
        setFileError(
          "Failed to parse file. Please verify it is a valid Excel or CSV file.",
        );
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setFileError("Error reading the selected file. Please try again.");
      setIsProcessingFile(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Cancel Step 1 Modal
  const handleCancelUpload = () => {
    setIsUploadModalOpen(false);
    resetImportStates();
  };

  // Cancel Step 2 Modal
  const handleCancelReview = () => {
    setIsReviewModalOpen(false);
    resetImportStates();
    setReviewRecords([]);
    setReviewStats({
      total: 0,
      newCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
    });
  };

  // Step 2: Confirm and Import ONLY "NEW" records into database
  const handleConfirmImport = async () => {
    const validNewRecords = reviewRecords.filter(
      (r) => r.importStatus === "NEW",
    );
    if (validNewRecords.length === 0 || isImporting) return;

    setIsImporting(true);

    try {
      // Build a clean CSV file containing ONLY the valid NEW records
      const headers = [
        "Sr No",
        "ID",
        "Name",
        "Company Name",
        "State",
        "City",
        "Pincode",
        "Registration Date",
        "Status",
        "Telecaller",
        "Email",
        "Mobile",
      ];
      const csvRows = validNewRecords.map((r, i) => [
        String(customers.length + i + 1).padStart(2, "0"),
        r.customerId,
        `"${(r.name || "").replace(/"/g, '""')}"`,
        `"${(r.companyName || "").replace(/"/g, '""')}"`,
        `"${(r.state || selectedState || "Maharashtra").replace(/"/g, '""')}"`,
        `"${(r.city || selectedCity.join(", ") || "Mumbai").replace(/"/g, '""')}"`,
        `"${(r.pincode || "400001").replace(/"/g, '""')}"`,
        importRegistrationDate,
        r.status || "Active",
        r.telecaller || "TC014",
        `"${(r.email !== "ΓÇö" ? r.email : "").replace(/"/g, '""')}"`,
        `"${(r.mobile !== "ΓÇö" ? r.mobile : "").replace(/"/g, '""')}"`,
      ]);

      const csvString = [
        headers.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const baseName = (selectedFile?.name || "customers").replace(
        /\.[^/.]+$/,
        "",
      );
      const cleanFile = new File([blob], `${baseName}_new_imported.csv`, {
        type: "text/csv",
      });

      await dispatch(
        bulkImportCustomers({
          file: cleanFile,
          projectName: selectedProject,
          projectId: selectedProjectId,
          category: selectedCatName,
          categoryId: selectedCatId,
          subCategory: selectedSubCatNames.join(", "),
          subCategoryId: selectedSubCatIds.join(", "),
          state: selectedState,
          city: selectedCity.join(", "),
        }),
      ).unwrap();

      // Show dynamic breakdown toast
      toast.success(
        `${reviewStats.total} records processed: ${reviewStats.newCount} New ΓåÆ Imported, ${reviewStats.duplicateCount} Duplicate ΓåÆ Skipped, ${reviewStats.invalidCount} Invalid ΓåÆ Skipped`,
      );

      // Re-fetch customer list to guarantee immediate update
      dispatch(fetchCustomers());

      // Close review modal and reset all temporary states
      setIsReviewModalOpen(false);
      resetImportStates();
      setReviewRecords([]);
      setReviewStats({
        total: 0,
        newCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
      });
    } catch (err) {
      console.error("Import failed:", err);
    } finally {
      setIsImporting(false);
    }
  };

  if (viewMode === "add") {
    return (
      <AddCustomer
        onBack={() => setViewMode("list")}
        onSuccess={(addedName) => {
          setViewMode("list");
          setToastMsg(`Customer "${addedName}" added successfully!`);
          setTimeout(() => setToastMsg(""), 4000);
        }}
      />
    );
  }

  // RENDER DEDICATED EDIT PAGE VIEW
  if (viewMode === "edit" && editingCustomer) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col min-h-[600px] text-left">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode("list");
                setEditingCustomer(null);
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Back to Customer Directory"
            >
              <X size={18} />
            </button>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Edit2 size={18} className="text-[#f26522]" />
                <span>Edit Vendor / Customer Record</span>
              </h2>
              <p className="text-xs text-slate-400">
                Update vendor details and sync with telecaller follow-up list
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col md:flex-row flex-1">
          {/* Left Sidebar Tabs */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200/80 p-4 space-y-2 shrink-0">
            <button
              type="button"
              onClick={() => setEditTab("personal")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                editTab === "personal"
                  ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <User size={18} />
              <span>Vendor Personal Info</span>
            </button>

            <button
              type="button"
              onClick={() => setEditTab("images")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                editTab === "images"
                  ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet size={18} />
              <span>Upload Images</span>
            </button>

            <button
              type="button"
              onClick={() => setEditTab("contact")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                editTab === "contact"
                  ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Phone size={18} />
              <span>Contact & Payment Info</span>
            </button>

            <button
              type="button"
              onClick={() => setEditTab("category")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                editTab === "category"
                  ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Tag size={18} />
              <span>Vendor Category Details</span>
            </button>
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* TAB 1: PERSONAL */}
              {editTab === "personal" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Vendor Code
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editingCustomer.id || "VEN986080"}
                        className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        System Register Date
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editingCustomer.regDate || "02/10/2026"}
                        className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                        Vendor Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Owner Name"
                        value={editingCustomer.name || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                        Vendor Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Vendor Company Name"
                        value={editingCustomer.companyName || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Country Name:
                      </label>
                      <select
                        value={editingCustomer.country || "India"}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            country: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        State Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Uttar Pradesh"
                        value={editingCustomer.state || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            state: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        City Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Noida"
                        value={editingCustomer.city || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Locality:
                      </label>
                      <input
                        type="text"
                        placeholder="Locality"
                        value={editingCustomer.locality || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            locality: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Email:
                      </label>
                      <input
                        type="email"
                        placeholder="vendor@example.com"
                        value={editingCustomer.email || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        GST Number:
                      </label>
                      <input
                        type="text"
                        placeholder="15 Digit GST Number"
                        value={editingCustomer.gstNumber || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            gstNumber: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Address:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Address"
                        value={editingCustomer.address || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES */}
              {editTab === "images" && (
                <div className="space-y-4 max-w-xl">
                  <h3 className="text-sm font-bold text-slate-800">
                    Upload Vendor Banner & Document Photos
                  </h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer">
                    <p className="text-xs font-bold text-slate-800">
                      Upload new vendor photos or documents
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACT & PAYMENT */}
              {editTab === "contact" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                        Registered Phone No. (Locked) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCustomer.mobile || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            mobile: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Whatsapp No. :
                      </label>
                      <input
                        type="text"
                        placeholder="Whatsapp Number"
                        value={
                          editingCustomer.whatsappNumber ||
                          editingCustomer.mobile ||
                          ""
                        }
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            whatsappNumber: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Alternate Contact No.:
                      </label>
                      <input
                        type="text"
                        placeholder="Alternate Contact No"
                        value={editingCustomer.altContactNumber || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            altContactNumber: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Website:
                      </label>
                      <input
                        type="text"
                        placeholder="N/A"
                        value={editingCustomer.website || "N/A"}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            website: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Vendor Listing Type:
                      </label>
                      <select
                        value={editingCustomer.listingType || "Not-Verified"}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            listingType: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                      >
                        <option value="Not-Verified">Not-Verified</option>
                        <option value="Verified">Verified</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Is Paid Vendor:
                      </label>
                      <select
                        value={editingCustomer.isPaid || "No"}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            isPaid: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                        Assigned Telecaller:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TC014"
                        value={editingCustomer.telecaller || "2547"}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            telecaller: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORY DETAILS */}
              {editTab === "category" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                        Primary Business Category:
                      </label>
                      <select
                        value={
                          editingCustomer.category ||
                          "Electrical & Electronics Repair"
                        }
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                      >
                        <option value="Electrical & Electronics Repair">
                          Electrical & Electronics Repair
                        </option>
                        <option value="Grocery & FMCG">Grocery & FMCG</option>
                        <option value="Electronics & IT">
                          Electronics & IT
                        </option>
                        <option value="Medical & Pharma">
                          Medical & Pharma
                        </option>
                        <option value="Home Products & Kitchenware">
                          Home Products & Kitchenware
                        </option>
                        <option value="Hardware & Tools">
                          Hardware & Tools
                        </option>
                        <option value="Fashion & Apparel">
                          Fashion & Apparel
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                        Service Specialization:
                      </label>
                      <input
                        type="text"
                        placeholder="Service Specialization"
                        value={editingCustomer.serviceSpecialization || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            serviceSpecialization: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                        Keywords / Tags for Telecaller Search:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Keywords & Search Tags"
                        value={editingCustomer.keywordsTags || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            keywordsTags: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewMode("list");
                  setEditingCustomer(null);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleEditCustomerSubmit}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#5b52f6] hover:bg-[#4940e0] rounded-xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check size={15} />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={(e) => {
                  handleEditCustomerSubmit(e);
                  alert(
                    `Vendor details updated! Added to Telecaller Follow-up List for ${editingCustomer.name || editingCustomer.companyName}.`,
                  );
                }}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#00b074] hover:bg-[#009663] rounded-xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check size={15} />
                <span>{isSaving ? "Saving..." : "Save & Followup"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER DEDICATED VIEW DETAIL PAGE VIEW
  if (viewMode === "view" && selectedCustomerDetail) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode("list");
                setSelectedCustomerDetail(null);
              }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Back to Customer Directory"
            >
              <X size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Eye size={20} className="text-[#f26522]" />
                <span>Customer Profile Overview</span>
              </h2>
              <p className="text-xs text-slate-500">
                Comprehensive customer record information
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              Mobile Number
            </div>
            <div className="text-sm font-bold text-slate-900">
              {selectedCustomerDetail.number ||
                selectedCustomerDetail.mobile ||
                "-"}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              Customer / Contact Name
            </div>
            <div className="text-sm font-bold text-slate-900">
              {selectedCustomerDetail.name}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              Company Name
            </div>
            <div className="text-sm font-bold text-[#f26522]">
              {selectedCustomerDetail.companyName || "-"}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              Email Address
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {selectedCustomerDetail.email || "-"}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              State
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {selectedCustomerDetail.state || "-"}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              City
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {selectedCustomerDetail.city || "-"}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              Reg. Date
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {selectedCustomerDetail.regDate || "-"}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase">
              Status
            </div>
            <div
              className={`text-sm font-bold ${selectedCustomerDetail.status === "Active" ? "text-emerald-600" : "text-amber-600"}`}
            >
              {selectedCustomerDetail.status}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Customer Database
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin Master Customer Directory & Sliding View
            </p>
          </div>

          {/* Action Buttons: Add Customer, Import (Excel/CSV) & Export */}
          {hasAccessPermission ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add Customer Button (Super Admin Access) */}
              <button
                onClick={() => setViewMode("add")}
                className="px-3.5 py-1.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Add New Customer Record"
              >
                <UserPlus size={14} />
                <span>+ Add Customer</span>
              </button>

              {/* Import Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f26522] border border-orange-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Import Excel or CSV File"
              >
                <Upload size={14} />
                <span>Import (Excel/CSV)</span>
              </button>

              {/* Single Unified Export Button */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                  title="Export Customer Data"
                >
                  <Download size={14} />
                  <span>Export Data</span>
                  <ChevronDown size={13} className="ml-0.5 text-slate-300" />
                </button>

                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <FileSpreadsheet size={15} className="text-[#f26522]" />
                      <span>Export Excel (.csv)</span>
                    </button>

                    <button
                      onClick={() => {
                        handleExportPDF();
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <FileText size={15} className="text-slate-600" />
                      <span>Export PDF Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
              <Lock size={13} className="text-slate-400 shrink-0" />
              <span>Full Access restricted to Super Admin & Admin</span>
            </div>
          )}
        </div>

        {/* Search Bar & Status Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="relative w-full sm:max-w-md md:max-w-lg">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name, company, state, city, pincode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
              <Filter size={13} className="text-[#f26522]" />
              <span>Status:</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer shadow-2xs transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {hasAccessPermission && selectedCustomerIds.size > 0 && (
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-2">
            <div className="text-xs font-semibold text-slate-700">
              {selectedCustomerIds.size} customer
              {selectedCustomerIds.size === 1 ? "" : "s"} selected
              <span className="ml-1 font-medium text-slate-500">
                ┬╖ Selection persists across pages and filters
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="bulk-customer-status"
                className="text-xs font-semibold text-slate-600"
              >
                Set status:
              </label>
              <select
                id="bulk-customer-status"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                disabled={isBulkProcessing}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Blocked">Blocked</option>
              </select>
              <button
                type="button"
                onClick={handleBulkUpdateStatus}
                disabled={isBulkProcessing || isSaving}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBulkProcessing ? "Processing..." : "Update status"}
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(true)}
                disabled={isBulkProcessing || isSaving}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={13} />
                Delete selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedCustomerIds(new Set())}
                disabled={isBulkProcessing}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div className="mb-3 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* TABLE VIEW WITH MANUAL HORIZONTAL & VERTICAL SLIDING / SCROLLING */}
        <div
          ref={manualScrollRef}
          className="h-fit max-h-[520px] overflow-x-auto overflow-y-auto rounded-xl border border-slate-100 mb-4 scroll-smooth custom-scrollbar"
        >
          <table className="w-full min-w-[790px] text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                {hasAccessPermission && (
                  <th className="w-10 py-2.5 px-3 text-center">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      aria-label="Select all filtered customers across pages"
                      title="Select all filtered customers across pages"
                      checked={allFilteredCustomersSelected}
                      onChange={(e) =>
                        handleToggleFilteredSelection(e.target.checked)
                      }
                      disabled={
                        isBulkProcessing || filteredCustomers.length === 0
                      }
                      className="h-4 w-4 cursor-pointer accent-[#f26522] disabled:cursor-not-allowed"
                    />
                  </th>
                )}
                <th className="py-2.5 px-3">SR. NO.</th>
                <th className="py-2.5 px-3">MOBILE NUMBER</th>
                <th className="py-2.5 px-3">COMPANY NAME</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3">CITY</th>
                <th className="py-2.5 px-3">REG. DATE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {currentDisplayedCustomers.length > 0 ? (
                currentDisplayedCustomers.map((cust, idx) => {
                  const globalIdx = indexOfFirstItem + idx + 1;
                  return (
                    <tr
                      key={cust.id || idx}
                      className={`transition-colors ${selectedCustomerIds.has(getCustomerSelectionId(cust)) ? "bg-orange-50/50" : "hover:bg-slate-50/60"}`}
                    >
                      {hasAccessPermission && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Select ${cust.companyName || cust.name}`}
                            checked={selectedCustomerIds.has(
                              getCustomerSelectionId(cust),
                            )}
                            onChange={(e) =>
                              handleToggleCustomerSelection(
                                cust,
                                e.target.checked,
                              )
                            }
                            disabled={isBulkProcessing}
                            className="h-4 w-4 cursor-pointer accent-[#f26522] disabled:cursor-not-allowed"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {String(globalIdx).padStart(2, "0")}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {cust.number}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#f26522]">
                        {cust.companyName || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {cust.state || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {cust.city || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {cust.regDate || "-"}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cust)}
                          disabled={isSaving || isBulkProcessing}
                          className={`font-semibold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                            cust.status === "Active"
                              ? "text-emerald-600"
                              : cust.status === "Blocked" ||
                                  cust.status === "Rejected"
                                ? "text-rose-600"
                                : "text-amber-600"
                          }`}
                          title="Click to toggle status"
                        >
                          {cust.status}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Action */}
                          <button
                            type="button"
                            onClick={() => handleViewCustomer(cust)}
                            disabled={isBulkProcessing}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye size={15} />
                          </button>
                          {/* Edit Action */}
                          <button
                            type="button"
                            onClick={() => handleEditCustomer(cust)}
                            disabled={isBulkProcessing}
                            className="p-1.5 text-slate-400 hover:text-[#f26522] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit2 size={15} />
                          </button>
                          {/* Block / Unblock Action */}
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenConfirmModal("block", cust)
                            }
                            disabled={isBulkProcessing}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              cust.status === "Blocked"
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                            }`}
                            title={
                              cust.status === "Blocked"
                                ? "Unblock Customer"
                                : "Block Customer"
                            }
                          >
                            <Ban size={15} />
                          </button>
                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenConfirmModal("delete", cust)
                            }
                            disabled={isBulkProcessing}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Customer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={hasAccessPermission ? 9 : 8}
                    className="py-6 text-center text-xs text-slate-400"
                  >
                    No customer records found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Interactive Pagination & Footer Bar */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-100">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredCustomers.length > 0 ? indexOfFirstItem + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-800">
              {Math.min(indexOfLastItem, filteredCustomers.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-800">
              {filteredCustomers.length}
            </strong>{" "}
            records
          </span>
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={validCurrentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pageNum === validCurrentPage
                      ? "bg-[#f26522] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={validCurrentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* BLOCK / DELETE CONFIRMATION MODAL */}
      {confirmModal.isOpen && confirmModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                  confirmModal.type === "delete"
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-amber-50 text-amber-600 border border-amber-100"
                }`}
              >
                {confirmModal.type === "delete" ? (
                  <Trash2 size={24} />
                ) : (
                  <Ban size={24} />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmModal.type === "delete"
                    ? "Delete Customer Record?"
                    : confirmModal.customer.status === "Blocked"
                      ? "Unblock Customer?"
                      : "Block Customer?"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {confirmModal.type === "delete"
                    ? `Are you sure you want to permanently delete "${confirmModal.customer.name}"? This action cannot be undone.`
                    : confirmModal.customer.status === "Blocked"
                      ? `Are you sure you want to unblock "${confirmModal.customer.name}"?`
                      : `Are you sure you want to block "${confirmModal.customer.name}"?`}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseConfirmModal}
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isSaving}
                  className={`w-full py-2.5 px-4 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5 ${
                    confirmModal.type === "delete"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : confirmModal.customer.status === "Blocked"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {isSaving ? (
                    <span>Processing...</span>
                  ) : confirmModal.type === "delete" ? (
                    <>
                      <Trash2 size={14} />
                      <span>Yes, Delete</span>
                    </>
                  ) : confirmModal.customer.status === "Blocked" ? (
                    <span>Yes, Unblock</span>
                  ) : (
                    <>
                      <Ban size={14} />
                      <span>Yes, Block</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete selected customer records?
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  This will permanently delete {selectedCustomerIds.size}{" "}
                  selected customer{selectedCustomerIds.size === 1 ? "" : "s"}.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkDeleteConfirmOpen(false)}
                  disabled={isBulkProcessing}
                  className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={
                    isBulkProcessing ||
                    isSaving ||
                    selectedCustomerIds.size === 0
                  }
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-rose-700 disabled:opacity-50"
                >
                  {isBulkProcessing ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete selected
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: IMPORT CUSTOMERS MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f26522]">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Import Customers
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload an Excel or CSV file to bulk add customers to the
                    Customer Database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelUpload}
                disabled={isProcessingFile}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-200/50 disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Project Name Dropdown */}
              <div className="space-y-1.5" ref={projectDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  Project Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    disabled={projectsLoading}
                    onClick={() => {
                      setIsProjectDropdownOpen(!isProjectDropdownOpen);
                      setProjectSearch("");
                      setIsCatDropdownOpen(false);
                      setIsSubCatDropdownOpen(false);
                      setIsStateDropdownOpen(false);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl transition-all font-medium text-left cursor-pointer hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 ${
                      isProjectDropdownOpen
                        ? "border-[#f26522] ring-2 ring-[#f26522]/20 bg-white"
                        : "border-slate-200"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span
                      className={
                        selectedProject
                          ? "text-slate-800 font-semibold truncate"
                          : "text-slate-400"
                      }
                    >
                      {selectedProject || "Select Project"}
                    </span>

                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isProjectDropdownOpen ? "rotate-180 text-[#f26522]" : ""
                      }`}
                    />
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      {/* Search Box */}
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Search project..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Project Options */}
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {projectsLoading ? (
                          <div className="flex items-center justify-center gap-1.5 py-4 text-center text-xs text-slate-400">
                            <Loader2
                              size={13}
                              className="animate-spin text-[#f26522]"
                            />
                            <span>Loading projects...</span>
                          </div>
                        ) : projectsError ? (
                          <div className="py-3 text-center text-xs text-red-500">
                            {projectsError}
                          </div>
                        ) : projects.filter((project) =>
                            (project.name || project.projectName || "")
                              .toLowerCase()
                              .includes(projectSearch.toLowerCase()),
                          ).length === 0 ? (
                          <div className="py-3 text-center text-xs text-slate-400">
                            No projects found
                          </div>
                        ) : (
                          projects
                            .filter((project) =>
                              (project.name || project.projectName || "")
                                .toLowerCase()
                                .includes(projectSearch.toLowerCase()),
                            )
                            .map((project) => (
                              <button
                                key={
                                  project.projectId ||
                                  project._id ||
                                  project.id ||
                                  project.name
                                }
                                type="button"
                                onClick={() => {
                                  setSelectedProject(
                                    project.name || project.projectName || "",
                                  );
                                  setSelectedProjectId(
                                    project.projectId ||
                                      project._id ||
                                      project.id ||
                                      "",
                                  );
                                  setSelectedCatId("");
                                  setSelectedCatName("");
                                  setSelectedSubCatIds([]);
                                  setSelectedSubCatNames([]);
                                  setSubCategories([]);
                                  setIsProjectDropdownOpen(false);
                                  setProjectSearch("");
                                  setFileError("");
                                }}
                                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                  selectedProjectId ===
                                  (project.projectId ||
                                    project._id ||
                                    project.id ||
                                    "")
                                    ? "bg-orange-50 font-bold text-[#f26522]"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-[#f26522]"
                                }`}
                              >
                                <span className="truncate">
                                  {project.name || project.projectName}
                                </span>
                                {selectedProjectId ===
                                  (project.projectId ||
                                    project._id ||
                                    project.id ||
                                    "") && (
                                  <Check
                                    size={13}
                                    className="text-[#f26522] shrink-0"
                                  />
                                )}
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5" ref={catDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={!selectedProjectId || importCategoriesLoading}
                    onClick={() => {
                      if (!selectedProjectId || importCategoriesLoading) return;
                      setIsCatDropdownOpen(!isCatDropdownOpen);
                      setIsSubCatDropdownOpen(false);
                      setIsStateDropdownOpen(false);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl transition-all font-medium text-left cursor-pointer hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isCatDropdownOpen
                        ? "border-[#f26522] ring-2 ring-[#f26522]/20 bg-white"
                        : "border-slate-200"
                    }`}
                  >
                    <span
                      className={
                        selectedCatName
                          ? "text-slate-800 font-semibold truncate"
                          : "text-slate-400"
                      }
                    >
                      {!selectedProjectId
                        ? "Select project first"
                        : selectedCatName || "Select Category"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCatDropdownOpen ? "rotate-180 text-[#f26522]" : ""}`}
                    />
                  </button>

                  {isCatDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Search category..."
                            value={catSearch}
                            onChange={(e) => setCatSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {importCategoriesLoading ? (
                          <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <Loader2
                              size={13}
                              className="animate-spin text-[#f26522]"
                            />
                            <span>Loading categories...</span>
                          </div>
                        ) : importCategoriesError ? (
                          <div className="py-3 text-center text-xs text-red-500">
                            {importCategoriesError}
                          </div>
                        ) : (
                          (() => {
                            const filtered = importCategories.filter((c) =>
                              String(
                                c.name || c.categoryName || c.category || "",
                              )
                                .toLowerCase()
                                .includes(catSearch.toLowerCase()),
                            );
                            if (filtered.length === 0) {
                              return (
                                <div className="py-3 text-center text-xs text-slate-400">
                                  No categories found
                                </div>
                              );
                            }
                            return filtered.map((c) => {
                              const name =
                                c.name || c.categoryName || c.category;
                              const isSelected = selectedCatName === name;
                              return (
                                <button
                                  key={c.categoryId || c._id || c.id || name}
                                  type="button"
                                  onClick={() => handleSelectCategory(c)}
                                  className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-orange-50 font-bold text-[#f26522]"
                                      : "text-slate-700 hover:bg-slate-50 hover:text-[#f26522]"
                                  }`}
                                >
                                  <span className="truncate">{name}</span>
                                  {isSelected && (
                                    <Check
                                      size={13}
                                      className="text-[#f26522] shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            });
                          })()
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Category Dropdown */}
              <div className="space-y-1.5" ref={subCatDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={!selectedCatId || subCategoriesLoading}
                    onClick={() => {
                      if (!selectedCatId || subCategoriesLoading) return;
                      setIsSubCatDropdownOpen(!isSubCatDropdownOpen);
                      setIsCatDropdownOpen(false);
                      setIsStateDropdownOpen(false);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs border rounded-xl transition-all font-medium text-left disabled:cursor-not-allowed disabled:opacity-60 ${
                      !selectedCatId
                        ? "bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 cursor-pointer"
                    } ${isSubCatDropdownOpen ? "border-[#f26522] ring-2 ring-[#f26522]/20 bg-white" : ""}`}
                  >
                    <span
                      className={
                        selectedSubCatNames.length > 0
                          ? "text-slate-800 font-semibold truncate"
                          : "text-slate-400"
                      }
                    >
                      {!selectedCatId
                        ? "Select category first"
                        : selectedSubCatNames.length > 0
                          ? selectedSubCatNames.join(", ")
                          : "Select Sub-Category"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${isSubCatDropdownOpen ? "rotate-180 text-[#f26522]" : ""}`}
                    />
                  </button>

                  {isSubCatDropdownOpen && selectedCatId && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Search sub-category..."
                            value={subCatSearch}
                            onChange={(e) => setSubCatSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {subCategoriesLoading ? (
                          <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <Loader2
                              size={13}
                              className="animate-spin text-[#f26522]"
                            />
                            <span>Loading sub-categories...</span>
                          </div>
                        ) : subCategoriesError ? (
                          <div className="py-3 text-center text-xs text-red-500">
                            {subCategoriesError}
                          </div>
                        ) : (
                          (() => {
                            const filtered = subCategories.filter((sc) =>
                              String(
                                sc.name ||
                                  sc.subCategoryName ||
                                  sc.subcategoryName ||
                                  "",
                              )
                                .toLowerCase()
                                .includes(subCatSearch.toLowerCase()),
                            );
                            if (filtered.length === 0) {
                              return (
                                <div className="py-3 text-center text-xs text-slate-400">
                                  No sub-categories found for {selectedCatName}
                                </div>
                              );
                            }
                            return filtered.map((sc) => {
                              const name =
                                sc.name ||
                                sc.subCategoryName ||
                                sc.subcategoryName;
                              const subId =
                                sc.subcategoryId || sc._id || sc.id || "";
                              const isSelected =
                                selectedSubCatIds.includes(subId);
                              return (
                                <button
                                  key={
                                    sc.subcategoryId || sc._id || sc.id || name
                                  }
                                  type="button"
                                  onClick={() => handleSelectSubCategory(sc)}
                                  className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-orange-50 font-bold text-[#f26522]"
                                      : "text-slate-700 hover:bg-slate-50 hover:text-[#f26522]"
                                  }`}
                                >
                                  <span className="truncate">{name}</span>
                                  {isSelected && (
                                    <Check
                                      size={13}
                                      className="text-[#f26522] shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            });
                          })()
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* State Dropdown */}
              <div className="space-y-1.5" ref={stateDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStateDropdownOpen(!isStateDropdownOpen);
                      setIsCatDropdownOpen(false);
                      setIsSubCatDropdownOpen(false);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl transition-all font-medium text-left cursor-pointer hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 ${
                      isStateDropdownOpen
                        ? "border-[#f26522] ring-2 ring-[#f26522]/20 bg-white"
                        : "border-slate-200"
                    }`}
                  >
                    <span
                      className={
                        selectedState
                          ? "text-slate-800 font-semibold truncate"
                          : "text-slate-400"
                      }
                    >
                      {selectedState || "Select State"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${isStateDropdownOpen ? "rotate-180 text-[#f26522]" : ""}`}
                    />
                  </button>

                  {isStateDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Search state..."
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {(() => {
                          const filtered = allStates.filter((s) =>
                            s.name
                              .toLowerCase()
                              .includes(stateSearch.toLowerCase()),
                          );
                          if (filtered.length === 0) {
                            return (
                              <div className="py-3 text-center text-xs text-slate-400">
                                No states found
                              </div>
                            );
                          }
                          return filtered.map((s) => {
                            const isSelected = selectedState === s.name;
                            return (
                              <button
                                key={s.isoCode}
                                type="button"
                                onClick={() => handleSelectState(s)}
                                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-orange-50 font-bold text-[#f26522]"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-[#f26522]"
                                }`}
                              >
                                <span className="truncate">{s.name}</span>
                                {isSelected && (
                                  <Check
                                    size={13}
                                    className="text-[#f26522] shrink-0"
                                  />
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* City Dropdown */}
              <div className="space-y-1.5" ref={cityDropdownRef}>
                <label className="block text-xs font-bold text-slate-700">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={!selectedState}
                    onClick={() => {
                      if (!selectedState) return;
                      setIsCityDropdownOpen(!isCityDropdownOpen);
                      setIsCatDropdownOpen(false);
                      setIsSubCatDropdownOpen(false);
                      setIsStateDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs border rounded-xl transition-all font-medium text-left ${
                      !selectedState
                        ? "bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 hover:border-[#f26522] focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 cursor-pointer"
                    } ${isCityDropdownOpen ? "border-[#f26522] ring-2 ring-[#f26522]/20 bg-white" : ""}`}
                  >
                    <span
                      className={
                        selectedCity.length
                          ? "text-slate-800 font-semibold truncate"
                          : "text-slate-400"
                      }
                    >
                      {!selectedState
                        ? "Select state first"
                        : selectedCity.join(", ") || "Select City"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCityDropdownOpen ? "rotate-180 text-[#f26522]" : ""}`}
                    />
                  </button>

                  {isCityDropdownOpen && selectedState && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in duration-100">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Search city..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#f26522] text-slate-700"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar py-1">
                        {(() => {
                          const filtered = cities.filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(citySearch.toLowerCase()),
                          );
                          if (filtered.length === 0) {
                            return (
                              <div className="py-3 text-center text-xs text-slate-400">
                                No cities found for {selectedState}
                              </div>
                            );
                          }
                          return filtered.map((c) => {
                            const isSelected = selectedCity.includes(c.name);
                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => handleSelectCity(c)}
                                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-orange-50 font-bold text-[#f26522]"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-[#f26522]"
                                }`}
                              >
                                <span className="truncate">{c.name}</span>
                                {isSelected && (
                                  <Check
                                    size={13}
                                    className="text-[#f26522] shrink-0"
                                  />
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="import-registration-date"
                  className="block text-xs font-bold text-slate-700"
                >
                  Registration Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="import-registration-date"
                  type="date"
                  value={importRegistrationDate}
                  onChange={(e) => setImportRegistrationDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-all focus:border-[#f26522] focus:outline-none focus:ring-2 focus:ring-[#f26522]/20"
                />
              </div>

              {/* Sample Template Bar */}
              <div className="flex items-center justify-between bg-orange-50/60 border border-orange-200/70 rounded-xl p-3 text-xs">
                <div>
                  <div className="font-bold text-[#f26522]">
                    Need standard customer template?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Download formatted CSV template with all fields
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-3 py-1.5 bg-white border border-orange-300 text-[#f26522] hover:bg-orange-100 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileDown size={13} />
                  <span>Template</span>
                </button>
              </div>

              {/* Upload Drop Area or Selected File Preview */}
              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      validateAndSetFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    dragActive
                      ? "border-[#f26522] bg-orange-50/40"
                      : "border-slate-200 hover:border-[#f26522]/50 hover:bg-orange-50/20 bg-slate-50/40"
                  }`}
                >
                  <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Drag & Drop CSV or Excel file here
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Supports .csv, .xlsx, .xls files up to 10MB
                  </p>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs pointer-events-none"
                  >
                    <Upload size={13} />
                    <span>Browse File</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) =>
                      e.target.files && validateAndSetFile(e.target.files[0])
                    }
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Excel/CSV File
                  </label>
                  <div className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#f26522] shrink-0 border border-orange-100">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isProcessingFile}
                      onClick={() => {
                        setSelectedFile(null);
                        setFileError("");
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Change
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) =>
                      e.target.files && validateAndSetFile(e.target.files[0])
                    }
                    className="hidden"
                  />
                </div>
              )}

              {/* Error Message */}
              {fileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Processing Progress Status */}
              {isProcessingFile && (
                <div className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl flex items-center gap-2.5 text-xs text-orange-800 font-medium">
                  <Loader2
                    size={15}
                    className="animate-spin text-[#f26522] shrink-0"
                  />
                  <span>Verifying structure and validating records...</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                disabled={isProcessingFile}
                onClick={handleCancelUpload}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingFile}
                onClick={handleProcessUploadFile}
                className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isProcessingFile ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Upload File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: IMPORT REVIEW & PREVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f26522]">
                  <Info size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Import Review & Preview
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Review and verify classified records before importing into
                    Customer Database
                  </p>
                  {selectedCatName && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                      <span className="bg-orange-50 text-[#f26522] font-bold px-2 py-0.5 rounded-md border border-orange-200/80">
                        {selectedCatName} &gt; {selectedSubCatNames.join(", ")}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                        {selectedCity}, {selectedState}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelReview}
                disabled={isImporting}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-200/50 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dynamic Summary Cards */}
            <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Records */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Records
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {reviewStats.total}
                  </div>
                </div>

                {/* New */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    New (Eligible)
                  </div>
                  <div className="text-xl font-bold text-emerald-800 mt-0.5">
                    {reviewStats.newCount}
                  </div>
                </div>

                {/* Duplicate */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 shadow-2xs">
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    Duplicate (Skipped)
                  </div>
                  <div className="text-xl font-bold text-amber-800 mt-0.5">
                    {reviewStats.duplicateCount}
                  </div>
                </div>

                {/* Invalid */}
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 shadow-2xs">
                  <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                    Invalid (Skipped)
                  </div>
                  <div className="text-xl font-bold text-rose-800 mt-0.5">
                    {reviewStats.invalidCount}
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
                  Only "New" records will be imported into the database
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-auto max-h-[46vh] bg-white shadow-2xs">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Sr No
                      </th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Pincode
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reviewRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-slate-400"
                        >
                          No records found to preview.
                        </td>
                      </tr>
                    ) : (
                      reviewRecords.map((item) => (
                        <tr
                          key={item.rowNum}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="p-3 text-slate-500 font-medium">
                            {item.rowNum}
                          </td>
                          <td className="p-3 text-slate-600">
                            {item.companyName}
                          </td>
                          <td className="p-3 text-slate-600">{item.mobile}</td>
                          <td className="p-3 text-slate-600">{item.pincode}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                disabled={isImporting}
                onClick={handleCancelReview}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewStats.newCount === 0 || isImporting}
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Accept & Import ({reviewStats.newCount} New)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDatabase;
