---
description: Create secure, isolated development environments for safe coding, testing, and experimentation
tags: [security, sandbox, isolation, containers, testing, development]
---

Create and manage secure sandbox environments based on the arguments provided in $ARGUMENTS.

First, examine the current environment and security setup:
!which docker 2>/dev/null && docker --version || echo "Docker not available"
!which podman 2>/dev/null && podman --version || echo "Podman not available"
!ls -la Dockerfile docker-compose.yml 2>/dev/null | head -2
!ps aux | grep -E "(docker|podman|sandbox)" | grep -v grep | head -3

Based on $ARGUMENTS, perform the appropriate sandbox operation:

## 1. Sandbox Creation and Setup

If creating sandbox environments (--create, --template, --isolated, --container):
!docker info 2>/dev/null | head -5 || echo "Docker daemon not running"
!ls -la .devcontainer/ .docker/ sandbox/ 2>/dev/null | head -3
!find . -name "Dockerfile*" -o -name "docker-compose*" | head -3
!id -u 2>/dev/null && echo "Current user ID available" || echo "User ID not available"

Create secure environments:
- Containerized development sandboxes
- Isolated network environments
- Resource-limited execution spaces
- Template-based sandbox creation
- Security-hardened environments

## 2. Environment Configuration

If configuring sandbox (--configure, --resources, --network, --storage):
!docker network ls 2>/dev/null || echo "Docker networks not available"
!df -h 2>/dev/null | head -5
!free -h 2>/dev/null || vm_stat 2>/dev/null || echo "Memory info not available"
!ulimit -a | head -10

Configure sandbox parameters:
- Resource limits and quotas
- Network isolation policies
- Storage access controls
- Security constraints
- Environment variables

## 3. Security and Isolation

If managing isolation (--isolate, --security-scan, --validate, --compliance):
!ps aux --forest 2>/dev/null | head -10 || ps aux | head -10
!netstat -tuln 2>/dev/null | head -5 || ss -tuln | head -5
!find /proc -name "*namespace*" 2>/dev/null | head -3 || echo "Namespace info not accessible"
!which firejail 2>/dev/null && firejail --version || echo "Firejail not available"

Implement security measures:
- Process and namespace isolation
- Network traffic filtering
- File system access controls
- Security vulnerability scanning
- Compliance validation

## 4. Monitoring and Logging

If monitoring sandbox (--monitor, --logs, --alerts, --forensics):
!docker logs --help 2>/dev/null | head -1 || echo "Docker logging not available"
!find /var/log -name "*docker*" -o -name "*container*" 2>/dev/null | head -3
!journalctl --version 2>/dev/null || echo "systemd journal not available"
!ps aux | grep -E "(syslog|rsyslog|journald)" | grep -v grep

Set up monitoring:
- Activity and behavior monitoring
- Security event logging
- Resource usage tracking
- Anomaly detection
- Forensic evidence collection

## 5. Resource and Access Management

If managing resources (--cleanup, --backup, --restore, --access, --permissions):
!docker system df 2>/dev/null || echo "Docker system info not available"
!find . -name "*backup*" -o -name "*snapshot*" | head -5 2>/dev/null
!ls -la /tmp/sandbox* /var/tmp/sandbox* 2>/dev/null | head -5
!which tar 2>/dev/null && echo "Backup tools available" || echo "Backup tools not available"

Manage sandbox lifecycle:
- Resource cleanup and optimization
- Data backup and restoration
- Access control and permissions
- User and authentication management
- Environment lifecycle management

Think step by step about sandbox security requirements and provide:

1. **Security Assessment**:
   - Current environment security posture
   - Isolation requirements and constraints
   - Risk assessment and threat modeling
   - Compliance and regulatory considerations

2. **Sandbox Strategy**:
   - Isolation level selection and implementation
   - Resource allocation and limits
   - Network security and access controls
   - Monitoring and logging requirements

3. **Implementation Plan**:
   - Sandbox creation and configuration
   - Security controls and validation
   - Monitoring and alerting setup
   - Backup and recovery procedures

4. **Operational Security**:
   - Access management and authentication
   - Incident response procedures
   - Forensic capabilities and evidence collection
   - Continuous security improvement

Generate comprehensive sandbox security framework with isolation controls, monitoring capabilities, access management, and operational procedures.

If no specific operation is provided, assess current environment security and recommend sandbox implementation strategy based on security requirements and available technologies.

