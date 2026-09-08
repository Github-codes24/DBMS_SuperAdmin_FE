// Comprehensive mock data matching screenshots and reference requirements

export const INITIAL_VENDORS = [
  {
    id: 1,
    vendorCode: "VEND-000068107",
    company: "Shri Shyam Electricals And Refrigeration Repair",
    vendorName: "Devendra Singh",
    phone: "8744909050",
    alternatePhone: "9718545485",
    whatsappNo: "8744909050",
    email: "singhdevendra9050@gmail.com",
    country: "India",
    state: "Uttar Pradesh",
    city: "Noida",
    locality: "Motherhood hospital sector 48",
    address: "Shop No - 01 , Sector - 48 , Kashyap Colony , Noida , Uttar Pradesh - 201301 ( Near By Motherhood Hospital )",
    paid: "Yes",
    gstNo: "09AABCU9603R1ZM",
    systemRegisterDate: "07/09/2020",
    ivrNo: "N.A",
    website: "N/A",
    listingType: "Not-Verified",
    isPaidVendor: "Yes",
    packagePaidAmount: "2859",
    lastPaymentDate: "2025-05-12",
    paymentTerm: "Monthly",
    lastPaymentInvoiceNo: "TIPL/2025-2026/1052",
    nextPaymentDueDate: "2025-12-06",
    activePackageList: ["TP-Prime"],
    createdBy: "2547",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60", isPrimary: true, name: "Shop Board Front" },
      { id: 2, url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=60", isPrimary: false, name: "Store Interior" }
    ],
    paymentHistory: [
      { id: 1, transCode: "T326744447516", poDate: "2026-07-28", poAmt: 2312.80, invoiceCode: "N/A", invoiceDate: "N/A", status: "Pending" },
      { id: 2, transCode: "T496239355271", poDate: "2025-05-12", poAmt: 2360.00, invoiceCode: "N/A", invoiceDate: "N/A", status: "Cancel" },
      { id: 3, transCode: "T469802578504", poDate: "2025-05-12", poAmt: 2859.00, invoiceCode: "TIPL/2025-2026/1052", invoiceDate: "2025-05-12", status: "Success" },
      { id: 4, transCode: "T284964575686", poDate: "2025-05-08", poAmt: 499.00, invoiceCode: "N/A", invoiceDate: "N/A", status: "Cancel" }
    ]
  },
  {
    id: 2,
    vendorCode: "VEND-012693643",
    company: "Shona Store",
    vendorName: "Shona Merchant",
    phone: "7972391146",
    alternatePhone: "9822114455",
    whatsappNo: "7972391146",
    email: "shonastore.goa@gmail.com",
    country: "India",
    state: "Goa",
    city: "Sanquelim",
    locality: "HG",
    address: "N G P M, Sanquelim, Goa - 403505",
    paid: "No",
    gstNo: "30AAACS1234F1Z1",
    systemRegisterDate: "15/01/2023",
    ivrNo: "1800-200-1122",
    website: "www.shonastore.com",
    listingType: "Verified",
    isPaidVendor: "No",
    packagePaidAmount: "0",
    lastPaymentDate: "N/A",
    paymentTerm: "Yearly",
    lastPaymentInvoiceNo: "N/A",
    nextPaymentDueDate: "N/A",
    activePackageList: ["TP-Free"],
    createdBy: "1098",
    images: [],
    paymentHistory: [
      { id: 1, transCode: "T998811223344", poDate: "2026-06-10", poAmt: 1499.00, invoiceCode: "N/A", invoiceDate: "N/A", status: "Pending" }
    ]
  },
  {
    id: 3,
    vendorCode: "VEND-012693643",
    company: "Shona Store",
    vendorName: "Shona Merchant (Nagpur Branch)",
    phone: "7972391146",
    alternatePhone: "9822114499",
    whatsappNo: "7972391146",
    email: "shonastore.nagpur@gmail.com",
    country: "India",
    state: "Maharashtra",
    city: "Nagpur",
    locality: "HG",
    address: "N G P M, Central Avenue, Nagpur - 440002",
    paid: "No",
    gstNo: "27AAACS1234F1Z5",
    systemRegisterDate: "20/03/2024",
    ivrNo: "N.A",
    website: "N/A",
    listingType: "Not-Verified",
    isPaidVendor: "No",
    packagePaidAmount: "0",
    lastPaymentDate: "N/A",
    paymentTerm: "Monthly",
    lastPaymentInvoiceNo: "N/A",
    nextPaymentDueDate: "N/A",
    activePackageList: [],
    createdBy: "1098",
    images: [],
    paymentHistory: []
  },
  {
    id: 4,
    vendorCode: "VEND-000889210",
    company: "Apex Tech Electronics",
    vendorName: "Amit Sharma",
    phone: "9876543210",
    alternatePhone: "9876543211",
    whatsappNo: "9876543210",
    email: "contact@apextech.in",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    locality: "Nehru Place Market",
    address: "G-12, Eros Building, Nehru Place, New Delhi - 110019",
    paid: "Yes",
    gstNo: "07AAACA5555G1Z9",
    systemRegisterDate: "11/11/2021",
    ivrNo: "011-45678900",
    website: "www.apextech.in",
    listingType: "Verified",
    isPaidVendor: "Yes",
    packagePaidAmount: "4999",
    lastPaymentDate: "2026-01-10",
    paymentTerm: "Yearly",
    lastPaymentInvoiceNo: "TIPL/2025-2026/8841",
    nextPaymentDueDate: "2027-01-10",
    activePackageList: ["TP-Platinum", "Banner-Boost"],
    createdBy: "3312",
    images: [],
    paymentHistory: [
      { id: 1, transCode: "T554433221100", poDate: "2026-01-10", poAmt: 4999.00, invoiceCode: "TIPL/2025-2026/8841", invoiceDate: "2026-01-10", status: "Success" }
    ]
  }
];

export const AVAILABLE_PACKAGES = [
  { id: 1, name: "TP-Prime 1 Year", price: 2859, taxPercent: 18 },
  { id: 2, name: "TP-Gold 6 Months", price: 1800, taxPercent: 18 },
  { id: 3, name: "TP-Silver 3 Months", price: 999, taxPercent: 18 },
  { id: 4, name: "Banner Boost Add-on", price: 499, taxPercent: 18 }
];

export const DISCOUNT_OPTIONS = [
  { value: "1", label: "1%" },
  { value: "2", label: "2%" },
  { value: "3", label: "3%" },
  { value: "4", label: "4%" },
  { value: "5", label: "5%" }
];

export const INITIAL_NOTIFICATIONS_REPORT = [
  { id: 1, date: "2026-07-28", customer: "Shri Shyam Electricals And Refrigeration Repair", vendorCode: "VEND-000068107", type: "WhatsApp & SMS", notificationDetails: "Package Details: TP-Prime 1 Year sent to +91 8744909050", status: "Delivered" },
  { id: 2, date: "2026-07-26", customer: "Shri Shyam Electricals And Refrigeration Repair", vendorCode: "VEND-000068107", type: "Payment Link", notificationDetails: "RazorPay payment link of ₹2,859.00 sent via SMS", status: "Clicked" },
  { id: 3, date: "2026-07-24", customer: "Shona Store (Goa)", vendorCode: "VEND-012693643", type: "Email & WhatsApp", notificationDetails: "Package renewal alert & quotation sent to shonastore.goa@gmail.com", status: "Delivered" },
  { id: 4, date: "2026-07-15", customer: "Apex Tech Electronics", vendorCode: "VEND-000889210", type: "SMS", notificationDetails: "Payment receipt invoice TIPL/2025-2026/8841 dispatched", status: "Delivered" }
];
