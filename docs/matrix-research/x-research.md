# X Researcher report (2026-11-15) — matrix personal design system
Source: X Researcher agent. Full text kept in wadakatu-chan chat; key points + URLs:

## 1) Personal DS scope
- Devon Govett: modern CSS + headless components → solo DS w/ accessible behavior in 1–2 weeks. https://x.com/devongovett/status/1978959266137436575
- Counter: building your own takes too long. https://x.com/cgtwts/status/1950416963060355078
- Start from shadcn, own it later. https://x.com/ariflogs/status/1913110055400116614
- Cory House: in-app private component page instead of Storybook. https://x.com/housecor/status/1937500872491049004
- Dan Mall: tools + rules together. https://x.com/danmall/status/1894038456403136589

## 2) Tokens / dark / a11y
- DTCG 2025.10 first stable (CG Final Report, not W3C Rec). https://www.designtokens.org/tr/2025.10/ https://x.com/DesignTokens/status/1983243367577493730
- Lukas Oppermann: W3C-format pipeline + style-dictionary-utils. https://x.com/lukasoppermann/status/2014021935609352503
- Style Dictionary v4 DTCG; v5 full 2025.10 in progress, Node 22+, `{ref}` only. https://styledictionary.com/info/dtcg/ https://styledictionary.com/versions/v5/migration/
- Terrazzo DTCG-native, resolver in 2.0. https://terrazzo.app/docs/
- Tailwind v4 @theme via SD selector. https://x.com/mryechkin/status/1884042557514199348
- APCA: excess contrast in dark mode; body text ~#ccc–#e4e4e4 on #000 (Lc ~-90 cap). https://github.com/Myndex/SAPC-APCA/discussions/111 ; halation w/ saturated colors https://github.com/Myndex/SAPC-APCA/discussions/74 https://github.com/w3c/wcag3/issues/221
- Implication: no glow on body text; don't default body to max-luminance green on pure black; a dimmer body-text green token.
- Reduced motion: https://www.w3.org/WAI/WCAG22/Techniques/css/C39 https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

## 3) Agent-readable DS
- State of AI in Design Systems (Kaelig, 2026-07). https://state-of-ai-in-design-systems.netlify.app/
- Brad Frost: agents hand-roll buttons despite docs → drift checks needed. https://x.com/brad_frost/status/2115131614892278018
- Polar Orbit: typed tokens + CI. https://polar.sh/blog/orbit-llm-safe-design-system
- DESIGN.md (Google Labs) https://github.com/google-labs-code/design.md ; one line in AGENTS.md pointing to it https://x.com/terrapixelio/status/2109302683157037286 ; https://agents.md/ ; https://llmstxt.org/
- shadcn registry/MCP https://ui.shadcn.com/docs/mcp
- Storybook MCP (addon-mcp, 10.3, React) https://storybook.js.org/docs/ai/mcp/overview ; SB 11 beta "agent-ready", incl. Web Components https://storybook.js.org/blog/storybook-11-beta/
- Pitfalls: too many instruction files https://x.com/fizzibitz/status/2034622779220431231 ; Figma/code drift https://x.com/tombohdalek/status/2108196455538200701

## 4) Storybook publishing
- Static build → GitHub Pages OK. https://storybook.js.org/docs/sharing/publish-storybook
- SB 9 lighter, a11y/interaction/visual tests. https://storybook.js.org/blog/storybook-9/
- Astro: community Storybook Astro 1.16.0 (2026-11-11), SB 10/11 + addon-mcp. https://storybook-astro.org/reference/changelog/
- Public examples: Baklava (Lit WC) https://baklava.design/ ; Polaris https://components.polaris.shopify.dev/ ; no solo personal DS w/ public Storybook confirmed.

## Takeaways (research suggestions, not decisions)
Start small (tokens+themes+few components); dimmer body-text green token, APCA+WCAG checks, stop rain/scanline under reduced motion; compare Terrazzo vs SD v5 for themes; AGENTS.md → DESIGN.md one line, types+CI against drift, few instruction files; GitHub Pages is enough for Storybook.
