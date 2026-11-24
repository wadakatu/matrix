# matrix references

Each topic and the file that answers it. Paths are from the package root:
`node_modules/@wadakatu/matrix/` in a repository that installs matrix, the repository itself in matrix.

| Topic | Path |
| --- | --- |
| Does a component exist for this; what it takes and reads | [docs/components.json](docs/components.json) |
| One component's contract, variants, tokens and accessibility | its `doc` in the index, for example [src/components/panel/panel.md](src/components/panel/panel.md) |
| Every token, its value in each context, what it is for | [docs/tokens.md](docs/tokens.md) |
| The token sources (DTCG 2025.10) and the resolver | [tokens/matrix.resolver.json](tokens/matrix.resolver.json), [tokens/base.tokens.json](tokens/base.tokens.json) |
| Resolved values per context, for scripts | [dist/tokens.json](dist/tokens.json) |
| Reset, base type, focus ring, derived properties, `.mx-frame`, `.mx-vh`, `.mx-skip` | [src/css/foundations.md](src/css/foundations.md) |
| The page frame, and `<mx-root>` | [src/components/layout/layout.md](src/components/layout/layout.md), [src/components/root/root.md](src/components/root/root.md) |
| The pre-paint script and the flags (`theme`, `palette`, `motion`, `boot`) | [src/head/head.md](src/head/head.md) |
| Text that decodes out of the corpus | [src/effects/decode/decode.md](src/effects/decode/decode.md) |
| The whole stylesheet | [dist/matrix.css](dist/matrix.css) |
| The Astro components | [src/astro.ts](src/astro.ts) |
| The lint rules a site runs | [stylelint/index.mjs](stylelint/index.mjs) |
| The drift check a site runs | [scripts/drift.mjs](scripts/drift.mjs) |
| What changed in each version | [CHANGELOG.md](CHANGELOG.md) |
| Everything above in one file | [llms-full.txt](llms-full.txt) |
| Building matrix itself: commands, laws, where things go | [AGENTS.md](AGENTS.md) |
