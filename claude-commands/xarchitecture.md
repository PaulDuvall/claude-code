---
description: Design, analyze, and evolve system architecture with proven patterns and best practices
tags: [architecture, design, patterns, analysis, microservices, clean-architecture]
---

Analyze and design system architecture based on the arguments provided in $ARGUMENTS.

First, examine the current project structure:
!find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" | grep -v node_modules | grep -v __pycache__ | head -20
!ls -la src/ app/ lib/ services/ controllers/ models/ 2>/dev/null || echo "No standard architecture directories found"
!find . -name "docker-compose.yml" -o -name "Dockerfile" | head -3
!find . -name "*.md" | xargs grep -l "architecture\|design\|pattern" | head -5 2>/dev/null

Based on $ARGUMENTS, perform the appropriate architecture operation:

## 1. Architecture Analysis

If analyzing current architecture (--analyze, --layers, --dependencies):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import\|require" | head -10
!python -c "import ast; print('Python AST analysis available')" 2>/dev/null || echo "Python not available for analysis"
!find . -name "package.json" -o -name "requirements.txt" | head -2

Analyze architectural patterns:
- Layer separation and dependency flow
- Coupling and cohesion metrics
- Circular dependency detection
- Component boundary analysis
- Anti-pattern identification

## 2. Architecture Design

If designing architecture (--design, --microservices, --event-driven):
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "service\|api" 2>/dev/null | head -5
!docker --version 2>/dev/null || echo "Docker not available for containerization"
!kubectl version --client 2>/dev/null || echo "Kubernetes not available for orchestration"

Design architectural solutions:
- Microservices decomposition strategy
- Event-driven architecture planning
- API gateway and service mesh design
- Database per service strategy
- Communication pattern selection

## 3. Architecture Validation

If validating principles (--validate, --solid, --ddd, --clean):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -E "class|function|interface" | wc -l
!find . -name "test*" -o -name "*test*" | head -5 2>/dev/null
!grep -r "TODO\|FIXME\|HACK" . --include="*.py" --include="*.js" --include="*.ts" | wc -l

Validate architectural principles:
- SOLID principles compliance
- Clean architecture dependency rules
- Domain-driven design patterns
- Security architecture assessment
- Testability and maintainability

## 4. Architecture Evolution Planning

If planning evolution (--evolve, --migration, --modernization):
!git log --oneline --since="6 months ago" | wc -l
!find . -name "*.legacy" -o -name "*deprecated*" | head -5 2>/dev/null
!docker ps 2>/dev/null | wc -l || echo "No containerized services running"

Plan architectural evolution:
- Migration strategy from monolith to microservices
- Legacy system modernization approach
- Technology stack upgrade planning
- Risk assessment and mitigation
- Timeline and milestone definition

## 5. Pattern Implementation

If implementing patterns (--pattern, --repository, --factory, --strategy):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "Pattern\|Factory\|Strategy\|Repository" | head -5
!ls -la patterns/ design/ architecture/ 2>/dev/null || echo "No pattern directories found"

Implement design patterns:
- Repository pattern for data access
- Factory pattern for object creation
- Strategy pattern for algorithm selection
- Observer pattern for event handling
- Dependency injection setup

Think step by step about architectural requirements and provide:

1. **Current State Assessment**:
   - Existing architecture pattern identification
   - Dependency analysis and coupling metrics
   - Performance and scalability limitations
   - Security and compliance gaps

2. **Design Strategy**:
   - Target architecture pattern selection
   - Component decomposition approach
   - Communication and integration patterns
   - Data management and consistency strategy

3. **Implementation Roadmap**:
   - Migration phases and milestones
   - Risk mitigation strategies
   - Testing and validation approach
   - Team training and knowledge transfer

4. **Quality Assurance**:
   - Architecture decision records (ADRs)
   - Continuous architecture validation
   - Performance monitoring setup
   - Regular architecture reviews

Generate comprehensive architecture analysis with pattern recommendations, implementation guidance, migration strategies, and quality assurance measures.

If no specific operation is provided, perform architecture health assessment and recommend improvements based on current system analysis and industry best practices.