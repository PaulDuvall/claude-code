export const meta = {
  name: 'guardian',
  description: 'COORDINATE template: a standing loop that detects drift, triages findings into mechanical vs needs-decision, auto-fixes only the mechanical ones (worker loop), parks judgment calls for a human, then re-verifies. Never merges to main.',
  phases: [
    { title: 'Detect', detail: 'run the detect workflow' },
    { title: 'Triage', detail: 'mechanical vs needs-decision; record durably' },
    { title: 'Fix', detail: 'auto-fix mechanical via the fix worker' },
    { title: 'Re-verify', detail: 'prove the findings are gone' },
  ],
}

// The coordinator owns: planning (triage), the integration boundary (branch
// only), the stopping criterion (re-verify clean), and the HUMAN-DECISION GATE.
// Worker loops run as child workflows. (Nesting is one level: the children must
// NOT themselves call workflow().)
const ALLOW_AUTOFIX = !args?.detectOnly

const TRIAGE = { type: 'object', additionalProperties: false, properties: {
  // Mechanical = one obviously-correct, doc-only/unambiguous fix. A behavior
  // change is NEVER mechanical. Default to needs_decision when unsure.
  mechanical: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
    id: { type: 'string' }, kind: { enum: ['doc', 'code'] }, needs_test: { type: 'boolean' },
    title: { type: 'string' }, files: { type: 'string' }, evidence: { type: 'string' }, resolution: { type: 'string' },
  }, required: ['kind', 'needs_test', 'title', 'files', 'evidence', 'resolution'] } },
  needs_decision: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
    title: { type: 'string' }, evidence: { type: 'string' }, options: { type: 'array', items: { type: 'string' } },
  }, required: ['title', 'evidence', 'options'] } },
}, required: ['mechanical', 'needs_decision'] }

phase('Detect')
const detect = await workflow('fan-out-audit')              // ← your DETECT workflow name
const findings = detect?.suspected_bugs ?? []
if (findings.length === 0)
  return { detected: 0, parked: [], note: 'Already in sync.', report: detect?.report }

phase('Triage')
const triage = await agent(
  `Classify each finding as mechanical (provide kind/needs_test/files/evidence/resolution) or needs_decision (provide competing options; DO NOT pick). Default to needs_decision when unsure.
${JSON.stringify(findings, null, 2)}`,
  { label: 'triage', phase: 'Triage', schema: TRIAGE, agentType: 'general-purpose' }
)
// Durable memory: file/update a Beads task for EVERY finding so nothing is lost
// across context clears; label needs_decision items as parked for a human.
await agent(
  `Idempotently record these as Beads tasks. Check existing tasks first ('bd ready --json' / 'bd list --json'); only 'bd create "TITLE" -t TYPE -p PRIORITY -d "DESC" --json' when no matching open task exists. Label needs_decision items '-l needs-decision' (parked — do NOT auto-fix them). Report the bd ids.
mechanical=${JSON.stringify(triage.mechanical)} needs_decision=${JSON.stringify(triage.needs_decision)}`,
  { label: 'file-issues', phase: 'Triage', agentType: 'general-purpose' }
)

phase('Fix')
const fix = ALLOW_AUTOFIX && triage.mechanical.length
  ? await workflow('drafter-grader', { items: triage.mechanical, branch: 'fix/guardian-auto' })  // ← your FIX workflow
  : null

phase('Re-verify')
// Re-verify against the branch the fixes ACTUALLY landed on. drafter-grader
// leaves the tree on fix/guardian-auto, but make it explicit — otherwise a
// stray switch-back would audit the pre-fix tree and under-report `remaining`.
if (fix) await agent(
  `Ensure the working tree is on the fix branch before re-verification: git switch fix/guardian-auto.`,
  { label: 'checkout-fix', phase: 'Re-verify', agentType: 'general-purpose' }
)
const reverify = await workflow('fan-out-audit')
return {
  detected: findings.length, mechanical_fixed: triage.mechanical.length,
  parked: triage.needs_decision, autofix_branch: fix ? 'fix/guardian-auto' : null,
  remaining: (reverify?.suspected_bugs ?? []).length, report: reverify?.report,
}
