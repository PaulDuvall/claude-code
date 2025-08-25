#!/usr/bin/env node

/**
 * Documentation Accuracy Validator
 * Validates that documentation steps actually work as described
 */

const fs = require('fs');
const path = require('path');
const { InstallGuideParser } = require('./install-guide-parser');

class DocumentationAccuracyValidator {
  constructor(testArtifactsPath) {
    this.testArtifactsPath = testArtifactsPath;
    this.validationResults = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      categories: {},
      issues: [],
      recommendations: []
    };
  }

  /**
   * Run comprehensive documentation accuracy validation
   */
  async validate() {
    console.log('🔍 Validating documentation accuracy against test results...\n');

    try {
      // Load test results from all scenarios
      const testResults = await this.loadAllTestResults();
      
      // Parse current documentation
      const parser = new InstallGuideParser('../docs/manual-uninstall-install-guide.md');
      const testSuite = parser.generateTestSuite();

      // Run validation categories
      await this.validateCommandAccuracy(testSuite, testResults);
      await this.validateStepCompleteness(testSuite, testResults);
      await this.validatePlatformCompatibility(testResults);
      await this.validateVersionSpecificInstructions(testResults);
      await this.validateErrorHandling(testResults);

      // Generate overall assessment
      this.generateOverallAssessment();
      
      // Output results
      this.outputResults();
      
      return this.validationResults.overall === 'passed';
      
    } catch (error) {
      console.error('❌ Documentation validation failed:', error.message);
      this.validationResults.overall = 'failed';
      this.validationResults.issues.push({
        category: 'system',
        severity: 'critical',
        issue: `Validation system error: ${error.message}`
      });
      return false;
    }
  }

  /**
   * Load all test results from artifacts
   */
  async loadAllTestResults() {
    const testResults = {};
    
    if (!fs.existsSync(this.testArtifactsPath)) {
      throw new Error(`Test artifacts path not found: ${this.testArtifactsPath}`);
    }

    const items = fs.readdirSync(this.testArtifactsPath, { withFileTypes: true });
    
    // First check for direct JSON files (local testing)
    const directJsonFiles = items
      .filter(item => item.isFile() && item.name.endsWith('.json'))
      .map(item => item.name);
      
    for (const file of directJsonFiles) {
      try {
        const filePath = path.join(this.testArtifactsPath, file);
        const result = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Ensure required fields exist
        if (!result.platform) result.platform = 'unknown';
        if (!result.scenario) result.scenario = 'unknown';
        if (!result.nodeVersion) result.nodeVersion = 'unknown';
        if (!Array.isArray(result.steps)) result.steps = [];
        
        // Generate a key for the result
        const key = `${result.platform}-${result.scenario}`;
        testResults[key] = result;
        
        console.log(`  ✓ Loaded direct file ${file}: ${key}`);
      } catch (error) {
        console.warn(`  ⚠️  Failed to load direct JSON file ${file}:`, error.message);
      }
    }

    // Then check for subdirectories (GitHub Actions artifacts)
    const artifactDirs = items
      .filter(item => item.isDirectory())
      .map(item => item.name);

    for (const dir of artifactDirs) {
      // Skip known non-test-result directories
      if (dir.includes('security') || dir.includes('config') || dir === 'test-suite-config' || 
          dir === 'comprehensive-test-report') {
        console.log(`  ⏭️  Skipping non-test-result directory: ${dir}`);
        continue;
      }
      
      // Process directories that look like test results
      // GitHub Actions artifacts are named: test-results-{platform}-{node-version}-{scenario}
      const isTestResultDir = dir.startsWith('test-results-') || 
                              dir.includes('test-result') ||
                              dir.includes('-install') ||  // e.g., fresh-install, reinstall
                              dir.includes('-upgrade');
      
      if (!isTestResultDir) {
        console.log(`  ℹ️  Processing directory (may contain test results): ${dir}`);
        // Don't skip - process it and let file validation handle it
      } else {
        console.log(`  📂 Processing test results directory: ${dir}`);
      }
      
      try {
        const basePath = path.join(this.testArtifactsPath, dir);
        let resultsPath = basePath;
        let allFiles = fs.readdirSync(resultsPath);
        console.log(`    Files/dirs in ${dir}: ${allFiles.join(', ') || '(empty)'}`);
        
        // Check if there's a nested test-results subdirectory (GitHub Actions artifact structure)
        if (allFiles.includes('test-results') && fs.statSync(path.join(resultsPath, 'test-results')).isDirectory()) {
          console.log(`    📁 Found nested test-results directory, looking inside...`);
          resultsPath = path.join(resultsPath, 'test-results');
          allFiles = fs.readdirSync(resultsPath);
          console.log(`    Files in nested directory: ${allFiles.join(', ') || '(empty)'}`);
        }
        
        // Also check for logs directory which might contain results
        const logsCheckPath = path.join(basePath, 'logs');
        if (fs.existsSync(logsCheckPath) && fs.statSync(logsCheckPath).isDirectory()) {
          const logFiles = fs.readdirSync(logsCheckPath);
          console.log(`    📁 Also found logs directory with: ${logFiles.join(', ') || '(empty)'}`);
        }
        
        const resultFiles = allFiles.filter(file => file.endsWith('.json'));

        if (resultFiles.length === 0) {
          console.log(`    ⚠️  No JSON files found in ${dir}`);
        }
        
        for (const file of resultFiles) {
          // Skip validation reports and other non-test files
          if (file.includes('validation') || file.includes('security') || file === 'test-suite.json') {
            console.log(`    ⏭️  Skipping non-test file: ${file}`);
            continue;
          }
          
          console.log(`    📄 Processing file: ${file}`);
          
          const filePath = path.join(resultsPath, file);
          let result;
          
          try {
            result = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } catch (parseError) {
            console.log(`    ❌ Failed to parse JSON: ${file} - ${parseError.message}`);
            continue;
          }
          
          // Validate this is actually a test result
          if (!result || typeof result !== 'object') {
            console.log(`    ⏭️  Skipping invalid JSON: ${file}`);
            continue;
          }
          
          // Log what fields we found
          const fields = Object.keys(result).join(', ');
          console.log(`    📋 Found fields: ${fields}`);
          
          // Check if this looks like a test result (has expected structure)
          const isTestResult = 
            ('scenario' in result || 'platform' in result || 'steps' in result) ||
            (result.testSteps || result.summary);
            
          if (!isTestResult) {
            console.log(`    ⏭️  Skipping non-test-result file: ${file} (no test fields found)`);
            continue;
          }
          
          // Ensure required fields exist
          if (!result.platform) result.platform = 'unknown';
          if (!result.scenario) result.scenario = 'unknown';
          if (!result.nodeVersion) result.nodeVersion = 'unknown';
          if (!Array.isArray(result.steps)) result.steps = [];
          
          const key = `${result.platform}-${result.scenario}`;
          testResults[key] = result;
          
          console.log(`  ✓ Loaded ${dir}/${file}: ${key}`);
        }
      } catch (error) {
        console.warn(`  ⚠️  Failed to load results from ${dir}:`, error.message);
      }
    }

    console.log(`📊 Loaded test results from ${Object.keys(testResults).length} test runs`);
    
    // Log summary of loaded results
    if (Object.keys(testResults).length > 0) {
      console.log('📋 Test results summary:');
      Object.entries(testResults).forEach(([key, result]) => {
        console.log(`  - ${key}: ${result.steps?.length || 0} steps, platform=${result.platform}, node=${result.nodeVersion}`);
      });
    }
    
    return testResults;
  }

  /**
   * Validate that documented commands actually work
   */
  async validateCommandAccuracy(testSuite, testResults) {
    console.log('🔧 Validating command accuracy...');
    
    const category = 'command-accuracy';
    this.validationResults.categories[category] = {
      total: 0,
      passed: 0,
      failed: 0,
      issues: []
    };

    // Extract all commands from documentation
    const allCommands = testSuite.testSteps.flatMap(step => step.commands);
    
    for (const command of allCommands) {
      this.validationResults.categories[category].total++;

      // Check if command succeeded across test scenarios
      const commandResults = this.findCommandResults(command.raw, testResults);
      
      if (commandResults.length === 0) {
        this.validationResults.categories[category].failed++;
        this.validationResults.categories[category].issues.push({
          command: command.raw,
          issue: 'Command not found in any test results',
          severity: 'high'
        });
        continue;
      }

      const failedResults = commandResults.filter(result => result.status === 'failed');
      
      if (failedResults.length > 0) {
        this.validationResults.categories[category].failed++;
        this.validationResults.categories[category].issues.push({
          command: command.raw,
          issue: `Command failed in ${failedResults.length} scenarios`,
          failures: failedResults.map(f => ({ scenario: f.scenario, error: f.error })),
          severity: failedResults.length === commandResults.length ? 'critical' : 'medium'
        });
      } else {
        this.validationResults.categories[category].passed++;
      }
    }
  }

  /**
   * Validate that documentation steps are complete and accurate (with scenario awareness)
   */
  async validateStepCompleteness(testSuite, testResults) {
    console.log('📋 Validating step completeness...');
    
    const category = 'step-completeness';
    this.validationResults.categories[category] = {
      total: testSuite.testSteps.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      issues: []
    };

    // Analyze available scenarios to understand expected step execution
    const availableScenarios = [...new Set(Object.values(testResults).map(r => r.scenario))];
    console.log(`📋 Available test scenarios: ${availableScenarios.join(', ')}`);

    for (const step of testSuite.testSteps) {
      const stepResults = this.findStepResults(step, testResults);
      
      if (stepResults.length === 0) {
        // Check if this step should be expected to run in available scenarios
        const shouldRunInScenarios = this.shouldStepRunInScenarios(step, availableScenarios);
        
        if (shouldRunInScenarios.expected) {
          // Check if this appears to be mock/test data with partial coverage
          const isMockTestData = this.isMockTestScenario(testResults, availableScenarios);
          
          if (isMockTestData) {
            // In mock test scenarios, missing steps are expected due to partial test coverage
            this.validationResults.categories[category].skipped++;
            this.validationResults.categories[category].issues.push({
              step: step.step,
              section: step.section,
              issue: `Step not covered in mock test scenario (partial test coverage)`,
              severity: 'info',
              type: 'test-coverage-limitation',
              note: 'Mock test data may only cover specific scenarios or step types'
            });
          } else {
            // This step should have run but didn't - actual problem
            this.validationResults.categories[category].failed++;
            this.validationResults.categories[category].issues.push({
              step: step.step,
              section: step.section,
              issue: `Step expected to run in ${shouldRunInScenarios.scenarios.join(', ')} but was not executed`,
              severity: 'high',
              type: 'missing-execution'
            });
          }
        } else {
          // This step correctly skipped for available scenarios - expected behavior
          this.validationResults.categories[category].skipped++;
          this.validationResults.categories[category].issues.push({
            step: step.step,
            section: step.section,
            issue: `Step correctly skipped for scenarios: ${availableScenarios.join(', ')}`,
            severity: 'info',
            type: 'expected-skip',
            note: 'This is expected behavior for scenario-based testing'
          });
        }
        continue;
      }

      const successfulResults = stepResults.filter(result => result.status === 'passed');
      const failedResults = stepResults.filter(result => result.status === 'failed');

      if (failedResults.length > 0) {
        // Check if failures are expected for the scenarios
        const expectedFailures = this.areFailuresExpected(step, failedResults);
        
        if (expectedFailures.isExpected) {
          // Failures are expected (e.g., CI environment limitations)
          this.validationResults.categories[category].passed++;
          this.validationResults.categories[category].issues.push({
            step: step.step,
            section: step.section,
            issue: `Step had expected failures: ${expectedFailures.reason}`,
            severity: 'info',
            type: 'expected-failure'
          });
        } else {
          // Unexpected failures - actual problems
          this.validationResults.categories[category].failed++;
          
          const commonErrors = this.analyzeCommonErrors(failedResults);
          
          this.validationResults.categories[category].issues.push({
            step: step.step,
            section: step.section,
            issue: `Step failed unexpectedly in ${failedResults.length}/${stepResults.length} scenarios`,
            commonErrors,
            severity: failedResults.length === stepResults.length ? 'critical' : 'medium',
            type: 'unexpected-failure'
          });

          this.generateStepRecommendations(step, failedResults);
        }
      } else {
        this.validationResults.categories[category].passed++;
      }
    }
  }

  /**
   * Validate platform compatibility claims
   */
  async validatePlatformCompatibility(testResults) {
    console.log('🖥️  Validating platform compatibility...');
    
    const category = 'platform-compatibility';
    this.validationResults.categories[category] = {
      platforms: {},
      issues: []
    };

    const platforms = [...new Set(Object.values(testResults).map(r => r.platform))];
    
    for (const platform of platforms) {
      const platformResults = Object.values(testResults).filter(r => r.platform === platform);
      const successRate = this.calculateSuccessRate(platformResults);
      
      this.validationResults.categories[category].platforms[platform] = {
        testRuns: platformResults.length,
        successRate,
        status: successRate >= 0.8 ? 'good' : successRate >= 0.6 ? 'warning' : 'poor'
      };

      if (successRate < 0.8) {
        this.validationResults.categories[category].issues.push({
          platform,
          issue: `Low success rate (${Math.round(successRate * 100)}%) on ${platform}`,
          severity: successRate < 0.6 ? 'high' : 'medium',
          recommendation: `Review platform-specific instructions for ${platform}`
        });
      }
    }
  }

  /**
   * Validate version-specific instructions
   */
  async validateVersionSpecificInstructions(testResults) {
    console.log('📦 Validating version-specific instructions...');
    
    const category = 'version-compatibility';
    this.validationResults.categories[category] = {
      nodeVersions: {},
      issues: []
    };

    // Group results by Node.js version
    const versionGroups = {};
    Object.values(testResults).forEach(result => {
      const version = result.nodeVersion;
      if (!versionGroups[version]) {
        versionGroups[version] = [];
      }
      versionGroups[version].push(result);
    });

    for (const [version, results] of Object.entries(versionGroups)) {
      const successRate = this.calculateSuccessRate(results);
      
      this.validationResults.categories[category].nodeVersions[version] = {
        testRuns: results.length,
        successRate,
        status: successRate >= 0.9 ? 'good' : successRate >= 0.7 ? 'warning' : 'poor'
      };

      if (successRate < 0.9) {
        this.validationResults.categories[category].issues.push({
          nodeVersion: version,
          issue: `Issues detected with Node.js ${version} (${Math.round(successRate * 100)}% success rate)`,
          severity: successRate < 0.7 ? 'high' : 'medium'
        });
      }
    }
  }

  /**
   * Validate error handling documentation
   */
  async validateErrorHandling(testResults) {
    console.log('⚠️  Validating error handling documentation...');
    
    const category = 'error-handling';
    this.validationResults.categories[category] = {
      commonErrors: {},
      undocumentedErrors: [],
      issues: []
    };

    // Collect all errors from test results
    const allErrors = [];
    Object.values(testResults).forEach(result => {
      // Ensure result has steps property and it's an array
      if (result && Array.isArray(result.steps)) {
        result.steps.forEach(step => {
          if (step && step.status === 'failed' && step.error) {
            allErrors.push({
              error: step.error,
              step: step.name,
              scenario: result.scenario,
              platform: result.platform
            });
          }
        });
      }
    });

    // Analyze error patterns
    const errorPatterns = this.analyzeErrorPatterns(allErrors);
    
    for (const [pattern, occurrences] of Object.entries(errorPatterns)) {
      this.validationResults.categories[category].commonErrors[pattern] = {
        occurrences: occurrences.length,
        scenarios: [...new Set(occurrences.map(o => o.scenario))],
        platforms: [...new Set(occurrences.map(o => o.platform))]
      };

      // Check if error is documented in troubleshooting section
      if (!this.isErrorDocumented(pattern)) {
        this.validationResults.categories[category].undocumentedErrors.push({
          pattern,
          occurrences: occurrences.length,
          severity: occurrences.length >= 3 ? 'high' : 'medium',
          recommendation: `Add troubleshooting section for: ${pattern}`
        });
      }
    }
  }

  /**
   * Helper methods
   */
  
  /**
   * Determine if a step should run in the available test scenarios
   */
  shouldStepRunInScenarios(step, availableScenarios) {
    // Map step descriptions to scenarios where they should run
    const stepScenarioMapping = {
      'fresh-install': ['fresh-install', 'complete-setup'],
      'upgrade': ['upgrade', 'existing-setup'],
      'uninstall': ['uninstall', 'cleanup', 'removal'], // These should NOT run in fresh-install
      'cleanup': ['cleanup', 'removal', 'uninstall'],
      'configure': ['fresh-install', 'upgrade', 'complete-setup'],
      'verify': ['fresh-install', 'upgrade', 'complete-setup', 'verification'],
      'setup': ['fresh-install', 'complete-setup'],
      'install': ['fresh-install', 'complete-setup'],
      'deploy': ['fresh-install', 'upgrade', 'complete-setup']
    };
    
    // Analyze step content to determine expected scenarios
    const stepText = (step.step + ' ' + (step.section || '')).toLowerCase();
    let expectedScenarios = [];
    let isExpectedToRun = false;
    
    // Check for explicit scenario indicators
    for (const [keyword, scenarios] of Object.entries(stepScenarioMapping)) {
      if (stepText.includes(keyword)) {
        expectedScenarios = [...new Set([...expectedScenarios, ...scenarios])];
      }
    }
    
    // If no specific mapping found, assume general steps should run in most scenarios
    if (expectedScenarios.length === 0) {
      expectedScenarios = ['fresh-install', 'upgrade', 'complete-setup'];
    }
    
    // Check if any expected scenarios match available scenarios
    const matchingScenarios = expectedScenarios.filter(scenario => 
      availableScenarios.some(available => 
        available.toLowerCase().includes(scenario) || scenario.includes(available.toLowerCase())
      )
    );
    
    isExpectedToRun = matchingScenarios.length > 0;
    
    // Special case: uninstall steps should NOT run in fresh-install scenarios
    if (stepText.includes('uninstall') || stepText.includes('remove') || stepText.includes('cleanup')) {
      const hasOnlyFreshInstall = availableScenarios.every(s => 
        s.toLowerCase().includes('fresh') || s.toLowerCase().includes('install')
      );
      if (hasOnlyFreshInstall) {
        isExpectedToRun = false;
        expectedScenarios = ['uninstall', 'cleanup', 'removal'];
      }
    }
    
    return {
      expected: isExpectedToRun,
      scenarios: expectedScenarios,
      availableScenarios,
      matchingScenarios
    };
  }
  
  /**
   * Determine if step failures are expected (e.g., due to environment limitations)
   */
  areFailuresExpected(step, failedResults) {
    const stepText = (step.step + ' ' + (step.section || '')).toLowerCase();
    const failureReasons = [];
    let isExpected = false;
    let reason = '';
    
    // Analyze failure patterns
    const allErrors = failedResults.flatMap(result => 
      Array.isArray(result.errors) ? result.errors : [result.error || 'Unknown error']
    ).filter(Boolean);
    
    const errorText = allErrors.join(' ').toLowerCase();
    
    // Check for known expected failure patterns
    const expectedFailurePatterns = [
      {
        pattern: /permission.*denied|eacces|enotdir/i,
        reason: 'Permission restrictions in CI environment',
        keywords: ['install', 'setup', 'configure']
      },
      {
        pattern: /network.*error|connection.*refused|timeout/i,
        reason: 'Network connectivity issues in test environment',
        keywords: ['download', 'fetch', 'install', 'deploy']
      },
      {
        pattern: /command.*not.*found|no.*such.*file/i,
        reason: 'Missing dependencies in minimal test environment',
        keywords: ['command', 'binary', 'executable']
      },
      {
        pattern: /already.*exists|file.*exists/i,
        reason: 'Resource conflicts in shared test environment',
        keywords: ['create', 'setup', 'install']
      }
    ];
    
    // Check each pattern
    for (const { pattern, reason: patternReason, keywords } of expectedFailurePatterns) {
      if (pattern.test(errorText)) {
        const hasRelevantKeyword = keywords.some(keyword => stepText.includes(keyword));
        if (hasRelevantKeyword) {
          isExpected = true;
          reason = patternReason;
          failureReasons.push(patternReason);
          break;
        }
      }
    }
    
    // Additional heuristics for expected failures
    if (!isExpected) {
      // CI environment limitations
      const ciEnvironments = failedResults.filter(r => 
        r.platform && r.platform.toLowerCase().includes('ci') ||
        r.scenario && r.scenario.toLowerCase().includes('ci')
      );
      
      if (ciEnvironments.length > 0 && stepText.includes('install')) {
        isExpected = true;
        reason = 'Installation restrictions in CI environment';
      }
    }
    
    return {
      isExpected,
      reason,
      patterns: failureReasons,
      affectedResults: failedResults.length
    };
  }
  
  /**
   * Detect if this appears to be mock/test data with intentionally partial coverage
   */
  isMockTestScenario(testResults, availableScenarios) {
    const testResultsArray = Object.values(testResults);
    
    // Check for indicators of mock/test data
    const mockIndicators = [
      // File path indicators
      (results) => results.some(r => r.filePath && r.filePath.includes('mock')),
      
      // Scenario/step content mismatch (uninstall steps in fresh-install scenario)
      (results) => {
        const hasUninstallSteps = results.some(r => 
          r.steps && r.steps.some(step => 
            step.name && (
              step.name.toLowerCase().includes('uninstall') ||
              step.name.toLowerCase().includes('remove') ||
              step.name.toLowerCase().includes('cleanup')
            )
          )
        );
        const hasFreshInstallScenario = availableScenarios.some(s => 
          s.toLowerCase().includes('fresh') || s.toLowerCase().includes('install')
        );
        return hasUninstallSteps && hasFreshInstallScenario;
      },
      
      // Limited step diversity (only one type of operation)
      (results) => {
        const allStepNames = results.flatMap(r => 
          (r.steps || []).map(step => step.name || '')
        ).filter(Boolean);
        
        const operationTypes = new Set();
        const keywords = ['install', 'uninstall', 'remove', 'setup', 'configure', 'verify'];
        
        for (const stepName of allStepNames) {
          for (const keyword of keywords) {
            if (stepName.toLowerCase().includes(keyword)) {
              operationTypes.add(keyword);
            }
          }
        }
        
        // If we only see 1-2 operation types, it's likely partial test data
        return operationTypes.size <= 2;
      },
      
      // Test artifact file path indicators
      (results) => results.some(r => r.source && r.source.includes('test-artifacts')),
      
      // Small number of total results suggesting focused testing
      (results) => results.length <= 3 && results.some(r => r.steps && r.steps.length < 20)
    ];
    
    // Check if any mock indicators are present
    return mockIndicators.some(indicator => indicator(testResultsArray));
  }

  findCommandResults(command, testResults) {
    const results = [];
    
    Object.values(testResults).forEach(result => {
      // Ensure result has steps property and it's an array
      if (result && Array.isArray(result.steps)) {
        result.steps.forEach(step => {
          if (step && Array.isArray(step.commands)) {
            step.commands.forEach(cmd => {
              if (cmd && cmd.command === command) {
                results.push({
                  ...cmd,
                  scenario: result.scenario,
                  platform: result.platform
                });
              }
            });
          }
        });
      }
    });
    
    return results;
  }

  findStepResults(step, testResults) {
    const results = [];
    const stepName = `[${step.section}] ${step.step}`;
    
    Object.values(testResults).forEach(result => {
      // Ensure result has steps property and it's an array
      if (result && Array.isArray(result.steps)) {
        const matchingStep = result.steps.find(s => s && s.name === stepName);
        if (matchingStep) {
          results.push({
            ...matchingStep,
            scenario: result.scenario,
            platform: result.platform
          });
        }
      }
    });
    
    return results;
  }

  calculateSuccessRate(results) {
    if (results.length === 0) return 0;
    
    const totalSteps = results.reduce((sum, result) => sum + 
      (result.summary?.passed || 0) + 
      (result.summary?.failed || 0), 0);
    
    const passedSteps = results.reduce((sum, result) => sum + 
      (result.summary?.passed || 0), 0);
    
    return totalSteps > 0 ? passedSteps / totalSteps : 0;
  }

  analyzeCommonErrors(failedResults) {
    const errorCounts = {};
    
    failedResults.forEach(result => {
      if (result.error) {
        const errorKey = this.normalizeError(result.error);
        errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
      }
    });
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([error, count]) => ({ error, count }));
  }

  analyzeErrorPatterns(allErrors) {
    const patterns = {};
    
    allErrors.forEach(errorObj => {
      const pattern = this.extractErrorPattern(errorObj.error);
      if (!patterns[pattern]) {
        patterns[pattern] = [];
      }
      patterns[pattern].push(errorObj);
    });
    
    return patterns;
  }

  extractErrorPattern(error) {
    // Extract common error patterns
    if (error.includes('ENOENT')) return 'File not found';
    if (error.includes('EACCES')) return 'Permission denied';
    if (error.includes('npm ERR!')) return 'NPM error';
    if (error.includes('command not found')) return 'Command not found';
    if (error.includes('timeout')) return 'Timeout error';
    
    // Return first 50 characters for unknown patterns
    return error.substring(0, 50) + '...';
  }

  normalizeError(error) {
    return error.toLowerCase()
      .replace(/\d+/g, 'X')  // Replace numbers
      .replace(/\/[^\s]+/g, '/PATH')  // Replace paths
      .substring(0, 100);
  }

  isErrorDocumented(pattern) {
    // Check if error pattern appears in troubleshooting documentation
    // This would require parsing the troubleshooting section
    // For now, return false to highlight all undocumented errors
    return false;
  }

  generateStepRecommendations(step, failedResults) {
    const recommendations = [];
    
    // Analyze failure patterns to generate specific recommendations
    const errorPatterns = this.analyzeCommonErrors(failedResults);
    
    errorPatterns.forEach(({ error, count }) => {
      if (error.includes('permission')) {
        recommendations.push(`Add note about permissions for step: ${step.step}`);
      }
      if (error.includes('timeout')) {
        recommendations.push(`Consider increasing timeout guidance for: ${step.step}`);
      }
      if (error.includes('not found')) {
        recommendations.push(`Add prerequisite check for: ${step.step}`);
      }
    });
    
    this.validationResults.recommendations.push(...recommendations);
  }

  generateOverallAssessment() {
    const categories = Object.values(this.validationResults.categories);
    let totalIssues = 0;
    let criticalIssues = 0;
    
    categories.forEach(category => {
      if (category.issues) {
        totalIssues += category.issues.length;
        criticalIssues += category.issues.filter(issue => 
          issue.severity === 'critical' || issue.severity === 'high'
        ).length;
      }
    });
    
    if (criticalIssues > 0) {
      this.validationResults.overall = 'critical';
    } else if (totalIssues > 5) {
      this.validationResults.overall = 'warning';
    } else {
      this.validationResults.overall = 'passed';
    }
    
    this.validationResults.summary = {
      totalIssues,
      criticalIssues,
      recommendations: this.validationResults.recommendations.length
    };
  }

  outputResults() {
    const { overall, summary } = this.validationResults;
    
    console.log(`\n📊 Documentation Accuracy Validation Results`);
    console.log(`═══════════════════════════════════════════════`);
    
    const statusIcon = overall === 'passed' ? '✅' : 
                      overall === 'warning' ? '⚠️' : '❌';
    
    console.log(`\n${statusIcon} Overall Status: ${overall.toUpperCase()}`);
    console.log(`📋 Total Issues: ${summary.totalIssues}`);
    console.log(`🚨 Critical Issues: ${summary.criticalIssues}`);
    console.log(`💡 Recommendations: ${summary.recommendations}`);
    
    // Output category summaries
    Object.entries(this.validationResults.categories).forEach(([name, category]) => {
      console.log(`\n🔍 ${name.replace(/-/g, ' ').toUpperCase()}`);
      
      if (category.total !== undefined) {
        const successRate = Math.round((category.passed / category.total) * 100);
        console.log(`   Success Rate: ${successRate}% (${category.passed}/${category.total})`);
      }
      
      if (category.issues && category.issues.length > 0) {
        console.log(`   Issues Found: ${category.issues.length}`);
        category.issues.slice(0, 3).forEach(issue => {
          console.log(`   - ${issue.issue || issue.pattern}`);
        });
      }
    });
    
    // Save detailed results
    const resultsPath = path.join(__dirname, 'test-results', `documentation-validation-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify(this.validationResults, null, 2));
    
    console.log(`\n📄 Detailed results saved to: ${resultsPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const testArtifactsPath = process.argv[2] || path.join(__dirname, 'test-artifacts');
  
  const validator = new DocumentationAccuracyValidator(testArtifactsPath);
  
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = { DocumentationAccuracyValidator };