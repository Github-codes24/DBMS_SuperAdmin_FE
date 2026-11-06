import { clearAccessToken, getAccessToken } from "../auth/authService";
import { apiBaseUrl } from "../../api";
import type {
  ManagedProject,
  PanelLink,
  ProjectStatus,
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
      return payload.exp * 1000 <= Date.now() + 10000;
    }
    return false;
  } catch {
    return true;
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
      console.warn(
        `[projectService] Unknown status "${raw}", defaulting to Active`,
      );
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
  if (typeof value === "string" || typeof value === "number")
    return String(value);
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
  return {
    id: asString(
      record._id ?? record.id ?? record.projectId,
      "a project identifier",
    ),
    name: asString(
      record.name ?? record.projectName ?? record.title,
      "a project name",
    ),
    description: optionalString(record.description),
    logo: optionalString(record.logo),
    theme: optionalString(record.theme) || "#f96321",
    startDate: optionalString(record.startDate ?? record.start_date).slice(
      0,
      10,
    ),
    endDate: optionalString(record.endDate ?? record.end_date).slice(0, 10),
    status: normalizeStatus(record.status ?? record.projectStatus),
    adminId: relatedId(
      record.adminId ??
        record.projectAdminId ??
        record.projectAdmin ??
        record.assignedAdmin,
      "a project admin identifier",
    ),
    panelLinks: normalizePanelLinks(record.panelLinks),
    userTypes: normalizeUserTypes(record.userTypes),
  };
}

function projectPayload(
  project: Omit<ManagedProject, "id">,
): Record<string, unknown> {
  return {
    name: project.name,
    description: project.description,
    logo: project.logo,
    theme: project.theme,
    startDate: project.startDate,
    endDate: project.endDate,
    status: statusToApi(project.status),
    adminId: project.adminId,
    panelLinks: project.panelLinks,
    userTypes: project.userTypes,
  };
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const accessToken = getAccessToken();
  if (!accessToken || isTokenExpired(accessToken)) {
    clearAccessToken();
    throw new ProjectAuthenticationError();
  }

  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const responseText = await response.text();
  console.log("[platform API]", init?.method ?? "GET", path, response.status);

  if (response.status === 401 || response.status === 403) {
    clearAccessToken();
    throw new ProjectAuthenticationError();
  }

  if (!response.ok) {
    // If backend returned 500 or any error indicating an invalid or expired token
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

export async function listProjects(
  signal?: AbortSignal,
): Promise<ManagedProject[]> {
  const response = await request("/projects", { signal });
  return unwrapProjects(response).map(mapProject);
}

export async function createProject(
  project: Omit<ManagedProject, "id">,
): Promise<void> {
  await request("/projects", {
    method: "POST",
    body: JSON.stringify(projectPayload(project)),
  });
}

export async function updateProject(
  id: string,
  project: Omit<ManagedProject, "id">,
): Promise<void> {
  await request(`/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(projectPayload(project)),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await request(`/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
}
