# Phase 3 — side by side with the prototype

The Phase 3 exit (09): specimens "Human home" and "Projects" against the prototype's stills at 1440 and
390, in phosphor-night and operator-night, with every difference listed; and definition of done, point 7
(04), for the approved Signature components they compose.

Prototype: wadakatu.github.io `93ca12d`, built with `astro build` in a scratch worktree (removed
afterwards). Both sides were rendered in the same Chromium (Playwright 1.65.1) with the same font files:
the prototype's Google Fonts request was answered with matrix's `dist/fonts.css`. `?motion=0` on both
(the still: rain parked, no Hold control), the boot marked as seen. Prototype pages:
`/proto/matrix/human/` and `/proto/matrix/human/projects/`; matrix: `src/specimens/human-home.astro` and
`human-projects.astro` (built to `/human-home.html`, `/human-projects.html`). In each sheet the
prototype is first, matrix second; the prototype's mail, GitHub and X links are covered with solid boxes.

| Sheet | What |
| --- | --- |
| [`phase-3/cmp-human-home-1440.png`](phase-3/cmp-human-home-1440.png) | Human home at 1440, half size: phosphor-night above, operator-night below |
| [`phase-3/cmp-human-home-390.png`](phase-3/cmp-human-home-390.png) | Human home at 390, full size: prototype and matrix in phosphor-night, then in operator-night |
| [`phase-3/cmp-projects-1440.png`](phase-3/cmp-projects-1440.png) | Projects at 1440, half size, as Human home |
| [`phase-3/cmp-projects-390.png`](phase-3/cmp-projects-390.png) | Projects at 390, as Human home |

The same pages in all four contexts are visual baselines (`tests/visual/snapshots/specimens-human-*`).

## Measured on matrix

From `npm run test:specimens` (`tests/signature.spec.mjs`), Chromium, on this branch:

| | |
| --- | --- |
| Header height, both readings, with the switch | 69 at 1440 and 1100; 53 at 719, 601, 600, 390, 320 (the prototype's, phase-2.md) |
| Tab order at 1440, 人間用 Home | Skip to content, fixture_, Home, Projects, Blog, About, 人間用, 機械用, Hold rain, Operator colours, Daylight (the prototype's) |
| Animating elements, motion allowed | Human home 168 at 1440, 72 at 390; Projects 157 and 62; 機械用 3. Ceiling 170 |
| Boot, ended by itself | 4,530ms (failsafe 8,000ms). The prototype's ended at 5.5–6.2s: the values decode in a time set by their length, and the fixture's are shorter |
| Boot with every other script blocked | ended at 8,024ms, by the head script's failsafe |
| Flash check, full window, 60 frames a second | Boot, into 機械用 and back, night and day: at most 0 flashes in any second (luminance 0.003–0.050 at night, 0.568–0.671 by day). The check's self-test catches a page alternating every 100ms |

## Differences, each with its reason

| Where | Difference | Why |
| --- | --- | --- |
| Everywhere | Fixture words: `fixture_`, five fixture projects, two fixture posts, the fixture's commits and phrases, and so the rain, the mask and the strands are made of other text | Specimens use the fixture corpus (06); his data stays in the site (01). The layouts are seeded and the counts are the prototype's (40 × 3 drops, 24 slabs, two drops a strand) |
| Name | Ends in `_` (`fixture_`, the fixture's wordmark); the cut-out lines are the fixture's commits | Fixture |
| About panel | Two short bio lines instead of two long ones | Fixture |
| Work and writing at 1440 | Entries are shorter, so the panel is shorter | Fixture |
| Activity | Four rows instead of five | Fixture's figures |
| Writing | `Fixture posts` instead of `Articles published` | Fixture |
| What the rain is made of | "28 fixture phrases …" instead of "171 real phrases …" | The number is computed from the corpus (`corpus(phrases).length`), as the prototype computes its own |
| Projects | No `note` paragraph under the last entry; `Full fixture archive` | The prototype's last project has a note; the fixture's do not |
| Footer | No X link and no "All explorations" | The fixture's links; "All explorations" is the prototype's own link (as phase-2.md) |
| Muted text, phosphor-night | `#80c194` instead of `#7cbd90` | Decision Q9 (02, "Changed from the prototype"); expected everywhere muted text appears |
| Compact switch, still | The `▾` is set at `font.size.label` (12px) instead of 9px | The "no raw values" gate allows no literal font size, and no token is 9px. Settled: it stays 12px and no token is added (below) |

Nothing in the structure, spacing, type or colour of the shared parts (header with the switch, panels,
streams wall and rows, figures, log, the capsule, the footer row) differs beyond the rows above.

## Not in the stills

- 機械用. The terminal is Phase 4; until then each specimen's 機械用 is a short recorded session of fixture
  lines (`src/fixtures/MachineFixture.astro`) with a way back to 人間用, so that the reading change,
  the scan lines and the name as a terminal line can be built and tested. It is not compared.
- Motion. Compared as stills; the change and the boot are checked by the behaviour tests and the flash
  check above, not frame by frame against the GSAP version (S3 recorded the same limit).

## Settled

The questions this phase left on pull request #63, as answered by wadakatu on 2026-11-15. They are
decisions now.

| Question | Decision |
| --- | --- |
| Does the shortcut's off switch persist, when 03 called `mx-theme` the only persistent key? | Yes, in `localStorage['mx-shortcut']`, as 05 says ("stored"). 03 was brought into line: `mx-theme` and `mx-shortcut` are the persistent keys |
| The compact switch's `▾` is 12px, not the prototype's 9px. Add a 9px token? | No. It stays at `font.size.label` (12px) and no token is added; the row above is an accepted difference |
| Where the off switch is: always in the footer; a line of the folded menu below 720px; from 720px the menu's copy shows only once the live shell has removed the footer (`data-shell="live"`, which Phase 4 sets) | Accepted as built |
| The new chrome strings in `src/strings/en.ts` and `ja.ts`: the shortcut's label and hint, the intro's "Skip intro" and note, and the `boot.human` line | Approved as they are. The Phase 2 strings, including オペレーター配色, were approved before |
