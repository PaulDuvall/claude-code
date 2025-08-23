#!/usr/bin/env node

/**
 * Dynamic Documentation Parser for Install Guide Testing
 * Parses docs/manual-uninstall-install-guide.md and generates test cases
 */

const fs = require('fs');
const path = require('path');

class InstallGuideParser {
  constructor(guidePath) {
    this.guidePath = guidePath;
    this.content = '';
    this.testSteps = [];
  }

  /**
   * Parse the markdown documentation and extract executable test steps
   */
  parse() {
    try {
      this.content = fs.readFileSync(this.guidePath, 'utf8');
      this.extractTestSteps();
      return this.testSteps;
    } catch (error) {
      throw new Error(`Failed to parse guide: ${error.message}`);
    }
  }

  /**
   * Extract structured test steps from markdown
   */
  extractTestSteps() {
    const lines = this.content.split('\n');
    let currentSection = '';
    let currentStep = null;
    let inCodeBlock = false;
    let codeBlockLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Track current section
      if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').trim();
        continue;
      }

      // Track current step
      if (line.startsWith('### ')) {
        if (currentStep) {
          this.testSteps.push(currentStep);
        }
        currentStep = {
          section: currentSection,
          step: line.replace('### ', '').trim(),
          description: '',
          commands: [],
          validations: [],
          lineNumber: i + 1
        };
        continue;
      }

      if (!currentStep) continue;

      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLanguage = line.replace('```', '').trim();
        } else {
          inCodeBlock = false;
          codeBlockLanguage = '';
        }
        continue;
      }

      if (inCodeBlock && codeBlockLanguage === 'bash') {
        // Parse bash commands
        if (line && !line.startsWith('#') && !line.startsWith('//')) {
          const command = this.parseCommand(line);
          if (command) {
            currentStep.commands.push(command);
          }
        } else if (line.startsWith('#') && line.includes('Should show:')) {
          // Extract expected output validation
          const expectedOutput = line.replace(/^#.*Should show:\s*/, '').trim();
          currentStep.validations.push({
            type: 'output',
            expected: expectedOutput,
            command: currentStep.commands[currentStep.commands.length - 1]?.raw
          });
        }
      } else if (!inCodeBlock && line) {
        // Add to description
        currentStep.description += line + '\n';
      }
    }

    // Add final step
    if (currentStep) {
      this.testSteps.push(currentStep);
    }

    // Filter steps that have executable commands
    this.testSteps = this.testSteps.filter(step => 
      step.commands.length > 0 || step.section.includes('Uninstall') || step.section.includes('Installation')
    );
  }

  /**
   * Parse individual command line and extract metadata
   */
  parseCommand(line) {
    if (!line.trim()) return null;

    // Skip comments and empty lines
    if (line.startsWith('#') || line.startsWith('//')) return null;

    // Handle multi-line commands (ending with \)
    const raw = line.trim();
    
    return {
      raw: raw,
      type: this.categorizeCommand(raw),
      dangerous: this.isDangerousCommand(raw),
      requiresConfirmation: this.requiresConfirmation(raw),
      expectedExitCode: 0,
      timeout: this.getCommandTimeout(raw)
    };
  }

  /**
   * Categorize command for test planning
   */
  categorizeCommand(command) {
    if (command.includes('npm uninstall')) return 'uninstall';
    if (command.includes('npm install')) return 'install';
    if (command.includes('rm -rf')) return 'cleanup';
    if (command.includes('npm list')) return 'verification';
    if (command.includes('claude-commands')) return 'toolkit';
    if (command.includes('git')) return 'git';
    if (command.includes('mkdir') || command.includes('cp') || command.includes('cat >')) return 'filesystem';
    if (command.includes('chmod')) return 'permissions';
    return 'general';
  }

  /**
   * Identify potentially dangerous commands
   */
  isDangerousCommand(command) {
    const dangerousPatterns = [
      /rm -rf/,
      /sudo/,
      /--force/,
      /chmod.*777/
    ];
    return dangerousPatterns.some(pattern => pattern.test(command));
  }

  /**
   * Check if command requires user confirmation
   */
  requiresConfirmation(command) {
    return command.includes('rm -rf') || 
           command.includes('npm cache clean --force') ||
           command.includes('uninstall');
  }

  /**
   * Get appropriate timeout for command
   */
  getCommandTimeout(command) {
    if (command.includes('npm install')) return 120000; // 2 minutes for npm installs
    if (command.includes('npm cache clean')) return 30000; // 30 seconds for cache clean
    if (command.includes('git clone')) return 60000; // 1 minute for git clone
    return 10000; // 10 seconds default
  }

  /**
   * Generate test suite configuration
   */
  generateTestSuite() {
    return {
      metadata: {
        generatedFrom: this.guidePath,
        generatedAt: new Date().toISOString(),
        totalSteps: this.testSteps.length,
        sections: [...new Set(this.testSteps.map(step => step.section))]
      },
      testSteps: this.testSteps,
      testMatrix: this.generateTestMatrix()
    };
  }

  /**
   * Generate test matrix for different scenarios
   */
  generateTestMatrix() {
    return {
      platforms: ['ubuntu-latest', 'macos-latest'],
      nodeVersions: ['18.x', '20.x'],
      scenarios: [
        {
          name: 'fresh-install',
          description: 'Clean installation on fresh system',
          skipUninstall: true
        },
        {
          name: 'reinstall',
          description: 'Uninstall and reinstall existing installation',
          skipUninstall: false
        },
        {
          name: 'upgrade',
          description: 'Upgrade from previous version',
          skipUninstall: false,
          installPreviousVersion: true
        }
      ]
    };
  }
}

// Export for use in tests
module.exports = { InstallGuideParser };

// CLI usage
if (require.main === module) {
  const guidePath = process.argv[2] || path.join(__dirname, '../docs/manual-uninstall-install-guide.md');
  
  try {
    const parser = new InstallGuideParser(guidePath);
    const testSuite = parser.generateTestSuite();
    
    console.log('📋 Parsed Install Guide Test Suite\n');
    console.log(`📊 Metadata:`);
    console.log(`   Generated from: ${testSuite.metadata.generatedFrom}`);
    console.log(`   Total steps: ${testSuite.metadata.totalSteps}`);
    console.log(`   Sections: ${testSuite.metadata.sections.join(', ')}\n`);
    
    console.log('🔧 Test Steps:');
    testSuite.testSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. [${step.section}] ${step.step}`);
      console.log(`      Commands: ${step.commands.length}`);
      console.log(`      Validations: ${step.validations.length}`);
    });
    
    // Output JSON for GitHub Actions
    if (process.argv.includes('--json')) {
      console.log('\n' + JSON.stringify(testSuite, null, 2));
    }
  } catch (error) {
    console.error('❌ Error parsing guide:', error.message);
    process.exit(1);
  }
}