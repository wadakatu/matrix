// <mx-boot>: plays the intro the head script decided on (05, "The boot"), on the Web Animations API.
// The head script ends the boot (Skip, Escape, a click, the failsafe) whether or not this loads; this
// only adds the motion, and stops it when the boot ends early or motion is turned off.
import { decode, moving, type TextTween } from "../decode/decode.ts";

const d = document.documentElement;
const EASE = { in: "cubic-bezier(0.55, 0.085, 0.68, 0.53)", out: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" };
const wait = (ms: number) => new Animation(new KeyframeEffect(null, null, { duration: ms }));

/** Ends the boot as the head script does: the root attribute, the event, focus to main. */
export function endBoot() {
  if (!d.dataset.boot) return;
  delete d.dataset.boot;
  dispatchEvent(new Event("mx:bootend"));
  document.getElementById("main")?.focus({ preventScroll: true });
}

export class MxBoot extends HTMLElement {
  #off = new AbortController();
  #running = new Set<Animation | TextTween>();
  #washing = false;

  connectedCallback() {
    const { signal } = (this.#off = new AbortController());
    if (d.dataset.boot) this.querySelector<HTMLElement>(".mx-boot-skip")?.focus();
    // Ended by the reader or the failsafe: drop the rest of the sequence (unless the curtain is lifting).
    addEventListener("mx:bootend", () => this.#washing || this.#stop(), { signal });
    const stillNow = () => {
      if (moving()) return;
      this.#stop();
      endBoot();
    };
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", stillNow, { signal });
    addEventListener("pagehide", () => this.#stop(), { signal });
    if (d.dataset.boot === "play" && moving()) this.#play();
  }

  disconnectedCallback() {
    this.#stop();
    this.#off.abort();
  }

  #stop() {
    for (const a of this.#running) "end" in a ? a.end() : a.cancel();
    this.#running.clear();
    // Finished slabs too: their fill would outlive the boot on an early end.
    const curtain = document.querySelector(".mx-curtain");
    curtain?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    curtain?.removeAttribute("data-on");
  }

  async #step<T extends Animation | TextTween>(a: T): Promise<boolean> {
    this.#running.add(a);
    const anim: Animation = "end" in a ? a.anim : (a as Animation);
    if (anim.playState === "idle") anim.play();
    try {
      await anim.finished;
      return d.dataset.boot === "play" || this.#washing;
    } catch {
      return false; // cancelled: the boot ended
    } finally {
      this.#running.delete(a);
    }
  }

  async #play() {
    const lines = [...this.querySelectorAll<HTMLElement>(".mx-boot-line:not(.mx-boot-logo)")];
    // Values start empty and decode in; the markup holds them settled for the still and for no script.
    for (const p of lines) p.querySelector(".mx-boot-value")!.textContent = "";
    if (!(await this.#step(wait(200)))) return;
    for (const p of lines) {
      const v = p.querySelector<HTMLElement>(".mx-boot-value")!;
      p.toggleAttribute("data-on", true);
      if (!(await this.#step(decode(v, 250 + Array.from(v.dataset.text!).length * 12, { allWide: true })))) return;
      v.toggleAttribute("data-done", true);
      if (!(await this.#step(wait(80)))) return;
    }
    // The mark is wiped in whole, top to bottom, in ten steps: a cover lifts off it. The image itself is
    // never clipped or scrambled (L5).
    const logo = this.querySelector<HTMLElement>(".mx-boot-logo")!;
    logo.toggleAttribute("data-on", true);
    const cover = logo.querySelector(".mx-boot-cover")!;
    if (!(await this.#step(cover.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(100% 0 0 0)" }], { duration: 500, easing: "steps(10)" })))) return;
    if (!(await this.#step(wait(500)))) return;
    // The curtain falls slab by slab, the boot ends behind it, and it lifts on the page.
    const curtain = document.querySelector<HTMLElement>(".mx-curtain");
    if (!curtain) return endBoot();
    const slabs = [...curtain.children] as HTMLElement[];
    const order = slabs.map((_, i) => ((i * 7919) % slabs.length) / slabs.length); // a fixed scatter, so stills repeat
    curtain.toggleAttribute("data-on", true);
    const fall = slabs.map((s, i) => s.animate([{ transform: "translateY(-100%)" }, { transform: "translateY(0)" }], { duration: 450, delay: order[i] * 260, easing: EASE.in, fill: "both" }));
    if (!(await Promise.all(fall.map((a) => this.#step(a)))).every(Boolean)) return;
    this.#washing = true;
    endBoot();
    const lift = slabs.map((s, i) => s.animate([{ transform: "translateY(0)" }, { transform: "translateY(100%)" }], { duration: 550, delay: 50 + order[i] * 260, easing: EASE.out, fill: "both" }));
    await Promise.all(lift.map((a) => this.#step(a)));
    fall.concat(lift).forEach((a) => a.cancel());
    curtain.removeAttribute("data-on");
    this.#washing = false;
  }
}
if (!customElements.get("mx-boot")) customElements.define("mx-boot", MxBoot);
