export const meta = {
  name: 'drafter-grader',
  description: 'FIX template: per item a drafter implements the decided fix (+ test for behavior changes), then a SEPARATE grader scores it against a rubric. Lands on a review branch only; never merges to main.',
  phases: [
    { title: 'Fix', detail: 'drafter implements on the review branch' },
    { title: 'Grade', detail: 'independent grader scores vs rubric' },
    { title: 'Finalize', detail: 'run suite, report merge/close readiness' },
  ],
}

const BRANCH = args?.branch ?? 'fix/auto'

// Work-list with the DECIDED resolution per item. kind:'code' needs a test;
// 'doc' must change only documentation. Judgment calls should already be
// resolved here (passed in via args) — the loop never guesses a behavior change.
const ITEMS = args?.items ?? [
  // { id, kind: 'code'|'doc', needs_test: true, title, files, evidence, resolution },
]

const GRADE = { type: 'object', additionalProperties: false, properties: {
  approved: { type: 'boolean' },
  resolves: { type: 'boolean' },          // the cited defect no longer holds
  preserved: { type: 'boolean' },         // doc fixes change ONLY docs
  rubric: { type: 'object', additionalProperties: false, properties: {
    tests: { enum: ['pass', 'fail', 'na'] }, security: { enum: ['pass', 'fail', 'na'] },
    quality: { enum: ['pass', 'fail', 'na'] }, refactor: { enum: ['pass', 'fail', 'na'] },
  }, required: ['tests', 'security', 'quality', 'refactor'] },
  issues: { type: 'array', items: { type: 'string' } },
}, required: ['approved', 'resolves', 'preserved', 'rubric', 'issues'] }

// SEQUENTIAL for-loop: every drafter edits the same tree on one branch, so
// serialize to avoid write races. (Switch to worktree-isolated parallel() only
// when items are MANY and touch INDEPENDENT files.)
const results = []
phase('Fix')
for (let i = 0; i < ITEMS.length; i++) {
  const f = ITEMS[i]
  const setup = i === 0 ? `Create the review branch: git switch -c ${BRANCH}.` : `git switch ${BRANCH}.`
  const draft = await agent(
    `${setup}
Implement EXACTLY this decided resolution (do not redesign): ${f.resolution}
Files: ${f.files}. Evidence: ${f.evidence}.
${f.needs_test ? 'Add a test that fails before and passes after.' : 'Documentation only — change no executable code.'}
Run the test suite; it must stay green. Commit (project commit format; NO Co-Authored-By trailer).`,
    { label: `fix:${f.id}`, phase: 'Fix', agentType: 'general-purpose' }
  )
  // Producer ≠ grader: a DIFFERENT agent inspects the actual diff.
  const grade = await agent(
    `You did NOT write this fix. Inspect the latest commit on ${BRANCH} (git show). Grade for: resolves (defect gone?), preserved (doc fix = docs only?), and the Tests/Security/Quality/Refactor rubric. approved only if resolves AND preserved AND no rubric "fail".
Resolution that should be reflected: ${f.resolution}`,
    { label: `grade:${f.id}`, phase: 'Grade', agentType: 'general-purpose', schema: GRADE }
  )
  if (grade && !grade.approved)
    await agent(`Grader rejected ${f.id}: ${JSON.stringify(grade.issues)}. Fix every issue, keep suite green, amend.`,
      { label: `repair:${f.id}`, phase: 'Fix', agentType: 'general-purpose' })
  results.push({ id: f.id, draft, grade })
}

// Finalize: run the suite once more and report. Do NOT merge to main, push, or
// close issues — the human reviews the branch and decides side effects (deploy).
phase('Finalize')
const finalize = await agent(
  `On ${BRANCH}: run the full test suite and report. ready_to_merge = (suite green AND every item approved). Do NOT merge/push/close anything.
${JSON.stringify(results.map((r) => ({ id: r.id, approved: r.grade?.approved })), null, 2)}`,
  { label: 'finalize', phase: 'Finalize', agentType: 'general-purpose' }
)
return { branch: BRANCH, approved: results.filter((r) => r.grade?.approved).map((r) => r.id), finalize }
