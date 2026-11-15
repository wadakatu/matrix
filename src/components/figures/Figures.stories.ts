import Figures from "./Figures.astro";
import md from "./figures.md?raw";
import { contexts, docs, fixture, japanese } from "../../fixtures/stories.ts";

export default { title: "Surfaces/Figures", component: Figures, ...docs(md) };

export const Default = { args: { items: fixture.en.figures } };
export const Contexts = { args: { items: fixture.en.figures }, ...contexts };
export const Japanese = { args: { items: fixture.ja.figures }, ...japanese };
