#!/usr/bin/env node

/**
 * Test Report Generator for GitHub Actions
 * Generates comprehensive test reports in multiple formats
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestReportGenerator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                passRate: 0
            },
            suites: [],
            duration: 0,
            environment: {
                node: process.version,
                platform: process.platform,
                ci: process.env.CI === 'true',
                github_run_id: process.env.GITHUB_RUN_ID || 'local',
                github_run_number: process.env.GITHUB_RUN_NUMBER || 'N/A',
                github_actor: process.env.GITHUB_ACTOR || 'local',
                github_ref: process.env.GITHUB_REF || 'local'
            }
        };
        this.startTime = Date.now();
    }

    captureTestOutput(command, suiteName) {
        try {
            console.log(`\n📊 Running ${suiteName}...`);
            const output = execSync(command, { 
                encoding: 'utf8',
                stdio: 'pipe',
                cwd: path.join(__dirname, '..')
            });
            
            return this.parseTestOutput(output, suiteName, 'passed');
        } catch (error) {
            const output = error.stdout || error.message;
            return this.parseTestOutput(output, suiteName, 'failed');
        }
    }

    parseTestOutput(output, suiteName, defaultStatus) {
        const suite = {
            name: suiteName,
            status: defaultStatus,
            tests: [],
            passed: 0,
            failed: 0,
            duration: 0
        };

        // Parse test results from output
        const lines = output.split('\n');
        let currentTest = null;

        for (const line of lines) {
            // Match test result patterns
            if (line.includes('✅')) {
                const testName = line.replace(/✅/g, '').trim();
                if (testName) {
                    suite.tests.push({ name: testName, status: 'passed' });
                    suite.passed++;
                }
            } else if (line.includes('❌')) {
                const testName = line.replace(/❌/g, '').trim();
                if (testName) {
                    suite.tests.push({ name: testName, status: 'failed' });
                    suite.failed++;
                }
            } else if (line.includes('⚠️')) {
                const testName = line.replace(/⚠️/g, '').trim();
                if (testName) {
                    suite.tests.push({ name: testName, status: 'skipped' });
                }
            }

            // Extract summary metrics
            if (line.includes('passed:') || line.includes('Passed:')) {
                const match = line.match(/(\d+)\s*(passed|Passed)/);
                if (match) suite.passed = parseInt(match[1]);
            }
            if (line.includes('failed:') || line.includes('Failed:')) {
                const match = line.match(/(\d+)\s*(failed|Failed)/);
                if (match) suite.failed = parseInt(match[1]);
            }
        }

        // Update suite status based on results
        if (suite.failed > 0) {
            suite.status = 'failed';
        } else if (suite.passed > 0) {
            suite.status = 'passed';
        }

        return suite;
    }

    async runAllTests() {
        console.log('🧪 Starting Comprehensive Test Report Generation');
        console.log('='.repeat(60));

        // Run different test suites and capture results
        const testCommands = [
            { cmd: 'npm test', name: 'Dynamic Test Suite' },
            { cmd: 'npm run validate', name: 'Package Validation' }
        ];

        for (const { cmd, name } of testCommands) {
            const suite = this.captureTestOutput(cmd, name);
            this.results.suites.push(suite);
            
            // Update summary
            this.results.summary.passed += suite.passed;
            this.results.summary.failed += suite.failed;
            this.results.summary.total += (suite.passed + suite.failed);
        }

        // Calculate final metrics
        this.results.duration = Date.now() - this.startTime;
        this.results.summary.passRate = this.results.summary.total > 0 
            ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(2)
            : 0;
    }

    generateMarkdownReport() {
        const { summary, suites, environment, timestamp, duration } = this.results;
        
        let markdown = `# Test Report

## Summary
- **Date**: ${new Date(timestamp).toLocaleString()}
- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed} ✅
- **Failed**: ${summary.failed} ❌
- **Pass Rate**: ${summary.passRate}%
- **Duration**: ${(duration / 1000).toFixed(2)}s

## Environment
- **Node Version**: ${environment.node}
- **Platform**: ${environment.platform}
- **CI**: ${environment.ci ? 'GitHub Actions' : 'Local'}
${environment.ci ? `- **Run ID**: ${environment.github_run_id}
- **Run Number**: ${environment.github_run_number}
- **Actor**: ${environment.github_actor}
- **Ref**: ${environment.github_ref}` : ''}

## Test Suites

`;

        for (const suite of suites) {
            const icon = suite.status === 'passed' ? '✅' : '❌';
            markdown += `### ${icon} ${suite.name}
- **Status**: ${suite.status.toUpperCase()}
- **Passed**: ${suite.passed}
- **Failed**: ${suite.failed}

`;
            if (suite.tests.length > 0 && suite.tests.length <= 20) {
                markdown += `#### Test Results\n`;
                for (const test of suite.tests) {
                    const testIcon = test.status === 'passed' ? '✅' : 
                                    test.status === 'failed' ? '❌' : '⚠️';
                    markdown += `- ${testIcon} ${test.name}\n`;
                }
                markdown += '\n';
            }
        }

        return markdown;
    }

    generateJSONReport() {
        return JSON.stringify(this.results, null, 2);
    }

    generateHTMLReport() {
        const { summary, suites, environment, timestamp, duration } = this.results;
        
        return `<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${new Date(timestamp).toLocaleDateString()}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric .label { color: #666; margin-top: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .suite { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff; }
        .suite.failed { border-left-color: #dc3545; }
        .suite.passed { border-left-color: #28a745; }
        .test-list { margin: 10px 0; }
        .test { padding: 5px 10px; margin: 2px 0; background: white; border-radius: 4px; }
        .test.passed { border-left: 3px solid #28a745; }
        .test.failed { border-left: 3px solid #dc3545; }
        .environment { background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .environment code { background: white; padding: 2px 6px; border-radius: 3px; }
        .progress-bar { height: 30px; background: #e9ecef; border-radius: 15px; overflow: hidden; margin: 20px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Test Report</h1>
        
        <div class="summary">
            <div class="metric">
                <div class="value">${summary.total}</div>
                <div class="label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="value passed">${summary.passed}</div>
                <div class="label">Passed</div>
            </div>
            <div class="metric">
                <div class="value failed">${summary.failed}</div>
                <div class="label">Failed</div>
            </div>
            <div class="metric">
                <div class="value">${summary.passRate}%</div>
                <div class="label">Pass Rate</div>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: ${summary.passRate}%">
                ${summary.passRate}% Tests Passing
            </div>
        </div>

        <div class="environment">
            <h3>Environment</h3>
            <p>
                <strong>Date:</strong> ${new Date(timestamp).toLocaleString()}<br>
                <strong>Duration:</strong> ${(duration / 1000).toFixed(2)}s<br>
                <strong>Node:</strong> <code>${environment.node}</code><br>
                <strong>Platform:</strong> <code>${environment.platform}</code><br>
                ${environment.ci ? `
                <strong>CI:</strong> GitHub Actions<br>
                <strong>Run:</strong> #${environment.github_run_number}<br>
                <strong>Actor:</strong> ${environment.github_actor}<br>
                ` : '<strong>Environment:</strong> Local<br>'}
            </p>
        </div>

        <h2>Test Suites</h2>
        ${suites.map(suite => `
            <div class="suite ${suite.status}">
                <h3>${suite.status === 'passed' ? '✅' : '❌'} ${suite.name}</h3>
                <p>
                    <strong>Passed:</strong> ${suite.passed} | 
                    <strong>Failed:</strong> ${suite.failed}
                </p>
                ${suite.tests.length > 0 && suite.tests.length <= 20 ? `
                    <div class="test-list">
                        ${suite.tests.map(test => `
                            <div class="test ${test.status}">
                                ${test.status === 'passed' ? '✅' : '❌'} ${test.name}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    }

    generateGitHubSummary() {
        const { summary, suites } = this.results;
        
        let summaryContent = `## Test Results Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${summary.total} |
| Passed | ${summary.passed} ✅ |
| Failed | ${summary.failed} ❌ |
| Pass Rate | ${summary.passRate}% |
| Duration | ${(this.results.duration / 1000).toFixed(2)}s |

### Test Suites
`;

        for (const suite of suites) {
            const icon = suite.status === 'passed' ? '✅' : '❌';
            summaryContent += `- ${icon} **${suite.name}**: ${suite.passed} passed, ${suite.failed} failed\n`;
        }

        return summaryContent;
    }

    async saveReports() {
        const reportsDir = path.join(__dirname, '..', 'test-reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Save JSON report
        const jsonPath = path.join(reportsDir, `test-report-${timestamp}.json`);
        fs.writeFileSync(jsonPath, this.generateJSONReport());
        console.log(`📄 JSON report saved: ${jsonPath}`);

        // Save Markdown report
        const mdPath = path.join(reportsDir, `test-report-${timestamp}.md`);
        fs.writeFileSync(mdPath, this.generateMarkdownReport());
        console.log(`📝 Markdown report saved: ${mdPath}`);

        // Save HTML report
        const htmlPath = path.join(reportsDir, `test-report-${timestamp}.html`);
        fs.writeFileSync(htmlPath, this.generateHTMLReport());
        console.log(`🌐 HTML report saved: ${htmlPath}`);

        // Save latest reports (overwrite)
        fs.writeFileSync(path.join(reportsDir, 'latest-report.json'), this.generateJSONReport());
        fs.writeFileSync(path.join(reportsDir, 'latest-report.md'), this.generateMarkdownReport());
        fs.writeFileSync(path.join(reportsDir, 'latest-report.html'), this.generateHTMLReport());

        // If in GitHub Actions, write to step summary
        if (process.env.GITHUB_STEP_SUMMARY) {
            fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, this.generateGitHubSummary());
            console.log('📊 GitHub Actions summary generated');
        }

        return {
            json: jsonPath,
            markdown: mdPath,
            html: htmlPath
        };
    }
}

async function main() {
    const generator = new TestReportGenerator();
    
    try {
        await generator.runAllTests();
        const paths = await generator.saveReports();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Test report generation complete!');
        console.log('='.repeat(60));
        
        // Exit with appropriate code
        process.exit(generator.results.summary.failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ Error generating test report:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = TestReportGenerator;