---
name: Head
status: approved
attributes: [data-theme, data-palette, data-motion, data-boot, data-shell]
tokens: [color.ground, motion.boot.failsafe, motion.shell.fallback]
---

# Head

## Purpose

The page's meta and the pre-paint script, which sets the root's attributes before the first paint so
that no frame shows the wrong theme, palette or motion (L4, L7).

## Contract

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="theme-color" content="…" />
<title>…</title>
<meta name="description" content="…" />
<script>(() => { … })();</script>
```

`Head.astro` takes `title`, `description`, `flags` (the site's own code, run inside the script) and
`boot`. `@wadakatu/matrix/head` exports the script as a string (`headScript(site, { boot })`), the
flag lists (`FLAGS.carried`: `palette`, `motion`; `FLAGS.spent`: `theme`, `boot`, `run`, `mode`) and
the storage keys `THEME_KEY` (`mx-theme`) and `BOOT_KEY` (`mx-boot`). The stylesheets are the site
layout's own imports.

## Variants and states

What the script sets on `<html>`:

- `data-theme="day"`: `?theme=day`, or `localStorage['mx-theme']` is `day`.
- `data-palette="operator"`: `?palette=operator`. Never read from storage.
- `data-motion="off"`: `?motion=0`, or the system asks for reduced motion.
- `data-boot="play"` or `"frozen"`: with `boot` only (Boot's page).
- `data-shell="recorded"`: after `motion.shell.fallback`, when the page has an `<mx-terminal>` that
  has not gone live.

## Behaviour

Inline and synchronous: it runs before the body is parsed, with no other script loaded. It sets
`theme-color` to `color.ground` of the context. Reads of storage never throw. Until `mx-root` is
defined, a page whose palette or motion came from the address gets them on every in-site link at
`DOMContentLoaded`, so the flags travel with the controller blocked. With `boot` it decides the intro
and ends it on Escape, a click on it, or `motion.boot.failsafe`.

## Tokens

`color.ground` (each context's, for `theme-color`), `motion.boot.failsafe` and
`motion.shell.fallback`, read by id from `dist/tokens.json` when the script is built.

## Accessibility

No visible output. Reduced motion from the system is honoured before the first paint, and the boot
moves focus to `main` when it ends.

## Do / Don't

- Do put it first in `<head>`, inline, so that a Content Security Policy can allow it by hash.
- Don't store the palette: the address carries it (03).
