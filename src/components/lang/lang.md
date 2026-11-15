---
name: Language link
status: draft
class: mx-lang
tokens: [color.text-muted, color.text-lead, color.rule, size.target, space.2, border.width.hair]
---

# Language link

## Purpose

A plain link to the same page in the other language, so a reader can change language without a
bilingual page (L6, decision Q8). Draft: designed from existing tokens, after TOMBO's header link.

## Contract

```html
<a class="mx-lang" href="/ja/" hreflang="ja" lang="ja">日本語</a>
```

On a Japanese page: `<a class="mx-lang" href="/" hreflang="en" lang="en">English</a>`.

## Variants and states

In the header's controls, after Daylight: `text-muted`, no underline, `text-lead` on hover.
Below 720px it is a 44px line of the open menu, under a dotted rule.

## Behaviour

No element; a plain link. Not rendered on articles, which have no twin (decision Q8).

## Tokens

`color.text-muted`, `color.text-lead`, `color.rule`, `size.target`, `space.2`, `border.width.hair`.

## Accessibility

Named in the language it leads to, with `lang` on the link and `hreflang` for the target.

## Do / Don't

- Do name the link in its own language (`日本語`, `English`).
- Don't render it where there is no twin.
