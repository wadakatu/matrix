---
name: Control
status: approved
class: mx-control
attributes: [aria-pressed, data-action]
tokens: [color.text, color.text-lead, color.ground, color.control-border, color.accent, color.on-accent, color.focus, font.size.ui, font.leading.ui, radius.control, border.width.hair, border.width.strong, space.1, space.2, space.3]
---

# Control

## Purpose

One look for a button, a link, and a label wrapping a checkbox. It is also the chrome's three
controls: Hold rain, Operator colours and Daylight (L4, L7).

## Contract

```html
<label class="mx-control" data-action="hold"><input type="checkbox"> Hold rain</label>
<button class="mx-control" data-action="palette" type="button" aria-pressed="false">Operator colours</button>
<button class="mx-control" data-action="theme" type="button" aria-pressed="false">Daylight</button>
```

On a page with two readings the shortcut's off switch is one more:
`<label class="mx-control" data-action="shortcut"><input type="checkbox" checked> Enable <kbd>\</kbd> / <kbd>¥</kbd> shortcut</label>`
(Readings).

A plain control is `<button class="mx-control" type="button">` or `<a class="mx-control" href>`.

## Variants and states

- Rest: `text` on `ground`, a 1px `control-border` box. Hover: `text-lead`, `accent` border.
- Pressed (`aria-pressed="true"`): filled `accent` with `on-accent` text.
- `data-action="hold"`: a checkbox in the label, `accent` tick. Hidden when motion is off,
  because then nothing moves. Present in both readings.
- `data-action="shortcut"`: a checked checkbox; hidden until `mx-readings` is defined, so a page
  without two readings, or without scripts, never shows it.
- `data-action="palette"`, `data-action="theme"`: hidden until `mx-root` is defined; the
  theme toggle is also hidden where `light-dark()` is missing (03).

## Behaviour

No element of its own. `mx-root` drives the toggles: Daylight sets `data-theme` and stores
`mx-theme`; Operator colours sets `data-palette` and rewrites the address and every in-site link,
storing nothing (decision Q4); Hold rain sets `data-rain="held"`. Without scripts Hold rain still
works through `:has()`, and the two toggles are absent.

## Tokens

`color.text`, `color.text-lead`, `color.ground`, `color.control-border`, `color.accent`,
`color.on-accent`, `color.focus`; `font.size.ui`, `font.leading.ui`; `radius.control`;
`border.width.hair`, `border.width.strong`; `space.1`, `space.2`, `space.3`.

## Accessibility

Buttons expose `aria-pressed`. The Hold rain label is outlined when its checkbox has focus
(the replacement for the checkbox's own ring, 05). Keyboard: Tab to each; Space toggles; Enter
presses a button. Every control is at least 24px tall, 44px in the phone menu.
In forced colours a pressed button is `Highlight` with `HighlightText`; the checkbox shows its
own state.

## Do / Don't

- Do use `control-border` for a control's box; `rule` is decoration.
- Don't render a toggle that needs scripts as a dead button.
- Don't set the pressed state with a class.
