// The stylesheets and the elements, once. The toolbar is the only state: no story sets the root
// attributes itself and nothing reads storage, so a story looks the same for every visitor (06).
import "../dist/fonts.css";
import "../dist/matrix.css";
import "./preview.css";
import Language from "./Language.astro";
import Contexts from "../src/fixtures/Contexts.astro";
// The elements touch the DOM when they load; the framework also reads this file on the server.
if (typeof document !== "undefined") {
  import("../src/elements.ts");
  // Stamps the story in the root's language (Language.astro). Defined before any story is on the
  // page, so it runs as the story is inserted, before the accessibility check reads it.
  customElements.get("sb-language") ?? customElements.define("sb-language", class extends HTMLElement {
    connectedCallback() {
      const t = this.querySelector<HTMLTemplateElement>(`:scope > template[data-lang="${document.documentElement.lang}"]`);
      if (t) this.replaceChildren(t.content.cloneNode(true));
    }
  });
}

type Node = { component?: unknown; props?: Record<string, unknown> };
/** A slot that is a component taking `lang` (MenuContent) gets the same language. */
const relang = (v: unknown, lang: string) => {
  const n = v as Node;
  return n?.component && n.props && "lang" in n.props ? { ...n, props: { ...n.props, lang } } : v;
};

const item = (value: string, title = value) => ({ value, title });
export default {
  globalTypes: {
    palette: { description: "Palette", toolbar: { title: "Palette", items: [item("phosphor"), item("operator")], dynamicTitle: true } },
    theme: { description: "Theme", toolbar: { title: "Theme", items: [item("night"), item("day")], dynamicTitle: true } },
    motion: { description: "Motion", toolbar: { title: "Motion", items: [item("full"), item("held"), item("off")], dynamicTitle: true } },
    language: { description: "Language", toolbar: { title: "Language", items: [item("en"), item("ja")], dynamicTitle: true } },
    reading: { description: "Reading", toolbar: { title: "Reading", items: [item("human"), item("machine")], dynamicTitle: true } },
  },
  initialGlobals: { palette: "phosphor", theme: "night", motion: "full", language: "en", reading: "human" },
  // Language passes `lang`, so the chrome strings, to a component that takes it (06). A static build
  // renders a story once, with no toolbar, so it is rendered in both languages and the root's is
  // stamped (Language.astro). `Contexts` frames each rendering, so it is applied here, not per story.
  decorators: [
    (Story: () => unknown, { component, args, parameters }: { component: unknown; args: Record<string, unknown>; parameters: { chrome?: boolean; contexts?: boolean } }) => {
      const frame = (inner: unknown) => (parameters.contexts ? { component: Contexts, slots: { default: inner } } : inner);
      if (!parameters.chrome) return frame(Story());
      const { slots = {}, ...rest } = args as { slots?: Record<string, unknown> };
      const props = Object.fromEntries(Object.entries(rest).filter(([k]) => !k.startsWith("slot-")));
      const render = (lang: string) =>
        frame({ component, props: { ...props, lang }, slots: Object.fromEntries(Object.entries(slots).map(([k, v]) => [k, relang(v, lang)])) });
      return { component: Language, slots: { en: render("en"), ja: render("ja") } };
    },
  ],
  // Each global is one root attribute (03). Astro decorators run on the server, so this is where
  // the iframe's <html> is set; it runs again on every toolbar change (S1).
  beforeEach: ({ globals }: { globals: Record<string, string> }) => {
    const root = document.documentElement;
    root.dataset.palette = globals.palette;
    root.dataset.theme = globals.theme;
    root.dataset.reading = globals.reading;
    root.lang = globals.language;
    if (globals.motion === "held") root.dataset.rain = "held";
    else delete root.dataset.rain;
    if (globals.motion === "off") root.dataset.motion = "off";
    else delete root.dataset.motion;
  },
  // Definition of done, point 1 (04), in part: the Default story's output has every class and
  // element its doc's Contract names. Presence only; nesting, attributes and text are not compared.
  afterEach: ({ canvasElement, parameters, name }: { canvasElement: HTMLElement; parameters: { contract?: string }; name: string }) => {
    const html = parameters.contract?.match(/## Contract\s+```html\n([\s\S]*?)```/)?.[1];
    if (name !== "Default" || !html) return;
    const named = new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/).map((c) => `.${c}`)));
    for (const [, el] of html.matchAll(/<(mx-[a-z-]+)/g)) named.add(el);
    const missing = [...named].filter((s) => !canvasElement.querySelector(s));
    if (missing.length) throw new Error(`The Default story does not render what its doc's Contract names: ${missing.join(", ")}`);
  },
  parameters: {
    a11y: { test: "error", options: { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } },
    layout: "fullscreen",
    viewport: { options: { narrow: { name: "Narrow (390)", styles: { width: "390px", height: "844px" } }, wide: { name: "Wide (1440)", styles: { width: "1440px", height: "900px" } } } },
    options: { storySort: { order: ["Welcome", "Foundations", ["Colour", "Type", "Space and size", "Motion", "Logo", "Language"], "Chrome", "Surfaces", "*"] } },
  },
};
