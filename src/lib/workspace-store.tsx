import { createContext, useContext, useState, type ReactNode } from "react";

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

type WorkspaceContextValue = {
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
  moveIssue: (projectId: string, draggedId: string, changes: Partial<Issue>, targetId?: string, noticeText?: string) => void;
  deleteIssue: (projectId: string, id: string, key: string) => void;
  addIssue: (project: Project, form: FormData) => Issue | null;
  createProject: (name: string, key: string, template: ProjectTemplate) => Project;
  toggleFavorite: (id: string) => void;
  createSprint: (projectId: string, sprint: Omit<SprintItem, "id" | "status" | "code">) => SprintItem;
  updateSprints: (projectId: string, updater: (current: SprintItem[]) => SprintItem[]) => void;
  findProjectBySlug: (slug: string) => Project | undefined;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [projectIssues, setProjectIssues] = useState<Record<string, Issue[]>>({ app: seedIssues });
  const [projectSprints, setProjectSprints] = useState<Record<string, SprintItem[]>>({});
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(["app", "client", "mobile"]);
  const [darkMode, setDarkMode] = useState(false);
  const [notice, setNotice] = useState("");

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
  };

  const markRecent = (projectId: string) => {
    setRecentProjectIds((current) => [projectId, ...current.filter((id) => id !== projectId)].slice(0, 4));
  };

  const updateIssue = (projectId: string, id: string, changes: Partial<Issue>) => {
    setProjectIssues((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).map((issue) => (issue.id === id ? { ...issue, ...changes } : issue)),
    }));
  };

  const moveIssue = (projectId: string, draggedId: string, changes: Partial<Issue>, targetId?: string, noticeText?: string) => {
    const currentList = projectIssues[projectId] ?? [];
    const previous = currentList.find((item) => item.id === draggedId);
    if (!previous) return;

    setProjectIssues((current) => {
      const list = current[projectId] ?? [];
      const dragged = list.find((item) => item.id === draggedId);
      if (!dragged) return current;
      const updated: Issue = { ...dragged, ...changes };
      const without = list.filter((item) => item.id !== draggedId);
      if (!targetId || targetId === draggedId) return { ...current, [projectId]: [...without, updated] };
      const targetIndex = without.findIndex((item) => item.id === targetId);
      if (targetIndex === -1) return { ...current, [projectId]: [...without, updated] };
      const next = [...without];
      next.splice(targetIndex, 0, updated);
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
  };

  const deleteIssue = (projectId: string, id: string, key: string) => {
    setProjectIssues((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).filter((item) => item.id !== id),
    }));
    setNotice(`Deleted ${key}`);
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
    return issue;
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
    return project;
  };

  const toggleFavorite = (id: string) => {
    setProjects((current) => current.map((project) => (project.id === id ? { ...project, favorite: !project.favorite } : project)));
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
