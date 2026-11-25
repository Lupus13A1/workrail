import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import {
  apiConfig,
  authApi,
  issuesApi,
  onApiUnauthorized,
  projectsApi,
  sprintsApi,
  type ApiMode,
} from "@/lib/api";
import { getBoardConfig, getNextIssueNumber, type Project, type ProjectTemplate } from "@/lib/project-dashboard";
import {
  getProjectSampleIssues,
  people,
  peopleAvatars,
  seedIssues,
  seedProjects,
  type Issue,
  type IssuePriority,
  type IssueType,
  type SprintItem,
} from "@/lib/workspace-data";

export function getProjectSlug(project: Pick<Project, "id" | "name">): string {
  return (
    project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || project.id
  );
}

export type DropPosition = "before" | "after";

export type Language = "en" | "th";

export type AuthUser = {
  name: string;
  email: string;
  initials: string;
};

export const DEFAULT_AUTH_USER: AuthUser = {
  name: "Kittitee Sitthisom",
  email: "kittitee@northstar.studio",
  initials: "KS",
};

type WorkspaceContextValue = {
  apiMode: ApiMode;
  isSyncing: boolean;
  syncFromBackend: () => Promise<void>;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  projects: Project[];
  projectIssues: Record<string, Issue[]>;
  projectSprints: Record<string, SprintItem[]>;
  recentProjectIds: string[];
  darkMode: boolean;
  setDarkMode: (next: boolean) => void;
  notice: string;
  setNotice: (message: string) => void;
  copyText: (value: string, message?: string) => Promise<void>;
  getIssues: (projectId: string) => Issue[];
  getSprints: (projectId: string) => SprintItem[];
  ensureProjectIssues: (project: Project) => void;
  markRecent: (projectId: string) => void;
  updateIssue: (projectId: string, id: string, changes: Partial<Issue>) => void;
  moveIssue: (
    projectId: string,
    draggedId: string,
    changes: Partial<Issue>,
    targetId?: string,
    noticeText?: string,
    position?: DropPosition,
  ) => void;
  deleteIssue: (projectId: string, id: string, key: string) => void;
  addIssue: (project: Project, form: FormData) => Issue | null;
  addSubtask: (
    project: Project,
    parentIssue: Issue,
    data: { title: string; assignee?: string; priority?: IssuePriority; status?: string },
  ) => Issue | null;
  createProject: (name: string, key: string, template: ProjectTemplate) => Project;
  toggleFavorite: (id: string) => void;
  createSprint: (projectId: string, sprint: Omit<SprintItem, "id" | "status" | "code">) => SprintItem;
  updateSprints: (projectId: string, updater: (current: SprintItem[]) => SprintItem[]) => void;
  findProjectBySlug: (slug: string) => Project | undefined;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("workrail_auth") === "true";
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("workrail_user");
      if (stored) return JSON.parse(stored) as AuthUser;
      if (localStorage.getItem("workrail_auth") === "true") return DEFAULT_AUTH_USER;
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return (localStorage.getItem("workrail_lang") as Language) || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem("workrail_lang", next);
    } catch {}
  };

  useEffect(() => {
    return onApiUnauthorized(() => {
      setIsAuthenticated(false);
      setUser(null);
      try {
        localStorage.removeItem("workrail_auth");
        localStorage.removeItem("workrail_user");
      } catch {}
    });
  }, []);

  useEffect(() => {
    try {
      const isAuth = localStorage.getItem("workrail_auth") === "true";
      const storedUser = localStorage.getItem("workrail_user");
      if (isAuth) {
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(DEFAULT_AUTH_USER);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const login = (email: string, name?: string) => {
    let displayName = name?.trim();
    if (!displayName) {
      const localPart = email.split("@")[0] || "User";
      displayName = localPart
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
    if (!displayName) displayName = "Kittitee Sitthisom";

    const initials =
      displayName
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") || "KS";

    const newUser: AuthUser = {
      name: displayName,
      email: email.trim() || "kittitee@northstar.studio",
      initials,
    };

    setIsAuthenticated(true);
    setUser(newUser);
    try {
      localStorage.setItem("workrail_auth", "true");
      localStorage.setItem("workrail_user", JSON.stringify(newUser));
    } catch {}

    if (apiConfig.isRemote) {
      void authApi.login({ email: newUser.email }).catch(() => undefined);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem("workrail_auth");
      localStorage.removeItem("workrail_user");
    } catch {}
    if (apiConfig.isRemote) {
      void authApi.logout();
    }
  };

  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [projectIssues, setProjectIssues] = useState<Record<string, Issue[]>>({ app: seedIssues });
  const [projectSprints, setProjectSprints] = useState<Record<string, SprintItem[]>>({});
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(["app", "client", "mobile"]);
  const [darkMode, setDarkMode] = useState(false);
  const [notice, setNotice] = useState("");

  const syncFromBackend = async () => {
    if (!apiConfig.isRemote) return;
    setIsSyncing(true);
    try {
      const remoteProjects = await projectsApi.list();
      if (remoteProjects.length > 0) {
        setProjects(remoteProjects);
      }
    } catch {
      // Keep local seed fallback if remote endpoint is unreachable
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && apiConfig.isRemote) {
      void syncFromBackend();
    }
  }, [isAuthenticated]);

  const copyText = async (value: string, message = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(message);
    } catch {
      setNotice("Clipboard is unavailable in this browser");
    }
    window.setTimeout(() => setNotice(""), 2400);
  };

  const getIssues = (projectId: string) => projectIssues[projectId] ?? [];
  const getSprints = (projectId: string) => projectSprints[projectId] ?? [];

  const ensureProjectIssues = (project: Project) => {
    setProjectIssues((current) => (current[project.id] ? current : { ...current, [project.id]: getProjectSampleIssues(project) }));
    if (apiConfig.isRemote) {
      void issuesApi
        .listByProject(project.id, project)
        .then((remoteIssues) => {
          setProjectIssues((current) => ({ ...current, [project.id]: remoteIssues }));
        })
        .catch(() => undefined);
      void sprintsApi
        .listByProject(project.id)
        .then((remoteSprints) => {
          setProjectSprints((current) => ({ ...current, [project.id]: remoteSprints }));
        })
        .catch(() => undefined);
    }
  };

  const markRecent = (projectId: string) => {
    setRecentProjectIds((current) => [projectId, ...current.filter((id) => id !== projectId)].slice(0, 4));
  };

  const updateIssue = (projectId: string, id: string, changes: Partial<Issue>) => {
    setProjectIssues((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).map((issue) => (issue.id === id ? { ...issue, ...changes } : issue)),
    }));
    if (apiConfig.isRemote) {
      void issuesApi.update(projectId, id, changes).catch(() => undefined);
    }
  };

  const moveIssue = (
    projectId: string,
    draggedId: string,
    changes: Partial<Issue>,
    targetId?: string,
    noticeText?: string,
    position: DropPosition = "before",
  ) => {
    const currentList = projectIssues[projectId] ?? [];
    const previous = currentList.find((item) => item.id === draggedId);
    if (!previous) return;

    setProjectIssues((current) => {
      const list = current[projectId] ?? [];
      const dragged = list.find((item) => item.id === draggedId);
      if (!dragged) return current;
      const updated: Issue = { ...dragged, ...changes };
      const without = list.filter((item) => item.id !== draggedId);
      if (!targetId) return { ...current, [projectId]: [...without, updated] };
      if (targetId === draggedId) {
        const originalIndex = list.findIndex((item) => item.id === draggedId);
        const next = [...without];
        next.splice(Math.max(0, originalIndex), 0, updated);
        return { ...current, [projectId]: next };
      }
      const targetIndex = without.findIndex((item) => item.id === targetId);
      if (targetIndex === -1) return { ...current, [projectId]: [...without, updated] };
      const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
      const next = [...without];
      next.splice(insertIndex, 0, updated);
      return { ...current, [projectId]: next };
    });

    if (changes.status !== undefined && changes.status !== previous.status) {
      setProjects((current) =>
        current.map((project) => {
          if (project.id !== projectId) return project;
          const wasDone = previous.status === "Done";
          const isDone = changes.status === "Done";
          const openDelta = wasDone === isDone ? 0 : isDone ? -1 : 1;
          return {
            ...project,
            openIssues: Math.max(0, project.openIssues + openDelta),
            lastUpdated: "Updated just now",
            updatedAt: Date.now(),
          };
        }),
      );
    }
    if (noticeText) setNotice(noticeText);

    if (apiConfig.isRemote) {
      void issuesApi.move(projectId, draggedId, { changes, targetId, position }).catch(() => undefined);
    }
  };

  const deleteIssue = (projectId: string, id: string, key: string) => {
    setProjectIssues((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).filter((item) => item.id !== id),
    }));
    setNotice(`Deleted ${key}`);
    if (apiConfig.isRemote) {
      void issuesApi.remove(projectId, id).catch(() => undefined);
    }
  };

  const addIssue = (project: Project, form: FormData): Issue | null => {
    const title = String(form.get("title") ?? "").trim();
    if (!title) return null;
    const currentIssues = projectIssues[project.id] ?? [];
    const rawAssignee = String(form.get("assignee") ?? "");
    const assignee = rawAssignee || "Unassigned";
    const personInfo = rawAssignee ? peopleAvatars[rawAssignee] ?? (["AM", "avatar-mint"] as [string, string]) : (["—", "avatar-extra"] as [string, string]);
    const next = getNextIssueNumber(currentIssues.map((issue) => issue.key));
    const sprintVal = String(form.get("sprint") ?? "").trim();
    const pointsVal = String(form.get("points") ?? "").trim();
    const parentVal = String(form.get("parent") ?? "").trim();

    const issue: Issue = {
      id: `new-${Date.now()}`,
      key: `${project.key}-${next}`,
      title,
      status: String(form.get("status") ?? project.boardConfig[1] ?? project.boardConfig[0] ?? "To Do"),
      type: String(form.get("type") ?? "Task") as IssueType,
      priority: String(form.get("priority") ?? "Medium") as IssuePriority,
      assignee,
      initials: personInfo[0],
      color: personInfo[1],
      comments: 0,
      attachments: 0,
      votes: 0,
      tags: sprintVal ? [sprintVal] : ["New issue"],
      description: String(form.get("description") ?? ""),
      env: "Development",
      release: "v1.5.0",
      ...(sprintVal ? { sprint: sprintVal } : {}),
      ...(pointsVal ? { points: pointsVal } : {}),
      ...(parentVal ? { parent: parentVal } : {}),
    };

    setProjectIssues((current) => ({
      ...current,
      [project.id]: [issue, ...(current[project.id] ?? [])],
    }));

    setProjects((current) =>
      current.map((item) =>
        item.id === project.id
          ? {
              ...item,
              openIssues: item.openIssues + (issue.status === "Done" ? 0 : 1),
              assignedIssues: item.assignedIssues + (assignee === people[0] && issue.status !== "Done" ? 1 : 0),
              lastUpdated: "Updated just now",
              updatedAt: Date.now(),
            }
          : item,
      ),
    );

    if (apiConfig.isRemote) {
      void issuesApi
        .create(
          {
            projectId: project.id,
            title: issue.title,
            status: issue.status,
            type: issue.type,
            priority: issue.priority,
            assignee: issue.assignee,
            description: issue.description,
            sprint: issue.sprint,
            points: issue.points,
            parent: issue.parent,
            env: issue.env,
            release: issue.release,
            tags: issue.tags,
          },
          currentIssues.map((i) => i.key),
          project.key,
        )
        .catch(() => undefined);
    }
    return issue;
  };

  const addSubtask = (
    project: Project,
    parentIssue: Issue,
    data: { title: string; assignee?: string; priority?: IssuePriority; status?: string },
  ): Issue | null => {
    const cleanTitle = data.title.trim();
    if (!cleanTitle) return null;
    const currentIssues = projectIssues[project.id] ?? [];
    const next = getNextIssueNumber(currentIssues.map((issue) => issue.key));
    const rawAssignee = data.assignee?.trim() ?? "";
    const assignee = rawAssignee || "Unassigned";
    const personInfo = rawAssignee
      ? peopleAvatars[rawAssignee] ?? (["AM", "avatar-mint"] as [string, string])
      : (["—", "avatar-extra"] as [string, string]);

    const subtask: Issue = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      key: `${project.key}-${next}`,
      title: cleanTitle,
      status: data.status || project.boardConfig[0] || "To Do",
      type: "Subtask",
      priority: data.priority || "Medium",
      assignee,
      initials: personInfo[0],
      color: personInfo[1],
      comments: 0,
      attachments: 0,
      votes: 0,
      tags: ["Subtask"],
      description: "",
      env: parentIssue.env || "Development",
      release: parentIssue.release || "v1.5.0",
      parent: parentIssue.key,
      ...(parentIssue.sprint ? { sprint: parentIssue.sprint } : {}),
    };

    setProjectIssues((current) => ({
      ...current,
      [project.id]: [...(current[project.id] ?? []), subtask],
    }));

    setProjects((current) =>
      current.map((item) =>
        item.id === project.id
          ? {
              ...item,
              openIssues: item.openIssues + (subtask.status === "Done" ? 0 : 1),
              lastUpdated: "Updated just now",
              updatedAt: Date.now(),
            }
          : item,
      ),
    );
    setNotice(`Created subtask ${subtask.key} under ${parentIssue.key}`);

    if (apiConfig.isRemote) {
      void issuesApi
        .createSubtask(
          {
            projectId: project.id,
            parentIssueId: parentIssue.id,
            parentIssueKey: parentIssue.key,
            title: subtask.title,
            assignee: subtask.assignee,
            priority: subtask.priority,
            status: subtask.status,
          },
          currentIssues.map((i) => i.key),
          project.key,
        )
        .catch(() => undefined);
    }
    return subtask;
  };

  const createProject = (name: string, key: string, template: ProjectTemplate): Project => {
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      key,
      template,
      boardConfig: getBoardConfig(template),
      role: "Project admin",
      openIssues: 0,
      assignedIssues: 0,
      lastUpdated: "Created just now",
      updatedAt: Date.now(),
      favorite: false,
      color: ["symbol-green", "symbol-coral", "symbol-blue"][projects.length % 3] as Project["color"],
    };
    setProjects((current) => [project, ...current]);
    setRecentProjectIds((current) => [project.id, ...current.filter((id) => id !== project.id)].slice(0, 4));
    setNotice(`${project.name} created · ${project.template} board ready`);

    if (apiConfig.isRemote) {
      void projectsApi.create({ name, key, template }).catch(() => undefined);
    }
    return project;
  };

  const toggleFavorite = (id: string) => {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== id) return project;
        const nextFav = !project.favorite;
        if (apiConfig.isRemote) {
          void projectsApi.toggleFavorite(id, nextFav).catch(() => undefined);
        }
        return { ...project, favorite: nextFav };
      }),
    );
  };

  const createSprint = (projectId: string, sprint: Omit<SprintItem, "id" | "status" | "code">): SprintItem => {
    const list = projectSprints[projectId] ?? [];
    const created: SprintItem = {
      ...sprint,
      id: `sprint-${Date.now()}`,
      code: `S-${list.length + 1}`,
      status: "planned",
    };
    setProjectSprints((current) => ({
      ...current,
      [projectId]: [...(current[projectId] ?? []), created],
    }));
    setNotice(`${created.code} · ${created.name} created`);
    if (apiConfig.isRemote) {
      void sprintsApi.create(projectId, sprint, list.length).catch(() => undefined);
    }
    return created;
  };

  const updateSprints = (projectId: string, updater: (current: SprintItem[]) => SprintItem[]) => {
    setProjectSprints((current) => ({
      ...current,
      [projectId]: updater(current[projectId] ?? []),
    }));
  };

  const findProjectBySlug = (slug: string): Project | undefined => {
    const normalized = slug.toLowerCase();
    return projects.find(
      (project) =>
        getProjectSlug(project) === normalized ||
        project.id.toLowerCase() === normalized ||
        project.key.toLowerCase() === normalized,
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        apiMode: apiConfig.mode,
        isSyncing,
        syncFromBackend,
        user,
        isAuthenticated,
        isAuthReady,
        language,
        setLanguage,
        login,
        logout,
        projects,
        projectIssues,
        projectSprints,
        recentProjectIds,
        darkMode,
        setDarkMode,
        notice,
        setNotice,
        copyText,
        getIssues,
        getSprints,
        ensureProjectIssues,
        markRecent,
        updateIssue,
        moveIssue,
        deleteIssue,
        addIssue,
        addSubtask,
        createProject,
        toggleFavorite,
        createSprint,
        updateSprints,
        findProjectBySlug,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceStore() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceStore must be used inside WorkspaceProvider");
  }
  return context;
}
