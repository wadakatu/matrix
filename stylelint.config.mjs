// The CSS gates: no raw values in authored CSS, and the Baseline ledger.
//
// The ignore* lists are the ledger: every CSS feature matrix uses that is not Baseline
// widely available, each with why it is allowed. CI fails when a new one appears until it is
// added here with a justification (or wrapped in @supports).
const baseline = {
  available: "widely",
  ignoreSelectors: [
    "selection", // ::selection: cosmetic; degrades to the browser's own selection colours
  ],
  ignoreProperties: {
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
      ["width", "min-width", "max-width"].map((f) => [f, ["600px", "720px", "1100px", "1360px"]]),
    ),
    // ...and no other size feature to set one by another name.
    "media-feature-name-disallowed-list": ["/^(min-|max-)?(device-width|device-height|height|inline-size|block-size)$/"],
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
