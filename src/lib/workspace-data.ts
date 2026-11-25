import { getBoardConfig, type Project } from "@/lib/project-dashboard";

export type IssueType = "Epic" | "Feature" | "Task" | "Subtask" | "Bug";
export type IssuePriority = "Highest" | "High" | "Medium" | "Low" | "Lowest";

export type SprintItem = {
  id: string;
  code: string;
  name: string;
  goal: string;
  start: string;
  end: string;
  status: "planned" | "active" | "closed";
};

export type Issue = {
  id: string;
  key: string;
  title: string;
  status: string;
  type: IssueType;
  priority: IssuePriority;
  assignee: string;
  initials: string;
  color: string;
  comments: number;
  attachments: number;
  votes: number;
  tags: string[];
  ai?: string;
  description: string;
  env: string;
  release: string;
  sprint?: string;
  points?: string;
  parent?: string;
};

export type WorkspaceView =
  | "Board"
  | "Backlog & Sprints"
  | "Delivery Pipeline"
  | "Project Brief"
  | "Manager Insights"
  | "MCP & AI Integration"
  | "Users & Members";

export const columns = ["To Do", "In Progress", "In Review", "Testing (UAT)", "Done"];

export const pipelineColumns = [
  "Development",
  "Staging / QA",
  "Testing (UAT)",
  "Production (Released)",
];

export const people = ["Alex Morgan", "Maya Chen", "Sam Rivera", "Nat Srisai"];

export const peopleAvatars: Record<string, [string, string]> = {
  "Alex Morgan": ["AM", "avatar-mint"],
  "Maya Chen": ["MC", "avatar-coral"],
  "Sam Rivera": ["SR", "avatar-lilac"],
  "Nat Srisai": ["NS", "avatar-sky"],
};

export const defaultProject: Project = {
  id: "app",
  name: "Storefront refresh",
  key: "APP",
  template: "Kanban",
  boardConfig: getBoardConfig("Kanban"),
  role: "Project admin",
  openIssues: 7,
  assignedIssues: 3,
  lastUpdated: "Updated 12 min ago",
  updatedAt: 202611161200,
  favorite: true,
  color: "symbol-green",
  sample: true,
};

export const seedProjects: Project[] = [
  defaultProject,
  {
    id: "client",
    name: "Client portal",
    key: "CLT",
    template: "Scrum",
    boardConfig: getBoardConfig("Scrum"),
    role: "Member",
    openIssues: 12,
    assignedIssues: 4,
    sprintStatus: "Sprint 08 · 6 days left",
    lastUpdated: "Updated 1 hour ago",
    updatedAt: 202611161100,
    favorite: false,
    color: "symbol-coral",
    sample: true,
  },
  {
    id: "mobile",
    name: "Mobile app v2",
    key: "MOB",
    template: "Scrum",
    boardConfig: getBoardConfig("Scrum"),
    role: "Project admin",
    openIssues: 18,
    assignedIssues: 6,
    sprintStatus: "Sprint 14 · 2 days left",
    lastUpdated: "Updated yesterday",
    updatedAt: 202611151000,
    favorite: true,
    color: "symbol-blue",
    sample: true,
  },
  {
    id: "marketing",
    name: "Marketing site",
    key: "MKT",
    template: "Delivery Pipeline",
    boardConfig: getBoardConfig("Delivery Pipeline"),
    role: "Member",
    openIssues: 9,
    assignedIssues: 2,
    lastUpdated: "Updated Oct 29",
    updatedAt: 202610291200,
    favorite: false,
    color: "symbol-green",
    sample: true,
  },
  {
    id: "onboarding",
    name: "Customer onboarding",
    key: "ONB",
    template: "Kanban",
    boardConfig: getBoardConfig("Kanban"),
    role: "Member",
    openIssues: 5,
    assignedIssues: 1,
    lastUpdated: "Updated Oct 27",
    updatedAt: 202610271200,
    favorite: false,
    color: "symbol-coral",
    sample: true,
  },
  {
    id: "operations",
    name: "Operations hub",
    key: "OPS",
    template: "Delivery Pipeline",
    boardConfig: getBoardConfig("Delivery Pipeline"),
    role: "Project admin",
    openIssues: 14,
    assignedIssues: 3,
    lastUpdated: "Updated Oct 24",
    updatedAt: 202610241200,
    favorite: false,
    color: "symbol-blue",
    sample: true,
  },
];

export const seedIssues: Issue[] = [
  {
    id: "auth",
    key: "APP-104",
    title: "Add passkey authentication for returning customers",
    status: "In Progress",
    type: "Feature",
    priority: "High",
    assignee: "Alex Morgan",
    initials: "AM",
    color: "avatar-mint",
    comments: 8,
    attachments: 2,
    votes: 12,
    tags: ["Identity", "Web app"],
    description:
      "Make signing in effortless and more secure for returning customers.\n\n## Acceptance criteria\n- [ ] Support platform passkeys\n- [ ] Keep email as a fallback\n- [ ] Add recovery guidance",
    env: "Development",
    release: "v1.4.0",
  },
  {
    id: "checkout",
    key: "APP-108",
    title: "Redesign checkout confirmation and receipts",
    status: "To Do",
    type: "Feature",
    priority: "Medium",
    assignee: "Maya Chen",
    initials: "MC",
    color: "avatar-coral",
    comments: 3,
    attachments: 1,
    votes: 7,
    tags: ["Payments", "UX"],
    description: "Bring the new checkout experience through to a clear, reassuring confirmation.",
    env: "Development",
    release: "v1.4.0",
  },
  {
    id: "mobile",
    key: "APP-112",
    title: "Resolve image cropping on smaller mobile screens",
    status: "To Do",
    type: "Bug",
    priority: "Low",
    assignee: "Sam Rivera",
    initials: "SR",
    color: "avatar-lilac",
    comments: 2,
    attachments: 0,
    votes: 3,
    tags: ["Mobile"],
    description: "Some product images crop unexpectedly on narrow mobile viewports.",
    env: "Development",
    release: "v1.5.0",
  },
  {
    id: "email",
    key: "APP-119",
    title: "Send transactional updates to customers",
    status: "In Progress",
    type: "Task",
    priority: "Medium",
    assignee: "Nat Srisai",
    initials: "NS",
    color: "avatar-sky",
    comments: 5,
    attachments: 0,
    votes: 5,
    tags: ["Email"],
    description: "Prepare transactional email templates for customer audiences.",
    env: "Staging / QA",
    release: "v1.4.0",
    ai: "Claude Code",
  },
  {
    id: "audit-log",
    key: "APP-121",
    title: "Confirm role handoff rules across active sprints",
    status: "In Review",
    type: "Task",
    priority: "High",
    assignee: "Alex Morgan",
    initials: "AM",
    color: "avatar-mint",
    comments: 4,
    attachments: 1,
    votes: 8,
    tags: ["Workflow"],
    description: "Confirm the workspace handoff checklist matches active team roles.",
    env: "Staging / QA",
    release: "v1.4.0",
    ai: "Cursor",
  },
  {
    id: "qa",
    key: "APP-126",
    title: "Hand off customer profile refresh for QA review",
    status: "In Review",
    type: "Feature",
    priority: "Medium",
    assignee: "Nat Srisai",
    initials: "NS",
    color: "avatar-sky",
    comments: 6,
    attachments: 2,
    votes: 4,
    tags: ["Profiles", "API"],
    description:
      "The refresh endpoint is ready for QA verification.\n\n## QA checklist\n- [ ] Verify empty state\n- [ ] Check refresh feedback",
    env: "Staging / QA",
    release: "v1.4.0",
    ai: "Claude Code",
  },
  {
    id: "search",
    key: "APP-097",
    title: "Search results now include project documentation",
    status: "Testing (UAT)",
    type: "Feature",
    priority: "Low",
    assignee: "Maya Chen",
    initials: "MC",
    color: "avatar-coral",
    comments: 2,
    attachments: 0,
    votes: 6,
    tags: ["Search"],
    description: "Include project brief documents alongside issue search results.",
    env: "Testing (UAT)",
    release: "v1.3.2",
    ai: "Claude Code",
  },
  {
    id: "deploy",
    key: "APP-089",
    title: "Improve deployment history and release notes",
    status: "Done",
    type: "Task",
    priority: "Low",
    assignee: "Sam Rivera",
    initials: "SR",
    color: "avatar-lilac",
    comments: 1,
    attachments: 1,
    votes: 2,
    tags: ["Release"],
    description: "Release notes now clearly show recent deployments and contributors.",
    env: "Production (Released)",
    release: "v1.3.1",
  },
  {
    id: "export",
    key: "APP-091",
    title: "Add a downloadable CSV to the insights report",
    status: "Done",
    type: "Feature",
    priority: "Medium",
    assignee: "Alex Morgan",
    initials: "AM",
    color: "avatar-mint",
    comments: 3,
    attachments: 0,
    votes: 2,
    tags: ["Insights"],
    description: "Give managers a simple way to export a weekly throughput snapshot.",
    env: "Production (Released)",
    release: "v1.3.0",
    ai: "Cursor",
  },
];

export function statusClass(status: string): string {
  if (status === "In Progress" || status === "Development") return "dot-blue";
  if (status === "In Review" || status === "Staging / QA") return "dot-amber";
  if (status === "Testing (UAT)") return "dot-violet";
  if (status === "Done" || status.includes("Production")) return "dot-green";
  return "dot-gray";
}

export function getProjectSampleIssues(project: Project): Issue[] {
  const first = project.boardConfig[0] ?? "To Do";
  const second = project.boardConfig[1] ?? first;
  const third = project.boardConfig[2] ?? second;
  return [
    {
      id: `${project.id}-1`,
      key: `${project.key}-101`,
      title: `Set up ${project.name.toLowerCase()} delivery workflow`,
      status: second,
      type: "Feature",
      priority: "High",
      assignee: "Alex Morgan",
      initials: "AM",
      color: "avatar-mint",
      comments: 2,
      attachments: 1,
      votes: 4,
      tags: [project.template],
      ai: "Claude Code",
      description: `Initial ${project.template} workflow setup for ${project.name}.`,
      env: "Development",
      release: "v1.0.0",
    },
    {
      id: `${project.id}-2`,
      key: `${project.key}-102`,
      title: "Review acceptance checklist with QA",
      status: third,
      type: "Task",
      priority: "Medium",
      assignee: "Maya Chen",
      initials: "MC",
      color: "avatar-coral",
      comments: 1,
      attachments: 0,
      votes: 2,
      tags: ["QA"],
      description: "Verify hand-off rules and status definitions in the project brief.",
      env: "Staging / QA",
      release: "v1.0.0",
    },
  ];
}
