import { useEffect, useMemo, useState } from 'react'
import {
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
  Layers,
  Headset,
  ShieldCheck,
} from 'lucide-react'
import ResponsiveLayout from '../../components/layout/ResponsiveLayout'
import { StatisticsCard } from '../../components/data-display'
import { AlertMessage } from '../../components/notifications'
import { TableSkeletonRows, EmptyState } from '../../components/feedback'
import { PrimaryButton, SecondaryButton, IconButton } from '../../components/ui/buttons'
import {
  listProjects,
  getChildProjectStats,
} from '../projects/projectService'
import { listUsers, listChildProjectUsers } from '../users/services/userService'
import './reports.css'

const platformReportTypes = [
  'Platform Users Report',
  'Connected Projects Report',
  'Administrative Roles Report',
]

const childReportTypes = [
  'Vendor Database Report',
  'Customer Database Report',
  'Telecaller CRM Report',
  'Staff & User Directory Report',
]

const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last 3 Months', 'Custom Date Range']

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
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function ReportsPage() {
  const defaultDates = getDefaultDates()
  const [selectedScope, setSelectedScope] = useState('platform')
  const [projects, setProjects] = useState([])
  const [totalPlatformUsers, setTotalPlatformUsers] = useState(0)
  const [childStats, setChildStats] = useState(null)
  const [tableRecords, setTableRecords] = useState([])

  const currentReportTypes = selectedScope === 'platform' ? platformReportTypes : childReportTypes
  const [reportType, setReportType] = useState(currentReportTypes[0])
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [status, setStatus] = useState('All')
  const [fromDate, setFromDate] = useState(defaultDates.from)
  const [toDate, setToDate] = useState(defaultDates.to)
  const [message, setMessage] = useState('')
  const [generatedReport, setGeneratedReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedScope),
    [projects, selectedScope]
  )

  const dateRangeIsInvalid = dateRange === 'Custom Date Range'
    && (!fromDate || !toDate || fromDate > toDate)
  const dateError = !fromDate || !toDate
    ? 'Select both dates to generate a report.'
    : 'From Date must be on or before To Date.'

  // Initial load of Platform projects and user counts
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      listProjects(controller.signal).catch(() => []),
      listUsers({ pageSize: 1 }, controller.signal).catch(() => ({ total: 0 })),
    ])
      .then(([projList, userRes]) => {
        setProjects(projList)
        setTotalPlatformUsers(userRes.total || 0)
      })
      .catch((err) => {
        console.warn('Could not load reports overview:', err)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [refreshKey])

  // Load telemetry when child project scope is selected
  useEffect(() => {
    if (selectedScope === 'platform') {
      return () => {}
    }

    const controller = new AbortController()
    getChildProjectStats(selectedScope)
      .then((stats) => {
        setChildStats(stats)
      })
      .catch((err) => {
        console.warn('Could not load child project telemetry:', err)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [selectedScope, refreshKey])

  function handleScopeChange(scopeId) {
    setSelectedScope(scopeId)
    if (scopeId === 'platform') {
      setChildStats(null)
      setReportType(platformReportTypes[0])
    } else {
      setReportType(childReportTypes[0])
    }
    setIsLoading(true)
    setGeneratedReport(null)
    setTableRecords([])
    setMessage('')
  }

  function resetFilters() {
    const dates = getDefaultDates()
    setReportType(currentReportTypes[0])
    setDateRange('Last 30 Days')
    setStatus('All')
    setFromDate(dates.from)
    setToDate(dates.to)
    setMessage('')
    setGeneratedReport(null)
    setTableRecords([])
  }

  async function generateReport(event) {
    event?.preventDefault()
    if (dateRangeIsInvalid) return

    setIsGenerating(true)
    setMessage('')

    try {
      if (selectedScope === 'platform') {
        if (reportType === 'Platform Users Report') {
          const res = await listUsers({ pageSize: 50, status: status === 'All' ? '' : status.toLowerCase() })
          const rows = res.users.map((u) => ({
            id: u.id,
            name: u.fullName,
            category: 'Platform User',
            detail: u.email,
            status: u.status,
            date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
          }))
          setTableRecords(rows)
          setMessage(`Report generated: ${rows.length} platform user records found.`)
        } else {
          const rows = projects.map((p) => ({
            id: p.id,
            name: p.name,
            category: 'Project Definition',
            detail: `${p.projectCode || 'CHILD'} • ${p.integrationStatus}`,
            status: p.status,
            date: p.startDate || '—',
          }))
          setTableRecords(rows)
          setMessage(`Report generated: ${rows.length} connected project records found.`)
        }
      } else {
        // Child Project Scope (e.g. LTS)
        let panelFilter = 'all'
        if (reportType.includes('Vendor')) panelFilter = 'lts-vendor'
        else if (reportType.includes('Telecaller')) panelFilter = 'lts-telecaller'
        else if (reportType.includes('Staff') || reportType.includes('User')) panelFilter = 'lts-superadmin'

        const res = await listChildProjectUsers(selectedScope, { panel: panelFilter, limit: 50 })
        let rows = (res.users || []).map((u) => ({
          id: u.id,
          name: u.name,
          category: u.panel,
          detail: u.storeName ? `${u.storeName} (${u.phone || u.email || '—'})` : u.email || u.phone || '—',
          status: u.status || 'Active',
          date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
        }))

        if (status !== 'All') {
          rows = rows.filter((r) => r.status.toLowerCase() === status.toLowerCase())
        }

        setTableRecords(rows)
        setMessage(`Report generated: ${rows.length} records retrieved from ${selectedProject?.name || 'child'} database.`)
      }

      setGeneratedReport({ reportType, dateRange, status, fromDate, toDate })
    } catch (err) {
      console.error('Generate report error:', err)
      setMessage(err instanceof Error ? err.message : 'Failed to generate report from data source.')
    } finally {
      setIsGenerating(false)
    }
  }

  function exportReport() {
    if (dateRangeIsInvalid) return

    const csvRows = tableRecords.length > 0
      ? [
          ['Record ID', 'Entity Name', 'Category / Panel', 'Contact / Store / Detail', 'Status', 'Date'],
          ...tableRecords.map((r) => [
            r.id,
            r.name,
            r.category,
            r.detail,
            r.status,
            r.date,
          ]),
        ]
      : [
          ['Record ID', 'Entity Name', 'Category / Panel', 'Contact / Store / Detail', 'Status', 'Date'],
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
    setMessage(`CSV exported for ${reportType} (${csvRows.length - 1} records).`)
  }

  const activeProjectsCount = projects.filter((p) => p.status === 'Active').length
  const totalFrontendApps = projects.reduce((acc, p) => acc + (p.frontendApps?.length || 0), 0)

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
        icon={<RefreshCw size={15} className={isLoading ? 'spin' : ''} />}
        ariaLabel="Refresh report telemetry"
        variant="secondary"
        onClick={() => {
          setIsLoading(true)
          setRefreshKey((k) => k + 1)
          setMessage('Telemetry refreshed.')
        }}
      />
      <PrimaryButton
        disabled={dateRangeIsInvalid}
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
      description="Cross-application telemetry, operational performance audits, and aggregated business data exports."
      icon={<BarChart3 size={24} />}
      headerActions={headerActions}
    >
      {/* Scope Selector Tabs */}
      <div className="reports-scope-tabs" role="tablist" aria-label="Reports scope">
        <button
          type="button"
          role="tab"
          aria-selected={selectedScope === 'platform'}
          className={`reports-scope-tab ${selectedScope === 'platform' ? 'reports-scope-tab--active' : ''}`}
          onClick={() => handleScopeChange('platform')}
        >
          <span>Platform Overview</span>
          <span
            className="reports-scope-tag"
            style={{ backgroundColor: 'var(--color-primary, #f96321)' }}
          >
            CORE
          </span>
        </button>
        {projects.map((proj) => (
          <button
            key={proj.id}
            type="button"
            role="tab"
            aria-selected={selectedScope === proj.id}
            className={`reports-scope-tab ${selectedScope === proj.id ? 'reports-scope-tab--active' : ''}`}
            onClick={() => handleScopeChange(proj.id)}
          >
            <span>{proj.name}</span>
            <span
              className="reports-scope-tag"
              style={{ backgroundColor: proj.theme || 'var(--color-primary, #f96321)' }}
            >
              {proj.projectCode || 'CHILD'}
            </span>
          </button>
        ))}
      </div>

      {message && (
        <AlertMessage
          variant="info"
          message={message}
          onClose={() => setMessage('')}
        />
      )}

      {/* KPI Cards Grid */}
      <section className="reports-kpi-grid" aria-label="Summary statistics">
        {selectedScope === 'platform' ? (
          <>
            <StatisticsCard
              title="Platform Users"
              value={isLoading ? '--' : totalPlatformUsers}
              icon={<Users size={18} />}
              tone="orange"
              subtitle="Super Admin directory"
            />
            <StatisticsCard
              title="Managed Projects"
              value={isLoading ? '--' : projects.length}
              icon={<Layers size={18} />}
              tone="blue"
              subtitle={`${activeProjectsCount} active control plane projects`}
            />
            <StatisticsCard
              title="Child Applications"
              value={isLoading ? '--' : totalFrontendApps || 3}
              icon={<Store size={18} />}
              tone="green"
              subtitle="LTS SuperAdmin, Vendor & Telecaller"
            />
            <StatisticsCard
              title="SSO Gateway"
              value="Operational"
              icon={<ShieldCheck size={18} />}
              tone="purple"
              subtitle="JWT ticket handshake verified"
            />
          </>
        ) : (
          <>
            <StatisticsCard
              title="Total Vendors"
              value={isLoading || !childStats ? '--' : childStats.summary.totalVendors}
              icon={<Store size={18} />}
              tone="green"
              subtitle={childStats ? `+${childStats.summary.newVendorsToday} today` : 'Connecting bridge...'}
            />
            <StatisticsCard
              title="Total Customers"
              value={isLoading || !childStats ? '--' : childStats.summary.totalCustomers}
              icon={<UserRound size={18} />}
              tone="blue"
              subtitle={childStats ? `+${childStats.summary.newCustomersToday} today` : 'Connecting bridge...'}
            />
            <StatisticsCard
              title="Active Telecallers"
              value={isLoading || !childStats ? '--' : childStats.summary.totalTelecallers}
              icon={<PhoneCall size={18} />}
              tone="purple"
              subtitle={childStats ? `${childStats.summary.activeTelecallers} active calling` : 'Connecting bridge...'}
            />
            <StatisticsCard
              title="Pending Queries"
              value={isLoading || !childStats ? '--' : childStats.summary.pendingSupportTickets}
              icon={<Headset size={18} />}
              tone="orange"
              subtitle={childStats ? `${childStats.summary.totalSupportTickets} total tickets` : 'Connecting bridge...'}
            />
          </>
        )}
      </section>

      {/* Filter and Generator Form */}
      <section className="reports-card reports-filter-card">
        <div className="reports-section-heading">
          <h2>Generate {selectedScope === 'platform' ? 'Platform' : selectedProject?.name || 'Child'} Reports</h2>
          <p>
            Filter and query records directly from{' '}
            {selectedScope === 'platform' ? 'the Platform control plane database' : `${selectedProject?.name || 'child'} backend bridge`}.
          </p>
        </div>
        <form className="reports-filter-form" onSubmit={generateReport}>
          <label className="reports-field">
            <span>Report Category</span>
            <select
              value={reportType}
              onChange={(event) => {
                setReportType(event.target.value)
                setStatus('All')
              }}
            >
              {currentReportTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="reports-field">
            <span>Date Range</span>
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
            >
              {dateRanges.map((range) => (
                <option key={range}>{range}</option>
              ))}
            </select>
          </label>
          {dateRange === 'Custom Date Range' && (
            <>
              <label className="reports-field">
                <span>From Date</span>
                <input
                  type="date"
                  required
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </label>
              <label className="reports-field">
                <span>To Date</span>
                <input
                  type="date"
                  required
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </label>
            </>
          )}
          {dateRangeIsInvalid && (
            <p className="reports-date-error" role="alert">
              {dateError}
            </p>
          )}
          <label className="reports-field">
            <span>Status Filter</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <div className="reports-filter-actions">
            <PrimaryButton
              type="submit"
              disabled={dateRangeIsInvalid || isGenerating}
              isLoading={isGenerating}
              loadingText="Querying..."
              icon={<FileBarChart size={15} />}
            >
              Generate Report
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={resetFilters}
              icon={<RotateCcw size={14} />}
            >
              Reset Filters
            </SecondaryButton>
          </div>
        </form>
      </section>

      {/* Report Records Table */}
      <section className="reports-card reports-table-card">
        <div className="reports-card-heading reports-table-heading">
          <div>
            <h2>{generatedReport?.reportType ?? reportType}</h2>
            <p>
              {generatedReport
                ? `Showing ${tableRecords.length} records matching ${generatedReport.status} status (${generatedReport.dateRange}).`
                : 'Click "Generate Report" above to query live records from the target database.'}
            </p>
          </div>
          <SecondaryButton
            disabled={tableRecords.length === 0}
            onClick={exportReport}
            icon={<Download size={14} />}
          >
            Export CSV
          </SecondaryButton>
        </div>
        <div className="reports-table-scroll">
          <table className="reports-table">
            <thead>
              <tr>
                <th>RECORD ID</th>
                <th>ENTITY / NAME</th>
                <th>CATEGORY / SOURCE</th>
                <th>CONTACT / STORE / DETAILS</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {isGenerating ? (
                <TableSkeletonRows rows={5} columns={5} />
              ) : tableRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '1.5rem', border: 'none' }}>
                    <EmptyState
                      title="No report data generated yet"
                      description="Apply desired filters and click 'Generate Report' to query records."
                      size="sm"
                    />
                  </td>
                </tr>
              ) : (
                tableRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="reports-scope-tag" style={{ backgroundColor: selectedProject?.theme || '#f96321' }}>
                        {r.id}
                      </span>
                    </td>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>
                      <span className="user-panel-badge">{r.category}</span>
                    </td>
                    <td>{r.detail}</td>
                    <td>
                      <span className={`user-row-status status-badge--${r.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="reports-footnote">
        Telemetry aggregated from {selectedScope === 'platform' ? 'Platform Control Plane' : `${selectedProject?.name || 'Local Trade Street'} Database via API Bridge`}.
      </p>
    </ResponsiveLayout>
  )
}

export default ReportsPage
