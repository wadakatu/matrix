# 10 — Verification log

What was checked while writing this design, how, and what was not. Every measured number in
the other pages comes from a table here.

Date of all checks: 2026-11-15, in two passes: the design itself, and later the same day
the revision that recorded wadakatu's answers (table M8 and "Checks made when recording the
answers"). Prototype: `/Users/koyoisono/dev/wadakatu.github.io-design`,
branch `design/explore`, head `93ca12d`, read only. The scripts used for the measurements
were scratch files outside the repository and are not committed (this step ships no code);
each table states its method so that the Phase 1 gates can reproduce it.

## Sources read

| Source | Read |
| --- | --- |
| `docs/matrix-research/web-research.md`, `x-research.md` | In full |
| Prototype: `docs/design-explore/MATRIX-NOTES.md` | In full (1,650 lines) |
| Prototype: `MACHINE-FIRST-AND-BLOG.md`, `PALETTE-LOGO-CRITIQUE.md`, `MATRIX-CRITIQUE.md` | In full |
| Prototype: `public/styles/proto/matrix.css`, `matrix-blog.css` | In full |
| Prototype: `ProtoMatrixLayout.astro`, `_Pill.astro`, `_Stream.astro`, `_Terminal.astro`, `_Out.astro`, `_lib.ts` | In full |
| Prototype: `proto-matrix-blog.js` | In full |
| Prototype: `_shell.ts`, `proto-matrix.js` | Types and structure only; not line by line |
| Prototype: `_term.ts`, `_world.ts`, `_machine.ts`, `_Home.astro`, `_Projects.astro`, `blog/[slug].astro` | Not read; described from the notes |
| Prototype stills | `mf-landing-1440`, `mf-landing-390`, `mf-human-1440`, `mf-post-serena-1440`, `mf-landing-operator-1440` |
| Portfolio: `CLAUDE.md`, `package.json`, `astro.config.mjs`, `public/sw.js`, `src/data/proto-content.ts`, `src/content.config.ts` | In full or the relevant part |
| wadakatu.github.io draft PR #116 | Title, body, state (open, draft) |
| This repository: `README.md`, `llms.txt`, `docs/ai.md`, `scripts/check.sh`, `stylelint.config.mjs`, `.github/workflows/ci.yml`, head of `tombo.css` and `tombo.js`, one spec and one plan under `docs/superpowers/` | As listed |

Because several prototype files were not read line by line, 04 points the implementer at
the prototype as the behavioural specification rather than restating it.

## M1 — The palette in OKLCH

Method: `culori` 4.0.2, `oklch()` of each hex in `matrix.css`.

| Role | phosphor-night | operator-night | phosphor-day | operator-day |
| --- | --- | --- | --- | --- |
| ground | L .123 C .017 H 165 | L .165 C .007 H 78 | L .867 C .022 H 139 | L .866 C .018 H 140 |
| panel | .168 / .023 / 158 | .193 / .011 / 81 | .918 / .019 / 138 | .905 / .014 / 139 |
| rule | .378 / .073 / 154 | .337 / .020 / 77 | .660 / .042 / 153 | .688 / .027 / 153 |
| text | .920 / .066 / 153 | .921 / .023 / 85 | .226 / .036 / 157 | .210 / .019 / 158 |
| text-muted | .742 / .093 / 153 (prototype); .755 / .093 / 153 (matrix, M8) | .774 / .044 / 86 | .369 / .047 / 156 | .359 / .032 / 157 |
| text-lead | .981 / .030 / 155 | .909 / .060 / 90 | .168 / .031 / 159 | .248 / .047 / 162 |
| accent | .839 / .218 / 151 | .789 / .103 / 84 | .412 / .099 / 154 | .379 / .085 / 157 |
| rain.tail | .319 / .073 / 153 | .267 / .016 / 80 | .819 / .029 / 144 | .804 / .022 / 143 |
| rain.body | .572 / .144 / 152 | .589 / .046 / 84 | .598 / .069 / 153 | .582 / .028 / 153 |
| rain.head | .963 / .057 / 154 | .909 / .060 / 90 | .309 / .069 / 155 | .248 / .047 / 162 |

Reading: each night palette is one hue family with hand-placed lightness; the two day
palettes are nearly the same (the prototype's notes say so too: "Operator day barely
differs from phosphor day"). This is the basis for not introducing a primitive tier (02).

## M2 — Contrast

Method: `culori` 4.0.2 `wcagContrast()` for WCAG 2 ratios; `apca-w3` 0.1.9
`APCAcontrast(sRGBtoY(text), sRGBtoY(background))` for Lc. Solid colours, no scan lines.
These are the golden values for the Phase 1 gate. The two `text-muted` cells for
phosphor-night are matrix's lifted value (decision Q9, table M8); every other cell is the
prototype's value.

| Pair (foreground on background) | phosphor-night | phosphor-day | operator-night | operator-day |
| --- | --- | --- | --- | --- |
| text on ground | 16.31 (Lc −92.2) | 11.36 (78.5) | 15.25 (−90.5) | 11.81 (79.0) |
| text on panel | 15.43 (−91.8) | 13.31 (88.0) | 14.53 (−90.0) | 13.34 (86.1) |
| text-muted on ground | 9.59 (−61.1) | 6.89 (68.5) | 9.42 (−62.1) | 7.21 (69.5) |
| text-muted on panel | 9.07 (−60.7) | 8.07 (77.9) | 8.98 (−61.7) | 8.14 (76.6) |
| text-lead on ground | 19.30 (−104.3) | 12.83 (80.2) | 14.71 (−88.1) | 10.61 (77.2) |
| text-lead on panel | 18.25 (−103.9) | 15.03 (89.6) | 14.02 (−87.6) | 11.98 (84.3) |
| accent on ground | 13.32 (−79.7) | 5.61 (63.1) | 9.88 (−64.7) | 6.48 (66.6) |
| accent on panel | 12.60 (−79.4) | 6.57 (72.6) | 9.42 (−64.2) | 7.32 (73.7) |
| ground on accent | 13.32 (80.2) | 5.61 (−65.4) | 9.88 (66.0) | 6.48 (−68.5) |
| rule on ground | 2.07 | 2.06 | 1.62 | 1.85 |
| rule on panel | 1.96 | 2.41 | 1.54 | 2.09 |
| rain.body on ground | 4.88 | 2.59 | 4.66 | 2.81 |
| rain.head on ground | 18.53 | 8.62 | 14.71 | 10.61 |
| reading.human on ground | 9.27 | 4.49 | 8.84 | 4.47 |
| reading.machine on ground | 6.67 | 4.40 | 6.36 | 4.38 |
| reading.human on panel | 8.76 | 5.26 | 8.42 | 5.05 |
| reading.machine on panel | 6.31 | 5.15 | 6.06 | 4.95 |

Cross-check: where the prototype's notes report a figure for the same pair, the prototype's
values agree (for example 8.68 and 5.61 as the phosphor minima, 8.98 and 6.48 for operator,
and the article table's 15.43, 12.60, 13.31, 6.57). The 8.68 is `text-muted` on `panel` in
phosphor-night before the lift; it is kept in table M8. The notes' figures were measured
from rendered pages by their authors; they were not re-run here.

## M3 — Fonts

Method: `npm pack` of the Fontsource packages; advance widths read from the `hmtx` table of
the `.woff` files with a small parser; sizes from the files.

| Family | Package | Licence (npm) | Units per em | Advance widths found |
| --- | --- | --- | --- | --- |
| IBM Plex Mono | `@fontsource/ibm-plex-mono` 5.3.0 | OFL-1.1 | 1000 | 600 (0.6em) |
| M PLUS 1 Code | `@fontsource/m-plus-1-code` 5.3.1 | OFL-1.1 | 1000 | 500 (0.5em) Latin, 1000 (1em) Japanese |
| DotGothic16 | `@fontsource/dotgothic16` 5.3.1 | OFL-1.1 | 1000 | 1000 and 500 |

- IBM Plex Mono Latin subsets are about 15 KB each as WOFF2 (400, 500, 700).
- M PLUS 1 Code is shipped as numbered unicode-range subsets (840 WOFF2 files across seven
  weights), which is what makes self-hosting Japanese practical.
- Consequence used in 03: Latin in IBM Plex Mono (0.6em) and Japanese (1em) do not share a
  cell grid. M PLUS 1 Code alone would (0.5em and 1em). The approved Latin face is IBM Plex
  Mono, so matrix does not promise character-cell alignment across scripts. Setting
  tabular terminal output in M PLUS 1 Code is a possible later refinement and is a visual change.

## M4 — What the blog's Markdown uses

Method: `grep` over `src/content/blog/*.md` (18 files, 17 with `published: true`).

| Feature | Count |
| --- | --- |
| Code fences | 73 |
| Fences with a filename (`lang:filename` or `:filename`) | 11 |
| `diff` fences | 5 |
| `:::message` / `:::message alert` | 4 / 2 |
| `:::details` (written with four colons) | 3 |
| Files with a blockquote | 2 |
| Files with images | 3 |
| Files with `h4` | 3 |
| Files with a table, a footnote or a task list | 0 / 0 / 0 |

Most used fence languages: `php` 19, `bash` 18.

## M5 — Prototype sizes

Method: `wc -c` and `gzip -9`.

| File | Bytes | gzip |
| --- | --- | --- |
| `matrix.css` | 41,706 | 11,808 |
| `matrix-blog.css` | 11,185 | 3,479 |
| `proto-matrix.js` | 20,133 | 7,271 |
| `proto-matrix-blog.js` | 2,266 | 1,119 |
| `_Terminal.astro` script, built (`dist/_astro/_Terminal.astro_astro_type_script_index_0_lang.*.js`) | 30,206 | 13,063 |
| `logo-400.png` / `logo-400.webp` | 240,877 / 44,312 | — |

The built shell script was measured for task 6.3 (05, "How each budget is measured"): `astro build`
of `93ca12d` in a scratch worktree (Astro 5.16.7, Node 23.4.0; the prototype pins neither), the one
script `/proto/matrix/` loads for the shell. It imports nothing by a relative path. Its gzip is the
terminal budget's ceiling.

## M6 — Baseline status of CSS and platform features

Method: `web-features` 3.46.0 `data.json`, `status.baseline` with its dates.

| Feature | Status | Since |
| --- | --- | --- |
| `light-dark()` | newly available | 2024-05-13 |
| CSS nesting | widely available | 2026-06-11 |
| `:has()` | widely available | 2026-06-19 |
| `color-mix()` | widely available | 2025-11-09 |
| Cascade layers | widely available | 2024-09-14 |
| Container queries | widely available | 2025-08-14 |
| Masks | widely available | 2026-06-07 |
| Web Animations API | widely available | 2023-03-16 |
| Visual Viewport API | widely available | 2024-02-10 |
| `forced-colors` | widely available | 2025-03-12 |
| `::details-content` | newly available | 2025-09-16 |
| `@scope` | newly available | 2026-03-24 |
| `text-wrap: balance` | newly available | 2024-05-13 |
| Alternative text on generated content | newly available | 2024-07-09 |
| `scrollbar-color` | newly available | 2025-12-12 |
| `content-visibility` | newly available | 2025-09-15 |
| `background-clip: text` | limited | — |
| `word-break: auto-phrase` | limited | — |
| `text-autospace` | limited | — |

The prototype uses `::details-content`, `background-clip: text`, `auto-phrase` and
alternative text on generated content; each needs an entry in the Baseline ledger with its
degradation.

## M7 — Tool versions

Method: `npm view <package> version dist-tags`.

| Package | `latest` | Note |
| --- | --- | --- |
| `storybook` | 10.6.7 | `next` is 11.0.0-beta.3 |
| `@storybook-astro/framework` | 1.16.0 | Peers `storybook ^10 \|\| ^11.0.0-beta.0`, `astro ^5.5.3 \|\| ^6 \|\| ^7` |
| `@storybook/web-components-vite`, `addon-a11y`, `addon-vitest`, `addon-mcp` | 10.6.7 | — |
| `@terrazzo/cli`, `@terrazzo/plugin-css` | 2.10.0 | — |
| `style-dictionary` | 5.8.0 | — |
| `astro` | 7.4.12 | The portfolio declares `^5.16.7` |
| `@playwright/test` | 1.65.1 | This repository pins 1.64.1 |
| `stylelint` | 18.0.0 | This repository declares `^17.14.1` |
| `gsap` | 3.15.1 | Licence field: "Standard 'no charge' license" |
| `apca-w3` | 0.1.9 | — |
| `web-features` | 3.46.0 | — |
| `@wadakatu/matrix` | not found (404) | The name is free on the registry. matrix does not publish there (decision Q2) |

## M8 — The lifted `text-muted` (decision Q9)

Method: the M1 and M2 tools at the same versions (`culori` 4.0.2, `apca-w3` 0.1.9), run
again when the answers were recorded. The run first reproduced the eight prototype
`text-muted` figures of M2 exactly, then measured candidates made by raising OKLCH
lightness from `#7cbd90` with chroma and hue held.

| `color.text-muted`, phosphor-night | OKLCH | On `ground` `#020805` | On `panel` `#06120b` |
| --- | --- | --- | --- |
| `#7cbd90` (prototype) | L .742 C .093 H 153 | 9.18 (Lc −58.9) | 8.68 (Lc −58.5) |
| `#80c194` (matrix) | L .755 C .093 H 153 | 9.59 (Lc −61.1) | 9.07 (Lc −60.7) |
| `#99dbac` (first candidate at Lc 75 on `panel`; not chosen) | L .834 C .094 H 153 | 12.59 (Lc −75.7) | 11.90 (Lc −75.4) |
| `color.text` `#c4f2d0`, for scale | L .920 C .066 H 153 | 16.31 (Lc −92.2) | 15.43 (Lc −91.8) |

- Two smaller lifts also reach Lc 60 on `panel` (`#7ec092` at −60.0, `#7fc093` at −60.1).
  `#80c194` was taken for the margin; the choice was a judgement, and wadakatu confirmed it
  (README, N1).
- The contract's minima in 02 do not move: the lowest `text-muted` ratio is still 6.89, in
  phosphor-day.
- Not measured: the lifted colour on a rendered page, under scan lines, or by eye.

## Checks made when recording the answers

2026-11-15. Pages were read through a fetch tool, and the quotations are as it returned them.

| Statement used | Where | Source |
| --- | --- | --- |
| Unpublishing removes the current deployment; "Any existing repository settings or content will not be affected"; with branch publishing, "Commit to your publishing source to create a new deployment" | 08 | <https://docs.github.com/en/pages/getting-started-with-github-pages/unpublishing-a-github-pages-site> |
| "Make sure you add your custom domain to your GitHub Pages site before configuring your custom domain with your DNS provider" | 06 | <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site> |
| "If you are publishing from a custom GitHub Actions workflow, no `CNAME` file is created, and any existing `CNAME` file is ignored and is not required" | 06 | Same page |
| Enforce HTTPS: "It can take up to 24 hours before this option is available" | 06 | Same page |
| A user site's custom domain "will be used for all project sites owned by the same account"; a repository's own custom domain overrides it | 06 | <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages> |
| "Verifying your domain stops other GitHub users from taking over your custom domain and using it to publish their own GitHub Pages site" | 06 | <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages> |
| The rename page lists what is redirected and does not mention release assets | 08 | <https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository> |
| "If you set `"private": true` in your package.json, then npm will refuse to publish it" | 01 | <https://docs.npmjs.com/cli/v11/configuring-npm/package-json#private> |
| `npm pack --dry-run` succeeds for a package with `"private": true` | 01 | Run locally in a scratch directory. A refused publish was not tried, since trying means publishing |
| Lc 60: "The minimum level recommended for content text that is not body, column, or block text", with sizes from 24px at normal weight; Lc 75 "may be used with non-body text with a font no smaller than 15px/400" | 02, 05, README N1 | <https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell>, "Use-Case & Size Ranges" |
| The `apca-w3` README has no such list in text; its font look-up tables are images | — | <https://github.com/Myndex/apca-w3> |

So 13px muted text is under the sizes APCA names for Lc 60 and for Lc 75. The lift is to
the Lc 60 line as a level, not a claim that 13px text conforms to APCA's size table.

## Claims in the research, as checked

The research files are committed unchanged. Where a claim this design relies on was
checked, the result is here; a correction is a note for the reader, not an edit to them.

| Claim | Result | Evidence |
| --- | --- | --- |
| DTCG 2025.10 is stable, a Community Group report, with Format, Color and Resolver modules | Confirmed | The three module pages; resolver requires `version: "2025.10"` |
| Style Dictionary does not fully support 2025.10 | Confirmed | <https://styledictionary.com/info/dtcg/>: "does not have full support yet … work in progress in v5" |
| Terrazzo's CSS plugin maps resolver permutations to selectors | Confirmed | <https://terrazzo.app/docs/integrations/css/> ("Resolvers") |
| Terrazzo's Getting Started still says resolvers are "coming in 2.0" | Confirmed, and stale as the research says | <https://terrazzo.app/docs/>; npm `latest` is 2.10.0 |
| "Storybook 11 is in alpha" (web research) | **Corrected:** beta | Blog post dated 2026-11-09; npm `next` 11.0.0-beta.3. The X research already says beta |
| Storybook MCP docs tools are unavailable for Astro and web components (web research) | **Partly outdated** | Storybook 10's page still says "every other framework: no manifest support". But `@storybook-astro/framework` 1.16.0's changelog states the manifest and MCP now expose Astro components' props and slots, and the Storybook 11 beta post says manifests now cover all core frameworks. The changelog statement was read, not exercised: spike S1 checks it |
| `@storybook-astro/framework` supports Storybook 10 and 11, Astro 5.5.3+, static builds with pre-rendered stories | Confirmed | npm peers; <https://storybook-astro.org/getting-started/> |
| Storybook lists Astro as a framework | Confirmed, as community-maintained | <https://storybook.js.org/docs/get-started/frameworks> |
| The accessibility addon is axe-core; "up to 57%"; `runOnly`; `test: 'error'` | Confirmed | <https://storybook.js.org/docs/writing-tests/accessibility-testing> |
| GitHub Pages is "CPP level 0"; Chromatic is recommended | Confirmed | <https://storybook.js.org/docs/sharing/publish-storybook> |
| A renamed repository's project site is not redirected | Confirmed | GitHub docs, "Renaming a repository" |
| A sub-domain needs a `CNAME` to `<user>.github.io` and the domain set in the repository first | Confirmed | GitHub docs, "Managing a custom domain" |
| `AGENTS.md`: no required fields; nearest file wins; chat overrides | Confirmed | <https://agents.md/> FAQ |
| Skill frontmatter: `name` (max 64, matches directory), `description` (max 1024) | Confirmed | <https://agentskills.io/specification> |
| `llms.txt` v2 (2026-08-10): may sit at any path; `.md` mirrors; link relations | Confirmed | <https://llmstxt.org/> |
| Figma's five-step guide for a design-system skill | Confirmed | The linked page, steps 1–5 |
| `DESIGN.md` exists as a format | Confirmed; it describes itself as version `alpha` | Repository README |
| Astro components are published as source with `exports` | Confirmed | <https://docs.astro.build/en/reference/publish-to-npm/> |
| IBM Plex Mono has no Japanese; a proportional fallback breaks the grid | Extended by M3: even with a monospaced Japanese face the grid is 0.6 : 1 | M3 |

## Findings in the prototype that this design acts on

| Finding | Evidence | Acted on in |
| --- | --- | --- |
| The switch's drop is endless and has no pause control; in 機械用 Hold rain is hidden | `matrix.css` lines 124, 309, 395, 443 | 05 ("One switch for all endless motion") |
| The shortcut's off switch cannot be reached from 機械用 | `MATRIX-NOTES.md`, "機械用 as a shell", Accessibility and Still weak | 04 (Readings) |
| `--rule` is 1.5–2.4:1 and is the border of some controls (chips, pager, the guide's ×) | M2; `matrix.css` | 05 (colour rule 4) |
| `--green` is amber in Operator | `matrix.css` | 02 (`accent`) |
| A same-origin Storybook would be cached by the portfolio's service worker | `public/sw.js`: scope `/`, cache-first for `style`, `script`, `image`, 30 days | 06: the Storybook has its own origin (decision Q1) |
| Fonts and GSAP are third-party requests | `ProtoMatrixLayout.astro` | 01, 05 |
| The frozen boot can show half-decoded Japanese | `MATRIX-NOTES.md`, "Still weak" | 05 (The boot) |
| Root-level state lives in six classes set by different scripts (`js`, `enhanced`, `term`, `term-off`, `kb`, `cmatrix`) | `matrix.css`, layout head script | 01, 04 (rename map) |

## Not verified

Stated plainly so that nothing below is mistaken for a checked fact.

- Any behaviour in Safari, Firefox, on a phone, or with a screen reader. The prototype's
  own notes say the same of everything they report.
- The prototype's test results. They are quoted as the notes' results.
- Whether the project site's old address under `www.wadakatu.dev` forwards to
  `matrix.wadakatu.dev` once the custom domain is set. GitHub's page on custom domains
  does not say. Task 6.5 checks that nothing of this repository is reachable there.
- Whether the custom domain can be saved in Pages settings while the site is unpublished
  and before any deployment exists (06, the gate's first step).
- What the Pages settings and API show after a site is unpublished.
- Whether a release asset's download URL follows a repository rename (08).
- Whether `raw.githubusercontent.com` URLs follow a repository rename.
- Whether Terrazzo's `a11y/min-contrast` evaluates every resolver context, and whether its
  CSS plugin can emit `light-dark()` by configuration (spike S2).
- That the Storybook MCP addon really exposes Astro components (spike S1).
- The share of wadakatu.dev's readers on engines without `light-dark()`.
- The statement in the X research that light body text on black is comfortable to about
  Lc −90; and APCA's full per-size table, which the `apca-w3` README gives as images. The
  general levels were read from another APCA page ("Checks made when recording the
  answers").
- Whether APCA's levels are meant to be compared with the absolute value of a negative Lc.
  Neither page says so in text; this set compares magnitudes.
- That wadakatu.github.io is TOMBO's only consumer. It is the only one GitHub's code
  search returned.
- The licence terms under which the logo is used. This design records that the file is
  credited and already public in the portfolio repository, and wadakatu's decision (Q3)
  that it may live in this repository under a not-MIT, no-reuse notice. It has seen no
  written terms.
