---
name: Readings
status: approved
element: mx-readings
tokens: [font.size.ui, font.leading.terminal, space.1]
---

# Readings

## Purpose

Both readings of one page in one document, and the in-place change between them (L3).

## Contract

```html
<mx-readings data-human-title="…" data-machine-title="…" data-human-status="Human reading" data-machine-status="Machine reading">
  <h1 class="mx-name">wadakatu</h1>
  <div data-reading="human">…</div>
  <div data-reading="machine">…</div>
</mx-readings>
```

Links that lead to a reading carry `data-to="human|machine"` (the Switch, the guide's link, the status
line's link). Links that follow the reading carry both addresses: `data-human-href` and
`data-machine-href` (the Mark, the Nav, a panel's links).

## Variants and states

- The root's `data-reading` decides which child is shown; the other is `display: none`.
- `aria-busy="true"` while a change runs.
- 機械用's container is set at `font.size.ui` on `font.leading.terminal`.

## Behaviour

`mx-readings` turns a click on any `a[data-to]`, or the `\` / `¥` shortcut, into an in-place change:
the root attribute, the address (the static twin with the carried flags: `palette`, `motion`), the
title, "Machine reading" / "Human reading" in the status region, `aria-current` on the switches, the
links that follow the reading, and focus, moved to the header switch if it was inside the reading
being hidden. It emits `mx:reading` with the new value (again when the session has printed).

With motion: into 機械用 the text on screen turns into the hex of its own characters, the picture
collapses to a line, and the session prints; back, the session clears from the bottom, the page opens
from a line, its headings settle and the Name doubles once. Web Animations API, no third-party code
(decision Q6, spike S3). A second request finishes the first, completely, then starts; reduced motion
switched on mid-change finishes it; leaving the page finishes it. Nothing is left styled, scrambled or
`aria-busy`.

The shortcut has the prototype's guards (modifiers except AltGr, form fields, editable content, IME
composition, already-handled events, the boot) and an off switch: the "Enable `\` / `¥` shortcut"
checkbox, stored as `localStorage['mx-shortcut']`, in the footer and in the menu (from 720px the
menu shows it only in the live shell, where the footer is gone).

Without scripts every `a[data-to]` is a plain link to its static twin and the shortcut and its off
switch are absent.

## Tokens

`font.size.ui`, `font.leading.terminal`; `space.1`.

## Accessibility

The hidden reading is out of the accessibility tree and the tab order. One polite announcement per
change. Focus is never left in a hidden reading. The shortcut can be turned off (2.1.4) from both
readings. Reduced motion: an instant change.

## Do / Don't

- Do give both readings the same facts (L3).
- Don't put the Name inside one reading.
- Don't link a reading with `data-reading`; that attribute is for the containers.
