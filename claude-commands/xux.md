# /xux - User Experience & Frontend

## Purpose
Optimize user experience, conduct frontend testing, and ensure accessibility compliance with SpecDriven AI methodology integration.

## Usage

### User Journey Testing
```bash
/xux --test <journey>             # Test complete user journeys and flows
/xux --flow <scenario>            # Analyze user flow optimization
/xux --conversion <funnel>        # Conversion funnel analysis and optimization
/xux --personas <validation>      # Validate design against user personas
```

### Accessibility Compliance
```bash
/xux --accessibility <audit>      # Comprehensive accessibility audit
/xux --wcag <level>               # WCAG compliance checking (A, AA, AAA)
/xux --screen-reader <test>       # Screen reader compatibility testing
/xux --contrast <validation>      # Color contrast validation
```

### Frontend Performance
```bash
/xux --performance <metrics>      # Frontend performance analysis
/xux --lighthouse <audit>         # Google Lighthouse audit automation
/xux --core-vitals <monitoring>   # Core Web Vitals monitoring
/xux --bundle <analysis>          # JavaScript bundle analysis
```

### Visual Testing
```bash
/xux --regression <baseline>      # Visual regression testing
/xux --cross-browser <matrix>     # Cross-browser compatibility testing
/xux --responsive <breakpoints>   # Responsive design validation
/xux --component <library>        # Component library testing
```

### User Behavior Analytics
```bash
/xux --analytics <tracking>       # User behavior tracking setup
/xux --heatmaps <analysis>        # User interaction heatmap analysis
/xux --session <recording>        # User session recording analysis
/xux --feedback <collection>      # User feedback collection and analysis
```

### UX Optimization
```bash
/xux --optimization <recommendations> # UX optimization suggestions
/xux --ab-test <experiment>           # A/B testing setup and analysis
/xux --usability <testing>            # Usability testing procedures
/xux --design-system <validation>     # Design system compliance checking
```

## Examples

### Comprehensive Accessibility Audit
```bash
/xux --accessibility "full-site-audit"
# Creates: reports/accessibility-audit-2024-01.md with WCAG compliance analysis
```

### Performance Optimization
```bash
/xux --performance "core-vitals-analysis"
# Creates: reports/performance-analysis.md with optimization recommendations
```

### User Journey Validation
```bash
/xux --test "checkout-flow"
# Creates: tests/user-journeys/checkout-flow/ with automated test scenarios
```

### Visual Regression Testing
```bash
/xux --regression "component-library-v2"
# Creates: visual-tests/regression/ with baseline comparisons
```

## SpecDriven AI Integration

### UX Specifications
- Links UX to specifications: `{#ux1a authority=developer}`
- Traces user requirements to implementations
- Validates designs against user stories

### Dual Coverage
- **Feature Coverage**: All user features have UX validation
- **Accessibility Coverage**: All interfaces meet accessibility standards

### Traceability
- Links UX tests to user story specifications
- Traces performance issues to user experience
- Connects analytics to user requirement validation

## UX Testing Framework

### User Journey Categories
- **Critical Paths**: Core business flow testing
- **Edge Cases**: Error handling and validation
- **Accessibility**: Assistive technology compatibility
- **Performance**: Loading and interaction speed

### Testing Methodologies
- **Automated Testing**: Playwright, Cypress, Selenium
- **Visual Testing**: Percy, Chromatic, BackstopJS
- **Performance Testing**: Lighthouse CI, WebPageTest
- **Accessibility Testing**: axe-core, WAVE, Pa11y

### Metrics & KPIs
- **Core Web Vitals**: LCP, FID, CLS
- **Accessibility Score**: WCAG compliance percentage
- **User Satisfaction**: NPS, CSAT, task completion rates
- **Conversion Metrics**: Funnel completion, abandonment rates

## Design System Integration

### Component Validation
- **Visual Consistency**: Design token compliance
- **Interaction Patterns**: Consistent behavior across components
- **Responsive Behavior**: Breakpoint validation
- **Accessibility Standards**: Component-level accessibility

### Documentation
- **Usage Guidelines**: Component implementation guides
- **Accessibility Notes**: Component-specific accessibility requirements
- **Browser Support**: Compatibility matrices
- **Performance Impact**: Component performance characteristics

## Browser & Device Support

### Desktop Browsers
- **Chrome**: Latest 2 versions + 1 previous major
- **Firefox**: Latest 2 versions + ESR
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

### Mobile Devices
- **iOS Safari**: Latest 2 versions
- **Chrome Mobile**: Latest 2 versions
- **Samsung Internet**: Latest version
- **Device Testing**: Physical device validation

### Assistive Technologies
- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Voice Control**: Dragon NaturallySpeaking
- **Switch Navigation**: Hardware switch support
- **High Contrast**: Windows High Contrast mode

## Integration Points

- **Design tools**: Figma, Sketch, Adobe XD integration
- **Analytics platforms**: Google Analytics, Mixpanel, Amplitude
- **Testing frameworks**: Jest, Playwright, Cypress
- **CI/CD pipelines**: Automated testing and reporting
- **Monitoring**: Real User Monitoring (RUM) integration

## Output Formats

- **Test reports**: Automated testing results and recommendations
- **Accessibility audits**: WCAG compliance reports with remediation steps
- **Performance reports**: Core Web Vitals analysis and optimization guides
- **User journey maps**: Visual flow documentation with test coverage
- **Analytics dashboards**: User behavior insights and conversion metrics