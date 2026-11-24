---
name: Contents
status: approved
class: mx-toc
element: mx-toc
tokens: [color.accent, color.rule, color.text-lead, color.text-muted, font.family.mono, font.size.meta, font.weight.medium, border.width.hair, border.width.strong, size.target, size.rail, size.measure.read, size.measure.read-compact, space.2, space.3, space.4, space.5]
---

# Contents

## Purpose

The article's sections, so a long Japanese post can be read in any order: every `h2` numbered from
01, its `h3` under it.

## Contract

```html
<mx-toc>
  <aside class="mx-toc mx-panel">
    <details>
      <summary class="mx-toc-summary">Contents</summary>
      <nav aria-label="Contents">
        <ol>
          <li><a href="#intro">…</a></li>
          <li><a href="#setup">…</a><ol><li><a href="#before" aria-current="location">…</a></li></ol></li>
        </ol>
      </nav>
    </details>
  </aside>
</mx-toc>
```

`Toc.astro` takes the headings as Astro's Markdown rendering returns them (`depth`, `slug`, `text`);
`h4` are not listed.

## Variants and states

- Below 1100px: a disclosure above the body, closed; `▸` / `▾` before the word.
- From 1100px: a rail, `size.rail` wide, sticky 20px from the top and scrolling inside itself when
  taller than the window. Always open: the summary gives way to a label drawn from the nav's own name.
  An engine without `::details-content` keeps the disclosure, and the element opens it.
- The section being read: `text-lead` and a 2px `accent` rule at its left (`aria-current="location"`).
- Links are `text-muted`, numbers `accent`, rules between sections dotted `rule`.

## Behaviour

`mx-toc` marks the section being read: the last heading whose top has passed 96px down the window.
Below 1100px choosing a section closes the disclosure. Without scripts the disclosure and every link
work; the mark is absent (05).

## Tokens

`color.accent`, `color.rule`, `color.text-lead`, `color.text-muted`; `font.family.mono`,
`font.size.meta`, `font.weight.medium`; `border.width.hair`, `border.width.strong`; `size.target`,
`size.rail`, `size.measure.*` (`--mx-measure`); `space.2`, `space.3`, `space.4`, `space.5`.

## Accessibility

An `aside` holding a `nav` named Contents (目次). The summary is a native disclosure, 44px tall, its
marker generated with empty alternative text; focus ring inside the box. Keyboard: Tab to the
summary, Enter or Space opens it, Tab through the links; from 1100px straight to the links. The mark
is the word's colour and a rule, never colour alone. Not printed (05).

## Do / Don't

- Do build it from the rendered headings, so the fragments match.
- Don't list `h4`.
- Don't animate the disclosure.
