# 01 — Architecture

How matrix is built, packaged and consumed. One repository, one package, four layers.

## Shape in one paragraph

matrix is a single package, `@wadakatu/matrix`, built from this repository. It has the
shape of an npm package and is installed with npm, but it is distributed as a tarball on
GitHub Releases and is not published to the npm registry. Design
tokens are authored as DTCG 2025.10 JSON and compiled to CSS custom properties. Components
are defined by an HTML contract and styled by plain CSS in cascade layers. Behaviour is
added by light-DOM custom elements that upgrade server-rendered markup. Astro components
render the canonical markup and are what wadakatu.dev imports. Storybook renders those same
Astro components and is the public face of the system.

## The four layers

Each layer depends only on the layers above it in this table. Nothing depends on Astro
except the last layer.

| Layer | What it is | Source | Shipped as | Works without |
| --- | --- | --- | --- | --- |
| **1. Tokens** | Every value: colour roles per context, type, space, motion, layers | `tokens/*.tokens.json`, `tokens/matrix.resolver.json` | `dist/tokens.css`, `dist/tokens.json`, `dist/tokens.d.ts`, and the JSON sources | everything else |
| **2. CSS** | Reset, base typography, one stylesheet per component, effects | `src/**/*.css` | authored files and one flattened `dist/matrix.css` | JavaScript, Astro |
| **3. Elements** | Behaviour as light-DOM custom elements (`mx-*`) | `src/**/mx-*.ts` | ESM in `dist/elements/` | Astro |
| **4. Astro** | The reference renderer: `.astro` components that emit the HTML contract | `src/**/*.astro` | `.astro` source files | — |

Pure build-time helpers (the seeded rain layout, text chunking, the name mask, glyph pools)
sit beside the layers in `src/lib/` and are shipped as ESM. They take data as arguments and
hold none of their own (law L1).

### Why an HTML contract first

Every component is specified as markup: elements, classes, ARIA and `data-*` attributes.
The CSS styles that markup. The custom element, where there is one, upgrades it. The Astro
component is one way to produce it.

This is what the prototype already does and what TOMBO did, and it is what makes three
requirements cheap:

- **No JavaScript.** 機械用 without scripts is a recorded session, the reading switch is two
  links, the menu is a native `<details>`, Hold rain is a checkbox. That only works if the
  full markup exists at build time.
- **Runtime-rendered output.** The live shell prints into the page. Astro's scoped styles do
  not match elements a script creates (noted in the portfolio's `CLAUDE.md`), so component
  CSS must be global.
- **A second renderer.** Storybook, tests, and an agent writing a new page can all produce
  the contract without Astro.

### Why light-DOM custom elements

Behaviour ships as custom elements that wrap server-rendered markup and do not use shadow
DOM: `<mx-terminal>` contains the recorded session and takes it over when it connects.

- The element's lifecycle (`connectedCallback`) replaces the prototype's hand-rolled
  initialisation flags (`.js`, `.enhanced`, `.term`, `.term-off`, `needs-js`). "Has this
  upgraded?" becomes the platform's `:defined` selector.
- Markup inserted later (terminal output, a story mounted by Storybook) upgrades by itself.
- No shadow DOM means the global token and layer cascade applies with no extra theming API,
  and no-JavaScript rendering needs no declarative shadow DOM.
- No library is needed. Lit's value is shadow-DOM templating, which is not used here.
  (`@astrojs/lit` is also deprecated since Astro 5:
  <https://docs.astro.build/en/guides/integrations-guide/lit/>.)

Elements are written in TypeScript against the DOM, with no runtime dependency.

## Repository layout (target)

```
matrix/
├── tokens/
│   ├── matrix.resolver.json         # the one modifier: context (4 contexts)
│   ├── base.tokens.json             # context-free scales
│   └── context/
│       ├── phosphor-night.tokens.json
│       ├── phosphor-day.tokens.json
│       ├── operator-night.tokens.json
│       └── operator-day.tokens.json
├── src/
│   ├── css/                         # index.css (layer order), reset.css, base.css, utilities.css
│   ├── components/<name>/           # co-located: <name>.css, mx-<name>.ts, <Name>.astro,
│   │                                #   <Name>.stories.ts, <name>.md
│   ├── effects/<name>/              # same shape: rain, boot, curtain, decode, scanlines, …
│   ├── lib/                         # pure helpers: rng, chunk, rain layout, etch mask, glyph pools
│   ├── head/                        # the pre-paint script and its Astro wrapper
│   ├── fonts/                       # @font-face CSS that points at Fontsource files
│   ├── strings/                     # chrome strings: en.ts, ja.ts
│   └── specimens/                   # full pages with fixture data (dev only; not exported)
├── assets/logo/                     # the mark and its notice (not MIT; see 08)
├── .storybook/
├── docs/                            # reference docs (generated index + hand-written guides)
├── skills/matrix/                   # the Agent Skill (07)
├── scripts/                         # gates: contrast, size, freshness, package contents
├── tests/                           # Playwright: visual, behaviour, no-JS, print, forced colours
├── AGENTS.md  CLAUDE.md  llms.txt  llms-full.txt
└── package.json  terrazzo.config.ts  stylelint.config.mjs  mise.toml
```

Co-location by component is deliberate: everything about the switch (contract, CSS,
behaviour, renderer, stories, prose docs) is one directory. It is the layout Nord uses for
its public Storybook ("stories live next to component source",
<https://nordhealth.design/updates/march-2026-storybook-playground>), and it is the cheapest
structure for an agent to load.

## Package surface

One package, with subpath exports. Names are final; file extensions are illustrative.

| Import | Gives | Used by |
| --- | --- | --- |
| `@wadakatu/matrix/tokens.css` | Custom properties for all four contexts | any page |
| `@wadakatu/matrix/tokens.json` | Resolved values per context, flat | OG image and icon generators, tests, Shiki |
| `@wadakatu/matrix/tokens/*` | DTCG sources and the resolver | other token tools |
| `@wadakatu/matrix/css` | Everything: tokens, reset, base, all components and effects | the site layout |
| `@wadakatu/matrix/css/<name>.css` | One component's stylesheet | self-contained pages (offline, 404) |
| `@wadakatu/matrix/fonts.css` | `@font-face` for the three families, self-hosted | the site layout |
| `@wadakatu/matrix/elements` | Defines every `mx-*` element | the site layout |
| `@wadakatu/matrix/elements/<name>` | Defines one element | pages that need one |
| `@wadakatu/matrix/astro` | Astro components | site pages |
| `@wadakatu/matrix/head` | The pre-paint script (string) and its flag contract | the site `<head>` |
| `@wadakatu/matrix/lib` | Build-time helpers | site data files |
| `@wadakatu/matrix/strings` | Chrome strings, `en` and `ja` | site layout |
| `@wadakatu/matrix/stylelint` | Consumer lint config (drift checks, 07) | the site's CI |

Docs (`docs/`, `llms.txt`, `llms-full.txt`, `skills/`, `AGENTS.md`) are included in the
tarball, so an agent working in the consuming repository reads documentation that matches
the installed version from `node_modules/@wadakatu/matrix/` (07).

Astro components are published as source, which is Astro's documented way to ship
components (<https://docs.astro.build/en/reference/publish-to-npm/>). Peer range:
`astro ^5.5.3 || ^6 || ^7` (the portfolio is on `^5.16.7`; 5.5.3 is the floor of
`@storybook-astro/framework`).

## Cascade layers

One layer statement fixes the order; every file declares the layer it belongs to.

```css
@layer mx.reset, mx.tokens, mx.base, mx.components, mx.effects, mx.utilities;
```

- Consumer CSS written outside any layer wins over all of matrix without specificity fights.
  This is TOMBO's rule and it carries over unchanged.
- `mx.effects` sits above `mx.components` because an effect's reduced-motion still must be
  able to override a component's animation.

## Naming

| Thing | Rule | Example |
| --- | --- | --- |
| Token ID (DTCG) | dotted, lower-kebab segments, role-named | `color.text-muted`, `motion.wipe.duration` |
| Custom property | `--mx-` + token ID with dots as hyphens | `--mx-color-text-muted` |
| Class | `.mx-<component>`; parts are `.mx-<component>-<part>` | `.mx-terminal`, `.mx-terminal-screen` |
| Variant | a `data-variant` / `data-size` attribute, never a modifier class | `<span class="mx-switch" data-variant="capsule">` |
| State | a real attribute: ARIA, native, or `data-*`. Never a class | `[aria-current]`, `[open]`, `[data-rain="held"]` |
| Custom element | `mx-<component>` | `<mx-terminal>` |
| Root state | `data-*` on `<html>` (see 03) | `data-theme`, `data-palette`, `data-reading`, `data-motion` |
| Event | `mx:<name>`, bubbling `CustomEvent` | `mx:reading`, `mx:bootend` |
| Storage key | `mx-<name>` | `mx-theme` |
| Astro component | PascalCase, no prefix | `Terminal`, `Switch`, `Rain` |

`mx` is already the prototype's own prefix (`mx:view`, `mxEndBoot`, `#mx-world`).
State-as-attribute is also the prototype's habit and it is what makes the no-JavaScript and
forced-colours paths work: the CSS keys on the same attribute that assistive technology reads.

## What stays in the site

| In matrix | In wadakatu.github.io |
| --- | --- |
| Terminal chrome, line editor, key handling, output renderer, viewport fit, the takeover screen | The shell: file system, commands, pipes, completion data, `vim`, jokes, the ELF program |
| The interpreter contract (04) and a demo interpreter for stories and tests | The real interpreter and its build-time world |
| Rain layout, streams, the name mask builder, glyph pools | The corpus they are fed |
| The readings layout, switch, in-place change, shortcut, status announcement | Routes, canonical rules, redirects, SEO, JSON-LD |
| Prose, code block, contents, masthead, pager | Markdown, content collections, alt text |
| Chrome strings in `en` and `ja` | Page copy |
| Logo usage rules and sizes | Favicons, PWA icons, OG images (generated from `tokens.json`) |

## Build

Three steps, no bundler of our own.

1. **Tokens**: Terrazzo (`tz build`) reads the resolver and writes `tokens.css`,
   `tokens.json`, `tokens.d.ts` (02).
2. **Elements and lib**: `tsc` emits ESM and declarations.
3. **CSS**: authored files are shipped as they are. A small script concatenates them in
   layer order into `dist/matrix.css` for the size gate, Storybook and non-bundler use.

Generated files in `dist/` are not committed. Generated documentation (`docs/tokens.md`,
`llms-full.txt`, the component index) is committed and checked for freshness in CI, as
TOMBO's `build_agent_docs.py --check` does today.

Toolchain: Node `>=22.12` (Storybook 11's floor; pinned in `mise.toml`), npm, TypeScript.
No CSS preprocessor: native nesting is Baseline widely available (since 2026-06-11,
`web-features` 3.46.0).

## Distribution and versioning

- **GitHub Releases only; no npm publish** (decision Q2). CI attaches the `npm pack`
  tarball to a GitHub Release, and the site installs it by its URL, which npm supports and
  pins by integrity hash in the lockfile
  (<https://docs.npmjs.com/cli/v11/using-npm/package-spec/>). `package.json` sets
  `"private": true`, so that an accidental `npm publish` is refused
  ([npm docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#private));
  `npm pack` is not affected by it. The name `@wadakatu/matrix` is kept because it is the
  directory under `node_modules/` and the specifier in every import.
- **Versions start at 1.0.0-alpha.** This repository already carries TOMBO's tags `v0.1.0`
  to `v0.14.1`. matrix is the breaking successor in the same repository, so its tags start
  at `v1.0.0-alpha.1` and can never collide with or be mistaken for a TOMBO release.
- **Semver for a design system.** Major: a token, class, element, attribute or export is
  removed or renamed, or the HTML contract of a component changes. Minor: a new token or
  component, or a deliberate visual change (with before/after stills in the release notes).
  Patch: a fix that restores documented behaviour. Until 1.0.0 the alphas may break freely.
- **Releases are tag-driven and hand-written.** `npm version` creates the tag; CI builds,
  runs every gate, packs and creates the GitHub Release with the tarball attached.
  `CHANGELOG.md` and `docs/upgrading.md` are written by hand, because an upgrade note for a
  design system is prose a person needs, not a list of commit subjects.

## Standard practice, and where this design departs from it

| Topic | Standard practice | This design | Why |
| --- | --- | --- | --- |
| Token source | DTCG JSON compiled to CSS variables ([DTCG 2025.10](https://www.designtokens.org/tr/2025.10/), [Terrazzo](https://terrazzo.app/docs/), [Style Dictionary](https://styledictionary.com/info/dtcg/)) | Same | — |
| Token tiers | primitive → semantic → component ([Primer](https://primer.style/product/primitives/), Material 3) | Semantic roles and context-free scales; no colour primitive tier | The four contexts are hand-tuned sets, not steps on a shared ramp; a primitive tier would add about 48 single-use names (02) |
| Component tech for Astro | Astro components, optionally web components ([Astro docs](https://docs.astro.build/en/guides/framework-components/)) | Astro components + light-DOM custom elements over an HTML contract | No-JS parity and runtime-printed output (above) |
| Versioning tool | Changesets, as the research suggests ([docs](https://changesets.dev/guide/getting-started)) | Tag-driven release, hand-written changelog | One package, one maintainer; a changeset file per change is process without a reader. Revisit when there is a second contributor |
| Distribution | A package on the npm registry | The same package as a GitHub Release tarball, installed by URL; nothing on the registry | wadakatu's decision (Q2). One consumer, which pins an exact version either way |
| Vendoring (TOMBO's rule) | TOMBO was vendored on purpose: one CSS file, no registry | Not carried over | matrix is tokens + CSS + elements + Astro components + fonts; copying that by hand out of a tag is the drift TOMBO's sha256 pin existed to catch |
| Motion library | The prototype loads GSAP from a CDN with SRI | No third-party runtime request. The Web Animations API and CSS; GSAP bundled from npm only if they prove insufficient (decision Q6, 05) | Removes a failure mode and a licence that is not open source (GSAP: "Standard 'no charge' license", per `npm view gsap license`) |

## Risks carried by this architecture

| Risk | Mitigation |
| --- | --- |
| Storybook for Astro is a community framework | Spike with pass/fail criteria before any component work; documented fallback (06) |
| Terrazzo is younger than Style Dictionary | Token source is standard DTCG, so the compiler is replaceable; the custom emitter is small (02) |
| Custom elements without a library means hand-written lifecycle code | Elements are thin: one job each, state on attributes, logic in pure functions that are unit-tested with `node --test` |
| The Astro peer range spans three majors | CI builds the specimens on the portfolio's major (5) and on the current one |
