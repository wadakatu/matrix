import Log from "./Log.astro";
import md from "./log.md?raw";
import { contexts, docs, fixture, japanese } from "../../fixtures/stories.ts";

export default { title: "Surfaces/Log", component: Log, ...docs(md) };

export const Default = { args: { items: fixture.en.log } };
export const Contexts = { args: { items: fixture.en.log }, ...contexts };
export const Japanese = { args: { items: fixture.ja.log }, ...japanese };
