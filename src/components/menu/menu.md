---
name: Menu
status: approved
class: mx-menu
element: mx-menu
tokens: [color.text-muted, color.accent, color.on-accent, color.rule, size.target, space.1, space.2, space.3]
---

# Menu

## Purpose

Folds the nav and the controls into one native disclosure below 720px, so the header is one
slim row on a phone. From 720px up it lays no box at all.

## Contract

```html
<mx-menu>
  <details class="mx-menu">
    <summary class="mx-control"><span class="mx-menu-label">Menu</span></summary>
    <nav class="mx-nav" aria-label="Main">…</nav>
    <div class="mx-controls">…</div>
  </details>
</mx-menu>
```

## Variants and states

- From 720px: the `details` and its content are `display: contents`, the summary is not drawn,
  and the nav and controls are the header's own items whether it is open or closed.
- Below 720px, closed: a 46px button of three rules, in `text-muted`. Open (`[open]`): the
  filled `accent` face with one rule, and the nav and the controls unfold under the row as 44px
  lines.
- An engine without `::details-content` gets a plain disclosure labelled Menu at every width.

## Behaviour

The native `details` opens and closes without scripts. `mx-menu` adds four ways to close it:
Escape, a press outside the header, a change of reading (`mx:reading`) and `pagehide`. If focus
was on something that closing hides, it goes to the button. Nothing is missing without
JavaScript except those four.

## Tokens

`color.text-muted`, `color.accent`, `color.on-accent`, `color.rule`, `size.target`, `space.1`,
`space.2`, `space.3`. The 46px cell, 3px row padding and the 16×12 three-rule glyph are the
prototype's one-off numbers.

## Accessibility

A native disclosure: the summary is a button named by its (visually hidden) word, with its
expanded state. Keyboard: Tab to the button; Enter or Space opens; Tab moves through the nav
and controls; Escape closes and returns focus to the button.

## Do / Don't

- Do keep the markup order nav, then controls: it is the Tab order at every width.
- Don't add `aria-expanded` or `aria-controls`; the summary already exposes both.
