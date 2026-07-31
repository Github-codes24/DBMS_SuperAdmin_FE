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
  vendors,
  onOpenEdit,
  onOpenPaymentOrder,
  onSendPackageDetails,
  onOpenPaymentHistory,
  onOpenAddVendor
}) {
  const [phoneSearch, setPhoneSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');

  const termPhone = phoneSearch.trim().toLowerCase();
  const termCode = codeSearch.trim().toLowerCase();

  const filteredVendors = vendors.filter((v) => {
    const matchPhone = termPhone
      ? (v.phone && v.phone.toLowerCase().includes(termPhone)) ||
        (v.alternatePhone && v.alternatePhone.toLowerCase().includes(termPhone)) ||
        (v.whatsappNo && v.whatsappNo.toLowerCase().includes(termPhone))
      : true;

    const matchCode = termCode
      ? v.vendorCode && v.vendorCode.toLowerCase().includes(termCode)
      : true;

    return matchPhone && matchCode;
  });

  const handleSearch = (e) => {
    if (e) e.preventDefault();
  };

  const handleResetSearch = () => {
    setPhoneSearch('');
    setCodeSearch('');
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
      <form onSubmit={handleSearch} className="search-filter-box">
        <input
          type="text"
          className="input-field"
          placeholder="Ven. Register Contact/Alt No."
          value={phoneSearch}
          onChange={(e) => setPhoneSearch(e.target.value)}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Vendor Code"
          value={codeSearch}
          onChange={(e) => setCodeSearch(e.target.value)}
        />
        <button type="submit" className="btn-orange">
          Search
        </button>
      </form>

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
                  <span>Vendor Code</span>
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
              <th style={{ textAlignment: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              /* No matching results */
              <tr>
                <td colSpan="9" className="no-data-row">
                  No vendor found matching your search criteria.
                </td>
              </tr>
            ) : (
              /* Display search results matching screenshots 2 & 3 */
              filteredVendors.map((vendor, idx) => (
                <tr key={vendor.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: '600', color: '#1e293b' }}>
                    {vendor.vendorCode}
                  </td>
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
                    <div className="actions-cell">
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
