---
name: Rewards
status: approved
class: mx-ghost
tokens: [color.panel, color.accent, color.rain.body, motion.echo.duration, motion.double.duration, motion.decode.duration, space.1]
---

# Rewards

## Purpose

Three small one-shot effects made of the site's own material (L1): déjà vu, a title turning into the
commit that shipped it, and the Name doubling. Decode is the text effect they and the change share.

## Contract

```html
<li class="mx-stream" data-commit="feat(fixture-one): …" data-reward="flick">
  …<h3 class="mx-stream-name" data-echo="fixture-one"><a href="…">fixture-one</a>
     <span class="mx-ghost" aria-hidden="true"><span lang="en">feat(fixture-one): …</span></span></h3>…
</li>
```

`data-echo`, `data-commit` are in the Stream's markup; `data-reward` and `.mx-ghost` are added and
removed by the script.

## Variants and states

- Déjà vu (`data-reward="deja"`): the second time a reader points at or focuses an entry, its name
  repeats once over itself, `motion.echo.duration`.
- Title to commit (`data-reward="flick"`): once, about two seconds after an entry with a commit is
  first fully on screen, its title decodes into the commit and back.
- The name doubles (`data-double` on the Name, `motion.double.duration`) on the way back to 人間用.
- Decode: text settles out of the corpus's glyph pools (`decodeFrame` in `lib`; `<mx-root
  data-wide data-narrow>` from the Layout's `corpus`), `motion.decode.duration` for headings and the
  switch side just taken.

## Behaviour

`effects/rewards/rewards.ts` (loaded with the elements) delegates from the document. Every reward is
off with reduced motion and while rain is held; turning either on mid-reward, changing reading, or
leaving the page removes what it added.

## Tokens

`color.panel`, `color.accent`, `color.rain.body`; `motion.echo.duration`, `motion.double.duration`,
`motion.decode.duration`; `space.1`.

## Accessibility

Every overlay is `aria-hidden` or generated content with empty alternative text; the link keeps its
name. Glyph shapes change at constant ink colour, never a luminance pulse (05, "Flashing").

## Do / Don't

- Do pair a title with a commit only when the commit is really in the log.
- Don't add a reward that repeats.
