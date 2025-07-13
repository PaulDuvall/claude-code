---
description: Identify and fix performance bottlenecks with profiling and optimization
tags: [performance, profiling, optimization]
---

Profile application performance and identify optimization opportunities.

Parse performance options from $ARGUMENTS (--profile, --benchmark, --memory, --cpu, or specific function/module names).

## 1. Initial Performance Check

Get system information:
!uname -a
!python --version 2>/dev/null || node --version 2>/dev/null

Check current resource usage:
!ps aux | grep -E "(python|node)" | head -5
!df -h | grep -v tmpfs

## 2. CPU Profiling

For Python projects:
!python -m cProfile -s cumtime main.py 2>/dev/null | head -30 || echo "Add cProfile to your main script"

For Node.js projects:
!node --prof app.js 2>/dev/null && node --prof-process isolate-*.log 2>/dev/null || echo "Use node --prof for profiling"

## 3. Memory Profiling

Check for memory leaks and usage patterns:
!ps aux | grep -E "(python|node)" | awk '{print $2, $3, $4, $11}'

For Python memory profiling:
!python -m memory_profiler main.py 2>/dev/null || echo "Install memory_profiler: pip install memory_profiler"

## 4. Database Performance

Look for slow queries:
!grep -i "slow query" *.log 2>/dev/null | head -10
!find . -name "*.py" -o -name "*.js" | xargs grep -n "SELECT.*FROM" | head -20

## 5. Code Analysis for Performance Issues

Check for common performance anti-patterns:
!grep -r -n "for.*in.*for.*in" . --include="*.py" 2>/dev/null | head -10
!grep -r -n "await.*forEach\|Promise\.all" . --include="*.js" 2>/dev/null | head -10

Think step by step about performance bottlenecks and provide:

1. Identification of top performance issues
2. Specific optimization recommendations
3. Code examples for fixes
4. Expected performance improvements

Generate performance report in this format:

```
⚡ PERFORMANCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Profile Duration: [X] seconds
Total Operations: [X]

🔥 HOTSPOTS (Top 5)
─────────────────
1. [Function/Module] - X% CPU time
   Current: [Performance metric]
   Issue: [What's causing slowness]
   Fix: [Specific optimization]
   Expected: [Improved metric]

2. [Function/Module] - X% CPU time
   [Similar details]

📊 MEMORY PROFILE
───────────────
- Initial: X MB
- Peak: X MB
- Growth: X MB/hour
- Potential leaks: [Yes/No]

🎯 OPTIMIZATION RECOMMENDATIONS
─────────────────────────────
1. [Specific optimization with code example]
   Before: [slow code]
   After: [optimized code]
   Impact: X% improvement

2. [Another optimization]

💡 QUICK WINS
───────────
• [Easy optimization 1]
• [Easy optimization 2]
• [Easy optimization 3]
```

If --benchmark is specified, create and run performance benchmarks:
!python -m timeit -n 1000 "[code to benchmark]" 2>/dev/null
!time python main.py 2>/dev/null

For specific function profiling (if function name in $ARGUMENTS):
- Profile that specific function
- Show call count and time spent
- Suggest optimizations

Common optimizations to check for:
- N+1 query problems
- Inefficient loops (nested loops, unnecessary iterations)
- Missing caching opportunities
- Synchronous I/O that could be async
- Large data structure copies
- Regex compilation in loops