# 05 — Accessibility and motion rules

The rules every component follows, the motion catalogue, and what must be measured before
1.0. Law L2 (reading text never sits on rain) and law L4 (every effect has a still) are
this page in two sentences.

## Target

**WCAG 2.2 level AA** on every page a specimen represents, in all four contexts, in English
and Japanese. WCAG 3 is a draft and is not the target
(<https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/>).

Three places go past AA because the aesthetic puts them at risk:

- Body text clears **7:1** ([1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced)),
  because thin monospace on a dark ground looks fainter than its ratio
  ([1.4.3, on thin fonts](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)).
- Motion started by an interaction can be turned off
  ([2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions), AAA).
- The focus ring meets the size and contrast of
  [2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance) (AAA) everywhere
  except the command field, where the block cursor is the indicator.

### What has and has not been verified

The prototype was checked in Chrome through Playwright only. Its notes say so in every
section: no screen reader, no Safari, no Firefox, no real phone, no low-end device. matrix
does not inherit an accessibility claim from it. The verification matrix at the end of this
page is what turns "designed to" into "measured".

## Colour and contrast

Floors, pairs and measured minima are in `02-tokens.md` ("Contrast contract"). The rules
for using colour:

1. **Reading text sits on `ground` or `panel`.** Nothing else is a reading surface (L2).
2. **Dim with colour, never opacity.** `text-muted` exists so that `opacity` is never needed.
3. **`accent` is for short text and lit things**, not paragraphs.
4. **`rule` is decoration.** At 1.5–2.4:1 it cannot be the only thing that identifies a
   control ([1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)).
   A control whose border is `rule` (a chip, the pager) must be identifiable by its label
   alone; a control identified by its box uses `control-border`.
5. **Colour is never the only signal.** Current state is a fill and `aria-current`; a diff
   line is a sign and a weight as well as a tone; the capsule's two dots sit beside names.
6. **No glow on reading text.** `color.glow` is for the name line and lit bits in 機械用 at
   night. Bloom lowers effective contrast.
7. **Scan lines are not counted.** They dim one pixel row in three by 28% of the ground
   colour. Contrast is measured without them, so the logo and every filled control are
   lifted above them, and the gate's margins at night (9:1 and more) absorb the rest.

### What APCA says (advisory)

Measured with `apca-w3` 0.1.9 on the token values (`10-verification-log.md`, table M2).
Negative Lc is light text on a dark ground.

| Pair | phosphor-night | operator-night | phosphor-day | operator-day |
| --- | --- | --- | --- | --- |
| `text` on `ground` | −92.2 | −90.5 | 78.5 | 79.0 |
| `text-lead` on `ground` | −104.3 | −88.1 | 80.2 | 77.2 |
| `text-muted` on `ground` | −61.1 | −62.1 | 68.5 | 69.5 |
| `accent` on `ground` | −79.7 | −64.7 | 63.1 | 66.6 |

Two readings of this table:

- **`text-lead` at night is very hot** (Lc −104). The APCA guidance in the research is that
  light body text on black is comfortable to about Lc −90, and the `apca-w3` README caps
  large text at Lc 90. The role table in 02 already keeps `text-lead` to short runs; the
  body colour, `text`, sits at −92.
- **`text-muted` at night was light for small text**, and has been lifted (decision Q9).
  In the prototype it measured Lc −58.9 in phosphor-night, although it passes WCAG 2 at
  9.18:1, and it is used at 13px for meta lines. matrix makes it slightly brighter there:
  `#80c194`, Lc −61.1 on `ground` and −60.7 on `panel`, which clears Lc 60, APCA's minimum
  for content text that is not body text. Operator-night already cleared it and is
  unchanged. The alternative that was offered, keeping the colour and forbidding it below
  13px, was not taken. The value and its measurements are in 02 ("Changed from the
  prototype"); whether the amount is right is the README's N1.

APCA stays a report, not a gate: it is not part of WCAG 2.2 and the library is beta
(<https://github.com/Myndex/apca-w3>).

## Focus

- Every focusable thing shows `outline: 2px solid` in `color.focus`, offset 3px, on
  `:focus-visible` ([2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible),
  [C45](https://www.w3.org/WAI/WCAG22/Techniques/css/C45)). `outline: none` is allowed only
  where another indicator replaces it, and the component's doc must name the replacement.
- On a filled accent face (the current side of the switch, the status line) the ring would
  vanish into the fill, so it gains a 2px `ground` gap inside it, or is drawn in
  `on-accent`. This is the two-colour indicator of
  [C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40).
- Replacements in use, each documented: a stream is outlined as a whole when its title link
  has focus; the Hold rain label is outlined when its checkbox has focus; the command
  field's indicator is the block cursor (lit with focus, hollow without).
- Focus is never left inside something hidden. A reading change, a closing menu and the end
  of the boot each move focus to a named place.
- `main` takes focus from the skip link without showing a ring.

## Keyboard

- Everything works with a keyboard alone, in an order that matches the visual order.
- **The single-key shortcut has an off switch** (`\` / `¥`;
  [2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts)), stored,
  and reachable in both readings.
- **Tab is never trapped** in the terminal
  ([2.1.2](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap)): it completes only
  when the line has text and the caret is at its end; on an empty line, with Shift, or
  after Escape, it moves focus.
- The terminal takes Ctrl+L, Ctrl+U, Ctrl+A, Ctrl+E and Ctrl+D only while the field has
  focus, and leaves Ctrl+C to the browser when text is selected. This is documented on the
  page's hint and in `man`-style help, because on Windows and Linux they are browser shortcuts.
- Keys are ignored while an input method editor is composing.
- Arriving in the shell focuses the field on fine pointers only, so a phone's keyboard does
  not cover the first screen.

## Targets

- Any target is at least 24×24 CSS pixels
  ([2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)); inline targets
  in a line of output are covered by that criterion's inline exception.
- Primary controls on touch widths are 44×44 (`size.target`): the menu button, the compact
  switch, the guide's button, menu lines, the login card's summary.
- The command field is 16px on coarse pointers, so iOS does not zoom into it.

## Structure and semantics

- One visible `h1` per page; headings in order; `main`, `header`, `footer`, `nav` landmarks;
  a skip link first.
- **Decoration is `aria-hidden`, and its facts exist as text.** Rain, streams' strands, the
  curtain, boot lines, hex bytes and prompt symbols in the scrollback are hidden from
  assistive technology. Every fact they are built from is readable elsewhere (L1).
- **`lang` on every run of the other language**, and on the chrome when the page's language
  differs ([3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts)).
- Generated content that is decorative (`##`, list markers, arrows) carries empty
  alternative text (`content: '##' / ''`). Where that syntax is unsupported the declaration
  is dropped and the decoration is simply absent.
- Terminal output is `role="log"`, set after the first screen is printed so that arriving
  does not read the whole session. The takeover screen announces how to leave. Status
  changes ("Machine reading") go to one polite live region.
- Links that open a new tab from the shell say so in their accessible name.
- Images in articles have real `alt` text, written by the author. A missing `alt` fails the
  site's build; matrix's Prose never invents one.

## Without JavaScript

The page a reader gets with scripts off is a designed state, checked by test on the
specimen pages.

| Feature | Without scripts |
| --- | --- |
| 機械用 | The recorded session as a scrolling document; all links real; status line says `recorded session`; no prompt, no dead buttons |
| Reading switch, guide link | Plain links between the two static routes |
| Menu, login card, contents | Native `<details>` |
| Hold rain | Works (a checkbox and `:has()`) |
| Reduced motion | Works (the media query) |
| Daylight, Operator, the shortcut, Copy, share sheet, current-section mark | Absent, and their controls are not rendered as dead buttons (`:not(:defined)` hides them) |
| Intro | Never shown |
| Moved address | Arrives by `meta refresh`, without the query |

## Zoom, reflow, forced colours

- No horizontal scrolling at 320 CSS pixels wide
  ([1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow)). Wide content (code,
  tables, long paths) wraps or scrolls inside its own box. Tested at 320, 360, 390, 601,
  719, 720, 1100, 1360 and 1440.
- Text can be resized to 200% ([1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text));
  type tokens are in `rem` for this reason. Text spacing overrides do not clip
  ([1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing)).
- **The one-viewport shell lets go when it cannot fit.** The live shell locks the window to
  one viewport. At high zoom or in a short window that would leave too little room to
  read, so the lock is released (the document scrolls normally) whenever the visual
  viewport is under 480 CSS pixels tall and no on-screen keyboard is the cause. This rule
  is new in matrix; the prototype did not test zoom. The threshold is a starting value to
  confirm on devices.
- `forced-colors: active`: fills that carry state use system colours
  (`Highlight` / `HighlightText`); gradient-clipped text gets its text colour back; rain is
  not drawn; borders that separate regions are kept.

## Motion

### Principles

1. **Stepped, not eased.** Motion advances in visible steps (`steps()`), like a display
   refreshing. This is the signature, and it is also why most of it is cheap.
2. **Once, not looping.** An effect plays and ends. The cursor blinks five times and rests
   lit. The only endless motion is ambient rain, in its three forms: the page's rain, a
   stream's strands, and the drop in the switch.
3. **Never where reading happens.** No motion over or beside body text (L2).
4. **Never moves layout.** Effects use transforms, clips and text changes inside a fixed
   box. Nothing reflows the page.
5. **Always skippable, always finite, always fails open.**
6. **The still is designed first** (L4).

### One switch for all endless motion

[2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) (level A) requires a
way to pause, stop or hide anything that moves for more than five seconds beside other
content, and `prefers-reduced-motion` does not replace that control for readers who have
not set it.

The prototype satisfies this for the rain with Hold rain, but not for the drop in the
switch: `drip` and `glimpse` run forever (`matrix.css` lines 309 and 395), the hold rule
pauses only `.drop` (line 124), and in 機械用 the Hold control is hidden altogether (line
443). In 機械用 the switch's drop is therefore endless motion with no control.

matrix closes this: **Hold rain holds every endless animation** (rain, strands, the
switch's drop), and the control is present in both readings. It is hidden only when
motion is off, because then nothing moves.

### Catalogue

Every motion in the system. Nothing may be added without a row here.

| Motion | Trigger | Length | Endless | Still (L4) | Stopped by |
| --- | --- | --- | --- | --- | --- |
| Rain | Automatic | 9–21s per column | Yes | Drops parked at their own heights; rain scrolls with the page | Hold; reduced motion |
| Stream strands | Automatic | 5–11s | Yes | One parked drop per strand | Hold; hover or focus on the stream; reduced motion |
| Switch drop | Automatic | 3.2s cycle | Yes | Plain muted label; `▾` on the compact button | Hold; hover; reduced motion |
| Cursor blink | Focus, keystroke | 1s × 5 | No | Lit block | Ends by itself |
| Switch wipe | A side becomes current | 240ms, 3 steps | No | Filled at once | — |
| Boot | First visit to Home in a tab | about 6s; never past 8s | No | Not shown at all | Skip, Escape, click or tap, either side of the switch, timeout |
| Curtain | End of the boot | under 1s | No | Not shown | Ends by itself |
| Reading change | The switch, `\`, `exit` | about 1.2s in, 1.3s back | No | Instant swap | A second request finishes it |
| Decode | A heading or name settling | 450ms | No | Final text | Ends by itself |
| Déjà vu | Second hover or focus of an entry | 480ms | No | Nothing | Off while held |
| Title to commit | An entry first fully on screen, after 2s | once | No | Nothing | Off while held |
| Name doubles | Returning to 人間用 | 200ms | No | Nothing | — |
| Logo wipe (boot) | Last line of the boot | 500ms, 10 steps | No | Logo whole | Ends by itself |
| `cmatrix` overlay | A command | Until any key | Yes, by request | Parked rain, and the status line says so | Any key |

### Reduced motion

`@media (prefers-reduced-motion: reduce)` and `data-motion="off"` produce the same result
([C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39),
[SCR40](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR40)): no boot, no
transition, no drop, no blink, parked rain, instant changes, and no motion code requested.
The preference is read at load and listened to afterwards: turning it on mid-effect ends
the boot, finishes any change and parks the rain at once.

### Flashing

[2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold)
(level A) applies to every page. Rules that keep matrix clear of it by construction:

- Nothing alternates between light and dark more than three times in a second, except the
  cursor, which is a single glyph cell blinking once a second.
- Full-screen effects (the curtain, the tube collapsing, a palette or theme change) are one
  transition in one direction, never an alternation.
- Decode and the text-to-hex step change glyph shapes at constant ink colour; they do not
  pulse the luminance of an area.

These are design rules, not a measurement. The verification matrix includes a
frame-by-frame luminance check of the boot and the reading change at full window size.

### The boot

First visit to Home in a tab, with motion allowed and no `?run=`.

1. Five labels appear one by one (`name`, `role`, `location`, `project`, `post`) and their
   real values decode out of corpus glyphs.
2. A sixth line, `logo`, resolves to the image itself, wiped in from the top; the image is
   never scrambled.
3. The curtain falls and lifts on the page.

- A visible "Skip intro" button is focused when it starts. Escape, a click or tap anywhere,
  and either side of the switch also end it. One sentence beside them says the site opens
  as a terminal and that 人間用 is the same site as an ordinary page.
- It is decided and wired by the head script, so it ends even if no other script loads, and
  no later than `motion.boot.failsafe`.
- Once per tab (`sessionStorage`). `data-boot="frozen"` is its still, for stories and
  screenshots. The frozen frame must show settled text: the prototype's frozen frame could
  catch Japanese values half decoded, which reads as corrupted content.

### The reading change

Into 機械用: the text on screen turns into the hex of its own characters, the picture
collapses to a line like a tube switching off, and the session prints. Back: the session
clears from the bottom, the page opens from a line, headings settle, the name doubles once.

- With reduced motion, or if the motion code is unavailable: an instant swap.
- A second request during a change finishes the first, completely, then starts. The
  prototype needed a specific fix here (headings left scrambled under rapid presses); the
  six rapid-press patterns from its notes are acceptance tests.
- Nothing is left styled, scrambled or `aria-busy` afterwards.

### No third-party motion code

The prototype loads GSAP 3.13 from jsDelivr with an integrity hash, and carries the failure
handling that implies (a 2.5 second wait, an instant-swap fallback). matrix makes no
third-party request at runtime.

The boot, the curtain and the reading change are sequences of transforms, clips and text
swaps, which the Web Animations API covers natively (Baseline widely available since
2023-03-16, `web-features` 3.46.0): `Animation.finish()`, `.finished` promises and
`getAnimations()` give the "finish the first change, then start" behaviour directly.

Settled (decision Q6): animations use the browser's own mechanisms, the Web Animations API
and CSS. The three sequences are ported to them (spike S3 in 09). GSAP is the fallback
only: if the port proves insufficient, meaning it cannot pass the rapid-press tests inside
the spike's time box, GSAP is bundled from npm and loaded lazily only when motion is
allowed. Either way the CDN, the integrity hash and the load timeout go.

## Performance as an accessibility requirement

Unmeasured in the prototype; a gate here.

| Budget | Ceiling | Prototype today |
| --- | --- | --- |
| Animating elements per page | 170 | 164 on 人間用 Home |
| Animated properties | `transform`, `clip-path`, `background-position`, `mask-position` only | same |
| Stylesheet, gzip | set from the first build; starting reference 15.3 KB | 11.8 KB + 3.5 KB (blog) |
| Terminal element, gzip | under the prototype's whole shell bundle | 12.8 KB including the shell itself |
| Long tasks after load, 4× CPU slowdown | none over 50ms from matrix code | not measured |
| Reading change, input to first frame | under 200ms | not measured |

Ceilings are recorded next to measurements and raised only on purpose, as TOMBO's size
gate does.

## Verification matrix for 1.0

Automated checks run in CI. Manual checks are done once per release candidate and their
notes are committed.

| Check | How | Automated |
| --- | --- | --- |
| Contrast, all declared pairs × 4 contexts | Token gate (02) | Yes |
| Rendered contrast of real text on specimens | Playwright, computed colours | Yes |
| axe rules for WCAG 2.0, 2.1 and 2.2 A/AA on every story | Storybook accessibility addon at `error` | Yes |
| No horizontal overflow at nine widths | Playwright | Yes |
| Keyboard paths: header, menu, switch, shell, article | Playwright | Yes |
| No-JavaScript pages | Playwright with scripts disabled | Yes |
| Reduced motion: zero running animations | Playwright | Yes |
| Hold: zero running endless animations in both readings | Playwright | Yes |
| Rapid reading changes (six patterns) | Playwright | Yes |
| Forced colours | Playwright emulation, stills reviewed | Partly |
| Flash check of boot and reading change | Frame capture and luminance analysis | Yes |
| Target sizes | Playwright, bounding boxes | Yes |
| Screen reader: landing, switch, shell session, takeover, article | VoiceOver on macOS and iOS; NVDA on Windows | No |
| Safari and Firefox rendering | Playwright WebKit and Firefox, plus a real iPhone | Partly |
| On-screen keyboard and the shell | Real iOS Safari and Android Chrome | No |
| Japanese typography at body size | Reading real posts on a phone and a desktop | No |
| 200% text size and 400% zoom | Manual | No |

axe finds a share of issues, not all of them (Deque's own figure is up to 57%:
<https://storybook.js.org/docs/writing-tests/accessibility-testing>); the manual rows are
not optional.
