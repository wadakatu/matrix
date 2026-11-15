---
name: Log
status: approved
class: mx-log
tokens: [color.rule, font.size.meta, space.1, space.4, border.width.hair]
---

# Log

## Purpose

A list of the repository's real commit subjects, the material the rain is made of (L1).

## Contract

```html
<ol class="mx-log"><li>feat: …</li><li>fix: …</li></ol>
```

## Variants and states

One: `meta` size, at most 96ch wide, a dotted `rule` under each line; long subjects break anywhere.

## Behaviour

No element.

## Tokens

`color.rule`, `font.size.meta`, `space.1`, `space.4`, `border.width.hair`.

## Accessibility

An ordered list, newest first.

## Do / Don't

- Do feed it the site's commit subjects, filtered as the corpus is.
- Don't put merge commits or the film's name in it (L1).
