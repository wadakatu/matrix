import Mark from "./Mark.astro";
import md from "./mark.md?raw";
import { contexts, docs, fixture, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Chrome/Mark", component: Mark, ...docs(md) };

export const Default = { args: fixture.en.mark };
export const Contexts = { args: fixture.en.mark, ...contexts };
export const Japanese = { args: fixture.ja.mark, ...japanese };
export const Narrow = { args: fixture.en.mark, ...narrow };
