---
description: Design, implement, test, and document APIs with comprehensive automation and best practices
tags: [api, development, testing, documentation, openapi, rest, graphql]
---

Design, implement, test, and document APIs based on the arguments provided in $ARGUMENTS.

First, examine the project structure and API configuration:
!ls -la | grep -E "(api|server|app|openapi|swagger)"
!find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" | grep -E "(api|openapi|swagger)" | head -10
!npm list express 2>/dev/null || python -c "import fastapi; print('FastAPI available')" 2>/dev/null || echo "No API framework detected"

Based on $ARGUMENTS, perform the appropriate API operation:

## 1. API Design and Planning

If designing new API (--design):
!find . -name "*.yml" -o -name "*.yaml" | grep -E "(openapi|swagger)" | head -3
@openapi.yml 2>/dev/null || @swagger.yml 2>/dev/null || echo "No existing API specification found"

Design REST API structure:
- Analyze resource requirements from $ARGUMENTS
- Create RESTful endpoint patterns
- Define request/response schemas
- Plan authentication and authorization
- Design error handling patterns

## 2. OpenAPI Specification

If working with OpenAPI (--openapi):
!find . -name "openapi.*" -o -name "swagger.*" | head -3
!python -c "import yaml; print('YAML parsing available')" 2>/dev/null || npm list js-yaml 2>/dev/null || echo "No YAML parser available"

Generate or validate OpenAPI spec:
- Create OpenAPI 3.0 specification
- Define API paths and operations
- Document request/response schemas
- Include authentication schemes
- Add examples and descriptions

## 3. Implementation Generation

If generating implementation (--generate):
!find . -name "package.json" -o -name "requirements.txt" | head -1
!python -c "import fastapi" 2>/dev/null && echo "FastAPI available" || npm list express 2>/dev/null && echo "Express available" || echo "No API framework detected"

Generate server implementation:
- Create API routes based on specification
- Generate request/response models
- Implement middleware stack
- Add validation and error handling
- Configure database connections if needed

## 4. Testing and Validation

If testing API (--test):
!find . -name "*test*" | grep -E "(api|endpoint)" | head -5
!python -c "import requests" 2>/dev/null && echo "Python requests available" || npm list axios 2>/dev/null && echo "Axios available" || echo "No HTTP client available"

Execute comprehensive API testing:
- Unit tests for individual endpoints
- Integration tests with database
- Contract testing against specification
- Load testing for performance
- Security vulnerability scanning

## 5. Documentation Generation

If generating documentation (--docs):
!find . -name "*.md" | grep -i api | head -5
!python -c "import markdown" 2>/dev/null || npm list markdown 2>/dev/null || echo "No markdown processor available"

Create comprehensive API documentation:
- Generate interactive Swagger UI
- Create developer documentation
- Add usage examples and code samples
- Document authentication flows
- Include troubleshooting guides

## 6. Security and Monitoring

If adding security (--security):
!find . -name "*.js" -o -name "*.py" | xargs grep -l "auth" | head -5
!npm list helmet 2>/dev/null || python -c "import security" 2>/dev/null || echo "No security middleware found"

Implement API security:
- Add authentication middleware (JWT, OAuth)
- Implement rate limiting
- Add CORS configuration
- Include security headers
- Set up input validation

## 7. Performance Optimization

If optimizing performance (--optimize):
!find . -name "*.log" | grep -E "(access|api)" | head -3
!ps aux | grep -E "(node|python)" | head -5

Optimize API performance:
- Implement caching strategies
- Add response compression
- Optimize database queries
- Configure connection pooling
- Monitor response times

## 8. Client SDK Generation

If generating client SDKs (--sdk):
!find . -name "openapi.*" -o -name "swagger.*" | head -1
!python -c "import openapi_python_client" 2>/dev/null || npm list swagger-codegen 2>/dev/null || echo "No codegen tools available"

Generate client libraries:
- Create JavaScript/TypeScript SDK
- Generate Python client library
- Build Go SDK
- Add authentication helpers
- Include usage examples

## 9. Deployment and Operations

If deploying API (--deploy):
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -2
!kubectl version --client 2>/dev/null || docker --version 2>/dev/null || echo "No deployment tools available"

Deploy API services:
- Create containerized deployment
- Configure load balancing
- Set up health checks
- Add monitoring and logging
- Configure auto-scaling

Think step by step about API development requirements and provide:

1. **API Design Analysis**:
   - Resource identification and relationships
   - Endpoint structure and HTTP methods
   - Request/response schema design
   - Authentication and authorization requirements

2. **Implementation Strategy**:
   - Framework selection and configuration
   - Middleware stack implementation
   - Database integration patterns
   - Error handling and validation

3. **Testing Approach**:
   - Unit testing for business logic
   - Integration testing with dependencies
   - Contract testing against specifications
   - Performance and security testing

4. **Documentation and Deployment**:
   - Interactive API documentation
   - Client SDK generation
   - Deployment configuration
   - Monitoring and maintenance

Generate comprehensive API implementation with best practices, complete testing suite, and production-ready deployment configuration.

If no specific operation is provided, analyze existing API structure and suggest improvements for performance, security, and maintainability.

