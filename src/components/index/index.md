---
name: Index
status: approved
class: mx-index
tokens: [color.accent, color.rule, color.text-lead, color.text-muted, font.family.mono, font.size.meta, font.size.body, font.leading.ui, border.width.hair, size.measure.read, size.measure.read-compact, space.2, space.3, space.5]
---

# Index

## Purpose

The blog's posts as one list, newest first: date and title per row.

## Contract

```html
<ol class="mx-index mx-panel" reversed>
  <li><time datetime="2026-01-20">2026-01-20</time><a href="/blog/c07d5e1a84f2b9/" lang="ja">…</a></li>
</ol>
```

It follows a title-only Masthead inside `.mx-post`.

## Variants and states

One. Each row a grid of an 11-character date column and the title; a dotted `rule` under each row.
The date in mono `meta`, `text-muted`, tabular; the title `text-lead` at `body` size, underlined in
`accent` on hover.

## Behaviour

No element. Links.

## Tokens

`color.accent`, `color.rule`, `color.text-lead`, `color.text-muted`; `font.family.mono`,
`font.size.meta`, `font.size.body`, `font.leading.ui`; `border.width.hair`; `size.measure.*`;
`space.2`, `space.3`, `space.5`.

## Accessibility

A reversed ordered list: the newest is the highest number. Each date is a `time`; a title in the
other language carries `lang`. Keyboard: one tab stop per post.

## Do / Don't

- Do list every post, newest first.
- Don't mark a row as leaving the site: every row is a page.
- Don't truncate titles.
