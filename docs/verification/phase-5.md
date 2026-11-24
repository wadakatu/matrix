# Phase 5 — side by side with the prototype

The Phase 5 exit (09): specimen "Article" renders both prototyped posts' structure with fixture text
(04, "The Article specimens") and passes every automated row of the verification matrix in 05; and
definition of done, point 7 (04), for the approved Reading components: Masthead, Contents, Prose, Code
block, Reference link, Post foot, Share and Index. The seven drafts (code title, diff, callout,
details, table, task list, footnotes) have stories and baselines, not prototype stills: the prototype
has none of them.

Prototype: wadakatu.github.io `93ca12d`, built with `astro build` in a scratch worktree (removed
afterwards). Both sides were rendered in the same Chromium (Playwright 1.65.1) with the same font
files: the prototype's Google Fonts request was answered with matrix's `dist/fonts.css`, and every
other request to another origin was aborted, so the prototype's images (on `storage.googleapis.com`)
show their `alt` text. `?motion=0` on both. Prototype pages: `/proto/matrix/blog/431afa748fbed1/`
(post A), `/proto/matrix/blog/da5be52d57e9a1/` (post B) and `/proto/matrix/blog/`; matrix:
`src/specimens/article-a.astro`, `article-b.astro` and `blog.astro`. In each sheet the prototype is
first, matrix second.

| Sheet | What |
| --- | --- |
| [`phase-5/cmp-article-a-1440.png`](phase-5/cmp-article-a-1440.png) | Article A's first 1400px at 1440, half size: masthead, Contents rail, the start of the body. Phosphor-night, then operator-day |
| [`phase-5/cmp-article-a-390.png`](phase-5/cmp-article-a-390.png) | Article A's first 1700px at 390, full size, phosphor-night: masthead, Contents closed, the body |
| [`phase-5/cmp-code-1440.png`](phase-5/cmp-code-1440.png) | Code blocks and Reference links from 方法1 at 1440, half size: phosphor-night, then phosphor-day |
| [`phase-5/cmp-code-390.png`](phase-5/cmp-code-390.png) | The same at 390, operator-night: the 131-character line wrapping |
| [`phase-5/cmp-images-1440.png`](phase-5/cmp-images-1440.png) | Article B's second section at 1440, half size: inline code, a Reference link, an image |
| [`phase-5/cmp-foot-1440.png`](phase-5/cmp-foot-1440.png) | The end of the body and the Post foot at 1440, half size: article B (Older) in phosphor-night, article A (Newer) in operator-night |
| [`phase-5/cmp-foot-390.png`](phase-5/cmp-foot-390.png) | Article B's Post foot at 390 |
| [`phase-5/cmp-index-1440.png`](phase-5/cmp-index-1440.png), [`cmp-index-390.png`](phase-5/cmp-index-390.png) | The Blog index |

The three Article specimens and the Blog index, as stills, in all four contexts at 1440 and 390, are
visual baselines (`tests/visual/snapshots/specimens-article-*`, `specimens-blog-*`); every Reading
component's `Contexts` and `Narrow` stories are too (`stories-reading-*`).

## Measured on both

From the script that rendered the sheets, the same Chromium, post A against Article A (left, top,
width × height in CSS pixels):

| At 1440 × 900 | Prototype | matrix |
| --- | --- | --- |
| Masthead | 80, 123, 1056 × 260.5 | 80, 123, 1056 × 260.5 |
| Title | 265, 180.1, 826 × 110.2 | 265, 180.1, 826 × 110.2 |
| Contents rail | 80, 407.5, 264 × 761.5 | 80, 407.5, 264 × 761.5 |
| Body panel (left, top, width) | 368, 407.5, 768 | 368, 407.5, 768 |
| First `h2` | 413, 436.5, 678 × 34.1 | 413, 436.5, 678 × 34.1 |
| First Reference link | 413, 812.2, 678 × 40.1 | 413, 812.2, 678 × 40.1 |
| First list item | 438.5, 579.4, 652.5 × 34 | 438.5, 579.4, 652.5 × 34 |
| First code block (two lines) | 678 × 107 | 678 × 107 |
| Copy | 53.8 × 26 (`Copy`) | 61 × 26 (`コピー`) |
| Post foot (left, width) | 80, 1056 | 80, 1056 |

| At 390 × 844 | Prototype | matrix |
| --- | --- | --- |
| Masthead (left, top, width) | 13.3, 103.6, 363.5 | 13.3, 103.6, 363.5 |
| Title | 30.3, 160.7, 329.5 × 139.2 (four lines) | 30.3, 160.7, 329.5 × 139.2 (four lines) |
| Contents, closed | 363.5 × 46 | 363.5 × 46 |
| First `h2` | 329.5 × 68.2 | 329.5 × 68.2 |
| First code block | 329.5 × 107 | 329.5 × 107 |

Characters per line, measured by `tests/reading.spec.mjs` on Articles A and B (the body's content
box over its font size), against the prototype's figures in `MATRIX-NOTES.md` ("Blog post pages"):

| Width | Prototype | matrix | Body |
| --- | --- | --- | --- |
| 390 | 20.6 | 20.6 | 16px / 32px |
| 768 | 38.4 | 38.4 | 17px / 34px |
| 1100 | 38.1 | 38.1 | 17px / 34px |
| 1440 | 39.9 | 39.9 | 17px / 34px |

Title size: 24px at 390, 26.1px at 768, 37.4px at 1100, 38px at 1440, as the prototype's notes give.

## Differences, each with its reason

| Where | Difference | Why |
| --- | --- | --- |
| Everywhere | Fixture words, slugs, tags, addresses under `example.com` and drawn fixture images, in the posts' structure | 04, "The Article specimens": nothing from the posts is copied. Paragraph lengths follow the posts' rendered blocks, so heights below the first section differ where a fixture sentence wraps differently (the masthead and a list item at 390, for example) |
| Chrome on an article | Japanese: 目次, 共有, X に投稿, リンクをコピー, 古い記事, 記事一覧, 6分で読めます, and the header and footer in Japanese | L6 and decision Q8: one language per page, and the article is Japanese. The prototype set an English chrome on a Japanese page, marked `lang="en"`. Those runs are therefore in M PLUS 1 Code where the prototype's were in IBM Plex Mono |
| Masthead | Category in Japanese (技術, 生活) | The category is the site's text; the fixture writes it in the page's language |
| Post foot, the prototype at 390 and 1440 | The prototype shows a `Share…` button that does nothing; matrix shows it only where `navigator.share` exists | The prototype's `.control { display: inline-flex }` overrode the button's `hidden`. 5.1: "share sheet only where it exists" |
| Footer | No shortcut off switch on an article or the index | An article is a single-reading document, where the shortcut has nothing to switch (settled in Phase 3) |
| Images, prototype side | `alt` text in place of the pictures | Requests to other origins were aborted for the capture, as above |
| Copy | `コピー` is wider than `Copy` (61 against 53.8) | The chrome string's length; the box is the prototype's |
| Muted text, phosphor-night | `#80c194` instead of `#7cbd90` | Decision Q9 (02) |
| Footnote back reference (Article C) | Underlined | 04 says not underlined; axe's `link-in-text-block` fails that at `error` (05, 06). Kept as a question below |
| Masthead strip | Strands fall in 5–11s, where the prototype's took 6–12s | The motion catalogue's row for strands (05); a still shows no difference |

Nothing in the structure, spacing, type or colour of the shared parts (masthead, path line, title,
meta and tags, the Contents rail and disclosure, the body's measure, headings and their markers,
lists, links, inline code, the Reference link, code blocks with their tab and Copy, images in their
rule, `hr`, the end-of-file line, Share, the pager and the ways back, the index rows) differs beyond
the rows above.

## Not in the stills

- Contents marking the section being read, the disclosure closing on a choice, Copy and Copy link,
  and the sheet: checked by `tests/reading.spec.mjs`, not frame by frame.
- Print: checked by print emulation in the same file (no rain, no chrome, the day ink, no painted
  surface, the addresses, details open), in all four contexts on the three Articles. The manual PDF
  reading of 05 is for each release candidate.

## Questions

1. **The footnote's back reference is underlined**, where 04 has it "not underlined": without the
   underline axe's `link-in-text-block` fails at `error`, which 05 and 06 make a gate. Keep the
   underline, or design another non-colour cue?
2. **04 counts 27 inline code spans in post A.** The rendered post has 6 (the 27 is the Markdown's
   backtick pairs, fences included). The fixture follows the rendered post. Correct the count in 04?
