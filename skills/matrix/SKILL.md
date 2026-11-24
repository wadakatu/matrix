---
name: matrix
description: Build and review UI with matrix, wadakatu's design system (@wadakatu/matrix) for wadakatu.dev. Use when building or changing any page, component or style for wadakatu.dev or for matrix itself; when choosing colours, type, spacing or motion; when adding a component; and when reviewing UI for consistency with the system. It says where to look before writing markup, which tokens to read by role, the seven laws and the check that catches each, how to add a component, and gives one worked example.
---

# matrix

Every path here is from the package root: `node_modules/@wadakatu/matrix/` in a repository that
installs matrix, the repository itself when working on matrix. For a topic not covered below, open
[skills/matrix/references/index.md](skills/matrix/references/index.md).

## 1. Search before creating

1. Open [docs/components.json](docs/components.json). Each entry has `name`, `status`, `class`,
   `element`, `attributes`, `tokens`, `purpose`, `classes` and `doc`. Search `purpose` and
   `classes` for what you need.
2. If an entry fits, read its page (its `doc` path, for example
   [src/components/figures/figures.md](src/components/figures/figures.md)) and copy its Contract:
   the HTML with every class, attribute and ARIA it needs. Variants and states are attributes.
3. In an Astro site, use the component from `@wadakatu/matrix/astro` rather than writing the markup.
4. Only when no entry fits, compose from existing components; a new component is made in matrix
   (section 5), never in the site.

`approved` components are ported from the approved prototype: use them as they are. `draft` ones are
designed in matrix and may still change.

## 2. Tokens by role

Read every colour, type size, space, radius, layer and duration as a custom property:
`var(--mx-color-accent)` for `color.accent`. [docs/tokens.md](docs/tokens.md) lists them all with
their values in the four contexts (phosphor or operator, night or day). In TypeScript the type
`MxToken` (`dist/tokens.d.ts`) names every token. Never write a hex, a named colour, a pixel font
size or a number z-index.

| Role | Use it for |
| --- | --- |
| `color.ground` | The page; text on a filled accent face; the code block background |
| `color.panel` | The solid surface reading text sits on; hover fills |
| `color.text` | All running text |
| `color.text-lead` | Short emphasised runs: titles, `strong`, hover. Not paragraphs |
| `color.text-muted` | Meta, captions, hints. Dim text with this, never `opacity` |
| `color.accent` | Identity, links, headings, prompts, current state. Never body text; never assume green |
| `color.on-accent` | Text on an accent fill |
| `color.focus` | Focus outlines only |
| `color.control-border` | The box of a control identified by its box |
| `color.rule` | Decorative hairlines only; never a control's only boundary |
| `color.glow` | The name line and lit bits in 機械用; never reading text |
| `color.rain.tail`, `color.rain.body`, `color.rain.head` | Rain drops. Decoration, never text |
| `color.reading.human`, `color.reading.machine` | The capsule switch's dots only |
| `color.scanline` | The 機械用 scan-line wash only |

Fluid sizes are derived properties, not tokens: `--mx-text-title`, `--mx-text-entry`,
`--mx-text-prompt`, `--mx-measure`, `--mx-pad` ([src/css/foundations.md](src/css/foundations.md)).

## 3. The seven laws, and how you will be caught

| Law | Check | How you will be caught |
| --- | --- | --- |
| L1 Only real words fall | Decoration (rain, strands, decode, boot lines) is made of the site's own data; no placeholder glyphs, no invented metrics | Review. In matrix, `npm run test:specimens` checks the masthead's strip holds only the masthead's words |
| L2 Reading text never sits on rain | Text is on `color.ground` or `color.panel`; dimmed with `color.text-muted` | `npm run check` fails a role under its contrast floor or rain over its ceiling, in all four contexts; `npm run test:stories` runs axe at `error` |
| L3 Two readings, one source | 機械用 and 人間用 render the same data | Review; the specimens render both readings from one fixture |
| L4 Every effect has a still | Motion is stepped, finite and skippable; the still is what reduced motion, `?motion=0` and no JavaScript show | `npm run test:specimens`: with Hold rain on, no endless animation runs; the stills of rain, the switch and the boot are tested |
| L5 The mark is whole | The logo file as designed: no crop, radius, mask, transform or redraw | `npm run test:specimens` checks the mark is the real file, whole, and that the boot moves a cover, not the image |
| L6 One language per page | A run of the other language carries `lang` | `npm run test:specimens` checks such a run takes its own face; `npm run test:visual` checks an English page marks an article's Japanese title and headings |
| L7 Night first; roles, never hues | No hue in a name; read `color.accent`, never green | The stylelint config fails a hex, a named colour or a colour function; the drift script fails an unknown `--mx-*` property or `mx-*` class |

In a repository that uses matrix, two of these are yours to run:

- `extends: ["@wadakatu/matrix/stylelint"]` in your stylelint config
  ([stylelint/index.mjs](stylelint/index.mjs)): no raw colour, font size or z-index; only the four
  breakpoints, 600, 720, 1100 and 1360px.
- `node node_modules/@wadakatu/matrix/scripts/drift.mjs src` ([scripts/drift.mjs](scripts/drift.mjs)):
  every `--mx-*` property is a token or matrix's, and every `mx-*` class is in the index.

## 4. Page patterns

| Pattern | What it fixes | Specimen |
| --- | --- | --- |
| Machine-first landing | The site opens as the shell; four visible ways to 人間用 | `home` |
| Twin routes | 機械用 owns the short address; 人間用 is the same tree under `human/` | `human-home`, `projects`, `human-projects` |
| Single-reading document | An article has one address; its switch links into the shell at its file | `article-a`, `article-b`, `article-c` |
| Article page | Masthead, contents beside one body panel, rain as a band | `article-a`, `article-b`, `article-c`, `blog` |
| Moved address | A stub page, because GitHub Pages cannot redirect | `moved` |
| Notice page | 404 and offline: one panel, no chrome, nothing to fetch | `not-found`, `offline` |
| Language twin | English at the root, Japanese under `/ja/`, linked with `hreflang` and the language link | None; see [src/components/lang/lang.md](src/components/lang/lang.md) |

Specimens are full pages in matrix's Storybook, under Specimens; they are not in the package.

## 5. Adding a component (in matrix)

1. Search the index first (section 1). Add a component only for a need no entry meets.
2. Make `src/components/<name>/` with `<name>.css`, `mx-<name>.ts` (only if it has behaviour),
   `<Name>.astro`, `<Name>.stories.ts` and `<name>.md`.
3. The page has front matter in this order: `name`, `status`, `class`, `element` (each where there is
   one), `attributes`, `tokens`; then seven headings: Purpose, Contract, Variants and states,
   Behaviour, Tokens, Accessibility, Do / Don't. `tokens` lists exactly what its files read.
4. Run `npm run docs` (regenerates the index, `llms.txt` and `llms-full.txt`), then `npm run build`
   and `npm run check`.

Done means (04):

1. The doc has the seven headings and its contract matches the Astro component's output.
2. It reads only tokens; the no-raw-values lint passes.
3. Stories: default, every variant and state, all four contexts in one grid, Japanese, the still.
4. Accessibility checks pass at `error`; the keyboard path is in the doc.
5. It works with JavaScript disabled, or its doc says exactly what is missing.
6. Visual baselines are committed for 1440 and 390 wide (`npm run test:visual:update`, in Docker).
7. Approved components: a side-by-side still against the prototype, every difference listed.

## 6. Worked example

**Input.** "On 人間用 Projects, add a list of each project's latest commit subjects."

**Search.** `docs/components.json` has Log, whose purpose reads "A list of the repository's real
commit subjects, the material the rain is made of (L1)." It fits, so nothing is created. Its page,
[src/components/log/log.md](src/components/log/log.md), gives the contract; Panel's gives the
surface it sits on (L2).

**Output, the markup:**

```html
<section class="mx-panel" aria-labelledby="commits">
  <h2 id="commits">Latest commits</h2>
  <ol class="mx-log"><li>feat: …</li><li>fix: …</li></ol>
</section>
```

The subjects come from the site's data, filtered as the corpus is (L1); 機械用 shows the same
subjects (L3).

**Output, the tokens read:** Log's `tokens` in the index, `color.rule`, `font.size.meta`,
`space.1`, `space.4`, `border.width.hair`, and Panel's, which begin `color.panel`, `color.rule`,
`color.accent`. The site adds no CSS of its own for the list.

**Output, the stories:** none, because matrix did not change. Had Log needed a new variant, the
change would be made to Log in matrix, with its stories gaining that variant in the Contexts grid,
in Japanese and as a still, and `npm run docs` run before `npm run check`.
