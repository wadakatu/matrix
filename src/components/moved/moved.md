---
name: Moved
status: approved
class: mx-moved
tokens: []
---

# Moved

## Purpose

A stub page for an old address, because GitHub Pages cannot answer 301.

## Contract

```html
<!doctype html>
<html lang="en" data-theme="night">
  <head>
    <title>Moved | site</title>
    <link rel="canonical" href="https://example.com/to/">
    <script>location.replace(to + location.search + location.hash)</script>
    <meta http-equiv="refresh" content="0; url=/to/">
  </head>
  <body><main class="mx-frame mx-moved"><p>This page moved. <a href="/to/">/to/</a></p></main></body>
</html>
```

## Variants and states

One. The line sits 20% of the window down, on `ground`.

## Behaviour

With scripts the page replaces itself with the new address, carrying the query and the
fragment. Without scripts the refresh arrives without the query (05).

## Tokens

None beyond the base type; `20vh` is the prototype's one-off number.

## Accessibility

A page with one sentence and one link, in the page's language (`strings.moved`). It is
`noindex`; the canonical link names the new address.

## Do / Don't

- Do give the canonical as an absolute address.
- Don't add a delay to the refresh.
