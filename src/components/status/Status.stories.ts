import Status from "./Status.astro";
import md from "./status.md?raw";
import { docs } from "../../fixtures/stories.ts";

// Visually hidden in every context, so it has no Contexts frame to capture.
export default { title: "Surfaces/Status", component: Status, ...docs(md) };

export const Default = {};
