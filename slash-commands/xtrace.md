# `/xtrace` - SpecDriven AI Traceability Analysis

Comprehensive traceability tracking and analysis for SpecDriven AI development with end-to-end requirement tracking.

## Usage

```bash
/xtrace --spec <spec-id>     # Trace specification to implementation
/xtrace --test <test-name>   # Trace test to specifications
/xtrace --code <file>        # Trace code to requirements
/xtrace --coverage           # Traceability coverage analysis
/xtrace --gaps               # Identify traceability gaps
```

## Options

### `--spec <spec-id>`
Trace specification through implementation chain.

**Examples:**
```bash
/xtrace --spec cli1a         # Full trace for specification cli1a
/xtrace --spec auth2c --tests # Show implementing tests
/xtrace --spec api3b --code  # Show implementing code
/xtrace --spec cli1a --commits # Show related commits
```

### `--test <test-name>`
Trace test back to originating specifications.

**Examples:**
```bash
/xtrace --test test_user_auth # Trace test to specifications
/xtrace --test TestCLIInterface --coverage
/xtrace --test test_api_validation --authority
```

### `--code <file>`
Trace code implementation to requirements.

**Examples:**
```bash
/xtrace --code src/auth.py   # Trace file to specifications
/xtrace --code src/cli/ --recursive # Trace directory
/xtrace --code --changed     # Trace recent changes
```

### `--coverage`
Analyze traceability coverage across the project.

**Examples:**
```bash
/xtrace --coverage           # Overall traceability coverage
/xtrace --coverage --authority system # System-level coverage
/xtrace --coverage --component auth # Component coverage
/xtrace --coverage --gaps    # Coverage gap analysis
```

### `--gaps`
Identify and analyze traceability gaps.

**Examples:**
```bash
/xtrace --gaps               # All traceability gaps
/xtrace --gaps --specs       # Specifications without tests
/xtrace --gaps --tests       # Tests without specifications
/xtrace --gaps --critical    # Critical authority gaps
```

## SpecDriven AI Traceability

### Specification Traceability
- **Forward Tracing**: Specification → Tests → Code → Commits
- **Backward Tracing**: Code → Tests → Specifications → Requirements
- **Authority Tracking**: Authority level propagation through chain
- **Coverage Validation**: Ensure all specifications have implementations

### Test Traceability
- **Test-to-Spec Mapping**: Direct links between tests and specifications
- **Coverage Tracking**: Which specifications are tested
- **Authority Validation**: Test authority matches specification authority
- **Gap Identification**: Untested specifications

### Code Traceability
- **Implementation Tracking**: Code implementing specific specifications
- **Change Impact**: How code changes affect specifications
- **Commit Traceability**: Commits implementing specifications
- **Review Traceability**: Code reviews linked to specifications

## Traceability Matrix

### Specification → Implementation Matrix
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Spec ID     │ Tests        │ Code         │ Coverage     │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ cli1a       │ ✓ Complete   │ ✓ Complete   │ 95%          │
│ auth2c      │ ✓ Complete   │ ⚠ Partial    │ 70%          │
│ api3b       │ ✗ Missing    │ ✗ Missing    │ 0%           │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

### Authority Level Traceability
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Authority   │ Specs        │ Tests        │ Implementation│
├─────────────┼──────────────┼──────────────┼──────────────┤
│ System      │ 12           │ 11 (92%)     │ 10 (83%)     │
│ Platform    │ 45           │ 42 (93%)     │ 38 (84%)     │
│ Developer   │ 123          │ 118 (96%)    │ 115 (93%)    │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

## Advanced Traceability Analysis

### Impact Analysis
- **Change Impact**: How specification changes affect implementation
- **Ripple Effect**: Cascading effects of requirement changes
- **Dependency Mapping**: Inter-specification dependencies
- **Risk Assessment**: Risk of specification changes

### Coverage Analysis
- **Specification Coverage**: Percentage of specs with tests
- **Implementation Coverage**: Percentage of specs with code
- **Authority Coverage**: Coverage breakdown by authority level
- **Component Coverage**: Coverage by system component

### Gap Analysis
- **Missing Tests**: Specifications without implementing tests
- **Missing Implementation**: Specifications without code
- **Orphaned Tests**: Tests without linked specifications
- **Orphaned Code**: Code without specification links

## Traceability Metrics

### Coverage Metrics
- **Forward Coverage**: Specs → Tests → Code completion rate
- **Backward Coverage**: Code → Specs linkage rate
- **Authority Compliance**: Authority level consistency rate
- **Update Synchronization**: Spec-implementation synchronization rate

### Quality Metrics
- **Link Quality**: Strength and accuracy of traceability links
- **Maintenance Rate**: How well links are maintained
- **Automation Rate**: Percentage of automated traceability
- **Validation Rate**: Regular traceability validation frequency

### Process Metrics
- **Traceability Velocity**: Speed of establishing traceability
- **Gap Resolution Time**: Time to resolve traceability gaps
- **Review Coverage**: Traceability review completeness
- **Compliance Rate**: Adherence to traceability standards

## Visualization

### Traceability Graphs
- **Dependency Graphs**: Visual representation of spec dependencies
- **Coverage Heatmaps**: Visual coverage analysis
- **Impact Diagrams**: Change impact visualization
- **Gap Analysis Charts**: Visual gap identification

### Interactive Exploration
- **Drill-Down Navigation**: Navigate through traceability chains
- **Filter Views**: Filter by authority, component, or status
- **Search Capabilities**: Find specific traceability relationships
- **Export Options**: Export traceability data

## Automated Traceability

### Link Detection
- **Comment Parsing**: Extract specification IDs from code comments
- **Test Name Analysis**: Identify specs from test naming patterns
- **Commit Message Analysis**: Extract spec references from commits
- **Documentation Scanning**: Find spec references in documentation

### Link Validation
- **Existence Validation**: Verify linked specifications exist
- **Format Validation**: Check specification ID format compliance
- **Authority Validation**: Ensure authority level consistency
- **Scope Validation**: Verify implementation scope matches specification

### Maintenance Automation
- **Broken Link Detection**: Identify and report broken links
- **Orphan Detection**: Find orphaned code and tests
- **Update Notifications**: Alert when specifications change
- **Sync Validation**: Ensure implementation stays in sync

## Integration

- **Specifications**: Deep integration with `/xspec` for specification management
- **Testing**: Works with `/xtest` for test traceability
- **Coverage**: Uses `/xcoverage` for dual coverage tracking
- **Quality**: Integrates with `/xquality` for quality validation
- **Version Control**: Tracks commits and changes

## Compliance Reporting

### Regulatory Compliance
- **Audit Trails**: Complete audit trail from requirement to implementation
- **Change Documentation**: Document all requirement changes
- **Approval Tracking**: Track specification approvals
- **Compliance Metrics**: Measure compliance with standards

### Quality Assurance
- **Review Traceability**: Link code reviews to specifications
- **Testing Traceability**: Link test results to requirements
- **Defect Traceability**: Link bugs to specifications
- **Resolution Tracking**: Track issue resolution to specs

## Output

Traceability matrices, coverage reports, gap analyses, impact assessments, and interactive traceability visualizations.