import InlineList from "./InlineList.astro";
import md from "./inline-list.md?raw";
import { contexts, docs, fixture, japanese } from "../../fixtures/stories.ts";

const words = (lang: "en" | "ja") => fixture[lang].words.map((label) => ({ label }));
export default { title: "Surfaces/Inline list", component: InlineList, ...docs(md) };

export const Default = { args: { items: words("en") } };
export const After = { args: { items: fixture.en.after, variant: "after" } };
export const Links = { args: { items: fixture.en.links, variant: "links" } };
export const Contexts = { args: { items: fixture.en.links, variant: "links" }, ...contexts };
export const Japanese = { args: { items: words("ja") }, ...japanese };
export const AfterJapanese = { args: { items: fixture.ja.after, variant: "after" }, ...japanese };
