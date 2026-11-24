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
| Header | `.mx-header` | approved | `.top` | One row. 69px at 1440; 53px below 720px. In the live shell (機械用, `data-shell="live"`) below 1360px, Operator colours and Daylight are not shown: they give way to the `palette` and `theme` commands, so that the row is still 69px at 1100px with Hold rain and the shortcut's off switch in it. From 1360px nothing is hidden. The prototype did this below 720px only; matrix extends it to 1359px (settled 2026-11-16) |
| Mark | `.mx-mark` | approved | `.mark` | Home link: logo then `wadakatu_`. The wordmark names the link; the logo's `alt` is empty |
| Logo | `.mx-logo` | approved | `.logo` | Law L5. Sizes: 44px header, 32px compact header, fluid in the fetch card and boot |
| Nav | `.mx-nav` | approved | `.top nav` | Links in 人間用; a numbered window list (`0:Home*`) in 機械用, by CSS counters |
| Menu | `.mx-menu`, `<mx-menu>` | approved | `.menu` | A native `<details>`. Below 720px a disclosure; from 720px it lays no box (`display: contents`) |
| Control | `.mx-control` | approved | `.control` | One look for a button, a link, and a label wrapping a checkbox. Filled when `aria-pressed="true"` |
| Theme toggle | `.mx-control[data-action="theme"]` | approved | `#theme-toggle` | "Daylight". Not shown in the live shell below 1360px, where the `theme` command does its work (Header) |
| Palette toggle | `.mx-control[data-action="palette"]` | approved | `#palette-toggle` | "Operator colours". Not shown in the live shell below 1360px, where the `palette` command does its work (Header) |
| Hold rain | `.mx-control` + checkbox | approved | `.hold` | A checkbox, so it works without JavaScript |
| Switch | `.mx-switch`, `<mx-switch>` | approved | `.switch`, `.pill`, `_Pill.astro` | The reading switch. Specified below |
| Guide | `.mx-guide` | approved | `.guide` | The first row of 機械用: what this is, and the way to 人間用. Dismissible; remembered for the tab (`sessionStorage['mx-guide']`), not persistently (03) |
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
| Run | `.mx-run` | approved | `.run` | A tappable command in output. A button outside the tab order. Without scripts it is still a button, styled as text, and does nothing (05) |
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
| Code block | `.mx-code`, `<mx-copy>` | approved (core) | `.prose pre`, `.copy` | Ground cut into the panel; language as a tab; Copy. Shiki's `css-variables` mapped to roles. Its wrapper is specified below |
| Code title | part of `.mx-code` | draft | — | 11 of the 73 code fences carry a filename (`lang:filename`, Zenn syntax). The filename becomes the tab. Specified below ("Reading drafts") |
| Diff | part of `.mx-code` | draft | — | 5 fences are `diff`. Added and removed lines marked by a gutter sign and weight, not by hue alone. Specified below |
| Callout | `.mx-callout` | draft | — | `:::message` (4 uses) and `:::message alert` (2). A panel with a labelled left rule. Specified below |
| Details | `.mx-details` | draft | — | `:::details` (3 uses). A native `<details>` styled as the login card is. Specified below |
| Table | `.mx-prose table`, `.mx-table` | draft | — | No post has one yet; styled so that one can never appear unstyled. Scrolls inside its own wrapper, `.mx-table`. Specified below |
| Task list, footnotes | `.mx-prose` | draft | — | No post uses either yet; styled so that neither can appear unstyled. Specified below |
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
| Print | TOMBO has print hardening; the prototype has none | A minimal print layer for articles: no rain, no chrome, ink on paper, URLs after links. Specified in 05 ("Print") |
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
| `prompt()` | user, host, working directory; optionally `shell` | What to print before the field. `shell` is the process name the status line shows when nothing else runs (`sh` if it is absent) |
| `motd()` | items | Lines printed on login |
| `exec(line)` | `{ out: Item[], fx?: Effects }` | Run one line. The interpreter touches nothing; it returns output and asks for effects |
| `complete(line)` | candidates | For Tab |
| `key(k)`, optional | the same result as `exec` | A key pressed while a takeover is open, outside its command line: `Escape`, `C-c` or one character. It is how a takeover like `vim` reacts to single keys; without it the keys are the line editor's |
| `Item` | a line, or a card (image with lines beside it) | A line is segments: text, text with a tone, a link, a tappable command, or `{ swatches: true }`, the eight theme colours (the fetch card's colour row) |
| `Effects` | `open`, `exit`, `clear`, `theme`, `palette`, `takeover`, `overlay`, `navigate` | Requests the terminal carries out; unknown ones are ignored |

`key`, `prompt().shell` and the swatches segment came out of the implementation and were
accepted by wadakatu on 2026-11-16. So was one thing that is not part of this contract:
`MxTerminal.remember`, a public static on the element class, `true` by default. While it is
`false` the element neither reads nor writes `mx-history` and `mx-guide` (03). Only the
Storybook preview sets it (06).

Security rules of the renderer, from the prototype's checks: text is always escaped; a
link exists only where the interpreter returned a link segment; nothing a reader typed
(including through `?run=`) ever becomes markup or a link.

matrix ships a small demo interpreter (`help`, `echo`, `ls`, a fetch card, a takeover) for
stories and tests. It contains no personal data and no jokes.

### Prose

Long-form reading, tuned for Japanese. Everything a Markdown renderer can emit is styled.

| Element | Setting |
| --- | --- |
| Body | `font.family.ja`, regular; `read-compact` / `leading.read` below 720px, `read` from 720px. Measure `size.measure.read-compact` below 720px, `size.measure.read` from 720px. `line-break: strict`; no justification; no negative tracking |
| `h2`, `h3`, `h4` | `heading` / `lead` / body size. The Markdown marker (`##`) is drawn before each as generated content with empty alternative text, so it is seen and not read |
| Links | Underlined, `accent` |
| `strong` | Medium weight, `text-lead` |
| Lists | `-` and numbers in `accent`, set in the mono face |
| `hr`, `blockquote` | A dashed `rule`; a 2px `rule` at the left with muted text |
| Inline code | `ground` fill, 1px `rule`, `text-lead`, 0.9em |
| Images | The real file, never recoloured, in a 1px `rule`, with width and height in the markup |
| Code | See Code block. Long lines wrap |

The title uses `word-break: auto-phrase` and `text-wrap: balance` where supported.

Characters per line (09, task 5.2) is the inline size of the body's content box divided by the
body's font size, which is how many full-width characters fit. It does not depend on the text,
so the fixture measures the same as the post did. The prototype's four figures
(`MATRIX-NOTES.md`, "Blog post pages") follow from its CSS by that sum: 20.6 at 390, 38.4 at
768, 38.1 at 1100, 39.9 at 1440.

### Code block: the wrapper

The prototype styles the highlighter's bare `<pre>` and has a script append the Copy button.
matrix names the two `.mx-code` and `<mx-copy>`, and renders no dead button (05), so the button
is in the markup and something holds both. That is this wrapper. It adds nothing to see: the
block looks and behaves as the prototype's does.

```html
<div class="mx-code">
  <pre data-language="bash"><code><span class="line">…</span></code></pre>
  <mx-copy class="mx-copy"><button type="button">Copy</button></mx-copy>
</div>
```

- The `<pre>` is the highlighter's, as written. Astro's Shiki step puts the language on it as
  `data-language`, `plaintext` when the fence names none or one it does not know, and uses the
  variable prefix `--astro-code-` (`@astrojs/internal-helpers`, `dist/shiki.js`, read at
  Astro 7.4.12). The tab is drawn from that attribute, as in the prototype, and is seen and not
  read.
- `<mx-copy>` comes after the `<pre>`, so the code is before Copy in the page and in the
  focus order, as in the prototype. It is not shown until the element is defined (05, "Without
  JavaScript"). It copies the text of `<code>`.
- **Who writes it.** Markdown is the site's (01), so the site's Markdown step writes this
  wrapper and the contracts under "Reading drafts"; matrix ships no Markdown plugin. The Astro
  components are the reference renderers, for stories and specimens. At `93ca12d` the site has
  no such step: `astro.config.mjs` sets Shiki's `css-variables` theme and `wrap: true` and
  nothing else, so none of Zenn's block syntax is parsed today. Writing the step belongs to the
  migration (09, task 7.2).

### Reading drafts (task 5.3)

The seven drafts of the inventory, designed from existing tokens. None needs a new token. Each
stays `draft` until wadakatu has seen it in Storybook and approved it (09).

#### What the seven share

- **Static.** HTML and CSS. No element, no script, and nothing for the motion catalogue (05).
  Without JavaScript they are complete; the only thing missing near them is Copy, as on any
  code block.
- **Boxes follow the two approved boxes inside Prose**, the Code block and the Reference link:
  `ground` cut into the panel, a `border.width.hair` `rule` round it, no radius, and a
  `border.width.strong` left rule where the box is a note. No fill carries a meaning.
- **Rhythm.** A draft block is a child of `.mx-prose` and takes Prose's block gap. Inside a box
  the gap between blocks is `space.3`, and the first and last child add no margin of their own.
- **Text only.** A title, a summary and a label are text. The Markdown step escapes them, and
  nothing an author wrote becomes markup.
- **Never colour alone** (05, "Colour and contrast", rule 5). What carries each state without
  colour, and so also in forced colours and on paper:

| State | Carried by |
| --- | --- |
| Added, removed or unchanged line | The line's own first character (`+`, `-`, a space), and its weight |
| Message or alert | The label's word, and the `!` before it on an alert |
| Open or closed | `▾` or `▸`, and the native `open` state |
| Done or not done | `[x]` or `[ ]`, and the native checkbox |
| The footnote arrived at | A left rule that takes up width |

- **Forced colours.** Borders, text and generated markers take system colours by themselves
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors) lists the
  properties that are forced). No draft sets `forced-color-adjust` and none uses a system
  colour: the table above is why none has to.

#### Code title

A fence written `lang:filename` (Zenn's syntax; the blog also has `:filename`, with no
language). The file name takes the tab's place.

```html
<figure class="mx-code">
  <figcaption class="mx-code-title">config/fixture.php</figcaption>
  <pre data-language="php"><code>…</code></pre>
  <mx-copy class="mx-copy"><button type="button">Copy</button></mx-copy>
</figure>
```

| | |
| --- | --- |
| Element | With a title the wrapper is a `figure` and the title its `figcaption`: a caption on a code listing is what `figure` is for ([HTML](https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element)). Without one it stays the `div` above |
| Box | The language tab's: at the top left, padding `space.0-5` by `space.3`, a hairline `rule` to its right and below it |
| Type | `font.family.mono`, `font.size.label`, `font.leading.code`, regular. `text-lead`, where the language tab is `text-muted`: the tab is decoration and the file name is something the author wrote |
| Language tab | Not drawn when there is a title |
| Long names | The title is in the flow, not positioned. It wraps anywhere, keeps clear of Copy, which stays in its corner, and pushes the code down. The longest in the blog today is 34 characters |
| Code | Starts `space.4` below the title's row. Without a title it keeps the prototype's `space.10` of top padding, which clears the tab |
| Read aloud | Yes. It is real text and the caption of the figure |

#### Diff

A fence written `diff`, `diff lang` or `diff lang:filename`. A title, if there is one, is as
above.

```html
<div class="mx-code" data-diff>
  <pre data-language="js"><code><span class="line"> const a = 1;</span>
<span class="line" data-diff="del">-const b = 2;</span>
<span class="line" data-diff="add">+const b = 3;</span></code></pre>
  <mx-copy class="mx-copy"><button type="button">Copy</button></mx-copy>
</div>
```

- **The gutter sign is the line's own first character**: the `+`, `-` or space the author
  typed. It is text, not generated content, so it is read, copied (Copy gives back a diff that
  applies), printed and kept in forced colours. Nothing else is ever in that column: every
  line in a diff block hangs by two characters, so a wrapped line continues clear of the signs.
- Which lines are `add` and `del` is the Markdown step's reading of the fence. A line with
  neither attribute, a hunk header included, is an unchanged line.

| Line | Sign | Weight | Tone |
| --- | --- | --- | --- |
| Added (`data-diff="add"`) | `+` | `font.weight.medium` | `text-lead` |
| Removed (`data-diff="del"`) | `-` | `font.weight.regular` | `text-muted` |
| Unchanged | space | `font.weight.regular` | `text`, with its syntax colours |

- **Inside an added or a removed line every token takes the line's tone.** Syntax colours stay
  on unchanged lines only. The syntax colours are these same three roles and `accent`, so a
  line that kept them would have no tone to be told by.
- No fill, no strike-through, no hue. Nothing in the tokens means added or removed, and
  `color.reading.*` is for the capsule's dots only (02).
- Shiki's `css-variables` theme has three variables the prototype does not map, because no
  prototyped post has a diff (`createCssVariablesTheme` in `@shikijs/core` 4.6.0, read in
  `node_modules`). They are mapped so that a fence highlighted by Shiki's own `diff` grammar,
  with no attribute on its lines, still has the tones:

| Variable | Role |
| --- | --- |
| `--astro-code-token-inserted` | `text-lead` |
| `--astro-code-token-deleted` | `text-muted` |
| `--astro-code-token-changed` | `text` |

#### Callout

`:::message` and `:::message alert`.

```html
<aside class="mx-callout">
  <p class="mx-callout-label">Note</p>
  <p>…</p>
</aside>

<aside class="mx-callout" data-variant="alert">
  <p class="mx-callout-label">Warning</p>
  <p>…</p>
</aside>
```

| | Message (default) | Alert (`data-variant="alert"`) |
| --- | --- | --- |
| Box | `ground`, hairline `rule`, padding `space.3` by `space.4` | The same |
| Left rule | `border.width.strong`, `text-muted`, its label's colour | `border.width.strong`, `accent`, its label's colour |
| Label | Its word, in `text-muted` | `!`, then its word, in `accent`. The `!` is generated, with empty alternative text |
| Label type | `font.size.meta`, `font.weight.medium`, `font.leading.ui`; the face is the page's chrome face, by `:lang()` (03) | The same |
| Body | Prose as it is outside the box: size, leading, links, inline code | The same |

- The label is the first thing in the box, `space.1` above the body, and it is real text from
  the chrome strings. It is what tells an alert from a message when colour does not: with
  `accent` and `text-muted` alone the two would differ by hue only.
- An `aside`, which is also the element Zenn's renderer writes. No ARIA is added, and never
  `role="alert"`: that is a live region for a message that has just appeared, and this is part
  of the article.
- It holds whatever Prose holds: paragraphs today (one to three in the six real uses), and
  lists or a code block if an author puts one there. It can sit inside Details, and does in
  one post.
- Nothing in it takes focus but the links an author puts there.

#### Details

`:::details title`. It starts closed, as Zenn's renderer writes it.

```html
<details class="mx-details">
  <summary class="mx-details-summary">A fixture example</summary>
  <div class="mx-details-body">…</div>
</details>
```

| | Closed | Open |
| --- | --- | --- |
| Box | A hairline `rule`, as the login card's. No fill of its own: the prose panel shows through, so a code block or a callout inside is still a cut | The same |
| Summary | At least `size.target` tall; padding `space.4` inline; `accent`, `font.weight.medium`, Prose's size at `font.leading.title`; `cursor: pointer` | The same, with a hairline `rule` under it |
| Marker | `▸`, generated, with empty alternative text, one character before the text; the native marker is not drawn | `▾` |
| Body | Not rendered | Padding `space.4`; Prose inside, with the box rhythm |

- Native, with no element. Tab reaches the summary, and Enter or Space opens and closes it.
  The focus ring is drawn inside the box, as the login card's is.
- It does not animate: there is no row for it in the motion catalogue (05).
- The summary is the author's text, as written. A `:::details` with no title is the site's to
  refuse or to name: matrix has no default summary string, and without a `summary` the browser
  writes a word of its own ([HTML](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element)).
- In print it is open (05, "Print").

#### Table

```html
<div class="mx-table" role="group" aria-label="Table" tabindex="0">
  <table>…</table>
</div>
```

| | |
| --- | --- |
| Wrapper | The scroll container (05, reflow: wide content scrolls inside its own box). Labelled and focusable, as the terminal's screen is, so that it can be scrolled from the keyboard. The default focus ring; no border and no fill |
| Table | At least as wide as the measure. Cells break between words, not inside them; what still does not fit scrolls |
| Type | Prose's face; `font.size.body` at `font.leading.ui`; `tabular-nums`, as Figures has |
| Head | `th` in `text-muted`, `font.weight.medium`, as a key is in Figures; a solid hairline `rule` under the head row |
| Rows | `td` in `text`; a dotted hairline `rule` between rows, as in Figures and Log; none after the last |
| Cells | Padding `space.2` by `space.3`; the first and last cell are flush with the measure. Aligned as the author's `align` says, otherwise at the start |
| Not used | A zebra fill, an outer box, a sticky head |

- A scrolling box that cannot take focus fails axe's `scrollable-region-focusable`, and the
  wrapper above passes it (measured: axe 4.14.0 in Chromium, with the tags the stories run).
- A table that arrives without the wrapper is styled all the same. It cannot scroll, so there
  its cells break anywhere.
- One tab stop for each table. `aria-label` is a chrome string.

#### Task list

GFM writes a disabled checkbox with no name, and axe's `label` rule fails it (measured, as
above). The contract adds the one thing that gives it a name, a `label` round the item:

```html
<ul class="contains-task-list">
  <li class="task-list-item"><label><input type="checkbox" disabled checked> A fixture task</label></li>
  <li class="task-list-item"><label><input type="checkbox" disabled> Another</label></li>
</ul>
```

- The item's marker is `[x]` or `[ ]` where another item has `-`: the mono face, `accent`,
  generated with empty alternative text. It is what the author typed, as `##` is before a
  heading.
- The checkbox stays in the page, hidden the way `.mx-vh` hides, so that it is still announced
  as a checkbox with its state and its name. It is disabled, so it is not a tab stop.
- A done item is not struck through and not dimmed. It is still something to read.
- An item that arrives without the `label` is drawn the same way; only its name is missing.

#### Footnotes

The markup GFM gives: `sup > a[data-footnote-ref]` in the text, and at the end
`section[data-footnotes]` holding `h2#footnote-label.sr-only`, an `ol`, and in each item
`a[data-footnote-backref]`. This is what `mdast-util-to-hast` 13.2.2 writes (read in
`node_modules`); a renderer that writes something else is brought to it by the Markdown step.

| Part | Setting |
| --- | --- |
| Reference | A Prose link, underlined, in `accent`; the mono face at `font.size.label`; `[` and `]` drawn round the number with empty alternative text. It adds nothing to the line's height |
| Section | Begins with Prose's `hr`: a dashed `rule`, with the same space round it |
| Its heading | Hidden the way `.mx-vh` hides, which is what the renderer's `sr-only` asks for. It gets no `##`. Every reference points at it with `aria-describedby`, so it must stay in the page |
| List | Numbers as in any Prose ordered list. Text in `text`, at `font.size.body` and `font.leading.ui` |
| Back reference | `↩`, `accent`, not underlined |
| The footnote arrived at (`li:target`) | A `border.width.strong` `accent` rule at its left and `text-lead`, as the section being read has in Contents. `scroll-margin-top` as a heading's |

- Both links are ordinary fragment links, and work without scripts.
- The heading's text and the back reference's `aria-label` are English by default in the
  renderer. On a Japanese page the site sets them (`footnoteLabel`, `footnoteBackLabel`) from
  the chrome strings, so that the page stays in one language (L6).

#### Stories

The names 06 requires, and for the drafts: Code block `Titled`, `Diff`, `TitledDiff`, and
`Narrow` with the 34-character title; Callout `Default`, `Alert`, and one holding a list and a
code block; Details `Default`, `Open`, and one holding a code block and a callout; Prose
`Table` (one that fits and one that scrolls at 390), `TaskList`, `Footnotes`. `Contexts` shows
every variant of the component in each of the four.

#### Strings they add

To `strings/en.ts` and `strings/ja.ts`, with the strings of the approved Reading components
(Contents, Copy, Copied, Not copied, Share, Post on X, Copy link, Older, Newer, All posts and
the rest, which are the prototype's English). The Japanese is reviewed by wadakatu with the
rest of `ja` (09, gates).

| Key | `en` | `ja` | Used by |
| --- | --- | --- | --- |
| `callout.message` | Note | メモ | The label of a message |
| `callout.alert` | Warning | 警告 | The label of an alert |
| `table` | Table | 表 | The table wrapper's `aria-label` |
| `footnotes.label` | Footnotes | 脚注 | The site passes it to the renderer |
| `footnotes.back` | Back to reference | 参照に戻る | The site builds each back reference's label from it and the footnote's number |

All ten are proposals until that review.

#### Standard practice, and the departures

| Draft | What others do | matrix | Why |
| --- | --- | --- | --- |
| Code title | Zenn writes `div.code-block-filename-container > span.code-block-filename` above the block ([`md-renderer-fence.ts`](https://github.com/zenn-dev/zenn-editor/blob/canary/packages/zenn-markdown-html/src/utils/md-renderer-fence.ts); syntax in the [guide](https://zenn.dev/zenn/articles/markdown-guide)) | `figure` and `figcaption` | The caption then belongs to the listing for assistive technology too |
| Diff | Shiki's `transformerNotationDiff` puts the classes `diff add` and `diff remove` on the line and `has-diff` on the `pre`, and "does not come with styles" ([docs](https://shiki.style/packages/transformers)); VitePress, which uses it, keeps "the colors of the codeblock" on a changed line ([docs](https://vitepress.dev/guide/markdown)) | `data-diff` attributes; tone from the text roles, with the sign and the weight | State is an attribute, never a class (01). There is no added or removed hue, and under L7 a component reads a role, not a hue |
| Callout | Zenn writes `aside.msg` with a `!` in `span.msg-symbol` ([`md-container.ts`](https://github.com/zenn-dev/zenn-editor/blob/canary/packages/zenn-markdown-html/src/utils/md-container.ts)); GitHub's alerts are "displayed with distinctive colors and icons" ([docs](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)) | The same `aside`; a word where they have a colour | The same two reasons |
| Details | Zenn writes `details > summary` and a `div.details-content` (same file) | The same shape | — |
| Task list | The renderer writes a checkbox with no name (`mdast-util-to-hast` 13.2.2, `handlers/list-item.js`) | A `label` round the item | The stories run axe at `error` (06) |
| Table, footnotes | GFM's markup | The same, with a scroll wrapper round the table | 05, reflow |

#### Questions for wadakatu

None stops the drafts being built as written above. They are asked when the drafts are shown
(09, gate "Approval of draft components").

1. **The alert has no hue of its own.** It is told from a message by its word, its `!` and
   `accent`. If it should also have a warning colour, that is a new colour role in all four
   contexts with a contrast floor (02). It is not invented here.
2. **The labels' words.** "Note" and "Warning", and メモ and 警告. Zenn's own boxes carry no
   word, so nothing decides these.
3. **Inside a changed line the syntax colours give way to the line's tone.** Keeping them, as
   VitePress does, would need a fill or a hue to mark the line, which is question 1 again.
4. **Print margins** (05, "Print"). The layer sets none. TOMBO set 16mm.

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

### The Article specimens

Phase 5's exit (09) is that the Article specimen renders the structure of both prototyped posts
with fixture text. They are the two slugs in the prototype's `protoPosts` (`_lib.ts`), rendered
by `src/pages/proto/matrix/blog/[slug].astro` from `src/content/blog/` at `93ca12d`:

| | Post A: `431afa748fbed1` | Post B: `da5be52d57e9a1` |
| --- | --- | --- |
| What it is | A how-to with commands (the "Serena" article of `MATRIX-NOTES.md`) | A conference report (its "TPAC" article) |
| Masthead | 2025-07-31, Tech, 6 min read, five tags | 2025-12-10, Life, 10 min read, five tags |
| Title | Begins with a colour emoji; Latin and Japanese mixed, with a full-width colon; four lines at 390 | Japanese with a Latin acronym and full-width brackets; two lines at 1440 |
| `h2` / `h3` / `h4` | 7 / 11 / 4. Every `h2` begins with an emoji, and so do some `h3`. The `h3` fall 0, 0, 6, 1, 2, 2, 0 under the seven `h2`; the `h4` are two pairs under two of the `h3` | 4 / 2 / 0. No emoji. Both `h3` are under the third `h2` |
| Code blocks | 10: eight `bash`, two with no language (their tab reads `plaintext`). Comment lines and commands; the longest line is 131 characters and wraps | None |
| Reference links | 9, some with a fragment; the longest path is about 70 characters. One is the last thing in the article | 7 |
| Images | 1: 491 × 77, at its own size, in a paragraph after a line of text | 4, each with a width the author set: 1400 × 439 at 750, 1050 × 1400 at 250, 997 × 1330 at 250, 1330 × 997 at 350 |
| Lists | Four `ul` of three items: one straight after the first paragraph, one whose items begin with a `strong` word and a colon, one whose items are links | One `ul` of three |
| `hr` | 3, one of them straight after a code block | 2 |
| `strong` | A whole paragraph; a word and a colon at the start of another; the list above | None |
| Inline code | 27, among Japanese words; one is an address long enough to wrap | 5, used as emphasis; one holds Japanese |
| Links in text | 3, in a list | None: every address is a reference link |
| Body | About 7,600 characters in 215 lines of Markdown: short paragraphs between blocks | About 10,800 characters in 156 lines: running prose |
| Pager | Newer only | Older only |

Neither has a blockquote, an ordered list, a table, or any of the seven drafts.

There are three specimen pages, all `lang="ja"`, all from the fixture corpus (06):

1. **Article A** and **Article B** reproduce the two columns above: the same elements, the
   same counts and the same order of kinds, with invented Japanese sentences of like length.
   They are each other's Older and Newer, and the Blog index specimen lists both.
2. **Article C, every element**, is what neither post has: a blockquote, an ordered list, a
   list inside a list, and each of the seven drafts in each of its states (a titled block, a
   diff, a titled diff; a message and an alert; details closed, and one holding a code block
   and a callout; a table that fits and one that scrolls at 390; a task list with a done and
   an open item; two footnotes). The no-JavaScript, print and forced-colours checks need them
   on a page (06), and so does "everything a Markdown renderer can emit is styled". For the
   print check it also has a link in text to another site, a link to a page of this one, and
   a link to a place on the same page (05, "Print").

What each page has round the body, as the prototype's page does:

- `Layout` with the header, the switch showing 人間用 as current with its 機械用 side a link
  into the shell at the file (`?run=cat ~/posts/<slug>.md`), and the footer. Rain as a band.
  No boot and no curtain: an article has no intro.
- **Masthead**: the path line (`~` and `posts` as links, the file name as the current page),
  the title as the one `h1`, the date in a `time`, category, reading time, tags, and from
  720px the strip of four strands (title, date and category, tags, file name).
- **Contents**: every `h2` numbered from `01`, its `h3` under it; `h4` are not listed.
- **Body**: one `.mx-prose` panel.
- **Post foot**: the end-of-file line, Share (Post on X, Copy link, the system sheet), the
  pager, and the three ways back (All posts, 人間用 Home, 機械用 at this file).

Fixture rules for these pages:

- Nothing from the posts is copied: no title, sentence, tag, address, image or alternative
  text. Slugs are invented and keep the shape, 14 hexadecimal characters. Addresses are under
  `example.com`.
- Images are fixture files drawn for the purpose, with the five proportions above, `width`
  and `height` in the markup, and alternative text written for the fixture (05).
- One thing in post A is not reproduced: a stray fence inside one code block, an accident of
  the writing which the prototype left as the published page has it.
- The Blog index specimen is the masthead's title and a meta line, then `.mx-index` over the
  fixture's posts, newest first. The prototype's "published site" note on a row is not ported:
  it marked the 15 posts the prototype had no page for, and in matrix every row is a page.

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
