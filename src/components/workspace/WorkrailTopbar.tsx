import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Bot,
  ChevronDown,
  CircleHelp,
  FileCode2,
  House,
  ListTodo,
  LogOut,
  Moon,
  Search,
  SquareKanban,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

import type { Project } from "@/lib/project-dashboard";
import type { WorkspaceView } from "@/lib/workspace-data";
import { useWorkspaceStore } from "@/lib/workspace-store";

export function WorkrailMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="2" width="3.5" height="12" fill="currentColor" />
      <rect x="7.25" y="2" width="3.5" height="12" fill="currentColor" />
      <rect x="13" y="6" width="3.5" height="10" fill="currentColor" />
    </svg>
  );
}

export function ProjectKeyBadge({ project, small = false }: { project: Project; small?: boolean }) {
  return (
    <span className={`home-key home-key-${project.color} ${small ? "home-key-sm" : ""}`}>
      {project.key.slice(0, 3)}
    </span>
  );
}

const menuItems: { label: string; icon: ReactNode; target: WorkspaceView | "Projects" | "My work" }[] = [
  { label: "Projects", icon: <SquareKanban size={15} />, target: "Projects" },
  { label: "My work", icon: <ListTodo size={15} />, target: "My work" },
  { label: "Manager insights", icon: <Activity size={15} />, target: "Manager Insights" },
  { label: "Project docs & brief", icon: <FileCode2 size={15} />, target: "Project Brief" },
  { label: "Agent & MCP access", icon: <Bot size={15} />, target: "MCP & AI Integration" },
  { label: "Users & members", icon: <Users size={15} />, target: "Team & Seat-Day Billing" },
];

function getLocalizedMenuLabel(label: string, lang: "en" | "th"): string {
  if (lang !== "th") return label;
  switch (label) {
    case "Projects":
      return "โปรเจกต์";
    case "My work":
      return "งานของฉัน";
    case "Sales & billing":
      return "การขายและการเงิน";
    case "Manager insights":
      return "ข้อมูลเชิงลึก";
    case "Company brief":
      return "เอกสารสรุปบริษัท";
    case "Agent & MCP access":
      return "การเชื่อมต่อ Agent & MCP";
    case "Team & seats":
      return "ทีมและที่นั่ง";
    default:
      return label;
  }
}

export function WorkrailTopbar({
  darkMode,
  currentLabel,
  projects,
  activeProjectId,
  onToggleDark,
  onSearch,
  onNotice,
  onNavigate,
  onOpenProject,
  onProjects,
  onMyWork,
}: {
  darkMode: boolean;
  currentLabel: string;
  projects: Project[];
  activeProjectId?: string | undefined;
  onToggleDark: () => void;
  onSearch: () => void;
  onNotice: (message: string) => void;
  onNavigate: (target: WorkspaceView) => void;
  onOpenProject: (project: Project) => void;
  onProjects: () => void;
  onMyWork: () => void;
}) {
  const { user, logout, language, setLanguage } = useWorkspaceStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [menuOpen, accountOpen]);

  const select = (target: (typeof menuItems)[number]["target"]) => {
    setMenuOpen(false);
    if (target === "Projects") onProjects();
    else if (target === "My work") onMyWork();
    else onNavigate(target);
  };

  return (
    <header className="home-topbar">
      <div className="home-topbar-left">
        <button className="home-brand" aria-label="workrail home" onClick={onProjects}>
          <span className="home-logo" aria-hidden="true">
            <WorkrailMark size={16} />
          </span>
          <strong>workrail</strong>
        </button>
        <div className="home-menu-wrap">
          <button
            className="home-switcher"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="home-switcher-icon">
              <House size={13} />
            </span>
            {getLocalizedMenuLabel(currentLabel, language)}
            <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <>
              <button
                className="home-menu-backdrop"
                aria-label="Close menu"
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
              />
              <div className="home-menu" role="menu">
                {menuItems.map((item) => (
                  <button key={item.label} role="menuitem" onClick={() => select(item.target)}>
                    {item.icon}
                    <span>{getLocalizedMenuLabel(item.label, language)}</span>
                  </button>
                ))}
                <div className="home-menu-divider" />
                <span className="home-menu-label">{language === "th" ? "โปรเจกต์" : "PROJECTS"}</span>
                {projects.slice(0, 4).map((project) => (
                  <button
                    key={project.id}
                    role="menuitem"
                    className={activeProjectId === project.id ? "is-current" : ""}
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProject(project);
                    }}
                  >
                    <span className="home-key home-key-sm">{project.key.slice(0, 3)}</span>
                    <span>{project.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="home-topbar-right">
        <button className="home-global-search" onClick={onSearch}>
          <Search size={14} />
          <span>{language === "th" ? "ค้นหา issues, ไปที่…" : "Search issues, jump to…"}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button
          className="home-icon-button"
          title={
            darkMode
              ? language === "th"
                ? "เปลี่ยนเป็นโหมดสว่าง"
                : "Switch to light theme"
              : language === "th"
                ? "เปลี่ยนเป็นโหมดมืด"
                : "Switch to dark theme"
          }
          aria-pressed={darkMode}
          onClick={onToggleDark}
        >
          <Moon size={15} />
        </button>
        <div className="home-lang" role="group" aria-label={language === "th" ? "เปลี่ยนภาษา" : "Switch language"}>
          <button
            type="button"
            className={language === "th" ? "is-active" : ""}
            onClick={() => {
              setLanguage("th");
              onNotice("เปลี่ยนเป็นภาษาไทยแล้ว");
            }}
            aria-pressed={language === "th"}
            title="ภาษาไทย (TH)"
          >
            TH
          </button>
          <button
            type="button"
            className={language === "en" ? "is-active" : ""}
            onClick={() => {
              setLanguage("en");
              onNotice("Switched to English");
            }}
            aria-pressed={language === "en"}
            title="English (EN)"
          >
            EN
          </button>
        </div>
        <button
          className="home-icon-button home-help"
          title={language === "th" ? "ศูนย์ช่วยเหลือ" : "Help center"}
          onClick={() => onNotice(language === "th" ? "เปิดศูนย์ช่วยเหลือแล้ว" : "Help center opened")}
        >
          <CircleHelp size={15} />
          <i />
        </button>
        <button
          className="home-icon-button"
          title={language === "th" ? "การแจ้งเตือน" : "Notifications"}
          onClick={() => onNotice(language === "th" ? "ไม่มีการแจ้งเตือนใหม่" : "You're all caught up")}
        >
          <Bell size={15} />
        </button>
        <div className="home-account-wrap">
          <button
            type="button"
            className="home-avatar"
            title="Account"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen(!accountOpen)}
          >
            {user?.initials ?? "KS"}
          </button>
          {accountOpen && (
            <>
              <button
                className="home-menu-backdrop"
                aria-label="Close account menu"
                tabIndex={-1}
                onClick={() => setAccountOpen(false)}
              />
              <div className="home-menu home-account-menu" role="menu">
                <div className="home-account-info">
                  <strong>{user?.name ?? "Kittitee Sitthisom"}</strong>
                  <small>{user?.email ?? "kittitee@northstar.studio"}</small>
                </div>
                <div className="home-menu-divider" />
                <button
                  type="button"
                  className="home-menu-link"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    onNavigate("MCP & AI Integration");
                  }}
                >
                  <Bot size={15} />
                  <span>{language === "th" ? "การเชื่อมต่อ Agent & MCP" : "Agent & MCP access"}</span>
                </button>
                <button
                  type="button"
                  className="home-menu-link"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    logout();
                    onNotice(language === "th" ? "ออกจากระบบแล้ว" : "Signed out of your workspace");
                  }}
                >
                  <LogOut size={15} />
                  <span>{language === "th" ? "ออกจากระบบ" : "Log out"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
