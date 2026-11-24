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
import { RichTextEditor, markdownToHtml } from "@/components/workspace/RichTextEditor";

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
          <RichTextEditor
            name="description"
            value={description}
            onChange={setDescription}
            placeholder="Describe the work... paste or drop images and files"
            minHeight={148}
            showFooterHint
          />
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
  onDeleteSprint,
}: {
  projectKey: string;
  sprints: SprintItem[];
  onClose: () => void;
  onCreateSprint: (sprint: Omit<SprintItem, "id" | "status" | "code">) => void;
  onOpenSprintIssues: () => void;
  onRequestStartSprint: (sprint: SprintItem) => void;
  onDeleteSprint?: (sprint: SprintItem) => void;
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
                  {sprint.status === "planned" && onDeleteSprint && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="pill-control"
                      title={`Delete ${sprint.name}`}
                      onClick={() => onDeleteSprint(sprint)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
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
  onOpenIssue,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
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
  onOpenIssue?: (issueId: string) => void;
  onCreateSubtask?: (data: { title: string; assignee?: string; priority?: IssuePriority; status?: string }) => Issue | null;
  onUpdateSubtask?: (subtaskId: string, changes: Partial<Issue>) => void;
  onDeleteSubtask?: (subtaskId: string, key: string) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("rendered");
  const [expanded, setExpanded] = useState(false);
  const [watching, setWatching] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [moreFieldsOpen, setMoreFieldsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [linkedKeys] = useState<string[]>([]);
  const [pointsDraft, setPointsDraft] = useState(issue.points ?? "");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(issue.description);
  const [workingOn, setWorkingOn] = useState("");
  const [touches, setTouches] = useState<string[]>(["auth/limiter.ts", "POST /login"]);
  const [editingWorkingOn, setEditingWorkingOn] = useState(false);
  const [workingOnDraft, setWorkingOnDraft] = useState("");
  const [touchesDraft, setTouchesDraft] = useState("auth/limiter.ts, POST /login");
  const [linkInput, setLinkInput] = useState("");
  const [linkRelation, setLinkRelation] = useState<"blocks" | "blocked_by" | "relates" | "duplicates" | "clones">("relates");
  const [issueLinks, setIssueLinks] = useState<{ type: string; key: string }[]>([
    { type: "relates", key: "APP-108" },
  ]);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [postedComments, setPostedComments] = useState<
    { id: number; author: string; initials: string; text: string; time: string; replyTo?: number; edited?: boolean }[]
  >([]);
  const [history, setHistory] = useState<{ text: string; time: string }[]>([
    { text: `created ${issue.key}`, time: "17 Nov, 11:41" },
  ]);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState("");
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<IssuePriority>("Medium");

  useEffect(() => {
    setPointsDraft(issue.points ?? "");
    setDescriptionDraft(issue.description);
    setEditingDescription(false);
    setAddingSubtask(false);
    setNewSubtaskTitle("");
  }, [issue.id, issue.points, issue.description]);

  const saveDescription = () => {
    recordChange("updated description", { description: descriptionDraft });
    setEditingDescription(false);
  };

  const submitComment = () => {
    if (!comment.trim()) return;
    const text = comment.trim();
    const nextId = postedComments.length + 1;
    setPostedComments((current) => [
      ...current,
      {
        id: nextId,
        author: "Thanet Chankhua",
        initials: "TC",
        text,
        time: "Just now",
        ...(replyingTo ? { replyTo: replyingTo } : {}),
      },
    ]);
    onChange({ comments: issue.comments + 1 });
    setWatching(true);
    setHistory((current) => [{ text: `commented: "${text.slice(0, 40)}"`, time: "Just now" }, ...current]);
    setComment("");
    setReplyingTo(null);
  };

  const recordChange = (label: string, changes: Partial<Issue>) => {
    onChange(changes);
    setHistory((current) => [{ text: label, time: "Just now" }, ...current]);
  };

  const subTasks = allIssues.filter((item) => item.parent === issue.key);
  const parentIssue = issue.parent ? allIssues.find((item) => item.key === issue.parent) : undefined;
  const doneSubtasksCount = subTasks.filter((sub) => sub.status === "Done").length;
  const subtaskProgressPct = subTasks.length > 0 ? Math.round((doneSubtasksCount / subTasks.length) * 100) : 0;

  const submitNewSubtask = () => {
    const clean = newSubtaskTitle.trim();
    if (!clean || !onCreateSubtask) return;
    const created = onCreateSubtask({
      title: clean,
      assignee: newSubtaskAssignee,
      priority: newSubtaskPriority,
      status: projectColumns[0] ?? "To Do",
    });
    if (created) {
      setHistory((current) => [{ text: `added subtask ${created.key}: "${created.title}"`, time: "Just now" }, ...current]);
      setNewSubtaskTitle("");
    }
  };

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
    if (!text || !text.trim()) {
      return <p className="drawer-empty-desc">No description yet. Click the edit button to add details.</p>;
    }
    return (
      <div
        className="rte-rendered-content"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }}
      />
    );
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
              {parentIssue && (
                <>
                  <span>/</span>
                  <button
                    type="button"
                    className="cu-parent-crumb"
                    title={`Back to parent: ${parentIssue.title}`}
                    onClick={() => onOpenIssue?.(parentIssue.id)}
                  >
                    {parentIssue.key}: {parentIssue.title}
                  </button>
                </>
              )}
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
              {parentIssue && (
                <button
                  type="button"
                  className="cu-parent-pill"
                  onClick={() => onOpenIssue?.(parentIssue.id)}
                >
                  ↳ Subtask of <strong>{parentIssue.key}</strong> ({parentIssue.title})
                </button>
              )}
            </div>

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
                      <RichTextEditor
                        ariaLabel="Edit issue description"
                        value={descriptionDraft}
                        onChange={setDescriptionDraft}
                        placeholder="Describe the work... paste or drop images and files"
                        minHeight={200}
                        showFooterHint
                        onKeyDown={(event) => {
                          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                            event.preventDefault();
                            saveDescription();
                          }
                        }}
                      />
                      <div className="inline-desc-actions">
                        <Button type="button" size="sm" className="create-button" onClick={saveDescription}>
                          <Check size={14} /> Save description
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="pill-control" onClick={() => setEditingDescription(false)}>
                          Cancel
                        </Button>
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

            {/* ClickUp-style Subtasks Section */}
            <section className="cu-subtasks-section">
              <div className="cu-subtasks-header">
                <div className="cu-subtasks-title-group">
                  <h3>Subtasks</h3>
                  <span className="soft-pill">
                    {doneSubtasksCount}/{subTasks.length}
                  </span>
                  {subTasks.length > 0 && (
                    <div className="cu-subtask-progress" title={`${subtaskProgressPct}% completed`}>
                      <div className="cu-subtask-progress-track">
                        <i style={{ width: `${subtaskProgressPct}%` }} />
                      </div>
                      <small>{subtaskProgressPct}%</small>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="pill-control"
                  onClick={() => setAddingSubtask(true)}
                >
                  <Plus size={14} /> Add subtask
                </Button>
              </div>

              {subTasks.length > 0 && (
                <div className="cu-subtasks-table">
                  <div className="cu-subtasks-thead">
                    <span>Name</span>
                    <span>Assignee</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span />
                  </div>
                  {subTasks.map((sub) => {
                    const isDone = sub.status === "Done";
                    return (
                      <div key={sub.id} className={`cu-subtask-row ${isDone ? "is-done" : ""}`}>
                        <div className="cu-subtask-main">
                          <button
                            type="button"
                            className={`cu-subtask-check ${isDone ? "is-checked" : ""}`}
                            title={isDone ? "Mark as To Do" : "Mark as Done"}
                            onClick={() =>
                              onUpdateSubtask?.(sub.id, {
                                status: isDone ? projectColumns[0] ?? "To Do" : "Done",
                              })
                            }
                          >
                            {isDone && <Check size={11} />}
                          </button>
                          <button
                            type="button"
                            className="cu-subtask-open-btn"
                            onClick={() => onOpenIssue?.(sub.id)}
                            title="Click to open subtask details"
                          >
                            <code className="cu-subtask-key">{sub.key}</code>
                            <span className="cu-subtask-name">{sub.title}</span>
                            <ArrowRight size={13} className="cu-subtask-open-arrow" />
                          </button>
                        </div>

                        <div className="cu-subtask-cell">
                          <select
                            className="cu-subtask-select"
                            aria-label={`Assignee for ${sub.key}`}
                            value={sub.assignee === "Unassigned" ? "" : sub.assignee}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                onUpdateSubtask?.(sub.id, {
                                  assignee: "Unassigned",
                                  initials: "—",
                                  color: "avatar-extra",
                                });
                              } else {
                                const info = peopleAvatars[val] ?? ["AM", "avatar-mint"];
                                onUpdateSubtask?.(sub.id, {
                                  assignee: val,
                                  initials: info[0],
                                  color: info[1],
                                });
                              }
                            }}
                          >
                            <option value="">Unassigned</option>
                            {people.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="cu-subtask-cell">
                          <select
                            className="cu-subtask-select"
                            aria-label={`Priority for ${sub.key}`}
                            value={sub.priority}
                            onChange={(e) =>
                              onUpdateSubtask?.(sub.id, {
                                priority: e.target.value as IssuePriority,
                              })
                            }
                          >
                            {(["Highest", "High", "Medium", "Low", "Lowest"] as IssuePriority[]).map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="cu-subtask-cell">
                          <select
                            className="cu-subtask-select cu-subtask-status-select"
                            aria-label={`Status for ${sub.key}`}
                            value={sub.status}
                            onChange={(e) =>
                              onUpdateSubtask?.(sub.id, {
                                status: e.target.value,
                              })
                            }
                          >
                            {projectColumns.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="cu-subtask-actions">
                          <button
                            type="button"
                            className="cu-subtask-icon-btn"
                            title="Open subtask"
                            onClick={() => onOpenIssue?.(sub.id)}
                          >
                            <ArrowRight size={13} />
                          </button>
                          <button
                            type="button"
                            className="cu-subtask-icon-btn cu-subtask-del-btn"
                            title="Delete subtask"
                            onClick={() => onDeleteSubtask?.(sub.id, sub.key)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {addingSubtask ? (
                <div className="cu-subtask-creator">
                  <span className="cu-subtask-creator-icon">↳</span>
                  <input
                    type="text"
                    className="cp-input cu-subtask-input"
                    autoFocus
                    placeholder="Subtask name... (press Enter to save, Esc to cancel)"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitNewSubtask();
                      } else if (e.key === "Escape") {
                        setAddingSubtask(false);
                        setNewSubtaskTitle("");
                      }
                    }}
                  />
                  <select
                    className="cu-subtask-select"
                    value={newSubtaskAssignee}
                    onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                    aria-label="New subtask assignee"
                  >
                    <option value="">Assignee</option>
                    {people.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <select
                    className="cu-subtask-select"
                    value={newSubtaskPriority}
                    onChange={(e) => setNewSubtaskPriority(e.target.value as IssuePriority)}
                    aria-label="New subtask priority"
                  >
                    {(["Highest", "High", "Medium", "Low", "Lowest"] as IssuePriority[]).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    className="create-button"
                    disabled={!newSubtaskTitle.trim()}
                    onClick={submitNewSubtask}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingSubtask(false);
                      setNewSubtaskTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="cu-subtask-quick-add"
                  onClick={() => setAddingSubtask(true)}
                >
                  <Plus size={14} /> New subtask
                </button>
              )}
            </section>

            <div className="working-on-bar">
              <div className="working-on-copy" style={{ flex: 1 }}>
                <strong>Working on (working / touches)</strong>
                {editingWorkingOn ? (
                  <div style={{ display: "grid", gap: "8px", marginTop: "6px" }}>
                    <input
                      className="cp-input working-on-input"
                      autoFocus
                      placeholder="What is being done, with what approach, and why? (<= 600 chars)"
                      value={workingOnDraft}
                      onChange={(event) => setWorkingOnDraft(event.target.value)}
                    />
                    <input
                      className="cp-input working-on-input"
                      placeholder="Touches: files, modules, or APIs (comma-separated, up to 10)"
                      value={touchesDraft}
                      onChange={(event) => setTouchesDraft(event.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <span>{workingOn || "No one has said what they are doing on this card."}</span>
                    {touches.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                        {touches.map((t) => (
                          <code key={t} className="file-path-pill" style={{ fontSize: "11px" }}>
                            {t}
                          </code>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {editingWorkingOn ? (
                <Button
                  type="button"
                  size="sm"
                  className="create-button"
                  onClick={() => {
                    setWorkingOn(workingOnDraft.trim());
                    setTouches(
                      touchesDraft
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 10),
                    );
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
                    setTouchesDraft(touches.join(", "));
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
                  {postedComments.map((item) => (
                    <div
                      key={item.id}
                      className="activity-entry"
                      style={item.replyTo ? { marginLeft: "28px", borderLeft: "2px solid var(--border)", paddingLeft: "10px" } : undefined}
                    >
                      <span className="avatar avatar-mint">{item.initials}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong>{item.author}</strong> <small>{item.time}</small>
                          {item.replyTo && <small style={{ opacity: 0.7 }}>↳ reply to #{item.replyTo}</small>}
                          {item.edited && <small style={{ opacity: 0.7 }}>(แก้ไขแล้ว)</small>}
                          <button
                            type="button"
                            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", opacity: 0.75 }}
                            onClick={() => setReplyingTo(item.id)}
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", opacity: 0.75 }}
                            onClick={() =>
                              setPostedComments((prev) => prev.filter((c) => c.id !== item.id))
                            }
                          >
                            Delete
                          </button>
                        </p>
                        <div className="rte-rendered-content" dangerouslySetInnerHTML={{ __html: markdownToHtml(item.text) }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {replyingTo && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginBottom: "6px" }}>
                  <span>Replying to comment #{replyingTo}</span>
                  <button
                    type="button"
                    style={{ border: "none", background: "transparent", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="comment-composer rich-comment-composer">
                <span className="avatar avatar-mint">TC</span>
                <div className="comment-rich-box">
                  <RichTextEditor
                    ariaLabel="Write a comment"
                    placeholder="Write a comment... use @ to mention teammates, or paste/drop files"
                    value={comment}
                    onChange={setComment}
                    minHeight={88}
                    showFooterHint={false}
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
                <small>saves on blur</small>
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
                <div className="metadata-item" style={{ display: "grid", gap: "6px" }}>
                  <span>LINKS (BLOCKS / RELATES / DUPLICATES)</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {issueLinks.map((lnk, idx) => (
                      <span key={`${lnk.type}-${lnk.key}-${idx}`} className="file-path-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Link2 size={11} /> {lnk.type}: <strong>{lnk.key}</strong>
                        <button
                          type="button"
                          aria-label={`Unlink ${lnk.key}`}
                          onClick={() => setIssueLinks((prev) => prev.filter((_, i) => i !== idx))}
                          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <select
                      className="cp-input"
                      style={{ height: "28px", fontSize: "12px", width: "105px" }}
                      value={linkRelation}
                      aria-label="Link relation type"
                      onChange={(e) => setLinkRelation(e.target.value as typeof linkRelation)}
                    >
                      <option value="relates">relates</option>
                      <option value="blocks">blocks</option>
                      <option value="blocked_by">blocked by</option>
                      <option value="duplicates">duplicates</option>
                      <option value="clones">clones</option>
                    </select>
                    <input
                      className="cp-input"
                      style={{ height: "28px", fontSize: "12px", flex: 1 }}
                      placeholder="KEY-n (e.g. APP-108)"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value.toUpperCase())}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const cleanKey = linkInput.trim().toUpperCase();
                        if (!cleanKey) return;
                        setIssueLinks((prev) => [...prev, { type: linkRelation, key: cleanKey }]);
                        setLinkInput("");
                        recordChange(`linked ${linkRelation} ${cleanKey}`, {});
                      }}
                    >
                      Link
                    </Button>
                  </div>
                </div>
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
