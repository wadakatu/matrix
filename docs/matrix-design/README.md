# matrix — design set

The design for turning this repository (today `tombo`) into **matrix**, wadakatu's personal
design system and the source of truth for wadakatu.dev.

- **Status:** proposed design, 2026-11-15. wadakatu answered all ten open questions the same
  day; they are recorded below as settled decisions. The one follow-up they raised (N1) is
  settled as well. No question is open.
- **Scope of this step:** design documents only. No implementation code, no rename, no
  push, no pull request. Nothing outside `docs/` in this repository was changed, and the
  prototype worktree was only read.
- **Distilled from:** the approved Matrix prototype in wadakatu.github.io draft PR #116
  (`/proto/matrix/`, branch `design/explore`, head `93ca12d`).
- **Research input:** `docs/matrix-research/` (committed unchanged). It was treated as
  suggestions; what was checked against primary sources, and two corrections, are in
  [10](10-verification-log.md).

## Read in this order

| # | Page | Answers |
| --- | --- | --- |
| 00 | [Principles](00-principles.md) | What matrix is, the seven laws, the vocabulary, what it is not |
| 01 | [Architecture](01-architecture.md) | Layers, repository layout, package surface, naming, build, versioning |
| 02 | [Tokens](02-tokens.md) | The token model, every value, the DTCG format, the compiler, the gates |
| 03 | [Theming](03-theming.md) | Palette, theme, reading, motion and language at runtime; the head script |
| 04 | [Components](04-components.md) | The inventory with status, the complex specifications, the rename maps |
| 05 | [Accessibility and motion](05-a11y-motion.md) | The rules, the motion catalogue, what must be measured before 1.0 |
| 06 | [Storybook](06-storybook.md) | Stack, organisation, testing, and hosting at `matrix.wadakatu.dev` |
| 07 | [Agent readiness](07-agent-readiness.md) | `AGENTS.md`, the skill, `llms.txt`, drift control |
| 08 | [Migration](08-migration.md) | Freezing TOMBO, the rename, the `/tombo/` address, how the portfolio consumes matrix |
| 09 | [Implementation plan](09-implementation-plan.md) | Spikes and seven phases, with acceptance criteria, for a later agent |
| 10 | [Verification log](10-verification-log.md) | Sources, measurements, corrections to the research, what was not verified |

A person deciding whether to approve this needs 00, this page, and the hosting section of
06. An agent implementing it needs 09 and whichever page each task names.

## The design in ten lines

1. One package, `@wadakatu/matrix`, in four layers: **tokens → CSS → custom elements → Astro components**.
2. Components are an **HTML contract** first, so every page works without JavaScript and Storybook can show exactly what the site ships.
3. Tokens are **DTCG 2025.10 JSON**, compiled by Terrazzo, with one resolver modifier of four contexts.
4. Colour roles only, no primitive tier; `--green` becomes `accent`, because in Operator it is amber.
5. Theme is switched by `color-scheme` and **`light-dark()`** (TOMBO's mechanism, kept); palette by an attribute. Night and phosphor are the defaults whatever the OS says.
6. Each text token **declares its own contrast floor**, and CI enforces it in all four contexts. Rain has a contrast *ceiling*.
7. **Every effect has a still**, one Hold control stops all endless motion, and no code is fetched from a third party at runtime.
8. A public **Storybook renders the real Astro components**, at `matrix.wadakatu.dev`, an origin of its own.
9. Agents get docs **inside the installed package**, so documentation always matches the version in use, plus lint rules that fail on a raw colour.
10. TOMBO is frozen on a branch and its public pages are retired; matrix versions start at `1.0.0-alpha` and ship as GitHub Release tarballs, not on npm; the portfolio migrates in its own pull requests.

## How the approved direction is honoured

| Approved | In this design |
| --- | --- |
| Phosphor green default, Operator palette | Two palettes, four tuned contexts, values unchanged from the prototype (02). Law L7 |
| Day / night | `data-theme`, night first; one `light-dark()` pair per role (03) |
| Logo: `logo-400.png`, shape unchanged, recolour allowed | Law L5; the tint is the one palette-and-theme rule (03); rights and derivatives in 08 |
| Machine-first terminal top | The "Machine-first landing" pattern and the Terminal component (04); the route table (08) |
| 人間用 at `/human/` | The "Twin routes" pattern (04); `data-reading` (03) |
| Readable blog pages, no rain over the article body | Law L2; Prose and the `band` rain (04) |
| JA and EN as separate pages | Law L6; English at the root, Japanese under `/ja/` (08); `:lang()` typography and chrome strings in both languages (03) |
| A public Storybook | 06, hosted at `matrix.wadakatu.dev` |

## Settled decisions

The ten questions this design asked, as answered by wadakatu on 2026-11-15. They are
decisions now; the pages named in the last column were brought into line with them.

| # | Question | Decision | Recorded in |
| --- | --- | --- | --- |
| **Q1** | Where is the Storybook hosted? | `matrix.wadakatu.dev`, from the start. The DNS record is a gate (below), not a question | [06](06-storybook.md#hosting), 08, 09 |
| **Q2** | Publish `@wadakatu/matrix` to npm? | No. Distribution is GitHub Releases only: the release tarball, installed by URL | [01](01-architecture.md#distribution-and-versioning), 08, 09 |
| **Q3** | May the logo file live in this public repository? | Yes, with a notice that it is not MIT-licensed and may not be reused | [08](08-migration.md#the-logo), 09 |
| **Q4** | Should the palette be remembered? | No. It is never stored; the address carries it, as in the prototype | [03](03-theming.md#palette-carried-by-the-address) |
| **Q5** | Drop the `brace` and `bits` switch drawings? | Yes, removed. Neither is ported | [04](04-components.md#switch) |
| **Q6** | Replace GSAP? | Animations use the browser's own mechanisms (Web Animations API, CSS). GSAP is bundled only if that proves insufficient | [05](05-a11y-motion.md#no-third-party-motion-code), 09 (S3) |
| **Q7** | Do TOMBO's public pages stay online? | No. `/tombo/` stops being published; no stub and no redirect | [08](08-migration.md#freezing-tombo), 09 |
| **Q8** | Japanese and English addresses | English at the root, Japanese under `/ja/`. A blog post exists only in the language it was written in | [08](08-migration.md#production-routes), 03, 04 |
| **Q9** | `text-muted` at night is light for small text | Made slightly brighter. The value is `#80c194` (02); the amount was confirmed as N1 below | [02](02-tokens.md#changed-from-the-prototype), 05, 10 |
| **Q10** | Storybook 10 or 11? | The latest stable version when implementation starts | [06](06-storybook.md#stack), 09 (S1) |

### Gate, not a question

- **DNS for `matrix.wadakatu.dev`.** The record needs wadakatu's OK before the Storybook
  goes live, and he creates it. Until then the Storybook is reviewed locally and from CI
  artefacts and nothing is deployed. The order of the steps is in
  [06](06-storybook.md#gate-the-dns-record); the plan's task 6.5 waits on it.

### Settled after the ten

N1 was raised by the answer to Q9, which gave a direction and not a value. wadakatu has
since confirmed the value, so N1 is a decision and not a question.

| # | Question | Decision |
| --- | --- | --- |
| **N1** | **Is `#80c194` the right lift for `text-muted` in phosphor-night** (was `#7cbd90`)? Only lightness moves (OKLCH L .742 to .755; chroma and hue kept). On `ground` it goes from 9.18:1, Lc −58.9 to 9.59:1, Lc −61.1; on `panel` from Lc −58.5 to −60.7. The line used is Lc 60, APCA's minimum for content text that is not body text. Operator-night (Lc −62.1, −61.7) and both day contexts already clear it and are unchanged. APCA attaches larger sizes than 13px to that level, so no small lift makes 13px meet its size table; the next level, Lc 75, would need about `#99dbac`, which closes much of the gap to `text` (Lc −92.2). Measurements: [10](10-verification-log.md#m8--the-lifted-text-muted-decision-q9) | Yes. `text-muted` in phosphor-night stays `#80c194`, the value specified in 02 and already built |

One naming change came out of the implementation and was accepted by wadakatu: the article
measure is two tokens, `size.measure.read` (680px, from 720px) and
`size.measure.read-compact` (640px, below 720px), because one token cannot hold two values.
The values are the designed ones. It is recorded in
[02](02-tokens.md#space-size-border), 03 and 04.

Content decisions that belong to the portfolio (the `tombo` project entry, TOMBO jokes in
the shell, the About page, alt text) are listed in [08](08-migration.md#decisions-the-site-needs-from-wadakatu).

## Decisions made in this design

Reversible, and each argued where it is made. Listed so that a reviewer can disagree with
one without rereading everything.

| # | Decision | Where | Departs from the usual practice? |
| --- | --- | --- | --- |
| D1 | Single package, single repository, no monorepo | 01 | No |
| D2 | HTML contract + light-DOM custom elements + Astro components as the reference renderer | 01 | Yes: not shadow-DOM web components, not framework components |
| D3 | No colour primitive tier | 02 | Yes |
| D4 | DTCG 2025.10 with Terrazzo; one flattened `context` modifier | 02 | No (Terrazzo over Style Dictionary because of resolver support) |
| D5 | `light-dark()` for the theme axis, with a night-only fallback | 03 | Yes; TOMBO precedent |
| D6 | Night and phosphor by default; the OS preference is not followed | 03 | Yes; approved direction |
| D7 | Contrast floors declared on tokens; a ceiling for rain; APCA advisory only | 02, 05 | Extends the usual practice |
| D8 | Hold stops all endless motion and is present in both readings | 05 | Fixes a gap in the prototype against WCAG 2.2.2 |
| D9 | No third-party runtime requests: self-hosted fonts, no CDN motion library | 01, 05 | — |
| D10 | Storybook on the community Astro framework, behind a spike with a fallback | 06 | Yes: not a core framework |
| D11 | Self-hosted visual regression in a pinned Docker image; no Chromatic | 06 | Yes; TOMBO precedent |
| D12 | Docs, `llms.txt` and the skill shipped inside the package | 07 | Extends the usual practice |
| D13 | No `DESIGN.md`, no custom MCP server | 07 | — |
| D14 | Tag-driven releases with a hand-written changelog; no Changesets | 01 | Yes; against the research's suggestion |
| D15 | matrix versions start at `1.0.0-alpha`; TOMBO frozen on a `tombo` branch | 01, 08 | — |
| D16 | The terminal is in matrix; the shell (commands, data, jokes) stays in the site | 01, 04 | — |

## What this design is not sure about

Said here rather than discovered later. Details are in [10](10-verification-log.md#not-verified).

- **Storybook for Astro is a community framework.** Everything in 06 depends on spike S1.
- **Nobody has used the prototype with a screen reader, in Safari or Firefox, or on a real
  phone.** matrix inherits no accessibility claim from it; 05 lists what must be measured.
- **The one-viewport shell at high zoom** is handled by a new rule with a guessed threshold.
- **The logo's written terms of use** have not been seen by this design. Where the file
  lives and under what notice is wadakatu's decision (Q3), and the design relies on it.
- Several prototype files were described from the build notes rather than read line by
  line, which is why the prototype, not this set, is the behavioural specification.
- **This set has not had an independent review.** One was started and did not finish. What
  was checked mechanically before the first commit: every colour in 02 against the
  prototype's cascade in all four contexts, every `--mx-*` name against the tokens in 02,
  every question, decision, law, spike and task reference, table structure, internal
  links, and that all 63 external links resolved.
- **The revision that recorded the answers** changed one colour (N1) and re-measured it with
  the tools of the first pass, and re-checked internal links and question and task
  references. It was not reviewed independently either. What it looked up is in
  [10](10-verification-log.md#checks-made-when-recording-the-answers).

## Where this sits in the repository

TOMBO's own specs and plans live under `docs/superpowers/`. This set is kept apart in
`docs/matrix-design/`, beside its research input, because it founds a different system;
the plan moves TOMBO's history to `docs/history/tombo/` when `main` is cleared (09, task 1.2).
