---
name: Notice
status: draft
class: mx-notice
attributes: []
tokens: [color.ground, color.panel, color.rule, color.text, color.text-lead, color.accent, color.focus, font.family.mono, font.family.ja, font.size.body, font.weight.regular, font.weight.medium, font.leading.ui, border.width.hair, border.width.strong, space.1, space.2, space.4, space.5, space.7, size.measure.lede, size.target-min]
---

# Notice

## Purpose

The 404 page and the offline page: one panel, no chrome, and nothing to fetch.

## Contract

```html
<!doctype html>
<html lang="en" data-theme="night">
  <head>
    <!-- Head: meta, the title, the pre-paint script, all inline -->
    <meta name="robots" content="noindex">
    <style>/* tokens.css, then notice.css */</style>
  </head>
  <body class="mx-notice">
    <main>
      <h1>Not found</h1>
      <p>Nothing is at this address.</p>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/blog/">Blog</a></li>
      </ul>
    </main>
  </body>
</html>
```

`Notice.astro` renders the whole document; give it `kind` (`not-found` or `offline`), `site`
(after the title) and `links` (label and address, the site's, as the footer's are), and
anything for the head in the `head` slot. `NoticeBody.astro` is the body alone, for the stories.

## Variants and states

- `not-found`: the title, the sentence and the site's links.
- `offline`: its own words, and "Try again" first: a link to the page's own address
  (`href=""`). The service worker serves this page at the address that failed, so following
  the link asks for it again.
- A link: hover takes `text-lead` and the strong underline; focus shows the ring.

## Behaviour

No script of its own. `tokens.css` and `notice.css` are inlined in one `style` element, and
`Head`'s script is inline, so the page requests nothing but itself; text falls to the system
faces at the end of `font.family.mono` and `font.family.ja`. A site that wants its fonts on the
404 page links `fonts.css` in the `head` slot; the offline page leaves it empty. The flags work
(`?theme=`, `?palette=`, a stored `mx-theme`); without scripts the page is night and phosphor.
It does not reload when the network comes back: the site keeps that beside its service worker
if it wants it.

`notice.css` repeats the few declarations of `base.css` the page needs (the ground, the body
type, the link and the focus ring), because the foundation files are not per-component
exports. `tests/matrix.spec.mjs` checks that the two copies compute the same in every context.

## Tokens

`color.ground`, `color.panel`, `color.rule`, `color.text`, `color.text-lead`, `color.accent`,
`color.focus`; `font.family.mono`, `font.family.ja`, `font.size.body`, `font.weight.regular`,
`font.weight.medium`, `font.leading.ui`; `border.width.hair`, `border.width.strong`; `space.1`,
`space.2`, `space.4`, `space.5`, `space.7`; `size.measure.lede`, `size.target-min`. The panel's
inline padding is the Panel's `clamp()`, and `20vh` is Moved's.

## Accessibility

One `main` with the page's one heading (`h1`), set as a panel's heading is. The words are chrome
strings in both languages (`strings.notice`). Keyboard: Tab goes through the links in order
("Try again" first when offline), each with the focus ring; nothing else takes focus. There is
no skip link, because there is one block. Each link is at least `size.target-min` tall. On
paper: the day ink, no fill, the border kept. Forced colours need no rule: the border and the
underlines stay. The page is `noindex`.

## Do / Don't

- Do serve the offline page from the service worker's precache, at the address that failed.
- Don't link a stylesheet, a font or an image on the offline page.
- Don't add chrome, rain or a script to either page.
