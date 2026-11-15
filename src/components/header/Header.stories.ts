import Header from "./Header.astro";
import md from "./header.md?raw";
import { contexts, docs, fixture, japanese, narrow } from "../../fixtures/stories.ts";

const args = (lang: "en" | "ja") => ({ mark: fixture[lang].mark, nav: fixture[lang].nav, alternate: lang === "en" ? "/ja/" : "/", lang });
export default { title: "Chrome/Header", component: Header, ...docs(md, { chrome: true }) };

export const Default = { args: args("en") };
export const Machine = { args: args("en"), globals: { reading: "machine" } };
export const WithoutTwin = { args: { ...args("en"), alternate: undefined } };
export const Contexts = { args: args("en"), ...contexts };
export const Japanese = { args: args("ja"), ...japanese };
export const Narrow = { args: args("en"), ...narrow };
export const NarrowOpen = { args: { ...args("en"), open: true }, ...narrow };
export const NarrowMachine = { args: args("en"), globals: { ...narrow.globals, reading: "machine" } };
export const NarrowJapanese = { args: { ...args("ja"), open: true }, globals: { ...narrow.globals, ...japanese.globals } };
