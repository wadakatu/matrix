import Nav from "./Nav.astro";
import md from "./nav.md?raw";
import { contexts, docs, fixture, japanese } from "../../fixtures/stories.ts";

export default { title: "Chrome/Nav", component: Nav, ...docs(md, { chrome: true }) };

export const Default = { args: { items: fixture.en.nav } };
export const Machine = { args: { items: fixture.en.nav }, globals: { reading: "machine" } };
export const InSection = { args: { items: fixture.en.nav.map((i) => ({ ...i, current: i.label === "Blog" ? ("true" as const) : undefined })) } };
export const Contexts = { args: { items: fixture.en.nav }, ...contexts };
export const Japanese = { args: { items: fixture.ja.nav, lang: "ja" }, ...japanese };
