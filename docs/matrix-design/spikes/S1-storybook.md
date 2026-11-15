# Spike S1 — Storybook renders Astro components, in a static build

- **Date:** 2026-11-15. Throwaway branch `spike/s1` (local only, commit `0c28380`), project in `spike/`.
- **Verdict: pass.** All seven points in 06 were observed. No fallback is taken.

## Versions (from `npm ls --depth=0` in the spike)

| Package | Version |
| --- | --- |
| `storybook` (Q10: npm `latest` on the day, `npm view storybook dist-tags` → `latest: 10.6.7`, `next: 11.0.0-beta.3`) | **10.6.7** |
| `@storybook-astro/framework` | 1.16.0 |
| `@storybook/builder-vite`, `addon-docs`, `addon-a11y`, `addon-vitest` | 10.6.7 |
| `astro` | 7.4.12 |
| `vite` | 8.3.8 |
| `vitest`, `@vitest/browser-playwright` | 5.1.0 |
| `playwright`, `@playwright/test` | 1.65.1 |
| `typescript` | 6.0.3 (the framework's peer range is `^5 \|\| ^6`; 7.0.2 is `latest`) |
| Node | 24.21.0 (pinned in the spike's `mise.toml`) |

The project: `Box.astro` (props `title`, `n`; a default slot), a light-DOM `<mx-count>` that sets
`data-upgraded` from `data-n` in `connectedCallback`, and `tokens.css` with the layer
statement and the three-block `light-dark()` shape from 03 (three roles, both palettes).

## The seven points

| # | Point | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Renders in `storybook dev` and `storybook build` | Pass | `storybook build` → "Storybook build completed successfully". Dev (`storybook dev -p 6106`), Playwright: `[ ':defined' true, data-n '1', data-upgraded '1', h2 'Panel', slot 'Slot text 機械用' ]` |
| 2 | Static build served from the root of an origin | Pass | `python3 -m http.server 8811 --directory storybook-static`; manager at `/?path=/story/spike-box--default` loads the iframe `http://127.0.0.1:8811/iframe.html?id=spike-box--default&viewMode=story`. Default base path needed no setting |
| 3 | Element upgrades in the preview iframe, and after a control changes an argument | Pass (in dev) | Static: `[true, '1']`. Dev: control `n` set to 7 → `data-n '7', data-upgraded '7'`; control `title` → h2 `Changed`, element still upgraded. See problem 1 for static builds |
| 4 | A toolbar global changes `data-theme`/`data-palette` on the preview root and the story follows | Pass | Static build, clicking the toolbar: before `phosphor night rgb(2, 8, 5)`; after Palette→operator `operator night rgb(16, 14, 11)`; after Theme→day `operator day rgb(205, 214, 203)` (= `#cdd6cb`). The URL carries `&globals=palette:operator;theme:day` |
| 5 | Accessibility addon runs; a deliberate violation fails the Vitest run | Pass | `npx vitest run` with an image-without-alt story and a faint-text story: `Tests 2 failed \| 1 passed (3)`, `exit=1`, rules `image-alt` and `color-contrast` (axe 4.14). Without them: `Tests 1 passed (1)`, `exit=0` |
| 6 | Layered global CSS reaches the story; fonts from the package; no other origin | Pass | Computed `font-family` `"IBM Plex Mono", monospace`; `document.fonts` loaded: `IBM Plex Mono 400` from `/_astro/ibm-plex-mono-latin-400-normal-DMJ8VG8y.woff2`. Request origins, static and dev: only `http://127.0.0.1:8811` / `http://127.0.0.1:6106` |
| 7 | Playwright opens the iframe URL in the static build and takes a stable screenshot | Pass | `iframe.html?id=spike-box--default&viewMode=story`, reduced motion, capture, reload, capture: `identical: true 6611 6611` (bytes) |

## Configuration to carry into task 2.1

- `.storybook/main.ts`: `framework: { name: '@storybook-astro/framework', options: {} }` (render mode
  defaults to `static`); addons `@storybook/addon-docs`, `@storybook/addon-a11y`,
  `@storybook/addon-vitest`; `core: { disableTelemetry: true }`. `@storybook/builder-vite` must be
  installed at the same version as `storybook` (framework README).
- `.storybook/preview.ts`: import the fonts CSS, the token/layer CSS and the elements module once.
  Globals map to the root in a project-level `beforeEach({ globals })` that sets
  `document.documentElement.dataset.*`. It runs again on a toolbar change. Astro decorators run
  on the server and return descriptors, so they cannot set attributes on the iframe's `<html>`.
- `parameters.a11y = { test: 'error', options: { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] } }`.
- A separate `vitest.config.ts` with `storybookTest({ configDir: '.storybook' })` and browser mode
  (`@vitest/browser-playwright`, chromium). Do not wrap it in the framework's `defineConfig`
  (storybook-astro.org, "Testing Stories").
- Slot content passed as an HTML string is sanitised, and `data-*` attributes are stripped from it
  (storybook-astro.org, "Slots"). Stories that need attributes in a slot pass a component instead.

## Problems hit

1. **Controls do nothing in a static build.** Astro stories are pre-rendered with their story args.
   In the static build the framework turns off the control inputs and shows an "ℹ️ Astro" row
   (storybook-astro.org, "Static Builds": "Changing args via the Controls panel has no effect in
   static builds"). Live controls work in `storybook dev`. So the public site at
   `matrix.wadakatu.dev` shows each story as written, which is the same loss the fallback in 06
   names. Variants have to be stories of their own. That is already the rule in 06
   ("Required stories").
2. The minifier rewrote the layer statement in the built CSS to `@layer mx.reset;`, followed by
   `@layer mx.tokens{…}`, `mx.base{…}` and `mx.components{…}` in order. The order is the same, but it
   comes from the order the blocks appear in, not from the statement. Keep the layer statement
   first in the first stylesheet imported (`index.css`).
3. npm 11's install-scripts gate skipped esbuild's postinstall. `npm install-scripts approve esbuild`
   followed by `npm rebuild esbuild` fixed it.
4. Telemetry is on by default; `core.disableTelemetry` turns it off. The first `storybook build` ran
   before that was set.

## Not verified

- **Components manifest / MCP addon with Astro props (07).** With
  `features: { experimentalDocgenServer: true, experimentalComponentsManifest: true }` on 10.6.7,
  neither the static build nor `storybook dev` served `/manifests/components.json` (404). The
  framework's preset declares a `components` manifest only when the docgen server flag is on.
  Why nothing was served was not investigated, and `@storybook/addon-mcp` was not installed.
  This is not one of the seven points; the Markdown and JSON baseline in 07 stands.
- WebKit and Firefox inside Storybook; only Chromium was run.
- Storybook 11: not tried (beta, so excluded by Q10).
