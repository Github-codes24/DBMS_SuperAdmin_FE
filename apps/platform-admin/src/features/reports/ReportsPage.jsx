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
import { StatisticsCard } from '../../components/data-display'
import { AlertMessage } from '../../components/notifications'
import { EmptyState } from '../../components/feedback'
import { PrimaryButton, SecondaryButton, IconButton } from '../../components/ui/buttons'
import api from '../../api/axiosClient'
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

const reportTypeValues = {
  'Customer Report': 'customers',
  'Vendor Report': 'vendors',
  'User Report': 'users',
  'Telecaller Report': 'telecallers',
  'Activity Report': 'activities',
}

const reportRangeValues = {
  Today: '1d',
  'Last 7 Days': '7d',
  'Last 30 Days': '30d',
  'This Month': 'month',
  'Last 3 Months': '90d',
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

function getErrorMessage(error) {
  return error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || 'Unable to load the report.'
}

function formatReportDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

function ReportsPage() {
  const defaultDates = getDefaultDates()
  const [reportType, setReportType] = useState('User Report')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [status, setStatus] = useState('All')
  const [fromDate, setFromDate] = useState(defaultDates.from)
  const [toDate, setToDate] = useState(defaultDates.to)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [generatedReport, setGeneratedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const dateRangeIsInvalid = dateRange === 'Custom Date Range'
    && (!fromDate || !toDate || fromDate > toDate)
  const dateError = !fromDate || !toDate
    ? 'Select both dates to generate a report.'
    : 'From Date must be on or before To Date.'

  function resetFilters() {
    const dates = getDefaultDates()
    setReportType('User Report')
    setDateRange('Last 30 Days')
    setStatus('All')
    setFromDate(dates.from)
    setToDate(dates.to)
    setMessage('')
    setGeneratedReport(null)
    setReportData(null)
  }

  async function loadReport(filters, page = 1) {
    const type = reportTypeValues[filters.reportType]
    const range = reportRangeValues[filters.dateRange]
    if (!range) {
      setMessageType('warning')
      setMessage('Custom date ranges are not supported by the reports API. Choose a preset date range.')
      return
    }

    setIsLoading(true)
    setReportData(null)
    setGeneratedReport(null)
    setMessage('')
    try {
      const response = await api.get('/reports', {
        params: {
          type,
          range,
          status: filters.status.toLowerCase(),
          page,
          limit: 10,
        },
      })
      const result = response.data
      if (result?.success === false) {
        throw new Error(result.message || 'The report could not be generated.')
      }

      const data = result?.data
      if (
        !data?.summary ||
        !Array.isArray(data.trend) ||
        !Array.isArray(data.breakdown) ||
        !Array.isArray(data.rows) ||
        !data.pagination
      ) {
        throw new Error('The reports API returned an invalid response.')
      }

      setReportData(data)
      setGeneratedReport(filters)
      setMessageType('success')
      setMessage(`Report generated: ${filters.reportType}, ${filters.status} status, ${filters.dateRange}.`)
    } catch (error) {
      setMessageType('error')
      setMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  function getCurrentFilters() {
    return { reportType, dateRange, status, fromDate, toDate }
  }

  function generateReport(event) {
    event.preventDefault()
    if (dateRangeIsInvalid) return
    void loadReport(getCurrentFilters())
  }

  function exportReport() {
    if (!reportData?.rows?.length) return

    const csvRows = [
      ['Record', 'Category', 'Email / Description', 'Status', 'Date'],
      ...reportData.rows.map((row) => [
        row.name ?? row.id ?? '',
        Array.isArray(row.roles) ? row.roles.join(', ') : row.category ?? '',
        row.email ?? row.description ?? '',
        row.isActive === undefined ? row.status ?? '' : row.isActive ? 'Active' : 'Blocked',
        row.createdAt ?? row.lastLoginAt ?? '',
      ]),
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
    setMessageType('success')
    setMessage(`CSV exported for ${generatedReport?.reportType ?? reportType}.`)
  }

  const summaryCards = [
    { label: 'Total Records', value: reportData?.summary?.total ?? '--', icon: Users, tone: 'orange' },
    { label: 'Active', value: reportData?.summary?.active ?? '--', icon: UserRound, tone: 'green' },
    { label: 'Blocked', value: reportData?.summary?.blocked ?? '--', icon: Store, tone: 'blue' },
    { label: 'Page Rows', value: reportData?.rows?.length ?? '--', icon: PhoneCall, tone: 'purple' },
  ]

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
      <IconButton
        icon={<RefreshCw size={15} />}
        ariaLabel="Refresh report"
        variant="secondary"
        onClick={() => void loadReport(generatedReport ?? getCurrentFilters(), reportData?.pagination?.page ?? 1)}
      />
      <PrimaryButton
        disabled={dateRangeIsInvalid || isLoading || !reportData?.rows?.length}
        onClick={exportReport}
        icon={<Download size={15} />}
      >
        Export Report
      </PrimaryButton>
    </div>
  )

  return (
    <ResponsiveLayout
      title="Reports & Analytics"
      description="Monitor business performance, analyze system activities, and generate detailed reports."
      icon={<BarChart3 size={24} />}
      headerActions={headerActions}
    >
      {message && (
        <AlertMessage
          variant={messageType}
          message={message}
          onClose={() => setMessage('')}
        />
      )}

      <section className="reports-kpi-grid" aria-label="Summary statistics">
        {summaryCards.map(({ label, value, icon: Icon, tone }) => (
          <StatisticsCard
            key={label}
            title={label}
            value={value}
            icon={<Icon size={18} />}
            tone={tone}
            subtitle={reportData ? 'From the current report' : 'Generate a report to load data'}
          />
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
                <PrimaryButton type="submit" disabled={dateRangeIsInvalid || isLoading} icon={<FileBarChart size={15} />}>
                  {isLoading ? 'Generating…' : 'Generate Report'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={resetFilters} icon={<RotateCcw size={14} />}>
                  Reset Filters
                </SecondaryButton>
              </div>
            </form>
          </section>

          <section className="reports-chart-grid" aria-label="Charts and analytics">
            <article className="reports-card">
              <div className="reports-card-heading">
                <div><h2>Registration Trends</h2><p>Customer and vendor registrations over time.</p></div>
                <span className="reports-chart-range">{dateRange}</span>
              </div>
              <div className="reports-chart-empty" role="status">
                {reportData?.trend?.length
                  ? reportData.trend.map((item) => `${item.date}: ${item.count}`).join(' · ')
                  : isLoading ? 'Loading trend data…' : 'No registration data available for this period.'}
              </div>
              <div className="reports-chart-legend">
                <span><i className="reports-legend-dot reports-legend-dot--orange" />Customers</span>
                <span><i className="reports-legend-dot reports-legend-dot--blue" />Vendors</span>
              </div>
            </article>

            <article className="reports-card">
              <div className="reports-card-heading">
                <div><h2>Breakdown</h2><p>Records by category.</p></div>
                <span className="reports-vendor-icon"><Activity size={17} /></span>
              </div>
              <div className="reports-vendor-empty">
                <div className="reports-empty-ring" aria-hidden="true" />
                {reportData?.breakdown?.length
                  ? reportData.breakdown.map((item) => <p key={item.label}>{item.label}: {item.count}</p>)
                  : <p>{isLoading ? 'Loading breakdown…' : 'No breakdown data available.'}</p>}
              </div>
            </article>
          </section>

          <section className="reports-card reports-table-card">
            <div className="reports-card-heading reports-table-heading">
              <div>
                <h2>{generatedReport?.reportType ?? reportType} Details</h2>
                <p>{generatedReport
                  ? `Generated for ${generatedReport.status} status, ${generatedReport.dateRange}. ${reportData?.pagination?.total ?? 0} records.`
                  : 'Generate a report to apply the selected filters.'}</p>
              </div>
              <SecondaryButton
                disabled={dateRangeIsInvalid || isLoading || !reportData?.rows?.length}
                onClick={exportReport}
                icon={<Download size={14} />}
              >
                Export CSV
              </SecondaryButton>
            </div>
            <div className="reports-table-scroll">
              <table className="reports-table">
                <thead><tr><th>Record</th><th>Category</th><th>Email / Description</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {reportData?.rows?.length ? reportData.rows.map((row, index) => (
                    <tr key={row.id ?? index}>
                      <td>{row.name ?? row.id ?? '—'}</td>
                      <td>{Array.isArray(row.roles) ? row.roles.join(', ') : row.category ?? '—'}</td>
                      <td>{row.email ?? row.description ?? '—'}</td>
                      <td>{row.isActive === undefined ? row.status ?? '—' : row.isActive ? 'Active' : 'Blocked'}</td>
                      <td>{formatReportDate(row.createdAt ?? row.lastLoginAt)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '1.5rem', border: 'none' }}>
                        <EmptyState
                          title={isLoading ? 'Loading report data' : reportData ? 'No report rows found' : 'No report data available'}
                          description={reportData ? 'Try another filter or date range.' : 'Generate a report to apply selected filters.'}
                          size="sm"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {reportData?.pagination && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px', fontSize: '10px' }}>
                <span>Page {reportData.pagination.page} of {reportData.pagination.totalPages} · {reportData.pagination.total} records</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <SecondaryButton
                    type="button"
                    disabled={isLoading || !reportData.pagination.hasPrevPage}
                    onClick={() => void loadReport(generatedReport, reportData.pagination.page - 1)}
                  >
                    Previous
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    disabled={isLoading || !reportData.pagination.hasNextPage}
                    onClick={() => void loadReport(generatedReport, reportData.pagination.page + 1)}
                  >
                    Next
                  </SecondaryButton>
                </div>
              </div>
            )}
          </section>
          <p className="reports-footnote">{reportData ? 'Report data is provided by the reports API.' : 'Generate a report to load analytics from the reports API.'}</p>
    </ResponsiveLayout>
  )
}

export default ReportsPage
