---
name: Decode
status: approved
attributes: []
tokens: []
---

# Decode

## Purpose

Text that settles out of the corpus's own glyphs into its real words, for the effects that change
text in place (L1, L4).

## Contract

```ts
import { decode, textTween, pools, moving, held } from "./decode.ts";
decode(el, 450, { delay: 80, allWide: true }); // returns a TextTween: { anim, end() }
```

```html
<mx-root data-wide="…" data-narrow="…">…<span data-text="wadakatu_">wadakatu_</span>…</mx-root>
```

The final text is the element's `data-text`, or its text when it is called. The pools are
`data-wide` and `data-narrow` on `<mx-root>`, which Layout writes from the site's corpus.

## Variants and states

- `allWide`: every frame draws from the wide pool (the boot's values, the switch side just taken).
- `delay`: the tween waits before it starts (the headings of a change of reading, staggered).

## Behaviour

A module, not an element: Boot, Readings and Rewards call it. Each tween is a target-less Web
Animations `Animation` whose progress one shared frame loop reads, so delay, `finish()` and
`cancel()` are the platform's. `end()` cancels it and writes the final text at once. `moving()` is
false with `data-motion="off"` or reduced motion; `held()` is true while rain is held. Every caller
checks `moving()`, and Readings and Rewards `held()`, before they decode. Without scripts the text is
the final text from the start.

## Tokens

None. The callers pass the duration: 450ms in Readings, the value of `motion.decode.duration`; Boot's
and Rewards' are their own numbers.

## Accessibility

The final text is in the markup. A tween replaces the element's text frame by frame and leaves the
final text when it ends or is ended. A change of reading is announced by Status, not by the text
that decodes; the boot's lines and the rewards' layers are `aria-hidden`.

## Do / Don't

- Do give it the site's corpus; never a placeholder glyph set (L1).
- Don't start one when `moving()` is false.
