// <mx-readings>: the in-place change between 人間用 and 機械用 (04, "Readings"; 05, "The reading
// change"). Without it every a[data-to] is a plain link to its static twin. With it a click on one, or
// the `\` / `¥` shortcut, swaps the root attribute, puts the twin (and the carried flags) in the address,
// updates the title, announces the reading and keeps focus out of the hidden reading.
//
// The motion is the prototype's, on the Web Animations API (spike S3, decision Q6): a change is a list of
// steps, and "a second request finishes the first" is rush(), which runs every remaining step's end state
// synchronously, so the next change starts on a settled page.
import { hexFrame } from "../../lib/index.ts";
import { decode, moving, textTween, type TextTween } from "../../effects/decode/decode.ts";

type Reading = "human" | "machine";
type Anim = Animation | TextTween;
interface Step {
  call?: () => void;
  run?: () => Anim[];
  end?: () => void;
}
const d = document.documentElement;
const other = (v: Reading): Reading => (v === "machine" ? "human" : "machine");
const SHORTCUT_KEY = "mx-shortcut";
/** What prints into 機械用, top to bottom (the terminal's lines, prompt, chips and status line). */
const PRINTED = ':scope > [data-reading="machine"] :is(.mx-ln, .mx-prompt, .mx-chips, .mx-modeline)';
const EASE = { in: "cubic-bezier(0.55, 0.085, 0.68, 0.53)", out: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", in1: "cubic-bezier(0.47, 0, 0.745, 0.715)" };
const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.width > 0;
};
const ended = (a: Anim) => ("end" in a ? a.anim.finished : a.finished);
const stop = (a: Anim) => ("end" in a ? a.end() : a.cancel());

class Change {
  #i = 0;
  #cur: { s: Step; anims: Anim[] } | null = null;
  rushing = false;
  constructor(private steps: Step[], private onEnd: () => void, private done: (c: Change) => void) {
    this.#next();
  }
  #next() {
    while (this.#i < this.steps.length) {
      const s = this.steps[this.#i++];
      if (s.call) {
        s.call();
        continue;
      }
      if (this.rushing) {
        s.end?.();
        continue;
      }
      const anims = s.run!();
      const mine = (this.#cur = { s, anims });
      Promise.all(anims.map(ended)).then(() => {
        if (this.#cur !== mine || this.rushing) return;
        this.#cur = null;
        s.end?.();
        this.#next();
      }, () => {});
      return;
    }
    this.done(this);
    this.onEnd();
  }
  /** Cancel what runs, apply its end state and every later step's, now. */
  rush() {
    if (this.rushing) return;
    this.rushing = true;
    const cur = this.#cur;
    this.#cur = null;
    if (cur) {
      cur.anims.forEach(stop);
      cur.s.end?.();
    }
    this.#next();
  }
}

export class MxReadings extends HTMLElement {
  #off = new AbortController();
  #change: Change | null = null;
  /** fill: forwards animations, cancelled once the change ends, so nothing persists on elements. */
  #held: Animation[] = [];
  #effects = new Set<TextTween>();

  get reading(): Reading {
    return d.dataset.reading === "machine" ? "machine" : "human";
  }

  connectedCallback() {
    const { signal } = (this.#off = new AbortController());
    // The prototype's guards: modified clicks open a tab as links do; the boot layer's own click ends the
    // boot in the head script first (registered earlier on the same target), then this changes reading.
    addEventListener("click", (e) => {
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[data-to]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const to = a.dataset.to as Reading;
      if (to === this.reading) return;
      if (a.closest(".mx-boot")) this.swap(to);
      else this.toggle();
    }, { signal });
    addEventListener("keydown", (e) => this.#key(e), { signal });
    for (const box of this.#boxes()) {
      try {
        box.checked = localStorage.getItem(SHORTCUT_KEY) !== "off";
      } catch {}
      box.addEventListener("change", () => this.#shortcut(box.checked), { signal });
    }
    this.#shortcut(this.#enabled(), false);
    // Reduced motion switched on mid-change ends it at once (05).
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (m) => m.matches && this.finish(), { signal });
    // Leaving the page finishes, so a restored page is never caught mid-change.
    addEventListener("pagehide", () => this.finish(), { signal });
    this.#sync(this.reading, false);
  }

  disconnectedCallback() {
    this.finish();
    this.#off.abort();
  }

  /** A second request finishes the first, completely, before it starts (05). */
  finish() {
    this.#change?.rush();
    for (const t of [...this.#effects]) t.end();
  }

  /** The other reading, with the transition when motion is allowed. */
  toggle() {
    this.finish();
    const v = other(this.reading);
    if (!moving() || d.dataset.boot || document.querySelector(".mx-curtain[data-on]")) return this.swap(v);
    this.setAttribute("aria-busy", "true");
    const printed = [...this.querySelectorAll<HTMLElement>(PRINTED)];
    const lines = v === "machine" ? printed.slice(-90) : printed.filter(onScreen);
    const keep = (a: Animation) => (this.#held.push(a), a);
    const release = () => {
      this.#held.forEach((a) => a.cancel());
      this.#held = [];
    };
    const onEnd = () => {
      release();
      this.removeAttribute("aria-busy");
      if (v === "human") this.#double();
      // Its prompt was still unprinted when the reading changed; the terminal can take focus now.
      else this.dispatchEvent(new CustomEvent("mx:reading", { detail: v, bubbles: true }));
    };
    const done = (c: Change) => this.#change === c && (this.#change = null);
    // The tube collapses around the middle of the window, wherever the page is scrolled to.
    const origin = () => `50% ${innerHeight / 2 - this.getBoundingClientRect().top}px`;
    const squash = (from: string, to: string, o: string, ms: number, easing: string, fill: FillMode = "forwards") =>
      this.animate([{ transform: from, transformOrigin: o }, { transform: to, transformOrigin: o }], { duration: ms, easing, fill });
    if (v === "machine") {
      // The page gives way: its text becomes the hex of its own characters, the picture collapses to a
      // line and goes out, and the session prints top to bottom.
      const hex = this.#dissolve();
      let o = "";
      this.#change = new Change([
        { run: () => [textTween(340, hex.update, () => {}, { easing: EASE.in1 })] },
        { call: () => (o = origin()) },
        { run: () => [keep(squash("scaleY(1)", "scaleY(0.004)", o, 160, EASE.in))] },
        { run: () => [keep(squash("scale(1, 0.004)", "scale(0, 0.004)", o, 100, EASE.in))] },
        { call: () => { hex.restore(); this.swap(v); release(); } },
        { run: () => this.#appear(lines, 550) },
      ], onEnd, done);
    } else {
      // Back: the session clears from the bottom, the page opens from a line, its headings settle.
      this.#change = new Change([
        { run: () => this.#vanish(lines, 220).map(keep) },
        { call: () => { this.swap(v); release(); } },
        {
          run: () => {
            const open = squash("scaleY(0.004)", "scaleY(1)", origin(), 280, EASE.out, "none");
            const settle = [...new Set([...this.querySelectorAll<HTMLElement>(':scope > [data-reading="human"] :is(h2, .mx-stream-name a)')].map((el) => el.firstElementChild ?? el))]
              .filter(onScreen)
              .map((el, i) => decode(el, 450, { delay: 80 + Math.min(i, 24) * 20 }));
            return [open, ...settle];
          },
        },
      ], onEnd, done);
    }
  }

  /** The instant change: everything a reading is, with no motion. */
  swap(v: Reading) {
    const hiding = this.querySelector(`:scope > [data-reading="${other(v)}"]`);
    const lost = !!hiding?.contains(document.activeElement);
    this.#sync(v, true);
    if (lost) {
      // Focus goes to the side just taken in the header, or to the one compact button.
      const sides = [...document.querySelectorAll<HTMLElement>(".mx-header .mx-switch a[data-to]")];
      (sides.find((a) => a.dataset.to === v && a.tabIndex !== -1) ?? sides.find((a) => a.tabIndex !== -1))?.focus();
    }
    // The side just taken settles out of raw glyphs, as the page's headings do. The capsule stays as it is.
    if (moving()) {
      for (const el of document.querySelectorAll(`.mx-header .mx-switch:not([data-variant]) a[data-to="${v}"] .mx-switch-label`)) {
        const t = decode(el, 450, { allWide: true });
        this.#effects.add(t);
        t.anim.finished.finally(() => this.#effects.delete(t)).catch(() => {});
      }
    }
    history.replaceState(history.state, "", this.#address(v));
    const status = document.querySelector(".mx-status");
    if (status) status.textContent = this.dataset[`${v}Status`] ?? "";
    scrollTo(0, 0);
    this.dispatchEvent(new CustomEvent("mx:reading", { detail: v, bubbles: true }));
  }

  /** The root attribute, the title, the links that follow the reading, aria-current. */
  #sync(v: Reading, change: boolean) {
    d.dataset.reading = v;
    if (change) document.title = this.dataset[`${v}Title`] ?? document.title;
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-human-href][data-machine-href]")) a.href = a.dataset[`${v}Href`]!;
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-to]")) {
      if (a.closest(".mx-boot")) continue; // on the boot layer neither side has been chosen
      // Only when it changes, so the wipe does not restart on a recolour (04, "Rain").
      if (a.dataset.to === v) a.getAttribute("aria-current") !== "true" && a.setAttribute("aria-current", "true");
      else a.hasAttribute("aria-current") && a.removeAttribute("aria-current");
    }
    (this.closest("mx-root") as (HTMLElement & { sync?: () => void }) | null)?.sync?.();
  }

  /** The static twin, with the flags that travel and none that are spent. */
  #address(v: Reading): string {
    const href = document.querySelector<HTMLAnchorElement>(`a[data-to="${v}"]`)?.href ?? location.href;
    const root = this.closest("mx-root") as (HTMLElement & { carry?: (h: string, a: boolean) => string }) | null;
    return root?.carry ? root.carry(href, true) : href;
  }

  #dissolve() {
    const nodes: { n: Text; text: string }[] = [];
    const human = this.querySelector(':scope > [data-reading="human"]');
    if (human) {
      const walk = document.createTreeWalker(human, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const n = walk.currentNode as Text;
        if (n.nodeValue!.trim() && !n.parentElement!.closest(".mx-stream-fall") && onScreen(n.parentElement!)) nodes.push({ n, text: n.nodeValue! });
      }
    }
    return {
      update: (p: number) => nodes.forEach(({ n, text }) => (n.nodeValue = hexFrame(text, p))),
      restore: () => nodes.forEach(({ n, text }) => (n.nodeValue = text)),
    };
  }

  /** Lines print at staggered moments: a visibility hold until each one's moment, nothing left behind. */
  #appear(lines: HTMLElement[], total: number): Animation[] {
    return lines.map((el, i) =>
      el.animate([{ visibility: "hidden" }, { visibility: "hidden" }], { delay: 80, duration: 10 + (lines.length > 1 ? (total * i) / (lines.length - 1) : 0), fill: "backwards" }));
  }

  #vanish(lines: HTMLElement[], total: number): Animation[] {
    return lines.map((el, i) =>
      el.animate([{ visibility: "visible" }, { visibility: "hidden" }], { duration: 10, delay: lines.length > 1 ? (total * (lines.length - 1 - i)) / (lines.length - 1) : 0, fill: "forwards", easing: "steps(1, jump-start)" }));
  }

  /** Returning to 人間用: the name doubles once (05, catalogue). */
  #double() {
    const name = this.querySelector<HTMLElement>(".mx-name");
    if (!name || !moving()) return;
    name.toggleAttribute("data-double", true);
    const clear = () => name.removeAttribute("data-double");
    name.addEventListener("animationend", clear, { once: true });
    // A reduced-motion change mid-double removes the animation, and with it animationend.
    setTimeout(clear, 400);
  }

  #boxes() {
    return [...document.querySelectorAll<HTMLInputElement>('[data-action="shortcut"] input')];
  }
  #enabled() {
    return this.#boxes()[0]?.checked ?? true;
  }
  /** The shortcut's off switch (2.1.4): stored, in the footer and the menu, kept in step. */
  #shortcut(on: boolean, store = true) {
    for (const b of this.#boxes()) b.checked = on;
    for (const a of document.querySelectorAll("a[data-to]")) {
      if (on) a.setAttribute("aria-keyshortcuts", "\\ ¥");
      else a.removeAttribute("aria-keyshortcuts");
    }
    if (store) {
      try {
        localStorage.setItem(SHORTCUT_KEY, on ? "on" : "off");
      } catch {}
    }
  }

  #key(e: KeyboardEvent) {
    // Ctrl and Alt together are AltGr, which some layouts need to type a backslash at all.
    if (!this.#enabled() || e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey !== e.altKey || e.repeat || d.dataset.boot) return;
    const typing = e.composedPath().some((el) => el instanceof HTMLElement && (el.isContentEditable || el.matches('input, textarea, select, [role="textbox"], [role="combobox"]')));
    if (typing) return;
    // A JIS keyboard types ¥ on the same key.
    if (e.key !== "\\" && e.key !== "¥") return;
    e.preventDefault();
    this.toggle();
  }
}
if (!customElements.get("mx-readings")) customElements.define("mx-readings", MxReadings);
