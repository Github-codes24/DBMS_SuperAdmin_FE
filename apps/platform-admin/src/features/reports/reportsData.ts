export type ReportCategory = 'Customer' | 'Vendor' | 'User' | 'Telecaller' | 'Activity'
export type ReportStatus = 'Completed' | 'Processing' | 'Failed'
export type RecordStatus = 'Active' | 'Inactive' | 'Pending' | 'Approved' | 'Rejected'

export interface ReportRecord {
  id: string
  name: string
  type: ReportCategory
  generatedDate: string
  records: number
  generatedBy: string
  status: ReportStatus
  summary: string
}

export interface ReportSourceRecord {
  id: string
  category: ReportCategory
  status: RecordStatus
  date: string
}

export const reportTypes = [
  'Customer Report',
  'Vendor Report',
  'User Report',
  'Telecaller Report',
  'Activity Report',
] as const

export type ReportType = (typeof reportTypes)[number]

export const dateRanges = [
  'Today',
  'Last 7 Days',
  'Last 30 Days',
  'This Month',
  'Last 3 Months',
  'Custom Date Range',
] as const

export type DateRange = (typeof dateRanges)[number]

export const statusByReport: Record<ReportType, RecordStatus[]> = {
  'Customer Report': ['Active', 'Inactive'],
  'Vendor Report': ['Active', 'Pending', 'Approved', 'Rejected', 'Inactive'],
  'User Report': ['Active', 'Inactive'],
  'Telecaller Report': ['Active', 'Inactive'],
  'Activity Report': ['Pending', 'Approved', 'Rejected', 'Active'],
}

export const initialReports: ReportRecord[] = [
  {
    id: 'report-1',
    name: 'Customer Registration Report',
    type: 'Customer',
    generatedDate: '2026-10-28',
    records: 856,
    generatedBy: 'Super Admin',
    status: 'Completed',
    summary: 'A snapshot of customer registrations, account statuses, and recent onboarding activity.',
  },
  {
    id: 'report-2',
    name: 'Vendor Performance Report',
    type: 'Vendor',
    generatedDate: '2026-10-27',
    records: 342,
    generatedBy: 'Super Admin',
    status: 'Completed',
    summary: 'Vendor account activity, approval progress, and performance overview.',
  },
  {
    id: 'report-3',
    name: 'User Activity Report',
    type: 'Activity',
    generatedDate: '2026-10-26',
    records: 1248,
    generatedBy: 'Super Admin',
    status: 'Completed',
    summary: 'Recent platform engagement across customer, vendor, and telecaller accounts.',
  },
  {
    id: 'report-4',
    name: 'Telecaller Summary Report',
    type: 'Telecaller',
    generatedDate: '2026-10-25',
    records: 50,
    generatedBy: 'Super Admin',
    status: 'Processing',
    summary: 'A summary of active telecaller accounts and their recent activity.',
  },
  {
    id: 'report-5',
    name: 'Pending Vendor Report',
    type: 'Vendor',
    generatedDate: '2026-10-24',
    records: 72,
    generatedBy: 'Super Admin',
    status: 'Completed',
    summary: 'Vendor accounts awaiting review and approval.',
  },
  {
    id: 'report-6',
    name: 'Monthly Registration Report',
    type: 'User',
    generatedDate: '2026-10-22',
    records: 1248,
    generatedBy: 'Super Admin',
    status: 'Failed',
    summary: 'Monthly account registration totals across platform user categories.',
  },
]

export const reportSourceRecords: ReportSourceRecord[] = [
  { id: 'c-1', category: 'Customer', status: 'Active', date: '2026-10-28' },
  { id: 'c-2', category: 'Customer', status: 'Active', date: '2026-10-25' },
  { id: 'c-3', category: 'Customer', status: 'Inactive', date: '2026-10-21' },
  { id: 'c-4', category: 'Customer', status: 'Active', date: '2026-10-18' },
  { id: 'c-5', category: 'Customer', status: 'Inactive', date: '2026-09-16' },
  { id: 'c-6', category: 'Customer', status: 'Active', date: '2026-08-12' },
  { id: 'v-1', category: 'Vendor', status: 'Approved', date: '2026-10-27' },
  { id: 'v-2', category: 'Vendor', status: 'Pending', date: '2026-10-24' },
  { id: 'v-3', category: 'Vendor', status: 'Approved', date: '2026-10-20' },
  { id: 'v-4', category: 'Vendor', status: 'Rejected', date: '2026-10-15' },
  { id: 'v-5', category: 'Vendor', status: 'Inactive', date: '2026-09-22' },
  { id: 'v-6', category: 'Vendor', status: 'Pending', date: '2026-08-19' },
  { id: 'u-1', category: 'User', status: 'Active', date: '2026-10-28' },
  { id: 'u-2', category: 'User', status: 'Inactive', date: '2026-10-23' },
  { id: 'u-3', category: 'User', status: 'Active', date: '2026-09-11' },
  { id: 'u-4', category: 'User', status: 'Active', date: '2026-07-30' },
  { id: 't-1', category: 'Telecaller', status: 'Active', date: '2026-10-26' },
  { id: 't-2', category: 'Telecaller', status: 'Active', date: '2026-10-14' },
  { id: 't-3', category: 'Telecaller', status: 'Inactive', date: '2026-09-09' },
  { id: 'a-1', category: 'Activity', status: 'Approved', date: '2026-10-28' },
  { id: 'a-2', category: 'Activity', status: 'Pending', date: '2026-10-24' },
  { id: 'a-3', category: 'Activity', status: 'Rejected', date: '2026-10-17' },
  { id: 'a-4', category: 'Activity', status: 'Active', date: '2026-09-25' },
  { id: 'a-5', category: 'Activity', status: 'Pending', date: '2026-08-20' },
]

export const registrationData = [
  { month: 'May', customers: 85, vendors: 30 },
  { month: 'June', customers: 110, vendors: 45 },
  { month: 'July', customers: 95, vendors: 40 },
  { month: 'August', customers: 150, vendors: 65 },
  { month: 'September', customers: 185, vendors: 80 },
  { month: 'October', customers: 220, vendors: 110 },
]

export const vendorStatusData = [
  { label: 'Approved', value: 220, color: '#07945c' },
  { label: 'Pending', value: 72, color: '#f96321' },
  { label: 'Rejected', value: 30, color: '#e4485b' },
  { label: 'Inactive', value: 20, color: '#94a3b8' },
]

export const activityData = [
  { month: 'May', customers: 120, vendors: 45, telecallers: 20 },
  { month: 'June', customers: 145, vendors: 55, telecallers: 24 },
  { month: 'July', customers: 138, vendors: 60, telecallers: 22 },
  { month: 'August', customers: 180, vendors: 72, telecallers: 30 },
  { month: 'September', customers: 210, vendors: 88, telecallers: 36 },
  { month: 'October', customers: 245, vendors: 105, telecallers: 42 },
]
