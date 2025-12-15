# Token Namer Tool — PRD (Revised v2)

## Summary
A web-based **token naming tool** that helps people generate consistent design token names using **three naming frameworks**, one per token tier:
- **Primitive**
- **Semantic**
- **Component**

The tool uses a **form-based interface** with accordion sections for **Prefix / Base / Suffix** fields. Users select terms from combobox inputs populated with predefined vocabulary and can optionally add custom terms in allowed fields.

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

The interface uses an **accordion-based form layout** with the following structure:

**Layout structure:**
- **Single-column form** with collapsible accordion sections
- **Live preview card** displayed prominently at the top
- **Accordion sections** for field groups (Prefix, Base/Standard, Suffix)
- Sections can be expanded/collapsed independently
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

**Prefix node section (accordion):**
- **Collapsed by default**
- **Add buttons**: Buttons to add optional prefix fields (System, Theme, Domain)
  - Fields are added dynamically when buttons are clicked
  - Each added field can be removed individually (× button)
- **Combobox inputs**: Autocomplete-enabled text inputs for each prefix field
  - Shows vocabulary suggestions as user types
  - Allows custom input (free text)
  - Displays descriptions via tooltips

**Standard node section (accordion):**
- **Expanded by default**
- **Framework-specific fields**:
  - **Primitive**: Category (required), Property (optional, addable via button)
  - **Semantic**: Category (required), Concept (required), Property (required)
  - **Component**: Group (optional, addable), Component (required), Element (required)
- **Required fields**: Always visible with required indicator (*)
- **Optional fields**: Can be added/removed via buttons
- **Combobox inputs**: Autocomplete-enabled for all fields
  - Vocabulary filtered based on namespace and other field values
  - Conditional vocabulary (e.g., motion bases vary by object type)

**Suffix node section (accordion):**
- **Collapsed by default**
- **Add buttons**: Buttons to add optional modifier fields (Variant, State, Scale, Mode)
  - Fields are added dynamically when buttons are clicked
  - Each added field can be removed individually (× button)
  - Fields maintain order: Variant → State → Scale → Mode
- **Combobox inputs**: Autocomplete-enabled for modifier values
  - Shared vocabulary across all modifier types
  - Allows custom input

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

Primitive tokens represent the most basic design values without semantic meaning.

**Field structure:**
- Namespace (required): e.g., `color`, `space`, `typography`, `radius`, `motion`
- Category (required, base): Semantic category — e.g., `primary`, `secondary`, `default`
- Property (optional, base): Additional property descriptor
- Prefix fields (optional): System, Theme, Domain
- Suffix modifiers (optional): Variant, State, Scale, Mode

**Example vocabulary (namespace-dependent):**
- Namespace `color`: Categories like `primary`, `secondary`, `accent`, `default`, `muted`
- Namespace `space`: Scale values like `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- Namespace `typography`: Usage types like `body`, `heading`, `caption`, `label`, `code`

**Example token names:**
- `color/primary`
- `space/md`
- `typography/body`
- `radius/button/default`

### Semantic framework

Semantic tokens assign meaning to primitive values, describing their purpose or role.

**Field structure:**
- Namespace (required): e.g., `color`, `space`, `typography`, `radius`, `motion`
- Category (required, base): Semantic category — e.g., `primary`, `secondary`, `default`
- Concept (required, base): Semantic concept — e.g., `text`, `background`, `border`, `icon`
- Property (required, base): Property descriptor — e.g., `primary`, `secondary`, `accent`
- Prefix fields (optional): System, Theme, Domain
- Suffix modifiers (optional): Variant, State, Scale, Mode

**Example vocabulary (namespace-dependent):**
- Namespace `color`: 
  - Categories: `primary`, `secondary`, `accent`, `default`, `muted`
  - Concepts: `text`, `background`, `border`, `icon`
  - Properties: `primary`, `secondary`, `accent`, `default`, `muted`, `subtle`, `strong`
- Namespace `space`: Categories like `default`, `compact`, `cozy`, `roomy`

**Example token names:**
- `color/primary/text/primary`
- `color/secondary/background/default`
- `space/default/text/default`

### Component framework

Component tokens are specific to UI components, describing their styling properties.

**Field structure:**
- Namespace (required): e.g., `color`, `space`, `typography`, `radius`, `motion`
- Group (optional, base): Component group/collection
- Component (required, base): Component type — e.g., `button`, `input`, `card`, `badge`
- Element (required, base): Element/property — e.g., `text`, `background`, `border`, `icon`
- Prefix fields (optional): System, Theme, Domain
- Suffix modifiers (optional): Variant, State, Scale, Mode

**Example vocabulary (namespace-dependent):**
- Namespace `color`:
  - Objects (components): `text`, `background`, `border`, `icon`
- Namespace `space`: Scale values like `xs`, `sm`, `md`, `lg`, `xl`
- Namespace `radius`: Objects like `button`, `card`, `input`, `badge`
- Namespace `typography`: Objects like `font-family`, `font-size`, `line-height`, `font-weight`

**Example token names:**
- `color/button/text/primary`
- `color/button/background/primary/hover`
- `space/input/padding/md`
- `radius/card/default`

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
- `color/primary/text/primary` (slash format)
- `color_primary_text_primary` (underscore format)
- `color.primary.text.primary` (dot format)

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
Users can add custom terms only if `allow_custom_terms = TRUE` for that slot.

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

**Access:**
- Vocabulary is accessed via getter functions in `src/data.js`
- Functions filter vocabulary based on namespace and current field values
- Conditional vocabulary (like motion bases) is handled by specific getter functions

---

## Controlled vocabulary

### Semantic color tokens

This taxonomy applies **only to semantic color tokens** for the semantic framework. Primitive and component color tokens are explicitly out of scope.

**Canonical structure:**
```
color / role / element / variant / emphasis / state
```

Only `role` and `element` are required. All other segments are optional and role-dependent.

#### 1. Role (required)

Roles are the **primary semantic axis**. These are intentionally few and stable.

| Role         | Definition                                    |
| ------------ | --------------------------------------------- |
| `surface`    | Backgrounds and surfaces that content sits on |
| `content`    | Foreground content such as text and icons     |
| `separator`  | Visual dividers and boundaries                |
| `action`     | Interactive, user-initiated affordances       |
| `selection`  | Indication of selection or current location   |
| `focus`      | Keyboard and accessibility focus indicators   |
| `feedback`   | System status and messaging                   |
| `decorative` | Non-functional, expressive color usage        |

**Rules:**
- A token must have exactly one role
- Roles must not reference components
- Roles must remain stable across themes

#### 2. Element (required)

Elements describe **where the color is applied**, not what component it belongs to.

**Allowed elements by role:**

| Role         | Allowed Elements                                        |
| ------------ | ------------------------------------------------------- |
| `surface`    | `background`, `overlay`, `shadow`                       |
| `content`    | `text`, `icon`                                          |
| `separator`  | `border`, `divider`                                     |
| `action`     | `background`, `on-background`, `link`                   |
| `selection`  | `background`, `on-background`, `indicator`              |
| `focus`      | `outline`, `halo`, `inner`                              |
| `feedback`   | `background`, `on-background`, `text`, `icon`, `border` |
| `decorative` | `background`, `on-background`, `text`, `icon`, `border` |

**Rules:**
- Elements must be visually literal (what is being colored)
- No component names allowed
- `on-background` is allowed only when contrast is meaningful

#### 3. Variant (optional)

Variants express **intent, hierarchy, or meaning**, not visual strength.

**Allowed variants by role:**

| Role         | Allowed Variants                                     |
| ------------ | ---------------------------------------------------- |
| `surface`    | `primary`, `secondary`, `tertiary`                   |
| `content`    | `primary`, `secondary`, `tertiary`                   |
| `separator`  | `primary`, `secondary`, `tertiary`                   |
| `action`     | `primary`, `secondary`, `tertiary`, `negative`       |
| `selection`  | `primary`, `secondary`                               |
| `focus`      | `primary`, `secondary`                               |
| `feedback`   | `neutral`, `positive`, `negative`, `warning`, `info` |
| `decorative` | *(none — decorative uses color directly)*            |

**Rules:**
- Variants must be role-specific
- Status variants (`positive`, `negative`, etc.) are only valid for `feedback`
- Decorative tokens do not encode meaning via variants

#### 4. Emphasis (optional)

Emphasis expresses **relative visual strength**, not color value or brightness.

| Emphasis Level |
| -------------- |
| `weakest`      |
| `weak`         |
| `default`      |
| `strong`       |
| `strongest`    |

**Rules:**
- Emphasis is optional but recommended
- Emphasis must be meaningful in both light and dark themes
- No color names or numeric scales allowed

#### 5. State (optional)

State captures **interaction or system changes**.

| Common States |
| ------------- |
| `default`     |
| `hover`       |
| `active`      |
| `pressed`     |
| `selected`    |
| `focus`       |
| `disabled`    |

**Rules:**
- State is optional
- Not all roles support all states
- `feedback` tokens usually omit interaction states

#### Example semantic color tokens

**Surface:**
- `color/surface/background/primary/default`
- `color/surface/overlay/secondary/weak`

**Content:**
- `color/content/text/primary/default`
- `color/content/icon/secondary/disabled`

**Action:**
- `color/action/background/primary/strong/hover`
- `color/action/link/negative/default`

**Feedback:**
- `color/feedback/background/positive/default`
- `color/feedback/text/warning/strong`

**Focus:**
- `color/focus/outline/primary/default`

#### Design decisions

- **No color names** in semantic tokens (except decorative)
- **Decorative tokens are non-semantic** and must never be required for UX clarity
- **Variants ≠ emphasis**: Variant = meaning, Emphasis = strength
- **Semantic tokens never reference components**
- **All semantic tokens must map to primitives**

#### Enforcement strategy

- Role → element → variant options are **progressively constrained**
- Invalid combinations are blocked at creation time
- Vocabulary filtering in comboboxes enforces valid combinations
- Exported tokens are guaranteed semantically valid

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
- ✅ **UI**: Accordion-based form with combobox inputs for term selection
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
   - Accordion UI pattern (can be enhanced but not replaced)
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
- ✅ Accordion-based form UI with combobox inputs
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
