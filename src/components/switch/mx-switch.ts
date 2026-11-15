// <mx-switch>: on a phone the header's rain switch is one button (switch.css). This keeps it one tab
// stop, named by where the press goes (`人間用から機械用へ`). Everywhere else it removes what it added.
// The two links work without it; the in-place change is mx-readings'.
const compact = matchMedia("(width <= 600px)");
const NAME = { human: "人間用", machine: "機械用" } as const;

export class MxSwitch extends HTMLElement {
  #off = new AbortController();

  connectedCallback() {
    const { signal } = (this.#off = new AbortController());
    compact.addEventListener("change", () => this.sync(), { signal });
    addEventListener("mx:reading", () => this.sync(), { signal });
    this.sync();
  }

  disconnectedCallback() {
    this.#off.abort();
  }

  sync() {
    const one = compact.matches && !this.dataset.variant && !!this.closest(".mx-header");
    for (const a of this.querySelectorAll<HTMLAnchorElement>("a[data-to]")) {
      const current = a.getAttribute("aria-current") === "true";
      const to = a.dataset.to as keyof typeof NAME;
      const from = to === "machine" ? "human" : "machine";
      const set = (k: string, v: string | null) => (v === null ? a.removeAttribute(k) : a.getAttribute(k) !== v && a.setAttribute(k, v));
      set("aria-hidden", one && current ? "true" : null);
      set("tabindex", one && current ? "-1" : null);
      set("aria-label", one && !current ? `${NAME[from]}から${NAME[to]}へ` : null);
    }
    // The face just pressed is now the hidden one: focus moves to the button as it now stands.
    if (one && this.contains(document.activeElement) && (document.activeElement as HTMLElement).tabIndex === -1) {
      this.querySelector<HTMLElement>('a[data-to]:not([tabindex="-1"])')?.focus();
    }
  }
}
if (!customElements.get("mx-switch")) customElements.define("mx-switch", MxSwitch);
