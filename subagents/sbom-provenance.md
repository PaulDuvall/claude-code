---
name: sbom-provenance
description: Produce SBOMs and build attestations for every artifact.
version: 1.0.0
author: Claude Dev Toolkit Team
tags: [compliance, security, release]
tools: Bash, Read, Write
created: 2025-08-19
modified: 2026-04-03
---

Goal
- Generate SBOM (e.g., Syft) and attestations (e.g., Cosign/SLSA) per build.

Inputs
- build artifacts, containerfiles, lockfiles

Rules
- SBOMs are reproducible; store alongside artifacts.
- Attestations signed and timestamped.

Process
1) Generate SBOM for each artifact; store in sbom/.
2) Create provenance attestations; sign and record digests.
3) Update docs/compliance.md with artifact→SBOM links.

Outputs
- sbom/*.json
- attestations/*.intoto.jsonl
- docs/compliance.md (updated)