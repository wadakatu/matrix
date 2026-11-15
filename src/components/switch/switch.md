---
name: Switch
status: approved
class: mx-switch
element: mx-switch
tokens: [color.ground, color.panel, color.text, color.text-muted, color.text-lead, color.accent, color.on-accent, color.rain.head, color.control-border, color.reading.human, color.reading.machine, font.family.dot, font.family.mono, font.size.rain, font.size.meta, font.size.label, font.leading.ui, radius.control, radius.capsule, border.width.hair, size.target, motion.drip.duration, motion.wipe.duration, motion.wipe.steps, space.3, space.5]
---

# Switch

## Purpose

The choice between the two readings (L3): two real links to the two static routes, so it works
without scripts. `mx-readings` makes the change happen in place.

## Contract

```html
<mx-switch class="mx-switch" role="group" aria-label="Reading">
  <a class="mx-switch-side" data-to="human" href="/human/" aria-current="true">
    <span class="mx-switch-label" lang="ja">人間用</span>
  </a>
  <a class="mx-switch-side" data-to="machine" href="/">
    <span class="mx-switch-label" lang="ja">機械用</span>
  </a>
</mx-switch>
```

The capsule adds `data-variant="capsule"` and a `<small>` note after each label.

## Variants and states

- `rain` (default; the header and the boot layer): each name a strand, upright vertical text in
  `font.family.dot`. The current side is filled `accent` with `on-accent`, wiped in from the top
  (`motion.wipe.*`). A drop falls through the idle side every `motion.drip.duration`; hover stops it.
- `rain` at most 600px wide, in the header: one 44×44 button showing the current reading; a hole
  travels down it and shows the other name.
- `capsule` ("Two readings" on 人間用 Home): a large capsule, a note under each name, and a dot in
  `color.reading.*` beside each.
- On the boot layer neither side is current, and both drip half a cycle apart.
- Still: no drop, no wipe; the idle label is plain `text-muted`; the compact button shows `▾`.
- `brace` and `bits` are not drawings of matrix (decision Q5), and there is no `?switch=` flag.

## Behaviour

`mx-switch` keeps the compact button one tab stop: the current side is `aria-hidden` and out of the
tab order, the other is named by its destination (`人間用から機械用へ`), and focus follows when the
pressed face hides. Without scripts the two links are both in the tab order and both work.

## Tokens

`color.ground`, `color.panel`, `color.text`, `color.text-muted`, `color.text-lead`, `color.accent`,
`color.on-accent`, `color.rain.head`, `color.control-border`, `color.reading.human`,
`color.reading.machine`; `font.family.dot`, `font.family.mono`, `font.size.rain`, `font.size.meta`,
`font.size.label`, `font.leading.ui`; `radius.control`, `radius.capsule`; `border.width.hair`;
`size.target`; `motion.drip.duration`, `motion.wipe.duration`, `motion.wipe.steps`; `space.3`, `space.5`.

## Accessibility

A group named "Reading" (表示 in Japanese) of two links named 人間用 and 機械用, `lang="ja"` (names,
never glossed). `aria-current="true"` marks the side shown; colour is never the only signal. Focus:
the 2px ring with a 2px `ground` gap inside it, so it shows on the filled face (C40). Keyboard: Tab
to each side, Enter changes reading; `\` / `¥` when the shortcut is on (`aria-keyshortcuts`).
Forced colours: the current side is `Highlight` / `HighlightText`, the idle label gets its colour back.
Hold rain stops the drop in both readings (05).

## Do / Don't

- Do link each side to its static twin.
- Don't add a third drawing or a flag to choose one.
- Don't use the dots without the names beside them.
