---
name: Foundations
status: approved
attributes: [data-reading]
tokens: [color.ground, color.text, color.text-lead, color.accent, color.on-accent, color.focus, font.family.mono, font.family.ja, font.size.body, font.size.entry.min, font.size.entry.max, font.size.prompt.min, font.size.prompt.max, font.size.title.min, font.size.title.max, font.weight.regular, font.leading.ui, border.width.hair, border.width.strong, radius.control, size.frame, size.measure.read, size.measure.read-compact, layer.skip, space.1, space.1-5, space.2, space.3, space.4]
---

# Foundations

## Purpose

What every page has before any component: the layer order, the reset, base type, links, the focus
ring, the derived properties, and the three utilities `.mx-frame`, `.mx-vh` and `.mx-skip` (L2, L6).

## Contract

```css
@layer mx.reset, mx.tokens, mx.base, mx.components, mx.effects, mx.utilities;
```

```html
<a class="mx-skip" href="#main">Skip to content</a>
<main id="main" class="mx-frame" tabindex="-1">…</main>
<span class="mx-vh">Read by assistive technology only</span>
```

`@wadakatu/matrix/css` is `index.css` (the layer statement), the tokens, `reset.css`, `base.css`,
every component and effect, then `utilities.css`.

## Variants and states

- Reset (`mx.reset`): `border-box`, no body margin, no margins on headings, paragraphs and lists, no
  list markers.
- Base (`mx.base`): `ground` on the page; body text `text` in `font.family.mono`, `body` size,
  `leading.ui`; `:lang(ja)` in `font.family.ja` with strict line breaking, and Japanese headings
  broken by phrase. Links inherit their colour with a `hair` underline at a `space.1` offset; hover is
  `text-lead` with a `strong` underline. `kbd` is boxed; `::selection` is `accent` with `on-accent`.
- Derived properties (02): `--mx-pad`, `--mx-text-display`, `--mx-text-entry`, `--mx-text-prompt`,
  `--mx-text-title`, `--mx-measure` (`size.measure.read-compact`, `read` from 720px) and `--mx-inset`.
- Focus ring: `:focus-visible` is a `border.width.strong` outline in `color.focus`, 3px out. `main`
  shows none when the skip link moves focus there.
- `.mx-frame`: at most `size.frame` wide, centred, `--mx-pad` at the sides; unbounded in 機械用
  (`:root[data-reading="machine"]`).
- `.mx-skip`: above the top edge until focused, then `space.3` from the top, `accent` with
  `on-accent`, on `layer.skip`.
- Print: day colours, no painted ground or panel, and no skip link or status region (05, "Print").

## Behaviour

CSS only.

## Tokens

`color.ground`, `color.text`, `color.text-lead`, `color.accent`, `color.on-accent`, `color.focus`;
`font.family.mono`, `font.family.ja`, `font.size.body`, `font.weight.regular`, `font.leading.ui`, and
the `.min` and `.max` of `font.size.entry`, `font.size.prompt` and `font.size.title` (the derived
sizes); `border.width.hair`, `border.width.strong`; `radius.control`; `size.frame`,
`size.measure.read`, `size.measure.read-compact`; `layer.skip`; `space.1`, `space.1-5`, `space.2`,
`space.3`, `space.4`.

## Accessibility

The skip link is the first tab stop and moves focus to `main`. The ring clears 3:1 on `ground` and
`panel` in every context. `.mx-vh` hides text from sight, not from assistive technology. Text is
dimmed with colour, never `opacity` (L2).

## Do / Don't

- Do load `index.css` first, so the layer order holds.
- Do read the derived properties rather than repeat their formulas.
- Don't remove the focus ring.
