---
description: Design, analyze, and evolve system architecture using Domain-Driven Design, 12-Factor App, and proven patterns
tags: [architecture, design, patterns, ddd, domain-driven-design, bounded-contexts, aggregates, microservices, clean-architecture, 12-factor, cloud-native]
---

Analyze and design system architecture using Domain-Driven Design, 12-Factor App principles, and proven patterns based on $ARGUMENTS.

## Usage Examples

**Basic architecture analysis:**
```
/xarchitecture
```

**Analyze Domain-Driven Design patterns:**
```
/xarchitecture --ddd
```

**Check 12-Factor App compliance:**
```
/xarchitecture --12factor
```

**Design microservices architecture:**
```
/xarchitecture --microservices
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

First, examine the current project structure:
!find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" | grep -v node_modules | grep -v __pycache__ | head -20
!ls -la src/ app/ lib/ services/ controllers/ models/ 2>/dev/null || echo "No standard architecture directories found"
!find . -name "docker-compose.yml" -o -name "Dockerfile" | head -3
!find . -name "*.md" | xargs grep -l "architecture\|design\|pattern" | head -5 2>/dev/null

Identify existing DDD elements:
!find . -name "*Entity*" -o -name "*ValueObject*" -o -name "*Aggregate*" -o -name "*Repository*" | head -10
!grep -r "BoundedContext\|DomainService\|UbiquitousLanguage" . --include="*.py" --include="*.js" --include="*.ts" | head -5 2>/dev/null

Check for domain-driven directory structure:
!ls -la domain/ infrastructure/ application/ 2>/dev/null || echo "No DDD layered architecture found"

Check for 12-Factor App compliance:
!find . -name ".env*" -o -name "config.*" | head -5
!find . -name "Dockerfile" -o -name "docker-compose.yml" | head -3
!find . -name "Procfile" -o -name "requirements.txt" -o -name "package.json" | head -5
!grep -r "process.env\|os.environ\|System.getenv" . --include="*.py" --include="*.js" --include="*.ts" | wc -l

Based on $ARGUMENTS, perform the appropriate DDD and 12-Factor informed architecture operation:

## 1. Architecture Analysis (DDD + 12-Factor)

If analyzing current architecture (--analyze, --layers, --dependencies, --ddd, --12factor):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import\|require" | head -10
!python -c "import ast; print('Python AST analysis available')" 2>/dev/null || echo "Python not available for analysis"
!find . -name "package.json" -o -name "requirements.txt" | head -2

**DDD Strategic Design Analysis:**
!grep -r "BoundedContext\|Context\|Domain" . --include="*.py" --include="*.js" --include="*.ts" | wc -l
!find . -name "*Context*" -o -name "*Domain*" | head -10

**DDD Tactical Design Analysis:**
!find . -name "*Entity*" -o -name "*ValueObject*" -o -name "*Aggregate*" -o -name "*Repository*" -o -name "*DomainService*" | wc -l
!grep -r "Entity\|ValueObject\|Aggregate\|Repository" . --include="*.py" --include="*.js" --include="*.ts" | head -10

**12-Factor App Compliance Analysis:**
!git remote -v | wc -l || echo "No git remote found (Factor I: Codebase)"
!find . -name "requirements.txt" -o -name "package.json" -o -name "Pipfile" | wc -l
!find . -name ".env*" | wc -l
!grep -r "hardcoded.*password\|hardcoded.*key" . --include="*.py" --include="*.js" --include="*.ts" | wc -l
!find . -name "Dockerfile" | wc -l
!grep -r "console.log\|print\|logging" . --include="*.py" --include="*.js" --include="*.ts" | wc -l

Analyze 12-Factor App compliance:
- **I. Codebase**: Single codebase in version control with multiple deploys
- **II. Dependencies**: Explicit dependency declaration and isolation
- **III. Config**: Configuration stored in environment variables
- **IV. Backing Services**: External services treated as attached resources
- **V. Build/Release/Run**: Strict separation of build and run stages
- **VI. Processes**: Stateless process execution
- **VII. Port Binding**: Service export via port binding
- **VIII. Concurrency**: Horizontal scaling via process model
- **IX. Disposability**: Fast startup and graceful shutdown
- **X. Dev/Prod Parity**: Environment consistency across stages
- **XI. Logs**: Logs treated as event streams
- **XII. Admin Processes**: One-off admin tasks as separate processes

Analyze DDD architectural patterns:
- **Bounded Context boundaries** and context mapping
- **Domain model integrity** and ubiquitous language usage
- **Aggregate design** and consistency boundaries
- **Entity vs Value Object** modeling decisions
- **Repository pattern** implementation
- **Domain Service** vs Application Service separation
- **Infrastructure layer** isolation from domain
- **Anti-corruption layer** implementation
- **Layer separation** following DDD principles
- **Coupling and cohesion** within domain boundaries

## 2. Architecture Design (DDD + 12-Factor)

If designing architecture (--design, --microservices, --event-driven, --bounded-contexts, --12factor, --cloud-native):
!find . -name "*.yml" -o -name "*.yaml" | xargs grep -l "service\|api" 2>/dev/null | head -5
!docker --version 2>/dev/null || echo "Docker not available for containerization"
!kubectl version --client 2>/dev/null || echo "Kubernetes not available for orchestration"

**DDD Strategic Design Patterns:**

If designing bounded contexts (--bounded-contexts):
Design context boundaries using:
- **Partnership**: Mutual dependency between teams
- **Shared Kernel**: Common code base between contexts
- **Customer/Supplier**: Upstream/downstream relationship
- **Conformist**: Downstream conforms to upstream model
- **Anti-corruption Layer**: Protect downstream from upstream changes
- **Open-host Service**: Published API for multiple consumers
- **Published Language**: Well-documented shared protocol

**DDD-Informed Microservices Design:**
- **Bounded Context = Microservice**: Each service owns its domain
- **Aggregate-based service boundaries**: Services align with aggregates
- **Domain events** for inter-service communication
- **Saga pattern** for distributed transactions
- **CQRS implementation** for read/write separation

**12-Factor Cloud-Native Design Patterns:**

If designing cloud-native architecture (--12factor, --cloud-native):
Design 12-Factor compliant solutions:
- **I. Codebase**: Single repository with environment-specific deployments
- **II. Dependencies**: Package manager integration (npm, pip, Maven)
- **III. Config**: Environment variable configuration strategy
- **IV. Backing Services**: Database, cache, and message queue abstraction
- **V. Build/Release/Run**: CI/CD pipeline with immutable releases
- **VI. Processes**: Stateless microservice design patterns
- **VII. Port Binding**: Self-contained services with HTTP/gRPC interfaces
- **VIII. Concurrency**: Horizontal scaling and load balancing design
- **IX. Disposability**: Graceful shutdown and fast startup patterns
- **X. Dev/Prod Parity**: Container-based environment consistency
- **XI. Logs**: Structured logging and centralized log aggregation
- **XII. Admin Processes**: Separate administrative service design

Design DDD + 12-Factor architectural solutions:
- **Domain modeling** with 12-Factor stateless entities and aggregates
- **Microservices decomposition** based on bounded contexts + 12-Factor processes
- **Event-driven architecture** using domain events + cloud messaging
- **API gateway** with context-aware routing + port binding
- **Database per bounded context** + backing services abstraction
- **Communication patterns** preserving domain boundaries + disposability
- **Configuration management** via environment variables across contexts
- **Logging strategy** for domain events and business processes

## 3. Architecture Validation (DDD + 12-Factor)

If validating principles (--validate, --solid, --ddd, --clean, --ubiquitous-language, --12factor):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -E "class|function|interface" | wc -l
!find . -name "test*" -o -name "*test*" | head -5 2>/dev/null
!grep -r "TODO\|FIXME\|XXX" . --include="*.py" --include="*.js" --include="*.ts" | wc -l

**DDD Strategic Design Validation:**
!grep -r "UbiquitousLanguage\|DomainExpert\|BoundedContext" . --include="*.py" --include="*.js" --include="*.ts" --include="*.md" | wc -l
!find . -name "*Context*" -type d | wc -l

**DDD Tactical Design Validation:**
!grep -r "Entity\|ValueObject\|Aggregate\|DomainService\|Repository" . --include="*.py" --include="*.js" --include="*.ts" | wc -l
!find . -name "*Aggregate*" -o -name "*Entity*" -o -name "*ValueObject*" | wc -l

**Domain Model Integrity Checks:**
!grep -r "import.*infrastructure\|require.*infrastructure" domain/ 2>/dev/null | wc -l || echo "No domain directory found"
!grep -r "import.*application\|require.*application" domain/ 2>/dev/null | wc -l || echo "No domain directory found"

**12-Factor App Validation:**
!echo "=== 12-Factor Compliance Validation ==="

**I. Codebase Validation:**
!git remote -v && echo "✓ Single codebase with multiple deploys" || echo "✗ Missing version control"

**II. Dependencies Validation:**
!find . -name "requirements.txt" -o -name "package.json" -o -name "Pipfile" && echo "✓ Explicit dependencies" || echo "✗ Missing dependency declarations"

**III. Config Validation:**
!grep -r "process.env\|os.environ" . --include="*.py" --include="*.js" --include="*.ts" | wc -l
!find . -name ".env*" && echo "✓ Environment-based config" || echo "✗ Config not externalized"

**IV. Backing Services Validation:**
!grep -r "DATABASE_URL\|REDIS_URL\|MONGO_URL" . --include="*.py" --include="*.js" --include="*.ts" | wc -l

**V. Build/Release/Run Validation:**
!find . -name "Dockerfile" -o -name "buildspec.yml" && echo "✓ Build stage separation" || echo "✗ No build automation"

**VI. Processes Validation:**
!grep -r "session\|state\|cache.*local" . --include="*.py" --include="*.js" --include="*.ts" | wc -l

**XI. Logs Validation:**
!grep -r "console.log\|logging\|print" . --include="*.py" --include="*.js" --include="*.ts" | wc -l

Validate 12-Factor App principles:
- **I. Codebase**: Single codebase tracked in version control
- **II. Dependencies**: Explicit dependency declaration and isolation
- **III. Config**: Environment-based configuration without hardcoded values
- **IV. Backing Services**: Attached resources via connection strings
- **V. Build/Release/Run**: Strict separation with immutable releases
- **VI. Processes**: Stateless execution without local state
- **VII. Port Binding**: Self-contained service exports
- **VIII. Concurrency**: Process-based horizontal scaling
- **IX. Disposability**: Fast startup and graceful shutdown
- **X. Dev/Prod Parity**: Environment consistency validation
- **XI. Logs**: Event streams to stdout/stderr
- **XII. Admin Processes**: Separate one-off administrative tasks

Validate DDD architectural principles:
- **Ubiquitous Language**: Consistent terminology across code and documentation
- **Bounded Context integrity**: Clear context boundaries and minimal coupling
- **Domain model purity**: Domain layer free from infrastructure dependencies
- **Aggregate consistency**: Proper aggregate boundaries and invariant enforcement
- **Repository abstraction**: Domain-focused repository interfaces
- **Domain Service clarity**: Pure domain logic without external dependencies
- **Anti-corruption layers**: Protection between external systems and domain
- **SOLID principles** compliance within domain boundaries
- **Clean architecture** dependency rules (domain → application → infrastructure)
- **Security architecture** assessment for domain protection
- **Testability** of domain logic in isolation

## 4. Architecture Evolution Planning (DDD + 12-Factor)

If planning evolution (--evolve, --migration, --modernization, --strangler-fig, --cloud-migration):
!git log --oneline --since="6 months ago" | wc -l
!find . -name "*.legacy" -o -name "*deprecated*" | head -5 2>/dev/null
!docker ps 2>/dev/null | wc -l || echo "No containerized services running"

**DDD-Informed Evolution Strategies:**

**Strangler Fig Pattern** for legacy modernization:
- Identify bounded contexts within legacy monolith
- Extract contexts incrementally as microservices
- Implement anti-corruption layers for integration
- Gradually route traffic to new implementations

**Domain-First Migration Planning:**
- **Domain discovery** workshops with domain experts
- **Context mapping** of existing vs target architecture
- **Bounded context extraction** prioritization
- **Event storming** sessions for understanding domain flows

**12-Factor Cloud Migration Planning:**

If planning cloud migration (--cloud-migration):
Plan 12-Factor transformation:
- **I. Codebase**: Consolidate multiple repositories into single codebase
- **II. Dependencies**: Migrate to explicit dependency management
- **III. Config**: Extract hardcoded config to environment variables
- **IV. Backing Services**: Abstract database/service connections
- **V. Build/Release/Run**: Implement CI/CD with immutable artifacts
- **VI. Processes**: Refactor stateful components to stateless design
- **VII. Port Binding**: Containerize services with port exposure
- **VIII. Concurrency**: Design for horizontal scaling patterns
- **IX. Disposability**: Implement graceful shutdown handlers
- **X. Dev/Prod Parity**: Standardize environments with containers
- **XI. Logs**: Centralize logging to stdout/stderr streams
- **XII. Admin Processes**: Separate admin tasks from main processes

Plan DDD + 12-Factor architectural evolution:
- **Legacy to bounded context** migration with 12-Factor processes
- **Monolith decomposition** based on domain boundaries + stateless services
- **Domain model modernization** with cloud-native patterns
- **Event-driven transformation** using cloud messaging + disposability
- **Technology stack upgrade** preserving domain logic + environment parity
- **Configuration externalization** across all bounded contexts
- **Containerization strategy** for each domain service
- **Team topologies alignment** with bounded contexts + DevOps practices
- **Risk assessment** for domain continuity and 12-Factor compliance
- **Timeline and milestone** definition per bounded context + cloud migration

## 5. DDD Tactical Pattern Implementation

If implementing patterns (--pattern, --repository, --factory, --strategy, --aggregate, --entity, --value-object):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "Pattern\|Factory\|Strategy\|Repository\|Entity\|ValueObject\|Aggregate" | head -5
!ls -la patterns/ design/ architecture/ domain/ 2>/dev/null || echo "No pattern directories found"

**DDD Core Tactical Patterns:**

**Entity Implementation** (--entity):
- Identity-based objects with unique identifiers
- Mutable state with business logic encapsulation
- Lifecycle management and invariant enforcement

**Value Object Implementation** (--value-object):
- Immutable objects defined by attributes
- Equality based on value, not identity
- Self-validating with business rules

**Aggregate Implementation** (--aggregate):
- Consistency boundary with aggregate root
- Encapsulation of business invariants
- Transaction boundary definition
- Domain event emission

**Repository Pattern** (--repository):
- Domain-focused collection-like interface
- Aggregate persistence abstraction
- Infrastructure-independent data access

**Domain Service Implementation** (--domain-service):
- Stateless domain operations
- Multi-entity business logic coordination
- Pure domain concepts without dependencies

**Domain Event Implementation** (--domain-events):
- Domain occurrence modeling
- Decoupled communication between aggregates
- Event sourcing preparation

Implement DDD tactical patterns:
- **Entity pattern** with proper identity and business logic
- **Value Object pattern** for immutable domain concepts
- **Aggregate pattern** for consistency boundaries
- **Repository pattern** for domain-focused data access
- **Domain Service pattern** for complex business operations
- **Factory pattern** for complex object creation
- **Specification pattern** for business rule encapsulation
- **Strategy pattern** for domain algorithm selection
- **Observer pattern** for domain event handling
- **Dependency injection** for infrastructure abstraction

Think step by step about Domain-Driven Design + 12-Factor architectural requirements and provide:

1. **Current State Assessment (DDD + 12-Factor)**:
   - **Ubiquitous Language** consistency across codebase and documentation
   - **Bounded Context** identification and boundary analysis
   - **Domain model** vs technical implementation separation
   - **Aggregate design** and consistency boundary evaluation
   - **Repository pattern** usage and domain purity
   - **12-Factor compliance** across all factors (I-XII)
   - **Codebase** consolidation and version control status
   - **Configuration externalization** and environment variable usage
   - **Stateless process design** and backing service abstraction
   - **Build/release/run separation** and deployment pipeline maturity
   - **Logging strategy** and disposability patterns
   - **Performance and scalability** within domain boundaries + horizontal scaling
   - **Security and compliance** for domain protection + cloud-native security

2. **Design Strategy (DDD + 12-Factor)**:
   - **Strategic design** with context mapping and team organization
   - **Tactical design** with entities, value objects, and aggregates
   - **Bounded context decomposition** approach + process-based scaling
   - **Domain event** communication patterns + backing service integration
   - **Data consistency strategy** within and across aggregates + stateless design
   - **Anti-corruption layer** design for external integrations + backing services
   - **12-Factor architecture** design with cloud-native patterns
   - **Configuration strategy** via environment variables across contexts
   - **Logging and monitoring** design for domain events and business processes
   - **Containerization strategy** for bounded context deployment

3. **Implementation Roadmap (DDD + 12-Factor)**:
   - **Domain discovery** and modeling workshops
   - **12-Factor assessment** and gap analysis
   - **Bounded context extraction** phases and milestones
   - **Domain model implementation** with tactical patterns + stateless design
   - **Configuration externalization** across all contexts
   - **Containerization** and deployment pipeline setup
   - **Event storming** sessions for process understanding
   - **Team topology** alignment with domain boundaries + DevOps practices
   - **Risk mitigation** for domain knowledge transfer + cloud migration
   - **Testing strategy** for domain logic validation + 12-Factor compliance

4. **Quality Assurance (DDD + 12-Factor)**:
   - **Architecture Decision Records (ADRs)** for domain decisions + 12-Factor compliance
   - **Domain model validation** and ubiquitous language consistency
   - **12-Factor compliance** monitoring and automated validation
   - **Bounded context health** monitoring and metrics
   - **Configuration management** validation and drift detection
   - **Stateless design** verification and process monitoring
   - **Domain expert collaboration** processes
   - **Continuous domain** model evolution practices
   - **Cloud-native readiness** assessment and validation
   - **Regular domain** model and architecture reviews + 12-Factor audits

Generate comprehensive DDD + 12-Factor architecture analysis with:
- **Strategic design** recommendations for context boundaries + cloud-native deployment
- **Tactical pattern** implementation guidance + stateless design patterns
- **12-Factor compliance** roadmap and implementation strategies
- **Domain-driven migration** strategies from legacy systems + cloud transformation
- **Quality assurance** measures for domain model integrity + cloud-native readiness
- **Team collaboration** approaches with domain experts + DevOps practices
- **Configuration and deployment** strategies for bounded contexts
- **Monitoring and observability** design for domain events and system health

If no specific operation is provided, perform comprehensive architecture health assessment combining DDD principles and 12-Factor App methodology, and recommend improvements based on domain analysis, cloud-native best practices, and strategic design patterns.