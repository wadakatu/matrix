---
name: Run
status: approved
class: mx-run
tokens: [color.accent]
---

# Run

## Purpose

A command in output that can be tapped to run: a file name in a listing, a suggestion in a message (L3).

## Contract

```html
<button class="mx-run" type="button" tabindex="-1" data-run="help">help</button>
```

## Variants and states

`accent` text, underlined on hover. With the `dir` tone it is `text-lead`, medium.

## Behaviour

`mx-terminal` runs `data-run` on a click or tap without moving focus. Printed by `render` from a run
segment (`{ text, run }`). Without scripts it is still a button, because the recorded and live output
are one markup (4.1); it is styled as text and does nothing.

## Tokens

`color.accent`.

## Accessibility

A button outside the tab order, so a listing does not add a tab stop per file name; everything a run
does can also be typed. Inline in a line of output, so the target-size exception for inline targets
applies (2.5.8).

## Do / Don't

- Do run exactly what it says.
- Don't put it in the tab order.
- Don't make what a reader typed into a run.
