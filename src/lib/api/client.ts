import { apiConfig } from "@/lib/api/config";
import type { ApiErrorPayload } from "@/lib/api/types";

const ACCESS_TOKEN_KEY = "workrail_access_token";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, status: number, code = "api_error", details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {}
  },
  clearToken(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {}
  },
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  timeoutMs?: number;
  skipAuth?: boolean;
};

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onApiUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function buildApiUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  baseUrl = apiConfig.baseUrl,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullPath = /^https?:\/\//i.test(path) ? path : `${baseUrl}${normalizedPath}`;

  if (!params) return fullPath;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (!queryString) return fullPath;
  return `${fullPath}${fullPath.includes("?") ? "&" : "?"}${queryString}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, timeoutMs = apiConfig.timeoutMs, skipAuth = false, headers: customHeaders, ...rest } = options;

  const url = buildApiUrl(path, params);
  const headers = new Headers(customHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth && !headers.has("Authorization")) {
    const token = tokenStorage.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : typeof body === "string"
              ? body
              : JSON.stringify(body),
      signal: rest.signal ?? controller.signal,
    });

    if (response.status === 401) {
      tokenStorage.clearToken();
      unauthorizedListeners.forEach((listener) => listener());
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "");

    if (!response.ok) {
      const errorPayload = (payload && typeof payload === "object" ? (payload as Partial<ApiErrorPayload>) : null) ?? {};
      throw new ApiClientError(
        errorPayload.message || `HTTP Error ${response.status}`,
        response.status,
        errorPayload.code || `http_${response.status}`,
        errorPayload.details,
      );
    }

    // Unwrap { data: T } envelope if backend returns standard ApiResponse<T>, otherwise return payload directly
    if (payload && typeof payload === "object" && "data" in payload && Object.keys(payload).length <= 2) {
      return (payload as { data: T }).data;
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError("Request timed out", 408, "request_timeout");
    }
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      "network_error",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
