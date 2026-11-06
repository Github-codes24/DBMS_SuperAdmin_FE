export type ProjectStatus = "Active" | "Upcoming" | "Completed" | "On Hold";
export type ProjectAdminStatus = "Active" | "Inactive";

export interface PanelLink {
  name: string;
  url: string;
}

export interface UserType {
  role: string;
  count: number;
}

export interface ManagedProject {
  id: string;
  name: string;
  description: string;
  logo: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  adminId: string;
  panelLinks: PanelLink[];
  userTypes: UserType[];
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
