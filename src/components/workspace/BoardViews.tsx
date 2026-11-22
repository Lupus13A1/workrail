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
import type { DropPosition } from "@/lib/workspace-store";
import { Button } from "@/components/ui/button";

type DropTargetState = {
  id: string;
  position: DropPosition;
  container: string;
} | null;

function getDropPosition(event: DragEvent<HTMLElement>): DropPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
}

function DropInsertionIndicator({ position }: { position: DropPosition }) {
  return (
    <div className={`drop-insertion-indicator is-${position}`} aria-hidden="true">
      <span className="drop-insertion-dot" />
      <span className="drop-insertion-line" />
      <span className="drop-insertion-badge">{position === "before" ? "↑ Drop above" : "↓ Drop below"}</span>
      <span className="drop-insertion-line" />
      <span className="drop-insertion-dot" />
    </div>
  );
}

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
  allIssues = visibleIssues,
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
  onCreateSubtask,
  onToggleSubtaskDone,
}: {
  boardColumns: string[];
  visibleIssues: Issue[];
  allIssues?: Issue[];
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
  onMoveIssue: (
    draggedId: string,
    changes: Partial<Issue>,
    targetId?: string,
    noticeText?: string,
    position?: DropPosition,
  ) => void;
  onCreateSubtask?: (parentIssue: Issue, title: string) => Issue | null;
  onToggleSubtaskDone?: (subtask: Issue) => void;
}) {
  const [dragIssueId, setDragIssueId] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});

  const toggleCollapse = (column: string) => {
    setCollapsedColumns((current) => ({ ...current, [column]: !current[column] }));
  };

  const updateDropTarget = (id: string, position: DropPosition, container: string) => {
    setDropTarget((current) =>
      current?.id === id && current?.position === position && current?.container === container
        ? current
        : { id, position, container },
    );
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
                  const targetEl = event.target as HTMLElement | null;
                  if (!targetEl?.closest(".issue-row")) {
                    const candidates = columnIssues.filter((item) => item.id !== dragIssueId);
                    const last = candidates.at(-1);
                    if (last) {
                      updateDropTarget(last.id, "after", column);
                    } else if (dropTarget) {
                      setDropTarget(null);
                    }
                  }
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDropColumn((current) => (current === column ? null : current));
                    setDropTarget((current) => (current?.container === column ? null : current));
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                  const activeTarget = dropTarget?.container === column ? dropTarget : null;
                  setDropColumn(null);
                  setDropTarget(null);
                  setDragIssueId(null);
                  if (droppedId) {
                    onMoveIssue(
                      droppedId,
                      { status: column },
                      activeTarget?.id,
                      `Moved to ${column}`,
                      activeTarget?.position,
                    );
                  }
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
                    dropPosition={dropTarget?.container === column && dropTarget.id === issue.id ? dropTarget.position : null}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", issue.id);
                      setDragIssueId(issue.id);
                    }}
                    onDragEnd={() => {
                      setDragIssueId(null);
                      setDropColumn(null);
                      setDropTarget(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = "move";
                      if (dropColumn !== column) setDropColumn(column);
                      if (dragIssueId === issue.id) {
                        if (dropTarget) setDropTarget(null);
                        return;
                      }
                      updateDropTarget(issue.id, getDropPosition(event), column);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                      const position = getDropPosition(event);
                      setDropColumn(null);
                      setDropTarget(null);
                      setDragIssueId(null);
                      if (droppedId) onMoveIssue(droppedId, { status: column }, issue.id, `Moved to ${column}`, position);
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
              const topLevelColumnIssues = columnIssues.filter((issue) => issue.type !== "Subtask" || !issue.parent);
              const collapsed = Boolean(collapsedColumns[column]);
              return (
                <div
                  className={`board-column board-col-${statusClass(column)} ${compactView ? "is-compact" : ""} ${dropColumn === column ? "is-drop-target" : ""}`}
                  key={column}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    if (dropColumn !== column) setDropColumn(column);
                    const targetEl = event.target as HTMLElement | null;
                    if (!targetEl?.closest(".issue-card")) {
                      const candidates = topLevelColumnIssues.filter((item) => item.id !== dragIssueId);
                      const last = candidates.at(-1);
                      if (last) {
                        updateDropTarget(last.id, "after", column);
                      } else if (dropTarget) {
                        setDropTarget(null);
                      }
                    }
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDropColumn((current) => (current === column ? null : current));
                      setDropTarget((current) => (current?.container === column ? null : current));
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                    const activeTarget = dropTarget?.container === column ? dropTarget : null;
                    setDropColumn(null);
                    setDropTarget(null);
                    setDragIssueId(null);
                    if (droppedId) {
                      onMoveIssue(
                        droppedId,
                        { status: column },
                        activeTarget?.id,
                        `Moved to ${column}`,
                        activeTarget?.position,
                      );
                    }
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
                      {topLevelColumnIssues.map((issue) => (
                          <IssueCard
                            key={issue.id}
                            issue={issue}
                            subtasks={allIssues.filter((sub) => sub.parent === issue.key)}
                            compact={compactView}
                            selectMode={selectMode}
                            selected={selectedIds.includes(issue.id)}
                            isDragging={dragIssueId === issue.id}
                            dropPosition={
                              dropTarget?.container === column && dropTarget.id === issue.id ? dropTarget.position : null
                            }
                            onToggleSelect={() => onToggleSelect(issue.id)}
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", issue.id);
                              setDragIssueId(issue.id);
                            }}
                            onDragEnd={() => {
                              setDragIssueId(null);
                              setDropColumn(null);
                              setDropTarget(null);
                            }}
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              event.dataTransfer.dropEffect = "move";
                              if (dropColumn !== column) setDropColumn(column);
                              if (dragIssueId === issue.id) {
                                if (dropTarget) setDropTarget(null);
                                return;
                              }
                              updateDropTarget(issue.id, getDropPosition(event), column);
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              const droppedId = event.dataTransfer.getData("text/plain") || dragIssueId;
                              const position = getDropPosition(event);
                              setDropColumn(null);
                              setDropTarget(null);
                              setDragIssueId(null);
                              if (droppedId) onMoveIssue(droppedId, { status: column }, issue.id, `Moved to ${column}`, position);
                            }}
                            onOpen={() => onOpenIssue(issue.id)}
                            onOpenSubtask={(subId) => onOpenIssue(subId)}
                            onCreateSubtask={(title) => onCreateSubtask?.(issue, title)}
                            onToggleSubtaskDone={(sub) => onToggleSubtaskDone?.(sub)}
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
  subtasks = [],
  compact = false,
  selectMode = false,
  selected = false,
  isDragging = false,
  dropPosition = null,
  onToggleSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onOpen,
  onOpenSubtask,
  onCreateSubtask,
  onToggleSubtaskDone,
  onVote,
}: {
  issue: Issue;
  subtasks?: Issue[];
  compact?: boolean;
  selectMode?: boolean;
  selected?: boolean;
  isDragging?: boolean;
  dropPosition?: DropPosition | null;
  onToggleSelect?: () => void;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
  onOpen: () => void;
  onOpenSubtask?: (subtaskId: string) => void;
  onCreateSubtask?: (title: string) => void;
  onToggleSubtaskDone?: (subtask: Issue) => void;
  onVote: () => void;
}) {
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);
  const [quickSubtaskOpen, setQuickSubtaskOpen] = useState(false);
  const [quickSubtaskTitle, setQuickSubtaskTitle] = useState("");
  const doneCount = subtasks.filter((s) => s.status === "Done").length;

  return (
    <article
      className={`issue-card ${compact ? "is-compact" : ""} ${selected ? "is-selected" : ""} ${isDragging ? "is-dragging" : ""} ${dropPosition ? `is-drop-${dropPosition}` : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {dropPosition && <DropInsertionIndicator position={dropPosition} />}
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
          {subtasks.length > 0 && (
            <button
              type="button"
              className={`cu-card-subtask-pill ${subtasksExpanded ? "is-expanded" : ""}`}
              title="Toggle subtasks"
              onClick={() => setSubtasksExpanded((v) => !v)}
            >
              <span>↳</span>
              <span>
                {doneCount}/{subtasks.length}
              </span>
              {subtasksExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
        </div>
      )}

      {!compact && (subtasksExpanded || quickSubtaskOpen) && (
        <div className="cu-card-subtasks-box">
          {subtasks.map((sub) => {
            const isDone = sub.status === "Done";
            return (
              <div key={sub.id} className={`cu-card-subtask-item ${isDone ? "is-done" : ""}`}>
                <button
                  type="button"
                  className={`cu-subtask-check ${isDone ? "is-checked" : ""}`}
                  title={isDone ? "Mark as To Do" : "Mark as Done"}
                  onClick={() => onToggleSubtaskDone?.(sub)}
                >
                  {isDone && <Check size={10} />}
                </button>
                <button
                  type="button"
                  className="cu-card-subtask-link"
                  onClick={() => onOpenSubtask?.(sub.id)}
                  title={`Open ${sub.key}: ${sub.title}`}
                >
                  <code>{sub.key}</code>
                  <span>{sub.title}</span>
                </button>
              </div>
            );
          })}

          {quickSubtaskOpen ? (
            <div className="cu-card-subtask-form">
              <input
                type="text"
                className="cp-input cu-card-subtask-input"
                autoFocus
                placeholder="Subtask name... (Enter)"
                value={quickSubtaskTitle}
                onChange={(e) => setQuickSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickSubtaskTitle.trim()) {
                    e.preventDefault();
                    onCreateSubtask?.(quickSubtaskTitle.trim());
                    setQuickSubtaskTitle("");
                    setSubtasksExpanded(true);
                  } else if (e.key === "Escape") {
                    setQuickSubtaskOpen(false);
                    setQuickSubtaskTitle("");
                  }
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              className="cu-card-add-sub-inline"
              onClick={() => setQuickSubtaskOpen(true)}
            >
              <Plus size={12} /> Add subtask
            </button>
          )}
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
          <button
            type="button"
            onClick={() => {
              setSubtasksExpanded(true);
              setQuickSubtaskOpen(true);
            }}
            title="Add subtask"
          >
            <Plus size={12} /> Subtask
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
  onMoveIssue: (
    draggedId: string,
    changes: Partial<Issue>,
    targetId?: string,
    noticeText?: string,
    position?: DropPosition,
  ) => void;
}) {
  const sprintIssues = issues.filter((issue) => issue.status !== "Done" && issue.status !== "To Do" && issue.status !== "Backlog");
  const backlog = issues.filter((issue) => issue.status === "To Do" || issue.status === "Backlog");
  const [started, setStarted] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropSection, setDropSection] = useState<"sprint" | "backlog" | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState>(null);

  const updateDropTarget = (id: string, position: DropPosition, container: "sprint" | "backlog") => {
    setDropTarget((current) =>
      current?.id === id && current?.position === position && current?.container === container
        ? current
        : { id, position, container },
    );
  };

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
          const targetEl = event.target as HTMLElement | null;
          if (!targetEl?.closest(".issue-row")) {
            const candidates = sprintIssues.filter((item) => item.id !== dragId);
            const last = candidates.at(-1);
            if (last) {
              updateDropTarget(last.id, "after", "sprint");
            } else if (dropTarget) {
              setDropTarget(null);
            }
          }
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDropSection((current) => (current === "sprint" ? null : current));
            setDropTarget((current) => (current?.container === "sprint" ? null : current));
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          const droppedId = event.dataTransfer.getData("text/plain") || dragId;
          const activeTarget = dropTarget?.container === "sprint" ? dropTarget : null;
          setDropSection(null);
          setDropTarget(null);
          setDragId(null);
          if (droppedId) {
            onMoveIssue(
              droppedId,
              { status: "In Progress" },
              activeTarget?.id,
              "Moved to Sprint 24",
              activeTarget?.position,
            );
          }
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
            dropPosition={dropTarget?.container === "sprint" && dropTarget.id === issue.id ? dropTarget.position : null}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", issue.id);
              setDragId(issue.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setDropSection(null);
              setDropTarget(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.dataTransfer.dropEffect = "move";
              if (dropSection !== "sprint") setDropSection("sprint");
              if (dragId === issue.id) {
                if (dropTarget) setDropTarget(null);
                return;
              }
              updateDropTarget(issue.id, getDropPosition(event), "sprint");
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const droppedId = event.dataTransfer.getData("text/plain") || dragId;
              const position = getDropPosition(event);
              setDropSection(null);
              setDropTarget(null);
              setDragId(null);
              if (droppedId) onMoveIssue(droppedId, { status: issue.status }, issue.id, "Updated sprint order", position);
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
          const targetEl = event.target as HTMLElement | null;
          if (!targetEl?.closest(".issue-row")) {
            const candidates = backlog.filter((item) => item.id !== dragId);
            const last = candidates.at(-1);
            if (last) {
              updateDropTarget(last.id, "after", "backlog");
            } else if (dropTarget) {
              setDropTarget(null);
            }
          }
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDropSection((current) => (current === "backlog" ? null : current));
            setDropTarget((current) => (current?.container === "backlog" ? null : current));
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          const droppedId = event.dataTransfer.getData("text/plain") || dragId;
          const activeTarget = dropTarget?.container === "backlog" ? dropTarget : null;
          setDropSection(null);
          setDropTarget(null);
          setDragId(null);
          if (droppedId) {
            onMoveIssue(
              droppedId,
              { status: "To Do" },
              activeTarget?.id,
              "Moved to backlog",
              activeTarget?.position,
            );
          }
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
            dropPosition={dropTarget?.container === "backlog" && dropTarget.id === issue.id ? dropTarget.position : null}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", issue.id);
              setDragId(issue.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setDropSection(null);
              setDropTarget(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.dataTransfer.dropEffect = "move";
              if (dropSection !== "backlog") setDropSection("backlog");
              if (dragId === issue.id) {
                if (dropTarget) setDropTarget(null);
                return;
              }
              updateDropTarget(issue.id, getDropPosition(event), "backlog");
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const droppedId = event.dataTransfer.getData("text/plain") || dragId;
              const position = getDropPosition(event);
              setDropSection(null);
              setDropTarget(null);
              setDragId(null);
              if (droppedId) onMoveIssue(droppedId, { status: "To Do" }, issue.id, "Updated backlog order", position);
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
  dropPosition = null,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onOpen,
}: {
  issue: Issue;
  isDragging?: boolean;
  dropPosition?: DropPosition | null;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLButtonElement>) => void;
  onDrop?: (event: DragEvent<HTMLButtonElement>) => void;
  onOpen: () => void;
}) {
  return (
    <button
      className={`issue-row ${isDragging ? "is-dragging" : ""} ${dropPosition ? `is-drop-${dropPosition}` : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onOpen}
    >
      {dropPosition && <DropInsertionIndicator position={dropPosition} />}
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
  onMoveStage: (draggedId: string, stage: string, targetId?: string, position?: DropPosition) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState>(null);

  const updateDropTarget = (id: string, position: DropPosition, container: string) => {
    setDropTarget((current) =>
      current?.id === id && current?.position === position && current?.container === container
        ? current
        : { id, position, container },
    );
  };

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
                const targetEl = event.target as HTMLElement | null;
                if (!targetEl?.closest(".pipeline-card")) {
                  const candidates = items.filter((item) => item.id !== dragId);
                  const last = candidates.at(-1);
                  if (last) {
                    updateDropTarget(last.id, "after", stage);
                  } else if (dropTarget) {
                    setDropTarget(null);
                  }
                }
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDropStage((current) => (current === stage ? null : current));
                  setDropTarget((current) => (current?.container === stage ? null : current));
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const droppedId = event.dataTransfer.getData("text/plain") || dragId;
                const activeTarget = dropTarget?.container === stage ? dropTarget : null;
                setDropStage(null);
                setDropTarget(null);
                setDragId(null);
                if (droppedId) onMoveStage(droppedId, stage, activeTarget?.id, activeTarget?.position);
              }}
            >
              <div className="pipeline-stage-heading">
                <span className={`status-dot ${statusClass(stage)}`} />
                <h3>{stage}</h3>
                <span className="column-count">{items.length}</span>
              </div>
              {items.map((issue) => {
                const cardDropPosition =
                  dropTarget?.container === stage && dropTarget.id === issue.id ? dropTarget.position : null;
                return (
                  <article
                    className={`pipeline-card ${dragId === issue.id ? "is-dragging" : ""} ${cardDropPosition ? `is-drop-${cardDropPosition}` : ""}`}
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
                      setDropTarget(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = "move";
                      if (dropStage !== stage) setDropStage(stage);
                      if (dragId === issue.id) {
                        if (dropTarget) setDropTarget(null);
                        return;
                      }
                      updateDropTarget(issue.id, getDropPosition(event), stage);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const droppedId = event.dataTransfer.getData("text/plain") || dragId;
                      const position = getDropPosition(event);
                      setDropStage(null);
                      setDropTarget(null);
                      setDragId(null);
                      if (droppedId) onMoveStage(droppedId, stage, issue.id, position);
                    }}
                  >
                    {cardDropPosition && <DropInsertionIndicator position={cardDropPosition} />}
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
                );
              })}
              {items.length === 0 && <div className="pipeline-empty">No releases here</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
