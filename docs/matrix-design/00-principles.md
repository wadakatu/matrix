# 00 — Principles

What matrix is, the rules that make it recognisable, and what it refuses to become.
Everything in the other documents is derived from this page. When a later document and this
one disagree, this one is right and the other has a bug.

## What matrix is

matrix is wadakatu's personal design system and the single source of truth for how
wadakatu.dev looks, moves and reads. It is distilled from the approved `/proto/matrix/`
prototype (wadakatu.github.io draft PR #116, branch `design/explore`, head `93ca12d`).

It is one world: an operator's station at night. Phosphor green on near-black, monospace
type, text that falls as rain, and a terminal that is the front door. The station has a
second palette (Operator: an amber CRT), a daylight reading of both, and two readings of
every fact: 機械用 (the shell) and 人間用 (the page).

It replaces TOMBO in this repository. TOMBO's visual language (registration marks, shu,
the volume dial) is retired; its engineering habits (measured contrast, a Baseline ledger,
pinned visual regression, no-JavaScript tests, agent-readable docs) are kept.

## The seven laws

Each law is stated as a rule, then the reason, then how a reviewer can tell it was broken.
They are numbered so that documents, stories, lint messages and review comments can cite them.

### L1 — Only real words fall

Everything decorative is made of the site's own data: commit subjects, post titles, project
names, file paths. Rain, streams, the curtain, the boot lines, the decode glyph pools and the
mask cut into the giant name are all generated at build time from a corpus the site supplies.
No placeholder glyph set lives in the CSS or the JavaScript. Every number shown is computed or
comes from the data file; there are no invented PIDs, uptimes, hosts or versions.

- Why: it is the idea of the whole thing. The world has a source, and the source is his work.
- Broken when: a component ships a hard-coded glyph string, lorem text, or a fake metric.
- Corollary: the film's name, logo, title treatment, typeface, stills, likenesses and
  quotations never appear. Phrases containing the film's name are filtered out of the corpus.
  Nothing is mirrored and nothing is converted to half-width kana. matrix evokes; it does not copy.

### L2 — Reading text never sits on rain

Text that is meant to be read sits on a solid surface. Rain shows only in the gaps, the
margins, and behind display type. Over an article body there is no rain at all: on blog
pages the rain is a band over the first screen that fades and scrolls away.
Text is dimmed with colour, never with opacity.

- Why: the aesthetic is worthless if the writing cannot be read.
- Broken when: body text has a transparent background over an animated layer, or any text
  colour is produced by `opacity`.

### L3 — Two readings, one source

機械用 and 人間用 are two renderings of the same data, never two sets of content. 機械用 owns
the short address; 人間用 is the same tree under `human/`. Documents with a single reading
(articles) have one address and link into the shell at their own file.
The two names are his words. They are names, not translations, and are never glossed.

- Why: the choice between readings is the signature interaction.
- Broken when: a fact exists in one reading and not the other, or the readings are fed from
  different data.

### L4 — Every effect has a still

Every motion has a designed resting frame, and that frame is what a reader sees with
reduced motion, with `?motion=0`, without JavaScript, when a library fails to load, and in a
screenshot. Motion is stepped, finite and skippable; the only endless motion is the rain,
and the rain has a hold control. Nothing fails closed: the intro, the transition and the
shell all time out into a usable page.

- Why: accessibility, robustness and reviewability are the same requirement here.
- Broken when: an effect has no reduced-motion state, an animation loops with no way to stop
  it, or a failed script leaves a layer covering the page.

### L5 — The mark is whole

The logo (by Chisato Satoh) is always the designer's file: square, never cropped, rounded,
rotated, masked, redrawn, or set in glyphs. Its black field is part of the mark. Recolouring
is allowed only as a palette treatment that moves no pixel.

- Why: it is a friend's work, used with permission.
- Broken when: any logo instance has `border-radius`, `clip-path`, `object-fit: cover`, a
  transform, or is rendered from characters.

### L6 — One language per page

Japanese and English are separate pages. A page is never bilingual, and a translation is
never set beside its original. Inline runs of the other language (a Japanese post title on
an English page, an English command on a Japanese page) are marked with `lang` and set in
that language's face.

- Why: side-by-side translation reads as a form, not as a page.
- Broken when: the same sentence appears in two languages on one page, or a run of the
  other language has no `lang`.

### L7 — Night first, phosphor first

The default is night and phosphor, whatever the operating system prefers. Day is the same
screen read in daylight and is a reader's stored choice. Operator is the same station in
another palette and travels in the address, so a link is always the shareable state.
Components read roles (`accent`, `ground`), never a hue: nothing in a component may assume
that the accent is green.

- Why: one identity, with variants that are honest about being variants.
- Broken when: a component names a colour by hue, or the page follows the OS theme by default.

## Vocabulary

Used with exactly these meanings in every document, story and API.

| Term | Meaning |
| --- | --- |
| **reading** | One of two renderings of the same facts: `machine` (機械用) or `human` (人間用) |
| **palette** | The colour family: `phosphor` (default) or `operator` |
| **theme** | The light condition: `night` (default) or `day` |
| **context** | One palette × theme combination. There are four: `phosphor-night`, `phosphor-day`, `operator-night`, `operator-day` |
| **ground** | The screen itself; the darkest surface at night |
| **panel** | A solid reading surface laid on the ground |
| **accent** | The lit colour of the context: phosphor green or operator amber |
| **corpus** | The site's real text from which decoration is generated (L1) |
| **still** | The resting frame of an effect (L4) |
| **recorded session** | The build-time rendering of the shell; what 機械用 is without JavaScript |
| **chrome** | Header, footer, controls: everything that is not the page's content |
| **specimen** | A full page assembled from components with fixture data, used for tests and stories |

## What matrix is not

- **Not a general-purpose component library.** There is no Button-with-twelve-variants, no
  grid system, no form kit, no chart kit. A component exists because wadakatu.dev renders it.
- **Not a theme for other people's sites.** It is public and MIT-licensed code, but it is a
  personal identity. The logo is not covered by the code licence (see `08-migration.md`).
- **Not framework-bound.** The contract is HTML, CSS custom properties and a handful of
  custom elements. Astro components are the reference renderer because the site is Astro,
  not because the system needs Astro.
- **Not a place for site content.** Profile data, the corpus, the shell's commands and jokes,
  routes and SEO stay in wadakatu.github.io. matrix ships the terminal, not what it says.
- **Not a successor API to TOMBO.** There are no compatibility aliases for `--tombo-*` or
  `.tombo-*`. The one consumer migrates in one step.

## Scope rule

A pattern enters matrix when it is rendered on wadakatu.dev (or is required to render it
accessibly), and it is promoted from the site to the system the second time it is needed.
This is the "promote on second use" rule from the research
([Dishmon](https://michaeldishmon.com/writing/design-system-for-one-person),
[Cheng](https://jordancheng.com/thoughts/design-systems-for-one)), with one deliberate
exception: the signature pieces (terminal, rain, the reading switch, the boot) appear once
and are in the system anyway, because they are the identity and the Storybook exists to
show them.
