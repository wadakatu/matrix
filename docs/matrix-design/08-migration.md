# 08 — Migration from TOMBO

How this repository stops being TOMBO and becomes matrix: what is kept, what is renamed,
what breaks at the rename, and how wadakatu.github.io moves onto the package.

Nothing on this page has been done. In particular the repository has not been renamed;
that is wadakatu's separate step, and this page says what depends on it.

## Starting point (checked 2026-11-15)

| Fact | Value | Checked with |
| --- | --- | --- |
| Repository | `wadakatu/tombo`, public | `gh repo view` |
| Releases | Tags `v0.1.0` … `v0.14.1` | `git tag` |
| Pages | `https://www.wadakatu.dev/tombo/`, legacy build from `main` at `/`, HTTPS enforced | `gh api repos/wadakatu/tombo/pages` |
| Published there | `index.html`, `ja/index.html`, `examples/*.html`, `tombo.css`, `tombo.js` | repository root |
| Distribution | Vendoring from a tag; no npm package | `README.md` |
| Consumers | wadakatu.github.io only, which vendors `tombo.css` v0.5.0 in `public/styles/` | `gh search code "tombo.css" --owner wadakatu`; the portfolio's `CLAUDE.md` |
| Portfolio links to TOMBO | A project entry with `href: https://www.wadakatu.dev/tombo/`; the shell's `php artisan inspire`; a title-to-commit pair | `src/data/proto-content.ts`, `MATRIX-NOTES.md` |
| Portfolio service worker | Precaches `/styles/tombo.css`; cache-first for all styles, scripts and images | `public/sw.js` |

The code search is GitHub's index, which can miss files; "only one consumer" is what it
found, not a proof.

## What changes

| | TOMBO | matrix |
| --- | --- | --- |
| Identity | Registration marks, shu, "measure everything" | An operator's station at night (00) |
| Repository | `wadakatu/tombo` | `wadakatu/matrix` (after the rename) |
| Artefact | One `tombo.css`, optional `tombo.js` | `@wadakatu/matrix`: tokens, CSS, elements, Astro components (01) |
| Distribution | Copy files out of a tag, pin by sha256 | Install a package, pin by lockfile |
| Versions | `0.1.0` – `0.14.1` | Start at `1.0.0-alpha.1` |
| Namespace | `--tombo-*`, `.tombo-*`, `data-tombo-*`, `window.Tombo` | `--mx-*`, `.mx-*`, `mx-*` elements, root `data-*` |
| Themes | `tombo` (light, default follows the OS), `hotaru` (dark) | `night` (default, always), `day` |
| Palettes | One | `phosphor`, `operator` |
| Type | Instrument Sans, M PLUS 2, Martian Mono, from Google Fonts | IBM Plex Mono, M PLUS 1 Code, DotGothic16, self-hosted |
| Public site | An introduction page and four example pages at `/tombo/` | Storybook at `/matrix/` (06) |
| Storage key | `tombo-theme` | `mx-theme` |

### What is carried over

TOMBO's visual language is retired. Its engineering is the foundation matrix is built on:

| TOMBO practice | Where it lives now | In matrix |
| --- | --- | --- |
| One gate command for local and CI | `scripts/check.sh`, `npm run check` | Same shape, new gates (02, 05) |
| Contrast gate reading values from the source, with a self-test | `scripts/check_contrast.py` | Reads `tokens.json`; pairs declared in the tokens |
| Baseline gate with a justified exception ledger | `stylelint.config.mjs` | Same, new ledger |
| Size budget with recorded measurements | `scripts/check_size.py` | Same |
| Version consistency between files and tag | `scripts/check_banner.py` | Package version, tag and changelog agree |
| Visual regression in a pinned Docker image, locked fonts, committed baselines | `scripts/test_visual.sh`, `tests/visual/` | Same method, against Storybook and specimens (06) |
| No-JavaScript, print and forced-colours tests | `tests/visual/*.spec.js` | Same, on specimens |
| Agent docs with a freshness check | `llms.txt`, `scripts/build_agent_docs.py` | Same, shipped in the package (07) |
| `light-dark()` as the theme mechanism | `tombo.css` | Same (03) |
| An upgrade guide | `docs/upgrading.md` | Same |

### What is not carried over

Signatures, dimension lines, the volume dial, shu, forms, charts, the topbar, the trim-mark
print layer, `window.Tombo`, and the vendoring model. No compatibility aliases are
provided: the visual languages have nothing in common, and the one consumer migrates in
one step. The old `tombo-theme` key is deleted on first load and not translated (03).

## Freezing TOMBO

TOMBO stays reachable in git, exactly as released.

1. Create a branch `tombo` at the last TOMBO commit on `main` and protect it. The tags stay.
2. Add one paragraph to that branch's README: TOMBO is complete at v0.14.1 and continues as matrix.
3. Vendored copies are unaffected: they are copies, and their tag still resolves.

Whether TOMBO's public pages stay online is open question Q7:

- **Default: they do not.** The frozen branch and the tags are the archive. `/tombo/`
  becomes a stub (below) that points to matrix and to the `tombo` branch on GitHub.
- **Alternative: keep them as an archive.** The `tombo` branch's static files are copied
  into the Pages artefact under `/matrix/tombo/`, and the stub forwards there. It is cheap
  (static files, no build) and keeps a past project visible.

## The namespace

For the site's migration. There is no mechanical translation of TOMBO classes to matrix
classes, because the components are different. What maps one to one:

| TOMBO | matrix |
| --- | --- |
| `data-theme="tombo"` / `"hotaru"` | `data-theme="day"` / `"night"` |
| `localStorage['tombo-theme']` | `localStorage['mx-theme']` (old key removed) |
| `--tombo-paper`, `--tombo-surface` | `--mx-color-ground`, `--mx-color-panel` |
| `--tombo-ink`, `--tombo-ink-sub` | `--mx-color-text`, `--mx-color-text-muted` |
| `--tombo-font-mono` | `--mx-font-family-mono` |
| `.tombo-sr-only` | `.mx-vh` |
| `.tombo-shell` | `.mx-frame` |
| `window.Tombo.setTheme()` | the Daylight control, or setting `data-theme` |
| `.tombo-code` and its Copy button | `.mx-code`, `<mx-copy>` |

Everything else in the site's `site.css` that reads a `--tombo-*` token is rewritten
against the roles in 02, not renamed.

## The rename

`gh repo rename` is not run by any step of this design or of the implementation plan. When
wadakatu runs it, this is what happens.

### What GitHub does and does not do

From GitHub's documentation
(<https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository>):

- Redirected: web traffic to the repository, issues, wikis, stars, followers, and
  `git clone` / `fetch` / `push` to the old address.
- **Not redirected: the project site's URL.** `https://www.wadakatu.dev/tombo/` stops
  resolving and the site appears at `https://www.wadakatu.dev/matrix/`.
- If a new repository is ever created under the old name, the redirects stop. `tombo` must
  not be reused as a repository name.
- GitHub's advice for a repository with a Pages site is a custom domain, which is option B
  in 06.

### What depends on the name

| Thing | Bound to the name? | Action at the rename |
| --- | --- | --- |
| Local clones | Redirected | `git remote set-url` when convenient |
| Pages address | Yes | Becomes `/matrix/`; see the stub below |
| Repository "Website" field | Yes | Set to the new address |
| `package.json` `repository`, `homepage`, `bugs` | Yes | Written as `wadakatu/matrix` from the start; correct once the rename happens |
| npm trusted publisher | Yes: it names the repository and workflow file | Configure it for `wadakatu/matrix`. Do not publish to npm before the rename (09) |
| Storybook base path (option A) | Yes | One variable (06) |
| README badges and links | Yes | Written for `matrix` |
| TOMBO's `llms.txt` (raw GitHub URLs on `main`) | Yes | Replaced by matrix's, which links to the published site instead |
| Portfolio's project entry and `CLAUDE.md` | Yes | Portfolio change (below) |
| This repository's checkout directory, Claude project memory path | Local only | Unaffected |

### When to rename

The implementation plan works with the rename at any point after TOMBO is frozen. Earlier
is better: the Storybook is then published at its final address from the first component,
and npm publishing is configured once. The plan marks the two steps that must wait for it.

### The `/tombo/` address

After the rename nothing serves `https://www.wadakatu.dev/tombo/`. Because project sites
and the user site share the domain, the portfolio repository can serve that path itself:

- wadakatu.github.io adds `public/tombo/index.html` and `public/tombo/ja/index.html`: the
  `Moved` pattern (04), a short page with a visible link, a canonical link, and a refresh.
- It can be merged before the rename. While the `tombo` repository still has a Pages site,
  that site is expected to answer for the path; the stub becomes visible when the rename
  removes it. Which of the two wins while both exist has not been verified and does not
  need to be: check the address right after the rename.
- Deep links (`/tombo/examples/docs.html`) get the portfolio's 404 page, which should
  mention the move for a while.

**Reserved paths on `www.wadakatu.dev`:** `/matrix/` (the project site, while option A is in
use) and `/tombo/` (the stub). The portfolio must not create routes under either.

## How wadakatu.github.io consumes matrix

This is a change in another repository, made in its own issue and pull request after
matrix has a release candidate. It is described here so that matrix is designed for it.

### Dependency

- `@wadakatu/matrix` at an exact version, from npm; or, until publishing is approved, the
  release tarball's URL (01). The lockfile pins the content hash either way.
- Updates arrive as an ordinary dependency pull request, and the portfolio's own checks
  (build, Lighthouse, its visual tests) decide whether to take it.
- Working on both at once: `npm install ../matrix` (or a packed tarball) locally. Nothing
  about that is committed.

### What the site imports

| The site needs | It uses |
| --- | --- |
| Head: meta, fonts, the pre-paint script | `Head` from `@wadakatu/matrix/astro` |
| Page frame: skip link, rain, header, footer, status | `Layout` |
| Styles | `@wadakatu/matrix/css` and `@wadakatu/matrix/fonts.css`, imported once in the layout so Astro bundles them |
| Behaviour | `@wadakatu/matrix/elements`, imported once in a script |
| Rain, streams, the name mask | `Rain`, `Stream`, `Name`, fed by `@wadakatu/matrix/lib` with the site's corpus |
| The two readings | `Readings`, `Switch`, with the site's route helper |
| The shell | `Terminal`, given the site's interpreter (`_shell.ts`, `_world.ts` stay in the site) |
| Articles | `Masthead`, `Toc`, `Prose`, `PostFoot`; Shiki keeps the `css-variables` theme, which matrix maps to roles |
| Icons and OG images | Its own generators in `tools/`, reading `@wadakatu/matrix/tokens.json` |

### What the site deletes

- `public/styles/tombo.css`, and the TOMBO glue in `public/styles/site.css`.
- `public/styles/proto/*`, `public/scripts/proto-matrix*.js`, `ProtoMatrixLayout.astro`, and
  the other `/proto/` concepts, once the production routes are on matrix.
- The Google Fonts `<link>`s and the jsDelivr request for GSAP. After migration the site
  makes no third-party request for its design.
- `public/scripts/theme.js`, `toc.js`, `code-copy.js`: replaced by elements.

### What the site changes

- **Service worker** (`public/sw.js`): remove the `tombo.css` precache entries; list the
  bundled assets Astro emits; while Storybook is at `/matrix/`, exclude that path from the
  cache-first routes (06); bump the cache version.
- **Agent files**: `CLAUDE.md` and `.claude/rules/frontend-design.md` describe matrix
  instead of TOMBO; the skill is linked from the package (07).
- **Lint**: the site's CI runs `@wadakatu/matrix/stylelint`, so a raw colour in site CSS fails.
- **Offline page**: stays self-contained; it inlines `tokens.css` and one component
  stylesheet from the package's per-component exports instead of a hand copy of TOMBO tokens.

### Production routes

The prototype lives under `/proto/matrix/`. At launch its tree moves to the root.

| Address | Becomes | Today |
| --- | --- | --- |
| `/` | 機械用 Home: the shell | TOMBO landing page |
| `/projects/` | 機械用 Projects: the shell in `~/projects` | A page |
| `/human/` | 人間用 Home | — |
| `/human/projects/` | 人間用 Projects | — |
| `/blog/` | Blog index | Same address |
| `/blog/<slug>/` | Article | Same address; no redirect needed |
| `/about/` | Not designed yet (04, gaps) | TOMBO page |
| `/404`, `/offline/` | Restyled | TOMBO pages |
| `/proto/*` | Removed | Prototype, `noindex` |
| `/tombo/` | The stub | (the TOMBO project site) |

`human/` routes are canonical to their short twins; articles are canonical to themselves;
`noindex` comes off (all from `MACHINE-FIRST-AND-BLOG.md`).

### Decisions the site needs from wadakatu

These are content and information-architecture decisions, not design-system ones. They are
listed so that nobody discovers them at launch.

1. **The TOMBO project entry.** The project list has a `tombo` entry. After the rename
   there is no TOMBO repository. Does the entry become `matrix`, stay as a retired project
   pointing at the frozen branch, or go?
2. **TOMBO in the shell.** `php artisan inspire` prints TOMBO's three rules, and one
   title-to-commit reward pairs `tombo` with a real commit. Keep as history, or replace.
3. **Japanese and English pages** (Q8). Which pages get a twin in the other language, and
   the address scheme. matrix supports either; its assumption is English at the root,
   Japanese under `/ja/`, and articles at one address in the language they were written in.
4. **About.** Needs a design in this world.
5. **Alt text.** The five Japanese alt texts the prototype wrote need the author's eye
   (`MATRIX-NOTES.md`, "Alt text added by the prototype").

## The logo

- The mark is by Chisato Satoh and is used on wadakatu.dev with credit. The file is already
  public in the portfolio repository, along with smaller derivatives the production site
  uses (`logo-400.webp`, `logo-48.webp`, `logo-80.webp`).
- matrix is MIT-licensed code. **The logo is not covered by that licence.** It is kept in
  `assets/logo/` with its own notice (author, used with permission, not licensed for reuse),
  the `LICENSE` file says so, and the package's `files` list leaves it out. The site keeps
  serving its own copy and passes the address to the components.
- matrix records the canonical file's sha256, so the two copies can be checked against each other.
- Two things need a person, not a design (Q3): whether the designer has seen and accepts
  the amber tint used in operator-night, and whether she is content with the file sitting
  in a second public repository under that notice.
- Derivatives: the header needs 44px and 32px at up to 3×. Downscaled copies of the
  designer's file are proposed, generated by script, never redrawn. Production already
  does this; it is stated here so that it is a decision and not an accident.

## Order of operations

Owner is who must act. "Agent" steps are in the implementation plan (09).

| # | Step | Owner | Reversible |
| --- | --- | --- | --- |
| 1 | Answer the open questions (README) | wadakatu | — |
| 2 | Create and protect the `tombo` branch | Agent, with go-ahead to push a branch | Yes |
| 3 | Point Pages at the `tombo` branch, so `/tombo/` keeps working while `main` changes | wadakatu (repository setting) | Yes |
| 4 | Build matrix on `main` through the plan's phases; Storybook is reviewed locally and from CI artefacts | Agent | Yes |
| 5 | Rename the repository | wadakatu | Yes, until the old name is reused |
| 6 | Switch Pages to GitHub Actions; the Storybook deploys to `/matrix/` | wadakatu (setting), then CI | Yes |
| 7 | Merge the `/tombo/` stub in the portfolio (can be earlier) | Portfolio pull request | Yes |
| 8 | Configure npm trusted publishing for `wadakatu/matrix`; publish `1.0.0-alpha` | wadakatu, then CI | A published version cannot be reused |
| 9 | Migrate the portfolio onto the package; launch | Portfolio pull requests | Yes (revert) |
| 10 | Release `1.0.0` | Agent prepares, wadakatu tags | — |
| 11 | Optional: move the Storybook to `matrix.wadakatu.dev` (06, option B) | wadakatu (DNS) | Yes |

Steps 5 and 6 can move before step 4. Step 8 must come after step 5.

## Rollback

- Before step 5 nothing public has changed except the Pages source, which can be pointed
  back at `main` (once `main` is reverted) or left on the `tombo` branch indefinitely.
- The rename can be undone by renaming back, as long as no repository has taken the old name.
- The portfolio's migration is a set of ordinary pull requests on a site that keeps its
  current vendored TOMBO until they merge. Its rollback is a revert.
- The only thing that cannot be taken back is a published npm version number. Alphas are
  published first for that reason.
