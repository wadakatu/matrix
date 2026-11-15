---
name: Login card
status: approved
class: mx-login
tokens: [color.accent, color.rule, size.target, border.width.hair, space.0-5, space.1]
---

# Login card

## Purpose

The login command's fetch card as a disclosure on a phone, so the prompt has the screen (L3).

## Contract

```html
<details class="mx-login">
  <summary class="mx-login-summary" aria-label="who am I? fixture_, Fixture developer">who am I?</summary>
  <div class="mx-ln mx-ln-echo">…</div>
  <div class="mx-fetch">…</div>
</details>
```

## Variants and states

- Below 720px: closed, one 44px summary with `▸` / `▾`, in a 1px `rule` box.
- From 720px: the summary is gone and the card is its contents, open or closed, the same as a session
  that printed in the open (`::details-content`; the live shell also sets `open` there for engines
  without it).

## Behaviour

`mx-terminal` wraps the login command's output in it when `data-login` is set; a typed `neofetch`, or
`?run=`, prints in the open. Toggling it keeps the prompt in view. Without scripts it is a native
`<details>`.

## Tokens

`color.accent`, `color.rule`; `size.target`; `border.width.hair`; `space.0-5`, `space.1`.

## Accessibility

A native disclosure named `who am I?` and who it is about. The marker is generated content with empty
alternative text. Focus: the ring inside the box. No animation.

## Do / Don't

- Do wrap only the first card.
- Don't hide it from 720px.
- Don't rename the summary per page.
