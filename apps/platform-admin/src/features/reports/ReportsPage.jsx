import { useEffect, useState } from 'react'
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

const supportedReportTypes = new Set(['User Report'])
const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last Year', 'All Time']

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
  'Activity Report': 'activity',
}

const reportRangeValues = {
  'Last 7 Days': '7d',
  'Last 30 Days': '30d',
  'Last 3 Months': '90d',
  'Last Year': '1y',
  'All Time': 'all',
}

function getDefaultFilters() {
  return { reportType: 'User Report', dateRange: 'Last 30 Days', status: 'All', projectId: '' }
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

async function fetchReportData(filters, page = 1, signal) {
  const type = reportTypeValues[filters.reportType]
  const range = reportRangeValues[filters.dateRange]
  if (!range) throw new Error('Choose a supported report date range.')

  const params = {
    type,
    range,
    status: filters.status.toLowerCase(),
    page,
    limit: 10,
  }
  if (filters.projectId?.trim()) params.projectId = filters.projectId.trim()

  const response = await api.get('/reports', {
    params,
    signal,
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
  return data
}

function formatReportDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

function ReportsPage() {
  const [reportType, setReportType] = useState('User Report')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [status, setStatus] = useState('All')
  const [projectId, setProjectId] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [generatedReport, setGeneratedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const effectiveReportType = reportType
  const availableStatuses = statusesByReport[effectiveReportType]
  const effectiveStatus = status === 'All' || availableStatuses.includes(status) ? status : 'All'

  function resetFilters() {
    setReportType('User Report')
    setDateRange('Last 30 Days')
    setStatus('All')
    setProjectId('')
    setMessage('')
    setGeneratedReport(null)
    setReportData(null)
  }

  async function loadReport(filters, page = 1) {
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
      const data = await fetchReportData(filters, page)
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

  useEffect(() => {
    const controller = new AbortController()
    const filters = getDefaultFilters()
    fetchReportData(filters, 1, controller.signal)
      .then((data) => {
        setReportData(data)
        setGeneratedReport(filters)
        setMessageType('success')
        setMessage(`Report generated: ${filters.reportType}, ${filters.status} status, ${filters.dateRange}.`)
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setMessageType('error')
        setMessage(getErrorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  function getCurrentFilters() {
    return {
      reportType: effectiveReportType,
      dateRange,
      status: effectiveStatus,
      projectId: effectiveReportType === 'Vendor Report' ? projectId : '',
    }
  }

  function generateReport(event) {
    event.preventDefault()
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
    link.download = `${(generatedReport?.reportType ?? effectiveReportType).toLowerCase().replaceAll(' ', '-')}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    setMessageType('success')
    setMessage(`CSV exported for ${generatedReport?.reportType ?? effectiveReportType}.`)
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
        disabled={isLoading || !reportData?.rows?.length}
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
                <select value={effectiveReportType} onChange={(event) => { setReportType(event.target.value); setStatus('All') }}>
                  {reportTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="reports-field">
                <span>Date Range</span>
                <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
                  {dateRanges.map((range) => <option key={range}>{range}</option>)}
                </select>
              </label>
              <label className="reports-field">
                <span>Status</span>
                <select value={effectiveStatus} onChange={(event) => setStatus(event.target.value)}>
                  <option>All</option>
                  {statusesByReport[effectiveReportType].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              {effectiveReportType === 'Vendor Report' && (
                <label className="reports-field">
                  <span>Project ID (optional)</span>
                  <input
                    type="text"
                    placeholder="Filter by project"
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                  />
                </label>
              )}
              <div className="reports-filter-actions">
                <PrimaryButton
                  type="submit"
                  disabled={isLoading || !supportedReportTypes.has(effectiveReportType)}
                  icon={<FileBarChart size={15} />}
                >
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
                <h2>{generatedReport?.reportType ?? effectiveReportType} Details</h2>
                <p>{generatedReport
                  ? `Generated for ${generatedReport.status} status, ${generatedReport.dateRange}. ${reportData?.pagination?.total ?? 0} records.`
                  : 'Generate a report to apply the selected filters.'}</p>
              </div>
              <SecondaryButton
                disabled={isLoading || !reportData?.rows?.length}
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
