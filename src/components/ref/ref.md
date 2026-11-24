---
name: Reference link
status: approved
class: mx-ref
attributes: []
tokens: [color.accent, color.ground, color.rule, color.text-lead, color.text-muted, font.family.mono, font.size.meta, font.leading.ui, border.width.hair, border.width.strong, space.2, space.3]
---

# Reference link

## Purpose

A link whose text is its own address, written alone on a line: host, then path, so the reader sees
where it goes (L1).

## Contract

```html
<a class="mx-ref" href="https://example.com/fixture/station/README.md"><span class="mx-ref-host">example.com</span><span class="mx-ref-path">/fixture/station/README.md</span></a>
```

`Ref.astro` takes the absolute address and splits it; a leading `www.` is not shown.

## Variants and states

One. `ground` cut into the panel, a hairline `rule` with a 2px `accent` rule at the left, `↗` in
`accent`; host `text-lead`, path `text-muted`, mono at `meta` size, wrapping anywhere. Hover: the
border goes `accent` and the host is underlined.

## Behaviour

No element. A plain link.

## Tokens

`color.accent`, `color.ground`, `color.rule`, `color.text-lead`, `color.text-muted`;
`font.family.mono`, `font.size.meta`, `font.leading.ui`; `border.width.hair`, `border.width.strong`;
`space.2`, `space.3`.

## Accessibility

Named by its address. The arrow is generated with empty alternative text. Focus: the 2px ring. In
print it is not followed by its address again (05).

## Do / Don't

- Do use it only for a link whose text is its address.
- Don't shorten the path.
- Don't put words of your own in it.
