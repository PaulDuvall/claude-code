#!/usr/bin/env node

/**
 * Command Execution Validator
 *
 * The install-guide tester runs each documented command in its own shell. Three
 * consequences of that made green runs impossible once results were recorded
 * honestly, and this file pins the fixes:
 *
 *   1. `cd` changed a shell that immediately exited, so every later command ran
 *      in $HOME. `cp -r ~/.claude .claude` then resolved its destination inside
 *      its source and failed with "cannot copy a directory into itself" —
 *      blamed on the guide, caused by the harness.
 *   2. A command the harness itself marks as allowed-to-fail still failed the
 *      step, because the flag was set on a normalized copy the caller never saw.
 *   3. `git push` follows `git remote add origin YOUR_REPOSITORY_URL`, which is
 *      skipped as a placeholder. With no remote it can never succeed.
 *
 * Exits 0 when all cases pass, 1 otherwise.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const { InstallGuideTester } = require('./install-guide-tester.js');

let failures = 0;
const homes = [];

function check(name, condition, detail) {
  if (condition) {
    console.log(`   ✅ ${name}`);
  } else {
    console.log(`   ❌ ${name}${detail ? `: ${detail}` : ''}`);
    failures++;
  }
}

function makeHome() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-exec-'));
  fs.mkdirSync(path.join(home, '.claude', 'commands'), { recursive: true });
  fs.writeFileSync(path.join(home, '.claude', 'settings.json'), '{}');
  homes.push(home);
  return home;
}

function makeTester() {
  const home = makeHome();
  const tester = new InstallGuideTester('npm-fresh-install');
  tester.testHome = home;
  tester.currentDir = home;
  tester.ensureGitIdentity();
  return tester;
}

function step(name, commands) {
  return { section: 'Self Test', step: name, commands: commands.map(raw => ({ raw })) };
}

async function testCdPersists() {
  console.log('\n🔍 `cd` carries into the commands after it');
  const tester = makeTester();
  fs.mkdirSync(path.join(tester.testHome, 'workspace'));

  await tester.executeStep(step('cd then write', [
    'cd ~/workspace',
    'touch marker.txt'
  ]));

  check('working directory tracked', tester.currentDir === path.join(tester.testHome, 'workspace'),
    `currentDir was ${tester.currentDir}`);
  check('later command ran there',
    fs.existsSync(path.join(tester.testHome, 'workspace', 'marker.txt')),
    'marker.txt was not created in the directory that was cd-ed into');
  check('step passed', tester.results.steps[0].status === 'passed',
    tester.results.steps[0].error);
}

async function testCdAcrossSteps() {
  console.log('\n🔍 `cd` carries across steps, as it would in one terminal');
  const tester = makeTester();
  fs.mkdirSync(path.join(tester.testHome, 'workspace'));

  await tester.executeStep(step('first', ['cd ~/workspace']));
  await tester.executeStep(step('second', ['touch second.txt']));

  check('second step ran in the directory the first moved to',
    fs.existsSync(path.join(tester.testHome, 'workspace', 'second.txt')),
    'the working directory reset between steps');
}

async function testCdToMissingDirectoryFails() {
  console.log('\n🔍 `cd` into a missing directory still fails');
  const tester = makeTester();
  await tester.executeStep(step('bad cd', ['cd ~/definitely-not-here']));

  check('step failed', tester.results.steps[0].status === 'failed', 'a bad cd was treated as success');
  check('directory unchanged', tester.currentDir === tester.testHome,
    `currentDir moved to ${tester.currentDir}`);
}

async function testAllowedFailureDoesNotFailStep() {
  console.log('\n🔍 a command the harness forgives does not fail the step');
  const tester = makeTester();
  // Matches the harness's own allow-failure list, and fails here because there
  // is no .claude/ directory in the working directory to copy into.
  await tester.executeStep(step('forgiven', ['cp -r ~/.claude/* .claude/']));

  const result = tester.results.steps[0];
  check('command recorded as failed', result.commands[0].status === 'failed',
    `command status was ${result.commands[0].status}`);
  check('step still passed', result.status === 'passed',
    `step failed with: ${result.error}`);
}

async function testUnforgivenFailureStillFailsStep() {
  console.log('\n🔍 an ordinary failing command still fails the step');
  const tester = makeTester();
  await tester.executeStep(step('genuine failure', ['ls /no/such/path/at/all']));

  check('step failed', tester.results.steps[0].status === 'failed',
    'a real failure was swallowed');
}

async function testGitPushWithoutRemoteIsSkipped() {
  console.log('\n🔍 `git push` with no remote is skipped, not failed');
  const tester = makeTester();
  const repo = path.join(tester.testHome, 'repo');
  fs.mkdirSync(repo);
  execSync('git init -q', { cwd: repo });
  tester.currentDir = repo;

  await tester.executeStep(step('push', ['git push -u origin main']));

  const result = tester.results.steps[0];
  check('command skipped', result.commands[0].status === 'skipped',
    `command status was ${result.commands[0].status}`);
  check('step passed', result.status === 'passed', result.error);
}

function cleanup() {
  for (const home of homes) {
    try {
      fs.rmSync(home, { recursive: true, force: true });
    } catch (error) {
      // A leftover temp directory is not worth failing the run over.
    }
  }
}

(async () => {
  console.log('🔍 Validating install-guide command execution...');
  try {
    await testCdPersists();
    await testCdAcrossSteps();
    await testCdToMissingDirectoryFails();
    await testAllowedFailureDoesNotFailStep();
    await testUnforgivenFailureStillFailsStep();
    await testGitPushWithoutRemoteIsSkipped();
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
  console.log('✅ Commands run where the guide says they do');
})();
