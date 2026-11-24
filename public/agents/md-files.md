# .md files

## Why store work as .md files?

.md files are readable by both humans and AI, editable with standard tools, and keep a complete history of every change. The database is merely an index for search and board rendering, which can always be rebuilt from the files.

Non-content records, such as user accounts and access permissions, are stored in the database as usual.

## How are the files organized?

```
/p/{project_key}/
  project.md                       # config, board type, statuses, workflow
  docs/brief/{slug}.md             # project docs: brief,
  docs/notes/{slug}.md             #   working notes
  docs/handoffs/H-{n}.md           #   and handoffs
  sprints/S-{n}.md
  issues/{KEY}-{n}.md              # 1 issue = 1 file
  issues/{KEY}-{n}/comments/{seq:04d}.md
```

## What does an issue file look like?

Frontmatter stores the core issue fields for both the web app and MCP, while the body is Markdown that you can write through the rich-text editor or edit directly (viewable in Raw `.md` mode inside the issue detail view).

```
---
id: APP-101
type: task                # epic | feature | task | subtask | bug
priority: medium          # highest | high | medium | low | lowest (default medium)
status: In Progress       # must be one of project board statuses
assignee: Alex Morgan     # assignee name or null
points: 3                 # nullable
sprint: S-12              # nullable (Kanban and pipeline = null)
parent: APP-90            # nullable; a subtask needs a parent
labels: ["frontend"]
links: ["APP-77", "APP-80"]
updated_by_agent: "Claude Code" # agent name or null
version: 14               # optimistic lock, +1 on every write
---

# Login page

Written in the rich-text editor, saved as Markdown:
mermaid, code, tables, checklists and images.
```

## How are comments stored?

1 comment = 1 file. If written by an AI agent, the agent field records the token used. Replies store reply_to (the top-level comment of the thread) and in_reply_to (the specific comment being answered). Editing increments version and sets updated_at / updated_by. Deleting keeps the file, clears its body, and sets deleted: true so sequence numbers and replies remain intact. User mentions are written as [@Name](mention:usr_…) links in the body.

```
---
seq: 5
author: usr_01H...
agent: tok_01H...         # null when a person wrote it; set when it came through MCP
created_at: 2026-09-23T10:12:00+07:00
updated_at: 2026-09-23T10:20:00+07:00  # set when the author edits it
updated_by: usr_01H...
version: 2                # +1 on every edit; missing = 1
reply_to: 3               # the thread's top-level comment; null on a top-level comment
in_reply_to: 4            # the exact comment answered
attachments:
  - attachments/APP-101/8f2a-spec.png
---
Fixed in the attached build — [@Somchai](mention:usr_01H...) please re-test.
```

## How do versions and history work?

- Every write must send the version of the file that was read (optimistic locking).
- Every write creates 1 commit recording who made the change, via which agent token, and which file changed — if it came from an AI agent, it also records which AI client, whether connected via OAuth or token, which MCP tool was called, and the request ID.
- View history and diffs through MCP (get_history, diff). In the web app, issues modified by an agent carry a badge, and the Agents page lists recent commits from your agents.

> Part of the Workrail guide for AI agents — start at the index: https://workrail.netlify.app/agents.md

Last updated: 2026-11-23
