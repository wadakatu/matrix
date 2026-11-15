import Meta from "./Meta.astro";
import md from "./meta.md?raw";
import { contexts, docs, fixture, japanese } from "../../fixtures/stories.ts";

export default { title: "Surfaces/Meta", component: Meta, ...docs(md) };

export const Default = { args: { slots: { default: fixture.en.meta } } };
export const Contexts = { args: { slots: { default: fixture.en.meta } }, ...contexts };
export const Japanese = { args: { slots: { default: fixture.ja.meta } }, ...japanese };
