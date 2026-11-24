// <mx-toc>: Contents. The disclosure opens and closes and its links work without this. Added: the
// mark on the section being read (`aria-current="location"`), closing the disclosure when a section
// is chosen below 1100px, and opening it from 1100px in an engine that cannot keep it open in CSS.
const desk = matchMedia("(width >= 1100px)");
/** A heading counts as being read once its top has passed this far down the window (the prototype's). */
const READ_AT = 96;

export class MxToc extends HTMLElement {
  #off = new AbortController();

  connectedCallback() {
    const details = this.querySelector("details");
    if (!details) return;
    const { signal } = (this.#off = new AbortController());
    const open = () => desk.matches && (details.open = true);
    open();
    desk.addEventListener("change", open, { signal });
    details.addEventListener("click", (e) => (e.target as Element).closest("a") && !desk.matches && (details.open = false), { signal });

    const links = [...this.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
    const heads = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
    let queued = 0;
    const mark = () => {
      queued = 0;
      const at = heads.findLastIndex((h) => !!h && h.getBoundingClientRect().top < READ_AT);
      links.forEach((a, i) => (i === at ? a.getAttribute("aria-current") !== "location" && a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current")));
    };
    addEventListener("scroll", () => (queued ||= requestAnimationFrame(mark)), { passive: true, signal });
    mark();
  }

  disconnectedCallback() {
    this.#off.abort();
  }
}
if (!customElements.get("mx-toc")) customElements.define("mx-toc", MxToc);
