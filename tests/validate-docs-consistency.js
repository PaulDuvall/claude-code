#!/usr/bin/env node

/**
 * Documentation Consistency Validator
 *
 * There is already a validate-documentation-accuracy.js, but it checks exactly
 * one file -- docs/manual-uninstall-install-guide.md -- against recorded test
 * results. Nothing checked the other 50+ markdown files, which is why these all
 * sat green in CI at once:
 *
 *   - docs/npm-package-guide.md documented `claude-commands deploy --active`,
 *     `deploy --experimental` and `hooks --install`. All three exit 1 with
 *     "unknown command". There is no `deploy` or `hooks` subcommand.
 *   - hooks/README.md carried a 13-row table of hooks (session-init.sh,
 *     validate-changes.sh, backup-before-edit.sh, ...) that `git log --all`
 *     shows were never written. That file ships inside the npm package.
 *   - The same guide advertised version 0.0.1-alpha.2 against a published
 *     0.0.1-alpha.22.
 *   - CLAUDE.md claimed 10 shell + 14 Python hooks against 11 and 18.
 *
 * Each check below exists because a real defect got past CI. They are all
 * mechanical: a name either resolves to a file on disk or it does not.
 *
 * Exits 0 when every check passes, 1 otherwise.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '.pytest_cache', '__pycache__', '.ash', 'test-results']);

let failures = 0;

function check(name, problems) {
  if (problems.length === 0) {
    console.log(`   ✅ ${name}`);
    return;
  }
  console.log(`   ❌ ${name}`);
  for (const p of problems.slice(0, 20)) console.log(`        ${p}`);
  if (problems.length > 20) console.log(`        ... and ${problems.length - 20} more`);
  failures += problems.length;
}

function markdownFiles() {
  const out = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.name.endsWith('.md')) {
        out.push(path.join(dir, entry.name));
      }
    }
  })(ROOT);
  return out.sort();
}

const DOCS = markdownFiles();
const rel = p => path.relative(ROOT, p);
const read = p => fs.readFileSync(p, 'utf8');

function listing(globDir, filter) {
  const dir = path.join(ROOT, globDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(filter || (() => true));
}

/**
 * Every hook script named in a doc must exist.
 *
 * Scoped to hooks docs: elsewhere a name like `deploy.sh` is usually an example
 * in someone else's project, not a claim about this repo.
 */
function checkHookFilenames() {
  const known = new Set([
    ...listing('hooks', f => f.endsWith('.sh') || f.endsWith('.py')),
    ...listing('hooks/lib'),
    ...listing('hooks/git'),
    ...listing('scripts', f => f.endsWith('.sh') || f.endsWith('.py')),
    ...listing('scripts/testing')
  ]);
  const targets = DOCS.filter(p => /hooks\/README\.md$/.test(p));
  const problems = [];
  for (const doc of targets) {
    const names = new Set(read(doc).match(/\b[a-z0-9][a-z0-9_.-]*\.(?:sh|py)\b/g) || []);
    for (const n of names) {
      if (!known.has(n)) problems.push(`${rel(doc)}: "${n}" does not exist in hooks/, hooks/lib/, hooks/git/ or scripts/`);
    }
  }
  return problems;
}

/**
 * Every `claude-commands <sub>` a user is told to run must be a real subcommand.
 *
 * Scoped to docs that instruct. specs/ holds EARS requirements and docs/plans/
 * and docs/npm-only/ hold migration plans; all three legitimately describe
 * behaviour that is not built yet, so "claude-commands hooks --install" there is
 * a requirement, not a broken instruction. They are excluded on purpose, not
 * because the references are harmless -- `hooks`, `validate`, `rollback`,
 * `tutorial`, `migrate` and `deploy` are all specified and unimplemented.
 */
function checkCliSubcommands() {
  const bin = read(path.join(ROOT, 'claude-dev-toolkit/bin/claude-commands'));
  const real = new Set([...bin.matchAll(/\.command\('([a-z][a-z-]*)/g)].map(m => m[1]));
  if (real.size === 0) return ['could not parse any .command() out of bin/claude-commands'];

  const forwardLooking = /^(specs\/|docs\/plans\/|docs\/npm-only\/|docs\/npm-distribution-plan\.md$)/;
  // Deliberately names a command that does not exist, to show the error output.
  const allowed = new Set(['nonexistent-command']);
  const problems = [];
  for (const doc of DOCS) {
    if (forwardLooking.test(rel(doc))) continue;
    for (const m of read(doc).matchAll(/claude-commands ([a-z][a-z-]*)/g)) {
      const sub = m[1];
      if (!real.has(sub) && !allowed.has(sub)) {
        problems.push(`${rel(doc)}: "claude-commands ${sub}" is not a subcommand (have: ${[...real].sort().join(', ')})`);
      }
    }
  }
  return [...new Set(problems)];
}

/**
 * Every `/xcommand` named in the canonical docs must have a source file.
 *
 * docs/claude-custom-commands.md is excluded: it still documents the
 * pre-consolidation 62-command set and carries ~180 references to commands this
 * repo no longer has. Reconciling it is tracked separately; adding it here
 * would only park a permanent failure in CI.
 */
function checkCommandNames() {
  const real = new Set([
    ...listing('slash-commands/active', f => f.endsWith('.md')),
    ...listing('slash-commands/experiments', f => f.endsWith('.md'))
  ].map(f => f.replace(/\.md$/, '')));

  const canonical = ['README.md', 'CLAUDE.md', 'docs/npm-package-guide.md'];
  const problems = [];
  for (const name of canonical) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const m of read(p).matchAll(/\/(x[a-z][a-z-]*)\b/g)) {
      if (!real.has(m[1])) problems.push(`${name}: "/${m[1]}" has no file in slash-commands/`);
    }
  }
  return [...new Set(problems)];
}

/** Counts stated in CLAUDE.md and README.md must match what is on disk. */
function checkCounts() {
  const claude = read(path.join(ROOT, 'CLAUDE.md'));
  const readme = read(path.join(ROOT, 'README.md'));
  const actual = {
    active: listing('slash-commands/active', f => f.endsWith('.md')).length,
    experiments: listing('slash-commands/experiments', f => f.endsWith('.md')).length,
    shellHooks: listing('hooks', f => f.endsWith('.sh')).length,
    pythonHooks: listing('hooks', f => f.endsWith('.py')).length,
    libModules: listing('hooks/lib', f => f.endsWith('.sh')).length,
    shellTests: listing('tests', f => /^test_.*\.sh$/.test(f)).length,
    subagents: listing('subagents', f => f.endsWith('.md') && !/^(README|TEMPLATE)\.md$/.test(f)).length
  };
  actual.total = actual.active + actual.experiments;

  const problems = [];
  const claim = (label, text, re, expected) => {
    const m = text.match(re);
    if (!m) {
      problems.push(`${label}: could not find the claim matching ${re}`);
    } else if (Number(m[1]) !== expected) {
      problems.push(`${label}: claims ${m[1]}, actual ${expected}`);
    }
  };

  claim('CLAUDE.md shell hooks', claude, /Hook implementations \((\d+) shell/, actual.shellHooks);
  claim('CLAUDE.md python hooks', claude, /Hook implementations \(\d+ shell \+ (\d+) Python/, actual.pythonHooks);
  claim('CLAUDE.md lib modules', claude, /Hook support libraries \((\d+) shell modules/, actual.libModules);
  claim('CLAUDE.md shell tests', claude, /# (\d+) shell-based test files/, actual.shellTests);
  claim('README active badge', readme, /badge\/active%20commands-(\d+)-/, actual.active);
  claim('README experimental badge', readme, /badge\/experimental%20commands-(\d+)-/, actual.experiments);
  claim('README total badge', readme, /badge\/total%20commands-(\d+)-/, actual.total);
  claim('README subagents badge', readme, /badge\/sub--agents-(\d+)-/, actual.subagents);
  return problems;
}

/** Relative links between markdown files must resolve, including in synced copies. */
function checkRelativeLinks() {
  const problems = [];
  for (const doc of DOCS) {
    for (const m of read(doc).matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const file = target.split('#')[0];
      if (!file) continue;
      if (!fs.existsSync(path.resolve(path.dirname(doc), file))) {
        problems.push(`${rel(doc)}: link target "${target}" does not exist`);
      }
    }
  }
  return problems;
}

/**
 * No doc may state a stale version OF THE PACKAGE.
 *
 * docs/npm-package-guide.md advertised 0.0.1-alpha.2 against a published
 * 0.0.1-alpha.22. Only the package's own alpha scheme is matched: specs and
 * plans carry their own document version ("**Version:** 1.0.0"), which is a
 * different number and not this check's business. Changelog history sections
 * are skipped, since naming an old release there is the point.
 */
function checkPackageVersion() {
  const pkg = JSON.parse(read(path.join(ROOT, 'claude-dev-toolkit/package.json')));
  const current = pkg.version;
  const scheme = /\b(\d+\.\d+\.\d+-alpha\.\d+)\b/g;
  const historyish = /(recent updates|changelog|version history|release notes)/i;
  // Dated snapshots: naming the version they were written against is correct.
  const historical = /^docs\/analysis\//;
  const problems = [];
  for (const doc of DOCS) {
    if (historical.test(rel(doc))) continue;
    const lines = read(doc).split('\n');
    let historyDepth = 0; // 0 = not in a history section
    lines.forEach((line, i) => {
      const heading = line.match(/^(#{1,6})\s/);
      if (heading) {
        const depth = heading[1].length;
        // Subheadings stay inside the section that opened the history block;
        // a heading at the same or shallower level closes it.
        if (historyDepth && depth <= historyDepth) historyDepth = 0;
        if (!historyDepth && historyish.test(line)) historyDepth = depth;
      }
      if (historyDepth) return;
      for (const m of line.matchAll(scheme)) {
        if (m[1] !== current) {
          problems.push(`${rel(doc)}:${i + 1}: states ${m[1]}, package.json is ${current}`);
        }
      }
    });
  }
  return problems;
}

/** Source and npm-package copies of synced docs must not drift. */
function checkSyncedCopies() {
  const pairs = [
    ['hooks/README.md', 'claude-dev-toolkit/hooks/README.md'],
    ['templates/README.md', 'claude-dev-toolkit/templates/README.md'],
    ['templates/global-claude.md', 'claude-dev-toolkit/templates/global-claude.md'],
    ['templates/headless-examples.md', 'claude-dev-toolkit/templates/headless-examples.md']
  ];
  const problems = [];
  for (const [src, copy] of pairs) {
    const a = path.join(ROOT, src);
    const b = path.join(ROOT, copy);
    if (!fs.existsSync(a) || !fs.existsSync(b)) continue;
    if (read(a) !== read(b)) {
      problems.push(`${src} and ${copy} differ -- run: bash scripts/sync-to-npm.sh`);
    }
  }
  return problems;
}

console.log(`🔍 Validating documentation consistency across ${DOCS.length} markdown files...\n`);
check('hook filenames in hooks docs resolve to real files', checkHookFilenames());
check('claude-commands subcommands in docs are real', checkCliSubcommands());
check('/xcommand names in canonical docs have source files', checkCommandNames());
check('counts in CLAUDE.md and README.md match the repo', checkCounts());
check('relative markdown links resolve', checkRelativeLinks());
check('no doc hardcodes a stale package version', checkPackageVersion());
check('synced npm copies match their source', checkSyncedCopies());

console.log('');
if (failures > 0) {
  console.log(`❌ ${failures} documentation inconsistency/inconsistencies found`);
  process.exit(1);
}
console.log('✅ Documentation is consistent with the repository');
