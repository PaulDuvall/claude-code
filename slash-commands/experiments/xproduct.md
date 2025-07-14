---
description: Product management and strategic planning tools for feature development and product lifecycle management
tags: [product-management, strategy, backlog, features, roadmap, metrics]
---

# `/xproduct` - Product Management & Strategy

Product management and strategic planning tools for feature development and product lifecycle management.

## Usage

```bash
/xproduct --backlog           # Manage product backlog with priorities
/xproduct --stories           # Create and manage user stories
/xproduct --features          # Feature flag management
/xproduct --feedback          # Integrate user feedback
/xproduct --metrics           # Track product KPIs
/xproduct --roadmap           # Product roadmap planning
```

## Options

### `--backlog`
Manage and prioritize product backlog items.

**Examples:**
```bash
/xproduct --backlog           # View current backlog
/xproduct --backlog --add "User authentication feature"
/xproduct --backlog --prioritize high
/xproduct --backlog --estimate
```

### `--stories`
Create and manage user stories with acceptance criteria.

**Examples:**
```bash
/xproduct --stories           # List all user stories
/xproduct --stories --create "As a user, I want to..."
/xproduct --stories --template
/xproduct --stories --acceptance
```

### `--features`
Manage feature flags and feature rollouts.

**Examples:**
```bash
/xproduct --features          # List all feature flags
/xproduct --features --create "new-dashboard"
/xproduct --features --toggle "beta-feature"
/xproduct --features --rollout 25
```

### `--feedback`
Integrate and analyze user feedback.

**Examples:**
```bash
/xproduct --feedback          # View feedback summary
/xproduct --feedback --collect
/xproduct --feedback --analyze
/xproduct --feedback --prioritize
```

### `--metrics`
Track and analyze product KPIs and metrics.

**Examples:**
```bash
/xproduct --metrics           # View metrics dashboard
/xproduct --metrics --kpi "user-retention"
/xproduct --metrics --funnel "conversion"
/xproduct --metrics --cohort
```

### `--roadmap`
Create and manage product roadmaps.

**Examples:**
```bash
/xproduct --roadmap           # View current roadmap
/xproduct --roadmap --quarter Q1
/xproduct --roadmap --milestone "v2.0"
/xproduct --roadmap --dependencies
```

## Integration

- **Specifications**: Links user stories to SpecDriven AI requirements
- **Testing**: Integrates with `/xtest` for feature validation
- **Analytics**: Works with `/xanalytics` for product insights
- **Planning**: Coordinates with `/xplanning` for development planning

## Output

Product management artifacts, roadmaps, user stories, and KPI reports.