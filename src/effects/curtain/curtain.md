---
name: Curtain
status: approved
class: mx-curtain
attributes: [data-on]
tokens: [color.ground, color.rain.body, color.rain.head, font.family.dot, font.size.rain, font.leading.tight, layer.curtain]
---

# Curtain

## Purpose

Slabs of the site's running text that cover the page as the boot ends (L1).

## Contract

```html
<div class="mx-curtain" aria-hidden="true">
  <span class="mx-curtain-slab" lang="ja">…</span>
</div>
```

24 slabs of 260 glyphs from `curtainSlabs(phrases)`. Last in `<mx-root>` (the Layout's `curtain` slot).

## Variants and states

- Hidden; `data-on` while `mx-boot` runs its last step. Never shown in a still, without scripts, or
  with reduced motion.

## Behaviour

`mx-boot` drops the slabs in a fixed scatter, ends the boot behind them, and lifts them. Under 1s.

## Tokens

`color.ground`, `color.rain.body`, `color.rain.head`; `font.family.dot`, `font.size.rain`,
`font.leading.tight`; `layer.curtain`.

## Accessibility

`aria-hidden`, no pointer events. One fall and one lift, never an alternation (05, "Flashing").

## Do / Don't

- Do feed it the same corpus as the rain.
- Don't use it as a general transition.
