# Token Naming Framework Documentation

## *Introduction*

This document provides comprehensive documentation for the token naming system used in the Token Namer tool. The system is built on a three-tier architecture that separates raw values from semantic meaning and component-specific styling.

### **Three-Tier Token System**
The token naming system consists of three distinct tiers, each serving a specific purpose:

1. **Primitive Tokens**: Primitive tokens store all the raw data in a platform and usage-agnostic way. In most cases, this level of tokens is not intended for standalone usage and serves as a foundational level of abstraction.
2. **Semantic Tokens**: The middle layer that adds meaning and intent to primitive values. A semantic token, also known as an alias token, is an abstraction layer that reflects the usage of a value in the UI instead of the literal value.
3. **Component Tokens**: The top layer providing component-specific styling overrides. Their primary role is to represent the properties associated with a component. Unlike the previous two tiers, these tokens are self-contained, meaning modifying the underlying value of the token will not affect anything outside the component it's used in.


### **Framework Philosophy**
- **Primitive tokens** must never encode meaning, usage, state, or component intent. They are pure value and name pairing. These are design options.
- **Semantic tokens** describe intended use and context, enabling theming and consistent application across components. These are design decisions.
- **Component tokens** provide stable override points for component anatomy that needs explicit control. These are specific design usage.

### How Frameworks Relate
Tokens flow from primitive → semantic → component:
- Semantic tokens alias primitive tokens
- Component tokens typically alias semantic tokens (with exceptions for component-specific needs)
- This hierarchy enables theming, consistency, and maintainability

____________________________________________________

## *Naming Frameworks*

#### **Global naming rules**
- Names must not contain `{`, `}`, or `.`
- Every token must have a `$type` available (on the token or inherited from a parent group)
- Optional variants under a step: if you need both "base" and "variants" under the same step, use the reserved `$root` token inside the group
- Avoid introducing variants for platform, theme, density, or usage intent.
   - If you think you need a new variant type, it’s usually a sign you need:
      - a new primitive **category**, or
      - a **mode/collection**, not a suffix.

### **Primitive Framework**
Primitive tokens define the raw, literal values of the system. They are the lowest level of abstraction and must not encode meaning, usage, state, or component intent.

Primitive tokens exist to:
- Provide stable, reusable value ramps and scales
- Enable deterministic aliasing into semantic and component tokens
- Act as the single source of truth for values across tools and platforms

#### **Structure**
Primitives use one of two shapes:
- `<property>/<identifier>`
- `<property>/<group>/<identifier>` *(only when the property defines groups)*

Where:
- `<property>` is the DTCG-aligned value type (e.g., `color`, `dimension`, `fontSize`)
- `<group>` is the property-defined grouping segment (e.g., color hue, dimension type, shadow attribute, fontFamily group)
- `<identifier>` is the step or discrete key inside that property (or group)

Category-specific schemas:
- `color/<hue>/<step(-aNN)?>`              # alpha encoded as suffix on identifier (e.g., 500-a20)
- `dimension/<type>/<step>`               # space/size/radius/stroke-width/breakpoint
- `shadow/<attribute>/<step>`             # offset-x/offset-y/blur/spread
- `fontFamily/<group>/<name>`             # group allows system vs brand stacks
- `fontWeight/<step>`
- `textCase/<value>`
- `textDecoration/<value>`
- `fontSize/<step>`
- `lineHeight/<step>`
- `letterSpacing/<step>`                  # use neg-<abs> for negatives
- `opacity/<step>`
- `blur/<step>`
- `duration/<step>`
- `easing/<curve>`

#### **Field Definitions**

| Field | Required | Description |
|-------|----------|-------------|
| **Property** | Yes | The kind of value the token stores (aligned to DTCG types), like `color`, `dimension`, `fontFamily`, `fontSize`. |
| **Group** | No | A property-defined grouping segment. Examples: color hue (`blue`, `gray`), dimension type (`space`, `radius`), shadow attribute (`offset-x`). Omit when the property has no groups. |
| **Identifier** | Yes | The step or discrete key. Numeric for ramp categories (e.g., `8`, `200`, `500`), controlled terms for discrete categories (e.g., `uppercase`, `underline`). |

#### **Naming Rules**
- Property is required and must be from the allowed list. This segment is the primary classifier and should align with `$type`.
- Group is optional and only allowed where the property defines groups (e.g., `color/<hue>`, `dimension/<type>`, `shadow/<attribute>`, `fontFamily/<group>`).
- Identifier formatting:
  - Numeric identifiers: digits only (no units).
  - Controlled-term identifiers: lowercase kebab-case (e.g., `uppercase`, `line-through`).
  - Negative values: use `neg-<abs>` encoding (e.g., `neg-2`) and only where explicitly allowed.
- Color alpha:
  - Alpha is encoded as a suffix on the identifier: `<step>-aNN`
  - `NN` ranges `0–100` (e.g., `500-a20` = 20% alpha)
  - Omit the alpha suffix when fully opaque.
- Dimension negatives:
  - Allow negatives only for `dimension/space/*`
  - Disallow negatives for `dimension/size`, `dimension/radius`, `dimension/stroke-width`, `dimension/breakpoint`

#### **Example Token Names**
- `color/blue/500`
- `color/blue/500-a20`
- `dimension/space/8`
- `dimension/space/neg-8`
- `dimension/size/24`
- `dimension/radius/4`
- `dimension/stroke-width/1`
- `dimension/breakpoint/768`
- `shadow/offset-x/0`
- `shadow/offset-y/neg-4`
- `shadow/blur/16`
- `shadow/spread/0`
- `fontSize/16`
- `lineHeight/24`
- `letterSpacing/neg-2`
- `fontFamily/system/sans`
- `fontWeight/600`
- `textCase/uppercase`
- `textDecoration/underline`
- `opacity/60`
- `duration/200`
- `easing/standard`



____________________________________________________

### **Semantic Framework**
Semantic tokens describe the intended use or context of a value rather than the raw value itself. They reside in the middle layer of abstraction, mapping intent (like "action" or "surface") to specific primitive values.

#### **Structure**
This structure matches how people actually reason about color decisions: purpose → anatomy → option → behavior.

```
<role>/<element>/<variant>/<emphasis?>/<state?>/<context?>
```


#### **Field definitions**

| Field | Required | Description |
|------|----------|-------------|
| **Role** | Yes | The *purpose* of the token (intent-first). Examples: `surface`, `content`, `separator`, `action`, `selection`, `focus`, `feedback`, `decorative`, `data-viz`. |
| **Element** | Yes | The UI anatomy being styled. Examples: `background`, `text`, `icon`, `border`, `divider`, `outline`, `link`, `indicator`, `on-background`. |
| **Variant** | No | The categorical option within a role (hierarchy or meaning). Examples: `primary`, `secondary`, `tertiary`, `positive`, `negative`, `warning`, `info`, `discovery`. |
| **State** | No | Transient interaction/condition changes. Examples: `hover`, `pressed`, `disabled`, `visited`. |
| **Emphasis** | No | Visual strength ladder. Use sparingly. Examples: `weakest`, `weak`, `strong`, `strongest`. |
| **Context** | No | A known rendering environment that changes contrast requirements. Examples: `inverse`, `on-media`, `on-accent`. |

#### **Non-negotiables**

- **Role-leading is mandatory.** The first segment must communicate *intent*, not data type or component.
- **Selection is not a state.** Persistent “chosen” visuals belong under the `selection` role (not `.../selected`).
- **Feedback is not a state.** Meaningful outcomes (error/warn/success/info) belong under the `feedback` role (not `.../invalid`).
- **Context ≠ Variant.** `inverse` is a rendering context, not a hierarchy choice.
- **Emphasis is optional.** If you can express the difference with `primary/secondary/tertiary`, do that and skip emphasis.

#### **Allowed element guidance (rules of thumb)**

- `surface` owns containers and planes: `background`, `overlay`, `shadow`
- `content` owns readability foregrounds: `text`, `icon`, `link`
- `separator` owns structural edges/lines: `border`, `divider`, `outline` (when structural)
- `action` owns interactive affordances: `background`, `on-background`, `border`, `link`
- `selection` owns persistent chosen state: `background`, `on-background`, `indicator`
- `focus` owns focus affordance: `outline`, `halo`, `inner`
- `feedback` owns outcome communication: `background`, `on-background`, `text`, `icon`, `border`
- `decorative` owns non-functional brand expression (avoid using for UI meaning)
- `data-viz` owns charting system colors: `series`, `axis`, `label`, `grid`, `background`

#### **Examples**

- `surface/background/default`
- `surface/background/raised`
- `content/text/primary`
- `content/text/secondary/inverse`
- `separator/border/default`
- `action/background/primary/hover`
- `action/text/primary`
- `status/text/positive`
- `status/background/negative`
- `focus/outline/default`
- `shadow/elevated/default`

---

### **Component Framework**
Component tokens are specific to UI components, describing their styling properties. They provide stable override points for component anatomy that needs explicit control.

#### **Structure**

```
<component>/<part>/<property>/<variant?>/<state?>/<context?>
```

#### **Field Definitions**

| Field | Required | Description |
|-------|----------|-------------|
| **Component** | Yes | The specific UI component this token belongs to, like `button`, `text-field`, or `nav-item`. |
| **Part** | Yes | The component sub-area being styled, like `container`, `label`, `icon`, `track`, or `thumb`. |
| **Property** | Yes | The visual attribute being set, like `background`, `text`, `border-color`, `radius`, or `shadow`. |
| **Variant** | No | The component option that changes styling, like `primary`, `secondary`, `outline`, or `compact`. |
| **State** | No | The component interaction/condition, like `hover`, `pressed`, `disabled`, `selected`, or `focus`. |
| **Context** | No | A special rendering environment that changes contrast needs, like `inverse` or `on-media`. |

#### **Naming Rules**

- Use variant for component styling variants (e.g., primary/secondary, outline/ghost, compact/spacious). If there's no meaningful variant, omit it
- Default behavior: component tokens should alias semantic tokens; use component tokens only for stable override points or component anatomy that needs explicit control
- DTCG JSON-safe naming: no segment starts with `$`; no `.`, `{`, `}` in any segment
- Token vs group collision: if you need a base value and nested state keys under the same node, store the base as `$root` in JSON and keep state variants as siblings. (Figma names omit `$root`.)
- Avoid over-tokenizing: don't create component tokens for every value—start with high-impact properties (background/text/border/focus/shadow/radius) and only add more when you have real theming needs

#### **Example Token Names**

- `button/container/background/primary/enabled`
- `button/label/text/primary/hover`
- `text-field/field/border-color/invalid`
- `card/container/radius`
- `dialog/container/background`

---

## *Controlled Vocabulary*

### **Primitive Vocabulary**
Primitive vocabulary defines the allowed terms for each primitive naming segment.

### Primitive naming framework
Primitives use one of two shapes:
- `<property>/<identifier>` *(default)*
- `<property>/<group>/<identifier>` *(only when the property defines groups)*

### Primitive validation rules
- Names must follow either:
  - `<property>/<identifier>` or
  - `<property>/<group>/<identifier>` (only when the property defines groups).
- Grouped properties:
  - `color/<hue>/<identifier>`
  - `dimension/<type>/<identifier>`
  - `shadow/<attribute>/<identifier>`
  - `fontFamily/<group>/<identifier>`
- Ungrouped properties:
  - `opacity/<identifier>`
  - `blur/<identifier>`
  - `fontWeight/<identifier>`
  - `textCase/<identifier>`
  - `textDecoration/<identifier>`
  - `fontSize/<identifier>`
  - `lineHeight/<identifier>`
  - `letterSpacing/<identifier>`
  - `duration/<identifier>`
  - `easing/<identifier>`
  - `layer/<identifier>`
- Numeric identifiers must be digits only (no units).
- Negative numeric identifiers must use `neg-<abs>` and are only allowed where explicitly permitted (e.g., `dimension/space/*`, `shadow/offset-*/*`, `shadow/spread/*`, `letterSpacing/*`).
- `dimension/breakpoint/*` identifiers must be literal integers (no `xs/sm/md` in primitives).
- Color alpha is encoded as `-aNN` suffix on the identifier (e.g., `500-a20`), where `NN` is `0–100`.

#### Properties
| Term | Definition | Pattern |
|---|---|---|
| **color** | Color values (hues, shades, tints) | `color/<hue>/<step(-aNN)?>` |
| **dimension** | Measurement values (literal sizes/lengths) | `dimension/<type>/<step>` |
| **opacity** | Opacity values (transparency levels) | `opacity/<step>` |
| **shadow** | Shadow effect primitives (per-attribute values) | `shadow/<attribute>/<step>` |
| **blur** | Blur effect values (backdrop blur, gaussian blur) | `blur/<step>` |
| **fontFamily** | Font family primitives (typeface families/stacks) | `fontFamily/<group>/<name>` |
| **fontWeight** | Font weight values (text thickness) | `fontWeight/<step>` |
| **textCase** | Text casing values | `textCase/<value>` |
| **textDecoration** | Text decoration values | `textDecoration/<value>` |
| **fontSize** | Font size values (text sizing) | `fontSize/<step>` |
| **lineHeight** | Line height values (text line spacing) | `lineHeight/<step>` |
| **letterSpacing** | Letter spacing values (character spacing) | `letterSpacing/<step>` |
| **duration** | Animation duration values (time in ms) | `duration/<step>` |
| **easing** | Animation easing values (timing functions) | `easing/<curve>` |
| **layer** | Z-index layer values (stacking order) | `layer/<level>` |

---

#### Groups (allowed values by grouped property)

##### Color hues (`color/<hue>/...`)

| Term | Definition |
|---|---|
| **white** | White hue |
| **black** | Black hue |
| **gray** | Neutral gray hue |
| **blue** | Blue hue |
| **red** | Red hue |
| **yellow** | Yellow hue |
| **green** | Green hue |
| **cyan** | Cyan hue |
| **indigo** | Indigo hue |
| **orange** | Orange hue |
| **pink** | Pink hue |
| **purple** | Purple hue |
| **teal** | Teal hue |
| **shamrock** | Shamrock hue |
| **olive** | Olive hue |
| **rose** | Rose hue |
| **violet** | Violet hue |

> Rule: For `color`, `<group>` is always a hue.

##### Dimension types (`dimension/<type>/...`)

| Term | Definition | Pattern |
|---|---|---|
| **space** | Spacing values (margins, padding, gaps) | `dimension/space/<step>` |
| **size** | Size values (dimensions, widths, heights) | `dimension/size/<step>` |
| **radius** | Corner rounding values | `dimension/radius/<step>` |
| **stroke-width** | Stroke thickness values (borders, dividers, rings) | `dimension/stroke-width/<step>` |
| **breakpoint** | Responsive breakpoint thresholds (**literal numeric**) | `dimension/breakpoint/<step>` |

##### Shadow attributes (`shadow/<attribute>/...`)

| Term | Definition | Pattern |
|---|---|---|
| **offset-x** | Horizontal shadow offset | `shadow/offset-x/<step>` |
| **offset-y** | Vertical shadow offset | `shadow/offset-y/<step>` |
| **blur** | Shadow blur radius | `shadow/blur/<step>` |
| **spread** | Shadow spread radius | `shadow/spread/<step>` |

> Rule: Shadow **color** should reference `color/*` tokens. Shadow **opacity** should reference `opacity/*` tokens (or be encoded in the chosen shadow color value).  
> Rule: `blur/*` is reserved for **filter/backdrop blur**. Use `shadow/blur/*` only for shadow geometry.

---

#### Identifier

##### Numeric identifier ranges (scale/ramp properties)
- **color** (step): `0–1100`  
  - Recommended: 50/100-based ramps (e.g., `0, 50, 100, ... 1100`)  
  - Optional intermediate steps if truly needed: `25, 75, 150, 250, ...`
- **dimension/space** (step): `0–40` *(recommended)*  
  - Monotonic: larger number = larger space  
  - Optional negative encoding: `neg-<abs>` (e.g., `neg-8`)
- **dimension/size** (step): `0–200` *(recommended)*
- **dimension/radius** (step): `0–32` plus **`999`** *(pill/full rounding)*
- **dimension/stroke-width** (step): `0–8` *(most systems: 0/1/2)*
- **dimension/breakpoint** (step): `0–4000` *(recommended; integers only; literal thresholds)*
- **opacity** (step): `0–100` *(prefer increments of 5 or 10)*
- **shadow/offset-x** (step): signed integer encoding  
  - Use `neg-<abs>` for negative values  
  - Recommended range: `neg-24–24`
- **shadow/offset-y** (step): signed integer encoding  
  - Use `neg-<abs>` for negative values  
  - Recommended range: `neg-24–24`
- **shadow/blur** (step): `0–64` *(recommended; integers only)*
- **shadow/spread** (step): signed integer encoding  
  - Use `neg-<abs>` for negative values  
  - Recommended range: `neg-16–16`
- **blur** (step): `0–40` *(recommended; pick a range that matches your platform reality)*
- **fontSize** (step): `8–72` *(integers only)*
- **lineHeight** (step): `10–96` *(integers only)*
- **fontWeight** (step): `100–900` *(100 increments)*
- **letterSpacing** (step): signed integer encoding  
  - Use `neg-<abs>` for negative values to avoid parsing issues  
  - Examples: `letterSpacing/neg-2`, `letterSpacing/0`, `letterSpacing/2`  
  - Recommended range: `neg-2–10`
- **duration** (step): `0–2000` *(milliseconds)*  
  - Recommended steps: `0, 75, 100, 150, 200, 300, 500, 800, 1200`
- **layer** (level): `0–10` *(recommended)*

##### Easing curve identifiers  
(`easing/<curve>`)
| Term | Definition |
|---|---|
| **standard** | Default motion curve |
| **emphasized** | Stronger curve for prominent motion |
| **decelerate** | Ease-out style curve (enter/expand) |
| **accelerate** | Ease-in style curve (exit/collapse) |
| **linear** | Linear curve |

##### Font family identifiers  
(`fontFamily/<group>/<name>`)
| Term | Definition |
|---|---|
| **sans** | Default sans-serif family/stack |
| **serif** | Serif family/stack |
| **mono** | Monospace family/stack |
| **brand-sans** | Brand sans family/stack |
| **brand-serif** | Brand serif family/stack |
| **optimistic-vf** | Brand variable font family/stack |

##### Text case identifiers  
(`textCase/<value>`)
| Term | Definition |
|---|---|
| **none** | No forced casing |
| **uppercase** | Uppercase transform |
| **lowercase** | Lowercase transform |
| **capitalize** | Capitalize words |

##### Text decoration identifiers  
(`textDecoration/<value>`)
| Term | Definition |
|---|---|
| **none** | No decoration |
| **underline** | Underline text |
| **line-through** | Strikethrough text |

> Rule: Discrete identifiers are a **whitelist** by property (e.g., `easing` must use one of the curve terms above).

---

#### Variants
Variants are optional and property-specific. Keep variants narrowly scoped to *sub-variations of the same identifier*.

##### Color alpha variants
Alpha is encoded as a suffix on the identifier in the form `-aNN`:

- `NN` ranges `0–100`  
- Examples: `color/blue/500-a20`, `color/gray/900-a60`  
- Omit the `-aNN` suffix when fully opaque.


____________________________________________________

### **Semantic Vocabulary**

#### Role

| Term | Definition |
|------|------------|
| **surface** | Surfaces and backgrounds that content sits on |
| **content** | Text and icon content that appears on surfaces |
| **separator** | Dividers and borders that separate content |
| **action** | Interactive elements like buttons and controls |
| **link** | Hyperlink elements |
| **focus** | Focus indicators and outlines |
| **status** | Status indicators (positive, negative, warning, info) |
| **toggle** | Toggle switch controls (on/off states) |
| **range** | Range/slider controls (continuous values) |
| **overlay** | Overlay layers (modals, popovers, scrims) |
| **accent** | Accent colors for brand emphasis |
| **constant** | Constant values that never theme (transparent, black, white) |
| **type** | Typography styles and properties |
| **space** | Semantic spacing patterns |
| **size** | Semantic sizing patterns |
| **radius** | Semantic corner radius patterns |
| **border-width** | Semantic border width patterns |
| **shadow** | Semantic shadow effect patterns |

#### Elements by Role

##### Surface Role Elements
- **background**: Base background surfaces

##### Content Role Elements
- **text**: Text content
- **icon**: Icon content

##### Action Role Elements
- **background**: Action background
- **text**: Action text
- **border**: Action border
- **icon**: Action icon

##### Type Role
- **body**: Body text style
- **heading**: Heading text style
- **mono**: Monospace text style

#### Variants

| Term | Definition |
|------|------------|
| **primary** | Primary importance or hierarchy level |
| **secondary** | Secondary importance or hierarchy level |
| **default** | Default or standard level |
| **subtle** | Subtle or low-emphasis level |


##### Surface Role Variants
- **background**: Base background surfaces (page backgrounds, app chrome)
- **raised**: Elevated surfaces (cards, panels above base)
- **sunken**: Recessed surfaces (inputs, depressed areas)
- **canvas**: Default canvas surfaces (main content areas)

##### Action Role Variants
- **primary**: Primary importance or hierarchy level 
- **secondary**: Secondary importance or hierarchy level
- **Tertiary**: Tertiary importance or hierarchy level

##### Status Role Variants
- **positive**: Positive/success status
- **negative**: Negative/error status
- **warning**: Warning status
- **info**: Informational status

#### Contexts

| Term | Definition |
|------|------------|
| **inverse** | Rendered on inverse/dark backgrounds |
| **on-media** | Rendered on media/image backgrounds |
| **on-accent** | Rendered on accent-colored backgrounds |

#### Emphasis

| Term | Definition |
|------|------------|
| **deemphasized** | Weak emphasis level |
| **base** | Default emphasis level |
| **emphasized** | Strong emphasis level |

#### States

| Term | Definition |
|------|------------|
| **enabled** | Default or initial state |
| **disabled** | Disabled state (element is disabled) |
| **hover** | Hover state (pointer over element) |
| **pressed** | Pressed/active state (element being pressed) |
| **selected** | Selected state (element is selected) |
| **active** | Active state (element is active) |
| **focus** | Focus state (element has focus) |
| **invalid** | Invalid state (element has validation error) |

---

### **Component Vocabulary**

#### Components
| Term | Definition |
|------|------------|
| **button** | Standard button component |
| **icon-button** | Icon-only button component |
| **text-field** | Text input field component |
| **search-field** | Search input field component |
| **checkbox** | Checkbox input component |
| **radio** | Radio button input component |
| **switch** | Toggle switch input component |
| **slider** | Slider range input component |
| **tabs** | Tabs navigation component |
| **nav-item** | Navigation item component |
| **dialog** | Modal dialog component |
| **tooltip** | Tooltip component |
| **toast** | Toast notification component |
| **list-cell** | List cell container component |
| **card** | Card container component |

#### Parts

| Term | Definition |
|------|------------|
| **container** | Main container element |
| **border** | Border element |
| **field** | Input field element |
| **label** | Label text element |
| **title** | Heading text element |
| **description** | Supporting explanatory text element |
| **placeholder** | Hint text shown when empty |
| **helper** | Guidance text under/near the field |
| **caption** | Small supporting text near media/content |
| **value** | The displayed current value/state element |
| **icon** | Icon element |
| **avatar** | Identity image/initials |
| **thumbnail** | Small preview image |
| **track** | Path the thumb moves along |
| **thumb** | Draggable piece on a track |
| **handle** | Drag target used to resize/reorder |
| **step** | Discrete markers along a track |


#### Properties
| Term | Definition |
|------|------------|
| **background** | Background color |
| **text** | Text color |
| **icon** | Icon color |
| **border-color** | Border color |
| **border-width** | Border width |
| **radius** | Border radius |
| **shadow** | Shadow effect |
| **padding-x** | Horizontal padding |
| **padding-y** | Vertical padding |


#### Variants
| Term | Definition |
|------|------------|
| **primary** | Primary variant (main action) |
| **secondary** | Secondary variant (secondary action) |
| **tertiary** | Tertiary variant (tertiary action) |
| **subtle** | Subtle variant (low emphasis) |
| **outline** | Outline variant (bordered, transparent fill) |
| **ghost** | Ghost variant (transparent, no border) |
| **destructive** | Destructive variant (dangerous action) |

#### States
| Term | Definition |
|------|------------|
| **enabled** | Default or initial state |
| **disabled** | Disabled state (element is disabled) |
| **hover** | Hover state (pointer over element) |
| **pressed** | Pressed/active state (element being pressed) |
| **selected** | Selected state (element is selected) |
| **active** | Active state (element is active) |
| **focus** | Focus state (element has focus) |
| **invalid** | Invalid state (element has validation error) |

#### Contexts
| Term | Definition |
|------|------------|
| **inverse** | Inverse context (on dark backgrounds) |
| **on-media** | On media context (on image backgrounds) |
| **on-accent** | On accent context (on accent-colored backgrounds) |

---

## *Composed Token Definitions*

This section provides definitions for common token names (full token paths) organized by framework and role/category.

### **PRIMITIVE TOKEN DEFINITIONS**

#### Color Primitives

**`color/blue/650`**
- Definition: The base blue color at step **650** on the blue scale. Used as a foundational color value that can be aliased by semantic tokens.
- Use case: A reusable blue primitive that’s commonly aliased into semantic decisions (e.g., actions, links, brand accents).

**`color/gray/100`**
- Definition: A very light gray color at step 100 on the gray scale. Typically used as a foundational neutral value that can be aliased by semantic tokens.
- Use case: Commonly aliased into semantic surfaces, subtle borders/dividers, or low-contrast backgrounds.

**`color/blue/500-a20`**
- Definition: Blue color at step 500 with 20% opacity encoded as an alpha suffix (`-a20`). Used when transparency is part of the primitive value itself.
- Use case: Commonly aliased into overlay, tint, and translucent surface decisions.

#### Dimension Primitives

**`dimension/space/0`**
- Definition: Zero spacing value. Used for removing margins, padding, or gaps.
- Use case: Resetting spacing, tight layouts.

**`dimension/space/4`**
- Definition: Small spacing value at step 4.
- Use case: Tight spacing between related elements.

**`dimension/space/8`**
- Definition: Medium-small spacing value at step 8.
- Use case: Standard spacing between elements, component padding.

**`dimension/space/16`**
- Definition: Medium spacing value at step 16.
- Use case: Standard spacing between sections, card padding.

**`dimension/size/16`**
- Definition: Small size value at step 16.
- Use case: Small icon sizes, compact control heights.

**`dimension/size/24`**
- Definition: Medium size value at step 24.
- Use case: Standard icon sizes, standard control heights.

**`dimension/size/48`**
- Definition: Large size value at step 48.
- Use case: Large icon sizes, prominent control heights.

**`dimension/radius/0`**
- Definition: No border radius (sharp corners).
- Use case: Square elements, sharp corners.

**`dimension/radius/4`**
- Definition: Small border radius at step 4.
- Use case: Subtle corner rounding, input fields.

**`dimension/radius/8`**
- Definition: Medium border radius at step 8.
- Use case: Standard corner rounding, buttons, cards.

**`dimension/radius/999`**
- Definition: Pill/full rounding (maximum radius).
- Use case: Fully rounded elements (buttons, badges, avatars).

#### Typography Primitives

**`fontSize/12`**
- Definition: Font size at step 12. Unit is defined by the token value (e.g., px/pt/sp).
- Use case: Small text, captions, labels.

**`fontSize/16`**
- Definition: Font size at step 16. Unit is defined by the token value (e.g., px/pt/sp).
- Use case: Body text, standard content.

**`fontSize/24`**
- Definition: Font size at step 24. Unit is defined by the token value (e.g., px/pt/sp).
- Use case: Headings, large text.

**`fontWeight/400`**
- Definition: Font weight value 400 (regular).
- Use case: Body text, standard content.

**`fontWeight/700`**
- Definition: Font weight value 700 (bold).
- Use case: Headings, emphasized text.

**`lineHeight/20`**
- Definition: Line height at step 20. Unit is defined by the token value (e.g., px/pt/sp).
- Use case: Standard line spacing for smaller body text.

#### Motion Primitives

**`duration/100`**
- Definition: Animation duration (100ms).
- Use case: Quick transitions, micro-interactions.

**`duration/200`**
- Definition: Animation duration (200ms).
- Use case: Standard transitions, hover effects.

**`duration/500`**
- Definition: Animation duration (500ms).
- Use case: Deliberate transitions, modal animations.

**`easing/standard`**
- Definition: Standard easing curve.
- Use case: Default animation timing.


---

### **SEMANTIC TOKEN DEFINTIONS**

#### Surface Role

**`surface/background/default`**
- Definition: Used for the highest-level canvas of the UI such as page backgrounds, app chrome backgrounds, and any default surface where users read or interact with content.
- Use case: Main page background, application window background, default container backgrounds.

**`surface/background/base`**
- Definition: The base background surface, typically the lightest or darkest surface depending on theme. This is the foundation layer that all other surfaces sit on.
- Use case: Root background color, theme base color.

**`surface/raised/default`**
- Definition: An elevated surface that appears above the base background, such as cards, panels, or modals. Provides visual hierarchy through elevation.
- Use case: Card backgrounds, panel backgrounds, elevated containers.

**`surface/raised/hover`**
- Definition: Elevated surface in hover state. Used when a raised surface is interactive and needs visual feedback on hover.
- Use case: Interactive cards, hoverable panels.

**`surface/container/default`**
- Definition: Default container surface, typically used for content containers that sit on the base background.
- Use case: Content containers, section backgrounds.

**`surface/container/subtle`**
- Definition: Subtle container surface with lower emphasis, providing minimal visual distinction from the base background.
- Use case: Subtle content areas, low-emphasis containers.

**`surface/elevated/default`**
- Definition: Highly elevated surface, typically used for floating elements like popovers or tooltips.
- Use case: Popover backgrounds, floating panels.

**`surface/elevated/default/inverse`**
- Definition: Highly elevated surface rendered in inverse context (on dark backgrounds).
- Use case: Popovers on dark backgrounds, floating elements in dark mode.

**`surface/canvas/default`**
- Definition: Default canvas surface for main content areas where users read or interact with primary content.
- Use case: Main content area backgrounds, article backgrounds.

#### Content Role

**`content/text/primary`**
- Definition: Primary text content with highest emphasis and contrast. Used for main content, headings, and important text.
- Use case: Body text, headings, primary content.

**`content/text/primary/inverse`**
- Definition: Primary text content rendered in inverse context (on dark backgrounds).
- Use case: Text on dark backgrounds, dark mode text.

**`content/text/secondary`**
- Definition: Secondary text content with lower emphasis. Used for supporting text, captions, and less important information.
- Use case: Captions, helper text, secondary information.

**`content/text/secondary/inverse`**
- Definition: Secondary text content rendered in inverse context.
- Use case: Secondary text on dark backgrounds.

**`content/text/placeholder`**
- Definition: Placeholder text content, typically with reduced opacity or contrast.
- Use case: Input placeholder text, empty state text.

**`content/text/disabled`**
- Definition: Disabled text content, indicating non-interactive or unavailable content.
- Use case: Disabled form labels, unavailable content.

**`content/icon/primary`**
- Definition: Primary icon content with standard emphasis.
- Use case: Standard icons, primary iconography.

**`content/icon/secondary`**
- Definition: Secondary icon content with lower emphasis.
- Use case: Decorative icons, secondary iconography.

**`content/icon/disabled`**
- Definition: Disabled icon content.
- Use case: Disabled state icons, unavailable iconography.

#### Action Role

**`action/background/primary/enabled`**
- Definition: Primary action background in enabled state. Used for main interactive elements like primary buttons.
- Use case: Primary button backgrounds, main call-to-action backgrounds.

**`action/background/primary/hover`**
- Definition: Primary action background in hover state.
- Use case: Primary button hover state, hover feedback for main actions.

**`action/background/primary/pressed`**
- Definition: Primary action background in pressed/active state.
- Use case: Primary button pressed state, active feedback.

**`action/background/primary/disabled`**
- Definition: Primary action background in disabled state.
- Use case: Disabled primary buttons, unavailable actions.

**`action/background/secondary/enabled`**
- Definition: Secondary action background in enabled state.
- Use case: Secondary button backgrounds, secondary actions.

**`action/background/secondary/hover`**
- Definition: Secondary action background in hover state.
- Use case: Secondary button hover state.

**`action/text/primary/enabled`**
- Definition: Primary action text color in enabled state.
- Use case: Primary button text, main action text.

**`action/text/primary/hover`**
- Definition: Primary action text color in hover state.
- Use case: Primary button text on hover.

**`action/text/destructive/enabled`**
- Definition: Destructive action text color in enabled state. Used for dangerous or destructive actions.
- Use case: Delete button text, destructive action text.

**`action/border/primary/enabled`**
- Definition: Primary action border color in enabled state.
- Use case: Primary button borders, outlined primary actions.

**`action/icon/primary/enabled`**
- Definition: Primary action icon color in enabled state.
- Use case: Primary button icons, main action icons.

#### Separator Role

**`separator/divider/default`**
- Definition: Default divider separator, used to separate content sections.
- Use case: Section dividers, list item separators.

**`separator/border/default`**
- Definition: Default border separator, used for container borders and frames.
- Use case: Container borders, frame borders.

**`separator/border/focused`**
- Definition: Border separator in focused state, typically with higher contrast.
- Use case: Focused input borders, active container borders.

**`separator/container-border/default`**
- Definition: Default container border separator.
- Use case: Container borders, panel borders.

**`separator/container-border/default/inverse`**
- Definition: Container border separator in inverse context.
- Use case: Container borders on dark backgrounds.

#### Link Role

**`link/default/enabled`**
- Definition: Default link color in enabled state.
- Use case: Standard hyperlinks, navigation links.

**`link/default/hover`**
- Definition: Default link color in hover state.
- Use case: Link hover state, interactive link feedback.

**`link/default/visited`**
- Definition: Default link color in visited state.
- Use case: Visited link styling.

**`link/subtle/default`**
- Definition: Subtle link color with lower emphasis.
- Use case: Secondary links, low-emphasis links.

**`link/subtle/hover/inverse`**
- Definition: Subtle link color in inverse context and hover state.
- Use case: Subtle links on dark backgrounds with hover feedback.

#### Focus Role

**`focus/ring/default`**
- Definition: Default focus ring indicator, used to show keyboard focus.
- Use case: Focus indicators for keyboard navigation, accessible focus states.

**`focus/ring/default/inverse`**
- Definition: Focus ring in inverse context.
- Use case: Focus indicators on dark backgrounds.

**`focus/outline/invalid`**
- Definition: Focus outline for invalid/error states.
- Use case: Error state focus indicators, invalid input focus.

#### Status Role

**`status/positive/background/default`**
- Definition: Positive/success status background color.
- Use case: Success message backgrounds, positive indicator backgrounds.

**`status/positive/text/default`**
- Definition: Positive/success status text color.
- Use case: Success message text, positive indicator text.

**`status/negative/background/default`**
- Definition: Negative/error status background color.
- Use case: Error message backgrounds, negative indicator backgrounds.

**`status/negative/text/default`**
- Definition: Negative/error status text color.
- Use case: Error message text, negative indicator text.

**`status/warning/background/default`**
- Definition: Warning status background color.
- Use case: Warning message backgrounds, warning indicator backgrounds.

**`status/info/background/default`**
- Definition: Informational status background color.
- Use case: Info message backgrounds, informational indicator backgrounds.

#### Toggle Role

**`toggle/background/on/default`**
- Definition: Toggle switch background when in "on" state.
- Use case: Active toggle switch track, enabled toggle background.

**`toggle/background/off/default`**
- Definition: Toggle switch background when in "off" state.
- Use case: Inactive toggle switch track, disabled toggle background.

**`toggle/icon/on/default`**
- Definition: Toggle switch icon when in "on" state.
- Use case: Active toggle indicator, enabled toggle icon.

**`toggle/icon/off/default`**
- Definition: Toggle switch icon when in "off" state.
- Use case: Inactive toggle indicator, disabled toggle icon.

#### Range Role

**`range/track/default/enabled`**
- Definition: Range slider track in enabled state.
- Use case: Slider track background, progress bar track.

**`range/fill/default/enabled`**
- Definition: Range slider fill in enabled state.
- Use case: Slider fill, progress bar fill.

**`range/fill/default/hover`**
- Definition: Range slider fill in hover state.
- Use case: Slider fill on hover, interactive progress feedback.

**`range/thumb/default/enabled`**
- Definition: Range slider thumb in enabled state.
- Use case: Slider thumb, range control handle.

**`range/thumb/default/pressed`**
- Definition: Range slider thumb in pressed state.
- Use case: Slider thumb when being dragged, active range control.

#### Overlay Role

**`overlay/scrim/default/default`**
- Definition: Default scrim overlay, used to dim content behind modals or dialogs.
- Use case: Modal backdrop, dialog scrim.

**`overlay/backdrop/strong/default`**
- Definition: Strong backdrop overlay with higher opacity.
- Use case: Strong modal backdrop, high-contrast overlay.

#### Accent Role

**`accent/background/default/default`**
- Definition: Default accent background color for brand emphasis.
- Use case: Accent-colored backgrounds, brand highlight areas.

**`accent/text/default/default`**
- Definition: Default accent text color.
- Use case: Accent-colored text, brand text.

**`accent/text/subtle/inverse`**
- Definition: Subtle accent text color in inverse context.
- Use case: Subtle accent text on dark backgrounds.

#### Fixed Role

**`fixed-color/transparent`**
- Definition: Transparent color constant that never themes.
- Use case: Transparent overlays, invisible elements.

**`fixed-color/black`**
- Definition: Pure black color constant that never themes.
- Use case: True black elements, absolute contrast needs.

**`fixed-color/white`**
- Definition: Pure white color constant that never themes.
- Use case: True white elements, absolute contrast needs.

#### Type Role

**`type/body/md/regular/default`**
- Definition: Medium body text style with regular weight in default state.
- Use case: Standard body text, paragraph text.

**`type/heading/lg/strong/default`**
- Definition: Large heading text style with strong weight.
- Use case: Large headings, prominent titles.

**`type/label/sm/medium/default`**
- Definition: Small label text style with medium weight.
- Use case: Form labels, small text labels.

#### Space Role (Semantic)

**`space/layout/padding/default/md`**
- Definition: Medium padding for layout-level spacing in default role.
- Use case: Page-level padding, section padding.

**`space/component/gap/compact/sm`**
- Definition: Small gap spacing for component-level spacing in compact role.
- Use case: Tight component spacing, compact layouts.

**`space/content/margin/spacious/lg`**
- Definition: Large margin spacing for content-level spacing in spacious role.
- Use case: Generous content spacing, spacious layouts.

#### Size Role (Semantic)

**`size/icon/md`**
- Definition: Medium icon size.
- Use case: Standard icon dimensions, default icon size.

**`size/control/lg`**
- Definition: Large control size.
- Use case: Large button heights, prominent controls.

**`size/container/xl/max`**
- Definition: Extra-large container size with maximum constraint.
- Use case: Maximum container widths, large content areas.

#### Radius Role (Semantic)

**`radius/surface/default`**
- Definition: Default corner radius for surfaces.
- Use case: Standard surface rounding, default card radius.

**`radius/control/subtle`**
- Definition: Subtle corner radius for controls.
- Use case: Slightly rounded buttons, subtle input rounding.

**`radius/card/pronounced`**
- Definition: Pronounced corner radius for cards.
- Use case: Highly rounded cards, prominent corner rounding.

**`radius/avatar/pill`**
- Definition: Pill/full rounding for avatars.
- Use case: Circular avatars, fully rounded elements.

#### Border-width Role (Semantic)

**`border-width/default/default`**
- Definition: Default border width.
- Use case: Standard borders, default stroke width.

**`border-width/divider/default`**
- Definition: Border width for dividers.
- Use case: Divider lines, separator borders.

**`border-width/focus/default`**
- Definition: Border width for focus indicators.
- Use case: Focus ring borders, focus outline width.

#### Shadow Role (Semantic)

**`shadow/raised`**
- Definition: No shadow effect.
- Use case: Slight elevation, subtle depth.

**`shadow/elevation-1`**
- Definition: Subtle shadow effect.
- Use case: Hover elevation feedback, interactive depth.

**`shadow/elevation-2`**
- Definition: Elevated shadow effect.
- Use case: Popover elevation, floating element shadows.

**`shadow/elevation-3`**
- Definition: Elevated shadow effect in hover state.
- Use case: Modal elevation, dialog shadows.


---

### **COMPONENT TOKEN DEFINTIONS**

#### Button Components

**`button/container/background/primary/enabled`**
- Definition: Primary button container background in enabled state.
- Use case: Primary button background color.

**`button/container/background/primary/hover`**
- Definition: Primary button container background in hover state.
- Use case: Primary button hover background.

**`button/container/background/primary/pressed`**
- Definition: Primary button container background in pressed state.
- Use case: Primary button active/pressed background.

**`button/container/background/primary/disabled`**
- Definition: Primary button container background in disabled state.
- Use case: Disabled primary button background.

**`button/label/text/primary/enabled`**
- Definition: Primary button label text color in enabled state.
- Use case: Primary button text color.

**`button/label/text/primary/hover`**
- Definition: Primary button label text color in hover state.
- Use case: Primary button text on hover.

**`button/container/border-color/outline/enabled`**
- Definition: Outline button container border color in enabled state.
- Use case: Outline button border color.

**`button/container/radius/primary`**
- Definition: Primary button container border radius.
- Use case: Button corner rounding.

**`icon-button/container/background/secondary/pressed`**
- Definition: Secondary icon button container background in pressed state.
- Use case: Icon button active state background.

#### Text Field Components

**`text-field/field/background/enabled`**
- Definition: Text field background in enabled state.
- Use case: Input field background color.

**`text-field/field/border-color/enabled`**
- Definition: Text field border color in enabled state.
- Use case: Input field border color.

**`text-field/field/border-color/invalid`**
- Definition: Text field border color in invalid state.
- Use case: Error state input border.

**`text-field/field/border-width/invalid`**
- Definition: Text field border width in invalid state.
- Use case: Error state border thickness.

**`text-field/field/text/enabled`**
- Definition: Text field text color in enabled state.
- Use case: Input text color.

**`text-field/field/text/disabled`**
- Definition: Text field text color in disabled state.
- Use case: Disabled input text color.

**`text-field/placeholder/text/enabled`**
- Definition: Text field placeholder text color in enabled state.
- Use case: Placeholder text color.

**`text-field/field/border-color/focus`**
- Definition: Text field border color in focus state.
- Use case: Focus indicator color for inputs.

#### Card Components

**`card/container/background`**
- Definition: Card container background.
- Use case: Card background color.

**`card/container/radius`**
- Definition: Card container border radius.
- Use case: Card corner rounding.

**`card/container/shadow`**
- Definition: Card container shadow effect.
- Use case: Card elevation shadow.

**`card/container/border-color`**
- Definition: Card container border color.
- Use case: Card border color.

#### Dialog Components

**`dialog/container/background`**
- Definition: Dialog container background.
- Use case: Dialog background.

**`dialog/container/border-color`**
- Definition: Dialog container border color.
- Use case: Dialog border color.

**`dialog/container/shadow`**
- Definition: Dialog container shadow effect.
- Use case: Dialog elevation shadow.

#### Switch Components

**`switch/track/background/enabled`**
- Definition: Switch track background in enabled state.
- Use case: Toggle switch track background.

**`switch/thumb/background/selected`**
- Definition: Switch thumb background when selected.
- Use case: Active toggle switch thumb.

#### Slider Components

**`slider/track/background/enabled`**
- Definition: Slider track background in enabled state.
- Use case: Range slider track background.

**`slider/track/background/active`**
- Definition: Slider track background in active state.
- Use case: Range slider fill color.

**`slider/thumb/background/enabled`**
- Definition: Slider thumb background in enabled state.
- Use case: Range slider thumb color.

**`slider/thumb/background/hover`**
- Definition: Slider thumb background in hover state.
- Use case: Range slider thumb hover state.

#### Checkbox Components

**`checkbox/container/background/enabled`**
- Definition: Checkbox container background in enabled state.
- Use case: Checkbox background color.

**`checkbox/icon/icon/selected`**
- Definition: Checkbox icon when selected.
- Use case: Checkmark icon color.

#### Navigation Components

**`nav-item/container/background/selected`**
- Definition: Navigation item container background when selected.
- Use case: Active navigation item background.

**`nav-item/label/text/hover`**
- Definition: Navigation item label text in hover state.
- Use case: Navigation link hover text.

**`tabs/label/text/enabled`**
- Definition: Tab label text color in enabled state.
- Use case: Tab label text color.

**`tabs/container/border-color/active`**
- Definition: Tab container border color when active.
- Use case: Active tab indicator color.

#### List Cell Components

**`list-cell/container/background`**
- Definition: List cell container background.
- Use case: List cell background color.

**`list-cell/container/shadow`**
- Definition: List cell container shadow effect.
- Use case: List cell elevation shadow.

#### Tooltip Components

**`tooltip/container/background`**
- Definition: Tooltip container background.
- Use case: Tooltip background color.

#### Toast Components

**`toast/container/background`**
- Definition: Toast container background.
- Use case: Toast notification background.

---

## *Naming Rules and Best Practices*

### **Character Constraints**

All token segments must adhere to the following character constraints:

- **Allowed characters**: Lowercase letters (`a-z`), numbers (`0-9`), and hyphens (`-`)
- **Forbidden characters**: Spaces, uppercase letters, special characters (except `-`)
- **Validation regex**: `/[^a-z0-9-]/` (rejects any character not in allowed set)
- **Multi-word terms**: Use hyphens to separate words within a single segment (e.g., `font-size`, `letter-spacing`, `on-media`)

### **Normalization Rules**

When entering custom terms, the following normalization is applied:

1. Trim whitespace from beginning and end
2. Convert to lowercase
3. Replace spaces and underscores with hyphens (`-`)
4. Collapse repeated hyphens into a single hyphen
5. Strip leading and trailing hyphens

**Example**: `"Primary Action"` → `"primary-action"`

### **Uniqueness Requirements**

Uniqueness is enforced **within each naming framework**, across all slots:

- When adding a custom term for a slot, the tool checks if the normalized term exists in:
  1. Any slot's vocabulary in the framework's configuration
  2. Any other slot's custom term in the current session state
- If it exists in a different slot: block and show an error
- If it exists in the same slot: treat as existing predefined term and select it

### Segment Naming Rules

#### Prefix Segments
- Optional segments that can appear at the beginning of token names
- Currently supports: System, Theme, Role
- Use sparingly and only when necessary for organization

#### Required vs Optional Segments
- **Required segments**: Must be filled for a valid token name
- **Optional segments**: Can be omitted if not needed
- Omitting optional segments creates shorter, more general token names
- Adding optional segments creates more specific, contextual token names

### Framework-Specific Rules

#### Primitive Framework
- Category must be one of the predefined categories
- Set is category-specific (hues for color, `core` for most others)
- Step values are numeric and category-specific
- Variants are optional and category-specific

#### Semantic Framework
- Role-leading is non-negotiable (first segment communicates usage)
- Object is role-specific (varies by role)
- Role is categorical (meaning), not intensity
- Context only when same role needs specific contrast setup
- State only for interaction/condition changes
- Emphasis should be used sparingly

#### Component Framework
- Component name should be industry-standard kebab-case
- Part describes component anatomy
- Property describes visual attribute
- Variant only when component meaningfully supports variants
- Default behavior: alias semantic tokens when possible

### Common Patterns

#### Pattern: Base + State
- **Example**: `action/background/primary/enabled` → `action/background/primary/hover`
- **Use**: When you need state variations of the same base token

#### Pattern: Base + Context
- **Example**: `content/text/primary` → `content/text/primary/inverse`
- **Use**: When the same role needs different contrast in different contexts

#### Pattern: Base + Variant
- **Example**: `button/container/background/primary` → `button/container/background/secondary`
- **Use**: When components have multiple styling variants

### Anti-Patterns to Avoid

1. **Don't encode meaning in primitive tokens**
   - ❌ `color/button-primary/500`
   - ✅ `color/blue/500` (then alias in semantic: `action/background/primary/enabled`)

2. **Don't use intensity as role if you have emphasis**
   - ❌ `content/text/strong` (if you have emphasis ladder)
   - ✅ `content/text/primary/strong` (role + emphasis)

3. **Don't invent "focused" as a role**
   - ❌ `action/background/focused`
   - ✅ `action/background/primary/focus` (state, not role)

4. **Don't over-tokenize components**
   - ❌ Creating tokens for every possible value
   - ✅ Start with high-impact properties (background/text/border/focus/shadow/radius)

5. **Don't mix frameworks**
   - ❌ `button/color/blue/500`
   - ✅ `button/container/background/primary/enabled` (aliases semantic)

### JSON Storage Model

#### Primitive Tokens
- Store segments as nested JSON objects (groups)
- Groups are JSON objects without `$value`
- Tokens are objects with `$value`
- Use `$root` token inside a group if you need both base and variants under the same step

#### Semantic and Component Tokens
- Store as flat or nested structures depending on needs
- Follow DTCG JSON format guidelines
- No segment starts with `$`
- No `.`, `{`, `}` in any segment

### Format Options

Token names can be formatted with different separators:

- **Slash format** (default): `surface/background/default`
- **Underscore format**: `surface_background_default`

The separator is a display preference and does not affect the underlying token structure.

---

## Additional Resources

For more information about:
- Token naming tool usage: See the main application
- Product requirements: See `md/PRD.md`
- Implementation details: See source code in `src/` directory

---

*This documentation is maintained as part of the Token Namer project. Last updated: 2025*
