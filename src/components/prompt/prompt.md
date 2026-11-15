---
name: Prompt
status: approved
class: mx-prompt
tokens: [color.accent, color.on-accent, color.text-lead, font.size.read-compact, motion.blink.duration, motion.blink.count, space.1-5]
---

# Prompt

## Purpose

The command line: a real text field with the prompt before it and a drawn block cursor (L3).

## Contract

```html
<form class="mx-prompt" autocomplete="off">
  <label for="mx-command"><span class="mx-prompt-ps" aria-hidden="true"><span class="mx-prompt-who">fixture@example:~</span><span class="mx-prompt-sym">$</span></span><span class="mx-vh">Command</span></label>
  <span class="mx-prompt-field">
    <input id="mx-command" name="cmd" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" aria-describedby="mx-command-hint" />
    <span class="mx-prompt-mirror" aria-hidden="true"></span><span class="mx-prompt-cursor" aria-hidden="true"> </span>
  </span>
</form>
<p class="mx-prompt-hint mx-vh" id="mx-command-hint">…</p>
```

## Variants and states

- Focused: the block is lit (`accent` under `on-accent`) and shows the character under the caret in
  reverse. Not focused: hollow, a 1px `accent` box. A selection hides it.
- Each keystroke starts five blinks (`motion.blink.*`), then it rests lit. Still: lit, no blink.
- Below 720px the path takes its own line and `$` starts the next. On coarse pointers the field is
  `font.size.read-compact` (16px), so iOS does not zoom into it.
- During a takeover or the rain overlay the prompt text is hidden; the field is the takeover's command line.

## Behaviour

`mx-terminal` owns it: Enter runs the line; Up and Down recall the history and bring the draft back;
Tab completes (asking the interpreter) only when the line has text and the caret is at its end, and
lists what is still ambiguous; Ctrl+L clears, Ctrl+C cancels the line, Ctrl+U cuts to the start,
Ctrl+A and Ctrl+E jump, Ctrl+D on an empty line exits; PageUp and PageDown scroll the session. Keys
are ignored while an input method composes. Without scripts the form is absent.

## Tokens

`color.accent`, `color.on-accent`, `color.text-lead`; `font.size.read-compact`; `motion.blink.duration`,
`motion.blink.count`; `space.1-5`.

## Accessibility

A labelled field (`Command`) described by a hint naming `help`, `exit`, the Tab rule and the Ctrl keys
it takes. Tab is never a trap: on an empty line, with Shift, or after Escape it moves focus. Ctrl+C is
left to the browser while text is selected, so copying works on Windows and Linux. The block cursor
replaces the 2px ring (05, "Focus"): lit with focus, hollow without. Forced colours: `Highlight`.

## Do / Don't

- Do keep the field a real `<input>`.
- Don't take Ctrl keys while the field does not have focus.
- Don't focus the field on arrival on touch devices.
