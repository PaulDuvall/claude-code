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

      // Scenario-specific setup
      switch (this.scenario) {
        case 'fresh-install':
          await this.setupFreshInstall();
          break;
        case 'reinstall':
          await this.setupReinstall();
          break;
        case 'upgrade':
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

    const validationStep = {
      name: 'Final Validation',
      type: 'validation',
      startTime: new Date().toISOString(),
      validations: []
    };

    try {
      // Core validation checks
      const checks = [
        () => this.validateNpmPackage('@paulduvall/claude-dev-toolkit'),
        () => this.validateClaudeCommands(),
        () => this.validateCommandsDeployment(),
        () => this.validateHooksInstallation(),
        () => this.validateSubagentsInstallation(),
        () => this.validateConfigurationFiles()
      ];

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
    const reportPath = path.join(__dirname, 'test-results', `report-${this.scenario}-${Date.now()}.json`);
    const markdownPath = path.join(__dirname, 'test-results', `report-${this.scenario}-${Date.now()}.md`);
    
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
      cwd: this.testHome
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
      cwd: this.testHome
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
      const activeDir = path.join(commandsDir, 'active');
      
      if (!fs.existsSync(activeDir)) {
        throw new Error('Active commands directory not found');
      }

      const activeCommands = fs.readdirSync(activeDir).filter(file => file.endsWith('.md'));
      
      return {
        name: 'Commands Deployment',
        status: activeCommands.length >= 13 ? 'passed' : 'failed',
        details: `Found ${activeCommands.length} active commands`
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
   * Check if step should be skipped for current scenario
   */
  shouldSkipStep(step) {
    // Skip uninstall steps for fresh-install scenario
    if (this.scenario === 'fresh-install' && step.section.includes('Uninstall')) {
      return true;
    }

    // Skip install steps for uninstall-only tests
    if (this.scenario === 'uninstall-only' && step.section.includes('Installation')) {
      return true;
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
  async ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async saveResults() {
    const resultsPath = path.join(__dirname, 'test-results', `${this.scenario}-progress.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
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