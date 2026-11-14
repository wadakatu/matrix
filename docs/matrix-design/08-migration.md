# 08 — Migration from TOMBO

How this repository stops being TOMBO and becomes matrix: what is kept, what is renamed,
what breaks at the rename, and how wadakatu.github.io moves onto the package. It records
five of wadakatu's decisions of 2026-11-15: Q1 (the Storybook's address), Q2 (no npm), Q3
(the logo), Q7 (TOMBO's pages) and Q8 (languages).

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
| Distribution | Copy files out of a tag, pin by sha256 | Install the release tarball from GitHub Releases by URL, pin by lockfile. Not on npm (decision Q2) |
| Versions | `0.1.0` – `0.14.1` | Start at `1.0.0-alpha.1` |
| Namespace | `--tombo-*`, `.tombo-*`, `data-tombo-*`, `window.Tombo` | `--mx-*`, `.mx-*`, `mx-*` elements, root `data-*` |
| Themes | `tombo` (light, default follows the OS), `hotaru` (dark) | `night` (default, always), `day` |
| Palettes | One | `phosphor`, `operator` |
| Type | Instrument Sans, M PLUS 2, Martian Mono, from Google Fonts | IBM Plex Mono, M PLUS 1 Code, DotGothic16, self-hosted |
| Public site | An introduction page and four example pages at `/tombo/` | Storybook at `https://matrix.wadakatu.dev/` (06). `/tombo/` is retired |
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

### Its public pages are retired

Decision Q7: the old `/tombo/` pages stop being published. No stub and no redirect takes
their place. The frozen branch and the tags are the archive.

- **How.** Two repository settings, both wadakatu's. First the Pages source is changed from
  the `main` branch to "GitHub Actions"; then the site is unpublished. GitHub's
  documentation says that unpublishing removes the current deployment and the site is no
  longer available, while repository settings and content are not affected; and that with
  branch publishing a commit to the publishing source creates a new deployment
  ([docs](https://docs.github.com/en/pages/getting-started-with-github-pages/unpublishing-a-github-pages-site)).
  That second point is why the source is changed first: unpublishing alone would last only
  until the next commit to `main`. With the source on "GitHub Actions" and no deploy
  workflow yet, nothing is published until the Storybook is (06).
- **When.** After the `tombo` branch exists and before `main` is cleared (09, tasks 1.1 and
  1.2). Pages builds from `main` today, so clearing `main` while it is still the publishing
  source would put matrix's unfinished files at `/tombo/`.
- **Afterwards** `https://www.wadakatu.dev/tombo/` and every address under it are not served
  by this repository. The portfolio adds nothing for them, so they get whatever the
  portfolio answers for an unknown path, its 404 page.
- **The portfolio links there today.** Its project entry points at
  `https://www.wadakatu.dev/tombo/`, and that link is dead from the moment the site is
  unpublished. What the entry becomes is the first of the site's own decisions below;
  it is best made before or together with the unpublishing.
- The Pages site is used again later, for the Storybook, at a different address (06).

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
- **Not redirected: the project site's URL.** By default the site would leave
  `https://www.wadakatu.dev/tombo/` and appear at `https://www.wadakatu.dev/matrix/`. Neither
  matters here: TOMBO's pages are already unpublished (Q7), and the Storybook is at
  `matrix.wadakatu.dev` (Q1), which does not contain the repository's name.
- If a new repository is ever created under the old name, the redirects stop. `tombo` must
  not be reused as a repository name.
- GitHub's advice for a repository with a Pages site is a custom domain, which is what 06
  does.
- The page does not say whether release-asset download URLs are redirected. See the
  dependency row below.

### What depends on the name

| Thing | Bound to the name? | Action at the rename |
| --- | --- | --- |
| Local clones | Redirected | `git remote set-url` when convenient |
| Pages address | No | `matrix.wadakatu.dev` is a custom domain (06); the setting belongs to the repository and does not contain its name |
| Repository "Website" field | No | Set to `https://matrix.wadakatu.dev/` when the Storybook is live |
| `package.json` `repository`, `homepage`, `bugs` | Yes | Written as `wadakatu/matrix` from the start; correct once the rename happens |
| The release tarball's URL, as pinned by the portfolio | Yes: `github.com/wadakatu/<name>/releases/download/…` | The portfolio's first install comes after the rename, so the URL it pins is the final one. If it comes earlier, update the URL at the rename; whether GitHub redirects the old one is not verified (10) |
| README badges and links | Yes | Written for `matrix` |
| TOMBO's `llms.txt` (raw GitHub URLs on `main`) | Yes | Replaced by matrix's, which links to the published site instead |
| Portfolio's project entry and `CLAUDE.md` | Yes | Portfolio change (below) |
| This repository's checkout directory, Claude project memory path | Local only | Unaffected |

### When to rename

The implementation plan works with the rename at any point after TOMBO is frozen. No step
has to wait for it any more: the Storybook's address does not contain the repository's name
(Q1) and nothing is published to npm (Q2). Before the portfolio's first install is still
better, because the tarball URL in its `package.json` and lockfile names the repository.

### The `/tombo/` address

Nothing serves it, by decision (Q7, "Its public pages are retired" above). The portfolio
does not add a stub page or a refresh for it, and deep links such as
`/tombo/examples/docs.html` end at the portfolio's 404 page like any other unknown address.

matrix needs no path on `www.wadakatu.dev`: the Storybook has its own origin (06).

## How wadakatu.github.io consumes matrix

This is a change in another repository, made in its own issue and pull request after
matrix has a release candidate. It is described here so that matrix is designed for it.

### Dependency

- `@wadakatu/matrix` at an exact version, as the URL of that release's tarball on GitHub
  Releases (01; decision Q2). The lockfile pins the content hash.
- An update is a pull request that changes that URL to the next release's, and the
  portfolio's own checks (build, Lighthouse, its visual tests) decide whether to take it.
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
  bundled assets Astro emits; bump the cache version. Nothing is needed for the Storybook,
  which is on another origin (06).
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
| `/blog/<slug>/` | Article, in the language it was written in; no `/ja/` twin | Same address; no redirect needed |
| `/about/` | Not designed yet (04, gaps) | TOMBO page |
| `/404`, `/offline/` | Restyled | TOMBO pages |
| `/proto/*` | Removed | Prototype, `noindex` |
| `/ja/…` | The same tree in Japanese (decision Q8, below) | — |
| `/tombo/` | Not served; the portfolio's 404 (decision Q7) | (the TOMBO project site) |

`human/` routes are canonical to their short twins; articles are canonical to themselves;
`noindex` comes off (all from `MACHINE-FIRST-AND-BLOG.md`).

**Languages (decision Q8).** English is at the root and Japanese is at the same path under
`/ja/`. A blog post exists only in the language it was written in, at its one address under
`/blog/`. Twins link to each other with `hreflang` and the language link (04); an article
has no twin and no language link.

### Decisions the site needs from wadakatu

These are content and information-architecture decisions, not design-system ones. They are
listed so that nobody discovers them at launch.

1. **The TOMBO project entry.** The project list has a `tombo` entry whose link is
   `https://www.wadakatu.dev/tombo/`. That address stops being served when TOMBO's pages
   are unpublished (Q7), and after the rename there is no TOMBO repository. Does the entry
   become `matrix`, stay as a retired project pointing at the frozen branch, or go?
2. **TOMBO in the shell.** `php artisan inspire` prints TOMBO's three rules, and one
   title-to-commit reward pairs `tombo` with a real commit. Keep as history, or replace.
3. **About.** Needs a design in this world.
4. **Alt text.** The five Japanese alt texts the prototype wrote need the author's eye
   (`MATRIX-NOTES.md`, "Alt text added by the prototype").

## The logo

- The mark is by Chisato Satoh and is used on wadakatu.dev with credit. The file is already
  public in the portfolio repository, along with smaller derivatives the production site
  uses (`logo-400.webp`, `logo-48.webp`, `logo-80.webp`).
- matrix is MIT-licensed code. **The logo is not covered by that licence.**
- **Decision Q3: the logo may live in this public repository, with a notice that it is not
  MIT-licensed and may not be reused.** It is kept in `assets/logo/` beside that notice
  (author, used with permission, not MIT, not for reuse), and the `LICENSE` file says the
  same and points to it.
- The package's `files` list leaves the logo out, so the release tarball does not carry it.
  The site keeps serving its own copy and passes the address to the components.
- matrix records the canonical file's sha256, so the two copies can be checked against each other.
- The amber tint in operator-night stays as designed: recolouring as a palette treatment
  is in the approved direction (law L5), and the answer to Q3 puts no further condition on it.
- Derivatives: the header needs 44px and 32px at up to 3×. Downscaled copies of the
  designer's file are generated by script and never redrawn, as production already does.
  They live beside the original under the same notice.

## Order of operations

Owner is who must act. "Agent" steps are in the implementation plan (09).

| # | Step | Owner | Reversible |
| --- | --- | --- | --- |
| 1 | Create and protect the `tombo` branch | Agent, with go-ahead to push a branch; wadakatu protects it | Yes |
| 2 | Retire TOMBO's pages (Q7), before `main` is cleared: Pages source to "GitHub Actions", then unpublish | wadakatu (repository settings) | Yes: a new deployment brings a site back |
| 3 | Build matrix on `main` through the plan's phases; Storybook is reviewed locally and from CI artefacts | Agent | Yes |
| 4 | The DNS gate (Q1): OK the record; custom domain saved in Pages settings; then the `CNAME` for `matrix.wadakatu.dev` (06) | wadakatu | Yes |
| 5 | The Storybook deploys to `https://matrix.wadakatu.dev/` | CI | Yes |
| 6 | Rename the repository | wadakatu | Yes, until the old name is reused |
| 7 | Release candidates: tag, GitHub Release with the tarball (Q2) | Agent prepares, CI builds | A tag a consumer has installed must not be moved |
| 8 | Migrate the portfolio onto the release tarball; launch | Portfolio pull requests | Yes (revert) |
| 9 | Release `1.0.0` | Agent prepares, wadakatu tags | — |

Steps 4 and 5 can happen any time after step 2, and earlier is better: the Storybook is
then public while components are still being reviewed. Step 6 can happen any time after
step 1; before step 8 is simplest (see "When to rename").

## Rollback

- Retiring TOMBO's pages is the first public change. It is undone by setting the Pages
  source back to a branch and committing to it: `main` until `main` is cleared, the `tombo`
  branch afterwards.
- The rename can be undone by renaming back, as long as no repository has taken the old name.
- The portfolio's migration is a set of ordinary pull requests on a site that keeps its
  current vendored TOMBO until they merge. Its rollback is a revert.
- Nothing is published to a registry, so no version number is spent for good. The one rule
  is that a release tag the portfolio has installed is never moved or re-cut: its lockfile
  pins that tarball's hash. A bad release is followed by a new one.
