# S2 — Tokens compile to the shape in 03

Result: **pass.** Terrazzo stays the compiler; no fallback taken. 02 is unchanged.

- Date: 2026-11-15. Scratch directory outside the repository; nothing of it is committed.
- Versions: Node 24.21.0, `@terrazzo/cli` 2.10.0, `@terrazzo/plugin-css` 2.10.0,
  `@playwright/test` 1.65.1 (Chromium 159.0.8154.6, Firefox 159.0, WebKit 27.2).

## The set

`base.tokens.json` with one font family (`font.family.mono`), one dimension
(`space.4`, `{ "value": 16, "unit": "px" }`) and one duration (`motion.wipe.duration`,
240ms); four context files with `color.ground`, `color.accent`, two colours with alpha
(`color.glow` α 0.45 / 0, `color.scanline` α 0.28) and one alias (`color.on-accent` →
`{color.ground}`); the resolver from 02 verbatim (one `context` modifier, four contexts,
default `phosphor-night`). Values are the ones in 02.

## Pass points

| Point | Observed |
| --- | --- |
| `tz check` accepts it | `✔  No errors 6ms`, exit 0 |
| Output CSS has the three-block shape of 03, with the `@supports` split | `tokens.css` written by the local plugin: scales on `:root`; night values on `:root, [data-palette="phosphor"]` and `[data-palette="operator"]`; `:root, [data-theme="night"] { color-scheme: dark; }`; then `@supports (color: light-dark(#000, #fff))` with `light-dark(<day>, <night>)` per colour on the same two selectors and `[data-theme="day"] { color-scheme: light; }`; all inside `@layer mx.tokens` |
| `tokens.json` has one flat map per context | `{ "phosphor-night": { "color.accent": "#2bf07a", … }, "phosphor-day": … }`, four keys |
| A nested `data-theme="day"` scope inside a night root resolves day colours | Playwright, computed `background-color` / `color` of seven nested scopes (phosphor-day in a night root, its child, operator-night inside day, operator-day inside that, phosphor-night inside operator-night): every one matched its context's values in Chromium, Firefox and WebKit (`3 passed (3.6s)`) |

## Recorded

- **`@terrazzo/plugin-css` cannot produce the shape by configuration alone.** It writes one
  block per entry in `permutations`, each wrapped by that entry's `prepare()`. A
  permutation's `transform()` receives only its own permutation's token set
  (`transform.js`: `resolver.apply(input, p.only)`, passed as `options.tokensSet`), so no
  configuration can put a day and a night value into one `light-dark()`. The build
  therefore uses the small local plugin 02 anticipates: a `build()` hook that calls
  `resolver.apply({ context })` for the four contexts and formats values with
  `transformCSSValue` from `@terrazzo/token-tools/css`. It was about 40 lines in the spike.
- **`a11y/min-contrast` evaluates the default context only.** With a pair
  (`color.accent` on `color.ground`, level AAA) the rule failed when the phosphor-night
  accent was made dark (`Pair 1 failed; expected 7, got 1.01 (AAA)`), and reported
  `✔ No errors` when the same change was made to operator-night only, and with the real
  day values, which are under 7:1 by table M2. This confirms 02's choice: the contrast gate is a
  matrix script over `tokens.json`, per context.
- `tz check` validates against the `components`, not the `hex` hint: a context file whose
  `components` were changed and `hex` left alone passed validation. The token-validity gate
  should check that the two agree.
- Stock output re-declares an alias as `var(--…)` in every scope; the local plugin does the
  same, which is what lets `on-accent` follow a nested scope.
- An engine without `light-dark()` was not run; block 1 is what it gets, by construction.
- "Safari" here is Playwright's WebKit 27.2 on macOS, not Safari.app.
