---
name: Footer
status: approved
class: mx-footer
attributes: []
tokens: [color.ground, color.rule, color.text-muted, font.size.meta, border.width.hair, space.2, space.5, space.7, space.10, space.12, space.18]
---

# Footer

## Purpose

Contact links and the logo's credit, at the end of every page (L5: the designer is credited).

## Contract

```html
<footer class="mx-footer mx-frame">
  <div class="mx-footer-row">…</div>
  <a href="mailto:…">…</a>
  <a href="https://github.com/…">GitHub</a>
</footer>
```

The row is rendered only when the default slot has content. On a page with two readings the Layout
puts the shortcut's off switch and its one-line hint there (Readings).

## Variants and states

One. `text-muted` links at `meta` size on `ground` under a `rule`; 72px above it, 48px below 720px.

## Behaviour

No element. Hidden in the live shell (task 4.3), where the status line replaces it.

## Tokens

`color.ground`, `color.rule`, `color.text-muted`, `font.size.meta`, `border.width.hair`,
`space.2`, `space.5`, `space.7`, `space.10`, `space.12`, `space.18`.

## Accessibility

A `contentinfo` landmark. A link whose label is in the other language carries `lang`.
Keyboard: Tab through the links.

## Do / Don't

- Do credit the logo's designer here.
- Don't put the page's own content in the footer.
