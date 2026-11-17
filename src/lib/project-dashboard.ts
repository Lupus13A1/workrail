export type ProjectTemplate = "Scrum" | "Kanban" | "Delivery Pipeline";

export const projectTemplates: Record<
  ProjectTemplate,
  { description: string; features: string[]; columns: string[] }
> = {
  Scrum: {
    description: "Sprints, backlog planning, burndown — for teams working in cycles.",
    features: ["Sprint planning", "Product backlog", "Burndown tracking"],
    columns: ["Backlog", "To Do", "In Progress", "In Review", "Done"],
  },
  Kanban: {
    description: "Continuous flow with a Backlog lane and work-in-progress limits.",
    features: ["Continuous workflow", "Backlog management", "WIP limits"],
    columns: ["Backlog", "To Do", "In Progress", "In Review", "Testing (UAT)", "Done"],
  },
  "Delivery Pipeline": {
    description: "Move development through testing and releases across environments.",
    features: ["DEV / SIT / UAT", "Passed / failed status", "Release management"],
    columns: [
      "Development",
      "Testing · DEV",
      "Passed · DEV",
      "Testing · SIT",
      "Passed · SIT",
      "Testing · UAT",
      "Passed · UAT",
      "Released",
    ],
  },
};

export type Project = {
  id: string;
  name: string;
  key: string;
  template: ProjectTemplate;
  boardConfig: string[];
  role: "Project admin" | "Member";
  openIssues: number;
  assignedIssues: number;
  sprintStatus?: string;
  lastUpdated: string;
  updatedAt: number;
  favorite: boolean;
  color: "symbol-green" | "symbol-coral" | "symbol-blue";
  sample?: boolean;
};

export function suggestProjectKey(name: string): string {
  const words = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";
  if (words.length === 1) return (words[0] ?? "PROJ").slice(0, 3);
  return words.map((word) => word[0] ?? "").join("");
}

export function isProjectKeyValid(key: string): boolean {
  return /^[A-Z0-9]+$/.test(key);
}

export function isProjectKeyUnique(key: string, projects: Project[], excludeId?: string): boolean {
  const normalizedKey = key.toUpperCase();
  return !projects.some(
    (project) => project.id !== excludeId && project.key.toUpperCase() === normalizedKey,
  );
}

export function getBoardConfig(template: ProjectTemplate): string[] {
  return [...projectTemplates[template].columns];
}

export function getNextIssueNumber(keys: string[]): number {
  return Math.max(0, ...keys.map((key) => Number(key.split("-").at(-1)) || 0)) + 1;
}