---
name: Logo
status: approved
class: mx-logo
tokens: [size.logo.header, size.logo.header-compact]
---

# Logo

## Purpose

The mark by Chisato Satoh, shown whole wherever it appears (L5). The file is not MIT and is
not in the package: the site serves it and passes its address.

## Contract

```html
<img class="mx-logo" src="/images/logo-400.png" width="400" height="400" alt="">
```

`alt` is empty where a name sits beside it (the Mark); elsewhere it names the mark.

## Variants and states

Sizes are set by the component that holds it: 44px in the header, 32px in the compact header
(`size.logo.header`, `size.logo.header-compact`). In operator-night only, a filter tints it
(`--mx-logo-filter`: `hue-rotate(-80deg) saturate(1.15)`), which moves no pixel; in the other
three contexts it is the file as designed. The tint follows the nearest theme scope, so a day
or phosphor scope inside an operator-night page shows it untinted.

## Behaviour

No element.

## Tokens

None directly; its holders read `size.logo.*`. The filter is the derived property
`--mx-logo-filter` (02, "Derived properties").

## Accessibility

An image; decorative (`alt=""`) when the link beside it is named. In forced colours it is
shown as it is.

## Do / Don't

- Do use the designer's file and give it its intrinsic `width` and `height`.
- Don't crop, round, rotate, mask, transform or redraw it (L5), or set it in glyphs.
- Don't recolour it except by the operator-night filter.
