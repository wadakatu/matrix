---
name: Swatches
status: approved
class: mx-swatch
attributes: [data-swatch]
tokens: [color.panel, color.rule, color.rain.tail, color.rain.body, color.text-muted, color.text, color.text-lead, color.accent]
---

# Swatches

## Purpose

The eight theme colours of the context, as neofetch shows a terminal's colours (L7).

## Contract

```html
<span class="mx-swatches" aria-hidden="true">
  <span class="mx-swatch" data-swatch="panel"></span>
  <span class="mx-swatch" data-swatch="accent"></span>
</span>
```

All eight, in this order: `panel`, `rule`, `rain-tail`, `rain-body`, `muted`, `text`, `lead`, `accent`.

## Variants and states

One cell per role, 3ch by 1.2em, in all four contexts; each cell reads its role, so it follows the context.

## Behaviour

Printed by `render` from the segment `{ swatches: true }`. No behaviour.

## Tokens

`color.panel`, `color.rule`, `color.rain.tail`, `color.rain.body`, `color.text-muted`, `color.text`,
`color.text-lead`, `color.accent`.

## Accessibility

Decoration: `aria-hidden`. Forced colours keep the fills, since they are the content.

## Do / Don't

- Do keep the order.
- Don't use a swatch as a control.
- Don't name a hue.
