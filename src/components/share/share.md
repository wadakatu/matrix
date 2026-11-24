---
name: Share
status: approved
class: mx-share
element: mx-share
tokens: [color.text-muted, font.size.meta, space.2]
---

# Share

## Purpose

Ways to pass an article on: Post on X, Copy link, and the system's share sheet where there is one.

## Contract

```html
<mx-share class="mx-share" data-url="https://example.com/blog/3fa91c07d2b8e6/" data-title="…" data-copied="Copied" data-failed="Not copied">
  <span class="mx-share-label">Share</span>
  <a class="mx-control" href="https://x.com/intent/post?text=…&amp;url=…" rel="noopener">Post on X</a>
  <button class="mx-control" type="button" data-share="link">Copy link</button>
  <button class="mx-control" type="button" data-share="sheet" hidden>Share…</button>
</mx-share>
```

`data-url` is the article's canonical address, the one shared and copied.

## Variants and states

- Without scripts: the label and Post on X only.
- With scripts: Copy link, which says Copied (or Not copied) for 1.6s.
- With scripts and `navigator.share`: Share… as well. Nowhere else is it shown.
- The controls are Control's look at `meta` size.

## Behaviour

`mx-share` copies `data-url`, and unhides the sheet button only where `navigator.share` exists; a
dismissed sheet is not an error. Post on X is a plain link and needs nothing.

## Tokens

`color.text-muted`, `font.size.meta`, `space.2`; the controls read Control's tokens.

## Accessibility

A link and two buttons, each named by its word; the label is text before them. No dead button
without scripts (05). Keyboard: Tab through them; Enter or Space presses. Not printed (part of the
post foot).

## Do / Don't

- Do share the canonical address.
- Don't show the sheet button where `navigator.share` is missing.
- Don't load a third party's script for it.
