import { useState, type DragEvent, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Columns3,
  Ellipsis,
  GitBranch,
  Grip,
  List,
  MessageSquare,
  Paperclip,
  Plus,
  Sparkles,
  ThumbsUp,
} from "lucide-react";

import { pipelineColumns, statusClass, type Issue } from "@/lib/workspace-data";
import { Button } from "@/components/ui/button";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function PriorityLabel({ priority }: { priority: Issue["priority"] }) {
  return (
    <span className={`priority-label priority-${priority.toLowerCase()}`}>
      {priority === "High" ? <ArrowUp size={12} /> : priority === "Low" ? <ArrowDown size={12} /> : <ArrowRight size={12} />}
      {priority}
    </span>
  );
}

export function BoardView({
  boardColumns,
  visibleIssues,
  hasActiveFilters,
  boardLayout,
  compactView,
  selectMode,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  onBulkMove,
  onOpenNewIssue,
  onOpenIssue,
  onVoteIssue,
  onMoveIssue,
}: {
  boardColumns: string[];
  visibleIssues: Issue[];
  hasActiveFilters: boolean;
  boardLayout: "columns" | "list";
  compactView: boolean;
  selectMode: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onBulkMove: (status: string) => void;
  onOpenNewIssue: () => void;
  onOpenIssue: (id: string) => void;
  onVoteIssue: (id: string) => void;
  onMoveIssue: (draggedId: string, changes: Partial<Issue>, targetId?: string, noticeText?: string) => void;
}) {
  const [dragIssueId, setDragIssueId] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});

  const toggleCollapse = (column: string) => {
    setCollapsedColumns((current) => ({ ...current, [column]: !current[column] }));
  };

  return (
    <>
      {selectMode && selectedIds.length > 0 && (
        <div className="bulk-select-bar">
          <span>{selectedIds.length} selected</span>
          <div className="bulk-select-actions">
            {boardColumns.map((column) => (
              <Button key={column} size="sm" variant="outline" onClick={() => onBulkMove(column)}>
                Move to {column}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={onClearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {boardLayout === "list" ? (
        <div className="subpage board-list-view">
          {boardColumns.map((column) => {
            const columnIssues = visibleIssues.filter((issue) => issue.status === column);
            return (
              <section
                key={column}
                className={`sprint-section ${dropColumn === column ? "is-drop-target" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  if (dropColumn !== column) setDropColumn(column);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDropColumn((current) => (current === column ? null : current));
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                  setDropColumn(null);
                  setDragIssueId(null);
                  if (droppedId) onMoveIssue(droppedId, { status: column }, undefined, `Moved to ${column}`);
                }}
              >
                <div className="section-inline-title">
                  <div>
                    <span className={`status-dot ${statusClass(column)}`} />
                    <h3>{column}</h3>
                    <span className="soft-pill">{columnIssues.length}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={onOpenNewIssue}>
                    <Plus size={14} /> Add issue
                  </Button>
                </div>
                {columnIssues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    isDragging={dragIssueId === issue.id}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", issue.id);
                      setDragIssueId(issue.id);
                    }}
                    onDragEnd={() => {
                      setDragIssueId(null);
                      setDropColumn(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                      setDropColumn(null);
                      setDragIssueId(null);
                      if (droppedId) onMoveIssue(droppedId, { status: column }, issue.id, `Moved to ${column}`);
                    }}
                    onOpen={() => onOpenIssue(issue.id)}
                  />
                ))}
                {columnIssues.length === 0 && <div className="empty-column">Empty</div>}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="board-scroll">
          <div className="board-columns" style={{ gridTemplateColumns: `repeat(${boardColumns.length}, minmax(220px, 1fr))` }}>
            {boardColumns.map((column) => {
              const columnIssues = visibleIssues.filter((issue) => issue.status === column);
              const collapsed = Boolean(collapsedColumns[column]);
              return (
                <div
                  className={`board-column board-col-${statusClass(column)} ${compactView ? "is-compact" : ""} ${dropColumn === column ? "is-drop-target" : ""}`}
                  key={column}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    if (dropColumn !== column) setDropColumn(column);
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDropColumn((current) => (current === column ? null : current));
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                    setDropColumn(null);
                    setDragIssueId(null);
                    if (droppedId) onMoveIssue(droppedId, { status: column }, undefined, `Moved to ${column}`);
                  }}
                >
                  <div className="column-heading">
                    <button
                      type="button"
                      className="column-collapse"
                      title={collapsed ? `Expand ${column}` : `Collapse ${column}`}
                      onClick={() => toggleCollapse(column)}
                    >
                      {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <span className={`status-dot ${statusClass(column)}`} />
                    <h3>{column}</h3>
                    <span className="column-count">{columnIssues.length}</span>
                    <Button variant="ghost" size="icon" className="column-add" title={`Create an issue in ${column}`} onClick={onOpenNewIssue}>
                      <Plus size={15} />
                    </Button>
                  </div>
                  {!collapsed && (
                    <div className="issue-list">
                      {columnIssues.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          compact={compactView}
                          selectMode={selectMode}
                          selected={selectedIds.includes(issue.id)}
                          isDragging={dragIssueId === issue.id}
                          onToggleSelect={() => onToggleSelect(issue.id)}
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", issue.id);
                            setDragIssueId(issue.id);
                          }}
                          onDragEnd={() => {
                            setDragIssueId(null);
                            setDropColumn(null);
                          }}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                            setDropColumn(null);
                            setDragIssueId(null);
                            if (droppedId) onMoveIssue(droppedId, { status: column }, issue.id, `Moved to ${column}`);
                          }}
                          onOpen={() => onOpenIssue(issue.id)}
                          onVote={() => onVoteIssue(issue.id)}
                        />
                      ))}
                      {columnIssues.length === 0 && (
                        <div className="empty-column empty-column-box">{hasActiveFilters ? "No matching issues" : "Empty"}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function IssueCard({
  issue,
  compact = false,
  selectMode = false,
  selected = false,
  isDragging = false,
  onToggleSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onOpen,
  onVote,
}: {
  issue: Issue;
  compact?: boolean;
  selectMode?: boolean;
  selected?: boolean;
  isDragging?: boolean;
  onToggleSelect?: () => void;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
  onOpen: () => void;
  onVote: () => void;
}) {
  return (
    <article
      className={`issue-card ${compact ? "is-compact" : ""} ${selected ? "is-selected" : ""} ${isDragging ? "is-dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="issue-card-top">
        {selectMode && (
          <button
            type="button"
            className={`card-checkbox ${selected ? "is-checked" : ""}`}
            aria-label={`Select ${issue.key}`}
            onClick={onToggleSelect}
          >
            {selected && <Check size={11} />}
          </button>
        )}
        <button className="issue-key" onClick={onOpen}>
          {issue.key}
        </button>
        <span className={`type-icon type-${issue.type.toLowerCase()}`} title={issue.type}>
          {issue.type === "Bug" ? "◆" : issue.type === "Feature" ? "✦" : issue.type === "Epic" ? "⚡" : issue.type === "Subtask" ? "↳" : "≡"}
        </span>
        <PriorityLabel priority={issue.priority} />
        <Button variant="ghost" size="icon" className="issue-more" title="Issue actions" onClick={onOpen}>
          <Ellipsis size={17} />
        </Button>
      </div>
      <button className="issue-title" onClick={onOpen}>
        {issue.title}
      </button>
      {!compact && (
        <div className="issue-tags">
          {issue.tags.slice(0, 2).map((tag) => (
            <span className="issue-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="issue-card-footer">
        <div className="issue-metrics">
          <span title="Comments">
            <MessageSquare size={14} />
            {issue.comments}
          </span>
          {issue.attachments > 0 && (
            <span title="Attachments">
              <Paperclip size={14} />
              {issue.attachments}
            </span>
          )}
          <button onClick={onVote} title="Vote for this issue">
            <ThumbsUp size={13} />
            {issue.votes}
          </button>
        </div>
        <div className="assignee-group">
          {issue.ai && (
            <span className="ai-chip" title={`Last updated via ${issue.ai}`}>
              <Sparkles size={10} />
            </span>
          )}
          <span className={`avatar ${issue.color}`} title={`${issue.assignee}${issue.ai ? ` · via ${issue.ai}` : ""}`}>
            {issue.initials}
          </span>
        </div>
      </div>
    </article>
  );
}

export function SprintView({
  issues,
  onOpen,
  onCreate,
  onMoveIssue,
}: {
  issues: Issue[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onMoveIssue: (draggedId: string, changes: Partial<Issue>, targetId?: string, noticeText?: string) => void;
}) {
  const sprintIssues = issues.filter((issue) => issue.status !== "Done" && issue.status !== "To Do" && issue.status !== "Backlog");
  const backlog = issues.filter((issue) => issue.status === "To Do" || issue.status === "Backlog");
  const [started, setStarted] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropSection, setDropSection] = useState<"sprint" | "backlog" | null>(null);

  return (
    <div className="subpage">
      <SectionHeading
        eyebrow="SPRINT PLANNING · STORE-12"
        title="Backlog & sprints"
        description="Shape the work ahead, one focused sprint at a time."
        action={
          <Button size="sm" onClick={onCreate}>
            <Plus size={15} /> Create issue
          </Button>
        }
      />
      <section
        className={`sprint-section ${dropSection === "sprint" ? "is-drop-target" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          if (dropSection !== "sprint") setDropSection("sprint");
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDropSection((current) => (current === "sprint" ? null : current));
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          const droppedId = event.dataTransfer.getData("text/plain") || dragId;
          setDropSection(null);
          setDragId(null);
          if (droppedId) onMoveIssue(droppedId, { status: "In Progress" }, undefined, "Moved to Sprint 24");
        }}
      >
        <div className="section-inline-title">
          <div>
            <span className="sprint-status-dot" />
            <h3>{started ? "Sprint 24 · Active" : "Sprint 24 · Upcoming"}</h3>
            <span className="soft-pill">{sprintIssues.length} issues</span>
          </div>
          <Button size="sm" variant={started ? "outline" : "default"} onClick={() => setStarted(!started)}>
            {started ? "Complete sprint" : "Start sprint"}
          </Button>
        </div>
        <div className="sprint-dates">
          <CalendarDays size={14} /> {started ? "Started today" : "Nov 17"} – Nov 28 <span>·</span> 10 working days
        </div>
        {sprintIssues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            isDragging={dragId === issue.id}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", issue.id);
              setDragId(issue.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setDropSection(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const droppedId = event.dataTransfer.getData("text/plain") || dragId;
              setDropSection(null);
              setDragId(null);
              if (droppedId) onMoveIssue(droppedId, { status: issue.status }, issue.id, "Updated sprint order");
            }}
            onOpen={() => onOpen(issue.id)}
          />
        ))}
        {sprintIssues.length === 0 && <div className="empty-column">Drag issues here to add to sprint</div>}
      </section>

      <section
        className={`backlog-section ${dropSection === "backlog" ? "is-drop-target" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          if (dropSection !== "backlog") setDropSection("backlog");
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDropSection((current) => (current === "backlog" ? null : current));
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          const droppedId = event.dataTransfer.getData("text/plain") || dragId;
          setDropSection(null);
          setDragId(null);
          if (droppedId) onMoveIssue(droppedId, { status: "To Do" }, undefined, "Moved to backlog");
        }}
      >
        <div className="section-inline-title">
          <div>
            <h3>Product backlog</h3>
            <span className="soft-pill">{backlog.length} issues</span>
          </div>
          <Button size="sm" variant="outline" onClick={onCreate}>
            <Plus size={15} /> Add to backlog
          </Button>
        </div>
        <p className="table-caption">Prioritized work not yet assigned to a sprint</p>
        {backlog.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            isDragging={dragId === issue.id}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", issue.id);
              setDragId(issue.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setDropSection(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const droppedId = event.dataTransfer.getData("text/plain") || dragId;
              setDropSection(null);
              setDragId(null);
              if (droppedId) onMoveIssue(droppedId, { status: "To Do" }, issue.id, "Updated backlog order");
            }}
            onOpen={() => onOpen(issue.id)}
          />
        ))}
        {backlog.length === 0 && <div className="empty-column">Drag issues here to move to backlog</div>}
      </section>
    </div>
  );
}

function IssueRow({
  issue,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onOpen,
}: {
  issue: Issue;
  isDragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLButtonElement>) => void;
  onDrop?: (event: DragEvent<HTMLButtonElement>) => void;
  onOpen: () => void;
}) {
  return (
    <button
      className={`issue-row ${isDragging ? "is-dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onOpen}
    >
      <Grip size={15} className="row-grip" />
      <span className="issue-key">{issue.key}</span>
      <span className={`type-icon type-${issue.type.toLowerCase()}`}>{issue.type === "Bug" ? "◆" : issue.type === "Feature" ? "✦" : "≡"}</span>
      <span className="row-title">{issue.title}</span>
      <PriorityLabel priority={issue.priority} />
      <span className={`avatar row-avatar ${issue.color}`}>{issue.initials}</span>
      <span className="row-votes">
        <ThumbsUp size={13} />
        {issue.votes}
      </span>
    </button>
  );
}

export function PipelineView({
  issues,
  onOpen,
  onPromote,
  onMoveStage,
}: {
  issues: Issue[];
  onOpen: (id: string) => void;
  onPromote: (issue: Issue) => void;
  onMoveStage: (draggedId: string, stage: string, targetId?: string) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);

  return (
    <div className="subpage">
      <SectionHeading
        eyebrow="RELEASE MANAGEMENT"
        title="Delivery pipeline"
        description="See what’s moving through development, QA, and production."
        action={
          <Button variant="outline" size="sm">
            <GitBranch size={15} /> Release v1.4.0
          </Button>
        }
      />
      <div className="pipeline-legend">
        <span>
          <span className="status-dot dot-blue" /> Development
        </span>
        <ArrowRight size={14} />
        <span>
          <span className="status-dot dot-amber" /> Staging / QA
        </span>
        <ArrowRight size={14} />
        <span>
          <span className="status-dot dot-violet" /> Testing (UAT)
        </span>
        <ArrowRight size={14} />
        <span>
          <span className="status-dot dot-green" /> Production
        </span>
      </div>
      <div className="pipeline-board">
        {pipelineColumns.map((stage) => {
          const items = issues.filter((issue) => issue.env === stage);
          return (
            <div
              key={stage}
              className={`pipeline-stage ${dropStage === stage ? "is-drop-target" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (dropStage !== stage) setDropStage(stage);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDropStage((current) => (current === stage ? null : current));
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const droppedId = event.dataTransfer.getData("text/plain") || dragId;
                setDropStage(null);
                setDragId(null);
                if (droppedId) onMoveStage(droppedId, stage);
              }}
            >
              <div className="pipeline-stage-heading">
                <span className={`status-dot ${statusClass(stage)}`} />
                <h3>{stage}</h3>
                <span className="column-count">{items.length}</span>
              </div>
              {items.map((issue) => (
                <article
                  className={`pipeline-card ${dragId === issue.id ? "is-dragging" : ""}`}
                  key={issue.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", issue.id);
                    setDragId(issue.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDropStage(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const droppedId = event.dataTransfer.getData("text/plain") || dragId;
                    setDropStage(null);
                    setDragId(null);
                    if (droppedId) onMoveStage(droppedId, stage, issue.id);
                  }}
                >
                  <button className="issue-key" onClick={() => onOpen(issue.id)}>
                    {issue.key}
                  </button>
                  <span className="release-badge">{issue.release}</span>
                  <button className="pipeline-title" onClick={() => onOpen(issue.id)}>
                    {issue.title}
                  </button>
                  <div className="git-status">
                    <GitBranch size={13} />{" "}
                    {stage === "Production (Released)" ? "Deployed" : stage === "Development" ? "Branch active" : "PR merged"}
                  </div>
                  <div className="pipeline-card-footer">
                    <span className={`avatar ${issue.color}`}>{issue.initials}</span>
                    {stage !== "Production (Released)" && (
                      <Button size="sm" variant="outline" onClick={() => onPromote(issue)}>
                        Promote <ArrowRight size={13} />
                      </Button>
                    )}
                  </div>
                </article>
              ))}
              {items.length === 0 && <div className="pipeline-empty">No releases here</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
