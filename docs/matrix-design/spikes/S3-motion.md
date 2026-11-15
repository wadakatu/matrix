# Spike S3 — the reading change without GSAP

- **Date:** 2026-11-15
- **Verdict: pass.** The browser's own mechanisms are sufficient (decision Q6). GSAP is not bundled.
- **Corrected 2026-11-15:** the first run below did not use the prototype's six rapid-press patterns. They
  have since been recovered and run; see "The prototype's six patterns".
- **Prototype:** wadakatu.github.io `93ca12d`, in a scratch worktree (removed afterwards), built with
  `astro build`. Node 24.21.0, `@playwright/test` 1.65.1.

## What was ported

Only the in-place change, both directions, from `public/scripts/proto-matrix.js`: into 機械用 (on-screen text
turns into its own hex, the picture collapses to a line, the session prints top to bottom) and back to 人間用
(the session clears from the bottom, the page opens from a line, headings decode, the name doubles). The rest of
the file (sync, swap, flags, switch, menu, palette, shortcut) was kept as it is. The boot and the glitches were
not ported; the port ends the boot at once. The GSAP `<script>` injection is gone; every request to another
origin was aborted during the tests and none to jsDelivr/GSAP was made.

## Approach

- Element motion (`transform` on `main`, line visibility) is `Element.animate()`. Lines that "print" are a
  `visibility: hidden` hold with `fill: backwards` whose duration is their stagger moment; lines that clear are
  a one-step `visibility` animation with `fill: forwards`, cancelled when the change ends. No `style` attribute is
  ever written, so there is nothing to clear.
- Text motion (hex dissolve, decode) is a target-less `Animation(new KeyframeEffect(null, null, timing))`; one
  `requestAnimationFrame` loop reads `effect.getComputedTiming().progress` and writes the text. Delay, easing,
  `finished` and `cancel()` are the platform's.
- A change is a list of steps: a call, or animations plus an end state. The next step starts on
  `Promise.all(anims.map(a => a.finished))`. **"A second request finishes the first"** is `rush()`: cancel what
  is running, apply that step's end state, then run every remaining step synchronously (calls run; animation
  steps only apply their end state). It is synchronous, so `toggle()` reads a settled `data-view` and starts its
  own change. This replaces GSAP's `progress(1)` loop and its "second push" for a timeline that grew.
- The reduced-motion `change` listener calls the same `rush()`.

## Results

Command: `cd /tmp/matrix-spikes/s3 && npx playwright test -c playwright.config.mjs` (scratch `mise.toml`
pins node 24). Viewport 1440×900. Projects: chromium, firefox, webkit. Run once (24 passed, 1.1m) and with
`--repeat-each=3` (72 passed, 3.3m). Re-run separately against a fresh build of the prototype in a new scratch
worktree: 24 passed (1.1m).

In this first run the prototype's `extra.mjs` had not been found, so its six patterns were not used. Six
patterns were written to the stated ranges instead (50–400ms apart, two to five presses, either side). On their
own these do not meet the plan's criterion; they are kept as extra coverage:

| Test (`s3.spec.mjs`) | chromium | firefox | webkit |
| --- | --- | --- | --- |
| rapid: 2 presses 50ms apart from page | pass | pass | pass |
| rapid: 3 presses 150ms apart from page | pass | pass | pass |
| rapid: 5 presses 400ms apart from page | pass | pass | pass |
| rapid: 2 presses 400ms apart from machine | pass | pass | pass |
| rapid: 4 presses 100ms apart from machine | pass | pass | pass |
| rapid: 5 presses 50ms apart from machine | pass | pass | pass |
| reduced motion switched on mid-change, from page | pass | pass | pass |
| reduced motion switched on mid-change, from machine | pass | pass | pass |

Each test asserts, after settling: the expected `data-view`, address, `document.title` and status text; no
`[aria-busy]`; no `style` attribute on `main` or any printed line, computed `transform: none` on `main`; every
printed line visible in 機械用; zero script-created animations in `document.getAnimations()`; and the text of every
heading, paragraph, list item, stream name and switch side in 人間用 equal to its text at load (nothing scrambled).
The reduced-motion tests also assert the change was under way (`aria-busy`) 150ms after the press, then emulate
`reducedMotion: 'reduce'` and check the same list 50ms later.

**Negative control.** With `rush()` disabled (`S3_NO_RUSH=1`, chromium, rapid tests only), 3 of 6 patterns
failed: the three starting from the page, e.g. view `machine` where `page` was expected and headings left as
hex ("Work and writing" read "3ork 1nd w7it9ng"). So the tests detect the failure the prototype's fix exists for.

## The prototype's six patterns

`extra.mjs` was in `/tmp/mx-machine/`, which no longer exists, and was never committed to the prototype repository.
Its full text is in the Claude Code transcript of the design session for wadakatu.github.io-design
(`92312904-….jsonl`, the `Write` of `/tmp/mx-machine/extra.mjs` at 2026-11-13T04:11:50Z). Section 5, "Rapid
changes", verbatim:

```js
await press([0]); // now in the machine reading
for (const [name, gaps, want] of [
  ['machine -> page -> machine, 50ms apart', [50, 0], 'machine'],
  ['machine -> page -> machine -> page, 50ms apart', [50, 50, 0], 'page'],
  ['page -> machine -> page, 50ms apart', [50, 0], 'page'],
  ['page -> machine -> page -> machine, 300ms apart (mid-collapse, mid-print)', [300, 300, 0], 'machine'],
  ['machine -> page -> machine -> page, 400ms apart (mid-decode)', [400, 400, 0], 'page'],
  ['five presses 120ms apart', [120, 120, 120, 120, 0], 'machine'],
]) { const s = await press(gaps); check(`rapid: ${name}`, clean(s, want) && s.path === …); }
```

`press(gaps)` presses once per gap, waits that gap after each press, then waits 1900ms. The patterns run in
sequence, each from where the last ended. The later terminal pass (`port.py`) changed only how the press is made,
a click on the capsule instead of Backslash, because Backslash is text in the 機械用 prompt. Prototype `93ca12d` is
the terminal model, so the run below clicks the capsule.

A new test in the spike's `s3.spec.mjs` runs these six in that order: one press from 人間用 to reach 機械用, then
the six, 1900ms after each. After each pattern it checks everything listed under "Results", and also what
`extra.mjs`'s `clean()` checked that the spec did not: the name is not doubled, the curtain is not on, and
`aria-current` is on the side shown. There must be no page errors and no request to GSAP or jsDelivr.

Command: `npx playwright test -c playwright.config.mjs --repeat-each=3` in a fresh scratch copy (spike files from
`spike/s3`, prototype `93ca12d` from `git archive`, `astro build`, node 24.21.0, `@playwright/test` 1.65.1).
Result: 27 passed (2.6m). The run logged 54 `PASS rapid:` lines and no `FAIL` (6 patterns × 3 engines × 3 runs).

| Pattern (extra.mjs) | Ends in | chromium | firefox | webkit |
| --- | --- | --- | --- | --- |
| machine → page → machine, 50ms apart | machine | 3/3 | 3/3 | 3/3 |
| machine → page → machine → page, 50ms apart | page | 3/3 | 3/3 | 3/3 |
| page → machine → page, 50ms apart | page | 3/3 | 3/3 | 3/3 |
| page → machine → page → machine, 300ms apart | machine | 3/3 | 3/3 | 3/3 |
| machine → page → machine → page, 400ms apart | page | 3/3 | 3/3 | 3/3 |
| five presses 120ms apart | machine | 3/3 | 3/3 | 3/3 |

The two reduced-motion tests passed in all three engines in the same run.

**Negative control.** `S3_NO_RUSH=1`, chromium, assertions soft so the sequence goes on after a failure, as
`extra.mjs` did. Five of the six failed and only "page → machine → page, 50ms apart" passed. The first two ended
in the wrong reading. The last three ended with the first heading still hex ("Work and writing" read
"363k 134 73i3937"). The prototype's notes report the same count for its own control (five of six, with
`finish()` reduced to one push).

**Not on a branch.** This test and its logs were in scratch (`/tmp/matrix-spikes/s3-orig/`) and are not on
`spike/s3`. The array above and the description in this section are enough to write the test again.

## Not verified

- The rest of `extra.mjs` (the shortcut's off switch, the blocked-script fallback, throwing storage); outside S3.
- A frame-by-frame visual match with the GSAP version (easings were approximated with `cubic-bezier` equivalents
  of `power1.in`, `power2.in`, `power2.out`); timing and look are for task 3.6 to compare against the stills.
- Real devices, a phone width, and a screen reader during the change.

## Notes for task 3.6

- Keep the step list + synchronous `rush()` shape; it is the whole of the rapid-press fix.
- Put the visibility holds and text tweens behind one helper each; prefer `fill` only where the end state is
  cancelled by the change's end, so nothing persists on elements.
- Test text restoration by comparing against a load-time snapshot, not by looking for glyphs.

## Rerunning

The spike's files (`proto-matrix-waapi.js`, `serve.mjs`, `s3.spec.mjs`) are on the local throwaway branch
`spike/s3`, not on this branch; the prototype worktree was removed after the run. To rerun from them: `git -C <prototype repo> worktree add --detach
/tmp/matrix-spikes/s3/proto 93ca12d`, `npm ci && npx astro build` in it, then the command above; `serve.mjs`
serves `proto/dist` with `/scripts/proto-matrix.js` replaced by `proto-matrix-waapi.js`. Remove the worktree after.
