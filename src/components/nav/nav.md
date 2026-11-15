---
name: Nav
status: approved
class: mx-nav
tokens: [color.text-muted, color.text-lead, color.accent, border.width.strong, space.6]
---

# Nav

## Purpose

The site's main links in the header. The items are the site's; only the landmark's name is a
chrome string (L6).

## Contract

```html
<nav class="mx-nav" aria-label="Main">
  <a href="/" aria-current="page">Home</a>
  <a href="/projects/">Projects</a>
</nav>
```

## Variants and states

- 人間用: links in `text-muted`; the current one (`aria-current`) is `text-lead`, underlined
  2px in `accent`; hover is `text-lead`.
- 機械用 (`:root[data-reading="machine"]`): a numbered window list drawn with CSS counters,
  `0:Home*`, the current one starred in `accent` and not underlined. The numbers and the star
  are generated content with empty alternative text.
- Below 720px it is inside the Menu, as a column of 44px lines with dotted rules.

## Behaviour

No element.

## Tokens

`color.text-muted`, `color.text-lead`, `color.accent`, `border.width.strong`, `space.6`.

## Accessibility

A `nav` landmark named by the chrome string (`Main`, `メイン`). `aria-current="page"` on the
page itself, `"true"` within its section. Keyboard: Tab through the links in order.

## Do / Don't

- Do mark the current page with `aria-current`, never with a class.
- Don't put controls in the nav; they belong to the controls group.
