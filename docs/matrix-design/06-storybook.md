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
| Storybook | The latest stable version when implementation starts (decision Q10): whatever npm's `latest` tag is on the day spike S1 begins, recorded in the spike's result. Never a beta | `storybook` 10.6.7 is `latest`; 11.0.0-beta.3 is `next`. The 11 beta post (2026-11-09) targets a December release |
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
2. The static build works when served from the root of an origin, which is how `matrix.wadakatu.dev` serves it.
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
Reading/                    Masthead, Contents, Prose, Code block, Callout, Details, Reference link, Post foot, Index
Specimens/                  Machine landing, Human home, Projects (both readings), Article (A, B and C; 04), Blog index, Moved, Not found, Offline
Changelog
```

The sidebar follows the inventory in 04 one to one. Notice (04), the component of the last
two specimens, has its stories beside Moved's.

### How a specimen is shown (task 6.1)

A specimen is a whole document, and a story is rendered into the preview's own document, so a
specimen cannot be a story (Moved's stories show its body for the same reason). At `0803d93`
the built Storybook has no Specimens section and no Changelog page; both are in the list
above and are added in Phase 6.

- The Astro build of the specimens is served inside the Storybook under `/specimens/`,
  copied in through the static directories like the other files beside it ("What is
  published").
- Each entry under `Specimens/` is a Docs page: one sentence naming the pattern it shows
  (04), a link that opens the page by itself, and the page live in a frame. Projects has two
  frames and Article three.
- The specimen build therefore takes `/specimens/` as its base, and every address one
  specimen writes to another is made from that base by one helper. Astro's `base` is the
  prefix for what the build emits, and written links are the author's to prefix
  ([docs](https://docs.astro.build/en/reference/configuration-reference/#base)). The logo
  keeps its address, `/assets/logo/`, which the Storybook serves already. The tests serve
  the same build at the same path.
- A framed specimen is a real page on the Storybook's origin: it reads the flags in its own
  address and keeps `mx-theme` and the tab's keys as the site would (03). The stories still
  read no storage, and the toolbar does not reach into the frame.
- The Changelog page renders `CHANGELOG.md`, the one source.

Accept: in the static build each Specimens page shows its specimen live, the links from one
specimen to another work inside the frame, and no request leaves the origin.

## Toolbar globals

Each global maps to one root attribute (03). No story sets these itself, and no story reads
storage: the toolbar is the only state, so a story looks the same for every visitor.
The terminal would otherwise keep its history and the guide's dismissal in `sessionStorage`
(03), so the preview sets `MxTerminal.remember = false`, a public static on the element
class, before the first story; no terminal story then reads or writes `mx-history` or
`mx-guide`. Nothing but the preview sets it.

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

The Storybook is a static site (`storybook build` writes `storybook-static`).

**Decision (Q1): it is hosted at `https://matrix.wadakatu.dev/` from the start.** It is
this repository's GitHub Pages site with a custom domain, deployed by GitHub Actions. It is
never published under `www.wadakatu.dev/matrix/`, not even temporarily.

### Why an origin of its own

- A path on `www.wadakatu.dev` is the same origin as the portfolio. The portfolio registers
  a service worker at `/sw.js` (scope `/`) that serves every stylesheet, script and image
  cache-first for 30 days (`public/sw.js` in wadakatu.github.io), so a returning visitor
  could be shown a month-old Storybook, and the two sites would share `localStorage`.
- A sub-domain is a separate origin: no shared service worker and no shared storage.
- The address does not depend on the repository's name. A project site's default address
  is not redirected when its repository is renamed, and GitHub's advice for a repository
  with a Pages site is a custom domain
  ([GitHub docs](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)).

The build's base path is `/`. The preview never registers a service worker.

### Gate: the DNS record

`matrix.wadakatu.dev` needs a DNS record, and a DNS record on `wadakatu.dev` needs
wadakatu's OK before it exists. This is a gate on going live (09, task 6.5), not an open
question about the product. Until it is cleared the Storybook is reviewed locally and from
CI artefacts, and the deploy job does not run.

Everything in this list is done by wadakatu or with his explicit go-ahead; an agent does
not change Pages settings or DNS (09).

1. In the repository's Pages settings, save `matrix.wadakatu.dev` as the custom domain.
   The source is already "GitHub Actions", set when TOMBO's pages were retired (08). This
   comes before the DNS record. GitHub's
   documentation says to add the domain to the Pages site before configuring it with the
   DNS provider, because otherwise someone else could host a site on the sub-domain
   ([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)).
2. Create the DNS record: a `CNAME` from `matrix` to `wadakatu.github.io`.
3. Let the deploy workflow run. No `CNAME` file is committed: when a site is published from
   a custom Actions workflow, GitHub ignores that file and does not need it (same page).
4. Turn on "Enforce HTTPS" when GitHub offers it, which can take up to 24 hours after the
   DNS change (same page).

The deploy job is added only once step 1 is done, and must not run before it. Without a
custom domain of its own, a project
site is served under the account's domain, here `www.wadakatu.dev/<repository>/`
([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)),
which is the shared origin this decision avoids.

Recommended at the same time, also wadakatu's: verify `wadakatu.dev` for GitHub Pages on
the account if it is not verified already, which stops another GitHub user from claiming
the domain
([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)).

### Not chosen

| Option | Why not |
| --- | --- |
| `https://www.wadakatu.dev/matrix/` (project Pages at its default address) | Same origin as the portfolio, and the address is tied to the repository name |
| A `*.chromatic.com` address | An external service and a secret, for hosted review a one-person system does not need yet ([docs](https://storybook.js.org/docs/sharing/publish-storybook)). It can be added later without changing anything here |
| Another static host (Cloudflare Pages, Netlify) | A second deployment system beside GitHub Pages |

### What is published

```
/                     Storybook
/llms.txt             index for agents (07)
/llms-full.txt        the whole reference in one file
/docs/*.md            Markdown mirrors of every doc page
/tokens/              the DTCG sources, the resolver, tokens.css, tokens.json
/specimens/           the specimen pages, which the Specimens section frames
```

One site, one deployment. The files beside Storybook are copied in through Storybook's
static directories.

### Before the gate (task 6.5)

What can be made ready without publishing anything, so that clearing the gate adds the
deploy job and nothing else:

- The static build already has the shape above. The agent-docs script (07) writes the files
  beside Storybook into a build directory that is not committed: `llms.txt` and
  `llms-full.txt` with their links pointing at `docs/<name>.md`, those mirrors, the index
  beside them, and `tokens/`. The static directories copy that directory and the specimens in.
- A test on the static build: each path in "What is published" answers, a link in
  `/llms.txt` leads to a mirror that answers, the build works from the root of an origin,
  nothing is requested from another origin, and no service worker is registered.
- CI keeps uploading `storybook-static` as an artefact on every run, which is how it is
  reviewed until the gate is cleared.

Not before the gate, by anyone but wadakatu or on his word: a deploy job, either Pages
action, a `CNAME` file, a Pages setting, a DNS record, or the repository's homepage. The
homepage stays empty until `https://matrix.wadakatu.dev/` answers.

### Deployment

- A workflow builds on every push to `main` and, once the DNS gate is cleared, deploys with
  the official Pages actions (`actions/upload-pages-artifact`, `actions/deploy-pages`).
- Pull requests build Storybook and upload it as a workflow artifact for review; there is
  no preview deployment.
- Only the latest version is hosted. Each release attaches its `storybook-static` archive
  to the GitHub Release, which is the versioned record.
- The Pages source and the custom domain are repository settings, and the DNS record is
  outside the repository. All three are outward-facing and are done by wadakatu, or with his
  explicit go-ahead, in the order given under "Gate: the DNS record".

## Not doing

- **A separate documentation site.** Storybook's Docs pages are the documentation.
- **Japanese Storybook chrome.** Stories render in Japanese; the Storybook's own pages are
  English. A translated docs set would be a second thing to keep true.
- **Composition, versioned Storybooks, per-branch previews.** Features of hosted services
  (Storybook calls generic hosts "CPP level 0"); not needed by one maintainer.
- **Stories for site pages with real data.** Specimens use fixtures.
