import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api, { getDashboardApiUrl } from "../services/api";
import {
  useSearchParams,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { toast } from "react-toastify";
import { State, City } from "country-state-city";
import {
  fetchVendors,
  fetchVendorDetail,
  createVendor,
  activateVendor,
  updateVendor,
  bulkUpdateVendorStatuses,
  bulkDeleteVendors,
  deleteVendor,
  bulkImportVendors,
  fetchVendorFormFields,
  createVendorFormField,
  updateVendorFormField,
  deleteVendorFormField,
  clearSelectedVendor,
  changeVendorPassword,
} from "../redux/slices/vendorSlice";
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
  Building2,
  MapPin,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Ban,
  UserCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Save,
  Key,
} from "lucide-react";

function VendorDatabase({ compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    vendors: apiVendors = [],
    selectedVendor = null,
    loading = false,
    isSaving = false,
  } = useSelector((state) => state.vendor || {});

  // Determine current view mode based on URL route path or search params
  let activeViewMode = "table"; // 'table' | 'add-vendor' | 'view-vendor' | 'edit-vendor' | 'change-password-vendor'
  if (
    location.pathname.includes("/vendor-db/add") ||
    searchParams.get("action") === "add" ||
    searchParams.get("mode") === "add"
  ) {
    activeViewMode = "add-vendor";
  } else if (location.pathname.includes("/vendor-db/view/")) {
    activeViewMode = "view-vendor";
  } else if (location.pathname.includes("/vendor-db/edit/")) {
    activeViewMode = "edit-vendor";
  } else if (location.pathname.includes("/vendor-db/change-password/")) {
    activeViewMode = "change-password-vendor";
  }

  const allStates =
    State && typeof State.getStatesOfCountry === "function"
      ? State.getStatesOfCountry("IN")
      : [];

  // Read initial filter values from URL search params
  const initialSearch =
    searchParams.get("search") || searchParams.get("q") || "";
  const initialUrlState = searchParams.get("state") || "All";
  const initialUrlCity = searchParams.get("city") || "All";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedState, setSelectedState] = useState(initialUrlState);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialUrlCity);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("Blocked");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const selectAllVendorsRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(
    isNaN(initialPage) || initialPage < 1 ? 1 : initialPage,
  );
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Initialize availableCities based on initial state from URL
  useEffect(() => {
    if (initialUrlState && initialUrlState !== "All") {
      const stObj = allStates.find(
        (s) => s.name.toLowerCase() === initialUrlState.toLowerCase(),
      );
      if (stObj) {
        setSelectedStateCode(stObj.isoCode);
        const stateCities = City.getCitiesOfState("IN", stObj.isoCode) || [];
        setAvailableCities(stateCities);
      }
    }
  }, []);

  // Update URL helper function
  const updateUrlParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "All") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    updateUrlParams({ search: val, state: selectedState, city: selectedCity });
  };

  const handleStateFilterChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedCity("All");
    if (stateName === "All") {
      setSelectedStateCode("");
      setAvailableCities([]);
      updateUrlParams({ search: searchTerm, state: "All", city: "All" });
    } else {
      const stObj = allStates.find(
        (s) => s.name.toLowerCase() === stateName.toLowerCase(),
      );
      if (stObj) {
        setSelectedStateCode(stObj.isoCode);
        const stateCities = City.getCitiesOfState("IN", stObj.isoCode) || [];
        setAvailableCities(stateCities);
      } else {
        setAvailableCities([]);
      }
      updateUrlParams({ search: searchTerm, state: stateName, city: "All" });
    }
  };

  const handleCityFilterChange = (cityName) => {
    setSelectedCity(cityName);
    updateUrlParams({
      search: searchTerm,
      state: selectedState,
      city: cityName,
    });
  };

  // View Mode State: 'table' | 'add-vendor'
  const [viewMode, setViewMode] = useState("table");

  const handleOpenAddVendor = () => {
    setViewMode("add-vendor");
    navigate("/vendor-db/add" + location.search);
  };

  const handleCloseAddVendor = () => {
    setViewMode("table");
    if (location.pathname.includes("/vendor-db/add")) {
      navigate("/vendor-db" + location.search);
    } else if (
      searchParams.get("action") === "add" ||
      searchParams.get("mode") === "add"
    ) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      newParams.delete("mode");
      setSearchParams(newParams);
    }
  };

  // Custom Fields State
  const [customFields, setCustomFields] = useState([
    {
      id: "field-1",
      label: "GSTIN / Tax ID",
      type: "text",
      placeholder: "e.g. 27AAAAA0000A1Z5",
      required: false,
    },
    {
      id: "field-2",
      label: "Complete Business Address",
      type: "text",
      placeholder: "e.g. 102 Commerce Hub, MG Road",
      required: false,
    },
    {
      id: "field-3",
      label: "Pincode",
      type: "text",
      placeholder: "e.g. 400001",
      required: false,
    },
  ]);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    label: "",
    type: "text",
    placeholder: "",
    required: false,
  });

  // Add Vendor Form State
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newVendor, setNewVendor] = useState({
    srNo: "",
    vendorCode: "",
    id: "",
    name: "",
    ownerName: "",
    category: "",
    referId: "",
    referCode: "",
    agentName: "",
    verificationDateTime:
      new Date().toISOString().slice(0, 10) +
      " " +
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    contactNo: "",
    email: "",
    password: "",
    gstNo: "",
    address: "",
    pincode: "",
    state: "",
    city: "",
    status: "Active",
    customData: {},
  });

  // Bulk Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Export Dropdown State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Edit Vendor Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Change Password Vendor Screen State
  const [passwordVendor, setPasswordVendor] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notifyVendorEmail, setNotifyVendorEmail] = useState(true);
  const [passwordError, setPasswordError] = useState("");

  // Confirmation Popup Modal State (for Block / Delete)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'block' | 'delete'
    vendor: null,
  });

  // Role Access Check: Only Super Admin and Admin have access
  const userRole = (localStorage.getItem("userRole") || "Super Admin").trim();
  const normalizedRole = userRole.toLowerCase();
  const hasAccessPermission =
    normalizedRole === "super admin" || normalizedRole === "admin";

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const activeApiVendors = Array.isArray(apiVendors)
    ? apiVendors.filter((v) => !v.isDeleted && v.status !== "Deleted")
    : [];

  const vendors = activeApiVendors.map((v, idx) => {
    let dateOnly = "-";
    if (v.verificationDateTime) {
      const d = new Date(v.verificationDateTime);
      dateOnly = !isNaN(d.getTime())
        ? d.toISOString().slice(0, 10)
        : String(v.verificationDateTime).split(" ")[0];
    }

    const mobileNum =
      v.contactNo ||
      v.mobile ||
      v.phone ||
      v.phoneNumber ||
      v.mobileNumber ||
      "-";

    return {
      ...v,
      _id: v._id,
      srNo: v.srNo || String(idx + 1).padStart(2, "0"),
      vendorCode:
        v.vendorCode ||
        v.vendorId ||
        `VND${Math.floor(1000 + Math.random() * 9000)}`,
      id: v.vendorId || v.vendorCode || v._id,
      name: v.companyName || v.shopName || v.vendorName || "-",
      companyName: v.companyName || v.shopName || v.vendorName || "-",
      ownerName: v.ownerName || "-",
      category: v.category || "-",
      verificationDate: dateOnly,
      contactNo: mobileNum,
      mobile: mobileNum,
      email: v.email || "-",
      gstNo: v.gstin || "-",
      address: v.completeAddress || "-",
      pincode: v.pincode || "-",
      status: v.status,
      state: v.state || "-",
      city: v.city || "-",
      referId: v.referId || v.referralId || v.referrerId || "-",
      referCode: v.referCode || v.referralCode || v.refCode || "-",
      agentName: v.agentName || v.assignedAgent || v.agent || "-",
      mappedCustomers: v.mappedCustomers ?? 0,
    };
  });

  // Filter Logic
  const filteredVendors = vendors.filter((ven) => {
    const matchesSearch =
      (ven.srNo && ven.srNo.includes(searchTerm)) ||
      (ven.vendorCode &&
        ven.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ven.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ven.ownerName &&
        ven.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ven.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ven.verificationDateTime &&
        ven.verificationDateTime
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      ven.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState =
      selectedState === "All" ||
      ven.state.toLowerCase() === selectedState.toLowerCase();
    const matchesCity =
      selectedCity === "All" ||
      ven.city.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesState && matchesCity;
  });

  const getVendorSelectionId = (vendor) => String(vendor._id || "");
  const selectedFilteredVendorCount = filteredVendors.reduce(
    (count, vendor) =>
      count + (selectedVendorIds.has(getVendorSelectionId(vendor)) ? 1 : 0),
    0,
  );
  const allFilteredVendorsSelected =
    filteredVendors.length > 0 &&
    selectedFilteredVendorCount === filteredVendors.length;

  useEffect(() => {
    if (selectAllVendorsRef.current) {
      selectAllVendorsRef.current.indeterminate =
        selectedFilteredVendorCount > 0 &&
        selectedFilteredVendorCount < filteredVendors.length;
    }
  }, [selectedFilteredVendorCount, filteredVendors.length]);

  const handleToggleVendorSelection = (vendor, isSelected) => {
    const vendorId = getVendorSelectionId(vendor);
    if (!vendorId) return;

    setSelectedVendorIds((previous) => {
      const next = new Set(previous);
      if (isSelected) next.add(vendorId);
      else next.delete(vendorId);
      return next;
    });
  };

  const handleToggleFilteredVendorSelection = (isSelected) => {
    setSelectedVendorIds((previous) => {
      const next = new Set(previous);
      filteredVendors.forEach((vendor) => {
        const vendorId = getVendorSelectionId(vendor);
        if (!vendorId) return;
        if (isSelected) next.add(vendorId);
        else next.delete(vendorId);
      });
      return next;
    });
  };

  const handleBulkStatusUpdate = async () => {
    if (
      !hasAccessPermission ||
      isBulkProcessing ||
      selectedVendorIds.size === 0
    )
      return;
    const selectedVendors = vendors.filter((vendor) =>
      selectedVendorIds.has(getVendorSelectionId(vendor)),
    );
    if (selectedVendors.length > 100) {
      toast.error("You can update a maximum of 100 vendors at a time.");
      return;
    }

    setIsBulkProcessing(true);
    try {
      const response = await dispatch(
        bulkUpdateVendorStatuses(
          selectedVendors.map((vendor) => ({
            ...Object.fromEntries(
              Object.entries(vendor).filter(
                ([key]) => !/(password|token|secret)/i.test(key),
              ),
            ),
            _id: vendor._id,
            vendorId: vendor.vendorId || vendor.vendorCode || vendor.id,
            vendorCode: vendor.vendorCode || vendor.vendorId || vendor.id,
            vendorName: vendor.vendorName || vendor.companyName || vendor.name,
            companyName: vendor.companyName || vendor.name,
            contactNo: vendor.contactNo || vendor.mobile || "",
            status: bulkStatus,
          })),
        ),
      ).unwrap();
      // const result = response.data || {};
      const result = response.data?.data || response.data || {};
      const failedIds = new Set(
        (result.failures || []).map((failure) => String(failure.vendorId)),
      );
      const updatedCount =
        result.updatedCount ?? selectedVendors.length - failedIds.size;

      setSelectedVendorIds(failedIds);
      if (updatedCount > 0) {
        dispatch(fetchVendors());
        toast.success(
          response.message ||
            `${updatedCount} vendor${updatedCount === 1 ? "" : "s"} updated successfully`,
        );

        setTimeout(() => setToastMsg(""), 4000);
      }
      if (failedIds.size > 0) {
        toast.error(
          `${failedIds.size} vendor status update${failedIds.size === 1 ? "" : "s"} failed. Failed vendors remain selected.`,
        );
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to update selected vendor statuses.",
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !hasAccessPermission ||
      isBulkProcessing ||
      selectedVendorIds.size === 0
    )
      return;
    const vendorIds = Array.from(selectedVendorIds);
    if (vendorIds.length > 100) {
      toast.error("You can delete a maximum of 100 vendors at a time.");
      return;
    }

    setIsBulkProcessing(true);
    try {
      const response = await dispatch(bulkDeleteVendors(vendorIds)).unwrap();
      const result = response.data || {};
      const failedIds = new Set(
        (result.failures || []).map((failure) => String(failure.vendorId)),
      );
      const deletedCount =
        result.deletedCount ?? vendorIds.length - failedIds.size;

      setSelectedVendorIds(failedIds);
      setIsBulkDeleteConfirmOpen(false);
      if (deletedCount > 0) {
        dispatch(fetchVendors());
        setToastMsg(
          response.message ||
            `Deleted ${deletedCount} vendor${deletedCount === 1 ? "" : "s"}.`,
        );
        setTimeout(() => setToastMsg(""), 4000);
      }
      if (failedIds.size > 0) {
        toast.error(
          `${failedIds.size} vendor deletion${failedIds.size === 1 ? "" : "s"} failed. Failed vendors remain selected.`,
        );
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to delete selected vendors.",
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Calculate pagination boundaries
  const totalPages = Math.max(
    1,
    Math.ceil(filteredVendors.length / itemsPerPage),
  );
  const validCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = validCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedVendors = filteredVendors.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handlePageChange = (newPage) => {
    const pageNum = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(pageNum);
    updateUrlParams({
      search: searchTerm,
      state: selectedState,
      city: selectedCity,
      page: pageNum === 1 ? null : pageNum,
    });
  };

  // Submit Add Vendor Form

  const [vendorCategories, setVendorCategories] = useState([]);
  const [vendorCategoriesLoading, setVendorCategoriesLoading] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchCategories = async () => {
      setVendorCategoriesLoading(true);

      try {
        const response = await api.get(
          getDashboardApiUrl(
            `/dashboard/projects/${encodeURIComponent("PID-005")}/categories`,
          ),
          { params: { limit: 100 } },
        );

        const payload = response.data;
        const categoryList =
          payload?.categories || payload?.data?.categories || payload?.data;

        if (isCurrentRequest && Array.isArray(categoryList)) {
          setVendorCategories(categoryList);
        }
      } catch (error) {
        console.error(
          "Failed to fetch vendor categories:",
          error.response?.data?.message || error.message,
        );
      } finally {
        if (isCurrentRequest) {
          setVendorCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const handleAddVendorSubmit = (e) => {
    e.preventDefault();
    // if (!newVendor.name || !newVendor.category) {
    //   alert("Please fill in Vendor Name and Category");
    //   return;
    // }
    if (!newVendor.name) {
      alert("Please fill in Vendor Name");
      return;
    }

    dispatch(
      createVendor({
        srNo: newVendor.srNo || String(vendors.length + 1).padStart(2, "0"),
        vendorCode:
          newVendor.vendorCode ||
          `VND${Math.floor(1000 + Math.random() * 9000)}`,
        vendorName: newVendor.name,
        category: newVendor.category,
        referId: newVendor.referId,
        referCode: newVendor.referCode,
        agentName: newVendor.agentName,
        verificationDateTime: new Date().toISOString(),
        contactNo: newVendor.contactNo,
        email: newVendor.email,
        password: newVendor.password,
        state: newVendor.state,
        city: newVendor.city,
        status: newVendor.status,
      }),
    )
      .unwrap()
      .then((res) => {
        setShowAddPassword(false);
        handleCloseAddVendor();
        setNewVendor({
          srNo: "",
          transNo: "",
          id: "",
          name: "",
          ownerName: "",
          category: "",
          referId: "",
          referCode: "",
          agentName: "",
          verificationDateTime:
            new Date().toISOString().slice(0, 10) +
            " " +
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          contactNo: "",
          email: "",
          password: "",
          gstNo: "",
          address: "",
          pincode: "",
          state: "",
          city: "",
          status: "Active",
          customData: {},
        });
        const emailSent = res?.data?.emailSent;
        const vendorName = res?.data?.vendor?.vendorName || newVendor.name;
        if (emailSent === true) {
          setToastMsg(
            `Vendor "${vendorName}" created successfully. Login credentials have been sent to the registered email address.`,
          );
        } else if (emailSent === false) {
          setToastMsg(
            `Vendor "${vendorName}" created successfully, but the credentials email could not be sent.`,
          );
        } else {
          setToastMsg(`Vendor "${vendorName}" added successfully!`);
        }
        setTimeout(() => setToastMsg(""), 6000);
      });
  };

  const handleToggleStatus = (ven) => {
    if (!hasAccessPermission) return;
    const isActivating = ven.status !== "Active";
    const identifier = ven._id || ven.id || ven.vendorId || ven.vendorCode;

    if (isActivating) {
      dispatch(activateVendor(identifier))
        .unwrap()
        .then(() => {
          setToastMsg(
            `Vendor "${ven.name}" activated and credentials sent successfully!`,
          );
          setTimeout(() => setToastMsg(""), 4000);
        });
    } else {
      dispatch(
        updateVendor({
          vendorId: ven._id || ven.id,
          updateData: { status: "Pending" },
        }),
      )
        .unwrap()
        .then(() => {
          setToastMsg(`Status for "${ven.name}" set to Pending!`);
          setTimeout(() => setToastMsg(""), 4000);
        });
    }
  };

  // Navigation Helpers for View and Edit
  const handleViewVendor = (ven) => {
    const targetId = ven._id || ven.id;
    setSelectedVendorDetail(ven);
    navigate(`/vendor-db/view/${targetId}`);
  };

  const handleEditVendor = (ven) => {
    if (!hasAccessPermission) return;
    const targetId = ven._id || ven.id;
    setEditingVendor({
      _id: ven._id,
      id: ven.id,
      vendorCode: ven.vendorCode || ven.id || "",
      name: ven.name || "",
      ownerName: ven.ownerName !== "-" ? ven.ownerName : "",
      category: ven.category || "",
      contactNo: ven.contactNo !== "-" ? ven.contactNo : "",
      email: ven.email !== "-" ? ven.email : "",
      state: ven.state !== "-" ? ven.state : "",
      city: ven.city !== "-" ? ven.city : "",
      status: ven.status || "Active",
      gstNo: ven.gstNo !== "-" ? ven.gstNo : "",
      address: ven.address !== "-" ? ven.address : "",
      pincode: ven.pincode !== "-" ? ven.pincode : "",
    });
    navigate(`/vendor-db/edit/${targetId}`);
  };

  const handleChangePasswordVendor = (ven) => {
    if (!hasAccessPermission) return;
    const targetId = ven._id || ven.id;
    setPasswordVendor({
      _id: ven._id,
      id: ven.id,
      vendorCode: ven.vendorCode || ven.id || "",
      name: ven.name || ven.companyName || "",
      companyName: ven.name || ven.companyName || "",
      ownerName: ven.ownerName !== "-" ? ven.ownerName : "",
      category: ven.category || "",
      contactNo: ven.contactNo !== "-" ? ven.contactNo : "",
      email: ven.email !== "-" ? ven.email : "",
      state: ven.state !== "-" ? ven.state : "",
      city: ven.city !== "-" ? ven.city : "",
      status: ven.status || "Active",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    navigate(`/vendor-db/change-password/${targetId}`);
  };

  // Sync route params with selected vendor or editing vendor
  useEffect(() => {
    if (params.id && vendors.length > 0) {
      const match = vendors.find(
        (v) => v._id === params.id || v.id === params.id,
      );
      if (match) {
        if (
          activeViewMode === "view-vendor" &&
          (!selectedVendorDetail || selectedVendorDetail._id !== match._id)
        ) {
          setSelectedVendorDetail(match);
        } else if (
          activeViewMode === "edit-vendor" &&
          (!editingVendor || editingVendor._id !== match._id)
        ) {
          setEditingVendor({
            _id: match._id,
            id: match.id,
            vendorCode: match.vendorCode || match.id || "",
            name: match.name || "",
            ownerName: match.ownerName !== "-" ? match.ownerName : "",
            category: match.category || "",
            contactNo: match.contactNo !== "-" ? match.contactNo : "",
            email: match.email !== "-" ? match.email : "",
            state: match.state !== "-" ? match.state : "",
            city: match.city !== "-" ? match.city : "",
            status: match.status || "Active",
            gstNo: match.gstNo !== "-" ? match.gstNo : "",
            address: match.address !== "-" ? match.address : "",
            pincode: match.pincode !== "-" ? match.pincode : "",
          });
        } else if (
          activeViewMode === "change-password-vendor" &&
          (!passwordVendor ||
            (passwordVendor._id !== match._id &&
              passwordVendor.id !== match.id))
        ) {
          setPasswordVendor({
            _id: match._id,
            id: match.id,
            vendorCode: match.vendorCode || match.id || "",
            name: match.name || match.companyName || "",
            companyName: match.name || match.companyName || "",
            ownerName: match.ownerName !== "-" ? match.ownerName : "",
            category: match.category || "",
            contactNo: match.contactNo !== "-" ? match.contactNo : "",
            email: match.email !== "-" ? match.email : "",
            state: match.state !== "-" ? match.state : "",
            city: match.city !== "-" ? match.city : "",
            status: match.status || "Active",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }
    }
  }, [params.id, vendors, activeViewMode]);

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordVendor) return;
    setPasswordError("");

    if (!passwordVendor.newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (passwordVendor.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (passwordVendor.newPassword !== passwordVendor.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    const targetId = passwordVendor._id || passwordVendor.id;
    dispatch(
      changeVendorPassword({
        vendorId: targetId,
        password: passwordVendor.newPassword,
        notifyVendor: notifyVendorEmail,
      }),
    )
      .unwrap()
      .then(() => {
        setToastMsg(
          `Password for vendor "${passwordVendor.name}" updated successfully!`,
        );
        setTimeout(() => setToastMsg(""), 4000);
        navigate("/vendor-db");
      })
      .catch((err) => {
        setPasswordError(
          typeof err === "string" ? err : "Failed to update password.",
        );
      });
  };

  // Submit Edit Vendor Form
  const handleEditVendorSubmit = (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    // if (!editingVendor.name || !editingVendor.category) {
    //   alert("Please fill in Vendor Name and Category");
    //   return;
    // }
    if (!editingVendor.name) {
      alert("Please fill in Vendor Name");
      return;
    }

    const targetId = editingVendor._id || editingVendor.id;
    const updatePayload = {
      vendorCode: editingVendor.vendorCode,
      vendorName: editingVendor.name,
      ownerName: editingVendor.ownerName,
      category: editingVendor.category,
      contactNo: editingVendor.contactNo,
      email: editingVendor.email,
      state: editingVendor.state,
      city: editingVendor.city,
      status: editingVendor.status,
      gstin: editingVendor.gstNo,
      completeAddress: editingVendor.address,
      pincode: editingVendor.pincode,
    };

    dispatch(
      updateVendor({
        vendorId: targetId,
        updateData: updatePayload,
      }),
    )
      .unwrap()
      .then(() => {
        setIsEditModalOpen(false);
        setToastMsg(`Vendor "${editingVendor.name}" updated successfully!`);
        setTimeout(() => setToastMsg(""), 4000);
        if (
          selectedVendorDetail &&
          (selectedVendorDetail._id === targetId ||
            selectedVendorDetail.id === targetId)
        ) {
          setSelectedVendorDetail({
            ...selectedVendorDetail,
            ...editingVendor,
          });
        }
        setEditingVendor(null);
        navigate("/vendor-db");
      });
  };

  // Prompt Confirmation for Block Action
  const handlePromptBlock = (ven) => {
    if (!hasAccessPermission) return;
    setConfirmModal({
      isOpen: true,
      type: "block",
      vendor: ven,
    });
  };

  // Prompt Confirmation for Delete Action
  const handlePromptDelete = (ven) => {
    if (!hasAccessPermission) return;
    setConfirmModal({
      isOpen: true,
      type: "delete",
      vendor: ven,
    });
  };

  // Close Confirmation Modal
  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      vendor: null,
    });
  };

  // Execute Confirmed Block or Delete Action
  const handleConfirmAction = () => {
    const ven = confirmModal.vendor;
    const targetId = ven._id || ven.vendorId || ven.id;

    if (confirmModal.type === "block") {
      const newStatus = ven.status === "Blocked" ? "Active" : "Blocked";
      dispatch(
        updateVendor({
          vendorId: targetId,
          updateData: { status: newStatus },
        }),
      )
        .unwrap()
        .then((response) => {
          toast.success(response?.message || "Vendor updated successfully");
          if (
            selectedVendorDetail &&
            (selectedVendorDetail._id === targetId ||
              selectedVendorDetail.id === targetId ||
              selectedVendorDetail.vendorId === targetId)
          ) {
            setSelectedVendorDetail({
              ...selectedVendorDetail,
              status: newStatus,
            });
          }
          handleCloseConfirmModal();
        })
        .catch(() => {
          handleCloseConfirmModal();
        });
    } else if (confirmModal.type === "delete") {
      const vendorIdPayload = {
        vendorCode: ven.vendorCode || ven.vendorId || ven.id || ven._id,
        vendorId: ven.vendorCode || ven.vendorId || ven.id || ven._id,
        primaryId: ven.vendorCode || ven.vendorId || ven.id || ven._id,
        secondaryId: ven._id || ven.id,
      };
      dispatch(deleteVendor(vendorIdPayload))
        .unwrap()
        .then((res) => {
          setToastMsg(
            res?.message || `Vendor "${ven.name}" deleted successfully.`,
          );
          setTimeout(() => setToastMsg(""), 4000);
          if (
            selectedVendorDetail &&
            (selectedVendorDetail._id === targetId ||
              selectedVendorDetail.id === targetId ||
              selectedVendorDetail.vendorId === targetId)
          ) {
            setSelectedVendorDetail(null);
          }
          if (
            location.pathname.includes("/vendor-db/view/") ||
            location.pathname.includes("/vendor-db/edit/") ||
            location.pathname.includes("/vendor-db/change-password/")
          ) {
            navigate("/vendor-db" + location.search);
          }
          handleCloseConfirmModal();
        })
        .catch(() => {
          handleCloseConfirmModal();
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
      const response = await api.get("/superadmin/vendors/export/csv", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `LTS_Vendor_Database_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMsg("Vendor database exported to CSV successfully!");
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
      const response = await api.get("/superadmin/vendors/export/pdf", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      setToastMsg("Formatted Vendor PDF report generated!");
      setTimeout(() => setToastMsg(""), 3500);
    } catch (error) {
      toast.error("Failed to export PDF file.");
    }
  };

  // Download Sample Vendor CSV Import Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = [
      "Sr No",
      "Trans No",
      "ID",
      "Vendor Name",
      "Category",
      "Contact Verification Date & Time",
      "Contact No",
      "State",
      "City",
      "Status",
    ];
    const sampleRows = [
      [
        "06",
        "TRX90106",
        "VEN006",
        "Zenith Electricals",
        "Electronics",
        "2026-07-31 03:30 PM",
        "+91 98220 12345",
        "Maharashtra",
        "Pune",
        "Active",
      ],
      [
        "07",
        "TRX90107",
        "VEN007",
        "Sunrise Food Products",
        "Grocery",
        "2026-07-31 04:15 PM",
        "+91 98331 23456",
        "Gujarat",
        "Surat",
        "Pending",
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [sampleHeaders.join(","), ...sampleRows.map((r) => r.join(","))].join(
        "\n",
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Sample_Vendor_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process File Upload
  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").filter((line) => line.trim() !== "");

      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]
          .split(",")
          .map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 2) {
          parsed.push({
            srNo: cols[0] || String(vendors.length + i).padStart(2, "0"),
            transNo:
              cols[1] || `TRX${Math.floor(90000 + Math.random() * 9999)}`,
            id: cols[2] || `VEN${Math.floor(100 + Math.random() * 900)}`,
            name: cols[3] || "New Vendor",
            category: cols[4] || "General",
            verificationDateTime:
              cols[5] || new Date().toISOString().slice(0, 10) + " 10:00 AM",
            contactNo: cols[6] || "+91 98000 00000",
            state: cols[7] || "Maharashtra",
            city: cols[8] || "Mumbai",
            status: cols[9] || "Active",
          });
        }
      }

      if (parsed.length === 0) {
        setPreviewData([
          {
            srNo: "06",
            transNo: "TRX90108",
            id: "VEN101",
            name: "Precision Tools Pvt Ltd",
            category: "Hardware",
            verificationDateTime: "2026-07-31 02:00 PM",
            state: "Maharashtra",
            city: "Nagpur",
            status: "Active",
          },
          {
            srNo: "07",
            transNo: "TRX90109",
            id: "VEN102",
            name: "Apex Medical Supplies",
            category: "Medical",
            verificationDateTime: "2026-07-31 02:30 PM",
            state: "Delhi",
            city: "Delhi",
            status: "Pending",
          },
        ]);
      } else {
        setPreviewData(parsed);
      }
    };

    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleExecuteImport = () => {
    if (!uploadedFile) return;
    setIsImporting(true);

    dispatch(bulkImportVendors(uploadedFile))
      .unwrap()
      .then((res) => {
        setIsUploadModalOpen(false);
        setUploadedFile(null);
        setPreviewData([]);
        setToastMsg(res.message || "Import completed successfully");
        setTimeout(() => setToastMsg(""), 4000);
      })
      .finally(() => {
        setIsImporting(false);
      });
  };

  // Dedicated Full-Page Add Vendor Screen
  if (viewMode === "add-vendor" || activeViewMode === "add-vendor") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseAddVendor}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>← Back to Vendor Directory</span>
            </button>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UserPlus size={18} className="text-[#f26522]" />
              <span>Add New Vendor Record</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomFieldModalOpen(true)}
              className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f26522] border border-orange-200/80 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={15} />
              <span>+ Add Custom Field</span>
            </button>
          </div>
        </div>

        {/* Full Page Add Vendor Form */}
        <form onSubmit={handleAddVendorSubmit} className="space-y-6">
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Primary Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Traders Pvt Ltd"
                  value={newVendor.name}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              {/* Category section commented out */}
              {/* <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={newVendor.category}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, category: e.target.value })
                  }
                  disabled={vendorCategoriesLoading}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                >
                  <option value="">
                    {vendorCategoriesLoading
                      ? "Loading categories..."
                      : "-- Select Category --"}
                  </option>

                  {vendorCategories.map((category) => (
                    <option
                      key={category._id || category.categoryId}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div> */}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  VENDOR CODE
                </label>
                <input
                  type="text"
                  placeholder="e.g. VEN941539"
                  value={newVendor.vendorCode}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, vendorCode: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newVendor.contactNo}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, contactNo: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. vendor@example.com"
                  value={newVendor.email}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={newVendor.state}
                  onChange={(e) =>
                    setNewVendor({
                      ...newVendor,
                      state: e.target.value,
                      city: "",
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
                >
                  <option value="">-- Select State --</option>
                  {allStates.map((st) => (
                    <option key={st.isoCode} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>
                <select
                  value={newVendor.city}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, city: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 cursor-pointer"
                >
                  <option value="">-- Select City --</option>
                  {(() => {
                    const stObj = allStates.find(
                      (s) => s.name === newVendor.state,
                    );
                    const cityList = stObj
                      ? City.getCitiesOfState("IN", stObj.isoCode) || []
                      : [];
                    return cityList.map((ct) => (
                      <option key={ct.name} value={ct.name}>
                        {ct.name}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={newVendor.status}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    placeholder="Enter vendor login password"
                    value={newVendor.password}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, password: e.target.value })
                    }
                    className="w-full px-3.5 py-2 pr-8 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Verification Date{" "}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-07-31"
                  value={newVendor.verificationDateTime}
                  onChange={(e) =>
                    setNewVendor({
                      ...newVendor,
                      verificationDateTime: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                />
              </div>
            </div>
          </div>

          {/* Custom Form Fields Section */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#f26522] uppercase tracking-wider">
                  Custom Dynamic Form Fields
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  User configured input fields created dynamically
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomFieldModalOpen(true)}
                className="px-3 py-1.5 bg-orange-100 hover:bg-[#f26522] text-[#f26522] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} />
                <span>+ Add Field</span>
              </button>
            </div>

            {customFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((cf) => (
                  <div
                    key={cf.id}
                    className={
                      cf.type === "textarea" ? "md:col-span-2" : "col-span-1"
                    }
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {cf.label}{" "}
                        {cf.required && (
                          <span className="text-rose-500">*</span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomFields(
                            customFields.filter((f) => f.id !== cf.id),
                          )
                        }
                        className="text-[11px] text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                      >
                        ✕ Remove Field
                      </button>
                    </div>
                    {cf.type === "textarea" ? (
                      <textarea
                        rows={3}
                        required={cf.required}
                        placeholder={cf.placeholder || `Enter ${cf.label}`}
                        value={newVendor.customData?.[cf.id] || ""}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            customData: {
                              ...newVendor.customData,
                              [cf.id]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 resize-none"
                      />
                    ) : cf.type === "dropdown" ? (
                      <select
                        required={cf.required}
                        value={newVendor.customData?.[cf.id] || ""}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            customData: {
                              ...newVendor.customData,
                              [cf.id]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      >
                        <option value="">-- Select {cf.label} --</option>
                        {cf.options &&
                          cf.options.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    ) : cf.type === "checkbox" ? (
                      <label className="flex items-center gap-2 py-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!newVendor.customData?.[cf.id]}
                          onChange={(e) =>
                            setNewVendor({
                              ...newVendor,
                              customData: {
                                ...newVendor.customData,
                                [cf.id]: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-300 text-[#f26522] focus:ring-[#f26522]"
                        />
                        <span>Enable {cf.label}</span>
                      </label>
                    ) : (
                      <input
                        type={cf.type || "text"}
                        required={cf.required}
                        placeholder={cf.placeholder || `Enter ${cf.label}`}
                        value={newVendor.customData?.[cf.id] || ""}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            customData: {
                              ...newVendor.customData,
                              [cf.id]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <p className="text-xs text-slate-500 font-medium">
                  No custom fields created yet.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCustomFieldModalOpen(true)}
                  className="mt-2 text-xs font-extrabold text-[#f26522] hover:underline cursor-pointer"
                >
                  Click here to create a custom field
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseAddVendor}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={15} />
              <span>{isSaving ? "Saving..." : "Save Vendor Record"}</span>
            </button>
          </div>
        </form>

        {/* CREATE CUSTOM FIELD BUILDER MODAL */}
        {isCustomFieldModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-[#f26522]" />
                  <h3 className="text-xs font-bold text-white">
                    Create Custom Form Input Field
                  </h3>
                </div>
                <button
                  onClick={() => setIsCustomFieldModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCustomField.label.trim()) return;
                  const fieldId = "custom_" + Date.now();
                  const parsedOptions = newCustomField.options
                    ? newCustomField.options
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean)
                    : [];
                  setCustomFields([
                    ...customFields,
                    {
                      id: fieldId,
                      label: newCustomField.label.trim(),
                      type: newCustomField.type || "text",
                      placeholder: newCustomField.placeholder
                        ? newCustomField.placeholder.trim()
                        : "",
                      options: parsedOptions,
                      required: newCustomField.required,
                    },
                  ]);
                  setNewCustomField({
                    label: "",
                    type: "text",
                    placeholder: "",
                    options: "",
                    required: false,
                  });
                  setIsCustomFieldModalOpen(false);
                  setToastMsg(
                    `Custom field "${newCustomField.label}" added to Vendor form!`,
                  );
                  setTimeout(() => setToastMsg(""), 4000);
                }}
                className="p-5 space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Field Label Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trade License Number / Bank Account No"
                    value={newCustomField.label}
                    onChange={(e) =>
                      setNewCustomField({
                        ...newCustomField,
                        label: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Input Field Type
                    </label>
                    <select
                      value={newCustomField.type}
                      onChange={(e) =>
                        setNewCustomField({
                          ...newCustomField,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                    >
                      <option value="text">Short Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="date">Date</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="checkbox">Checkbox Toggle</option>
                      <option value="textarea">Long Text Area</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Field Constraint
                    </label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={newCustomField.required}
                        onChange={(e) =>
                          setNewCustomField({
                            ...newCustomField,
                            required: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-[#f26522] focus:ring-[#f26522]"
                      />
                      <span>Required Field</span>
                    </label>
                  </div>
                </div>

                {newCustomField.type === "dropdown" ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Dropdown Options (comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Category A, Category B, Category C"
                      value={newCustomField.options || ""}
                      onChange={(e) =>
                        setNewCustomField({
                          ...newCustomField,
                          options: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Placeholder Guidance Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enter registered trade license..."
                      value={newCustomField.placeholder}
                      onChange={(e) =>
                        setNewCustomField({
                          ...newCustomField,
                          placeholder: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCustomFieldModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Custom Field</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dedicated Full-Page Change Password Screen ⭐
  if (activeViewMode === "change-password-vendor") {
    const ven =
      passwordVendor ||
      selectedVendorDetail ||
      vendors.find((v) => v._id === params.id || v.id === params.id);
    if (!ven) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <p className="text-sm font-bold text-slate-600">
            Vendor record not found.
          </p>
          <button
            onClick={() => navigate("/vendor-db")}
            className="px-4 py-2 bg-[#f26522] text-white text-xs font-bold rounded-xl"
          >
            Back to Directory
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor-db")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Vendor Directory</span>
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Key size={18} className="text-[#f26522]" />
                <span>Change Password — {ven.name || ven.companyName}</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                VENDOR CODE:{" "}
                <span className="font-extrabold text-[#f26522]">
                  {ven.vendorCode || ven.id}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Summary Card */}
        <div className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f26522]/10 border border-[#f26522]/20 flex items-center justify-center text-[#f26522] font-black text-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {ven.name || ven.companyName}
              </h3>
              <p className="text-xs text-slate-500">
                {ven.email || "No email provided"} •{" "}
                {ven.contactNo || "No phone"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700">
              Category:{" "}
              <span className="text-[#f26522]">{ven.category || "N/A"}</span>
            </span>
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${
                ven.status === "Active"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : ven.status === "Blocked"
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
              }`}
            >
              {ven.status || "Active"}
            </span>
          </div>
        </div>

        {/* Password Form */}
        <form
          onSubmit={handleChangePasswordSubmit}
          className="max-w-xl space-y-5 bg-slate-50/60 p-6 rounded-2xl border border-slate-200/80"
        >
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200/60">
            <Lock size={15} className="text-[#f26522]" />
            <span>Set New Account Password</span>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-rose-500" />
              <span>{passwordError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="Enter new password (min. 6 characters)"
                value={passwordVendor?.newPassword || ""}
                onChange={(e) =>
                  setPasswordVendor({
                    ...passwordVendor,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 pr-10 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Re-enter new password to confirm"
                value={passwordVendor?.confirmPassword || ""}
                onChange={(e) =>
                  setPasswordVendor({
                    ...passwordVendor,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 pr-10 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordVendor?.confirmPassword &&
              passwordVendor?.newPassword !==
                passwordVendor?.confirmPassword && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  Passwords do not match
                </p>
              )}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={notifyVendorEmail}
                onChange={(e) => setNotifyVendorEmail(e.target.checked)}
                className="rounded border-slate-300 text-[#f26522] focus:ring-[#f26522]"
              />
              <span>
                Send notification & updated credentials email to vendor (
                {ven.email || "registered email"})
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => navigate("/vendor-db")}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Key size={15} />
              <span>
                {isSaving ? "Updating Password..." : "Update Vendor Password"}
              </span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Dedicated Full-Page View Vendor Screen ⭐
  if (activeViewMode === "view-vendor") {
    const ven =
      selectedVendorDetail ||
      vendors.find((v) => v._id === params.id || v.id === params.id);
    if (!ven) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <p className="text-sm font-bold text-slate-600">
            Vendor record not found.
          </p>
          <button
            onClick={() => navigate("/vendor-db")}
            className="px-4 py-2 bg-[#f26522] text-white text-xs font-bold rounded-xl"
          >
            Back to Directory
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor-db")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Vendor Directory</span>
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 size={20} className="text-[#f26522]" />
                <span>{ven.name || ven.companyName}</span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                    ven.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : ven.status === "Blocked"
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : "bg-amber-50 text-amber-600 border-amber-200"
                  }`}
                >
                  {ven.status || "Active"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                VENDOR CODE:{" "}
                <span className="font-extrabold text-[#f26522]">
                  {ven.vendorCode || ven.id}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleChangePasswordVendor(ven)}
              className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Key size={14} />
              <span>Change Password</span>
            </button>
            <button
              onClick={() => handleEditVendor(ven)}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 size={14} />
              <span>Edit Vendor Details</span>
            </button>
            {hasAccessPermission && (
              <button
                onClick={() => handlePromptDelete(ven)}
                className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Vendor</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Profile */}
          <div className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-[#f26522] tracking-wider flex items-center gap-2">
              <Building2 size={15} />
              <span>Business & Owner Profile</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  Company Name
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {ven.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  Owner Name
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {ven.ownerName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  Category
                </span>
                <span className="font-extrabold text-[#f26522]">
                  {ven.category}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  GSTIN / Tax ID
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {ven.gstNo || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <MapPin size={15} className="text-[#f26522]" />
              <span>Location & Address Details</span>
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  State
                </span>
                <span className="font-extrabold text-slate-900">
                  {ven.state}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  City
                </span>
                <span className="font-extrabold text-slate-900">
                  {ven.city}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  Pincode
                </span>
                <span className="font-mono font-extrabold text-[#f26522]">
                  {ven.pincode || "N/A"}
                </span>
              </div>
              <div className="col-span-3 pt-1 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  Complete Address
                </span>
                <span className="font-semibold text-slate-800">
                  {ven.address || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Phone size={15} className="text-[#f26522]" />
              <span>Contact Information</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  Mobile Number
                </span>
                <span className="font-extrabold text-slate-900">
                  {ven.contactNo || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  Email Address
                </span>
                <span className="font-bold text-slate-900 truncate block">
                  {ven.email || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Referral & Operations */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-[#f26522] tracking-wider">
              System & Operations Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Assigned Agent
                </span>
                <span className="font-extrabold text-slate-100">
                  {ven.agentName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Verification Date
                </span>
                <span className="font-bold text-slate-200">
                  {ven.verificationDate || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Referral Code
                </span>
                <span className="font-mono font-bold text-[#f26522]">
                  {ven.referCode || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Mapped Customers
                </span>
                <span className="font-extrabold text-emerald-400">
                  {ven.mappedCustomers || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Full-Page Edit Vendor Screen ⭐
  if (activeViewMode === "edit-vendor") {
    if (!editingVendor) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <p className="text-sm font-bold text-slate-600">
            Loading vendor details for edit...
          </p>
          <button
            onClick={() => navigate("/vendor-db")}
            className="px-4 py-2 bg-[#f26522] text-white text-xs font-bold rounded-xl"
          >
            Back to Directory
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor-db")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Directory</span>
            </button>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Edit2 size={18} className="text-[#f26522]" />
              <span>Edit Vendor Details — {editingVendor.name}</span>
            </h2>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleEditVendorSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vendor / Company Name *
              </label>
              <input
                type="text"
                required
                value={editingVendor.name}
                onChange={(e) =>
                  setEditingVendor({ ...editingVendor, name: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner Name
              </label>
              <input
                type="text"
                value={editingVendor.ownerName}
                onChange={(e) =>
                  setEditingVendor({
                    ...editingVendor,
                    ownerName: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>

            {/* Category section commented out */}
            {/* <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={editingVendor.category}
                onChange={(e) =>
                  setEditingVendor({
                    ...editingVendor,
                    category: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div> */}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                VENDOR CODE
              </label>
              <input
                type="text"
                value={editingVendor.vendorCode}
                onChange={(e) =>
                  setEditingVendor({
                    ...editingVendor,
                    vendorCode: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={editingVendor.contactNo}
                onChange={(e) =>
                  setEditingVendor({
                    ...editingVendor,
                    contactNo: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={editingVendor.email}
                onChange={(e) =>
                  setEditingVendor({ ...editingVendor, email: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State
              </label>
              <select
                value={editingVendor.state}
                onChange={(e) =>
                  setEditingVendor({
                    ...editingVendor,
                    state: e.target.value,
                    city: "",
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              >
                <option value="">-- Select State --</option>
                {allStates.map((st) => (
                  <option key={st.isoCode} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City
              </label>
              <select
                value={editingVendor.city}
                onChange={(e) =>
                  setEditingVendor({ ...editingVendor, city: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              >
                <option value="">-- Select City --</option>
                {(() => {
                  const stObj = allStates.find(
                    (s) => s.name === editingVendor.state,
                  );
                  const cityList = stObj
                    ? City.getCitiesOfState("IN", stObj.isoCode) || []
                    : [];
                  return cityList.map((ct) => (
                    <option key={ct.name} value={ct.name}>
                      {ct.name}
                    </option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={editingVendor.gstNo}
                onChange={(e) =>
                  setEditingVendor({ ...editingVendor, gstNo: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={editingVendor.status}
                onChange={(e) =>
                  setEditingVendor({ ...editingVendor, status: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={editingVendor.pincode}
                onChange={(e) =>
                  setEditingVendor({
                    ...editingVendor,
                    pincode: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Complete Address
              </label>
              <input
                type="text"
                value={editingVendor.address}
                onChange={(e) =>
                  setEditingVendor({
                    ...editingVendor,
                    address: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/vendor-db")}
              className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={15} />
              <span>
                {isSaving ? "Saving Changes..." : "Save Vendor Changes"}
              </span>
            </button>
          </div>
        </form>

        {/* Confirmation Modal inside edit view */}
        {confirmModal.isOpen && confirmModal.vendor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {confirmModal.type === "delete"
                  ? "Delete Vendor"
                  : confirmModal.vendor.status === "Blocked"
                    ? "Unblock Vendor"
                    : "Block Vendor"}
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to proceed with this action?
              </p>
              {/* Vendor Info Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left text-xs mb-5 space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Vendor ID:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {confirmModal.vendor.vendorCode || confirmModal.vendor.id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="font-semibold text-slate-700">
                    {confirmModal.vendor.category}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">
                    Current Status:
                  </span>
                  <span className="font-bold text-slate-800">
                    {confirmModal.vendor.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
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
                      : confirmModal.vendor.status === "Blocked"
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
                  ) : confirmModal.vendor.status === "Blocked" ? (
                    <>
                      <UserCheck size={14} />
                      <span>Yes, Unblock</span>
                    </>
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
        )}
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
              Vendor Database
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vendor Master Directory, Verification Trails & Sliding View
            </p>
          </div>

          {/* Action Buttons: Add Vendor */}
          {hasAccessPermission ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add Vendor Button */}
              <button
                onClick={handleOpenAddVendor}
                className="px-3.5 py-1.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Add New Vendor Record"
              >
                <UserPlus size={14} />
                <span>+ Add Vendor</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
              <Lock size={13} className="text-slate-400 shrink-0" />
              <span>Full Access restricted to Super Admin & Admin</span>
            </div>
          )}
        </div>

        {/* Search & State/City Filter Bar ⭐ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="relative sm:col-span-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search vendor, sr no, trans no, category, verification date, city..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* State Filter Dropdown using country-state-city ⭐ */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => handleStateFilterChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="All">State: All States (India)</option>
              {allStates.map((st) => (
                <option key={st.isoCode} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter Dropdown ⭐ */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => handleCityFilterChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="All">City: All Cities</option>
              {availableCities.map((ct) => (
                <option key={ct.name} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="mb-3 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {hasAccessPermission && selectedVendorIds.size > 0 && (
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-2">
            <div className="text-xs font-semibold text-slate-700">
              {selectedVendorIds.size} vendor
              {selectedVendorIds.size === 1 ? "" : "s"} selected
              <span className="ml-1 font-medium text-slate-500">
                · Selection persists across pages and filters
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="bulk-vendor-status"
                className="text-xs font-semibold text-slate-600"
              >
                Set status:
              </label>
              <select
                id="bulk-vendor-status"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                disabled={isBulkProcessing}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
              <button
                type="button"
                onClick={handleBulkStatusUpdate}
                disabled={isBulkProcessing || isSaving}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBulkProcessing ? "Processing..." : "Update status"}
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
                disabled={isBulkProcessing || isSaving}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={13} />
                Delete selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedVendorIds(new Set())}
                disabled={isBulkProcessing}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        <div className="h-fit max-h-[520px] overflow-x-auto overflow-y-auto rounded-xl border border-slate-100 mb-4 scroll-smooth custom-scrollbar transition-all duration-200">
          <table className="w-full min-w-[1290px] text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                {hasAccessPermission && (
                  <th className="w-10 py-2.5 px-3 text-center">
                    <input
                      ref={selectAllVendorsRef}
                      type="checkbox"
                      aria-label="Select all filtered vendors across pages"
                      title="Select all filtered vendors across pages"
                      checked={allFilteredVendorsSelected}
                      onChange={(e) =>
                        handleToggleFilteredVendorSelection(e.target.checked)
                      }
                      disabled={
                        isBulkProcessing || filteredVendors.length === 0
                      }
                      className="h-4 w-4 cursor-pointer accent-[#f26522] disabled:cursor-not-allowed"
                    />
                  </th>
                )}
                <th className="py-2.5 px-3">SR. NO.</th>
                <th className="py-2.5 px-3">VENDOR CODE</th>
                <th className="py-2.5 px-3">COMPANY NAME</th>
                <th className="py-2.5 px-3">MOBILE NUMBER</th>
                <th className="py-2.5 px-3">VERIFICATION DATE</th>
                <th className="py-2.5 px-3">STATE</th>
                <th className="py-2.5 px-3">CITY</th>
                <th className="py-2.5 px-3">REFER. ID</th>
                <th className="py-2.5 px-3">REFER CODE</th>
                <th className="py-2.5 px-3">AGENT NAME</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {currentDisplayedVendors.length > 0 ? (
                currentDisplayedVendors.map((ven, idx) => {
                  const globalIdx = indexOfFirstItem + idx + 1;
                  return (
                    <tr
                      key={ven.id || ven._id || idx}
                      className={`transition-colors ${selectedVendorIds.has(getVendorSelectionId(ven)) ? "bg-orange-50/50" : "hover:bg-slate-50/60"}`}
                    >
                      {hasAccessPermission && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Select ${ven.companyName || ven.name}`}
                            checked={selectedVendorIds.has(
                              getVendorSelectionId(ven),
                            )}
                            onChange={(e) =>
                              handleToggleVendorSelection(ven, e.target.checked)
                            }
                            disabled={
                              isBulkProcessing || !getVendorSelectionId(ven)
                            }
                            className="h-4 w-4 cursor-pointer accent-[#f26522] disabled:cursor-not-allowed"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {String(globalIdx).padStart(2, "0")}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#f26522] font-mono text-[11px]">
                        {ven.vendorCode || ven.id}
                      </td>

                      {/* Clickable Company Name ⭐ */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleViewVendor(ven)}
                          disabled={isBulkProcessing}
                          className="text-[#f26522] hover:text-[#e05411] font-black text-xs hover:underline flex items-center gap-1.5 cursor-pointer bg-orange-50/70 px-2 py-1 rounded-lg border border-orange-200/60 shadow-2xs"
                        >
                          <Building2
                            size={13}
                            className="shrink-0 text-[#f26522]"
                          />
                          <span>{ven.companyName || ven.name}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-semibold">
                        {ven.contactNo || ven.mobile || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px] font-medium">
                        {ven.verificationDate || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {ven.state}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {ven.city}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {ven.referId || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {ven.referCode || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-semibold">
                        {ven.agentName || "-"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold text-xs px-2.5 py-0.5 rounded-full border inline-block ${
                            ven.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : ven.status === "Blocked"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                        >
                          {ven.status}
                        </span>
                      </td>

                      {/* Actions Column: View, Edit, Block, Delete */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Action */}
                          <button
                            type="button"
                            onClick={() => handleViewVendor(ven)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Edit Action */}
                          <button
                            type="button"
                            onClick={() => handleEditVendor(ven)}
                            disabled={isBulkProcessing}
                            title="Edit Vendor"
                            className="p-1.5 rounded-lg text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Change Password Action */}
                          <button
                            type="button"
                            onClick={() => handleChangePasswordVendor(ven)}
                            disabled={isBulkProcessing}
                            title="Change Password"
                            className="p-1.5 rounded-lg text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <Key size={13} />
                          </button>

                          {/* Block / Unblock Action */}
                          <button
                            type="button"
                            onClick={() => handlePromptBlock(ven)}
                            disabled={isBulkProcessing}
                            title={
                              ven.status === "Blocked"
                                ? "Unblock Vendor"
                                : "Block Vendor"
                            }
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              ven.status === "Blocked"
                                ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                : "text-amber-600 border-amber-200 hover:bg-amber-50"
                            }`}
                          >
                            {ven.status === "Blocked" ? (
                              <UserCheck size={13} />
                            ) : (
                              <Ban size={13} />
                            )}
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handlePromptDelete(ven)}
                            disabled={isBulkProcessing}
                            title="Delete Vendor"
                            className="p-1.5 rounded-lg text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={hasAccessPermission ? 13 : 12}
                    className="py-6 text-center text-xs text-slate-400"
                  >
                    No vendor records found matching search criteria.
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
              {filteredVendors.length > 0 ? indexOfFirstItem + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-800">
              {Math.min(indexOfLastItem, filteredVendors.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-800">{filteredVendors.length}</strong>{" "}
            vendors
          </span>
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                handlePageChange(1);
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
            onClick={() => handlePageChange(validCurrentPage - 1)}
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
                  onClick={() => handlePageChange(pageNum)}
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
            disabled={validCurrentPage >= totalPages}
            onClick={() => handlePageChange(validCurrentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* BULK CSV / EXCEL UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#f26522]" />
                <h3 className="text-xs font-bold text-slate-800">
                  Bulk Vendor CSV / Excel Import
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Sample Template Bar */}
              <div className="flex items-center justify-between bg-orange-50/60 border border-orange-200/70 rounded-xl p-3 text-xs">
                <div>
                  <div className="font-bold text-[#f26522]">
                    Need standard vendor template?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Download formatted CSV template with Sr No & Trans No
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

              {/* Upload Drop Area */}
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
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive
                    ? "border-[#f26522] bg-orange-50/40"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                }`}
              >
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Drag & Drop CSV or Excel file here
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Supports .csv, .xlsx files up to 10MB
                </p>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".csv, .xlsx"
                    onChange={(e) =>
                      e.target.files && handleFileSelect(e.target.files[0])
                    }
                    className="hidden"
                  />
                </label>

                {uploadedFile && (
                  <div className="mt-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block">
                    ✓ File Selected: {uploadedFile.name}
                  </div>
                )}
              </div>

              {/* Import Preview */}
              {previewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Preview Data ({previewData.length} records ready)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Validated
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="p-2">Sr No</th>
                          <th className="p-2">Trans No</th>
                          <th className="p-2">Vendor</th>
                          <th className="p-2">Verification Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {previewData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold">
                              {row.srNo || String(idx + 1).padStart(2, "0")}
                            </td>
                            <td className="p-2 font-bold text-[#f26522]">
                              {row.transNo || row.id}
                            </td>
                            <td className="p-2">{row.name}</td>
                            <td className="p-2 text-slate-500">
                              {row.verificationDateTime}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={previewData.length === 0 || isImporting}
                onClick={handleExecuteImport}
                className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isImporting ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Import {previewData.length} Vendors</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Popup Modal for Block / Delete in Table View */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete selected vendors?
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  This will permanently remove {selectedVendorIds.size} selected
                  vendor{selectedVendorIds.size === 1 ? "" : "s"} from the
                  active directory. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteConfirmOpen(false)}
                  disabled={isBulkProcessing}
                  className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkProcessing || selectedVendorIds.size === 0}
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

      {confirmModal.isOpen && confirmModal.vendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              {confirmModal.type === "delete"
                ? "Delete Vendor"
                : confirmModal.vendor.status === "Blocked"
                  ? "Unblock Vendor"
                  : "Block Vendor"}
            </h3>
            <p className="text-xs text-slate-500">
              {confirmModal.type === "delete"
                ? `Are you sure you want to delete vendor "${confirmModal.vendor.name}"? This action cannot be undone.`
                : `Are you sure you want to proceed with this action for "${confirmModal.vendor.name}"?`}
            </p>

            {/* Vendor Info Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left text-xs mb-5 space-y-1.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Vendor Code:</span>
                <span className="font-mono font-bold text-slate-700">
                  {confirmModal.vendor.vendorCode || confirmModal.vendor.id}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">
                  Company Name:
                </span>
                <span className="font-semibold text-slate-700">
                  {confirmModal.vendor.name || confirmModal.vendor.companyName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Category:</span>
                <span className="font-semibold text-slate-700">
                  {confirmModal.vendor.category}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">
                  Current Status:
                </span>
                <span className="font-bold text-slate-800">
                  {confirmModal.vendor.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
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
                    : confirmModal.vendor.status === "Blocked"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {isSaving ? (
                  <span>Processing...</span>
                ) : confirmModal.type === "delete" ? (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete Vendor</span>
                  </>
                ) : confirmModal.vendor.status === "Blocked" ? (
                  <>
                    <UserCheck size={14} />
                    <span>Yes, Unblock</span>
                  </>
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
      )}
    </div>
  );
}

export default VendorDatabase;
