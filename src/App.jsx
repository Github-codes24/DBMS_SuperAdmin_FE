import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  loginSuccess,
  logout as reduxLogout,
  fetchProfile,
  updateProfile,
} from "./redux/slices/authSlice";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LoginPage from "./components/LoginPage";
import VendorSearch from "./components/VendorSearch";
import EditVendorModal from "./components/EditVendorModal";
import CreatePaymentOrderModal from "./components/CreatePaymentOrderModal";
import PaymentHistoryModal from "./components/PaymentHistoryModal";
import PackageSuccessModal from "./components/PackageSuccessModal";
import AddVendorModal from "./components/AddVendorModal";
import NotificationReport from "./components/NotificationReport";
import ProfileSection from "./components/ProfileSection";
import { INITIAL_VENDORS } from "./mockData";

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export default function App() {
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    token,
    user: currentUser,
  } = useSelector((state) => state.auth);

  const [activeNav, setActiveNav] = useState("vendor_mgmt");
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorsError, setVendorsError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [modalState, setModalState] = useState("none"); // 'none' | 'edit' | 'paymentOrder' | 'paymentHistory' | 'packageSuccess' | 'addVendor'
  const [successMessage, setSuccessMessage] = useState("");

  const fetchVendors = async (searchQuery = "") => {
    const term = (
      typeof searchQuery === "string" ? searchQuery : searchQuery?.query || ""
    )
      .trim()
      .toLowerCase();
    if (!term) {
      setVendors([]);
      return;
    }

    const activeToken = token || localStorage.getItem("lts_telecaller_token");

    setLoadingVendors(true);
    setVendorsError(null);

    if (!activeToken || activeToken === "mock-token") {
      // In mock/demo mode, filter from INITIAL_VENDORS by search term
      const matched = INITIAL_VENDORS.filter((v) => {
        return (
          (v.phone && v.phone.toLowerCase().includes(term)) ||
          (v.alternatePhone && v.alternatePhone.toLowerCase().includes(term)) ||
          (v.whatsappNo && v.whatsappNo.toLowerCase().includes(term)) ||
          (v.vendorCode && v.vendorCode.toLowerCase().includes(term)) ||
          (v.company && v.company.toLowerCase().includes(term)) ||
          (v.vendorName && v.vendorName.toLowerCase().includes(term)) ||
          (v.city && v.city.toLowerCase().includes(term))
        );
      });
      setVendors(matched);
      setLoadingVendors(false);
      return;
    }

    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const headers = {
        Authorization: `Bearer ${activeToken}`,
      };
      const response = await fetch(
        `${baseUrl}/api/telecaller/vendors?search=${encodeURIComponent(term)}`,
        {
          method: "GET",
          headers,
        },
      );
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to fetch vendors");
      }

      let apiVendors = [];
      if (resData.data) {
        if (Array.isArray(resData.data)) {
          apiVendors = resData.data;
        } else if (Array.isArray(resData.data.data)) {
          apiVendors = resData.data.data;
        }
      }

      const mappedVendors = apiVendors.map((createdVendor) => ({
        id: createdVendor._id,
        vendorCode:
          createdVendor.vendorCode ||
          createdVendor.vendorId ||
          createdVendor.customerId ||
          "",
        company: createdVendor.companyName || "",
        vendorName: createdVendor.vendorName || createdVendor.fullName || "",
        phone:
          createdVendor.registeredPhoneNo || createdVendor.mobileNumber || "",
        alternatePhone:
          createdVendor.alternateContactNo ||
          createdVendor.alternatePhone ||
          "",
        whatsappNo: createdVendor.whatsapp || createdVendor.mobileNumber || "",
        email: createdVendor.email || "",
        state: createdVendor.state || "",
        city: createdVendor.city || "",
        locality: createdVendor.locality || "",
        address: createdVendor.address || createdVendor.fullAddress || "",
        paid: createdVendor.isPaidVendor ? "Yes" : "No",
        gstNo: createdVendor.gstNo || "",
        systemRegisterDate: createdVendor.createdAt
          ? new Date(createdVendor.createdAt).toLocaleDateString("en-GB")
          : new Date().toLocaleDateString("en-GB"),
        activePackageList: ["TP-Free"],
        createdBy: "2547",
        paymentHistory: [],
        images: (createdVendor.images || []).map((img, idx) => {
          const rawUrl =
            img.url || img.image || (typeof img === "string" ? img : "");
          return {
            id: img._id || idx,
            url: resolveImageUrl(rawUrl),
            isPrimary: img.isPrimary || false,
            name: img.name || `Image ${idx + 1}`,
          };
        }),
      }));

      const finalVendors = mappedVendors.filter(
        (v) =>
          (v.phone && v.phone.toLowerCase().includes(term)) ||
          (v.alternatePhone && v.alternatePhone.toLowerCase().includes(term)) ||
          (v.whatsappNo && v.whatsappNo.toLowerCase().includes(term)) ||
          (v.vendorCode && v.vendorCode.toLowerCase().includes(term)) ||
          (v.company && v.company.toLowerCase().includes(term)) ||
          (v.vendorName && v.vendorName.toLowerCase().includes(term)) ||
          (v.city && v.city.toLowerCase().includes(term)),
      );

      setVendors(finalVendors);
    } catch (err) {
      console.error(err);
      setVendorsError(err.message || "Server error occurred");
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch latest profile from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, dispatch]);

  // Handle Login
  const handleLogin = (user) => {
    dispatch(loginSuccess({ user, token: "mock-token" }));
  };

  // Handle Logout
  const handleLogout = () => {
    dispatch(reduxLogout());
  };

  // Update Profile details via API
  const handleUpdateUser = (updatedProfile) => {
    dispatch(updateProfile(updatedProfile));
  };

  // Open Vendor Modal (Edit or View Details)
  const handleOpenVendorModal = async (vendor, isView = false) => {
    setSelectedVendor(vendor);
    setIsViewOnly(isView);
    setModalState("edit");

    const activeToken = token || localStorage.getItem("lts_telecaller_token");
    if (!activeToken || activeToken === "mock-token") {
      return;
    }

    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const headers = {
        Authorization: `Bearer ${activeToken}`,
      };
      const response = await fetch(
        `${baseUrl}/api/telecaller/vendors/${vendor.id}`,
        {
          method: "GET",
          headers,
        },
      );
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to fetch vendor details");
      }

      const createdVendor = resData.data;
      if (createdVendor) {
        const mappedVendor = {
          id: createdVendor._id,
          vendorCode: createdVendor.vendorId,
          // company: createdVendor.storeName || '',
          company: createdVendor.companyName || createdVendor.storeName || "",
          vendorName: createdVendor.fullName || "",
          // phone: createdVendor.phone || '',
          phone: createdVendor.mobileNumber || createdVendor.phone || "",
          alternatePhone: createdVendor.alternatePhone || "",
          // whatsappNo: createdVendor.whatsapp || createdVendor.phone || '',
          whatsappNo:
            createdVendor.whatsapp ||
            createdVendor.mobileNumber ||
            createdVendor.phone ||
            "",
          email: createdVendor.email || "",
          state: createdVendor.state || "Uttar Pradesh",
          city: createdVendor.city || "Noida",
          locality: createdVendor.locality || "",
          address: createdVendor.address || createdVendor.fullAddress || "",
          paid: createdVendor.isPaidVendor ? "Yes" : "No",
          gstNo: createdVendor.gstNo || "",
          systemRegisterDate: createdVendor.createdAt
            ? new Date(createdVendor.createdAt).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
          activePackageList: ["TP-Free"],
          createdBy: "2547",
          paymentHistory: [],
          images: (createdVendor.images || []).map((img, idx) => {
            const rawUrl =
              img.url || img.image || (typeof img === "string" ? img : "");
            return {
              id: img._id || idx,
              url: resolveImageUrl(rawUrl),
              isPrimary: img.isPrimary || false,
              name: img.name || `Image ${idx + 1}`,
            };
          }),
        };
        setSelectedVendor(mappedVendor);
        setVendors((prev) =>
          prev.map((v) => (v.id === mappedVendor.id ? mappedVendor : v)),
        );
      }
    } catch (err) {
      console.error("Failed to fetch individual vendor details:", err);
    }
  };

  const handleOpenEdit = (vendor) => handleOpenVendorModal(vendor, false);
  const handleOpenView = (vendor) => handleOpenVendorModal(vendor, true);

  // Save Edit Vendor Modal
  const handleSaveVendor = (updatedVendor, shouldFollowUp) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)),
    );
    setModalState("none");
    if (shouldFollowUp) {
      alert(
        `Vendor details updated! Added to Telecaller Follow-up List for ${updatedVendor.vendorName}.`,
      );
      //      setSuccessMessage( `Vendor details updated! Added to Telecaller Follow-up List for ${updatedVendor.vendorName}.` );
      // setModalState('packageSuccess');
    }
  };

  // Open Create Payment Order Modal
  const handleOpenPaymentOrder = (vendor) => {
    setSelectedVendor(vendor);
    setModalState("paymentOrder");
  };

  // Dispatch Payment Link and record in Vendor Payment History

  const handleSendPaymentLink = async ({
    vendor,
    gateway,
    totalAmount,
    targetPhone,
    item,
    selectedItems,
    items,
  }) => {
    const plansToProcess =
      selectedItems || (items ? items : item ? [item] : []);
    if (plansToProcess.length === 0) return;

    try {
      // API 1: Create Order
      const selectedPlan = plansToProcess[0];
      console.log("Selected Plan Object:", selectedPlan);

      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/telecaller/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("lts_telecaller_token")}`,
          },
          body: JSON.stringify({
            vendorId: vendor.id,
            planId: "PLAN_GOLD_6M",
            gateway: "Razorpay",
          }),
        },
      );

      const orderData = await orderResponse.json().catch(() => ({}));
      console.log("Create Order API Response:", orderData);

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Create Order API failed");
      }

      // Order ID response se nikaalna
      const orderId =
        orderData.data?.orderId ||
        orderData.objId ||
        orderData.order?._id ||
        orderData.orderId ||
        orderData.data?._id;

      if (!orderId) {
        console.error("Order ID response:", orderData);
        throw new Error(
          "Order ID response mein nahi mila. Console check karo.",
        );
      }

      // API 2: Send Payment Link
      const linkResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/telecaller/payment/send-link/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("lts_telecaller_token")}`,
          },
          body: JSON.stringify({
            channel: "WHATSAPP",
            customerName: vendor.company || vendor.name || "Customer",
          }),
        },
      );

      const linkData = await linkResponse.json().catch(() => ({}));
      console.log("Send Payment Link API Response:", linkData);

      if (!linkResponse.ok) {
        throw new Error(linkData.message || "Send Payment Link API failed");
      }

      setModalState("none");
      alert(
        "Payment link API call successful. Console mein response check karo.",
      );
    } catch (error) {
      console.error("Payment API Error:", error);
      alert(error.message || "Payment API request failed");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Build history entries for each successfully sent plan record
    const newHistoryEntries = plansToProcess.map((plan) => ({
      id: `PH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentOrderId: `PO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentItemId: plan.id,
      transCode: `T${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      paymentLinkId: `plink_${Math.random().toString(36).substring(2, 12)}`,
      vendorId: vendor.id,
      vendorCode: vendor.vendorCode,
      planId: plan.planId,
      durationId: plan.durationId,
      planName: plan.planName,
      productName: plan.productName,
      duration: plan.duration,
      durationInMonths: plan.durationInMonths,
      durationLabel: plan.durationLabel,
      unitPrice: plan.unitPrice,
      discountPercent: plan.discountPercent,
      taxPercent: plan.taxPercent,
      poAmt: plan.total,
      totalAmount: plan.total,
      poDate: todayStr,
      invoiceCode: "N/A",
      invoiceDate: "N/A",
      status: "Payment Link Sent",
      gateway: gateway || "RazorPay",
      targetPhone: targetPhone,
      createdAt: new Date().toISOString(),
    }));

    // Update vendor's payment history without creating duplicates
    const currentHistory = Array.isArray(vendor.paymentHistory)
      ? [...vendor.paymentHistory]
      : [];

    newHistoryEntries.forEach((entry) => {
      const existingIdx = currentHistory.findIndex(
        (h) =>
          (h.paymentItemId && h.paymentItemId === entry.paymentItemId) ||
          (h.planId &&
            h.durationId &&
            h.planId === entry.planId &&
            h.durationId === entry.durationId &&
            h.status === "Payment Link Sent"),
      );

      if (existingIdx !== -1) {
        currentHistory[existingIdx] = {
          ...currentHistory[existingIdx],
          ...entry,
          id: currentHistory[existingIdx].id,
          updatedAt: new Date().toISOString(),
        };
      } else {
        currentHistory.unshift(entry);
      }
    });

    const updatedVendor = {
      ...vendor,
      paymentHistory: currentHistory,
      lastPaymentDate: todayStr,
    };

    // Update selectedVendor so opening PaymentHistoryModal displays the new records immediately
    setSelectedVendor(updatedVendor);

    // Update vendors array state
    setVendors((prevVendors) =>
      prevVendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)),
    );

    // Also update INITIAL_VENDORS for mock mode persistence
    const mockVendorIdx = INITIAL_VENDORS.findIndex(
      (v) => v.id === updatedVendor.id,
    );
    if (mockVendorIdx !== -1) {
      INITIAL_VENDORS[mockVendorIdx] = {
        ...INITIAL_VENDORS[mockVendorIdx],
        paymentHistory: currentHistory,
        lastPaymentDate: todayStr,
      };
    }

    let pkgDesc = "";
    if (plansToProcess.length === 1) {
      pkgDesc = `for ${plansToProcess[0].productName || plansToProcess[0].planName} `;
    } else if (plansToProcess.length > 1) {
      const planNames = plansToProcess
        .map((p) => p.planName || p.productName)
        .join(", ");
      pkgDesc = `for ${plansToProcess.length} packages (${planNames}) `;
    }

    setSuccessMessage(
      `Payment link of ₹${Number(totalAmount).toFixed(2)} ${pkgDesc}(${gateway}) sent successfully to ${vendor.company} on ${targetPhone}!`,
    );
    setModalState("packageSuccess");
  };

  // Open Payment History Modal
  const handleOpenPaymentHistory = (vendor) => {
    // Pick the most up-to-date vendor from state (or fallback to vendor param)
    const currentVendor = vendors.find((v) => v.id === vendor.id) || vendor;
    setSelectedVendor(currentVendor);
    setModalState("paymentHistory");
  };

  // Send Package Details Action (Arrow icon ↗️)
  const handleSendPackageDetails = (vendor) => {
    setSelectedVendor(vendor);
    setSuccessMessage("Package Details send to vendor sucessfully!!");
    setModalState("packageSuccess");
  };

  // Add New Vendor
  const handleAddVendor = (newVendor) => {
    setVendors([newVendor, ...vendors]);
    setModalState("none");
    setSuccessMessage(
      `New vendor ${newVendor.company} (${newVendor.vendorCode}) created successfully!`,
    );
    setModalState("packageSuccess");
  };

  // If user is not logged in, render Login Page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="crm-app">
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveNav("profile")}
      />

      {/* Main Layout Body (Sidebar + Content) */}
      <div className="crm-body">
        {/* Sidebar Navigation */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="main-content">
          {activeNav === "vendor_mgmt" && (
            <>
              {loadingVendors && (
                <div
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    borderRadius: "6px",
                    marginBottom: "15px",
                    fontSize: "14px",
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  Loading vendors from server...
                </div>
              )}
              {vendorsError && (
                <div
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fca5a5",
                    color: "#b91c1c",
                    borderRadius: "6px",
                    marginBottom: "15px",
                    fontSize: "14px",
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  Error loading vendors: {vendorsError}
                </div>
              )}
              <VendorSearch
                vendors={vendors}
                loading={loadingVendors}
                onSearch={fetchVendors}
                onClear={() => setVendors([])}
                onOpenEdit={handleOpenEdit}
                onOpenView={handleOpenView}
                onOpenPaymentOrder={handleOpenPaymentOrder}
                onSendPackageDetails={handleSendPackageDetails}
                onOpenPaymentHistory={handleOpenPaymentHistory}
                onOpenAddVendor={() => setModalState("addVendor")}
                onRefresh={() => setVendors([])}
              />
            </>
          )}

          {activeNav === "reports" && <NotificationReport vendors={vendors} />}

          {activeNav === "profile" && (
            <ProfileSection
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {activeNav !== "vendor_mgmt" &&
            activeNav !== "reports" &&
            activeNav !== "profile" && (
              <div
                className="card-panel"
                style={{ textAlign: "center", padding: "60px 20px" }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    color: "#ff5500",
                    marginBottom: "10px",
                  }}
                >
                  {activeNav.toUpperCase().replace("_", " ")}
                </h2>
                <p style={{ color: "#64748b" }}>
                  Select <strong>Vendor Management</strong>,{" "}
                  <strong>Report</strong>, or <strong>My Profile</strong> from
                  sidebar.
                </p>
              </div>
            )}
        </main>
      </div>

      {/* Modals Orchestration */}
      {modalState === "edit" && selectedVendor && (
        <EditVendorModal
          vendor={selectedVendor}
          isViewOnly={isViewOnly}
          onClose={() => setModalState("none")}
          onSave={handleSaveVendor}
        />
      )}

      {modalState === "paymentOrder" && selectedVendor && (
        <CreatePaymentOrderModal
          vendor={selectedVendor}
          onClose={() => setModalState("none")}
          onSendPaymentLink={handleSendPaymentLink}
        />
      )}

      {modalState === "paymentHistory" && selectedVendor && (
        <PaymentHistoryModal
          vendor={selectedVendor}
          onClose={() => setModalState("none")}
        />
      )}

      {modalState === "packageSuccess" && (
        <PackageSuccessModal
          message={successMessage}
          onClose={() => setModalState("none")}
        />
      )}

      {modalState === "addVendor" && (
        <AddVendorModal
          onClose={() => setModalState("none")}
          onAdd={handleAddVendor}
        />
      )}
    </div>
  );
}
