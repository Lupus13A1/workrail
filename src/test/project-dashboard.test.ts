import { describe, expect, it } from "vitest";

import {
  getBoardConfig,
  getNextIssueNumber,
  isProjectKeyUnique,
  isProjectKeyValid,
  projectTemplates,
  suggestProjectKey,
  type Project,
} from "@/lib/project-dashboard";

const existingProject = {
  id: "storefront",
  name: "Storefront refresh",
  key: "APP",
  template: "Kanban",
  boardConfig: getBoardConfig("Kanban"),
  role: "Project admin",
  openIssues: 7,
  assignedIssues: 3,
  lastUpdated: "Today",
  updatedAt: 202611161200,
  favorite: false,
  color: "symbol-green",
} satisfies Project;

describe("project dashboard rules", () => {
  it("suggests a key from the initials of a project name", () => {
    expect(suggestProjectKey("Customer Support Platform")).toBe("CSP");
    expect(suggestProjectKey("")).toBe("");
  });

  it("accepts only uppercase English letters and numbers in project keys", () => {
    expect(isProjectKeyValid("CSP204")).toBe(true);
    expect(isProjectKeyValid("csp-204")).toBe(false);
  });

  it("rejects a key already used in the workspace", () => {
    expect(isProjectKeyUnique("APP", [existingProject])).toBe(false);
    expect(isProjectKeyUnique("NEW", [existingProject])).toBe(true);
  });

  it("keeps issue-number sequences independent across project workspaces", () => {
    expect(getNextIssueNumber(["APP-104", "APP-108"])).toBe(109);
    expect(getNextIssueNumber([])).toBe(1);
  });

  it("keeps template board configurations separate and initializes the selected workflow", () => {
    const scrumBoard = getBoardConfig("Scrum");
    const kanbanBoard = getBoardConfig("Kanban");
    const pipelineBoard = getBoardConfig("Delivery Pipeline");
    expect(scrumBoard).toEqual(projectTemplates.Scrum.columns);
    expect(kanbanBoard).toEqual(projectTemplates.Kanban.columns);
    expect(pipelineBoard).toEqual(projectTemplates["Delivery Pipeline"].columns);
    expect(scrumBoard).not.toBe(kanbanBoard);
    expect(pipelineBoard).not.toEqual(kanbanBoard);
    scrumBoard.push("Custom column");
    expect(getBoardConfig("Scrum")).not.toContain("Custom column");
  });
});