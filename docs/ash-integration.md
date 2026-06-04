# ASH Tiered Security Integration

AWS Automated Security Helper ([ASH](https://github.com/awslabs/automated-security-helper),
pinned **v3.2.6**) is the scanner orchestration layer for this repo. It bundles
Bandit, Semgrep, detect-secrets, Checkov, cfn-nag, Grype, and npm-audit under one
CLI with UV tool isolation and unified SARIF/JSON output.

ASH is wired across **four latency tiers**, each scoped tighter and budgeted
faster than the last. The point is feedback at the speed of typing, escalating to
thorough only as the blast radius grows.

| Tier | Trigger | Budget | Scope | What runs |
|------|---------|--------|-------|-----------|
| 0 on-write | PostToolUse Write/Edit | <300ms | the one file just written | inline Python hooks (smells + secrets) only |
| 1 pre-commit | `git commit` | <5s | staged files | single-file `checkov` on staged IaC, secrets on staged |
| 2 pre-push | `git push` | <30s | push range | `ash --mode precommit` on changed files |
| 3 CI | PR / push to main | minutes | full tree | `ash --mode container`, all scanners, SARIF upload |

Each tier is a **superset** of the prior tier's coverage. Tiers 0–2 are
file-scoped; cross-file and cross-resource analysis (e.g. a security group defined
in one `.tf` and referenced in another) is **Tier 3's job only**, by design — it
blows the smaller budgets. Tier 3 is the only un-bypassable tier.

## Applicability gating

Tiers decide *how fast*; applicability decides *whether at all*. The change set is
computed once per invocation, then each scanner runs **only if** the change set
contains a file type it analyzes. The mapping lives in exactly one place,
[`hooks/scan_router.py`](../hooks/scan_router.py), and is mirrored by
[`.ash/ash.yaml`](../.ash/ash.yaml):

| Scanner | Runs only if change set contains |
|---------|----------------------------------|
| Bandit | `.py` |
| Semgrep | a configured language (`.py`/`.js`/`.ts`/`.go`/…) |
| Checkov | `.tf` / CloudFormation / Kubernetes manifest / Dockerfile |
| cfn-nag | a CloudFormation template (**detected by content**) |
| detect-secrets | any text file |
| npm-audit | `package.json` / `package-lock.json` |
| Grype (SCA) | a dependency manifest / lockfile |

CloudFormation is detected **by content, not extension**: a `.yaml` file is a
cfn-nag target only if it has a top-level `Resources` block plus an
`AWSTemplateFormatVersion` or an `AWS::`-style resource `Type`. GitHub Actions
workflows and Kubernetes manifests are YAML too and are deliberately excluded.

An empty or non-applicable change set exits **0, silently** — no "nothing to scan"
banner. The only success line printed is at Tier 3 CI; Tiers 0–2 stay silent on
success.

## cdk-nag is disabled

cdk-nag is disabled in [`.ash/ash.yaml`](../.ash/ash.yaml). ASH's README documents
a `CfnInclude` `BootstrapVersion` collision on CDK-synthesized templates that
produces spurious failures. **cfn-nag and checkov remain enabled** for
CloudFormation coverage. This is an upstream interaction, not a config error — do
not attempt to "fix" the collision.

## Benchmark numbers

Measured on this repo (macOS, Apple Silicon, Python 3.14, scanners via `uvx`).
The numbers — not the table above — decide tier placement.

| Measurement | Result | Decision |
|-------------|--------|----------|
| `checkov -f <one .tf>` (steady-state, via `uvx`) | **~1.55s** (1.52 / 1.55 / 1.61s) | **>300ms → IaC check lives at Tier 1**, not Tier 0. PostToolUse stays Python/secrets-only. Well under the 5s Tier-1 budget. |
| pure `python3` startup floor | 0.01s | inline Python hooks have ample headroom under 300ms |
| `ash --mode precommit`, **cold** (first run, tool provisioning) | **82.1s** | one-time cost when ASH's tool copies are first built; not paid per-push |
| `ash --mode precommit`, **warm** (1-file change) | **9.9s** | under the 30s Tier-2 budget, but a ~10s fixed floor |
| `ash --mode precommit`, **warm** (zero matching input) | **9.7s** | ASH pays the floor even with nothing to scan → **applicability MUST be gated at the wrapper** (don't invoke ASH unless a code/IaC scanner applies). Confirms applicability rule 6. |
| `ash --mode precommit --scanners checkov` (warm) | **9.8s** | scoping to one scanner does **not** reduce the floor — the ~10s is ASH orchestration, not scanner count |
| `ash --mode container` (full tree) | *CI-only* | needs a container runtime; measured by the first Tier 3 CI run (Docker is present on the runner) |

**Why checkov is Tier 1, not Tier 0:** the single-file run is ~1.5s, roughly 5×
the 300ms on-write budget. Per the integration's own escape clause, the IaC check
drops to Tier 1 (pre-commit) where the budget is 5s, and the PostToolUse on-write
gate stays the existing inline Python smell + secret checks. Nothing in the ASH
bundle starts fast enough for a sub-300ms per-write gate, which is why ASH never
runs at Tier 0.

### Tier 2 (pre-push) design notes — what the benchmark forced

Two facts from the numbers changed the wiring from the naive "run `ash --mode
precommit` on the changed files":

1. **`precommit` is a *speed preset*, not a git filter.** In ASH v3.2.6,
   `--mode precommit` means "Python-based scanners only, simplified output" — it
   scans the whole `--source-dir`; there is **no per-file flag**. To keep Tier 2
   file-scoped, the pre-push hook stages the push-range files into a temp dir and
   runs ASH with `--source-dir` pointed at it. Cross-file analysis is therefore
   **not** done at Tier 2 by design — that is Tier 3's job.
2. **ASH pays a ~10s floor even for zero input.** So `hooks/prepush_checks.py`
   gates *before* invoking ASH: it computes the push range
   (`git diff --name-only @{push}`, falling back to the default branch on a new
   branch — never the whole tree), and runs ASH only when a **code/IaC** scanner
   (`bandit`/`semgrep`/`checkov`) applies. A docs-only push matches only
   `detect-secrets`, which is already gated dependency-free at Tiers 0–1 and
   re-checked by the CI container — so it does **not** pay the ASH floor and the
   pre-push exits silently.

The container figure is authoritative from CI, where Docker is present by default.

## Findings triage policy

Suppressions are a system with documented reasons, not silent ignores. Every
finding ASH reports is resolved in exactly one of three ways, all visible in
version control and reviewed in the PR that introduces them:

1. **FIXED** — the finding is real and corrected in code (e.g. the GitHub
   Actions script injection in `npm-publish-manual.yml` and the `curl | bash`
   in `scripts/xact.sh` were fixed, not suppressed).
2. **SUPPRESSED with a reason** — a confirmed false positive or an accepted,
   explained risk. Each entry in `.ash/ash.yaml` `global_settings.suppressions`
   carries:
   - a **`rule_id`** and a **`path`** scoped as narrowly as practical (never a
     blanket repo-wide "ignore everything"),
   - a **`reason`** stating *why* it is not actionable (e.g. "this 40-char hex
     is the pinned ASH commit SHA, not a secret"; "documentation example of a
     credential pattern").
3. **TRACKED** — real but out-of-scope-to-fix-now work is suppressed with a
   reason that **references a Beads task** and an **`expiration`** date that
   forces re-review (e.g. the GitHub Actions hardening tracked in
   `claude-code-0qi`, expiring `2026-09-01`).

Rules of thumb: prefer FIX over SUPPRESS; scope suppressions to the narrowest
`path` + `rule_id` that covers the false positive; give accepted-risk and
tracked suppressions an `expiration` so they cannot rot; secrets findings are
suppressed only after confirming each is a non-secret (the inline Tier 0/1
hooks keep real secrets non-suppressible regardless).

Note on local vs CI for secrets: ASH's `detect-secrets` plugin runs in CI but
no-ops in local `--mode local` on some machines (the tool runs in an isolated
`uvx` environment). Treat **CI as the authoritative validator for
detect-secrets**; the suppressions above were triaged from the CI artifact.

## Install & activation

One entry point wires the local spine: `bash scripts/setup-hooks.sh`. It is
idempotent and:

- symlinks the Claude Code hooks into `~/.claude/hooks/`,
- installs **chained** git hooks (Tier 1 `pre-commit`, Tier 2 `pre-push`) via
  `scripts/install-git-hooks.sh`, preserving any pre-existing hook (e.g. the
  beads `pre-commit`) by chaining it — no `core.hooksPath` override.

**Tier 0 activation is opt-in.** The PostToolUse hooks fire only once their
config is present in `~/.claude/settings.json`. By default `setup-hooks.sh` does
**not** edit your global settings; pass `--wire-settings` to merge
`hooks/settings.example.json` in idempotently (additive — existing hooks are
preserved), or merge it by hand. Tier 3 (CI) needs no install: it ships in
`.github/workflows/ash.yml` and runs on PRs and pushes to `main`.

Uninstall with `bash scripts/setup-hooks.sh --uninstall` (restores any chained
hooks).
