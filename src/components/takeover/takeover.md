---
name: Takeover
status: approved
class: mx-takeover
tokens: [color.text-muted, color.text-lead]
---

# Takeover

## Purpose

A full-screen view inside the screen whose command line is the prompt: the site's `vim` (L3).

## Contract

```html
<div class="mx-takeover" hidden>
  <pre class="mx-takeover-buffer">…<span data-tone="dim">~</span></pre>
  <p class="mx-takeover-message" role="status"></p>
</div>
```

## Variants and states

- Hidden (the default) or open: the buffer, a column of tildes in `text-muted`, and a message line in
  `text-lead`. While it is open the session is hidden and the prompt text is gone; the field is its
  command line. The status line shows the takeover's process name.

## Behaviour

An interpreter opens it with the effect `takeover: { name, lines, message, announce }`, updates it the
same way, and closes it with `takeover: null`. While it is open, Enter passes the line to `exec`;
keys typed outside a `:` command line, Escape and Ctrl+C go to the interpreter's `key()` at once.
Absent without scripts.

## Tokens

`color.text-muted`, `color.text-lead`.

## Accessibility

When it opens, `announce` (how to leave) is said in the page's status region; its message line is a
status. Keyboard: the field keeps focus throughout.

## Do / Don't

- Do say how to leave when it opens.
- Don't trap the reader: Tab still moves focus.
- Don't open it without a command.
