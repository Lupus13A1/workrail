import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Columns3,
  GitBranch,
  Layers3,
  LayoutGrid,
  List,
  ListTodo,
  Plus,
  Repeat2,
  Search,
  Star,
  X,
} from "lucide-react";

import {
  getBoardConfig,
  isProjectKeyUnique,
  isProjectKeyValid,
  projectTemplates,
  suggestProjectKey,
  type Project,
  type ProjectTemplate,
} from "@/lib/project-dashboard";
import { statusClass } from "@/lib/workspace-data";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Button } from "@/components/ui/button";
import { ProjectKeyBadge } from "@/components/workspace/WorkrailTopbar";

export function ProjectsDashboard({
  projects,
  recentProjectIds,
  myWorkOnly,
  greeting,
  onOpen,
  onCreate,
  onFavorite,
  onToggleMyWork,
}: {
  projects: Project[];
  recentProjectIds: string[];
  myWorkOnly: boolean;
  greeting: string;
  onOpen: (project: Project) => void;
  onCreate: () => void;
  onFavorite: (id: string) => void;
  onToggleMyWork: () => void;
}) {
  const { user, language } = useWorkspaceStore();
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState("All board types");
  const [sort, setSort] = useState("Recent activity");
  const [view, setView] = useState<"grid" | "list">("grid");

  const localizedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (language === "th") {
      if (hour >= 5 && hour < 12) return "สวัสดีตอนเช้า";
      if (hour >= 12 && hour < 17) return "สวัสดีตอนบ่าย";
      if (hour >= 17 && hour < 21) return "สวัสดีตอนเย็น";
      return "สวัสดีตอนค่ำ";
    }
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  }, [language]);

  const availableProjects = myWorkOnly ? projects.filter((project) => project.assignedIssues > 0) : projects;
  const recent = recentProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => Boolean(project));
  const visible = [...availableProjects]
    .filter((project) => `${project.name} ${project.key}`.toLowerCase().includes(query.toLowerCase()))
    .filter((project) => template === "All board types" || project.template === template)
    .sort((a, b) =>
      sort === "Project name A–Z"
        ? a.name.localeCompare(b.name)
        : sort === "Project name Z–A"
          ? b.name.localeCompare(a.name)
          : sort === "Last updated"
            ? a.updatedAt - b.updatedAt
            : b.updatedAt - a.updatedAt,
    );

  const assignedTotal = projects.reduce((sum, project) => sum + project.assignedIssues, 0);
  const activeSprints = projects.filter((project) => project.sprintStatus).length;

  return (
    <div className="home-dashboard">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">{user?.name ? user.name.toUpperCase() : "KITTITEE SITTHISOM"}</span>
          <h1>{myWorkOnly ? (language === "th" ? "งานของฉัน" : "My work") : `${localizedGreeting}, ${user?.name ? user.name.split(" ")[0] : "KITTITEE"}`}</h1>
          <p className="home-stats">
            <span>
              <strong>{projects.length}</strong> {language === "th" ? "โปรเจกต์" : projects.length === 1 ? "project" : "projects"}
            </span>
            <span>
              <strong>{assignedTotal}</strong> {language === "th" ? "งานที่มอบหมายให้คุณ" : `open ${assignedTotal === 1 ? "issue" : "issues"} assigned to you`}
            </span>
            <span>
              <strong>{activeSprints}</strong> {language === "th" ? "สปรินต์ที่กำลังรัน" : `${activeSprints === 1 ? "sprint" : "sprints"} running`}
            </span>
          </p>
        </div>
        <button className="home-create" onClick={onCreate}>
          <Plus size={15} /> {language === "th" ? "สร้างโปรเจกต์" : "Create project"}
        </button>
      </section>

      {recent.length > 0 && (
        <div className="home-recent">
          <span className="home-label">{language === "th" ? "เปิดล่าสุด" : "RECENTLY OPENED"}</span>
          {recent.map((project) => (
            <button key={project.id} className="home-recent-chip" onClick={() => onOpen(project)}>
              <ProjectKeyBadge project={project} small />
              {project.name}
            </button>
          ))}
        </div>
      )}

      <div className="home-toolbar">
        <label className="home-search">
          <Search size={15} />
          <input
            aria-label="Search projects"
            placeholder="Search by name or key..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="home-select">
          <select aria-label="Filter by board type" value={template} onChange={(event) => setTemplate(event.target.value)}>
            <option>All board types</option>
            {Object.keys(projectTemplates).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown size={13} />
        </label>
        <label className="home-select">
          <select aria-label="Sort projects" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>Recent activity</option>
            <option>Last updated</option>
            <option>Project name A–Z</option>
            <option>Project name Z–A</option>
          </select>
          <ChevronDown size={13} />
        </label>
        <div className="home-view-switch" role="group" aria-label="Project view">
          <button className={view === "grid" ? "is-active" : ""} title="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            <LayoutGrid size={14} />
          </button>
          <button className={view === "list" ? "is-active" : ""} title="List view" aria-pressed={view === "list"} onClick={() => setView("list")}>
            <List size={14} />
          </button>
        </div>
        <button className={`home-mywork ${myWorkOnly ? "is-active" : ""}`} aria-pressed={myWorkOnly} onClick={onToggleMyWork}>
          <ListTodo size={15} /> My work <span>{assignedTotal}</span>
        </button>
      </div>

      <div className="home-label home-section-label">
        {myWorkOnly ? "MY PROJECTS" : "ALL PROJECTS"} <span className="home-count">{visible.length}</span>
      </div>

      {visible.length > 0 ? (
        <div className={`home-cards ${view === "list" ? "home-cards-list" : ""}`}>
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={() => onOpen(project)} onFavorite={() => onFavorite(project.id)} />
          ))}
        </div>
      ) : (
        <div className="projects-empty home-empty">
          <span>
            <Layers3 size={20} />
          </span>
          <h3>{availableProjects.length === 0 ? (myWorkOnly ? "No assigned projects yet" : "No projects yet") : "No projects match your search"}</h3>
          <p>
            {availableProjects.length === 0
              ? myWorkOnly
                ? "Projects with your assigned issues will appear here."
                : "Create a project to start organizing work with your team."
              : "Try another name, key, or board type."}
          </p>
          {availableProjects.length === 0 && !myWorkOnly && (
            <button className="home-create" onClick={onCreate}>
              <Plus size={15} /> Create project
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen, onFavorite }: { project: Project; onOpen: () => void; onFavorite: () => void }) {
  const TemplateIcon = project.template === "Scrum" ? Repeat2 : project.template === "Kanban" ? Columns3 : GitBranch;

  return (
    <article className="home-card">
      <div className="home-card-top">
        <button className="home-card-open" onClick={onOpen}>
          <ProjectKeyBadge project={project} />
          <span className="home-card-title">
            <strong>{project.name}</strong>
            <span className="home-card-meta">
              <span>
                <TemplateIcon size={12} /> {project.template}
              </span>
              <code>{project.role}</code>
            </span>
          </span>
        </button>
        <button
          className={`home-star ${project.favorite ? "is-favorite" : ""}`}
          title={project.favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={project.favorite}
          onClick={onFavorite}
        >
          <Star size={15} fill={project.favorite ? "currentColor" : "none"} />
        </button>
      </div>
      {project.template === "Scrum" && <p className="home-card-sprint">{project.sprintStatus ?? "No sprint running"}</p>}
      <button className="home-card-metrics" onClick={onOpen} aria-label={`Open ${project.name}`}>
        <span>
          <strong>{project.openIssues}</strong>
          <small>Open issues</small>
        </span>
        <span className={project.assignedIssues > 0 ? "has-assigned" : ""}>
          <strong>{project.assignedIssues}</strong>
          <small>Assigned to you</small>
        </span>
      </button>
      <span className="home-card-updated">{project.lastUpdated}</span>
    </article>
  );
}

export function CreateProjectModal({
  projects,
  onClose,
  onCreate,
}: {
  projects: Project[];
  onClose: () => void;
  onCreate: (name: string, key: string, template: ProjectTemplate) => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [template, setTemplate] = useState<ProjectTemplate>("Scrum");

  const suggestedKey = suggestProjectKey(name);
  const normalizedKey = (keyTouched ? key : suggestedKey).toUpperCase();
  const keyValid = normalizedKey.length >= 2 && normalizedKey.length <= 10 && isProjectKeyValid(normalizedKey);
  const keyUnique = isProjectKeyUnique(normalizedKey, projects);
  const canCreate = name.trim().length > 0 && keyValid && keyUnique;
  const board = getBoardConfig(template);
  const templateTag: Record<ProjectTemplate, string> = {
    Scrum: "scrum",
    Kanban: "kanban",
    "Delivery Pipeline": "pipeline",
  };

  return (
    <div
      className="modal-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="create-project-modal create-project-single"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        onSubmit={(event) => {
          event.preventDefault();
          if (canCreate) onCreate(name.trim(), normalizedKey, template);
        }}
      >
        <div className="create-project-head">
          <div>
            <span className="eyebrow">COMPANY ADMIN</span>
            <h2 id="create-project-title">Create project</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" title="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="create-project-body">
          <div className="cp-field">
            <label htmlFor="cp-name">Name</label>
            <input
              id="cp-name"
              autoFocus
              className="cp-input"
              placeholder="e.g. Marketing Board"
              value={name}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                if (!keyTouched) setKey(suggestProjectKey(value));
              }}
            />
            <p className="cp-hint">The project's full name, shown on the board and in lists.</p>
          </div>

          <div className="cp-field">
            <label htmlFor="cp-key">Key</label>
            <input
              id="cp-key"
              className="cp-input cp-input-key"
              placeholder="e.g. MKT"
              maxLength={10}
              value={normalizedKey}
              onChange={(event) => {
                setKeyTouched(true);
                setKey(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
              }}
            />
            <p className="cp-hint">
              2–10 letters that start every issue key: {normalizedKey || "MKT"} gives {normalizedKey || "MKT"}-1, {normalizedKey || "MKT"}-2... Cannot be changed later.
            </p>
            {normalizedKey && !keyValid && <p className="field-error">Use 2–10 English letters or numbers.</p>}
            {normalizedKey && keyValid && !keyUnique && <p className="field-error">That project key is already in use.</p>}
          </div>

          <div className="cp-template-section">
            <div className="cp-template-intro">
              <strong>Template</strong>
              <p>A template sets the columns, fields and default view so the board is ready to use. Every plan can pick one; columns and fields can be changed later in Project settings (Premium).</p>
            </div>

            <div className="cp-group-head">
              <h3>Software delivery</h3>
              <p>The three boards as before — the rules differ for real (sprints, WIP, environment gates)</p>
            </div>

            <div className="cp-template-grid">
              {(Object.keys(projectTemplates) as ProjectTemplate[]).map((item) => {
                const selected = template === item;
                return (
                  <button
                    type="button"
                    key={item}
                    className={`cp-template-card ${selected ? "is-selected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => setTemplate(item)}
                  >
                    <div className="cp-mini-board" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((col) => (
                        <span key={col} className={`cp-mini-col cp-mini-col-${col}`}>
                          {col === 0 && (
                            <>
                              <i />
                              <i />
                            </>
                          )}
                          {col === 1 && <i />}
                        </span>
                      ))}
                      {selected && (
                        <span className="cp-selected-check">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <strong className="cp-template-title">{item === "Delivery Pipeline" ? "Delivery pipeline" : item}</strong>
                    <p className="cp-template-desc">{projectTemplates[item].description}</p>
                    <div className="cp-template-tags">
                      <span>{templateTag[item]}</span>
                      <span>Columns</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="workflow-preview">
              <div>
                <strong>Workflow preview</strong>
                <span>
                  {board.length} columns · {template}
                </span>
              </div>
              <div>
                {board.map((column, index) => (
                  <span key={column}>
                    <i className={`status-dot ${statusClass(column)}`} />
                    {column}
                    {index < board.length - 1 && <ChevronRight size={12} />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="wizard-footer">
          <span>{normalizedKey ? `${normalizedKey} · ${template}` : `${template} template`}</span>
          <div>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canCreate}>
              <Plus size={15} /> Create project
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
