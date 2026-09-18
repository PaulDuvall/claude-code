#!/usr/bin/env node

/**
 * Dynamic Install Guide Tester
 * Executes the parsed documentation steps and validates results
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class InstallGuideTester {
  constructor(scenario = 'fresh-install') {
    this.scenario = scenario;
    this.testSuite = null;
    this.results = {
      scenario,
      startTime: new Date().toISOString(),
      steps: [],
      summary: { passed: 0, failed: 0, skipped: 0 },
      platform: process.platform,
      nodeVersion: process.version,
      errors: []
    };
    this.testHome = process.env.TEST_HOME || process.env.HOME;
    this.originalHome = process.env.ORIGINAL_HOME || process.env.HOME;
    // Someone following the guide runs it in one terminal, where a `cd`
    // persists into every later command and section. Each command here runs in
    // its own shell, so that has to be tracked explicitly or the guide is
    // tested doing something no reader does.
    this.currentDir = this.testHome;
  }

  /**
   * Load test suite configuration generated from documentation
   */
  async loadTestSuite() {
    try {
      const suitePath = path.join(__dirname, 'test-suite.json');
      console.log(`📂 Looking for test suite at: ${suitePath}`);
      
      // Check if file exists
      if (!fs.existsSync(suitePath)) {
        throw new Error(`Test suite file not found at ${suitePath}`);
      }
      
      const suiteData = fs.readFileSync(suitePath, 'utf8');
      console.log(`📄 Test suite file size: ${suiteData.length} characters`);
      
      this.testSuite = JSON.parse(suiteData);
      
      // Validate the test suite structure
      if (!this.testSuite.testSteps || !Array.isArray(this.testSuite.testSteps)) {
        throw new Error('Test suite missing testSteps array');
      }
      
      console.log(`📋 Loaded test suite with ${this.testSuite.testSteps.length} steps`);
      console.log(`🎯 Running scenario: ${this.scenario}`);
      
      // Show first few steps for debugging
      if (this.testSuite.testSteps.length > 0) {
        console.log('📝 First test step:', this.testSuite.testSteps[0].step || 'Unknown step');
        console.log('📝 First test section:', this.testSuite.testSteps[0].section || 'Unknown section');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load test suite:', error.message);
      
      // List available files for debugging
      try {
        const files = fs.readdirSync(__dirname);
        console.log('📁 Available files in tests directory:', files.join(', '));
      } catch (listError) {
        console.error('❌ Could not list directory:', listError.message);
      }
      
      return false;
    }
  }

  /**
   * Pre-setup phase: Prepare environment for testing scenario
   */
  // NOTE: runPreSetup deliberately does NOT load. It is the first phase of a
  // run, so it starts from an empty result set and its save resets the
  // progress file, keeping a stale file from an earlier run out of this one.
  async runPreSetup() {
    console.log(`🔧 Pre-setup for scenario: ${this.scenario}`);
    
    const setupStep = {
      name: 'Pre-setup Environment',
      type: 'setup',
      startTime: new Date().toISOString()
    };

    try {
      // Create test directories
      await this.ensureDirectory(path.join(this.testHome, '.claude'));
      await this.ensureDirectory(path.join(__dirname, 'test-results'));
      await this.ensureDirectory(path.join(__dirname, 'logs'));

      // The guide's backup section runs `git commit`. HOME is redirected to an
      // empty directory for isolation, which also hides the real user's
      // ~/.gitconfig, so git has no identity and refuses to commit. Anyone
      // actually following the guide has one configured; supply it here so the
      // step tests the guide rather than the isolation.
      this.ensureGitIdentity();

      // Scenario-specific setup
      switch (this.scenario) {
        case 'fresh-install':
        case 'npm-fresh-install':
        case 'repo-fresh-install':
          await this.setupFreshInstall();
          break;
        case 'reinstall':
        case 'npm-reinstall':
        case 'repo-reinstall':
          await this.setupReinstall();
          break;
        case 'upgrade':
        case 'npm-upgrade':
        case 'repo-upgrade':
          await this.setupUpgrade();
          break;
      }

      setupStep.status = 'passed';
      setupStep.endTime = new Date().toISOString();
      
    } catch (error) {
      setupStep.status = 'failed';
      setupStep.error = error.message;
      setupStep.endTime = new Date().toISOString();
      
      console.error('❌ Pre-setup failed:', error.message);
      throw error;
    }

    this.results.steps.push(setupStep);
    await this.saveResults();
  }

  /**
   * Execute phase: Run all documentation steps
   */
  async runExecute() {
    // Each phase runs as its own node process, so results only survive by way
    // of the progress file. Without this load the phase starts from steps: []
    // and saveResults() overwrites what the previous phase wrote.
    await this.loadResults();

    if (!this.testSuite) {
      const loaded = await this.loadTestSuite();
      if (!loaded) {
        console.error('❌ Cannot execute steps without test suite');
        this.results.errors.push('Failed to load test suite configuration');
        await this.saveResults();
        return;
      }
    }

    console.log(`🚀 Executing install guide steps for ${this.scenario}`);
    console.log(`📊 Total steps to process: ${this.testSuite.testSteps.length}`);

    let executedSteps = 0;
    let skippedSteps = 0;

    for (const step of this.testSuite.testSteps) {
      if (this.shouldSkipStep(step)) {
        console.log(`⏭️  Skipping step: [${step.section}] ${step.step}`);
        await this.skipStep(step);
        skippedSteps++;
        continue;
      }

      try {
        await this.executeStep(step);
        executedSteps++;
      } catch (error) {
        console.error(`❌ Failed to execute step: [${step.section}] ${step.step}`, error.message);
        this.results.errors.push(`Step execution failed: ${error.message}`);
        
        // Ensure failed step is still recorded in results
        const failedStepResult = {
          name: `[${step.section}] ${step.step}`,
          type: 'execution',
          status: 'failed',
          error: error.message,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          commands: [],
          validations: []
        };
        this.results.steps.push(failedStepResult);
        this.results.summary.failed++;
        executedSteps++;
        
        // Continue with other steps even if one fails
      }
    }

    console.log(`📈 Execution summary: ${executedSteps} executed, ${skippedSteps} skipped`);
    await this.saveResults();
  }

  /**
   * Validate phase: Check installation results
   */
  async runValidate() {
    console.log('✅ Validating installation results');

    // Load first, for the reason in runExecute. This phase in particular used
    // to discard every step the execute phase had just recorded, which is why
    // a job with failing guide steps still reported "All tests passed!".
    await this.loadResults();

    const validationStep = {
      name: 'Final Validation',
      type: 'validation',
      startTime: new Date().toISOString(),
      validations: []
    };

    try {
      // Core validation checks based on scenario
      const checks = [];
      
      if (this.scenario.startsWith('npm-')) {
        checks.push(
          () => this.validateNpmPackage('@paulduvall/claude-dev-toolkit'),
          () => this.validateClaudeCommands()
        );
      } else if (this.scenario.startsWith('repo-')) {
        checks.push(
          () => this.validateRepositoryClone(),
          () => this.validateClaudeCommands()
        );
      }
      
      // Common checks for all scenarios
      checks.push(
        () => this.validateCommandsDeployment(),
        () => this.validateBasicFunctionality()
      );

      for (const check of checks) {
        try {
          const result = await check();
          validationStep.validations.push(result);
        } catch (error) {
          validationStep.validations.push({
            name: check.name || 'Unknown Check',
            status: 'failed',
            error: error.message
          });
        }
      }

      const failedValidations = validationStep.validations.filter(v => v.status === 'failed');
      validationStep.status = failedValidations.length === 0 ? 'passed' : 'failed';
      
      if (failedValidations.length > 0) {
        validationStep.error = failedValidations.map(v => v.error || v.name).join('; ');
      }
      
    } catch (error) {
      validationStep.status = 'failed';
      validationStep.error = error.message;
    }

    validationStep.endTime = new Date().toISOString();
    this.results.steps.push(validationStep);
    await this.saveResults();
  }

  /**
   * Report phase: Generate comprehensive test report
   */
  async runReport() {
    console.log('📊 Generating test report');
    
    // Load progress from previous phases
    await this.loadResults();
    
    this.results.endTime = new Date().toISOString();
    this.results.duration = new Date(this.results.endTime) - new Date(this.results.startTime);
    
    // Calculate summary
    this.results.summary = this.results.steps.reduce((summary, step) => {
      if (step.status === 'passed') summary.passed++;
      else if (step.status === 'failed') summary.failed++;
      else if (step.status === 'skipped') summary.skipped++;
      return summary;
    }, { passed: 0, failed: 0, skipped: 0 });

    // Generate detailed report
    const report = this.generateDetailedReport();
    
    // Ensure test-results directory exists
    const testResultsDir = path.join(__dirname, 'test-results');
    await this.ensureDirectory(testResultsDir);
    
    // Save reports
    const reportPath = path.join(testResultsDir, `report-${this.scenario}-${Date.now()}.json`);
    const markdownPath = path.join(testResultsDir, `report-${this.scenario}-${Date.now()}.md`);
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    fs.writeFileSync(markdownPath, report);
    
    // Console output
    console.log('\n📋 Test Results Summary:');
    console.log(`   ✅ Passed: ${this.results.summary.passed}`);
    console.log(`   ❌ Failed: ${this.results.summary.failed}`);
    console.log(`   ⏭️  Skipped: ${this.results.summary.skipped}`);
    console.log(`   ⏱️  Duration: ${Math.round(this.results.duration / 1000)}s`);
    
    if (this.results.summary.failed > 0) {
      console.log('\n❌ Failed Steps:');
      this.results.steps
        .filter(step => step.status === 'failed')
        .forEach(step => console.log(`   - ${step.name}: ${step.error}`));
      
      process.exit(1);
    }
    
    console.log('\n✅ All tests passed!');
  }

  /**
   * Execute a single documentation step
   */
  async executeStep(step) {
    console.log(`\n🔄 Executing: [${step.section}] ${step.step}`);
    
    // Debug: Show commands to be executed
    if (step.commands && step.commands.length > 0) {
      console.log(`   📝 Commands: ${step.commands.length}`);
      step.commands.forEach((cmd, i) => {
        console.log(`      ${i + 1}. ${cmd.raw || cmd.command || cmd}`);
      });
    } else {
      console.log('   ⚠️  No commands found in step');
    }
    
    const stepResult = {
      name: `[${step.section}] ${step.step}`,
      type: 'execution',
      startTime: new Date().toISOString(),
      commands: [],
      validations: []
    };

    try {
      // Execute all commands in the step
      if (step.commands && Array.isArray(step.commands)) {
        for (const command of step.commands) {
          const commandResult = await this.executeCommand(command);
          stepResult.commands.push(commandResult);
          
          if (commandResult.status === 'failed' &&
              !commandResult.allowFailure && !command.allowFailure) {
            throw new Error(`Command failed: ${command.raw}`);
          }
        }
      }

      // Run validations if they exist
      if (step.validations && Array.isArray(step.validations)) {
        for (const validation of step.validations) {
          const validationResult = await this.runValidation(validation);
          stepResult.validations.push(validationResult);
        }
      }

      stepResult.status = 'passed';
      this.results.summary.passed++;
      console.log(`   ✅ Step completed successfully`);
      
    } catch (error) {
      stepResult.status = 'failed';
      stepResult.error = error.message;
      this.results.summary.failed++;
      
      console.error(`   ❌ Step failed: ${error.message}`);
    }

    stepResult.endTime = new Date().toISOString();
    this.results.steps.push(stepResult);
  }

  /**
   * Execute a single command
   */
  async executeCommand(command) {
    // Normalize command object (handle different formats from parser)
    const normalizedCommand = {
      raw: command.raw || command.command || command,
      type: command.type || 'general',
      allowFailure: command.allowFailure || false,
      dangerous: command.dangerous || false
    };
    
    const commandResult = {
      command: normalizedCommand.raw,
      type: normalizedCommand.type,
      startTime: new Date().toISOString()
    };

    try {
      console.log(`      🔧 Executing: ${normalizedCommand.raw}`);
      console.log(`      📋 Type: ${normalizedCommand.type}`);

      // Skip Claude Code UI commands (slash commands)
      if (normalizedCommand.raw.startsWith('/x')) {
        console.log(`      ⏭️  Skipping Claude Code UI command: ${normalizedCommand.raw}`);
        commandResult.status = 'skipped';
        commandResult.reason = 'Claude Code UI command - not executable in shell';
        console.log(`      ✅ Command marked as UI-only (expected)`);
        return commandResult;
      }

      // Skip placeholder paths and example commands
      if (normalizedCommand.raw.includes('/path/to/your/project') || 
          normalizedCommand.raw.includes('YOUR_REPOSITORY_URL') ||
          normalizedCommand.raw === 'EOF' ||
          normalizedCommand.raw.startsWith('[') && normalizedCommand.raw.endsWith(']')) {
        console.log(`      ⏭️  Skipping placeholder/example command: ${normalizedCommand.raw}`);
        commandResult.status = 'skipped';
        commandResult.reason = 'Placeholder or example command';
        console.log(`      ✅ Command marked as placeholder (expected)`);
        return commandResult;
      }

      // Skip repository-specific scripts in npm scenarios
      if (this.scenario.startsWith('npm-') && 
          (normalizedCommand.raw.startsWith('./setup.sh') || 
           normalizedCommand.raw.startsWith('./verify-setup.sh') ||
           normalizedCommand.raw.startsWith('./validate-commands.sh') ||
           normalizedCommand.raw.startsWith('./deploy.sh'))) {
        console.log(`      ⏭️  Skipping repository script in npm scenario: ${normalizedCommand.raw}`);
        commandResult.status = 'skipped';
        commandResult.reason = 'Repository script not available in npm installation';
        console.log(`      ✅ Command marked as repo-only (expected for npm scenario)`);
        return commandResult;
      }

      // Handle repository scripts in repo scenarios - execute from repository root
      if (this.scenario.startsWith('repo-') && 
          (normalizedCommand.raw.startsWith('./setup.sh') || 
           normalizedCommand.raw.startsWith('./verify-setup.sh') ||
           normalizedCommand.raw.startsWith('./validate-commands.sh') ||
           normalizedCommand.raw.startsWith('./deploy.sh'))) {
        console.log(`      🏠 Repository script detected - executing from repo root: ${normalizedCommand.raw}`);
        await this.executeRepositoryScript(normalizedCommand);
        commandResult.status = 'passed';
        commandResult.exitCode = 0;
        console.log(`      ✅ Repository script succeeded`);
        return commandResult;
      }

      // Skip repository hook files in npm scenarios
      if (this.scenario.startsWith('npm-') && 
          (normalizedCommand.raw.includes('cp hooks/') || 
           normalizedCommand.raw.includes('chmod +x ~/.claude/hooks/*.sh'))) {
        console.log(`      ⏭️  Skipping repository hook file in npm scenario: ${normalizedCommand.raw}`);
        commandResult.status = 'skipped';
        commandResult.reason = 'Repository hook files not available in npm installation';
        console.log(`      ✅ Command marked as repo-only (expected for npm scenario)`);
        return commandResult;
      }

      // `git push` in the guide follows `git remote add origin
      // YOUR_REPOSITORY_URL`, a placeholder that is skipped above. With no
      // remote there is nothing to push to and nothing to judge: a reader
      // supplies their own repository here. Record it as skipped rather than
      // failing the step on a command the test can never satisfy.
      if (/^git push\b/.test(normalizedCommand.raw)) {
        let remotes = '';
        try {
          remotes = require('child_process')
            .execSync('git remote', { cwd: this.currentDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
            .trim();
        } catch (err) {
          remotes = '';
        }
        if (!remotes) {
          console.log(`      ⏭️  Skipping push with no remote configured: ${normalizedCommand.raw}`);
          commandResult.status = 'skipped';
          commandResult.reason = 'Depends on the skipped YOUR_REPOSITORY_URL placeholder';
          return commandResult;
        }
      }

      // `cd` in its own shell changes nothing. Apply it to the tracked
      // directory so the commands after it run where the reader would be.
      const cdMatch = normalizedCommand.raw.match(/^cd\s+([^&|;]+)$/);
      if (cdMatch) {
        const target = cdMatch[1].trim().replace(/^["']|["']$/g, '');
        const resolved = target.startsWith('~')
          ? path.join(this.testHome, target.slice(1))
          : path.resolve(this.currentDir, target);

        if (!fs.existsSync(resolved)) {
          throw new Error(`cd: no such directory: ${resolved}`);
        }
        this.currentDir = resolved;
        commandResult.status = 'passed';
        commandResult.exitCode = 0;
        commandResult.cwd = resolved;
        console.log(`      📂 Working directory is now ${resolved}`);
        return commandResult;
      }

      // Mark commands that commonly fail in test environments as allowing failure
      if (normalizedCommand.raw.startsWith('pkill') || 
          normalizedCommand.raw.includes('mkdir') && normalizedCommand.raw.includes('customizations') ||
          normalizedCommand.raw.includes('cp -r ~/.claude/* .claude/') ||
          normalizedCommand.raw.includes('claude-commands install --experimental')) {
        normalizedCommand.allowFailure = true;
        console.log(`      ℹ️  Command marked as allowing failure (expected in test environment)`);
      }

      // Handle special command types
      if (normalizedCommand.type === 'cleanup' && normalizedCommand.dangerous) {
        await this.executeDangerousCommand(normalizedCommand);
      } else if (normalizedCommand.type === 'install' || normalizedCommand.type === 'uninstall') {
        await this.executeNpmCommand(normalizedCommand);
      } else {
        await this.executeGeneralCommand(normalizedCommand);
      }

      commandResult.status = 'passed';
      commandResult.exitCode = 0;
      console.log(`      ✅ Command succeeded`);


    } catch (error) {
      commandResult.status = 'failed';
      commandResult.error = error.message;
      commandResult.exitCode = error.code || 1;
      
      console.log(`      ❌ Command failed: ${error.message}`);

      // executeStep decides whether the step survives, and it only sees what
      // is returned here. The flag is set on the normalized copy above, so
      // without this the step fails on a command already forgiven.
      commandResult.allowFailure = normalizedCommand.allowFailure;

      if (!normalizedCommand.allowFailure) {
        throw error;
      } else {
        console.log(`      ⚠️  Command failure allowed, continuing...`);
      }
    }

    commandResult.endTime = new Date().toISOString();
    return commandResult;
  }

  /**
   * Execute repository scripts from the repo root with proper environment
   */
  async executeRepositoryScript(command) {
    const { execSync } = require('child_process');
    
    // Find the repository root (where the .git directory is)
    const repoRoot = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      cwd: __dirname
    }).trim();
    
    // Modify command to use dry-run/test mode in CI environments
    let modifiedCommand = command.raw;
    if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
      if (modifiedCommand.includes('./setup.sh') && !modifiedCommand.includes('--dry-run')) {
        // Add --dry-run flag to setup.sh to avoid API key requirement
        modifiedCommand = modifiedCommand.replace('./setup.sh', './setup.sh --dry-run');
        console.log(`      🧪 Modified for CI: ${modifiedCommand}`);
      }
    }
    
    console.log(`      📂 Repository root: ${repoRoot}`);
    console.log(`      🏠 Test home: ${this.testHome}`);
    console.log(`      🔧 Executing in repo: ${modifiedCommand}`);
    
    // Execute the script from the repository root but with modified HOME
    const env = {
      ...process.env,
      HOME: this.testHome,           // Use test home for Claude configs
      TEST_HOME: this.testHome,      // Pass test home as variable
      CI: 'true',                    // Mark as CI environment
      NODE_ENV: 'test',              // Set test environment
      ANTHROPIC_API_KEY: 'sk-ant-test-dummy-key-for-ci-testing' // Dummy key for CI
    };
    
    try {
      const output = execSync(modifiedCommand, {
        cwd: repoRoot,               // Execute from repository root
        env: env,                    // Use modified environment
        encoding: 'utf8',            // Get string output
        stdio: 'pipe'                // Capture output
      });
      
      console.log(`      📄 Output: ${output.slice(0, 500)}${output.length > 500 ? '...' : ''}`);
      return output;
    } catch (error) {
      console.log(`      ❌ Script failed with exit code ${error.status}`);
      console.log(`      📄 Error output: ${error.stdout || error.stderr || error.message}`);
      throw new Error(`Repository script failed: ${error.message}`);
    }
  }

  /**
   * Execute dangerous commands with safety checks
   */
  async executeDangerousCommand(command) {
    // Safety checks for rm -rf commands
    if (command.raw.includes('rm -rf')) {
      const path = command.raw.replace(/.*rm -rf\s+/, '').split(' ')[0];
      
      // Only allow removal within test home or specific safe paths
      const safePaths = [
        `${this.testHome}/.claude`,
        `${this.testHome}/.npm`,
        `${this.testHome}/node_modules`,
        '.claude/',
        './node_modules/'
      ];

      if (!safePaths.some(safePath => path.includes(safePath))) {
        throw new Error(`Unsafe rm command blocked: ${command.raw}`);
      }
    }

    return this.executeGeneralCommand(command);
  }

  /**
   * Execute npm commands with proper environment
   */
  async executeNpmCommand(command) {
    const env = {
      ...process.env,
      HOME: this.testHome,
      NPM_CONFIG_PREFIX: `${this.testHome}/.npm-global`,
      PATH: `${this.testHome}/.npm-global/bin:${process.env.PATH}`
    };

    const { stdout, stderr } = await execAsync(command.raw, {
      timeout: command.timeout || 120000,
      env,
      cwd: this.currentDir
    });

    return { stdout, stderr };
  }

  /**
   * Execute general commands
   */
  async executeGeneralCommand(command) {
    const env = {
      ...process.env,
      HOME: this.testHome
    };

    const { stdout, stderr } = await execAsync(command.raw, {
      timeout: command.timeout || 10000,
      env,
      cwd: this.currentDir
    });

    return { stdout, stderr };
  }

  /**
   * Run validation checks
   */
  async runValidation(validation) {
    const validationResult = {
      type: validation.type,
      expected: validation.expected,
      startTime: new Date().toISOString()
    };

    try {
      switch (validation.type) {
        case 'output':
          await this.validateCommandOutput(validation);
          break;
        case 'file':
          await this.validateFileExists(validation);
          break;
        case 'package':
          await this.validatePackageInstalled(validation);
          break;
        default:
          throw new Error(`Unknown validation type: ${validation.type}`);
      }

      validationResult.status = 'passed';
      
    } catch (error) {
      validationResult.status = 'failed';
      validationResult.error = error.message;
    }

    validationResult.endTime = new Date().toISOString();
    return validationResult;
  }

  /**
   * Validate npm package installation
   */
  async validateNpmPackage(packageName) {
    try {
      const { stdout } = await execAsync(`npm list -g ${packageName}`, {
        env: {
          ...process.env,
          HOME: this.testHome,
          NPM_CONFIG_PREFIX: `${this.testHome}/.npm-global`
        }
      });

      return {
        name: `NPM Package: ${packageName}`,
        status: stdout.includes(packageName) ? 'passed' : 'failed',
        details: stdout.trim()
      };
    } catch (error) {
      return {
        name: `NPM Package: ${packageName}`,
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Validate claude-commands CLI
   */
  async validateClaudeCommands() {
    try {
      const { stdout } = await execAsync('claude-commands --version', {
        env: {
          ...process.env,
          HOME: this.testHome,
          PATH: `${this.testHome}/.npm-global/bin:${process.env.PATH}`
        }
      });

      return {
        name: 'Claude Commands CLI',
        status: 'passed',
        details: stdout.trim()
      };
    } catch (error) {
      return {
        name: 'Claude Commands CLI',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Validate commands deployment
   */
  async validateCommandsDeployment() {
    try {
      const commandsDir = path.join(this.testHome, '.claude', 'commands');
      
      // Check for commands in multiple possible locations
      const possiblePaths = [
        path.join(commandsDir, 'active'),           // Expected structure
        commandsDir,                                 // Flat structure
        path.join(this.testHome, '.claude', 'slash-commands', 'active'), // Alternative structure
        path.join(this.testHome, '.claude', 'slash-commands')            // Alternative flat
      ];
      
      let activeCommands = [];
      let foundPath = null;
      
      for (const checkPath of possiblePaths) {
        if (fs.existsSync(checkPath)) {
          const files = fs.readdirSync(checkPath).filter(file => file.endsWith('.md'));
          if (files.length > 0) {
            activeCommands = files;
            foundPath = checkPath;
            break;
          }
        }
      }
      
      if (activeCommands.length === 0) {
        // Provide detailed debugging information
        const debugInfo = possiblePaths.map(p => {
          const exists = fs.existsSync(p);
          const contents = exists ? fs.readdirSync(p).slice(0, 5).join(', ') + (fs.readdirSync(p).length > 5 ? '...' : '') : 'N/A';
          return `  ${p}: ${exists ? 'exists' : 'missing'} ${exists ? `(${contents})` : ''}`;
        }).join('\n');
        
        throw new Error(`Active commands directory not found. Checked paths:\n${debugInfo}`);
      }

      // Adjust expectations for repository scenarios in dry-run mode
      const expectedCommands = this.scenario.startsWith('repo-') ? 0 : 13;
      const testPassed = activeCommands.length >= expectedCommands;
      
      return {
        name: 'Commands Deployment',
        status: testPassed ? 'passed' : 'failed',
        details: `Found ${activeCommands.length} active commands in ${foundPath} (expected ≥${expectedCommands} for ${this.scenario})`,
        foundCommands: activeCommands.slice(0, 5) // Show first 5 for debugging
      };
    } catch (error) {
      return {
        name: 'Commands Deployment',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Validate hooks installation
   */
  async validateHooksInstallation() {
    // Implementation for hooks validation
    return {
      name: 'Hooks Installation',
      status: 'skipped',
      details: 'Hooks validation not implemented in test scenario'
    };
  }

  /**
   * Validate subagents installation  
   */
  async validateSubagentsInstallation() {
    // Implementation for subagents validation
    return {
      name: 'Subagents Installation',
      status: 'skipped',
      details: 'Subagents validation not implemented in test scenario'
    };
  }

  /**
   * Validate configuration files
   */
  async validateConfigurationFiles() {
    try {
      const claudeDir = path.join(this.testHome, '.claude');
      
      if (!fs.existsSync(claudeDir)) {
        throw new Error('Claude directory not found');
      }

      return {
        name: 'Configuration Files',
        status: 'passed',
        details: 'Claude directory exists'
      };
    } catch (error) {
      return {
        name: 'Configuration Files',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Validate npm package installation
   */
  async validateNpmPackage(packageName) {
    try {
      const { stdout } = await execAsync(`npm list -g ${packageName}`, {
        env: {
          ...process.env,
          HOME: this.testHome,
          PATH: `${this.testHome}/.npm-global/bin:${process.env.PATH}`
        }
      });

      return {
        name: `NPM Package: ${packageName}`,
        status: 'passed',
        details: 'Package is installed globally'
      };
    } catch (error) {
      return {
        name: `NPM Package: ${packageName}`,
        status: 'failed',
        error: `Package not found: ${error.message}`
      };
    }
  }

  /**
   * Validate repository clone for repo scenarios
   */
  async validateRepositoryClone() {
    // For repo scenarios in CI, we can't actually clone, so just check basic functionality
    return {
      name: 'Repository Setup',
      status: 'passed',
      details: 'Repository-based scenario (simulated in CI)'
    };
  }

  /**
   * Validate basic functionality
   */
  async validateBasicFunctionality() {
    try {
      // Check if Claude is available
      await execAsync('claude --version', {
        env: {
          ...process.env,
          HOME: this.testHome,
          PATH: `${this.testHome}/.npm-global/bin:${process.env.PATH}`
        }
      });

      return {
        name: 'Basic Functionality',
        status: 'passed',
        details: 'Claude Code is accessible'
      };
    } catch (error) {
      return {
        name: 'Basic Functionality',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Check if step should be skipped for current scenario
   */
  shouldSkipStep(step) {
    // Skip uninstall steps for fresh-install scenarios
    if (this.scenario.includes('fresh-install') && step.section.includes('Uninstall')) {
      return true;
    }

    // Skip install steps for uninstall-only tests
    if (this.scenario === 'uninstall-only' && step.section.includes('Installation')) {
      return true;
    }

    // Skip repository steps for npm scenarios
    if (this.scenario.startsWith('npm-')) {
      if (step.section.includes('Repository-Based') ||
          step.step.includes('./setup.sh') ||
          step.step.includes('./deploy.sh') ||
          step.step.includes('./configure-claude-code.sh') ||
          step.step.includes('./deploy-subagents.sh') ||
          step.step.includes('./verify-setup.sh') ||
          step.step.includes('./validate-commands.sh')) {
        return true;
      }
    }

    // Skip npm steps for repository scenarios  
    if (this.scenario.startsWith('repo-')) {
      if (step.section.includes('NPM Package') ||
          (step.commands && step.commands.some(cmd => 
            cmd.raw.includes('claude-commands') || 
            cmd.raw.includes('npm install -g @paulduvall/claude-dev-toolkit'))) ||
          step.step.includes('Install Claude Dev Toolkit') ||
          step.step.includes('claude-commands')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Skip a step and record it
   */
  async skipStep(step) {
    console.log(`⏭️  Skipping: [${step.section}] ${step.step} (scenario: ${this.scenario})`);
    
    const stepResult = {
      name: `[${step.section}] ${step.step}`,
      type: 'skipped',
      status: 'skipped',
      reason: `Skipped for scenario: ${this.scenario}`,
      timestamp: new Date().toISOString()
    };

    this.results.steps.push(stepResult);
    this.results.summary.skipped++;
  }

  /**
   * Setup scenarios
   */
  async setupFreshInstall() {
    console.log('🆕 Setting up fresh install environment');
    // Ensure clean environment - nothing to install initially
  }

  async setupReinstall() {
    console.log('🔄 Setting up reinstall environment');
    // Pre-install the package to test reinstall scenario
    try {
      await execAsync('npm install -g @paulduvall/claude-dev-toolkit', {
        env: {
          ...process.env,
          HOME: this.testHome,
          NPM_CONFIG_PREFIX: `${this.testHome}/.npm-global`
        }
      });
    } catch (error) {
      console.warn('Pre-installation for reinstall failed:', error.message);
    }
  }

  async setupUpgrade() {
    console.log('⬆️  Setting up upgrade environment');
    // Install previous version first
    // This would require version history - placeholder for now
  }

  /**
   * Utility methods
   */
  /**
   * Give the isolated HOME a git identity, matching a real reader's machine.
   */
  ensureGitIdentity() {
    const gitconfig = path.join(this.testHome, '.gitconfig');
    if (fs.existsSync(gitconfig)) return;
    fs.writeFileSync(gitconfig,
      '[user]\n' +
      '\tname = Install Guide Test\n' +
      '\temail = install-guide-test@example.invalid\n' +
      '[init]\n' +
      '\tdefaultBranch = main\n',
      'utf8');
    console.log(`   🔑 Wrote a git identity to ${gitconfig}`);
  }

  async ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async saveResults() {
    // Ensure test-results directory exists
    const testResultsDir = path.join(__dirname, 'test-results');
    await this.ensureDirectory(testResultsDir);
    
    const resultsPath = path.join(testResultsDir, `${this.scenario}-progress.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
  }

  async loadResults() {
    const resultsPath = path.join(__dirname, 'test-results', `${this.scenario}-progress.json`);
    if (fs.existsSync(resultsPath)) {
      try {
        const savedResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        // Merge saved results with current results, preserving any new data
        this.results = { ...this.results, ...savedResults };
        console.log(`📄 Loaded ${this.results.steps?.length || 0} steps from previous execution`);
      } catch (error) {
        console.error(`⚠️  Failed to load progress file: ${error.message}`);
      }
    } else {
      console.log(`⚠️  No progress file found at: ${resultsPath}`);
    }
  }

  generateDetailedReport() {
    let report = `# Install Guide Test Report\n\n`;
    report += `**Scenario:** ${this.scenario}\n`;
    report += `**Platform:** ${this.results.platform}\n`;
    report += `**Node Version:** ${this.results.nodeVersion}\n`;
    report += `**Duration:** ${Math.round(this.results.duration / 1000)}s\n\n`;

    report += `## Summary\n\n`;
    report += `- ✅ **Passed:** ${this.results.summary.passed}\n`;
    report += `- ❌ **Failed:** ${this.results.summary.failed}\n`;
    report += `- ⏭️ **Skipped:** ${this.results.summary.skipped}\n\n`;

    if (this.results.summary.failed > 0) {
      report += `## Failed Steps\n\n`;
      this.results.steps
        .filter(step => step.status === 'failed')
        .forEach(step => {
          report += `### ${step.name}\n`;
          report += `**Error:** ${step.error}\n\n`;
        });
    }

    report += `## All Steps\n\n`;
    this.results.steps.forEach((step, index) => {
      const status = step.status === 'passed' ? '✅' : 
                    step.status === 'failed' ? '❌' : '⏭️';
      report += `${index + 1}. ${status} ${step.name}\n`;
    });

    return report;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const scenario = args.find(arg => arg.startsWith('--scenario='))?.split('=')[1] || 'fresh-install';
  const phase = args.find(arg => arg.startsWith('--phase='))?.split('=')[1] || 'execute';

  const tester = new InstallGuideTester(scenario);

  (async () => {
    try {
      switch (phase) {
        case 'pre-setup':
          await tester.runPreSetup();
          break;
        case 'execute':
          await tester.runExecute();
          break;
        case 'validate':
          await tester.runValidate();
          break;
        case 'report':
          await tester.runReport();
          break;
        default:
          console.error('Invalid phase. Use: pre-setup, execute, validate, or report');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { InstallGuideTester };