<!--
SYNC IMPACT REPORT - Constitution Update
Version: 0.0.0 → 1.0.0
Change Type: MAJOR (Initial constitution establishment)

Modified Principles:
- NEW: I. Mobile-First Responsive Design
- NEW: II. Data Integrity & Consistency
- NEW: III. Modular Feature Architecture
- NEW: IV. Quality Assurance & Testing
- NEW: V. Performance & Accessibility

Added Sections:
- Technical Standards
- Development Workflow

Templates Status:
✅ plan-template.md - Constitution Check section compatible
✅ spec-template.md - User story structure aligns with modular principles
✅ tasks-template.md - Task organization supports feature modularity

Follow-up Actions:
- None required for initial constitution
-->

# Recipe Planner Constitution

## Core Principles

### I. Mobile-First Responsive Design

All user interfaces MUST be designed and implemented with mobile devices as the primary target, then progressively enhanced for tablet and desktop viewports. Responsive design is NON-NEGOTIABLE.

**Rules**:
- Touch-friendly UI elements with minimum 44×44px target sizes
- Breakpoints MUST support mobile (320px+), tablet (768px+), and desktop (1024px+)
- Testing on actual mobile devices or emulators required before feature completion
- No horizontal scrolling on any viewport size
- Performance budget: <3s initial load on 3G networks

**Rationale**: The majority of users will access recipe management on mobile devices while shopping or cooking, making mobile-first design essential for usability and adoption.

### II. Data Integrity & Consistency

Recipe data, meal plans, and grocery lists MUST maintain referential integrity across all operations. Data inconsistencies are considered critical bugs.

**Rules**:
- Recipe modifications MUST update dependent meal plans and grocery lists
- Deletion operations MUST cascade or block with clear user warnings
- All data mutations MUST be atomic (succeed completely or rollback)
- Ingredient quantities MUST have unit validation and conversion accuracy
- User data MUST be validated on both client and server sides

**Rationale**: Users depend on accurate recipe data for meal planning and shopping; data inconsistencies lead to incorrect grocery lists and failed meal preparations.

### III. Modular Feature Architecture

The application MUST be structured into independent, loosely-coupled feature modules: Recipes, Meal Plans, and Grocery Lists. Each module MUST be developable, testable, and deployable independently.

**Rules**:
- Clear separation between Recipe Management, Meal Planning, and Grocery List modules
- Shared utilities (e.g., unit conversion, date handling) in a common library
- Module communication through well-defined interfaces/APIs
- Each module MUST have its own test suite
- No circular dependencies between feature modules

**Rationale**: Modular architecture enables parallel development, easier maintenance, and independent testing of complex features without affecting the entire system.

### IV. Quality Assurance & Testing

Automated testing is REQUIRED for all core features. User scenarios from specifications MUST have corresponding automated tests before implementation is considered complete.

**Rules**:
- Unit tests REQUIRED for business logic (recipe calculations, unit conversions, meal plan generation)
- Integration tests REQUIRED for data flow between modules (recipe → meal plan → grocery list)
- End-to-end tests REQUIRED for critical user journeys (create recipe, plan meals, generate grocery list)
- Visual regression tests RECOMMENDED for responsive UI components
- Test coverage MUST be ≥80% for core business logic

**Rationale**: Recipe and meal planning features involve complex calculations and data relationships; automated testing ensures reliability and prevents regressions when adding new features.

### V. Performance & Accessibility

The application MUST be performant on mid-range mobile devices and accessible to users with disabilities, following WCAG 2.1 Level AA standards as a minimum.

**Rules**:
- Page load time MUST be <3s on 3G, <1s on 4G/WiFi
- Time to Interactive (TTI) MUST be <5s on 3G
- Image optimization REQUIRED (WebP with fallbacks, lazy loading)
- Semantic HTML MUST be used for all content
- ARIA labels REQUIRED for interactive elements and dynamic content
- Keyboard navigation MUST be fully supported
- Color contrast MUST meet WCAG AA standards (4.5:1 for normal text)

**Rationale**: Users access recipes in various contexts (kitchen, grocery store) on different devices and with varying abilities; performance and accessibility ensure the app is usable by everyone.

## Technical Standards

### Technology Stack
- **Frontend**: Modern JavaScript framework (React, Vue, or Svelte) with TypeScript
- **Backend**: RESTful API or GraphQL (Node.js, Python, or similar)
- **Database**: Relational database (PostgreSQL, MySQL) for structured recipe and meal plan data
- **Authentication**: Secure user authentication (OAuth 2.0, JWT)
- **Hosting**: Cloud platform with CDN for static assets
- **Version Control**: Git with feature branch workflow

### API Design
- RESTful conventions or GraphQL schema design
- Versioned API endpoints (e.g., `/api/v1/recipes`)
- Comprehensive error messages with actionable guidance
- Rate limiting and authentication on all protected endpoints
- API documentation auto-generated from code (OpenAPI/Swagger or GraphQL schema)

### Code Quality
- Linting REQUIRED (ESLint, Prettier, or language-specific tools)
- Type safety REQUIRED (TypeScript, Python type hints, or equivalent)
- Code review REQUIRED for all pull requests
- No commented-out code in production branches
- Functions MUST be <50 lines; classes MUST be <500 lines (refactor if exceeded)

### Security
- Input sanitization for all user-generated content
- SQL injection prevention (parameterized queries, ORM)
- XSS prevention (Content Security Policy, output encoding)
- Authentication tokens stored securely (httpOnly cookies or secure storage)
- Regular dependency updates for security patches

## Development Workflow

### Feature Development Process
1. Feature specification created using `.specify/templates/spec-template.md`
2. Implementation plan generated via `/speckit.plan` command
3. Constitution compliance verified before starting development
4. Feature branch created from naming convention: `###-feature-name`
5. Tests written and approved before implementation (when testing required)
6. Implementation with passing tests
7. Code review with constitution compliance check
8. Merge to main branch after approval

### Code Review Requirements
- At least one approval REQUIRED before merge
- Reviewer MUST verify constitution compliance
- All automated tests MUST pass
- No unresolved comments or requested changes
- Responsive design verified on mobile, tablet, and desktop

### Quality Gates
- All tests passing (unit, integration, e2e where applicable)
- Linting and formatting checks passing
- No critical or high-severity security vulnerabilities
- Performance budgets met (lighthouse score ≥90 for performance and accessibility)
- Documentation updated for new features or API changes

### Deployment Process
- Staging deployment REQUIRED before production
- Smoke tests on staging environment
- Database migrations tested and reversible
- Rollback plan documented for each deployment
- Production deployment during low-traffic periods when possible

## Governance

This constitution supersedes all other development practices and decisions. All features, code, and architectural decisions MUST comply with these principles.

### Amendment Process
- Amendments REQUIRE documentation of rationale and impact analysis
- Version bumping follows semantic versioning:
  - **MAJOR**: Breaking changes to principles, removal of core rules
  - **MINOR**: New principles added, substantial clarifications
  - **PATCH**: Wording improvements, typo fixes, minor clarifications
- Amendments MUST include updates to dependent template files
- Constitution changes REQUIRE team review and approval

### Compliance & Enforcement
- All pull requests MUST include a constitution compliance checklist
- Code reviewers MUST verify adherence to principles
- Feature specifications MUST reference relevant constitutional principles
- Non-compliance MUST be justified in writing or the change rejected
- Constitution is a living document; feedback and improvements encouraged

### Related Guidance
- Feature planning: Use `.specify/templates/plan-template.md` and `/speckit.plan` command
- Specifications: Use `.specify/templates/spec-template.md`
- Task breakdown: Use `.specify/templates/tasks-template.md` and `/speckit.tasks` command

**Version**: 1.0.0 | **Ratified**: 2026-02-10 | **Last Amended**: 2026-02-10
