---
description: Generate specifications and code from visual artifacts — diagrams, mockups, and screenshots
tags: [image, spec, visual, diagram, mockup, screenshot, ui, architecture]
---

# Image Spec

Use diagrams, mockups, and screenshots as primary specifications for code generation. Iterate with annotated visuals. Aligns with the Image Spec pattern from ai-development-patterns.

## Usage Examples

**Generate code from an architecture diagram:**
```
/ximagespec architecture.png
```

**Generate UI from a mockup:**
```
/ximagespec mockup.png --stack react
```

**Iterate on a screenshot with annotations:**
```
/ximagespec screenshot.png --iterate
```

**Generate spec document from a flow diagram:**
```
/ximagespec flow.png --spec-only
```

**Help and options:**
```
/ximagespec help
/ximagespec --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Identify the Visual Artifact

Parse $ARGUMENTS for the image path. If not provided, check for common image files:
!find . -maxdepth 2 -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.webp" | grep -iE "(arch|mock|design|flow|diagram|wireframe|spec|ui)" | head -10

Read the provided image file to understand its content.

### Step 2: Classify the Image Type

Determine what kind of visual artifact this is:

- **Architecture diagram**: Components, boundaries, connections, ports
- **UI mockup/wireframe**: Layout, interactions, visual hierarchy
- **Data model diagram**: Entities, relationships, fields
- **Flow/sequence diagram**: Steps, decision points, actors
- **Screenshot (iteration)**: Existing implementation to refine

### Step 3: Detect Project Context

Examine the codebase to align generated code with existing patterns:
!ls -la | grep -E "(pyproject.toml|package.json|go.mod|Cargo.toml|docker-compose.yml)"
!find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" | grep -v node_modules | head -10

Identify:
- Tech stack from project files
- Existing code patterns and conventions
- Framework in use (React, Django, Express, etc.)
- Test patterns already established

### Step 4: Generate Based on Image Type

**Architecture Diagrams**:
From the image, extract:
- Component names and responsibilities
- Communication patterns (sync/async, REST/gRPC/events)
- Data flow direction
- Boundary definitions (bounded contexts, services)

Generate:
- Directory structure matching components
- Interface definitions for component boundaries
- Stub implementations with correct signatures
- Docker Compose or infrastructure skeleton if applicable

**UI Mockups/Wireframes**:
From the image, extract:
- Layout structure (grid, flex, sections)
- Components visible (forms, tables, cards, navigation)
- Interactive elements (buttons, inputs, dropdowns)
- Visual hierarchy and spacing

Generate:
- Component tree matching visual hierarchy
- HTML/JSX structure with semantic elements
- CSS/Tailwind classes for layout
- State management for interactive elements
- Placeholder data matching what's shown

**Data Model Diagrams**:
From the image, extract:
- Entity names and fields
- Relationships (one-to-many, many-to-many)
- Field types and constraints
- Example data values if shown

Generate:
- ORM models or database schema
- Migration files
- Repository/DAO interfaces
- Example seed data

**Flow/Sequence Diagrams**:
From the image, extract:
- Actor/participant names
- Step sequence and order
- Decision points and branches
- Data passed between steps

Generate:
- Function signatures for each step
- Control flow logic matching the diagram
- Error handling for failure branches
- Tests covering the happy path and key branches

### Step 5: Output

If $ARGUMENTS contains "--spec-only":
Generate a written specification document (no code) capturing everything the image communicates.

If $ARGUMENTS contains "--iterate":
Compare the screenshot against the current codebase. Identify:
- What matches the image (keep)
- What's missing from the image (add)
- What's wrong compared to the image (fix)
Suggest specific changes one slice at a time.

Otherwise, generate code + tests + a brief implementation summary.

### Recommended Image Set

Per ai-development-patterns Image Spec pattern, a complete visual spec includes:
- `architecture.png` — components + boundaries + ports
- `data-model.png` — fields + relationships + example payloads
- `ui-mock.png` — layout + key interactions
- `flow.png` — sequence of steps + decision points

### Anti-Patterns to Avoid

- **No text context**: Always pair images with tech stack, scope, and constraints
- **Too many slices**: Iterate on one visual element at a time
- **Overly complex diagrams**: Keep each image focused on one concern
- **Skipping validation**: Run generated code immediately and screenshot results for iteration