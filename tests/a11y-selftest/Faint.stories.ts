// Loaded only with MX_A11Y_SELFTEST=1 (.storybook/main.ts). It must fail `npm run test:stories`:
// the proof that a contrast violation in a story fails the run (09, task 2.1).
import Faint from "./Faint.astro";

export default { title: "Self-test/Faint text", component: Faint };
export const Default = {};
