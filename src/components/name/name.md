---
name: Name
status: approved
class: mx-name
tokens: [color.accent, color.glow, color.rain.body, font.family.mono, font.weight.bold, font.weight.medium, font.size.prompt.min, font.size.prompt.max, motion.blink.duration, motion.blink.count, motion.double.duration, space.5, space.7]
---

# Name

## Purpose

The page's one `h1`, shared by both readings (L3): giant and cut out of the site's own commit log in
人間用 (L1), a terminal line with a cursor in 機械用.

## Contract

```html
<h1 class="mx-name" id="name" style="--mx-etch:url(&quot;data:image/svg+xml,…&quot;)">wadakatu</h1>
```

`--mx-etch` is `nameMask(lines)` from `@wadakatu/matrix/lib`: an SVG mask with lines of commit
subjects and post titles cut out of it.

## Variants and states

- 人間用, from 720px: `--mx-text-display` (as wide as the frame), bold, `accent`, masked; the rain
  shows through the cuts (display type, the one place L2 allows it).
- 人間用, below 720px: solid, unmasked.
- 機械用: `--mx-text-prompt`, medium, no mask, a block cursor that blinks five times and rests lit,
  and phosphor bloom (`color.glow`, transparent by day).
- `data-double`: set by `mx-readings` for one 200ms frame when 人間用 returns.

## Behaviour

No element. `mx-readings` sets and clears `data-double`. Without scripts each reading's static route
shows its own drawing.

## Tokens

`color.accent`, `color.glow`, `color.rain.body`; `font.family.mono`, `font.weight.bold`,
`font.weight.medium`, `font.size.prompt.min`, `.max` (through `--mx-text-prompt`);
`motion.blink.duration`, `motion.blink.count`, `motion.double.duration`; `space.5`, `space.7`.

## Accessibility

One `h1` in every reading: it sits outside both reading containers, so it is never hidden. The mask
is an image and does not change the text. Reduced motion: the cursor is lit and does not blink; no
doubling.

## Do / Don't

- Do use it once per page with two readings.
- Don't put the mask over Japanese body text; it is for the name only.
- Don't add a glow by day: the token is transparent there on purpose.
