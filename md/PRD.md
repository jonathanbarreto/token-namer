# Token Namer Tool — PRD (Revised v2)

## Summary
Build a web-based **token naming tool** that helps people generate consistent design token names using **three naming frameworks**, one per token tier:
- **Primitive**
- **Semantic**
- **Component**

The tool is **schema-driven**: each framework defines ordered **slots** grouped into **Prefix / Base / Suffix**, plus rules and allowed vocabulary. The UI guides users by letting them select predefined “node” terms (with definitions) and optionally add custom terms **only in explicitly allowed slots**.

**Primary output:** a **live preview** of the token name (path) that users can **copy**.

**Persistence:** The tool does **not** store generated token names in any database.

---

## Goals
- Make token names consistent without requiring users to memorize naming rules.
- Encode naming logic in a configurable schema so it can evolve without rebuilding the UI.
- Provide real-time validation with clear, actionable error messages.
- Keep the app lightweight: **assemble → validate → preview → copy**.

## Non-goals (v1)
- Persisting token names (no DB, no server-side storage).
- Persisting custom terms (they are session-only and never saved).
- Applying tokens to design tools (e.g., Figma) or syncing tokens to code repos.
- Admin UI for managing schema/vocabulary (configuration managed via JSON/YAML files in codebase).
- Export formats beyond copying the preview string.

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

Each tab loads its framework’s:
- slot schema (order, requiredness, constraints)
- allowed vocabulary per slot (terms + definitions)
- framework settings (casing rules, reserved values)

### Shared UI pattern (all tabs)

The interface uses a split-pane layout with two main areas:

**Layout structure:**
- **Desktop/Tablet**: Two-column layout (left: Node library, right: Assembler)
  - Left pane: ~40% width (flexible, minimum 300px)
  - Right pane: ~60% width (flexible, minimum 400px)
  - Both panes scroll independently if content overflows
- **Mobile**: Stacked layout (Node library above Assembler), single column, full width
- **Breakpoint**: Switch to stacked layout below 768px viewport width

**Left pane: Node library**
- **Grouped sections**: Three collapsible sections for Prefix / Base / Suffix
  - Each section header shows group name and count of visible terms
  - Sections can be expanded/collapsed independently
  - Sections render based on `slot_group` from schema
- **Node cards**: Selectable cards displaying vocabulary terms
  - Each card shows: **term** (prominent) + **description** (secondary text)
  - Status indicators: deprecated terms show warning icon/styling
  - Hover state: subtle background change, cursor pointer
  - Selected state: visual indication when term is used in current assembler
  - Disabled state: grayed out when term cannot be used (e.g., hidden status)
- **Search/filter**: Per-section or global search functionality
  - Search input at top of each section (or single global search above all sections)
  - Live filtering: results update as user types
  - Search matches against term name and description (case-insensitive)
  - "Clear search" button appears when search has text
  - Filter toggle: show/hide deprecated terms (default: show with warning styling)

**Right pane: Assembler**
- **Slot display**: Ordered slots rendered from schema
  - Each slot shows: label, required indicator (*), current value (if any)
  - Slots grouped visually by Prefix / Base / Suffix (matching node library groups)
  - Empty slots: show placeholder text (e.g., "Click to select...")
  - Filled slots: show value as chip/badge with remove button (×)
  - Focused slot: visual highlight (border, background change)
  - Error state: red border, error message below slot
- **Slot chips**: Filled values displayed as removable chips
  - Click chip to edit/replace value
  - Remove button (×) on hover/focus to clear slot
  - Custom term indicator: visual distinction (e.g., dashed border, "custom" badge)
- **Live preview**: Prominent display of generated token name
  - Sticky positioning: stays visible when scrolling
  - Large, monospace font for readability
  - Visual distinction between filled and empty segments
  - Empty segments shown as grayed-out placeholders (e.g., `_`)
  - Click-to-copy functionality (keyboard shortcut: Cmd/Ctrl+C when focused)
- **Validation panel**: Display errors and warnings
  - Located below preview or as inline messages per slot
  - Errors: red styling, block Copy action
  - Warnings: yellow/orange styling, Copy still allowed
  - Most critical error shown first if multiple exist
- **Preview separator control**: Toggle between `/` and `_`
  - Radio buttons or segmented control
  - Located near preview area
  - Default: `/` selected
  - Updates preview immediately on change

**Visual states:**
- **Empty slot**: Grayed placeholder, dashed border (optional)
- **Filled slot**: Solid background/border, value displayed as chip
- **Focused slot**: Highlighted border (e.g., blue), subtle background tint
- **Error state**: Red border, error icon, error message text
- **Warning state**: Orange/yellow border, warning icon
- **Disabled state**: Reduced opacity, not interactive
- **Custom term indicator**: Dashed border or "custom" badge to distinguish from predefined terms

---

## Framework examples

To illustrate how the three frameworks differ, here are concrete examples:

### Primitive framework

Primitive tokens represent the most basic design values without semantic meaning.

**Example slot schema:**
- Slot 1 (Prefix): category — e.g., `color`, `spacing`, `typography`
- Slot 2 (Base): scale value — e.g., `50`, `100`, `200`, `500`, `900`

**Example vocabulary:**
- Prefix slot: `color`, `spacing`, `typography`, `radius`, `motion`
- Base slot: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`

**Example token names:**
- `color/500`
- `spacing/200`
- `typography/400`
- `radius/100`

### Semantic framework

Semantic tokens assign meaning to primitive values, describing their purpose or role.

**Example slot schema:**
- Slot 1 (Prefix): category — e.g., `color`, `spacing`, `typography`
- Slot 2 (Base): semantic role — e.g., `semantic`, `surface`, `interactive`
- Slot 3 (Suffix): specific use — e.g., `background`, `text`, `border`
- Slot 4 (Suffix): hierarchy/intent — e.g., `primary`, `secondary`, `default`
- Slot 5 (Suffix): emphasis — e.g., `strong`, `weak`, `weakest` (optional)

**Example vocabulary:**
- Category (Prefix): `color`, `spacing`, `typography`
- Role (Base): `semantic`, `surface`, `interactive`, `focus`
- Use (Suffix): `background`, `text`, `border`, `icon`
- Intent (Suffix): `primary`, `secondary`, `accent`, `default`, `muted`
- Emphasis (Suffix, optional): `strong`, `weak`, `weakest`, `subtle`

**Example token names:**
- `color/semantic/surface/background/primary`
- `color/semantic/interactive/text/primary/strong`
- `spacing/semantic/surface/default/weakest`

### Component framework

Component tokens are specific to UI components, describing their styling properties.

**Example slot schema:**
- Slot 1 (Prefix): category — e.g., `color`, `spacing`, `typography`
- Slot 2 (Base): component type — e.g., `button`, `input`, `card`
- Slot 3 (Suffix): property — e.g., `background`, `border`, `text`
- Slot 4 (Suffix): variant/state — e.g., `primary`, `hover`, `disabled` (optional)

**Example vocabulary:**
- Category (Prefix): `color`, `spacing`, `typography`, `radius`, `shadow`
- Component (Base): `button`, `input`, `card`, `badge`, `modal`
- Property (Suffix): `background`, `border`, `text`, `icon`, `padding`
- Variant/State (Suffix, optional): `primary`, `secondary`, `hover`, `active`, `focus`, `disabled`

**Example token names:**
- `color/button/background/primary`
- `color/button/text/primary/hover`
- `spacing/input/padding/default`
- `radius/card/default`

---

## Naming rules (new context)

### 1) Live preview separators (user-selected)
- Between **path segments** (slot outputs), the user can choose either:
  - `/` **or**
  - `_`
- Default separator is `/`.
- The separator selection is **UI state** and applies to the current preview (and copy output).

Examples:
- `color/semantic/surface/background/primary/weakest`
- `color_semantic_surface_background_primary_weakest`

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

**Focus model:**
- Slots can be explicitly focused by clicking on them
- Focused slot is visually highlighted (border, background change)
- Only one slot can be focused at a time
- If no slot is focused, the next valid empty slot is implicitly "targeted" for selection

**Selection behavior:**
When a user clicks a node card (predefined vocabulary term):
- If a slot is explicitly focused: fills that focused slot
- If no slot is focused: fills the first empty required slot, or first empty optional slot if all required are filled
- If all slots are filled: replaces the focused slot (or last slot if none focused)
- Selection immediately updates live preview

**Removal/replacement:**
- Users can click a filled slot's chip to remove its value (or use remove button ×)
- Users can click a filled slot to focus it, then select a different term to replace it
- Replacing a slot does not affect other slots' values
- Removing a slot clears its value and updates preview immediately

**Keyboard navigation:**
- Tab key: moves focus between slots in order (`slot_order`)
- Shift+Tab: moves focus backwards
- Enter/Space on focused slot: opens selection menu or focuses node library (implementation-dependent)
- Arrow keys in node library: navigate between node cards
- Escape: clears focus

**Edge cases:**
- All slots filled: clicking a node card replaces focused slot, or last slot if none focused
- Required slots: cannot be left empty if validation runs (but user can temporarily clear during editing)
- Optional slots: can be cleared even if required slots are empty
- Slot focus is preserved when switching between tabs (each framework maintains its own focus state)

**Acceptance criteria**
- Users can replace a slot without resetting the entire name.
- Removing a slot updates the preview instantly.
- Focus management works intuitively with both mouse and keyboard.
- Selection targets the focused slot when one is focused.

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

### R8 — Segment character constraints (DTCG-aligned + preview-safe)
Each segment (slot output) must:
- **NOT** start with `$`
- **NOT** contain `.`, `{`, `}`
- **NOT** contain `/` or `_` (reserved for segment joining in preview)
- Use `-` only for multi-word terms within a segment

**Acceptance criteria**
- Any segment containing forbidden characters is rejected with a specific error.
- Users cannot accidentally create ambiguous paths by including `/` or `_` in a segment.

---

### R9 — Preview separator control
- Provide a UI control to switch the preview separator between `/` and `_`.
- Default selection is `/`.
- Changing the separator updates the live preview immediately.
- Copy uses the currently selected separator.

**Acceptance criteria**
- Switching separators updates preview instantly without altering selected terms.
- Reset clears slots but does not change the current separator selection.

---

### R10 — Copy and reset

**Copy functionality:**
- **Copy button**: Located prominently near the live preview
- **Action**: Copies the live preview string (with current separator) to clipboard
- **State**: Disabled when blocking validation errors exist (visually grayed out, not clickable)
- **Feedback**: Shows success toast/notification "Copied to clipboard"
- **Keyboard shortcut**: Cmd/Ctrl+C when preview area is focused

**Reset functionality:**
- **Reset button**: Located near the Copy button or in the assembler area
- **Action**: Clears all slot values for the active framework/tab only
- **Scope**: Only affects the current tab's session state
- **Preserves**: Does not change the current tab selection, does not reset preview separator selection
- **Confirmation**: No confirmation dialog required (immediate action)
- **Feedback**: Shows toast/notification "Reset complete" or similar

**Acceptance criteria**
- Copy is disabled when blocking validation errors exist.
- Reset does not affect other tabs.
- Reset does not change the preview separator selection.
- Copy uses the currently selected separator.

---

## Configuration model

Configuration is stored as JSON or YAML files within the codebase (recommended for MVP). The structure maps to the following data model:

### Data structure: `framework_slots`
One entry per slot defining the slot schema.
- `framework_id` (string: "primitive" | "semantic" | "component")
- `slot_id` (string: stable unique key)
- `slot_group` (string: "prefix" | "base" | "suffix")
- `slot_order` (number: integer)
- `slot_label` (string: human-readable label)
- `required` (boolean)
- `allow_custom_terms` (boolean)
- `min_len` (number, optional)
- `max_len` (number, optional)
- `pattern` (string, optional regex)
- `notes` (string, optional)

### Data structure: `slot_vocab`
One entry per allowed vocabulary term.
- `framework_id` (string)
- `slot_id` (string)
- `term` (string)
- `description` (string)
- `status` (string: "active" | "hidden" | "deprecated")

### Data structure: `rules_dependencies` (optional)
Defines conditional vocabulary rules between slots.
- `framework_id` (string)
- `if_slot_id` (string)
- `if_term` (string or "*" for any)
- `then_slot_id` (string)
- `allow_terms` (string[], optional)
- `block_terms` (string[], optional)
- `message` (string)

### Data structure: `settings`
Framework-level settings.
- `framework_id` (string)
- `case_rule` (string, default: "kebab")
- `reserved_terms` (string[]: array of reserved term strings)
- `reserved_prefixes` (string[]: array of reserved prefix strings)

### UI settings (not stored in config)
These are managed in application state only:
- `preview_separator` (string: user-selected; default "/"; allowed: "/" and "_")

### Configuration file examples

Here's an example JSON structure for a complete framework configuration:

```json
{
  "framework_id": "primitive",
  "slots": [
    {
      "slot_id": "category",
      "slot_group": "prefix",
      "slot_order": 1,
      "slot_label": "Category",
      "required": true,
      "allow_custom_terms": false,
      "min_len": 2,
      "max_len": 20
    },
    {
      "slot_id": "scale",
      "slot_group": "base",
      "slot_order": 2,
      "slot_label": "Scale",
      "required": true,
      "allow_custom_terms": true,
      "pattern": "^[0-9]+$"
    }
  ],
  "vocabulary": [
    {
      "slot_id": "category",
      "term": "color",
      "description": "Color tokens",
      "status": "active"
    },
    {
      "slot_id": "category",
      "term": "spacing",
      "description": "Spacing tokens",
      "status": "active"
    },
    {
      "slot_id": "category",
      "term": "typography",
      "description": "Typography tokens",
      "status": "active"
    },
    {
      "slot_id": "scale",
      "term": "50",
      "description": "Scale value 50",
      "status": "active"
    },
    {
      "slot_id": "scale",
      "term": "100",
      "description": "Scale value 100",
      "status": "active"
    },
    {
      "slot_id": "scale",
      "term": "500",
      "description": "Scale value 500",
      "status": "active"
    },
    {
      "slot_id": "scale",
      "term": "900",
      "description": "Scale value 900",
      "status": "active"
    }
  ],
  "settings": {
    "case_rule": "kebab",
    "reserved_terms": [],
    "reserved_prefixes": []
  }
}
```

Example for semantic framework:

```json
{
  "framework_id": "semantic",
  "slots": [
    {
      "slot_id": "category",
      "slot_group": "prefix",
      "slot_order": 1,
      "slot_label": "Category",
      "required": true,
      "allow_custom_terms": false
    },
    {
      "slot_id": "role",
      "slot_group": "base",
      "slot_order": 2,
      "slot_label": "Role",
      "required": true,
      "allow_custom_terms": false
    },
    {
      "slot_id": "use",
      "slot_group": "suffix",
      "slot_order": 3,
      "slot_label": "Use",
      "required": true,
      "allow_custom_terms": false
    },
    {
      "slot_id": "intent",
      "slot_group": "suffix",
      "slot_order": 4,
      "slot_label": "Intent",
      "required": true,
      "allow_custom_terms": false
    },
    {
      "slot_id": "emphasis",
      "slot_group": "suffix",
      "slot_order": 5,
      "slot_label": "Emphasis",
      "required": false,
      "allow_custom_terms": true
    }
  ],
  "vocabulary": [
    {
      "slot_id": "category",
      "term": "color",
      "description": "Color tokens",
      "status": "active"
    },
    {
      "slot_id": "role",
      "term": "semantic",
      "description": "Semantic role",
      "status": "active"
    },
    {
      "slot_id": "use",
      "term": "background",
      "description": "Background use",
      "status": "active"
    },
    {
      "slot_id": "use",
      "term": "text",
      "description": "Text use",
      "status": "active"
    },
    {
      "slot_id": "intent",
      "term": "primary",
      "description": "Primary intent",
      "status": "active"
    },
    {
      "slot_id": "intent",
      "term": "secondary",
      "description": "Secondary intent",
      "status": "active"
    },
    {
      "slot_id": "emphasis",
      "term": "strong",
      "description": "Strong emphasis",
      "status": "active"
    },
    {
      "slot_id": "emphasis",
      "term": "weak",
      "description": "Weak emphasis",
      "status": "deprecated"
    }
  ],
  "settings": {
    "case_rule": "kebab",
    "reserved_terms": ["default", "base"],
    "reserved_prefixes": ["system"]
  }
}
```

**File organization example:**
- Single file: `config/frameworks.json` — contains array of all framework configs
- Per-framework: `config/primitive.json`, `config/semantic.json`, `config/component.json` — each contains one framework config
- Separated: `config/schemas.json` (slots) + `config/vocabulary.json` (terms) — split structure

---

## Data source implementation

### Primary approach: JSON/YAML files in codebase

Configuration is stored as JSON or YAML files within the project structure, typically in a `src/config/` directory (or similar). This approach is recommended for MVP.

**File organization options:**
- Single unified file: `config/frameworks.json` containing all frameworks
- Per-framework files: `config/primitive.json`, `config/semantic.json`, `config/component.json`
- Separate vocab files: `config/frameworks.json` (schemas) + `config/vocabulary.json` (terms)

**Benefits:**
- Version-controlled alongside code
- No external API dependencies
- Fast loading (no network requests)
- Easy to update and iterate
- Can be statically imported or fetched at runtime

**Loading mechanism:**
- Config files can be statically imported (ES modules) or fetched via fetch API
- Load once at application startup
- Cache in memory per framework after first load
- Validate schema structure on load

**Error handling:**
- If config files fail to load: show error message, disable affected framework tabs
- If config files are malformed: show validation error with details
- Fallback: graceful degradation (disable functionality, show error state)

**Important: Config vs Session state**
- **Config data (JSON/YAML)**: Contains only predefined vocabulary terms and schemas. These are permanent and version-controlled.
- **Session state**: Includes user-selected terms from config AND any custom terms entered by users. Custom terms are ephemeral and never saved to config files.

### Alternative approach: External data sources (Phase 2+)

For future iterations, the same data structure can be loaded from external sources:
- Google Sheets (via API)
- Airtable (via API)
- Headless CMS
- Database

The JSON/YAML structure serves as the canonical format, ensuring compatibility with any future migration.

---

## Technical architecture

### Schema data structure

The configuration files use a structured format that maps to the data model above. Here's a TypeScript-like type definition for reference:

```typescript
interface FrameworkConfig {
  framework_id: "primitive" | "semantic" | "component";
  slots: Slot[];
  vocabulary: VocabularyTerm[];
  settings: FrameworkSettings;
  dependencies?: DependencyRule[];
}

interface Slot {
  slot_id: string;
  slot_group: "prefix" | "base" | "suffix";
  slot_order: number;
  slot_label: string;
  required: boolean;
  allow_custom_terms: boolean;
  min_len?: number;
  max_len?: number;
  pattern?: string;
  notes?: string;
}

interface VocabularyTerm {
  slot_id: string;
  term: string;
  description: string;
  status: "active" | "hidden" | "deprecated";
}

interface FrameworkSettings {
  case_rule: string; // default: "kebab"
  reserved_terms: string[];
  reserved_prefixes: string[];
}

interface DependencyRule {
  if_slot_id: string;
  if_term: string | "*";
  then_slot_id: string;
  allow_terms?: string[];
  block_terms?: string[];
  message: string;
}
```

### Validation engine

Validation runs in real-time on every state change:

1. **Slot-level validation**: Checks each slot's value against its constraints
   - Required field check
   - Min/max length (if specified)
   - Pattern/regex match (if specified)
   - Character constraints (R8)

2. **Framework-level validation**: Checks against framework settings
   - Reserved terms/prefixes check
   - Uniqueness across slots (R6)
   - Dependency rules (if enabled)

3. **Normalization**: Custom terms are normalized (R5) before validation
   - Applied before uniqueness checks
   - Normalized form is what appears in preview

4. **Error aggregation**: Collects all errors/warnings
   - Errors block Copy action
   - Warnings allow Copy but show guidance

### State management

**Configuration state (loaded from JSON/YAML):**
- Loaded once at application startup
- Cached in memory per framework
- Read-only during runtime
- Contains only predefined vocabulary and schema

**Session state (runtime):**
- Per-framework state: stores selected values for each slot
  - Slot values can be predefined terms (from config) or custom terms (user-entered)
  - Custom terms are stored separately to distinguish from config vocabulary
- Tab/active framework: tracks which framework tab is currently selected
- Preview separator: user-selected separator (`/` or `_`)
- Validation state: current errors/warnings per slot
- Focus state: which slot is currently focused

**State separation:**
- Config data (JSON/YAML) is separate from session state
- Custom terms exist only in session state, never in config
- On tab switch: session state per framework is preserved independently
- On reset: clears session state for active framework only

### Slot group rendering

Slot groups (prefix/base/suffix) affect UI organization:

- **Left pane (Node library)**: Vocabulary terms are grouped by `slot_group`
  - Sections labeled "Prefix", "Base", "Suffix"
  - Terms within each section are for slots that belong to that group
  - Multiple slots can share the same group

- **Right pane (Assembler)**: Slots are rendered in order but can be visually grouped
  - Slots render in `slot_order` sequence
  - Visual grouping by `slot_group` helps users understand structure
  - Group headers optional but helpful for clarity

### Vocabulary filtering

Terms are filtered based on status:

- **active**: Shown normally, selectable
- **hidden**: Not shown in node library (unless filter enabled for admin/debug)
- **deprecated**: Shown with warning styling, selectable but shows warning message

Filtering happens at render time:
- Default: show active + deprecated (with warning styling)
- Optional toggle: show/hide deprecated terms
- Hidden terms never shown to users (reserved for future use)

---

## Caching and performance
- Cache config in memory per framework after first load.
- Optional localStorage cache for config with a TTL and/or version hash (useful for external sources).
- No caching of generated names beyond the current session state.
- Custom terms exist only in session state and are not cached.

---

## Accessibility

### Keyboard navigation

**Tab navigation:**
- Tab key: moves focus forward through interactive elements in logical order
- Shift+Tab: moves focus backward
- Navigation order: Framework tabs → Slots (in slot_order) → Node cards → Preview separator → Copy/Reset buttons

**Framework tabs:**
- Arrow keys (left/right): navigate between framework tabs
- Enter/Space: activates selected tab
- Home/End: jump to first/last tab

**Slots:**
- Tab: moves focus to next slot in `slot_order`
- Shift+Tab: moves focus to previous slot
- Enter/Space on focused slot: activates slot (opens selection or focuses node library)
- Delete/Backspace on focused filled slot: clears slot value

**Node library:**
- Arrow keys (up/down): navigate between node cards
- Arrow keys (left/right): navigate between sections (Prefix/Base/Suffix)
- Enter/Space: selects focused node card
- Escape: returns focus to slot assembler

**Preview separator:**
- Arrow keys (left/right): changes separator selection
- Enter/Space: toggles separator (if implemented as toggle)

**Copy/Reset buttons:**
- Enter/Space: activates button
- Copy button disabled state: announced by screen reader, focusable but not activatable

### Screen reader support

**ARIA roles and labels:**

- **Framework tabs**:
  - Role: `tablist` (container), `tab` (each tab), `tabpanel` (content)
  - `aria-label`: "Framework selection" (tablist)
  - `aria-selected`: indicates active tab
  - `aria-controls`: links tab to its panel

- **Slots**:
  - Role: `group` or `textbox` (depending on implementation)
  - `aria-label`: uses `slot_label` from schema (e.g., "Category, required")
  - `aria-required`: `true` for required slots
  - `aria-describedby`: points to error/warning message element (if present)
  - `aria-invalid`: `true` when slot has error, `false` otherwise
  - `aria-live="polite"`: on error message containers

- **Node cards**:
  - Role: `button`
  - `aria-label`: term name + description (e.g., "color: Color tokens")
  - `aria-pressed`: indicates if term is selected/used in assembler

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

### Current state (existing codebase)
The current implementation uses hardcoded data structures in `src/data.js`:
- `NAMESPACES`: array of namespace strings
- `OBJECTS_BY_NAMESPACE`: object mapping namespaces to objects
- `BASES_BY_NAMESPACE`: object mapping namespaces to bases
- Simple validation and formatting functions

### Migration approach

1. **Create configuration files**: Convert hardcoded data to JSON/YAML format
   - Map current `NAMESPACES` to framework slot vocabulary
   - Map `OBJECTS_BY_NAMESPACE` to slot vocabulary terms
   - Map `BASES_BY_NAMESPACE` to slot vocabulary terms
   - Create slot schema definitions based on current structure

2. **Implement schema engine**: Build system to load and parse config files
   - Load JSON/YAML files at startup
   - Parse and validate structure
   - Cache in memory

3. **Refactor UI**: Update from simple form to node library + assembler pattern
   - Convert dropdown selects to node card selection
   - Implement slot-based assembler UI
   - Add framework tabs

4. **Preserve functionality**: Ensure existing features continue to work
   - Validation rules (enhanced with new schema-driven validation)
   - Format options (preview separator)
   - Copy functionality
   - History (if applicable)

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

### Phase 0 — Definition
- Draft slot schemas for all three frameworks
- Create vocabulary lists for each framework
- Define slot groups (prefix/base/suffix) and ordering
- Confirm reserved terms/prefixes and slot-level patterns
- Decide deprecated-term behavior (warning vs blocked)
- Create initial JSON/YAML configuration files

### Phase 1 — MVP
- Config loading: JSON/YAML file loading and parsing
- Schema engine: slot rendering and vocabulary lookup
- 3 tabs (Primitive/Semantic/Component) with framework switching
- Node library: vocabulary display with Prefix/Base/Suffix grouping
- Slot assembler: ordered slots with chip-based value display
- Live preview: real-time token name generation with separator toggle
- Copy + reset: copy to clipboard and clear slots
- Preview separator toggle (`/` default, `_` optional)
- Custom term creation with normalization + uniqueness checks
- Basic validation: required slots, character constraints, uniqueness

### Phase 1.5 (optional)
- Dependency rules (conditional vocabulary)
- Deprecated term warnings + guidance messages
- Better discoverability: improved search, recent terms, presets
- Enhanced error messages with actionable guidance

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

4. **Preview separator**: User preference, stored in session state only, default `/`, alternative `_`.

5. **Framework independence**: Each framework (Primitive/Semantic/Component) maintains its own session state independently. Switching tabs preserves state per framework.

6. **Reset behavior**: Clears only session state for active framework, does not affect other tabs or separator selection.

7. **Error display**: Inline per slot + optional summary panel + status message. All blocking errors visible, most critical shown in status.
