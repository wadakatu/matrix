# Changelog

matrix's releases, written by hand (01, "Distribution and versioning"). TOMBO's releases,
`v0.1.0` to `v0.14.1`, are recorded on the `tombo` branch.

## 1.0.0-alpha.0

Unreleased. The foundation: an empty but real package.

- Tokens for the four contexts in DTCG 2025.10, compiled by Terrazzo to `tokens.css`,
  `tokens.json` and `tokens.d.ts`.
- Reset, base typography, the focus ring, `.mx-frame`, `.mx-vh`, `.mx-skip`.
- Self-hosted fonts: IBM Plex Mono, M PLUS 1 Code and DotGothic16 from Fontsource.
- Storybook 10 on the Astro framework: toolbar globals for palette, theme, motion, language
  and reading; Welcome and Foundations pages; accessibility at `error`; `npm run test:stories`.
- Visual regression in the pinned Playwright image (`npm run test:visual`), with committed baselines.
- `Head` and its pre-paint script, `Layout`, and `<mx-root>` for theme, palette, motion and
  flag-carrying links.
- Chrome: Header, Mark, Logo, Nav, Menu (`<mx-menu>`), Control (Hold rain, Operator colours,
  Daylight), Footer, Language link (draft).
- Surfaces: Panel, Lede, Figures, Inline list, Log, Meta, Status, Moved.
- Chrome strings in English and Japanese (`@wadakatu/matrix/strings`).
- `npm run check`: token validity, contrast, golden values, no raw values, unknown tokens,
  freshness, the Baseline ledger, package contents and version consistency.
