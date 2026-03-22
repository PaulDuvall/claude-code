---
description: Coordinate changes across multiple repositories with parallel agent orchestration
tags: [multi-repo, orchestration, cross-repo, batch, coordination, automation]
---

# Multi-Repo Orchestration

Coordinate related changes across multiple repositories with discovery, planning, execution, and cross-repo validation.

## Usage Examples

**Coordinate a change across repos:**
```
/xmultirepo update logging library across all services
/xmultirepo rename API endpoint /v1/users to /v2/users
```

**Specify target repos:**
```
/xmultirepo --repos ~/Code/api,~/Code/frontend,~/Code/shared -- migrate from axios to fetch
```

**Discover and plan only (no changes):**
```
/xmultirepo --plan-only find all uses of deprecated config format
```

**Help and options:**
```
/xmultirepo help
/xmultirepo --help
```

## Options

**`--repos <paths>`** - Comma-separated list of repository paths
```
/xmultirepo --repos ~/Code/svc-auth,~/Code/svc-orders -- update JWT library
```

**`--plan-only`** - Discover and plan without executing changes
```
/xmultirepo --plan-only find hardcoded URLs
```

**`--dry-run`** - Show what would change without modifying files
```
/xmultirepo --dry-run migrate config format
```

**`--branch <name>`** - Use a consistent branch name across repos
```
/xmultirepo --branch feat/new-logging -- update logging
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

If $ARGUMENTS is empty:
Tell the user: "Describe the change to coordinate across repos. Example: /xmultirepo update shared library version across all services"
Stop and wait for input.

### Step 1: Parse Arguments

Extract from $ARGUMENTS:
- `--repos` value (comma-separated paths) or empty (auto-discover)
- `--plan-only` flag
- `--dry-run` flag
- `--branch` value or generate one from the change description
- The remaining text as the change description

### Step 2: Discover Repositories

If `--repos` was provided:
- Validate each path exists and is a git repository
- Report any invalid paths and continue with valid ones

If `--repos` was NOT provided:
- Look for repos in the parent directory of the current working directory:

```bash
for dir in ../*/; do
  if [ -d "$dir/.git" ]; then
    echo "$dir"
  fi
done
```

- Present the discovered repos and ask the user to confirm:

```
Found N repositories:
1. ~/Code/api (branch: main, clean)
2. ~/Code/frontend (branch: main, 2 uncommitted changes)
3. ~/Code/shared (branch: feat/wip, clean)

Which repos should be included? (all / comma-separated numbers / none)
```

Stop and wait for user confirmation before proceeding.

### Step 3: Assess Each Repository

For each confirmed repository, gather context:
- Current branch and whether working tree is clean
- Primary language and framework (check package.json, go.mod, requirements.txt, etc.)
- Search for occurrences related to the change description

Present a discovery summary:

```
## Discovery Report

### ~/Code/api
- Language: TypeScript (Node.js)
- Occurrences: 12 matches in 5 files
- Key files: src/lib/logger.ts, src/middleware/logging.ts

### ~/Code/frontend
- Language: TypeScript (React)
- Occurrences: 3 matches in 2 files
- Key files: src/utils/logger.ts

### ~/Code/shared
- Language: TypeScript
- Occurrences: 1 match in 1 file
- Key files: src/logging.ts (this is the shared module)
```

### Step 4: Generate Execution Plan

Create a sequenced plan that respects dependency order:

```
## Execution Plan

### Dependency Order
Shared libraries and packages change first, consumers change last.

| Order | Repository | Changes | Estimated Impact |
|-------|-----------|---------|-----------------|
| 1 | ~/Code/shared | Update logging module | Low (1 file) |
| 2 | ~/Code/api | Update imports, adapt calls | Medium (5 files) |
| 3 | ~/Code/frontend | Update imports, adapt calls | Low (2 files) |

### Per-Repository Steps
**1. ~/Code/shared**
- [ ] Create branch: `feat/update-logging`
- [ ] Modify src/logging.ts
- [ ] Run tests
- [ ] Commit changes

**2. ~/Code/api** (after shared)
- [ ] Create branch: `feat/update-logging`
- [ ] Update imports in 5 files
- [ ] Run tests
- [ ] Commit changes

**3. ~/Code/frontend** (after shared)
- [ ] Create branch: `feat/update-logging`
- [ ] Update imports in 2 files
- [ ] Run tests
- [ ] Commit changes
```

If `--plan-only` was specified:
- Display the plan and stop
- Suggest: "Run without --plan-only to execute this plan"

**Ask the user to confirm the plan before executing.**

### Step 5: Execute Per-Repository Changes

For each repository in dependency order:

1. **Change directory** to the repo
2. **Create branch** using `--branch` value or generated name
3. **Execute the changes** as described in the plan
4. **Run validation**:
   - If `package.json` exists: run `npm test` (or detected test command)
   - If `go.mod` exists: run `go test ./...`
   - If `requirements.txt` or `pyproject.toml` exists: run `pytest`
   - If `Makefile` exists with `test` target: run `make test`
5. **Report result** before moving to next repo

If `--dry-run` was specified, show diffs without writing files.

If a repo fails validation:
- Stop execution for remaining repos
- Report which repo failed and why
- Ask user: "Fix and retry this repo, skip it, or abort remaining?"

### Step 6: Cross-Repo Consistency Validation

After all repos are modified, verify consistency:

- **Version alignment**: If shared library versions were updated, verify all consumers reference the new version
- **API contracts**: If interfaces changed, verify all callers match the new signature
- **Import paths**: Verify no broken import references across repos
- **Configuration**: Check for consistent config key names and formats

Report any inconsistencies found:

```
## Cross-Repo Validation

[PASS] Version alignment: all repos reference shared@2.1.0
[PASS] API contracts: logging.info() signature matches in 3/3 repos
[WARN] Config key: api uses LOG_LEVEL, frontend uses LOGGING_LEVEL
```

### Step 7: Summary and Next Steps

```
## Multi-Repo Change Summary

| Repository | Branch | Files Changed | Tests | Status |
|-----------|--------|--------------|-------|--------|
| shared | feat/update-logging | 1 | Pass | Ready |
| api | feat/update-logging | 5 | Pass | Ready |
| frontend | feat/update-logging | 2 | Pass | Ready |

### Next Steps
- Review changes in each repo: `cd ~/Code/REPO && git diff`
- Push branches: run `/xgit` in each repo
- Create PRs: merge shared first, then consumers
- After shared merges, update lock files in api and frontend
```
