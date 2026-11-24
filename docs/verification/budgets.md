# Budgets

The performance budgets of 05 ("Performance as an accessibility requirement"), each with its
ceiling beside what was measured. The gates read their ceilings from the tables below
(`scripts/budgets.mjs`), so a ceiling exists here and nowhere else; a change to one is a change
to this file in a pull request that says why. How each is measured is in 05 ("How each budget
is measured").

## Ceilings

| Budget | Ceiling | Measured | Commit | Where |
| --- | --- | --- | --- | --- |
| Animating elements per page | 170 | 168, Human home at 1440 (the most of any specimen) | `d65226a` | Development machine, Chromium 159.0.8154.6 |
| Animated properties, endless animations | `transform`, `background-position`, `mask-position`, `clip-path` | `transform`, `background-position` | `d65226a` | Development machine, Chromium 159.0.8154.6 |
| Stylesheet, gzip | 21,504 bytes | 20,538 bytes | `d65226a` | `npm run check`, Node 24.21.0 zlib |
| Terminal element, gzip | 13,063 bytes | 9,763 bytes | `d65226a` | `npm run check`, Node 24.21.0 zlib |
| Long tasks after load, 4× CPU | 0 entries | **1 entry, on the machine landing** (51 to 67ms); none on Human home or Article A | `d65226a` | Development machine, Chromium 159.0.8154.6 |
| Reading change, input to first frame | 200 ms | 48 ms, the worst of five each way | `d65226a` | Development machine, Chromium 159.0.8154.6 |

- **Stylesheet**: `dist/matrix.css` is 95,707 bytes, 20,538 gzip at level 9, with tasks 6.1 and
  6.4 merged. The ceiling is the next whole KiB above it, 21 KiB (09, question P5). The 15.3 KB
  of 05 is the prototype's two stylesheets and is not a ceiling.
- **Terminal element**: `dist/components/terminal/mx-terminal.js`, `dist/lib/terminal.js`,
  `dist/strings/index.js`, `en.js` and `ja.js`, joined. The ceiling is the prototype's built
  shell script at `93ca12d`, 13,063 bytes gzip (table M5 in `10-verification-log.md`). At the
  first measurement the element imported the `lib` barrel and was 14,620 bytes, over the
  ceiling; it now imports `lib/terminal.ts` itself (`64eb08a`).

## Animated properties of the other animations

Seen on the specimens through the boot and a reading change each way, in no endless animation.
Recorded, not part of the ceiling (09, question P1). A property in neither table fails.

| Property | Motion (05, "Catalogue") |
| --- | --- |
| `opacity` | Cursor blink |
| `text-shadow` | Name doubles |
| `visibility` | Déjà vu, and the session's lines in the reading change |
| `transform-origin` | Reading change, held at one value |

`clip-path` (the switch's and the logo's wipes) is one of the four and is also seen in no endless
animation. The switch's drop steps `background-position-y`, counted as `background-position`.

## Timing

Measured on the development machine; the CI runner has not run them (this branch is not pushed).

| Budget | Machine | At 1× (gated) | At 4× (recorded) |
| --- | --- | --- | --- |
| Long tasks after load | Apple M3, 8 cores, 24 GB, macOS 27.2, Playwright's Chromium 159.0.8154.6, headless | — | Machine landing: 1 entry, 51 to 67ms, about 0.2s after `load`, in five runs. Human home, Article A: none |
| Reading change, from Human home | The same | 人間用→機械用 48ms, 機械用→人間用 24ms | 32ms, 24ms |
| Reading change, from the machine landing | The same | 機械用→人間用 32ms, 人間用→機械用 24ms | 32ms, 32ms |
| Long tasks, reading change | GitHub's `ubuntu-24.04` runner | Not measured | Not measured |

Event Timing reports durations in steps of 8ms and only from 16ms; a figure is the largest
`duration` of the entries of the press's interaction.

**The long task on the machine landing is a finding** (`1.0.md`, Findings). It appears only when
the boot plays: a trace shows a task that is nearly all layout (47 of 51ms at 4×), after the web
fonts arrive during the boot and as the shell prints its first live session. The gate is left as
05 writes it and fails on that page.
