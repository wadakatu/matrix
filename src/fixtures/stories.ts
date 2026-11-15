// What every component's stories share (06, "Required stories").
import Contexts from "./Contexts.astro";
import { fixture } from "./corpus.ts";

export { fixture };

/** The Docs page renders the component's own <name>.md; the same text is the contract the test reads. */
export const docs = (md: string) => ({
  tags: ["autodocs"],
  parameters: { docs: { description: { component: md } }, contract: md },
});
/** The component four times in one frame, one per context. Visual regression captures it. */
export const contexts = { decorators: [() => ({ component: Contexts })] };
/** Japanese content, `lang="ja"` on the root and the Japanese chrome strings. */
export const japanese = { globals: { language: "ja" } };
/** At 390 wide, for a component that changes shape there. */
export const narrow = { globals: { viewport: { value: "narrow", isRotated: false } } };
