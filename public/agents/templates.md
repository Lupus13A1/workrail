# Workflow templates
## Why are there 3 board templates?

Workrail provides 3 board templates in the **Software delivery** category — **Scrum**, **Kanban**, and **Delivery Pipeline** — because each follows distinct workflow rules (iterative sprints, continuous flow with WIP limits, or environment-by-environment testing gates). When you create a project, the system preconfigures the default columns and views so you can start right away.

- On the **Create project** screen, pick from the 3 template cards and inspect the **Workflow preview** of the columns before creating.
- The system automatically suggests a Project key from the project name (2–10 uppercase alphanumeric characters, unique across projects) used to prefix issue keys such as `APP-1`, `APP-2`.
- Every project can switch its board view between **Columns** and **List**.

## What templates are available?

Template | Board | Default columns | Highlights & use case
--- | --- | --- | ---
Scrum | `scrum` | `Backlog` → `To Do` → `In Progress` → `In Review` → `Done` | For teams working in iterations: includes Sprint planning, Product backlog, and Story points / Burndown tracking
Kanban | `kanban` | `Backlog` → `To Do` → `In Progress` → `In Review` → `Testing (UAT)` → `Done` | For continuous flow work: start work from the Backlog column and manage WIP limits
Delivery Pipeline | `pipeline` | `Development` → `Testing · DEV` → `Passed · DEV` → `Testing · SIT` → `Passed · SIT` → `Testing · UAT` → `Passed · UAT` → `Released` | For tracking delivery across environments (`DEV` / `SIT` / `UAT`), pass/fail testing gates, and release management

## What issue fields are available in each project?

All templates share a standard set of issue fields:

Field | Description
--- | ---
`type` | Issue type: `Epic`, `Feature`, `Task`, `Subtask` (under a parent issue), and `Bug`
`priority` | 5 priority levels: `Highest`, `High`, `Medium` (default), `Low`, and `Lowest`
`status` | Status matching the columns of the project’s chosen template
`assignee` | Person responsible for the work (or `Unassigned`)
`sprint` | Iteration on a Scrum board (or in the Backlog)
`points` | Story points (number)
`parent` | Parent issue key (e.g., `APP-104`) for linking a Subtask
`tags` / `labels` | Category labels on the card
`env` and `release` | Current environment of the work (e.g., `Development`, `Staging / QA`, `Testing (UAT)`, `Production (Released)`) and Release version (e.g., `v1.4.0`)
`votes` | Vote count on the card (can be voted on directly from the card face or inside the issue detail view)

## What do AI agents see from a project and template?

- `get_project` returns project metadata (`key`, `name`, `template`, and the `boardConfig` column list).
- `get_docs_context` delivers the Project Brief, which defines the meaning of each status (Status definitions) and handoff rules (such as QA hand-off rules) for the agent to read before starting work.
- `create_issue`, `update_issue`, and `transition_issue` validate statuses against the columns of that project’s template.

> Part of the Workrail guide for AI agents — start at the index: https://workrail.netlify.app/agents.md

Last updated: 2026-11-23
