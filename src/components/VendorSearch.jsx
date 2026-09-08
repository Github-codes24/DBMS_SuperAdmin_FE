import React, { useState } from 'react';
import {
  PlusCircle,
  RefreshCw,
  Pencil,
  ShoppingCart,
  Share,
  RotateCcw
} from 'lucide-react';

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
  onRefresh
}) {
  const [phoneSearch, setPhoneSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const queryPhone = phoneSearch.trim();
    const queryCode = codeSearch.trim();

    if (!queryPhone && !queryCode) {
      setValidationError('Please enter a search value.');
      return;
    }

    setValidationError('');
    setHasSearched(true);
    const combinedQuery = queryPhone || queryCode;
    if (onSearch) {
      onSearch(combinedQuery);
    }
  };

  const handleResetSearch = () => {
    setPhoneSearch('');
    setCodeSearch('');
    setValidationError('');
    setHasSearched(false);
    if (onClear) onClear();
    if (onRefresh) onRefresh();
  };


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
      <div style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearch} className="search-filter-box" style={{ marginBottom: validationError ? '8px' : '0' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Ven. Register Contact/Alt No."
            value={phoneSearch}
            onChange={(e) => {
              setPhoneSearch(e.target.value);
              if (validationError) setValidationError('');
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Vendor Code"
            value={codeSearch}
            onChange={(e) => {
              setCodeSearch(e.target.value);
              if (validationError) setValidationError('');
            }}
          />
          <button type="submit" className="btn-orange" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {validationError && (
          <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600', paddingLeft: '12px' }}>
            {validationError}
          </div>
        )}
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
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="no-data-row">
                  Searching records...
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
                  <td style={{ fontWeight: '600' }}>{vendor.company}</td>
                  <td>{vendor.state}</td>
                  <td>{vendor.city}</td>
                  <td style={{ maxWidth: '280px', fontStyle: 'normal' }}>
                    {vendor.address}
                  </td>
                  <td>
                    <span
                      className={
                        vendor.paid === 'Yes' ? 'badge-yes' : 'badge-no'
                      }
                    >
                      {vendor.paid}
                    </span>
                  </td>
                  <td>{vendor.locality}</td>

                  {/* Actions Column with custom styled hover tooltips */}
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'center' }}>
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
    </div>
  );
}
