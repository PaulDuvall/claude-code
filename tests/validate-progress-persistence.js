#!/usr/bin/env node

/**
 * Progress Persistence Validator
 *
 * The install-guide tester runs as four separate node processes (pre-setup,
 * execute, validate, report), one per workflow step. Results survive between
 * them only through test-results/<scenario>-progress.json.
 *
 * Every phase used to start from `steps: []` and overwrite that file, so the
 * validate phase discarded everything the execute phase had just recorded. A
 * real run showed 17 steps executed with at least 3 failing, then reported
 * "Loaded 1 steps from previous execution ... All tests passed!" and the job
 * went green. These tests pin the contract that broke:
 *
 *   1. the execute phase appends to what pre-setup wrote
 *   2. the validate phase appends to what execute wrote
 *   3. the report phase counts a recorded failure and exits non-zero
 *
 * Exits 0 when all cases pass, 1 otherwise.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { InstallGuideTester } = require('./install-guide-tester.js');

const SCENARIO = 'progress-persistence-selftest';
const RESULTS_DIR = path.join(__dirname, 'test-results');
const PROGRESS_FILE = path.join(RESULTS_DIR, `${SCENARIO}-progress.json`);

let failures = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log(`   ✅ ${name}`);
  } else {
    console.log(`   ❌ ${name}${detail ? `: ${detail}` : ''}`);
    failures++;
  }
}

function sentinelStep(name, status = 'passed') {
  return {
    name,
    type: 'execution',
    status,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    commands: [],
    validations: []
  };
}

function seedProgress(steps) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    scenario: SCENARIO,
    startTime: new Date().toISOString(),
    steps,
    summary: { passed: 0, failed: 0, skipped: 0 },
    platform: process.platform,
    nodeVersion: process.version,
    errors: []
  }, null, 2));
}

function readProgress() {
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
}

function stepNames() {
  return readProgress().steps.map(step => step.name);
}

function cleanup() {
  if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
  for (const file of fs.existsSync(RESULTS_DIR) ? fs.readdirSync(RESULTS_DIR) : []) {
    if (file.startsWith(`report-${SCENARIO}-`)) {
      fs.unlinkSync(path.join(RESULTS_DIR, file));
    }
  }
}

async function testExecuteAppends() {
  console.log('\n🔍 execute phase appends to what pre-setup wrote');
  seedProgress([sentinelStep('Pre-Setup')]);

  const tester = new InstallGuideTester(SCENARIO);
  // Inject an empty suite so no guide commands run; the persistence behaviour
  // is what is under test, not the guide itself.
  tester.testSuite = { testSteps: [] };
  await tester.runExecute();

  const names = stepNames();
  check('pre-setup step survives the execute phase', names.includes('Pre-Setup'),
    `steps on disk: ${JSON.stringify(names)}`);
}

async function testValidateAppends() {
  console.log('\n🔍 validate phase appends to what execute wrote');
  seedProgress([
    sentinelStep('Pre-Setup'),
    sentinelStep('Guide Step That Passed'),
    sentinelStep('Guide Step That Failed', 'failed')
  ]);

  const tester = new InstallGuideTester(SCENARIO);
  // Stub the environment-dependent checks: this test is about what the phase
  // keeps, not about whether the toolkit happens to be installed here.
  const stub = async () => ({ name: 'stubbed', status: 'passed' });
  tester.validateNpmPackage = stub;
  tester.validateClaudeCommands = stub;
  tester.validateCommandsDeployment = stub;
  tester.validateBasicFunctionality = stub;
  await tester.runValidate();

  const names = stepNames();
  check('all three earlier steps survive', names.length >= 3 &&
    ['Pre-Setup', 'Guide Step That Passed', 'Guide Step That Failed']
      .every(n => names.includes(n)),
    `steps on disk: ${JSON.stringify(names)}`);
  check('validate appends its own step', names.includes('Final Validation'),
    `steps on disk: ${JSON.stringify(names)}`);
}

function testReportFailsOnRecordedFailure() {
  console.log('\n🔍 report phase fails the job on a recorded failure');
  seedProgress([
    sentinelStep('Guide Step That Passed'),
    sentinelStep('Guide Step That Failed', 'failed')
  ]);

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'install-guide-tester.js'),
    `--scenario=${SCENARIO}`,
    '--phase=report'
  ], { encoding: 'utf8' });

  const out = `${result.stdout || ''}${result.stderr || ''}`;
  check('exits non-zero', result.status === 1, `exit code was ${result.status}`);
  check('counts the failure', /❌ Failed: 1/.test(out), 'summary line missing');
  check('does not claim success', !/All tests passed/.test(out),
    'reported success despite a failed step');
}

function testReportPassesWhenClean() {
  console.log('\n🔍 report phase still passes when every step passed');
  seedProgress([sentinelStep('Guide Step That Passed')]);

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'install-guide-tester.js'),
    `--scenario=${SCENARIO}`,
    '--phase=report'
  ], { encoding: 'utf8' });

  const out = `${result.stdout || ''}${result.stderr || ''}`;
  check('exits zero', result.status === 0, `exit code was ${result.status}`);
  check('reports success', /All tests passed/.test(out), 'success line missing');
}

(async () => {
  console.log('🔍 Validating install-guide progress persistence...');
  try {
    await testExecuteAppends();
    await testValidateAppends();
    testReportFailsOnRecordedFailure();
    testReportPassesWhenClean();
  } catch (error) {
    console.error(`\n❌ Validator crashed: ${error.stack || error.message}`);
    failures++;
  } finally {
    cleanup();
  }

  console.log('');
  if (failures > 0) {
    console.log(`❌ ${failures} check(s) failed`);
    process.exit(1);
  }
  console.log('✅ Progress persists across all phases');
})();
