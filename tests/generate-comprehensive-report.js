#!/usr/bin/env node

/**
 * Comprehensive Test Report Generator
 * Generates detailed reports from all test artifacts
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveReportGenerator {
  constructor(testArtifactsPath) {
    this.testArtifactsPath = testArtifactsPath;
    this.reportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        testArtifactsPath: testArtifactsPath
      },
      summary: {
        totalTestRuns: 0,
        overallSuccessRate: 0,
        platformBreakdown: {},
        scenarioBreakdown: {},
        nodeVersionBreakdown: {}
      },
      detailedResults: [],
      analysis: {
        commonFailures: [],
        platformSpecificIssues: [],
        improvementRecommendations: [],
        documentationGaps: []
      }
    };
  }

  /**
   * Generate comprehensive report from all test artifacts
   */
  async generate() {
    console.log('📊 Generating comprehensive test report...\n');

    try {
      // Load all test results
      const testResults = await this.loadAllTestResults();
      
      // Analyze results
      await this.analyzeResults(testResults);
      
      // Generate report content
      const markdownReport = this.generateMarkdownReport();
      const jsonReport = this.generateJsonReport();
      
      // Output to console and files
      console.log(markdownReport);
      
      // Save reports
      this.saveReports(markdownReport, jsonReport);
      
      return true;
      
    } catch (error) {
      console.error('❌ Report generation failed:', error.message);
      return false;
    }
  }

  /**
   * Load all test results from artifacts directory
   */
  async loadAllTestResults() {
    const testResults = [];
    
    if (!fs.existsSync(this.testArtifactsPath)) {
      console.warn(`⚠️  Test artifacts path not found: ${this.testArtifactsPath}`);
      return testResults;
    }

    const artifactDirs = fs.readdirSync(this.testArtifactsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`🔍 Found ${artifactDirs.length} test artifact directories`);

    for (const dir of artifactDirs) {
      try {
        const resultsPath = path.join(this.testArtifactsPath, dir);
        const resultFiles = fs.readdirSync(resultsPath)
          .filter(file => file.endsWith('.json') && file.includes('report-'));

        for (const file of resultFiles) {
          const filePath = path.join(resultsPath, file);
          const result = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Add metadata from directory name
          const [platform, nodeVersion, scenario] = this.parseArtifactDirName(dir);
          result.artifactDir = dir;
          result.platform = result.platform || platform;
          result.nodeVersion = result.nodeVersion || nodeVersion;
          result.scenario = result.scenario || scenario;
          
          testResults.push(result);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to load results from ${dir}:`, error.message);
      }
    }

    console.log(`✅ Loaded ${testResults.length} test results\n`);
    return testResults;
  }

  /**
   * Parse artifact directory name to extract metadata
   */
  parseArtifactDirName(dirName) {
    // Expected format: test-results-{platform}-{nodeVersion}-{scenario}
    const parts = dirName.replace('test-results-', '').split('-');
    
    return [
      parts[0] || 'unknown-platform',      // platform
      parts[1] || 'unknown-version',       // nodeVersion  
      parts.slice(2).join('-') || 'unknown-scenario'  // scenario
    ];
  }

  /**
   * Analyze all test results and generate insights
   */
  async analyzeResults(testResults) {
    console.log('🔍 Analyzing test results...');

    this.reportData.summary.totalTestRuns = testResults.length;
    this.reportData.detailedResults = testResults;

    // Calculate overall success rate
    this.calculateOverallSuccessRate(testResults);
    
    // Analyze by dimensions
    this.analyzePlatformBreakdown(testResults);
    this.analyzeScenarioBreakdown(testResults);
    this.analyzeNodeVersionBreakdown(testResults);
    
    // Identify patterns and issues
    this.identifyCommonFailures(testResults);
    this.identifyPlatformSpecificIssues(testResults);
    this.generateImprovementRecommendations(testResults);
    this.identifyDocumentationGaps(testResults);
    
    console.log('✅ Analysis complete\n');
  }

  /**
   * Calculate overall success rate across all test runs
   */
  calculateOverallSuccessRate(testResults) {
    let totalSteps = 0;
    let passedSteps = 0;

    testResults.forEach(result => {
      if (result.summary) {
        totalSteps += (result.summary.passed || 0) + (result.summary.failed || 0);
        passedSteps += (result.summary.passed || 0);
      }
    });

    this.reportData.summary.overallSuccessRate = totalSteps > 0 ? 
      Math.round((passedSteps / totalSteps) * 100) : 0;
  }

  /**
   * Analyze results by platform
   */
  analyzePlatformBreakdown(testResults) {
    const platformGroups = this.groupBy(testResults, 'platform');
    
    Object.entries(platformGroups).forEach(([platform, results]) => {
      const successRate = this.calculateSuccessRateForGroup(results);
      const avgDuration = this.calculateAverageDuration(results);
      
      this.reportData.summary.platformBreakdown[platform] = {
        testRuns: results.length,
        successRate,
        avgDuration,
        status: this.getStatusFromSuccessRate(successRate)
      };
    });
  }

  /**
   * Analyze results by scenario
   */
  analyzeScenarioBreakdown(testResults) {
    const scenarioGroups = this.groupBy(testResults, 'scenario');
    
    Object.entries(scenarioGroups).forEach(([scenario, results]) => {
      const successRate = this.calculateSuccessRateForGroup(results);
      const avgDuration = this.calculateAverageDuration(results);
      
      this.reportData.summary.scenarioBreakdown[scenario] = {
        testRuns: results.length,
        successRate,
        avgDuration,
        status: this.getStatusFromSuccessRate(successRate)
      };
    });
  }

  /**
   * Analyze results by Node.js version
   */
  analyzeNodeVersionBreakdown(testResults) {
    const versionGroups = this.groupBy(testResults, 'nodeVersion');
    
    Object.entries(versionGroups).forEach(([version, results]) => {
      const successRate = this.calculateSuccessRateForGroup(results);
      
      this.reportData.summary.nodeVersionBreakdown[version] = {
        testRuns: results.length,
        successRate,
        status: this.getStatusFromSuccessRate(successRate)
      };
    });
  }

  /**
   * Identify most common failure patterns
   */
  identifyCommonFailures(testResults) {
    const failurePatterns = {};
    
    testResults.forEach(result => {
      result.steps?.forEach(step => {
        if (step.status === 'failed' && step.error) {
          const pattern = this.extractFailurePattern(step.error);
          if (!failurePatterns[pattern]) {
            failurePatterns[pattern] = {
              pattern,
              count: 0,
              examples: [],
              affectedSteps: new Set(),
              affectedScenarios: new Set()
            };
          }
          
          failurePatterns[pattern].count++;
          failurePatterns[pattern].examples.push(step.error);
          failurePatterns[pattern].affectedSteps.add(step.name);
          failurePatterns[pattern].affectedScenarios.add(result.scenario);
        }
      });
    });

    // Sort by frequency and take top 10
    this.reportData.analysis.commonFailures = Object.values(failurePatterns)
      .map(pattern => ({
        ...pattern,
        affectedSteps: Array.from(pattern.affectedSteps),
        affectedScenarios: Array.from(pattern.affectedScenarios)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Identify platform-specific issues
   */
  identifyPlatformSpecificIssues(testResults) {
    const platformIssues = {};
    
    testResults.forEach(result => {
      const platform = result.platform;
      const failedSteps = result.steps?.filter(step => step.status === 'failed') || [];
      
      failedSteps.forEach(step => {
        const key = `${platform}-${step.name}`;
        if (!platformIssues[key]) {
          platformIssues[key] = {
            platform,
            step: step.name,
            count: 0,
            errors: []
          };
        }
        platformIssues[key].count++;
        platformIssues[key].errors.push(step.error);
      });
    });

    // Find issues that are specific to certain platforms
    const stepCounts = {};
    Object.values(platformIssues).forEach(issue => {
      if (!stepCounts[issue.step]) {
        stepCounts[issue.step] = new Set();
      }
      stepCounts[issue.step].add(issue.platform);
    });

    this.reportData.analysis.platformSpecificIssues = Object.values(platformIssues)
      .filter(issue => stepCounts[issue.step].size < Object.keys(this.reportData.summary.platformBreakdown).length)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Generate improvement recommendations
   */
  generateImprovementRecommendations(testResults) {
    const recommendations = [];

    // Analyze success rates
    const lowSuccessScenarios = Object.entries(this.reportData.summary.scenarioBreakdown)
      .filter(([, data]) => data.successRate < 80)
      .map(([scenario]) => scenario);

    if (lowSuccessScenarios.length > 0) {
      recommendations.push({
        category: 'scenario-reliability',
        priority: 'high',
        recommendation: `Improve reliability for scenarios: ${lowSuccessScenarios.join(', ')}`,
        details: 'These scenarios have success rates below 80%'
      });
    }

    // Analyze common failures
    this.reportData.analysis.commonFailures.slice(0, 3).forEach(failure => {
      recommendations.push({
        category: 'error-handling',
        priority: failure.count >= 5 ? 'high' : 'medium',
        recommendation: `Add troubleshooting guide for: ${failure.pattern}`,
        details: `This error occurred ${failure.count} times across multiple scenarios`
      });
    });

    // Analyze platform issues
    const problematicPlatforms = Object.entries(this.reportData.summary.platformBreakdown)
      .filter(([, data]) => data.successRate < 70)
      .map(([platform]) => platform);

    if (problematicPlatforms.length > 0) {
      recommendations.push({
        category: 'platform-support',
        priority: 'high',
        recommendation: `Review platform-specific instructions for: ${problematicPlatforms.join(', ')}`,
        details: 'These platforms have success rates below 70%'
      });
    }

    // Duration analysis
    const slowScenarios = Object.entries(this.reportData.summary.scenarioBreakdown)
      .filter(([, data]) => data.avgDuration > 300000) // 5 minutes
      .map(([scenario]) => scenario);

    if (slowScenarios.length > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        recommendation: `Optimize installation steps for: ${slowScenarios.join(', ')}`,
        details: 'These scenarios take longer than 5 minutes on average'
      });
    }

    this.reportData.analysis.improvementRecommendations = recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  /**
   * Identify documentation gaps
   */
  identifyDocumentationGaps(testResults) {
    const gaps = [];

    // Find steps that consistently fail
    const stepFailures = {};
    testResults.forEach(result => {
      result.steps?.forEach(step => {
        if (!stepFailures[step.name]) {
          stepFailures[step.name] = { total: 0, failed: 0 };
        }
        stepFailures[step.name].total++;
        if (step.status === 'failed') {
          stepFailures[step.name].failed++;
        }
      });
    });

    Object.entries(stepFailures).forEach(([stepName, counts]) => {
      const failureRate = counts.failed / counts.total;
      if (failureRate > 0.3 && counts.total >= 3) { // 30% failure rate with at least 3 attempts
        gaps.push({
          type: 'unclear-instructions',
          step: stepName,
          failureRate: Math.round(failureRate * 100),
          suggestion: `Review and clarify instructions for: ${stepName}`
        });
      }
    });

    // Find missing error documentation
    this.reportData.analysis.commonFailures.slice(0, 5).forEach(failure => {
      gaps.push({
        type: 'missing-troubleshooting',
        pattern: failure.pattern,
        occurrences: failure.count,
        suggestion: `Add troubleshooting section for error pattern: ${failure.pattern}`
      });
    });

    this.reportData.analysis.documentationGaps = gaps;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    const { summary, analysis } = this.reportData;
    
    let report = `# Claude Dev Toolkit - Install Guide Test Report\n\n`;
    report += `**Generated:** ${new Date(this.reportData.metadata.generatedAt).toLocaleString()}\n\n`;

    // Executive Summary
    report += `## 📊 Executive Summary\n\n`;
    report += `- **Total Test Runs:** ${summary.totalTestRuns}\n`;
    report += `- **Overall Success Rate:** ${summary.overallSuccessRate}%\n`;
    report += `- **Common Failures Identified:** ${analysis.commonFailures.length}\n`;
    report += `- **Improvement Recommendations:** ${analysis.improvementRecommendations.length}\n\n`;

    // Platform Breakdown
    report += `## 🖥️ Platform Analysis\n\n`;
    report += `| Platform | Test Runs | Success Rate | Status |\n`;
    report += `|----------|-----------|--------------|--------|\n`;
    Object.entries(summary.platformBreakdown).forEach(([platform, data]) => {
      const statusIcon = data.status === 'good' ? '✅' : 
                        data.status === 'warning' ? '⚠️' : '❌';
      report += `| ${platform} | ${data.testRuns} | ${data.successRate}% | ${statusIcon} ${data.status} |\n`;
    });
    report += `\n`;

    // Scenario Breakdown  
    report += `## 🎯 Scenario Analysis\n\n`;
    report += `| Scenario | Test Runs | Success Rate | Avg Duration | Status |\n`;
    report += `|----------|-----------|--------------|--------------|--------|\n`;
    Object.entries(summary.scenarioBreakdown).forEach(([scenario, data]) => {
      const statusIcon = data.status === 'good' ? '✅' : 
                        data.status === 'warning' ? '⚠️' : '❌';
      const duration = data.avgDuration ? `${Math.round(data.avgDuration / 1000)}s` : 'N/A';
      report += `| ${scenario} | ${data.testRuns} | ${data.successRate}% | ${duration} | ${statusIcon} ${data.status} |\n`;
    });
    report += `\n`;

    // Common Failures
    if (analysis.commonFailures.length > 0) {
      report += `## ❌ Common Failure Patterns\n\n`;
      analysis.commonFailures.slice(0, 5).forEach((failure, index) => {
        report += `### ${index + 1}. ${failure.pattern}\n`;
        report += `- **Occurrences:** ${failure.count}\n`;
        report += `- **Affected Scenarios:** ${failure.affectedScenarios.join(', ')}\n`;
        report += `- **Affected Steps:** ${failure.affectedSteps.slice(0, 3).join(', ')}\n`;
        if (failure.examples.length > 0) {
          report += `- **Example Error:** \`${failure.examples[0].substring(0, 100)}...\`\n`;
        }
        report += `\n`;
      });
    }

    // Platform-Specific Issues
    if (analysis.platformSpecificIssues.length > 0) {
      report += `## 🖥️ Platform-Specific Issues\n\n`;
      analysis.platformSpecificIssues.slice(0, 5).forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.platform} - ${issue.step}\n`;
        report += `- **Occurrences:** ${issue.count}\n`;
        if (issue.errors.length > 0) {
          report += `- **Example Error:** \`${issue.errors[0].substring(0, 100)}...\`\n`;
        }
        report += `\n`;
      });
    }

    // Recommendations
    if (analysis.improvementRecommendations.length > 0) {
      report += `## 💡 Improvement Recommendations\n\n`;
      analysis.improvementRecommendations.forEach((rec, index) => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : 
                           rec.priority === 'medium' ? '🟡' : '🟢';
        report += `### ${index + 1}. ${priorityIcon} ${rec.recommendation}\n`;
        report += `- **Category:** ${rec.category}\n`;
        report += `- **Priority:** ${rec.priority}\n`;
        report += `- **Details:** ${rec.details}\n\n`;
      });
    }

    // Documentation Gaps
    if (analysis.documentationGaps.length > 0) {
      report += `## 📚 Documentation Gaps\n\n`;
      analysis.documentationGaps.forEach((gap, index) => {
        report += `### ${index + 1}. ${gap.type.replace(/-/g, ' ').toUpperCase()}\n`;
        report += `- **Suggestion:** ${gap.suggestion}\n`;
        if (gap.failureRate) {
          report += `- **Failure Rate:** ${gap.failureRate}%\n`;
        }
        if (gap.occurrences) {
          report += `- **Occurrences:** ${gap.occurrences}\n`;
        }
        report += `\n`;
      });
    }

    // Next Steps
    report += `## 🚀 Next Steps\n\n`;
    report += `1. **Address High-Priority Issues:** Focus on recommendations marked as high priority\n`;
    report += `2. **Update Documentation:** Address identified documentation gaps\n`;
    report += `3. **Platform Testing:** Improve support for platforms with low success rates\n`;
    report += `4. **Error Handling:** Add troubleshooting guides for common failure patterns\n`;
    report += `5. **Continuous Monitoring:** Re-run tests after implementing improvements\n\n`;

    return report;
  }

  /**
   * Generate JSON report
   */
  generateJsonReport() {
    return JSON.stringify(this.reportData, null, 2);
  }

  /**
   * Save reports to files
   */
  saveReports(markdownReport, jsonReport) {
    const timestamp = Date.now();
    const resultsDir = path.join(__dirname, 'test-results');
    
    // Ensure directory exists
    fs.mkdirSync(resultsDir, { recursive: true });
    
    // Save markdown report
    const markdownPath = path.join(resultsDir, `comprehensive-report-${timestamp}.md`);
    fs.writeFileSync(markdownPath, markdownReport);
    
    // Save JSON report
    const jsonPath = path.join(resultsDir, `comprehensive-report-${timestamp}.json`);
    fs.writeFileSync(jsonPath, jsonReport);
    
    console.log(`\n📄 Reports saved:`);
    console.log(`   Markdown: ${markdownPath}`);
    console.log(`   JSON: ${jsonPath}`);
  }

  /**
   * Helper methods
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const groupKey = item[key] || 'unknown';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  calculateSuccessRateForGroup(results) {
    let totalSteps = 0;
    let passedSteps = 0;

    results.forEach(result => {
      if (result.summary) {
        totalSteps += (result.summary.passed || 0) + (result.summary.failed || 0);
        passedSteps += (result.summary.passed || 0);
      }
    });

    return totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0;
  }

  calculateAverageDuration(results) {
    const validDurations = results
      .filter(result => result.duration && result.duration > 0)
      .map(result => result.duration);

    if (validDurations.length === 0) return null;
    
    return Math.round(validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length);
  }

  getStatusFromSuccessRate(successRate) {
    if (successRate >= 90) return 'good';
    if (successRate >= 70) return 'warning';
    return 'poor';
  }

  extractFailurePattern(error) {
    if (error.includes('ENOENT')) return 'File not found error';
    if (error.includes('EACCES')) return 'Permission denied error';
    if (error.includes('npm ERR!')) return 'NPM installation error';
    if (error.includes('command not found')) return 'Command not found error';
    if (error.includes('timeout')) return 'Timeout error';
    if (error.includes('ECONNREFUSED')) return 'Connection refused error';
    if (error.includes('certificate')) return 'Certificate/SSL error';
    if (error.includes('proxy')) return 'Proxy configuration error';
    
    // Extract first meaningful part of unknown errors
    const firstLine = error.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }
}

// CLI usage
if (require.main === module) {
  const testArtifactsPath = process.argv[2] || path.join(__dirname, 'test-artifacts');
  
  const generator = new ComprehensiveReportGenerator(testArtifactsPath);
  
  generator.generate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Report generation failed:', error.message);
    process.exit(1);
  });
}

module.exports = { ComprehensiveReportGenerator };