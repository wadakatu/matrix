---
name: Details
status: draft
class: mx-details
attributes: []
tokens: [color.accent, color.rule, font.weight.medium, font.leading.title, border.width.hair, size.target, space.3, space.4]
---

# Details

## Purpose

`:::details title`: part of the article folded away, a native disclosure boxed as the login card is.
A draft (04): not approved until wadakatu has seen it.

## Contract

```html
<details class="mx-details">
  <summary class="mx-details-summary">A fixture example</summary>
  <div class="mx-details-body">…</div>
</details>
```

## Variants and states

- Closed: a hairline `rule` box, no fill; the summary at least 44px tall, 16px inline padding, `accent`,
  medium, Prose's size at `leading.title`, `▸` before it.
- Open: `▾`, a hairline under the summary, the body with 16px padding and 12px between blocks.
- Starts closed, as Zenn writes it. In print it is open, with `▾`.

## Behaviour

Native, with no element. It does not animate (no row in the motion catalogue, 05).

## Tokens

`color.accent`, `color.rule`; `font.weight.medium`, `font.leading.title`; `border.width.hair`;
`size.target`; `space.3`, `space.4`.

## Accessibility

Tab reaches the summary; Enter or Space opens and closes it. The focus ring is inside the box. The
marker is generated with empty alternative text, and the native marker is not drawn. The summary is
the author's text; matrix has no default summary string.

## Do / Don't

- Do keep the author's summary as written.
- Don't animate it.
- Don't nest a fill in it: what it holds keeps its own cut.
