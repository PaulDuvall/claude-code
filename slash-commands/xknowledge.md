---
description: Manage organizational knowledge, facilitate team onboarding, and create training materials with SpecDriven AI methodology
tags: [knowledge, training, onboarding, documentation, competency, team-management]
---

Manage knowledge and team development based on the arguments provided in $ARGUMENTS.

First, examine the current knowledge and documentation setup:
!find . -name "*.md" | grep -E "(doc|knowledge|training|onboard|README)" | head -10
!ls -la docs/ training/ onboarding/ knowledge/ 2>/dev/null || echo "No knowledge directories found"
!find . -name "*spec*" -o -name "*requirement*" | head -5 2>/dev/null
!git log --oneline --since="1 month ago" | grep -E "(doc|train|onboard)" | wc -l

Based on $ARGUMENTS, perform the appropriate knowledge management operation:

## 1. Knowledge Capture and Documentation

If capturing knowledge (--capture, --document, --extract):
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "def\|function\|class" | head -10
!grep -r "TODO\|FIXME\|NOTE\|IMPORTANT" . --include="*.py" --include="*.js" --include="*.md" | head -10 2>/dev/null
!find . -name "*.md" | xargs grep -l "best practice\|pattern\|guideline" | head -5 2>/dev/null

Capture and document knowledge:
- Extract domain expertise from code and comments
- Document architectural decisions and patterns
- Codify tribal knowledge and best practices
- Create process and procedure documentation
- Maintain knowledge base currency

## 2. Team Onboarding

If managing onboarding (--onboard, --checklist, --resources):
!ls -la package.json requirements.txt setup.py pyproject.toml 2>/dev/null | head -3
!find . -name "README*" -o -name "CONTRIBUTING*" -o -name "SETUP*" | head -5
!ls -la .env.example docker-compose.yml Dockerfile 2>/dev/null | head -3
!git remote -v 2>/dev/null || echo "No git remotes configured"

Create onboarding materials:
- Role-specific setup and configuration guides
- Development environment setup instructions
- Project overview and architecture documentation
- Team processes and workflow documentation
- Mentoring and buddy system setup

## 3. Training and Development

If creating training (--training, --curriculum, --exercises):
!find . -name "*test*" -o -name "*example*" | head -10 2>/dev/null
!ls -la training/ examples/ tutorials/ docs/learning/ 2>/dev/null || echo "No training directories found"
!python -c "import pytest; print('Testing framework available')" 2>/dev/null || npm test --version 2>/dev/null || echo "No testing framework detected"

Develop training materials:
- Hands-on coding exercises and examples
- Progressive skill development curricula
- Assessment and evaluation frameworks
- Interactive learning experiences
- Certification and competency tracking

## 4. Competency Assessment

If assessing competencies (--assess, --gaps, --matrix, --skills):
!git log --pretty=format:"%an" --since="3 months ago" | sort | uniq -c | sort -nr
!find . -name "*.py" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import\|require" | head -10
!ls -la team/ people/ skills/ competencies/ 2>/dev/null || echo "No team documentation found"

Assess and track competencies:
- Individual skill assessment and tracking
- Team competency gap analysis
- Skills matrix development and maintenance
- Personal development planning
- Career progression pathway definition

## 5. Knowledge Transfer

If managing knowledge transfer (--transfer, --handover, --succession):
!git log --pretty=format:"%h %an %s" --since="1 month ago" | head -20
!find . -name "*.md" | xargs grep -l "handover\|transfer\|transition" | head -5 2>/dev/null
!ls -la docs/handover/ docs/transfer/ docs/succession/ 2>/dev/null || echo "No transfer documentation found"

Manage knowledge transfer:
- Project handover documentation creation
- Knowledge transfer session planning
- Succession planning for critical roles
- Documentation of critical knowledge
- Risk mitigation for knowledge loss

Think step by step about knowledge management requirements and provide:

1. **Knowledge Audit**:
   - Current knowledge base assessment
   - Documentation gap identification
   - Critical knowledge risk evaluation
   - Team competency baseline

2. **Documentation Strategy**:
   - Knowledge capture methodology
   - Documentation standards and templates
   - Maintenance and update processes
   - Accessibility and discoverability

3. **Training Framework**:
   - Learning path development
   - Competency-based curriculum design
   - Assessment and certification approach
   - Continuous learning culture

4. **Knowledge Retention**:
   - Critical knowledge identification
   - Transfer and succession planning
   - Documentation automation opportunities
   - Community and collaboration tools

Generate comprehensive knowledge management plan with documentation strategy, training materials, competency frameworks, and retention mechanisms.

If no specific operation is provided, perform knowledge management assessment and recommend improvements based on current documentation state and team needs.