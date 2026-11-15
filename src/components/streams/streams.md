---
name: Streams
status: approved
class: mx-streams
tokens: [color.rule, color.accent, border.width.hair, font.size.entry.min, font.size.entry.max, font.size.body, font.leading.tight, space.3, space.4, space.5, space.6]
---

# Streams

## Purpose

The list of Streams: a wall on Home, rows on Projects (L1).

## Contract

```html
<ul class="mx-streams">
  <li class="mx-stream">…</li>
</ul>
<ul class="mx-streams" data-variant="rows">…</ul>
```

## Variants and states

- Default (the wall): stacked below 1360px; from 1360px seven columns, each stream falling into its
  entry from above; the entry's top rule lights `accent` on hover and focus.
- `data-variant="rows"`: always stacked; names at `--mx-text-entry` in `accent`; four strands and
  more room from 720px.

## Behaviour

CSS only.

## Tokens

`color.rule`, `color.accent`; `border.width.hair`; `font.size.entry.min`, `.max` (through
`--mx-text-entry`), `font.size.body`, `font.leading.tight`; `space.3`, `space.4`, `space.5`, `space.6`.

## Accessibility

A list. Keyboard order is the reading order of the entries, in both arrangements.

## Do / Don't

- Do use the wall for a mix of projects and posts, rows for one kind.
- Don't set a column count of your own.
