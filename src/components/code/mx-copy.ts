// <mx-copy>: the Copy button of a code block. It copies the text of the block's <code>, says whether
// that worked for a moment, then reads Copy again. Without scripts it is not shown (05).
const SAY_FOR = 1600;

/** Writes `text` to the clipboard and lets `button` say how that went, then puts its word back. */
export async function copy(button: HTMLButtonElement, text: string, said: { done: string; failed: string }) {
  const rest = button.dataset.label ?? (button.dataset.label = button.textContent ?? "");
  clearTimeout(Number(button.dataset.timer));
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = said.done;
    button.dataset.done = "";
  } catch {
    button.textContent = said.failed;
    delete button.dataset.done;
  }
  button.dataset.timer = String(
    setTimeout(() => {
      button.textContent = rest;
      delete button.dataset.done;
      delete button.dataset.timer;
    }, SAY_FOR),
  );
}

export class MxCopy extends HTMLElement {
  #off = new AbortController();

  connectedCallback() {
    const button = this.querySelector("button");
    if (!button) return;
    const { signal } = (this.#off = new AbortController());
    // The words are the page's chrome strings, written on the element by its renderer.
    const label = button.textContent ?? "";
    const said = { done: this.dataset.copied ?? label, failed: this.dataset.failed ?? label };
    button.addEventListener("click", () => copy(button, this.closest(".mx-code")?.querySelector("code")?.textContent ?? "", said), { signal });
  }

  disconnectedCallback() {
    this.#off.abort();
  }
}
if (!customElements.get("mx-copy")) customElements.define("mx-copy", MxCopy);
