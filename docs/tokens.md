# Tokens

Generated from `tokens/` by `npm run docs`. Do not edit; `npm run check` fails when this
file differs from a fresh build. Values are the CSS values in `dist/tokens.json`.

## Colour roles

| Token | Custom property | phosphor-night | phosphor-day | operator-night | operator-day | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `color.accent` | `--mx-color-accent` | `#2bf07a` | `#0a5a31` | `#d9b56a` | `#0a4f2f` | The lit colour of the context (phosphor green or operator amber). Use for identity, links, headings, prompts, current state. Never running body text, and never assume it is green. Must clear 4.5:1 on ground and panel. |
| `color.control-border` | `--mx-color-control-border` | `#80c194` | `#2a4735` | `#c2b496` | `#2f4236` | The boundary of a control that is identified by its box. Alias of color.text-muted. Must clear 3:1 on ground and panel. |
| `color.focus` | `--mx-color-focus` | `#2bf07a` | `#0a5a31` | `#d9b56a` | `#0a4f2f` | The focus indicator. Alias of color.accent. Use only for focus outlines. Must clear 3:1 on ground and panel. |
| `color.glow` | `--mx-color-glow` | `#2bf07a73` | `#0a5a3100` | `#d9b56a73` | `#0a4f2f00` | Phosphor bloom: accent at 45% alpha at night, transparent by day, so text-shadow needs no theme selector. For the name line and lit bits in 機械用 only; never on reading text. |
| `color.ground` | `--mx-color-ground` | `#020805` | `#ccd7c9` | `#100e0b` | `#cdd6cb` | The screen itself, the darkest surface at night. Use for the page background, text on a filled accent face, and the code block background. Never a foreground on another surface. |
| `color.on-accent` | `--mx-color-on-accent` | `#020805` | `#ccd7c9` | `#100e0b` | `#cdd6cb` | Text on an accent fill (filled controls, the status line). Alias of color.ground. Must clear 4.5:1 on accent. |
| `color.panel` | `--mx-color-panel` | `#06120b` | `#dee7db` | `#17140f` | `#dbe2d9` | A solid reading surface laid on the ground. Use for panels and hover fills. Reading text sits only on ground or panel. |
| `color.rain.body` | `--mx-color-rain-body` | `#1a8f4a` | `#5f8c6c` | `#8a7b5e` | `#6f8073` | Body of a rain drop. Decoration only; never text. Has a contrast ceiling: at most 5:1 on ground, so rain stays below reading brightness (law L2). |
| `color.rain.head` | `--mx-color-rain-head` | `#d6ffe2` | `#0a3a20` | `#f0e0b4` | `#06281a` | Leading glyph of a rain drop. Decoration only; never text. |
| `color.rain.tail` | `--mx-color-rain-tail` | `#0b3d20` | `#b9c9b8` | `#2a251d` | `#b7c3b6` | Dimmest end of a rain drop. Decoration only; never text. |
| `color.reading.human` | `--mx-color-reading-human` | `#58b7ff` | `#0b5cad` | `#58b7ff` | `#0b5cad` | Dot on the 人間用 side of the capsule switch. The capsule's dots only, never text. Must clear 3:1 on ground and panel. |
| `color.reading.machine` | `--mx-color-reading-machine` | `#ff5d4f` | `#b3261e` | `#ff5d4f` | `#b3261e` | Dot on the 機械用 side of the capsule switch. The capsule's dots only, never text. Must clear 3:1 on ground and panel. |
| `color.rule` | `--mx-color-rule` | `#1d4d2f` | `#7f9a86` | `#3d362c` | `#8fa093` | Hairline for decorative separators only. Never the only boundary of a control: it measures 1.5–2.4:1 and is exempt from contrast as decoration. |
| `color.scanline` | `--mx-color-scanline` | `#02080547` | `#ccd7c947` | `#100e0b47` | `#cdd6cb47` | Scan-line wash: ground at 28% alpha. Decoration only; contrast is measured without it. |
| `color.text` | `--mx-color-text` | `#c4f2d0` | `#0c2115` | `#ece4d4` | `#111b15` | Body text. Use for all running text. Must clear 7:1 on ground and panel. |
| `color.text-lead` | `--mx-color-text-lead` | `#eafff0` | `#03130a` | `#f0e0b4` | `#06281a` | Emphasised text for short runs: titles, strong, hover. Not for paragraphs at night. Must clear 7:1 on ground and panel. |
| `color.text-muted` | `--mx-color-text-muted` | `#80c194` | `#2a4735` | `#c2b496` | `#2f4236` | Secondary text: meta lines, captions, hints. Dim with this colour, never with opacity. Must clear 4.5:1 on ground and panel. |

## Scales

| Token | Custom property | Value | Description |
| --- | --- | --- | --- |
| `border.width.hair` | `--mx-border-width-hair` | `1px` | Hairline border (1px). |
| `border.width.strong` | `--mx-border-width-strong` | `2px` | Strong border, and the focus ring width (2px). |
| `breakpoint.desk` | `--mx-breakpoint-desk` | `1100px` | Breakpoint desk (1100px). Media queries cannot read custom properties, so CSS uses this literal; lint allows only the four breakpoints. |
| `breakpoint.phone` | `--mx-breakpoint-phone` | `600px` | Breakpoint phone (600px). Media queries cannot read custom properties, so CSS uses this literal; lint allows only the four breakpoints. |
| `breakpoint.tablet` | `--mx-breakpoint-tablet` | `720px` | Breakpoint tablet (720px). Media queries cannot read custom properties, so CSS uses this literal; lint allows only the four breakpoints. |
| `breakpoint.wall` | `--mx-breakpoint-wall` | `1360px` | Breakpoint wall (1360px). Media queries cannot read custom properties, so CSS uses this literal; lint allows only the four breakpoints. |
| `font.family.dot` | `--mx-font-family-dot` | `"DotGothic16", "M PLUS 1 Code", ui-monospace, monospace` | Rain, boot, curtain and the rain switch. Never reading text. |
| `font.family.ja` | `--mx-font-family-ja` | `"M PLUS 1 Code", "IBM Plex Mono", ui-monospace, "Menlo", monospace` | Any run marked lang="ja": M PLUS 1 Code, then the mono stack. |
| `font.family.mono` | `--mx-font-family-mono` | `"IBM Plex Mono", "M PLUS 1 Code", ui-monospace, "Menlo", monospace` | Latin text, controls and code. |
| `font.leading.code` | `--mx-font-leading-code` | `1.75` | Line height for code blocks. |
| `font.leading.read` | `--mx-font-leading-read` | `2` | Line height for Japanese article body. |
| `font.leading.terminal` | `--mx-font-leading-terminal` | `1.6` | Line height for terminal output. |
| `font.leading.tight` | `--mx-font-leading-tight` | `1.25` | Tight line height for display lines. |
| `font.leading.title` | `--mx-font-leading-title` | `1.45` | Line height for titles. |
| `font.leading.ui` | `--mx-font-leading-ui` | `1.7` | Line height for page text and chrome. |
| `font.size.body` | `--mx-font-size-body` | `0.9375rem` | Page text (15px). |
| `font.size.entry.max` | `--mx-font-size-entry-max` | `2.125rem` | Entry names in stream rows, largest end (34px). |
| `font.size.entry.min` | `--mx-font-size-entry-min` | `1.375rem` | Entry names in stream rows, smallest end (22px). |
| `font.size.heading` | `--mx-font-size-heading` | `1.375rem` | Article h2 (22px). |
| `font.size.label` | `--mx-font-size-label` | `0.75rem` | Code language tab and Copy (12px). |
| `font.size.lead` | `--mx-font-size-lead` | `1.125rem` | Role line and article h3 (18px). |
| `font.size.meta` | `--mx-font-size-meta` | `0.8125rem` | Meta lines, hints, chips, the status line and the footer (13px). |
| `font.size.prompt.max` | `--mx-font-size-prompt-max` | `2.75rem` | The name as a terminal line, largest end (44px). |
| `font.size.prompt.min` | `--mx-font-size-prompt-min` | `1.75rem` | The name as a terminal line, smallest end (28px). |
| `font.size.rain` | `--mx-font-size-rain` | `16px` | Rain glyphs. DotGothic16 is drawn for 16px, so this is pixels on purpose. |
| `font.size.read` | `--mx-font-size-read` | `1.0625rem` | Article body from 720px (17px). |
| `font.size.read-compact` | `--mx-font-size-read-compact` | `1rem` | Article body below 720px, and the command field on touch (16px). |
| `font.size.title.max` | `--mx-font-size-title-max` | `2.375rem` | Article title, largest end of its fluid size (38px). |
| `font.size.title.min` | `--mx-font-size-title-min` | `1.5rem` | Article title, smallest end of its fluid size (24px). |
| `font.size.ui` | `--mx-font-size-ui` | `0.875rem` | Header, controls, terminal text and code blocks (14px). |
| `font.weight.bold` | `--mx-font-weight-bold` | `700` | Bold. The giant name only. |
| `font.weight.medium` | `--mx-font-weight-medium` | `500` | Medium weight for marks, labels and headings. |
| `font.weight.regular` | `--mx-font-weight-regular` | `400` | Regular weight for running text. |
| `layer.boot` | `--mx-layer-boot` | `30` | z-index of the boot layer. Every z-index comes from this list. |
| `layer.curtain` | `--mx-layer-curtain` | `40` | z-index of the curtain layer. Every z-index comes from this list. |
| `layer.lifted` | `--mx-layer-lifted` | `21` | z-index of the lifted layer. Every z-index comes from this list. |
| `layer.overlay` | `--mx-layer-overlay` | `22` | z-index of the overlay layer. Every z-index comes from this list. |
| `layer.rain` | `--mx-layer-rain` | `-1` | z-index of the rain layer. Every z-index comes from this list. |
| `layer.scanline` | `--mx-layer-scanline` | `20` | z-index of the scanline layer. Every z-index comes from this list. |
| `layer.skip` | `--mx-layer-skip` | `50` | z-index of the skip layer. Every z-index comes from this list. |
| `layer.status` | `--mx-layer-status` | `25` | z-index of the status layer. Every z-index comes from this list. |
| `motion.blink.count` | `--mx-motion-blink-count` | `5` | Cursor blinks five times, then stays lit. |
| `motion.blink.duration` | `--mx-motion-blink-duration` | `1000ms` | Cursor blink period. |
| `motion.boot.failsafe` | `--mx-motion-boot-failsafe` | `8000ms` | The intro ends no later than this. |
| `motion.decode.duration` | `--mx-motion-decode-duration` | `450ms` | Text settling out of corpus glyphs. |
| `motion.double.duration` | `--mx-motion-double-duration` | `200ms` | The name doubling on return to 人間用. |
| `motion.drip.duration` | `--mx-motion-drip-duration` | `3200ms` | One cycle of the drop through the idle strand of the switch. |
| `motion.echo.duration` | `--mx-motion-echo-duration` | `480ms` | Déjà vu. |
| `motion.rain.duration.max` | `--mx-motion-rain-duration-max` | `21s` | Longest fall of one rain column (21s). |
| `motion.rain.duration.min` | `--mx-motion-rain-duration-min` | `9s` | Shortest fall of one rain column (9s). |
| `motion.shell.fallback` | `--mx-motion-shell-fallback` | `4000ms` | After this the recorded session gets its scrolling page back. |
| `motion.strand.duration.max` | `--mx-motion-strand-duration-max` | `11s` | Longest fall of one stream strand (11s). |
| `motion.strand.duration.min` | `--mx-motion-strand-duration-min` | `5s` | Shortest fall of one stream strand (5s). |
| `motion.wipe.duration` | `--mx-motion-wipe-duration` | `240ms` | A side of the switch becoming current. |
| `motion.wipe.steps` | `--mx-motion-wipe-steps` | `3` | Steps of the wipe; compose as steps(var(--mx-motion-wipe-steps)). |
| `radius.capsule` | `--mx-radius-capsule` | `999px` | Fully rounded capsule ends. |
| `radius.control` | `--mx-radius-control` | `2px` | Corner radius of controls. Panels and the logo have no radius. |
| `size.frame` | `--mx-size-frame` | `1376px` | Maximum content width of the frame. |
| `size.logo.header` | `--mx-size-logo-header` | `44px` | Logo in the header (44px). |
| `size.logo.header-compact` | `--mx-size-logo-header-compact` | `32px` | Logo in the compact header (32px). |
| `size.measure.lede` | `--mx-size-measure-lede` | `68` | Measure of Latin ledes and captions, in ch (68ch). A number because DTCG dimensions allow only px, em and rem; use as calc(var(--mx-size-measure-lede) * 1ch). |
| `size.measure.read` | `--mx-size-measure-read` | `680px` | Article measure from 720px: 40 full-width characters at the body size. |
| `size.measure.read-compact` | `--mx-size-measure-read-compact` | `640px` | Article measure below 720px: 40 full-width characters at the body size. |
| `size.rail` | `--mx-size-rail` | `264px` | Width of the contents rail. |
| `size.target` | `--mx-size-target` | `44px` | Touch target for primary controls (44px). |
| `size.target-min` | `--mx-size-target-min` | `24px` | Floor for any target (24px, WCAG 2.5.8). |
| `space.0-5` | `--mx-space-0-5` | `2px` | Space step 0-5 (2px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.1` | `--mx-space-1` | `4px` | Space step 1 (4px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.1-5` | `--mx-space-1-5` | `6px` | Space step 1-5 (6px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.10` | `--mx-space-10` | `40px` | Space step 10 (40px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.12` | `--mx-space-12` | `48px` | Space step 12 (48px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.18` | `--mx-space-18` | `72px` | Space step 18 (72px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.2` | `--mx-space-2` | `8px` | Space step 2 (8px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.3` | `--mx-space-3` | `12px` | Space step 3 (12px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.4` | `--mx-space-4` | `16px` | Space step 4 (16px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.5` | `--mx-space-5` | `20px` | Space step 5 (20px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.6` | `--mx-space-6` | `24px` | Space step 6 (24px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
| `space.7` | `--mx-space-7` | `28px` | Space step 7 (28px). Use for gaps, padding and margins that repeat; one-off layout numbers stay literal. |
