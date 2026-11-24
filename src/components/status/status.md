---
name: Status
status: approved
class: mx-status
attributes: []
tokens: []
---

# Status

## Purpose

The page's one polite live region, where a change of reading is announced (L3).

## Contract

```html
<p class="mx-status mx-vh" role="status"></p>
```

## Variants and states

None. It is visually hidden in every context.

## Behaviour

Empty in the markup. `mx-readings` (task 3.6) writes `Machine reading` or `Human reading` into
it, in the page's language (`strings.status`). Without scripts nothing changes in place, so
nothing is announced.

## Tokens

None; it uses the `.mx-vh` utility.

## Accessibility

`role="status"`: polite, atomic. One per page, rendered by the Layout.

## Do / Don't

- Do write to it only when something changed in place.
- Don't add a second live region for the same purpose.
