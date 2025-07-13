---
description: Manage infrastructure operations, container orchestration, cloud resources, and deployment automation
tags: [infrastructure, containers, kubernetes, cloud, terraform, monitoring, scaling]
---

Manage infrastructure operations and cloud resources based on the arguments provided in $ARGUMENTS.

First, examine the current infrastructure setup:
!find . -name "*.tf" -o -name "*.yml" -o -name "*.yaml" | grep -E "(terraform|infra|k8s|docker)" | head -10
!ls -la docker-compose.yml Dockerfile terraform/ k8s/ infrastructure/ 2>/dev/null || echo "No infrastructure files found"
!which docker 2>/dev/null && docker --version || echo "Docker not available"
!which kubectl 2>/dev/null && kubectl version --client || echo "kubectl not available"
!which terraform 2>/dev/null && terraform version || echo "Terraform not available"

Based on $ARGUMENTS, perform the appropriate infrastructure operation:

## 1. Container Management

If managing containers (--containers, --docker, --kubernetes):
!docker ps 2>/dev/null || echo "Docker daemon not running"
!kubectl get nodes 2>/dev/null || echo "No Kubernetes cluster connection"
!ls -la docker-compose.yml 2>/dev/null || echo "No docker-compose.yml found"

Manage container infrastructure:
- Docker container orchestration
- Kubernetes cluster operations
- Container registry management
- Service mesh configuration
- Resource allocation and limits

## 2. Infrastructure as Code

If managing IaC (--terraform, --iac, --provision):
!find . -name "*.tf" | head -5
!terraform --version 2>/dev/null || echo "Terraform not installed"
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "AWSTemplateFormatVersion\|Resources" 2>/dev/null | head -3

Manage infrastructure code:
- Terraform configuration and state
- CloudFormation template management
- Infrastructure provisioning automation
- Resource dependency management
- State management and locking

## 3. Monitoring and Observability

If setting up monitoring (--monitoring, --observability, --alerts):
!find . -name "*prometheus*" -o -name "*grafana*" | head -5
!ps aux | grep -E "(prometheus|grafana|jaeger)" | grep -v grep
!netstat -tuln 2>/dev/null | grep -E "(9090|3000|16686)" || echo "No monitoring services detected"

Configure monitoring infrastructure:
- Prometheus metrics collection
- Grafana dashboard setup
- Alert manager configuration
- Distributed tracing setup
- Log aggregation systems

## 4. Scaling and Performance

If configuring scaling (--scaling, --performance, --capacity):
!kubectl get hpa 2>/dev/null || echo "No HPA configured"
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "autoscaling" 2>/dev/null | head -3
!docker stats --no-stream 2>/dev/null | head -5 || echo "No container stats available"

Implement scaling strategies:
- Horizontal Pod Autoscaling (HPA)
- Vertical Pod Autoscaling (VPA)
- Cluster autoscaling configuration
- Load balancer optimization
- Resource quota management

## 5. Security and Compliance

If managing security (--security, --compliance, --rbac):
!kubectl get networkpolicies 2>/dev/null || echo "No network policies found"
!find . -name "*.tf" | xargs grep -l "security_group\|iam_" 2>/dev/null | head -3
!kubectl get rbac 2>/dev/null || echo "No RBAC configured"

Implement security measures:
- Network policy configuration
- RBAC setup and management
- Security group rules
- Encryption at rest and in transit
- Compliance scanning and reporting

Think step by step about infrastructure requirements and provide:

1. **Infrastructure Assessment**:
   - Current infrastructure state analysis
   - Resource utilization evaluation
   - Security posture assessment
   - Compliance gap identification

2. **Architecture Strategy**:
   - Scalability planning recommendations
   - High availability design patterns
   - Disaster recovery planning
   - Multi-cloud considerations

3. **Implementation Plan**:
   - Infrastructure as Code setup
   - Container orchestration strategy
   - Monitoring and observability integration
   - Security controls implementation

4. **Operational Excellence**:
   - Automation opportunities
   - Cost optimization strategies
   - Performance monitoring setup
   - Incident response procedures

Generate comprehensive infrastructure configuration with security controls, monitoring setup, scaling strategies, and operational best practices.

If no specific operation is provided, perform infrastructure health assessment and recommend improvements based on current setup and industry best practices.