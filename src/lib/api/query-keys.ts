import type { ProjectDocKind } from "@/lib/api/types";

export const apiQueryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...apiQueryKeys.auth.all, "session"] as const,
  },
  projects: {
    all: ["projects"] as const,
    lists: () => [...apiQueryKeys.projects.all, "list"] as const,
    detail: (projectIdOrSlug: string) => [...apiQueryKeys.projects.all, "detail", projectIdOrSlug] as const,
  },
  issues: {
    all: ["issues"] as const,
    byProject: (projectId: string) => [...apiQueryKeys.issues.all, "project", projectId] as const,
    detail: (projectId: string, issueId: string) => [...apiQueryKeys.issues.byProject(projectId), issueId] as const,
  },
  sprints: {
    all: ["sprints"] as const,
    byProject: (projectId: string) => [...apiQueryKeys.sprints.all, "project", projectId] as const,
  },
  docs: {
    all: ["docs"] as const,
    byProject: (projectId: string, kind: ProjectDocKind) =>
      [...apiQueryKeys.docs.all, "project", projectId, kind] as const,
    handoffs: (projectId: string) => [...apiQueryKeys.docs.all, "handoffs", projectId] as const,
  },
  agents: {
    all: ["agents"] as const,
    list: () => [...apiQueryKeys.agents.all, "list"] as const,
    tokens: () => [...apiQueryKeys.agents.all, "tokens"] as const,
    oauthApps: () => [...apiQueryKeys.agents.all, "oauth-apps"] as const,
  },
  members: {
    all: ["members"] as const,
    list: () => [...apiQueryKeys.members.all, "list"] as const,
  },
} as const;
