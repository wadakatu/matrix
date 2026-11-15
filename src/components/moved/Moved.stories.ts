import MovedLine from "./MovedLine.astro";
import md from "./moved.md?raw";
import { contexts, docs, japanese } from "../../fixtures/stories.ts";

// Moved.astro is a whole document; its stories show the body it renders (MovedLine).
export default { title: "Surfaces/Moved", component: MovedLine, ...docs(md, { chrome: true }) };

export const Default = { args: { to: "/fixture/" } };
export const Contexts = { args: { to: "/fixture/" }, ...contexts };
export const Japanese = { args: { to: "/ja/fixture/", lang: "ja" }, ...japanese };
