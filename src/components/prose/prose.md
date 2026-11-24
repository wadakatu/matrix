---
name: Prose
status: approved
class: mx-prose
tokens: [color.accent, color.ground, color.rule, color.text, color.text-lead, color.text-muted, font.family.ja, font.family.mono, font.size.read, font.size.read-compact, font.size.heading, font.size.lead, font.size.body, font.size.label, font.size.meta, font.weight.medium, font.weight.regular, font.leading.read, font.leading.ui, border.width.hair, border.width.strong, radius.control, size.measure.read, size.measure.read-compact, space.2, space.3, space.5, space.7]
---

# Prose

## Purpose

Long-form reading, tuned for Japanese, on one solid panel (L2). Everything a Markdown renderer can
emit is styled. The core is approved; the table, the task list and the footnotes are drafts (04).

## Contract

```html
<div class="mx-prose mx-panel">
  <h2 id="intro">…</h2>
  <p>… <code>inline</code> … <strong>…</strong> … <a href="https://example.com/">…</a></p>
  <ul><li>…</li></ul>
</div>
```

The drafts, inside the same panel (04, "Reading drafts"):

```html
<div class="mx-table" role="group" aria-label="Table" tabindex="0"><table>…</table></div>
<ul class="contains-task-list"><li class="task-list-item"><label><input type="checkbox" disabled checked> …</label></li></ul>
<p>…<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>
<section data-footnotes class="footnotes">
  <h2 class="sr-only" id="footnote-label">Footnotes</h2>
  <ol><li id="user-content-fn-1"><p>… <a href="#user-content-fnref-1" data-footnote-backref aria-label="Back to reference 1">↩</a></p></li></ol>
</section>
```

The body is the site's Markdown rendering (01); `Prose.astro` is the panel around it and `Table.astro`
the table's wrapper. Code blocks, Reference links, callouts and details have their own pages.

## Variants and states

| Element | Setting |
| --- | --- |
| Body | `font.family.ja`; `read-compact` below 720px, `read` from 720px, `leading.read`; the measure, 40 full-width characters (`size.measure.*`); `line-break: strict`; no justification |
| `h2`, `h3`, `h4` | `heading` / `lead` / body size; `##` before each, generated, seen and not read |
| Links, `strong` | Underlined `accent`; medium `text-lead` |
| Lists | `-` and numbers in `accent`, mono |
| `hr`, `blockquote` | A dashed `rule`; a 2px `rule` at the left, muted text |
| Inline code | `ground`, a hairline `rule`, `text-lead`, 0.9em (`--mx-text-code`) |
| Images | The real file in a hairline `rule`, never recoloured |
| Table (draft) | Scrolls in `.mx-table`; head `text-muted`, a solid hairline under it, dotted between rows |
| Task list (draft) | `[x]` / `[ ]` in place of `-`; the checkbox visually hidden; done items neither struck nor dimmed |
| Footnotes (draft) | `[1]` references in mono, a dashed rule before the section, `↩` back (underlined, as any link: without it axe's `link-in-text-block` fails), the target marked by a 2px `accent` rule and `text-lead` |

Characters per line measured on the Article specimens: 20.6 at 390, 38.4 at 768, 38.1 at 1100,
39.9 at 1440, the prototype's four figures.

## Behaviour

No element. Static HTML and CSS; complete without scripts. In print: dark ink on white, absolute
`http(s)` links followed by their address, no back references, break rules (05, "Print").

## Tokens

`color.accent`, `color.ground`, `color.rule`, `color.text`, `color.text-lead`, `color.text-muted`;
`font.family.ja`, `font.family.mono`; `font.size.read`, `font.size.read-compact`, `font.size.heading`,
`font.size.lead`, `font.size.body`, `font.size.label`, `font.size.meta`; `font.weight.medium`,
`font.weight.regular`; `font.leading.read`, `font.leading.ui`; `border.width.hair`,
`border.width.strong`; `radius.control`; `size.measure.*` (`--mx-measure`, `--mx-inset`); `space.2`,
`space.3`, `space.5`, `space.7`.

## Accessibility

Headings in order under the masthead's `h1`; markers and list numbers generated with empty
alternative text. Images carry the author's `alt`; Prose never invents one. A table's wrapper is a
labelled group (`Table` / `表`) and one tab stop, so it scrolls from the keyboard. A task item's
checkbox keeps its role, state and name through its `label`; it is disabled, so not a tab stop. The
footnote heading stays in the page, hidden, for the references' `aria-describedby`.

## Do / Don't

- Do keep reading text on this panel (L2).
- Don't justify Japanese or tighten its tracking.
- Don't drop the table's wrapper: without it the table cannot scroll.
