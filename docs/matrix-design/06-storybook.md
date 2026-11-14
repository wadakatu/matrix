# 06 — Storybook plan

A public Storybook is the face of matrix: the place where every component, every context
and every still can be seen, and where the documentation lives. This page fixes what it
runs on, how stories are organised, how it is tested, and where it is hosted.

## What it is for

| Reader | What they need from it |
| --- | --- |
| wadakatu | Approve a component in all four contexts, both languages and its still, without running the site |
| A visitor | See the system as a piece of work: the terminal, the rain, the switch, the rules |
| An agent | Find the component that already exists before writing a new one (07) |
| CI | A fixed set of pages to test for accessibility and visual change |

## Stack

| Piece | Choice | Version checked 2026-11-15 |
| --- | --- | --- |
| Storybook | Current stable line at the time work starts | `storybook` 10.6.7 is `latest`; 11.0.0-beta.3 is `next`. The 11 beta post (2026-11-09) targets a December release |
| Framework | `@storybook-astro/framework` | 1.16.0 (2026-11-11). Peers: `storybook ^10 \|\| ^11.0.0-beta.0`, `astro ^5.5.3 \|\| ^6 \|\| ^7`, `vite ^6.4.1 \|\| ^7 \|\| ^8` |
| Docs | `@storybook/addon-docs` | — |
| Accessibility | `@storybook/addon-a11y` | — |
| Tests | `@storybook/addon-vitest` (browser mode) | — |
| Agent access | `@storybook/addon-mcp`, development only | 07 |

### Why the Astro framework

The Astro components are the canonical markup (01). A Storybook that renders anything else
would be showing a copy of the system, and copies drift.

`@storybook-astro/framework` renders `.astro` components on the server inside Storybook,
supports props and slots, applies the project's Astro config, and produces static builds
with pre-rendered Astro stories (<https://storybook-astro.org/getting-started/>). Storybook's
own documentation lists it under community-maintained frameworks
(<https://storybook.js.org/docs/get-started/frameworks>).

### Standard practice, and the departure

The standard choice is a core framework maintained by the Storybook team. For this stack
that would be `@storybook/web-components-vite`
(<https://storybook.js.org/docs/get-started/frameworks/web-components-vite>), with stories
written as HTML templates around the `mx-*` elements. Nord's public Storybook is built that
way (<https://nordhealth.design/updates/march-2026-storybook-playground>).

matrix departs from it because its elements deliberately do not render their own markup
(01): stories on the web-components framework would have to restate every component's HTML
by hand, and the Storybook would stop being evidence about what the site ships.

The cost is a dependency on a community project, which is young and moves fast (five
releases between 2026-09-10 and 2026-11-11 by its changelog). The mitigations are a spike
before any component work, and a fallback that keeps a single source of markup.

### Spike S1 (gate for everything that follows)

One Astro component with a slot, one `mx-*` element and one token stylesheet, in a
throwaway branch. It passes when all of these are observed, not assumed:

1. The story renders in `storybook dev` and in a static `storybook build`.
2. The static build works when served from a sub-path (`/matrix/`) and from a root.
3. The custom element upgrades inside the preview iframe, and after a control changes an argument.
4. A toolbar global changes `data-theme` and `data-palette` on the preview's root and the story follows.
5. The accessibility addon runs on the story and a deliberate violation fails the Vitest run.
6. Global CSS in cascade layers reaches the story; fonts load from the package, with no request to another origin.
7. A Playwright test can open the story's iframe URL in the static build and take a stable screenshot.

### Fallback

If S1 fails: `@storybook/web-components-vite`, with stories that load HTML fragments which
an Astro build step renders from the same `.astro` components and the same story arguments.
The markup still has one source; what is lost is live controls on Astro props. This is
decided at the end of S1 and recorded in the plan (09).

## Organisation

```
Welcome                     what matrix is, the seven laws, how to read this Storybook
Foundations/
  Colour                    the roles in all four contexts, with measured contrast
  Type                      families, scale, Japanese and Latin specimens
  Space and size
  Motion                    the catalogue, each effect beside its still
  Logo                      the mark, its sizes, what is forbidden
  Language                  one language per page; chrome strings in en and ja
Chrome/                     Header, Mark, Nav, Menu, Control, Switch, Guide, Status line, Footer
Surfaces/                   Panel, Figures, Log, Inline list
Signature/                  Name, Rain, Stream, Streams, Readings, Boot, Curtain, Scan lines, Decode
Terminal/                   Terminal, Prompt, Chips, Fetch card, Login card, Takeover
Reading/                    Masthead, Contents, Prose, Code block, Callout, Reference link, Post foot, Index
Specimens/                  Machine landing, Human home, Projects (both readings), Article, Blog index, Moved
Changelog
```

The sidebar follows the inventory in 04 one to one.

## Toolbar globals

Each global maps to one root attribute (03). No story sets these itself, and no story reads
storage: the Storybook may share an origin with the site, so the toolbar is the only state.

| Global | Values | Sets |
| --- | --- | --- |
| Palette | phosphor, operator | `data-palette` |
| Theme | night, day | `data-theme` |
| Motion | full, held, off | `data-rain="held"` / `data-motion="off"` |
| Language | en, ja | `lang`, and the chrome strings passed to the story |
| Reading | machine, human | `data-reading` (only meaningful for chrome and specimens) |

## Required stories

Every component has these, by the same names, so that a reviewer and a test can rely on them.

| Story | Shows |
| --- | --- |
| `Default` | The component as the site uses it |
| one per variant and state | Each `data-variant`; current, pressed, open, focused, hovered |
| `Contexts` | The component four times, one per context, in one frame. This is the story visual regression captures |
| `Japanese` | With Japanese content and `lang="ja"` |
| `Still` | With motion off. Required for anything in the motion catalogue (05) |
| `Narrow` | At 390 wide, when the component changes shape there |

Stories use a small fixture corpus (invented repository names and sentences, in English and
Japanese) that is plainly a fixture. wadakatu's real data stays in the site (01). L1 still
holds inside Storybook: the rain in a story is made of the fixture's words.

## Documentation inside Storybook

- Each component's Docs page renders that component's own `<name>.md` (04), followed by its
  stories. The Markdown file is the single source for the Storybook page, the packaged docs
  and `llms-full.txt` (07).
- Foundations pages are MDX. The colour and type pages are generated from `tokens.json`, so
  a swatch cannot disagree with the token it shows; the contrast figures on the colour page
  come from the same gate output that CI checks.
- Storybook's MDX runtime is React even when stories are Astro
  (<https://storybook.js.org/docs/writing-docs/mdx>). React is therefore a development
  dependency of the docs, and of nothing that is shipped.

## Testing through stories

| Layer | Tool | Fails the build when |
| --- | --- | --- |
| Accessibility | `addon-a11y` with `parameters.a11y.test = 'error'` project-wide, rules widened with `runOnly` to include the WCAG 2.2 A and AA tags ([docs](https://storybook.js.org/docs/writing-tests/accessibility-testing)) | Any story has a violation |
| Interaction | Story `play` functions run by the Vitest addon | A keyboard path or state change in a story breaks |
| Visual | Playwright against the static build, one screenshot per `Contexts` and `Narrow` story, in the pinned Docker image | A pixel difference appears without an updated baseline |

Visual regression stays self-hosted, as TOMBO's is today: the same Playwright Docker image
locally and in CI, fonts served from the locked packages, animations disabled during
capture, baselines committed and never created by CI. A component is captured once with all
four contexts in the frame, which keeps the number of images near twice the number of
components (one wide, one narrow) rather than eight times.

What stories cannot test is tested on the specimen pages built by Astro directly:
JavaScript disabled, print, forced colours, the head script, and full keyboard journeys (05).

## Hosting

The Storybook is a static site (`storybook build` writes `storybook-static`). Where it is
served is a decision for wadakatu; a sub-domain needs a DNS change and is not assumed.

### Facts that constrain the choice

- This repository's Pages site is `https://www.wadakatu.dev/tombo/`, built from `main` at
  the repository root (`gh api repos/wadakatu/tombo/pages`, 2026-11-15). After the rename
  its default address becomes `https://www.wadakatu.dev/matrix/`.
- A project site's address is not redirected when its repository is renamed
  ([GitHub docs](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)).
- A path on `www.wadakatu.dev` is the same origin as the portfolio. The portfolio registers
  a service worker at `/sw.js` (scope `/`) that serves every stylesheet, script and image
  cache-first for 30 days (`public/sw.js` in wadakatu.github.io). A reader who has visited
  the portfolio would get Storybook files from that cache: any file whose name does not
  change between builds can be stale for a month. The same origin also shares `localStorage`.
- A sub-domain is a separate origin: no shared service worker, no shared storage, and an
  address that survives a repository rename (GitHub's own advice for renamed Pages sites).

### Options

| | Address | Needs from wadakatu | For | Against |
| --- | --- | --- | --- | --- |
| **A** | `https://www.wadakatu.dev/matrix/` (project Pages, deployed by Actions) | Nothing new. Pages source switches from "branch" to "GitHub Actions" | Works on day one; no DNS; no new service | Same origin as the portfolio: needs the service-worker exclusion below. Address is tied to the repository name |
| **B** | `https://matrix.wadakatu.dev/` (the same Pages site with a custom domain) | A DNS `CNAME` from `matrix` to `wadakatu.github.io`, and the custom domain saved in the repository's Pages settings first ([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)) | Clean origin; rename-proof; reads as a product | Needs the DNS approval |
| **C** | A `*.chromatic.com` address | A Chromatic account and a project token as a repository secret | Versioned Storybooks per branch; hosted visual review ([docs](https://storybook.js.org/docs/sharing/publish-storybook)) | An external service and a secret, for features a one-person system does not need yet |
| **D** | Another static host (Cloudflare Pages, Netlify) | An account and a deploy token | Preview deployments per pull request | A second deployment system beside GitHub Pages |

### Recommendation

**Ship on A, move to B when the DNS record is approved.** B is the better end state for the
three reasons above; A needs nothing from anyone and the difference between them is
configuration, not design.

To make that true:

1. The build takes its base path from one variable, so A (`/matrix/`) and B (`/`) are the
   same workflow with a different value. S1 proves both.
2. Storybook's preview never registers a service worker and never touches `mx-*` storage.
3. While on A, the portfolio's service worker excludes `/matrix/` from its cache-first
   routes. This is a change in wadakatu.github.io and is listed in its migration (08).
   Until it ships, a stale Storybook is possible for returning portfolio visitors; that is
   the known cost of starting on A.
4. Moving to B: save the custom domain in Pages settings, add the DNS record, set the base
   to `/`. The order matters: GitHub's documentation warns to add the domain in the
   repository before creating the DNS record, to prevent a takeover of the sub-domain.

C and D are not recommended now. Chromatic can be added later without changing anything
here, if hosted review becomes worth an account.

### What is published

```
/                     Storybook
/llms.txt             index for agents (07)
/llms-full.txt        the whole reference in one file
/docs/*.md            Markdown mirrors of every doc page
/tokens/              the DTCG sources, the resolver, tokens.css, tokens.json
```

One site, one deployment. The files beside Storybook are copied in through Storybook's
static directories.

### Deployment

- A workflow builds on every push to `main` and deploys with the official Pages actions
  (`actions/upload-pages-artifact`, `actions/deploy-pages`).
- Pull requests build Storybook and upload it as a workflow artifact for review; there is
  no preview deployment.
- Only the latest version is hosted. Each release attaches its `storybook-static` archive
  to the GitHub Release, which is the versioned record.
- Changing the Pages source from "Deploy from a branch" to "GitHub Actions" is a repository
  setting. It is an outward-facing change and is done by wadakatu, or with his explicit
  go-ahead, at the step the plan names (09).

## Not doing

- **A separate documentation site.** Storybook's Docs pages are the documentation.
- **Japanese Storybook chrome.** Stories render in Japanese; the Storybook's own pages are
  English. A translated docs set would be a second thing to keep true.
- **Composition, versioned Storybooks, per-branch previews.** Features of hosted services
  (Storybook calls generic hosts "CPP level 0"); not needed by one maintainer.
- **Stories for site pages with real data.** Specimens use fixtures.
