---
name: Status line
status: approved
class: mx-modeline
attributes: []
tokens: [color.accent, color.on-accent, font.size.meta, font.weight.medium, layer.status, space.1]
---

# Status line

## Purpose

tmux's status line for 機械用: the reading, where the shell is, the time in Japan, and the way back (L3).

## Contract

```html
<p class="mx-modeline">
  <span class="mx-modeline-mode">[<span lang="ja">機械用</span>]</span>
  <span class="mx-modeline-where">recorded session</span>
  <span class="mx-modeline-time"></span>
  <a class="mx-modeline-way" data-to="human" href="/human/"><span lang="ja">人間用</span></a>
</p>
```

## Variants and states

- Recorded: `recorded session`, no time; fixed to the bottom of the scrolling page.
- Live: `0:sh* ~` (process, working directory), the time as `HH:MM JST`; a row of the one viewport.
  The process becomes the takeover's name, or `rain` with how to stop it.
- Hidden while an on-screen keyboard is up. `accent` fill in all four contexts; it stays above the
  scan lines (`layer.status`).

## Behaviour

`mx-terminal` writes the process, the directory and the clock (every 20 seconds). The link is an
`a[data-to="human"]`: the in-place change with `mx-readings`, a plain link without it.

## Tokens

`color.accent`, `color.on-accent`; `font.size.meta`, `font.weight.medium`; `layer.status`; `space.1`.

## Accessibility

A paragraph; the arrow before the link is generated content with empty alternative text. Focus on the
filled face: the ring is drawn in `on-accent` (05, "Focus"). Forced colours: `Highlight` /
`HighlightText`.

## Do / Don't

- Do keep the way back on screen in 機械用.
- Don't put reading text in it.
- Don't let the scan lines cross it.
