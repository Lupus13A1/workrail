import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, X } from "lucide-react";

import type { Project } from "@/lib/project-dashboard";
import { getProjectSlug, useWorkspaceStore } from "@/lib/workspace-store";
import { useI18n } from "@/lib/i18n";
import type { WorkspaceView } from "@/lib/workspace-data";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CreateProjectModal, ProjectsDashboard } from "@/components/workspace/ProjectsHome";
import { WorkrailTopbar } from "@/components/workspace/WorkrailTopbar";
import { GlobalSearchModal } from "@/components/workspace/WorkspaceModals";
import { BriefView, InsightsView, IntegrationView, SalesView, TeamView } from "@/components/workspace/WorkspaceSubpages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workrail" },
      { name: "description", content: "Browse, search, and create projects with Scrum, Kanban, or delivery pipeline workflows." },
      { property: "og:title", content: "workrail — Projects home" },
      { property: "og:description", content: "Browse, search, and create projects with Scrum, Kanban, or delivery pipeline workflows." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeWorkspace,
});

function HomeWorkspace() {
  const routerNavigate = useNavigate();
  const store = useWorkspaceStore();
  const { t } = useI18n();

  const [myWorkOnly, setMyWorkOnly] = useState(false);
  const [subpage, setSubpage] = useState<WorkspaceView | null>(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    const greetingText =
      hour >= 5 && hour < 12
        ? t.dashboard.goodMorning
        : hour >= 12 && hour < 17
          ? t.dashboard.goodAfternoon
          : hour >= 17 && hour < 21
            ? t.dashboard.goodEvening
            : t.dashboard.goodNight;
    setGreeting(greetingText);
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view") as WorkspaceView | null;
    if (viewParam) {
      setSubpage(viewParam);
    } else if (params.get("myWork") === "1") {
      setMyWorkOnly(true);
    }
  }, []);

  const openProject = (project: Project) => {
    void routerNavigate({
      to: "/project/$projectSlug",
      params: { projectSlug: getProjectSlug(project) },
    });
  };

  const defaultIssues = store.getIssues("app");

  return (
    <AuthGuard>
      <div className={`workspace-shell ${!subpage ? "home-mode" : ""} ${store.darkMode ? "dark" : "light-mode"}`}>
        <main className="app-main">
        <WorkrailTopbar
          darkMode={store.darkMode}
          currentLabel={subpage ?? (myWorkOnly ? "My work" : "Projects")}
          projects={store.projects}
          onToggleDark={() => store.setDarkMode(!store.darkMode)}
          onSearch={() => setGlobalSearchOpen(true)}
          onNotice={store.setNotice}
          onNavigate={(target) => {
            if (target === "Board" || target === "Backlog & Sprints" || target === "Delivery Pipeline") {
              const firstProject = store.projects[0];
              if (firstProject) openProject(firstProject);
            } else {
              setSubpage(target);
            }
          }}
          onOpenProject={openProject}
          onProjects={() => {
            setSubpage(null);
            setMyWorkOnly(false);
          }}
          onMyWork={() => {
            setSubpage(null);
            setMyWorkOnly(true);
          }}
        />

        {!subpage ? (
          <ProjectsDashboard
            projects={store.projects}
            recentProjectIds={store.recentProjectIds}
            myWorkOnly={myWorkOnly}
            greeting={greeting}
            onOpen={openProject}
            onCreate={() => setCreateProjectOpen(true)}
            onFavorite={store.toggleFavorite}
            onToggleMyWork={() => setMyWorkOnly(!myWorkOnly)}
          />
        ) : (
          <section className="canvas">
            {subpage === "Project Brief" && <BriefView onCopy={store.copyText} />}
            {subpage === "Sales & Billing" && <SalesView onNotice={store.setNotice} />}
            {subpage === "Manager Insights" && <InsightsView issues={defaultIssues} onOpen={() => openProject(store.projects[0]!)} />}
            {subpage === "MCP & AI Integration" && <IntegrationView onCopy={store.copyText} />}
            {subpage === "Team & Seat-Day Billing" && <TeamView onNotice={store.setNotice} />}
          </section>
        )}
      </main>

      {createProjectOpen && (
        <CreateProjectModal
          projects={store.projects}
          onClose={() => setCreateProjectOpen(false)}
          onCreate={(name, key, template) => {
            const created = store.createProject(name, key, template);
            setCreateProjectOpen(false);
            openProject(created);
          }}
        />
      )}

      {globalSearchOpen && (
        <GlobalSearchModal
          projects={store.projects}
          issues={defaultIssues}
          onClose={() => setGlobalSearchOpen(false)}
          onOpenProject={(project) => {
            setGlobalSearchOpen(false);
            openProject(project);
          }}
          onOpenIssue={() => {
            setGlobalSearchOpen(false);
            if (store.projects[0]) openProject(store.projects[0]);
          }}
          onNavigate={(target) => {
            setGlobalSearchOpen(false);
            if (target === "Board" || target === "Backlog & Sprints" || target === "Delivery Pipeline") {
              if (store.projects[0]) openProject(store.projects[0]);
            } else {
              setSubpage(target);
            }
          }}
        />
      )}

      {store.notice && (
        <div className="toast-message">
          <Check size={15} />
          {store.notice}
          <Button variant="ghost" size="icon" title="Dismiss" onClick={() => store.setNotice("")}>
            <X size={14} />
          </Button>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
