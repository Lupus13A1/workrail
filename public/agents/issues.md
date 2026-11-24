# Writing issues, rich text, attachments, and replies

## What information does an issue have?

- Type: epic, task, subtask (requires a parent), and bug
- 5 priority levels: Highest, High, Medium (default), Low, and Lowest — you can filter and sort by priority
- status, assignee, reporter, story points, sprint, labels, and parent
- Who created it and when it was last updated — recorded automatically by the system
- Issue links: blocks / blocked by, relates, duplicates, and clones — the system writes the inverse link on the other issue automatically
- Order on the board and in the backlog

Fields save immediately when changed, just like Jira: select a status, assignee, priority, or sprint and it saves right away, while typed fields like points and parent save when you leave the input. Each change creates 1 new version and is recorded in the issue’s history.

Only the issue description requires clicking Save — an in-progress draft is never saved along with other field changes. Checking items in a checklist inside the description saves immediately.

Recently saved fields briefly display “Saved” next to the label. The new-issue form always defaults to Task and explains what each issue type is used for.

## How do you view sub-tasks and the parent issue?

Every issue’s detail view has a “Sub-tasks” section showing the total count, an x/y done progress bar, and each child issue with its key, title, status, and assignee. Click a key to open the child issue; the list updates live when someone changes a status or adds a child.

The parent issue’s key at the top of the detail drawer is a link — click it to open the parent and navigate up the hierarchy in a single click. The parent–child relationship is not an issue link (blocks, relates, etc.); it is set via the Parent field.

AI agents can list the children of a parent issue using search_issues parent=KEY.

## How do you write descriptions and comments?

Use the WYSIWYG rich-text editor: headings, bold, italic, strikethrough, inline code, bulleted/numbered lists, checklists, tables, links, blockquotes, code blocks (including Mermaid), and horizontal rules. Paste, drag, or insert images and see them inline immediately while they upload.

Everything is saved as Markdown in .md files — any parts you did not edit are written back character-for-character. If you prefer to edit Markdown directly, switch to the Markdown tab, or view the entire .md file.

Highlights and text colors (use sparingly — bold, headings, and lists should remain primary): select text in a description, comment, or project document and click the A button in the toolbar (text color / highlighter). Five colors are available: yellow, green, red, blue, and purple. Suggested conventions (optional, not enforced): yellow = note/attention, green = passed or expected result, red = needs fix, bug, or actual result, blue = info or remark, purple = question or needs confirmation.

In Markdown, these are stored as paired opening/closing HTML tags such as <mark>text</mark> (yellow highlight), <mark data-color="green">text</mark>, and <span data-color="red">text</span> (text color) — any other HTML is rendered as plain text, and opening and closing tags must be within the same paragraph. AI agents can write the exact same markup.

## How are attachments managed?

Attach files using the attachment button or by dragging and dropping. Files upload directly to object storage. Each issue’s attachment table shows a thumbnail, filename, date added, size, and uploader (with a badge when uploaded via MCP). You can filter by All, Images, Documents, Videos, and Other, as well as preview and download files.

Delete an attachment using the trash button next to the download button: uploaders can delete their own files, company admins can delete any file, and read-only viewers cannot delete files. The system asks for confirmation first and then deletes the file permanently (cannot be undone). Links to that file in descriptions and comments will display as “File deleted”. Through MCP (delete_attachment), an AI agent can only delete files uploaded by its own token.

File storage is pooled across the company, with 10 GB included for free. You can check storage usage in the Admin console.

## How do you reply to comments?

Click Reply under any comment to open a composer inside that thread. Replies are grouped under the top-level comment (1 level deep). When replying to a reply, the system indicates who you are replying to along with a short quote. Threads with more than 3 replies can be collapsed, and every comment has its own direct link.

Authors can edit their own comments. Edited comments show “(edited)” — click it to view the edit history, and editing does not re-send email notifications. The author or a project admin can delete a comment; the system leaves a “This comment was deleted” placeholder so replies remain intact, while the original text is preserved in the issue’s history.

## How do you watch an issue?

Click the Watch button in the issue detail view to receive email notifications when the issue’s status changes or a new comment is posted. Click again to unwatch. The number next to the button shows the watcher count — click it to see the list of watchers.

- Anyone who can read the issue can watch it, including read-only viewers.
- Posting a comment automatically subscribes you as a watcher on that issue, just like Jira.
- Watching is personal to you: it does not modify the issue, increment its version, or add an entry to issue history.
- Users who no longer have access to the project stop receiving emails, and deleting an issue removes its watcher list.
- AI agents can watch or unwatch on behalf of their token’s user via MCP (list_watchers, watch_issue, unwatch_issue).

The first time you comment and start watching automatically, the system lets you know that you are now watching the issue and what emails you will receive.

## How do you @mention people in comments?

Type @ in a comment or issue description and pick someone from the project member list (works in both rich-text mode and the Markdown tab). Their name appears as a chip and the mentioned person receives an email. In an issue description, emails are only sent to people newly added when creating or editing the description — previously mentioned people are not emailed again.

In Markdown, mentions are stored as links in the form [@Name](mention:usr_…) — the user ID determines who receives the email, while the name is for display only. AI agents can write the same syntax in add_comment. Emails are only sent to users who have access to the project, up to 50 recipients per message.

> Part of the Workrail guide for AI agents — start at the index: https://workrail.netlify.app/agents.md
