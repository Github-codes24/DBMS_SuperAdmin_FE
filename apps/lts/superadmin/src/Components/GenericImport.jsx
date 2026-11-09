import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  FileDown,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Loader2,
} from "lucide-react";

const GenericImport = ({
  buttonLabel = "Import",
  title = "Import Excel",
  description = "Upload your Excel file to import data.",
  reviewTitle = "Import Review & Preview",
  templateFileName = "Import_Template.csv",
  columns = [],
  templateRows = [],
  customFields = [],
  existingRecords = [],
  uniqueBy = [],
  validateRecord,
  isDuplicate,
  onImport,
  maxFileSizeMB = 10,
  accept = ".csv,.xlsx,.xls",
  onComplete,
}) => {
  const fileInputRef = useRef(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [records, setRecords] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});

  const normalizedColumns = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        key: column.key || column.label,
        label: column.label || column.key,
        required: Boolean(column.required),
        aliases: column.aliases || [],
      })),
    [columns],
  );

  const counts = useMemo(
    () => ({
      total: records.length,
      new: records.filter((record) => record.status === "New").length,
      duplicate: records.filter((record) => record.status === "Duplicate")
        .length,
      invalid: records.filter((record) => record.status === "Invalid").length,
    }),
    [records],
  );

  // Import is allowed only when every uploaded row is NEW.
  const canImport =
    records.length > 0 &&
    counts.new === records.length &&
    counts.duplicate === 0 &&
    counts.invalid === 0 &&
    !isImporting;

  const resetImport = () => {
    setSelectedFile(null);
    setFileError("");
    setDragActive(false);
    setIsProcessingFile(false);
    setIsImporting(false);
    setRecords([]);
    setPreviewColumns([]);
    setCustomFieldValues({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeAllModals = () => {
    if (isImporting || isProcessingFile) return;
    setIsImportModalOpen(false);
    setIsReviewModalOpen(false);
    resetImport();
  };

  const normalizeHeader = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

  const normalizeValue = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const extensionIsValid = /\.(csv|xlsx|xls)$/i.test(file.name);
    if (!extensionIsValid) {
      setFileError("Please select a CSV or Excel file (.csv, .xlsx, .xls).");
      return;
    }

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setFileError(`File size must be ${maxFileSizeMB}MB or less.`);
      return;
    }

    setFileError("");
    setSelectedFile(file);
    if (fileInputRef.current) {
      // Allow selecting the same file again after changing it.
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const headers = normalizedColumns.map((column) => column.label);
    const rows =
      templateRows.length > 0
        ? templateRows.map((row) =>
            normalizedColumns.map((column) => row[column.key] ?? ""),
          )
        : [];

    const csvCell = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = templateFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const getColumnForHeader = (header) => {
    const normalizedHeader = normalizeHeader(header);
    return normalizedColumns.find((column) => {
      const names = [column.label, column.key, ...column.aliases];
      return names.some((name) => normalizeHeader(name) === normalizedHeader);
    });
  };

  const classifyRow = async (sourceRow, rowNumber, seenUploadKeys) => {
    const mappedRow = {};
    const missingHeaders = [];

    // Keep original uploaded fields available for the preview and custom
    // project callbacks, even when the uploaded column names differ.
    Object.entries(sourceRow).forEach(([header, value]) => {
      const matchedColumn = getColumnForHeader(header);
      if (matchedColumn) mappedRow[matchedColumn.key] = value;
    });

    normalizedColumns.forEach((column) => {
      if (
        column.required &&
        (mappedRow[column.key] === undefined ||
          String(mappedRow[column.key] ?? "").trim() === "")
      ) {
        missingHeaders.push(column.label);
      }
    });

    let status = "New";
    let message = "";

    if (missingHeaders.length > 0) {
      status = "Invalid";
      message = `Missing required value(s): ${missingHeaders.join(", ")}`;
    } else if (typeof validateRecord === "function") {
      try {
        const validationResult = await validateRecord(mappedRow, {
          rowNumber,
          sourceRow,
          customFields: customFieldValues,
        });

        if (validationResult === false) {
          status = "Invalid";
          message = "Record did not pass validation.";
        } else if (typeof validationResult === "string" && validationResult) {
          status = "Invalid";
          message = validationResult;
        } else if (
          validationResult &&
          typeof validationResult === "object" &&
          validationResult.valid === false
        ) {
          status = "Invalid";
          message =
            validationResult.message || "Record did not pass validation.";
        }
      } catch (error) {
        status = "Invalid";
        message = error?.message || "Record validation failed.";
      }
    }

    if (status === "New") {
      let duplicate = false;

      if (typeof isDuplicate === "function") {
        try {
          duplicate = Boolean(
            await isDuplicate(mappedRow, {
              rowNumber,
              sourceRow,
              existingRecords,
              customFields: customFieldValues,
            }),
          );
        } catch (error) {
          status = "Invalid";
          message = error?.message || "Duplicate check failed.";
        }
      } else if (uniqueBy.length > 0) {
        const matches = (candidate) =>
          uniqueBy.every((key) => {
            const left = mappedRow[key];
            const right = candidate?.[key];
            return (
              normalizeValue(left) !== "" &&
              normalizeValue(left) === normalizeValue(right)
            );
          });

        duplicate =
          existingRecords.some(matches) ||
          seenUploadKeys.some((previous) => matches(previous));
      }

      if (status === "New" && duplicate) {
        status = "Duplicate";
        message = "This record already exists.";
      }
    }

    if (status === "New") seenUploadKeys.push(mappedRow);

    return {
      id: `${Date.now()}-${rowNumber}-${Math.random().toString(36).slice(2, 7)}`,
      rowNumber,
      status,
      message,
      data: mappedRow,
      rawData: sourceRow,
    };
  };

  const handleProcessUploadFile = async () => {
    if (!selectedFile) {
      setFileError("Please select a file first.");
      return;
    }

    const missingCustomField = customFields.find(
      (field) =>
        field.required &&
        String(
          customFieldValues[field.key] ?? field.defaultValue ?? "",
        ).trim() === "",
    );

    if (missingCustomField) {
      setFileError(`${missingCustomField.label} is required.`);
      return;
    }

    setIsProcessingFile(true);
    setFileError("");

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        setFileError("The selected file does not contain a worksheet.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });

      if (jsonRows.length === 0) {
        setFileError("The selected file has no data rows.");
        return;
      }

      const headers = Object.keys(jsonRows[0] || {});
      setPreviewColumns(headers);

      const seenUploadKeys = [];
      const classifiedRecords = [];

      for (let index = 0; index < jsonRows.length; index += 1) {
        classifiedRecords.push(
          await classifyRow(jsonRows[index], index + 2, seenUploadKeys),
        );
      }

      setRecords(classifiedRecords);
      setIsImportModalOpen(false);
      setIsReviewModalOpen(true);
    } catch (error) {
      setFileError(
        error?.message ||
          "Unable to read this file. Please check it and try again.",
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleAcceptImport = async () => {
    if (!canImport || typeof onImport !== "function") return;

    setIsImporting(true);
    try {
      const newRecords = records.map((record) => record.data);
      await onImport(newRecords, {
        records,
        customFields: customFieldValues,
        file: selectedFile,
      });

      setIsReviewModalOpen(false);
      setIsImportModalOpen(false);
      resetImport();
      if (typeof onComplete === "function") onComplete(newRecords);
    } catch (error) {
      // Keep the review modal open so the user can retry after the API issue
      // is resolved. Parent can also show its own toast/message.
      setFileError(error?.message || "Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const openImportModal = () => {
    resetImport();
    setIsImportModalOpen(true);
  };

  const renderCustomField = (field) => {
    const value = customFieldValues[field.key] ?? field.defaultValue ?? "";

    const commonClass =
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#f26522]";

    return (
      <div key={field.key} className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>

        {field.type === "select" ? (
          <select
            value={value}
            onChange={(event) =>
              setCustomFieldValues((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }
            className={commonClass}
            required={field.required}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {(field.options || []).map((option) => {
              const optionValue =
                typeof option === "object" ? option.value : option;
              const optionLabel =
                typeof option === "object" ? option.label : option;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type={field.type === "number" ? "number" : "text"}
            value={value}
            placeholder={field.placeholder || `Enter ${field.label}`}
            onChange={(event) =>
              setCustomFieldValues((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }
            className={commonClass}
            required={field.required}
          />
        )}
      </div>
    );
  };
  return (
    <>
      <button
        type="button"
        onClick={openImportModal}
        className="inline-flex items-center gap-2 rounded-lg border border-[#f26522] bg-white px-4 py-2 text-xs font-bold text-[#f26522] transition cursor-pointer"
      >
        <Upload size={14} />
        {buttonLabel}
      </button>
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-3">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              </div>
              <button
                type="button"
                onClick={closeAllModals}
                disabled={isProcessingFile}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close import modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="flex items-center justify-between rounded-xl border border-orange-200/70 bg-orange-50/60 p-3">
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
                  onClick={downloadTemplate}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-[11px] font-bold text-[#f26522]"
                >
                  <FileDown size={13} />
                  Template
                </button>
              </div>

              {customFields.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {customFields.map(renderCustomField)}
                </div>
              )}
              {!selectedFile ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    if (event.dataTransfer.files?.[0]) {
                      validateAndSetFile(event.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center ${
                    dragActive
                      ? "border-[#f26522] bg-orange-50"
                      : "border-slate-200 bg-slate-50/40"
                  }`}
                >
                  <Upload size={28} className="mx-auto mb-2 text-slate-400" />
                  <p className="mb-1 text-xs font-semibold text-slate-700">
                    Drag & Drop CSV or Excel file here
                  </p>
                  <p className="mb-3 text-[11px] text-slate-400">
                    Supports .csv, .xlsx, .xls files up to {maxFileSizeMB}MB
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#f26522] px-4 py-2 text-xs font-bold text-white">
                    <Upload size={13} />
                    Browse File
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      if (event.target.files?.[0]) {
                        validateAndSetFile(event.target.files[0]);
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
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileSpreadsheet
                        size={22}
                        className="shrink-0 text-[#f26522]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
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
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="cursor-pointer px-3 py-1 text-xs text-slate-600 hover:text-red-600 disabled:opacity-50"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
              {fileError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeAllModals}
                disabled={isProcessingFile}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessUploadFile}
                disabled={!selectedFile || isProcessingFile}
                className="inline-flex items-center gap-2 rounded-lg bg-[#f26522] px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessingFile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {isProcessingFile ? "Processing..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {reviewTitle}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Review and verify records before importing.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAllModals}
                disabled={isImporting}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close review modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-6 py-3.5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Total Records",
                    value: counts.total,
                    className: "bg-white border-slate-200 text-slate-900",
                    labelClass: "text-slate-500",
                  },
                  {
                    label: "New (Eligible)",
                    value: counts.new,
                    className:
                      "bg-emerald-50/60 border-emerald-200/80 text-emerald-800",
                    labelClass: "text-emerald-700",
                  },
                  {
                    label: "Duplicate (Skipped)",
                    value: counts.duplicate,
                    className:
                      "bg-amber-50/60 border-amber-200/80 text-amber-800",
                    labelClass: "text-amber-700",
                  },
                  {
                    label: "Invalid (Skipped)",
                    value: counts.invalid,
                    className: "bg-rose-50/60 border-rose-200/80 text-rose-800",
                    labelClass: "text-rose-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-3 shadow-sm ${item.className}`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wider ${item.labelClass}`}
                    >
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {fileError && (
              <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-auto px-5 pb-4">
              <div className="max-h-[46vh] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">
                    <tr>
                      {previewColumns.map((column) => (
                        <th
                          key={column}
                          className="p-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600"
                        >
                          {column}
                        </th>
                      ))}
                      {counts.new > 0 && counts.duplicate > 0 && (
                        <th className="p-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Status
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/70">
                        {previewColumns.map((column) => (
                          <td
                            key={column}
                            className="max-w-[240px] truncate p-3 text-xs text-slate-700"
                          >
                            {String(record.rawData?.[column] ?? "")}
                          </td>
                        ))}
                        {counts.new > 0 && counts.duplicate > 0 && (
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                                record.status === "New"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {record.status === "New" ? (
                                <CheckCircle2 size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                              {record.status}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {records.length > 0 &&
                (counts.duplicate > 0 || counts.invalid > 0) && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>
                      Accept & Import is disabled because every row must be New.
                      Fix or remove Duplicate/Invalid rows, then upload the
                      corrected file.
                    </span>
                  </div>
                )}
            </div>
            <div className="flex shrink-0 flex-wrap justify-between gap-2 border-t border-slate-100 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (isImporting) return;
                  setIsReviewModalOpen(false);
                  setIsImportModalOpen(true);
                  setFileError("");
                }}
                disabled={isImporting}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  disabled={isImporting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAcceptImport}
                  disabled={!canImport || typeof onImport !== "function"}
                  title={
                    typeof onImport !== "function"
                      ? "Pass an onImport callback to connect this component to the project's save API."
                      : !canImport
                        ? "All rows must be New to import."
                        : "Import new records"
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f26522] px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isImporting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {isImporting ? "Importing..." : "Accept & Import"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenericImport;
