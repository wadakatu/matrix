import StreamsDemo from "../../fixtures/StreamsDemo.astro";
import md from "./rewards.md?raw";
import { contexts, docs, japanese, still } from "../../fixtures/stories.ts";

type Ctx = { canvasElement: HTMLElement };
const deja = { play: ({ canvasElement }: Ctx) => canvasElement.querySelectorAll(".mx-stream").forEach((s) => s.setAttribute("data-reward", "deja")) };
// The flicker half way: the ghost over the title, its commit settled.
const flick = {
  play: ({ canvasElement }: Ctx) =>
    canvasElement.querySelectorAll<HTMLElement>(".mx-stream[data-commit]").forEach((s) => {
      s.setAttribute("data-reward", "flick");
      const wrap = Object.assign(document.createElement("span"), { className: "mx-ghost" });
      wrap.setAttribute("aria-hidden", "true");
      wrap.append(Object.assign(document.createElement("span"), { lang: "en", textContent: s.dataset.commit }));
      s.querySelector(".mx-stream-name")!.append(wrap);
    }),
};
export default { title: "Signature/Rewards", component: StreamsDemo, ...docs(md) };

export const Default = { args: { count: 1 }, ...flick };
export const DejaVu = { args: { count: 1 }, ...deja };
export const Still = { args: { count: 1 }, ...flick, ...still };
export const Contexts = { args: { count: 1 }, ...flick, ...contexts };
export const Japanese = { args: { count: 1, lang: "ja" }, ...flick, ...japanese };
