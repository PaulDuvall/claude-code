#!/usr/bin/env python3
"""
Test script to verify Debug Specialist Sub-Agent functionality
Creates sample errors to test the debugging capabilities
"""

import sys
import json
import os
from datetime import datetime

def test_import_error():
    """Test ImportError scenario"""
    print("🧪 Testing ImportError scenario...")
    try:
        import nonexistent_module
    except ImportError as e:
        print(f"✓ ImportError generated: {e}")
        return str(e)

def test_attribute_error():
    """Test AttributeError scenario"""
    print("🧪 Testing AttributeError scenario...")
    try:
        test_obj = {"key": "value"}
        result = test_obj.nonexistent_attribute
    except AttributeError as e:
        print(f"✓ AttributeError generated: {e}")
        return str(e)

def test_type_error():
    """Test TypeError scenario"""
    print("🧪 Testing TypeError scenario...")
    try:
        result = "string" + 42
    except TypeError as e:
        print(f"✓ TypeError generated: {e}")
        return str(e)

def test_value_error():
    """Test ValueError scenario"""
    print("🧪 Testing ValueError scenario...")
    try:
        result = int("not_a_number")
    except ValueError as e:
        print(f"✓ ValueError generated: {e}")
        return str(e)

def create_debug_session_example():
    """Create an example debug session context"""
    session_data = {
        "session_id": f"debug_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "issue_summary": "Test debugging session for sub-agent validation",
        "status": "active",
        "priority": "medium",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "context": {
            "error_details": {
                "primary_error": "Multiple error types for testing",
                "secondary_errors": [],
                "stack_traces": ["Test stack trace data"],
                "error_frequency": "once",
                "reproduction_steps": ["Run test-debug-subagent.py", "Observe generated errors"]
            },
            "environment": {
                "os": os.name,
                "language_version": sys.version,
                "dependencies": ["python3", "standard library"],
                "configuration": ["default"],
                "deployment_context": "local"
            },
            "codebase_state": {
                "recent_changes": ["Created debug sub-agent test"],
                "affected_files": ["test-debug-subagent.py"],
                "test_status": "passing",
                "last_working_state": "initial state"
            },
            "investigation_history": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "action": "test_executed",
                    "details": "Generated sample errors for testing",
                    "result": "success",
                    "notes": "All error types generated successfully"
                }
            ],
            "hypotheses": [
                {
                    "theory": "Sub-agent should handle these common error types",
                    "confidence": "high",
                    "status": "testing",
                    "evidence": ["Error patterns match common debugging scenarios"],
                    "test_plan": ["Verify sub-agent can analyze each error type"]
                }
            ],
            "solutions_attempted": []
        }
    }
    
    # Save to debug sessions directory if it exists
    debug_sessions_dir = os.path.expanduser("~/.claude/debug-sessions")
    if os.path.exists(debug_sessions_dir):
        session_file = os.path.join(debug_sessions_dir, f"{session_data['session_id']}.json")
        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)
        print(f"✓ Debug session example created: {session_file}")
    else:
        print("⚠ Debug sessions directory not found, skipping context creation")

def main():
    """Run all debug tests"""
    print("🔧 Debug Specialist Sub-Agent Test Suite")
    print("=" * 50)
    
    errors = []
    
    # Test various error types
    errors.append(test_import_error())
    errors.append(test_attribute_error())
    errors.append(test_type_error())
    errors.append(test_value_error())
    
    # Create example debug session
    create_debug_session_example()
    
    print("\n📋 Test Results Summary:")
    print(f"✓ Generated {len(errors)} different error types")
    print("✓ Created example debug session context")
    
    print("\n🎯 Testing Instructions:")
    print("1. Try using /xdebug with one of these errors:")
    for i, error in enumerate(errors, 1):
        print(f"   {i}. /xdebug \"{error}\"")
    
    print("\n2. Try manual sub-agent invocation:")
    print("   @debug-specialist analyze this ImportError: No module named 'nonexistent_module'")
    
    print("\n3. Try complex debugging scenario:")
    print("   @debug-specialist I'm having intermittent issues with database connections")
    
    print(f"\n✅ Debug sub-agent test setup complete!")
    print(f"📁 Debug sessions stored in: ~/.claude/debug-sessions/")

if __name__ == "__main__":
    main()