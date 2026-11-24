// <mx-share>: Copy link copies the page's address, and the system sheet is offered only where
// `navigator.share` exists. Post on X is a plain link and needs nothing. Without scripts the two
// buttons are not shown (05).
import { copy } from "../code/mx-copy.ts";

export class MxShare extends HTMLElement {
  #off = new AbortController();

  connectedCallback() {
    const { signal } = (this.#off = new AbortController());
    const url = this.dataset.url ?? location.href;
    const link = this.querySelector<HTMLButtonElement>('button[data-share="link"]');
    const label = link?.textContent ?? "";
    link?.addEventListener("click", () => copy(link, url, { done: this.dataset.copied ?? label, failed: this.dataset.failed ?? label }), { signal });
    const sheet = this.querySelector<HTMLButtonElement>('button[data-share="sheet"]');
    if (!sheet || !("share" in navigator)) return;
    sheet.hidden = false;
    sheet.addEventListener("click", () => navigator.share({ title: this.dataset.title, url }).catch(() => {}), { signal });
  }

  disconnectedCallback() {
    this.#off.abort();
  }
}
if (!customElements.get("mx-share")) customElements.define("mx-share", MxShare);
