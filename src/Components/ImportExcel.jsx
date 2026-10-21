import React from "react";
import { Upload, FileSpreadsheet, FileDown } from "lucide-react";

const ImportExcel = ({
  selectedFile,
  fileInputRef,
  validateAndSetFile,
  formatFileSize,
  onDownloadTemplate,
  setSelectedFile,
  setFileError,
  dragActive,
  setDragActive,
  isProcessingFile,
}) => {
  return (
    <div className="space-y-4">
      {/* Template Download */}
      <div className="flex items-center justify-between bg-orange-50/60 border border-orange-200/70 rounded-xl p-3">
        <div>
          <div className="font-bold text-[#f26522]">
            Need standard import template?
          </div>
          <div className="text-[11px] text-slate-500">
            Download the formatted CSV template
          </div>
        </div>

        <button
          type="button"
          onClick={onDownloadTemplate}
          className="px-3 py-1.5 bg-white cursor-pointer border border-orange-300 text-[#f26522] rounded-lg text-[11px] font-bold flex items-center gap-1"
        >
          <FileDown size={13} />
          Template
        </button>
      </div>

      {/* File Upload */}
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

            if (e.dataTransfer.files?.[0]) {
              validateAndSetFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer ${
            dragActive
              ? "border-[#f26522] bg-orange-50"
              : "border-slate-200 bg-slate-50/40"
          }`}
        >
          <Upload size={28} className="mx-auto text-slate-400 mb-2" />

          <p className="text-xs font-semibold text-slate-700 mb-1">
            Drag & Drop CSV or Excel file here
          </p>

          <p className="text-[11px] text-slate-400 mb-3">
            Supports .csv, .xlsx, .xls files up to 10MB
          </p>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f26522] text-white text-xs font-bold rounded-xl">
            <Upload size={13} />
            Browse File
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                validateAndSetFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Excel/CSV File
          </label>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileSpreadsheet size={22} className="text-[#f26522] shrink-0" />

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
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

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="px-3 py-1 text-xs text-slate-600 hover:text-red-600 cursor-pointer"
            >
              Change
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                validateAndSetFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImportExcel;
