import type { Project, ProjectTemplate } from "@/lib/project-dashboard";
import type { Issue, IssuePriority, IssueType, SprintItem } from "@/lib/workspace-data";

// Standard API Envelope & Error Types
export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    version?: number;
  };
};

// Auth DTOs
export type AuthUserDto = {
  id?: string;
  name: string;
  email: string;
  initials: string;
  role?: string;
  avatarColor?: string;
};

export type LoginRequestDto = {
  email: string;
  password?: string;
  rememberMe?: boolean;
};

export type RegisterRequestDto = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
};

export type ForgotPasswordRequestDto = {
  email: string;
};

export type AuthSessionResponseDto = {
  user: AuthUserDto;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
};

// Project DTOs
export type CreateProjectRequestDto = {
  name: string;
  key: string;
  template: ProjectTemplate;
};

export type UpdateProjectRequestDto = Partial<
  Pick<Project, "name" | "key" | "template" | "boardConfig" | "favorite" | "sprintStatus">
>;

// Issue DTOs
export type CreateIssueRequestDto = {
  projectId: string;
  title: string;
  status?: string;
  type?: IssueType;
  priority?: IssuePriority;
  assignee?: string;
  description?: string;
  sprint?: string;
  points?: string;
  parent?: string;
  env?: string;
  release?: string;
  tags?: string[];
};

export type UpdateIssueRequestDto = Partial<Omit<Issue, "id" | "key">> & {
  version?: number;
};

export type MoveIssueRequestDto = {
  changes: Partial<Issue>;
  targetId?: string;
  position?: "before" | "after";
  version?: number;
};

export type CreateSubtaskRequestDto = {
  projectId: string;
  parentIssueId: string;
  parentIssueKey: string;
  title: string;
  assignee?: string;
  priority?: IssuePriority;
  status?: string;
};

// Sprint DTOs
export type CreateSprintRequestDto = Omit<SprintItem, "id" | "status" | "code">;

export type UpdateSprintRequestDto = Partial<Omit<SprintItem, "id" | "code">>;

// Docs / Markdown / Handoff DTOs
export type ProjectDocKind = "brief" | "notes";

export type ProjectDocDto = {
  projectId: string;
  kind: ProjectDocKind;
  markdown: string;
  labels?: string[];
  version: number;
  updatedAt: string;
};

export type HandoffItemDto = {
  id: string;
  title: string;
  targetRole: string;
  issues: string[];
  status: "open" | "acknowledged" | "closed";
  author: string;
  updatedAt: string;
  body: string;
};

export type CreateHandoffRequestDto = {
  title: string;
  targetRole: string;
  issues: string[];
  body: string;
};

// Agent & MCP Access DTOs
export type AgentAccountDto = {
  id: string;
  name: string;
  role: string;
  paused: boolean;
  runsToday?: number;
};

export type PersonalAccessTokenDto = {
  id: string;
  name: string;
  role: string;
  expiry: string;
  preview: string;
  secret?: string;
};

export type OAuthConnectedAppDto = {
  id: string;
  name: string;
  via: string;
  lastUsed: string;
  expires: string;
  role: string;
};

// Team & User Management DTOs
export type WorkspaceMemberDto = {
  id: string;
  name: string;
  email?: string;
  initials: string;
  avatarClass: string;
  roleLane: string;
  accessRole: "Project admin" | "Member";
  active: boolean;
};
