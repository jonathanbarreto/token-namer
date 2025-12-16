# Token Namer Tool — PRD (Revised v2)

## Summary
A web-based **token naming tool** that helps people generate consistent design token names using **three naming frameworks**, one per token tier:
- **Primitive**
- **Semantic**
- **Component**

The tool uses a **form-based interface** with clearly labeled **Prefix** and **Token fields** groups (always visible; no accordions). Users select terms from combobox inputs populated with predefined vocabulary and can add custom terms in any field.

**Primary output:** a **live preview** of the token name (path) that users can **copy**.

**Persistence:** The tool stores generated token names in browser localStorage as history (last 10 items). Custom terms are session-only and never persisted.

---

## Goals
- Make token names consistent without requiring users to memorize naming rules.
- Provide real-time validation with clear, actionable error messages.
- Keep the app lightweight: **assemble → validate → preview → copy**.
- Enable quick reuse of common token patterns through history and presets.

**Future goal:** Migrate to a schema-driven architecture using JSON/YAML configuration files for flexible vocabulary management.

## Non-goals (v1)
- Server-side storage or database persistence.
- Persisting custom terms beyond the current session (they are session-only).
- Applying tokens to design tools (e.g., Figma) or syncing tokens to code repos.
- Admin UI for managing vocabulary (currently hardcoded; future: configuration via JSON/YAML files).
- Export formats beyond copying the preview string or JSON representation.

---

## Users
- Designers and content designers naming tokens
- Engineers implementing tokens
- Design system maintainers curating naming rules and vocabulary

---

## Product scope

### Frameworks (tabs)
The tool has **3 tabs**, each mapped to a naming framework:
1. Primitive
2. Semantic
3. Component

Each tab maintains its own state and field configuration:
- Field structure (order, requiredness) - currently hardcoded, future: schema-driven
- Allowed vocabulary per field - currently from hardcoded `vocabulary.js`
- Framework-specific validation rules

### Shared UI pattern (all tabs)

The interface uses a **section-based form layout** with the following structure:

**Layout structure:**
- **Single-column form** with always-visible field groups
- **Live preview card** displayed prominently at the top
- **Field groups** for Prefix and Token fields (framework slots)
- Responsive design: maintains single-column layout across screen sizes

**Preview card (top section):**
- **Live preview display**: Shows generated token name with selected format separator
- **Category pills**: Visual breakdown showing each segment with its label (e.g., "Namespace: color", "Category: primary")
- **Format selector**: Dropdown to choose separator format (Slash, Underscore, Dot)
  - Default: Slash (`/`)
  - Updates preview immediately on change
- **Status message**: Shows validation state (error/warning/success messages)
  - "Ready to copy" when valid
  - Most critical error message when invalid
- **Copy buttons**: Two buttons to copy the token name or full JSON representation
  - Disabled when validation errors exist
  - Toast notification on successful copy
  - Keyboard shortcut: Cmd/Ctrl+C when preview area is focused

**Prefix section:**
- System / Theme / Prefix domain are optional fields (always visible)
- **Combobox inputs**: Autocomplete-enabled text inputs for each prefix field
  - Shows vocabulary suggestions as user types
  - Allows custom input (free text)
  - Displays descriptions via tooltips

**Core fields section (framework slots):**
- **Framework-specific fields**:
  - **Primitive**: Category (required), Set (required), Step (required), Variant (optional)
  - **Semantic**: Domain (required), Object (required), Role (required), Context (optional), State (optional), Emphasis (optional)
  - **Component**: Component (required), Part (required), Property (required), Variant (optional), State (optional), Context (optional)
- **Required fields**: Always visible with required indicator (*)
- **Optional fields**: Always visible (leave blank to omit)
- **Combobox inputs**: Autocomplete-enabled for all fields
  - Vocabulary filtered based on namespace and other field values
  - Conditional vocabulary (e.g., motion bases vary by object type)

**Combobox behavior:**
- **Autocomplete**: Filters vocabulary as user types (case-insensitive)
- **Keyboard navigation**: Arrow keys to navigate suggestions, Enter to select, Escape to close
- **Custom input**: All fields allow free-text entry (not restricted to vocabulary)
- **Descriptions**: Term descriptions shown via tooltips/titles on hover
- **Validation**: Real-time validation as user types

**Validation display:**
- **Inline messages**: Each field shows its own error/warning message below the input
- **Status area**: Preview card shows overall status and most critical error
- **Visual indicators**: Error fields show red border and error styling
- **Copy blocking**: Copy buttons disabled when validation errors exist

**Visual states:**
- **Empty field**: Placeholder text shown in combobox
- **Filled field**: Value displayed in combobox input
- **Error state**: Red border, error message below field
- **Focus state**: Standard browser focus styles
- **Disabled state**: Copy buttons grayed out when errors exist

---

## Framework examples

To illustrate how the three frameworks differ, here are concrete examples:

### Primitive framework

Primitive tokens define the raw, literal values of the system. They are the lowest level of abstraction and must not encode meaning, usage, state, or component intent.

**Purpose:**
Primitive tokens exist to:
- Provide stable, reusable value ramps
- Enable deterministic aliasing into semantic and component tokens
- Act as the single source of truth for values across tools and platforms

**Core Primitive Naming Framework:**

**Structure:**
```
<category>/<set>/<step>/<variant?>
```

**Field structure:**
- Category (required): e.g., `color`, `space`, `size`, `radius`, `border-width`, `opacity`, `shadow`, `blur`, `font-family`, `font-size`, `line-height`, `font-weight`, `letter-spacing`, `duration`, `easing`, `layer`, `breakpoint`
- Set (required): Category-specific (e.g., hue names for color; `core` for most others)
- Step (required): Category-specific numeric step system
- Variant (optional): Category-specific (e.g., `A20` for alpha, `compact` for density primitives, etc.)

**JSON Storage Model:**
- Store segments as nested JSON objects (groups), not as a single slash-delimited key string
- Groups are JSON objects without `$value`
- Tokens are objects with `$value`
- Optional variants under a step: if you need both "base" and "variants" under the same step, use the reserved `$root` token inside the group

**Character Restrictions:**
- Token + group names must not start with `$`
- Names must not contain `{`, `}`, or `.`

**Type Requirements:**
- Every token must have a `$type` available (on the token or inherited from a parent group)
- Tools must not guess types

**Example token names:**
- `color/blue/500`
- `color/blue/500/A20` (with alpha variant)
- `space/8`
- `size/24`
- `radius/4`
- `font-size/16`
- `duration/200`
- `easing/standard`

### Semantic framework

Semantic tokens describe the intended use or context of a value rather than the raw value itself. They reside in the middle layer of abstraction, mapping intent (like "action" or "surface") to specific primitive values.

**Purpose:**
Semantic tokens exist to:
- Provide meaning and intent to raw values (e.g., `color/red/600` becomes `border/error`)
- Enable theming (e.g., light/dark mode) by remapping aliases without changing components
- Enforce consistent application of design decisions across different components

**Core Semantic Naming Framework:**

**Structure:**
```
<domain>/<object>/<role>/<context?>/<state?>/<emphasis?>
```

**Field structure:**
- Domain (required): e.g., `surface`, `content`, `separator`, `action`, `link`, `focus`, `status`, `toggle`, `range`, `overlay`, `accent`, `constant`, `type`, `space`, `size`, `radius`, `border-width`, `shadow`
- Object (required): Domain-specific object (varies by domain - see Controlled vocabulary section)
- Role (required): Categorical meaning (e.g., `primary`, `secondary`, `default`, `subtle`)
- Context (optional): Rendering context (e.g., `inverse`, `on-media`, `on-light-media`, `on-accent`)
- State (optional): Interaction/condition changes (e.g., `default`, `hover`, `pressed`, `selected`, `active`, `disabled`, `focus`, `invalid`, `visited`, `loading`)
- Emphasis (optional): Visual strength ladder (e.g., `weakest`, `weaker`, `weak`, `default`, `strong`, `stronger`, `strongest`)

**Rules:**
- Domain-leading is non-negotiable: the first segment communicates usage, not data type
- Role is categorical (meaning), not intensity. Don't use "strong/weak/muted" as roles if you keep an emphasis ladder
- Context ≠ role: use `<context>` only when the same role must adapt to a known rendering context (media, inverse, accent)
- State only for interaction/condition changes (hover/pressed/disabled/etc.). Don't invent "focused" as a role if it's a state
- Emphasis is optional and should be used sparingly (only where you truly need a ladder). Most semantic systems should ship without it
- Composite tokens must be backed by leaf variables: the "composite" is a contract name (often a style), and its properties are variables

**Example token names:**
- `surface/background/default`
- `content/text/primary/inverse`
- `action/bg/primary/hover`
- `status/positive/bg/default`
- `type/body/md/regular`
- `space/component/padding/default/md`

### Component framework

Component tokens are specific to UI components, describing their styling properties. They provide stable override points for component anatomy that needs explicit control.

**Core Component Naming Framework:**

**Structure:**
```
component/<component>/<part>/<property>/<variant?>/<state?>/<context?>
```

**Field structure:**
- Component (required): Industry-standard component name in kebab-case (e.g., `button`, `text-field`, `checkbox`, `radio`, `switch`, `slider`, `tabs`, `nav-item`, `card`, `modal`, `tooltip`, `toast`)
- Part (required): Component part (e.g., `container`, `field`, `input`, `label`, `helper-text`, `placeholder`, `icon`, `leading-icon`, `trailing-icon`, `border`, `divider`, `focus-ring`, `track`, `fill`, `thumb`, `handle`, `indicator`, `header`, `body`, `footer`, `media`, `overlay`, `scrim`, `item`, `selection`)
- Property (required): Property type (e.g., `bg`, `text`, `icon`, `border-color`, `border-width`, `radius`, `shadow`, `opacity`, `padding-x`, `padding-y`, `gap`, `min-height`, `width`, `height`)
- Variant (optional): Component styling variant (e.g., `primary`, `secondary`, `tertiary`, `subtle`, `outline`, `ghost`, `destructive`, `success`, `warning`, `danger`, `info`, `compact`, `spacious`) — only when the component meaningfully supports variants
- State (optional): Interaction/condition state (e.g., `default`, `hover`, `pressed`, `selected`, `active`, `disabled`, `focus`, `invalid`, `visited`, `loading`, `expanded`, `checked`, `indeterminate`)
- Context (optional): Rendering context (e.g., `inverse`, `on-media`, `on-light-media`, `on-accent`)

**Rules:**
- Use variant for component styling variants (e.g., primary/secondary, outline/ghost, compact/spacious). If there's no meaningful variant, omit it
- Default behavior: component tokens should alias semantic tokens; use component tokens only for stable override points or component anatomy that needs explicit control
- DTCG JSON-safe naming: no segment starts with `$`; no `.`, `{`, `}` in any segment
- Token vs group collision: if you need a base value and nested state keys under the same node, store the base as `$root` in JSON and keep state variants as siblings. (Figma names omit `$root`.)
- Avoid over-tokenizing: don't create component tokens for every value—start with high-impact properties (bg/text/border/focus/shadow/radius) and only add more when you have real theming needs

**Example token names:**
- `component/button/container/bg/primary/default`
- `component/button/label/text/primary/hover`
- `component/text-field/field/border-color/invalid`
- `component/card/container/radius`
- `component/modal/scrim/bg`

---

## Naming rules (new context)

### 1) Live preview separators (user-selected)
- Between **path segments** (field outputs), the user can choose from:
  - `/` (Slash) - default
  - `_` (Underscore)
  - `.` (Dot)
- The separator selection is **UI state** and applies to the current preview (and copy output).
- Format can be changed via dropdown selector in the preview card.

Examples:
- Semantic: `surface/background/default` (slash format), `surface_background_default` (underscore format), `surface.background.default` (dot format)
- Semantic: `action/bg/primary/hover` (slash format), `action_bg_primary_hover` (underscore format), `action.bg.primary.hover` (dot format)
- Semantic: `content/text/primary/inverse` (slash format), `content_text_primary_inverse` (underscore format), `content.text.primary.inverse` (dot format)
- Component: `component/button/container/bg/primary/default` (slash format), `component_button_container_bg_primary_default` (underscore format), `component.button.container.bg.primary.default` (dot format)
- Component: `component/text-field/field/border-color/invalid` (slash format), `component_text-field_field_border-color_invalid` (underscore format), `component.text-field.field.border-color.invalid` (dot format)
- Primitive: `color/blue/500` (slash format), `color_blue_500` (underscore format), `color.blue.500` (dot format)
- Primitive: `space/8` (slash format), `space_8` (underscore format), `space.8` (dot format)
- Primitive: `radius/4` (slash format), `radius_4` (underscore format), `radius.4` (dot format)

### 2) Multi-word vocabulary terms
- Vocabulary terms that represent multiple words must use `-` between words **within a single segment**:
  - `focus-ring`, `on-surface`, `nav-item`

### 3) Source of truth
- The source of truth is **the ordered list of segment strings** (one per slot), not the preview string.
- The preview string is **derived** by joining segments with the user-selected separator.

---

## Requirements

### R1 — Schema-driven slot model
Each framework is defined by a schema that specifies:
- slot order, group (prefix/base/suffix)
- required vs optional slots
- allowed vocabulary source per slot
- whether a slot permits custom terms (`allow_custom_terms`)
- slot-level constraints (min/max length, regex/pattern)
- framework-level settings (case rules, reserved terms)

**Acceptance criteria**
- Updating the schema in the config store changes slot rendering and validation after refresh.
- Slots render in the correct order and group every time.

---

### R2 — Vocabulary lookup (JSON/YAML configuration)
Vocabulary is stored in JSON or YAML configuration files within the codebase.

**Configuration storage:**
- Allowed vocabulary per slot
- Term definitions/descriptions
- Term status (active/hidden/deprecated)

**Important distinction:**
- Configuration files (JSON/YAML) contain only predefined vocabulary terms
- Custom terms entered by users are session-only and never persisted to configuration files
- Custom terms exist only in runtime/session state and are lost on page refresh

**Acceptance criteria**
- Users see term descriptions on node cards.
- Deprecated/hidden terms behave according to status rules (see R7).
- Configuration files can be updated without requiring external services.

---

### R3 — Selection and assembly behavior

**Combobox input model:**
- All fields use combobox (autocomplete-enabled text input) components
- Users type to filter vocabulary suggestions or enter custom values
- Focus follows standard form field navigation (Tab/Shift+Tab)
- Fields update state and preview in real-time as user types

**Selection behavior:**
When a user interacts with a combobox:
- **Typing**: Filters vocabulary suggestions in real-time (case-insensitive)
- **Arrow keys**: Navigate through filtered suggestions
- **Enter**: Selects highlighted suggestion
- **Click suggestion**: Selects that term immediately
- **Custom input**: Users can type any value (all fields allow free text)
- Selection immediately updates live preview

**Removal/replacement:**
- Users can clear a field by deleting all text in the combobox
- For optional fields added via buttons, users can click the remove (×) button
- Replacing a field value does not affect other fields' values
- Clearing a field updates preview immediately

**Keyboard navigation:**
- Tab key: moves focus between fields in order
- Shift+Tab: moves focus backwards
- Arrow keys (up/down) in combobox: navigate suggestions
- Enter: selects highlighted suggestion
- Escape: closes suggestion dropdown
- Standard form navigation applies

**Field management:**
- Optional prefix fields: Added via "+ System", "+ Theme", "+ Domain" buttons
- Optional base fields: Added via "+ Property" or "+ Concept" buttons (framework-dependent)
- Optional object fields: Added via "+ Group" button (component framework)
- Optional suffix fields: Added via "+ Variant", "+ State", "+ Scale", "+ Mode" buttons
- Added fields can be removed via × button on the field wrapper
- Field state is preserved when switching between framework tabs

**Edge cases:**
- All fields filled: User can still modify any field value
- Required fields: Cannot be left empty if validation runs (but user can temporarily clear during editing)
- Optional fields: Can be cleared or removed even if required fields are empty
- Field state is preserved when switching between tabs (each framework maintains its own state)
- Namespace change: Resets all framework-specific fields

**Acceptance criteria**
- Users can replace a field value without resetting the entire name.
- Clearing a field updates the preview instantly.
- Vocabulary filtering works smoothly as user types.
- Custom values can be entered in any field.
- Field focus and navigation work intuitively with keyboard.

---

### R4 — Custom term creation (guardrailed)
**v1 behavior:** Users can add custom terms in any slot (no per-slot restriction).

**v2 behavior (schema-driven):** Slots may restrict custom terms via `allow_custom_terms = TRUE/FALSE`.

**Important: Custom terms are session-only**
- Custom terms exist only in runtime/session state
- Custom terms are never persisted to configuration files (JSON/YAML)
- Custom terms are lost on page refresh or reset
- Custom terms are validated against the predefined vocabulary in config files but never added to them

**UI flow for custom term creation:**

1. **Input mechanism**: 
   - For slots with `allow_custom_terms = true`, provide an "Add custom term" button or inline input field
   - Inline input appears when slot is focused and empty (or as a button that opens input)
   - Input field appears below or adjacent to the slot

2. **Entry process**:
   - User types custom term into input field
   - Validation runs in real-time as user types (debounced, ~300ms delay)
   - Normalization is applied immediately (see R5)
   - Normalized value appears in preview (not raw input)

3. **Validation feedback**:
   - Inline error messages appear below the input field
   - Errors block submission/confirmation of the custom term
   - Success state: input accepted, term appears in slot as chip with "custom" indicator

4. **Visual distinction**:
   - Custom terms displayed with visual indicator (e.g., dashed border, "custom" badge, or different styling)
   - Helps users distinguish custom terms from predefined vocabulary terms

5. **Conflict resolution**:
   - If uniqueness check fails (R6), show error message identifying conflicting slot
   - Error message: "This term already exists in [slot label]. Select it from that slot instead."
   - User cannot proceed until conflict is resolved

Custom term validation flow:
1. Check slot allows custom terms (if not, show: "Custom terms not allowed for this slot")
2. Apply normalization (see R5)
3. Validate normalization didn't result in empty string
4. Validate against slot constraints (min/max length, regex/pattern if specified)
5. Validate against framework reserved terms/prefixes
6. Validate uniqueness within framework (R6) — checks against both config vocabulary and other custom terms in current session

**Acceptance criteria**
- Disallowed custom-term slots prevent entry with a clear message.
- Validation errors are shown inline and block selection.
- Custom terms are clearly distinguished from predefined terms in the UI.
- Custom terms are never saved to configuration files.
- Normalized form appears in preview immediately.

---

### R5 — Normalization rules for custom terms
Normalize user-entered terms before comparison and preview:
- trim whitespace
- lowercase
- replace spaces/underscores with `-`
- collapse repeated `-`
- strip leading/trailing `-`

**Acceptance criteria**
- Normalized term is what appears in the preview (not the raw input).
- Empty results after normalization are rejected.

---

### R6 — Uniqueness within framework (critical)
Uniqueness is enforced **within each naming framework**, across all slots.

Rule:
- When a user adds a custom term for `slot_id = X` in `framework_id = F`,
  the tool checks if the **normalized** term exists in:
  1. Any slot's vocabulary in the framework's config (JSON/YAML)
  2. Any other slot's custom term in the current session state
  - If it exists in a different slot (config or session): block and show an error
  - If it exists in the same slot (config): treat as existing predefined term and select it instead
  - If it exists in the same slot (session): treat as existing custom term and select it

**Note:** The uniqueness check compares against both the predefined vocabulary from configuration files and any custom terms already entered in the current session. Custom terms themselves are never added to the configuration.

**Error message requirements**
- Identify the slot where the term already exists (human-readable slot label)
- Indicate whether it's from config vocabulary or a custom term
- Provide a next step ("Select it from that slot instead.")

**Acceptance criteria**
- Cross-slot duplicates in the same framework are consistently rejected.
- Error text points to the conflicting slot.
- Uniqueness is checked against both config vocabulary and session custom terms.

---

### R7 — Real-time validation and guidance

**Validation display location:**
- **Inline per slot**: Each slot shows its own error/warning message directly below the slot input/chip
- **Summary panel** (optional): A validation panel below the preview shows all errors/warnings in one place
- **Status message**: A status message near the preview/Copy button shows the most critical error or success state

**Error message hierarchy:**
- Most critical blocking error is shown first
- If multiple errors exist, the first error (in slot order) is prioritized in status message
- All errors are visible inline at their respective slots
- Users can see all issues at once, not just the first one

**Visual treatment:**
- **Errors (blocking)**: Red border on slot, red error icon, red error text
- **Warnings (non-blocking)**: Orange/yellow border on slot, warning icon, warning text
- **Success**: Green checkmark or "Ready to copy" message when valid

**Validation types:**

**Blocking errors (disable Copy):**
- Missing required slots
  - Message: "[Slot label] is required."
  - Appears inline at the empty required slot
- Slot constraint violations (length/pattern)
  - Message: "[Slot label] must be between X and Y characters." or "[Slot label] must match pattern: [pattern]"
  - Appears inline at the violating slot
- Framework naming constraint violations (see R8)
  - Message: "Segment cannot contain [forbidden character]. Use '-' for multi-word terms."
  - Appears inline at the violating slot
- Dependency rule violations (if dependencies are enabled)
  - Message: Uses custom message from dependency rule definition
  - Appears inline at the affected slot
- Duplicate custom term in another slot (R6)
  - Message: "This term already exists in [slot label]. Select it from that slot instead."
  - Appears inline at the slot where duplicate was attempted

**Warnings (Copy still allowed):**
- Deprecated term selected (if allowed by policy)
  - Message: "[Term] is deprecated. Consider using [suggestion] instead." (if suggestion available)
  - Appears inline below the slot chip, warning styling
- Discouraged combinations (optional, future)
  - Message: Custom message from dependency rules
  - Appears inline or in summary panel

**Acceptance criteria**
- Validation runs on every change (real-time, debounced if needed for performance).
- Copy is disabled when blocking errors exist.
- Messages are actionable, not generic (include specific slot labels, suggestions, next steps).
- All errors are visible, not just the first one.
- Errors appear inline at their respective slots.

---

### R8 — Segment character constraints
Each segment (field output) must:
- **ONLY** contain lowercase letters (`a-z`), numbers (`0-9`), and hyphens (`-`)
- **NOT** contain spaces, uppercase letters, or special characters
- Validation regex: `/[^a-z0-9-]/` (rejects any character not in allowed set)
- Use `-` for multi-word terms within a segment (e.g., `font-size`, `letter-spacing`)

**Acceptance criteria**
- Any segment containing forbidden characters is rejected with a specific error message.
- Error message: "Invalid characters in [field name]."
- Validation runs in real-time as user types.

---

### R9 — Preview separator control
- Provide a dropdown selector to switch the preview separator between:
  - `/` (Slash) - default
  - `_` (Underscore)
  - `.` (Dot)
- Default selection is `/` (Slash).
- Changing the separator updates the live preview immediately.
- Copy uses the currently selected separator.

**Acceptance criteria**
- Switching separators updates preview instantly without altering selected field values.
- Format preference is maintained during the session but not persisted across page refreshes.

---

### R10 — Copy and reset

**Copy functionality:**
- **Copy buttons**: Two buttons near the live preview
  - "Copy token name": Copies the live preview string (with current separator) to clipboard
  - "Copy JSON": Copies the full state as formatted JSON (includes all field values and modifiers)
- **State**: Both buttons disabled when blocking validation errors exist (visually grayed out, not clickable)
- **Feedback**: Shows success toast notification "Copied." or "Copied JSON."
- **History**: Successful copy adds the token state to history (see R11)
- **Keyboard shortcut**: Cmd/Ctrl+C when preview area is focused (copies token name)

**Reset functionality:**
- **Note**: Reset functionality is not currently implemented in the UI
- **Intended behavior**: Clear all field values for the active framework/tab only
- **Scope**: Only affects the current tab's session state
- **Preserves**: Does not change the current tab selection, does not reset preview separator selection

**Acceptance criteria**
- Copy buttons are disabled when blocking validation errors exist.
- Copy actions add entries to history.
- Copy uses the currently selected separator.
- Copy JSON includes complete state representation.

---

### R11 — History functionality

**Overview:**
History stores the last 10 successfully copied token configurations in browser localStorage, allowing users to quickly reuse previous token names.

**History storage:**
- **Location**: Browser localStorage (key: `token-namer:history`)
- **Maximum items**: 10 entries (oldest removed when limit exceeded)
- **Persistence**: Survives page refreshes and browser sessions
- **Scope**: Global across all frameworks (not per-framework)

**History entry structure:**
Each entry stores the complete token state:
- All field values (namespace, prefix fields, base fields, object fields)
- Modifiers array
- Timestamp (used for uniqueness and sorting)

**History display:**
- **Location**: History section (if visible in UI)
- **Format**: Each entry shows the generated token name
- **Actions per entry**:
  - **Fill form** (↩ icon): Populates the form with that entry's values
  - **Copy** (⧉ icon): Copies the token name to clipboard
  - **Remove** (× icon): Removes that entry from history
- **Empty state**: Shows message "No history yet. Copy a token name to save it here."

**History management:**
- **Add to history**: Automatic when user successfully copies a token name
- **Deduplication**: Duplicate entries (same field values) are replaced, keeping the most recent
- **Clear history**: Option to clear all history entries (if UI provides this action)

**Acceptance criteria**
- History stores last 10 copied token configurations.
- History persists across page refreshes.
- History entries can be used to fill the form or copy again.
- Duplicate entries are replaced with the most recent.

---

### R12 — Presets functionality

**Overview:**
Presets provide quick-fill options for common token patterns, organized by namespace. This helps users quickly generate standard token configurations.

**Preset structure:**
- **Organization**: Presets grouped by namespace (color, space, typography, radius, motion)
- **Definition**: Each preset defines:
  - Label (display name)
  - Object/value for the base field
  - Base value
  - Modifiers array (optional)
- **Validation**: Presets are validated against current vocabulary to ensure they're still valid

**Preset examples:**
- **Color namespace**: `text/primary`, `background/default`, `border/subtle`, `text/primary/hover`
- **Space namespace**: `md/default`, `lg/default`, `sm/compact`
- **Typography namespace**: `font-size/body`, `line-height/body`, `font-weight/heading`
- **Radius namespace**: `button/default`, `card/subtle`, `badge/pill`
- **Motion namespace**: `duration/fast`, `easing/standard`, `delay/medium`

**Preset usage:**
- **Access**: Presets available when namespace is selected (if UI provides preset selection)
- **Application**: Selecting a preset fills the form with preset values
- **Validation**: Presets are validated before being applied
- **Customization**: After applying a preset, users can modify field values as needed

**Current implementation:**
- Presets are defined in `src/presets.js`
- Presets are validated against current vocabulary
- Note: Preset UI may not be fully implemented; presets exist as data structure

**Acceptance criteria**
- Presets are validated against current vocabulary.
- Presets can be applied to fill form fields.
- Presets cover common token patterns per namespace.

---

## Configuration model

**Current implementation:**
Vocabulary is hardcoded in `src/vocabulary.js` as a JavaScript object. The vocabulary structure is namespace-based.

**Vocabulary structure:**
```javascript
VOCABULARY = {
  namespaces: {
    color: {
      label: "Color",
      description: "Color tokens for UI elements",
      objects: [{ value, label, description }, ...],
      bases: [{ value, label, description }, ...]
    },
    space: { ... },
    typography: { ... },
    radius: { ... },
    motion: {
      // Special case: bases depend on object selection
      basesByObject: {
        duration: [{ value, label, description }, ...],
        easing: [{ value, label, description }, ...],
        delay: [{ value, label, description }, ...]
      }
    }
  },
  modifiers: [{ value, label, description }, ...]
}
```

**Structure elements:**
- **Category**: Top-level categories (color, space, typography, radius, motion)
- **Objects**: Terms for object/component fields (varies by namespace)
- **Bases**: Terms for base/category fields (varies by namespace)
- **Conditional vocabulary**: Motion namespace has object-dependent bases (`basesByObject`)
- **Modifiers**: Shared vocabulary for suffix modifier fields (variant, state, scale, mode)

**Note on Primitive Tokens:**
The structure described above applies to the current implementation. Primitive tokens follow a different naming framework structure: `<category>/<set>/<step>/<variant?>`. Primitive tokens require category-specific vocabulary and step systems as defined in the Controlled vocabulary section. The primitive framework uses a JSON storage model where segments are stored as nested JSON objects (groups), with groups being objects without `$value` and tokens being objects with `$value`. See the "Primitive tokens" section under Controlled vocabulary for complete details.

**Access:**
- Vocabulary is accessed via getter functions in `src/data.js`
- Functions filter vocabulary based on namespace and current field values
- Conditional vocabulary (like motion bases) is handled by specific getter functions

---

## Controlled vocabulary

### Primitive tokens

Primitive tokens define the raw, literal values of the system. They are the lowest level of abstraction and must not encode meaning, usage, state, or component intent.

**Core Primitive Naming Framework:**

**Structure:**
```
<category>/<set>/<step>/<variant?>
```

**Controlled vocabulary table:**

| Category | Set | Step | Variant |
|----------|-----|------|---------|
| `color` | hue names (see color rules) | 0–1100 | A0–A100 (alpha) |
| `space` | (omitted, uses step directly) | 0–40 | (optional) |
| `size` | (omitted, uses step directly) | 0–200 | (optional) |
| `radius` | (omitted, uses step directly) | 0–32, plus 999 (pill) | (optional) |
| `border-width` | (omitted, uses step directly) | 0–8 | (optional) |
| `opacity` | (omitted, uses step directly) | 0–100 | (optional) |
| `shadow` | (omitted, uses level directly) | 0–5 | (optional) |
| `blur` | (omitted, uses step directly) | category-specific | (optional) |
| `font-family` | (omitted, uses name directly) | (n/a) | (optional) |
| `font-size` | (omitted, uses step directly) | 8–72 | (optional) |
| `line-height` | (omitted, uses step directly) | 10–96 | (optional) |
| `font-weight` | (omitted, uses step directly) | 100, 200, 300, 400, 500, 600, 700, 800, 900 | (optional) |
| `letter-spacing` | (omitted, uses step directly) | neg2–10 | (optional) |
| `duration` | (omitted, uses step directly) | 0–2000 (milliseconds) | (optional) |
| `easing` | (omitted, uses curve directly) | (n/a) | (optional) |
| `layer` | (omitted, uses level directly) | 0–10 | (optional) |
| `breakpoint` | (omitted, uses step directly) | category-specific | (optional) |

**Rules:**
- Store segments as nested JSON objects (groups), not as a single slash-delimited key string
- Groups are JSON objects without `$value`; tokens are objects with `$value`
- Token + group names must not start with `$`
- Names must not contain `{`, `}`, or `.`
- Every token must have a `$type` available (on the token or inherited from a parent group)
- Tools must not guess types
- Optional variants under a step: if you need both "base" and "variants" under the same step, use the reserved `$root` token inside the group

#### Primitive color naming rules

**Structure:**
```
color/<hue>/<step>/<alpha?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<hue>` | `white`, `black`, `gray`, `blue`, `red`, `yellow`, `green`, `cyan`, `indigo`, `olive`, `orange`, `pink`, `purple`, `rose`, `shamrock`, `teal`, `violet` |
| `<step>` | 0–1100 |
| `<alpha>` | A0–A100 |

**Rules:**
- Use a numbered stepping system for ramps (100-based scale)
- You may add extra steps like 25, 50, 75 for subtle differences
- Omit `<alpha>` when fully opaque; only add `<alpha>` when the alpha is part of the primitive value

**Example token names:**
- `color/blue/500`
- `color/gray/100`
- `color/blue/500/A20`

#### Primitive space naming rules

**Structure:**
```
space/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 0–40 (recommended), where each step maps to a px/rem value in your scale |

**Rules:**
- Keep the number of steps small and consistent across platforms
- Steps should be monotonic (bigger step = bigger space)
- Don't encode units in the token name (units live in values)

**Example token names:**
- `space/0`
- `space/4`
- `space/8`
- `space/16`

#### Primitive size naming rules

**Structure:**
```
size/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 0–200 (recommended), where each step maps to a px/rem value in your scale |

**Rules:**
- Use for general sizing primitives (icons, controls, layout constraints)
- If you need distinct size families, prefer a new category over stuffing meaning into the step

**Example token names:**
- `size/16`
- `size/24`
- `size/48`

#### Primitive radius naming rules

**Structure:**
```
radius/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 0–32, plus 999 (pill) |

**Rules:**
- Keep steps sparse (you rarely need many)
- Reserve 999 for pill/full rounding

**Example token names:**
- `radius/0`
- `radius/4`
- `radius/8`
- `radius/999` (pill)

#### Primitive border-width naming rules

**Structure:**
```
border-width/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 0–8 |

**Rules:**
- Use a tiny set (most systems need 0/1/2 at most)
- Keep "hairline" handling in values/platform logic, not names

**Example token names:**
- `border-width/0`
- `border-width/1`
- `border-width/2`

#### Primitive opacity naming rules

**Structure:**
```
opacity/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 0–100 |

**Rules:**
- Prefer increments of 5 or 10
- Don't create opacity primitives if you always bake alpha into `color/.../Axx`—pick one strategy and stick to it

**Example token names:**
- `opacity/0`
- `opacity/50`
- `opacity/100`

#### Primitive shadow naming rules

**Structure:**
```
shadow/<level>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<level>` | 0–5 (recommended) |

**Rules:**
- Keep this small; shadows vary by platform and theme
- If your system uses elevation language, you can alias `elevation/<level>` → `shadow/<level>`

**Example token names:**
- `shadow/0`
- `shadow/1`
- `shadow/2`
- `shadow/5`

#### Primitive font-family naming rules

**Structure:**
```
font-family/<name>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<name>` | `sans`, `serif`, `mono` (plus any brand fonts in kebab-case) |

**Rules:**
- Use generic fallbacks as names; put the full font stack in the value
- Keep brand font names stable and kebab-case

**Example token names:**
- `font-family/sans`
- `font-family/serif`
- `font-family/mono`
- `font-family/brand-font-name`

#### Primitive font-size naming rules

**Structure:**
```
font-size/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 8–72 (recommended), integers only |

**Rules:**
- Use real numeric sizes (mapped to px/rem in values)
- Avoid duplicate sizes with different names

**Example token names:**
- `font-size/12`
- `font-size/16`
- `font-size/24`
- `font-size/32`

#### Primitive line-height naming rules

**Structure:**
```
line-height/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 10–96 (recommended), integers only |

**Rules:**
- If you use unitless line-height in code, still keep the token name numeric
- Ensure common pairings exist (e.g., 16 size often pairs with 20–24 line height)

**Example token names:**
- `line-height/16`
- `line-height/20`
- `line-height/24`

#### Primitive font-weight naming rules

**Structure:**
```
font-weight/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 100, 200, 300, 400, 500, 600, 700, 800, 900 |

**Rules:**
- Use CSS-style numeric weights even if design tools show names like "Semibold"
- Map platform-specific weight equivalents in values

**Example token names:**
- `font-weight/400` (normal)
- `font-weight/500` (medium)
- `font-weight/700` (bold)

#### Primitive letter-spacing naming rules

**Structure:**
```
letter-spacing/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | neg2–10 (recommended), integers (maps to em/px in values) |

**Rules:**
- Keep the step set small; only add negative spacing when justified
- Don't encode units in the token name

**Example token names:**
- `letter-spacing/0`
- `letter-spacing/neg1`
- `letter-spacing/1`

#### Primitive duration naming rules

**Structure:**
```
duration/<step>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<step>` | 0–2000 (milliseconds) |

**Rules:**
- Use meaningful increments (e.g., 75/100/150/200/300/500/800)
- Keep "instant" as `duration/0`

**Example token names:**
- `duration/0` (instant)
- `duration/100`
- `duration/200`
- `duration/500`

#### Primitive easing naming rules

**Structure:**
```
easing/<curve>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<curve>` | `standard`, `emphasized`, `decelerate`, `accelerate`, `linear` |

**Rules:**
- Store the actual cubic-bezier/spring parameters in values
- Keep curve names semantic (avoid bezier-1 style names)

**Example token names:**
- `easing/standard`
- `easing/emphasized`
- `easing/decelerate`
- `easing/linear`

#### Primitive layer (z-index) naming rules

**Structure:**
```
layer/<level>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<level>` | 0–10 (recommended) |

**Rules:**
- Use layers for stacking contexts (dropdown, modal, toast, tooltip)
- Don't overfit—prefer fewer, well-documented layers

**Example token names:**
- `layer/0`
- `layer/1`
- `layer/5`
- `layer/10`

---

### Semantic tokens

Semantic tokens describe the intended use or context of a value rather than the raw value itself. They reside in the middle layer of abstraction, mapping intent to specific primitive values.

**Core Semantic Naming Framework:**

**Structure:**
```
<domain>/<object>/<role>/<context?>/<state?>/<emphasis?>
```

**Controlled vocabulary table:**

| Segment | Allowed Values |
|---------|----------------|
| `<domain>` | `surface`, `content`, `separator`, `action`, `link`, `focus`, `status`, `toggle`, `range`, `overlay`, `accent`, `constant`, `type`, `space`, `size`, `radius`, `border-width`, `shadow` |
| `<context>` | `inverse`, `on-media`, `on-light-media`, `on-accent` |
| `<state>` | `default`, `hover`, `pressed`, `selected`, `active`, `disabled`, `focus`, `invalid`, `visited`, `loading` |
| `<emphasis>` | `weakest`, `weaker`, `weak`, `default`, `strong`, `stronger`, `strongest` |

**Rules:**
- Domain-leading is non-negotiable: the first segment communicates usage, not data type
- Role is categorical (meaning), not intensity. Don't use "strong/weak/muted" as roles if you keep an emphasis ladder
- Context ≠ role: use `<context>` only when the same role must adapt to a known rendering context (media, inverse, accent)
- State only for interaction/condition changes (hover/pressed/disabled/etc.). Don't invent "focused" as a role if it's a state
- Emphasis is optional and should be used sparingly (only where you truly need a ladder). Most semantic systems should ship without it
- Composite tokens must be backed by leaf variables: the "composite" is a contract name (often a style), and its properties are variables

---

## Color semantics

### Surface semantic naming rules

**Structure:**
```
surface/<layer>/<role>/<context?>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<layer>` | `background`, `container`, `elevated`, `popover`, `ui` |
| `<role>` | `default`, `subtle`, `emphasized` |
| `<context>` | `inverse` |
| `<state>` | `default`, `hover`, `pressed`, `selected`, `disabled` |

**Rules:**
- Use for anything that reads as a surface someone sits on
- Keep roles small; layer does most of the differentiation
- Prefer surface tokens over component-specific backgrounds unless you need overrides

**Example token names:**
- `surface/background/default`
- `surface/container/subtle`
- `surface/elevated/default/inverse`

### Content semantic naming rules

**Structure:**
```
content/<kind>/<role>/<context?>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<kind>` | `text`, `icon` |
| `<role>` | `primary`, `secondary`, `placeholder`, `disabled`, `highlight` |
| `<context>` | `inverse`, `on-media`, `on-light-media`, `on-accent` |
| `<state>` | `default`, `disabled` |

**Rules:**
- `primary`/`secondary` express information hierarchy, not "strength"
- `inverse` and `on-media` are context modifiers, not new roles
- `highlight` is for text highlight fill/ink treatment, not status sentiment

**Example token names:**
- `content/text/primary`
- `content/text/secondary/inverse`
- `content/icon/disabled`

### Separator semantic naming rules

**Structure:**
```
separator/<object>/<role>/<context?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `divider`, `border`, `container-border`, `media-inner-border` |
| `<role>` | `default`, `focused`, `unfocused` |
| `<context>` | `inverse` |

**Rules:**
- Use for structural dividers and frames
- Keep separate from `action/border/*` (interactive borders)

**Example token names:**
- `separator/divider/default`
- `separator/border/focused`
- `separator/container-border/default/inverse`

### Action semantic naming rules

**Structure:**
```
action/<object>/<role>/<state>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `bg`, `text`, `icon`, `border` |
| `<role>` | `primary`, `secondary`, `tertiary`, `subtle`, `destructive` |
| `<state>` | `default`, `hover`, `pressed`, `disabled`, `focus`, `loading` |

**Rules:**
- This is your shared interaction palette (used by many components)
- Don't mirror every component variant here—keep it compact and reusable

**Example token names:**
- `action/bg/primary/default`
- `action/bg/primary/hover`
- `action/text/destructive/disabled`

### Link semantic naming rules

**Structure:**
```
link/<role>/<context?>/<state>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<role>` | `default`, `subtle` |
| `<context>` | `inverse`, `on-media`, `on-accent` |
| `<state>` | `default`, `hover`, `pressed`, `visited`, `disabled` |

**Rules:**
- Don't encode hue (e.g., "blue") in semantic names
- Keep `visited` explicit—this is why links deserve their own domain

**Example token names:**
- `link/default/default`
- `link/default/hover`
- `link/default/visited`
- `link/subtle/inverse/hover`

### Focus semantic naming rules

**Structure:**
```
focus/<object>/<role>/<context?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `ring`, `outline` |
| `<role>` | `default`, `invalid` |
| `<context>` | `inverse` |

**Rules:**
- Treat focus as its own domain so it can't be themed away accidentally
- Keep the set tiny and enforce usage

**Example token names:**
- `focus/ring/default`
- `focus/outline/invalid`
- `focus/ring/default/inverse`

### Status semantic naming rules

**Structure:**
```
status/<intent>/<object>/<role?>/<context?>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<intent>` | `positive`, `negative`, `warning`, `info` |
| `<object>` | `bg`, `text`, `icon`, `border` |
| `<role>` | `default`, `subtle` |
| `<context>` | `inverse`, `on-media`, `on-accent` |
| `<state>` | `default`, `disabled` |

**Rules:**
- Status expresses meaning (sentiment), not hierarchy
- Don't create `error-text` as a content role—status is orthogonal

**Example token names:**
- `status/positive/bg/default`
- `status/negative/text/default`
- `status/warning/icon/subtle`

### Toggle semantic naming rules

**Structure:**
```
toggle/<object>/<role>/<context?>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `background`, `icon`, `text` |
| `<role>` | `on`, `off`, `active` |
| `<context>` | `on-active-background` |
| `<state>` | `default`, `disabled` |

**Rules:**
- Toggle is discrete (boolean). Not for sliders
- Keep `on-active-background` only for cases where foreground must contrast with the active track

**Example token names:**
- `toggle/background/on/default`
- `toggle/icon/off/default`
- `toggle/background/active/on-active-background`

### Range semantic naming rules

**Structure:**
```
range/<object>/<role>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `track`, `fill`, `thumb` |
| `<role>` | `default` |
| `<state>` | `default`, `hover`, `pressed`, `disabled` |

**Rules:**
- Range is continuous (slider/progress/scrubber)
- This is how you keep "toggle active is gray" and "slider fill is blue" without collisions

**Example token names:**
- `range/track/default/default`
- `range/fill/default/hover`
- `range/thumb/default/pressed`

### Overlay semantic naming rules

**Structure:**
```
overlay/<object>/<role>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `scrim`, `backdrop` |
| `<role>` | `default`, `strong` |
| `<state>` | `default` |

**Rules:**
- Use for dimming layers behind modals/popovers
- Pick one approach: alpha in color tokens or separate opacity tokens—don't mix randomly

**Example token names:**
- `overlay/scrim/default/default`
- `overlay/backdrop/strong/default`

### Accent semantic naming rules

**Structure:**
```
accent/<object>/<role>/<context?>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `bg`, `text`, `icon`, `border` |
| `<role>` | `default`, `subtle` |
| `<context>` | `inverse` |
| `<state>` | `default`, `disabled` |

**Rules:**
- Accent is expressive brand emphasis, not "selected/active"
- Don't use accent tokens to represent status meaning

**Example token names:**
- `accent/bg/default/default`
- `accent/text/subtle/inverse`
- `accent/icon/default/disabled`

### Constant semantic naming rules

**Structure:**
```
constant/color/<role>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<role>` | `transparent`, `black`, `white` |

**Rules:**
- Only for values that should never theme (true constants)
- Everything else belongs in `surface`/`content`/`action`/`status`/`accent`

**Example token names:**
- `constant/color/transparent`
- `constant/color/black`
- `constant/color/white`

---

## Typography semantics

### Typography style naming rules

**Structure:**
```
type/<role>/<size>/<weight>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<role>` | `display`, `heading`, `title`, `body`, `label`, `code` |
| `<size>` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` |
| `<weight>` | `regular`, `medium`, `strong` |
| `<state>` | `default` |

**Rules:**
- This is the semantic handle people choose (typically a Text Style in Figma)
- No hard-coded values in the style: every property must be backed by variables when Figma supports it

**Example token names:**
- `type/heading/lg/strong/default`
- `type/body/md/regular/default`
- `type/label/sm/medium/default`

### Typography property variable naming rules

**Structure:**
```
type/<role>/<size>/<weight>/<property>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<property>` | `font-family`, `font-weight`, `font-size`, `line-height`, `letter-spacing`, `paragraph-spacing?`, `paragraph-indent?` |

**Rules:**
- These are the leaf variables that back the `type/...` composite
- Keep property names stable and exhaustive so audits are deterministic

**Example token names:**
- `type/body/md/regular/font-family`
- `type/heading/lg/strong/font-size`
- `type/body/md/regular/line-height`

---

## Dimension semantics (spacing, sizing, radius, border widths)

### Spacing semantic naming rules

**Structure:**
```
space/<scope>/<object>/<role>/<size?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<scope>` | `layout`, `component`, `content` |
| `<object>` | `padding`, `margin`, `gap`, `gutter`, `inset` |
| `<role>` | `default`, `compact`, `spacious` |
| `<size>` | `xs`, `sm`, `md`, `lg`, `xl` |

**Rules:**
- Semantic spacing defines patterns, not the raw ramp (that's primitives)
- Use `layout/*` for page-level constraints; `component/*` for reusable component spacing; `content/*` for text/media rhythm

**Example token names:**
- `space/layout/padding/default/md`
- `space/component/gap/compact/sm`
- `space/content/margin/spacious/lg`

### Sizing semantic naming rules

**Structure:**
```
size/<object>/<role>/<variant?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `icon`, `control`, `affordance`, `media`, `container` |
| `<role>` | `xs`, `sm`, `md`, `lg`, `xl` |
| `<variant>` | `min`, `max` (optional) |

**Rules:**
- Use for widely reused sizing decisions (icon sizes, control heights)
- Avoid encoding component names here—keep it reusable

**Example token names:**
- `size/icon/md`
- `size/control/lg`
- `size/container/xl/max`

### Corner radius semantic naming rules

**Structure:**
```
radius/<object>/<role>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<object>` | `surface`, `control`, `card`, `avatar`, `media` |
| `<role>` | `default`, `subtle`, `pronounced`, `pill` |

**Rules:**
- Keep roles categorical (don't use "strong/weak")
- `pill` is reserved for full rounding behavior

**Example token names:**
- `radius/surface/default`
- `radius/control/subtle`
- `radius/card/pronounced`
- `radius/avatar/pill`

### Border width semantic naming rules

**Structure:**
```
border-width/<role>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<role>` | `default`, `divider`, `strong`, `focus` |
| `<state>` | `default` |

**Rules:**
- Keep the set tiny
- `focus` border width is allowed to differ from default

**Example token names:**
- `border-width/default/default`
- `border-width/divider/default`
- `border-width/focus/default`

---

## Shadow effects semantics

### Shadow style naming rules

**Structure:**
```
shadow/<role>/<state?>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<role>` | `none`, `subtle`, `default`, `elevated`, `popover`, `modal` |
| `<state>` | `default`, `hover`, `pressed` |

**Rules:**
- This is the semantic handle people choose (typically an Effect Style)
- The effect must be backed by variables for every property Figma allows

**Example token names:**
- `shadow/none/default`
- `shadow/subtle/default`
- `shadow/elevated/hover`

### Shadow property variable naming rules

**Structure:**
```
shadow/<role>/<state?>/<layer?>/<property>
```

**Controlled vocabulary:**

| Segment | Allowed Values |
|---------|----------------|
| `<layer>` | `1`, `2`, `3` (optional; only if you use multi-shadow stacks) |
| `<property>` | `x`, `y`, `blur`, `spread`, `color` |

**Rules:**
- If you have a single shadow layer, omit `<layer>`
- If you have stacks, use numbered layers (stable ordering) so exports/imports are deterministic
- Shadow color must be a color variable (themeable); offsets/blur/spread are number variables

**Example token names:**
- `shadow/subtle/default/x`
- `shadow/elevated/default/blur`
- `shadow/modal/default/1/color`
- `shadow/popover/hover/2/spread`

---

## Component tokens

Component tokens are specific to UI components, describing their styling properties. They provide stable override points for component anatomy that needs explicit control.

**Core Component Naming Framework:**

**Structure:**
```
component/<component>/<part>/<property>/<variant?>/<state?>/<context?>
```

**Controlled vocabulary table:**

| Segment | Allowed Values |
|---------|----------------|
| `<component>` | Industry-standard component name in kebab-case: `button`, `icon-button`, `split-button`, `button-group`, `fab`, `text-field`, `text-area`, `select`, `combobox`, `autocomplete`, `search-field`, `number-field`, `password-field`, `checkbox`, `radio`, `switch`, `slider`, `segmented-control`, `toggle-button`, `chip`, `tabs`, `nav-item`, `sidebar`, `breadcrumb`, `pagination`, `step-indicator`, `modal`, `dialog`, `drawer`, `popover`, `tooltip`, `toast`, `banner`, `card`, `panel`, `sheet`, `accordion`, `list`, `list-item`, `table`, `divider`, `avatar`, `thumbnail`, `image`, `media-card`, `progress-bar`, `progress-circle`, `spinner`, `skeleton`, `badge`, `tag`, `text`, `heading`, `link`, `code-block` |
| `<part>` | `container`, `field`, `input`, `label`, `helper-text`, `placeholder`, `icon`, `leading-icon`, `trailing-icon`, `border`, `divider`, `focus-ring`, `track`, `fill`, `thumb`, `handle`, `indicator`, `header`, `body`, `footer`, `media`, `overlay`, `scrim`, `item`, `selection` |
| `<property>` | `bg`, `text`, `icon`, `border-color`, `border-width`, `radius`, `shadow`, `opacity`, `padding-x`, `padding-y`, `gap`, `min-height`, `width`, `height` |
| `<variant>` | `primary`, `secondary`, `tertiary`, `subtle`, `outline`, `ghost`, `destructive`, `success`, `warning`, `danger`, `info`, `compact`, `spacious` (only when the component meaningfully supports variants) |
| `<state>` | `default`, `hover`, `pressed`, `selected`, `active`, `disabled`, `focus`, `invalid`, `visited`, `loading`, `expanded`, `checked`, `indeterminate` |
| `<context>` | `inverse`, `on-media`, `on-light-media`, `on-accent` |

**Rules:**
- Use variant for component styling variants (e.g., primary/secondary, outline/ghost, compact/spacious). If there's no meaningful variant, omit it
- Default behavior: component tokens should alias semantic tokens; use component tokens only for stable override points or component anatomy that needs explicit control
- DTCG JSON-safe naming: no segment starts with `$`; no `.`, `{`, `}` in any segment
- Token vs group collision: if you need a base value and nested state keys under the same node, store the base as `$root` in JSON and keep state variants as siblings. (Figma names omit `$root`.)
- Avoid over-tokenizing: don't create component tokens for every value—start with high-impact properties (bg/text/border/focus/shadow/radius) and only add more when you have real theming needs

---

## Component token categories

### 1) Actions and buttons

**Components:** `button`, `icon-button`, `split-button`, `button-group`, `fab`

**Common patterns:**
- `component/button/container/bg/<variant?>/<state?>`
- `component/button/label/text/<variant?>/<state?>`
- `component/button/icon/icon/<variant?>/<state?>`
- `component/button/container/border-color/<variant?>/<state?>`
- `component/button/container/radius/<variant?>`

**Example token names:**
- `component/button/container/bg/primary/default`
- `component/button/label/text/primary/hover`
- `component/button/container/border-color/outline/default`
- `component/icon-button/container/bg/secondary/pressed`

### 2) Form inputs

**Components:** `text-field`, `text-area`, `select`, `combobox`, `autocomplete`, `search-field`, `number-field`, `password-field`

**Common patterns:**
- `component/text-field/field/bg/<state?>`
- `component/text-field/field/border-color/<state?>`
- `component/text-field/field/border-width/<state?>`
- `component/text-field/input/text/<state?>`
- `component/text-field/placeholder/text/<state?>`
- `component/text-field/helper-text/text/<state?>`
- `component/text-field/focus-ring/border-color/<state?>`

**Example token names:**
- `component/text-field/field/bg/default`
- `component/text-field/field/border-color/invalid`
- `component/text-field/input/text/disabled`
- `component/text-field/focus-ring/border-color/focus`

### 3) Selection controls

**Components:** `checkbox`, `radio`, `switch`, `slider`, `segmented-control`, `toggle-button`, `chip`

**Common patterns:**
- `component/switch/track/bg/<state?>`
- `component/switch/thumb/bg/<state?>`
- `component/slider/track/bg/<state?>`
- `component/slider/fill/bg/<state?>`
- `component/slider/thumb/bg/<state?>`
- `component/checkbox/box/bg/<state?>`
- `component/checkbox/indicator/icon/<state?>`

**Example token names:**
- `component/switch/track/bg/default`
- `component/switch/thumb/bg/checked`
- `component/slider/fill/bg/default`
- `component/checkbox/indicator/icon/checked`

### 4) Navigation

**Components:** `tabs`, `nav-item`, `sidebar`, `breadcrumb`, `pagination`, `step-indicator`

**Common patterns:**
- `component/nav-item/container/bg/<state?>`
- `component/nav-item/label/text/<state?>`
- `component/tabs/tab/text/<state?>`
- `component/tabs/tab/indicator/bg/<state?>`

**Example token names:**
- `component/nav-item/container/bg/selected`
- `component/nav-item/label/text/hover`
- `component/tabs/tab/indicator/bg/active`

### 5) Overlays and dialogs

**Components:** `modal`, `dialog`, `drawer`, `popover`, `tooltip`, `toast`, `banner`

**Common patterns:**
- `component/modal/container/bg`
- `component/modal/container/shadow`
- `component/modal/scrim/bg`
- `component/popover/container/bg`
- `component/popover/container/shadow`

**Example token names:**
- `component/modal/container/bg`
- `component/modal/scrim/bg`
- `component/popover/container/shadow`
- `component/tooltip/container/bg`

### 6) Surfaces and containers

**Components:** `card`, `panel`, `sheet`, `accordion`, `list`, `list-item`, `table`, `divider`

**Common patterns:**
- `component/card/container/bg`
- `component/card/container/border-color`
- `component/card/container/radius`
- `component/card/container/shadow`

**Example token names:**
- `component/card/container/bg`
- `component/card/container/radius`
- `component/panel/container/border-color`
- `component/list-item/container/bg/hover`

### 7) Media and imagery

**Components:** `avatar`, `thumbnail`, `image`, `media-card`

**Common patterns:**
- `component/avatar/container/bg`
- `component/avatar/initials/text`
- `component/media-card/overlay/bg`

**Example token names:**
- `component/avatar/container/bg`
- `component/avatar/initials/text`
- `component/media-card/overlay/bg`

### 8) Feedback and progress

**Components:** `progress-bar`, `progress-circle`, `spinner`, `skeleton`, `badge`, `tag`

**Common patterns:**
- `component/progress-bar/track/bg`
- `component/progress-bar/fill/bg`
- `component/badge/container/bg/<variant?>`
- `component/badge/label/text/<variant?>`

**Example token names:**
- `component/progress-bar/fill/bg`
- `component/badge/container/bg/success`
- `component/badge/label/text/warning`

### 9) Typography wrappers (optional)

**Components:** `text`, `heading`, `link`, `code-block`

**Common patterns:**
- `component/text/style/<variant?>` (only if you truly need per-component overrides beyond `type/...`)

**Example token names:**
- `component/link/text/default/hover`
- `component/code-block/container/bg`

---

## Technical architecture

### Current implementation (v1)

**Tech stack:**
- **Build tool**: Vite v7.2.7
- **Language**: Vanilla JavaScript (ES modules)
- **Framework**: None (plain HTML/CSS/JS)
- **File structure**: Modular ES6 modules in `src/` directory

**Module structure:**
```
src/
  app.js          # Main application logic, UI initialization, event handlers
  data.js         # Vocabulary getter functions, validation helpers
  vocabulary.js   # Hardcoded vocabulary data structure
  validation.js   # Validation engine (real-time validation)
  format.js       # Token name formatting (segment joining with separators)
  history.js      # History management (add, remove, render, clear)
  storage.js      # localStorage utilities (history, theme preferences)
  presets.js      # Preset definitions and validation
  toast.js        # Toast notification system
  dom.js          # DOM utilities (selectors, helpers)
```

**State management:**
- **Per-framework state**: Object storing field values for each framework (primitive, semantic, component)
  - Fields: `namespace`, `prefixSystem`, `prefixTheme`, `prefixDomain`, `baseCategory`, `baseConcept`, `baseProperty`, `objectGroup`, `objectComponent`, `objectElement`, `modifiers`
  - State preserved independently per framework when switching tabs
- **UI state**: Active framework, format separator, field visibility
- **Validation state**: Errors and warnings per field, computed in real-time
- **History state**: Managed via localStorage, separate from form state

**Vocabulary access:**
- Vocabulary loaded from `vocabulary.js` at module import time
- Getter functions in `data.js` provide filtered vocabulary based on:
  - Namespace selection
  - Current field values (for conditional vocabulary)
  - Framework-specific field types
- Conditional vocabulary: Motion namespace uses `basesByObject` structure

**Validation engine** (`validation.js`):
- Runs in real-time on every state change
- **Field-level validation**:
  - Required field checks (framework-specific)
  - Character constraint validation (regex: `/[^a-z0-9-]/`)
  - Vocabulary validation (checks if value is in allowed vocabulary)
- **Error aggregation**: Collects all errors and warnings
  - Errors block Copy action
  - All errors displayed inline per field
  - Most critical error shown in preview status area

**Format engine** (`format.js`):
- Joins field segments with selected separator (`/`, `_`, or `.`)
- Filters out empty segments
- Supports three format types: slash (default), underscore, dot

**History system** (`history.js`):
- Stores last 10 copied token configurations
- Deduplication: Replaces duplicates with most recent
- localStorage persistence: `token-namer:history` key
- Actions: Add, remove, clear, render with callbacks (fill, copy, remove)

### Future state (v2 - schema-driven)

The planned migration to schema-driven architecture would introduce:

- **Schema loader** (`schema.js`): Load and parse JSON/YAML configuration files
- **Framework configurations**: Separate config per framework or unified config file
- **Dynamic field rendering**: Fields generated from schema instead of hardcoded
- **Enhanced validation**: Schema-driven constraints (min/max length, patterns)
- **Term status support**: Active/hidden/deprecated status with UI indicators

The current hardcoded vocabulary would be migrated to the schema format described in the Configuration model section.

---

## Caching and performance

**Current implementation:**
- Vocabulary loaded once at module import time (hardcoded in `vocabulary.js`)
- No runtime caching needed (vocabulary is static during session)
- History stored in localStorage (persists across sessions)
- No caching of generated token names beyond current session state
- Custom terms exist only in session state and are not cached

**Future (schema-driven):**
- Cache loaded schema/config in memory per framework after first load
- Optional localStorage cache for config with TTL and/or version hash (useful if loading from external sources)
- Custom terms remain session-only and never cached

---

## Accessibility

### Keyboard navigation

**Tab navigation:**
- Tab key: moves focus forward through interactive elements in logical order
- Shift+Tab: moves focus backward
- Navigation order: Framework tabs → Fields (in order) → Format selector → Copy buttons

**Framework tabs:**
- Arrow keys (left/right): navigate between framework tabs
- Enter/Space: activates selected tab
- Home/End: jump to first/last tab (if implemented)

**Form fields (comboboxes):**
- Tab: moves focus to next field in order
- Shift+Tab: moves focus to previous field
- Arrow keys (up/down) in combobox: navigate through filtered suggestions
- Enter: selects highlighted suggestion
- Escape: closes suggestion dropdown
- Delete/Backspace: clears field value

**Combobox autocomplete:**
- Typing: filters vocabulary suggestions in real-time
- Arrow keys (up/down): navigate suggestions
- Enter: selects highlighted suggestion
- Escape: closes dropdown
- Click: opens/closes dropdown

**Preview separator:**
- Standard dropdown navigation (Tab to focus, Arrow keys to select option)
- Enter: confirms selection

**Copy buttons:**
- Enter/Space: activates button
- Copy button disabled state: announced by screen reader, focusable but not activatable
- Cmd/Ctrl+C: Keyboard shortcut to copy when preview area is focused

### Screen reader support

**ARIA roles and labels:**

- **Framework tabs**:
  - Role: `tablist` (container), `tab` (each tab), `tabpanel` (content)
  - `aria-label`: "Framework selection" (tablist)
  - `aria-selected`: indicates active tab
  - `aria-controls`: links tab to its panel

- **Form fields (comboboxes)**:
  - Role: `combobox` on container, `textbox` on input
  - `aria-label`: field label with required indicator if applicable (e.g., "Category, required")
  - `aria-required`: `true` for required fields
  - `aria-autocomplete`: `"list"` to indicate autocomplete behavior
  - `aria-controls`: points to listbox ID
  - `aria-expanded`: `"true"` when dropdown is open, `"false"` when closed
  - `aria-describedby`: points to error/warning message element (if present)
  - `aria-invalid`: `true` when field has error, `false` otherwise
  - `aria-activedescendant`: points to highlighted suggestion when navigating
  - `aria-live="polite"`: on error message containers

- **Combobox listbox (suggestions)**:
  - Role: `listbox` on container
  - Role: `option` on each suggestion item
  - `aria-selected`: `"true"` on highlighted option, `"false"` on others

- **Live preview**:
  - Role: `region` or `textbox`
  - `aria-label`: "Token name preview"
  - `aria-live="polite"`: announces preview updates
  - `aria-describedby`: points to status message

- **Validation messages**:
  - Role: `alert` (for errors) or `status` (for warnings)
  - `aria-live="polite"` or `aria-live="assertive"` (for critical errors)
  - Clear, descriptive text that identifies the slot and issue

**Announcements:**
- Validation errors: announced when they occur ("[Slot label] is required")
- Preview updates: announced when token name changes ("Preview updated: [token name]")
- Copy success: announced after copy action ("Copied to clipboard")
- Tab switch: announced when framework tab changes ("[Framework name] framework selected")

### Visual accessibility

**Focus indicators:**
- All interactive elements have visible focus styles
- Focus outline: minimum 2px, high contrast (meets WCAG AA)
- Focus styles are not removed or made invisible

**Color contrast:**
- Text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Error/warning/success states are not indicated by color alone
- Icons, borders, or text labels accompany color indicators

**Disabled states:**
- Disabled elements are visually distinct (reduced opacity, grayed out)
- Disabled state is announced by screen readers
- Disabled Copy button: clearly indicates why (e.g., "Copy disabled: validation errors present")

**Error states:**
- Errors use color plus icon plus text
- Error messages are always visible (not hidden behind hover states)
- Error messages use clear, descriptive language

### Responsive accessibility

- Mobile: touch targets are minimum 44x44px
- Mobile: keyboard navigation still works (on-screen keyboard)
- Responsive layout maintains logical tab order on all screen sizes

---

## Analytics (optional, non-PII)
Track:
- framework usage
- separator selection usage (counts)
- copy events
- validation error types (counts)
- custom term attempts + rejection reason

---

## Migration path from current implementation

### Current state (v1 - implemented)
The current implementation includes:
- ✅ **UI**: Section-based form with combobox inputs for term selection
- ✅ **Frameworks**: Three tabs (Primitive, Semantic, Component) with framework switching
- ✅ **Vocabulary**: Hardcoded in `src/vocabulary.js` with namespace-based structure
- ✅ **Data layer**: `src/data.js` provides getter functions for vocabulary terms
- ✅ **Validation**: Real-time validation with character constraints and required field checks
- ✅ **Formatting**: Token name generation with three separator options (slash, underscore, dot)
- ✅ **Copy functionality**: Copy token name and JSON representation
- ✅ **History**: Browser localStorage-based history (last 10 entries)
- ✅ **Presets**: Preset definitions in `src/presets.js`
- ✅ **Toast notifications**: User feedback for copy actions
- ✅ **Framework state management**: Independent state per framework tab

### Future migration (v2 - schema-driven)

**Migration goals:**
1. **Create configuration files**: Convert hardcoded vocabulary to JSON/YAML format
   - Map current namespace-based vocabulary to framework/slot-based structure
   - Map `objects` and `bases` from vocabulary.js to slot vocabulary terms
   - Handle conditional vocabulary (e.g., motion.basesByObject)
   - Create slot schema definitions based on current field structure

2. **Implement schema engine**: Build system to load and parse config files
   - Create `src/schema.js` to load JSON/YAML files at startup
   - Parse and validate structure
   - Cache configurations in memory per framework
   - Provide API functions to query vocabulary by framework, slot, and context

3. **Update data layer**: Refactor `src/data.js` to use schema loader
   - Replace hardcoded imports with schema loader imports
   - Update getter functions to query from loaded schema
   - Maintain backward compatibility during migration
   - Support both namespace-based queries and slot-based queries

4. **Enhance validation**: Add schema-driven constraints
   - Support min/max length constraints from schema
   - Support pattern/regex constraints from schema
   - Add term status support (active/hidden/deprecated)
   - Implement dependency rules if needed

5. **Preserve existing functionality**: Ensure all current features continue to work
   - Section-based UI pattern (can be enhanced but not replaced)
   - Combobox inputs with autocomplete
   - Framework tabs and state management
   - History system
   - Presets system
   - Copy functionality
   - Format options

### File structure recommendation

```
src/
  config/
    frameworks.json          # All framework configurations
    # OR
    primitive.json           # Per-framework files
    semantic.json
    component.json
  app.js                     # Main application (refactored)
  schema.js                  # Schema loading and validation
  validation.js              # Validation engine (enhanced)
  format.js                  # Formatting functions (updated)
  ...
```

## Milestones

### Phase 0 — Completed ✅
- ✅ Three framework tabs (Primitive/Semantic/Component)
- ✅ Section-based form UI with combobox inputs
- ✅ Live preview with category pills and format selector
- ✅ Copy functionality (token name and JSON)
- ✅ History system (localStorage, last 10 entries)
- ✅ Presets definitions (per namespace)
- ✅ Real-time validation (required fields, character constraints)
- ✅ Framework state management (independent per tab)
- ✅ Toast notifications
- ✅ Vocabulary structure (hardcoded, namespace-based)

### Phase 1 — MVP (Current - v1)
**Status: Implemented ✅**

All Phase 0 features are complete. The tool is fully functional with hardcoded vocabulary.

### Phase 2 — Schema-driven (Future - v2)
- Config loading: JSON/YAML file loading and parsing
- Schema engine: dynamic slot rendering and vocabulary lookup from config
- Migrate hardcoded vocabulary to JSON/YAML configuration files
- Schema-driven validation: Support min/max length, patterns from schema
- Term status support: Active/hidden/deprecated with UI indicators
- Dependency rules: Conditional vocabulary based on field values

### Phase 3 — Enhancements (Future)
- Reset functionality (clear form for active framework)
- Improved search/filter in combobox inputs
- Deprecated term warnings + guidance messages
- Enhanced error messages with actionable guidance
- Preset UI: Visual preset selection interface

---

## Open questions (park for later)
- Should deprecated terms be selectable (warning) or blocked entirely?
- Do we ever need shared vocab groups reused across slots (and how does that interact with uniqueness)?
- Should preview separator preference persist across sessions via localStorage?
- Should custom terms be saved to browser localStorage for session persistence across page refreshes? (Note: Still never saved to config files)

## Consistency notes

The following clarifications ensure consistency across the PRD:

1. **Custom terms are always session-only**: This is emphasized in R2, R4, R6, and throughout the document. Custom terms never persist to configuration files.

2. **Configuration vs Session state**: Clear separation maintained:
   - Configuration (JSON/YAML): Predefined vocabulary and schemas, loaded once, read-only
   - Session state: User selections and custom terms, runtime only, per-framework

3. **Validation scope**: Uniqueness (R6) checks both config vocabulary AND session custom terms, but custom terms are never added to config.

4. **Preview separator**: User preference, stored in session state only, default `/`, alternatives `_` and `.`.

5. **Framework independence**: Each framework (Primitive/Semantic/Component) maintains its own session state independently. Switching tabs preserves state per framework.

6. **History persistence**: History is stored in localStorage and persists across page refreshes. Custom terms in form state are session-only.

6. **Reset behavior**: Clears only session state for active framework, does not affect other tabs or separator selection.

7. **Error display**: Inline per slot + optional summary panel + status message. All blocking errors visible, most critical shown in status.
