// <mx-root>: owns theme, palette, motion and flag-carrying links (03). The head script has already
// set the root attributes before first paint; this keeps them, the controls and the links in step.
import { FLAGS, THEME_KEY } from "../../head/head.ts";

const d = document.documentElement;
const store = (k: string, v?: string) => {
  try {
    if (v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {}
};

export class MxRoot extends HTMLElement {
  #off = new AbortController();

  connectedCallback() {
    const { signal } = (this.#off = new AbortController());
    // TOMBO's key is removed, not translated: its "light" is not a request for day (03).
    store("tombo-theme");
    const still = new URLSearchParams(location.search).get("motion") === "0";
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", () => {
      if (still || motion.matches) d.dataset.motion = "off";
      else delete d.dataset.motion;
    }, { signal });

    const theme = this.querySelector<HTMLButtonElement>('[data-action="theme"]');
    const palette = this.querySelector<HTMLButtonElement>('[data-action="palette"]');
    const hold = this.querySelector<HTMLInputElement>('[data-action="hold"] input');
    theme?.addEventListener("click", () => {
      d.dataset.theme = d.dataset.theme === "day" ? "night" : "day";
      store(THEME_KEY, d.dataset.theme);
      this.sync();
    }, { signal });
    // Never stored: the address carries it (decision Q4).
    palette?.addEventListener("click", () => {
      if (d.dataset.palette === "operator") delete d.dataset.palette;
      else d.dataset.palette = "operator";
      history.replaceState(history.state, "", this.carry(location.href, true));
      this.sync();
    }, { signal });
    const held = () => {
      if (hold?.checked) d.dataset.rain = "held";
      else delete d.dataset.rain;
    };
    hold?.addEventListener("change", held, { signal });
    held();
    this.sync();
  }

  disconnectedCallback() {
    this.#off.abort();
  }

  /** `href` with the carried flags as they stand now. For the address itself, spent flags go too. */
  carry(href: string, address = false): string {
    const u = new URL(href, location.href);
    for (const k of address ? [...FLAGS.carried, ...FLAGS.spent] : FLAGS.carried) u.searchParams.delete(k);
    if (d.dataset.palette === "operator") u.searchParams.set("palette", "operator");
    if (new URLSearchParams(location.search).get("motion") === "0") u.searchParams.set("motion", "0");
    return u.href;
  }

  /** Controls, browser chrome colour and every in-site link, from the root attributes. */
  sync() {
    const set = (el: Element | null, on: boolean) => el?.getAttribute("aria-pressed") !== String(on) && el?.setAttribute("aria-pressed", String(on));
    set(this.querySelector('[data-action="theme"]'), d.dataset.theme === "day");
    set(this.querySelector('[data-action="palette"]'), d.dataset.palette === "operator");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(d).backgroundColor;
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      if (a.origin !== location.origin || a.getAttribute("href")!.startsWith("#")) continue;
      const next = this.carry(a.href);
      if (a.href !== next) a.href = next;
    }
  }
}
if (!customElements.get("mx-root")) customElements.define("mx-root", MxRoot);
