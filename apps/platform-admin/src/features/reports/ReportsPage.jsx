import { useEffect, useRef, useState } from 'react'
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

const supportedReportTypes = new Set(reportTypes)
const customDateRange = 'Custom Range'
const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last Year', 'All Time', customDateRange]

const statusesByReport = {
  'Customer Report': ['Active', 'Inactive'],
  'Vendor Report': ['Active', 'Inactive', 'Pending', 'Approved', 'Rejected'],
  'User Report': ['Active', 'Inactive', 'Blocked'],
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

const reportTrendLabels = {
  'Customer Report': 'Customers',
  'Vendor Report': 'Vendors',
  'User Report': 'Users',
  'Telecaller Report': 'Telecallers',
  'Activity Report': 'Activities',
}

const reportRangeValues = {
  'Last 7 Days': '7d',
  'Last 30 Days': '30d',
  'Last 3 Months': '90d',
  'Last Year': '1y',
  'All Time': 'all',
}

const breakdownColors = ['#f96321', '#3b82f6', '#16a36a', '#8b5cf6', '#ec4899', '#eab308', '#14b8a6', '#64748b']

function getDefaultFilters() {
  return { reportType: 'User Report', dateRange: 'Last 30 Days', status: 'All', projectId: '' }
}

function getBreakdownLabel(item) {
  const label = item?.label ?? item?.roleName ?? item?.role ?? item?.category ?? item?.name
  return typeof label === 'string' || typeof label === 'number' ? String(label).trim() : ''
}

function getErrorMessage(error) {
  return error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || 'Unable to load the report.'
}

async function getExportErrorMessage(error) {
  const data = error.response?.data
  if (!(data instanceof Blob)) return getErrorMessage(error)

  const text = await data.text()
  if (!text) return error.message || 'Unable to export the report.'
  try {
    const response = JSON.parse(text)
    return response.message || response.error || error.message || 'Unable to export the report.'
  } catch {
    return text
  }
}

function getExportFilename(contentDisposition) {
  const filename = /filename="?([^";]+)"?/i.exec(contentDisposition ?? '')?.[1]
  return filename?.replace(/[\\/:*?"<>|]/g, '_')
    || `users-report-${new Date().toISOString().slice(0, 10)}.csv`
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
    limit: filters.reportType === 'Telecaller Report' ? 100 : 10,
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
    !data.trend.every((item) =>
      item &&
      typeof item.date === 'string' &&
      item.date.length > 0 &&
      Number.isFinite(Number(item.count)) &&
      Number(item.count) >= 0
    ) ||
    !Array.isArray(data.breakdown) ||
    !data.breakdown.every((item) =>
      item &&
      getBreakdownLabel(item) &&
      Number.isFinite(Number(item.count)) &&
      Number(item.count) >= 0
    ) ||
    !Array.isArray(data.rows) ||
    !data.pagination
  ) {
    throw new Error('The reports API returned an invalid response.')
  }
  return data
}

async function fetchRoleReportData(filters, signal) {
  const range = reportRangeValues[filters.dateRange]
  if (!range) throw new Error('Choose a supported report date range.')

  const params = {
    range,
    status: filters.status.toLowerCase(),
  }
  if (filters.projectId?.trim()) params.projectId = filters.projectId.trim()

  const response = await api.get('/reports/roles', { params, signal })
  const result = response.data
  if (result?.success === false) {
    throw new Error(result.message || 'The role-wise report could not be generated.')
  }

  const data = result?.data
  if (
    !data ||
    !Number.isFinite(Number(data.totalUsers)) ||
    Number(data.totalUsers) < 0 ||
    !Array.isArray(data.roles) ||
    !data.roles.every((role) =>
      role &&
      getBreakdownLabel(role) &&
      Number.isFinite(Number(role.userCount)) &&
      Number(role.userCount) >= 0 &&
      Number.isFinite(Number(role.activeUsers)) &&
      Number(role.activeUsers) >= 0 &&
      Number.isFinite(Number(role.blockedUsers)) &&
      Number(role.blockedUsers) >= 0
    )
  ) {
    throw new Error('The role-wise reports API returned an invalid response.')
  }

  return {
    totalUsers: Number(data.totalUsers),
    roles: data.roles.map((role) => ({
      roleId: role.roleId,
      roleName: getBreakdownLabel(role),
      userCount: Number(role.userCount),
      activeUsers: Number(role.activeUsers),
      blockedUsers: Number(role.blockedUsers),
    })),
  }
}

function formatReportDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

function formatTrendAxisDate(value) {
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getRowRecord(row) {
  return row.name
    ?? row.fullName
    ?? row.customerName
    ?? row.vendorName
    ?? row.companyName
    ?? row.actorName
    ?? row.userName
    ?? row.id
    ?? '—'
}

function getRowCategory(row) {
  return Array.isArray(row.roles)
    ? row.roles.join(', ')
    : row.category ?? row.type ?? row.action ?? row.event ?? '—'
}

function getRowDescription(row) {
  return row.email ?? row.description ?? row.actorEmail ?? row.message ?? '—'
}

function getRowStatus(row) {
  return row.isActive === undefined
    ? row.status ?? '—'
    : row.isActive
      ? 'Active'
      : 'Blocked'
}

function getRowDate(row) {
  return row.createdAt ?? row.lastLoginAt ?? row.timestamp ?? row.date
}

function ReportsPage() {
  const [reportType, setReportType] = useState('User Report')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [status, setStatus] = useState('All')
  const [projectId, setProjectId] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [generatedReport, setGeneratedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [roleReportData, setRoleReportData] = useState(null)
  const [roleReportError, setRoleReportError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRoleReportLoading, setIsRoleReportLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const reportRequestController = useRef(null)
  const effectiveReportType = reportType
  const availableStatuses = statusesByReport[effectiveReportType]
  const effectiveStatus = status === 'All' || availableStatuses.includes(status) ? status : 'All'
  const canExportUsers = effectiveReportType === 'User Report' && dateRange !== customDateRange

  function resetFilters() {
    const filters = getDefaultFilters()
    setReportType('User Report')
    setDateRange('Last 30 Days')
    setCustomStartDate('')
    setCustomEndDate('')
    setStatus('All')
    setProjectId('')
    setMessage('')
    setGeneratedReport(null)
    setReportData(null)
    void loadReport(filters)
  }

  async function loadReport(filters, page = 1) {
    reportRequestController.current?.abort()
    reportRequestController.current = null

    const range = reportRangeValues[filters.dateRange]
    if (!range) {
      setIsLoading(false)
      setReportData(null)
      setGeneratedReport(null)
      setRoleReportData(null)
      setRoleReportError('')
      setIsRoleReportLoading(false)
      setMessageType('warning')
      setMessage('Custom date ranges are not supported by the reports API. Choose a preset date range.')
      return
    }

    const controller = new AbortController()
    reportRequestController.current = controller
    const shouldLoadRoleReport = filters.reportType === 'User Report'
    setIsLoading(true)
    setIsRoleReportLoading(shouldLoadRoleReport)
    setReportData(null)
    setRoleReportData(null)
    setRoleReportError('')
    setGeneratedReport(null)
    setMessage('')
    try {
      const [reportResult, roleResult] = await Promise.allSettled([
        fetchReportData(filters, page, controller.signal),
        shouldLoadRoleReport
          ? fetchRoleReportData(filters, controller.signal)
          : Promise.resolve(null),
      ])
      if (controller.signal.aborted) return
      if (roleResult.status === 'fulfilled') {
        setRoleReportData(roleResult.value)
      } else {
        setRoleReportError(getErrorMessage(roleResult.reason))
      }
      if (reportResult.status === 'rejected') throw reportResult.reason
      setReportData(reportResult.value)
      setGeneratedReport(filters)
      setMessageType('success')
      setMessage(`Report generated: ${filters.reportType}, ${filters.status} status, ${filters.dateRange}.`)
    } catch (error) {
      if (controller.signal.aborted) return
      setMessageType('error')
      setMessage(getErrorMessage(error))
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
        setIsRoleReportLoading(false)
      }
      if (reportRequestController.current === controller) {
        reportRequestController.current = null
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    reportRequestController.current = controller
    const filters = getDefaultFilters()
    Promise.allSettled([
      fetchReportData(filters, 1, controller.signal),
      fetchRoleReportData(filters, controller.signal),
    ])
      .then(([reportResult, roleResult]) => {
        if (controller.signal.aborted) return
        if (roleResult.status === 'fulfilled') {
          setRoleReportData(roleResult.value)
        } else {
          setRoleReportError(getErrorMessage(roleResult.reason))
        }
        if (reportResult.status === 'rejected') throw reportResult.reason
        setReportData(reportResult.value)
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
        if (!controller.signal.aborted) {
          setIsLoading(false)
          setIsRoleReportLoading(false)
        }
        if (reportRequestController.current === controller) {
          reportRequestController.current = null
        }
      })
    return () => {
      controller.abort()
      reportRequestController.current?.abort()
      reportRequestController.current = null
    }
  }, [])

  function getCurrentFilters() {
    return {
      reportType: effectiveReportType,
      dateRange,
      status: effectiveStatus,
      projectId: ['User Report', 'Vendor Report'].includes(effectiveReportType) ? projectId : '',
    }
  }

  function generateReport(event) {
    event.preventDefault()
    void loadReport(getCurrentFilters())
  }

  function changeDateRange(nextDateRange) {
    setDateRange(nextDateRange)
    void loadReport({ ...getCurrentFilters(), dateRange: nextDateRange })
  }

  async function exportReport() {
    const filters = getCurrentFilters()
    if (filters.reportType !== 'User Report') {
      setMessageType('warning')
      setMessage('CSV export is currently supported for User Report only.')
      return
    }

    const range = reportRangeValues[filters.dateRange]
    if (!range) {
      setMessageType('warning')
      setMessage('Custom date ranges are not supported by the CSV export API. Choose a preset date range.')
      return
    }

    const params = {
      type: 'users',
      range,
      status: filters.status.toLowerCase(),
    }
    if (filters.projectId?.trim()) params.projectId = filters.projectId.trim()

    setIsExporting(true)
    setMessage('')
    try {
      const response = await api.get('/reports/export', {
        params,
        responseType: 'blob',
      })
      const blobUrl = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = getExportFilename(response.headers['content-disposition'])
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      setMessageType('success')
      setMessage('User report CSV exported.')
    } catch (error) {
      setMessageType('error')
      setMessage(await getExportErrorMessage(error))
    } finally {
      setIsExporting(false)
    }
  }

  const summaryCards = [
    { label: 'Total Records', value: reportData?.summary?.total ?? '--', icon: Users, tone: 'orange' },
    { label: 'Active', value: reportData?.summary?.active ?? '--', icon: UserRound, tone: 'green' },
    { label: 'Blocked', value: reportData?.summary?.blocked ?? '--', icon: Store, tone: 'blue' },
    { label: 'Page Rows', value: reportData?.rows?.length ?? '--', icon: PhoneCall, tone: 'purple' },
  ]
  const trendData = (reportData?.trend ?? []).map((item) => ({
    date: item.date,
    count: Number(item.count),
  }))
  const trendChart = {
    width: 760,
    height: 250,
    left: 44,
    right: 12,
    top: 16,
    bottom: 40,
  }
  const trendPlotWidth = trendChart.width - trendChart.left - trendChart.right
  const trendPlotHeight = trendChart.height - trendChart.top - trendChart.bottom
  const trendMaxCount = Math.max(1, trendData.reduce((max, item) => Math.max(max, item.count), 0))
  const trendAxisMax = Math.max(4, Math.ceil(trendMaxCount / 4) * 4)
  const trendSlotWidth = trendData.length ? trendPlotWidth / trendData.length : 0
  const trendBarWidth = Math.min(28, trendSlotWidth * 0.6)
  const trendLabelInterval = Math.max(1, Math.ceil(trendData.length / 8))
  const trendSeriesLabel = reportTrendLabels[generatedReport?.reportType ?? effectiveReportType]
  const breakdownSource = effectiveReportType === 'User Report'
    ? (roleReportData?.roles ?? []).map((role) => ({
      label: role.roleName,
      count: role.userCount,
    }))
    : reportData?.breakdown ?? []
  const breakdownData = breakdownSource.map((item) => ({
    label: getBreakdownLabel(item),
    count: Number(item.count),
  }))
  const breakdownTotal = effectiveReportType === 'User Report' && roleReportData
    ? roleReportData.totalUsers
    : breakdownData.reduce((total, item) => total + item.count, 0)
  const breakdownCircumference = 2 * Math.PI * 52
  const breakdownSegments = breakdownData.map((item, index) => {
    const arcLength = breakdownTotal ? (item.count / breakdownTotal) * breakdownCircumference : 0
    const offset = breakdownTotal
      ? breakdownData
        .slice(0, index)
        .reduce((total, previous) => total + (previous.count / breakdownTotal) * breakdownCircumference, 0)
      : 0
    const gap = breakdownData.length > 1 ? Math.min(2, arcLength * 0.3) : 0
    const segment = {
      ...item,
      color: breakdownColors[index % breakdownColors.length],
      visibleLength: Math.max(0, arcLength - gap),
      offset,
    }
    return segment
  })

  const headerActions = (
    <div className="reports-header-actions">
      <label className="reports-date-control">
        <CalendarDays size={15} aria-hidden="true" />
        <span className="reports-visually-hidden">Dashboard date range</span>
        <select value={dateRange} onChange={(event) => changeDateRange(event.target.value)}>
          {dateRanges.map((range) => <option key={range}>{range}</option>)}
        </select>
        <ChevronDown size={13} aria-hidden="true" />
      </label>
      <IconButton
        icon={<RefreshCw size={15} />}
        ariaLabel="Refresh report"
        variant="secondary"
        disabled={isLoading || dateRange === customDateRange}
        onClick={() => void loadReport(generatedReport ?? getCurrentFilters(), reportData?.pagination?.page ?? 1)}
      />
      <PrimaryButton
        disabled={isLoading || isExporting || !canExportUsers}
        onClick={exportReport}
        icon={<Download size={15} />}
      >
        {isExporting ? 'Exporting…' : 'Export Report'}
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
                <select value={dateRange} onChange={(event) => changeDateRange(event.target.value)}>
                  {dateRanges.map((range) => <option key={range}>{range}</option>)}
                </select>
              </label>
              {dateRange === customDateRange && (
                <>
                  <label className="reports-field">
                    <span>Start Date</span>
                    <input
                      type="date"
                      value={customStartDate}
                      max={customEndDate || undefined}
                      required
                      onChange={(event) => setCustomStartDate(event.target.value)}
                    />
                  </label>
                  <label className="reports-field">
                    <span>End Date</span>
                    <input
                      type="date"
                      value={customEndDate}
                      min={customStartDate || undefined}
                      required
                      onChange={(event) => setCustomEndDate(event.target.value)}
                    />
                  </label>
                  <p className="reports-custom-range-note" role="status">
                    Custom date ranges are not supported by the reports API yet. Choose a preset to generate a report.
                  </p>
                </>
              )}
              <label className="reports-field">
                <span>Status</span>
                <select value={effectiveStatus} onChange={(event) => setStatus(event.target.value)}>
                  <option>All</option>
                  {statusesByReport[effectiveReportType].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              {['User Report', 'Vendor Report'].includes(effectiveReportType) && (
                <label className="reports-field">
                  <span>Project ID (optional)</span>
                  <input
                    type="text"
                    placeholder="All projects or enter a project ID"
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                  />
                </label>
              )}
              {effectiveReportType !== 'User Report' && (
                <p className="reports-custom-range-note" role="status">
                  CSV export is currently supported for User Report only.
                </p>
              )}
              <div className="reports-filter-actions">
                <PrimaryButton
                  type="submit"
                  disabled={isLoading || !supportedReportTypes.has(effectiveReportType) || dateRange === customDateRange}
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
                <div><h2>Registration Trends</h2><p>Daily records by date for the selected report.</p></div>
                <span className="reports-chart-range">{dateRange}</span>
              </div>
              {trendData.length ? (
                <div className="reports-chart-plot">
                  <svg
                    className="reports-trend-chart"
                    viewBox={`0 0 ${trendChart.width} ${trendChart.height}`}
                    role="img"
                    aria-label={`${trendSeriesLabel} registered per date`}
                  >
                    {Array.from({ length: 5 }, (_, index) => {
                      const count = (trendAxisMax / 4) * index
                      const y = trendChart.top + trendPlotHeight - (count / trendAxisMax) * trendPlotHeight
                      return (
                        <g key={count}>
                          <line
                            x1={trendChart.left}
                            x2={trendChart.width - trendChart.right}
                            y1={y}
                            y2={y}
                            className="reports-trend-gridline"
                          />
                          <text
                            x={trendChart.left - 10}
                            y={y + 3}
                            textAnchor="end"
                            className="reports-trend-axis-label"
                          >
                            {count}
                          </text>
                        </g>
                      )
                    })}
                    {trendData.map((item, index) => {
                      const barHeight = (item.count / trendAxisMax) * trendPlotHeight
                      const x = trendChart.left + index * trendSlotWidth + (trendSlotWidth - trendBarWidth) / 2
                      const y = trendChart.top + trendPlotHeight - barHeight
                      const showDateLabel =
                        index % trendLabelInterval === 0 || index === trendData.length - 1
                      return (
                        <g key={`${item.date}-${index}`}>
                          <rect
                            x={x}
                            y={y}
                            width={trendBarWidth}
                            height={Math.max(barHeight, 1)}
                            rx="3"
                            className="reports-trend-bar"
                          >
                            <title>{`${item.date}: ${item.count} ${trendSeriesLabel.toLowerCase()}`}</title>
                          </rect>
                          {trendData.length <= 14 && (
                            <text
                              x={x + trendBarWidth / 2}
                              y={Math.max(trendChart.top + 10, y - 5)}
                              textAnchor="middle"
                              className="reports-trend-value-label"
                            >
                              {item.count}
                            </text>
                          )}
                          {showDateLabel && (
                            <text
                              x={x + trendBarWidth / 2}
                              y={trendChart.height - 12}
                              textAnchor="middle"
                              className="reports-trend-axis-label"
                            >
                              {formatTrendAxisDate(item.date)}
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>
              ) : (
                <div className="reports-chart-empty" role="status">
                  {isLoading ? 'Loading trend data…' : 'No registration data available for this period.'}
                </div>
              )}
              <div className="reports-chart-legend">
                <span><i className="reports-legend-dot reports-legend-dot--orange" />{trendSeriesLabel}</span>
              </div>
            </article>

            <article className="reports-card">
              <div className="reports-card-heading">
                <div>
                  <h2>{effectiveReportType === 'User Report' ? 'Users by Role' : 'Breakdown'}</h2>
                  <p>{effectiveReportType === 'User Report'
                    ? 'User assignments by project-specific role.'
                    : 'Records by category.'}</p>
                </div>
                <span className="reports-vendor-icon"><Activity size={17} /></span>
              </div>
              {breakdownData.length ? (
                <div className="reports-breakdown">
                  <svg
                    className="reports-breakdown-chart"
                    viewBox="0 0 160 160"
                    role="img"
                    aria-label={`Category distribution: ${breakdownData.map((item) => `${item.label} ${item.count}`).join(', ')}`}
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r="52"
                      className="reports-breakdown-track"
                    />
                    {breakdownSegments.map((segment, index) => (
                      <circle
                        key={`${segment.label}-${index}`}
                        cx="80"
                        cy="80"
                        r="52"
                        className="reports-breakdown-segment"
                        stroke={segment.color}
                        strokeDasharray={`${segment.visibleLength} ${breakdownCircumference - segment.visibleLength}`}
                        strokeDashoffset={-segment.offset}
                      >
                        <title>{`${segment.label}: ${segment.count} (${breakdownTotal ? ((segment.count / breakdownTotal) * 100).toFixed(1) : '0'}%)`}</title>
                      </circle>
                    ))}
                    <text x="80" y="77" textAnchor="middle" className="reports-breakdown-total">
                      {breakdownTotal}
                    </text>
                    <text x="80" y="96" textAnchor="middle" className="reports-breakdown-caption">
                      Total records
                    </text>
                  </svg>
                  <ul className="reports-breakdown-legend" aria-label="Category counts">
                    {breakdownSegments.map((segment, index) => (
                      <li key={`${segment.label}-${index}`} className="reports-breakdown-legend-item">
                        <i
                          className="reports-breakdown-dot"
                          style={{ backgroundColor: segment.color }}
                          aria-hidden="true"
                        />
                        <span className="reports-breakdown-label">{segment.label}</span>
                        <span className="reports-breakdown-value">
                          {segment.count} ({breakdownTotal ? ((segment.count / breakdownTotal) * 100).toFixed(1) : '0'}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="reports-breakdown-empty" role="status">
                  {effectiveReportType === 'User Report' && roleReportError
                    ? roleReportError
                    : isRoleReportLoading
                      ? 'Loading role breakdown…'
                      : 'No breakdown data available.'}
                </div>
              )}
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
                disabled={isLoading || isExporting || !canExportUsers}
                onClick={exportReport}
                icon={<Download size={14} />}
              >
                {isExporting ? 'Exporting…' : 'Export CSV'}
              </SecondaryButton>
            </div>
            <div className="reports-table-scroll">
              <table className="reports-table">
                <thead><tr><th>Record</th><th>Category</th><th>Email / Description</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {reportData?.rows?.length ? reportData.rows.map((row, index) => (
                    <tr key={row.id ?? index}>
                      <td>{getRowRecord(row)}</td>
                      <td>{getRowCategory(row)}</td>
                      <td>{getRowDescription(row)}</td>
                      <td>{getRowStatus(row)}</td>
                      <td>{formatReportDate(getRowDate(row))}</td>
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
