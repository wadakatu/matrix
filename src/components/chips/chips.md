---
name: Chips
status: approved
class: mx-chips
tokens: [color.text-muted, color.text-lead, color.accent, color.ground, color.rule, color.control-border, font.size.meta, radius.control, border.width.hair, space.0-5, space.1-5, space.2, space.3]
---

# Chips

## Purpose

Suggested commands to tap, and on touch the keys a phone keyboard lacks (L3).

## Contract

```html
<div class="mx-chips" role="group" aria-label="Keys and suggested commands">
  <button class="mx-chip" type="button" data-key="Tab" aria-label="Complete">tab</button>
  <button class="mx-chip" type="button" data-key="ArrowUp" aria-label="Previous command">↑</button>
  <button class="mx-chip" type="button" data-key="ArrowDown" aria-label="Next command">↓</button>
  <button class="mx-chip" type="button" data-key="C-c" aria-label="Cancel">^C</button>
  <button class="mx-chip" type="button" data-run="help">help</button>
</div>
```

## Variants and states

- One row that scrolls sideways in itself. Hover: `text-lead` on an `accent` border.
- Coarse pointer: bigger chips, and the four key chips first (`accent` on `control-border`).
  Fine pointer: the key chips are absent.
- Absent without scripts.

## Behaviour

`mx-terminal` runs a chip's command, or presses its key (Tab, Up, Down, Ctrl+C), without moving focus:
a phone's keyboard stays as it was, and a desktop field keeps focus.

## Tokens

`color.text-muted`, `color.text-lead`, `color.accent`, `color.ground`, `color.rule`,
`color.control-border`; `font.size.meta`; `radius.control`; `border.width.hair`; `space.0-5`,
`space.1-5`, `space.2`, `space.3`.

## Accessibility

Buttons in a labelled group; the key chips have names (`Complete`, `Previous command`, `Next command`,
`Cancel`). A chip's border is `rule`, decoration: its label identifies it (05, rule 4). Every chip is
at least 24px tall. Keyboard: each chip is a tab stop after the screen.

## Do / Don't

- Do put the keys first on touch.
- Don't move focus when a chip runs.
- Don't add a chip for a command the interpreter does not have.
