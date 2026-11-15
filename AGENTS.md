# AGENTS.md — matrix

## What this is

matrix is wadakatu's personal design system and the source of truth for how wadakatu.dev
looks, moves and reads: one package, `@wadakatu/matrix`, in four layers (tokens → CSS →
custom elements → Astro components). It is distilled from the approved `/proto/matrix/`
prototype. Start with [`docs/matrix-design/00-principles.md`](docs/matrix-design/00-principles.md);
the plan being executed is [`09-implementation-plan.md`](docs/matrix-design/09-implementation-plan.md).

## Commands

Tools are pinned in `mise.toml` (Node) and `package-lock.json`.

| Command | Does |
| --- | --- |
| `npm ci` | Install |
| `npm run build` | Tokens, the flattened stylesheet and the fonts, into `dist/` |
| `npm run check` | Every gate that needs no browser. Needs `npm run build` first |
| `npm run docs` | Regenerate `docs/tokens.md` after a token change; commit it |
| `npm run test:specimens` | Playwright on the specimen pages. Needs `npm run build` and `npx playwright install chromium` |

Storybook and the visual tests arrive with Phase 2 (09, tasks 2.1 and 2.2); their commands,
and how to update baselines, are added here then.

## The seven laws (00)

- **L1** Only real words fall: decoration is made of the site's own data; no placeholder glyphs, no fake metrics.
- **L2** Reading text never sits on rain; dim text with colour, never `opacity`.
- **L3** Two readings, one source: 機械用 and 人間用 render the same data.
- **L4** Every effect has a still; motion is stepped, finite, skippable and fails open.
- **L5** The mark is whole: the designer's file, never cropped, rounded, rotated, masked or redrawn.
- **L6** One language per page; a run of the other language carries `lang`.
- **L7** Night first, phosphor first; components read roles (`accent`), never a hue.

## Before writing anything

- Read the component's `<name>.md`. Search `docs/components.json` before creating a
  component (it is generated once components exist, 07).
- Use tokens only: `docs/tokens.md` lists every one, with what it is for.

## Where things go

Everything about a component lives in `src/components/<name>/`: `<name>.css`,
`mx-<name>.ts`, `<Name>.astro`, `<Name>.stories.ts` and `<name>.md`. Effects use the same
shape in `src/effects/<name>/`. Tokens are in `tokens/`; the foundation CSS is in `src/css/`;
gates are in `scripts/`; tests are in `tests/`.

## Definition of done (04)

1. The doc has the seven headings and its contract matches the Astro component's output.
2. It reads only tokens; the "no raw values" gate passes.
3. Stories: default, every variant and state, all four contexts in one grid, Japanese, the still.
4. Accessibility checks pass at `error`; the keyboard path is in the doc.
5. It works with JavaScript disabled, or its doc says exactly what is missing.
6. Visual baselines are committed for 1440 and 390 wide.
7. Approved components: a side-by-side still against the prototype, every difference listed.

## Never

- A raw colour, font size or z-index outside the tokens.
- A hue in a name (`green`, `amber`): name the role.
- Reading text on rain.
- An endless animation without a row in the motion catalogue (05).
- A logo that is cropped, rounded, transformed or redrawn. The logo is not MIT and is not in the package.
- A request to a third-party origin at runtime.
- A baseline updated to make an unexplained failure pass.

## Git

- English Conventional Commits, without `Co-Authored-By`.
- Never push to `main`: branch, open a pull request, merge when CI is green.
- Do not rename the repository or change Pages, DNS or repository settings; never publish to npm.
