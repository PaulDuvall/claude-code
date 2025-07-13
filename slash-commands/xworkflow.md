---
description: Automate and optimize development workflows with configurable automation patterns
tags: [workflow, automation, orchestration, patterns, optimization, monitoring]
---

Manage and execute development workflows based on the arguments provided in $ARGUMENTS.

First, examine the current workflow configuration and environment:
!ls -la .workflows/ 2>/dev/null || echo "No workflows directory found"
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(workflow|pipeline)" | head -5
!git log --oneline -10 2>/dev/null || echo "No git repository found"

Based on $ARGUMENTS, perform the appropriate workflow operation:

## 1. Workflow Creation and Management

If creating workflows (--create):
!mkdir -p .workflows/
!find .workflows/ -name "*.yml" | wc -l
!ls -la .github/workflows/ 2>/dev/null || echo "No GitHub Actions workflows found"

Create and configure automated workflows:
- Analyze project structure and requirements
- Generate workflow templates based on project type
- Configure workflow parameters and triggers
- Integrate with existing CI/CD systems
- Validate workflow syntax and dependencies

## 2. Workflow Execution

If running workflows (--run):
!find .workflows/ -name "$workflow_name.yml" 2>/dev/null || echo "Workflow not found"
!git status --porcelain
!python -c "import yaml; print('YAML parsing available')" 2>/dev/null || echo "YAML parser needed"

Execute workflow with parameter substitution:
- Parse workflow definition and parameters
- Substitute variables and environment values
- Execute workflow steps in sequence
- Handle step failures and error conditions
- Generate execution logs and reports

## 3. Workflow Discovery and Listing

If listing workflows (--list):
!find .workflows/ -name "*.yml" -o -name "*.yaml" | head -10
!grep -r "description:" .workflows/ 2>/dev/null | head -5
!find .github/workflows/ -name "*.yml" 2>/dev/null | head -5

Discover and catalog available workflows:
- Scan workflow directories for definitions
- Parse workflow metadata and descriptions
- Categorize workflows by type and purpose
- Display workflow parameters and requirements
- Show workflow status and execution history

## 4. Workflow Optimization

If optimizing workflows (--optimize):
!find .workflows/ -name "*.yml" -exec grep -l "parallel" {} \; 2>/dev/null
!git log --since="30 days ago" --grep="workflow" --oneline | wc -l
!ps aux | grep -E "(workflow|pipeline)" | head -5

Analyze and optimize workflow performance:
- Identify workflow bottlenecks and dependencies
- Recommend parallelization opportunities
- Optimize resource utilization and timing
- Reduce workflow execution time
- Improve workflow reliability and success rates

## 5. Workflow Monitoring

If monitoring workflows (--monitor):
!find .workflows/ -name "*.log" -o -name "*execution*" | head -5
!tail -20 .workflows/execution.log 2>/dev/null || echo "No execution log found"
!ps aux | grep workflow | grep -v grep

Monitor workflow execution and performance:
- Track workflow execution status
- Monitor resource usage and performance metrics
- Alert on workflow failures or anomalies
- Generate workflow performance reports
- Maintain execution history and analytics

Think step by step about workflow automation requirements and provide:

1. **Workflow Analysis**:
   - Current workflow inventory and status
   - Workflow dependencies and relationships
   - Performance metrics and bottlenecks
   - Integration points and requirements

2. **Automation Strategy**:
   - Workflow template recommendations
   - Parameter configuration and validation
   - Step sequencing and parallelization
   - Error handling and recovery procedures

3. **Optimization Opportunities**:
   - Performance improvement recommendations
   - Resource utilization optimization
   - Workflow consolidation possibilities
   - Parallel execution opportunities

4. **Monitoring and Maintenance**:
   - Execution tracking and logging
   - Performance monitoring setup
   - Alert configuration recommendations
   - Workflow health assessment

Generate comprehensive workflow automation with template creation, execution orchestration, performance optimization, and monitoring integration.

If no specific operation is provided, analyze existing workflows and recommend automation improvements based on project structure and development patterns.