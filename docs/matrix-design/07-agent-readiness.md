# 07 — Agent readiness

Most changes to matrix and to wadakatu.dev will be written by coding agents. This page
defines what an agent is given, where it finds it, and what stops it from hand-rolling a
component that already exists.

## Three agents, three situations

| Agent is working in | It needs | It gets it from |
| --- | --- | --- |
| **This repository** (building matrix) | How to build and test; the laws; where things go | `AGENTS.md`, then `docs/` |
| **A consumer** (wadakatu.github.io) | Which component and token to use; the HTML contract; what is forbidden | The Agent Skill and the docs shipped inside the installed package |
| **The web** (a chat assistant, a fetch tool) | A small map to clean Markdown | `llms.txt` on the published site |

The same Markdown feeds all three. Nothing is written twice.

## The files

| File | Standard | Role | Size rule |
| --- | --- | --- | --- |
| `AGENTS.md` | [agents.md](https://agents.md/) | The operating manual for this repository | Under 100 lines |
| `CLAUDE.md` | Claude Code project instructions | One line that imports `AGENTS.md` | One line |
| `skills/matrix/SKILL.md` | [Agent Skills specification](https://agentskills.io/specification) | How to build UI with matrix, loaded on demand | Body under 200 lines; detail in `references/` |
| `llms.txt` | [llmstxt.org](https://llmstxt.org/) | Index of the Markdown docs | Fits in context: about 40 lines |
| `llms-full.txt` | Same proposal, optional file | Every doc concatenated, for clients that cannot follow links | Generated |
| `src/**/<name>.md` | — | One page per component, seven fixed headings (04) | One screen each |
| `tokens/*.tokens.json` | [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/) | Every value with a `$description` saying what it is for | — |
| `docs/components.json` | — | Generated index: name, status, class, element, attributes, tokens read, doc path | Generated |

That is four instruction files and the reference they point to. The research warns about
exactly two failures here: too many instruction files, and putting the whole system into an
always-loaded file. So `AGENTS.md` stays short and points; the skill is loaded only when UI
work starts; everything long is reference.

### `AGENTS.md` (outline)

No required schema; the nearest file wins; a person's instruction in chat overrides it
(<https://agents.md/>). Contents, in this order:

1. **What this is**: three sentences and a link to `docs/matrix-design/00-principles.md`.
2. **Commands**: install, the one gate command, Storybook, the visual tests, how to update baselines.
3. **The seven laws**, one line each, by number (L1–L7).
4. **Before writing anything**: read the component's `<name>.md`; search `docs/components.json`
   before creating a component; use tokens only.
5. **Where things go**: the co-located component directory and its five files.
6. **Definition of done**: the seven points from 04.
7. **Never**: raw colours; a hue in a name; text on rain; an endless animation without a
   catalogue row; a logo that is cropped or rounded; a third-party request at runtime;
   baselines updated to make a failure pass.
8. **Git**: English Conventional Commits; no `Co-Authored-By`; never push to `main`.

`CLAUDE.md` contains `@AGENTS.md` and nothing else, so there is one file to keep true.

### The skill (outline)

Per the specification: a directory `matrix/` whose `SKILL.md` has `name: matrix` (it must
match the directory) and a `description` of at most 1024 characters that says what it does
and when to use it. Only the name and description are always in context; the body loads
when the skill triggers; `references/` loads when the body points to it.

- **Description** (the trigger): building or changing any page, component or style for
  wadakatu.dev or the matrix design system; choosing colours, type or motion; adding a
  component; reviewing UI for consistency.
- **Body**:
  1. Search before creating: open `components.json`; if a component fits, read its page and use its contract.
  2. Use tokens by role. A table of the dozen colour roles with one line each.
  3. The seven laws as checks, each with "how you will be caught" (the lint or test that fails).
  4. The page patterns (04) and which specimen shows each.
  5. How to add a component, and the definition of done.
  6. One worked example: input (a request for a new list on 人間用), output (the markup, the tokens read, the stories added).
- **`references/`**: links to the packaged docs rather than copies of them.

Figma's guide for design-system skills recommends the same shape (a when-to-use section,
numbered procedures, "search the library before creating anything new" as the first rule,
token taxonomy, do and don't, one input and output example:
<https://www.figma.com/resource-library/claude-skill-design-system/>). Nothing here needs Figma.

### `llms.txt`

The format: an `H1`, a blockquote summary, then sections of links to Markdown, with an
`Optional` section for what can be skipped. TOMBO already publishes one and generates
`llms-full.txt` with a freshness check (`scripts/build_agent_docs.py --check`); both habits
carry over. It is published at the root of the Storybook's own origin,
`https://matrix.wadakatu.dev/llms.txt` (06), so it cannot be confused with the portfolio's
`/llms.txt` on `www.wadakatu.dev`.

- Links point at the Markdown mirrors published beside Storybook (`/docs/*.md`), not at
  `raw.githubusercontent.com` as TOMBO's do, so they do not depend on the repository's name.
- Storybook's Docs pages declare their Markdown twin with
  `rel="alternate" type="text/markdown"` where the page template allows it.

## Docs that match the installed version

TOMBO's agent guide has to tell agents to "match the documentation to your vendored
release", because its docs live on `main` and its consumers copy files out of a tag.

matrix removes the problem: `docs/`, `llms.txt`, `llms-full.txt`, `components.json`, the
token sources and the skill are files in the package tarball (the one attached to each
GitHub Release, 01). An agent in the consuming
repository reads `node_modules/@wadakatu/matrix/llms.txt`, which is by construction the
documentation of the version that is installed, with no network.

In the consuming repository this takes two lines:

- its `AGENTS.md` says: "UI work: read `node_modules/@wadakatu/matrix/llms.txt` first";
- its `.claude/skills/matrix` is a link to `node_modules/@wadakatu/matrix/skills/matrix`.

## Machine-readable surface

| Source | What an agent can ask it |
| --- | --- |
| `tokens.json`, `tokens.d.ts` | Does this token exist; what is its value in each context |
| Token `$description` and `$extensions` | What is it for; what must it clear; is it decorative |
| `components.json` | Does a component exist for this; what attributes does it take; which tokens does it read; is it approved or draft |
| Storybook's components manifest | Props and slots of each Astro component, with story snippets |

`components.json` is generated from the component directories (front matter in each
`<name>.md`) and checked for freshness. It exists so that "search before creating" is a
file read, not a guess.

### Storybook as a tool for agents

Checked on 2026-11-15, and moving quickly:

- Storybook's MCP addon exposes tools to list and show component documentation, run
  stories' tests and preview them. Its documentation says the docs tools need a components
  manifest, which Storybook 10 generates for React, Angular (Vite) and Vue 3 (Vite) only
  (<https://storybook.js.org/docs/ai/mcp/overview>).
- `@storybook-astro/framework` 1.16.0 states that with the docgen server and the components
  manifest enabled, agents using the MCP addon get each Astro component's props and slots
  and each story's description and snippet (<https://storybook-astro.org/reference/changelog/>).
- Storybook 11 (beta) adds official skills and a headless `storybook tools` command, and
  extends manifest generation to all core frameworks
  (<https://storybook.js.org/blog/storybook-11-beta/>).

Position: use them where they work, depend on none of them. The manifest is enabled and
its use by the MCP addon is verified in spike S1. The baseline an agent can always rely on
is the Markdown and the two JSON files above, which need no running server.

## Drift control

Documentation does not stop an agent from writing `color: #2bf07a`. Checks do. Each is a
gate in this repository and, where marked, is shipped for the consumer to run too.

| Drift | Check | In matrix CI | Shipped to consumers |
| --- | --- | --- | --- |
| A raw colour, font size or z-index | Lint: literals are disallowed outside the token file | Yes | Yes, as `@wadakatu/matrix/stylelint` |
| A token that does not exist | Lint: unknown `--mx-*` property; type error on `MxToken` | Yes | Yes |
| A class that does not exist | Script: every `mx-*` class used is in `components.json` | Yes | Yes |
| A hand-rolled copy of a component | Review rule, and the skill's first step | — | — |
| Markup that left the contract | Each component's stories are rendered from its Astro component; the contract in its doc is tested against that output | Yes | — |
| A visual change nobody decided | Visual regression baselines | Yes | The site keeps its own |
| Docs that fell behind code | Freshness checks on every generated file | Yes | — |
| A new endless animation | Test: with Hold on, zero running endless animations | Yes | — |

The exact lint rules and plugins are chosen in Phase 1; the behaviour above is the requirement.

## What Phase 6 builds (task 6.4)

At `0803d93` the layer has `AGENTS.md`, `CLAUDE.md`, 46 component pages, `docs/tokens.md` with
its freshness check, and the repository's own stylelint config. It has no `components.json`,
no `llms.txt` or `llms-full.txt`, no skill, no config a consumer can extend, and no check on
anything in this section. `AGENTS.md` is kept: it is edited where a line below says so and
stays under 100 lines.

### Every component page

- Every directory under `src/components/` and `src/effects/` has its `<name>.md`. Three do
  not: `layout`, `root` (`<mx-root>`) and `decode`. Two pages cover what has no directory of
  its own: `src/head/head.md` (Head and the pre-paint script) and `src/css/foundations.md`
  (reset, base, the focus ring, `.mx-frame`, `.mx-vh`, `.mx-skip`). That is every row of 04's
  inventory, either as a page or as a part named on its owner's page (Screen and Line on
  Terminal's; code title and diff on Code block's; table, task list and footnotes on Prose's).
- Front matter, the same on every page: `name`, `status`, `class` and `element` where there is
  one, `attributes` (every `data-*` and ARIA attribute that is a variant or a state in the
  contract; an empty list when there is none), and `tokens`.
- **`tokens` is checked against the code.** A token the component's own files read through
  its custom property must be listed. A token that is listed must be read: directly, through a
  derived property the files read (02, "Derived properties"), or by its id in the
  component's script. A first pass at `0803d93` found two tokens read and not listed
  (`border.width.hair` in Menu, `layer.lifted` in Boot) and thirteen pages listing a token
  their own files do not read directly; for each of those the check finds one of the other
  two routes, or the page is corrected.

### `docs/components.json`

Generated, committed, sorted by name. One entry per page:

| Field | From |
| --- | --- |
| `name`, `status`, `class`, `element`, `attributes`, `tokens` | The page's front matter |
| `purpose` | The first sentence under the page's "Purpose" heading. It is what makes "is there a component for this" a search of one file |
| `classes` | Every `mx-*` class in the component's stylesheet. Generated, so the class check below knows a part's class without anyone listing it |
| `doc` | The page's path from the package root |

### `llms.txt` and `llms-full.txt`

- Both at the repository root, generated, committed and in the package.
- `llms.txt` follows the format: the `H1`, a blockquote of one paragraph, sections of links,
  and `Optional` last. It stays near 40 lines, so it does not list the pages one by one. It
  links the skill, the component index (`docs/components.json`, with one line saying what each
  entry holds), `docs/tokens.md`, and the changelog; under `Optional`, `llms-full.txt` and the
  token sources.
- Its links are relative paths from the package root to files that are in the package. That is
  what makes the copy in `node_modules/@wadakatu/matrix/` work with no network. The published
  copy is the same file with each path replaced by its mirror, `docs/<name>.md` (06, "Before
  the gate"); two pages with one file name fail the script.
- `llms-full.txt` is every page `llms.txt` and the index lead to, joined in that order, each
  under a line with its path.

### One script, one command

`scripts/agent-docs.mjs` writes `docs/components.json`, `llms.txt` and `llms-full.txt`.
`npm run docs` runs it after the tokens page, so one command regenerates everything that is
generated (09, constraint 10). With `--check` it writes nothing and fails on a difference,
which is how `npm run check` uses it. It is Node, as every script here is; TOMBO's was Python
and only the habit carries over.

### The package

The tarball gains `docs/components.json`, `llms.txt`, `llms-full.txt`, `skills/matrix/`,
the consumer stylelint config and the drift script, and the package-contents gate lists them.
"Docs" in 01 means these and `docs/tokens.md`: the design set, the research, the history and
the verification stills are not reference for a consumer and stay out.

### The skill

`skills/matrix/SKILL.md`, to the outline above. Settled here:

- It names every file by its path from the package root, and says once that the root is
  `node_modules/@wadakatu/matrix/` in a consuming repository and the repository itself here.
  A path that climbs out of the skill (`../../docs/…`) is not used: the consumer reaches the
  skill through a link (above), and a tool that tidies the path before opening it would land
  beside the link, not in the package. `references/index.md` is the one reference file: each
  topic and the path that answers it.
- The body stays under 200 lines, which is stricter than the specification's 500
  (<https://agentskills.io/specification>).
- Its table of colour roles and its "how you will be caught" lines name tokens and commands,
  so the checks below read it too.

### The consumer's checks

| Shipped | What it is | How the consumer runs it |
| --- | --- | --- |
| `@wadakatu/matrix/stylelint` | The no-raw-values rules as a shareable config. This repository's `stylelint.config.mjs` extends it and adds only what is its own: the Baseline ledger and the exception for `dist/tokens.css`. The rules a consumer runs are the rules matrix is held to | `extends` in its stylelint config ([docs](https://stylelint.io/user-guide/configure#extends)). stylelint is the consumer's own development dependency |
| `scripts/drift.mjs` | Unknown `--mx-*` property, and `mx-*` class that is not in `components.json`, in the files it is given. No dependency. `npm run check` runs the same file on `src/` | By its path: `node node_modules/@wadakatu/matrix/scripts/drift.mjs src`. 01's exports have no name for it, and none is added |

`MxToken` (`dist/tokens.d.ts`) already gives the type error on an unknown token in TypeScript.

### The freshness checks, all in `npm run check`

| Check | Fails when |
| --- | --- |
| `docs/tokens.md` (exists) | The page differs from what the tokens generate |
| `docs/components.json`, `llms.txt`, `llms-full.txt` | Any differs from what the script generates |
| Pages | A directory has no page; a page lacks one of the seven headings or a front matter field |
| Tokens on a page | The rule under "Every component page" |
| Links | A path in `llms.txt`, the skill or its reference file is not a file, or is not in the package |
| Tokens and classes in prose | The skill or `llms.txt` names a token or an `mx-*` class that does not exist |
| The skill | `name` is not `matrix`; the description is over 1024 characters; the body is over 200 lines |
| `AGENTS.md` | It is 100 lines or more; it names an `npm run` command that `package.json` does not have; `CLAUDE.md` is anything but `@AGENTS.md` |

### The accept run

The question of 09, task 6.4: "which component renders a key and value list, and which tokens
does it read".

- Asked of a session that has nothing but a checkout of the commit and this sentence: "Read
  `AGENTS.md`, then answer from the files in this repository", followed by the question. No
  other context, no hint of the answer, no network.
- It passes when the answer names Figures (`.mx-figures`), its token list is the list in
  `docs/components.json`, and the files it opened are in the repository. It may mention the
  Fetch card, whose lines are keys and values too; it must not give it as the answer.
- The pull request shows the prompt, the files opened and the answer, as they came. The
  implementing agent can run it as a subagent that is given only that prompt, and says that is
  what it was. wadakatu can repeat it in a session of his own.
- For it to pass, `AGENTS.md` loses its note that `components.json` "is generated once
  components exist", and gains the one command that regenerates it.

## Standard practice, and the departures

| Practice | Source | matrix |
| --- | --- | --- |
| `AGENTS.md` at the root, short | <https://agents.md/> | Same |
| A skill with progressive disclosure | <https://agentskills.io/specification> | Same |
| `llms.txt` plus Markdown mirrors on the docs site | <https://llmstxt.org/> | Same, and additionally shipped inside the package |
| A design-system MCP server | Storybook MCP; others | Storybook's, in development only. No custom server: two JSON files answer the same questions without a process to run |
| `DESIGN.md` | <https://github.com/google-labs-code/design.md> | Not adopted. The format is at version `alpha` by its own README, and it restates tokens in YAML, which would be a second copy of the DTCG source. Revisit when it stabilises; it could then be generated |

## Not doing

- **A custom MCP server.** See the table.
- **Per-agent rule files** (`.cursorrules`, Copilot instructions). `AGENTS.md` is read by the
  agents in use here.
- **Generated prose.** Component pages are written by hand to a fixed outline. Only indexes
  and concatenations are generated.
