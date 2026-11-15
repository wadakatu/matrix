import Curtain from "./Curtain.astro";
import md from "./curtain.md?raw";
import { docs, framed, japanese, still } from "../../fixtures/stories.ts";
import { signature } from "../../fixtures/corpus.ts";

const args = { phrases: signature.phrases };
// Shown only during the boot's last step: the stories hold it on.
const on = { play: ({ canvasElement }: { canvasElement: HTMLElement }) => canvasElement.querySelectorAll(".mx-curtain").forEach((c) => c.setAttribute("data-on", "")) };
// The slabs are decoration (aria-hidden) and have no contrast floor (02; WCAG 1.4.3 exempts pure
// decoration); by day rain.body on ground is 2.59:1 by design, so the colour rule does not judge them.
const meta = docs(md);
export default {
  title: "Signature/Curtain",
  component: Curtain,
  ...meta,
  parameters: { ...meta.parameters, a11y: { context: { exclude: [".mx-curtain"] } } },
};

export const Default = { args, ...on };
export const Still = { args, ...on, ...still };
export const Contexts = { args, ...on, ...framed };
export const Japanese = { args, ...on, ...japanese };
