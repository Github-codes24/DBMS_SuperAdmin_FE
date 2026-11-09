import React from 'react';

export default function PackageSuccessModal({ message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="alert-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="alert-message-text">
          {message || "Package Details send to vendor sucessfully!!"}
        </div>
        <div>
          <button className="btn-alert-ok" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
