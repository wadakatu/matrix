---
name: Rain
status: approved
class: mx-rain
tokens: [color.rain.tail, color.rain.body, color.rain.head, color.ground, font.family.dot, font.size.rain, layer.rain, motion.rain.duration.min, motion.rain.duration.max]
---

# Rain

## Purpose

The ambient rain behind 人間用: columns of drops, each drop a piece of one of the site's own phrases
(L1). It shows only in the gaps, the margins and behind the giant name (L2).

## Contract

```html
<div class="mx-rain" aria-hidden="true">
  <span class="mx-rain-col" style="--x:1.25%">
    <span class="mx-drop" lang="ja" style="--t:14.2s;--d:-3.1s;--rest:31%">見本の局を追加</span>
  </span>
</div>
```

Generated at build time by `rainColumns(phrases)` from `@wadakatu/matrix/lib`: 40 columns × 3 drops,
up to 20 glyphs a drop, Japanese and Latin phrases alternating, one speed per column between
`motion.rain.duration.min` and `.max`, seeded so every build is identical. `--rest` is the drop's
place in the still.

## Variants and states

- Default: fixed to the window, behind everything (`layer.rain`). Every second column is hidden
  below 1100px, three of four below 720px.
- `data-variant="band"` (blog): one viewport tall, not fixed, fading out from half way, so it
  scrolls away when reading starts.
- Held (`:has()` on the Hold rain checkbox, or `data-rain="held"`): every drop paused.
- Still (`data-motion="off"` or reduced motion): drops parked at `--rest` down the whole document;
  the layer scrolls with the page; the Hold control is hidden.
- 機械用: not drawn.
- Each drop is a gradient clipped to its text (`rain.tail` → `rain.body` → `rain.head`), the same
  roles in all four contexts.

## Behaviour

CSS only: one transform animation per drop (`mx-drop-vh`), with plain units in the keyframes so a
palette or theme change while held never re-resolves the paused drops (the prototype's freeze).
Works without scripts, held included.

## Tokens

`color.rain.tail`, `color.rain.body`, `color.rain.head`, `color.ground` (the band's mask);
`font.family.dot`, `font.size.rain`; `layer.rain`; `motion.rain.duration.min`, `.max`.

## Accessibility

`aria-hidden`: the same facts are readable on the page. Hold rain (05, "One switch for all endless
motion") stops it in both readings; reduced motion parks it. Not drawn in forced colours. No more
than 170 animating elements on a page, rain included (05, "Performance").

## Do / Don't

- Do feed it the site's own phrases; the film-name filter runs inside the helper.
- Don't put reading text over it: reading text sits on a Panel.
- Don't animate drops with custom properties in keyframes.
