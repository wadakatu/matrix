import LangLink from "./LangLink.astro";
import md from "./lang.md?raw";
import { contexts, docs, japanese } from "../../fixtures/stories.ts";

export default { title: "Chrome/Language link", component: LangLink, ...docs(md) };

export const Default = { args: { href: "/ja/" } };
export const Contexts = { args: { href: "/ja/" }, ...contexts };
export const Japanese = { args: { href: "/", lang: "ja" }, ...japanese };
