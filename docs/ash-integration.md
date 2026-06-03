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
| `ash --mode precommit` (1–2 file change) | *pending* | measured when Tier 2 pre-push is wired (T4) |
| `ash --mode container` (full tree) | *pending* | measured by the first Tier 3 CI run (T4); needs a container runtime, which CI provides |
| ASH per-scanner zero-input startup | *pending* | decides whether applicability gating must happen at the wrapper before invoking ASH (T4) |

**Why checkov is Tier 1, not Tier 0:** the single-file run is ~1.5s, roughly 5×
the 300ms on-write budget. Per the integration's own escape clause, the IaC check
drops to Tier 1 (pre-commit) where the budget is 5s, and the PostToolUse on-write
gate stays the existing inline Python smell + secret checks. Nothing in the ASH
bundle starts fast enough for a sub-300ms per-write gate, which is why ASH never
runs at Tier 0.

The pending ASH-mode numbers are captured when Tiers 2–3 are wired; the container
figure is authoritative from CI, where Docker is present by default.
