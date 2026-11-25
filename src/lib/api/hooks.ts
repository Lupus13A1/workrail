import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  agentsApi,
  authApi,
  docsApi,
  issuesApi,
  membersApi,
  projectsApi,
  sprintsApi,
} from "@/lib/api/endpoints";
import { apiQueryKeys } from "@/lib/api/query-keys";
import type {
  CreateHandoffRequestDto,
  CreateIssueRequestDto,
  CreateProjectRequestDto,
  CreateSprintRequestDto,
  CreateSubtaskRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  MoveIssueRequestDto,
  ProjectDocKind,
  RegisterRequestDto,
  UpdateIssueRequestDto,
  UpdateProjectRequestDto,
  UpdateSprintRequestDto,
  WorkspaceMemberDto,
} from "@/lib/api/types";
import type { Project } from "@/lib/project-dashboard";

// Auth Hooks
export function useAuthSessionQuery(enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.auth.session(),
    queryFn: () => authApi.getSession(),
    enabled,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginRequestDto) => authApi.login(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(apiQueryKeys.auth.session(), data.user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => authApi.register(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(apiQueryKeys.auth.session(), data.user);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequestDto) => authApi.forgotPassword(payload),
  });
}

// Projects Hooks
export function useProjectsQuery(enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.projects.lists(),
    queryFn: () => projectsApi.list(),
    enabled,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectRequestDto) => projectsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.projects.all });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: UpdateProjectRequestDto }) =>
      projectsApi.update(projectId, payload),
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.projects.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.projects.lists() });
    },
  });
}

export function useToggleProjectFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, favorite }: { projectId: string; favorite?: boolean }) =>
      projectsApi.toggleFavorite(projectId, favorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.projects.all });
    },
  });
}

// Issues Hooks
export function useProjectIssuesQuery(projectId: string, project?: Project, enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.issues.byProject(projectId),
    queryFn: () => issuesApi.listByProject(projectId, project),
    enabled: Boolean(projectId) && enabled,
  });
}

export function useCreateIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      existingKeys,
      projectKey,
    }: {
      payload: CreateIssueRequestDto;
      existingKeys?: string[];
      projectKey?: string;
    }) => issuesApi.create(payload, existingKeys, projectKey),
    onSuccess: (_, { payload }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.issues.byProject(payload.projectId) });
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.projects.all });
    },
  });
}

export function useCreateSubtaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      existingKeys,
      projectKey,
    }: {
      payload: CreateSubtaskRequestDto;
      existingKeys?: string[];
      projectKey?: string;
    }) => issuesApi.createSubtask(payload, existingKeys, projectKey),
    onSuccess: (_, { payload }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.issues.byProject(payload.projectId) });
    },
  });
}

export function useUpdateIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      issueId,
      changes,
    }: {
      projectId: string;
      issueId: string;
      changes: UpdateIssueRequestDto;
    }) => issuesApi.update(projectId, issueId, changes),
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.issues.byProject(projectId) });
    },
  });
}

export function useMoveIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      issueId,
      payload,
    }: {
      projectId: string;
      issueId: string;
      payload: MoveIssueRequestDto;
    }) => issuesApi.move(projectId, issueId, payload),
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.issues.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.projects.all });
    },
  });
}

export function useDeleteIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, issueId }: { projectId: string; issueId: string }) =>
      issuesApi.remove(projectId, issueId),
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.issues.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.projects.all });
    },
  });
}

// Sprints Hooks
export function useProjectSprintsQuery(projectId: string, enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.sprints.byProject(projectId),
    queryFn: () => sprintsApi.listByProject(projectId),
    enabled: Boolean(projectId) && enabled,
  });
}

export function useCreateSprintMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
      existingCount,
    }: {
      projectId: string;
      payload: CreateSprintRequestDto;
      existingCount?: number;
    }) => sprintsApi.create(projectId, payload, existingCount),
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.sprints.byProject(projectId) });
    },
  });
}

export function useUpdateSprintMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      sprintId,
      payload,
    }: {
      projectId: string;
      sprintId: string;
      payload: UpdateSprintRequestDto;
    }) => sprintsApi.update(projectId, sprintId, payload),
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.sprints.byProject(projectId) });
    },
  });
}

// Docs & Handoffs Hooks
export function useProjectDocQuery(projectId: string, kind: ProjectDocKind, enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.docs.byProject(projectId, kind),
    queryFn: () => docsApi.getDoc(projectId, kind),
    enabled: Boolean(projectId) && enabled,
  });
}

export function useUpdateProjectDocMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      kind,
      payload,
    }: {
      projectId: string;
      kind: ProjectDocKind;
      payload: { markdown: string; labels?: string[]; version?: number };
    }) => docsApi.updateDoc(projectId, kind, payload),
    onSuccess: (_, { projectId, kind }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.docs.byProject(projectId, kind) });
    },
  });
}

export function useCreateHandoffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: CreateHandoffRequestDto }) =>
      docsApi.createHandoff(projectId, payload),
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.docs.handoffs(projectId) });
    },
  });
}

// Agents & Members Hooks
export function useAgentsQuery(enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.agents.list(),
    queryFn: () => agentsApi.listAgents(),
    enabled,
  });
}

export function useMembersQuery(enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.members.list(),
    queryFn: () => membersApi.list(),
    enabled,
  });
}

export function useUpdateMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: Partial<Pick<WorkspaceMemberDto, "roleLane" | "accessRole" | "active">>;
    }) => membersApi.updateMember(memberId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiQueryKeys.members.list() });
    },
  });
}
