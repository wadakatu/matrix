# 09 — Implementation plan

A phased plan for building matrix from this design. It is written to be executed later by
an agent (Opus) working with wadakatu, one task at a time.

This document contains no code and the design step that produced it wrote none. Task
descriptions say what must exist and how to tell that it works.

## How to use this plan

- Work in order. A phase starts when the previous phase's exit criteria are met and
  recorded. Inside a phase, tasks marked ∥ can run in parallel.
- Each task is one pull request unless it says otherwise. The pull request body lists the
  task ID, the acceptance points with the evidence for each, and anything that turned out
  differently from this design.
- Read the design page a task names before starting it. Where a task is silent:
  **the prototype decides how it looks and behaves; this design decides what it is called
  and how it is structured.** If they conflict in a way that changes what a reader sees,
  stop and ask.
- Check boxes are for tracking; tick them in the pull request that completes them.

### Constraints that hold for every task

1. Never push to `main`. Branch from `main`, open a pull request, merge when CI is green.
2. Commits are English Conventional Commits, without `Co-Authored-By` (this repository's
   existing rule, from its earlier plans).
3. Do not run `gh repo rename`. Do not change Pages settings, DNS or repository protection;
   steps that need them are marked **[wadakatu]**. Never publish to npm (decision Q2).
4. Do not edit `/Users/koyoisono/dev/wadakatu.github.io-design` or any checkout of
   wadakatu.github.io the user works in. To run the prototype, add a separate worktree of
   that repository at `93ca12d` in a scratch directory and remove it afterwards.
5. Approved values do not change. Colours, sizes and timings come from 02 and the
   prototype; where they differ, 02 is right. Today that is one value, `text-muted` in
   phosphor-night, lifted by decision Q9. A change to any other is a design change and
   needs wadakatu.
6. No runtime dependency is added to the package. A new development dependency is named
   and justified in the pull request that adds it.
7. Tools run at the versions pinned in `mise.toml` and the lockfile; print the version in
   the evidence when it matters.
8. A number in a pull request or a doc is copied from tool output produced in that task,
   never from this plan's examples.
9. Visual baselines are created and updated only through the pinned Docker image, and
   never to make an unexplained difference pass.
10. If work is split across parallel agents: one worktree and one scratch directory per
    agent, and regenerate the generated files (`components.json`, `llms-full.txt`,
    `docs/tokens.md`) after merging rather than resolving them by hand.

### Evidence

"Done" means observed. For each acceptance point attach the thing that shows it: the
command and its relevant output, the test name and result, or the still. A pull request
that says "should work" for an acceptance point is not complete.

### The commands this plan assumes

Created in Phase 1 and used by name afterwards.

| Command | Does |
| --- | --- |
| `npm run build` | Tokens, elements and lib, flattened CSS |
| `npm run check` | Every gate that needs no browser |
| `npm run storybook` / `npm run build-storybook` | Storybook, development and static |
| `npm run test:stories` | Story tests: interaction and accessibility |
| `npm run test:visual` / `:update` | Playwright in the pinned Docker image |
| `npm run test:specimens` | Playwright on the specimen pages: no-JS, keyboard, print, forced colours |

## Decisions already made

wadakatu answered the README's ten questions on 2026-11-15. None of them is open, and no
task waits for an answer. What each one means for this plan:

| Q | Decision | In this plan |
| --- | --- | --- |
| Q1 | Storybook at `matrix.wadakatu.dev` from the start | 6.5, behind the DNS gate below. S1 tests a build served from the root of an origin |
| Q2 | No npm publish; GitHub Releases only | `"private": true` in 1.2; the Release in 7.1 is the distribution; there is no npm task |
| Q3 | The logo may live in this repository under a not-MIT, no-reuse notice | The file and its notice arrive in 1.2; 2.3 uses the real mark |
| Q4 | The palette is not persisted; the address carries it | 2.3, as specified in 03 |
| Q5 | `brace` and `bits` are removed | 3.5 ports the rain and capsule drawings only, and no `?switch=` flag |
| Q6 | Browser-standard animation; GSAP only if that proves insufficient | S3 decides whether it is sufficient |
| Q7 | TOMBO's pages stop being published; no stub, no redirect | 1.1; nothing for `/tombo/` in the portfolio migration |
| Q8 | English at the root, Japanese under `/ja/`; a post only in its own language | 2.6 ships `en` and `ja` strings; the routes are the portfolio's (7.2) |
| Q9 | `text-muted` at night slightly brighter | 1.3 builds the value in 02; 1.4's golden values are table M2 as amended |
| Q10 | The latest stable Storybook when implementation starts | S1 records the version it used |

### Gates that need wadakatu

Not questions: the decision is made, and the step is his to take or to approve.

| Gate | Needed for | Ask |
| --- | --- | --- |
| Push and protect the `tombo` branch; retire TOMBO's Pages site | 1.1, before 1.2 merges | At the start |
| **The DNS record for `matrix.wadakatu.dev`** (Q1): his OK, the custom domain saved in Pages settings, then the `CNAME` (06, "Gate: the DNS record") | 6.5 | Early, in Phase 2. Nothing else waits on it, and the Storybook can then be public while components are reviewed |
| The repository rename | Nothing. Best before 7.2 (08, "When to rename") | — |
| Review of the Japanese chrome strings | 7.3 (`1.0.0`) | When 2.6 is done |
| Approval of draft components | 7.3 (`1.0.0`) | When 5.3 is shown |

### No open item

N1 in the README, whether `#80c194` is the right amount of lift for `text-muted` in
phosphor-night, is settled: the value stays `#80c194`, as specified in 02 and as built.

## Phase 0 — Spikes

Throwaway branches. Nothing merges except a short written result per spike in
`docs/matrix-design/spikes/`. Their purpose is to turn the three riskiest assumptions in
this design into facts before anything is built on them.

- [ ] **S1 — Storybook renders Astro components, in a static build.**
  Read 06 ("Spike S1"). Use the Storybook version that is `latest` on npm the day the spike
  starts (decision Q10) and write it in the result. Pass: all seven points observed.
  Fail: adopt the fallback in 06 and amend 06 and this plan in the same pull request as
  the result.
- [ ] **S2 — Tokens compile to the shape in 03.** ∥
  A minimal DTCG 2025.10 set (two colours with alpha, one dimension, one duration, one font
  family, one alias) and the four-context resolver. Pass: `tz check` accepts it; the output
  CSS matches the three-block shape in 03 including the `@supports` split; `tokens.json`
  has one flat map per context; a nested `data-theme="day"` scope inside a night root
  resolves day colours in Chrome, Firefox and Safari. Also record: whether
  `@terrazzo/plugin-css` can produce the shape by configuration alone, and whether
  `a11y/min-contrast` evaluates every context. Fail: fall back to Style Dictionary 5 or a
  plain script over the same JSON; the token files do not change.
- [ ] **S3 — The reading change without GSAP.** ∥
  Port only the in-place change (both directions) from `proto-matrix.js` to the Web
  Animations API against the prototype's markup, in a scratch worktree. Pass: the six
  rapid-press patterns in `MATRIX-NOTES.md` ("extra.mjs … Rapid changes") settle correctly;
  reduced motion switched on mid-change ends it cleanly; nothing is left styled, scrambled
  or `aria-busy`. Time box: if it is not passing after the second working session, the
  browser's own mechanisms have proved insufficient in the sense of decision Q6: record
  why and choose bundled GSAP (05). That is the only route to GSAP.

**Exit:** three written results; 06 and 02 amended if a fallback was taken.

## Phase 1 — Foundation

Goal: an empty but real package. Tokens build, gates run, CI is green, TOMBO is frozen.

- [ ] **1.1 Freeze TOMBO and retire its pages.** Read 08 ("Freezing TOMBO").
  Create branch `tombo` at the current `main`; add the closing paragraph to its README.
  Pushing the branch needs wadakatu's go-ahead. **[wadakatu]** then protects it, changes
  the Pages source from `main` to "GitHub Actions" and unpublishes the site (decision Q7:
  no stub, no redirect).
  Accept: the branch exists on the remote at the expected commit; the Pages source is no
  longer a branch; `https://www.wadakatu.dev/tombo/` no longer serves TOMBO.
- [ ] **1.2 Clear `main` and scaffold.** Depends on 1.1 being confirmed.
  Remove TOMBO's shipped files, examples, scripts and tests from `main` (they remain on the
  `tombo` branch). Move `docs/superpowers/` and TOMBO's reference docs to
  `docs/history/tombo/` with a one-paragraph index. Create the layout in 01, `package.json`
  (`@wadakatu/matrix`, `1.0.0-alpha.0`, `"private": true` because nothing is published to
  npm, `engines.node >=22.12`, repository fields written as `wadakatu/matrix`), `mise.toml`,
  `LICENSE` with the logo carve-out, `assets/logo/` (the designer's file copied byte for
  byte from the portfolio, its sha256, and the notice of decision Q3: not MIT, not for
  reuse), `README.md`, `AGENTS.md` and `CLAUDE.md` (07), `CHANGELOG.md`.
  Accept: `npm ci` on a clean clone succeeds; `npm pack --dry-run` lists only intended
  files, and the logo is not among them; `AGENTS.md` is under 100 lines and every command
  in it runs; after the merge `https://www.wadakatu.dev/tombo/` still serves nothing.
- [ ] **1.3 Tokens.** Read 02 in full.
  Author `base.tokens.json`, the four context files and the resolver with every token and
  value in 02, each with a `$description` and its contrast declaration. Build
  `tokens.css`, `tokens.json`, `tokens.d.ts` by the route S2 chose.
  Accept: every hex in 02's value table appears in the output for its context; the CSS has
  the shape in 03; no token lacks a description.
- [ ] **1.4 Gates.** Read 02 ("Gates"), 05 ("Performance").
  Token validity, contrast (with self-test, ceiling and the APCA advisory column), golden
  values, no raw values, unknown token, freshness, Baseline ledger, package contents,
  version consistency. One entry point, `npm run check`.
  Accept: each gate is shown failing on a deliberate violation and passing without it; the
  contrast gate's output reproduces table M2 in `10-verification-log.md` to two decimals.
- [ ] **1.5 Fonts.** Read 02 ("Type"), 03 ("Language").
  `fonts.css` with `@font-face` for IBM Plex Mono 400/500/700, M PLUS 1 Code 400/500 and
  DotGothic16 400, pointing at Fontsource files with their unicode-range subsets,
  `font-display: swap`.
  Accept: a specimen page in Japanese and English loads with zero requests to another
  origin; only the subsets the page uses are fetched (network log attached).
- [ ] **1.6 Reset, base, utilities.** Read 04 ("Foundations"), 05 ("Focus").
  The layer statement, reset, base typography with the `:lang(ja)` rules, focus ring,
  `.mx-frame`, `.mx-vh`, `.mx-skip`.
  Accept: a bare specimen page renders text in all four contexts; focus is visible on
  every focusable element in each.
- [ ] **1.7 CI.** One workflow: `npm run check` on every push and pull request; the
  browser jobs are added by the tasks that create them.
  Accept: a pull request with a raw colour in a component file fails CI.

**Exit:** `npm run build` and `npm run check` green in CI; TOMBO is frozen on its branch
and `/tombo/` serves nothing.

## Phase 2 — Storybook and chrome

Goal: the harness every later component uses, and the page frame.

- [ ] **2.1 Storybook.** Read 06.
  Storybook on the framework S1 chose; the five toolbar globals mapped to root attributes;
  the fixture corpus; the Welcome page; Foundations pages generated from `tokens.json`;
  accessibility at `error` with the WCAG 2.2 tags; `npm run test:stories`.
  Accept: switching each global changes the rendered story; a story with a deliberate
  contrast violation fails `test:stories`; the colour page shows the same ratios as the gate.
- [ ] **2.2 Visual harness.** Read 06 ("Testing through stories"), 08 (what carries over).
  Playwright in the pinned Docker image against the static build; fonts from the lockfile;
  animations disabled during capture; baselines committed; CI job with a diff artefact on
  failure. Port the method from TOMBO's `scripts/test_visual.sh` and `tests/visual/` on
  the `tombo` branch.
  Accept: a one-pixel change to a story fails the job and uploads the diff; a missing
  baseline fails rather than being created.
- [ ] **2.3 Head, Layout, `mx-root`.** Read 03 in full.
  The pre-paint script and its `Head` component; `Layout`; the controller for theme,
  palette, motion and flag-carrying links, including the head script's fallback when the
  controller is absent.
  Accept: the flag table in 03 holds, tested for every flag; storage that throws changes
  nothing visible; with the controller blocked, links still carry `palette` and `motion`;
  no flash of the wrong theme on a `day` reload (trace attached); the palette is in no
  storage after any sequence of changes (decision Q4). The Mark uses the real logo from
  `assets/logo/`.
- [ ] **2.4 Header, Mark, Logo, Nav, Menu, Control, the two toggles, Hold rain, Footer.** ∥ Read 04, 05.
  Accept: header is 69px at 1440 and 53px at 320–719 in both readings (the prototype's
  measured heights); the menu's behaviours in `MATRIX-NOTES.md` ("The phone header …
  Checks") pass; tab order at 1440 matches the prototype's; Hold rain is present in both
  readings; definition of done (04) for each.
- [ ] **2.5 Panel, Lede, Figures, Inline list, Log, Meta, Status, Moved, Language link.** ∥
  Accept: definition of done for each.
- [ ] **2.6 Chrome strings.** `strings/en.ts` and `strings/ja.ts` for every string in the
  chrome. Accept: no component contains a literal user-facing string; the `Japanese`
  stories render with no English chrome. The `ja` strings are then shown to wadakatu; his
  review is needed before `1.0.0`, not before later tasks.

**Exit:** a specimen page with header, panels and footer passes accessibility, visual and
no-JavaScript checks in all four contexts and both languages.

## Phase 3 — Signature

Goal: the things that make it matrix. Read 04 ("Signature", and the specifications), 05
("Motion") before any task here.

- [ ] **3.1 `lib`: seeded layout and corpus helpers.** The generator, chunking, rain
  columns, curtain slabs, glyph pools, the name mask, Japanese-run splitting; all pure, all
  taking data as arguments; the film-name filter.
  Accept: unit tests with `node --test`; the same seed and corpus give byte-identical output.
- [ ] **3.2 Rain, and Hold.** Accept: the density rules at 1100 and 720; the `band`
  variant; the still; held state with and without scripts; a palette then theme change
  while held does not freeze the page (port `docs/design-explore/hold-recolor.mjs`); at
  most 170 animating elements on any specimen.
- [ ] **3.3 Name.** ∥ Accept: masked from 720px, solid below, terminal line in 機械用; one
  `h1` in every reading.
- [ ] **3.4 Stream and Streams.** ∥ Accept: rows and wall; hover and focus hold a stream;
  the whole stream is outlined when its link has focus.
- [ ] **3.5 Switch.** Accept: the three drawings in 04 (`brace` and `bits` are not ported,
  decision Q5); the compact button is one tab stop named by its destination; forced
  colours; the drop stops under Hold in both readings (the gap described in 05).
- [ ] **3.6 Readings and the change between them.** Uses S3's result. Accept: every way of
  switching in `MATRIX-NOTES.md` arrives at the right address, title, status and focus; the
  six rapid-press patterns; the shortcut's guards and its off switch, reachable in both
  readings; reduced motion mid-change.
- [ ] **3.7 Boot and Curtain.** Accept: the four ways to skip; ends by itself; never
  outlasts the failsafe; fails open with every other script blocked; once per tab; the
  frozen still shows only settled text; a flash check of the full sequence (05).
- [ ] **3.8 Decode and the three rewards.** ∥ Accept: off with reduced motion and while
  held; nothing left behind after each.
- [ ] **3.9 Scan lines.** ∥ Accept: under the status line; logo and filled controls lifted.

**Exit:** specimens "Human home" and "Projects" match the prototype's stills at 1440 and
390 in phosphor-night and operator-night, differences listed.

## Phase 4 — Terminal

Read 04 ("Terminal"), and `MATRIX-NOTES.md` sections "機械用 as a shell", "The login
neofetch on a phone" and "Machine first".

- [ ] **4.1 The contract and the renderer.** Types for items, effects and the interpreter;
  the one renderer used at build time and at runtime; the demo interpreter.
  Accept: recorded and live output for the same items are identical markup; typed markup
  and typed URLs are printed as text, never as elements or links (tests from the notes).
- [ ] **4.2 `mx-terminal`: line editor, cursor, history, completion, keys.**
  Accept: the key list in 04; Tab leaves the field in the three documented cases; keys
  ignored during composition; Ctrl+C left to the browser with a selection.
- [ ] **4.3 The viewport.** One viewport at 1440×900, 960×700, 390×844 and 320×568; height
  follows `visualViewport`; rows give way while a keyboard is up; the lock releases under
  480px without a keyboard (05); the fallback to the recorded session after
  `motion.shell.fallback`.
  Accept: the prototype's viewport checks, plus the release rule, plus a late-arriving
  element taking the viewport back.
- [ ] **4.4 Guide, Chips, Status line, Fetch card, Login card, Swatches, Run, Takeover.** ∥
  Accept: definition of done; guide dismissal remembered for the tab (03); on touch nothing
  takes focus on arrival and chips run without moving focus.

**Exit:** specimen "Machine landing" works as a recorded session without scripts and as a
live shell with them, and matches the prototype's stills at 1440 and 390.

## Phase 5 — Reading

Read 04 ("Reading", "Prose"), `MACHINE-FIRST-AND-BLOG.md` section 3.

- [ ] **5.1 Masthead, Contents, Post foot, Share, Index.** ∥ Accept: rail from 1100px and
  disclosure below; current section marked; share sheet only where it exists.
- [ ] **5.2 Prose and Code block (approved core).** Accept: the type table in 04; measured
  characters per line within one of the prototype's figures at 390, 768, 1100, 1440; Shiki
  colours follow all four contexts.
- [ ] **5.3 Drafts: code title, diff, callout, details, table, task list, footnotes.**
  Designed here from existing tokens. Accept: shown to wadakatu in Storybook and approved
  before they are marked anything but `draft`; diff is readable without colour.
- [ ] **5.4 Print layer for articles.** Accept: no rain, no chrome, dark ink on white,
  link addresses printed.

**Exit:** specimen "Article" renders both prototyped posts' structure (with fixture text)
and passes every automated row of the verification matrix in 05.

## Phase 6 — Proof and publication

- [ ] **6.1 Specimens complete**: machine landing, human home, both Projects readings,
  article, blog index, moved, 404, offline. `npm run test:specimens` covers no-JavaScript,
  keyboard journeys, print and forced colours.
- [ ] **6.2 The verification matrix** (05), automated rows in CI, manual rows done once
  and written up in `docs/verification/1.0.md`: VoiceOver (macOS, iOS), NVDA, real iOS
  Safari and Android Chrome with the on-screen keyboard, Safari and Firefox, 200% text and
  400% zoom, Japanese reading. Each finding is fixed or listed as a known limitation.
- [ ] **6.3 Performance budgets** measured and recorded; ceilings set (05).
- [ ] **6.4 Agent layer complete.** Read 07. Every component page; `components.json`;
  `llms.txt`, `llms-full.txt`; the skill; the consumer stylelint config; all freshness checks.
  Accept: a fresh agent session given only `AGENTS.md` can answer "which component renders
  a key and value list, and which tokens does it read" from the files.
- [ ] **6.5 Publish the Storybook.** Depends on the DNS gate, not on the rename. Read 06
  ("Hosting"). **[wadakatu]** OKs the record, saves `matrix.wadakatu.dev` as the custom
  domain in Pages settings, then creates the `CNAME`. Only then is the deploy job added to
  the workflow. It publishes Storybook with `llms.txt`, the Markdown mirrors and the token
  files beside it (06).
  Accept: `https://matrix.wadakatu.dev/` loads over HTTPS from a clean browser profile;
  `/llms.txt` and one `.md` mirror resolve; no deployment of this repository is reachable
  under `www.wadakatu.dev`.

**Exit:** every automated check green; the manual report committed; Storybook public.

## Phase 7 — Release and adoption

- [ ] **7.1 Release candidate.** Tag `v1.0.0-rc.1`; CI builds, checks, packs and attaches
  the tarball and the Storybook archive to a GitHub Release. That Release is the
  distribution (decision Q2); nothing is published to npm.
  Accept: `npm install <the tarball's URL>` in an empty project succeeds and the lockfile
  records its integrity hash.
- [ ] **7.2 Portfolio migration.** A separate issue and pull requests in wadakatu.github.io,
  following 08 ("How wadakatu.github.io consumes matrix"): the tarball dependency and
  layout first under `/proto/matrix/`, then production routes (English at the root,
  Japanese under `/ja/`, decision Q8), then deletions, service worker and agent files.
  Nothing is added for `/tombo/` (decision Q7). Best started after the rename, so that the
  tarball URL it pins is the final one. Anything matrix lacks is fixed in matrix and
  released, not patched in the site.
- [ ] **7.3 `1.0.0`.** When the portfolio is live on a release candidate, no component is
  still `draft` without wadakatu's approval, and he has reviewed the Japanese chrome
  strings. **[wadakatu]** tags.

## Dependencies at a glance

```
S1 ─┐
S2 ─┼─ Phase 1 ── Phase 2 ─┬─ Phase 3 ── Phase 4 ─┐
S3 ─┘                      └─ Phase 5 ────────────┼─ Phase 6 ── Phase 7
                                                  │
DNS gate [wadakatu] ───────────── must precede 6.5
rename [wadakatu] ─────────────── any time after 1.1; best before 7.2
```

Phases 3 and 5 can run at the same time after Phase 2. Phase 4 needs 3.6 (the readings)
and 3.2 (the rain overlay).

## What would make this plan wrong

Recorded so that whoever executes it knows when to stop and come back to the design.

- S1 fails and the fallback also cannot keep one source of markup.
- A no-JavaScript requirement turns out to conflict with the custom-element approach for
  some component (none is known).
- Real-device testing shows the one-viewport shell is not usable with an on-screen
  keyboard. The prototype never ran on a phone.
- A screen reader finds the shell's log or the takeover unusable. Not yet tested by anyone.
- The DNS record for `matrix.wadakatu.dev` is not approved. The Storybook then has no
  public address, because the path under `www.wadakatu.dev` was decided against (Q1), and
  hosting comes back to wadakatu.
