import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Columns3,
  Filter,
  List,
  ListTodo,
  Lock,
  Play,
  Plus,
  Rows3,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";

import { getProjectSlug, useWorkspaceStore } from "@/lib/workspace-store";
import { useI18n } from "@/lib/i18n";
import {
  people,
  peopleAvatars,
  pipelineColumns,
  type IssuePriority,
  type IssueType,
  type SprintItem,
  type WorkspaceView,
} from "@/lib/workspace-data";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BoardView, PipelineView, SprintView } from "@/components/workspace/BoardViews";
import { CreateProjectModal } from "@/components/workspace/ProjectsHome";
import { WorkrailTopbar } from "@/components/workspace/WorkrailTopbar";
import { CreateIssueModal, GlobalSearchModal, IssueDrawer, SprintsModal, StartSprintModal } from "@/components/workspace/WorkspaceModals";
import { BriefView } from "@/components/workspace/WorkspaceSubpages";

export const Route = createFileRoute("/project/$projectSlug")({
  head: () => ({
    meta: [{ title: "Workrail" }],
  }),
  component: ProjectWorkspacePage,
});

function ProjectWorkspacePage() {
  const { projectSlug } = Route.useParams();
  const routerNavigate = useNavigate();
  const store = useWorkspaceStore();
  const { language, t } = useI18n();

  const activeProject = store.findProjectBySlug(projectSlug);

  useEffect(() => {
    if (activeProject) {
      store.ensureProjectIssues(activeProject);
      store.markRecent(activeProject.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject?.id]);

  const [view, setView] = useState<WorkspaceView>("Board");
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [query] = useState("");
  const [filterPerson, setFilterPerson] = useState("All teammates");
  const [filterType, setFilterType] = useState<IssueType | null>(null);
  const [filterPriority, setFilterPriority] = useState<IssuePriority | null>(null);
  const [aiOnly, setAiOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [boardLayout, setBoardLayout] = useState<"columns" | "list">("columns");
  const [compactView, setCompactView] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sprintsOpen, setSprintsOpen] = useState(false);
  const [startSprintTarget, setStartSprintTarget] = useState<SprintItem | null>(null);
  const [summaryHidden, setSummaryHidden] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

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

  if (!activeProject) {
    return (
      <AuthGuard>
        <div className={`workspace-shell ${store.darkMode ? "dark" : "light-mode"}`}>
          <main className="app-main">
            <WorkrailTopbar
              darkMode={store.darkMode}
              currentLabel="Projects"
              projects={store.projects}
              onToggleDark={() => store.setDarkMode(!store.darkMode)}
              onSearch={() => setGlobalSearchOpen(true)}
              onNotice={store.setNotice}
              onNavigate={() => void routerNavigate({ to: "/" })}
              onOpenProject={(project) => void routerNavigate({ to: "/project/$projectSlug", params: { projectSlug: getProjectSlug(project) } })}
              onProjects={() => void routerNavigate({ to: "/" })}
              onMyWork={() => void routerNavigate({ to: "/" })}
            />
            <div className="subpage">
              <div className="projects-empty home-empty">
                <h3>Project not found</h3>
                <p>The project "{projectSlug}" does not exist in this workspace.</p>
                <Button onClick={() => void routerNavigate({ to: "/" })}>
                  <ArrowLeft size={15} /> Back to projects
                </Button>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const issues = store.getIssues(activeProject.id);
  const sprints = store.getSprints(activeProject.id);
  const activeSprint = sprints.find((sprint) => sprint.status === "active") ?? null;
  const plannedSprint = sprints.find((sprint) => sprint.status === "planned") ?? null;
  const bannerSprint = activeSprint ?? plannedSprint;
  const activeIssue = issues.find((item) => item.id === activeIssueId) ?? null;

  const visibleIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesText = `${issue.key} ${issue.title} ${issue.assignee} ${issue.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesPerson = filterPerson === "All teammates" || issue.assignee === filterPerson;
        const matchesType = !filterType || issue.type === filterType;
        const matchesPriority = !filterPriority || issue.priority === filterPriority;
        return matchesText && matchesPerson && matchesType && matchesPriority && (!aiOnly || Boolean(issue.ai));
      }),
    [issues, query, filterPerson, filterType, filterPriority, aiOnly],
  );

  const goHomeView = (target?: WorkspaceView) => {
    void routerNavigate({ to: "/", search: target ? { view: target } : {} });
  };

  const openProjectRoute = (project: typeof activeProject) => {
    setActiveIssueId(null);
    setView("Board");
    void routerNavigate({ to: "/project/$projectSlug", params: { projectSlug: getProjectSlug(project) } });
  };

  return (
    <AuthGuard>
      <div className={`workspace-shell ${store.darkMode ? "dark" : "light-mode"}`}>
        <main className="app-main">
        <WorkrailTopbar
          darkMode={store.darkMode}
          currentLabel={activeProject.name}
          projects={store.projects}
          activeProjectId={activeProject.id}
          onToggleDark={() => store.setDarkMode(!store.darkMode)}
          onSearch={() => setGlobalSearchOpen(true)}
          onNotice={store.setNotice}
          onNavigate={(target) => {
            if (target === "Board" || target === "Backlog & Sprints" || target === "Delivery Pipeline" || target === "Project Brief") {
              setView(target);
            } else {
              goHomeView(target);
            }
          }}
          onOpenProject={openProjectRoute}
          onProjects={() => void routerNavigate({ to: "/" })}
          onMyWork={() => void routerNavigate({ to: "/", search: { myWork: "1" } })}
        />

        <div className="project-header project-header-compact">
          {(view === "Board" || view === "Backlog & Sprints") &&
            (!bannerSprint ? (
              <section className="sprint-banner">
                <div className="sprint-banner-copy">
                  <span className="eyebrow">NO ACTIVE SPRINT · {activeProject.key}</span>
                  <h1>Plan a sprint</h1>
                  <p>No sprint is running or planned. Create a sprint, move issues from the backlog into it, then start it.</p>
                  <div className="sprint-banner-actions">
                    <button type="button" className="home-create" onClick={() => setSprintsOpen(true)}>
                      <Plus size={15} /> Create sprint
                    </button>
                    <Button variant="outline" size="sm" className="banner-secondary-btn" onClick={() => setView("Backlog & Sprints")}>
                      <ListTodo size={15} /> Open backlog
                    </Button>
                  </div>
                </div>
              </section>
            ) : (
              <div className="sprint-overview-wrap">
                {!summaryHidden && (
                  <div className="sprint-banner-grid">
                    <section className="sprint-banner-card">
                      <div className="sprint-card-top">
                        <div>
                          <span className="eyebrow">
                            {bannerSprint.status === "active" ? "CURRENT SPRINT" : "NEXT SPRINT"} · {bannerSprint.code} · {activeProject.key}
                          </span>
                          <div className="sprint-title-line">
                            <h1>{bannerSprint.name}</h1>
                            {bannerSprint.status === "planned" && (
                              <span className="sprint-status-pill status-planned">
                                <i /> Not started
                              </span>
                            )}
                          </div>
                          <p className="sprint-goal-line">{bannerSprint.goal || "No goal set"}</p>
                        </div>
                        {bannerSprint.status === "active" && (
                          <div className="days-left-ring">
                            <strong>14</strong>
                            <small>days left</small>
                          </div>
                        )}
                      </div>
                      <div className="sprint-meta-pills">
                        <span className="file-path-pill">
                          {bannerSprint.start} → {bannerSprint.end}
                        </span>
                        {bannerSprint.status === "active" ? (
                          <>
                            <span className="file-path-pill">Day 1 / 14</span>
                            <span className="file-path-pill">sprints/{bannerSprint.code}.md</span>
                          </>
                        ) : (
                          <span className="file-path-pill">Starts in 14 days</span>
                        )}
                      </div>
                      <div className="sprint-banner-actions">
                        {bannerSprint.status === "planned" ? (
                          <button type="button" className="home-create" onClick={() => setStartSprintTarget(bannerSprint)}>
                            <Play size={14} /> Start sprint
                          </button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="pill-control"
                            onClick={() => {
                              store.updateSprints(activeProject.id, (current) =>
                                current.map((s) => (s.id === bannerSprint.id ? { ...s, status: "closed" } : s)),
                              );
                              store.setNotice(`${bannerSprint.code} completed`);
                            }}
                          >
                            <Check size={14} /> Complete sprint
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="pill-control" onClick={() => setSprintsOpen(true)}>
                          Sprints…
                        </Button>
                      </div>
                    </section>

                    <section className="sprint-banner-card">
                      <span className="eyebrow">{bannerSprint.status === "active" ? "STORY POINTS" : "PLANNED SCOPE"}</span>
                      {(() => {
                        const sprintIssues = issues.filter((item) => item.sprint === bannerSprint.name);
                        const totalPts = sprintIssues.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
                        const donePts = sprintIssues
                          .filter((item) => item.status === "Done")
                          .reduce((sum, item) => sum + (Number(item.points) || 0), 0);
                        const remainingPts = Math.max(0, totalPts - donePts);
                        const pct = totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 0;
                        return bannerSprint.status === "planned" ? (
                          <>
                            <div className="scope-numbers">
                              <div>
                                <strong>{sprintIssues.length}</strong>
                                <small>issues</small>
                              </div>
                              <div>
                                <strong>{totalPts}</strong>
                                <small>story points</small>
                              </div>
                            </div>
                            <p className="sprint-goal-line">
                              {sprintIssues.length === 0 ? "No issues in this sprint yet" : `${sprintIssues.length} issues planned`}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="scope-numbers">
                              <div>
                                <strong>{remainingPts}</strong>
                                <small>remaining</small>
                              </div>
                              <div>
                                <strong>{totalPts}</strong>
                                <small>committed</small>
                              </div>
                              <div>
                                <strong>{pct}%</strong>
                                <small>progress</small>
                              </div>
                            </div>
                            <div className="scope-bar">
                              <i style={{ width: `${pct}%` }} />
                            </div>
                            <div className="scope-legend">
                              <span>
                                <i className="status-dot dot-green" /> Done
                              </span>
                              <span>
                                <i className="status-dot dot-blue" /> In progress
                              </span>
                              <span>
                                <i className="status-dot dot-gray" /> Not started
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </section>

                    <section className="sprint-banner-card">
                      <span className="eyebrow">{bannerSprint.status === "active" ? "BURNDOWN" : "BOARD LOCKED"}</span>
                      {bannerSprint.status === "planned" ? (
                        <p className="board-locked-copy">
                          <Lock size={14} /> Cards cannot be moved until the sprint starts. Click a card to read or edit.
                        </p>
                      ) : (
                        <div className="burndown-box">
                          <svg viewBox="0 0 260 64" className="burndown-svg" aria-hidden="true">
                            <line x1="8" y1="54" x2="252" y2="54" stroke="#2d2d2d" strokeDasharray="4 4" />
                            <line x1="8" y1="12" x2="252" y2="54" stroke="#a3cfff" strokeWidth="1.5" strokeOpacity="0.6" />
                            <circle cx="14" cy="54" r="3" fill="#7fd8a6" />
                          </svg>
                          <div className="burndown-dates">
                            <span>{bannerSprint.start}</span>
                            <small>Tracking daily progress · 00:00</small>
                            <span>{bannerSprint.end}</span>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>
                )}
                {bannerSprint.status === "active" && (
                  <div className="hide-summary-row">
                    <button type="button" className="hide-summary-pill" onClick={() => setSummaryHidden(!summaryHidden)}>
                      {summaryHidden ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                      {summaryHidden ? "Show summary" : "Hide summary"}
                    </button>
                  </div>
                )}
              </div>
            ))}

          <div className="project-controls-bar">
            <div className="project-tabs-pills" role="tablist" aria-label="Project views">
              {(["Board", "Backlog & Sprints", "Delivery Pipeline", "Project Brief"] as WorkspaceView[]).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={view === tab}
                  onClick={() => setView(tab)}
                  className={`project-pill-tab ${view === tab ? "is-active" : ""}`}
                >
                  {tab === "Board"
                    ? t.board.board
                    : tab === "Backlog & Sprints"
                      ? t.board.backlogSprints
                      : tab === "Delivery Pipeline"
                        ? t.board.deliveryPipeline
                        : language === "th"
                          ? "เอกสาร & สรุปงาน"
                          : "Project docs & brief"}
                </button>
              ))}
            </div>

            {view === "Board" && (
              <div className="board-controls-group">
                <div className="avatar-stack" role="group" aria-label="Filter by teammate">
                  {people.slice(0, 3).map((person) => {
                    const active = filterPerson === person;
                    return (
                      <button
                        key={person}
                        type="button"
                        className={`avatar avatar-filter-btn ${peopleAvatars[person]?.[1]} ${active ? "is-active" : ""}`}
                        title={`Filter by ${person}`}
                        aria-pressed={active}
                        onClick={() => setFilterPerson(active ? "All teammates" : person)}
                      >
                        {peopleAvatars[person]?.[0]}
                      </button>
                    );
                  })}
                </div>

                <div className="filter-popover-wrap">
                  <Button
                    size="sm"
                    variant={filtersOpen || filterType || filterPriority || aiOnly ? "secondary" : "outline"}
                    className="pill-control"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                  >
                    <Filter size={14} /> {t.common.filter}{" "}
                    {Boolean(filterType || filterPriority || aiOnly) && (
                      <span className="filter-active-count">{[filterType, filterPriority, aiOnly].filter(Boolean).length}</span>
                    )}
                    <ChevronDown size={13} />
                  </Button>
                  {filtersOpen && (
                    <>
                      <button className="home-menu-backdrop" aria-label="Close filters" tabIndex={-1} onClick={() => setFiltersOpen(false)} />
                      <div className="filter-popover" role="dialog" aria-label="Board filters">
                        <div className="filter-popover-row">
                          <span className="filter-popover-label">{language === "th" ? "ประเภท" : "TYPE"}</span>
                          <div className="filter-chips">
                            {(["Epic", "Feature", "Task", "Subtask", "Bug"] as IssueType[]).map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`filter-chip ${filterType === item ? "is-active" : ""}`}
                                onClick={() => setFilterType(filterType === item ? null : item)}
                              >
                                <span className={`type-icon type-${item.toLowerCase()}`}>
                                  {item === "Bug" ? "◆" : item === "Feature" ? "✦" : item === "Epic" ? "⚡" : item === "Subtask" ? "↳" : "≡"}
                                </span>
                                {t.board.types[item] ?? item.toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="filter-popover-row">
                          <span className="filter-popover-label">{language === "th" ? "ความสำคัญ" : "PRIORITY"}</span>
                          <div className="filter-chips">
                            {(["Highest", "High", "Medium", "Low", "Lowest"] as IssuePriority[]).map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`filter-chip ${filterPriority === item ? "is-active" : ""}`}
                                onClick={() => setFilterPriority(filterPriority === item ? null : item)}
                              >
                                {t.board.priorities[item] ?? item}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="filter-popover-row">
                          <span className="filter-popover-label">{language === "th" ? "AI AGENTS" : "AGENTS"}</span>
                          <div className="filter-chips">
                            <button type="button" className={`filter-chip ${aiOnly ? "is-active" : ""}`} onClick={() => setAiOnly(!aiOnly)}>
                              <Sparkles size={12} /> {language === "th" ? "งาน AI" : "agent work"}
                            </button>
                            {(filterType || filterPriority || aiOnly || filterPerson !== "All teammates") && (
                              <button
                                type="button"
                                className="filter-clear-btn"
                                onClick={() => {
                                  setFilterType(null);
                                  setFilterPriority(null);
                                  setAiOnly(false);
                                  setFilterPerson("All teammates");
                                }}
                              >
                                {language === "th" ? "ล้างทั้งหมด" : "Clear all"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Button size="sm" className="create-button" onClick={() => setNewIssueOpen(true)}>
                  <Plus size={15} /> {language === "th" ? "สร้างงาน" : "Create issue"}
                </Button>

                <Button size="sm" variant="outline" className="pill-control" onClick={() => setSprintsOpen(true)}>
                  <Settings2 size={14} /> {language === "th" ? "ตั้งค่า" : "Settings"}
                </Button>

                <div className="board-layout-switch" role="group" aria-label="Board layout">
                  <button type="button" className={boardLayout === "columns" ? "is-active" : ""} onClick={() => setBoardLayout("columns")}>
                    <Columns3 size={14} /> {t.board.columns}
                  </button>
                  <button type="button" className={boardLayout === "list" ? "is-active" : ""} onClick={() => setBoardLayout("list")}>
                    <List size={14} /> {t.board.list}
                  </button>
                </div>

                <Button size="sm" variant={compactView ? "secondary" : "outline"} className="pill-control" onClick={() => setCompactView(!compactView)}>
                  <Rows3 size={14} /> {t.board.compact}
                </Button>

                <Button
                  size="sm"
                  variant={selectMode ? "secondary" : "outline"}
                  className="pill-control"
                  onClick={() => {
                    setSelectMode(!selectMode);
                    setSelectedIds([]);
                  }}
                >
                  <CheckSquare size={14} /> {t.board.select}
                </Button>

                <span className="board-kbd-hint">
                  <kbd>drag</kbd> {language === "th" ? "ลากเพื่อย้าย/จัดลำดับการ์ด" : "move / reorder cards"}
                </span>
              </div>
            )}
          </div>
        </div>

        <section className="canvas">
          {view === "Board" && bannerSprint?.status === "planned" && (
            <div className="board-readonly-notice">
              <Lock size={14} /> {bannerSprint.name} hasn't started yet — the board is read-only until it starts.
            </div>
          )}
          {view === "Board" && (
            <BoardView
              boardColumns={activeProject.boardConfig}
              visibleIssues={visibleIssues}
              allIssues={issues}
              hasActiveFilters={Boolean(query || aiOnly || filterType || filterPriority || filterPerson !== "All teammates")}
              boardLayout={boardLayout}
              compactView={compactView}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={(id) =>
                setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
              }
              onClearSelection={() => setSelectedIds([])}
              onBulkMove={(status) => {
                selectedIds.forEach((id) => store.moveIssue(activeProject.id, id, { status }));
                store.setNotice(`Moved ${selectedIds.length} issues to ${status}`);
                setSelectedIds([]);
              }}
              onOpenNewIssue={() => setNewIssueOpen(true)}
              onOpenIssue={setActiveIssueId}
              onVoteIssue={(id) => {
                const current = issues.find((item) => item.id === id);
                if (current) store.updateIssue(activeProject.id, id, { votes: current.votes + 1 });
              }}
              onMoveIssue={(draggedId, changes, targetId, noticeText, position) =>
                store.moveIssue(activeProject.id, draggedId, changes, targetId, noticeText, position)
              }
              onCreateSubtask={(parentIssue, title) =>
                store.addSubtask(activeProject, parentIssue, {
                  title,
                  status: activeProject.boardConfig[0] ?? "To Do",
                })
              }
              onToggleSubtaskDone={(subtask) => {
                const isDone = subtask.status === "Done";
                store.updateIssue(activeProject.id, subtask.id, {
                  status: isDone ? activeProject.boardConfig[0] ?? "To Do" : "Done",
                });
              }}
            />
          )}
          {view === "Backlog & Sprints" && (
            <SprintView
              issues={issues}
              onOpen={setActiveIssueId}
              onCreate={() => setNewIssueOpen(true)}
              onMoveIssue={(draggedId, changes, targetId, noticeText, position) =>
                store.moveIssue(activeProject.id, draggedId, changes, targetId, noticeText, position)
              }
            />
          )}
          {view === "Delivery Pipeline" && (
            <PipelineView
              issues={issues}
              onOpen={setActiveIssueId}
              onMoveStage={(draggedId, stage, targetId, position) => {
                const nextStatus =
                  stage === "Testing (UAT)"
                    ? "Testing (UAT)"
                    : stage === "Production (Released)"
                      ? "Done"
                      : stage === "Staging / QA"
                        ? "In Review"
                        : "In Progress";
                store.moveIssue(
                  activeProject.id,
                  draggedId,
                  { env: stage, status: nextStatus, ai: "Alex Morgan" },
                  targetId,
                  `Moved to ${stage}`,
                  position,
                );
              }}
              onPromote={(issue) => {
                const currentIndex = pipelineColumns.indexOf(issue.env);
                const next = pipelineColumns[Math.min(Math.max(currentIndex, 0) + 1, pipelineColumns.length - 1)] ?? pipelineColumns[0] ?? "Development";
                store.updateIssue(activeProject.id, issue.id, {
                  env: next,
                  status: next === "Testing (UAT)" ? "Testing (UAT)" : next === "Production (Released)" ? "Done" : "In Review",
                  ai: "Alex Morgan",
                });
                store.setNotice(`Moved ${issue.key} to ${next}`);
              }}
            />
          )}
          {view === "Project Brief" && <BriefView onCopy={store.copyText} />}
        </section>
      </main>

      {activeIssue && (
        <IssueDrawer
          issue={activeIssue}
          projectName={activeProject.name}
          projectColumns={activeProject.boardConfig}
          allIssues={issues}
          sprints={sprints}
          onClose={() => setActiveIssueId(null)}
          onChange={(changes) => store.updateIssue(activeProject.id, activeIssue.id, changes)}
          onDelete={() => {
            store.deleteIssue(activeProject.id, activeIssue.id, activeIssue.key);
            setActiveIssueId(null);
          }}
          onCopy={store.copyText}
          onOpenIssue={(targetId) => setActiveIssueId(targetId)}
          onCreateSubtask={(data) => store.addSubtask(activeProject, activeIssue, data)}
          onUpdateSubtask={(subId, changes) => store.updateIssue(activeProject.id, subId, changes)}
          onDeleteSubtask={(subId, key) => store.deleteIssue(activeProject.id, subId, key)}
        />
      )}
      {newIssueOpen && (
        <CreateIssueModal
          projectName={activeProject.name}
          projectKey={activeProject.key}
          columns={activeProject.boardConfig}
          sprints={sprints}
          onClose={() => setNewIssueOpen(false)}
          onCreate={(form) => {
            const created = store.addIssue(activeProject, form);
            if (created) {
              setNewIssueOpen(false);
              setActiveIssueId(created.id);
            }
          }}
        />
      )}
      {sprintsOpen && (
        <SprintsModal
          projectKey={activeProject.key}
          sprints={sprints}
          onClose={() => setSprintsOpen(false)}
          onCreateSprint={(sprint) => store.createSprint(activeProject.id, sprint)}
          onOpenSprintIssues={() => {
            setSprintsOpen(false);
            setView("Backlog & Sprints");
          }}
          onRequestStartSprint={(sprint) => {
            setSprintsOpen(false);
            setStartSprintTarget(sprint);
          }}
        />
      )}
      {startSprintTarget && (
        <StartSprintModal
          projectKey={activeProject.key}
          sprint={startSprintTarget}
          sprintIssues={issues.filter((item) => item.sprint === startSprintTarget.name)}
          onClose={() => setStartSprintTarget(null)}
          onConfirmStart={(updates) => {
            store.updateSprints(activeProject.id, (current) =>
              current.map((s) =>
                s.id === startSprintTarget.id
                  ? { ...s, ...updates, status: "active" }
                  : s.status === "active"
                    ? { ...s, status: "closed" }
                    : s,
              ),
            );
            store.setNotice(`${startSprintTarget.code} sprint started`);
            setStartSprintTarget(null);
          }}
        />
      )}
      {createProjectOpen && (
        <CreateProjectModal
          projects={store.projects}
          onClose={() => setCreateProjectOpen(false)}
          onCreate={(name, key, template) => {
            const created = store.createProject(name, key, template);
            setCreateProjectOpen(false);
            openProjectRoute(created);
          }}
        />
      )}
      {globalSearchOpen && (
        <GlobalSearchModal
          projects={store.projects}
          issues={issues}
          onClose={() => setGlobalSearchOpen(false)}
          onOpenProject={(project) => {
            openProjectRoute(project);
            setGlobalSearchOpen(false);
          }}
          onOpenIssue={(id) => {
            setActiveIssueId(id);
            setGlobalSearchOpen(false);
          }}
          onNavigate={(target) => {
            if (target === "Board" || target === "Backlog & Sprints" || target === "Delivery Pipeline" || target === "Project Brief") {
              setView(target);
            } else {
              goHomeView(target);
            }
            setGlobalSearchOpen(false);
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
