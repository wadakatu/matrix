# 02 — Tokens: model, format, tooling

Tokens are the only place a value is written down. This page defines which tokens exist,
how they are stored, how they are compiled, and what CI refuses.

All colour values below are the prototype's
(`public/styles/proto/matrix.css` at `93ca12d`), with one exception: `color.text-muted` in
phosphor-night, lifted by decision Q9 (see "Changed from the prototype"). Otherwise this
design renames them; it does not retune them.

## Model

Two kinds of token, and a short list of things that are deliberately not tokens.

1. **Colour roles.** Named for what they do (`ground`, `text-muted`, `accent`), with one
   value per context. There are four contexts (`phosphor-night`, `phosphor-day`,
   `operator-night`, `operator-day`). This is the semantic tier, and it is the theming layer.
2. **Scales.** Type, space, size, border, motion and layer values that do not change with
   context.
3. **Not tokens.** Fluid formulas (`clamp()`), one-off layout numbers, and the logo tint
   live in CSS as documented custom properties or literals (see "Derived properties").

There is **no colour primitive tier**. The usual three tiers are primitive → semantic →
component ([Primer](https://primer.style/product/primitives/),
[zeroheight](https://zeroheight.com/learn/token-architecture-building-a-scalable-token-system/)),
and the research recommends at least primitives plus semantics. matrix keeps the semantic
tier, which is the one that pays for itself when there are two palettes and two themes, and
skips primitives, because the four contexts are four hand-tuned sets of about a dozen
colours and almost no raw value is used twice. Measured in OKLCH, phosphor night is a
single hue line (H ≈ 151–155°) with hand-placed lightness steps, and operator night another
(H ≈ 77–90°); neither is a regular ramp that other tokens could index into
(`10-verification-log.md`, table M1). If a third palette or a generated ramp arrives, a
primitive tier can be added underneath without renaming a single role.

Component tokens are not created up front either. A component gets its own token only when
it must diverge from a role, and that is recorded in the component's doc.

## Colour roles

CSS name is `--mx-` + ID with dots as hyphens (`color.text-muted` → `--mx-color-text-muted`).

| Token | Was (prototype) | Role | May be used for |
| --- | --- | --- | --- |
| `color.ground` | `--bg` | The screen | Page background; text on a filled accent face; code block background |
| `color.panel` | `--panel` | Solid reading surface | Panels, hover fill |
| `color.rule` | `--rule` | Hairline | Decorative separators only. Never the only boundary of a control (measured 1.5–2.4:1) |
| `color.text` | `--text` | Body text | All running text |
| `color.text-muted` | `--muted` | Secondary text | Meta, captions, hints; also the boundary of controls |
| `color.text-lead` | `--lead` | Emphasised text | Short runs: titles, `strong`, hover. Not paragraphs at night (APCA Lc −104) |
| `color.accent` | `--green` | The lit colour | Identity, links, headings, prompts, current state, focus. Never running body text |
| `color.on-accent` | (`--bg`) | Text on an accent fill | Alias of `color.ground` |
| `color.focus` | (`--green`) | Focus indicator | Alias of `color.accent` |
| `color.control-border` | (`--muted`) | Boundary of a control | Alias of `color.text-muted` |
| `color.rain.tail` | `--rain-tail` | Dimmest end of a drop | Decoration only |
| `color.rain.body` | `--rain` | Body of a drop | Decoration only; has a contrast ceiling |
| `color.rain.head` | `--rain-head` | Leading glyph of a drop | Decoration only |
| `color.reading.human` | `--pill-human` | Dot on the 人間用 side | The capsule's dots only, never text |
| `color.reading.machine` | `--pill-machine` | Dot on the 機械用 side | The capsule's dots only, never text |
| `color.glow` | `--glow` (colour part) | Phosphor bloom | `accent` at 45% alpha at night; transparent by day |
| `color.scanline` | (inline `color-mix`) | Scan-line wash | `ground` at 28% alpha |

`accent` replaces `--green` because in Operator it is amber (law L7). The three aliases
exist so that a component says what it means: a control border asks for
`control-border`, and the contrast gate can then guarantee 3:1 for that role by name.

### Values

| Token | phosphor-night | phosphor-day | operator-night | operator-day |
| --- | --- | --- | --- | --- |
| `color.ground` | `#020805` | `#ccd7c9` | `#100e0b` | `#cdd6cb` |
| `color.panel` | `#06120b` | `#dee7db` | `#17140f` | `#dbe2d9` |
| `color.rule` | `#1d4d2f` | `#7f9a86` | `#3d362c` | `#8fa093` |
| `color.text` | `#c4f2d0` | `#0c2115` | `#ece4d4` | `#111b15` |
| `color.text-muted` | `#80c194` (prototype: `#7cbd90`) | `#2a4735` | `#c2b496` | `#2f4236` |
| `color.text-lead` | `#eafff0` | `#03130a` | `#f0e0b4` | `#06281a` |
| `color.accent` | `#2bf07a` | `#0a5a31` | `#d9b56a` | `#0a4f2f` |
| `color.rain.tail` | `#0b3d20` | `#b9c9b8` | `#2a251d` | `#b7c3b6` |
| `color.rain.body` | `#1a8f4a` | `#5f8c6c` | `#8a7b5e` | `#6f8073` |
| `color.rain.head` | `#d6ffe2` | `#0a3a20` | `#f0e0b4` | `#06281a` |
| `color.reading.human` | `#58b7ff` | `#0b5cad` | `#58b7ff` | `#0b5cad` |
| `color.reading.machine` | `#ff5d4f` | `#b3261e` | `#ff5d4f` | `#b3261e` |
| `color.glow` | `#2bf07a` α 0.45 | transparent | `#d9b56a` α 0.45 | transparent |
| `color.scanline` | `#020805` α 0.28 | `#ccd7c9` α 0.28 | `#100e0b` α 0.28 | `#cdd6cb` α 0.28 |

Two things the prototype computed with `color-mix()` at runtime (`glow`, `scanline`) are
stored as explicit colours with alpha. DTCG 2025.10 has no colour-modifier syntax, and an
explicit value can be tested.

### Changed from the prototype

One value, by decision Q9: night-mode muted text is slightly brighter, so that small text
(meta lines at `font.size.meta`, 13px) is easier to read.

| Token | Context | Prototype | matrix | What moved |
| --- | --- | --- | --- | --- |
| `color.text-muted` | phosphor-night | `#7cbd90` | `#80c194` | OKLCH lightness .742 to .755; chroma (.093) and hue (153°) unchanged |

- On `ground`: 9.18:1, Lc −58.9 becomes 9.59:1, Lc −61.1. On `panel`: 8.68:1, Lc −58.5
  becomes 9.07:1, Lc −60.7 (`10-verification-log.md`, table M8).
- The line it was lifted to is Lc 60 on both reading surfaces, the level APCA gives as the
  minimum "for content text that is not body, column, or block text"
  (<https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell>). The lift moves
  lightness alone and clears that line on both surfaces by more than half a point of Lc.
- Operator-night is not changed: its `text-muted` already measures Lc −62.1 on `ground` and
  −61.7 on `panel`. The two day contexts measure 68.5 and above.
- `color.control-border` is an alias of `color.text-muted` and moves with it.
- Whether this amount is the right one is the one open item in this set (README, N1).

### Contrast contract

Each foreground role declares, in the token file itself, what it must clear and against
what. The gate reads the declaration, so the tested pairs cannot drift from the tokens.
Floors are WCAG 2.2 ratios; measured minimum is across all four contexts
(`10-verification-log.md`, table M2).

| Foreground | Against | Floor | Measured minimum | Basis |
| --- | --- | --- | --- | --- |
| `color.text` | `ground`, `panel` | 7:1 | 11.36 | [1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced) for body; TOMBO's floor, kept |
| `color.text-lead` | `ground`, `panel` | 7:1 | 10.61 | same |
| `color.text-muted` | `ground`, `panel` | 4.5:1 | 6.89 | [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) |
| `color.accent` | `ground`, `panel` | 4.5:1 | 5.61 | 1.4.3 (links, headings) |
| `color.on-accent` | `accent` | 4.5:1 | 5.61 | 1.4.3 (filled controls, status line) |
| `color.control-border` | `ground`, `panel` | 3:1 | 6.89 | [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast) |
| `color.focus` | `ground`, `panel` | 3:1 | 5.61 | 1.4.11, [2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible) |
| `color.reading.*` | `ground`, `panel` | 3:1 | 4.38 | 1.4.11 |
| `color.rain.body` | `ground` | **at most** 5:1 | 4.88 (max) | A ceiling: rain must stay below reading brightness (law L2) |
| `color.rule`, `rain.tail`, `rain.head`, `glow`, `scanline` | — | none | — | Decorative ([1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast) exempts decoration) |

The ceiling on `rain.body` records a finding from the prototype: the Operator stream colour
used unmodified "read at text brightness around the name and the nav" and had to be stepped
down (`MATRIX-NOTES.md`, "Palette and logo pass").

APCA is computed for every pair and printed as an advisory column. It never fails the
build: APCA is not a WCAG 2.2 requirement and `apca-w3` is beta
(<https://github.com/Myndex/apca-w3>). What it shows today is in 05.

## Scales

Context-free. Sizes are stored in `rem` when they are type and `px` when they are borders,
rain glyphs or breakpoints. The prototype's pixel values are kept (at a 16px root, `rem`
values compute to the same pixels).

### Type

| Token | Value | Use |
| --- | --- | --- |
| `font.family.mono` | IBM Plex Mono, M PLUS 1 Code, ui-monospace, Menlo, monospace | Latin text, controls, code |
| `font.family.ja` | M PLUS 1 Code, then `font.family.mono` | Any run marked `lang="ja"` |
| `font.family.dot` | DotGothic16, M PLUS 1 Code, ui-monospace, monospace | Rain, boot, curtain, the rain switch. Never reading text |
| `font.weight.regular` / `medium` / `bold` | 400 / 500 / 700 | 700 is the giant name only |
| `font.size.label` | 0.75rem (12px) | Code language tab, Copy |
| `font.size.meta` | 0.8125rem (13px) | Meta lines, hints, chips, status line, footer |
| `font.size.ui` | 0.875rem (14px) | Header, controls, terminal text, code blocks |
| `font.size.body` | 0.9375rem (15px) | Page text |
| `font.size.read-compact` | 1rem (16px) | Article body below 720px; command field on touch |
| `font.size.read` | 1.0625rem (17px) | Article body from 720px |
| `font.size.lead` | 1.125rem (18px) | Role line, article `h3` |
| `font.size.heading` | 1.375rem (22px) | Article `h2` |
| `font.size.title.min` / `.max` | 1.5rem / 2.375rem (24 / 38px) | Article title (fluid between) |
| `font.size.entry.min` / `.max` | 1.375rem / 2.125rem (22 / 34px) | Entry names in stream rows |
| `font.size.prompt.min` / `.max` | 1.75rem / 2.75rem (28 / 44px) | The name as a terminal line |
| `font.size.rain` | 16px | DotGothic16 is drawn for 16px. Pixels, on purpose |
| `font.leading.tight` / `title` / `terminal` / `ui` / `code` / `read` | 1.25 / 1.45 / 1.6 / 1.7 / 1.75 / 2 | — |

### Space, size, border

| Token | Value |
| --- | --- |
| `space.0-5`, `1`, `1-5`, `2`, `3`, `4`, `5`, `6`, `7`, `10`, `12`, `18` | 2, 4, 6, 8, 12, 16, 20, 24, 28, 40, 48, 72px |
| `size.frame` | 1376px (maximum content width) |
| `size.measure.read` | 640px below 720px, 680px from 720px: 40 full-width characters at the body size |
| `size.measure.lede` | 68ch (Latin lede and captions) |
| `size.rail` | 264px (contents rail) |
| `size.target` | 44px (touch target for primary controls) |
| `size.target-min` | 24px (floor for any target, [2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)) |
| `size.logo.header` / `header-compact` | 44px / 32px |
| `border.width.hair` / `strong` | 1px / 2px |
| `radius.control` / `capsule` | 2px / 999px. Panels and the logo have no radius |
| `breakpoint.phone` / `tablet` / `desk` / `wall` | 600 / 720 / 1100 / 1360px |

The space scale is the set of steps that repeat in the prototype. One-off layout numbers
stay literal in the component that owns them, as the research advises
([zeroheight](https://zeroheight.com/learn/token-architecture-building-a-scalable-token-system/)):
tokenising a number that appears once adds a name without removing a decision.

Breakpoints cannot be read from a custom property inside a media query, so CSS uses the
literals and a lint rule allows only these four.

### Motion and layers

| Token | Value | Use |
| --- | --- | --- |
| `motion.blink.duration` / `.count` | 1000ms / 5 | Cursor: five blinks, then lit |
| `motion.wipe.duration` / `.steps` | 240ms / 3 | A side of the switch becoming current |
| `motion.drip.duration` | 3200ms | One cycle of the drop through the idle strand |
| `motion.echo.duration` | 480ms | Déjà vu |
| `motion.double.duration` | 200ms | The name doubling |
| `motion.decode.duration` | 450ms | Text settling out of corpus glyphs |
| `motion.rain.duration.min` / `.max` | 9s / 21s | One column's fall |
| `motion.strand.duration.min` / `.max` | 5s / 11s | One stream strand's fall |
| `motion.boot.failsafe` | 8000ms | The intro ends no later than this |
| `motion.shell.fallback` | 4000ms | The recorded session gets its scrolling page back |
| `layer.rain` / `scanline` / `lifted` / `overlay` / `status` / `boot` / `curtain` / `skip` | −1 / 20 / 21 / 22 / 25 / 30 / 40 / 50 | `z-index`, in one place |

Step counts are numbers because DTCG's `cubicBezier` type cannot express `steps()`; CSS
composes `steps(var(--mx-motion-wipe-steps))`. Stepped timing is the signature (05).

### Derived properties (documented, not tokens)

| Property | Formula | Why not a token |
| --- | --- | --- |
| `--mx-pad` | `clamp(12px, 3.4vw, 48px)` | A formula, not a value |
| `--mx-text-title`, `--mx-text-entry`, `--mx-text-prompt` | `clamp(min, vw, max)` from the `.min` / `.max` tokens | Same |
| `--mx-text-display` | `min(15.5rem, (100vw − 2 × pad) / 4.86)` | Fits the eight-letter name to the frame |
| `--mx-logo-filter` | `hue-rotate(-80deg) saturate(1.15)` in operator-night, else `none` | A CSS filter has no DTCG type (03) |
| `--mx-vvh` | The visual viewport height, set by `mx-terminal` | Runtime state |

## Format

Tokens are authored in the Design Tokens Community Group format, version 2025.10
([Format](https://www.designtokens.org/tr/2025.10/format/),
[Color](https://www.designtokens.org/tr/2025.10/color/),
[Resolver](https://www.designtokens.org/tr/2025.10/resolver/)). It is the first stable
version and a Community Group report, not a W3C Recommendation.

Rules for authoring:

- Files end in `.tokens.json`; the resolver is `matrix.resolver.json`.
- Colours use the 2025.10 object form in `srgb`, with the approved hex kept as `hex` so the
  file can be compared with the prototype by eye:

  ```json
  {
    "color": {
      "$type": "color",
      "ground": {
        "$value": { "colorSpace": "srgb", "components": [0.008, 0.031, 0.02], "hex": "#020805" },
        "$description": "The screen itself. Page background; text on an accent fill."
      }
    }
  }
  ```

- Dimensions and durations are `{ "value": 240, "unit": "ms" }` objects, as the spec requires.
- Aliases use `{color.ground}`.
- **Every token has a `$description`** that says what it is for and what it must not be used
  for. This is the sentence an agent reads before choosing a token (07).
- matrix-specific metadata goes under `$extensions["dev.wadakatu.matrix"]`:
  `contrast` (the pairs and floors above), `ceiling`, and `decorative: true`.

### The resolver

One modifier, `context`, with four contexts and `phosphor-night` as the default.

```json
{
  "version": "2025.10",
  "sets": { "base": { "sources": [{ "$ref": "./base.tokens.json" }] } },
  "modifiers": {
    "context": {
      "contexts": {
        "phosphor-night": [{ "$ref": "./context/phosphor-night.tokens.json" }],
        "phosphor-day": [{ "$ref": "./context/phosphor-day.tokens.json" }],
        "operator-night": [{ "$ref": "./context/operator-night.tokens.json" }],
        "operator-day": [{ "$ref": "./context/operator-day.tokens.json" }]
      },
      "default": "phosphor-night"
    }
  },
  "resolutionOrder": [{ "$ref": "#/sets/base" }, { "$ref": "#/modifiers/context" }]
}
```

Palette and theme are not two modifiers, because the values are not orthogonal: operator-day
is not "operator" plus "day", it is its own tuned set. The resolver spec asks for
orthogonal modifiers where possible, and Terrazzo's guide recommends flattening into one
modifier when they are not (<https://terrazzo.app/docs/guides/resolvers/>). In CSS the two
axes are still independent (03); the flattening is only how the values are stored.

## Tooling

### Compiler: Terrazzo

| | Terrazzo 2.10 | Style Dictionary 5.8 |
| --- | --- | --- |
| DTCG 2025.10 | Supported, including resolvers ([CSS plugin docs](https://terrazzo.app/docs/integrations/css/)) | "the latest format 2025.10 does not have full support yet … work in progress in v5" ([docs](https://styledictionary.com/info/dtcg/)) |
| Validation | `tz check`, `tz lint` with built-in rules including `a11y/min-contrast` ([linting](https://terrazzo.app/docs/linting/)) | Via custom code |
| Custom output | Plugin API with `resolver.apply(input)` per permutation ([plugin API](https://terrazzo.app/docs/reference/plugin-api/)) | Custom formats |
| Maturity | Younger; one of three reference implementations named by the DTCG | The established tool |

Terrazzo is chosen because the resolver is the feature this design leans on and Style
Dictionary's own documentation says it is not finished there. The risk is contained: the
source is standard DTCG, so changing compilers changes one config file and one small emitter.

Terrazzo's stock CSS output writes one block per permutation under a selector. matrix needs
a different shape (night and day paired in `light-dark()`, see 03), so the build uses a
small local Terrazzo plugin that asks the resolver for each of the four contexts and writes
three files:

| Output | Shape |
| --- | --- |
| `dist/tokens.css` | Custom properties in `@layer mx.tokens`, in the shape defined in 03 |
| `dist/tokens.json` | `{ "<context>": { "<token id>": "<css value>" } }` for scripts that are not CSS |
| `dist/tokens.d.ts` | `MxToken` and `MxContext` string unions, so a typo in a token name is a type error |

Whether `@terrazzo/plugin-css`'s own `permutations` and `transform()` options can produce
the `light-dark()` shape without a plugin is checked in spike S2 (09). If they can,
configuration is preferred to code.

### Gates

Run by one command locally and in CI, as TOMBO's `npm run check` is today.

| Gate | Fails when |
| --- | --- |
| Token validity | `tz check` or `tz lint` reports an error; a token has no `$description` |
| Contrast | Any declared pair is under its floor, or `rain.body` is over its ceiling, in any context. Includes a self-test of the luminance maths against known pairs, as `check_contrast.py --self-test` does now |
| Golden values | The measured minima differ from the table in `10-verification-log.md` without that table being updated in the same change |
| No raw values | A colour literal, or a `font-size` / `z-index` literal, appears in component CSS outside `tokens.css` |
| Unknown token | CSS or a story references a `--mx-*` property that does not exist |
| Freshness | Committed generated docs (`docs/tokens.md`) differ from a fresh build |
| Baseline | `stylelint-plugin-use-baseline` at `widely`, with every exception listed and justified (the "PE ledger" TOMBO keeps in `stylelint.config.mjs`) |

The contrast gate is a matrix script that reads `dist/tokens.json`, not Terrazzo's
`a11y/min-contrast` rule alone, because the gate must run per context and enforce a ceiling,
and whether the built-in rule evaluates every resolver context has not been verified.

## Rename map (prototype → matrix)

For the implementer porting `matrix.css`. Left column is exhaustive for the prototype's `:root`.

| Prototype | matrix |
| --- | --- |
| `--bg` | `--mx-color-ground` |
| `--panel` | `--mx-color-panel` |
| `--rule` | `--mx-color-rule` |
| `--text` | `--mx-color-text` |
| `--muted` | `--mx-color-text-muted` (text) or `--mx-color-control-border` (a control's boundary) |
| `--lead` | `--mx-color-text-lead` |
| `--green` | `--mx-color-accent`, or `--mx-color-focus` in outlines |
| `--bg` as text on `--green` | `--mx-color-on-accent` |
| `--rain-tail`, `--rain`, `--rain-head` | `--mx-color-rain-tail`, `--mx-color-rain-body`, `--mx-color-rain-head` |
| `--pill-human`, `--pill-machine` | `--mx-color-reading-human`, `--mx-color-reading-machine` |
| `--glow` | `0 0 12px var(--mx-color-glow)` |
| `--mono`, `--dot` | `--mx-font-family-mono`, `--mx-font-family-dot` |
| `--pad` | `--mx-pad` |
| `--logo-filter` | `--mx-logo-filter` |
| `--etch`, `--x`, `--t`, `--d`, `--rest`, `--j`, `--h`, `--vvh` | Instance properties set by markup or script; documented with their component |

## Not doing

- **OKLCH or Display-P3 sources.** The approved colours are sRGB hex. A wider-gamut phosphor
  is a visual change and needs its own approval.
- **A token for every number.** See "Space, size, border".
- **Figma or Tokens Studio sync.** There is no design file. Storybook is the visual source of truth.
- **Tailwind or utility generation.** No consumer uses it.
