import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCustomer } from "../redux/slices/customerSlice";
import api, { getDashboardApiUrl } from "../services/api";

import {
  User,
  Image as ImageIcon,
  PhoneCall,
  Tag,
  ArrowLeft,
  Save,
  CheckCircle2,
  Upload,
  Lock,
  Building2,
  Calendar,
  MapPin,
  Mail,
  FileText,
  CreditCard,
  Globe,
} from "lucide-react";
import { State, City } from "country-state-city";

function AddCustomer({ onBack, onSuccess }) {
  const dispatch = useDispatch();
  const { isSaving = false, customers = [] } = useSelector(
    (state) => state.customer || {},
  );

  const allStates = State.getStatesOfCountry("IN") || [];

  // Active Tab state
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'images' | 'contact' | 'category'

  // Image Upload state
  const [logoPreview, setLogoPreview] = useState(null);

  // Form State matching legacy Telecaller Vendor Master
  const [form, setForm] = useState({
    // Tab 1: Personal Info
    customerCode: `CUST${Math.floor(100000 + Math.random() * 900000)}`,
    regDate: new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    name: "",
    companyName: "",
    country: "India",
    state: "",
    city: "",
    locality: "",
    email: "",
    gstNumber: "",
    address: "",

    // Tab 3: Contact & Payment Info
    mobileNumber: "",
    whatsappNumber: "",
    altContactNumber: "",
    website: "N/A",
    listingType: "Not-Verified",
    isPaid: "No",
    packageAmount: "0",
    lastPaymentDate: "",
    paymentTerm: "Monthly",
    lastInvoiceNo: "N/A",
    nextPaymentDueDate: "N/A",
    activePackage: ". TP-Free",
    telecaller: "2547",

    // Tab 4: Category Details
    primaryCategory: "Electrical & Electronics Repair",
    serviceSpecialization: "",
    keywordsTags: "",
  });

  // Project states
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;
    setProjectsLoading(true);
    api
      .get(getDashboardApiUrl("/dashboard/projects"))
      .then((response) => {
        const payload = response.data;
        const projectList =
          payload?.projects || payload?.data?.projects || payload?.data;
        if (!Array.isArray(projectList)) {
          throw new Error("The projects API returned an invalid response.");
        }
        if (isCurrentRequest) {
          setProjects(projectList);
          console.log("Projects API response:", projectList);
          const ltsProject = projectList.find(
            (project) =>
              String(project.name || project.projectName || project.title || "")
                .trim()
                .toLowerCase() === "lts",
          );

          if (ltsProject) {
            const projectId =
              ltsProject.projectId || ltsProject._id || ltsProject.id;
            if (projectId) {
              setSelectedProjectId(String(projectId));
            } else {
              console.error("LTS project ID was not found:", ltsProject);
            }
          } else {
            console.error("LTS project was not found:", projectList);
          }
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setProjects([]);
          console.error(
            "Failed to load projects:",
            error.response?.data?.message || error.message,
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setProjectsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  // Category states
  const [importCategories, setImportCategories] = useState([]);
  const [importCategoriesLoading, setImportCategoriesLoading] = useState(false);
  const [importCategoriesError, setImportCategoriesError] = useState("");

  useEffect(() => {
    if (!selectedProjectId) {
      setImportCategories([]);
      return;
    }
    let isCurrentRequest = true;
    setImportCategoriesLoading(true);
    setImportCategoriesError("");
    api
      .get(
        getDashboardApiUrl(
          `/dashboard/${encodeURIComponent(selectedProjectId)}/categories`,
        ),
        { params: { limit: 100 } },
      )
      .then((response) => {
        const payload = response.data;
        const categoryList =
          payload?.categories || payload?.data?.categories || payload?.data;
        if (!Array.isArray(categoryList)) {
          throw new Error("Invalid categories API response.");
        }
        if (isCurrentRequest) {
          setImportCategories(categoryList);
          console.log("Categories API response:", categoryList);
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setImportCategories([]);
          setImportCategoriesError(
            error.response?.data?.message || error.message,
          );
          console.error("Failed to load categories:", error);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setImportCategoriesLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedProjectId]);

  // Subcategory states
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [subCategoriesError, setSubCategoriesError] = useState("");

  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedCatName, setSelectedCatName] = useState("");
  const [selectedSubCatId, setSelectedSubCatId] = useState("");
  const [selectedSubCatName, setSelectedSubCatName] = useState("");

  useEffect(() => {
    if (!selectedCatId) {
      setSubCategories([]);
      return;
    }
    let isCurrentRequest = true;
    setSubCategoriesLoading(true);
    setSubCategoriesError("");
    api
      .get(
        getDashboardApiUrl(
          `/dashboard/categories/${encodeURIComponent(selectedCatId)}/subcategories`,
        ),
        { params: { limit: 100 } },
      )
      .then((response) => {
        const payload = response.data;
        const subCategoryList =
          payload?.subcategories ||
          payload?.data?.subcategories ||
          payload?.data;
        if (!Array.isArray(subCategoryList)) {
          throw new Error("Invalid subcategories API response.");
        }
        if (isCurrentRequest) {
          setSubCategories(subCategoryList);
          console.log("Subcategories API response:", subCategoryList);
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setSubCategories([]);
          setSubCategoriesError(error.response?.data?.message || error.message);
          console.error("Failed to load subcategories:", error);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setSubCategoriesLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedCatId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (isFollowup = false) => {
    if (!form.name && !form.companyName) {
      alert("Please fill in Customer Name or Company Name.");
      return;
    }
    if (!form.mobileNumber) {
      alert("Please enter Primary Mobile Number.");
      return;
    }

    const payload = {
      _isLocal: true,
      srNo: String(customers.length + 1).padStart(2, "0"),
      id: form.customerCode,
      customerId: form.customerCode,
      name: form.name,
      companyName: form.companyName,
      customerName: form.name || form.companyName,
      vendorName: form.name,
      ownerName: form.name || form.companyName,

      mobileNumber: form.mobileNumber,
      registeredPhoneNo: form.mobileNumber,
      mobile: form.mobileNumber,
      mobileNo: form.mobileNumber,
      phone: form.mobileNumber,
      contactNo: form.mobileNumber,
      number: form.mobileNumber,

      whatsappNumber: form.whatsappNumber || form.mobileNumber,
      altContactNumber: form.altContactNumber,
      email: form.email,

      country: form.country,
      state: form.state || "Delhi",
      city: form.city || "Noida",
      locality: form.locality,
      address: form.address,
      completeAddress: form.address,
      pincode: "110001",
      gstNo: form.gstNumber,
      gstin: form.gstNumber,

      listingType: form.listingType,
      isPaid: form.isPaid,
      packageAmount: form.packageAmount,
      paymentTerm: form.paymentTerm,
      lastPaymentDate: form.lastPaymentDate,
      activePackage: form.activePackage,

      category: form.primaryCategory,
      primaryCategory: form.primaryCategory,
      serviceSpecialization: form.serviceSpecialization,
      keywordsTags: form.keywordsTags,

      telecaller: form.telecaller,
      assignedTelecaller: form.telecaller,
      status: "Active",
      regDate: new Date().toISOString().slice(0, 10),
    };

    console.log("Dispatching createCustomer with payload:", payload);

    dispatch(createCustomer(payload))
      .unwrap()
      .then(() => {
        if (isFollowup) {
          alert(
            `Vendor details updated! Added to Telecaller Follow-up List for ${form.name || form.companyName}.`,
          );
        }
        if (onSuccess) {
          onSuccess(form.name || form.companyName);
        } else if (onBack) {
          onBack();
        }
      })
      .catch((err) => {
        console.error("Failed to save customer:", err);
      });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col min-h-[600px] text-left">
      {/* Top Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Back to Customer Directory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Add / Edit Vendor & Customer
            </h2>
            <p className="text-xs text-slate-400">
              Manage customer records and telecaller sync profile
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Orange Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200/80 p-4 space-y-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "personal"
                ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <User size={18} />
            <span>Vendor Personal Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "images"
                ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ImageIcon size={18} />
            <span>Upload Images</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "contact"
                ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <PhoneCall size={18} />
            <span>Contact & Payment Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("category")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "category"
                ? "bg-[#f26522] text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Tag size={18} />
            <span>Vendor Category Details</span>
          </button>
        </div>

        {/* Right Tab Content Panel */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div>
            {/* TAB 1: VENDOR PERSONAL INFO */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Vendor Code */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Vendor Code
                    </label>
                    <input
                      type="text"
                      disabled
                      value={form.customerCode}
                      className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  {/* System Register Date */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      System Register Date
                    </label>
                    <input
                      type="text"
                      disabled
                      value={form.regDate}
                      className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Vendor Name */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Owner Aniket"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Vendor Company Name */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                      Vendor Company Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PDF Vendor Firm"
                      value={form.companyName}
                      onChange={(e) =>
                        setForm({ ...form, companyName: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Country Name */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Country Name:
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  {/* State Name */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      State Name:
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value, city: "" })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="">-- Select State --</option>
                      {allStates.map((st) => (
                        <option key={st.isoCode} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Name */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      City Name:
                    </label>
                    <select
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="">-- Select City --</option>
                      {(() => {
                        const stObj = allStates.find(
                          (s) => s.name === form.state,
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

                  {/* Locality */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Locality:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Locality / Landmark"
                      value={form.locality}
                      onChange={(e) =>
                        setForm({ ...form, locality: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Email:
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. pdf_ven_1790931891026@domain.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      GST Number:
                    </label>
                    <input
                      type="text"
                      placeholder="15 Digit GST Number"
                      value={form.gstNumber}
                      onChange={(e) =>
                        setForm({ ...form, gstNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Address Textarea */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Address:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter street, building & complete address"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD IMAGES */}
            {activeTab === "images" && (
              <div className="space-y-4 max-w-xl">
                <h3 className="text-sm font-bold text-slate-800">
                  Upload Vendor Banner & Document Photos
                </h3>

                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-orange-100 text-[#f26522] rounded-full">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload photo or drag and drop
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PNG, JPG, JPEG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {logoPreview && (
                  <div className="mt-4 p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-4">
                    <img
                      src={logoPreview}
                      alt="Uploaded Preview"
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Photo Uploaded Successfully
                      </p>
                      <button
                        type="button"
                        onClick={() => setLogoPreview(null)}
                        className="text-[11px] font-semibold text-red-500 hover:underline mt-1"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CONTACT & PAYMENT INFO */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Registered Phone No */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                      Registered Phone No. (Locked){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9866161935"
                      value={form.mobileNumber}
                      onChange={(e) =>
                        setForm({ ...form, mobileNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-slate-800"
                    />
                  </div>

                  {/* Whatsapp No */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Whatsapp No. :
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9866161935"
                      value={form.whatsappNumber}
                      onChange={(e) =>
                        setForm({ ...form, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Alternate Contact No */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Alternate Contact No.:
                    </label>
                    <input
                      type="text"
                      placeholder="Secondary contact number"
                      value={form.altContactNumber}
                      onChange={(e) =>
                        setForm({ ...form, altContactNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Website:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. N/A or https://example.com"
                      value={form.website}
                      onChange={(e) =>
                        setForm({ ...form, website: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Vendor Listing Type */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Vendor Listing Type:
                    </label>
                    <select
                      value={form.listingType}
                      onChange={(e) =>
                        setForm({ ...form, listingType: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="Not-Verified">Not-Verified</option>
                      <option value="Verified">Verified</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  {/* Is Paid Vendor */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Is Paid Vendor:
                    </label>
                    <select
                      value={form.isPaid}
                      onChange={(e) =>
                        setForm({ ...form, isPaid: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Package Paid Amount */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Package Paid Amount :
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.packageAmount}
                      onChange={(e) =>
                        setForm({ ...form, packageAmount: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Last Payment Date */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Last Payment Date:
                    </label>
                    <input
                      type="date"
                      value={form.lastPaymentDate}
                      onChange={(e) =>
                        setForm({ ...form, lastPaymentDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    />
                  </div>

                  {/* Payment Term */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Payment Term :
                    </label>
                    <select
                      value={form.paymentTerm}
                      onChange={(e) =>
                        setForm({ ...form, paymentTerm: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="One-time">One-time</option>
                    </select>
                  </div>

                  {/* Last Payment Invoice No */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Last Payment Invoice No:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. N/A"
                      value={form.lastInvoiceNo}
                      onChange={(e) =>
                        setForm({ ...form, lastInvoiceNo: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Next Payment Due Date */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Next Payment Due Date:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. N/A"
                      value={form.nextPaymentDueDate}
                      onChange={(e) =>
                        setForm({ ...form, nextPaymentDueDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                    />
                  </div>

                  {/* Active Package List */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Active Package List:
                    </label>
                    <input
                      type="text"
                      value={form.activePackage}
                      onChange={(e) =>
                        setForm({ ...form, activePackage: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-bold text-blue-600"
                    />
                  </div>

                  {/* Created By / Telecaller */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Created By / Telecaller:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={form.telecaller}
                      className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VENDOR CATEGORY DETAILS */}
            {activeTab === "category" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project Dropdown */}
                  {/* <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                      Project
                    </label>
                    <select
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      {projects.map((project) => (
                        <option
                          key={project._id}
                          value={project.projectId || project._id}
                        >
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  {/* Primary Business Category */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                      Primary Business Category:
                    </label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => {
                        const selectedCategory = importCategories.find(
                          (category) => category.categoryId === e.target.value,
                        );

                        setSelectedCatId(selectedCategory?.categoryId || "");
                        setSelectedCatName(selectedCategory?.name || "");

                        setForm((prev) => ({
                          ...prev,
                          primaryCategory: selectedCategory?.name || "",
                          serviceSpecialization: "",
                        }));

                        setSelectedSubCatId("");
                        setSelectedSubCatName("");
                        setSubCategories([]);
                      }}
                      disabled={importCategoriesLoading}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="">
                        {importCategoriesLoading
                          ? "Loading categories..."
                          : "Select Category"}
                      </option>

                      {importCategories.map((category) => (
                        <option key={category._id} value={category.categoryId}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {importCategoriesError && (
                      <p className="text-xs text-red-500 mt-1">
                        {importCategoriesError}
                      </p>
                    )}
                  </div>
                  {/* Service Specialization */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                      Service Specialization:
                    </label>
                    <select
                      value={selectedSubCatId}
                      onChange={(e) => {
                        const selectedSubCategory = subCategories.find(
                          (subcategory) =>
                            String(
                              subcategory._id ||
                                subcategory.subCategoryId ||
                                subcategory.categoryId ||
                                subcategory.id ||
                                "",
                            ) === e.target.value,
                        );

                        setSelectedSubCatId(e.target.value);
                        setSelectedSubCatName(selectedSubCategory?.name || "");

                        setForm((prev) => ({
                          ...prev,
                          serviceSpecialization:
                            selectedSubCategory?.name || "",
                        }));
                      }}
                      disabled={!selectedCatId || subCategoriesLoading}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold cursor-pointer"
                    >
                      <option value="">
                        {!selectedCatId
                          ? "Select category first"
                          : subCategoriesLoading
                            ? "Loading subcategories..."
                            : "Select Subcategory"}
                      </option>

                      {subCategories.map((subcategory) => {
                        const subcategoryId =
                          subcategory._id ||
                          subcategory.subCategoryId ||
                          subcategory.categoryId ||
                          subcategory.id;

                        return (
                          <option
                            key={subcategoryId}
                            value={String(subcategoryId)}
                          >
                            {subcategory.name}
                          </option>
                        );
                      })}
                    </select>

                    {subCategoriesError && (
                      <p className="text-xs text-red-500 mt-1">
                        {subCategoriesError}
                      </p>
                    )}
                  </div>

                  {/* Keywords / Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                      Keywords / Tags for Telecaller Search:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. fridge repair, washing machine, electrician in noida, shop no 1 sector 48"
                      value={form.keywordsTags}
                      onChange={(e) =>
                        setForm({ ...form, keywordsTags: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Right Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            {/* Purple Save Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleFormSubmit(false)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#5b52f6] hover:bg-[#4940e0] rounded-xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Save size={15} />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>

            {/* Green Save & Followup Button */}
            {/* <button
              type="button"
              disabled={isSaving}
              onClick={() => handleFormSubmit(true)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#00b074] hover:bg-[#009663] rounded-xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>{isSaving ? 'Saving...' : 'Save & Followup'}</span>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCustomer;
