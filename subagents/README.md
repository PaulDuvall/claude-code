# Subagents Index

25 specialized AI subagents organized by function. Each agent has a focused responsibility and delegates related concerns to peer agents via cross-references.

> **Adding a new subagent?** Copy `TEMPLATE.md` and follow the standard structure.

## Code Quality & Review

| Agent | Purpose |
|-------|---------|
| [code-review-assistant](code-review-assistant.md) | Diff analysis, anti-pattern detection, and architecture assessment |
| [style-enforcer](style-enforcer.md) | Formatting, linting, and type checks; auto-fix where safe |
| [api-guardian](api-guardian.md) | API design validation, breaking change detection, and versioning |

## Testing

| Agent | Purpose |
|-------|---------|
| [test-writer](test-writer.md) | Ensure tests exist and grow with code; target coverage on changed lines |
| [contract-tester](contract-tester.md) | Validate service interactions and prevent integration drift |
| [performance-guardian](performance-guardian.md) | Performance testing, regression detection, and optimization |

## Security & Compliance

| Agent | Purpose |
|-------|---------|
| [security-auditor](security-auditor.md) | Continuous SAST/SCA/secret scanning with prioritized remediation |
| [license-compliance-guardian](license-compliance-guardian.md) | License compliance scanning and open source governance |
| [sbom-provenance](sbom-provenance.md) | SBOMs and build attestations for every artifact |
| [audit-trail-verifier](audit-trail-verifier.md) | Immutable evidence chain linking requirements, code, tests, and releases |

## Debugging & Troubleshooting

| Agent | Purpose |
|-------|---------|
| [debug-specialist](debug-specialist.md) | Root cause analysis, error interpretation, and systematic troubleshooting |
| [rollback-first-responder](rollback-first-responder.md) | Automated revert/flag-off on guardrail breach; capture breadcrumbs for RCA |

## Deployment & Release

| Agent | Purpose |
|-------|---------|
| [deployment-strategist](deployment-strategist.md) | Safe, fast deployments with progressive delivery and rollback |
| [continuous-release-orchestrator](continuous-release-orchestrator.md) | On-demand production deployment with automated quality gates |
| [ci-pipeline-curator](ci-pipeline-curator.md) | Deterministic, fast pipelines with parallelism and flake intolerance |
| [trunk-guardian](trunk-guardian.md) | Maintain main branch in always-releasable state |

## Infrastructure & Monitoring

| Agent | Purpose |
|-------|---------|
| [environment-guardian](environment-guardian.md) | Infrastructure provisioning, environment parity, and drift detection |
| [observability-engineer](observability-engineer.md) | Metrics, logs, and traces; dashboards and alerts |
| [dependency-steward](dependency-steward.md) | Safe library versions, pinning, and upgrades |
| [data-steward](data-steward.md) | Database migrations, data quality, and pipeline reliability |

## Documentation & Requirements

| Agent | Purpose |
|-------|---------|
| [documentation-curator](documentation-curator.md) | Living documentation, API docs, and doc-code synchronization |
| [requirements-reviewer](requirements-reviewer.md) | Traceability from requirements to code and tests |
| [product-owner-proxy](product-owner-proxy.md) | Business intent as user stories with acceptance criteria |

## Workflow & Planning

| Agent | Purpose |
|-------|---------|
| [workflow-coordinator](workflow-coordinator.md) | Orchestrate handoffs and enforce per-phase checklists |
| [change-scoper](change-scoper.md) | Break work into trunk-sized tasks with binary DoD and safe rollback |
