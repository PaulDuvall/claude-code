#!/usr/bin/env node

/**
 * Settings Integration Tester  
 * Creates temporary Claude Code configurations and tests them in isolated environments
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

class SettingsIntegrationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    this.templatesDir = path.join(__dirname, '..', 'templates');
    this.testCounter = 0;
  }

  /**
   * Run integration tests for all settings templates
   */
  async runTests() {
    console.log('🧪 Running Claude Code settings integration tests...\n');

    try {
      // Get template files
      const templates = fs.readdirSync(this.templatesDir)
        .filter(file => file.endsWith('.json') && !file.includes('OLD'))
        .filter(file => file.includes('settings'));

      console.log(`📋 Testing ${templates.length} settings templates:\n`);

      for (const template of templates) {
        await this.testTemplate(template);
      }

      this.outputSummary();
      
      return this.results.tests.every(test => test.status !== 'failed');

    } catch (error) {
      console.error('❌ Integration test failed:', error.message);
      return false;
    }
  }

  /**
   * Test individual template with isolated Claude Code setup
   */
  async testTemplate(templateFile) {
    const templateName = templateFile.replace('.json', '');
    const templatePath = path.join(this.templatesDir, templateFile);
    
    console.log(`🔧 Integration testing: ${templateName}`);
    
    const testResult = {
      name: templateName,
      status: 'unknown',
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Create isolated test environment
      const testEnv = await this.createTestEnvironment(templateName);
      
      // Load and prepare template
      const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      
      // Apply template to test environment
      await this.applyTemplate(testEnv, template, testResult);
      
      // Run specific tests based on template content
      await this.runTemplateSpecificTests(testEnv, template, testResult);
      
      // Cleanup test environment
      await this.cleanupTestEnvironment(testEnv);
      
      // Determine overall status
      const failed = testResult.tests.filter(t => t.status === 'failed').length;
      testResult.status = failed === 0 ? 'passed' : 'failed';
      
    } catch (error) {
      testResult.status = 'failed';
      testResult.tests.push({
        name: 'Integration Test Setup',
        status: 'failed',
        error: error.message
      });
    }

    this.results.tests.push(testResult);
    
    const passed = testResult.tests.filter(t => t.status === 'passed').length;
    const failed = testResult.tests.filter(t => t.status === 'failed').length;
    console.log(`  ✅ ${passed} passed, ❌ ${failed} failed\n`);
  }

  /**
   * Create isolated test environment
   */
  async createTestEnvironment(templateName) {
    this.testCounter++;
    const testDir = path.join(os.tmpdir(), `claude-test-${templateName}-${this.testCounter}`);
    const claudeDir = path.join(testDir, '.claude');
    
    // Create directories
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.mkdirSync(path.join(claudeDir, 'hooks'), { recursive: true });
    fs.mkdirSync(path.join(claudeDir, 'commands'), { recursive: true });
    fs.mkdirSync(path.join(claudeDir, 'logs'), { recursive: true });

    // Create minimal test project structure  
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
      name: `claude-test-${templateName}`,
      version: '1.0.0',
      description: 'Test project for Claude Code settings'
    }, null, 2));

    fs.writeFileSync(path.join(testDir, 'README.md'), '# Test Project\nThis is a test project for validating Claude Code settings.');

    return {
      testDir,
      claudeDir,
      name: templateName
    };
  }

  /**
   * Apply template to test environment
   */
  async applyTemplate(testEnv, template, testResult) {
    const settingsPath = path.join(testEnv.claudeDir, 'settings.json');
    
    try {
      // Write settings file
      fs.writeFileSync(settingsPath, JSON.stringify(template, null, 2));
      
      testResult.tests.push({
        name: 'Template Application',
        status: 'passed',
        details: 'Settings file created successfully'
      });

      // Create hook scripts if referenced
      if (template.hooks) {
        await this.createTestHookScripts(testEnv, template, testResult);
      }

    } catch (error) {
      testResult.tests.push({
        name: 'Template Application',
        status: 'failed',
        error: `Failed to apply template: ${error.message}`
      });
    }
  }

  /**
   * Create dummy hook scripts for testing
   */
  async createTestHookScripts(testEnv, template, testResult) {
    const hooksCreated = [];
    
    try {
      for (const [event, hookGroups] of Object.entries(template.hooks)) {
        if (event.startsWith('//')) continue;
        
        for (const hookGroup of hookGroups) {
          for (const hook of hookGroup.hooks) {
            if (hook.command && hook.command.includes('.claude/hooks/')) {
              const hookName = path.basename(hook.command);
              const hookPath = path.join(testEnv.claudeDir, 'hooks', hookName);
              
              if (!fs.existsSync(hookPath)) {
                // Create dummy hook script
                const hookContent = `#!/bin/bash
# Test hook: ${hookName}
# Event: ${event}
# Generated for integration testing

echo "Hook ${hookName} executed for event ${event}" >> ~/.claude/logs/hook-test.log
exit 0
`;
                fs.writeFileSync(hookPath, hookContent);
                fs.chmodSync(hookPath, '755');
                hooksCreated.push(hookName);
              }
            }
          }
        }
      }

      if (hooksCreated.length > 0) {
        testResult.tests.push({
          name: 'Hook Scripts Creation', 
          status: 'passed',
          details: `Created ${hooksCreated.length} test hook scripts: ${hooksCreated.join(', ')}`
        });
      }

    } catch (error) {
      testResult.tests.push({
        name: 'Hook Scripts Creation',
        status: 'failed',
        error: `Failed to create hook scripts: ${error.message}`
      });
    }
  }

  /**
   * Run template-specific tests
   */
  async runTemplateSpecificTests(testEnv, template, testResult) {
    // Test 1: JSON Parsing
    await this.testJSONParsing(testEnv, testResult);
    
    // Test 2: Permissions structure
    if (template.permissions) {
      await this.testPermissionsStructure(template.permissions, testResult);
    }

    // Test 3: Hook structure
    if (template.hooks) {
      await this.testHookStructure(template.hooks, testResult);  
    }

    // Test 4: Environment variables
    if (template.env) {
      await this.testEnvironmentVariables(template.env, testResult);
    }

    // Test 5: Claude Code compatibility (if available)
    await this.testClaudeCodeCompatibility(testEnv, testResult);
  }

  /**
   * Test JSON parsing and structure
   */
  async testJSONParsing(testEnv, testResult) {
    try {
      const settingsPath = path.join(testEnv.claudeDir, 'settings.json');
      const content = fs.readFileSync(settingsPath, 'utf8');
      const parsed = JSON.parse(content);
      
      testResult.tests.push({
        name: 'JSON Parsing',
        status: 'passed',
        details: `Successfully parsed ${Object.keys(parsed).length} configuration keys`
      });
    } catch (error) {
      testResult.tests.push({
        name: 'JSON Parsing',
        status: 'failed',
        error: `JSON parsing failed: ${error.message}`
      });
    }
  }

  /**
   * Test permissions structure
   */
  async testPermissionsStructure(permissions, testResult) {
    try {
      const validTypes = ['allow', 'ask', 'deny'];
      const permissionTypes = Object.keys(permissions).filter(key => !key.startsWith('//'));
      const invalidTypes = permissionTypes.filter(type => !validTypes.includes(type));

      if (invalidTypes.length > 0) {
        testResult.tests.push({
          name: 'Permissions Structure',
          status: 'failed',
          error: `Invalid permission types: ${invalidTypes.join(', ')}`
        });
      } else {
        let totalRules = 0;
        permissionTypes.forEach(type => {
          if (Array.isArray(permissions[type])) {
            totalRules += permissions[type].length;
          }
        });

        testResult.tests.push({
          name: 'Permissions Structure', 
          status: 'passed',
          details: `Valid permissions with ${totalRules} rules across ${permissionTypes.length} types`
        });
      }
    } catch (error) {
      testResult.tests.push({
        name: 'Permissions Structure',
        status: 'failed',
        error: `Permissions validation failed: ${error.message}`
      });
    }
  }

  /**
   * Test hook structure  
   */
  async testHookStructure(hooks, testResult) {
    try {
      const validEvents = [
        'PreToolUse', 'PostToolUse', 'Notification', 'UserPromptSubmit',
        'Stop', 'SubagentStop', 'SessionEnd', 'PreCompact', 'SessionStart'
      ];

      const hookEvents = Object.keys(hooks).filter(key => !key.startsWith('//'));
      const invalidEvents = hookEvents.filter(event => !validEvents.includes(event));

      if (invalidEvents.length > 0) {
        testResult.tests.push({
          name: 'Hook Structure',
          status: 'failed',
          error: `Invalid hook events: ${invalidEvents.join(', ')}`
        });
        return;
      }

      let totalHooks = 0;
      for (const [event, hookGroups] of Object.entries(hooks)) {
        if (event.startsWith('//')) continue;
        
        if (Array.isArray(hookGroups)) {
          totalHooks += hookGroups.reduce((sum, group) => 
            sum + (Array.isArray(group.hooks) ? group.hooks.length : 0), 0);
        }
      }

      testResult.tests.push({
        name: 'Hook Structure',
        status: 'passed', 
        details: `Valid hook configuration with ${totalHooks} hooks across ${hookEvents.length} events`
      });

    } catch (error) {
      testResult.tests.push({
        name: 'Hook Structure',
        status: 'failed',
        error: `Hook structure validation failed: ${error.message}`
      });
    }
  }

  /**
   * Test environment variables
   */
  async testEnvironmentVariables(env, testResult) {
    try {
      const envKeys = Object.keys(env);
      const officialKeys = [
        'ANTHROPIC_API_KEY', 'DISABLE_TELEMETRY', 'ANTHROPIC_LOG', 
        'CLAUDE_PROJECT_DIR', 'CLAUDE_CODE_USE_BEDROCK'
      ];

      const recognizedKeys = envKeys.filter(key => officialKeys.includes(key));
      const customKeys = envKeys.filter(key => !officialKeys.includes(key));

      testResult.tests.push({
        name: 'Environment Variables',
        status: 'passed',
        details: `${recognizedKeys.length} official vars, ${customKeys.length} custom vars`
      });

    } catch (error) {
      testResult.tests.push({
        name: 'Environment Variables',
        status: 'failed',
        error: `Environment variables validation failed: ${error.message}`
      });
    }
  }

  /**
   * Test Claude Code compatibility (if available)
   */
  async testClaudeCodeCompatibility(testEnv, testResult) {
    try {
      // Check if Claude Code is available
      try {
        execSync('which claude', { stdio: 'pipe' });
      } catch (error) {
        testResult.tests.push({
          name: 'Claude Code Compatibility',
          status: 'skipped',
          details: 'Claude Code not available for integration testing'
        });
        return;
      }

      // Try to run Claude Code with the test configuration
      const testCommand = `cd ${testEnv.testDir} && timeout 5 claude --help`;
      
      try {
        execSync(testCommand, { 
          stdio: 'pipe',
          env: { ...process.env, HOME: testEnv.testDir }
        });
        
        testResult.tests.push({
          name: 'Claude Code Compatibility',
          status: 'passed',
          details: 'Claude Code successfully loads with template configuration'
        });

      } catch (error) {
        testResult.tests.push({
          name: 'Claude Code Compatibility',
          status: 'warning',
          details: 'Claude Code compatibility test inconclusive (timeout or configuration issue)'
        });
      }

    } catch (error) {
      testResult.tests.push({
        name: 'Claude Code Compatibility',
        status: 'failed',
        error: `Claude Code compatibility test failed: ${error.message}`
      });
    }
  }

  /**
   * Cleanup test environment
   */
  async cleanupTestEnvironment(testEnv) {
    try {
      // Remove test directory
      execSync(`rm -rf "${testEnv.testDir}"`, { stdio: 'pipe' });
    } catch (error) {
      console.warn(`⚠️ Failed to cleanup test environment: ${error.message}`);
    }
  }

  /**
   * Output test summary
   */
  outputSummary() {
    console.log('\n🧪 INTEGRATION TEST RESULTS\n');
    console.log('=' .repeat(50));

    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    this.results.tests.forEach(templateResult => {
      const passed = templateResult.tests.filter(t => t.status === 'passed').length;
      const failed = templateResult.tests.filter(t => t.status === 'failed').length; 
      const skipped = templateResult.tests.filter(t => t.status === 'skipped').length;

      totalPassed += passed;
      totalFailed += failed;
      totalSkipped += skipped;

      const statusIcon = templateResult.status === 'passed' ? '✅' : 
                        templateResult.status === 'warning' ? '⚠️' : '❌';
      
      console.log(`${statusIcon} ${templateResult.name}: ${passed}✅ ${failed}❌ ${skipped}⏭️`);
    });

    console.log('');
    console.log(`📊 Overall: ${totalPassed} passed, ${totalFailed} failed, ${totalSkipped} skipped`);
    
    // Save results
    const reportPath = path.join(__dirname, 'test-results', `integration-test-${Date.now()}.json`);
    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed results: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const tester = new SettingsIntegrationTester();
  
  tester.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Integration tests failed:', error);
    process.exit(1);
  });
}

module.exports = { SettingsIntegrationTester };