import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownUp,
  Calendar,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  ExternalLink,
  FolderKanban,
  LayoutGrid,
  Mail,
  CalendarClock,
  PauseCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRound,
  UserRoundPlus,
  Users,
  UsersRound,
  X,
  Globe,
  Server,
  Activity,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import ResponsiveLayout from "../../components/layout/ResponsiveLayout";
import { useToast, useConfirm } from "../../context";
import { Modal, ImagePreview } from "../../components/overlays";
import { StatisticsCard, StatusBadge, DataDetailView } from "../../components/data-display";
import { CardSkeleton, EmptyState, NoSearchResults } from "../../components/feedback";
import { PrimaryButton, SecondaryButton, DangerButton, BackButton } from "../../components/ui/buttons";
import { AlertMessage } from "../../components/notifications";
import {
  DEFAULT_CHILD_BACKEND_CONFIG,
  DEFAULT_PROJECT_THEME,
  initialProjectAdmins,
  integrationStatuses,
  projectStatuses,
  type ChildBackendConfig,
  type ChildFrontendApp,
  type IntegrationStatus,
  type ManagedProject,
  type PanelLink,
  type ProjectAdmin,
  type ProjectAdminStatus,
  type ProjectStatus,
  type UserType,
} from "./projectData";
import "./projectManagement.css";
import { getFromStorage, saveToStorage } from "../../utils/storage";
import {
  checkProjectHealth,
  createProject,
  deleteProject as deleteProjectRequest,
  getChildProjectStats,
  launchProjectSso,
  listProjects,
  ProjectAuthenticationError,
  updateProject,
  type ChildBridgeStats,
} from "./projectService";

// ─── Types ───────────────────────────────────────────────────────────────────
type ProjectForm = Omit<ManagedProject, "id">;
type ProjectAdminForm = Omit<ProjectAdmin, "id">;
type SortField = "name" | "startDate";

const PROJECT_ADMINS_STORAGE_KEY = "platform-admin.project-admins";

const emptyProjectForm: ProjectForm = {
  name: "",
  projectCode: "",
  description: "",
  logo: "",
  theme: DEFAULT_PROJECT_THEME,
  startDate: "",
  endDate: "",
  status: "Upcoming",
  integrationStatus: "Unlinked",
  adminId: "",
  panelLinks: [],
  userTypes: [],
  frontendApps: [],
  backendConfig: { ...DEFAULT_CHILD_BACKEND_CONFIG },
  availableModules: [],
};

const emptyAdminForm: ProjectAdminForm = {
  name: "",
  email: "",
  phone: "",
  username: "",
  status: "Active",
  projectIds: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

function totalUsers(project: ManagedProject) {
  return project.userTypes.reduce((s, ut) => s + (ut.count || 0), 0);
}

function statusClass(status: ProjectStatus): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function isProjectAdminActive(admin: ProjectAdmin) {
  return admin.status.toLowerCase() === "active" || admin.isActive === true;
}

function processLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload an image file (PNG, JPG, SVG, WebP)."));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Image size should be less than 2MB."));
      return;
    }

    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read SVG file."));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png", 0.92));
        } else {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => reject(new Error("Failed to process image."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LogoProps {
  name: string;
  logo: string;
  theme: string;
  size: "sm" | "lg";
}
function ProjectLogo({ name, logo, theme, size }: LogoProps) {
  const [err, setErr] = useState(false);
  const src = logo?.trim();
  return (
    <span
      className={`pm-project-logo pm-project-logo--${size}`}
      style={{ background: theme || DEFAULT_PROJECT_THEME }}
    >
      {src && !err ? (
        <img src={src} alt={name} onError={() => setErr(true)} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  tone: "orange" | "green" | "purple" | "blue";
}
function SummaryCard({ title, value, icon, tone }: SummaryCardProps) {
  return (
    <StatisticsCard
      title={title}
      value={value}
      icon={icon}
      tone={tone}
      subtitle="Across the platform"
      className="projects-summary-card"
    />
  );
}

function ModalActions({
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  hideSubmit = false,
  submitDisabled = false,
}: {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  hideSubmit?: boolean;
  submitDisabled?: boolean;
}) {
  return (
    <div className="projects-modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
      <SecondaryButton
        type="button"
        onClick={onCancel}
      >
        {cancelLabel}
      </SecondaryButton>
      {!hideSubmit && (
        <PrimaryButton
          type="submit"
          disabled={submitDisabled}
          icon={<Check size={15} />}
        >
          {submitLabel}
        </PrimaryButton>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ProjectManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  // ── data ──
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [admins, setAdmins] = useState<ProjectAdmin[]>(() => {
    try {
      return getFromStorage(PROJECT_ADMINS_STORAGE_KEY, initialProjectAdmins);
    } catch {
      return initialProjectAdmins;
    }
  });
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectLoadError, setProjectLoadError] = useState("");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  );

  // ── view ──
  const [detailProject, setDetailProject] = useState<ManagedProject | null>(
    null,
  );
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [childBridgeStats, setChildBridgeStats] = useState<ChildBridgeStats | null>(null);
  const [, setIsLoadingStats] = useState(false);
  const [launchingAppKey, setLaunchingAppKey] = useState<string | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [viewAdmin, setViewAdmin] = useState<ProjectAdmin | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt?: string } | null>(null);

  // ── form ──
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm);
  const [adminForm, setAdminForm] = useState<ProjectAdminForm>(emptyAdminForm);
  const [projectError, setProjectError] = useState("");
  const [adminError, setAdminError] = useState("");
  const [logoUploadMode, setLogoUploadMode] = useState<"upload" | "url">("upload");
  const [logoFileError, setLogoFileError] = useState("");

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFileError("");
    try {
      const dataUrl = await processLogoFile(file);
      setProjectForm((f) => ({ ...f, logo: dataUrl }));
    } catch (err) {
      setLogoFileError(
        err instanceof Error ? err.message : "Failed to process logo.",
      );
    } finally {
      e.target.value = "";
    }
  };

  // ── list controls ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ProjectStatus>(
    "All",
  );
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAscending, setSortAscending] = useState(true);

  // ── notifications ──
  const [notice, setNotice] = useState("");

  // ── API ──────────────────────────────────────────────────────────────────
  const refreshProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const next = await listProjects();
      setProjects(next);
      setProjectLoadError("");
      return next;
    } catch (error) {
      if (error instanceof ProjectAuthenticationError) {
        navigate("/login", { replace: true });
        return null;
      }
      setProjectLoadError(
        error instanceof Error ? error.message : "Could not load projects.",
      );
      return null;
    } finally {
      setIsLoadingProjects(false);
    }
  }, [navigate]);

  useEffect(() => {
    const ctrl = new AbortController();
    listProjects(ctrl.signal)
      .then((next) => {
        if (!ctrl.signal.aborted) {
          setProjects(next);
          setProjectLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (ctrl.signal.aborted) return;
        if (error instanceof ProjectAuthenticationError) {
          navigate("/login", { replace: true });
          return;
        }
        setProjectLoadError(
          error instanceof Error ? error.message : "Could not load projects.",
        );
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setIsLoadingProjects(false);
      });
    return () => ctrl.abort();
  }, [navigate]);

  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key !== PROJECT_ADMINS_STORAGE_KEY) return;
      try {
        setAdmins(
          getFromStorage(PROJECT_ADMINS_STORAGE_KEY, initialProjectAdmins),
        );
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function persistAdmins(next: ProjectAdmin[]) {
    try {
      saveToStorage(PROJECT_ADMINS_STORAGE_KEY, next);
      setAdmins(next);
      return true;
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not save.");
      return false;
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const visibleProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => statusFilter === "All" || p.status === statusFilter)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const cmp = a[sortField].localeCompare(b[sortField]);
        return sortAscending ? cmp : -cmp;
      });
  }, [projects, search, sortAscending, sortField, statusFilter]);

  const counts = {
    total: projects.length,
    active: projects.filter((p) => p.status === "Active").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    hold: projects.filter((p) => p.status === "On Hold").length,
    upcoming: projects.filter((p) => p.status === "Upcoming").length,
    admins: admins.length,
  };

  function projectName(id: string) {
    return projects.find((p) => p.id === id)?.name;
  }
  function assignedAdmin(id: string) {
    return admins.find((a) => a.id === id);
  }
  function projectAdmin(p: ManagedProject) {
    return (
      admins.find((a) => a.projectIds.includes(p.id)) ??
      assignedAdmin(p.adminId)
    );
  }
  function adminProjectIds(a: ProjectAdmin) {
    return [
      ...new Set([
        ...a.projectIds,
        ...projects.filter((p) => p.adminId === a.id).map((p) => p.id),
      ]),
    ];
  }

  // ── Project handlers ──────────────────────────────────────────────────────
  function openAddProject() {
    setEditingProjectId(null);
    setProjectForm(emptyProjectForm);
    setProjectError("");
    setLogoFileError("");
    setLogoUploadMode("upload");
    setProjectModalOpen(true);
  }

  function openEditProject(project: ManagedProject) {
    const { id, ...values } = project;
    setEditingProjectId(id);
    setProjectForm({
      ...emptyProjectForm,
      ...values,
      frontendApps: values.frontendApps ? [...values.frontendApps] : [],
      backendConfig: values.backendConfig
        ? { ...values.backendConfig }
        : { ...DEFAULT_CHILD_BACKEND_CONFIG },
      availableModules: values.availableModules ? [...values.availableModules] : [],
    });
    setProjectError("");
    setLogoFileError("");
    setLogoUploadMode(project.logo?.startsWith("http") ? "url" : "upload");
    setProjectModalOpen(true);
  }

  async function saveProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = projectForm.name.trim();
    if (!name) {
      setProjectError("Project name is required.");
      return;
    }
    if (
      projectForm.startDate &&
      projectForm.endDate &&
      projectForm.endDate < projectForm.startDate
    ) {
      setProjectError("End date cannot be earlier than start date.");
      return;
    }
    for (const pl of projectForm.panelLinks) {
      if (!pl.name.trim()) {
        setProjectError("Each panel must have a name.");
        return;
      }
      if (!pl.url.trim()) {
        setProjectError(`Panel "${pl.name}" must have a URL.`);
        return;
      }
    }
    for (const ut of projectForm.userTypes) {
      if (!ut.role.trim()) {
        setProjectError("Each user type must have a role name.");
        return;
      }
    }
    setIsSavingProject(true);
    setProjectError("");
    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, { ...projectForm, name });
      } else {
        await createProject({ ...projectForm, name });
      }
      await refreshProjects();
      setProjectModalOpen(false);
      setNotice(
        editingProjectId
          ? "Project updated successfully."
          : "Project created successfully.",
      );
    } catch (err) {
      if (err instanceof ProjectAuthenticationError) {
        navigate("/login", { replace: true });
        return;
      }
      setProjectError(
        err instanceof Error ? err.message : "Could not save project.",
      );
    } finally {
      setIsSavingProject(false);
    }
  }

  async function deleteProject(project: ManagedProject) {
    const confirmed = await confirm({
      title: `Delete Project: ${project.name}`,
      message: `Are you sure you want to delete "${project.name}"? This cannot be undone.`,
      confirmText: "Delete Project",
      confirmVariant: "danger",
    });
    if (!confirmed) return;
    setDeletingProjectId(project.id);
    setProjectLoadError("");
    try {
      await deleteProjectRequest(project.id);
      setProjects((cur) => cur.filter((p) => p.id !== project.id));
      if (detailProject?.id === project.id) setDetailProject(null);
      setNotice(`"${project.name}" deleted successfully.`);
      toast.success(`"${project.name}" deleted successfully.`);
    } catch (err) {
      if (err instanceof ProjectAuthenticationError) {
        navigate("/login", { replace: true });
        return;
      }
      setProjectLoadError(
        err instanceof Error ? err.message : "Could not delete project.",
      );
    } finally {
      setDeletingProjectId(null);
    }
  }

  const loadChildStats = useCallback(async (projectId: string) => {
    setIsLoadingStats(true);
    try {
      const stats = await getChildProjectStats(projectId);
      setChildBridgeStats(stats);
    } catch (err) {
      console.warn("Could not load child bridge stats:", err);
      setChildBridgeStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const handleHealthCheck = async (project: ManagedProject) => {
    setIsCheckingHealth(true);
    try {
      const res = await checkProjectHealth(project.id);
      const updatedHealth = res.healthStatus;
      const updatedIntegration = res.integrationStatus;

      setDetailProject((prev) =>
        prev && prev.id === project.id
          ? {
              ...prev,
              healthStatus: updatedHealth,
              integrationStatus: updatedIntegration,
            }
          : prev,
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                healthStatus: updatedHealth,
                integrationStatus: updatedIntegration,
              }
            : p,
        ),
      );

      if (updatedHealth.isHealthy) {
        toast.success(
          `Child service is online (latency: ${updatedHealth.latencyMs}ms, v${updatedHealth.version || "1.0.0"})`,
        );
        void loadChildStats(project.id);
      } else {
        toast.error(
          `Health check failed: ${updatedHealth.errorMessage || "Service unreachable"}`,
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(`Health check failed: ${error.message || "Failed to reach child backend"}`);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleLaunchApp = async (project: ManagedProject, app: ChildFrontendApp) => {
    if (app.ssoCallbackPath && project.backendConfig?.baseUrl) {
      setLaunchingAppKey(app.appKey || app.name);
      try {
        const sso = await launchProjectSso(project.id, app.appKey);
        window.open(sso.launchUrl, "_blank", "noopener,noreferrer");
        toast.info(`Opening ${app.name || "application"} with federated SSO session...`);
      } catch (err: unknown) {
        const error = err as Error;
        console.warn("SSO launch ticket exchange could not be initiated:", error);
        toast.warning(`Direct SSO handoff unavailable (${error.message || "service error"}). Opening default portal URL.`);
        window.open(app.baseUrl, "_blank", "noopener,noreferrer");
      } finally {
        setLaunchingAppKey(null);
      }
    } else {
      window.open(app.baseUrl, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    let active = true;
    if (detailProject?.backendConfig?.baseUrl && detailProject.healthStatus?.isHealthy) {
      getChildProjectStats(detailProject.id)
        .then((stats) => {
          if (active) setChildBridgeStats(stats);
        })
        .catch((err) => {
          console.warn("Could not load child bridge stats:", err);
          if (active) setChildBridgeStats(null);
        });
    } else {
      const timer = setTimeout(() => {
        if (active) setChildBridgeStats(null);
      }, 0);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }

    return () => {
      active = false;
    };
  }, [detailProject?.id, detailProject?.backendConfig?.baseUrl, detailProject?.healthStatus?.isHealthy]);

  // ── Admin handlers ────────────────────────────────────────────────────────
  function openAddAdmin() {
    setEditingAdminId(null);
    setAdminForm(emptyAdminForm);
    setAdminError("");
    setAdminModalOpen(true);
  }
  function openEditAdmin(a: ProjectAdmin) {
    const { id, ...v } = a;
    setEditingAdminId(id);
    setAdminForm(v);
    setAdminError("");
    setAdminModalOpen(true);
  }

  function saveAdmin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = adminForm.name.trim();
    const email = adminForm.email.trim().toLowerCase();
    if (!name || !email) {
      setAdminError("Full name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAdminError("Enter a valid email address.");
      return;
    }
    if (
      admins.some(
        (a) => a.id !== editingAdminId && a.email.toLowerCase() === email,
      )
    ) {
      setAdminError("Email already exists.");
      return;
    }

    const id = editingAdminId ?? `admin-${Date.now()}`;
    const next: ProjectAdmin = { ...adminForm, id, name, email };
    const rest = admins
      .filter((a) => a.id !== id)
      .map((a) => ({
        ...a,
        projectIds: a.projectIds.filter(
          (pid) => !adminForm.projectIds.includes(pid),
        ),
      }));
    if (!persistAdmins([next, ...rest])) return;
    setAdminModalOpen(false);
    const msg = editingAdminId ? "Project Admin updated." : "Project Admin added.";
    setNotice(msg);
    toast.success(msg);
  }

  async function toggleAdminStatus(a: ProjectAdmin) {
    const nextStatus: ProjectAdminStatus =
      a.status === "Active" ? "Inactive" : "Active";
    const confirmed = await confirm({
      title: `${nextStatus === "Inactive" ? "Deactivate" : "Activate"} Project Admin`,
      message: `Are you sure you want to ${nextStatus === "Inactive" ? "deactivate" : "activate"} ${a.name}?`,
      confirmText: nextStatus === "Inactive" ? "Deactivate" : "Activate",
      confirmVariant: nextStatus === "Inactive" ? "warning" : "primary",
    });
    if (!confirmed) return;
    if (
      persistAdmins(
        admins.map((item) =>
          item.id === a.id ? { ...item, status: nextStatus } : item,
        ),
      )
    ) {
      const msg = `${a.name} is now ${nextStatus.toLowerCase()}.`;
      setNotice(msg);
      toast.success(msg);
    }
  }

  async function deleteAdmin(a: ProjectAdmin) {
    const confirmed = await confirm({
      title: "Delete Project Admin",
      message: `Are you sure you want to delete Project Admin ${a.name}?`,
      confirmText: "Delete Admin",
      confirmVariant: "danger",
    });
    if (!confirmed) return;
    if (persistAdmins(admins.filter((item) => item.id !== a.id))) {
      const msg = `${a.name} deleted.`;
      setNotice(msg);
      toast.success(msg);
    }
  }

  void [openEditAdmin, toggleAdminStatus, deleteAdmin];

  function toggleProjectSelection(id: string) {
    setAdminForm((f) => ({
      ...f,
      projectIds: f.projectIds.includes(id)
        ? f.projectIds.filter((x) => x !== id)
        : [...f.projectIds, id],
    }));
  }

  function changeSort(field: SortField) {
    if (sortField === field) {
      setSortAscending((v) => !v);
      return;
    }
    setSortField(field);
    setSortAscending(true);
  }

  // ── Panel/UserType form helpers ───────────────────────────────────────────
  const addPanelLink = () =>
    setProjectForm((f) => ({
      ...f,
      panelLinks: [...f.panelLinks, { name: "", url: "" }],
    }));
  const removePanelLink = (i: number) =>
    setProjectForm((f) => ({
      ...f,
      panelLinks: f.panelLinks.filter((_, idx) => idx !== i),
    }));
  const updatePanelLink = (i: number, field: keyof PanelLink, val: string) =>
    setProjectForm((f) => ({
      ...f,
      panelLinks: f.panelLinks.map((pl, idx) =>
        idx === i ? { ...pl, [field]: val } : pl,
      ),
    }));

  const addUserType = () =>
    setProjectForm((f) => ({
      ...f,
      userTypes: [...f.userTypes, { role: "", count: 0 }],
    }));
  const removeUserType = (i: number) =>
    setProjectForm((f) => ({
      ...f,
      userTypes: f.userTypes.filter((_, idx) => idx !== i),
    }));
  const updateUserType = (
    i: number,
    field: keyof UserType,
    val: string | number,
  ) =>
    setProjectForm((f) => ({
      ...f,
      userTypes: f.userTypes.map((ut, idx) =>
        idx === i ? { ...ut, [field]: val } : ut,
      ),
    }));

  const addFrontendApp = () =>
    setProjectForm((f) => ({
      ...f,
      frontendApps: [
        ...(f.frontendApps || []),
        {
          appKey: "",
          name: "",
          baseUrl: "",
          allowedRoles: [],
          ssoCallbackPath: "/sso/callback",
          isDefault: false,
        },
      ],
    }));
  const removeFrontendApp = (i: number) =>
    setProjectForm((f) => ({
      ...f,
      frontendApps: (f.frontendApps || []).filter((_, idx) => idx !== i),
    }));
  const updateFrontendApp = (
    i: number,
    field: keyof ChildFrontendApp,
    val: string | boolean | string[],
  ) =>
    setProjectForm((f) => ({
      ...f,
      frontendApps: (f.frontendApps || []).map((app, idx) =>
        idx === i ? { ...app, [field]: val } : app,
      ),
    }));

  const updateBackendConfig = (
    field: keyof ChildBackendConfig,
    val: string | number,
  ) =>
    setProjectForm((f) => ({
      ...f,
      backendConfig: {
        ...(f.backendConfig || DEFAULT_CHILD_BACKEND_CONFIG),
        [field]: val,
      },
    }));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ResponsiveLayout>
      <div className="projects-page-inner">
        <main className="projects-main">
          {/* ════════════════════════════════════════════════════════════════
              DETAIL VIEW
          ════════════════════════════════════════════════════════════════ */}
          {detailProject ? (
            <div className="pm-detail">
              {/* Back */}
              <div className="pm-detail__back">
                <BackButton onClick={() => setDetailProject(null)} label="Back to Projects" />
                <div className="pm-detail__back-actions">
                  <SecondaryButton
                    size="sm"
                    icon={<Pencil size={13} />}
                    onClick={() => openEditProject(detailProject)}
                  >
                    Edit
                  </SecondaryButton>
                  <DangerButton
                    size="sm"
                    icon={<Trash2 size={13} />}
                    disabled={deletingProjectId === detailProject.id}
                    isLoading={deletingProjectId === detailProject.id}
                    loadingText="Deleting…"
                    onClick={() => void deleteProject(detailProject)}
                  >
                    Delete
                  </DangerButton>
                </div>
              </div>

              {/* Header card */}
              <div className="pm-detail__header-card">
                <div
                  className="pm-detail__header-accent"
                  style={{
                    background: detailProject.theme || DEFAULT_PROJECT_THEME,
                  }}
                />
                <div className="pm-detail__header-body">
                  <ProjectLogo
                    name={detailProject.name}
                    logo={detailProject.logo}
                    theme={detailProject.theme}
                    size="lg"
                  />
                  <div className="pm-detail__header-info">
                    <div className="pm-detail__header-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 className="pm-detail__title">{detailProject.name}</h2>
                        {detailProject.projectCode && (
                          <span className="pm-project-code-tag">
                            {detailProject.projectCode}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {detailProject.integrationStatus && detailProject.integrationStatus !== "Unlinked" && (
                          <span className={`pm-integration-badge pm-integration-badge--${detailProject.integrationStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                            {detailProject.integrationStatus}
                          </span>
                        )}
                        <span
                          className={`projects-status projects-status--${statusClass(detailProject.status)}`}
                        >
                          {detailProject.status}
                        </span>
                      </div>
                    </div>
                    {detailProject.description && (
                      <p className="pm-detail__description">
                        {detailProject.description}
                      </p>
                    )}
                    <div className="pm-detail__meta-row">
                      {detailProject.startDate && (
                        <span className="pm-detail__meta-item">
                          <Calendar size={12} />
                          <span>
                            Start{" "}
                            <strong>
                              {formatDate(detailProject.startDate)}
                            </strong>
                          </span>
                        </span>
                      )}
                      {detailProject.endDate && (
                        <span className="pm-detail__meta-item">
                          <Calendar size={12} />
                          <span>
                            End{" "}
                            <strong>{formatDate(detailProject.endDate)}</strong>
                          </span>
                        </span>
                      )}
                      <span className="pm-detail__meta-item">
                        <LayoutGrid size={12} />
                        <span>
                          <strong>{detailProject.panelLinks.length}</strong>{" "}
                          panel
                          {detailProject.panelLinks.length !== 1 ? "s" : ""}
                        </span>
                      </span>
                      {totalUsers(detailProject) > 0 && (
                        <span className="pm-detail__meta-item">
                          <Users size={12} />
                          <span>
                            <strong>
                              {totalUsers(detailProject).toLocaleString()}
                            </strong>{" "}
                            users
                          </span>
                        </span>
                      )}
                      {projectAdmin(detailProject) && (
                        <span className="pm-detail__meta-item">
                          <UserRound size={12} />
                          <span>
                            Admin:{" "}
                            <strong>{projectAdmin(detailProject)!.name}</strong>
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail sections */}
              <div className="pm-detail__sections">
                {/* Panels */}
                <section className="projects-card">
                  <div className="projects-section-heading">
                    <div>
                      <h2>Panels</h2>
                      <p>Launch each panel via your super admin credentials.</p>
                    </div>
                  </div>
                  {detailProject.panelLinks.length === 0 ? (
                    <p className="pm-empty-hint pm-empty-hint--spaced">
                      No panels configured. Edit the project to add panel links.
                    </p>
                  ) : (
                    <div className="pm-panels-grid">
                      {detailProject.panelLinks.map((pl, i) => (
                        <div key={i} className="pm-panel-card">
                          <span
                            className="pm-panel-card__icon"
                            style={{
                              background:
                                detailProject.theme || DEFAULT_PROJECT_THEME,
                            }}
                          >
                            <LayoutGrid size={14} />
                          </span>
                          <span className="pm-panel-card__name">{pl.name}</span>
                          <a
                            href={pl.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pm-panel-card__launch"
                          >
                            <ExternalLink size={11} /> Launch
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Child Frontend Applications */}
                {detailProject.frontendApps && detailProject.frontendApps.length > 0 && (
                  <section className="projects-card">
                    <div className="projects-section-heading">
                      <div>
                        <h2>Frontend Applications ({detailProject.frontendApps.length})</h2>
                        <p>Child project frontend applications configured for single sign-on.</p>
                      </div>
                    </div>
                    <div className="pm-panels-grid">
                      {detailProject.frontendApps.map((app, i) => (
                        <div key={i} className="pm-panel-card">
                          <span
                            className="pm-panel-card__icon"
                            style={{
                              background: detailProject.theme || DEFAULT_PROJECT_THEME,
                            }}
                          >
                            <Globe size={14} />
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="pm-panel-card__name">{app.name}</span>
                              {app.isDefault && (
                                <span className="pm-project-code-tag" style={{ fontSize: '9px', padding: '0 4px' }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-slate-500)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {app.baseUrl} {app.ssoCallbackPath && `(${app.ssoCallbackPath})`}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="pm-panel-card__launch"
                            title={`Open ${app.name} in new tab`}
                            onClick={() => void handleLaunchApp(detailProject, app)}
                            disabled={launchingAppKey === (app.appKey || app.name)}
                          >
                            <ExternalLink size={11} className={launchingAppKey === (app.appKey || app.name) ? "pm-spin" : ""} />
                            {launchingAppKey === (app.appKey || app.name) ? "Authenticating..." : "Launch App"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Backend API Bridge */}
                {detailProject.backendConfig?.baseUrl && (
                  <section className="projects-card">
                    <div className="projects-section-heading">
                      <div>
                        <h2>Backend API Bridge</h2>
                        <p>Standardized integration connection to child project services.</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="pm-bridge-ping-btn"
                          onClick={() => void handleHealthCheck(detailProject)}
                          disabled={isCheckingHealth}
                          title="Run live probe against child service health endpoint"
                        >
                          <RefreshCw size={13} className={isCheckingHealth ? "pm-spin" : ""} />
                          {isCheckingHealth ? "Checking..." : "Ping Service"}
                        </button>
                        {detailProject.healthStatus?.isHealthy ? (
                          <StatusBadge status="Healthy" variant="success" size="sm" />
                        ) : detailProject.healthStatus?.lastCheckedAt ? (
                          <StatusBadge status="Degraded" variant="danger" size="sm" />
                        ) : (
                          <StatusBadge status="Bridge Ready" variant="primary" size="sm" />
                        )}
                      </div>
                    </div>
                    <div className="pm-bridge-detail-grid">
                      <div className="pm-bridge-stat-box">
                        <span className="pm-bridge-stat-label">Child Backend URL</span>
                        <span className="pm-bridge-stat-val">
                          <Server size={14} /> {detailProject.backendConfig.baseUrl}
                        </span>
                      </div>
                      <div className="pm-bridge-stat-box">
                        <span className="pm-bridge-stat-label">Bridge Endpoint Prefix</span>
                        <span className="pm-bridge-stat-val">
                          {detailProject.backendConfig.bridgePrefix || "/api/v1/platform-bridge"}
                        </span>
                      </div>
                      <div className="pm-bridge-stat-box">
                        <span className="pm-bridge-stat-label">Auth Protocol</span>
                        <span className="pm-bridge-stat-val" style={{ textTransform: 'uppercase' }}>
                          <ShieldCheck size={14} /> {detailProject.backendConfig.authType || "api_key"}
                        </span>
                      </div>
                      <div className="pm-bridge-stat-box">
                        <span className="pm-bridge-stat-label">Integration State</span>
                        <span className="pm-bridge-stat-val">
                          <Activity size={14} /> {detailProject.integrationStatus || "Registered"}
                        </span>
                      </div>
                      {detailProject.healthStatus?.lastCheckedAt && (
                        <>
                          <div className="pm-bridge-stat-box">
                            <span className="pm-bridge-stat-label">Roundtrip Latency</span>
                            <span className="pm-bridge-stat-val">
                              {detailProject.healthStatus.latencyMs} ms
                            </span>
                          </div>
                          <div className="pm-bridge-stat-box">
                            <span className="pm-bridge-stat-label">Child Version / Checked</span>
                            <span className="pm-bridge-stat-val" style={{ fontSize: '0.8rem' }}>
                              v{detailProject.healthStatus.version || "1.0.0"} &bull; {new Date(detailProject.healthStatus.lastCheckedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Live Child Application Stats */}
                    {childBridgeStats && (
                      <div className="pm-bridge-live-stats">
                        <h3 className="pm-bridge-live-stats__title">Live Child Telemetry &amp; Metrics</h3>
                        <div className="pm-bridge-kpi-grid">
                          {childBridgeStats.kpis.map((kpi) => (
                            <div key={kpi.key} className="pm-bridge-kpi-card">
                              <span className="pm-bridge-kpi-card__label">{kpi.label}</span>
                              <span className="pm-bridge-kpi-card__value">{kpi.value.toLocaleString()}</span>
                              {kpi.deltaText && (
                                <span className={`pm-bridge-kpi-card__delta pm-bridge-kpi-card__delta--${kpi.status || 'healthy'}`}>
                                  {kpi.deltaText}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* User Types */}
                <section className="projects-card">
                  <div className="projects-section-heading">
                    <div>
                      <h2>User Types</h2>
                      <p>Breakdown of users by role in this project.</p>
                    </div>
                  </div>
                  {detailProject.userTypes.length === 0 ? (
                    <p className="pm-empty-hint pm-empty-hint--spaced">
                      No user types defined. Edit the project to add user type
                      breakdowns.
                    </p>
                  ) : (
                    <div className="pm-user-types-list">
                      {detailProject.userTypes.map((ut, i) => (
                        <div key={i} className="pm-user-type-row">
                          <span className="pm-user-type-row__role">
                            <UserRound size={12} /> {ut.role}
                          </span>
                          <span className="pm-user-type-row__count">
                            {ut.count.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {detailProject.userTypes.length > 1 && (
                        <div className="pm-user-type-total">
                          <span>Total Users</span>
                          <strong>
                            {totalUsers(detailProject).toLocaleString()}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════
             LISTING VIEW
          ════════════════════════════════════════════════════════════════ */
            <>
              {/* Page header */}
              <section className="projects-header-card">
                <div className="projects-heading-copy">
                  <span className="projects-heading-icon">
                    <FolderKanban size={24} />
                  </span>
                  <div>
                    <h1>Project Management</h1>
                    <p>
                      Create and manage child projects, their panels, users, and
                      Project Admins.
                    </p>
                  </div>
                </div>
                <div className="projects-heading-actions" style={{ display: 'flex', gap: '8px' }}>
                  <SecondaryButton
                    icon={<UserRoundPlus size={15} />}
                    onClick={openAddAdmin}
                  >
                    Add Project Admin
                  </SecondaryButton>
                  <PrimaryButton
                    icon={<Plus size={16} />}
                    onClick={openAddProject}
                  >
                    Add Project
                  </PrimaryButton>
                </div>
              </section>

              {notice && (
                <AlertMessage
                  variant="success"
                  message={notice}
                  onClose={() => setNotice("")}
                />
              )}
              {projectLoadError && (
                <AlertMessage
                  variant="error"
                  message={projectLoadError}
                  action={
                    <SecondaryButton size="sm" onClick={() => void refreshProjects()}>
                      Retry
                    </SecondaryButton>
                  }
                />
              )}

              {/* Stats */}
              <section
                className="projects-summary-grid"
                aria-label="Project summary"
              >
                <SummaryCard
                  title="Total Projects"
                  value={counts.total}
                  icon={<FolderKanban size={18} />}
                  tone="orange"
                />
                <SummaryCard
                  title="Active Projects"
                  value={counts.active}
                  icon={<CircleCheck size={18} />}
                  tone="green"
                />
                <SummaryCard
                  title="Completed Projects"
                  value={counts.completed}
                  icon={<Clock3 size={18} />}
                  tone="purple"
                />
                <SummaryCard
                  title="Total Project Admins"
                  value={counts.admins}
                  icon={<UsersRound size={18} />}
                  tone="blue"
                />
                <SummaryCard
                  title="On Hold"
                  value={counts.hold}
                  icon={<PauseCircle size={18} />}
                  tone="orange"
                />
                <SummaryCard
                  title="Upcoming"
                  value={counts.upcoming}
                  icon={<CalendarClock size={18} />}
                  tone="green"
                />
              </section>

              {/* Projects card-grid */}
              <section className="projects-card">
                <div className="projects-section-heading">
                  <div>
                    <h2>Projects</h2>
                    <p>
                      Click a project to view its panels and user breakdown.
                    </p>
                  </div>
                  <PrimaryButton
                    icon={<Plus size={15} />}
                    onClick={openAddProject}
                  >
                    Add Project
                  </PrimaryButton>
                </div>

                <div className="projects-toolbar">
                  <label className="projects-search">
                    <Search size={15} aria-hidden="true" />
                    <span className="projects-visually-hidden">
                      Search projects
                    </span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search project name or description…"
                    />
                  </label>
                  <label className="projects-filter">
                    <span className="projects-visually-hidden">
                      Filter by status
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as "All" | ProjectStatus)
                      }
                    >
                      <option value="All">All statuses</option>
                      {projectStatuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} aria-hidden="true" />
                  </label>
                  <button
                    className="projects-sort-button"
                    type="button"
                    onClick={() =>
                      changeSort(sortField === "name" ? "startDate" : "name")
                    }
                    title={`Sort by ${sortField === "name" ? "start date" : "project name"}`}
                  >
                    <ArrowDownUp size={14} /> Sort:{" "}
                    {sortField === "name" ? "Name" : "Start date"}
                    <span>{sortAscending ? "↑" : "↓"}</span>
                  </button>
                </div>

                {isLoadingProjects ? (
                  <CardSkeleton count={6} variant="project" />
                ) : visibleProjects.length === 0 ? (
                  search || statusFilter !== "All" ? (
                    <NoSearchResults
                      query={search}
                      onClearSearch={() => {
                        setSearch("");
                        setStatusFilter("All");
                      }}
                    />
                  ) : (
                    <EmptyState
                      title="No projects yet"
                      description="Get started by clicking Add Project to create the first project."
                      action={
                        <button
                          type="button"
                          className="projects-button projects-button--primary"
                          onClick={openAddProject}
                        >
                          <Plus size={15} /> Add Project
                        </button>
                      }
                    />
                  )
                ) : (
                  <div className="pm-cards-grid">
                    {visibleProjects.map((project) => (
                      <article
                        key={project.id}
                        className="pm-project-card"
                        style={
                          {
                            "--card-theme":
                              project.theme || DEFAULT_PROJECT_THEME,
                          } as React.CSSProperties
                        }
                      >
                        <div className="pm-project-card__accent" />
                        <div className="pm-project-card__body">
                          <div className="pm-project-card__header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ProjectLogo
                                name={project.name}
                                logo={project.logo}
                                theme={project.theme}
                                size="sm"
                              />
                              {project.projectCode && (
                                <span className="pm-project-code-tag">
                                  {project.projectCode}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {project.integrationStatus && project.integrationStatus !== "Unlinked" && (
                                <span className={`pm-integration-badge pm-integration-badge--${project.integrationStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {project.integrationStatus}
                                </span>
                              )}
                              <span
                                className={`projects-status projects-status--${statusClass(project.status)}`}
                              >
                                {project.status}
                              </span>
                            </div>
                          </div>
                          <h3 className="pm-project-card__name">
                            {project.name}
                          </h3>
                          <p className="pm-project-card__desc">
                            {project.description || "No description provided."}
                          </p>
                          <div className="pm-project-card__meta">
                            {project.startDate && (
                              <span>
                                <Calendar size={10} />{" "}
                                {formatDate(project.startDate)}
                              </span>
                            )}
                            <span>
                              <LayoutGrid size={10} />{" "}
                              {project.panelLinks.length} panel
                              {project.panelLinks.length !== 1 ? "s" : ""}
                            </span>
                            {project.frontendApps && project.frontendApps.length > 0 && (
                              <span>
                                <Globe size={10} />{" "}
                                {project.frontendApps.length} app
                                {project.frontendApps.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            {totalUsers(project) > 0 && (
                              <span>
                                <Users size={10} />{" "}
                                {totalUsers(project).toLocaleString()} users
                              </span>
                            )}
                          </div>
                          {project.frontendApps && project.frontendApps.length > 0 && (
                            <div className="pm-card-apps-row">
                              {project.frontendApps.slice(0, 3).map((app, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="pm-card-app-pill"
                                  title={`Open ${app.name} in new tab`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleLaunchApp(project, app);
                                  }}
                                  disabled={launchingAppKey === (app.appKey || app.name)}
                                >
                                  <ExternalLink size={10} className={launchingAppKey === (app.appKey || app.name) ? "pm-spin" : ""} />
                                  <span>{launchingAppKey === (app.appKey || app.name) ? "Launching..." : (app.name || app.appKey)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="pm-project-card__actions">
                            <button
                              className="pm-project-card__view-btn"
                              type="button"
                              onClick={() => setDetailProject(project)}
                            >
                              View Details
                            </button>
                            <button
                              className="pm-project-card__icon-btn"
                              type="button"
                              aria-label={`Edit ${project.name}`}
                              title="Edit project"
                              onClick={() => openEditProject(project)}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              className="pm-project-card__icon-btn"
                              type="button"
                              aria-label={`Delete ${project.name}`}
                              title="Delete project"
                              disabled={deletingProjectId === project.id}
                              onClick={() => void deleteProject(project)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                <div className="projects-table-footer">
                  Showing {visibleProjects.length} of {projects.length} project
                  {projects.length !== 1 ? "s" : ""}
                </div>
              </section>

              {/* Project Admins section */}
              {/* <section className="projects-card">
                <div className="projects-section-heading">
                  <div>
                    <h2>Project Admins</h2>
                    <p>Manage account details and project assignments.</p>
                  </div>
                  <button
                    className="projects-button projects-button--secondary"
                    type="button"
                    onClick={openAddAdmin}
                  >
                    <UserRoundPlus size={15} /> Add Project Admin
                  </button>
                </div>
                <div className="projects-table-scroll">
                  <table className="projects-table projects-admins-table">
                    <thead>
                      <tr>
                        <th>Admin Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Projects</th>
                        <th>Status</th>
                        <th>
                          <span className="projects-visually-hidden">
                            Actions
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id}>
                          <td>
                            <span className="projects-admin-person">
                              <span className="projects-avatar">
                                {initials(admin.name)}
                              </span>
                              <strong>{admin.name}</strong>
                            </span>
                          </td>
                          <td>{admin.email}</td>
                          <td>{admin.phone || "—"}</td>
                          <td>
                            {adminProjectIds(admin)
                              .map((id) => projectName(id))
                              .filter(Boolean)
                              .join(", ") || (
                              <span className="projects-unassigned">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`projects-status projects-status--${admin.status.toLowerCase()}`}
                            >
                              {admin.status}
                            </span>
                          </td>
                          <td>
                            <div className="projects-row-actions">
                              <button
                                type="button"
                                aria-label={`View ${admin.name}`}
                                title="View details"
                                onClick={() => setViewAdmin(admin)}
                              >
                                <Users size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Edit ${admin.name}`}
                                title="Edit"
                                onClick={() => openEditAdmin(admin)}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`${admin.status === "Active" ? "Deactivate" : "Activate"} ${admin.name}`}
                                title={
                                  admin.status === "Active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                onClick={() => toggleAdminStatus(admin)}
                              >
                                <UserRound size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${admin.name}`}
                                title="Delete"
                                onClick={() => deleteAdmin(admin)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {admins.length === 0 && (
                        <tr>
                          <td className="projects-empty-state" colSpan={6}>
                            No Project Admins yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="projects-table-footer">
                  Showing {admins.length} Project Admin
                  {admins.length !== 1 ? "s" : ""}
                </div>
              </section>
              <p className="projects-footer-note">
                Project Admin accounts are demonstration records only.
              </p> */}
            </>
          )}
        </main>

      {/* ════ Project create / edit modal ════ */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        kicker="PROJECT MANAGEMENT"
        title={editingProjectId ? "Edit Project" : "Add Project"}
        size="lg"
        className="pm-form-modal"
      >
        <form onSubmit={saveProject} noValidate>
              {/* Basic Info */}
              <div className="pm-form-section">
                <p className="pm-form-section-title">Basic Information</p>
                <div className="projects-form-grid">
                  <label className="projects-field">
                    <span>
                      Project Name <b>*</b>
                    </span>
                    <input
                      autoFocus
                      value={projectForm.name}
                      onChange={(e) =>
                        setProjectForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Local Trade Street"
                      required
                    />
                  </label>
                  <label className="projects-field">
                    <span>
                      Project Code <small>(e.g. LTS)</small>
                    </span>
                    <input
                      value={projectForm.projectCode || ""}
                      onChange={(e) =>
                        setProjectForm((f) => ({
                          ...f,
                          projectCode: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. LTS"
                      maxLength={12}
                    />
                  </label>
                  <label className="projects-field">
                    <span>Status</span>
                    <select
                      value={projectForm.status}
                      onChange={(e) =>
                        setProjectForm((f) => ({
                          ...f,
                          status: e.target.value as ProjectStatus,
                        }))
                      }
                    >
                      {projectStatuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="projects-field">
                    <span>Integration Status</span>
                    <select
                      value={projectForm.integrationStatus || "Unlinked"}
                      onChange={(e) =>
                        setProjectForm((f) => ({
                          ...f,
                          integrationStatus: e.target.value as IntegrationStatus,
                        }))
                      }
                    >
                      {integrationStatuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="projects-field projects-field--wide">
                    <span>Description</span>
                    <textarea
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) =>
                        setProjectForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Briefly describe the project…"
                    />
                  </label>
                </div>
              </div>

              {/* Branding */}
              <div className="pm-form-section">
                <p className="pm-form-section-title">Branding</p>
                <div className="projects-form-grid">
                  <div className="projects-field projects-field--wide">
                    <span>
                      Project Logo{" "}
                      <small>(upload file or leave blank to use initials)</small>
                    </span>
                    <div className="pm-logo-upload-wrap">
                      {logoUploadMode === "upload" ? (
                        <>
                          {projectForm.logo ? (
                            <div className="pm-logo-preview-box">
                              <div
                                className="pm-logo-preview-thumb"
                                style={{
                                  background:
                                    projectForm.theme || DEFAULT_PROJECT_THEME,
                                  cursor: "pointer",
                                }}
                                title="Click to view full preview"
                                onClick={() =>
                                  setPreviewImage({
                                    src: projectForm.logo,
                                    alt: projectForm.name || "Project Logo",
                                  })
                                }
                              >
                                <img
                                  src={projectForm.logo}
                                  alt="Project Logo Preview"
                                />
                              </div>
                              <div className="pm-logo-preview-info">
                                <span className="pm-logo-preview-title">
                                  Logo selected
                                </span>
                                <span className="pm-logo-preview-hint">
                                  Shown on project cards, headers and panels
                                </span>
                                <div className="pm-logo-preview-actions">
                                  <label className="pm-logo-btn pm-logo-btn--secondary">
                                    <Upload size={12} /> Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      hidden
                                      onChange={handleLogoFileChange}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    className="pm-logo-btn pm-logo-btn--danger"
                                    onClick={() =>
                                      setProjectForm((f) => ({
                                        ...f,
                                        logo: "",
                                      }))
                                    }
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <label className="pm-logo-dropzone">
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleLogoFileChange}
                              />
                              <div className="pm-logo-dropzone-icon">
                                <Upload size={20} />
                              </div>
                              <div className="pm-logo-dropzone-copy">
                                <strong>Click to upload logo or drag & drop</strong>
                                <small>
                                  PNG, JPG, SVG, WebP (max 2MB, square recommended)
                                </small>
                              </div>
                            </label>
                          )}
                          {logoFileError && (
                            <p className="pm-logo-error">{logoFileError}</p>
                          )}
                          <button
                            type="button"
                            className="pm-logo-mode-switch"
                            onClick={() => setLogoUploadMode("url")}
                          >
                            Or enter an image URL instead
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            value={projectForm.logo}
                            onChange={(e) =>
                              setProjectForm((f) => ({
                                ...f,
                                logo: e.target.value,
                              }))
                            }
                            placeholder="https://example.com/logo.png"
                          />
                          <button
                            type="button"
                            className="pm-logo-mode-switch"
                            onClick={() => setLogoUploadMode("upload")}
                          >
                            ← Switch back to file upload
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="projects-field">
                    <span>Theme Color</span>
                    <div className="pm-color-row">
                      <input
                        type="color"
                        className="pm-color-swatch"
                        value={projectForm.theme || DEFAULT_PROJECT_THEME}
                        onChange={(e) =>
                          setProjectForm((f) => ({
                            ...f,
                            theme: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="pm-color-text"
                        value={projectForm.theme}
                        onChange={(e) =>
                          setProjectForm((f) => ({
                            ...f,
                            theme: e.target.value,
                          }))
                        }
                        placeholder="#f96321"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="pm-form-section">
                <p className="pm-form-section-title">Timeline</p>
                <div className="projects-form-grid">
                  <label className="projects-field">
                    <span>Start Date</span>
                    <input
                      type="date"
                      value={projectForm.startDate}
                      onChange={(e) =>
                        setProjectForm((f) => ({
                          ...f,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="projects-field">
                    <span>
                      End Date{" "}
                      <small style={{ color: "#9ca3af", fontWeight: 400 }}>
                        (Optional)
                      </small>
                    </span>
                    <input
                      type="date"
                      min={projectForm.startDate || undefined}
                      value={projectForm.endDate}
                      onChange={(e) =>
                        setProjectForm((f) => ({
                          ...f,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Panels */}
              <div className="pm-form-section">
                <div className="pm-form-section-heading">
                  <p className="pm-form-section-title">
                    Panels ({projectForm.panelLinks.length})
                  </p>
                  <button
                    type="button"
                    className="pm-add-row-btn"
                    onClick={addPanelLink}
                  >
                    <Plus size={12} /> Add Panel
                  </button>
                </div>
                {projectForm.panelLinks.length === 0 ? (
                  <p className="pm-empty-hint">
                    Define each panel (sub-app) with a name and its URL for
                    super admin access.
                  </p>
                ) : (
                  <div className="pm-dynamic-list">
                    {projectForm.panelLinks.map((pl, i) => (
                      <div
                        key={i}
                        className="pm-dynamic-row pm-dynamic-row--wide"
                      >
                        <input
                          value={pl.name}
                          onChange={(e) =>
                            updatePanelLink(i, "name", e.target.value)
                          }
                          placeholder="Panel name, e.g. Admin Panel"
                        />
                        <input
                          value={pl.url}
                          onChange={(e) =>
                            updatePanelLink(i, "url", e.target.value)
                          }
                          placeholder="https://app.example.com"
                        />
                        <button
                          type="button"
                          className="pm-remove-btn"
                          aria-label="Remove panel"
                          onClick={() => removePanelLink(i)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Types */}
              <div className="pm-form-section">
                <div className="pm-form-section-heading">
                  <p className="pm-form-section-title">
                    User Types ({projectForm.userTypes.length})
                  </p>
                  <button
                    type="button"
                    className="pm-add-row-btn"
                    onClick={addUserType}
                  >
                    <Plus size={12} /> Add Type
                  </button>
                </div>
                {projectForm.userTypes.length === 0 ? (
                  <p className="pm-empty-hint">
                    Specify user roles and their expected counts for this
                    project.
                  </p>
                ) : (
                  <div className="pm-dynamic-list">
                    {projectForm.userTypes.map((ut, i) => (
                      <div key={i} className="pm-dynamic-row">
                        <input
                          value={ut.role}
                          onChange={(e) =>
                            updateUserType(i, "role", e.target.value)
                          }
                          placeholder="Role, e.g. Admin"
                        />
                        <input
                          type="number"
                          min="0"
                          value={ut.count}
                          onChange={(e) =>
                            updateUserType(i, "count", Number(e.target.value))
                          }
                          placeholder="Count"
                        />
                        <button
                          type="button"
                          className="pm-remove-btn"
                          aria-label="Remove user type"
                          onClick={() => removeUserType(i)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment */}
              <div className="pm-form-section">
                <p className="pm-form-section-title">Assignment</p>
                <label className="projects-field">
                  <span>Project Admin</span>
                  <select
                    value={projectForm.adminId}
                    onChange={(e) =>
                      setProjectForm((f) => ({ ...f, adminId: e.target.value }))
                    }
                  >
                    <option value="">Unassigned</option>
                    {admins.filter(isProjectAdminActive).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Frontend Applications (Child Frontends) */}
              <div className="pm-form-section">
                <div className="pm-form-section-heading">
                  <p className="pm-form-section-title">
                    Frontend Applications ({projectForm.frontendApps?.length || 0})
                  </p>
                  <button
                    type="button"
                    className="pm-add-row-btn"
                    onClick={addFrontendApp}
                  >
                    <Plus size={12} /> Add Application
                  </button>
                </div>
                {(!projectForm.frontendApps || projectForm.frontendApps.length === 0) ? (
                  <p className="pm-empty-hint">
                    Configure child frontend portals (e.g. Super Admin Panel, Vendor Portal, Telecaller CRM) for federated launch.
                  </p>
                ) : (
                  <div className="pm-dynamic-list">
                    {projectForm.frontendApps.map((app, i) => (
                      <div key={i} className="pm-dynamic-row pm-dynamic-row--app">
                        <input
                          value={app.name}
                          onChange={(e) =>
                            updateFrontendApp(i, "name", e.target.value)
                          }
                          placeholder="App name (e.g. Super Admin Panel)"
                        />
                        <input
                          value={app.appKey}
                          onChange={(e) =>
                            updateFrontendApp(i, "appKey", e.target.value.toLowerCase())
                          }
                          placeholder="Key (e.g. lts-superadmin)"
                        />
                        <input
                          value={app.baseUrl}
                          onChange={(e) =>
                            updateFrontendApp(i, "baseUrl", e.target.value)
                          }
                          placeholder="Base URL (e.g. http://localhost:5174)"
                        />
                        <button
                          type="button"
                          className="pm-remove-btn"
                          aria-label="Remove application"
                          onClick={() => removeFrontendApp(i)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Backend API Bridge */}
              <div className="pm-form-section">
                <p className="pm-form-section-title">Backend API Bridge Configuration</p>
                <div className="projects-form-grid">
                  <label className="projects-field projects-field--wide">
                    <span>Child Backend Base URL</span>
                    <input
                      value={projectForm.backendConfig?.baseUrl || ""}
                      onChange={(e) =>
                        updateBackendConfig("baseUrl", e.target.value)
                      }
                      placeholder="e.g. https://lts-dbms-backend.onrender.com or http://localhost:5000"
                    />
                  </label>
                  <label className="projects-field">
                    <span>Bridge Prefix</span>
                    <input
                      value={projectForm.backendConfig?.bridgePrefix || "/api/v1/platform-bridge"}
                      onChange={(e) =>
                        updateBackendConfig("bridgePrefix", e.target.value)
                      }
                      placeholder="/api/v1/platform-bridge"
                    />
                  </label>
                  <label className="projects-field">
                    <span>Auth Protocol</span>
                    <select
                      value={projectForm.backendConfig?.authType || "api_key"}
                      onChange={(e) =>
                        updateBackendConfig(
                          "authType",
                          e.target.value as ChildBackendConfig["authType"],
                        )
                      }
                    >
                      <option value="api_key">API Key (X-Platform-API-Key)</option>
                      <option value="hmac">HMAC SHA-256 Signature</option>
                      <option value="service_jwt">Service JWT Bearer</option>
                    </select>
                  </label>
                  <label className="projects-field">
                    <span>Secret / API Key ID</span>
                    <input
                      type="password"
                      value={projectForm.backendConfig?.secretKeyId || ""}
                      onChange={(e) =>
                        updateBackendConfig("secretKeyId", e.target.value)
                      }
                      placeholder="Shared secret or API key"
                    />
                  </label>
                  <label className="projects-field">
                    <span>Timeout (ms)</span>
                    <input
                      type="number"
                      min="500"
                      max="60000"
                      step="500"
                      value={projectForm.backendConfig?.timeoutMs || 5000}
                      onChange={(e) =>
                        updateBackendConfig("timeoutMs", Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              </div>

              {projectError && (
                <p className="projects-form-error" role="alert">
                  {projectError}
                </p>
              )}
              <ModalActions
                onCancel={() => setProjectModalOpen(false)}
                submitLabel={
                  isSavingProject
                    ? "Saving…"
                    : editingProjectId
                      ? "Save Changes"
                      : "Create Project"
                }
                submitDisabled={isSavingProject}
              />
            </form>
      </Modal>

      {/* ════ Admin modal ════ */}
      <Modal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        kicker="PROJECT MANAGEMENT"
        title={editingAdminId ? "Edit Project Admin" : "Add Project Admin"}
        size="md"
      >
        <p className="projects-form-demo-note">
          Demo only — no login credentials are created.
        </p>
        <form onSubmit={saveAdmin} noValidate>
              <div className="projects-form-grid">
                <label className="projects-field projects-field--wide">
                  <span>
                    Full Name <b>*</b>
                  </span>
                  <input
                    autoFocus
                    value={adminForm.name}
                    onChange={(e) =>
                      setAdminForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                  />
                </label>
                <label className="projects-field">
                  <span>
                    Email <b>*</b>
                  </span>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) =>
                      setAdminForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="name@example.com"
                  />
                </label>
                <label className="projects-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) =>
                      setAdminForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label className="projects-field">
                  <span>Username</span>
                  <input
                    value={adminForm.username}
                    onChange={(e) =>
                      setAdminForm((f) => ({ ...f, username: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </label>
                <label className="projects-field">
                  <span>Status</span>
                  <select
                    value={adminForm.status}
                    onChange={(e) =>
                      setAdminForm((f) => ({
                        ...f,
                        status: e.target.value as ProjectAdminStatus,
                      }))
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
                <fieldset className="projects-project-select projects-field--wide">
                  <legend>Projects</legend>
                  {projects.length === 0 ? (
                    <p className="projects-unassigned">No projects yet.</p>
                  ) : (
                    projects.map((p) => (
                      <label key={p.id}>
                        <input
                          type="checkbox"
                          checked={adminForm.projectIds.includes(p.id)}
                          onChange={() => toggleProjectSelection(p.id)}
                        />
                        <span>{p.name}</span>
                      </label>
                    ))
                  )}
                </fieldset>
              </div>
              {adminError && (
                <p className="projects-form-error" role="alert">
                  {adminError}
                </p>
              )}
              <ModalActions
                onCancel={() => setAdminModalOpen(false)}
                submitLabel={
                  editingAdminId ? "Save Changes" : "Add Project Admin"
                }
              />
            </form>
      </Modal>

      {/* ════ Admin detail modal ════ */}
      <Modal
        isOpen={Boolean(viewAdmin)}
        onClose={() => setViewAdmin(null)}
        kicker="PROJECT MANAGEMENT"
        title={viewAdmin?.name ?? "Admin Details"}
        size="md"
        className="projects-details-modal"
      >
        {viewAdmin && (
          <>
            <p className="projects-form-demo-note">
              Demo record — no credentials stored.
            </p>
            <DataDetailView
              columns={2}
              items={[
                {
                  label: "Email",
                  value: viewAdmin.email,
                  icon: <Mail size={14} />,
                  copyable: true,
                },
                {
                  label: "Phone",
                  value: viewAdmin.phone || "Not provided",
                  icon: <Phone size={14} />,
                },
                {
                  label: "Username",
                  value: viewAdmin.username || "Not set",
                },
                {
                  label: "Account Status",
                  value: <StatusBadge status={viewAdmin.status} size="sm" />,
                },
                {
                  label: "Assigned Projects",
                  value:
                    adminProjectIds(viewAdmin)
                      .map((id) => projectName(id))
                      .filter(Boolean)
                      .join(", ") || "Unassigned",
                  fullWidth: true,
                },
              ]}
            />
            <ModalActions
              onCancel={() => setViewAdmin(null)}
              cancelLabel="Close"
              hideSubmit
            />
          </>
        )}
      </Modal>

      {/* ════ Fullscreen logo image preview lightbox ════ */}
      <ImagePreview
        isOpen={Boolean(previewImage)}
        src={previewImage?.src || ""}
        alt={previewImage?.alt}
        title={previewImage?.alt}
        onClose={() => setPreviewImage(null)}
      />
      </div>
    </ResponsiveLayout>
  );
}

export default ProjectManagementPage;
