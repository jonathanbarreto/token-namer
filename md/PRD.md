# Product Requirements Document: Token Naming Tool

## Executive Summary

The Token Naming Tool is a web-based application that enables designers to generate consistent, structured design token names through an intuitive form-based interface. The tool enforces a four-segment naming convention (namespace/object/base/modifier) to ensure standardization across design systems, reducing naming inconsistencies and improving token management workflows.

**Product Vision**: Empower designers to create semantically correct, consistent token names that align with design system best practices, reducing cognitive load and manual errors in token creation.

---

## Product Goals & Objectives

### Primary Goals
1. **Standardization**: Enforce consistent token naming conventions across all generated tokens
2. **Efficiency**: Reduce time spent on manual token name creation and validation
3. **Education**: Provide contextual guidance to help designers understand naming conventions
4. **Accessibility**: Ensure the tool is usable by all designers regardless of technical expertise

### Success Criteria
- Users can generate valid token names in under 30 seconds
- 95%+ of generated names pass validation on first attempt
- Zero invalid token combinations are exported
- Tool is accessible and usable on mobile devices

---

## Target Users

### Primary Audience: Designers
- **Role**: Design system designers, UI/UX designers creating design tokens
- **Technical Level**: Varies from non-technical to technical
- **Pain Points**:
  - Inconsistent token naming across projects
  - Uncertainty about naming conventions
  - Manual validation of token names
  - Difficulty remembering allowed values for each segment

### Secondary Audience: Design System Teams
- Designers and developers working together on design systems
- Need for shared understanding of token naming conventions

---

## User Stories

### Core User Stories
1. **As a designer**, I want to generate token names through a simple form so that I don't have to remember naming conventions
2. **As a designer**, I want to see a live preview of my token name so that I can verify it before using it
3. **As a designer**, I want validation feedback so that I can correct errors immediately
4. **As a designer**, I want to copy token names in different formats so that I can use them in various tools
5. **As a designer**, I want preset suggestions so that I can quickly create common token combinations
6. **As a designer**, I want contextual help so that I understand what each field means
7. **As a designer**, I want to access my recently generated tokens so that I can reuse or modify them

### Advanced User Stories
8. **As a design system team**, I want to bulk generate token names from a CSV so that we can migrate existing tokens efficiently
9. **As a developer**, I want an API endpoint so that I can integrate token name generation into our build process

---

## Feature Requirements

### 1. Token Naming Form

**Description**: A form with four input fields that capture the token name segments.

**Functional Requirements**:
- **Namespace Field** (Required)
  - Type: Dropdown/Select
  - Options: `color`, `space`, `typography`, `radius`, `motion`
  - Validation: Must select a value before proceeding
  - Default: None (empty state)

- **Object Field** (Required)
  - Type: Dropdown/Select
  - Behavior: Options dynamically change based on selected namespace
  - Examples:
    - `color` namespace → `text`, `background`, `border`, `icon`
    - `space` namespace → `xs`, `sm`, `md`, `lg`, `xl`
    - `typography` namespace → `font-family`, `font-size`, `line-height`, `font-weight`
  - Validation: Must select a value; options must match namespace context

- **Base Field** (Required)
  - Type: Dropdown/Select
  - Options: Semantic intent values (e.g., `primary`, `secondary`, `accent`, `default`, `muted`)
  - Validation: Must select a value
  - Note: Values should be semantic, not visual (e.g., "primary" not "blue")

- **Modifier(s) Field** (Optional)
  - Type: Multi-select or tag input
  - Options: `hover`, `disabled`, `subtle`, `strong`, `active`, `focus`, etc.
  - Behavior: Allow multiple selections; display as tags/chips
  - Validation: Optional field; if selected, must be valid modifier values

**UI/UX Requirements**:
- Clear visual hierarchy with labels above each field
- Required fields marked with asterisk (*)
- Fields should be visually grouped together
- Form should be accessible via keyboard navigation
- Error states should be clearly indicated

**Acceptance Criteria**:
- [ ] All four fields are present and functional
- [ ] Object field updates when namespace changes
- [ ] Required fields prevent form submission when empty
- [ ] Modifier field supports multiple selections
- [ ] Form is keyboard accessible

---

### 2. Live Preview

**Description**: Real-time display of the generated token name as users make selections.

**Functional Requirements**:
- Display format: `namespace / object / base / modifier`
- Updates automatically on any field change
- Shows empty segments as placeholders when not filled
- Visual distinction between filled and empty segments
- Copy button integrated into preview area

**UI/UX Requirements**:
- Preview area should be prominent and easy to read
- Use monospace font for token name display
- Visual separator (slash `/`) between segments
- Empty segments shown as grayed-out placeholders (e.g., `namespace / _ / _ / _`)
- Smooth transitions when preview updates

**Acceptance Criteria**:
- [ ] Preview updates within 100ms of field change
- [ ] Preview accurately reflects current form state
- [ ] Empty segments are clearly indicated
- [ ] Preview is always visible (sticky or prominent placement)

---

### 3. Validation & Feedback

**Description**: Real-time validation with inline error messages and guidance.

**Functional Requirements**:
- **Required Field Validation**
  - Prevent submission if namespace, object, or base is empty
  - Show error message: "This field is required"

- **Disallowed Words Validation**
  - Block color values (e.g., "blue", "red", "#FF0000")
  - Block component names (e.g., "button", "card", "modal")
  - Block visual descriptors (e.g., "large", "small" in base field)
  - Show error message: "This value is not allowed. Use semantic terms instead."

- **Ordering Validation**
  - Enforce field completion order: namespace → object → base → modifier
  - Show guidance: "Please complete previous fields first"

- **Combination Validation**
  - Validate that object values are valid for selected namespace
  - Validate that modifier combinations make sense
  - Show warning for uncommon but valid combinations

**UI/UX Requirements**:
- Inline error messages appear below relevant fields
- Error states use red/error color scheme
- Warning states use yellow/warning color scheme
- Success states use green/success color scheme
- Error messages are clear and actionable
- Validation occurs on blur and on change (debounced)

**Acceptance Criteria**:
- [ ] All validation rules are enforced
- [ ] Error messages are clear and helpful
- [ ] Invalid combinations are prevented
- [ ] Validation feedback is immediate (< 300ms)
- [ ] Form cannot be submitted with invalid data

---

### 4. Export / Copy Options

**Description**: Multiple ways to copy and export generated token names.

**Functional Requirements**:
- **Copy to Clipboard**
  - Primary action button: "Copy Token Name"
  - Copies default format (slash-delimited)
  - Shows success feedback: "Copied!" toast/notification
  - Keyboard shortcut: Cmd/Ctrl + C when preview is focused

- **Format Options**
  - Slash-delimited (default): `color/text/primary/disabled`
  - Dot notation: `color.text.primary.disabled`
  - Underscore notation: `color_text_primary_disabled`
  - Format selector: Dropdown or toggle buttons

- **JSON Snippet Export**
  - Button: "Copy JSON"
  - Format:
    ```json
    {
      "name": "color/text/primary/disabled"
    }
  ```
  - Optional: Include additional metadata (namespace, object, base, modifiers as separate fields)

**UI/UX Requirements**:
- Copy buttons should be easily accessible
- Success feedback should be visible but non-intrusive
- Format selector should be near the preview
- All export options should be keyboard accessible

**Acceptance Criteria**:
- [ ] Copy to clipboard works in all supported browsers
- [ ] All format options generate correct output
- [ ] JSON export includes valid JSON structure
- [ ] Success feedback is shown after copy action
- [ ] Keyboard shortcuts work as expected

---

### 5. Preset Suggestions

**Description**: Context-aware suggestions for common token combinations.

**Functional Requirements**:
- **Namespace-Based Presets**
  - When namespace is selected, show common object/base/modifier combinations
  - Example for `color` namespace:
    - Quick picks: `text/primary`, `background/default`, `border/subtle`
    - Modifier suggestions: `hover`, `disabled`, `active`

- **Quick-Pick Interface**
  - Display preset chips/buttons below relevant fields
  - Clicking a preset fills in the corresponding field(s)
  - Presets should be visually distinct from manual input

- **Smart Suggestions**
  - Learn from user history (if available)
  - Show most common combinations first
  - Update suggestions based on current selections

**UI/UX Requirements**:
- Presets should appear below or near relevant fields
- Preset chips should be clearly clickable
- Visual distinction between presets and manual entry
- Presets should not interfere with manual input flow

**Acceptance Criteria**:
- [ ] Presets appear when namespace is selected
- [ ] Clicking preset fills appropriate fields
- [ ] Presets are relevant to selected namespace
- [ ] Presets don't block manual input

---

### 6. Definitions & Guidance

**Description**: Contextual help and educational content for each field.

**Functional Requirements**:
- **Field-Level Help**
  - Info icon (ℹ️) next to each field label
  - Tooltip or expandable help text on hover/click
  - Brief explanation of what the field represents

- **Help Content**
  - **Namespace**: "The category of the token (color, spacing, typography, etc.)"
  - **Object**: "What the token applies to (text, background, border, etc.)"
  - **Base**: "Semantic intent, not visual value (primary, secondary, not blue, red)"
  - **Modifier**: "Optional state or variation (hover, disabled, subtle, etc.)"

- **Examples Section**
  - Show good vs. bad examples
  - Explain why certain patterns are discouraged

**UI/UX Requirements**:
- Help icons should be subtle but discoverable
- Tooltips should be accessible (keyboard and screen reader)
- Help text should be concise (1-2 sentences)
- Examples should be clear and relevant

**Acceptance Criteria**:
- [ ] Help icons are present for all fields
- [ ] Tooltips are accessible and informative
- [ ] Help content explains field purpose clearly
- [ ] Examples demonstrate best practices

---

### 7. Responsive UI

**Description**: Tool works seamlessly across desktop and mobile devices.

**Functional Requirements**:
- **Desktop Experience** (≥ 768px)
  - Form fields in horizontal or grid layout
  - Preview area visible alongside form
  - All features accessible without scrolling

- **Mobile Experience** (< 768px)
  - Form fields stack vertically
  - Preview area above or below form
  - Touch-friendly button sizes (min 44x44px)
  - Mobile-optimized dropdowns (native select on iOS/Android)

**UI/UX Requirements**:
- Breakpoints: Mobile (< 768px), Tablet (768px - 1024px), Desktop (> 1024px)
- Form fields should be full-width on mobile
- Labels should be above inputs on mobile
- Touch targets should be appropriately sized
- No horizontal scrolling on any device

**Acceptance Criteria**:
- [ ] Tool is fully functional on mobile devices
- [ ] Form is usable in portrait and landscape orientations
- [ ] All interactive elements are touch-friendly
- [ ] No layout breaks at any screen size
- [ ] Text is readable without zooming

---

### 8. History / Recently Generated

**Description**: Short list of recently generated token names for quick reuse.

**Functional Requirements**:
- **History Storage**
  - Store last 5-10 generated token names
  - Persist in browser localStorage
  - Include timestamp (optional, for sorting)

- **History Display**
  - Section: "Recently Generated"
  - List format with token name and copy button
  - Click to populate form with that token's values
  - Clear history button

- **History Management**
  - Remove individual items
  - Clear all history
  - History persists across sessions

**UI/UX Requirements**:
- History section should be collapsible/expandable
- History items should be clearly clickable
- Visual distinction between history and current form
- History should not clutter the main interface

**Acceptance Criteria**:
- [ ] History stores last 5-10 tokens
- [ ] History persists across browser sessions
- [ ] Clicking history item populates form
- [ ] History can be cleared
- [ ] History doesn't interfere with new token creation

---

### 9. Theme & Accessibility

**Description**: Light/dark theme support and full accessibility compliance.

**Functional Requirements**:
- **Theme Toggle**
  - Toggle button in header/settings
  - Light theme (default)
  - Dark theme
  - Theme preference saved in localStorage
  - Respects system preference (prefers-color-scheme)

- **Accessibility Requirements**
  - **Keyboard Navigation**: All interactive elements accessible via keyboard
  - **Focus States**: Clear visible focus indicators
  - **ARIA Labels**: Proper labels for screen readers
  - **Color Contrast**: WCAG AA compliance (4.5:1 for text)
  - **Screen Reader Support**: Semantic HTML, proper headings, alt text

**UI/UX Requirements**:
- Theme toggle should be easily accessible
- Focus indicators should be visible (2px outline minimum)
- Color contrast should meet WCAG standards
- All form fields should have associated labels
- Error messages should be announced to screen readers

**Acceptance Criteria**:
- [ ] Theme toggle works and persists preference
- [ ] All functionality is keyboard accessible
- [ ] Screen reader announces form state and errors
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible on all interactive elements

---

### 10. Documentation / Examples Page

**Description**: Comprehensive help page with naming conventions and examples.

**Functional Requirements**:
- **Page Content**
  - Naming conventions overview
  - Good vs. bad examples
  - Rules for each segment (namespace, object, base, modifier)
  - Export format examples
  - Common patterns and use cases

- **Navigation**
  - Link from main tool: "Help" or "Documentation"
  - Accessible from header/footer
  - Can be opened in new tab

- **Content Structure**
  - Introduction to token naming
  - Segment-by-segment guide
  - Examples gallery
  - FAQ section
  - Best practices

**UI/UX Requirements**:
- Documentation should be well-organized with clear headings
- Examples should be highlighted/code-formatted
- Page should be searchable (optional)
- Should match main tool's design system

**Acceptance Criteria**:
- [ ] Documentation page is accessible from main tool
- [ ] All naming conventions are documented
- [ ] Examples are clear and relevant
- [ ] Documentation is easy to navigate
- [ ] Content is up-to-date and accurate

---

### 11. Optional: Bulk Name Generator

**Description**: Upload CSV to generate multiple token names at once.

**Functional Requirements**:
- **CSV Upload**
  - File input for CSV upload
  - Accept CSV format with columns: description, namespace, object, base, modifier
  - Validate CSV structure before processing
  - Show upload progress

- **Mapping Interface**
  - Map CSV columns to token segments
  - Preview mapped data before generation
  - Allow manual corrections

- **Bulk Generation**
  - Generate token names for all rows
  - Show validation errors for invalid rows
  - Export results as CSV
  - Include original data + generated name

**UI/UX Requirements**:
- Upload area should be drag-and-drop enabled
- Preview should show sample rows
- Error handling should be clear
- Export should be prominent

**Acceptance Criteria**:
- [ ] CSV upload works with valid files
- [ ] Column mapping is intuitive
- [ ] Invalid rows are flagged
- [ ] Results can be exported as CSV
- [ ] Bulk generation handles 100+ rows efficiently

---

### 12. Optional: API Endpoint

**Description**: REST API for programmatic token name generation.

**Functional Requirements**:
- **Endpoint**: `POST /api/generate`
- **Request Format**:
  ```json
  {
    "namespace": "color",
    "object": "text",
    "base": "primary",
    "modifiers": ["disabled"]
  }
  ```

- **Response Format**:
  ```json
  {
    "name": "color/text/primary/disabled",
    "formats": {
      "slash": "color/text/primary/disabled",
      "dot": "color.text.primary.disabled",
      "underscore": "color_text_primary_disabled"
    },
    "valid": true
  }
  ```

- **Error Response**:
  ```json
  {
    "error": "Validation failed",
    "details": {
      "field": "base",
      "message": "Value 'blue' is not allowed. Use semantic terms."
    },
    "valid": false
  }
  ```

**Technical Requirements**:
- RESTful API design
- JSON request/response
- Input validation
- Error handling
- Rate limiting (optional)
- CORS support for web integration

**Acceptance Criteria**:
- [ ] API accepts valid JSON requests
- [ ] API returns correct token name formats
- [ ] API validates input and returns errors
- [ ] API handles edge cases gracefully
- [ ] API documentation is available

---

## Technical Requirements

### Frontend Stack
- **Framework**: Vanilla JavaScript (or lightweight framework)
- **Build Tool**: Vite (already in project)
- **Styling**: CSS (existing styles.css structure)
- **Storage**: localStorage for history and preferences

### Data Structure
```javascript
{
  namespace: string,      // Required: "color" | "space" | "typography" | "radius" | "motion"
  object: string,          // Required: namespace-dependent
  base: string,            // Required: "primary" | "secondary" | "accent" | "default" | "muted"
  modifiers: string[]      // Optional: ["hover", "disabled", "subtle", "strong", ...]
}
```

### Validation Rules
- **Disallowed Words**: Color values, component names, visual descriptors
- **Required Fields**: namespace, object, base
- **Field Dependencies**: object options depend on namespace
- **Format Validation**: Ensure segments don't contain invalid characters

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## User Experience Flow

### Primary Flow: Generate Token Name
1. User lands on tool page
2. User selects namespace from dropdown
3. Object dropdown populates with namespace-specific options
4. User selects object
5. User selects base
6. User optionally selects modifiers
7. Preview updates in real-time
8. User clicks "Copy Token Name"
9. Success feedback shown
10. Token name added to history

### Secondary Flow: Use Preset
1. User selects namespace
2. Preset suggestions appear
3. User clicks preset chip
4. Form auto-fills with preset values
5. Preview updates
6. User can modify or copy

### Error Flow: Validation
1. User attempts invalid combination
2. Error message appears inline
3. User corrects error
4. Error message clears
5. Form becomes valid

---

## Success Metrics

### Usage Metrics
- Number of token names generated per day/week
- Average time to generate a token name
- Most common namespace/object/base combinations
- Export format preferences

### Quality Metrics
- Percentage of tokens that pass validation on first attempt
- Number of validation errors per session
- User error rate (invalid tokens generated)

### Engagement Metrics
- Return user rate
- History usage (clicking previous tokens)
- Preset usage rate
- Documentation page views

### Accessibility Metrics
- Keyboard-only usage success rate
- Screen reader compatibility score
- Color contrast compliance

---

## Out of Scope

### Explicitly Excluded (v1.0)
- User accounts or authentication
- Cloud storage/sync of tokens
- Integration with design tools (Figma, Sketch)
- Token value management (only naming, not values)
- Team collaboration features
- Token library/registry
- Version control for tokens

### Future Considerations
- Integration with design tools via plugins
- Team workspaces and shared token libraries
- Token value suggestions based on name
- AI-powered name suggestions
- Token name linting in CI/CD

---

## Future Enhancements

### Phase 2 Features
- Token value editor (assign values to generated names)
- Token library/registry
- Export to design tool formats (Figma variables, CSS custom properties)
- Team collaboration features

### Phase 3 Features
- Design tool plugins (Figma, Sketch)
- CI/CD integration
- Token name linting
- Analytics dashboard

---

## Implementation Notes

### File Structure
```
/Users/jonathanbarreto/Desktop/Projects/Token Namer/
├── index.html (existing)
├── styles.css (existing)
├── package.json (existing)
├── PRD.md (this file)
├── src/
│   ├── app.js (main application logic)
│   ├── validation.js (validation rules)
│   ├── export.js (export functionality)
│   ├── history.js (history management)
│   └── presets.js (preset suggestions)
└── docs/
    └── documentation.html (help page)
```

### Key Dependencies
- No external dependencies required for core features
- Optional: Consider lightweight libraries for:
  - CSV parsing (for bulk generator)
  - Toast notifications (for copy feedback)
  - Date formatting (for history timestamps)

### Performance Considerations
- Debounce preview updates (100ms)
- Lazy load documentation page
- Optimize localStorage reads/writes
- Minimize re-renders on form changes

---

## Appendix

### Token Naming Convention Reference

**Format**: `namespace / object / base / modifier`

**Examples**:
- `color / text / primary / hover`
- `space / md / default / _`
- `typography / font-size / body / _`
- `radius / button / default / _`
- `motion / duration / fast / _`

### Allowed Values Reference

**Namespaces**: `color`, `space`, `typography`, `radius`, `motion`

**Objects (by namespace)**:
- `color`: `text`, `background`, `border`, `icon`
- `space`: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- `typography`: `font-family`, `font-size`, `line-height`, `font-weight`, `letter-spacing`
- `radius`: `button`, `card`, `input`, `badge`
- `motion`: `duration`, `easing`, `delay`

**Bases**: `primary`, `secondary`, `accent`, `default`, `muted`, `subtle`, `strong`

**Modifiers**: `hover`, `active`, `focus`, `disabled`, `subtle`, `strong`, `muted`

### Disallowed Words
- Color values: `blue`, `red`, `green`, `#FF0000`, `rgb(255,0,0)`, etc.
- Component names: `button`, `card`, `modal`, `dropdown`, etc.
- Visual descriptors in base: `large`, `small`, `big`, `tiny`, etc.

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Draft - Ready for Review
