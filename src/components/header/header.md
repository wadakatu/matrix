---
name: Header
status: approved
class: mx-header
tokens: [color.ground, color.rule, font.size.ui, border.width.hair, space.2, space.3, space.7]
---

# Header

## Purpose

The page's one row of chrome: the Mark, the Nav and the controls (L7: the palette and the
theme are chosen here).

## Contract

```html
<header class="mx-header mx-frame">
  <a class="mx-mark" href="/">…</a>
  <mx-menu><details class="mx-menu">
    <summary class="mx-control"><span class="mx-menu-label">Menu</span></summary>
    <nav class="mx-nav" aria-label="Main">…</nav>
    <div class="mx-controls">
      <mx-switch class="mx-switch" role="group" aria-label="Reading">…</mx-switch>
      <label class="mx-control" data-action="hold">…</label>
      <button class="mx-control" data-action="palette" …>…</button>
      <button class="mx-control" data-action="theme" …>…</button>
      <a class="mx-lang" href="/ja/" hreflang="ja" lang="ja">日本語</a>
    </div>
  </details></mx-menu>
</header>
```

The language link is rendered only where the page has a twin.

## Variants and states

- 69px tall at 1440 and 53px below 720px, in both readings.
- 機械用: the bottom rule is dashed, and the Nav is a window list.
- Below 720px: one row (the Mark, the menu button, the switch); the rest unfolds from the Menu.

## Behaviour

No element of its own; `mx-menu` and `mx-root` work inside it. Without scripts the menu is a
native disclosure and Hold rain works; Daylight and Operator colours are absent.

## Tokens

`color.ground`, `color.rule`, `font.size.ui`, `border.width.hair`, `space.2`, `space.3`, `space.7`.

## Accessibility

A `header` landmark. Tab order: Mark, nav links, the switch, Hold rain, Operator colours,
Daylight, the language link; below 720px, Mark, Menu, the switch, and the menu's contents when open.

## Do / Don't

- Do keep it out of the page's flow of reading: it is not sticky.
- Don't add items between the nav and the controls; the order is the Tab order.
