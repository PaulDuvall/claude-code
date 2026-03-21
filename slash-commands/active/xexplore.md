---
description: Explore a codebase topic before making changes (read-only)
tags: [exploration, codebase, discovery, read-only]
---

# Codebase Exploration

Comprehensively search the codebase for a topic before making any changes. Read-only — no files are modified.

## Usage Examples

**Explore a topic:**
```
/xexplore authentication
```

**Explore a specific area:**
```
/xexplore database migrations
```

**Help and options:**
```
/xexplore help
/xexplore --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

If $ARGUMENTS is empty:
Tell the user: "Please provide a topic to explore. Example: /xexplore authentication"
Stop and wait for input.

### Step 1: Search by File Name

Find files whose names match the topic:
- Use glob patterns: `**/*$ARGUMENTS*`, case-insensitive
- Exclude: `node_modules/`, `.git/`, `vendor/`, `dist/`, `build/`

### Step 2: Search by Content

Grep the codebase for the topic keyword:
- Search all source files for content matching $ARGUMENTS
- Capture file paths and line numbers for key matches
- Limit to first 20 matches per file to avoid flooding

### Step 3: Search Configuration

Check config files specifically:
- `*.json`, `*.yaml`, `*.yml`, `*.toml`, `*.env*`, `*.ini`
- Look for the topic in config values, keys, and comments

### Step 4: Search Tests

Find test files related to the topic:
- Patterns: `*test*`, `*spec*`, `__tests__/`
- Check both file names and file content

### Step 5: Search Documentation

Check docs for the topic:
- `*.md` files, `docs/` directory, `README*`
- Wiki or guide references

### Step 6: Report

Present findings in a structured inventory:

```
## Exploration Report: [topic]

### Source Files (N found)
- path/to/file.ts:42 — [matching line preview]

### Tests (N found)
- tests/path/to/test.ts:15 — [matching line preview]

### Configuration (N found)
- config/settings.json:8 — [matching line preview]

### Documentation (N found)
- docs/guide.md:23 — [matching line preview]
```

If nothing is found:
- Tell the user: "No matches found for '[topic]'."
- Suggest broadening the search or trying alternate terms.

**Do NOT make any changes to any files. This command is read-only.**
