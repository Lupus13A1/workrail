# Project documents
## What project documents are available?

Each project has 3 types of documents, and each type can contain multiple files so new team members and AI agents understand what the project is for and where work stands without having to ask repeatedly.

Type | What it is used for
--- | ---
Brief | Why this project exists, requirements, business goals, and technical architecture
Working notes | Progress, current status, conventions, and lessons learned — updated by people or agents whenever useful, optional
Handoff | Handing work off to a team or the whole project — relevant people are notified and acknowledge receipt
Company brief | Company-wide: rules, how the company uses Workrail, or company overview — shown read-only in every project

## Where do you open and write documents?

Click the gear icon on the board: admins get Project settings with a Docs tab, while members and read-only viewers get the Project docs page. Click New document or New handoff, or drag and drop a .md / .txt file, then write using the same editor as issues. You can include a “What changed” summary so it appears in the version history.

- Anyone in the project can edit working notes and handoffs. The brief (the rules AI agents follow) can only be edited by project admins, and the company brief only by company admins. Read-only viewers can only read. Every document displays who last edited it and when.
- Accepts .md and .txt files up to 1 MB per document, counting toward company storage.
- If someone saves before you, your typed text is preserved and you can choose to view the diff, use theirs, or save yours as a new version.
- “Copy context for AI” generates a single Markdown string combining the company brief, project brief, working notes, and open handoffs, ready to paste into any AI chat.

## Can you view history and restore documents?

Yes. Every save creates a new version recording who made the edit (and indicating if it came from an AI agent). In the version history, you can view past versions, diff against the current version, or click Restore, which creates a new version from the older one without erasing history. Deleted documents can also be restored from history (enable “Show deleted documents”).

## How do handoffs work?

A handoff is a team-level or project-wide work transition: pick the receiving team (if no team is selected, it goes to everyone in the project), attach related issues, and save. Members of that team receive a notification, see a “For you” badge and a dot on the gear icon, and click Acknowledge. The author is notified in return. The status moves from Open → Acknowledged → Closed (and can be reopened).

## What is the Company brief and who can edit it?

A company-level document in the Admin console under the Company brief tab, used to write company rules, how your organization uses Workrail, or a company overview. Every project displays it read-only in the Docs tab, and AI agents read it before starting work. Only company admins can edit it; all members can read it.

## How do AI agents use these documents?

The Company brief along with each project’s brief and working notes are where a team writes down how it works: what each status means, the workflow for each role (developer, QA, BA), team conventions, and handoff rules. Every AI agent reads these documents before starting work, so the team writes its rules once and Claude, ChatGPT, Codex, Cursor, or any other MCP client operates within the same agreed-upon framework — more accurately and without repeating instructions in every chat. Priority order: user’s direct instruction > project brief > company brief > Workrail defaults.

Through MCP (compatible with Claude, ChatGPT, Gemini, Copilot, Cursor, and other clients), an agent sees which documents to read first from get_project, or reads all of them in a single call with get_docs_context (or the project_context prompt), and can edit documents using the document tools, where every edit creates a new version recording the agent token and AI client used.

> Part of the Workrail guide for AI agents — start at the index: https://workrail.netlify.app/agents.md
