// The specimens' live shell: the demo interpreter, given to the element in the browser. A separate
// script, so a test can block or delay it on its own (4.3, the fallback and a late arrival).
import { demo } from "./terminal.ts";

const el = document.querySelector<HTMLElement & { interpreter: unknown }>("mx-terminal");
if (el) customElements.whenDefined("mx-terminal").then(() => (el.interpreter = demo(el.dataset.cwd === "~" ? "" : el.dataset.cwd!.replace(/^~\//, ""))));
