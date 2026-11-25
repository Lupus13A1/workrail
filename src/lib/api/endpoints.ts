import { apiClient, tokenStorage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type {
  AgentAccountDto,
  AuthSessionResponseDto,
  AuthUserDto,
  CreateHandoffRequestDto,
  CreateIssueRequestDto,
  CreateProjectRequestDto,
  CreateSprintRequestDto,
  CreateSubtaskRequestDto,
  ForgotPasswordRequestDto,
  HandoffItemDto,
  LoginRequestDto,
  MoveIssueRequestDto,
  OAuthConnectedAppDto,
  PersonalAccessTokenDto,
  ProjectDocDto,
  ProjectDocKind,
  RegisterRequestDto,
  UpdateIssueRequestDto,
  UpdateProjectRequestDto,
  UpdateSprintRequestDto,
  WorkspaceMemberDto,
} from "@/lib/api/types";
import { getBoardConfig, getNextIssueNumber, type Project } from "@/lib/project-dashboard";
import {
  getProjectSampleIssues,
  people,
  peopleAvatars,
  seedIssues,
  seedProjects,
  type Issue,
  type SprintItem,
} from "@/lib/workspace-data";

// Helper to build user display profile from email/name for local adapter fallback
export function buildLocalAuthUser(email: string, name?: string): AuthUserDto {
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

  return {
    id: `usr-${Date.now()}`,
    name: displayName,
    email: email.trim() || "kittitee@northstar.studio",
    initials,
    role: "Project admin",
  };
}

// 1. Auth Endpoints
export const authApi = {
  async login(payload: LoginRequestDto): Promise<AuthSessionResponseDto> {
    if (apiConfig.isRemote) {
      const res = await apiClient.post<AuthSessionResponseDto>("/auth/login", payload, { skipAuth: true });
      if (res.accessToken) tokenStorage.setToken(res.accessToken);
      return res;
    }
    const user = buildLocalAuthUser(payload.email);
    const accessToken = `local_jwt_${Date.now()}`;
    tokenStorage.setToken(accessToken);
    return { user, accessToken };
  },

  async register(payload: RegisterRequestDto): Promise<AuthSessionResponseDto> {
    if (apiConfig.isRemote) {
      const res = await apiClient.post<AuthSessionResponseDto>("/auth/register", payload, { skipAuth: true });
      if (res.accessToken) tokenStorage.setToken(res.accessToken);
      return res;
    }
    const user = buildLocalAuthUser(payload.email, `${payload.firstName} ${payload.lastName}`);
    const accessToken = `local_jwt_${Date.now()}`;
    tokenStorage.setToken(accessToken);
    return { user, accessToken };
  },

  async forgotPassword(payload: ForgotPasswordRequestDto): Promise<{ sent: boolean }> {
    if (apiConfig.isRemote) {
      return apiClient.post<{ sent: boolean }>("/auth/forgot-password", payload, { skipAuth: true });
    }
    return { sent: true };
  },

  async getSession(): Promise<AuthUserDto | null> {
    if (apiConfig.isRemote) {
      return apiClient.get<AuthUserDto>("/auth/me");
    }
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("workrail_user");
      return stored ? (JSON.parse(stored) as AuthUserDto) : null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    if (apiConfig.isRemote) {
      await apiClient.post("/auth/logout").catch(() => undefined);
    }
    tokenStorage.clearToken();
  },
};

// 2. Projects Endpoints
export const projectsApi = {
  async list(): Promise<Project[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<Project[]>("/projects");
    }
    return [...seedProjects];
  },

  async getByIdOrSlug(projectIdOrSlug: string): Promise<Project | undefined> {
    if (apiConfig.isRemote) {
      return apiClient.get<Project>(`/projects/${encodeURIComponent(projectIdOrSlug)}`);
    }
    const normalized = projectIdOrSlug.toLowerCase();
    return seedProjects.find(
      (p) => p.id.toLowerCase() === normalized || p.key.toLowerCase() === normalized,
    );
  },

  async create(payload: CreateProjectRequestDto): Promise<Project> {
    if (apiConfig.isRemote) {
      return apiClient.post<Project>("/projects", payload);
    }
    return {
      id: `project-${Date.now()}`,
      name: payload.name,
      key: payload.key.toUpperCase(),
      template: payload.template,
      boardConfig: getBoardConfig(payload.template),
      role: "Project admin",
      openIssues: 0,
      assignedIssues: 0,
      lastUpdated: "Created just now",
      updatedAt: Date.now(),
      favorite: false,
      color: "symbol-green",
    };
  },

  async update(projectId: string, payload: UpdateProjectRequestDto): Promise<Project> {
    if (apiConfig.isRemote) {
      return apiClient.patch<Project>(`/projects/${encodeURIComponent(projectId)}`, payload);
    }
    const existing = seedProjects.find((p) => p.id === projectId) ?? seedProjects[0]!;
    return {
      ...existing,
      ...payload,
      lastUpdated: "Updated just now",
      updatedAt: Date.now(),
    };
  },

  async toggleFavorite(projectId: string, favorite?: boolean): Promise<{ id: string; favorite: boolean }> {
    if (apiConfig.isRemote) {
      return apiClient.post<{ id: string; favorite: boolean }>(
        `/projects/${encodeURIComponent(projectId)}/favorite`,
        { favorite },
      );
    }
    return { id: projectId, favorite: favorite ?? true };
  },
};

// 3. Issues Endpoints
export const issuesApi = {
  async listByProject(projectId: string, project?: Project): Promise<Issue[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<Issue[]>(`/projects/${encodeURIComponent(projectId)}/issues`);
    }
    if (projectId === "app") return [...seedIssues];
    const fallbackProject = project ?? seedProjects.find((p) => p.id === projectId);
    return fallbackProject ? getProjectSampleIssues(fallbackProject) : [];
  },

  async create(payload: CreateIssueRequestDto, existingKeys: string[] = [], projectKey = "APP"): Promise<Issue> {
    if (apiConfig.isRemote) {
      return apiClient.post<Issue>(`/projects/${encodeURIComponent(payload.projectId)}/issues`, payload);
    }
    const nextNum = getNextIssueNumber(existingKeys);
    const rawAssignee = payload.assignee?.trim() ?? "";
    const assignee = rawAssignee || "Unassigned";
    const personInfo = rawAssignee
      ? peopleAvatars[rawAssignee] ?? (["AM", "avatar-mint"] as [string, string])
      : (["—", "avatar-extra"] as [string, string]);

    return {
      id: `new-${Date.now()}`,
      key: `${projectKey}-${nextNum}`,
      title: payload.title.trim(),
      status: payload.status || "To Do",
      type: payload.type || "Task",
      priority: payload.priority || "Medium",
      assignee,
      initials: personInfo[0],
      color: personInfo[1],
      comments: 0,
      attachments: 0,
      votes: 0,
      tags: payload.tags ?? (payload.sprint ? [payload.sprint] : ["New issue"]),
      description: payload.description ?? "",
      env: payload.env || "Development",
      release: payload.release || "v1.5.0",
      ...(payload.sprint ? { sprint: payload.sprint } : {}),
      ...(payload.points ? { points: payload.points } : {}),
      ...(payload.parent ? { parent: payload.parent } : {}),
    };
  },

  async createSubtask(
    payload: CreateSubtaskRequestDto,
    existingKeys: string[] = [],
    projectKey = "APP",
  ): Promise<Issue> {
    if (apiConfig.isRemote) {
      return apiClient.post<Issue>(
        `/projects/${encodeURIComponent(payload.projectId)}/issues/${encodeURIComponent(payload.parentIssueId)}/subtasks`,
        payload,
      );
    }
    const nextNum = getNextIssueNumber(existingKeys);
    const rawAssignee = payload.assignee?.trim() ?? "";
    const assignee = rawAssignee || "Unassigned";
    const personInfo = rawAssignee
      ? peopleAvatars[rawAssignee] ?? (["AM", "avatar-mint"] as [string, string])
      : (["—", "avatar-extra"] as [string, string]);

    return {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      key: `${projectKey}-${nextNum}`,
      title: payload.title.trim(),
      status: payload.status || "To Do",
      type: "Subtask",
      priority: payload.priority || "Medium",
      assignee,
      initials: personInfo[0],
      color: personInfo[1],
      comments: 0,
      attachments: 0,
      votes: 0,
      tags: ["Subtask"],
      description: "",
      env: "Development",
      release: "v1.5.0",
      parent: payload.parentIssueKey,
    };
  },

  async update(projectId: string, issueId: string, changes: UpdateIssueRequestDto): Promise<Partial<Issue>> {
    if (apiConfig.isRemote) {
      return apiClient.patch<Issue>(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`,
        changes,
      );
    }
    return changes;
  },

  async move(projectId: string, issueId: string, payload: MoveIssueRequestDto): Promise<MoveIssueRequestDto> {
    if (apiConfig.isRemote) {
      return apiClient.post<MoveIssueRequestDto>(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}/move`,
        payload,
      );
    }
    return payload;
  },

  async remove(projectId: string, issueId: string): Promise<void> {
    if (apiConfig.isRemote) {
      await apiClient.delete(`/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`);
    }
  },
};

// 4. Sprints Endpoints
export const sprintsApi = {
  async listByProject(projectId: string): Promise<SprintItem[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<SprintItem[]>(`/projects/${encodeURIComponent(projectId)}/sprints`);
    }
    return [];
  },

  async create(projectId: string, payload: CreateSprintRequestDto, existingCount = 0): Promise<SprintItem> {
    if (apiConfig.isRemote) {
      return apiClient.post<SprintItem>(`/projects/${encodeURIComponent(projectId)}/sprints`, payload);
    }
    return {
      ...payload,
      id: `sprint-${Date.now()}`,
      code: `S-${existingCount + 1}`,
      status: "planned",
    };
  },

  async update(
    projectId: string,
    sprintId: string,
    payload: UpdateSprintRequestDto,
  ): Promise<UpdateSprintRequestDto> {
    if (apiConfig.isRemote) {
      return apiClient.patch<SprintItem>(
        `/projects/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}`,
        payload,
      );
    }
    return payload;
  },

  async remove(projectId: string, sprintId: string): Promise<void> {
    if (apiConfig.isRemote) {
      await apiClient.delete(`/projects/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}`);
    }
  },
};

// 5. Docs & Handoffs Endpoints
export const docsApi = {
  async getDoc(projectId: string, kind: ProjectDocKind): Promise<ProjectDocDto> {
    if (apiConfig.isRemote) {
      return apiClient.get<ProjectDocDto>(`/projects/${encodeURIComponent(projectId)}/docs/${kind}`);
    }
    return {
      projectId,
      kind,
      markdown:
        kind === "brief"
          ? "# Storefront refresh\n\nA clear, reliable shopping experience for every customer."
          : "# Working notes · API & Auth\n\nLabels: `Identity`, `API`",
      labels: kind === "notes" ? ["Identity", "API"] : undefined,
      version: 3,
      updatedAt: new Date().toISOString(),
    };
  },

  async updateDoc(
    projectId: string,
    kind: ProjectDocKind,
    payload: { markdown: string; labels?: string[]; version?: number },
  ): Promise<ProjectDocDto> {
    if (apiConfig.isRemote) {
      return apiClient.put<ProjectDocDto>(`/projects/${encodeURIComponent(projectId)}/docs/${kind}`, payload);
    }
    return {
      projectId,
      kind,
      markdown: payload.markdown,
      labels: payload.labels,
      version: (payload.version ?? 3) + 1,
      updatedAt: new Date().toISOString(),
    };
  },

  async listHandoffs(projectId: string): Promise<HandoffItemDto[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<HandoffItemDto[]>(`/projects/${encodeURIComponent(projectId)}/handoffs`);
    }
    return [];
  },

  async createHandoff(projectId: string, payload: CreateHandoffRequestDto): Promise<HandoffItemDto> {
    if (apiConfig.isRemote) {
      return apiClient.post<HandoffItemDto>(`/projects/${encodeURIComponent(projectId)}/handoffs`, payload);
    }
    return {
      id: `H-${Date.now()}`,
      title: payload.title,
      targetRole: payload.targetRole,
      issues: payload.issues,
      status: "open",
      author: "Kittitee Sitthisom",
      updatedAt: "Just now",
      body: payload.body,
    };
  },
};

// 6. Agents & MCP Endpoints
export const agentsApi = {
  async listAgents(): Promise<AgentAccountDto[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<AgentAccountDto[]>("/agents");
    }
    return [];
  },

  async createAgent(payload: { name: string; role: string }): Promise<AgentAccountDto> {
    if (apiConfig.isRemote) {
      return apiClient.post<AgentAccountDto>("/agents", payload);
    }
    return {
      id: `agent-${Date.now()}`,
      name: payload.name,
      role: payload.role,
      paused: false,
      runsToday: 0,
    };
  },

  async togglePause(agentId: string, paused: boolean): Promise<{ id: string; paused: boolean }> {
    if (apiConfig.isRemote) {
      return apiClient.patch<{ id: string; paused: boolean }>(`/agents/${encodeURIComponent(agentId)}`, { paused });
    }
    return { id: agentId, paused };
  },

  async listTokens(): Promise<PersonalAccessTokenDto[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<PersonalAccessTokenDto[]>("/auth/tokens");
    }
    return [];
  },

  async createToken(payload: { name: string; role: string; expiry: string }): Promise<PersonalAccessTokenDto> {
    if (apiConfig.isRemote) {
      return apiClient.post<PersonalAccessTokenDto>("/auth/tokens", payload);
    }
    const secret = `board_pat_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 8)}`;
    return {
      id: `tok-${Date.now()}`,
      name: payload.name,
      role: payload.role,
      expiry: payload.expiry,
      preview: `${secret.slice(0, 14)}…`,
      secret,
    };
  },

  async revokeToken(tokenId: string): Promise<void> {
    if (apiConfig.isRemote) {
      await apiClient.delete(`/auth/tokens/${encodeURIComponent(tokenId)}`);
    }
  },

  async listOAuthApps(): Promise<OAuthConnectedAppDto[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<OAuthConnectedAppDto[]>("/auth/oauth-apps");
    }
    return [
      {
        id: "chatgpt-oauth",
        name: "ChatGPT",
        via: "signed in via browser",
        lastUsed: "last used 6d ago",
        expires: "expires 16 Nov 2027",
        role: "Admin",
      },
    ];
  },
};

// 7. Team & Members Endpoints
export const membersApi = {
  async list(): Promise<WorkspaceMemberDto[]> {
    if (apiConfig.isRemote) {
      return apiClient.get<WorkspaceMemberDto[]>("/members");
    }
    const defaultRoles = ["Project admin", "Developer", "QA", "BA"];
    return people.map((person, index) => ({
      id: `mem-${index + 1}`,
      name: person,
      initials: peopleAvatars[person]?.[0] ?? "AM",
      avatarClass: peopleAvatars[person]?.[1] ?? "avatar-mint",
      roleLane: defaultRoles[index] ?? "Developer",
      accessRole: index === 0 ? "Project admin" : "Member",
      active: index !== 3,
    }));
  },

  async updateMember(
    memberId: string,
    payload: Partial<Pick<WorkspaceMemberDto, "roleLane" | "accessRole" | "active">>,
  ): Promise<Partial<WorkspaceMemberDto>> {
    if (apiConfig.isRemote) {
      return apiClient.patch<WorkspaceMemberDto>(`/members/${encodeURIComponent(memberId)}`, payload);
    }
    return { id: memberId, ...payload };
  },
};
