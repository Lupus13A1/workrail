import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

import { WorkrailMark } from "@/components/workspace/WorkrailTopbar";
import { useWorkspaceStore } from "@/lib/workspace-store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthReady, darkMode } = useWorkspaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const search = currentPath && currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : "";
      void navigate({ to: `/login${search}` });
    }
  }, [isAuthReady, isAuthenticated, navigate]);

  if (!isAuthReady || !isAuthenticated) {
    return (
      <div
        className={`workspace-shell ${darkMode ? "dark" : "light-mode"}`}
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg-app, #f8f9fa)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div
            className="auth-v2-logo"
            style={{
              width: "44px",
              height: "44px",
              display: "grid",
              placeItems: "center",
              borderRadius: "10px",
              background: "var(--auth-primary, #0f172a)",
              color: "var(--auth-primary-ink, #ffffff)",
            }}
          >
            <WorkrailMark size={24} />
          </div>
          <span style={{ fontSize: "14px", color: "var(--text-secondary, #64748b)" }}>
            Checking authentication...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
