import Lede from "./Lede.astro";
import md from "./lede.md?raw";
import { contexts, docs, fixture, japanese } from "../../fixtures/stories.ts";

export default { title: "Surfaces/Lede", component: Lede, ...docs(md) };

export const Default = { args: { slots: { default: fixture.en.lede } } };
export const Contexts = { args: { slots: { default: fixture.en.lede } }, ...contexts };
export const Japanese = { args: { slots: { default: fixture.ja.lede } }, ...japanese };
