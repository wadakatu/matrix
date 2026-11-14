# Matrix design system — web research

**Date:** 2026-11-15 (Asia/Tokyo). Sources checked the same day.  
**Scope:** Research only. No design or implementation decisions are made here. The list at the end is labeled as research suggestions for a later design pass (Fable), not decisions.  
**Context:** wadakatu is renaming `wadakatu/tombo` to `matrix`, a personal design system for the Astro 5 static portfolio at wadakatu.dev (GitHub Pages). Aesthetic: Matrix-film terminal UI, phosphor green default plus an Operator palette, monospace type, digital rain/scanline motion, interactive terminal, day/night themes, a logo that may be recolored. He also wants a public Storybook.

Every factual claim below has a source URL. URLs were HTTP-checked (`curl -L`); all cited links returned 200 except where a note says otherwise.

---

## 1. Personal / solo design system best practices

### Scope

Solo systems rot when they try to cover every layer a large team would. Michael Dishmon cuts a typical 9–10 layer agency spec to five he actually touches weekly (tokens, typography, components, motion, voice), and promotes a pattern only after it has appeared twice. ([A design system that holds up with one designer](https://michaeldishmon.com/writing/design-system-for-one-person))

Jordan Cheng uses the same “needed in at least two projects” rule for components, plus a quarterly audit that archives unused items. Start with a shared color palette and type scale; extract the first component from real duplication, not anticipated duplication. ([Design Systems for One](https://jordancheng.com/thoughts/design-systems-for-one))

For Matrix, the practical implication is: tokenize and componentize what the portfolio already repeats (terminal chrome, palettes, type, motion, buttons, cards, blog typography). Leave one-off layout numbers hardcoded. ([zeroheight — Token architecture](https://zeroheight.com/learn/token-architecture-building-a-scalable-token-system/))

### Token architecture (primitive / semantic / component)

The common three-tier model:

1. **Primitives (reference):** raw ramps and scales, named by what they are (`green.500`, `space.4`). Never used directly in components.  
2. **Semantic (alias):** named by role (`color.text.primary`, `color.surface.raised`). This is the theming layer. Day/night and phosphor vs Operator should swap here, not in components.  
3. **Component:** only where a component may later diverge (`button.primary.background`). Do not invent these for every part.

References flow one way: primitives → semantics → (optional) component tokens. A primitive used directly in a component is treated as a leak. One source of truth; generate CSS (and anything else) from it. ([Architecting a Design Token System — Arqam Tahir](https://arqamtahir.com/blog/design-token-system-architecture); [zeroheight](https://zeroheight.com/learn/token-architecture-building-a-scalable-token-system/))

Material Design 3 is the most complete public worked example of this cascade (`md.ref` → `md.sys` → `md.comp`). Skipping the semantic tier is the usual structural mistake; building the component tier too early is the second. ([Design Tokens: A Practical Guide for 2026](https://www.themasterly.com/blog/design-tokens) — secondary commentary; prefer the official Material and Primer sources below for the pattern itself.)

GitHub Primer implements the same idea in production: base (raw) → functional (global semantic UI) → component/pattern tokens, consumed as CSS custom properties. ([primer/primitives](https://github.com/primer/primitives); [Primer Primitives](https://primer.style/product/primitives/))

zeroheight notes that a **two-tier** system (globals + components, no aliases) can be enough for a single-platform, small-team product — but theming flexibility (dark mode, alternate palettes) is exactly the cost of skipping aliases. Matrix already has two palettes and day/night, so a semantic tier is the part of the model that earns its keep. ([zeroheight](https://zeroheight.com/learn/token-architecture-building-a-scalable-token-system/))

Dishmon keeps a solo palette tight (he targets under 80 tokens total). That is a maintenance heuristic, not a standard. ([Dishmon](https://michaeldishmon.com/writing/design-system-for-one-person))

### Naming

Semantic, role-based names (`color.action.primary`, `color.surface.raised`) survive a recolor; value-based names (`green.500` used as “the brand”) do not. ([Cheng](https://jordancheng.com/thoughts/design-systems-for-one); [Tahir](https://arqamtahir.com/blog/design-token-system-architecture))

Primer’s public token-name docs are a useful catalog of functional names for UI roles (foreground, background, border, etc.). ([Token names | Primer](https://www.primer.style/product/primitives/token-names/))

CSS custom property output is typically kebab-case (`--color-text-primary`). Keep the source token ID dotted or grouped, and let the compiler rename.

### Theming with CSS custom properties

The established pattern: define primitive variables once; redefine **semantic** variables under a theme selector or media query. Components only read semantic variables.

Open Props documents this explicitly: do not let components reference light- or dark-only primitives; build theme-agnostic aliases (`--text-1`, `--surface-1`) that retarget under `@media (prefers-color-scheme: dark)` and under explicit selectors such as `[data-theme="dark"]` or `.dark`. It also ships a `prefers-reduced-motion` custom media query (`--motionOK` / `--motionNotOK`). ([Open Props](https://open-props.style/))

Style Dictionary’s built-in `css/variables` format emits `:root { --color-background-base: #f0f0f0; }` and lets you override the selector (string or nested array) and optionally keep `var()` references between tokens. ([Built-in formats | Style Dictionary](https://styledictionary.com/reference/hooks/formats/predefined/))

Terrazzo’s CSS plugin maps DTCG resolver “permutations” (mode, size, reduced motion, etc.) onto any selector you write — `:root`, `[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`, `@media (prefers-reduced-motion)`. Aliases must be redeclared in each scope or they keep the parent value; the plugin warns about this “duplication.” ([CSS ⛋ Terrazzo](https://terrazzo.app/docs/integrations/css/))

For web components, custom properties pierce the shadow DOM and are the usual theming API. Nord documents this approach on web.dev, and Open Props ships `:host`-scoped “shadow” builds. ([How Nordhealth uses Custom Properties in Web Components](https://web.dev/articles/custom-properties-web-components); [Open Props](https://open-props.style/))

### Versioning

[Changesets](https://changesets.dev/guide/getting-started) is a Markdown-file workflow for semver and changelogs. It is built for monorepos but officially supports single-package repos. Current docs require Node `^22.11 || ^24 || >=26` and recommend pnpm. The flow is: add a changeset → `changeset version` (bumps and writes the changelog) → review/commit → `changeset publish` (npm publish + git tags; single-package tags are `vX.X.X`). ([Getting Started](https://changesets.dev/guide/getting-started); [Versioning and Publishing](https://changesets.dev/guide/versioning-and-publishing))

### Monorepo vs single package, and how to distribute

There is no universal “best.” A useful split from distribution write-ups:

- **Single package** in the `matrix` repo (tokens + CSS + components + Storybook) is the lowest-overhead starting point for a solo system with one primary consumer (wadakatu.dev).
- **Monorepo** (e.g. `packages/tokens`, `packages/css`, `packages/components`) pays off when packages need independent versioning or when the docs app should depend on a built package the same way consumers will. Changesets is designed for that topology. ([Changesets technical decisions](https://changesets.dev/guide/technical-decisions))
- **npm package** (`@wadakatu/matrix` or similar): versioned releases, standard install, works from the portfolio repo without a monorepo. Best once a second consumer exists or you want a public install story.
- **Git dependency:** npm officially accepts `github:user/repo#ref`, `git+https://…#v1.2.3`, or a commit SHA. ([npm Package spec](https://docs.npmjs.com/cli/v11/using-npm/package-spec/)) This skips the registry, but you lose semver ranges, installs are slower, and CI must be able to clone GitHub. Fine as a temporary path; weaker as a long-term public API.
- **Local / workspace path** (`"matrix": "workspace:*"` or `"file:../matrix"`): best while the portfolio is the only consumer and both repos (or a monorepo) are developed together.
- Git submodules are generally discouraged unless a registry is unavailable.

---

## 2. W3C Design Tokens Community Group format and tooling

### Spec status (as of 2026-11)

The Design Tokens Community Group published the first **stable** specification, **2025.10**, on 2025-10-28: Format, Color, and Resolver modules. It is a W3C Community Group Final Report. It is **not** a W3C Standard and is **not** on the W3C Standards Track. The group’s FAQ still says the core format is stable and safe for production, while the spec continues to be refined. ([Design Tokens Technical Reports 2025.10](https://www.designtokens.org/tr/2025.10/); [Format Module](https://www.designtokens.org/tr/2025.10/format/); [Announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/); [FAQ](https://www.designtokens.org/faq/); [Community Group](https://www.w3.org/community/design-tokens/))

2025.10 adds standardized theming / multi-brand (resolvers), CSS Color Module 4 spaces (including Display P3 and Oklch), and richer alias / inheritance relationships. The format is for **exchange**; it does not dictate your primitive/semantic/component architecture. ([Announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/); [FAQ](https://www.designtokens.org/faq/))

The source repo is [design-tokens/community-group](https://github.com/design-tokens/community-group).

### Style Dictionary

Style Dictionary has had first-class DTCG support (`$value`, `$type`, `$description`) **since v4**. Official docs state that **full 2025.10 support is not there yet** and is being done in **v5**. ([Design Tokens Community Group | Style Dictionary](https://styledictionary.com/info/dtcg/))

Tracking issue [#1590](https://github.com/style-dictionary/style-dictionary/issues/1590) (open, labeled 5.0; last cited activity 2026-10-12) lists remaining work: color/border/shadow and dimension work has landed in 5.3.x; gradient, duration, and especially the **Resolver module** were still incomplete. Multi-dimensional theming can be handled in a layer above SD in the meantime.

v5 is otherwise a small-break migration: Node ≥ 22, stricter token references, and a fixed `{dot.ref}` syntax aligned with DTCG. CSS output remains the `css/variables` format. ([v5 migration](https://styledictionary.com/versions/v5/migration/); [Built-in formats](https://styledictionary.com/reference/hooks/formats/predefined/))

### Terrazzo

Terrazzo is a DTCG-native compiler (CLI: `tz build`, `tz check`, `tz lint`) listed by the DTCG as a reference implementation alongside Style Dictionary and Tokens Studio. ([Announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/); [FAQ adopters list](https://www.designtokens.org/faq/))

`@terrazzo/plugin-css` generates CSS custom properties from DTCG IDs, supports Color Module 4 gamut fallbacks (`srgb` / `p3` / `rec2020` media queries), and maps resolvers to selectors — including reduced-motion and theme permutations. ([CSS plugin](https://terrazzo.app/docs/integrations/css/))

The Getting Started page still contains a comparison line that “support for resolvers and other 2025.10 features [is] coming in 2.0,” which is stale relative to the CSS plugin docs and the v2 changelog (v2.0 advertised full 2025.10 support including resolvers; later 2.x releases exist). Prefer the CSS integration docs over that comparison blurb. ([Getting Started](https://terrazzo.app/docs/); [CSS plugin](https://terrazzo.app/docs/integrations/css/))

Open Props also publishes a DTCG 2025.10 resolver JSON feed, which is a concrete public example of the format. ([Open Props](https://open-props.style/))

---

## 3. Accessibility (neon-on-dark, motion, focus, monospace, Japanese)

**Conformance target for public work remains WCAG 2.2.** WCAG 3 is an incomplete draft that will change; W3C’s current advice is to meet WCAG 2.2 now. ([WCAG 3 Introduction](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/), updated 2026-09-25; [WCAG 2.2](https://www.w3.org/TR/WCAG22/))

### Contrast: WCAG 2.2 first, APCA as a second check

| Criterion | Level | Requirement |
| --- | --- | --- |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) | AA | Text 4.5:1; large text (18pt / 14pt bold, or CJK equivalent) 3:1. Ratios are thresholds; 4.499:1 fails. |
| [1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) | AAA | 7:1 / 4.5:1 large |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast) | AA | UI components, states, and required graphics 3:1 against adjacent colors |

Incidental / disabled / purely decorative text is exempt. **Logotypes are exempt as logos**, but if the logo is also a control (link, button), W3C encourages a sufficient-contrast variant or an equivalent control — brand recoloring does not automatically exempt a low-contrast interactive presentation. ([1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum); [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast))

Important for phosphor-green monospace: WCAG explicitly warns that **thin or unusual fonts**, plus anti-aliasing, can look much fainter than the nominal CSS color and can “pass” on paper while failing in practice. Authors are encouraged to use stronger strokes or to exceed the numeric minimum. The same warning applies to thin non-text lines. ([1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum); [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast))

**APCA** (Accessible Perceptual Contrast Algorithm) is a perceptual contrast method developed for possible use in WCAG 3. The `apca-w3` package is the licensed W3/AGWG-oriented implementation; the library is still marked **beta** (library 0.1.9, algorithm 0.0.98G-4g). The [APCA Readability Criterion](https://readtech.org/ARC/) is a work in progress. Myndex’s own disclaimer: WCAG 2 math does not accurately model perception, so results will disagree; suitability for legal conformance is up to the user. **APCA is not a WCAG 2.2 requirement and does not replace it.** ([apca-w3 README](https://github.com/Myndex/apca-w3); [WCAG 3 intro](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/))

APCA look-up notes (from the same README, May 2022 table): body text should meet the table, with **Lc +15** added for any table value below Lc 75 when used as body text; sub-fluent text may drop Lc 15, never below Lc 30; non-fluent spot text may drop Lc 25, never below Lc 30. Contrast is polarity-aware (light-on-dark ≠ dark-on-light). Useful as a second pass on neon-on-dark pairs that “pass” WCAG 2 but feel thin.

The live demo at `https://www.myndex.com/APCA/` is cited in that README but **did not load** from this environment (connection timed out). Use the GitHub repo and [ARC](https://readtech.org/ARC/) instead.

### Motion, rain, and scanlines

Several criteria apply at once to digital rain, scanlines, and boot animations:

- **[2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) (Level A):** moving, blinking, or scrolling content that starts automatically, lasts more than five seconds, and runs in parallel with other content needs a pause/stop/hide control, unless the movement is essential. `prefers-reduced-motion` alone does **not** replace that control for users who have not enabled the OS setting. A “hold rain” / freeze control is in scope here. If several animations run, one site-wide control is recommended (not required). This SC is a non-interference requirement: a violation anywhere can fail the page.
- **[2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions) (Level AAA):** motion triggered by a user interaction must be disableable unless essential. Sufficient techniques include CSS and JS checks for `prefers-reduced-motion`. ([C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39); [SCR40](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR40))
- **[2.3.1 Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold) (Level A, non-interference):** nothing may flash more than three times in any one second, unless it stays below the general/red flash area thresholds. Looping effects (including canvas rain) should be analyzed while looping, at the largest size a user might see. Fine, balanced patterns with elements smaller than 0.1 degree may fall under the “white noise / checkerboard” exception — do not assume rain qualifies; measure if brightness pulses are large.

[MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) is the CSS query. Honor it by default (disable rain, scanline travel, parallax, long transitions). Still provide an in-page freeze control for 2.2.2. Do not encode essential information only in motion.

Open Props models the CSS side with `@custom-media --motionOK (prefers-reduced-motion: no-preference)` and only attaches animation inside that query. ([Open Props](https://open-props.style/))

### Focus in terminal-like UIs

- **[2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible) (AA):** a visible keyboard focus indicator is required. Do not `outline: none` without a replacement. [C45](https://www.w3.org/WAI/WCAG22/Techniques/css/C45) documents `:focus-visible` so mouse users are not forced into a heavy outline.
- **[1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)** also applies to the focused state: the indicator must be 3:1 against adjacent colors.
- **[2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA):** if you go beyond AA, the indicator should be at least as large as a 2 CSS-pixel perimeter and have a 3:1 **change of contrast** between focused and unfocused pixels. A solid 2px outline is the straightforward path. A two-color indicator ([C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40)) stays visible on both phosphor-dark and day-theme backgrounds.

Terminal UIs often restyle focus as a block caret, inverse video, or a box around a prompt. Those can work if they meet 2.4.7 + 1.4.11 (and 2.4.13 if targeting AAA). A custom focus style that is only a 1px same-hue glow on black is a common failure.

### Monospace readability, including Japanese (CJK)

WCAG’s definition of large-scale text includes “font size that would yield equivalent size for Chinese, Japanese and Korean (CJK) fonts,” because 14/18 point is a Latin typographic convention. ([1.4.3, key terms](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum))

Most Latin monospace webfonts (including [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)) do not include Japanese glyphs. If the fallback is a **proportional** Japanese font such as [IBM Plex Sans JP](https://fonts.google.com/specimen/IBM+Plex+Sans+JP), terminal alignment breaks: CJK characters will not occupy two Latin cell widths.

True monospaced CJK families:

- **Noto Sans Mono CJK** (JP/KR/SC/TC/HK), in [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) under `Sans/Mono`. These are large font files and are typically **self-hosted with unicode-range subsets**, not loaded as a full Google Fonts family.
- **Source Han Mono**, Adobe’s monospaced CJK project. ([adobe-fonts/source-han-mono](https://github.com/adobe-fonts/source-han-mono/))

A typical stack is: chosen Latin/code mono first, then a mono CJK fallback, then `ui-monospace`, then generic `monospace`. Put the CJK mono after the Latin mono so ASCII metrics stay under the Latin face. Default CJK punctuation and fullwidth forms are two cells wide; that is the expected terminal grid.

Open Props’ `--font-monospace-code` stack is Latin-centric and has no CJK mono fallback — a reminder not to copy it unchanged. ([Open Props typography](https://open-props.style/))

Also: letter-spacing on CJK, very tight line-height, and phosphor glow (`text-shadow`) can reduce effective contrast and disrupt Japanese typography. Prefer testing real Japanese copy at body size, not only Latin “green on black” swatches.

---

## 4. Components for Astro, and Storybook

### Framework choice for a static Astro 5 site

Astro is framework-agnostic and uses islands: most of the page is static HTML/CSS; interactivity is opted into per island. ([Islands architecture](https://docs.astro.build/en/concepts/islands/); [Front-end frameworks](https://docs.astro.build/en/guides/framework-components/))

**`@astrojs/lit` was deprecated in Astro 5.0.** Official guidance: import a Lit (or other) custom-element module in a client `<script>` and use the tag in the Astro template. There is no first-party Lit integration to rely on. ([Lit | Astro docs](https://docs.astro.build/en/guides/integrations-guide/lit/))

Practical options for Matrix (research, not a choice):

| Approach | Fit for wadakatu.dev | Storybook path |
| --- | --- | --- |
| **Plain CSS + Astro components** | Lowest friction for a static GitHub Pages site. Tokens as CSS variables; almost no JS on the human-readable pages. Interactive terminal can be a single island or a `<script>`. | Community Astro framework (see below). Newer, narrower official support. |
| **Web components (Lit or vanilla)** | Framework-agnostic, reusable outside Astro, themeable via CSS variables that cross shadow DOM. Lit still works in Astro 5 via a client script, without `@astrojs/lit`. | Official `@storybook/web-components-vite`. |
| **React/Vue/Svelte just for the DS** | Extra runtime on a site that does not otherwise need it. | Official Storybook frameworks, strongest docs/MCP support (especially React). |

A hybrid is common: tokens + presentational CSS everywhere; only the interactive terminal (and similar) as a web component or Astro island.

### Storybook status (Nov 2026)

Storybook **10** is the current documented stable line (docs pages for 10.4, with 10.6 also appearing in version switchers). **Storybook 11 is in alpha.** Accessibility-testing docs: [v10.4 a11y](https://storybook.js.org/docs/10.4/writing-tests/accessibility-testing.md). Web components: official framework [`@storybook/web-components-vite`](https://storybook.js.org/docs/get-started/frameworks/web-components-vite) (Vite ≥ 5). Build output defaults to `storybook-static`.

**Astro support:**

- Community framework: [`@storybook-astro/framework`](https://github.com/storybook-astro/storybook-astro) (site: storybook-astro.org). Requirements cited in that project: Node 20.16+ / 22.19+ / 24+, **Storybook 10.0+**, **Astro 5.5.3+ / 6 / 7**, Vite 6.4.1+ (or 7/8). It server-renders `.astro` via the Container API, supports props/slots, scoped styles, client directives, mixed UI-framework islands, and static `storybook build` with pre-rendered Astro stories. The README notes that `npm create storybook@latest` **does not yet recognize Astro**.
- Official Storybook PR [#37122](https://github.com/storybookjs/storybook/pull/37122) (“Astro: Add init support, doc mention and ecosystem CI sandbox”) was **merged 2026-11-03**. That is very recent; treat official `storybook init` Astro support as newly landing (likely canary / upcoming), and the community package as the production-tested path today.

### Docs (MDX), a11y addon, Chromatic, publishing

- **MDX docs:** [`@storybook/addon-docs`](https://storybook.js.org/docs/writing-docs/mdx). Mix Markdown, CSF stories, and JSX Doc Blocks. Unattached MDX pages work for guidelines (color, motion, “how to use tokens”). Storybook’s MDX runtime is React even when stories are web components or Astro.
- **Accessibility addon:** [`@storybook/addon-a11y`](https://storybook.js.org/docs/10.4/writing-tests/accessibility-testing.md), built on axe-core (Deque says this catches up to 57% of WCAG issues — automated tests are a first pass, not a complete audit). Default rule set is WCAG 2.0/2.1 A/AA plus best practices; you can opt into WCAG 2.2 via `runOnly`. `parameters.a11y.test` can be `'off' | 'todo' | 'error'` for CI. Integrates with the Vitest addon and test-runner. Theme and reduced-motion stories should be in the set Chromatic and a11y run against.
- **Chromatic** (from the Storybook team): visual, interaction, and accessibility tests on stories; also a hosted, versioned Storybook. CLI: `npx chromatic --project-token …`. GitHub Actions docs: [Automate with GitHub Actions](https://www.chromatic.com/docs/github-actions/). Quickstart: [Chromatic for Storybook](https://www.chromatic.com/docs/quickstart/). Official Storybook publish docs recommend Chromatic for review, history, and Composition (CPP level 1). ([Publish Storybook](https://storybook.js.org/docs/sharing/publish-storybook))
- **GitHub Pages / own subdomain:** Storybook is a static app (`npm run build-storybook` → `storybook-static`). Official docs include a GitHub Actions workflow (`actions/upload-pages-artifact` + `actions/deploy-pages`) and classify generic hosts (GitHub Pages, Netlify, S3) as **CPP level 0** — they serve the app but do not get Composition, versioned endpoints, or tight Storybook API integration. Set `base` / `vite.base` to `/` for a user/org site or custom domain, or to `/<repo>/` for a project site; add `.nojekyll` if underscore-prefixed assets are stripped. A host such as `matrix.wadakatu.dev` is a custom-domain / DNS concern (Cloudflare in this project) and would need an explicit OK before any record change.

---

## 5. AI-agent-friendly design systems

### Files agents actually read

| File | Role | Authority |
| --- | --- | --- |
| **AGENTS.md** | Repo-root (and nested) operating manual for coding agents: build/test commands, conventions, “always use tokens / never invent a Button.” No required schema; nearest file wins; user chat overrides. Stewarded by the Agentic AI Foundation under the Linux Foundation. | [agents.md](https://agents.md/); [AAIF](https://aaif.io/projects/agents-md) |
| **CLAUDE.md** | Claude Code’s project instructions (hierarchical, can `@`-import other files). Use for Claude-specific bits; keep portable rules in AGENTS.md to avoid duplication. | Common 2026 practice described alongside the AGENTS.md FAQ |
| **SKILL.md** | On-demand Agent Skill. Progressive disclosure: only `name` + `description` are always in context. | [agentskills.io specification](https://agentskills.io/specification); [Claude Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview); [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) |
| **llms.txt** | Curated Markdown map of a **published docs site**, with links to `.md` versions of pages. v2 revised 2026-08-10. Not a substitute for AGENTS.md. | [llmstxt.org](https://llmstxt.org/) |

### SKILL.md format (open standard)

A skill is a directory whose `SKILL.md` has YAML frontmatter plus Markdown instructions. Portable frontmatter: required `name` (1–64 chars, lowercase alphanumeric + single hyphens, must match the directory name) and `description` (≤ 1024 chars: what it does **and when to use it**); optional `license`, `compatibility`, `metadata`, experimental `allowed-tools`. Keep the body under ~500 lines; put long reference material in `references/`, scripts in `scripts/`. ([Specification](https://agentskills.io/specification))

Figma’s design-system skill guide (useful even in a Figma-free workflow) recommends: a clear when-to-use section; numbered procedures; **“search the library before creating anything new”** as the first rule; token taxonomy and component do/don’ts; at least one input/output example. A skill is instructions; MCP is live access to the library. ([How To Turn Your Design System Into a Claude Skill](https://www.figma.com/resource-library/claude-skill-design-system/))

### Design-system MCP servers

[Storybook’s MCP server](https://storybook.js.org/docs/ai/mcp/overview) (`@storybook/addon-mcp`, preview API) exposes tools for listing/showing component docs, generating stories, previewing, and running tests (including a11y). Official docs currently say the **docs toolset’s component manifest is generated for React frameworks, Angular Vite, and Vue 3 Vite only**. “Every other framework” — which includes **web-components-vite and the Astro community framework** — has **no manifest**, so `docs-list` / `docs-show` are unavailable. Development and testing toolsets still work. Storybook’s own suggested `AGENTS.md` snippet tells agents to query MCP before using any prop and never to hallucinate properties.

Implication for Matrix: if components are Astro or web components, do not plan on Storybook MCP docs tools as they exist today. Compensate with a thorough SKILL.md, token/component Markdown, `llms.txt` on the published docs, and/or a small custom MCP that reads the token JSON and component list.

Other public examples of DS-oriented MCP servers exist (e.g. the [NYS Design System MCP write-up](https://designsystem.ny.gov/about/updates/nysds-mcp-server/)); they generally expose `list/get` for components, tokens, and guidelines.

### Figma-free workflows

Nothing in DTCG, Storybook, or Agent Skills requires Figma. A code-first loop that is already in production at admired projects:

1. Author tokens in DTCG JSON (optionally edited in Penpot, Tokens Studio, or a text editor — all listed as DTCG adopters). ([FAQ](https://www.designtokens.org/faq/))
2. Compile to CSS variables (Style Dictionary or Terrazzo).
3. Use Storybook as the visual source of truth (stories + MDX guidelines), not a design file.
4. Teach agents via AGENTS.md + SKILL.md + (if applicable) MCP + a public `llms.txt`.

Open Props is a complete public example of a CSS-variable system with no design-tool dependency, including a DTCG 2025.10 export. ([Open Props](https://open-props.style/))

---

## 6. Admired public systems (personal or small-team, plus one reference architecture)

Chosen for public docs and/or Storybook, and for practices Matrix can steal. GitHub Primer is a larger team; it is included because its token model is the usual reference, not because it is “personal scale.”

### 1. Open Props — Adam Argyle (personal / small)

- Site: [https://open-props.style/](https://open-props.style/)  
- Repo: [https://github.com/argyleink/open-props](https://github.com/argyleink/open-props)

CSS custom properties as a “sub-atomic” token library (color, size, radius, shadow, type, easing, animation, gradients, named media queries). Incrementally importable, framework-agnostic, with `:host` builds for web components and explicit light/dark alias theming. Ships `prefers-reduced-motion` helpers and a DTCG 2025.10 resolver JSON. Notable as a Figma-free, CSS-first personal system. Not a component Storybook — tokens, not UI kit.

### 2. Nord Design System — Nordhealth (small product company)

- Docs: [https://nordhealth.design/docs/developer/css-framework/](https://nordhealth.design/docs/developer/css-framework/)  
- Storybook / playground: [https://nordhealth.design/playground/](https://nordhealth.design/playground/)  
- March 2026 write-up: [Introducing Storybook and the New Playground Experience](https://nordhealth.design/updates/march-2026-storybook-playground)  
- Theming in web components: [web.dev article](https://web.dev/articles/custom-properties-web-components)

Web components + CSS custom properties (`var(--n-…)`). In March 2026 they moved component examples to **Storybook 10**, with controls generated from the custom elements manifest, **four themes** in the toolbar, viewports, **addon-a11y (axe-core)**, autodocs, and CodePen export. Stories live next to component source. A close analogue if Matrix components are web components and the Storybook is public.

### 3. Web Awesome (successor to Shoelace) — Font Awesome / Shoelace team

- Docs: [https://webawesome.com/docs/](https://webawesome.com/docs/)

Framework-agnostic, themeable web components. Official Storybook path is `@storybook/web-components-vite`. Useful as a model of a public, installable WC library with CSS-variable theming, independent of React.

### 4. GitHub Primer — token architecture reference (larger team)

- Site: [https://primer.style/](https://primer.style/)  
- Primitives: [https://primer.style/product/primitives/](https://primer.style/product/primitives/)  
- Repo: [https://github.com/primer/primitives](https://github.com/primer/primitives)

Base / functional / component tokens compiled (Style Dictionary) to CSS custom properties; themes switched with `data-color-mode` and related attributes. Best in-class public naming and layering docs to study, even if the org size does not match a personal system.

### 5. Honorable mention — Datum (personal, Storybook)

[Rafael Fachinelli’s Datum](https://rafaelfachinelli.com/en-US/projects/datum) is a personal system with public Storybook-style documentation and token-based theming. Smaller audience than the four above; included as an example of a one-person system that still publishes a Storybook.

---

## Recommendations to consider

**These are research suggestions for a later design pass. They are not decisions.**

1. Keep the first version of Matrix small: tokens + typography + motion + the components the portfolio already repeats. Promote a pattern only after it appears twice. ([Dishmon](https://michaeldishmon.com/writing/design-system-for-one-person); [Cheng](https://jordancheng.com/thoughts/design-systems-for-one))
2. Use a two- or three-tier token graph (primitives + semantics; component tokens only when a part must be restyled independently). Put phosphor vs Operator and day vs night entirely in the semantic tier, exposed as CSS custom properties under `[data-theme]` / `[data-palette]` plus `prefers-color-scheme`. ([Tahir](https://arqamtahir.com/blog/design-token-system-architecture); [Open Props](https://open-props.style/))
3. Author tokens in the DTCG 2025.10 format. If first-class resolvers matter on day one, Terrazzo’s CSS plugin already maps them to selectors; Style Dictionary v4/v5 is the more established CSS-variables pipeline but 2025.10 resolvers are still in progress in v5. Either can emit CSS variables; do not maintain a second handwritten `:root` sheet. ([DTCG FAQ](https://www.designtokens.org/faq/); [Terrazzo CSS](https://terrazzo.app/docs/integrations/css/); [SD DTCG](https://styledictionary.com/info/dtcg/))
4. For packaging, start with a **single package** (or a small monorepo only if tokens, components, and docs clearly need separate version lines). Use Changesets for changelog + tags. Prefer a workspace/path dependency into wadakatu.dev until a second consumer exists; publish to npm when the public install story matters. Treat git-URL installs as a temporary bridge. ([Changesets](https://changesets.dev/guide/getting-started); [npm package spec](https://docs.npmjs.com/cli/v11/using-npm/package-spec/))
5. Meet **WCAG 2.2 AA** on every theme/palette pair (text 4.5:1, UI 3:1, visible focus). Use APCA as a second, unofficial check on light-on-dark phosphor pairs and thin mono glyphs — not as a substitute. Exceed numeric contrast for small/thin monospace. Provide a sufficient-contrast logo variant when the logo is a control. ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum); [apca-w3](https://github.com/Myndex/apca-w3))
6. Motion: respect `prefers-reduced-motion` by default; still ship an in-page pause/freeze for auto-running rain/scanlines (2.2.2); keep flash rate and area under 2.3.1; do not convey meaning only with motion. ([2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide); [2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold); [2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions))
7. Focus: never remove the outline without a `:focus-visible` replacement that is at least 3:1 against adjacent colors; consider a two-color 2px ring so it survives both palettes and day/night. ([2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible); [C45](https://www.w3.org/WAI/WCAG22/Techniques/css/C45); [2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html))
8. Font stack: Latin/code mono first, then a **monospaced** CJK fallback (Noto Sans Mono CJK JP or Source Han Mono, self-hosted and subsetted). Do not fall back to IBM Plex Sans JP (or other proportional Japanese fonts) inside the terminal. ([noto-cjk](https://github.com/notofonts/noto-cjk); [Source Han Mono](https://github.com/adobe-fonts/source-han-mono/); [IBM Plex Sans JP](https://fonts.google.com/specimen/IBM+Plex+Sans+JP))
9. Components: default to CSS + Astro for static pages; consider web components only for pieces that must run outside Astro or need a long-term framework-agnostic API. Do not add React solely to get better Storybook/MCP support. Note that `@astrojs/lit` is deprecated. ([Astro Lit](https://docs.astro.build/en/guides/integrations-guide/lit/))
10. Storybook 10: use `@storybook/web-components-vite` if the public components are web components; use `@storybook-astro/framework` if stories are `.astro` (official Astro init only just landed, 2026-11-03). Enable MDX docs, `@storybook/addon-a11y` with WCAG 2.2 rules, and stories for every theme/palette/reduced-motion combination. Publish the static build to GitHub Pages or a docs subdomain; add Chromatic if visual regression is wanted. A custom subdomain needs a DNS change and an explicit OK. ([Publish Storybook](https://storybook.js.org/docs/sharing/publish-storybook); [storybook-astro](https://github.com/storybook-astro/storybook-astro); [a11y addon](https://storybook.js.org/docs/10.4/writing-tests/accessibility-testing.md))
11. Agent-facing layer, Figma-optional: `AGENTS.md` at the repo root (“use Matrix tokens and components first”); one or more `SKILL.md` skills (tokens, components, a11y/motion); `llms.txt` plus Markdown mirrors on the published Storybook/docs; do not depend on Storybook MCP’s docs toolset unless the stack is React/Vue/Angular Vite. ([agents.md](https://agents.md/); [Agent Skills spec](https://agentskills.io/specification); [llms.txt](https://llmstxt.org/); [Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview))

---

## Pitfalls

- **Tokenizing everything / inventing components up front.** Unused tokens and one-off components become a maintenance tax. ([zeroheight](https://zeroheight.com/learn/token-architecture-building-a-scalable-token-system/); [Cheng](https://jordancheng.com/thoughts/design-systems-for-one))
- **Skipping the semantic token tier** while shipping two palettes and day/night — components then hard-code primitives and theming becomes a rewrite. ([Tahir](https://arqamtahir.com/blog/design-token-system-architecture))
- **Handwritten CSS variables that drift** from the token source. ([Tahir](https://arqamtahir.com/blog/design-token-system-architecture))
- **Assuming Style Dictionary “supports DTCG” means 2025.10 resolvers.** v4 supports the earlier DTCG shape; full 2025.10 is still in progress in v5. ([SD DTCG page](https://styledictionary.com/info/dtcg/); [#1590](https://github.com/style-dictionary/style-dictionary/issues/1590))
- **Treating APCA or WCAG 3 drafts as the legal bar.** Meet WCAG 2.2; use APCA only as an extra check. APCA is beta. ([WCAG 3 intro](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/); [apca-w3](https://github.com/Myndex/apca-w3))
- **Neon green that “passes” 4.5:1 on a contrast checker but fails in the browser** because the type is thin, monospaced, small, or glowing. ([1.4.3 thin-font note](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum))
- **Rain/scanlines with no pause control**, or relying only on `prefers-reduced-motion` to satisfy 2.2.2. ([2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide))
- **Fast, large luminance pulses in rain or boot sequences** (2.3.1 seizure risk). Analyze looping animations at full size. ([2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold))
- **`outline: none` in a “clean terminal” aesthetic** without a visible `:focus-visible` replacement. ([2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible); [F78](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible))
- **Proportional Japanese fallbacks in a monospace UI**, or assuming CJK is available from IBM Plex Mono / Open Props’ mono stack. ([IBM Plex Sans JP](https://fonts.google.com/specimen/IBM+Plex+Sans+JP); [noto-cjk](https://github.com/notofonts/noto-cjk))
- **Loading a full Noto Sans Mono CJK file from a CDN** — these families are huge; subset and self-host. ([noto-cjk](https://github.com/notofonts/noto-cjk))
- **Planning on `@astrojs/lit`.** Deprecated in Astro 5. ([Astro Lit docs](https://docs.astro.build/en/guides/integrations-guide/lit/))
- **Assuming official Storybook Astro support is as mature as React/Web Components.** Community package is the current practical path; official init only merged 2026-11-03. `create storybook` may still not detect Astro. ([storybook-astro](https://github.com/storybook-astro/storybook-astro); [PR 37122](https://github.com/storybookjs/storybook/pull/37122))
- **Expecting Storybook MCP docs tools to work with Astro or web-component stories.** Manifest support is React / Angular Vite / Vue 3 Vite only, as of the current Storybook MCP docs. ([Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview))
- **Publishing Storybook on GitHub Pages without setting `base`**, or expecting Chromatic-style Composition/history from a plain static host (CPP level 0). ([Publish Storybook](https://storybook.js.org/docs/sharing/publish-storybook))
- **Axe-only accessibility.** The addon is a first line of QA (Deque: up to 57% of WCAG issues), not a complete audit — contrast of thin type, motion, and Japanese typography still need human checks. ([a11y docs](https://storybook.js.org/docs/10.4/writing-tests/accessibility-testing.md))
- **Git dependencies as the public distribution API** (no semver ranges, slower CI, clone permissions). ([npm package spec](https://docs.npmjs.com/cli/v11/using-npm/package-spec/))
- **Putting the entire design system into always-on AGENTS.md** instead of progressive-disclosure skills — context bloat. ([Agent Skills spec](https://agentskills.io/specification))
- **Publishing only HTML docs with no `llms.txt` or `.md` mirrors**, then expecting agents to use the site as a source of truth. ([llms.txt](https://llmstxt.org/))

---

## Link check (2026-11-15)

All of the following returned HTTP 200 with follow-redirects, unless noted.

DTCG / tokens: [FAQ](https://www.designtokens.org/faq/), [TR 2025.10](https://www.designtokens.org/tr/2025.10/), [Format 2025.10](https://www.designtokens.org/tr/2025.10/format/), [stable-version announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/), [CG home](https://www.w3.org/community/design-tokens/), [community-group repo](https://github.com/design-tokens/community-group), [SD DTCG](https://styledictionary.com/info/dtcg/), [SD v5 migration](https://styledictionary.com/versions/v5/migration/), [SD formats](https://styledictionary.com/reference/hooks/formats/predefined/), [SD #1590](https://github.com/style-dictionary/style-dictionary/issues/1590), [Terrazzo docs](https://terrazzo.app/docs/), [Terrazzo CSS](https://terrazzo.app/docs/integrations/css/).

Practice / packaging: [zeroheight token architecture](https://zeroheight.com/learn/token-architecture-building-a-scalable-token-system/), [Dishmon](https://michaeldishmon.com/writing/design-system-for-one-person), [Cheng](https://jordancheng.com/thoughts/design-systems-for-one), [Tahir](https://arqamtahir.com/blog/design-token-system-architecture), [Changesets getting started](https://changesets.dev/guide/getting-started), [Changesets versioning](https://changesets.dev/guide/versioning-and-publishing), [npm package spec](https://docs.npmjs.com/cli/v11/using-npm/package-spec/).

Accessibility: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), [2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions), [2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide), [2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold), [SCR40](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR40), [C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39), [C45](https://www.w3.org/WAI/WCAG22/Techniques/css/C45), [WCAG 3 intro](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/), [apca-w3](https://github.com/Myndex/apca-w3), [ARC](https://readtech.org/ARC/), [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).  
**Did not load:** `https://www.myndex.com/APCA/` (timeout from this environment).

Fonts: [noto-cjk](https://github.com/notofonts/noto-cjk), [Source Han Mono](https://github.com/adobe-fonts/source-han-mono/), [IBM Plex Sans JP](https://fonts.google.com/specimen/IBM+Plex+Sans+JP), [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono).

Astro / Storybook / Chromatic: [Astro Lit](https://docs.astro.build/en/guides/integrations-guide/lit/), [Astro frameworks](https://docs.astro.build/en/guides/framework-components/), [Astro islands](https://docs.astro.build/en/concepts/islands/), [Publish Storybook](https://storybook.js.org/docs/sharing/publish-storybook), [MDX](https://storybook.js.org/docs/writing-docs/mdx), [web-components-vite](https://storybook.js.org/docs/get-started/frameworks/web-components-vite), [a11y testing](https://storybook.js.org/docs/10.4/writing-tests/accessibility-testing.md), [Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview), [storybook-astro](https://github.com/storybook-astro/storybook-astro), [PR 37122](https://github.com/storybookjs/storybook/pull/37122), [Chromatic quickstart](https://www.chromatic.com/docs/quickstart/), [Chromatic GitHub Actions](https://www.chromatic.com/docs/github-actions/).

AI / agents: [Agent Skills spec](https://agentskills.io/specification), [Claude Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [Skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [agents.md](https://agents.md/), [AAIF AGENTS.md](https://aaif.io/projects/agents-md), [llms.txt](https://llmstxt.org/), [Figma skill guide](https://www.figma.com/resource-library/claude-skill-design-system/).

Examples: [Open Props](https://open-props.style/), [open-props repo](https://github.com/argyleink/open-props), [Nord CSS framework](https://nordhealth.design/docs/developer/css-framework/), [Nord playground](https://nordhealth.design/playground/), [Nord Storybook post](https://nordhealth.design/updates/march-2026-storybook-playground), [web.dev Nord custom properties](https://web.dev/articles/custom-properties-web-components), [Web Awesome docs](https://webawesome.com/docs/), [primer.style](https://primer.style/), [Primer primitives](https://primer.style/product/primitives/), [primer/primitives](https://github.com/primer/primitives).
