# Phase 2 — side by side with the prototype

Definition of done, point 7 (04), for the approved components of tasks 2.4 and 2.5.
Prototype: wadakatu.github.io `93ca12d`, built with `astro build` in a scratch worktree (removed
afterwards). Both sides were rendered in the same Chromium (Playwright 1.65.1) with the same
font files: the prototype's Google Fonts request was answered with matrix's `dist/fonts.css`,
so differences in type are not differences in font files. `?motion=0` on both, so neither shows
Hold rain (both hide it when motion is off); the prototype's boot was skipped.

Each sheet shows the prototype first, then matrix's chrome specimen (`src/specimens/chrome.astro`).

| Sheet | What |
| --- | --- |
| [`phase-2/cmp-header-1440.png`](phase-2/cmp-header-1440.png) | Header at 1440: 機械用 phosphor-night, 人間用 operator-night, 人間用 phosphor-day |
| [`phase-2/cmp-header-390.png`](phase-2/cmp-header-390.png) | Header at 390: 人間用 and 機械用 phosphor-night, operator-night, phosphor-day |
| [`phase-2/cmp-menu-390.png`](phase-2/cmp-menu-390.png) | The open menu at 390 in three contexts (Operator colours pressed in operator, Daylight in day) |

The footer and the panels (Activity against the fixture's figures panel) were compared the same
way at 1440 and 390 in phosphor-night and phosphor-day; those sheets are not committed because
the prototype's footer carries wadakatu's contact details.

## Measured on the prototype

Same harness, `/proto/matrix/human/` and `/proto/matrix/`:

| | 1440 | 1100 | 720 | 719 | 601 | 390 | 320 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Header height, both readings | 69 | 69 | 125 (wraps) | 53 | 53 | 53 | 53 |

Tab order at 1440, 人間用 Home, motion allowed: Skip to content, wadakatu_, Home, Projects,
Blog, About, 人間用, 機械用, Hold rain, Operator colours, Daylight.

`tests/chrome.spec.mjs` asserts matrix's heights (69 at 1440 and 1100, 53 from 320 to 719, both
readings) and this order without the switch, followed by the language link.

## Differences, each with its reason

| Where | Difference | Why |
| --- | --- | --- |
| Header, every width | No reading switch | The Switch is task 3.5; the Header has its slot, first among the controls |
| Header, 1440 | `日本語` after Daylight | The Language link (draft, 04), placed as on TOMBO's site; only where a twin exists |
| Header, 720 | Wraps to 114.8px; the prototype wraps to 125px | Neither fits one row at 720; the switch is absent here (3.5) |
| Header, 390 | No compact switch beside the menu button | Task 3.5 |
| Menu, open | A `日本語` line under the controls | The Language link, as above |
| Menu button | Its word is hidden with the visually-hidden rules rather than `font-size: 0` | The "no raw values" gate allows no literal font size; the name is the same |
| Footer | No shortcut row, no "All explorations" | The shortcut and its off switch are task 3.6 (the Footer has the row's slot); "All explorations" is the prototype's own link |
| Panel | One look, no `.wall` or `.about` padding | Those are compositions of pages built later (Streams, 3.4), not Panel variants |
| Muted text, phosphor-night | `#80c194` instead of `#7cbd90` | Decision Q9 (02, "Changed from the prototype"); expected everywhere muted text appears |
| Wordmark, links | Fixture words | Stories and specimens use the fixture corpus (06) |
