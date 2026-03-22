---
description: Command navigator that recommends the right slash commands for your task
tags: [help, discovery, onboarding, navigation, workflow]
---

# Command Navigator

Analyze a problem description and recommend the best slash command(s) with suggested ordering.

## Usage Examples

**Describe your problem:**
```
/xhelp I need to fix a flaky CI pipeline
/xhelp how do I refactor a large class
/xhelp set up security scanning for my project
```

**Browse all commands:**
```
/xhelp list
/xhelp categories
```

**Help and options:**
```
/xhelp help
/xhelp --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Command Registry

Reference this categorized command catalog:

**Planning & Strategy**
| Command | Purpose |
|---------|---------|
| `/xplanning` | Project planning with roadmaps and estimation |
| `/xproduct` | Product management and feature planning |
| `/xrisk` | Risk assessment and mitigation |
| `/xatomic` | Break tasks into 4-8 hour atomic units |
| `/xreadiness` | AI development readiness assessment |

**Architecture & Design**
| Command | Purpose |
|---------|---------|
| `/xarchitecture` | System architecture with DDD, 12-Factor patterns |
| `/xdesign` | Software design patterns and decisions |
| `/xconstraints` | Design constraint analysis |
| `/xspec` | Machine-readable specifications with unique IDs |

**Development & Code Quality**
| Command | Purpose |
|---------|---------|
| `/xrefactor` | Interactive refactoring from Martin Fowler's catalog |
| `/xquality` | Code quality analysis with linting |
| `/xtdd` | Full TDD Red-Green-Refactor-Commit cycle |
| `/xred` | TDD Red phase: write failing tests first |
| `/xgreen` | TDD Green phase: minimal passing implementation |
| `/xtest` | Comprehensive testing with traceability |
| `/xcoverage` | Code and specification coverage analysis |
| `/xdebug` | Advanced debugging with error analysis |
| `/xgenerate` | Auto-generate code from specifications |
| `/xtemplate` | Generate code templates and boilerplate |
| `/xanalyze` | Comprehensive code analysis for patterns and issues |

**Exploration & Continuation**
| Command | Purpose |
|---------|---------|
| `/xexplore` | Read-only codebase exploration before changes |
| `/xcontinue` | Resume execution plans across sessions |
| `/xverify` | Verify references before acting on them |

**Security & Compliance**
| Command | Purpose |
|---------|---------|
| `/xsecurity` | Security vulnerability scanning |
| `/xcompliance` | Compliance checking and audit documentation |
| `/xpolicy` | IAM policy generation and validation |
| `/xgovernance` | Development governance framework |
| `/xscan` | Repository scanning |

**CI/CD & Deployment**
| Command | Purpose |
|---------|---------|
| `/xgit` | Automated git workflow (stage, commit, push) |
| `/xcommit` | Commits linked to specs with traceability |
| `/xcicd` | Platform-agnostic CI/CD pipelines |
| `/xpipeline` | Build pipeline optimization |
| `/xrelease` | Release management and deployment |
| `/xact` | Local GitHub Actions testing with nektos/act |
| `/xoidc` | AWS OIDC role creation for GitHub Actions |

**Infrastructure & Operations**
| Command | Purpose |
|---------|---------|
| `/xinfra` | Infrastructure as Code management |
| `/xiac` | AWS IAM, Terraform, CloudFormation validation |
| `/xaws` | AWS credentials, services, IAM testing |
| `/xconfig` | Project configuration and env var management |
| `/xdb` | Database management, migrations, performance |
| `/xdevcontainer` | Devcontainer setup for Claude Code |
| `/xsetup` | Development environment setup |
| `/xsandbox` | Isolated development environments |

**Monitoring & Metrics**
| Command | Purpose |
|---------|---------|
| `/xmonitoring` | Application monitoring and observability |
| `/xmetrics` | Development metrics collection and analysis |
| `/xobservable` | Development patterns and team productivity |
| `/xperformance` | Performance profiling and optimization |
| `/xanalytics` | Business metrics and user behavior analysis |
| `/xmaturity` | Team development maturity assessment |

**Documentation & Knowledge**
| Command | Purpose |
|---------|---------|
| `/xdocs` | Generate documentation from code |
| `/xknowledge` | Organizational knowledge and onboarding |
| `/xfootnote` | Machine-readable requirement links |
| `/xtrace` | Traceability analysis |
| `/xrules` | Rules as Code |

**Workflow & Process**
| Command | Purpose |
|---------|---------|
| `/xworkflow` | Workflow automation patterns |
| `/xoptimize` | Performance and workflow optimization |
| `/xvalidate` | Quality, security, and compliance validation |
| `/xevaluate` | Code quality and project health evaluation |
| `/xincident` | Incident response and post-mortem analysis |

**API & UX**
| Command | Purpose |
|---------|---------|
| `/xapi` | API design, implementation, testing |
| `/xux` | UX optimization and accessibility compliance |

### Step 2: Handle "list" or "categories"

If $ARGUMENTS is "list" or "categories":
Display the full command registry table above, organized by category.
Stop and wait for input.

### Step 3: Handle Empty Input

If $ARGUMENTS is empty:
Tell the user: "Describe what you're trying to do and I'll recommend the right commands."
Show a few example queries:
- `/xhelp fix a flaky CI pipeline`
- `/xhelp improve test coverage`
- `/xhelp set up a new project with security`
Stop and wait for input.

### Step 4: Analyze the Problem

Parse $ARGUMENTS as a problem description. Match against these common workflow patterns:

**Fixing bugs / debugging**
Keywords: fix, bug, error, broken, failing, debug, crash, issue
Chain: `/xexplore` -> `/xdebug` -> `/xtest`

**CI/CD pipeline issues**
Keywords: ci, cd, pipeline, deploy, build, workflow, actions, flaky
Chain: `/xexplore` -> `/xpipeline` -> `/xtest` -> `/xact`

**Code quality / refactoring**
Keywords: refactor, clean, quality, smell, complexity, lint, messy
Chain: `/xexplore` -> `/xquality` -> `/xrefactor` -> `/xtest`

**Security concerns**
Keywords: security, vulnerability, scan, audit, compliance, policy, secret
Chain: `/xsecurity` -> `/xcompliance` -> `/xpolicy`

**New feature development**
Keywords: new, feature, implement, add, create, build
Chain: `/xspec` -> `/xtdd` -> `/xquality` -> `/xgit`

**Test coverage**
Keywords: test, coverage, tdd, spec, unit, integration
Chain: `/xcoverage` -> `/xtdd` -> `/xtest`

**Architecture / design**
Keywords: architecture, design, pattern, structure, scale, migrate
Chain: `/xexplore` -> `/xarchitecture` -> `/xdesign` -> `/xspec`

**Infrastructure / deployment**
Keywords: infra, terraform, cloud, aws, docker, deploy, container
Chain: `/xinfra` -> `/xiac` -> `/xpipeline` -> `/xrelease`

**Documentation**
Keywords: docs, document, readme, guide, onboard
Chain: `/xexplore` -> `/xdocs` -> `/xknowledge`

**Performance issues**
Keywords: slow, performance, optimize, bottleneck, latency, memory
Chain: `/xexplore` -> `/xperformance` -> `/xoptimize`

**Project setup / onboarding**
Keywords: setup, init, new project, bootstrap, start, onboard
Chain: `/xsetup` -> `/xnew` -> `/xconfig` -> `/xdevcontainer`

**Release management**
Keywords: release, version, tag, publish, changelog
Chain: `/xtest` -> `/xsecurity` -> `/xrelease` -> `/xgit`

**API development**
Keywords: api, endpoint, rest, graphql, openapi, swagger
Chain: `/xspec` -> `/xapi` -> `/xtest` -> `/xdocs`

### Step 5: Present Recommendations

Display recommendations in this format:

```
## Recommended Workflow for: [problem summary]

### Primary Commands (run in this order):
1. `/xcommand1` - [why this is needed first]
2. `/xcommand2` - [what this accomplishes next]
3. `/xcommand3` - [how this completes the workflow]

### Quick Start:
Copy and run these in sequence:
/xcommand1 [suggested args]
/xcommand2 [suggested args]
/xcommand3 [suggested args]

### Also Consider:
- `/xother` - [when this might help]
```

If the problem matches multiple patterns, combine the chains and deduplicate commands.

If no clear match is found:
- Suggest `/xexplore [topic]` as a starting point
- Show the 3 most likely relevant commands
- Offer to show the full command list with `/xhelp list`
