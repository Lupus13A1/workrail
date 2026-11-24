# Backlog and sprint planning
## What can you do on the backlog planning page?

Scrum projects have a Board tab and a Backlog tab. The Backlog tab shows active and planned sprints as collapsible groups with their date ranges, issue counts, and story points, followed by the backlog.

- Drag issues between sprints and the backlog, or reorder within a group
- Select multiple items and move them together
- Click Create issue at the bottom of each group to add directly to that sprint
- Create, edit, start, and complete sprints from this page
- Use the ⋯ menu to move rows; on mobile, press and hold to drag
- Completed sprints live at the bottom of the page: open any completed sprint to see all its issues along with the completed issue and point counts — the View issues button in the Sprints dialog brings you here
- A sprint that has passed its end date without Complete sprint being clicked displays a red “Overdue by n days” badge on the Board, Backlog page, and Sprints dialog until it is completed

## How do you create and start a sprint?

A new sprint defaults its start date to the day after the latest sprint ends, with the same duration. Dates can always be edited, and date ranges are allowed to overlap.

When creating a sprint, the name field is pre-filled with a real default name such as “Sprint 11” (if cleared, the system prompts for a name). Clicking “Create sprint” shows a review screen first — displaying the name, start → end dates (with day count), and goal. Click “Confirm create” to create that single sprint, or “Cancel” to create nothing.

Every Start sprint button opens the Start sprint dialog: edit the name, duration (1–4 weeks or custom), start date, end date, and goal, and review the issue count, total points, and any warnings (no issues, no points, dates overlapping with an active sprint). If the planned start date is in the past, it automatically shifts to today while preserving the sprint duration. Click confirm to jump straight to that sprint’s board.

When no sprint is active, the board shows the next planned sprint in a locked state (issues can be opened and read, but cannot be dragged across columns) with a Start sprint button for project admins. The same rule applies to AI agents: an agent can only change the status of issues in a sprint that a human has already started, and cannot start a sprint itself, though it can still plan the backlog. Humans can still change an issue’s status from the issue detail drawer — for example, closing an old backlog item as Done.

## Can you delete an unstarted sprint?

Yes. Any unstarted (planned) sprint can be deleted from the Sprints dialog using the trash button next to Edit and Start. This is available to anyone who can manage sprints in that project (project admins, or all members when “Who can manage sprints” is set to All members). The confirmation dialog shows the sprint name, dates, and number of issues inside it.

- Issues in the deleted sprint are moved back to the Backlog — no issues are deleted.
- Other sprints and their dates remain unchanged.
- The deletion (who, when, and which issues were returned to the backlog) is recorded in the company Audit log.
- Active or closed sprints cannot be deleted.
- AI agents cannot delete sprints (there is no MCP tool for deleting a sprint); a human performs this action in Workrail, just like starting a sprint.

## Can you run multiple sprints at the same time?

Yes, if a project admin enables the Parallel sprints toggle in project settings. It is off by default: you can only start a new sprint when no other sprint is currently active, and the Start sprint dialog explains why if starting is blocked.

- The board includes a sprint switcher: All active sprints (default) or one specific sprint at a time.
- When viewing all active sprints together, cards show a sprint badge, and dragging an issue from the backlog into a board column asks which active sprint it should join.
- Burndown and story points reflect the selected sprint.
- An issue can belong to only one sprint at a time, and sprints are completed one by one.
- If you turn off Parallel sprints while multiple sprints are active, those sprints can continue running, but no new sprint can be started until only one remains.

## Where do unfinished issues go when a sprint is completed?

When completing a sprint, you can choose where to move unfinished issues: to the backlog, a new sprint (with dates continuing after the latest sprint), or an existing planned sprint — moving them into another currently active sprint is not allowed.

If every issue in the sprint is already Done, the Complete sprint dialog does not ask where to move remaining items. Sprints past their end date that haven’t been completed show a red “Overdue by n days” badge until Complete sprint is clicked.

## Who can manage sprints?

- Project admins: Create, edit name/dates/goal, start, and complete sprints, as well as toggle Parallel sprints (all project settings, including parallel sprints, are always admin-only).
- Members: If an admin sets “Who can manage sprints” to “All members”, regular members can also create, start, complete, and edit sprints (read-only viewers never can).
- Members: Can always move issues into or out of sprints and reorder them.
- Read-only viewers: View only.
- AI agents: Can create and plan sprints according to the connected user’s role, but can never start a sprint regardless of project settings (they can complete a sprint if the connected user’s role allows it) — a human must click Start sprint. Deleting an unstarted sprint must also be done by a human in Workrail (Sprints → Delete; there is no MCP delete tool, and issues in the sprint return to the Backlog). get_project returns sprint_control (admins or members) so the agent can tell the user who is allowed to start the sprint.

## How are sprints stored, and how is burndown calculated?

Each sprint is a single .md file in the sprints/ folder with a state of planned, active, or closed. Burndown is calculated from the daily story point snapshots of issues in the sprint and can be viewed in the web app or fetched per sprint via MCP (get_burndown).

```
---
id: S-12
name: Sprint 12
state: active             # planned | active | closed
start: 2026-09-15
end: 2026-09-29
goal: Ship login and session for QA
---
```

> Part of the Workrail guide for AI agents — start at the index: https://workrail.netlify.app/agents.md
