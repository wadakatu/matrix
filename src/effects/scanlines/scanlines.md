---
name: Scan lines
status: approved
attributes: [data-reading]
tokens: [color.scanline, layer.scanline, layer.lifted]
---

# Scan lines

## Purpose

The tube in 機械用: a fixed wash of `color.scanline` on one pixel row in three, over the whole screen.

## Contract

```html
<!-- A root effect: no markup. `:root[data-reading="machine"] body::after` -->
```

## Variants and states

- 機械用 only. Under the status line (`layer.scanline` 20 < `layer.status` 25).
- The logo, the header switch, the open menu button and pressed controls are lifted above them
  (`layer.lifted`), so the mark is shown as designed (L5) and filled faces keep their glyphs.
- Not drawn in forced colours or in print.

## Behaviour

CSS only; no pointer events.

## Tokens

`color.scanline`; `layer.scanline`, `layer.lifted`. It sits under `layer.status`, which the status
line reads.

## Accessibility

Contrast is measured without them; the night margins absorb the 28% wash (05, rule 7).

## Do / Don't

- Do lift anything filled with `accent` in 機械用.
- Don't draw them in 人間用.
