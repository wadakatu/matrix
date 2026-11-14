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
