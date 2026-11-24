// @wadakatu/matrix/stylelint: the no-raw-values rules, for any stylesheet that uses matrix (07,
// "The consumer's checks"). matrix's own stylelint.config.mjs extends this file, so the rules a
// consumer runs are the rules matrix is held to. Needs only stylelint itself.
export default {
  rules: {
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
};
