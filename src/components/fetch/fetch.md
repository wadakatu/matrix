---
name: Fetch card
status: approved
class: mx-fetch
attributes: []
tokens: [space.1-5, space.2]
---

# Fetch card

## Purpose

neofetch's card: the real mark beside key and value lines (L1, L5).

## Contract

```html
<div class="mx-fetch">
  <img class="mx-logo mx-fetch-mark" src="/assets/logo/logo-400.png" alt="fixture_ logo" width="400" height="400" />
  <div class="mx-fetch-side"><div class="mx-ln">…</div></div>
</div>
```

## Variants and states

- From 600px the mark stands beside the lines, `clamp(132px, 26vmin, 224px)`; below, above them at 112px.
- Values that wrap stay in their own column. The mark takes the palette filter (operator-night).

## Behaviour

Printed by `render` from a card item (`{ card: { src, alt, width, height }, lines }`), at build time
and live. No behaviour of its own.

## Tokens

`space.1-5`, `space.2`. The lines read the line tones (Terminal); the mark reads the Logo's.

## Accessibility

The image has the interpreter's `alt`. The swatches row is decoration (`aria-hidden`).

## Do / Don't

- Do use the designer's file, whole and square.
- Don't draw the mark out of characters.
- Don't put a fact only in the image.
