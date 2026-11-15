---
name: Boot
status: approved
class: mx-boot
element: mx-boot
tokens: [color.ground, color.text-muted, color.accent, color.text-lead, font.family.dot, font.size.ui, font.leading.terminal, layer.boot, motion.boot.failsafe, space.3, space.4, space.10]
---

# Boot

## Purpose

The intro on the first visit to Home in a tab: the data file's keys, their real values decoding out
of corpus glyphs, then the logo, then the curtain (L1, L4, L5).

## Contract

```html
<mx-boot class="mx-boot">
  <div class="mx-boot-lines" aria-hidden="true">
    <p class="mx-boot-line"><span class="mx-boot-key">name</span><span class="mx-boot-value" data-text="wadakatu_">wadakatu_</span></p>
    <p class="mx-boot-line mx-boot-logo"><span class="mx-boot-key">logo</span><img class="mx-logo" src="…" alt=""></p>
  </div>
  <p class="mx-boot-exit">
    <button class="mx-control mx-boot-skip" type="button">Skip intro <kbd>Esc</kbd></button>
    <mx-switch class="mx-switch" role="group" aria-label="Reading">…</mx-switch>
    <span class="mx-boot-note">This site opens as a terminal. <span lang="ja">人間用</span> is the same site as an ordinary page.</span>
  </p>
</mx-boot>
```

First in `<mx-root>` (the Layout's `boot` slot), so Skip is the first tab stop while it is up. The
page passes `boot` to `Head` (or `Layout`), which puts the decision in the head script.

## Variants and states

- `data-boot="play"` on the root: shown; the rest of the page is hidden behind it.
- `data-boot="frozen"` (`?boot=frozen`): the still. Every line settled, the logo whole; no motion, no
  timeout, no script needed.
- No attribute: not shown. Never without scripts, never with reduced motion or `?motion=0`, never
  with `?run=`, and once per tab (`sessionStorage['mx-boot']`); `?boot=1` replays it.

## Behaviour

The head script decides it and ends it on Skip, Escape, a click or tap anywhere on it (either side of
its switch included) and `motion.boot.failsafe`, so it ends with every other script blocked. Ending
it removes `data-boot`, emits `mx:bootend` and moves focus to `main`. `mx-boot` adds the motion:
values decode (`decode`), the logo is wiped in from the top in ten steps, the curtain falls, the boot
ends behind it, the curtain lifts. An early end drops the rest; reduced motion switched on ends it.
機械用 on its switch goes straight to the shell; 人間用 is Skip.

## Tokens

`color.ground`, `color.text-muted`, `color.accent`, `color.text-lead`; `font.family.dot`,
`font.size.ui`, `font.leading.terminal`; `layer.boot`; `motion.boot.failsafe`; `space.3`, `space.4`,
`space.10`. The line size `--mx-text-boot` is the effect's own fluid formula.

## Accessibility

The lines are `aria-hidden` (they repeat facts on the page). Skip is focused when it starts, so
Enter, Space and Escape all end it; the note says what comes next and that 人間用 exists. Flashing:
one direction per transition; checked frame by frame (05).

## Do / Don't

- Do keep it to Home, once per tab.
- Don't let anything but the head script decide it.
- Don't scramble the logo: it is wiped in whole.
