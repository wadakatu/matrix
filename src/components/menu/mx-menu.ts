// <mx-menu>: closes the native disclosure the ways a reader expects. It opens and closes without
// this. Added: Escape, a press outside the header, a change of reading and leaving the page. Above
// 720px the summary is not rendered and none of this does anything.
export class MxMenu extends HTMLElement {
  #off = new AbortController();

  connectedCallback() {
    const details = this.querySelector("details");
    const summary = details?.querySelector("summary");
    if (!details || !summary) return;
    const close = () => {
      if (!details.open || !summary.offsetParent) return;
      // Focus on something about to be hidden goes back to the button; the switch stays where it is.
      const active = document.activeElement;
      const lost = !!active && details.contains(active) && !active.closest(".mx-switch");
      details.open = false;
      if (lost) summary.focus();
    };
    const { signal } = (this.#off = new AbortController());
    details.addEventListener("keydown", (e) => e.key === "Escape" && close(), { signal });
    addEventListener("click", (e) => (e.target as Element | null)?.closest?.(".mx-header") || close(), { signal });
    addEventListener("mx:reading", close, { signal });
    addEventListener("pagehide", close, { signal });
  }

  disconnectedCallback() {
    this.#off.abort();
  }
}
if (!customElements.get("mx-menu")) customElements.define("mx-menu", MxMenu);
