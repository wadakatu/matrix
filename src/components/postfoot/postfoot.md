---
name: Post foot
status: approved
class: mx-postfoot
tokens: [color.accent, color.ground, color.rule, color.text-lead, color.text-muted, font.family.mono, font.size.meta, font.size.body, font.leading.ui, border.width.hair, size.measure.read, size.measure.read-compact, space.0-5, space.1-5, space.3, space.4, space.5, space.6, space.7]
---

# Post foot

## Purpose

The end of an article: the end-of-file line, Share, the older and newer posts, and the ways back to
both readings (L3).

## Contract

```html
<footer class="mx-postfoot mx-panel">
  <p class="mx-eof" aria-hidden="true">EOF</p>
  <mx-share class="mx-share">…</mx-share>
  <nav class="mx-pager" aria-label="Posts">
    <a href="/blog/b6e20d4f9a13c8/" rel="next"><span class="mx-pager-key">Newer</span><span>…</span></a>
  </nav>
  <p class="mx-ways">
    <a href="/blog/">All posts</a>
    <a href="/human/"><span lang="ja">人間用</span> Home</a>
    <a href="/?run=cat%20~/posts/3fa91c07d2b8e6.md"><span lang="ja">機械用</span>: <code>cat ~/posts/3fa91c07d2b8e6.md</code></a>
  </p>
</footer>
```

An older post is `rel="prev"`, a newer one `rel="next"`; the pager is left out when there is neither.

## Variants and states

- `EOF` in `text-muted`, spaced, with a block cursor in `accent` that does not blink.
- Pager: below 720px one column; from 720px two, the newer always in the second. Each a hairline box
  on `ground` (`accent` on hover), its key muted with `←` or `→`, the title in `text-lead`.
- From 1100px, on an article, it spans the contents rail and the body, as the masthead does.

## Behaviour

No element of its own; Share's is the only one. Everything else is links.

## Tokens

`color.accent`, `color.ground`, `color.rule`, `color.text-lead`, `color.text-muted`;
`font.family.mono`, `font.size.meta`, `font.size.body`, `font.leading.ui`; `border.width.hair`;
`size.measure.*`; `space.0-5`, `space.1-5`, `space.3`, `space.4`, `space.5`, `space.6`, `space.7`.

## Accessibility

A `footer` inside the `article`, so not the page's contentinfo. `EOF` is decoration and hidden. The
pager is a `nav` named Posts (記事); arrows are generated with empty alternative text. 人間用 and
機械用 carry `lang="ja"`. Keyboard: Share, the pager, the three ways back, in order. Not printed (05).

## Do / Don't

- Do link 機械用 to the shell at this file.
- Don't link a neighbour that leaves the site.
- Don't make the cursor blink.
