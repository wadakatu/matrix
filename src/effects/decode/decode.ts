// Text motion on the Web Animations API (spike S3): text cannot be animated by WAAPI, so a text tween
// is a target-less Animation whose progress one frame loop reads. Delay, easing, finish() and
// cancel() are the platform's. Pools come from the corpus (L1), read off <mx-root data-wide data-narrow>.
import { decodeFrame } from "../../lib/index.ts";

export interface TextTween {
  anim: Animation;
  /** Cancels the animation and applies the end state now. */
  end(): void;
}

const live = new Set<TextTween & { update(p: number): void }>();
let ticking = false;
function tick() {
  for (const t of live) {
    const p = t.anim.effect?.getComputedTiming().progress;
    if (p !== null && p !== undefined) t.update(p);
  }
  ticking = live.size > 0;
  if (ticking) requestAnimationFrame(tick);
}

/** `update(progress)` on every frame for `duration` ms, then `done()`. */
export function textTween(duration: number, update: (p: number) => void, done: () => void, o: { delay?: number; easing?: string } = {}): TextTween {
  const anim = new Animation(new KeyframeEffect(null, null, { duration, delay: o.delay ?? 0, easing: o.easing ?? "linear" }));
  const t = {
    anim,
    update,
    end() {
      if (!live.delete(t)) return;
      anim.cancel();
      done();
    },
  };
  live.add(t);
  anim.finished.then(() => t.end(), () => {});
  anim.play();
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(tick);
  }
  return t;
}

/** The corpus's glyph pools, as the layout wrote them. */
export function pools(): { wide: string; narrow: string } {
  const d = document.querySelector<HTMLElement>("mx-root")?.dataset ?? {};
  return { wide: d.wide ?? "", narrow: d.narrow ?? "" };
}

/** `el`'s text settles out of corpus glyphs over `ms`. Its final text is `data-text`, or its text now. */
export function decode(el: Element, ms: number, o: { allWide?: boolean; delay?: number } = {}): TextTween {
  const text = (el as HTMLElement).dataset?.text ?? el.textContent!.trim();
  const p = pools();
  return textTween(ms, (x) => (el.textContent = decodeFrame(text, x, Math.floor(x * 14), p, o.allWide)), () => (el.textContent = text), { delay: o.delay });
}

/** Motion is allowed: not `?motion=0`, not the OS setting (the head script and mx-root keep the attribute). */
export const moving = () => document.documentElement.dataset.motion !== "off" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Rain is held: the rewards are off then (05, catalogue). */
export const held = () => document.documentElement.dataset.rain === "held" || !!document.querySelector('[data-action="hold"] input:checked');
