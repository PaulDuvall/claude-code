---
description: "Verify references before taking action — catch fabricated URLs, placeholder IDs, and unverified claims"
tags: ["verification", "quality", "safety", "pre-action"]
---

# Pre-Action Verification

Scan proposed changes, generated content, or referenced artifacts for fabricated URLs, placeholder IDs, nonexistent file paths, and unverified references. Run this before committing, publishing, or acting on generated content.

## Usage Examples

**Verify current staged changes:**
```
/xverify
```

**Verify a specific file:**
```
/xverify README.md
```

**Verify generated documentation:**
```
/xverify docs/
```

## What Gets Checked

### URLs and Endpoints
- HTTP/HTTPS URLs: attempt to confirm they are plausible (check format, known domains)
- API endpoints: verify they match project routes or documented APIs
- Flag common fabrication patterns: `example.com` placeholders, sequential IDs, lorem ipsum domains

### File Paths and References
- Verify referenced file paths exist on disk
- Check import/require statements resolve to real modules
- Flag references to deleted or renamed files

### IDs and Tokens
- Flag placeholder patterns: `xxx`, `TODO`, `FIXME`, `your-*-here`, `placeholder`
- Check for hardcoded test IDs that may not be valid in production
- Flag UUIDs or IDs that appear fabricated (all zeros, sequential)

### Claims and Assertions
- Cross-check version numbers against package.json or lock files
- Verify command names match actual available commands
- Check that referenced environment variables are documented

## Output Format

For each issue found, report:
1. **File and line** where the reference appears
2. **What was found** (the suspicious reference)
3. **Why it's suspicious** (pattern match or verification failure)
4. **Suggested fix** (if determinable)

## Implementation

When invoked:

1. **Determine scope**: If a file or directory argument is provided, scan that. Otherwise scan staged git changes (`git diff --cached`), or if nothing is staged, scan recent modifications.

2. **Extract references**: Parse the scoped content for:
   - URLs (http/https links)
   - File paths (relative and absolute)
   - Import/require statements
   - Version strings
   - Environment variable references
   - Command names with `/x` prefix

3. **Verify each reference**:
   - File paths: check `fs.existsSync` or equivalent
   - URLs: validate format, flag known placeholder domains
   - Versions: cross-check against package.json
   - Commands: cross-check against slash-commands/active/ and experiments/
   - Env vars: check against .env.example or documentation

4. **Report findings**: Group by severity (error, warning, info) and output a summary table.

5. **Exit cleanly**: This is a read-only verification. No files are modified.
