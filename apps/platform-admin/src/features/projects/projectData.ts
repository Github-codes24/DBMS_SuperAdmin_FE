export type ProjectStatus = "Active" | "Upcoming" | "Completed" | "On Hold";
export type ProjectAdminStatus = "Active" | "Inactive";
export type IntegrationStatus = "Unlinked" | "Registered" | "Connected" | "Sync Failed";

export interface PanelLink {
  name: string;
  url: string;
}

export interface UserType {
  role: string;
  count: number;
}

export interface ChildFrontendApp {
  appKey: string;
  name: string;
  baseUrl: string;
  allowedRoles?: string[];
  ssoCallbackPath?: string;
  isDefault?: boolean;
}

export interface ChildBackendConfig {
  baseUrl: string;
  bridgePrefix: string;
  authType: "api_key" | "hmac" | "service_jwt";
  secretKeyId?: string;
  timeoutMs?: number;
  retryAttempts?: number;
}

export interface ChildHealthStatus {
  isHealthy: boolean;
  latencyMs?: number;
  lastCheckedAt?: string | null;
  errorMessage?: string;
  version?: string;
}

export interface ManagedProject {
  id: string;
  projectCode?: string;
  name: string;
  description: string;
  logo: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  integrationStatus?: IntegrationStatus;
  adminId: string;
  panelLinks: PanelLink[];
  userTypes: UserType[];
  frontendApps?: ChildFrontendApp[];
  backendConfig?: ChildBackendConfig;
  healthStatus?: ChildHealthStatus;
  availableModules?: string[];
}

export interface ProjectAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  status: ProjectAdminStatus;
  isActive?: boolean;
  projectIds: string[];
}

export const projectStatuses: ProjectStatus[] = [
  "Active",
  "Upcoming",
  "Completed",
  "On Hold",
];

export const integrationStatuses: IntegrationStatus[] = [
  "Unlinked",
  "Registered",
  "Connected",
  "Sync Failed",
];

export const DEFAULT_CHILD_BACKEND_CONFIG: ChildBackendConfig = {
  baseUrl: "",
  bridgePrefix: "/api/v1/platform-bridge",
  authType: "api_key",
  secretKeyId: "",
  timeoutMs: 5000,
  retryAttempts: 2,
};

export const DEFAULT_PROJECT_THEME = "#f96321";

export const initialProjectAdmins: ProjectAdmin[] = [
  {
    id: "admin-1",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 43210",
    username: "aarav.mehta",
    status: "Active",
    projectIds: [],
  },
  {
    id: "admin-2",
    name: "Diya Sharma",
    email: "diya.sharma@example.com",
    phone: "+91 98765 43211",
    username: "diya.sharma",
    status: "Active",
    projectIds: [],
  },
];

/** Fallback when API is unavailable – empty so the page loads cleanly */
export const initialProjects: ManagedProject[] = [];
