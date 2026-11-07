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
  ArrowLeft,
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
} from "lucide-react";
import ResponsiveLayout from "../../components/layout/ResponsiveLayout";
import {
  DEFAULT_PROJECT_THEME,
  initialProjectAdmins,
  projectStatuses,
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
  createProject,
  deleteProject as deleteProjectRequest,
  listProjects,
  ProjectAuthenticationError,
  updateProject,
} from "./projectService";

// ─── Types ───────────────────────────────────────────────────────────────────
type ProjectForm = Omit<ManagedProject, "id">;
type ProjectAdminForm = Omit<ProjectAdmin, "id">;
type SortField = "name" | "startDate";

const PROJECT_ADMINS_STORAGE_KEY = "platform-admin.project-admins";

const emptyProjectForm: ProjectForm = {
  name: "",
  description: "",
  logo: "",
  theme: DEFAULT_PROJECT_THEME,
  startDate: "",
  endDate: "",
  status: "Upcoming",
  adminId: "",
  panelLinks: [],
  userTypes: [],
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
    <article className="projects-summary-card">
      <div className="projects-summary-top">
        <span>{title}</span>
        <span
          className={`projects-summary-icon projects-summary-icon--${tone}`}
        >
          {icon}
        </span>
      </div>
      <strong>{value.toLocaleString()}</strong>
      <small>Across the platform</small>
    </article>
  );
}

function ModalHeading({
  id,
  title,
  onClose,
}: {
  id: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="projects-modal-heading">
      <div>
        <span className="projects-modal-kicker">PROJECT MANAGEMENT</span>
        <h2 id={id}>{title}</h2>
      </div>
      <button type="button" aria-label="Close dialog" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
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
    <div className="projects-modal-actions">
      <button
        className="projects-button projects-button--secondary"
        type="button"
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
      {!hideSubmit && (
        <button
          className="projects-button projects-button--primary"
          type="submit"
          disabled={submitDisabled}
        >
          <Check size={15} />
          {submitLabel}
        </button>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {icon}
        {value}
      </dd>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ProjectManagementPage() {
  const navigate = useNavigate();

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
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [viewAdmin, setViewAdmin] = useState<ProjectAdmin | null>(null);

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
    setProjectForm(values);
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
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`))
      return;
    setDeletingProjectId(project.id);
    setProjectLoadError("");
    try {
      await deleteProjectRequest(project.id);
      setProjects((cur) => cur.filter((p) => p.id !== project.id));
      if (detailProject?.id === project.id) setDetailProject(null);
      setNotice(`"${project.name}" deleted successfully.`);
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
    setNotice(
      editingAdminId ? "Project Admin updated." : "Project Admin added.",
    );
  }

  function toggleAdminStatus(a: ProjectAdmin) {
    const nextStatus: ProjectAdminStatus =
      a.status === "Active" ? "Inactive" : "Active";
    if (
      !window.confirm(
        `${nextStatus === "Inactive" ? "Deactivate" : "Activate"} ${a.name}?`,
      )
    )
      return;
    if (
      persistAdmins(
        admins.map((item) =>
          item.id === a.id ? { ...item, status: nextStatus } : item,
        ),
      )
    )
      setNotice(`${a.name} is now ${nextStatus.toLowerCase()}.`);
  }

  function deleteAdmin(a: ProjectAdmin) {
    if (!window.confirm(`Delete Project Admin ${a.name}?`)) return;
    if (persistAdmins(admins.filter((item) => item.id !== a.id)))
      setNotice(`${a.name} deleted.`);
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
                <button
                  className="pm-detail__back-btn"
                  type="button"
                  onClick={() => setDetailProject(null)}
                >
                  <ArrowLeft size={15} /> Back to Projects
                </button>
                <div className="pm-detail__back-actions">
                  <button
                    className="projects-button projects-button--secondary"
                    type="button"
                    onClick={() => openEditProject(detailProject)}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    className="projects-button projects-button--danger"
                    type="button"
                    disabled={deletingProjectId === detailProject.id}
                    onClick={() => void deleteProject(detailProject)}
                  >
                    <Trash2 size={13} />{" "}
                    {deletingProjectId === detailProject.id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
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
                      <h2 className="pm-detail__title">{detailProject.name}</h2>
                      <span
                        className={`projects-status projects-status--${statusClass(detailProject.status)}`}
                      >
                        {detailProject.status}
                      </span>
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
                <div className="projects-heading-actions">
                  <button
                    className="projects-button projects-button--secondary"
                    type="button"
                    onClick={openAddAdmin}
                  >
                    <UserRoundPlus size={15} /> Add Project Admin
                  </button>
                  <button
                    className="projects-button projects-button--primary"
                    type="button"
                    onClick={openAddProject}
                  >
                    <Plus size={16} /> Add Project
                  </button>
                </div>
              </section>

              {notice && (
                <div className="projects-toast" role="status">
                  <Check size={15} aria-hidden="true" />
                  {notice}
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => setNotice("")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {projectLoadError && (
                <div className="projects-load-error" role="alert">
                  {projectLoadError}
                  <button
                    className="projects-button projects-button--secondary"
                    type="button"
                    onClick={() => void refreshProjects()}
                  >
                    Retry
                  </button>
                </div>
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
                  <button
                    className="projects-button projects-button--primary"
                    type="button"
                    onClick={openAddProject}
                  >
                    <Plus size={15} /> Add Project
                  </button>
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
                  <div className="pm-loading-state">Loading projects…</div>
                ) : visibleProjects.length === 0 ? (
                  <div className="pm-empty-state">
                    {projects.length === 0
                      ? 'No projects yet. Click "Add Project" to create the first one.'
                      : "No projects match your search or filters."}
                  </div>
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
                            <ProjectLogo
                              name={project.name}
                              logo={project.logo}
                              theme={project.theme}
                              size="sm"
                            />
                            <span
                              className={`projects-status projects-status--${statusClass(project.status)}`}
                            >
                              {project.status}
                            </span>
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
                            {totalUsers(project) > 0 && (
                              <span>
                                <Users size={10} />{" "}
                                {totalUsers(project).toLocaleString()} users
                              </span>
                            )}
                          </div>
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
      {projectModalOpen && (
        <div
          className="projects-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setProjectModalOpen(false);
          }}
        >
          <section
            className="projects-modal pm-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-form-title"
          >
            <ModalHeading
              id="project-form-title"
              title={editingProjectId ? "Edit Project" : "Add Project"}
              onClose={() => setProjectModalOpen(false)}
            />
            <form onSubmit={saveProject} noValidate>
              {/* Basic Info */}
              <div className="pm-form-section">
                <p className="pm-form-section-title">Basic Information</p>
                <div className="projects-form-grid">
                  <label className="projects-field projects-field--wide">
                    <span>
                      Project Name <b>*</b>
                    </span>
                    <input
                      autoFocus
                      value={projectForm.name}
                      onChange={(e) =>
                        setProjectForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Customer Portal"
                      required
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
                                }}
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
          </section>
        </div>
      )}

      {/* ════ Admin modal ════ */}
      {adminModalOpen && (
        <div
          className="projects-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAdminModalOpen(false);
          }}
        >
          <section
            className="projects-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-form-title"
          >
            <ModalHeading
              id="admin-form-title"
              title={
                editingAdminId ? "Edit Project Admin" : "Add Project Admin"
              }
              onClose={() => setAdminModalOpen(false)}
            />
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
          </section>
        </div>
      )}

      {/* ════ Admin detail modal ════ */}
      {viewAdmin && (
        <div
          className="projects-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setViewAdmin(null);
          }}
        >
          <section
            className="projects-modal projects-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-details-title"
          >
            <ModalHeading
              id="admin-details-title"
              title={viewAdmin.name}
              onClose={() => setViewAdmin(null)}
            />
            <p className="projects-form-demo-note">
              Demo record — no credentials stored.
            </p>
            <dl className="projects-details-grid">
              <Detail
                label="Email"
                value={viewAdmin.email}
                icon={<Mail size={14} />}
              />
              <Detail
                label="Phone"
                value={viewAdmin.phone || "Not provided"}
                icon={<Phone size={14} />}
              />
              <Detail
                label="Username"
                value={viewAdmin.username || "Not set"}
              />
              <Detail label="Account Status" value={viewAdmin.status} />
              <Detail
                label="Assigned Projects"
                value={
                  adminProjectIds(viewAdmin)
                    .map((id) => projectName(id))
                    .filter(Boolean)
                    .join(", ") || "Unassigned"
                }
              />
            </dl>
            <ModalActions
              onCancel={() => setViewAdmin(null)}
              cancelLabel="Close"
              hideSubmit
            />
          </section>
        </div>
      )}
      </div>
    </ResponsiveLayout>
  );
}

export default ProjectManagementPage;
