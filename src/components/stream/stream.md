---
name: Stream
status: approved
class: mx-stream
attributes: []
tokens: [color.rule, color.text-lead, color.accent, color.focus, font.family.mono, font.family.ja, font.size.body, font.size.ui, font.weight.medium, font.size.rain, border.width.hair, border.width.strong, space.2, space.3, space.4]
---

# Stream

## Purpose

One entry of the wall: strands of its own words fall beside (or above) its readable text, and settle
into it (L1, L2).

## Contract

```html
<li class="mx-stream" data-commit="feat: …">
  <div class="mx-stream-fall" aria-hidden="true">
    <span class="mx-strand" style="--j:0"><span class="mx-drop" style="--t:7.3s;--d:-2.1s;--rest:20%">fixture-on</span></span>
  </div>
  <div class="mx-stream-entry">
    <h3 class="mx-stream-name" data-echo="fixture-one"><a href="…">fixture-one</a></h3>
    <p class="mx-meta">TypeScript</p>
    <p class="mx-blurb">A fixture tool…</p>
  </div>
</li>
```

Strands come from `streamStrands(texts, index)`: two short drops of each text, half a cycle apart, one
speed per strand between `motion.strand.duration.min` and `.max`. `data-commit` is a commit that
shipped the entry, for the title-to-commit reward (Rewards).

## Variants and states

- Beside its entry (default); above it in the wall from 1360px (Streams). Three strands, four in
  rows from 720px and in the wall.
- Hover or focus inside: the strands pause and come up to `accent`; the name is underlined.
- Held: paused. Still: one parked drop per strand.
- `level`: `h3` on Home, `h2` on Projects.

## Behaviour

CSS only. The rewards (déjà vu, title to commit) attach to it without markup of their own.

## Tokens

`color.rule`, `color.text-lead`, `color.accent`, `color.focus`;
`font.family.mono`, `font.family.ja`, `font.size.body`, `font.size.ui`, `font.weight.medium`,
`font.size.rain`; `border.width.hair`, `border.width.strong`; `space.2`, `space.3`, `space.4`. On hover
or focus it sets `--mx-color-rain-body` and `--mx-color-rain-tail` to the accent for Rain's drop
style to read. The strands' falls are `streamStrands` in `lib`, whose 5s and 11s defaults are the
values of `motion.strand.duration.min` and `.max`; no file reads the tokens.

## Accessibility

The strands are `aria-hidden`; the entry is real text and a link. When the link has focus the whole
stream is outlined instead of the link (05, "Focus"). Keyboard: Tab to the name's link, then to any
link in the entry.

## Do / Don't

- Do give the strands the entry's own texts (name, line, host, language or date).
- Don't make the whole entry one link.
- Don't put a strand over the entry's text.
