import { useState } from 'react'
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  FileBarChart,
  RefreshCw,
  RotateCcw,
  Store,
  Users,
  UserRound,
  PhoneCall,
} from 'lucide-react'
import './reports.css'

const reportTypes = [
  'Customer Report',
  'Vendor Report',
  'User Report',
  'Telecaller Report',
  'Activity Report',
]

const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last 3 Months', 'Custom Date Range']

const statusByReport = {
  'Customer Report': ['Active', 'Inactive'],
  'Vendor Report': ['Active', 'Pending', 'Approved', 'Rejected', 'Inactive'],
  'User Report': ['Active', 'Inactive'],
  'Telecaller Report': ['Active', 'Inactive'],
  'Activity Report': ['Pending', 'Approved', 'Rejected', 'Active'],
}

const vendorStatuses = ['Active', 'Pending', 'Inactive']

function formatDateDaysAgo(daysAgo) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultCustomRange() {
  return {
    fromDate: formatDateDaysAgo(29),
    toDate: formatDateDaysAgo(0),
  }
}

function ReportsPage() {
  const defaultCustomRange = getDefaultCustomRange()
  const [reportType, setReportType] = useState('Customer Report')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [status, setStatus] = useState('All')
  const [fromDate, setFromDate] = useState(defaultCustomRange.fromDate)
  const [toDate, setToDate] = useState(defaultCustomRange.toDate)
  const [notice, setNotice] = useState('')

  const hasInvalidCustomDateRange = dateRange === 'Custom Date Range'
    && (!fromDate || !toDate || fromDate > toDate)

  const customDateRangeError = !fromDate || !toDate
    ? 'Select both dates to generate a report.'
    : 'From Date must be on or before To Date.'

  const filteredRecords = []

  function resetFilters() {
    const defaultRange = getDefaultCustomRange()
    setReportType('Customer Report')
    setDateRange('Last 30 Days')
    setStatus('All')
    setFromDate(defaultRange.fromDate)
    setToDate(defaultRange.toDate)
    setNotice('')
  }

  function generateReport(event) {
    event.preventDefault()
    if (hasInvalidCustomDateRange) return
    setNotice('No report data is available for the selected filters.')
  }

  function refreshReport() {
    setNotice('No report data is available to refresh.')
  }

  function exportReport() {
    if (hasInvalidCustomDateRange) return
    setNotice('No report data is available to export.')
  }

  return (
    <div className="reports-shell">
      <header className="reports-navbar">
        <span className="reports-navbar-title">DBMS <strong>SUPER ADMIN</strong></span>
        <span className="reports-navbar-section">REPORTS &amp; ANALYTICS</span>
        <span className="reports-navbar-user"><span aria-hidden="true" /> Super Admin</span>
      </header>
      <div className="reports-body">
        <aside className="reports-sidebar">
          <a className="reports-brand" href="/users" aria-label="DBMS Super Admin">
            <span className="reports-brand-mark">D</span>
            <span>DBMS <strong>ADMIN</strong></span>
          </a>
          <p className="reports-nav-label">WORKSPACE</p>
          <nav className="reports-nav" aria-label="Main navigation">
            <a className="reports-nav-link" href="/users"><span aria-hidden="true">▦</span> Dashboard</a>
            <a className="reports-nav-link" href="/users"><span aria-hidden="true">♙</span> User Management</a>
            <a className="reports-nav-link" href="/roles-permissions"><span aria-hidden="true">♧</span> Role &amp; Permission</a>
            <a className="reports-nav-link reports-nav-link--active" href="/reports-analytics" aria-current="page">
              <BarChart3 size={15} aria-hidden="true" /> Reports &amp; Analytics
            </a>
          </nav>
          <div className="reports-sidebar-profile">
            <span className="reports-profile-avatar">SA</span>
            <span><strong>Super Admin</strong><small>Platform administrator</small></span>
          </div>
        </aside>

        <div className="reports-main">
          <main className="reports-content">
            <section className="reports-heading-card">
              <div className="reports-heading-copy">
                <span className="reports-heading-icon"><BarChart3 size={22} /></span>
                <div>
                  <h1>Reports &amp; Analytics</h1>
                  <p>Monitor business performance, analyze system activities, and generate detailed reports.</p>
                </div>
              </div>
              <div className="reports-heading-actions">
                <label className="reports-date-control">
                  <CalendarDays size={15} aria-hidden="true" />
                  <span className="visually-hidden">Dashboard date range</span>
                  <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
                    {dateRanges.map((range) => <option key={range}>{range}</option>)}
                  </select>
                  <ChevronDown size={13} aria-hidden="true" />
                </label>
                <button className="reports-button reports-button--outline reports-refresh" type="button" onClick={refreshReport} aria-label="Refresh report data">
                  <RefreshCw size={15} />
                </button>
                <button className="reports-button reports-button--primary reports-export" type="button" onClick={exportReport} disabled={hasInvalidCustomDateRange}>
                  <Download size={15} /> Export Report
                </button>
              </div>
            </section>

            {notice && <div className="reports-notice" role="status"><Check size={15} />{notice}</div>}

            <section className="reports-kpi-grid" aria-label="Summary statistics">
              <article className="reports-kpi-card">
                <div className="reports-kpi-top"><span>Total Users</span><span className="reports-kpi-icon reports-kpi-icon--orange"><Users size={17} /></span></div>
                <div className="reports-kpi-bottom"><strong>--</strong><span className="reports-growth">--</span></div>
                <p>No data available</p>
              </article>
              <article className="reports-kpi-card">
                <div className="reports-kpi-top"><span>Total Customers</span><span className="reports-kpi-icon reports-kpi-icon--blue"><UserRound size={17} /></span></div>
                <div className="reports-kpi-bottom"><strong>--</strong><span className="reports-growth">--</span></div>
                <p>No data available</p>
              </article>
              <article className="reports-kpi-card">
                <div className="reports-kpi-top"><span>Total Vendors</span><span className="reports-kpi-icon reports-kpi-icon--green"><Store size={17} /></span></div>
                <div className="reports-kpi-bottom"><strong>--</strong><span className="reports-growth">--</span></div>
                <p>No data available</p>
              </article>
              <article className="reports-kpi-card">
                <div className="reports-kpi-top"><span>Active Telecallers</span><span className="reports-kpi-icon reports-kpi-icon--purple"><PhoneCall size={17} /></span></div>
                <div className="reports-kpi-bottom"><strong>--</strong><span className="reports-growth">--</span></div>
                <p>No data available</p>
              </article>
            </section>

            <section className="reports-filter-card">
              <div className="reports-section-heading">
                <div><h2>Generate Reports</h2><p>Select a report category and apply filters to view detailed information.</p></div>
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
                    <label className="reports-field reports-field--date">
                      <span>From Date</span>
                      <input type="date" required value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} />
                    </label>
                    <label className="reports-field reports-field--date">
                      <span>To Date</span>
                      <input type="date" required value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} />
                    </label>
                  </>
                )}
                {hasInvalidCustomDateRange && (
                  <p className="reports-date-error" role="alert">{customDateRangeError}</p>
                )}
                <label className="reports-field">
                  <span>Status</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option>All</option>
                    {statusByReport[reportType].map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <div className="reports-filter-actions">
                  <button className="reports-button reports-button--primary" type="submit" disabled={hasInvalidCustomDateRange}><FileBarChart size={15} /> Generate Report</button>
                  <button className="reports-button reports-button--subtle" type="button" onClick={resetFilters}><RotateCcw size={14} /> Reset Filters</button>
                </div>
              </form>
            </section>

            <section className="reports-chart-grid" aria-label="Charts and analytics">
              <article className="reports-card reports-trend-card">
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

              <article className="reports-card reports-vendor-card">
                <div className="reports-card-heading">
                  <div><h2>Vendor Status</h2><p>Current breakdown of vendor accounts.</p></div>
                  <span className="reports-icon-quiet"><Activity size={17} /></span>
                </div>
                <div className="reports-vendor-chart">
                  <svg viewBox="0 0 120 120" role="img" aria-label="No vendor status data available">
                    <circle className="reports-donut-track" cx="60" cy="60" r="44" />
                    <text className="reports-donut-total" x="60" y="58">--</text>
                    <text className="reports-donut-caption" x="60" y="73">No data</text>
                  </svg>
                  <div className="reports-vendor-legend">
                    {vendorStatuses.map((label) => (
                      <div className="reports-vendor-legend-item" key={label}>
                        <span><i className={`reports-vendor-dot reports-vendor-dot--${label.toLowerCase()}`} />{label}</span>
                        <strong>--<small>--</small></strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </section>

            <section className="reports-card reports-table-card">
              <div className="reports-card-heading reports-table-heading">
                <div><h2>{reportType} Details</h2><p>{filteredRecords.length} records for the selected filters.</p></div>
                <button className="reports-button reports-button--outline reports-table-export" type="button" onClick={exportReport} disabled={hasInvalidCustomDateRange}><Download size={14} /> Export CSV</button>
              </div>
              <div className="reports-table-scroll">
                <table className="reports-table">
                  <thead><tr><th>Record</th><th>Category</th><th>Email / Description</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    <tr><td className="reports-empty-state" colSpan={5}>No report data available.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <p className="reports-demo-note">No report data is displayed. Connect your data source when it is available.</p>
          </main>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
