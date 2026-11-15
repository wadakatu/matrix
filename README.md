# matrix

wadakatu's personal design system, and the source of truth for how
[wadakatu.dev](https://www.wadakatu.dev/) looks, moves and reads: an operator's station at
night. Phosphor green on near-black, monospace type, text that falls as rain, and a terminal
that is the front door.

**Status: `1.0.0-alpha.0`, the foundation.** Tokens, the base stylesheet, self-hosted fonts
and the gates exist. Components, the Storybook and releases follow the plan in
[`docs/matrix-design/09-implementation-plan.md`](docs/matrix-design/09-implementation-plan.md).

## What it is

One package, `@wadakatu/matrix`, in four layers:

1. **Tokens.** DTCG 2025.10 JSON in `tokens/`, compiled by Terrazzo to `tokens.css`,
   `tokens.json` and `tokens.d.ts`. Colour roles in four contexts
   (`phosphor-night`, `phosphor-day`, `operator-night`, `operator-day`); every value is listed
   in [`docs/tokens.md`](docs/tokens.md).
2. **CSS.** Plain CSS in cascade layers (`mx.reset` … `mx.utilities`). The theme is chosen by
   `color-scheme` and `light-dark()`, the palette by `data-palette`.
3. **Custom elements** (`mx-*`), light DOM, for behaviour. Not yet built.
4. **Astro components**, the reference renderer. Not yet built.

The design, its seven laws and its decisions are in [`docs/matrix-design/`](docs/matrix-design/README.md).

## Using it

matrix is not published to npm. Releases are GitHub Release tarballs, installed by URL
(01, "Distribution and versioning"); there is no release yet.

```css
@import "@wadakatu/matrix/fonts.css";
@import "@wadakatu/matrix/css";
```

```html
<html lang="en" data-theme="night">
```

## Developing

```sh
npm ci
npm run build
npm run check
npm run test:specimens   # after `npx playwright install chromium`
```

See [`AGENTS.md`](AGENTS.md) for the rules every change follows.

## Licence

The code is MIT ([`LICENSE`](LICENSE)). **The logo is not**: it is wadakatu's mark by
Chisato Satoh, used with permission, kept in [`assets/logo/`](assets/logo/NOTICE.md), not
part of the package, and not for reuse.

## TOMBO

This repository was TOMBO until `v0.14.1`. TOMBO is frozen on the `tombo` branch and its
tags; what it wrote about itself is in [`docs/history/tombo/`](docs/history/tombo/README.md).
