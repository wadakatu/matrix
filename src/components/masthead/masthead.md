---
name: Masthead
status: approved
class: mx-masthead
attributes: [aria-current]
tokens: [color.accent, color.text-lead, color.text-muted, font.family.ja, font.family.mono, font.size.title.min, font.size.title.max, font.size.meta, font.weight.medium, font.leading.title, font.leading.ui, size.measure.read, size.measure.read-compact, size.rail, space.0-5, space.1, space.1-5, space.6, space.7]
---

# Masthead

## Purpose

The head of an article: where it is, what it is called, when it was written and what it is about,
with a strip of its own words beside it (L1).

## Contract

```html
<article class="mx-post">
  <header class="mx-masthead mx-panel">
    <div class="mx-stream-fall" aria-hidden="true">
      <span class="mx-strand" style="--j:0"><span class="mx-drop" style="--t:7.1s;--d:-3.2s;--rest:20%">…</span></span>
    </div>
    <div class="mx-masthead-id">
      <nav class="mx-crumb" aria-label="Breadcrumb"><a href="/human/" aria-label="Home">~</a>/<a href="/blog/">posts</a>/<span aria-current="page">3fa91c07d2b8e6.md</span></nav>
      <h1 class="mx-masthead-title">…</h1>
      <p class="mx-meta"><time datetime="2025-07-31">2025-07-31</time> <span>Tech</span> <span>6 min read</span></p>
      <ul class="mx-tags" aria-label="Tags"><li>#fixture</li></ul>
    </div>
  </header>
  <div class="mx-post-grid"><!-- Contents, then Prose --></div>
  <!-- Post foot -->
</article>
```

`.mx-post` is the Article page (04, "Patterns"): the masthead, then `.mx-post-grid` holding
Contents and the body, then the foot. On the blog's index the masthead has no path line, date or
tags: the title, then whatever the site puts in the slot (a meta line), and `.mx-index` follows.

## Variants and states

- Below 720px: no strip. From 720px: the strip, 100px wide, four strands (title, date and category,
  tags, file name).
- From 1100px on screen, on an article, the masthead and the foot span the contents rail and the body.
  On paper there is no rail: the masthead and the body are plain flow at the measure (05, "Print").
- The title is fluid, `font.size.title.min` to `font.size.title.max` (`--mx-text-title`), and balanced
  where `text-wrap: balance` is supported.
- Every context: the panel's face; path line and meta in `text-muted`, the current file and tags in
  `accent`, the title in `text-lead`.

## Behaviour

No element of its own. The strip is the Stream's strands and is drawn by `stream.css` and `rain.css`;
it stops with Hold rain and parks with reduced motion, as a stream does (05).

## Tokens

`color.accent`, `color.text-lead`, `color.text-muted`; `font.family.ja` (title), `font.family.mono`
(path line, tags); `font.size.title.min`, `font.size.title.max`, `font.size.meta`; `font.weight.medium`;
`font.leading.title`, `font.leading.ui`; `size.measure.read`, `size.measure.read-compact` and the
inset (`--mx-measure`, `--mx-inset` in `base.css`); `size.rail`; `space.0-5`, `space.1`, `space.1-5`,
`space.6`, `space.7`.

## Accessibility

The title is the page's one `h1`. The path line is a `nav` named Breadcrumb (パンくずリスト), its
`~` named Home and the file name `aria-current="page"`. Tags are a named list. The title, the
category or a tag in the other language carries `lang`. The strip is `aria-hidden`: every word in it
is in the masthead. Keyboard: the two path links, in order. Printed whole, without the strip (05, "Print").

## Do / Don't

- Do take the strip's words from the article itself.
- Don't put a second `h1` on an article.
- Don't draw the strip below 720px.
