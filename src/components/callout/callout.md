---
name: Callout
status: draft
class: mx-callout
attributes: [data-variant]
tokens: [color.accent, color.ground, color.rule, color.text-muted, font.size.meta, font.weight.medium, font.leading.ui, border.width.hair, border.width.strong, space.1, space.3, space.4]
---

# Callout

## Purpose

`:::message` and `:::message alert`: a note inside the article, told apart by its word, not by a hue
(L7). A draft (04): not approved until wadakatu has seen it.

## Contract

```html
<aside class="mx-callout">
  <p class="mx-callout-label">Note</p>
  <p>…</p>
</aside>
```

The alert adds `data-variant="alert"`; its label is the Warning string.

## Variants and states

| | Message (default) | Alert (`data-variant="alert"`) |
| --- | --- | --- |
| Box | `ground`, hairline `rule`, padding 12px by 16px | The same |
| Left rule | 2px `text-muted` | 2px `accent` |
| Label | Note / メモ, `text-muted` | `!` (generated), then Warning / 警告, `accent` |

The label is `meta` size, medium, in the page's chrome face; the body is Prose as outside the box,
4px under the label, 12px between blocks.

## Behaviour

No element. Static; complete without scripts.

## Tokens

`color.accent`, `color.ground`, `color.rule`, `color.text-muted`; `font.size.meta`,
`font.weight.medium`, `font.leading.ui`; `border.width.hair`, `border.width.strong`; `space.1`,
`space.3`, `space.4`.

## Accessibility

An `aside`, as Zenn writes it; never `role="alert"`, which is a live region. The label is real text,
so the two variants differ by their word in forced colours and on paper; the `!` has empty
alternative text. Nothing in it takes focus but the author's links. Printed with `break-inside: avoid`.

## Do / Don't

- Do let it hold whatever Prose holds.
- Don't give the alert a hue of its own.
- Don't use it for a message that has just appeared.
