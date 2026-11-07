import { useState } from 'react'
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  FileBarChart,
  PhoneCall,
  RefreshCw,
  RotateCcw,
  Store,
  UserRound,
  Users,
} from 'lucide-react'
import ResponsiveLayout from '../../components/layout/ResponsiveLayout'
import './reports.css'

const reportTypes = [
  'Customer Report',
  'Vendor Report',
  'User Report',
  'Telecaller Report',
  'Activity Report',
]

const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last 3 Months', 'Custom Date Range']

const statusesByReport = {
  'Customer Report': ['Active', 'Inactive'],
  'Vendor Report': ['Active', 'Inactive', 'Pending', 'Approved', 'Rejected'],
  'User Report': ['Active', 'Inactive'],
  'Telecaller Report': ['Active', 'Inactive'],
  'Activity Report': ['Pending', 'Approved', 'Rejected'],
}

function getDateDaysAgo(daysAgo) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultDates() {
  return { from: getDateDaysAgo(29), to: getDateDaysAgo(0) }
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`
}

function ReportsPage() {
  const defaultDates = getDefaultDates()
  const [reportType, setReportType] = useState(reportTypes[0])
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [status, setStatus] = useState('All')
  const [fromDate, setFromDate] = useState(defaultDates.from)
  const [toDate, setToDate] = useState(defaultDates.to)
  const [message, setMessage] = useState('')
  const [generatedReport, setGeneratedReport] = useState(null)

  const dateRangeIsInvalid = dateRange === 'Custom Date Range'
    && (!fromDate || !toDate || fromDate > toDate)
  const dateError = !fromDate || !toDate
    ? 'Select both dates to generate a report.'
    : 'From Date must be on or before To Date.'

  function resetFilters() {
    const dates = getDefaultDates()
    setReportType(reportTypes[0])
    setDateRange('Last 30 Days')
    setStatus('All')
    setFromDate(dates.from)
    setToDate(dates.to)
    setMessage('')
    setGeneratedReport(null)
  }

  function generateReport(event) {
    event.preventDefault()
    if (dateRangeIsInvalid) return
    setGeneratedReport({ reportType, dateRange, status, fromDate, toDate })
    setMessage(`Report generated: ${reportType}, ${status} status, ${dateRange}. No data is currently available.`)
  }

  function exportReport() {
    if (dateRangeIsInvalid) return

    const csvRows = [
      ['Record', 'Category', 'Email / Description', 'Status', 'Date'],
    ]
    const csv = `\uFEFF${csvRows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${reportType.toLowerCase().replaceAll(' ', '-')}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    setMessage(`CSV exported for ${reportType}. No data is currently available, so the file contains column headers only.`)
  }

  const headerActions = (
    <div className="reports-header-actions">
      <label className="reports-date-control">
        <CalendarDays size={15} aria-hidden="true" />
        <span className="reports-visually-hidden">Dashboard date range</span>
        <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
          {dateRanges.map((range) => <option key={range}>{range}</option>)}
        </select>
        <ChevronDown size={13} aria-hidden="true" />
      </label>
      <button
        className="reports-button reports-button--secondary reports-icon-button"
        type="button"
        aria-label="Refresh report"
        onClick={() => setMessage('Report filters are up to date. No data is currently available.')}
      >
        <RefreshCw size={15} />
      </button>
      <button
        className="reports-button reports-button--primary"
        type="button"
        disabled={dateRangeIsInvalid}
        onClick={exportReport}
      >
        <Download size={15} /> Export Report
      </button>
    </div>
  )

  return (
    <ResponsiveLayout
      title="Reports & Analytics"
      description="Monitor business performance, analyze system activities, and generate detailed reports."
      icon={<BarChart3 size={24} />}
      headerActions={headerActions}
    >
      {message && <p className="reports-message" role="status">{message}</p>}

          <section className="reports-kpi-grid" aria-label="Summary statistics">
            {[
              { label: 'Total Users', icon: Users, tone: 'orange' },
              { label: 'Total Customers', icon: UserRound, tone: 'blue' },
              { label: 'Total Vendors', icon: Store, tone: 'green' },
              { label: 'Active Telecallers', icon: PhoneCall, tone: 'purple' },
            ].map(({ label, icon: Icon, tone }) => (
              <article className="reports-kpi-card" key={label}>
                <div className="reports-kpi-top">
                  <span>{label}</span>
                  <span className={`reports-kpi-icon reports-kpi-icon--${tone}`}><Icon size={17} /></span>
                </div>
                <div className="reports-kpi-value">--</div>
                <p>No data available</p>
              </article>
            ))}
          </section>

          <section className="reports-card reports-filter-card">
            <div className="reports-section-heading">
              <h2>Generate Reports</h2>
              <p>Select a report category and apply filters to view detailed information.</p>
            </div>
            <form className="reports-filter-form" onSubmit={generateReport}>
              <label className="reports-field">
                <span>Report Type</span>
                <select value={reportType} onChange={(event) => { setReportType(event.target.value); setStatus('All') }}>
                  {reportTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="reports-field">
                <span>Date Range</span>
                <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
                  {dateRanges.map((range) => <option key={range}>{range}</option>)}
                </select>
              </label>
              {dateRange === 'Custom Date Range' && (
                <>
                  <label className="reports-field">
                    <span>From Date</span>
                    <input type="date" required value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} />
                  </label>
                  <label className="reports-field">
                    <span>To Date</span>
                    <input type="date" required value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} />
                  </label>
                </>
              )}
              {dateRangeIsInvalid && <p className="reports-date-error" role="alert">{dateError}</p>}
              <label className="reports-field">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option>All</option>
                  {statusesByReport[reportType].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <div className="reports-filter-actions">
                <button className="reports-button reports-button--primary" type="submit" disabled={dateRangeIsInvalid}>
                  <FileBarChart size={15} /> Generate Report
                </button>
                <button className="reports-button reports-button--muted" type="button" onClick={resetFilters}>
                  <RotateCcw size={14} /> Reset Filters
                </button>
              </div>
            </form>
          </section>

          <section className="reports-chart-grid" aria-label="Charts and analytics">
            <article className="reports-card">
              <div className="reports-card-heading">
                <div><h2>Registration Trends</h2><p>Customer and vendor registrations over time.</p></div>
                <span className="reports-chart-range">{dateRange}</span>
              </div>
              <div className="reports-chart-empty" role="status">No registration data available for this period.</div>
              <div className="reports-chart-legend">
                <span><i className="reports-legend-dot reports-legend-dot--orange" />Customers</span>
                <span><i className="reports-legend-dot reports-legend-dot--blue" />Vendors</span>
              </div>
            </article>

            <article className="reports-card">
              <div className="reports-card-heading">
                <div><h2>Vendor Status</h2><p>Current breakdown of vendor accounts.</p></div>
                <span className="reports-vendor-icon"><Activity size={17} /></span>
              </div>
              <div className="reports-vendor-empty">
                <div className="reports-empty-ring" aria-hidden="true" />
                <p>No vendor status data available.</p>
              </div>
            </article>
          </section>

          <section className="reports-card reports-table-card">
            <div className="reports-card-heading reports-table-heading">
              <div>
                <h2>{generatedReport?.reportType ?? reportType} Details</h2>
                <p>
                  {generatedReport
                    ? `Generated for ${generatedReport.status} status, ${generatedReport.dateRange}. No records available.`
                    : 'Generate a report to apply the selected filters. No records are currently available.'}
                </p>
              </div>
              <button
                className="reports-button reports-button--secondary"
                type="button"
                disabled={dateRangeIsInvalid}
                onClick={exportReport}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="reports-table-scroll">
              <table className="reports-table">
                <thead><tr><th>Record</th><th>Category</th><th>Email / Description</th><th>Status</th><th>Date</th></tr></thead>
                <tbody><tr><td className="reports-empty-state" colSpan={5}>No report data available.</td></tr></tbody>
              </table>
            </div>
          </section>
          <p className="reports-footnote">No report data is displayed. Connect a data source when it is available.</p>
    </ResponsiveLayout>
  )
}

export default ReportsPage
