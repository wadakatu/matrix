---
name: Meta
status: approved
class: mx-meta
tokens: [color.text-muted, font.size.meta, space.1]
---

# Meta

## Purpose

The small line of facts under an entry: its language, its date, its category.

## Contract

```html
<p class="mx-meta"><time datetime="2026-11-15">2026-11-15</time> Fixture</p>
```

## Variants and states

One: `meta` size, `text-muted`, tabular numerals.

## Behaviour

No element.

## Tokens

`color.text-muted`, `font.size.meta`, `space.1`.

## Accessibility

A paragraph; dates are `<time>`. `text-muted` at 13px measures 9.59:1 (Lc −61.1) in
phosphor-night, the value lifted by decision Q9.

## Do / Don't

- Do keep it to one line of facts.
- Don't make it smaller than `meta`.
