---
name: Inline list
status: approved
class: mx-inline-list
tokens: [color.text-muted, font.size.meta, space.1, space.3, space.5, space.6, space.7]
---

# Inline list

## Purpose

A wrapping row of words or links: skills, a panel's trailing links, an entry's addresses.

## Contract

```html
<ul class="mx-inline-list"><li>TypeScript</li><li>Astro</li></ul>
<p class="mx-inline-list" data-variant="after"><a href="/projects/">All projects</a> <a href="/blog/">Read the blog</a></p>
<p class="mx-inline-list" data-variant="links"><a href="https://…">example.com</a></p>
```

## Variants and states

- Default: a list of words, 4px by 20px apart (the prototype's `.skills`).
- `data-variant="after"`: a panel's trailing links, 4px by 28px, 20px above (`.after`).
- `data-variant="links"`: an entry's addresses at `meta` size in `text-muted`, 4px by 24px (`.links`).

## Behaviour

No element.

## Tokens

`color.text-muted`, `font.size.meta`, `space.1`, `space.3`, `space.5`, `space.6`, `space.7`.

## Accessibility

Words are a list; links are a paragraph of links. A run in the other language carries `lang`.

## Do / Don't

- Do let it wrap; long addresses break anywhere.
- Don't use it for navigation: that is the Nav.
