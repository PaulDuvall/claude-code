---
description: Break complex tasks into 4-8 hour atomic units for efficient development workflow
tags: [planning, decomposition, estimation, dependencies, workflow]
---

Decompose tasks into atomic units based on the arguments provided in $ARGUMENTS.

First, examine the current project context:
!find . -name "*.md" | xargs grep -l "TODO\|TASK\|FEATURE" | head -5 2>/dev/null
!ls -la CHANGELOG.md ROADMAP.md PROJECT.md 2>/dev/null || echo "No project documentation found"
!git log --oneline --since="1 month ago" | head -10
!find . -name "*spec*" -o -name "*requirement*" | head -5 2>/dev/null

Based on $ARGUMENTS, perform the appropriate task decomposition operation:

## 1. Task Decomposition

If decomposing tasks (--decompose, --breakdown):
!grep -r "TODO\|FIXME\|FEATURE" . --include="*.md" --include="*.py" --include="*.js" | head -10 2>/dev/null
!find . -name "*.spec" -o -name "*.feature" | head -5 2>/dev/null

Break down complex tasks:
- Identify core functionality requirements
- Define clear acceptance criteria
- Ensure 4-8 hour completion time
- Create testable deliverables
- Establish clear boundaries

## 2. Time Estimation

If estimating time (--estimate, --sizing):
!git log --pretty=format:"%h %s" --since="1 month ago" | grep -E "(feat|fix|refactor)" | wc -l
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs wc -l | tail -1
!git shortlog -sn --since="1 month ago" | head -5

Estimate task complexity:
- Analyze similar historical tasks
- Consider team velocity and experience
- Account for testing and documentation
- Include buffer for unexpected issues
- Validate against atomic time constraints

## 3. Dependency Analysis

If analyzing dependencies (--dependencies, --graph):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import\|require" | head -10
!find . -name "package.json" -o -name "requirements.txt" | head -2
!git log --graph --oneline --since="1 month ago" | head -10

Analyze task relationships:
- Identify prerequisite tasks
- Map data dependencies
- Find shared resource conflicts
- Determine integration points
- Create execution sequence

## 4. Parallel Execution Planning

If finding parallel tasks (--parallel, --concurrent):
!git branch -a | wc -l
!find . -name "*test*" -type d | head -5 2>/dev/null
!grep -r "@parallel\|@concurrent" . --include="*.py" --include="*.js" | head -5 2>/dev/null

Identify parallelizable work:
- Find independent task clusters
- Identify shared resource constraints
- Plan team member assignments
- Optimize critical path execution
- Minimize integration conflicts

## 5. Atomicity Validation

If validating atomicity (--validate, --verify):
!find . -name "*.md" | xargs grep -l "acceptance criteria\|definition of done" | head -5 2>/dev/null
!git log --pretty=format:"%h %s %an %ad" --date=short --since="1 month ago" | head -10

Validate task structure:
- Verify 4-8 hour completion target
- Check clear acceptance criteria
- Ensure testable outcomes
- Validate single responsibility
- Confirm independent execution

Think step by step about task decomposition requirements and provide:

1. **Task Analysis**:
   - Complex task breakdown identification
   - Scope and boundary definition
   - Acceptance criteria specification
   - Risk and complexity assessment

2. **Decomposition Strategy**:
   - Atomic unit identification
   - Logical grouping and sequencing
   - Dependency mapping and analysis
   - Parallel execution opportunities

3. **Estimation Framework**:
   - Historical data analysis
   - Complexity factor assessment
   - Team velocity consideration
   - Buffer and risk allocation

4. **Execution Planning**:
   - Priority and sequence definition
   - Resource allocation strategy
   - Integration point identification
   - Progress tracking methodology

Generate comprehensive task decomposition with atomic units, time estimates, dependency analysis, and execution planning.

If no specific operation is provided, perform task complexity assessment and recommend decomposition strategy based on current project state and requirements.