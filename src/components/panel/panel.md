---
name: Panel
status: approved
class: mx-panel
attributes: []
tokens: [color.panel, color.rule, color.accent, font.size.body, font.weight.medium, font.leading.ui, space.2, space.5, space.6, space.7, border.width.hair]
---

# Panel

## Purpose

The solid surface reading text sits on, so that no paragraph is ever read over rain (L2).

## Contract

```html
<section class="mx-panel" aria-labelledby="activity">
  <h2 id="activity">Activity</h2>
  <p>…</p>
</section>
```

`aria-labelledby` and the heading's `id` are set only when `id` is given; a panel without a
heading is named with `label` (`aria-label`).

## Variants and states

None. In every context the face is `panel` with a 1px `rule` border; the heading is `accent`.

## Behaviour

No element. It is markup and CSS, and works without JavaScript.

## Tokens

`color.panel`, `color.rule`, `color.accent`; `font.size.body`, `font.weight.medium`,
`font.leading.ui` for the heading; `space.2`, `space.5`, `space.6`, `space.7`;
`border.width.hair`. The inline padding is the prototype's fluid `clamp(16px, 2.2vw, 28px)`.

## Accessibility

A `section`; a named region when it has an `id`. Its `h2` is the next level under the page's
`h1`. Nothing in it is focusable by itself.

## Do / Don't

- Do put every paragraph that is meant to be read on a panel or on `ground`.
- Don't make a panel transparent or translucent over rain (L2).
- Don't nest panels.
