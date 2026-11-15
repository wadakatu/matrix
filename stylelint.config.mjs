// The CSS gates: no raw values in authored CSS, and the Baseline ledger.
//
// The ignore* lists are the ledger: every CSS feature matrix uses that is not Baseline
// widely available, each with why it is allowed. CI fails when a new one appears until it is
// added here with a justification (or wrapped in @supports).
const baseline = {
  available: "widely",
  ignoreSelectors: [
    "selection", // ::selection: cosmetic; degrades to the browser's own selection colours
    "details-content", // Newly available. The menu lays no box from 720px; without it the menu is a plain native disclosure at every width (menu.css)
  ],
  ignoreProperties: {
    "accent-color": ["/.*/"], // Newly available. Hold rain's tick in the accent; elsewhere the browser's own checkbox colours
    "forced-color-adjust": ["none"], // Only inside @media (forced-colors: active), whose engines all have it: the menu's figure keeps its gradient lines in system colours (menu.css)
    "content-visibility": ["/.*/"], // Newly available. Only inside @supports selector(::details-content), whose engines all have it: keeps the menu's content shown while closed from 720px
    "background-clip": ["text"], // Newly available. The rain's drops are text clipped to a gradient; where it is missing they are not drawn (decoration, aria-hidden). The switch's drip is inside @supports
    "scrollbar-width": ["/.*/"], // Newly available. The chips' row and the shell's screen keep a thin or no scrollbar; elsewhere the browser's own (chips.css, terminal.css)
    "scrollbar-color": ["/.*/"], // Newly available. The screen's thin scrollbar in rule; elsewhere the browser's own colours (terminal.css)
    "overscroll-behavior": ["/.*/"], // Newly available. Scrolling the session does not chain to the locked window; without it the window is still locked (terminal.css)
    "word-break": ["auto-phrase"], // Limited (Chromium). Japanese headings break by phrase where supported; elsewhere the default breaking applies (03)
  },
};

export default {
  plugins: ["stylelint-plugin-use-baseline"],
  rules: {
    "plugin/use-baseline": [true, baseline],
    // Genuine errors only.
    "color-no-invalid-hex": true,
    "declaration-block-no-duplicate-properties": true,
    "block-no-empty": true,
    "no-duplicate-selectors": true,
    "property-no-unknown": true,
    "unit-no-unknown": true,
    // No raw values (02, "Gates"): colours, font sizes and z-indexes come from tokens.
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"],
    "declaration-property-value-allowed-list": {
      "font-size": ["/^var\\(--mx-/", "inherit", "100%"],
      "z-index": ["/^var\\(--mx-layer-/", "auto"],
    },
    // Breakpoints (02, "Space, size, border"): media queries can't read custom properties, so the four are literals.
    "media-feature-name-value-allowed-list": Object.fromEntries(
      [
        ...["width", "min-width", "max-width"].map((f) => [f, ["600px", "720px", "1100px", "1360px"]]),
        // The one height: below it the live shell lets go of the one viewport (05, "lets go when it cannot fit").
        ["height", ["480px"]],
      ],
    ),
    // ...and no other size feature to set one by another name.
    "media-feature-name-disallowed-list": ["/^(min-|max-)?(device-width|device-height|inline-size|block-size)$/", "/^(min|max)-height$/"],
    "declaration-property-value-disallowed-list": {
      // A size inside the font shorthand is a raw font size too.
      font: ["/\\d(px|rem|em|pt|%)/"],
    },
  },
  overrides: [
    {
      // Generated from the tokens: the one place literal values live.
      files: ["dist/tokens.css"],
      rules: {
        "color-no-hex": null,
        "declaration-property-value-allowed-list": null,
      },
    },
  ],
};
