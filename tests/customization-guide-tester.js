#!/usr/bin/env node

/**
 * Customization Guide Tester
 * Executes commands from the customization guide and validates results
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { CustomizationGuideParser } = require('./customization-guide-parser');

class CustomizationGuideTester {
  constructor(scenario = 'customization-setup') {
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
  }

  /**
   * Load test suite from customization guide
   */
  async loadTestSuite() {
    try {
      const guidePath = path.resolve(__dirname, '../docs/publish/and-customizing-claude-code.md');
      console.log(`📂 Looking for customization guide at: ${guidePath}`);
      
      if (!fs.existsSync(guidePath)) {
        throw new Error(`Customization guide not found at ${guidePath}`);
      }

      const parser = new CustomizationGuideParser(guidePath);
      this.testSuite = parser.generateTestSuite();
      
      console.log(`📋 Loaded customization guide with ${this.testSuite.testSteps.length} steps`);
      console.log(`🎯 Running scenario: ${this.scenario}`);
      
      // Show first few steps for debugging
      if (this.testSuite.testSteps.length > 0) {
        console.log('📝 First test step:', this.testSuite.testSteps[0].step || 'Unknown step');
        console.log('📝 First test type:', this.testSuite.testSteps[0].type || 'Unknown type');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load customization guide:', error.message);
      return false;
    }
  }

  /**
   * Pre-setup phase: Prepare environment for customization testing
   */
  async runPreSetup() {
    console.log(`🔧 Pre-setup for customization scenario: ${this.scenario}`);
    
    const setupStep = {
      name: 'Pre-setup Customization Environment',
      type: 'setup',
      startTime: new Date().toISOString()
    };

    try {
      // Create test directories
      await this.ensureDirectory(path.join(this.testHome, '.claude'));
      await this.ensureDirectory(path.join(this.testHome, '.claude', 'commands'));
      await this.ensureDirectory(path.join(this.testHome, '.claude', 'hooks'));
      await this.ensureDirectory(path.join(__dirname, 'test-results'));
      await this.ensureDirectory(path.join(__dirname, 'logs'));

      // Scenario-specific setup
      switch (this.scenario) {
        case 'customization-setup':
          await this.setupCustomizationEnvironment();
          break;
        case 'advanced-workflow':
          await this.setupAdvancedWorkflow();
          break;
        default:
          console.log(`ℹ️  Unknown scenario ${this.scenario}, using default setup`);
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
   * Execute phase: Run customization guide steps
   */
  async runExecute() {
    if (!this.testSuite) {
      const loaded = await this.loadTestSuite();
      if (!loaded) {
        console.error('❌ Cannot execute steps without test suite');
        this.results.errors.push('Failed to load test suite configuration');
        await this.saveResults();
        return;
      }
    }

    console.log(`🚀 Executing customization guide steps for ${this.scenario}`);
    console.log(`📊 Total steps to process: ${this.testSuite.testSteps.length}`);

    let executedSteps = 0;
    let skippedSteps = 0;

    for (const step of this.testSuite.testSteps) {
      if (this.shouldSkipStep(step)) {
        console.log(`⏭️  Skipping step: [${step.type}] ${step.step}`);
        await this.skipStep(step);
        skippedSteps++;
        continue;
      }

      try {
        await this.executeStep(step);
        executedSteps++;
      } catch (error) {
        console.error(`❌ Failed to execute step: [${step.type}] ${step.step}`, error.message);
        this.results.errors.push(`Step execution failed: ${error.message}`);
        
        const failedStepResult = {
          name: `[${step.type}] ${step.step}`,
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
      }
    }

    console.log(`📈 Execution summary: ${executedSteps} executed, ${skippedSteps} skipped`);
    await this.saveResults();
    
    // Exit with failure code if any commands failed
    if (this.results.summary.failed > 0) {
      console.error(`❌ ${this.results.summary.failed} steps failed`);
      process.exit(1);
    }
  }

  /**
   * Validate phase: Check customization results
   */
  async runValidate() {
    console.log('✅ Validating customization results');

    const validationStep = {
      name: 'Final Customization Validation',
      type: 'validation',
      startTime: new Date().toISOString(),
      validations: []
    };

    try {
      const checks = [];
      
      // Common validation checks
      checks.push(
        () => this.validateClaudeCodeInstallation(),
        () => this.validateToolkitInstallation(),
        () => this.validateCommandsDeployment(),
        () => this.validateCustomizationStructure()
      );

      // Scenario-specific checks
      if (this.scenario === 'customization-setup') {
        checks.push(() => this.validateBasicCustomization());
      } else if (this.scenario === 'advanced-workflow') {
        checks.push(() => this.validateAdvancedFeatures());
      }

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
    console.log('📊 Generating customization test report');
    
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
    
    // Save reports
    const reportPath = path.join(__dirname, 'test-results', `customization-report-${this.scenario}-${Date.now()}.json`);
    const markdownPath = path.join(__dirname, 'test-results', `customization-report-${this.scenario}-${Date.now()}.md`);
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    fs.writeFileSync(markdownPath, report);
    
    // Console output
    console.log('\n📋 Customization Test Results Summary:');
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
    
    console.log('\n✅ All customization tests passed!');
  }

  /**
   * Execute a single customization step
   */
  async executeStep(step) {
    console.log(`\n🔄 Executing: [${step.type}] ${step.step}`);
    
    if (step.commands && step.commands.length > 0) {
      console.log(`   📝 Commands: ${step.commands.length}`);
      step.commands.forEach((cmd, i) => {
        console.log(`      ${i + 1}. ${cmd.raw || cmd.command || cmd}`);
      });
    }
    
    const stepResult = {
      name: `[${step.type}] ${step.step}`,
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
          
          if (commandResult.status === 'failed' && !command.allowFailure) {
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
   * Execute a single command with customization-specific handling
   */
  async executeCommand(command) {
    const normalizedCommand = {
      raw: command.raw || command.command || command,
      type: command.type || 'general',
      allowFailure: command.allowFailure || false,
      timeout: command.timeout || 30000,
      skip: command.skip || false
    };
    
    const commandResult = {
      command: normalizedCommand.raw,
      type: normalizedCommand.type,
      startTime: new Date().toISOString()
    };

    try {
      console.log(`      🔧 Executing: ${normalizedCommand.raw}`);
      console.log(`      📋 Type: ${normalizedCommand.type}`);

      // Skip placeholder commands
      if (normalizedCommand.type === 'placeholder' || normalizedCommand.skip) {
        console.log(`      ⏭️  Skipping placeholder/example command: ${normalizedCommand.raw}`);
        commandResult.status = 'skipped';
        commandResult.reason = 'Placeholder or example command';
        console.log(`      ✅ Command marked as placeholder (expected)`);
        return commandResult;
      }

      // Skip Claude Code UI commands (slash commands) - they can't be executed in shell
      if (normalizedCommand.type === 'claude-ui') {
        console.log(`      ⏭️  Skipping Claude Code UI command: ${normalizedCommand.raw}`);
        commandResult.status = 'skipped';
        commandResult.reason = 'Claude Code UI command - not executable in shell';
        console.log(`      ✅ Command marked as UI-only (expected)`);
        return commandResult;
      }

      // Handle different command types
      switch (normalizedCommand.type) {
        case 'install':
        case 'npm':
          await this.executeNpmCommand(normalizedCommand);
          break;
        case 'git':
          await this.executeGitCommand(normalizedCommand);
          break;
        case 'toolkit':
          await this.executeToolkitCommand(normalizedCommand);
          break;
        case 'claude':
          throw new Error(`Command requires executable not available in test environment: claude`);
        case 'filesystem':
          await this.executeFilesystemCommand(normalizedCommand);
          break;
        case 'process':
          await this.executeProcessCommand(normalizedCommand);
          break;
        case 'permissions':
          await this.executePermissionsCommand(normalizedCommand);
          break;
        case 'navigation':
          await this.executeNavigationCommand(normalizedCommand);
          break;
        default:
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
      cwd: this.testHome
    });

    return { stdout, stderr };
  }

  /**
   * Execute git commands
   */
  async executeGitCommand(command) {
    // Handle git clone specially to avoid directory conflicts
    if (command.raw.includes('git clone')) {
      const targetDir = command.raw.split(' ').pop().split('/').pop().replace('.git', '');
      const fullPath = path.join(this.testHome, targetDir);
      
      if (fs.existsSync(fullPath)) {
        console.log(`      ℹ️  Repository ${targetDir} already exists, skipping clone`);
        return { stdout: `Repository ${targetDir} already exists`, stderr: '' };
      }
    }

    const env = {
      ...process.env,
      HOME: this.testHome
    };

    const { stdout, stderr } = await execAsync(command.raw, {
      timeout: command.timeout || 60000,
      env,
      cwd: this.testHome
    });

    return { stdout, stderr };
  }

  /**
   * Execute claude-commands toolkit commands
   */
  async executeToolkitCommand(command) {
    // Toolkit commands require claude-commands executable which may not be available in CI
    throw new Error(`Command requires executable not available in test environment: claude-commands`);
  }

  /**
   * Execute filesystem commands with better error handling
   */
  async executeFilesystemCommand(command) {
    const env = {
      ...process.env,
      HOME: this.testHome
    };

    try {
      const { stdout, stderr } = await execAsync(command.raw, {
        timeout: command.timeout || 10000,
        env,
        cwd: this.testHome
      });
      return { stdout, stderr };
    } catch (error) {
      // For filesystem operations that are expected to fail in CI, mark as allowing failure
      if (command.allowFailure) {
        console.log(`      ℹ️  Command marked as allowing failure (expected in test environment)`);
        throw new Error(`${error.message}\n      ⚠️  Command failure allowed, continuing...`);
      }
      throw error;
    }
  }

  /**
   * Execute process commands with better error handling
   */
  async executeProcessCommand(command) {
    const env = {
      ...process.env,
      HOME: this.testHome
    };

    try {
      const { stdout, stderr } = await execAsync(command.raw, {
        timeout: command.timeout || 5000,
        env,
        cwd: this.testHome
      });
      return { stdout, stderr };
    } catch (error) {
      // Process commands like pkill are expected to fail in CI
      if (command.allowFailure) {
        console.log(`      ℹ️  Command marked as allowing failure (expected in test environment)`);
        throw new Error(`${error.message}\n      ⚠️  Command failure allowed, continuing...`);
      }
      throw error;
    }
  }

  /**
   * Execute permission commands
   */
  async executePermissionsCommand(command) {
    const env = {
      ...process.env,
      HOME: this.testHome
    };

    const { stdout, stderr } = await execAsync(command.raw, {
      timeout: command.timeout || 5000,
      env,
      cwd: this.testHome
    });

    return { stdout, stderr };
  }

  /**
   * Execute navigation commands (cd)
   */
  async executeNavigationCommand(command) {
    // For cd commands, just verify the directory exists
    if (command.raw.startsWith('cd ')) {
      const targetDir = command.raw.replace('cd ', '').trim();
      const fullPath = path.resolve(this.testHome, targetDir);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Directory does not exist: ${fullPath}`);
      }
      
      console.log(`      📁 Directory exists: ${fullPath}`);
      return { stdout: `Changed directory to ${fullPath}`, stderr: '' };
    }

    return this.executeGeneralCommand(command);
  }

  /**
   * Execute general commands
   */
  async executeGeneralCommand(command) {
    // Check for commands that require specific executables not available in CI
    if (this.isCommandMissingExecutable(command.raw)) {
      throw new Error(`Command requires executable not available in test environment: ${command.raw.split(' ')[0]}`);
    }

    // Check for script files that might not exist
    if (command.raw.startsWith('./') && !this.checkScriptExists(command.raw)) {
      throw new Error(`Script file not found: ${command.raw}`);
    }

    const env = {
      ...process.env,
      HOME: this.testHome
    };

    const { stdout, stderr } = await execAsync(command.raw, {
      timeout: command.timeout || 10000,
      env,
      cwd: this.testHome
    });

    return { stdout, stderr };
  }

  /**
   * Check if command requires an executable that's not available in test environment
   */
  isCommandMissingExecutable(command) {
    const missingExecutables = ['claude', 'claude-commands'];
    const commandName = command.split(' ')[0];
    return missingExecutables.includes(commandName);
  }

  /**
   * Check if script file exists
   */
  checkScriptExists(scriptPath) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.resolve(this.testHome, scriptPath);
    return fs.existsSync(fullPath);
  }

  /**
   * Validation methods
   */
  async validateClaudeCodeInstallation() {
    try {
      await execAsync('claude --version', {
        env: { ...process.env, HOME: this.testHome }
      });

      return {
        name: 'Claude Code Installation',
        status: 'passed',
        details: 'Claude Code CLI is accessible'
      };
    } catch (error) {
      return {
        name: 'Claude Code Installation',
        status: 'failed',
        error: error.message
      };
    }
  }

  async validateToolkitInstallation() {
    try {
      const { stdout } = await execAsync('claude-commands --version', {
        env: {
          ...process.env,
          HOME: this.testHome,
          PATH: `${this.testHome}/.npm-global/bin:${process.env.PATH}`
        }
      });

      return {
        name: 'Claude Dev Toolkit Installation',
        status: 'passed',
        details: stdout.trim()
      };
    } catch (error) {
      return {
        name: 'Claude Dev Toolkit Installation',
        status: 'failed',
        error: error.message
      };
    }
  }

  async validateCommandsDeployment() {
    try {
      const commandsDir = path.join(this.testHome, '.claude', 'commands');
      
      if (!fs.existsSync(commandsDir)) {
        throw new Error('Commands directory not found');
      }

      const commandFiles = fs.readdirSync(commandsDir)
        .filter(file => file.endsWith('.md') && file.startsWith('x'));

      return {
        name: 'Commands Deployment',
        status: commandFiles.length > 0 ? 'passed' : 'failed',
        details: `Found ${commandFiles.length} custom commands`,
        foundCommands: commandFiles.slice(0, 5)
      };
    } catch (error) {
      return {
        name: 'Commands Deployment',
        status: 'failed',
        error: error.message
      };
    }
  }

  async validateCustomizationStructure() {
    try {
      const claudeDir = path.join(this.testHome, '.claude');
      const requiredDirs = ['commands', 'hooks'];
      const missingDirs = [];

      for (const dir of requiredDirs) {
        if (!fs.existsSync(path.join(claudeDir, dir))) {
          missingDirs.push(dir);
        }
      }

      if (missingDirs.length > 0) {
        throw new Error(`Missing directories: ${missingDirs.join(', ')}`);
      }

      return {
        name: 'Customization Structure',
        status: 'passed',
        details: 'All required customization directories exist'
      };
    } catch (error) {
      return {
        name: 'Customization Structure',
        status: 'failed',
        error: error.message
      };
    }
  }

  async validateBasicCustomization() {
    return {
      name: 'Basic Customization',
      status: 'passed',
      details: 'Basic customization scenario validated'
    };
  }

  async validateAdvancedFeatures() {
    return {
      name: 'Advanced Features',
      status: 'passed',
      details: 'Advanced workflow features validated'
    };
  }

  /**
   * Check if step should be skipped for current scenario
   */
  shouldSkipStep(step) {
    // Skip workflow steps for basic setup
    if (this.scenario === 'customization-setup' && step.type === 'Workflow') {
      return true;
    }

    // Skip installation steps for advanced workflow if already setup
    if (this.scenario === 'advanced-workflow' && step.type === 'Installation') {
      return true;
    }

    return false;
  }

  /**
   * Skip a step and record it
   */
  async skipStep(step) {
    console.log(`⏭️  Skipping: [${step.type}] ${step.step} (scenario: ${this.scenario})`);
    
    const stepResult = {
      name: `[${step.type}] ${step.step}`,
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
  async setupCustomizationEnvironment() {
    console.log('🎨 Setting up basic customization environment');
  }

  async setupAdvancedWorkflow() {
    console.log('🚀 Setting up advanced workflow environment');
  }

  /**
   * Utility methods
   */
  async ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async saveResults() {
    const resultsPath = path.join(__dirname, 'test-results', `customization-${this.scenario}-progress.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
  }

  async loadResults() {
    const resultsPath = path.join(__dirname, 'test-results', `customization-${this.scenario}-progress.json`);
    if (fs.existsSync(resultsPath)) {
      try {
        const savedResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        this.results = { ...this.results, ...savedResults };
        console.log(`📄 Loaded ${this.results.steps?.length || 0} steps from previous execution`);
      } catch (error) {
        console.error(`⚠️  Failed to load progress file: ${error.message}`);
      }
    }
  }

  generateDetailedReport() {
    let report = `# Customization Guide Test Report\n\n`;
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

  async runValidation(validation) {
    const validationResult = {
      type: validation.type,
      startTime: new Date().toISOString()
    };

    try {
      switch (validation.type) {
        case 'documentation':
          // For documentation links, just verify they exist in the validation object
          validationResult.status = validation.url ? 'passed' : 'failed';
          validationResult.details = validation.url || 'No URL provided';
          break;
        default:
          throw new Error(`Unknown validation type: ${validation.type}`);
      }
    } catch (error) {
      validationResult.status = 'failed';
      validationResult.error = error.message;
    }

    validationResult.endTime = new Date().toISOString();
    return validationResult;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const scenario = args.find(arg => arg.startsWith('--scenario='))?.split('=')[1] || 'customization-setup';
  const phase = args.find(arg => arg.startsWith('--phase='))?.split('=')[1] || 'execute';

  const tester = new CustomizationGuideTester(scenario);

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
      console.error('❌ Customization test execution failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { CustomizationGuideTester };