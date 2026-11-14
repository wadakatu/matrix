# 04 — Components inventory

Every component matrix ships in 1.0, what it is made of, where it comes from in the
prototype, and what is still undesigned.

The prototype is the behavioural specification. Paths below are in
`/Users/koyoisono/dev/wadakatu.github.io-design` (branch `design/explore`, head `93ca12d`):
styles in `public/styles/proto/matrix.css` and `matrix-blog.css`, markup in
`src/layouts/ProtoMatrixLayout.astro` and `src/pages/proto/matrix/`, behaviour in
`public/scripts/proto-matrix.js`, `proto-matrix-blog.js` and `_term.ts`, and the measured
acceptance lists in `docs/design-explore/MATRIX-NOTES.md`.

## How a component is defined

Each component directory (`src/components/<name>/`) holds up to five files, and its doc
(`<name>.md`) has the same seven headings every time, so that a person or an agent always
finds the same thing in the same place:

1. **Purpose**: one sentence, and which law (00) it serves.
2. **Contract**: the HTML, with every class, attribute and required ARIA.
3. **Variants and states**: by attribute. What each looks like in all four contexts.
4. **Behaviour**: what the element adds, and what works without it.
5. **Tokens**: the roles it reads. No component reads a role it does not list.
6. **Accessibility**: name, role, keyboard, focus, reduced motion, forced colours.
7. **Do / Don't**: at most three of each.

Status values used below:

- **approved**: exists in the prototype and was approved there. Port it; do not redesign it.
- **draft**: required for the site but not in the prototype. Designed during
  implementation from existing tokens, shown to wadakatu in Storybook before 1.0.
- **gap**: needs a design decision before it can be built.

## Inventory

### Foundations

| Component | Class / element | Status | Notes |
| --- | --- | --- | --- |
| Reset | `@layer mx.reset` | approved | Box sizing, margins, list styles. From the top of `matrix.css` |
| Base | `@layer mx.base` | approved | Body type, links (1px underline, 4px offset; 2px on hover), `::selection`, `kbd`, `:lang(ja)` rules |
| Focus ring | `:focus-visible` | approved | 2px `focus`, 3px offset. Variants in 05 |
| Frame | `.mx-frame` | approved | `max-width: size.frame`, inline padding `--mx-pad`. Unbounded in 機械用 |
| Visually hidden | `.mx-vh` | approved | — |
| Skip link | `.mx-skip` | approved | First tab stop; accent fill, `on-accent` text |
| Status | `.mx-status` (`role="status"`) | approved | One polite live region per page, written by `mx-readings` |

### Chrome

| Component | Class / element | Status | Prototype source | Notes |
| --- | --- | --- | --- | --- |
| Head | `Head.astro` | approved | head of `ProtoMatrixLayout.astro` | Meta, fonts, the pre-paint script (03). No visible output |
| Layout | `Layout.astro`, `<mx-root>` | approved | `ProtoMatrixLayout.astro` | Skip link, rain slot, header, `main`, footer, status. `mx-root` owns theme, palette, motion and flag-carrying links |
| Header | `.mx-header` | approved | `.top` | One row. 69px at 1440; 53px below 720px |
| Mark | `.mx-mark` | approved | `.mark` | Home link: logo then `wadakatu_`. The wordmark names the link; the logo's `alt` is empty |
| Logo | `.mx-logo` | approved | `.logo` | Law L5. Sizes: 44px header, 32px compact header, fluid in the fetch card and boot |
| Nav | `.mx-nav` | approved | `.top nav` | Links in 人間用; a numbered window list (`0:Home*`) in 機械用, by CSS counters |
| Menu | `.mx-menu`, `<mx-menu>` | approved | `.menu` | A native `<details>`. Below 720px a disclosure; from 720px it lays no box (`display: contents`) |
| Control | `.mx-control` | approved | `.control` | One look for a button, a link, and a label wrapping a checkbox. Filled when `aria-pressed="true"` |
| Theme toggle | `.mx-control[data-action="theme"]` | approved | `#theme-toggle` | "Daylight" |
| Palette toggle | `.mx-control[data-action="palette"]` | approved | `#palette-toggle` | "Operator colours" |
| Hold rain | `.mx-control` + checkbox | approved | `.hold` | A checkbox, so it works without JavaScript |
| Switch | `.mx-switch`, `<mx-switch>` | approved | `.switch`, `.pill`, `_Pill.astro` | The reading switch. Specified below |
| Guide | `.mx-guide` | approved | `.guide` | The first row of 機械用: what this is, and the way to 人間用. Dismissible; remembered |
| Status line | `.mx-modeline` | approved | `.modeline` | Accent fill. Mode, location, Japan time, the way back |
| Footer | `.mx-footer` | approved | `.foot` | Contact links, logo credit, the shortcut's off switch |
| Moved | `Moved.astro` | approved | `_Moved.astro` | A stub for an old address: refresh, canonical, visible link, query carried |
| Language link | `.mx-lang` | draft | TOMBO's Pages site | A plain link to the same page in the other language, with `hreflang` (L6). Not rendered on articles, which have no twin (decision Q8) |

### Surfaces and data

| Component | Class | Status | Prototype source | Notes |
| --- | --- | --- | --- | --- |
| Panel | `.mx-panel` | approved | `.panel` | Solid `panel`, 1px `rule`. The surface reading text sits on (L2). Its `h2` is `body` size, medium, accent |
| Lede | `.mx-lede` | approved | `.lede`, `.cap` | Muted, capped at `size.measure.lede` |
| Figures | `.mx-figures` | approved | `.figures` | A `dl` of key and value, dotted rule between rows, tabular numerals |
| Inline list | `.mx-inline-list` | approved | `.skills`, `.links`, `.after` | Wrapping row of links or words |
| Log | `.mx-log` | approved | `.log` | A list of commit subjects, dotted rules |
| Meta | `.mx-meta` | approved | `.meta` | `meta` size, muted, tabular numerals |

### Signature

| Component | Class / element | Status | Prototype source | Notes |
| --- | --- | --- | --- | --- |
| Name | `.mx-name` | approved | `.name`, `etch` in `_lib.ts` | The page's `h1`. Giant and masked with the commit log from 720px; solid below. A terminal line with a cursor in 機械用 |
| Rain | `.mx-rain`, `Rain.astro` | approved | `.rain`, `rainColumns()` | Specified below |
| Stream | `.mx-stream`, `Stream.astro` | approved | `_Stream.astro` | One entry: strands of its own words falling beside (or above) its readable text |
| Streams | `.mx-streams` | approved | `.streams` | `data-variant="rows"` (stacked) or the default wall (seven columns from 1360px) |
| Readings | `<mx-readings>`, `Readings.astro` | approved | `view-page` / `view-machine`, `swap()` | Holds both readings; the in-place change. Specified below |
| Boot | `.mx-boot`, `<mx-boot>` | approved | `.boot` | The intro. Specified in 05 |
| Curtain | `.mx-curtain` | approved | `.curtain`, `.slab` | 24 slabs of corpus text; covers the page as the boot ends |
| Scan lines | root effect | approved | `body::after` in 機械用 | A fixed wash of `color.scanline` on one pixel row in three |
| Decode | `decode()` in `lib` | approved | `decode()` in `proto-matrix.js` | Text settles out of corpus glyphs. Pools come from the corpus (L1) |
| Rewards | `[data-echo]`, `.mx-ghost` | approved | déjà vu, title-to-commit, the name doubling | Three small one-shot effects. Off with reduced motion and while rain is held |

### Terminal

| Component | Class / element | Status | Prototype source | Notes |
| --- | --- | --- | --- | --- |
| Terminal | `.mx-terminal`, `<mx-terminal>` | approved | `_Terminal.astro`, `_term.ts` | Specified below |
| Screen | `.mx-terminal-screen` | approved | `.screen` | A labelled, focusable group; the scroll container of the live shell |
| Line | `.mx-ln` | approved | `.ln` | One line of output. Tone by `data-tone` (`dim`, `hi`, `dir`) on spans |
| Prompt | `.mx-prompt` | approved | `.ps1`, `.field`, `.cur` | A real `<input>` with a drawn block cursor |
| Run | `.mx-run` | approved | `.run` | A tappable command in output. A button outside the tab order |
| Chips | `.mx-chips`, `.mx-chip` | approved | `.chips` | Suggested commands; on touch, the keys a phone lacks first |
| Fetch card | `.mx-fetch` | approved | `.fetch` | The mark beside key and value lines (neofetch) |
| Login card | `.mx-login` | approved | `.login-card` | The first fetch card as a `<details>` below 720px, closed |
| Swatches | `.mx-swatch` | approved | `.sw0`–`.sw7` | Eight theme colours: panel, rule, rain tail, rain body, muted, text, lead, accent |
| Takeover | `.mx-takeover` | approved | `.vim` | A full-screen view inside the screen whose command line is the prompt |

### Reading (blog)

| Component | Class / element | Status | Prototype source | Notes |
| --- | --- | --- | --- | --- |
| Masthead | `.mx-masthead` | approved | `.post-head` | Path line, title (`h1`), date, category, reading time, tags. A strip of the article's own words beside it from 720px |
| Contents | `.mx-toc`, `<mx-toc>` | approved | `.toc` | One `<details>`. Sticky rail from 1100px; a disclosure below. Marks the section being read with `aria-current="location"` |
| Prose | `.mx-prose` | approved (core) | `.prose` | Specified below |
| Reference link | `.mx-ref` | approved | `a.ref` | A link whose text is its own URL: host, then path |
| Code block | `.mx-code`, `<mx-copy>` | approved (core) | `.prose pre`, `.copy` | Ground cut into the panel; language as a tab; Copy. Shiki's `css-variables` mapped to roles |
| Code title | part of `.mx-code` | draft | — | 11 of the 73 code fences carry a filename (`lang:filename`, Zenn syntax). The filename becomes the tab |
| Diff | part of `.mx-code` | draft | — | 5 fences are `diff`. Added and removed lines marked by a gutter sign and weight, not by hue alone |
| Callout | `.mx-callout` | draft | — | `:::message` (4 uses) and `:::message alert` (2). A panel with a labelled left rule |
| Details | `.mx-details` | draft | — | `:::details` (3 uses). A native `<details>` styled as the login card is |
| Table | `.mx-prose table` | draft | — | No post has one yet; styled so that one can never appear unstyled. Scrolls inside its own wrapper |
| Task list, footnotes | `.mx-prose` | draft | — | No post uses either yet; styled so that neither can appear unstyled |
| Post foot | `.mx-postfoot` | approved | `.post-foot` | End-of-file line, share, older / newer, ways back |
| Share | `.mx-share`, `<mx-share>` | approved | `.share` | Post on X (a link), Copy link, and the system sheet where `navigator.share` exists |
| Index | `.mx-index` | approved | `.index` | Date and title per row |

Markdown feature counts come from the 18 files in `src/content/blog/` at `93ca12d`
(`10-verification-log.md`, table M4).

### Gaps

| Missing | Why it matters | Proposed handling |
| --- | --- | --- |
| About page | The header links to `/about/`, which is still the TOMBO page | Compose from Panel, Figures, Stream and Prose. A site-level design task (08); no new component expected |
| 404 and offline | Both exist in production; offline must render with no network | `Moved`-like single-panel page. Offline inlines `tokens.css` and one component stylesheet, which the per-component exports allow |
| Japanese chrome | L6 needs chrome strings in `ja`; the prototype's chrome is English only | `strings/ja.ts`, shipped with `strings/en.ts` and reviewed by wadakatu before 1.0 (09, task 2.6) |
| Print | TOMBO has print hardening; the prototype has none | A minimal print layer for articles: no rain, no chrome, ink on paper, URLs after links |
| OG image, favicons | The prototype uses the logo file as the OG image | Site tooling reads `tokens.json`. Not components |
| Logo derivatives | The 400px PNG is 240,877 bytes and is loaded for a 44px header mark | Downscaled copies generated by script from the designer's file, never redrawn, as production already does (08, "The logo") |

Deliberately not carried over from TOMBO: forms, charts, the topbar, dimension lines, the
volume dial. Nothing on the site renders them.

## Specifications for the complex components

### Switch

The choice between the two readings. Two real links to two static routes, so it works
without JavaScript; the element only makes the change happen in place.

```html
<mx-switch class="mx-switch" role="group" aria-label="Reading">
  <a class="mx-switch-side" data-to="human" href="/human/" aria-current="true">
    <span class="mx-switch-label" lang="ja">人間用</span>
  </a>
  <a class="mx-switch-side" data-to="machine" href="/">
    <span class="mx-switch-label" lang="ja">機械用</span>
  </a>
</mx-switch>
```

| Variant | Where | Drawing |
| --- | --- | --- |
| `rain` (default) | Header, boot layer | Each name is a strand of the rain: upright vertical text in `font.family.dot`. The current side is filled. A drop falls through the idle side every `motion.drip.duration` |
| `rain`, at most 600px wide | Header | One 44×44 button showing the current reading; a hole travels down it and shows the other name. One tab stop, named by its destination (`人間用から機械用へ`) |
| `capsule` | The "Two readings" panel on 人間用 Home | A large capsule with a note under each name and the two dots (`color.reading.*`) |

- Current side in every variant: `accent` fill with `on-accent` text, plus `aria-current="true"`.
- Still (L4): no drop; the idle label is plain `text-muted`. The compact button shows `▾`.
- Forced colours: the current side uses `Highlight` / `HighlightText`.
- On the boot layer neither side is current, and both strands drip half a cycle apart.

`brace` and `bits`, the two other drawings compared in the prototype, are removed
(decision Q5): rain was chosen and they are used nowhere. They are not ported, and neither
is the `?switch=` flag that selected them. They remain in the prototype's history.

### Readings

```html
<mx-readings>
  <h1 class="mx-name">wadakatu</h1>
  <div data-reading="human">…</div>
  <div data-reading="machine">…</div>
</mx-readings>
```

- CSS shows the direct child whose `data-reading` matches the root's.
- Links that lead to a reading carry `data-to="human|machine"` (a different attribute, so
  that the rule above can never hide a link). The element turns a click on any `a[data-to]`
  (the switch, the guide's link, the status line's link) into an in-place change: swap the root attribute, replace the
  address with the static twin plus the carried flags, update the title, announce
  "Machine reading" or "Human reading" in the status region, and move focus if it was
  inside the reading being hidden.
- Shortcut: `\` (and `¥`, the same key on a JIS keyboard), with the prototype's guards
  (modifiers, form fields, editable content, IME composition, already-handled events) and
  the off switch that [2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts)
  requires. The off switch must be reachable from both readings; in the prototype it is
  only in the footer, which 機械用 hides. matrix adds it to the menu.
- The transition is specified in 05. A second request during a change finishes the first.
- Emits `mx:reading` with the new value, so the terminal can take focus.

### Rain

Markup is generated at build time by `lib/rain` from a list of phrases the site passes in.
The layout is seeded, so every build is identical.

| Parameter | Default | From |
| --- | --- | --- |
| Columns × drops | 40 × 3 | `rainColumns()` |
| Glyphs per drop | up to 20 | one piece of one phrase, read top to bottom, brightest at the leading end |
| Script mix | Japanese and Latin phrases alternate | so kana and kanji are always on screen |
| Column speed | one per column, between `motion.rain.duration.min` and `.max` | drops in a column never collide |
| Density | every second column hidden below 1100px; three of four below 720px | — |

- Each drop is one element with a gradient clipped to its text (`rain.tail` → `rain.body` →
  `rain.head`) and one transform animation. Nothing else animates.
- `data-variant="band"` (blog): not fixed to the window; one viewport tall, fading out from
  half way, so it scrolls away when reading starts (L2).
- Hold: `:has(#hold:checked)` without scripts; `[data-rain="held"]` once `mx-root` runs.
- Still: every drop parked at its own height down the whole document, the rain scrolls with
  the page, and the Hold control is hidden because nothing moves.
- Whole layer is `aria-hidden`. The same facts are readable text elsewhere on the page.
- Lessons from the prototype that are requirements here: keyframes use plain units, not
  custom properties (a palette change re-resolved every paused drop and froze Chrome);
  wipes end on `inset(0 0 0 0)`, never `none`; `aria-current` is rewritten only when its
  value changes (`MATRIX-NOTES.md`, "Hold rain recolor").
- Budget: at most 170 animating elements on any page (the prototype's Home has 164), and
  the performance gate in 05.

### Terminal

One shell in one viewport. Without JavaScript it is a recorded session in an ordinary
scrolling page.

```html
<mx-terminal class="mx-terminal" data-cwd="~">
  <p class="mx-guide">…</p>
  <div class="mx-terminal-screen" tabindex="0" role="group" aria-label="Terminal">
    <div class="mx-terminal-tty"><!-- recorded session: .mx-ln lines --></div>
    <div class="mx-takeover" hidden>…</div>
    <form class="mx-prompt">…<input type="text" aria-describedby="…">…</form>
  </div>
  <div class="mx-chips" role="group" aria-label="Keys and suggested commands">…</div>
  <p class="mx-modeline">…</p>
</mx-terminal>
```

What matrix owns:

- **The line editor.** History with draft recall, Tab completion (asking the interpreter),
  Ctrl+L, Ctrl+C, Ctrl+U, Ctrl+A, Ctrl+E, Ctrl+D, PageUp and PageDown. Tab completes only
  when the line has text and the caret is at its end; otherwise it moves focus.
- **The block cursor.** The native caret is hidden and a block shows the character under
  it in reverse. Lit with focus, hollow without; that is the field's focus indicator.
- **The viewport.** With the element live in 機械用, the window does not scroll and the
  session scrolls inside the screen. Height follows `visualViewport`, so an on-screen
  keyboard does not cover the prompt; while it is up the status line and guide give way.
- **The fallback.** If the element has not upgraded `motion.shell.fallback` after scripts
  start, the recorded session gets its scrolling page back.
- **The renderer.** One function turns output items into markup, used at build time for
  the recorded session and at runtime for live output, so the two cannot disagree.
- **The takeover screen** (used by the site's `vim`) and the rain overlay (`cmatrix`).

What the site supplies is an interpreter. This is the prototype's existing model
(`_shell.ts`: `Item`, `Seg`, `Result`, `Fx`), promoted to a contract:

| Member | Shape | Meaning |
| --- | --- | --- |
| `prompt()` | user, host, working directory | What to print before the field |
| `motd()` | items | Lines printed on login |
| `exec(line)` | `{ out: Item[], fx?: Effects }` | Run one line. The interpreter touches nothing; it returns output and asks for effects |
| `complete(line)` | candidates | For Tab |
| `Item` | a line, or a card (image with lines beside it) | A line is segments: text, text with a tone, a link, or a tappable command |
| `Effects` | `open`, `exit`, `clear`, `theme`, `palette`, `takeover`, `overlay`, `navigate` | Requests the terminal carries out; unknown ones are ignored |

Security rules of the renderer, from the prototype's checks: text is always escaped; a
link exists only where the interpreter returned a link segment; nothing a reader typed
(including through `?run=`) ever becomes markup or a link.

matrix ships a small demo interpreter (`help`, `echo`, `ls`, a fetch card, a takeover) for
stories and tests. It contains no personal data and no jokes.

### Prose

Long-form reading, tuned for Japanese. Everything a Markdown renderer can emit is styled.

| Element | Setting |
| --- | --- |
| Body | `font.family.ja`, regular; `read-compact` / `leading.read` below 720px, `read` from 720px. Measure `size.measure.read`. `line-break: strict`; no justification; no negative tracking |
| `h2`, `h3`, `h4` | `heading` / `lead` / body size. The Markdown marker (`##`) is drawn before each as generated content with empty alternative text, so it is seen and not read |
| Links | Underlined, `accent` |
| `strong` | Medium weight, `text-lead` |
| Lists | `-` and numbers in `accent`, set in the mono face |
| `hr`, `blockquote` | A dashed `rule`; a 2px `rule` at the left with muted text |
| Inline code | `ground` fill, 1px `rule`, `text-lead`, 0.9em |
| Images | The real file, never recoloured, in a 1px `rule`, with width and height in the markup |
| Code | See Code block. Long lines wrap |

The title uses `word-break: auto-phrase` and `text-wrap: balance` where supported.

## Patterns

Compositions that are not components but are part of the system, each with a specimen page.

| Pattern | What it fixes |
| --- | --- |
| **Machine-first landing** | The site opens as the shell. The intro's note, the guide line, the header switch and `exit` are four ways to 人間用, none hidden. Without JavaScript the landing is the recorded session with real links |
| **Twin routes** | 機械用 owns the short address; 人間用 is the same tree under `human/`; a `human/` route is canonical to its twin. One helper builds every address |
| **Single-reading document** | An article has one address. Its switch shows 人間用 as current and links into the shell at its file |
| **Article page** | Masthead, then contents beside a single solid body panel; rain as a band; nothing moves beside the text |
| **Moved address** | A stub page, because GitHub Pages cannot send a redirect |
| **Language twin** | The same page in the other language at its own address: English at the root, Japanese under `/ja/` (decision Q8), linked with `hreflang` and a language link (L6). Articles are the exception: one address, one language, no twin |

## Class rename map (prototype → matrix)

For the port. Root-level state classes become attributes or `:defined`.

| Prototype | matrix |
| --- | --- |
| `.frame`, `.vh`, `.skip` | `.mx-frame`, `.mx-vh`, `.mx-skip` |
| `.top`, `.mark`, `.logo`, `.menu`, `.controls`, `.control`, `.hold` | `.mx-header`, `.mx-mark`, `.mx-logo`, `.mx-menu`, `.mx-controls`, `.mx-control`, `.mx-control` (with checkbox) |
| `.switch`, `.pill--big`, `.half`, `.lab` | `.mx-switch`, `.mx-switch[data-variant="capsule"]`, `.mx-switch-side`, `.mx-switch-label` |
| `.name`, `.panel`, `.lede` / `.cap`, `.figures`, `.skills`, `.log`, `.meta`, `.blurb`, `.links` | `.mx-name`, `.mx-panel`, `.mx-lede`, `.mx-figures`, `.mx-inline-list`, `.mx-log`, `.mx-meta`, `.mx-blurb`, `.mx-inline-list` |
| `.rain`, `.col`, `.drop` | `.mx-rain`, `.mx-rain-col`, `.mx-drop` |
| `.streams`, `.streams--rows`, `.stream`, `.fall`, `.strand`, `.read`, `.stream-name`, `.ghost` | `.mx-streams`, `[data-variant="rows"]`, `.mx-stream`, `.mx-stream-fall`, `.mx-strand`, `.mx-stream-entry`, `.mx-stream-name`, `.mx-ghost` |
| `.guide`, `.term`, `.screen`, `.tty`, `.ln`, `.dim` / `.hi` / `.dir` | `.mx-guide`, `.mx-terminal`, `.mx-terminal-screen`, `.mx-terminal-tty`, `.mx-ln`, `[data-tone]` |
| `.ps1`, `.field`, `.mirror`, `.cur`, `.run`, `.chips`, `.chip`, `.modeline` | `.mx-prompt`, `.mx-prompt-field`, `.mx-prompt-mirror`, `.mx-prompt-cursor`, `.mx-run`, `.mx-chips`, `.mx-chip`, `.mx-modeline` |
| `.fetch`, `.login-card`, `.sw`, `.vim` | `.mx-fetch`, `.mx-login`, `.mx-swatch`, `.mx-takeover` |
| `.foot`, `.moved`, `.boot`, `.curtain`, `.slab` | `.mx-footer`, `.mx-moved`, `.mx-boot`, `.mx-curtain`, `.mx-curtain-slab` |
| `.post`, `.post-head`, `.crumb`, `.post-title`, `.tags`, `.toc`, `.prose`, `a.ref`, `.copy` | `.mx-post`, `.mx-masthead`, `.mx-crumb`, `.mx-masthead-title`, `.mx-tags`, `.mx-toc`, `.mx-prose`, `.mx-ref`, `.mx-copy` |
| `.post-foot`, `.eof`, `.share`, `.pager`, `.ways`, `.index` | `.mx-postfoot`, `.mx-eof`, `.mx-share`, `.mx-pager`, `.mx-ways`, `.mx-index` |
| `:root.js`, `.enhanced`, `.needs-js`, `.nojs` | `:defined` / `:not(:defined)` on the owning element |
| `:root.term`, `.term-off`, `.kb`, `.cmatrix` | `<html data-shell>` (`live` or `recorded`), and `data-keyboard`, `data-overlay="rain"` on `<mx-terminal>` |
| `data-view` (`page`, `machine`) on the root; `.view-page`, `.view-machine` | `data-reading` (`human`, `machine`) on the root and on the two containers |
| `data-mode` (`page`, `machine`) on links | `data-to` (`human`, `machine`) |

## Definition of done for a component

A component is done when all of these are true, and the pull request shows the evidence.

1. Its doc has the seven headings and its contract matches the Astro component's output.
2. It reads only tokens; the "no raw values" gate passes.
3. Stories exist for: default, every variant and state, all four contexts in one grid,
   Japanese, and the still (06).
4. The accessibility checks pass at `error` level, and the keyboard path is in the doc.
5. It renders and is usable with JavaScript disabled (checked on a specimen page), or its
   doc says exactly what is missing without scripts.
6. Visual baselines are committed for 1440 and 390 wide.
7. For an **approved** component: a side-by-side still against the prototype at the same
   width, context and state, with every visible difference listed and justified. One
   difference is expected everywhere muted text appears in phosphor-night: `text-muted` is
   lifted (02, "Changed from the prototype").
