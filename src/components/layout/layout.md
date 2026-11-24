---
name: Layout
status: approved
attributes: [data-reading]
tokens: []
---

# Layout

## Purpose

The page frame every page of the site shares: skip link, rain, header, `main`, footer and the status
region inside `<mx-root>`, with every root attribute at its no-script value in the markup (L4, L7).

## Contract

```html
<!doctype html>
<html lang="en" data-theme="night" data-reading="human">
  <head><!-- Head --><!-- slot "head" --></head>
  <body>
    <mx-root data-wide="…" data-narrow="…">
      <!-- slot "boot" -->
      <a class="mx-skip" href="#main">Skip to content</a>
      <!-- slot "rain" -->
      <header class="mx-header">…</header>
      <main id="main" class="mx-frame" tabindex="-1">…</main>
      <footer class="mx-footer">…</footer>
      <p class="mx-status mx-vh" role="status"></p>
      <!-- slot "curtain" -->
    </mx-root>
  </body>
</html>
```

Props: `title`, `description`, `lang`, `reading`, `mark`, `nav`, `footer`, `alternate` (the twin in
the other language), `flags` and `boot` (passed to Head), and `corpus`, whose glyph pools become
`data-wide` and `data-narrow` for Decode. Slots: the default (inside `main`), `head`, `boot`, `rain`,
`switch` (in the header), `footer` and `curtain`. The site imports the stylesheets and
`@wadakatu/matrix/elements` itself.

## Variants and states

- `reading` given: `data-reading` on `<html>`, and the shortcut's off switch in the header's menu and
  in the footer, with its hint.
- No `reading` (a document with one reading): none of those.
- Everything else on the root is the head script's and `mx-root`'s (Head, Root).

## Behaviour

No element of its own; `<mx-root>` is Root. Without scripts the page is the markup: night, phosphor,
the route's reading.

## Tokens

None directly; the parts read their own.

## Accessibility

The skip link is the first tab stop and moves focus to `main` (Foundations); one `main`, one status
region; `lang` on `<html>` is the page's language (L6), and the strings follow it.

## Do / Don't

- Do pass `alternate` only when the twin exists.
- Don't put anything before the skip link but the boot.
