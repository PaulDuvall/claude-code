# Debug Context Management System

## Overview
This system enables the Debug Specialist sub-agent to maintain persistent debugging context across multiple interactions, building comprehensive understanding of complex issues.

## Context Structure

### Debug Session Context
```json
{
  "session_id": "debug_session_[timestamp]",
  "issue_summary": "Brief description of the main problem",
  "status": "active|investigating|resolved|escalated",
  "priority": "low|medium|high|critical",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "context": {
    "error_details": {
      "primary_error": "Main error message",
      "secondary_errors": ["Related error messages"],
      "stack_traces": ["Full stack trace data"],
      "error_frequency": "once|intermittent|frequent|constant",
      "reproduction_steps": ["Step-by-step reproduction"]
    },
    "environment": {
      "os": "Operating system details",
      "language_version": "Programming language version",
      "dependencies": ["Package versions and details"],
      "configuration": ["Relevant config settings"],
      "deployment_context": "local|staging|production"
    },
    "codebase_state": {
      "recent_changes": ["Recent commits or modifications"],
      "affected_files": ["Files related to the issue"],
      "test_status": "passing|failing|mixed",
      "last_working_state": "Known good configuration"
    },
    "investigation_history": [
      {
        "timestamp": "ISO timestamp",
        "action": "hypothesis_formed|test_executed|solution_attempted",
        "details": "What was done or discovered",
        "result": "success|failure|partial|inconclusive",
        "notes": "Additional observations"
      }
    ],
    "hypotheses": [
      {
        "theory": "Potential root cause explanation",
        "confidence": "low|medium|high",
        "status": "untested|testing|confirmed|rejected",
        "evidence": ["Supporting or contradicting evidence"],
        "test_plan": ["Steps to validate this hypothesis"]
      }
    ],
    "solutions_attempted": [
      {
        "approach": "Description of solution attempted",
        "implementation": "Code changes or actions taken",
        "result": "resolved|partial_fix|no_change|made_worse",
        "rollback_info": "How to undo if needed",
        "learned": "Key insights from this attempt"
      }
    ]
  }
}
```

## Context Operations

### Initialize Debug Session
```markdown
# Debug Session: [Issue Summary]
**Session ID**: debug_session_[timestamp]
**Status**: Active
**Priority**: [Based on impact assessment]

## Current Understanding
- **Primary Issue**: [Main problem description]
- **Environment**: [Key environment details]
- **Recent Changes**: [What changed recently]

## Investigation Plan
1. [Initial hypothesis or investigation step]
2. [Next planned action]
3. [Validation approach]

*This is a persistent debugging session. Context will be maintained across interactions.*
```

### Update Context During Investigation
```markdown
## Investigation Update - [Timestamp]

**Action Taken**: [What was investigated or attempted]
**Result**: [Outcome of the action]
**New Evidence**: [What was discovered]

### Updated Hypotheses
- **Theory A**: [Status and confidence level]
- **Theory B**: [New theory based on evidence]

### Next Steps
1. [Immediate next action]
2. [Follow-up investigation]
```

### Context Retrieval Prompts
When the debug sub-agent is invoked, it should check for existing context:

```markdown
**Context Check**: Is this related to an existing debug session?
- Check for similar error patterns
- Look for related file paths or components
- Match against recent debugging history

**If Related**: Load existing context and continue investigation
**If New**: Initialize new debug session with context tracking
```

## Context Persistence Strategies

### File-Based Context Storage
- Store context in `/debug-sessions/` directory
- Use session IDs for file naming
- JSON format for structured data
- Markdown summaries for human readability

### Cross-Session Learning
- Maintain database of resolved issues
- Pattern recognition for similar problems
- Solution effectiveness tracking
- Environmental correlation analysis

### Context Sharing
- Share context with other sub-agents when relevant
- Security Analyst: For security-related debugging
- Code Quality Reviewer: For quality-related issues
- Architecture Consultant: For systemic problems

## Usage Patterns

### New Debug Session
```
@debug-specialist I'm getting a "ModuleNotFoundError" in my Flask app
→ Creates new debug session
→ Initializes context tracking
→ Begins systematic investigation
```

### Continuing Existing Session
```
@debug-specialist Update on the Flask ModuleNotFoundError - tried your suggestion but still failing
→ Loads existing session context
→ Updates investigation history
→ Adjusts hypotheses based on new information
```

### Complex Multi-Day Debugging
```
Day 1: Initial investigation and hypothesis formation
Day 2: Environment analysis and dependency checking  
Day 3: Solution implementation and validation
→ All context preserved across days
→ Investigation history maintained
→ Learning captured for future similar issues
```

## Integration with Slash Commands

### From /xdebug
When `/xdebug` delegates to debug-specialist:
- Include current error details in context initialization
- Transfer any preliminary analysis done
- Set appropriate priority based on error severity

### Context Handoff
```markdown
**Debugging Handoff from /xdebug**
- **Error**: [Error details]
- **Preliminary Analysis**: [Any initial findings]
- **User Request**: [What user specifically asked for]
- **Context Priority**: [Suggested session priority]

*Continuing with Debug Specialist sub-agent for persistent context and deep analysis...*
```

## Benefits of Persistent Context

1. **Avoid Repetition**: Don't re-investigate known facts
2. **Build Understanding**: Accumulate knowledge over time
3. **Pattern Recognition**: Identify recurring issues
4. **Solution Tracking**: Remember what works and what doesn't
5. **Learning**: Improve debugging effectiveness over time
6. **Collaboration**: Share context with team members and other agents

This context management system transforms debugging from isolated problem-solving into systematic investigation with memory and learning capabilities.