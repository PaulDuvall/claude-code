---
description: Generate stakeholder update emails from recently completed tasks in any supported issue tracker
---

Generate a stakeholder update email from recently completed tasks in any supported issue tracker.

## Arguments

`$ARGUMENTS` may contain some, all, or none of these values: `<source> <label_or_filter> <recipient_name> <recipient_email> <sender_name>`

For any values not provided in the arguments, prompt the user interactively.
Ask for all missing values in a single prompt, not one at a time.

1. **source** — Issue tracker to pull from (see auto-detection below)
2. **label_or_filter** — Label, project name, or filter for relevant tasks
3. **recipient_name** — First name for the greeting (e.g., "Rob")
4. **recipient_email** — Their email address (e.g., "rob@example.com")
5. **sender_name** — Your name for the sign-off (e.g., "Paul"). If not provided, try to infer from `git config user.name`; if that fails, ask the user.

## Steps

### 1. Auto-detect available sources

Check which issue trackers are available, in this order:

| Source | Detection |
|--------|-----------|
| **Beads** | Run `which bd` — available if found |
| **Linear** | Attempt a Linear MCP call (e.g., `list_teams`) — available if it succeeds |
| **GitHub Issues** | Run `which gh` — available if found |
| **Jira** | Run `which jira` — available if found |
| **Manual** | Always available as fallback |

If `source` was provided in arguments, use it directly (skip detection).

If `source` was NOT provided:
- If exactly one tracker is detected, use it automatically and tell the user which one
- If multiple are detected, list them and ask the user to pick
- If none are detected, use manual mode

### 2. Determine date range

Check for a last-sent timestamp file at `.stakeholder-updates/<label_or_filter>.last-sent` (relative to project root).

- If the file exists, read the ISO date from it. Use that as the "since" date.
- If the file does not exist, default to 7 days ago.

### 3. Query completed tasks

Use the appropriate method for the detected source:

**Beads:**
```bash
bd list --all --json --limit 0 -l "<label>" --closed-after "<since>"
```
Filter to `status: "closed"` entries.

**Linear:**
Use the Linear MCP `list_issues` tool to query issues that are completed/done in the relevant project or with the relevant label, updated since the "since" date. Filter to completed status states only.

**GitHub Issues:**
```bash
gh issue list --state closed --label "<label>" --json title,body,labels,closedAt,issueType --search "closed:>YYYY-MM-DD"
```

**Jira:**
```bash
jira issue list --query 'project = "<filter>" AND status = Done AND resolved >= "<since>"' --plain --columns key,summary,type,description
```

**Manual:**
Ask the user to provide completed items, one per line, in this format:
```
<category>: <title> -- <summary>
```
Where category is one of: bug, feature, task, improvement, milestone.

If a source query fails or returns an error, tell the user and fall back to manual mode.

If no completed tasks are found, tell the user:
```
No completed tasks matching "<label_or_filter>" since <since_date>. Nothing to send.
```
And stop.

### 4. Normalize tasks

Map each source's fields to a common shape:

```json
{ "title": "...", "summary": "...", "category": "bug|feature|task|improvement|milestone" }
```

Category mapping by source:

| Category | Beads | Linear | GitHub | Jira | Manual |
|----------|-------|--------|--------|------|--------|
| Bug Fixes | issue_type: bug | type/label: bug | label: bug | type: Bug | category: bug |
| New Features | issue_type: feature | type/label: feature | label: enhancement/feature | type: Story/Feature | category: feature |
| Improvements | issue_type: task/chore | type/label: task/improvement | label: task/chore | type: Task/Sub-task | category: task/improvement |
| Milestones | issue_type: epic | type/label: epic/milestone | label: milestone/epic | type: Epic | category: milestone |

For the summary field:
- **Beads**: Use `close_reason` if descriptive (not just "Completed"), else first sentence of `description`
- **Linear**: Use completion comment if available, else first sentence of description
- **GitHub**: Use closing comment or first sentence of body
- **Jira**: Use resolution description or first sentence of description
- **Manual**: Use the summary provided by the user

### 5. Group tasks by category

Group into these categories in this order:
1. **Bug Fixes**
2. **New Features**
3. **Improvements**
4. **Milestones**

Skip empty categories.

### 6. Get project name and production URL

**Project name:**
Try to infer from the repo name or package.json. If unclear, ask the user.

**Production URL:**
```bash
gh repo view --json homepageUrl -q '.homepageUrl'
```
If the result is non-empty, use it. If empty, ask the user for the URL.

### 7. Generate email text

Produce plain text (no markdown formatting, no bold markers, no asterisks):

```
Subject: <Project> Updates: <count> items delivered

Hi <name>,

Here's a summary of recent <Project> improvements based on your feedback:

<Category Name>

  1. <task title> -- <one-sentence summary>
  2. ...

<Next Category>

  3. <continuing number>...

These are all live in production at <production_url>. If you run into any other issues, just let us know!

We appreciate your feedback.

<sender_name>
```

Rules for summary text:
- Keep each item to one line, under 120 characters
- Use plain language a non-technical person would understand
- Do NOT use markdown bold, asterisks, or any formatting markers
- Number items sequentially across all categories (not restarting per category)

### 8. Deliver the email

**Check for Gmail MCP:** Attempt a Gmail MCP call (e.g., `gmail_get_profile`).

**If Gmail is available:**
Ask the user: "Gmail is connected. Would you like me to create a draft in Gmail, or just display the text here?"

- If they want a draft: use `gmail_create_draft` with the recipient email, subject line, and email body. Then confirm: "Draft created in Gmail. Review it there and send when ready."
- If they want text only: display the email text for copying.

**If Gmail is NOT available:**
Display the email text and say: "Copy the above and send to <recipient_email>."

### 9. Update last-sent timestamp

After delivering (draft or display), ask the user: "Save timestamp so next run starts from today?"

If they confirm, create or update `.stakeholder-updates/<label_or_filter>.last-sent` with today's date in ISO format (YYYY-MM-DD). Create the `.stakeholder-updates/` directory if it doesn't exist.

## Important

- Do NOT send the email automatically. Either create a Gmail draft or display text — never send directly.
- Keep summaries non-technical and concise.
- The email should read naturally, as if a human wrote it.
- Do not include task IDs, internal references, or technical jargon.
- If a tracker query fails, always fall back gracefully to manual mode rather than erroring out.
