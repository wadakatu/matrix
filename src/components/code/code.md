---
name: Code block
status: approved
class: mx-code
element: mx-copy
attributes: [data-diff]
tokens: [color.accent, color.ground, color.on-accent, color.rule, color.text, color.text-lead, color.text-muted, font.family.mono, font.size.ui, font.size.label, font.leading.code, font.weight.medium, font.weight.regular, border.width.hair, space.0-5, space.3, space.4, space.10]
---

# Code block

## Purpose

Code in an article: the ground cut into the panel, its language as a tab, and Copy. Shiki's
`css-variables` theme reads the roles, so code follows all four contexts (L7). The block and Copy are
approved; the title and the diff are drafts (04).

## Contract

```html
<div class="mx-code">
  <pre class="astro-code css-variables" data-language="bash" tabindex="0"><code><span class="line">…</span></code></pre>
  <mx-copy class="mx-copy" data-copied="Copied" data-failed="Not copied"><button type="button">Copy</button></mx-copy>
</div>
```

The `<pre>` is the highlighter's, as written (Astro's Shiki step, `wrap: true`); `CodeBlock.astro`
takes it as its slot and adds the wrapper and Copy. The site's Markdown step writes the same markup.

Drafts:

```html
<figure class="mx-code">
  <figcaption class="mx-code-title">config/fixture.php</figcaption>
  <pre data-language="php"><code>…</code></pre>
  <mx-copy class="mx-copy" data-copied="Copied" data-failed="Not copied"><button type="button">Copy</button></mx-copy>
</figure>

<div class="mx-code" data-diff>
  <pre data-language="js"><code><span class="line"> const a = 1;</span>
<span class="line" data-diff="del">-const b = 2;</span>
<span class="line" data-diff="add">+const b = 3;</span></code></pre>
  …
</div>
```

## Variants and states

- Default: `ui` size, `leading.code`, 40px of top padding under the tab; the tab is the language
  (`plaintext` when the fence names none), drawn from `data-language`, `text-muted`.
- Copy: `text-muted` on `ground`, `text-lead` on hover; for 1.6s after a press it says Copied on an
  `accent` fill (Highlight in forced colours), or Not copied.
- Title (draft): the file name in the tab's place, in the flow, `text-lead`; it wraps anywhere and
  keeps clear of Copy; the code starts 16px below it.
- Diff (draft): every line hangs by two characters. Added: `+`, medium, `text-lead`. Removed: `-`,
  regular, `text-muted`. Unchanged: a space, `text`, with its syntax colours. Inside a changed line
  every token takes the line's tone. No fill, no strike-through, no hue.

## Behaviour

`mx-copy` copies the text of the block's `<code>` (a diff comes back with its signs, so it applies).
Without scripts it is not shown; the code is complete and selectable (05).

## Tokens

`color.accent`, `color.ground`, `color.on-accent`, `color.rule`, `color.text`, `color.text-lead`,
`color.text-muted`; `font.family.mono`, `font.size.ui`, `font.size.label`, `font.leading.code`,
`font.weight.medium`, `font.weight.regular`; `border.width.hair`; `space.0-5`, `space.3`, `space.4`,
`space.10`. Shiki's variables map to roles: foreground and parameter `text`; comment and punctuation
`text-muted`; keyword, function and link `accent`; constant and strings `text-lead`; inserted
`text-lead`, deleted `text-muted`, changed `text`.

## Accessibility

The `<pre>` is focusable (Shiki's `tabindex="0"`) and shows the ring. The tab is generated with empty
alternative text; a title is real text, the figure's caption. Copy is a button after the code, in the
page and focus order, 25px tall and at least 44px wide, its ring inside the box. A diff's state is its
sign and its weight, so it reads without colour, in forced colours and on paper. In print: no Copy,
the rule, tab or title and syntax colours kept (05).

## Do / Don't

- Do keep the highlighter's `<pre>` as written.
- Don't render Copy as a dead button without scripts.
- Don't mark added and removed lines by colour alone.
