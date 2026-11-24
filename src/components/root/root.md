---
name: Root
status: approved
element: mx-root
attributes: [data-theme, data-palette, data-motion, data-rain]
tokens: []
---

# Root

## Purpose

The controller of the page's state: theme, palette, motion and the flags in-site links carry, kept in
step with the attributes the head script set before the first paint (L7).

## Contract

```html
<mx-root data-wide="…" data-narrow="…">…the page…</mx-root>
```

Rendered by Layout around the whole body. `data-wide` and `data-narrow` are the corpus's glyph pools,
which Decode reads (L1). The controls it drives are Control's: `[data-action="theme"]`,
`[data-action="palette"]` and `[data-action="hold"] input`.

## Variants and states

What it keeps on `<html>`:

- `data-theme`: `day` or `night`, flipped by Daylight and stored as `localStorage['mx-theme']`.
- `data-palette="operator"`: set and removed by Operator colours, which rewrites the address; never
  stored (decision Q4).
- `data-motion="off"`: follows the system's reduced-motion setting live, and stays off for `?motion=0`.
- `data-rain="held"`: while Hold rain is checked.

## Behaviour

On connection it removes TOMBO's old `tombo-theme` key, wires the three controls and syncs: each
toggle's `aria-pressed`, `theme-color` from the root's background, and every in-site link, which
carries `palette=operator` exactly while the palette is on and `motion=0` exactly while the address
has it. Changing the palette also drops the spent flags from the address. `carry()` and `sync()` are
public; Readings uses them. Storage that throws changes nothing visible. Without it
the head script still carries the flags on links, and the theme and palette toggles are hidden
(Control).

## Tokens

None. `display: block` is its only style.

## Accessibility

The toggles' pressed state is `aria-pressed`, always in step with the root. It adds no focusable
element and moves no focus.

## Do / Don't

- Do keep one `<mx-root>` per page, around everything.
- Don't store the palette or the motion flag.
