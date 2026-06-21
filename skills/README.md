# Skills

Versioned [Claude Code skills](https://docs.claude.com/en/docs/claude-code) — the source of truth for skills that get deployed into `~/.claude/skills/`.

This directory mirrors the repo's pattern for other artifacts (`hooks/`, `subagents/`): edit here, then deploy to your machine.

## Layout

A skill is a directory containing a `SKILL.md` (with YAML frontmatter) plus any supporting files:

```
skills/
└── loop-engineer/
    ├── SKILL.md                 # name, description, and the skill body
    └── templates/               # supporting files referenced by the skill
        ├── fan-out-audit.workflow.js
        ├── drafter-grader.workflow.js
        ├── guardian.workflow.js
        └── deterministic_guard.py
```

## Skills

| Skill | Description |
|-------|-------------|
| `loop-engineer` | Design, build, and debug multi-agent loops and orchestrations — coordinator loops that supervise worker loops. Failure-mode checklist + four battle-tested Workflow templates (detect / fix / guardian / deterministic-guard). |

## Deploy to your machine

```bash
# Preview (writes nothing)
bash scripts/deploy-skills.sh --list
bash scripts/deploy-skills.sh --all --dry-run

# Deploy everything to ~/.claude/skills/
bash scripts/deploy-skills.sh

# Deploy a single skill
bash scripts/deploy-skills.sh --include loop-engineer
```

The deploy script is idempotent: an existing `~/.claude/skills/<name>` is backed up to
`~/.claude/skills/.backups/<name>-<timestamp>/` before being overwritten. Run
`bash tests/test_deploy_skills.sh` to validate the deploy path.

## Adding or editing a skill

1. Edit files under `skills/<name>/` (or add a new skill directory with a `SKILL.md`).
2. Run `bash scripts/deploy-skills.sh --include <name>` to push to `~/.claude/skills/`.
3. Run `bash tests/test_deploy_skills.sh` and commit.
