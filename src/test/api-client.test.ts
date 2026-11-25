import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiClientError,
  apiClient,
  apiConfig,
  apiQueryKeys,
  authApi,
  buildApiUrl,
  issuesApi,
  onApiUnauthorized,
  projectsApi,
  tokenStorage,
} from "@/lib/api";

describe("API Layer & Client Infrastructure", () => {
  beforeEach(() => {
    tokenStorage.clearToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to local prototype mode unless VITE_API_MODE=remote", () => {
    expect(apiConfig.mode).toBe("local");
    expect(apiConfig.isRemote).toBe(false);
    expect(apiConfig.baseUrl).toBe("/api/v1");
  });

  it("builds URLs with query parameters cleanly", () => {
    const url = buildApiUrl(
      "/projects/app/issues",
      { status: "In Progress", page: 1, empty: "", nil: undefined },
      "https://api.workrail.ai/v1",
    );
    expect(url).toBe("https://api.workrail.ai/v1/projects/app/issues?status=In+Progress&page=1");
  });

  it("produces structured React Query cache keys", () => {
    expect(apiQueryKeys.projects.lists()).toEqual(["projects", "list"]);
    expect(apiQueryKeys.issues.byProject("app")).toEqual(["issues", "project", "app"]);
    expect(apiQueryKeys.docs.byProject("app", "brief")).toEqual(["docs", "project", "app", "brief"]);
  });

  it("attaches Bearer token and unwraps { data } envelope on remote HTTP calls", async () => {
    tokenStorage.setToken("test_jwt_123");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: "p1", name: "Backend Project" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await apiClient.get<{ id: string; name: string }[]>("/projects");
    expect(result).toEqual([{ id: "p1", name: "Backend Project" }]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer test_jwt_123");
  });

  it("throws ApiClientError and triggers unauthorized listeners on HTTP 401", async () => {
    tokenStorage.setToken("expired_jwt");
    const onUnauth = vi.fn();
    const unsubscribe = onApiUnauthorized(onUnauth);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "token_expired", message: "Session expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(apiClient.get("/auth/me")).rejects.toThrowError(ApiClientError);
    expect(tokenStorage.getToken()).toBeNull();
    expect(onUnauth).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("executes domain endpoints in local adapter mode without network requests", async () => {
    const session = await authApi.login({ email: "alex.morgan@northstar.studio" });
    expect(session.user.name).toBe("Alex Morgan");
    expect(session.user.initials).toBe("AM");
    expect(tokenStorage.getToken()).toContain("local_jwt_");

    const projects = await projectsApi.list();
    expect(projects.length).toBeGreaterThan(0);

    const createdIssue = await issuesApi.create(
      {
        projectId: "app",
        title: "Connect backend API endpoints",
        type: "Feature",
        priority: "High",
      },
      ["APP-101", "APP-104"],
      "APP",
    );
    expect(createdIssue.key).toBe("APP-105");
    expect(createdIssue.title).toBe("Connect backend API endpoints");
  });
});
