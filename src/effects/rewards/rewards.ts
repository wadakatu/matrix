// The two rewards that belong to streams (05, catalogue): déjà vu on the second visit to an entry, and a
// title flickering into the commit that shipped it. Both are off with reduced motion and while rain is
// held, and leave nothing behind. (The name doubling is mx-readings'.) Delegated from the document, so
// streams printed later take part too.
import { decode, held, moving, type TextTween } from "../decode/decode.ts";

const visits = new WeakMap<Element, number>();
const running = new Set<{ stop(): void }>();

/** Stop every reward now and remove what it added. */
export function stopRewards() {
  for (const r of [...running]) r.stop();
}

function visit(e: Event) {
  const s = (e.target as Element | null)?.closest?.(".mx-stream");
  if (!s || (e.type === "pointerover" && s.contains((e as PointerEvent).relatedTarget as Node))) return;
  if (e.type === "focusin" && s.contains((e as FocusEvent).relatedTarget as Node)) return;
  const n = (visits.get(s) ?? 0) + 1;
  visits.set(s, n);
  if (n !== 2 || !moving() || held()) return;
  s.setAttribute("data-reward", "deja");
  const r = { stop: () => { clearTimeout(t); running.delete(r); s.getAttribute("data-reward") === "deja" && s.removeAttribute("data-reward"); } };
  const t = setTimeout(r.stop, 520);
  running.add(r);
}

function flick(h: HTMLElement) {
  const s = h.closest<HTMLElement>(".mx-stream")!;
  const a = h.querySelector("a")!;
  const wrap = document.createElement("span");
  wrap.className = "mx-ghost";
  wrap.setAttribute("aria-hidden", "true");
  const ghost = wrap.appendChild(document.createElement("span"));
  ghost.lang = "en";
  ghost.dataset.text = s.dataset.commit!;
  let tween: TextTween | null = null;
  let timer = 0;
  const r = {
    stop() {
      clearTimeout(timer);
      tween?.end();
      wrap.remove();
      s.removeAttribute("data-reward");
      running.delete(r);
    },
  };
  running.add(r);
  const later = (ms: number, fn: () => void) => (timer = window.setTimeout(fn, ms));
  later(2200, () => {
    if (!moving() || held()) return r.stop();
    h.append(wrap);
    s.setAttribute("data-reward", "flick");
    tween = decode(ghost, 300);
    later(1000, () => {
      ghost.lang = a.closest<HTMLElement>("[lang]")?.lang ?? "en";
      ghost.dataset.text = a.textContent!.trim();
      tween = decode(ghost, 250);
      later(550, r.stop);
    });
  });
}

if (typeof document !== "undefined") {
  addEventListener("pointerover", visit);
  addEventListener("focusin", visit);
  // Shortly after an entry with a commit is first fully on screen, once.
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      seen.unobserve(e.target);
      if (moving() && !held()) flick(e.target as HTMLElement);
    }
  }, { threshold: 1 });
  const watch = () => document.querySelectorAll(".mx-stream[data-commit] .mx-stream-name").forEach((h) => seen.observe(h));
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", watch, { once: true });
  else watch();
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (m) => m.matches && stopRewards());
  addEventListener("pagehide", stopRewards);
  // A change of reading hides the entries; nothing is left running on them.
  addEventListener("mx:reading", stopRewards);
  // Hold rain checked: no reward is left half done.
  addEventListener("change", (e) => (e.target as Element).closest?.('[data-action="hold"]') && stopRewards());
}
