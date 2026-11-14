# 03 — Theming

How the four contexts, the two readings, motion and language are selected at runtime, and
what the page looks like before any script runs.

## The root contract

All global state is an attribute on `<html>`. CSS keys on these attributes, scripts only
set them, and each one has a value that is correct with no script at all.

| Attribute | Values | Default (in the markup) | Set by | Persisted |
| --- | --- | --- | --- | --- |
| `data-theme` | `night`, `day` | `night` | Head script; the Daylight control; the shell's `theme` command | `localStorage['mx-theme']`, only after the reader chooses |
| `data-palette` | `phosphor`, `operator` | absent (= `phosphor`) | Head script from `?palette=`; the Operator control; `palette` command | Never. The address carries it (law L7; open question Q4) |
| `data-motion` | `off` | absent | Head script from `?motion=0` or the OS setting; live changes of the OS setting | No |
| `data-reading` | `machine`, `human` | Set by each static route | The route; the in-place change | No. The address is the state |
| `data-rain` | `held` | absent | The Hold rain checkbox | No |
| `data-boot` | `play`, `frozen` | absent | Head script | `sessionStorage['mx-boot']` (once per tab) |
| `lang` | `en`, `ja` | Set by each page | The page | — |

Renamed from the prototype: `data-view="page|machine"` becomes
`data-reading="human|machine"`, to match the vocabulary (00). `data-theme="light"` is no
longer an alias of `day`; the screenshot harness that needed it is replaced by Storybook
globals (06).

**A theme scope** is any element that carries `data-palette` and `data-theme`. The root is
one; a story that shows all four contexts side by side makes four more. A scope must set
both attributes on the same element (see "The one exception").

## Colour: two axes, resolved by the platform

The palette is chosen by an attribute selector. The theme is chosen by `color-scheme`, and
each colour token is a `light-dark()` pair, so the browser picks the day or night value
where the colour is used.

```css
@layer mx.tokens {
  /* 1. Night values, for every engine. An engine without light-dark() gets the night world, complete. */
  :root, [data-palette="phosphor"] { --mx-color-ground: #020805; /* … */ }
  [data-palette="operator"]        { --mx-color-ground: #100e0b; /* … */ }
  :root, [data-theme="night"]      { color-scheme: dark; }

  /* 2. Both themes, where light-dark() exists. Later in the layer, so day wins on the root. */
  @supports (color: light-dark(#000, #fff)) {
    :root, [data-palette="phosphor"] { --mx-color-ground: light-dark(#ccd7c9, #020805); /* … */ }
    [data-palette="operator"]        { --mx-color-ground: light-dark(#cdd6cb, #100e0b); /* … */ }
    [data-theme="day"]               { color-scheme: light; }
  }
}
```

This block is generated from the tokens (02); it is shown here because its shape is the design.

What this buys:

- **The two axes stay independent in CSS** even though their values are tuned jointly.
  Any nesting of palette and theme scopes resolves correctly, with no compound selectors.
- **`color-scheme` and the tokens cannot disagree.** Native scrollbars, form controls and
  the canvas follow the same switch that the tokens follow.
- **Half the declarations**, and a day/night pair is one line that can be read as a pair.

Rules that keep it working:

- Colour tokens are never registered with `@property`. An unregistered custom property
  keeps `light-dark()` unresolved until it is used, which is what lets a nested scope
  re-resolve it. Registering it as `<color>` would freeze the root's answer.
- A component never tests the theme. If it needs a different value by day, that value is a
  token. `color.glow` is the model: accent at night, transparent by day, so
  `text-shadow: 0 0 12px var(--mx-color-glow)` needs no theme selector. TOMBO's glow tokens
  work the same way and say why in `tombo.css`.

### Standard practice, and the departure

The common pattern is to redeclare semantic variables under a theme selector or media
query: Primer uses `data-color-mode`, Open Props uses `prefers-color-scheme` plus
`[data-theme]` ([Open Props](https://open-props.style/)), and Terrazzo's CSS plugin emits
exactly that from a resolver ([docs](https://terrazzo.app/docs/integrations/css/)). The
prototype does the same with four `:root[…]` blocks.

matrix departs from it for the theme axis only, by using `light-dark()`
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)), for the
three reasons above. The repository has precedent: TOMBO is built on `light-dark()` and
lists it first in its Baseline ledger ("the token foundation; the whole system is built on
it", `stylelint.config.mjs`).

Cost: `light-dark()` has been Baseline newly available since 2024-05-13 and `web-features`
3.46.0 does not yet list it as widely available. An engine without it (before Chrome 123,
Safari 17.5, Firefox 120) cannot resolve the function, and because an invalid value inside a
custom property is only discovered at use, a fallback declaration on the line above does
not work. Hence the `@supports` split: such an engine gets block 1, which is the whole night
world in the right palette, and loses only the Daylight control (hidden by an
`@supports not` rule). That is the default experience, so nothing a first-time reader sees
is degraded.

### The one exception: the logo tint

Operator night tints the mark with a filter; every other context shows it as designed (law
L5). A filter is not a colour, so `light-dark()` cannot carry it, and the rule needs to know
both axes at once:

```css
[data-palette="operator"][data-theme="night"] .mx-logo,
:root[data-palette="operator"]:not([data-theme="day"]) .mx-logo { filter: var(--mx-logo-filter); }
```

This is why a theme scope must set both attributes on one element. It is the only rule in
the system written this way, and it is covered by a story that nests all four scopes.

## Theme: night first

- The document is served with `data-theme="night"`. A light operating system still gets
  night (law L7). `prefers-color-scheme` is not consulted.
- The Daylight control switches to `day` and stores the choice. `?theme=day|night` forces a
  theme for one load and is not stored or written back to the address.
- `<meta name="color-scheme" content="dark light">` and a `theme-color` meta that the head
  script sets from the resolved `color.ground` are part of the head contract, so browser
  chrome matches before the stylesheet arrives.

Not following the OS departs from the convention (Open Props and most systems default to
`prefers-color-scheme`). It is the approved direction: the station is a night screen, and
day is a variant a reader asks for.

## Palette: carried by the address

As approved: phosphor unless the address says `?palette=operator`. Nothing is stored. The
Operator control rewrites the address with `history.replaceState`, and same-site links
carry the flag, so the address bar is always the shareable state.

The cost of that decision is a piece of machinery: a controller must keep every in-site
link's query in step with the current flags, and the head script must do the same when the
controller fails to load. matrix ships both (`mx-root`, and the head script's fallback), and
they are the most intricate behaviour in the chrome. Open question Q4 offers a simpler
mechanism with slightly different semantics; the default is the approved one.

Flags that travel on links: `palette`, `motion`. Flags that are spent after one load and
are never written back: `theme`, `boot`, `run`, `mode`.

## Readings

`data-reading` selects which of the two renderings in the document is displayed; the other
is `display: none`, so it is out of the accessibility tree and the tab order. Each static
route sets the attribute in its markup, so both readings exist as real addresses without
JavaScript.

What differs in 機械用, driven only by `[data-reading="machine"]`:

| | 人間用 | 機械用 |
| --- | --- | --- |
| Rain | Ambient, fixed to the window | Off (except the switch, and `cmatrix`) |
| Frame | Capped at `size.frame` | Full window width |
| Scan lines | None | Over the whole screen, under the status line; the logo and filled controls are lifted above them |
| Header nav | Links, current one underlined | A numbered window list, current one starred |
| Header rule | Solid | Dashed |
| Name (`h1`) | Giant, masked with the commit log | A terminal line with a cursor; visually hidden once the live shell owns the viewport |
| Footer | Shown | Hidden in the live shell (the status line replaces it) |
| Glow | None | Phosphor bloom on the name at night |

Articles have one reading. On them the switch shows 人間用 as current and its 機械用 side
is a link into the shell at that file.

## Motion as a context

`data-motion="off"` and `@media (prefers-reduced-motion: reduce)` select the same set of
stills (law L4). The attribute exists because the query alone cannot express `?motion=0`,
which stills and tests need; the media query exists because the attribute needs a script.
Both paths are specified per effect in 05.

## Language as a context

Language is selected by `lang`, with `:lang()` in CSS, never by a class or a token context.
That is what makes a Japanese title inside an English page take the Japanese face with no
extra markup beyond the `lang` it needs anyway.

| | `:lang(en)` (default) | `:lang(ja)` |
| --- | --- | --- |
| Family | `font.family.mono` | `font.family.ja` |
| Letter spacing | As set by the component | `normal`, always. No negative tracking on Japanese |
| Article measure | `size.measure.lede` | `size.measure.read` (40 full-width characters) |
| Line breaking | default | `line-break: strict`; titles and headings `word-break: auto-phrase` |
| Body leading | `font.leading.ui` | `font.leading.read` in articles |

- `word-break: auto-phrase` is limited availability (Chromium only); it is progressive
  enhancement and is listed in the Baseline ledger.
- Mixed-script alignment is never done by counting characters. IBM Plex Mono's advance is
  0.6em and a full-width glyph is 1em, so Latin and Japanese do not share a cell grid.
  Columns are laid out with CSS grid, and indents next to Japanese use `em`, as the
  prototype's contents rail already does.
- Chrome strings come from `@wadakatu/matrix/strings` in `en` and `ja`, chosen by the page's
  language, so a Japanese page can be Japanese throughout (law L6). 人間用 and 機械用 are
  names and are the same in both.

## Before the first paint

The head contract is one small inline script (`@wadakatu/matrix/head`), plus the meta tags
above. It runs before the stylesheet applies and does only this:

1. Reads `?theme`, then `localStorage['mx-theme']`; sets `data-theme="day"` if asked.
2. Reads `?palette`; sets `data-palette="operator"` if asked.
3. Reads `?motion=0` and the OS preference; sets `data-motion="off"`.
4. Leaves hooks for the site's own flags (`mode`, `boot`, `run`) rather than knowing them.

Hiding the Daylight control where `light-dark()` is missing is not the script's job: the
control's stylesheet does it with `@supports not (color: light-dark(#000, #fff))`.

Requirements on that script:

- **Fails open.** Every storage read is wrapped; a `SecurityError` changes nothing visible.
- **No dependency on the controller.** If `mx-root` never loads, plain links still carry
  `palette` and `motion`, and the switch's links still point at the right static routes
  (the prototype's "fallback link sync", kept).
- **Inline.** It is inlined by the `Head` Astro component, so a site with a Content Security
  Policy allows it by hash. The hash is published with each release.

## Storage and same-origin neighbours

`mx-theme` is the only persistent key. Storybook may be served from the same origin as the
site (06), so the Storybook preview never reads or writes `mx-*` storage; its toolbar holds
the state instead. TOMBO's `tombo-theme` key is removed once on first load after migration
and is not mapped to a matrix theme: a stored "light" from the old site is not a request
for day in the new one.

## Adding a palette later

A new palette is two token files (`<name>-night`, `<name>-day`), two more contexts in the
resolver, and one more attribute value. No component changes, because no component names a
hue (law L7). The contrast gate runs on the new contexts automatically.

## Not doing

- **Following the OS theme**, or an `auto` value. Not requested; contradicts L7.
- **High-contrast palette.** `forced-colors` is supported instead (05); the palettes already
  clear AA with wide margins at night.
- **Per-component theming APIs.** Custom properties inherit; a scope is enough.
