#!/usr/bin/env node

/**
 * Security Validator for Install Guide Commands
 * Validates that documented commands follow security best practices
 */

const fs = require('fs');
const path = require('path');
const { InstallGuideParser } = require('./install-guide-parser');

class SecurityValidator {
  constructor() {
    this.securityIssues = [];
    this.securityRules = [
      {
        name: 'unsafe-rm-commands',
        pattern: /rm -rf (?![\s]*(?:~\/\.claude|\.claude\/|node_modules|\.npm|\/tmp))/,
        severity: 'critical',
        description: 'Unsafe rm -rf command targeting system directories'
      },
      {
        name: 'sudo-usage',
        pattern: /sudo /,
        severity: 'high',
        description: 'Usage of sudo for npm operations'
      },
      {
        name: 'npm-unsafe-flags',
        pattern: /npm.*--unsafe-perm/,
        severity: 'high',
        description: 'Using unsafe npm permissions'
      },
      {
        name: 'curl-pipe-bash',
        pattern: /curl.*\|\s*(bash|sh)/,
        severity: 'critical',
        description: 'Dangerous curl | bash pattern'
      },
      {
        name: 'chmod-777',
        pattern: /chmod.*777/,
        severity: 'high',
        description: 'Overly permissive file permissions (777)'
      },
      {
        name: 'npm-global-force',
        pattern: /npm.*install.*-g.*--force/,
        severity: 'medium',
        description: 'Forced global npm installation'
      },
      {
        name: 'unverified-package-source',
        pattern: /npm.*install.*(?:http:|ftp:)/,
        severity: 'high',
        description: 'Installing from unverified HTTP/FTP sources'
      },
      {
        name: 'hardcoded-credentials',
        pattern: /(password|secret|key|token)\s*[:=]\s*['\"][^'\"]+['\"]/i,
        severity: 'critical',
        description: 'Hardcoded credentials in commands'
      }
    ];
  }

  /**
   * Validate security of all commands in the install guide
   */
  async validateSecurity(guidePath) {
    console.log('🔒 Running security validation on install guide...\n');

    try {
      // Parse the install guide
      const parser = new InstallGuideParser(guidePath);
      const testSuite = parser.generateTestSuite();
      
      console.log(`📋 Analyzing ${testSuite.testSteps.length} steps for security issues`);
      
      // Validate each step
      let totalCommands = 0;
      testSuite.testSteps.forEach((step, stepIndex) => {
        step.commands.forEach((command, cmdIndex) => {
          totalCommands++;
          this.validateCommand(command.raw, stepIndex + 1, step.step, cmdIndex + 1);
        });
      });

      // Generate security report
      const report = this.generateSecurityReport(totalCommands);
      console.log(report);
      
      // Save report
      this.saveSecurityReport(report);
      
      // Exit with appropriate code
      const criticalIssues = this.securityIssues.filter(issue => issue.severity === 'critical');
      if (criticalIssues.length > 0) {
        console.error(`\n❌ Found ${criticalIssues.length} critical security issues!`);
        process.exit(1);
      } else if (this.securityIssues.length > 0) {
        console.warn(`\n⚠️  Found ${this.securityIssues.length} security concerns`);
        process.exit(2);
      } else {
        console.log('\n✅ No security issues found');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('❌ Security validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate a single command against security rules
   */
  validateCommand(command, stepNumber, stepName, commandNumber) {
    this.securityRules.forEach(rule => {
      if (rule.pattern.test(command)) {
        // Check for exceptions
        if (this.isSecurityException(command, rule)) {
          return;
        }

        this.securityIssues.push({
          rule: rule.name,
          severity: rule.severity,
          description: rule.description,
          command: command,
          step: stepNumber,
          stepName: stepName,
          commandNumber: commandNumber,
          recommendation: this.getSecurityRecommendation(rule.name, command)
        });
      }
    });
  }

  /**
   * Check if command is an acceptable security exception
   */
  isSecurityException(command, rule) {
    const exceptions = {
      'unsafe-rm-commands': [
        // Allow removal of specific safe paths
        /rm -rf\s+~\/\.claude/,
        /rm -rf\s+\.claude\//,
        /rm -rf\s+node_modules/,
        /rm -rf\s+\.npm/,
        /rm -rf\s+\/tmp\/claude-test/,
        // Allow echo commands that contain rm -rf for documentation purposes
        /^echo\s+.*rm -rf/
      ],
      'sudo-usage': [
        // No exceptions for sudo in install guides
      ],
      'npm-global-force': [
        // Allow force flag for cache cleaning
        /npm cache clean --force/
      ]
    };

    const ruleExceptions = exceptions[rule.name] || [];
    return ruleExceptions.some(pattern => pattern.test(command));
  }

  /**
   * Get security recommendation for specific rule violation
   */
  getSecurityRecommendation(ruleName, command) {
    const recommendations = {
      'unsafe-rm-commands': 'Use specific paths and avoid system directories. Consider using safer alternatives like clearing only known directories.',
      'sudo-usage': 'Avoid sudo for npm operations. Use npm config to set user directory or use node version managers like nvm.',
      'npm-unsafe-flags': 'Remove --unsafe-perm flag and fix permission issues properly using npm config.',
      'curl-pipe-bash': 'Download script first, review it, then execute separately. Never pipe remote scripts directly to bash.',
      'chmod-777': 'Use more restrictive permissions like 755 or 644. 777 gives read/write/execute to everyone.',
      'npm-global-force': 'Remove --force flag and resolve conflicts properly. Forcing can hide real issues.',
      'unverified-package-source': 'Use official npm registry (https://registry.npmjs.org/) or verified package sources only.',
      'hardcoded-credentials': 'Use environment variables or secure credential storage instead of hardcoding sensitive data.'
    };

    return recommendations[ruleName] || 'Review this command for security implications';
  }

  /**
   * Generate comprehensive security report
   */
  generateSecurityReport(totalCommands) {
    const criticalCount = this.securityIssues.filter(issue => issue.severity === 'critical').length;
    const highCount = this.securityIssues.filter(issue => issue.severity === 'high').length;
    const mediumCount = this.securityIssues.filter(issue => issue.severity === 'medium').length;
    const lowCount = this.securityIssues.filter(issue => issue.severity === 'low').length;

    let report = `🔒 Security Validation Report\n`;
    report += `=====================================\n\n`;
    
    report += `📊 Summary:\n`;
    report += `  Total Commands Analyzed: ${totalCommands}\n`;
    report += `  Security Issues Found: ${this.securityIssues.length}\n\n`;
    
    report += `📈 Severity Breakdown:\n`;
    report += `  🔴 Critical: ${criticalCount}\n`;
    report += `  🟠 High: ${highCount}\n`;
    report += `  🟡 Medium: ${mediumCount}\n`;
    report += `  🟢 Low: ${lowCount}\n\n`;

    if (this.securityIssues.length === 0) {
      report += `✅ No security issues detected!\n`;
      report += `All commands follow security best practices.\n`;
      return report;
    }

    // Group issues by severity
    const issuesBySeverity = this.groupIssuesBySeverity();
    
    ['critical', 'high', 'medium', 'low'].forEach(severity => {
      const issues = issuesBySeverity[severity] || [];
      if (issues.length === 0) return;

      const icon = severity === 'critical' ? '🔴' : 
                  severity === 'high' ? '🟠' : 
                  severity === 'medium' ? '🟡' : '🟢';
      
      report += `${icon} ${severity.toUpperCase()} SEVERITY ISSUES (${issues.length})\n`;
      report += `${'='.repeat(50)}\n\n`;

      issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue.description}\n`;
        report += `   Step: ${issue.step} - ${issue.stepName}\n`;
        report += `   Command: ${issue.command}\n`;
        report += `   Rule: ${issue.rule}\n`;
        report += `   Recommendation: ${issue.recommendation}\n\n`;
      });
    });

    // Add security best practices
    report += `🛡️  Security Best Practices Recommendations\n`;
    report += `============================================\n\n`;
    report += `1. Always review commands before execution\n`;
    report += `2. Use least privilege principle\n`;
    report += `3. Verify package sources and integrity\n`;
    report += `4. Avoid using sudo for npm operations\n`;
    report += `5. Use specific paths instead of wildcards\n`;
    report += `6. Keep systems and packages updated\n`;
    report += `7. Use environment variables for sensitive data\n`;
    report += `8. Regularly audit installed packages\n\n`;

    return report;
  }

  /**
   * Group issues by severity for reporting
   */
  groupIssuesBySeverity() {
    return this.securityIssues.reduce((groups, issue) => {
      const severity = issue.severity;
      if (!groups[severity]) {
        groups[severity] = [];
      }
      groups[severity].push(issue);
      return groups;
    }, {});
  }

  /**
   * Save security report to file
   */
  saveSecurityReport(report) {
    const timestamp = Date.now();
    const reportPath = path.join(__dirname, 'test-results', `security-report-${timestamp}.txt`);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    // Save text report
    fs.writeFileSync(reportPath, report);
    
    // Save JSON report for programmatic use
    const jsonReportPath = path.join(__dirname, 'test-results', `security-report-${timestamp}.json`);
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.securityIssues.length,
        critical: this.securityIssues.filter(issue => issue.severity === 'critical').length,
        high: this.securityIssues.filter(issue => issue.severity === 'high').length,
        medium: this.securityIssues.filter(issue => issue.severity === 'medium').length,
        low: this.securityIssues.filter(issue => issue.severity === 'low').length
      },
      issues: this.securityIssues,
      rules: this.securityRules.map(rule => ({
        name: rule.name,
        description: rule.description,
        severity: rule.severity
      }))
    };
    
    fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));
    
    console.log(`\n📄 Security reports saved:`);
    console.log(`   Text: ${reportPath}`);
    console.log(`   JSON: ${jsonReportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const guidePath = process.argv[2] || path.join(__dirname, '../docs/manual-uninstall-install-guide.md');
  
  if (!fs.existsSync(guidePath)) {
    console.error(`Error: Install guide not found at ${guidePath}`);
    if (!process.argv[2]) {
      console.error('Usage: node security-validator.js <path-to-install-guide.md>');
    }
    process.exit(1);
  }

  const validator = new SecurityValidator();
  validator.validateSecurity(guidePath);
}

module.exports = { SecurityValidator };