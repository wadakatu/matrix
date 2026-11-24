// The CSS gates. The no-raw-values rules are the ones matrix ships (@wadakatu/matrix/stylelint,
// resolved through this package's own exports, so the repository lints itself through the shipped
// config); this file adds only what is matrix's own: the Baseline ledger and dist/tokens.css.
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
    "text-wrap": ["balance"], // Newly available. The article's title is balanced where supported; elsewhere it wraps as any line does (04, "Prose")
    "break-after": ["avoid"], // Print only. A heading stays with what follows it where the engine honours it; elsewhere a page may break after one (05, "Print")
    orphans: ["/.*/"], // Print only. Three lines of a paragraph at the foot or head of a page where supported; elsewhere the engine's own (05, "Print")
    widows: ["/.*/"], // Print only, as orphans (05, "Print")
  },
};

export default {
  extends: ["@wadakatu/matrix/stylelint"],
  plugins: ["stylelint-plugin-use-baseline"],
  rules: {
    "plugin/use-baseline": [true, baseline],
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
