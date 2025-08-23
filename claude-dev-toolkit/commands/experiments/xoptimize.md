---
description: Find and apply performance improvements, optimize workflows, and enhance resource utilization
tags: [optimization, performance, profiling, bottlenecks, efficiency, resource-management]
---

Analyze and optimize code performance, processes, and resources based on the arguments provided in $ARGUMENTS.

First, examine the project for optimization opportunities:
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | head -10
!ps aux | head -5
!df -h | head -5
!free -h 2>/dev/null || vm_stat 2>/dev/null || echo "Memory info not available"

Based on $ARGUMENTS, perform the appropriate optimization operation:

## 1. Code Performance Optimization

If optimizing code (--code, --algorithms):
!python -c "import cProfile; print('Profiling available')" 2>/dev/null || echo "Install profiling tools"
!find . -name "*.py" -exec grep -l "for.*in.*for" {} \; 2>/dev/null | head -5
!grep -r "SELECT.*FROM" . --include="*.py" --include="*.js" | head -5 2>/dev/null

Analyze and optimize code performance:
- Profile CPU-intensive functions and algorithms
- Identify nested loop inefficiencies
- Optimize database query patterns
- Reduce memory allocation overhead
- Implement caching strategies

## 2. Build and CI/CD Optimization

If optimizing processes (--build, --ci-cd):
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -3
!ls -la .github/workflows/ 2>/dev/null || echo "No CI/CD workflows found"
!npm list --depth=0 2>/dev/null | wc -l || echo "No npm dependencies"

Optimize development processes:
- Reduce build time through caching
- Parallelize test execution
- Optimize CI/CD pipeline stages
- Streamline deployment processes
- Reduce dependency installation time

## 3. Resource Utilization Optimization

If optimizing resources (--dependencies, --memory):
!find . -name "requirements.txt" -o -name "package.json" | head -2
!du -sh node_modules/ 2>/dev/null || echo "No node_modules directory"
!docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" 2>/dev/null | head -5

Optimize resource usage:
- Analyze and reduce dependency footprint
- Optimize memory usage patterns
- Minimize storage requirements
- Reduce network request overhead
- Optimize container image sizes

## 4. Performance Profiling and Analysis

If profiling performance (--profile, --benchmark):
!python -m cProfile -o profile.stats -c "import main" 2>/dev/null || echo "No main module for profiling"
!time python -c "print('Timing test')" 2>/dev/null || echo "Python not available"
!uptime

Execute performance analysis:
- Profile application bottlenecks
- Benchmark critical functions
- Identify performance hotspots
- Measure resource consumption
- Generate performance baselines

## 5. Database and Network Optimization

If optimizing data access (--database, --network):
!find . -name "*.sql" | head -5 2>/dev/null || echo "No SQL files found"
!grep -r "fetch\|request\|query" . --include="*.py" --include="*.js" | head -5 2>/dev/null
!netstat -an 2>/dev/null | head -5 || echo "Network stats not available"

Optimize data and network operations:
- Analyze and optimize database queries
- Implement connection pooling
- Reduce network request frequency
- Optimize data serialization
- Implement efficient caching strategies

Think step by step about optimization opportunities and provide:

1. **Performance Analysis**:
   - Current performance baseline measurement
   - Bottleneck identification and prioritization
   - Resource utilization assessment
   - Performance regression detection

2. **Optimization Strategy**:
   - Code-level optimization opportunities
   - Process improvement recommendations
   - Resource allocation optimization
   - Infrastructure efficiency improvements

3. **Implementation Plan**:
   - Prioritized optimization actions
   - Expected performance improvements
   - Risk assessment and mitigation
   - Validation and testing approach

4. **Monitoring and Validation**:
   - Performance monitoring setup
   - Optimization effectiveness measurement
   - Continuous improvement recommendations
   - Performance regression prevention

Generate comprehensive optimization plan with performance analysis, prioritized improvements, implementation guidance, and monitoring recommendations.

If no specific operation is provided, perform comprehensive performance assessment and recommend top optimization priorities based on impact and effort analysis.

