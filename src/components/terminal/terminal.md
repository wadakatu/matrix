---
name: Terminal
status: approved
class: mx-terminal
element: mx-terminal
tokens: [color.text-muted, color.text-lead, color.accent, color.panel, color.ground, color.rule, font.size.ui, font.leading.terminal, font.weight.medium, space.1-5, space.3, space.4, space.6, layer.overlay]
---

# Terminal

## Purpose

機械用 as one shell in one viewport: the same facts as 人間用, typed for and printed as a session (L3).
Without scripts it is a recorded session in an ordinary scrolling page.

## Contract

```html
<mx-terminal class="mx-terminal" data-cwd="~" data-first="neofetch" data-login="fixture_, Fixture developer">
  <p class="mx-guide">…</p>
  <div class="mx-terminal-screen" tabindex="0" role="group" aria-label="Terminal">
    <div class="mx-terminal-tty">
      <div class="mx-ln"><span data-tone="dim">…</span></div>
      <div class="mx-ln mx-ln-echo"><span class="mx-prompt-ps" aria-hidden="true">fixture@example:~$</span> ls</div>
    </div>
    <div class="mx-takeover" hidden>…</div>
    <form class="mx-prompt" autocomplete="off">…</form>
    <p class="mx-prompt-hint mx-vh" id="mx-command-hint">…</p>
  </div>
  <div class="mx-chips" role="group" aria-label="Keys and suggested commands">…</div>
  <p class="mx-modeline">…</p>
</mx-terminal>
```

`Terminal.astro` takes the site's `interpreter`, the recorded `session` (its commands; the first is the
login command), the `chips`, the way back (`human`), `login` (who the login card is about) and `lang`.
It runs the interpreter at build time and prints with `render` from `@wadakatu/matrix/lib`, the same
function the element prints live output with, so the two are the same markup.

The interpreter contract (04) is in `lib`: `prompt()` (user, host, working directory, process name),
`motd()`, `exec(line)` returning `{ out, fx }`, `complete(line)` returning candidates for the last
word, and `key(k)` for keys while a takeover is open. An item is a line of segments (text, a tone, a
link, a run, the swatches) or a card (an image with lines beside it). Effects: `open`, `exit`, `clear`,
`theme`, `palette`, `takeover`, `overlay: "rain"`, `navigate`; unknown ones are ignored.

## Variants and states

- Recorded (no attribute on the root; `data-shell="recorded"` after the fallback): the session as a
  scrolling page; the prompt, chips, the guide's × and the clock are absent; the status line, fixed to
  the bottom, says `recorded session`.
- Live (`<html data-shell="live">`): the element printed a fresh session and the prompt waits. In
  機械用 the page is one viewport: header, guide, screen, chips, status line; the session scrolls
  inside the screen. The name (`h1`) is visually hidden and the footer is gone.
- `data-keyboard` on the element (an on-screen keyboard is up): the status line and guide give way,
  and from 720px the window list too.
- `data-overlay="rain"`: the page's own rain over the window until any key; parked still with motion off.
- Below 1360px in the live shell, the Operator and Daylight buttons give way to `theme` and
  `palette`, so that the shortcut's off switch fits the one header row (69px at 1100); below 720px
  as in the prototype. An interpreter for this terminal offers both commands.
- All four contexts read roles only; the output's tones are `dim` (muted), `hi` (accent), `dir` (lead).

## Behaviour

`mx-terminal` goes live when the site gives it an interpreter (`element.interpreter = …`). It prints
`motd()`, then the login command (as the login card when `data-login` is set) or `?run=` instead,
neither of which enters the history; sets `role="log"` on the session after that first screen; sets
`<html data-shell="live">`; and focuses the field on fine pointers only. The line editor, the keys and
the cursor are the Prompt's. Effects: `open` only with a user gesture (`?run=` prints the link only);
`theme` and `palette` press the header's controls; `exit` follows the header's 人間用 link, so the
change is the page's own; `navigate` keeps the carried flags; `clear` empties the session.

The viewport: with scripts running, 機械用 is locked to one viewport whose height follows
`visualViewport` (`--mx-vvh`). The head script gives the recorded session its scrolling page back
after `motion.shell.fallback` (`data-shell="recorded"`); an element that goes live later takes the
viewport back. The lock lets go whenever the window is under 480px tall (zoom, a short window), and
a keyboard never causes that, because it shrinks only the visual viewport (05). With
`interactive-widget=resizes-content` in a page's viewport meta a keyboard would shrink the layout
viewport too; matrix's `Head` does not set it.

What history and the guide's × remember is tab-scoped: `sessionStorage['mx-history']`,
`sessionStorage['mx-guide']`.

Without scripts: the recorded session, its links real, the status line's and the guide's links plain
links to 人間用. Runs in the output are still buttons (the markup is one), styled as text, and do
nothing.

## Tokens

`color.text-muted`, `color.text-lead`, `color.accent`, `color.panel`, `color.ground`, `color.rule`;
`font.size.ui`, `font.leading.terminal`, `font.weight.medium`; `space.1-5`, `space.3`, `space.4`,
`space.6`; `layer.overlay`.

## Accessibility

The screen is a labelled, focusable group (`Terminal`), so the scrollback scrolls by keyboard; its
outline is drawn inside it. Output is `role="log"` from after the first screen, so arriving does not
read the whole session. Prompts in the scrollback are `aria-hidden`; the commands after them are text.
Japanese runs carry `lang="ja"`. Links in output open a new tab and say so in their name. Keyboard:
Tab reaches the guide's link and ×, the screen, the field, the chips and the status line's link, in
that order. Reduced motion: no blink, an instant change, the rain parked. Forced colours: the cursor
and the status line use system colours.

## Do / Don't

- Do give the element the same interpreter the build used, freshly created.
- Don't print anything a reader typed through anything but `render`.
- Don't put a second terminal on a page.
