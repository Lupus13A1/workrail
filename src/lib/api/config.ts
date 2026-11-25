// Backend API configuration
// Default mode is "local" so the interactive prototype works out-of-the-box without requiring a live backend.
// Set VITE_API_MODE="remote" and VITE_API_BASE_URL="https://api.example.com" in .env to connect to a real backend.

export type ApiMode = "local" | "remote";

function getEnvVar(key: string, fallback: string): string {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    if (metaEnv && typeof metaEnv[key] === "string" && metaEnv[key]!.trim() !== "") {
      return metaEnv[key]!.trim();
    }
  } catch {
    // Ignore in environments where import.meta.env is unavailable
  }
  return fallback;
}

export const apiConfig = {
  get baseUrl(): string {
    return getEnvVar("VITE_API_BASE_URL", "/api/v1").replace(/\/+$/, "");
  },
  get mode(): ApiMode {
    const raw = getEnvVar("VITE_API_MODE", "local").toLowerCase();
    return raw === "remote" ? "remote" : "local";
  },
  get isRemote(): boolean {
    return this.mode === "remote";
  },
  get timeoutMs(): number {
    const parsed = Number(getEnvVar("VITE_API_TIMEOUT_MS", "15000"));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
  },
};
