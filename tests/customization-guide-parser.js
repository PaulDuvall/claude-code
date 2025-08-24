#!/usr/bin/env node

/**
 * Customization Guide Parser
 * Parses docs/publish/and-customizing-claude-code.md and generates test cases
 */

const fs = require('fs');
const path = require('path');

class CustomizationGuideParser {
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
      throw new Error(`Failed to parse customization guide: ${error.message}`);
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

      // Track current section (H1, H2, H3)
      if (line.startsWith('# ')) {
        currentSection = line.replace('# ', '').trim();
        continue;
      } else if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').trim();
        continue;
      } else if (line.startsWith('### ')) {
        currentSection = line.replace('### ', '').trim();
        
        // For H3, create a new step
        if (currentStep) {
          this.testSteps.push(currentStep);
        }
        currentStep = {
          section: currentSection,
          step: currentSection,
          description: '',
          commands: [],
          validations: [],
          lineNumber: i + 1,
          type: 'customization'
        };
        continue;
      }

      if (!currentStep && currentSection) {
        // Create implicit step for sections without explicit H3
        currentStep = {
          section: currentSection,
          step: currentSection,
          description: '',
          commands: [],
          validations: [],
          lineNumber: i + 1,
          type: 'customization'
        };
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
        } else if (line.startsWith('#') && line.includes('Learn more:')) {
          // Extract documentation links for validation
          const url = line.replace(/^#.*Learn more:\s*/, '').trim();
          currentStep.validations.push({
            type: 'documentation',
            url: url,
            description: 'Documentation link should be accessible'
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

    // Skip grouping for now - use steps as-is
    // this.groupRelatedCommands();
  }

  /**
   * Parse individual command and classify it
   */
  parseCommand(line) {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) {
      return null;
    }

    // Extract command and inline comments
    const [commandPart, ...commentParts] = line.split('#');
    const rawCommand = commandPart.trim();
    const comment = commentParts.join('#').trim();

    if (!rawCommand) {
      return null;
    }

    // Skip commands with unresolved placeholders
    if (rawCommand.includes('<') && rawCommand.includes('>')) {
      return {
        raw: rawCommand,
        comment: comment || '',
        type: 'placeholder',
        allowFailure: true,
        timeout: 1000,
        skip: true
      };
    }

    // Skip placeholder/example commands
    if (this.isPlaceholderCommand(rawCommand)) {
      return {
        raw: rawCommand,
        comment: comment || '',
        type: 'placeholder',
        allowFailure: true,
        timeout: 1000,
        skip: true
      };
    }

    const command = {
      raw: rawCommand,
      comment: comment || '',
      type: this.classifyCommand(rawCommand),
      allowFailure: false,
      timeout: 30000
    };

    // Special handling for specific command types
    if (rawCommand.startsWith('npm install -g')) {
      command.type = 'install';
      command.timeout = 120000; // 2 minutes for npm installs
    } else if (rawCommand.startsWith('git clone')) {
      command.type = 'git';
      command.timeout = 60000; // 1 minute for git clone
    } else if (rawCommand.startsWith('/x')) {
      command.type = 'claude-ui';
      command.allowFailure = true; // UI commands can't be executed in shell
    } else if (rawCommand.startsWith('claude-commands')) {
      command.type = 'toolkit';
      command.timeout = 60000; // 1 minute for toolkit commands
      command.allowFailure = true; // Toolkit commands may not be available in test environment
    } else if (rawCommand.startsWith('claude ')) {
      command.type = 'claude';
      command.allowFailure = true; // Claude executable may not be available in test environment
    } else if (rawCommand.startsWith('cp ') && rawCommand.includes('hooks/')) {
      command.type = 'filesystem';
      command.allowFailure = true; // Hook files may not exist in test environment
      command.reason = 'Hook files may not exist in test environment';
    } else if (rawCommand.startsWith('pkill')) {
      command.type = 'process';
      command.allowFailure = true; // Process may not be running in test environment
      command.reason = 'Process may not be running in test environment';
    }

    return command;
  }

  /**
   * Check if command is a placeholder/example that shouldn't be executed
   */
  isPlaceholderCommand(command) {
    const placeholderPatterns = [
      /cd \/path\/to\/your\/project/,
      /\[Describe your project here\]/,
      /\[Define your development principles\]/,
      /\[Specify coding standards and practices\]/,
      /\[Define security requirements\]/,
      /EOF$/,
      /YOUR_REPOSITORY_URL/,
      /\$YOUR_ACTUAL_API_KEY/,
      /source\s+~/,  // Shell-specific source command
      /^\.\/.*\.sh$/  // Script files that may not exist in test environment
    ];

    return placeholderPatterns.some(pattern => pattern.test(command));
  }

  /**
   * Classify command type based on content
   */
  classifyCommand(command) {
    if (command.startsWith('npm')) return 'npm';
    if (command.startsWith('git')) return 'git';
    if (command.startsWith('cd')) return 'navigation';
    if (command.startsWith('claude')) return 'claude';
    if (command.startsWith('claude-commands')) return 'toolkit';
    if (command.startsWith('/x')) return 'claude-ui';
    if (command.startsWith('chmod')) return 'permissions';
    if (command.startsWith('pkill')) return 'process';
    if (command.includes('mkdir') || command.includes('cp') || command.includes('rm')) return 'filesystem';
    return 'general';
  }

  /**
   * Group related commands into logical test steps
   */
  groupRelatedCommands() {
    const groupedSteps = [];
    let currentGroup = null;

    for (const step of this.testSteps) {
      if (!step.commands || step.commands.length === 0) {
        continue;
      }

      // Determine if this should start a new group or continue existing
      const stepType = this.getStepType(step);
      
      if (!currentGroup || currentGroup.type !== stepType || this.shouldStartNewGroup(step, currentGroup)) {
        if (currentGroup) {
          groupedSteps.push(currentGroup);
        }
        
        currentGroup = {
          section: step.section,
          step: `${stepType}: ${step.step}`,
          description: step.description,
          commands: [...step.commands],
          validations: [...step.validations],
          type: stepType,
          lineNumber: step.lineNumber
        };
      } else {
        // Merge with current group
        currentGroup.commands.push(...step.commands);
        currentGroup.validations.push(...step.validations);
        currentGroup.description += step.description;
      }
    }

    if (currentGroup) {
      groupedSteps.push(currentGroup);
    }

    this.testSteps = groupedSteps;
  }

  /**
   * Determine the primary type of a step based on its commands
   */
  getStepType(step) {
    const commandTypes = step.commands.map(cmd => cmd.type);
    
    if (commandTypes.includes('install')) return 'Installation';
    if (commandTypes.includes('toolkit')) return 'Configuration';
    if (commandTypes.includes('git')) return 'Repository';
    if (commandTypes.includes('claude-ui')) return 'Workflow';
    return 'General';
  }

  /**
   * Decide if we should start a new group
   */
  shouldStartNewGroup(step, currentGroup) {
    // Start new group if commands are very different
    const stepCommandTypes = new Set(step.commands.map(cmd => cmd.type));
    const groupCommandTypes = new Set(currentGroup.commands.map(cmd => cmd.type));
    
    // Check if there's significant overlap
    const intersection = [...stepCommandTypes].filter(type => groupCommandTypes.has(type));
    return intersection.length === 0;
  }

  /**
   * Generate test suite configuration
   */
  generateTestSuite() {
    // Ensure we've parsed the content
    if (this.testSteps.length === 0) {
      this.parse();
    }
    const testSuite = {
      source: 'customization-guide',
      guidePath: this.guidePath,
      generatedAt: new Date().toISOString(),
      metadata: {
        totalSteps: this.testSteps.length,
        totalCommands: this.testSteps.reduce((sum, step) => sum + step.commands.length, 0),
        commandTypes: this.getCommandTypeStats(),
        scenarios: ['customization-setup', 'advanced-workflow']
      },
      testSteps: this.testSteps,
      scenarios: {
        'customization-setup': {
          description: 'Basic customization setup and installation',
          includeSteps: this.testSteps.filter(step => 
            step.type === 'Installation' || step.type === 'Configuration'
          ).map(step => step.step)
        },
        'advanced-workflow': {
          description: 'Advanced workflow and UI command testing',
          includeSteps: this.testSteps.filter(step => 
            step.type === 'Workflow' || step.type === 'Repository'
          ).map(step => step.step)
        }
      }
    };

    return testSuite;
  }

  /**
   * Get statistics about command types
   */
  getCommandTypeStats() {
    const stats = {};
    
    for (const step of this.testSteps) {
      for (const command of step.commands) {
        stats[command.type] = (stats[command.type] || 0) + 1;
      }
    }
    
    return stats;
  }
}

// CLI usage
if (require.main === module) {
  const guidePath = process.argv[2] || path.join(__dirname, '../docs/publish/and-customizing-claude-code.md');
  const outputJson = process.argv.includes('--json');

  try {
    const parser = new CustomizationGuideParser(guidePath);
    const testSteps = parser.parse();
    const testSuite = parser.generateTestSuite();

    if (outputJson) {
      console.log(JSON.stringify(testSuite, null, 2));
    } else {
      console.log(`📋 Parsed ${testSteps.length} test steps from customization guide`);
      console.log(`🔧 Total commands: ${testSuite.metadata.totalCommands}`);
      console.log(`📊 Command types:`, testSuite.metadata.commandTypes);
      console.log(`🎯 Scenarios: ${Object.keys(testSuite.scenarios).join(', ')}`);
      
      console.log('\n📝 Test Steps:');
      testSteps.forEach((step, i) => {
        console.log(`${i + 1}. [${step.type}] ${step.step} (${step.commands.length} commands)`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to parse customization guide:', error.message);
    process.exit(1);
  }
}

module.exports = { CustomizationGuideParser };