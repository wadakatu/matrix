---
name: Lede
status: approved
class: mx-lede
attributes: []
tokens: [color.text-muted, size.measure.lede]
---

# Lede

## Purpose

The muted sentence under a heading that says what follows, dimmed by colour (L2).

## Contract

```html
<p class="mx-lede">…</p>
```

## Variants and states

One: `text-muted`, at most `size.measure.lede` (68ch) wide.

## Behaviour

No element.

## Tokens

`color.text-muted`, `size.measure.lede`.

## Accessibility

A paragraph. It clears 4.5:1 in every context (02).

## Do / Don't

- Do use it for one or two sentences under a panel's heading.
- Don't dim text with `opacity` instead (L2).
