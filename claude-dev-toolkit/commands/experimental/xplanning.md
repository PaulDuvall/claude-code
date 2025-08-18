---
description: AI-assisted project planning with roadmaps, estimation, and risk analysis
tags: [planning, roadmap, estimation, project-management]
---

# `/xplanning` - AI-Assisted Planning

Strategic planning and project management with AI-driven insights and estimation.

## Usage

```bash
/xplanning --roadmap         # Generate roadmap
/xplanning --prioritize      # Prioritize tasks
/xplanning --estimate        # Effort estimation
/xplanning --resources       # Plan allocation
/xplanning --risks           # Identify risks
```

## Options

### `--roadmap`
Generate strategic roadmaps with timeline and milestone planning.

**Examples:**
```bash
/xplanning --roadmap         # Generate full roadmap
/xplanning --roadmap --quarter Q2
/xplanning --roadmap --epic "user-management"
/xplanning --roadmap --dependencies
```

### `--prioritize`
AI-driven task prioritization based on value, effort, and dependencies.

**Examples:**
```bash
/xplanning --prioritize      # Prioritize all tasks
/xplanning --prioritize --method "moscow"
/xplanning --prioritize --criteria "business-value"
/xplanning --prioritize --stakeholder "product"
```

### `--estimate`
Effort estimation using historical data and AI analysis.

**Examples:**
```bash
/xplanning --estimate        # Estimate all tasks
/xplanning --estimate --task "authentication"
/xplanning --estimate --method "story-points"
/xplanning --estimate --confidence 90
```

### `--resources`
Resource allocation and capacity planning.

**Examples:**
```bash
/xplanning --resources       # View resource allocation
/xplanning --resources --team "backend"
/xplanning --resources --capacity
/xplanning --resources --skills "python,aws"
```

### `--risks`
Risk identification and mitigation planning.

**Examples:**
```bash
/xplanning --risks           # Identify all risks
/xplanning --risks --category "technical"
/xplanning --risks --impact high
/xplanning --risks --mitigation
```

## Planning Methodologies

### Agile Planning
- **Sprint Planning**: Plan sprints with velocity tracking
- **Story Estimation**: Story point estimation and refinement
- **Backlog Grooming**: Continuous backlog prioritization
- **Release Planning**: Multi-sprint release coordination

### Strategic Planning
- **OKR Planning**: Objectives and Key Results framework
- **Portfolio Planning**: Multi-project coordination
- **Capacity Planning**: Resource and timeline optimization
- **Scenario Planning**: Multiple timeline scenarios

### Risk Management
- **Risk Assessment**: Probability and impact analysis
- **Mitigation Strategies**: Risk reduction planning
- **Contingency Planning**: Backup plan development
- **Monitor and Control**: Ongoing risk tracking

## AI-Assisted Features

### Intelligent Estimation
- **Historical Analysis**: Learn from past project data
- **Complexity Assessment**: Automatic complexity scoring
- **Uncertainty Modeling**: Confidence intervals for estimates
- **Team Velocity**: Velocity-based planning

### Smart Prioritization
- **Value Scoring**: Business value assessment
- **Dependency Analysis**: Critical path identification
- **Resource Optimization**: Skill-based task assignment
- **Stakeholder Alignment**: Multi-stakeholder priority balancing

### Predictive Analytics
- **Delivery Forecasting**: Timeline prediction models
- **Resource Conflicts**: Early conflict detection
- **Scope Creep**: Scope change impact analysis
- **Success Probability**: Project success likelihood

## Integration

- **Specifications**: Links to `/xspec` for requirement-driven planning
- **Task Management**: Works with `/xatomic` for task decomposition
- **Product**: Integrates with `/xproduct` for product planning
- **Analytics**: Uses `/xanalytics` for data-driven insights
- **Risk Management**: Coordinates with `/xrisk` for risk assessment

## Output Formats

- **Visual Roadmaps**: Timeline-based project visualization
- **Planning Reports**: Detailed planning analysis and recommendations
- **Resource Charts**: Capacity and allocation visualizations
- **Risk Registers**: Comprehensive risk documentation
- **Estimation Summaries**: Effort and timeline estimates with confidence levels