import { clearAccessToken, getAccessToken, setAccessToken } from "../auth/authService";
import { apiBaseUrl } from "../../api";
import type {
  ManagedProject,
  PanelLink,
  ProjectAdmin,
  ProjectAdminInput,
  ProjectAdminStatus,
  ProjectStats,
  ProjectStatus,
  ProjectUser,
  UserType,
} from "./projectData";

// All project management routes live under /api/platform
const BASE = `${apiBaseUrl}/platform`;

type ApiRecord = Record<string, unknown>;

export class ProjectAuthenticationError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "ProjectAuthenticationError";
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload) as { exp?: number };
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 <= Date.now();
    }
    return false;
  } catch {
    return true;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const payload = body?.data ?? body;
    const newAccessToken = payload?.accessToken;
    if (newAccessToken && typeof newAccessToken === "string") {
      setAccessToken(newAccessToken);
      if (payload?.refreshToken && typeof payload.refreshToken === "string") {
        localStorage.setItem("refreshToken", payload.refreshToken);
      }
      return newAccessToken;
    }
    return null;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): ApiRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("The projects API returned an invalid response.");
  }
  return value as ApiRecord;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`The projects API response is missing ${field}.`);
  }
  return String(value);
}

function optionalString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function unwrapList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const response = asRecord(value);
  const data = response.data;
  if (Array.isArray(data)) return data;
  const nested =
    typeof data === "object" && data !== null && !Array.isArray(data)
      ? asRecord(data)
      : {};
  const items =
    nested.admins ??
    nested.projectAdmins ??
    nested.projects ??
    nested.items ??
    nested.users ??
    response.admins ??
    response.projectAdmins ??
    response.projects ??
    response.items ??
    response.users;
  if (Array.isArray(items)) return items;
  return [];
}

function unwrapProjects(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const response = asRecord(value);
  const data = response.data;
  if (Array.isArray(data)) return data;
  const nested =
    typeof data === "object" && data !== null && !Array.isArray(data)
      ? asRecord(data)
      : {};
  const projects =
    nested.projects ?? nested.items ?? response.projects ?? response.items;
  if (!Array.isArray(projects)) {
    throw new Error("The projects API returned an invalid list response.");
  }
  return projects;
}

function normalizeStatus(value: unknown): ProjectStatus {
  const raw = String(value ?? "active")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  switch (raw) {
    case "active":
      return "Active";
    case "upcoming":
      return "Upcoming";
    case "completed":
      return "Completed";
    case "hold":
    case "on_hold":
    case "inactive":
      return "On Hold";
    default:
      console.warn(`[projectService] Unknown status "${raw}", defaulting to Active`);
      return "Active";
  }
}

function statusToApi(status: ProjectStatus): string {
  switch (status) {
    case "Active":
      return "active";
    case "Upcoming":
      return "upcoming";
    case "Completed":
      return "completed";
    case "On Hold":
      return "on_hold";
  }
}

function relatedId(value: unknown, field: string): string {
  if (value == null || value === "") return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  const related = asRecord(value);
  return asString(related.id ?? related._id ?? related.projectAdminId, field);
}

function normalizePanelLinks(value: unknown): PanelLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ApiRecord => typeof item === "object" && item !== null,
    )
    .map((item) => ({
      name: optionalString(item.name),
      url: optionalString(item.url),
    }))
    .filter((pl) => pl.name || pl.url);
}

function normalizeUserTypes(value: unknown): UserType[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ApiRecord => typeof item === "object" && item !== null,
    )
    .map((item) => ({
      role: optionalString(item.role),
      count:
        typeof item.count === "number" ? item.count : Number(item.count ?? 0),
    }))
    .filter((ut) => ut.role);
}

function mapProject(value: unknown): ManagedProject {
  const record = asRecord(value);
  const adminRaw =
    record.adminId ??
    record.projectAdminId ??
    record.projectAdmin ??
    record.assignedAdmin;

  let adminObj: ManagedProject["admin"] = undefined;
  if (typeof adminRaw === "object" && adminRaw !== null) {
    const aRec = adminRaw as Record<string, unknown>;
    adminObj = {
      id: optionalString(aRec._id ?? aRec.id),
      name: optionalString(aRec.name ?? aRec.fullName),
      email: optionalString(aRec.email),
      phone: optionalString(aRec.phone),
      username: optionalString(aRec.username),
    };
  }

  return {
    id: asString(
      record._id ?? record.id ?? record.projectId,
      "a project identifier",
    ),
    projectId: optionalString(record.projectId),
    name: asString(
      record.name ?? record.projectName ?? record.title,
      "a project name",
    ),
    description: optionalString(record.description),
    logo: optionalString(record.logo),
    theme: optionalString(record.theme) || "#f96321",
    startDate: optionalString(record.startDate ?? record.start_date).slice(0, 10),
    endDate: optionalString(record.endDate ?? record.end_date).slice(0, 10),
    status: normalizeStatus(record.status ?? record.projectStatus),
    adminId: relatedId(adminRaw, "a project admin identifier"),
    admin: adminObj,
    panelLinks: normalizePanelLinks(record.panelLinks),
    userTypes: normalizeUserTypes(record.userTypes),
  };
}

function mapProjectAdmin(value: unknown): ProjectAdmin {
  const record = asRecord(value);
  const id = asString(record._id ?? record.id, "an admin identifier");
  const name = optionalString(record.fullName ?? record.name) || "Admin";
  const email = optionalString(record.email);
  const phone = optionalString(record.phone);
  const username = optionalString(record.username);
  const rawStatus = optionalString(record.status).toLowerCase();
  const isActive =
    typeof record.isActive === "boolean"
      ? record.isActive
      : rawStatus === "active";
  const status: ProjectAdminStatus =
    isActive || rawStatus === "active" ? "Active" : "Inactive";

  let projectIds: string[] = [];
  if (Array.isArray(record.projectIds)) {
    projectIds = record.projectIds.map((p) => String(p));
  } else if (Array.isArray(record.projects)) {
    projectIds = record.projects
      .map((p) => {
        if (typeof p === "string") return p;
        if (typeof p === "object" && p !== null) {
          const rec = p as Record<string, unknown>;
          return String(rec.id ?? rec._id ?? rec.projectId ?? "");
        }
        return "";
      })
      .filter(Boolean);
  }

  return {
    id,
    name,
    email,
    phone,
    username,
    status,
    isActive,
    projectIds,
  };
}

function mapProjectUser(value: unknown): ProjectUser {
  const record = asRecord(value);
  const pRole = record.projectRole as Record<string, unknown> | undefined;

  return {
    id: asString(record._id ?? record.id, "a user identifier"),
    name: optionalString(record.name ?? record.fullName),
    email: optionalString(record.email),
    role: optionalString(record.role) || "User",
    projectRole: pRole
      ? {
          roleId: optionalString(pRole.roleId ?? pRole.id),
          roleName: optionalString(pRole.roleName ?? pRole.name),
          isActive: Boolean(pRole.isActive ?? true),
        }
      : undefined,
    isActive: Boolean(record.isActive ?? true),
    createdAt: optionalString(record.createdAt ?? record.created_at),
  };
}

function projectPayload(
  project: Partial<Omit<ManagedProject, "id">>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (project.name !== undefined) payload.name = project.name.trim();
  if (project.description !== undefined) payload.description = (project.description || "").trim();
  if (project.logo !== undefined) payload.logo = (project.logo || "").trim();
  if (project.theme !== undefined) payload.theme = (project.theme || "#f96321").trim();
  if (project.startDate !== undefined) payload.startDate = (project.startDate || "").trim();
  if (project.endDate !== undefined) payload.endDate = (project.endDate || "").trim();
  if (project.status !== undefined) payload.status = statusToApi(project.status);
  if (project.adminId !== undefined) payload.adminId = (project.adminId || "").trim();
  if (project.panelLinks !== undefined) payload.panelLinks = project.panelLinks ?? [];
  if (project.userTypes !== undefined) payload.userTypes = project.userTypes ?? [];
  return payload;
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let accessToken = getAccessToken();

  if (!accessToken || isTokenExpired(accessToken)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = refreshed;
    } else if (!accessToken) {
      clearAccessToken();
      throw new ProjectAuthenticationError();
    }
  }

  let response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  // If 401, attempt silent refresh once
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = refreshed;
      response = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
          ...init?.headers,
        },
      });
    } else {
      clearAccessToken();
      throw new ProjectAuthenticationError();
    }
  }

  if (response.status === 403) {
    throw new Error("Access Denied: You do not have permission to perform this action.");
  }

  const responseText = await response.text();

  if (!response.ok) {
    if (
      responseText.includes("INVALID_TOKEN") ||
      responseText.includes("SESSION_REVOKED") ||
      responseText.includes("jwt expired") ||
      responseText.includes("Missing access token")
    ) {
      clearAccessToken();
      throw new ProjectAuthenticationError();
    }

    let message = `Request failed (${response.status}).`;
    if (responseText) {
      try {
        const body: unknown = JSON.parse(responseText);
        if (typeof body === "object" && body !== null && !Array.isArray(body)) {
          const rec = body as ApiRecord;
          if (typeof rec.message === "string") message = rec.message;
          else if (typeof rec.error === "string") message = rec.error;
        }
      } catch {
        message = responseText;
      }
    } else if (response.statusText) {
      message = response.statusText;
    }
    throw new Error(message);
  }

  if (!responseText) return undefined;
  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    throw new Error("The API returned invalid JSON.");
  }
}

function mapUserToProjectAdmin(u: unknown): ProjectAdmin {
  const rec = asRecord(u);
  const id = String(rec.id ?? rec._id ?? "");
  const name = String(rec.fullName ?? rec.name ?? "Admin");
  const email = String(rec.email ?? "");
  const phone = String(rec.phoneNumber ?? rec.phone ?? "");
  const username = String(rec.username ?? (email ? email.split("@")[0] : ""));
  const statusStr = String(
    rec.status ?? (rec.isActive ? "active" : "inactive"),
  ).toLowerCase();
  const status: ProjectAdminStatus =
    statusStr === "inactive" ? "Inactive" : "Active";
  const rawProjects =
    rec.assignedProjects ?? rec.projects ?? rec.projectIds ?? [];
  const projectIds = Array.isArray(rawProjects)
    ? rawProjects
        .map((p) => {
          if (typeof p === "string") return p;
          if (typeof p === "object" && p !== null) {
            const prec = p as Record<string, unknown>;
            return String(prec.id ?? prec._id ?? prec.projectId ?? "");
          }
          return "";
        })
        .filter(Boolean)
    : [];
  return { id, name, email, phone, username, status, projectIds };
}

// ─── Project APIs ─────────────────────────────────────────────────────────────

export async function getProjectStats(
  signal?: AbortSignal,
): Promise<ProjectStats | null> {
  try {
    const response = await request("/projects/stats", { signal });
    const rec = asRecord(response);
    const data = asRecord(rec.data ?? rec);
    return {
      totalProjects: Number(data.totalProjects ?? 0),
      activeProjects: Number(data.activeProjects ?? 0),
      completedProjects: Number(data.completedProjects ?? 0),
      totalProjectAdmins: Number(data.totalProjectAdmins ?? 0),
      onHoldProjects: Number(data.onHoldProjects ?? 0),
      upcomingProjects: Number(data.upcomingProjects ?? 0),
    };
  } catch {
    // If backend route is not deployed yet, gracefully return null
    return null;
  }
}

export async function listProjects(
  params?: { search?: string; status?: string },
  signal?: AbortSignal,
): Promise<ManagedProject[]> {
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.status && params.status !== "All") {
    query.set("status", statusToApi(params.status as ProjectStatus));
  }
  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await request(`/projects${qs}`, { signal });
  return unwrapProjects(response).map(mapProject);
}

export async function getProject(
  projectId: string,
  signal?: AbortSignal,
): Promise<ManagedProject> {
  const response = await request(`/projects/${encodeURIComponent(projectId)}`, {
    signal,
  });
  const rec = asRecord(response);
  return mapProject(rec.data ?? rec);
}

export async function createProject(
  project: Omit<ManagedProject, "id">,
): Promise<ManagedProject | void> {
  const response = await request("/projects", {
    method: "POST",
    body: JSON.stringify(projectPayload(project)),
  });
  if (response && typeof response === "object") {
    const rec = response as ApiRecord;
    const data = rec.data ?? rec;
    if (data && typeof data === "object") {
      try {
        return mapProject(data);
      } catch {
        // Fallback if returned minimal fields
      }
    }
  }
}

export async function updateProject(
  id: string,
  project: Partial<Omit<ManagedProject, "id">>,
): Promise<void> {
  await request(`/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(projectPayload(project)),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await request(`/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── Project Admins APIs ──────────────────────────────────────────────────────

export async function listProjectAdmins(
  signal?: AbortSignal,
): Promise<ProjectAdmin[]> {
  try {
    const response = await request("/project-admins", { signal });
    return unwrapList(response).map(mapProjectAdmin);
  } catch (err) {
    try {
      const response = await request("/admins", { signal });
      return unwrapList(response).map(mapProjectAdmin);
    } catch {
      // Fallback: try fetching users with role=admin from existing /api/users
      try {
        const token = getAccessToken();
        if (token) {
          const usersRes = await fetch(`${apiBaseUrl}/users?role=admin&limit=100`, {
            signal,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });
          if (usersRes.ok) {
            const body: unknown = await usersRes.json();
            const list = unwrapList(body);
            if (list.length > 0) {
              return list.map(mapUserToProjectAdmin);
            }
          }
        }
      } catch {
        // Fall through to throw err so local cache is used
      }
      throw err;
    }
  }
}

export async function createProjectAdmin(
  input: ProjectAdminInput,
): Promise<ProjectAdmin> {
  const payload = {
    fullName: input.fullName.trim(),
    name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: (input.phone || "").trim(),
    username: (input.username || "").trim(),
    status: input.status || "Active",
    projects: input.projects ?? [],
    ...(input.password ? { password: input.password } : {}),
  };

  let response: unknown;
  try {
    response = await request("/project-admins", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    try {
      response = await request("/admins", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      throw err;
    }
  }
  const rec = asRecord(response);
  return mapProjectAdmin(rec.data ?? rec);
}

export async function updateProjectAdmin(
  adminId: string,
  input: Partial<ProjectAdminInput>,
): Promise<ProjectAdmin> {
  const payload: Record<string, unknown> = {};
  if (input.fullName !== undefined) {
    payload.fullName = input.fullName.trim();
    payload.name = input.fullName.trim();
  }
  if (input.email !== undefined) payload.email = input.email.trim().toLowerCase();
  if (input.phone !== undefined) payload.phone = (input.phone || "").trim();
  if (input.username !== undefined) payload.username = (input.username || "").trim();
  if (input.status !== undefined) payload.status = input.status;
  if (input.projects !== undefined) payload.projects = input.projects;

  let response: unknown;
  try {
    response = await request(`/project-admins/${encodeURIComponent(adminId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    try {
      response = await request(`/admins/${encodeURIComponent(adminId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } catch {
      throw err;
    }
  }
  const rec = asRecord(response);
  return mapProjectAdmin(rec.data ?? rec);
}

export async function deleteProjectAdmin(adminId: string): Promise<void> {
  try {
    await request(`/project-admins/${encodeURIComponent(adminId)}`, {
      method: "DELETE",
    });
  } catch (err) {
    await request(`/admins/${encodeURIComponent(adminId)}`, {
      method: "DELETE",
    });
  }
}

// ─── Project Users & Roles API ────────────────────────────────────────────────

export async function listProjectUsers(
  projectId: string,
  signal?: AbortSignal,
): Promise<ProjectUser[]> {
  const response = await request(
    `/projects/${encodeURIComponent(projectId)}/users`,
    { signal },
  );
  return unwrapList(response).map(mapProjectUser);
}
