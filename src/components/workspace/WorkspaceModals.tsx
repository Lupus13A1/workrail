import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Eye,
  FileCode2,
  GitBranch,
  Info,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  MessageSquare,
  Minimize2,
  Paperclip,
  Pencil,
  Play,
  Plus,
  Quote,
  Search,
  Sparkles,
  SquareKanban,
  Strikethrough,
  Trash2,
  X,
} from "lucide-react";

import type { Project } from "@/lib/project-dashboard";
import {
  people,
  peopleAvatars,
  pipelineColumns,
  type Issue,
  type IssuePriority,
  type IssueType,
  type SprintItem,
  type WorkspaceView,
} from "@/lib/workspace-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function GlobalSearchModal({
  projects,
  issues,
  onClose,
  onOpenProject,
  onOpenIssue,
  onNavigate,
}: {
  projects: Project[];
  issues: Issue[];
  onClose: () => void;
  onOpenProject: (project: Project) => void;
  onOpenIssue: (id: string) => void;
  onNavigate: (target: WorkspaceView) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  const normalized = query.trim().toLowerCase();
  const matchingProjects = projects
    .filter((project) => !normalized || `${project.name} ${project.key}`.toLowerCase().includes(normalized))
    .slice(0, 5);
  const matchingIssues = issues
    .filter((issue) => !normalized || `${issue.key} ${issue.title} ${issue.assignee}`.toLowerCase().includes(normalized))
    .slice(0, 5);
  const pages = (
    [
      { title: "Projects", icon: <SquareKanban size={14} />, target: "Board" },
      { title: "Backlog & Sprints", icon: <CalendarDays size={14} />, target: "Backlog & Sprints" },
      { title: "Delivery Pipeline", icon: <GitBranch size={14} />, target: "Delivery Pipeline" },
      { title: "Project Brief", icon: <FileCode2 size={14} />, target: "Project Brief" },
      { title: "Sales & Billing", icon: <Clock3 size={14} />, target: "Sales & Billing" },
      { title: "Manager Insights", icon: <Activity size={14} />, target: "Manager Insights" },
    ] satisfies { title: string; icon: ReactNode; target: WorkspaceView }[]
  ).filter((page) => !normalized || page.title.toLowerCase().includes(normalized));

  return (
    <div
      className="modal-scrim search-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="global-search-modal" role="dialog" aria-modal="true" aria-label="Global search">
        <div className="global-search-input">
          <Search size={17} />
          <Input
            autoFocus
            aria-label="Search issues, projects, and pages"
            placeholder="Search issues, projects, and pages…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="global-search-results">
          {matchingProjects.length > 0 && (
            <div>
              <span className="search-group-label">PROJECTS</span>
              {matchingProjects.map((project) => (
                <button key={project.id} onClick={() => onOpenProject(project)}>
                  <span className={`project-symbol ${project.color}`}>{project.name.slice(0, 1)}</span>
                  <span>
                    <strong>{project.name}</strong>
                    <small>
                      {project.key} · {project.template}
                    </small>
                  </span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          )}
          {matchingIssues.length > 0 && (
            <div>
              <span className="search-group-label">ISSUES</span>
              {matchingIssues.map((issue) => (
                <button key={issue.id} onClick={() => onOpenIssue(issue.id)}>
                  <span className={`type-icon type-${issue.type.toLowerCase()}`}>
                    {issue.type === "Bug" ? "◆" : issue.type === "Feature" ? "✦" : "≡"}
                  </span>
                  <span>
                    <strong>{issue.title}</strong>
                    <small>
                      {issue.key} · {issue.status} · {issue.assignee}
                    </small>
                  </span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          )}
          {pages.length > 0 && (
            <div>
              <span className="search-group-label">PAGES</span>
              {pages.map((page) => (
                <button key={page.title} onClick={() => onNavigate(page.target)}>
                  {page.icon}
                  <span>
                    <strong>{page.title}</strong>
                  </span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          )}
          {matchingProjects.length + matchingIssues.length + pages.length === 0 && (
            <div className="global-search-empty">
              <Search size={18} />
              <span>No matching results</span>
            </div>
          )}
        </div>
        <div className="global-search-footer">
          <span>Search by project name, key, issue, or page</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </section>
    </div>
  );
}

const typeDescriptions: Record<IssueType, string> = {
  Epic: "Epic — a large body of work that spans multiple issues or sprints.",
  Feature: "Feature — a new capability or customer-facing improvement.",
  Task: "Task — one piece of work someone can pick up and finish.",
  Subtask: "Subtask — a smaller step nested under a parent issue.",
  Bug: "Bug — unexpected behavior or a defect to investigate and fix.",
};

export function CreateIssueModal({
  projectName,
  projectKey,
  columns: projectColumns,
  sprints,
  onClose,
  onCreate,
}: {
  projectName: string;
  projectKey: string;
  columns: string[];
  sprints: SprintItem[];
  onClose: () => void;
  onCreate: (data: FormData) => void;
}) {
  const initialStatus = projectColumns[1] ?? projectColumns[0] ?? "To Do";
  const [issueType, setIssueType] = useState<IssueType>("Task");
  const [priority, setPriority] = useState<IssuePriority>("Medium");
  const [description, setDescription] = useState("");

  const insertFormat = (snippet: string) => {
    setDescription((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  return (
    <div
      className="modal-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="create-modal create-issue-rich" action={onCreate}>
        <input type="hidden" name="type" value={issueType} />
        <input type="hidden" name="priority" value={priority} />
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {projectKey} · CREATE_ISSUE · {projectName.toUpperCase()}
            </span>
            <h2>New issue</h2>
          </div>
          <Button size="icon" variant="ghost" type="button" title="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="ci-section">
          <span className="ci-label">Type</span>
          <div className="ci-type-bar" role="radiogroup" aria-label="Issue type">
            {(["Epic", "Feature", "Task", "Subtask", "Bug"] as IssueType[]).map((item) => (
              <button
                type="button"
                key={item}
                className={issueType === item ? "is-selected" : ""}
                aria-pressed={issueType === item}
                onClick={() => setIssueType(item)}
              >
                <span className={`type-icon type-${item.toLowerCase()}`}>
                  {item === "Bug" ? "◆" : item === "Feature" ? "✦" : item === "Epic" ? "⚡" : item === "Subtask" ? "↳" : "≡"}
                </span>
                {item.toLowerCase()}
              </button>
            ))}
          </div>
          <p className="ci-hint">{typeDescriptions[issueType]}</p>
        </div>

        <label className="ci-section">
          <span className="ci-label">Title</span>
          <input name="title" className="cp-input" autoFocus placeholder="What needs to get done?" required />
        </label>

        <div className="ci-section">
          <span className="ci-label">Priority</span>
          <div className="ci-priority-row" role="radiogroup" aria-label="Priority">
            {(["Highest", "High", "Medium", "Low", "Lowest"] as IssuePriority[]).map((item) => (
              <button
                type="button"
                key={item}
                className={priority === item ? "is-selected" : ""}
                aria-pressed={priority === item}
                onClick={() => setPriority(item)}
              >
                <span className={`priority-dot priority-${item.toLowerCase()}`}>
                  {item === "Highest" ? "«" : item === "High" ? "↑" : item === "Low" ? "↓" : item === "Lowest" ? "»" : "="}
                </span>
                {item}
              </button>
            ))}
          </div>
          {priority === "Medium" && <p className="ci-hint">The default</p>}
        </div>

        <div className="form-grid">
          <label className="form-label">
            Status
            <select name="status" defaultValue={initialStatus}>
              {projectColumns.map((column) => (
                <option key={column}>{column}</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Assignee
            <select name="assignee" defaultValue="">
              <option value="">— unassigned</option>
              {people.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Sprint
            <select name="sprint" defaultValue="">
              <option value="">— backlog</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.name}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Points
            <Input name="points" type="number" min={0} max={100} placeholder="e.g. 3" />
          </label>
        </div>

        <label className="form-label ci-parent-field">
          Parent (optional)
          <Input name="parent" placeholder={`${projectKey}-1`} />
        </label>

        <div className="ci-section">
          <span className="ci-label">Description</span>
          <div className="rich-editor">
            <div className="rich-toolbar">
              <Button type="button" variant="ghost" size="sm" className="ci-text-btn" onClick={() => insertFormat("## Section")}>
                Text <ChevronDown size={12} />
              </Button>
              <span className="drawer-divider" />
              <Button type="button" variant="ghost" size="icon" title="Bold" onClick={() => insertFormat("**bold text**")}>
                <strong>B</strong>
              </Button>
              <Button type="button" variant="ghost" size="icon" title="Italic" onClick={() => insertFormat("_italic text_")}>
                <em>I</em>
              </Button>
              <Button type="button" variant="ghost" size="icon" title="Code" onClick={() => insertFormat("`code`")}>
                <Code2 size={14} />
              </Button>
              <Button type="button" variant="ghost" size="icon" title="Checklist" onClick={() => insertFormat("- [ ] Checklist item")}>
                <CheckCheck size={14} />
              </Button>
            </div>
            <Textarea
              name="description"
              className="rich-description"
              placeholder="Describe the work... paste or drop images and files"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>
          <p className="ci-hint">type @ to mention someone · paste or drop images and files · markdown shortcuts work: ## heading, - [ ] checklist, **bold**</p>
        </div>

        <div className="modal-actions">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Plus size={15} /> Create issue
          </Button>
        </div>
      </form>
    </div>
  );
}

function getSprintDays(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 14;
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1);
}

export function SprintsModal({
  projectKey,
  sprints,
  onClose,
  onCreateSprint,
  onOpenSprintIssues,
  onRequestStartSprint,
}: {
  projectKey: string;
  sprints: SprintItem[];
  onClose: () => void;
  onCreateSprint: (sprint: Omit<SprintItem, "id" | "status" | "code">) => void;
  onOpenSprintIssues: () => void;
  onRequestStartSprint: (sprint: SprintItem) => void;
}) {
  const [name, setName] = useState(`Sprint ${sprints.length + 1}`);
  const [goal, setGoal] = useState("");
  const [start, setStart] = useState("2026-12-01");
  const [end, setEnd] = useState("2026-12-14");
  const [reviewing, setReviewing] = useState(false);

  const days = getSprintDays(start, end);

  return (
    <div
      className="modal-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="create-project-modal sprints-modal" role="dialog" aria-modal="true" aria-labelledby="sprints-modal-title">
        <div className="create-project-head">
          <div>
            <span className="eyebrow">{projectKey} · PROJECT ADMIN</span>
            <h2 id="sprints-modal-title">Sprints</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" title="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="sprints-list-box">
          {sprints.length === 0 ? (
            <div className="sprints-empty-box">No sprints yet</div>
          ) : (
            sprints.map((sprint) => (
              <div key={sprint.id} className="sprint-list-row">
                <div>
                  <strong>
                    {sprint.code} · {sprint.name}
                  </strong>
                  <small>
                    {sprint.start} → {sprint.end}
                    {sprint.goal ? ` · ${sprint.goal}` : ""}
                  </small>
                </div>
                <div className="sprint-row-actions">
                  <span className={`sprint-status-pill status-${sprint.status}`}>
                    <i /> {sprint.status === "active" ? "Active" : sprint.status === "closed" ? "Closed" : "Not started"}
                  </span>
                  <Button type="button" size="sm" variant="outline" className="pill-control" onClick={onOpenSprintIssues}>
                    View issues <ArrowRight size={13} />
                  </Button>
                  {sprint.status === "planned" && (
                    <Button type="button" size="sm" className="create-button" onClick={() => onRequestStartSprint(sprint)}>
                      <Play size={12} /> Start
                    </Button>
                  )}
                  <Button type="button" size="icon" variant="outline" className="pill-control" title={`Edit ${sprint.name}`} onClick={() => setReviewing(false)}>
                    <Pencil size={13} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {!reviewing ? (
          <form
            className="new-sprint-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              setReviewing(true);
            }}
          >
            <span className="eyebrow">NEW SPRINT</span>
            <div className="form-grid">
              <label className="form-label">
                Name
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="form-label">
                Goal (optional)
                <Input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Sprint objective" />
              </label>
              <label className="form-label">
                Start
                <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} required />
              </label>
              <label className="form-label">
                End
                <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} required />
              </label>
            </div>
            <p className="cp-hint">Starts the day after the latest sprint ends, same length. Dates may overlap other sprints.</p>
            <div className="sprints-form-actions">
              <Button type="submit" variant="outline" className="pill-control">
                <Plus size={15} /> Create sprint
              </Button>
            </div>
          </form>
        ) : (
          <div className="sprint-review-box">
            <span className="eyebrow">REVIEW BEFORE CREATING</span>
            <div className="sprint-review-table">
              <div>
                <span>Name</span>
                <strong>{name.trim()}</strong>
              </div>
              <div>
                <span>Start → End</span>
                <strong>
                  {start} → {end} · {days} days
                </strong>
              </div>
              <div>
                <span>Goal</span>
                <strong>{goal.trim() || "—"}</strong>
              </div>
            </div>
            <p className="cp-hint">These dates will be saved with the sprint.</p>
            <div className="sprints-form-actions">
              <Button type="button" variant="outline" className="pill-control" onClick={() => setReviewing(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="create-button"
                onClick={() => {
                  onCreateSprint({ name: name.trim(), goal: goal.trim(), start, end });
                  setReviewing(false);
                  setName(`Sprint ${sprints.length + 2}`);
                  setGoal("");
                }}
              >
                <Check size={15} /> Confirm create
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function StartSprintModal({
  projectKey,
  sprint,
  sprintIssues,
  onClose,
  onConfirmStart,
}: {
  projectKey: string;
  sprint: SprintItem;
  sprintIssues: Issue[];
  onClose: () => void;
  onConfirmStart: (updates: { name: string; goal: string; start: string; end: string }) => void;
}) {
  const [name, setName] = useState(sprint.name);
  const [duration, setDuration] = useState("2 weeks");
  const [start, setStart] = useState(sprint.start);
  const [end, setEnd] = useState(sprint.end);
  const [goal, setGoal] = useState(sprint.goal);

  const days = getSprintDays(start, end);
  const totalPoints = sprintIssues.reduce((sum, issue) => sum + (Number(issue.points) || 0), 0);

  const applyDuration = (nextDuration: string) => {
    setDuration(nextDuration);
    const weeks = nextDuration === "1 week" ? 1 : nextDuration === "2 weeks" ? 2 : nextDuration === "3 weeks" ? 3 : nextDuration === "4 weeks" ? 4 : 0;
    if (weeks > 0) {
      const startDate = new Date(start);
      if (!Number.isNaN(startDate.getTime())) {
        const endDate = new Date(startDate.getTime() + (weeks * 7 - 1) * 86_400_000);
        setEnd(endDate.toISOString().slice(0, 10));
      }
    }
  };

  return (
    <div
      className="modal-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="create-project-modal sprints-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-sprint-title"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onConfirmStart({ name: name.trim(), goal: goal.trim(), start, end });
        }}
      >
        <div className="create-project-head">
          <div>
            <span className="eyebrow">
              SPRINT OVERVIEW · {sprint.code} · {projectKey}
            </span>
            <h2 id="start-sprint-title">Start sprint</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" title="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="start-sprint-summary">
          <div className="start-sprint-title-line">
            <strong>{name || sprint.name}</strong>
            <span className="sprint-status-pill status-planned">
              <i /> Not started
            </span>
          </div>
          <div className="start-sprint-stats">
            <div>
              <strong>{sprintIssues.length}</strong>
              <small>issues</small>
            </div>
            <div>
              <strong>{totalPoints}</strong>
              <small>story points</small>
            </div>
            <div>
              <strong>{days}</strong>
              <small>days</small>
            </div>
          </div>
        </div>

        <div className="form-grid">
          <label className="form-label">
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="form-label">
            Duration
            <select value={duration} onChange={(event) => applyDuration(event.target.value)}>
              <option>1 week</option>
              <option>2 weeks</option>
              <option>3 weeks</option>
              <option>4 weeks</option>
              <option>Custom</option>
            </select>
          </label>
          <label className="form-label">
            Start
            <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} required />
          </label>
          <label className="form-label">
            End
            <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} required />
          </label>
        </div>

        <label className="form-label">
          Goal (optional)
          <Textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={2} placeholder="What should this sprint achieve?" />
        </label>

        {sprintIssues.length === 0 && (
          <div className="sprint-warning-banner">
            <AlertTriangle size={15} /> This sprint has no issues yet
          </div>
        )}

        <div className="ci-section">
          <span className="ci-label">Issues in this sprint</span>
          {sprintIssues.length === 0 ? (
            <div className="sprints-empty-box">Plan issues into this sprint from the backlog, or start without any issues</div>
          ) : (
            <div className="drawer-linked-list">
              {sprintIssues.map((item) => (
                <div key={item.id} className="drawer-linked-row">
                  <code>{item.key}</code>
                  <span>{item.title}</span>
                  <small>{item.points ? `${item.points} pts` : item.status}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sprints-form-actions">
          <Button type="button" variant="outline" className="pill-control" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="create-button">
            <Play size={14} /> Start sprint
          </Button>
        </div>
      </form>
    </div>
  );
}

type ViewMode = "rendered" | "markdown" | "raw";

const priorityMeta: { value: IssuePriority; hint: string }[] = [
  { value: "Highest", hint: "Urgent — production is broken" },
  { value: "High", hint: "Needs to be done this round" },
  { value: "Medium", hint: "The default" },
  { value: "Low", hint: "When there is time" },
  { value: "Lowest", hint: "Can wait" },
];

export function IssueDrawer({
  issue,
  projectName,
  projectColumns,
  allIssues,
  sprints,
  onClose,
  onChange,
  onDelete,
  onCopy,
}: {
  issue: Issue;
  projectName: string;
  projectColumns: string[];
  allIssues: Issue[];
  sprints: SprintItem[];
  onClose: () => void;
  onChange: (changes: Partial<Issue>) => void;
  onDelete: () => void;
  onCopy: (text: string, message?: string) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("rendered");
  const [expanded, setExpanded] = useState(false);
  const [watching, setWatching] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [moreFieldsOpen, setMoreFieldsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [linkedKeys, setLinkedKeys] = useState<string[]>([]);
  const [pointsDraft, setPointsDraft] = useState(issue.points ?? "");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(issue.description);
  const [workingOn, setWorkingOn] = useState("");
  const [editingWorkingOn, setEditingWorkingOn] = useState(false);
  const [workingOnDraft, setWorkingOnDraft] = useState("");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [postedComments, setPostedComments] = useState<{ author: string; initials: string; text: string; time: string }[]>([]);
  const [history, setHistory] = useState<{ text: string; time: string }[]>([
    { text: `created ${issue.key}`, time: "17 Nov, 11:41" },
  ]);

  const saveDescription = () => {
    recordChange("updated description", { description: descriptionDraft });
    setEditingDescription(false);
  };

  const submitComment = () => {
    if (!comment.trim()) return;
    const text = comment.trim();
    setPostedComments((current) => [...current, { author: "Thanet Chankhua", initials: "TC", text, time: "Just now" }]);
    onChange({ comments: issue.comments + 1 });
    setHistory((current) => [{ text: `commented: "${text.slice(0, 40)}"`, time: "Just now" }, ...current]);
    setComment("");
  };

  const recordChange = (label: string, changes: Partial<Issue>) => {
    onChange(changes);
    setHistory((current) => [{ text: label, time: "Just now" }, ...current]);
  };

  const subTasks = allIssues.filter((item) => item.parent === issue.key);
  const linkCandidates = allIssues.filter((item) => item.id !== issue.id && !linkedKeys.includes(item.key));

  const frontmatterText = [
    "---",
    `id: ${issue.key}`,
    `type: ${issue.type.toLowerCase()}`,
    `priority: ${issue.priority.toLowerCase()}`,
    `status: ${issue.status}`,
    `assignee: ${issue.assignee === "Unassigned" ? "null" : issue.assignee}`,
    `points: ${issue.points || "null"}`,
    `sprint: ${issue.sprint || "null"}`,
    `parent: ${issue.parent || "null"}`,
    `labels: [${issue.tags.map((tag) => `"${tag}"`).join(", ")}]`,
    `links: [${linkedKeys.map((key) => `"${key}"`).join(", ")}]`,
    `updated_by_agent: ${issue.ai ? `"${issue.ai}"` : "null"}`,
    `version: ${history.length}`,
    "---",
    "",
    `# ${issue.title}`,
    "",
    issue.description,
  ].join("\n");

  const renderDescriptionLines = (text: string) => {
    const blocks = text.split("\n\n").filter(Boolean);
    if (blocks.length === 0) {
      return <p className="drawer-empty-desc">No description yet. Click the edit button to add details.</p>;
    }
    return blocks.map((block, index) => {
      if (block.startsWith("## ")) {
        return (
          <h4 key={index} className="md-h2">
            {block.slice(3)}
          </h4>
        );
      }
      if (block.startsWith("```")) {
        const code = block.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
        return (
          <pre key={index} className="md-code-block">
            <code>{code}</code>
          </pre>
        );
      }
      const lines = block.split("\n");
      if (lines.every((line) => line.startsWith("- "))) {
        return (
          <ul key={index} className="md-list">
            {lines.map((line, lineIndex) => (
              <li key={lineIndex}>{line.slice(2)}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={index} className="md-paragraph">
          {block}
        </p>
      );
    });
  };

  return (
    <div
      className="drawer-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className={`issue-drawer ${expanded ? "is-expanded" : ""}`}>
        <div className="drawer-toolbar">
          <div className="drawer-toolbar-left">
            <span className={`type-icon type-${issue.type.toLowerCase()}`}>
              {issue.type === "Bug" ? "◆" : issue.type === "Feature" ? "✦" : issue.type === "Epic" ? "⚡" : issue.type === "Subtask" ? "↳" : "≡"}
            </span>
            <div className="drawer-breadcrumb">
              <span>{projectName}</span>
              <span>/</span>
              <strong className="drawer-key">{issue.key}</strong>
            </div>
            <Button size="icon" variant="ghost" title="Copy issue key" onClick={() => onCopy(issue.key, `Copied ${issue.key}`)}>
              <FileCode2 size={15} />
            </Button>
            <Button size="icon" variant="ghost" title="Issue file info" onClick={() => onCopy(`issues/${issue.key}.md`, "File path copied")}>
              <Info size={15} />
            </Button>
            {issue.ai && (
              <span className="mcp-badge">
                <Sparkles size={12} /> via MCP · {issue.ai}
              </span>
            )}
          </div>

          <div className="drawer-toolbar-right">
            <Button variant={watching ? "secondary" : "outline"} size="sm" className="pill-control" onClick={() => setWatching(!watching)}>
              <Eye size={14} /> Watch <span className="watch-count">{watching ? 1 : 0}</span>
            </Button>
            <div className="segmented mode-switch" role="tablist" aria-label="Issue view mode">
              <button className={viewMode === "rendered" ? "segment-active" : ""} onClick={() => setViewMode("rendered")}>
                Rendered
              </button>
              <button className={viewMode === "markdown" ? "segment-active" : ""} onClick={() => setViewMode("markdown")}>
                Markdown
              </button>
              <button className={viewMode === "raw" ? "segment-active" : ""} onClick={() => setViewMode("raw")}>
                <FileCode2 size={13} /> View .md
              </button>
            </div>
            <Button variant="outline" size="icon" className="pill-control" title={expanded ? "Restore width" : "Expand"} onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
            <Button variant="outline" size="icon" className="pill-control" title="Close issue" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="drawer-content">
          <div className="drawer-primary">
            <div className="drawer-title-row">
              <input
                className="drawer-title-input"
                aria-label="Issue title"
                value={issue.title}
                onChange={(event) => onChange({ title: event.target.value })}
              />
              <Button size="icon" variant="ghost" title="Edit Markdown" onClick={() => setViewMode("markdown")}>
                <Pencil size={15} />
              </Button>
            </div>

            <div className="drawer-file-pills">
              <span className="file-path-pill">issues/{issue.key}.md</span>
              <span className="status-pill">
                <i className="status-dot dot-blue" /> {issue.status}
              </span>
            </div>

            <section className="drawer-sub-section">
              <h3>Sub-tasks</h3>
              {subTasks.length === 0 ? (
                <p className="drawer-muted-line">No sub-tasks — issues that name this one as their parent show here</p>
              ) : (
                <div className="drawer-linked-list">
                  {subTasks.map((sub) => (
                    <div key={sub.id} className="drawer-linked-row">
                      <code>{sub.key}</code>
                      <span>{sub.title}</span>
                      <small>{sub.status}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="drawer-sub-section">
              <div className="drawer-sub-head">
                <div>
                  <h3>Linked items</h3>
                  <p className="drawer-muted-line">Grouped by project · live status of each target · targets you cannot open show only the key</p>
                </div>
                <div className="link-to-wrap">
                  <Button size="sm" className="create-button" onClick={() => setLinkMenuOpen(!linkMenuOpen)}>
                    <Link2 size={14} /> Link to...
                  </Button>
                  {linkMenuOpen && (
                    <div className="link-to-menu">
                      {linkCandidates.length === 0 ? (
                        <span className="drawer-muted-line">No more issues to link</span>
                      ) : (
                        linkCandidates.map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            onClick={() => {
                              setLinkedKeys((current) => [...current, candidate.key]);
                              setLinkMenuOpen(false);
                              setHistory((current) => [{ text: `linked ${candidate.key}`, time: "Just now" }, ...current]);
                            }}
                          >
                            <code>{candidate.key}</code>
                            <span>{candidate.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              {linkedKeys.length === 0 ? (
                <p className="drawer-muted-line">Nothing linked yet — progress stays empty</p>
              ) : (
                <div className="drawer-linked-list">
                  {linkedKeys.map((key) => {
                    const target = allIssues.find((item) => item.key === key);
                    return (
                      <div key={key} className="drawer-linked-row">
                        <code>{key}</code>
                        <span>{target?.title ?? key}</span>
                        <small>{target?.status ?? "Linked"}</small>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="drawer-description-section">
              {viewMode === "rendered" && (
                <>
                  <div className="description-heading">
                    <h3>
                      <FileCode2 size={15} /> Description
                    </h3>
                    {!editingDescription && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="pill-control"
                        title="Edit description"
                        onClick={() => {
                          setDescriptionDraft(issue.description);
                          setEditingDescription(true);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                    )}
                  </div>
                  {editingDescription ? (
                    <div className="inline-desc-editor">
                      <div className="rich-editor">
                        <div className="rich-toolbar">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ci-text-btn"
                            onClick={() => setDescriptionDraft((prev) => `${prev}\n\n## Section`)}
                          >
                            Text <ChevronDown size={12} />
                          </Button>
                          <span className="drawer-divider" />
                          <Button type="button" variant="ghost" size="icon" title="Bold" onClick={() => setDescriptionDraft((prev) => `${prev}**bold**`)}>
                            <strong>B</strong>
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Italic" onClick={() => setDescriptionDraft((prev) => `${prev}_italic_`)}>
                            <em>I</em>
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Strikethrough" onClick={() => setDescriptionDraft((prev) => `${prev}~~text~~`)}>
                            <Strikethrough size={14} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Inline code" onClick={() => setDescriptionDraft((prev) => `${prev}\`code\``)}>
                            <Code2 size={14} />
                          </Button>
                          <span className="drawer-divider" />
                          <Button type="button" variant="ghost" size="icon" title="Bullet list" onClick={() => setDescriptionDraft((prev) => `${prev}\n- List item`)}>
                            <List size={14} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Numbered list" onClick={() => setDescriptionDraft((prev) => `${prev}\n1. Step`)}>
                            <ListOrdered size={14} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Checklist" onClick={() => setDescriptionDraft((prev) => `${prev}\n- [ ] Task`)}>
                            <CheckCheck size={14} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Quote" onClick={() => setDescriptionDraft((prev) => `${prev}\n> Quote`)}>
                            <Quote size={14} />
                          </Button>
                        </div>
                        <Textarea
                          className="rich-description inline-desc-textarea"
                          aria-label="Edit issue description"
                          value={descriptionDraft}
                          onChange={(event) => setDescriptionDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                              event.preventDefault();
                              saveDescription();
                            }
                          }}
                          rows={8}
                        />
                        <div className="editor-shortcut-foot">
                          type @ to mention someone · paste or drop images and files · markdown shortcuts work: ## heading, - [ ] checklist, **bold**
                        </div>
                      </div>
                      <div className="inline-desc-actions">
                        <Button type="button" size="sm" className="create-button" onClick={saveDescription}>
                          <Check size={14} /> Save description
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="pill-control" onClick={() => setEditingDescription(false)}>
                          Cancel
                        </Button>
                        <kbd className="desc-kbd">Ctrl S</kbd>
                      </div>
                    </div>
                  ) : (
                    <div className="rendered-markdown">{renderDescriptionLines(issue.description)}</div>
                  )}
                </>
              )}

              {viewMode === "markdown" && (
                <>
                  <div className="markdown-edit-bar">
                    <Button size="sm" variant="outline" className="pill-control" onClick={() => onChange({ attachments: issue.attachments + 1 })}>
                      <Paperclip size={14} /> Attach file
                    </Button>
                    <span>markdown · @ mentions someone · paste or drop files here · images show inline, other files as links</span>
                  </div>
                  <Textarea
                    className="drawer-markdown drawer-markdown-tall"
                    aria-label="Edit issue Markdown"
                    value={issue.description}
                    onChange={(event) => onChange({ description: event.target.value })}
                    spellCheck={false}
                  />
                </>
              )}

              {viewMode === "raw" && (
                <>
                  <p className="drawer-muted-line">
                    The issue as the file workrail stores: frontmatter fields on top, the description below. Handy for AI agents, scripts and people who like plain text; editing stays in the other tabs.
                  </p>
                  <pre className="raw-frontmatter-block">{frontmatterText}</pre>
                </>
              )}
            </section>

            <div className="working-on-bar">
              <div className="working-on-copy">
                <strong>Working on</strong>
                {editingWorkingOn ? (
                  <input
                    className="cp-input working-on-input"
                    autoFocus
                    placeholder="What are you working on right now?"
                    value={workingOnDraft}
                    onChange={(event) => setWorkingOnDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        setWorkingOn(workingOnDraft.trim());
                        setEditingWorkingOn(false);
                      } else if (event.key === "Escape") {
                        setEditingWorkingOn(false);
                      }
                    }}
                  />
                ) : (
                  <span>{workingOn || "No one has said what they are doing on this card."}</span>
                )}
              </div>
              {editingWorkingOn ? (
                <Button
                  type="button"
                  size="sm"
                  className="create-button"
                  onClick={() => {
                    setWorkingOn(workingOnDraft.trim());
                    setEditingWorkingOn(false);
                  }}
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="pill-control"
                  onClick={() => {
                    setWorkingOnDraft(workingOn);
                    setEditingWorkingOn(true);
                  }}
                >
                  <Pencil size={13} /> Edit
                </Button>
              )}
            </div>

            <section className="drawer-attachments-section">
              <div className="drawer-section-title">
                <Paperclip size={15} />
                <h3>Attachments</h3>
                <span className="soft-pill">{issue.attachments + attachmentNames.length}</span>
              </div>
              <div className="attachments-dropzone">
                {attachmentNames.length === 0 ? (
                  <p>No attachments yet — drop images or files here, or</p>
                ) : (
                  <div className="attached-files-pills">
                    {attachmentNames.map((fileName, index) => (
                      <span key={index} className="file-path-pill">
                        {fileName}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="pill-control"
                  onClick={() => {
                    const nextName = `attachment-${attachmentNames.length + 1}.png`;
                    setAttachmentNames((current) => [...current, nextName]);
                    recordChange(`attached ${nextName}`, { attachments: issue.attachments + 1 });
                  }}
                >
                  <Paperclip size={13} /> Attach files
                </Button>
              </div>
            </section>

            <section className="drawer-comments-section">
              <div className="drawer-section-title">
                <MessageSquare size={15} />
                <h3>Comments</h3>
                <span className="soft-pill">{issue.comments + postedComments.length}</span>
              </div>
              {postedComments.length > 0 && (
                <div className="posted-comments-list">
                  {postedComments.map((item, index) => (
                    <div key={index} className="activity-entry">
                      <span className="avatar avatar-mint">{item.initials}</span>
                      <div>
                        <p>
                          <strong>{item.author}</strong> <small>{item.time}</small>
                        </p>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="comment-composer rich-comment-composer">
                <span className="avatar avatar-mint">TC</span>
                <div className="rich-editor comment-rich-box">
                  <div className="rich-toolbar">
                    <Button type="button" variant="ghost" size="sm" className="ci-text-btn" onClick={() => setComment((prev) => `${prev}## `)}>
                      Text <ChevronDown size={12} />
                    </Button>
                    <span className="drawer-divider" />
                    <Button type="button" variant="ghost" size="icon" title="Bold" onClick={() => setComment((prev) => `${prev}**bold**`)}>
                      <strong>B</strong>
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title="Italic" onClick={() => setComment((prev) => `${prev}_italic_`)}>
                      <em>I</em>
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title="Code" onClick={() => setComment((prev) => `${prev}\`code\``)}>
                      <Code2 size={14} />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title="Checklist" onClick={() => setComment((prev) => `${prev}\n- [ ] `)}>
                      <CheckCheck size={14} />
                    </Button>
                  </div>
                  <Textarea
                    aria-label="Write a comment"
                    className="rich-description comment-rich-textarea"
                    placeholder="Write a comment... paste or drop images and files · Ctrl+↵ to send"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                        event.preventDefault();
                        submitComment();
                      }
                    }}
                    rows={3}
                  />
                </div>
              </div>
              <div className="comment-submit-row">
                <Button type="button" size="sm" className="create-button" disabled={!comment.trim()} onClick={submitComment}>
                  Comment
                </Button>
              </div>
            </section>
          </div>

          <aside className="drawer-metadata frontmatter-sidebar">
            <div className="frontmatter-head">
              <div>
                <span className="eyebrow">FRONTMATTER</span>
                <small>auto-generated · issue.schema.json</small>
              </div>
              <span className="version-pill">version {history.length}</span>
            </div>

            <div className="fm-field">
              <span className="eyebrow">TYPE</span>
              <div className="fm-type-bar" role="radiogroup" aria-label="Issue type">
                {(["Epic", "Feature", "Task", "Subtask", "Bug"] as IssueType[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={issue.type === item ? "is-selected" : ""}
                    title={item}
                    onClick={() => recordChange(`changed the type from ${issue.type.toLowerCase()} to ${item.toLowerCase()}`, { type: item })}
                  >
                    <span className={`type-icon type-${item.toLowerCase()}`}>
                      {item === "Bug" ? "◆" : item === "Feature" ? "✦" : item === "Epic" ? "⚡" : item === "Subtask" ? "↳" : "≡"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="fm-field fm-priority-wrap">
              <span className="eyebrow">PRIORITY</span>
              <button type="button" className="metadata-value" onClick={() => setPriorityOpen(!priorityOpen)}>
                <span className={`priority-dot priority-${issue.priority.toLowerCase()}`}>
                  {issue.priority === "Highest" ? "«" : issue.priority === "High" ? "↑" : issue.priority === "Low" ? "↓" : issue.priority === "Lowest" ? "»" : "="}
                </span>
                <span>{issue.priority}</span>
                <ChevronDown size={13} />
              </button>
              {priorityOpen && (
                <div className="fm-priority-menu" role="listbox">
                  {priorityMeta.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={issue.priority === option.value ? "is-selected" : ""}
                      onClick={() => {
                        recordChange(`changed priority to ${option.value}`, { priority: option.value });
                        setPriorityOpen(false);
                      }}
                    >
                      <span className={`priority-dot priority-${option.value.toLowerCase()}`}>
                        {option.value === "Highest" ? "«" : option.value === "High" ? "↑" : option.value === "Low" ? "↓" : option.value === "Lowest" ? "»" : "="}
                      </span>
                      <div>
                        <strong>{option.value}</strong>
                        <small>{option.hint}</small>
                      </div>
                      {issue.priority === option.value && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <MetadataSelect
              label="STATUS"
              value={issue.status}
              options={projectColumns}
              onChange={(value) => recordChange(`moved status to ${value}`, { status: value })}
            />

            <MetadataSelect
              label="ASSIGNEE"
              value={issue.assignee === "Unassigned" ? "" : issue.assignee}
              options={["", ...people]}
              optionLabels={{ "": "— unassigned" }}
              onChange={(value) => {
                if (!value) {
                  recordChange("unassigned issue", { assignee: "Unassigned", initials: "—", color: "avatar-extra" });
                } else {
                  const personInfo = peopleAvatars[value] ?? ["AM", "avatar-mint"];
                  recordChange(`assigned to ${value}`, { assignee: value, initials: personInfo[0], color: personInfo[1] });
                }
              }}
            />

            <label className="metadata-item">
              <span className="fm-label-row">
                <span>POINTS</span>
                <small>saves on Enter or blur</small>
              </span>
              <input
                className="cp-input fm-points-input"
                placeholder="—"
                value={pointsDraft}
                onChange={(event) => setPointsDraft(event.target.value)}
                onBlur={() => {
                  if (pointsDraft !== (issue.points ?? "")) recordChange(`set points to ${pointsDraft || "none"}`, { points: pointsDraft });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
              />
            </label>

            <MetadataSelect
              label="SPRINT"
              value={issue.sprint ?? ""}
              options={["", ...sprints.map((sprint) => sprint.name)]}
              optionLabels={{ "": "— backlog" }}
              onChange={(value) => recordChange(value ? `moved to ${value}` : "moved to backlog", { sprint: value })}
            />

            <button type="button" className="fm-more-fields" onClick={() => setMoreFieldsOpen(!moreFieldsOpen)}>
              {moreFieldsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>More fields</span>
              <small>Parent, Labels, Links</small>
            </button>
            {moreFieldsOpen && (
              <div className="fm-more-body">
                <label className="metadata-item">
                  <span>PARENT</span>
                  <input
                    className="cp-input fm-points-input"
                    placeholder="None"
                    value={issue.parent ?? ""}
                    onChange={(event) => onChange({ parent: event.target.value.toUpperCase() })}
                  />
                </label>
                <div className="fm-labels-row">
                  {issue.tags.map((tag) => (
                    <span key={tag} className="issue-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="fm-footer-bar">
              <span>
                <Check size={13} /> Fields save as soon as you change them
              </span>
              <Button type="button" variant="outline" size="icon" className="pill-control" title="Delete issue" onClick={onDelete}>
                <Trash2 size={14} />
              </Button>
            </div>

            <div className="fm-history">
              <button type="button" className="fm-history-toggle" onClick={() => setHistoryOpen(!historyOpen)}>
                {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>History</span>
                <span className="soft-pill">{history.length}</span>
              </button>
              {historyOpen && (
                <div className="fm-history-list">
                  {history.map((entry, index) => (
                    <div key={index} className="fm-history-item">
                      <span className="avatar avatar-mint">TC</span>
                      <div>
                        <p>
                          <strong>THANET CHANKHUA</strong> {entry.text}
                        </p>
                        <small>{entry.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </aside>
    </div>
  );
}

function MetadataSelect({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="metadata-item">
      <span>{label}</span>
      <span className="select-wrapper">
        <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {optionLabels?.[option] ?? option}
            </option>
          ))}
        </select>
        <ChevronDown size={13} />
      </span>
    </label>
  );
}
