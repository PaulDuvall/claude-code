---
name: audit-trail-verifier
description: Create an immutable evidence chain linking requirements, code, tests, scans, and releases.
version: 1.0.0
author: Claude Dev Toolkit Team
tags: [compliance, security, release]
tools: Read, Write, Grep, Glob
created: 2025-08-19
modified: 2026-04-03
---

Goal
- Prove every change was built, tested, scanned, and released correctly.

Inputs
- docs/traceability.md, test reports, security reports, sbom/, releases/

Rules
- Evidence must be linkable and timestamped; no manual steps required.
- Gaps produce blocking tasks.

Process
1) Collect pointers to build/test/scan/attestation artifacts.
2) Assemble a single evidence record per release.
3) Flag missing artifacts and assign owners.

Outputs
- compliance/evidence/<release-id>.md
- compliance/gaps.md