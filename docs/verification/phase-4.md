# Phase 4 — side by side with the prototype

The Phase 4 exit (09): specimen "Machine landing" works as a recorded session without scripts and as a
live shell with them, and matches the prototype's stills at 1440 and 390, with every difference listed;
and definition of done, point 7 (04), for the approved Terminal components it composes.

Prototype: wadakatu.github.io `93ca12d`, built with `astro build` in a scratch worktree (removed
afterwards). Both sides were rendered in the same Chromium (Playwright 1.65.1) with the same font files:
the prototype's Google Fonts request was answered with matrix's `dist/fonts.css`. `?motion=0` on both,
the boot marked as seen, the live shell running and its field focused (a fine pointer). The status
line's clock was set to `12:00 JST` on both, since it is the time of capture. Prototype page:
`/proto/matrix/` (its landing, 機械用 Home); matrix: `src/specimens/home.astro` (built to `/home.html`).
In each sheet the prototype is first, matrix second; the prototype's mail, GitHub and X links are
covered with solid boxes where they show.

| Sheet | What |
| --- | --- |
| [`phase-4/cmp-machine-landing-1440.png`](phase-4/cmp-machine-landing-1440.png) | The live landing at 1440, half size: phosphor-night above, operator-night below |
| [`phase-4/cmp-machine-landing-390.png`](phase-4/cmp-machine-landing-390.png) | The live landing at 390, full size: prototype and matrix in phosphor-night, then in operator-night |
| [`phase-4/cmp-machine-landing-nojs-1440.png`](phase-4/cmp-machine-landing-nojs-1440.png) | Without scripts at 1440, the whole page, half size: the recorded session |

The landing and Projects in 機械用, live, in all four contexts at 1440 and 390, are visual baselines
(`tests/visual/snapshots/specimens-home-*`, `specimens-projects-*`), with the clock masked.

## Measured on both

From the script that rendered the sheets, the same Chromium, both pages live:

| | Prototype | matrix |
| --- | --- | --- |
| Header, 1440 × 900 | 69 | 69 |
| Guide line, 1440 × 900 | 45.1 | 45.1 |
| Screen, 1440 × 900 | 712.3 | 712.3 |
| Header, 390 × 844 | 53 | 53 |
| Guide line, 390 × 844 | 61 | 61 |
| Screen, 390 × 844 | 656.4 | 656.4 |
| Document height and width | 900 × 1440; 844 × 390 | 900 × 1440; 844 × 390 |
| Focus on arrival (fine pointer) | the command field | the command field |

The prototype's own notes give 712.3 and 656.4 for the screen with the guide line (MATRIX-NOTES,
"Machine first", heights).

## Differences, each with its reason

| Where | Difference | Why |
| --- | --- | --- |
| Everywhere | Fixture words: `fixture@example` for `wadakatu@japan`, the fixture's facts in the fetch card, its files, its commands | Specimens use the fixture corpus and matrix's demo interpreter (04, 06); the real shell and its world stay in the site (01) |
| Session, first lines | One line (`Type help … exit leads to the other reading.`) instead of `Last login: …` and `Type help … exit returns to 人間用.` | The motd is the interpreter's. `Last login` is the site's shell: it keeps the reader's last visit in its own storage, which matrix does not add |
| Status line | `0:sh*` instead of `0:zsh*` | The process name is the interpreter's (`prompt().shell`); the demo's is `sh` |
| Chips | `help, ls, cat about.txt, ls -l projects, neofetch, view about.txt, clear, exit` | The site passes its chips; these are the demo's commands |
| Header at 1440 | The shortcut's off switch (`Enable \ / ¥ shortcut`) after Daylight | 04, "Readings": matrix adds the off switch to the menu; from 720px it shows there once the live shell has taken the footer away (settled in Phase 3) |
| Header from 720 to 1359px | Operator colours and Daylight are not shown in the live shell (not in these stills) | So that the off switch fits the one header row beside Hold rain, which matrix shows in both readings (05). The prototype's own rule, that the two buttons give way to `theme` and `palette`, applied below 720px only; matrix extends it to 1359px. Measured: 69px at 1100 with Hold rain, the off switch and everything else in the row |
| Header, no scripts | Hold rain is shown | 05, "One switch for all endless motion" (as Phase 3) |
| Session without scripts | The recording's note is the session's first line, with no motd | The prototype's recording printed `Last login: not on record.` and then the note; a motd's words are for a live prompt |
| Runs without scripts | File names in listings are buttons styled as text, as in the live shell | The recorded and live output are one markup (4.1). The prototype printed them as plain text in the recording |
| Muted text, phosphor-night | `#80c194` instead of `#7cbd90` | Decision Q9 (02, "Changed from the prototype") |
| Compact switch, still | The `▾` at 12px instead of 9px | Settled in Phase 3 |

Nothing in the structure, spacing, type or colour of the shared parts (header, guide line, the session's
lines and prompts, the fetch card and its swatches, the login card, the prompt and its block cursor,
the chips, the status line) differs beyond the rows above.

## Not in the stills

- Motion: the reading change and the cursor's blink are checked by the behaviour tests
  (`tests/terminal.spec.mjs`, `tests/signature.spec.mjs`), not frame by frame.
- `vim`'s commands and keys, `ping`, `git log`, the jokes: the site's interpreter. The Takeover's
  chrome is compared below; its behaviour is checked with the demo's `view`, and the rain overlay with
  its `rain`.

## Takeover

The same prototype build and capture setup as above, both pages live and focused, with a takeover open
on `about.txt`: the prototype's `vim about.txt`, matrix's `view about.txt` (the demo interpreter's
takeover; matrix has no `vim`). Prototype first, matrix second; phosphor-night, then operator-night.

| Sheet | What |
| --- | --- |
| [`phase-4/cmp-takeover-1440.png`](phase-4/cmp-takeover-1440.png) | At 1440 × 900, half size: phosphor-night above, operator-night below |
| [`phase-4/cmp-takeover-390.png`](phase-4/cmp-takeover-390.png) | At 390 × 844, full size: prototype and matrix in phosphor-night, then in operator-night |

Measured on both, in every one of the four captures (1440 and 390, phosphor-night and operator-night):

| | Prototype | matrix |
| --- | --- | --- |
| Takeover box, 1440 × 900 (top, height) | 126.1, 655.9 | 126.1, 655.9 |
| Buffer, 1440 × 900 | 126.1, 633.5 | 126.1, 633.5 |
| Message line, 1440 × 900 | 759.6, 22.4 | 759.6, 22.4 |
| Takeover box, 390 × 844 | 126, 600 | 126, 600 |
| Buffer, 390 × 844 | 126, 577.6 | 126, 577.6 |
| Message line, 390 × 844 | 703.6, 22.4 | 703.6, 22.4 |
| Buffer and message type | 14px / 22.4px | 14px / 22.4px |
| Buffer, tilde, message colour, operator-night | `rgb(236, 228, 212)`, `rgb(194, 180, 150)`, `rgb(240, 224, 180)` | the same |
| Document height and width | 900 × 1440; 844 × 390 | 900 × 1440; 844 × 390 |
| Focus | the command field | the command field |

| Where | Difference | Why |
| --- | --- | --- |
| Buffer | The fixture's `about.txt` instead of the site's | Fixture corpus (as above) |
| Message line | `"about.txt" [readonly]` instead of `"about.txt" [readonly] 6L, 164B` | The message is the interpreter's (`takeover.message`); the demo's `view` does not count lines and bytes |
| Status line | `0:view*` instead of `0:vim*` | The process name is the interpreter's (`takeover.name`) |
| What is announced on opening | `view. Press q, or type colon q and press Enter, to leave.` instead of `vim. Type colon q and press Enter to leave.` | The interpreter's `announce`; not in the stills |
| Tildes, phosphor-night | `#80c194` (`rgb(128, 193, 148)`) instead of `#7cbd90` | Decision Q9, as the muted text above |
| Chips | The demo's commands | As above |

Nothing else in the Takeover's chrome (the box, the buffer, the tilde column, the message line, the
hidden prompt text with the cursor on the command line, the chips and status line below) differs.
