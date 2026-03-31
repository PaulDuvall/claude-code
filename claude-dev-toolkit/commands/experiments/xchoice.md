---
description: Generate multiple implementation options with trade-off analysis for informed decision-making
tags: [choice, options, trade-offs, architecture, decision-making, comparison]
---

# Choice Generation

Generate 2-5 distinct implementation approaches with trade-off analysis. Aligns with the Choice Generation pattern from ai-development-patterns.

## Usage Examples

**Generate options for a feature:**
```
/xchoice authentication system
```

**Compare architectural approaches:**
```
/xchoice --arch API gateway vs direct service calls
```

**Quick 2-option comparison:**
```
/xchoice --quick Redis vs PostgreSQL for caching
```

**Help and options:**
```
/xchoice help
/xchoice --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Understand the Decision Context

Examine the current codebase to ground options in reality:
!ls -la | grep -E "(pyproject.toml|package.json|go.mod|Cargo.toml|docker-compose.yml)"
!find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" | grep -v node_modules | head -10

Identify constraints:
- Current tech stack and dependencies
- Team expertise signals (language choice, framework patterns)
- Existing infrastructure (Docker, cloud configs, CI/CD)
- Project maturity (MVP/POC vs production)

### Step 2: Generate Options

Based on $ARGUMENTS, generate **3 distinct implementation approaches** (or 2 if `--quick`):

For each option, structure as:

**Option N: [Focus] — [Name]**
- **Approach**: What it does and how
- **Tech choices**: Specific libraries, services, patterns
- **Trade-offs**:
  - Strengths (what this option optimizes for)
  - Weaknesses (what it sacrifices)
- **Effort estimate**: Relative complexity (Low/Medium/High)
- **Best when**: Specific scenarios where this option wins
- **Risks**: What could go wrong

### Step 3: Comparison Matrix

Present a decision matrix:

| Criteria | Option 1 | Option 2 | Option 3 |
|----------|----------|----------|----------|
| Implementation effort | | | |
| Performance | | | |
| Maintainability | | | |
| Scalability | | | |
| Security | | | |
| Team familiarity | | | |

Rate each: Strong / Adequate / Weak

### Step 4: Recommendation

Based on the detected project context, provide:

1. **Recommended option** with rationale tied to project constraints
2. **Runner-up** and when to prefer it instead
3. **Prototype suggestion**: What to build first to validate the choice (target: 30-minute spike)

### Anti-Patterns to Avoid

Per ai-development-patterns Choice Generation:
- **Over-analysis**: Limit to 2-5 options. More creates paralysis.
- **Ignoring constraints**: Every option must work with the current stack.
- **Abstract comparisons**: Ground each option in specific code/library choices.
- **Skipping validation**: Always suggest a prototype step before committing.

### Output Format

Present options clearly with visual separation. End with a direct recommendation:

> **Recommendation**: Option N is the strongest fit because [reason tied to detected context].
> **Validate with**: [specific 30-minute prototype task]
> **Revisit if**: [condition that would change the recommendation]