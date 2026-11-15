# Phase 2 — side by side with the prototype

Definition of done, point 7 (04), for the approved components of tasks 2.4 and 2.5.
Prototype: wadakatu.github.io `93ca12d`, built with `astro build` in a scratch worktree (removed
afterwards). Both sides were rendered in the same Chromium (Playwright 1.65.1) with the same
font files: the prototype's Google Fonts request was answered with matrix's `dist/fonts.css`,
so differences in type are not differences in font files. `?motion=0` on both, so neither shows
Hold rain (both hide it when motion is off); the prototype's boot was skipped.

Each sheet shows the prototype first, then matrix's chrome specimen (`src/specimens/chrome.astro`),
which puts every surface component on a Panel inside the Layout, as the prototype does. The
surface sheets were rendered from `1406e6b`; the commit that adds them changes only the forced
colours rules of the Menu and Control, which none of these sheets show.

| Sheet | What |
| --- | --- |
| [`phase-2/cmp-header-1440.png`](phase-2/cmp-header-1440.png) | Header at 1440: 機械用 phosphor-night, 人間用 operator-night, 人間用 phosphor-day |
| [`phase-2/cmp-header-390.png`](phase-2/cmp-header-390.png) | Header at 390: 人間用 and 機械用 phosphor-night, operator-night, phosphor-day |
| [`phase-2/cmp-menu-390.png`](phase-2/cmp-menu-390.png) | The open menu at 390 in three contexts (Operator colours pressed in operator, Daylight in day) |
| [`phase-2/cmp-footer-1440.png`](phase-2/cmp-footer-1440.png), [`-390`](phase-2/cmp-footer-390.png) | Footer, phosphor-night and phosphor-day |
| [`phase-2/cmp-panel-1440.png`](phase-2/cmp-panel-1440.png), [`-390`](phase-2/cmp-panel-390.png) | Panel, Figures, Inline list (default and `links`): the prototype's Activity, Writing and Skills panels against the fixture's figures panel; night and day |
| [`phase-2/cmp-surfaces-1440.png`](phase-2/cmp-surfaces-1440.png), [`-390`](phase-2/cmp-surfaces-390.png) | Lede and Log: "What the rain is made of" against the fixture's log panel; night and day |
| [`phase-2/cmp-meta-1440.png`](phase-2/cmp-meta-1440.png), [`-390`](phase-2/cmp-meta-390.png) | Meta, Lede and Inline list `after`: the first Projects entry against the fixture panel, then the two `after` rows; night and day |
| [`phase-2/cmp-moved.png`](phase-2/cmp-moved.png) | Moved, phosphor-night at 1440 and 390 (both pages are fixed to night); redirects removed before capture |

In the footer sheets the prototype's mail, GitHub and X links are covered with solid boxes:
they are wadakatu's contact details. The header and menu sheets cover Mark, Logo, Nav and Control where the
header shows them. Status is visually hidden in every context, here and in the prototype, so it
has no sheet. The specimen and the prototype group things differently: the prototype's lede is
in the surfaces sheet and matrix's in the meta sheet; the prototype's `links` list is in the meta
sheet and matrix's in the panel sheet.

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
| Footer | No shortcut row, no "All explorations"; 91px tall instead of 149 at 1440, 121 instead of 231 at 390 | The shortcut and its off switch are task 3.6 (the Footer has the row's slot); "All explorations" is the prototype's own link |
| Footer | No X link | The fixture's links (mail, GitHub, credit); the Footer takes any list |
| Panel | One look, no `.wall` or `.about` padding | Those are compositions of pages built later (Streams, 3.4), not Panel variants |
| Panel, 1440 | Full width; the prototype sets three 411px panels side by side with rain between them | `.station` is a page composition; padding, border, ground and heading are the same |
| Figures | Three rows; full-width rows at 1440 | The fixture's figures, and the Panel's width above |
| Inline list, default at 1440 | One line; the prototype's Skills wrap to two | Its third-of-a-row panel, and the fixture's words |
| Inline list, `after` | 20px above instead of 12px in the Work and writing panel | The prototype's `.wall .after { margin-top: 12px }` is a `.wall` override; its base `.after` is 20px (`matrix.css:219`, `:222` at `93ca12d`), as matrix |
| Inline list, wrapping at 390 | `after` wraps to two lines; the prototype's long address breaks inside the word | Text length; both lists wrap and break the same way |
| Lede | Two lines instead of three at 1440 | The fixture's sentence is shorter; the same 68ch measure |
| Log | Three entries instead of six; a body paragraph above it instead of a lede | The fixture, and the specimen's content |
| Meta | Under a lede in a panel, not under a stream entry's name | Streams are task 3.4; the line itself is the same |
| Moved | Only the link's address | The specimen's target; the line sits at the same place at both widths |
| Log at 390, Footer at 1440 | A 1px sliver of rain under the prototype panel; the footer's rule one row lower in matrix's crop | Sub-pixel element boxes in the capture, not the components |
| Muted text, phosphor-night | `#80c194` instead of `#7cbd90` | Decision Q9 (02, "Changed from the prototype"); expected everywhere muted text appears |
| Wordmark, links | Fixture words | Stories and specimens use the fixture corpus (06) |
