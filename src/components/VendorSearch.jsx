import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  RefreshCw,
  Pencil,
  ShoppingCart,
  Share,
  RotateCcw,
} from "lucide-react";

export default function VendorSearch({
  vendors = [],
  loading = false,
  onSearch,
  onClear,
  onOpenEdit,
  _onOpenView,
  onOpenPaymentOrder,
  onSendPackageDetails,
  onOpenPaymentHistory,
  onOpenAddVendor,
  onRefresh,
}) {
  const [phoneSearch, setPhoneSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [minimumLoading, setMinimumLoading] = useState(false);
  const [noResultsAlertShown, setNoResultsAlertShown] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleSearch = (e) => {
    if (e) e.preventDefault();

    const queryPhone = phoneSearch.trim();
    const queryCode = codeSearch.trim();

    setPhoneError("");
    setCodeError("");

    if (!queryPhone && !queryCode) {
      setPhoneError("Please enter a search value.");
      return;
    }

    if (queryPhone && !/^\d{10}$/.test(queryPhone)) {
      setPhoneError("Please enter a valid 10-digit contact number.");
      setPopupMessage("Please enter a valid 10-digit contact number.");
      return;
    }

    if (queryCode && !/^[A-Z]{4}-\d{13}$/.test(queryCode)) {
      setCodeError("Please enter a valid Vendor Code.");
      setPopupMessage("Please enter a valid Vendor Code.");
      return;
    }

    setHasSearched(true);
    setPopupMessage("");
    setMinimumLoading(true);
    setNoResultsAlertShown(false);

    setTimeout(() => {
      setMinimumLoading(false);
    }, 2000);

    const combinedQuery = queryPhone || queryCode;

    if (onSearch) {
      onSearch(combinedQuery);
    }
  };

  const isSearching = loading || minimumLoading;

  useEffect(() => {
    if (!hasSearched || isSearching || noResultsAlertShown) {
      return;
    }

    if (vendors.length === 0) {
      setNoResultsAlertShown(true);
      setPopupMessage("No telecallers found matching your search.");
    }
  }, [hasSearched, isSearching, vendors, noResultsAlertShown]);

  const handleResetSearch = () => {
    setPhoneSearch("");
    setCodeSearch("");
    setPhoneError("");
    setCodeError("");
    setHasSearched(false);

    if (onClear) onClear();
    if (onRefresh) onRefresh();
  };

  useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `
      @keyframes vendorSearchSpin {
        to {
          transform: rotate(360deg);
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="card-panel">
      {/* Card Header matching Screenshot 1 */}
      <div className="card-header">
        <h2 className="card-title">Search Vendor</h2>
        <div className="card-header-actions">
          <button
            className="icon-action-btn"
            onClick={onOpenAddVendor}
            title="Add New Vendor"
          >
            <PlusCircle size={20} />
          </button>
          <button
            className="icon-action-btn"
            onClick={handleResetSearch}
            title="Refresh Search"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div style={{ marginBottom: "24px" }}>
        <form
          onSubmit={handleSearch}
          className="search-filter-box"
          style={{
            marginBottom: phoneError || codeError ? "8px" : "0",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          {/* Phone Number Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              inputMode="numeric"
              className="input-field"
              placeholder="Vendor Register Contact/Alt No."
              value={phoneSearch}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhoneSearch(value);
                setPhoneError("");
              }}
            />
          </div>

          {/* Vendor Code Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="input-field"
              placeholder="Vendor Code"
              value={codeSearch}
              maxLength={18}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9-]/g, "");
                setCodeSearch(value);
                setCodeError("");
              }}
            />
          </div>

          <button type="submit" className="btn-orange" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <div className="th-content">
                  <span>S.No.</span>
                  <span className="sort-icon">▲</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>Company</span>
                  <span className="sort-icon">▲</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>State</span>
                  <span className="sort-icon">▲</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>City</span>
                  <span className="sort-icon">▲</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>Address</span>
                  <span className="sort-icon">▲</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>Paid</span>
                  <span className="sort-icon">▲</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>Locality</span>
                  <span className="sort-icon">▲</span>
                </div>
              </th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isSearching ? (
              <tr>
                <td colSpan="8" className="no-data-row">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      padding: "20px 0",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        border: "4px solid #fed7aa",
                        borderTop: "4px solid #ff5500",
                        borderRadius: "50%",
                        animation: "vendorSearchSpin 0.8s linear infinite",
                      }}
                    />
                    <span>Searching telecaller</span>
                  </div>
                </td>
              </tr>
            ) : !hasSearched ? (
              /* State 1: Initial state (before any search has been performed) */
              <tr>
                <td colSpan="8" className="no-data-row">
                  Search for a telecaller to view results.
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              /* State 2: No results found (after search returned 0 records) */
              <tr>
                <td colSpan="8" className="no-data-row">
                  No telecallers found matching your search.
                </td>
              </tr>
            ) : (
              /* Display search results matching screenshots 2 & 3 */
              vendors.map((vendor, idx) => (
                <tr key={vendor.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: "600" }}>{vendor.company}</td>
                  <td>{vendor.state}</td>
                  <td>{vendor.city}</td>
                  <td style={{ maxWidth: "280px", fontStyle: "normal" }}>
                    {vendor.address}
                  </td>
                  <td>
                    <span
                      className={
                        vendor.paid === "Yes" ? "badge-yes" : "badge-no"
                      }
                    >
                      {vendor.paid}
                    </span>
                  </td>
                  <td>{vendor.locality}</td>

                  {/* Actions Column with custom styled hover tooltips */}
                  <td>
                    <div
                      className="actions-cell"
                      style={{ justifyContent: "center" }}
                    >
                      {/* Action a: Edit Button */}
                      <div className="tooltip-wrapper">
                        <button
                          className="action-btn-icon"
                          onClick={() => onOpenEdit(vendor)}
                        >
                          <Pencil size={15} />
                        </button>
                        <div className="tooltip-box">
                          Click here to edit vendor information
                        </div>
                      </div>

                      {/* Action b: Shopping Cart Icon */}
                      <div className="tooltip-wrapper">
                        <button
                          className="action-btn-icon"
                          onClick={() => onOpenPaymentOrder(vendor)}
                        >
                          <ShoppingCart size={15} />
                        </button>
                        <div className="tooltip-box">
                          Click here to send payment link
                        </div>
                      </div>

                      {/* Action c: Arrow Icon (Package Details) */}
                      <div className="tooltip-wrapper">
                        <button
                          className="action-btn-icon"
                          onClick={() => onSendPackageDetails(vendor)}
                        >
                          <Share size={15} />
                        </button>
                        <div className="tooltip-box">
                          Click here to send package details
                        </div>
                      </div>

                      {/* Action d: Anticlockwise Arrow Button (Payment History) */}
                      <div className="tooltip-wrapper">
                        <button
                          className="action-btn-icon"
                          onClick={() => onOpenPaymentHistory(vendor)}
                        >
                          <RotateCcw size={15} />
                        </button>
                        <div className="tooltip-box">
                          Click here to view payment history
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {popupMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ marginBottom: "20px", color: "#333" }}>
              {popupMessage}
            </p>

            <button
              type="button"
              className="btn-orange "
              style={{
                display: "block",
                margin: "0 auto",
              }}
              onClick={() => setPopupMessage("")}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
