---
name: Guide
status: approved
class: mx-guide
attributes: []
tokens: [color.text-muted, color.text, color.text-lead, color.accent, color.on-accent, color.rule, font.size.meta, size.target, border.width.hair, space.0-5, space.1-5, space.2, space.3]
---

# Guide

## Purpose

The first row of 機械用: what this is, in plain words, and the way to 人間用 for a reader who did not
ask for a shell (L3).

## Contract

```html
<p class="mx-guide">
  <span class="mx-guide-say">This site opens as a terminal.<span class="mx-guide-live"> Type <kbd>help</kbd>, or tap a command below.</span></span>
  <a class="mx-control mx-guide-way" data-to="human" href="/human/">Read it as an ordinary page: <span lang="ja">人間用</span></a>
  <button class="mx-control mx-guide-hide" type="button" aria-label="Hide this note">×</button>
</p>
```

## Variants and states

- Live: the sentence, the hint to type, the link and the ×. Recorded (no scripts): the sentence and the
  link only.
- Below 720px the sentence is for assistive technology only; the row is one 44px link and a 44px ×.
- Hidden: after ×, for the rest of the tab; while an on-screen keyboard is up.
- The link has an `accent` border and fills on hover. All four contexts read roles only.

## Behaviour

The link is an `a[data-to="human"]`, so `mx-readings` makes it the in-place change; without scripts it
is a plain link to the static twin. The × (`mx-terminal`) hides the row, remembers that in
`sessionStorage['mx-guide']` and puts focus in the field. It belongs to the page, not the session:
`clear` leaves it and it does not scroll.

## Tokens

`color.text-muted`, `color.text`, `color.text-lead`, `color.accent`, `color.on-accent`, `color.rule`;
`font.size.meta`; `size.target`; `border.width.hair`; `space.0-5`, `space.1-5`, `space.2`, `space.3`.

## Accessibility

A paragraph with a link named by its text and a button named `Hide this note`. Keyboard: Tab to the
link, then the ×. Focus: the 2px ring. The × is identified by its glyph and name, not by its border
(`rule`, decoration).

## Do / Don't

- Do keep the way to 人間用 in the first row.
- Don't hide the row by itself when a command runs.
- Don't put the sentence anywhere it scrolls away.
