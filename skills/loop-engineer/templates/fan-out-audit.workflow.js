export const meta = {
  name: 'fan-out-audit',
  description: 'DETECT template: fan out auditors over a work-list, adversarially cross-check each finding, apply, review-after-apply, report.',
  phases: [
    { title: 'Audit', detail: 'one auditor per work-item' },
    { title: 'Cross-check', detail: 'adversarially refute each finding' },
    { title: 'Apply', detail: 'one editor per resource' },
    { title: 'Review', detail: 'review-after-apply per resource' },
    { title: 'Report', detail: 'consolidate' },
  ],
}

// ── 0. CONFIG. The top-level dirs that anchor a canonical resource key. EDIT
// these per repo — they MUST match this repo's layout or canonicalization (§3)
// silently no-ops and two editors can race one file. ──
const PATH_ROOTS = ['src', 'docs', 'specs', '.kiro']

// ── 1. WORK-LIST. Each item names the resource(s) it audits + where to look. ──
const ITEMS = [
  // { id: 'unit-a', targets: ['path/to/thing'], focus: '...', code: 'where to read' },
]

// No silent caps: a large fan-out is real cost — surface it instead of hiding it.
if (ITEMS.length > 40) log(`fan-out-audit: ${ITEMS.length} items — high fan-out; watch cost/concurrency.`)

const FINDINGS_SCHEMA = { type: 'object', additionalProperties: false, properties: {
  item_id: { type: 'string' },
  findings: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
    target: { type: 'string' },                    // resource this finding edits
    status: { type: 'string', enum: ['ok', 'drifted', 'missing', 'suspected_bug'] },
    evidence: { type: 'string' },                  // file:line — REQUIRE concrete evidence
    correction: { type: 'string' },
    confirmed: { type: 'boolean' },                // set by the cross-check stage
  }, required: ['target', 'status', 'evidence', 'correction'] } },
}, required: ['item_id', 'findings'] }

// ── 2. AUDIT → CROSS-CHECK (pipelined; each item's check starts when its audit ends). ──
const audited = await pipeline(
  ITEMS,
  (item) => agent(
    `Audit ${item.targets.join(', ')}. Focus: ${item.focus}. Read: ${item.code}.
Classify every claim: ok | drifted | missing | suspected_bug. Cite file:line evidence for each.
RULE: source-of-truth conforms the spec/doc, EXCEPT a real code bug → status "suspected_bug" (flag, don't encode).`,
    { label: `audit:${item.id}`, phase: 'Audit', schema: FINDINGS_SCHEMA }
  ),
  // Producer ≠ checker. Default to REFUTED when unsure.
  (found) => agent(
    `Adversarially verify each finding by re-opening the cited code yourself. Set confirmed=true ONLY if it genuinely holds; default false when unsure. Return the same shape with confirmed set.
${JSON.stringify(found?.findings ?? [])}`,
    { label: `crosscheck:${found?.item_id}`, phase: 'Cross-check', schema: FINDINGS_SCHEMA }
  )
)

// ── 3. CANONICALIZE keys BEFORE grouping, so exactly ONE editor owns each resource. ──
const ROOTS_RE = new RegExp(`^.*?(?=(${PATH_ROOTS.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})/)`)
const norm = (p) => p?.replace(ROOTS_RE, '').replace(/^\.\//, '') ?? p
const byResource = {}
for (const a of audited.filter(Boolean))
  for (const f of (a.findings ?? []).filter((x) => x.confirmed !== false && x.status !== 'ok')) {
    const key = norm(f.target)
    ;(byResource[key] ??= []).push({ ...f, target: key })
  }

// ── 4. APPLY → REVIEW-AFTER-APPLY (one editor per resource → no write races). ──
const applied = await pipeline(
  Object.entries(byResource),
  ([res, fs]) => agent(
    `Apply these confirmed corrections to ${res}. For suspected_bug, add a clearly-marked note instead of encoding the bug. Preserve correct content.
${JSON.stringify(fs, null, 2)}`,
    { label: `apply:${res}`, phase: 'Apply', agentType: 'general-purpose' }
  ),
  (_r, [res]) => agent(
    `Review ${res} after editing: list any FABRICATION (unsupported claim), OVER-CORRECTION (deleted/distorted), or remaining drift. approved only if none.`,
    { label: `review:${res}`, phase: 'Review', agentType: 'general-purpose',
      schema: { type: 'object', additionalProperties: false, properties: {
        approved: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } },
      }, required: ['approved', 'issues'] } }
  )
)

// ── 5. Surface what needs a human (suspected_bug findings are NOT auto-resolved). ──
const suspected = Object.values(byResource).flat().filter((f) => f.status === 'suspected_bug')
return { resources: Object.keys(byResource), suspected_bugs: suspected, reviews: applied.filter(Boolean) }
