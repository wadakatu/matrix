---
name: Figures
status: approved
class: mx-figures
tokens: [color.text-muted, color.rule, space.1, space.4, border.width.hair]
---

# Figures

## Purpose

Keys and values from the site's data: every number shown is real (L1).

## Contract

```html
<dl class="mx-figures">
  <div><dt>Original repos</dt><dd>12</dd></div>
  <div><dt>Checked by hand</dt><dd><time datetime="2026-11-15">2026-11-15</time></dd></div>
</dl>
```

## Variants and states

One. Keys are `text-muted`; values are `text` in tabular numerals; a dotted `rule` under each row.

## Behaviour

No element.

## Tokens

`color.text-muted`, `color.rule`, `space.1`, `space.4`, `border.width.hair`.

## Accessibility

A description list; a date is a `<time>` with `datetime`.

## Do / Don't

- Do give every value from data.
- Don't invent a metric to fill a row (L1).
