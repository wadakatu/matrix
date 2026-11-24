---
name: Mark
status: approved
class: mx-mark
attributes: []
tokens: [color.accent, font.size.read-compact, font.weight.medium, size.logo.header, size.logo.header-compact, size.target]
---

# Mark

## Purpose

The home link at the start of the header: the logo, then the wordmark that names the link (L5).

## Contract

```html
<a class="mx-mark" href="/">
  <img class="mx-logo" src="/images/logo-400.png" width="400" height="400" alt="">wadakatu_
</a>
```

## Variants and states

One. Below 720px the logo is 32px and the link is at least 44px tall. The wordmark is `accent`
in every context; on hover it takes the base link's `text-lead`.

## Behaviour

No element; a plain link.

## Tokens

`color.accent`; `font.size.read-compact` (16px, the wordmark's size: no role names it, and this
is the scale step with the prototype's value); `font.weight.medium`; `size.logo.header`,
`size.logo.header-compact`; `size.target`. The 14px and 10px gaps and the 1.5 leading are the
prototype's one-off numbers.

## Accessibility

A link named by its wordmark; the logo inside it is `alt=""`. The focus ring is the base ring.

## Do / Don't

- Do give the wordmark as text, so it names the link.
- Don't give the logo `alt` text here: the name would be read twice.
