# matrix — design set

The design for turning this repository (today `tombo`) into **matrix**, wadakatu's personal
design system and the source of truth for wadakatu.dev.

- **Status:** proposed, 2026-11-15. Awaiting wadakatu's review of the open questions below.
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
| 06 | [Storybook](06-storybook.md) | Stack, organisation, testing, and the hosting options |
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
8. A public **Storybook renders the real Astro components**; it starts at `www.wadakatu.dev/matrix/` and can move to a sub-domain with one variable.
9. Agents get docs **inside the installed package**, so documentation always matches the version in use, plus lint rules that fail on a raw colour.
10. TOMBO is frozen on a branch, matrix versions start at `1.0.0-alpha`, and the portfolio migrates in its own pull requests.

## How the approved direction is honoured

| Approved | In this design |
| --- | --- |
| Phosphor green default, Operator palette | Two palettes, four tuned contexts, values unchanged from the prototype (02). Law L7 |
| Day / night | `data-theme`, night first; one `light-dark()` pair per role (03) |
| Logo: `logo-400.png`, shape unchanged, recolour allowed | Law L5; the tint is the one palette-and-theme rule (03); rights and derivatives in 08 |
| Machine-first terminal top | The "Machine-first landing" pattern and the Terminal component (04); the route table (08) |
| 人間用 at `/human/` | The "Twin routes" pattern (04); `data-reading` (03) |
| Readable blog pages, no rain over the article body | Law L2; Prose and the `band` rain (04) |
| JA and EN as separate pages | Law L6; `:lang()` typography and chrome strings in both languages (03) |
| A public Storybook | 06, with hosting options that do not assume a sub-domain |

## Open questions for wadakatu

Each has a recommendation. Work can start with the defaults; only Q3 has none.

| # | Question | Recommendation | Default if unanswered |
| --- | --- | --- | --- |
| **Q1** | **Where is the Storybook hosted?** A: `www.wadakatu.dev/matrix/` (no approval needed). B: `matrix.wadakatu.dev` (needs a DNS `CNAME`). C: Chromatic. D: another host. See [06](06-storybook.md#hosting) | Start on A, move to B. B is a separate origin, so the portfolio's service worker and storage cannot touch it, and the address survives a rename | A |
| **Q2** | **Publish `@wadakatu/matrix` to npm?** Needs a one-time trusted-publisher setting on your npm account, after the rename | Yes | GitHub Release tarballs, installed by URL |
| **Q3** | **The logo.** May Chisato Satoh's file live in this public repository under a "not MIT, not for reuse" notice (it is already public in the portfolio repository)? Has she seen the amber tint used in operator-night? Are downscaled copies for the header acceptable? | Ask her; keep the file out of the npm package either way | None. A labelled placeholder is used until answered |
| **Q4** | **Should the palette be remembered?** Approved behaviour: never stored, carried by the address, which needs link-rewriting machinery. Alternative: remember it for the tab (`sessionStorage`) and reflect it in the address; simpler, slightly different semantics | Keep the approved behaviour unless the simpler one appeals | As approved |
| **Q5** | **Drop the `brace` and `bits` switch drawings?** Rain is the default and they are used nowhere | Drop from 1.0; they stay in the prototype's history | Dropped |
| **Q6** | **Replace GSAP with the Web Animations API?** Removes the CDN request and a non-open-source licence | Yes, if the port passes the rapid-press tests (spike S3); otherwise bundle GSAP from npm | As recommended |
| **Q7** | **Do TOMBO's public pages stay online?** After the rename `/tombo/` stops resolving (GitHub does not redirect project sites) | A stub at `/tombo/` served by the portfolio; TOMBO preserved as a frozen branch and tags | Stub only |
| **Q8** | **Japanese and English.** Which pages get a twin in the other language, and at what addresses? Should chrome on Japanese pages be Japanese? | English at the root, Japanese under `/ja/`, articles at one address in their own language; Japanese chrome strings shipped and reviewed by you | As recommended |
| **Q9** | **`text-muted` at night** passes WCAG 2 at 9.18:1 but is light for 13px text by APCA (Lc −59) | Keep the colour; forbid it below 13px or under regular weight | As recommended |
| **Q10** | **Storybook 10 or 11?** 11 is in beta, targeted for December | Whichever is `latest` when work starts; the Astro framework supports both | As recommended |

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
- **The logo's terms of use** are not known to this design.
- Several prototype files were described from the build notes rather than read line by
  line, which is why the prototype, not this set, is the behavioural specification.
- **This set has not had an independent review.** One was started and did not finish. What
  was checked mechanically before committing: every colour in 02 against the prototype's
  cascade in all four contexts, every `--mx-*` name against the tokens in 02, every
  question, decision, law, spike and task reference, table structure, internal links, and
  that all 63 external links resolve.

## Where this sits in the repository

TOMBO's own specs and plans live under `docs/superpowers/`. This set is kept apart in
`docs/matrix-design/`, beside its research input, because it founds a different system;
the plan moves TOMBO's history to `docs/history/tombo/` when `main` is cleared (09, task 1.2).
