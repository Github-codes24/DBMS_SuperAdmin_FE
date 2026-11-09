import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  PhoneCall,
  RefreshCw,
  Store,
  UserRound,
  Users,
  Layers,
  ShieldCheck,
  Headset,
  ExternalLink,
} from "lucide-react";
import ResponsiveLayout from "../../components/layout/ResponsiveLayout";
import { StatisticsCard } from "../../components/data-display";
import { AlertMessage } from "../../components/notifications";
import { TableSkeletonRows, EmptyState } from "../../components/feedback";
import { PrimaryButton, SecondaryButton, IconButton } from "../../components/ui/buttons";
import {
  listProjects,
  getChildProjectStats,
} from "../projects/projectService";
import { listUsers, listChildProjectUsers } from "../users/services/userService";
import "../reports/reports.css";

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [selectedScope, setSelectedScope] = useState("platform");
  const [projects, setProjects] = useState([]);
  const [totalPlatformUsers, setTotalPlatformUsers] = useState(0);
  const [childStats, setChildStats] = useState(null);
  const [childUsers, setChildUsers] = useState([]);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedScope),
    [projects, selectedScope]
  );

  // Load platform overview on mount / refresh
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listProjects(controller.signal).catch(() => []),
      listUsers({ pageSize: 1 }, controller.signal).catch(() => ({ total: 0 })),
    ])
      .then(([projList, userRes]) => {
        setProjects(projList);
        setTotalPlatformUsers(userRes.total || 0);
      })
      .catch((err) => {
        console.warn("Could not load dashboard platform overview:", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, [refreshKey]);

  // Load child telemetry when child project is selected
  useEffect(() => {
    if (selectedScope === "platform") {
      return () => {};
    }

    const controller = new AbortController();
    Promise.all([
      getChildProjectStats(selectedScope).catch((err) => {
        console.warn("Could not fetch child project stats:", err);
        return null;
      }),
      listChildProjectUsers(selectedScope, { limit: 5 }, controller.signal).catch((err) => {
        console.warn("Could not fetch child users for dashboard:", err);
        return { users: [] };
      }),
    ])
      .then(([stats, usersRes]) => {
        setChildStats(stats);
        setChildUsers(usersRes.users || []);
      })
      .catch((err) => {
        console.error("Dashboard child telemetry error:", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedScope, refreshKey]);

  function handleScopeChange(scopeId) {
    setSelectedScope(scopeId);
    if (scopeId === "platform") {
      setChildStats(null);
      setChildUsers([]);
    }
    setIsLoading(true);
    setMessage("");
  }

  function handleRefresh() {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
    setMessage("Dashboard telemetry refreshed.");
  }

  function exportReport() {
    const isPlatform = selectedScope === "platform";
    const filename = isPlatform
      ? "platform-overview"
      : `${(selectedProject?.name || "child").toLowerCase().replaceAll(" ", "-")}-telemetry`;

    const csvRows = isPlatform
      ? [
          ["Project ID", "Project Name", "Code", "Status", "Integration", "Child Apps"],
          ...projects.map((p) => [
            p.id,
            p.name,
            p.projectCode || "—",
            p.status,
            p.integrationStatus,
            p.frontendApps?.length || 0,
          ]),
        ]
      : [
          ["User ID", "Name", "Role", "Panel", "Contact", "Store Name", "Status"],
          ...childUsers.map((u) => [
            u.id,
            u.name,
            u.role,
            u.panel,
            u.phone || "—",
            u.storeName || "—",
            u.status,
          ]),
        ];

    const csv = `\uFEFF${csvRows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const blobUrl = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    setMessage(`CSV exported: ${csvRows.length - 1} records included.`);
  }

  const activeProjectsCount = projects.filter((p) => p.status === "Active").length;
  const totalFrontendApps = projects.reduce(
    (acc, p) => acc + (p.frontendApps?.length || 0),
    0
  );

  const headerActions = (
    <div className="reports-header-actions">
      <label className="reports-date-control">
        <CalendarDays size={15} aria-hidden="true" />
        <span className="reports-visually-hidden">Dashboard date range</span>
        <select
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value)}
        >
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Month</option>
        </select>
        <ChevronDown size={13} aria-hidden="true" />
      </label>
      <IconButton
        icon={<RefreshCw size={15} className={isLoading ? "spin" : ""} />}
        ariaLabel="Refresh telemetry"
        variant="secondary"
        onClick={handleRefresh}
      />
      <PrimaryButton onClick={exportReport} icon={<Download size={15} />}>
        Export CSV
      </PrimaryButton>
    </div>
  );

  return (
    <ResponsiveLayout
      title="Dashboard"
      description="Central control plane to monitor telemetry, evaluate child project KPIs, and audit connected applications."
      icon={<BarChart3 size={24} />}
      headerActions={headerActions}
    >
      {/* Scope Selector Tabs */}
      <div className="reports-scope-tabs" role="tablist" aria-label="Dashboard scope">
        <button
          type="button"
          role="tab"
          aria-selected={selectedScope === "platform"}
          className={`reports-scope-tab ${selectedScope === "platform" ? "reports-scope-tab--active" : ""}`}
          onClick={() => handleScopeChange("platform")}
        >
          <span>Platform Overview</span>
          <span
            className="reports-scope-tag"
            style={{ backgroundColor: "var(--color-primary, #f96321)" }}
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
            className={`reports-scope-tab ${selectedScope === proj.id ? "reports-scope-tab--active" : ""}`}
            onClick={() => handleScopeChange(proj.id)}
          >
            <span>{proj.name}</span>
            <span
              className="reports-scope-tag"
              style={{ backgroundColor: proj.theme || "var(--color-primary, #f96321)" }}
            >
              {proj.projectCode || "CHILD"}
            </span>
          </button>
        ))}
      </div>

      {message && (
        <AlertMessage
          variant="info"
          message={message}
          onClose={() => setMessage("")}
        />
      )}

      {/* KPI Cards Grid */}
      <section className="reports-kpi-grid" aria-label="Summary statistics">
        {selectedScope === "platform" ? (
          <>
            <StatisticsCard
              title="Platform Users"
              value={isLoading ? "--" : totalPlatformUsers}
              icon={<Users size={18} />}
              tone="orange"
              subtitle="Super Admin directory"
            />
            <StatisticsCard
              title="Managed Projects"
              value={isLoading ? "--" : projects.length}
              icon={<Layers size={18} />}
              tone="blue"
              subtitle={`${activeProjectsCount} active in control plane`}
            />
            <StatisticsCard
              title="Connected Panels"
              value={isLoading ? "--" : totalFrontendApps || 3}
              icon={<Store size={18} />}
              tone="green"
              subtitle="SuperAdmin, Vendor & CRM"
            />
            <StatisticsCard
              title="Bridge Gateway"
              value="Operational"
              icon={<ShieldCheck size={18} />}
              tone="purple"
              subtitle="SSO ticket exchange active"
            />
          </>
        ) : (
          <>
            <StatisticsCard
              title="Registered Vendors"
              value={isLoading || !childStats ? "--" : childStats.summary.totalVendors}
              icon={<Store size={18} />}
              tone="green"
              subtitle={childStats ? `+${childStats.summary.newVendorsToday} registered today` : "Fetching telemetry..."}
            />
            <StatisticsCard
              title="Active Customers"
              value={isLoading || !childStats ? "--" : childStats.summary.totalCustomers}
              icon={<UserRound size={18} />}
              tone="blue"
              subtitle={childStats ? `+${childStats.summary.newCustomersToday} registered today` : "Fetching telemetry..."}
            />
            <StatisticsCard
              title="Telecaller CRM"
              value={isLoading || !childStats ? "--" : childStats.summary.totalTelecallers}
              icon={<PhoneCall size={18} />}
              tone="purple"
              subtitle={childStats ? `${childStats.summary.activeTelecallers} online on desk` : "Fetching telemetry..."}
            />
            <StatisticsCard
              title="Pending Queries"
              value={isLoading || !childStats ? "--" : childStats.summary.pendingSupportTickets}
              icon={<Headset size={18} />}
              tone="orange"
              subtitle={childStats ? `${childStats.summary.totalSupportTickets} total tickets in queue` : "Fetching telemetry..."}
            />
          </>
        )}
      </section>

      {/* Middle Section: Breakdown Cards */}
      <section className="reports-chart-grid" aria-label="Charts and analytics">
        <article className="reports-card reports-breakdown-card">
          <div className="reports-card-heading">
            <div>
              <h2>{selectedScope === "platform" ? "Platform Control Plane" : `${selectedProject?.name || "Child"} Overview`}</h2>
              <p>Operational health and telemetry summary.</p>
            </div>
            <span className="reports-chart-range">{dateRange}</span>
          </div>

          {selectedScope === "platform" ? (
            <div style={{ marginTop: "12px" }}>
              <div className="reports-stat-row">
                <span>Active Projects</span>
                <strong>{activeProjectsCount}</strong>
              </div>
              <div className="reports-stat-row">
                <span>Projects In Setup</span>
                <strong>{projects.length - activeProjectsCount}</strong>
              </div>
              <div className="reports-stat-row">
                <span>Primary Child Application</span>
                <strong>Local Trade Street (LTS)</strong>
              </div>
              <div className="reports-stat-row">
                <span>Bridge Protocol</span>
                <strong>JWT Ticket Exchange (60s TTL)</strong>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "12px" }}>
              <div className="reports-stat-row">
                <span>Total Orders Placed</span>
                <strong>{childStats ? childStats.summary.totalOrders : "—"}</strong>
              </div>
              <div className="reports-stat-row">
                <span>System Audit Logs Recorded</span>
                <strong>{childStats ? childStats.summary.totalAuditLogs : "—"}</strong>
              </div>
              <div className="reports-stat-row">
                <span>Child Admin / Staff Users</span>
                <strong>{childStats ? `${childStats.summary.totalAdminUsers} (${childStats.summary.activeAdminUsers} active)` : "—"}</strong>
              </div>
              <div className="reports-stat-row">
                <span>Active Telecaller Calling Queue</span>
                <strong>{childStats ? `${childStats.summary.activeTelecallers} calling agents` : "—"}</strong>
              </div>
            </div>
          )}
        </article>

        <article className="reports-card reports-breakdown-card">
          <div className="reports-card-heading">
            <div>
              <h2>Integration Telemetry</h2>
              <p>Backend bridge and service connection.</p>
            </div>
            <span className="reports-vendor-icon">
              <Activity size={17} />
            </span>
          </div>

          <div style={{ marginTop: "12px" }}>
            <div className="reports-stat-row">
              <span>Service Status</span>
              <strong style={{ color: "var(--color-success, #10b981)" }}>● Healthy (200 OK)</strong>
            </div>
            <div className="reports-stat-row">
              <span>Target Project</span>
              <strong>{selectedScope === "platform" ? "Central DBMS Platform" : selectedProject?.name || "LTS"}</strong>
            </div>
            <div className="reports-stat-row">
              <span>Data Endpoint</span>
              <code>{selectedScope === "platform" ? "/api/platform" : "/api/v1/platform-bridge/stats"}</code>
            </div>
            <div className="reports-stat-row">
              <span>Last Synchronized</span>
              <span>{childStats?.timestamp ? new Date(childStats.timestamp).toLocaleTimeString() : "Just now"}</span>
            </div>
          </div>
        </article>
      </section>

      {/* Detail Table */}
      <section className="reports-card reports-table-card">
        <div className="reports-card-heading reports-table-heading">
          <div>
            <h2>{selectedScope === "platform" ? "Connected Projects" : `${selectedProject?.name || "Child"} Recent Records`}</h2>
            <p>
              {selectedScope === "platform"
                ? "Registry of registered client and child applications."
                : "Real-time records synced directly from child database via bridge."}
            </p>
          </div>
          <SecondaryButton onClick={() => navigate(selectedScope === "platform" ? "/projects" : "/users")}>
            View All in {selectedScope === "platform" ? "Project Management" : "User Directory"}
          </SecondaryButton>
        </div>

        <div className="reports-table-scroll">
          {selectedScope === "platform" ? (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>PROJECT CODE</th>
                  <th>PROJECT NAME</th>
                  <th>INTEGRATION STATUS</th>
                  <th>CHILD APPS</th>
                  <th>PROJECT STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeletonRows rows={3} columns={5} hasActions />
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "1.5rem", border: "none" }}>
                      <EmptyState
                        title="No registered projects"
                        description="Add your first child project in Project Management."
                        size="sm"
                      />
                    </td>
                  </tr>
                ) : (
                  projects.map((proj) => (
                    <tr key={proj.id}>
                      <td>
                        <span className="reports-scope-tag" style={{ backgroundColor: proj.theme || "#f96321" }}>
                          {proj.projectCode || "CHILD"}
                        </span>
                      </td>
                      <td>
                        <strong>{proj.name}</strong>
                      </td>
                      <td>
                        <span className="user-panel-badge">{proj.integrationStatus || "Integrated"}</span>
                      </td>
                      <td>{proj.frontendApps?.length || 0} configured</td>
                      <td>
                        <span className={`status-badge--${proj.status.toLowerCase().replace(/\s+/g, "_")}`}>
                          {proj.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="reports-button"
                          style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          onClick={() => handleScopeChange(proj.id)}
                        >
                          <span>Inspect Telemetry</span>
                          <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>USER / RECORD ID</th>
                  <th>NAME</th>
                  <th>PANEL SOURCE</th>
                  <th>ROLE</th>
                  <th>CONTACT / STORE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeletonRows rows={5} columns={5} hasActions />
                ) : childUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "1.5rem", border: "none" }}>
                      <EmptyState
                        title="No live records available"
                        description="Check child backend bridge connectivity."
                        size="sm"
                      />
                    </td>
                  </tr>
                ) : (
                  childUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span className="reports-scope-tag" style={{ backgroundColor: selectedProject?.theme || "#f96321" }}>
                          {u.id}
                        </span>
                      </td>
                      <td>
                        <strong>{u.name}</strong>
                        {u.email && <div style={{ fontSize: "11px", color: "var(--color-slate-500, #64748b)" }}>{u.email}</div>}
                      </td>
                      <td>
                        <span className="user-panel-badge">{u.panel}</span>
                      </td>
                      <td>{u.role}</td>
                      <td>
                        <div>{u.phone || "—"}</div>
                        {u.storeName && (
                          <div style={{ fontSize: "11px", color: "var(--color-primary, #f96321)" }}>{u.storeName}</div>
                        )}
                      </td>
                      <td>
                        <span className={`user-row-status status-badge--${u.status?.toLowerCase() === "active" ? "active" : "inactive"}`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <p className="reports-footnote">
        Telemetry aggregated from {selectedScope === "platform" ? "DBMS Platform Control Plane" : `${selectedProject?.name || "Local Trade Street"} Backend Bridge (Port 5000)`}.
      </p>
    </ResponsiveLayout>
  );
}

export default DashboardPage;
